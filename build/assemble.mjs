import { mkdir, rm, readFile, writeFile, mkdtemp, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, sourceIdentity, readJson, hashFile, tree, command, copyTree } from './lib.mjs';

async function assembleOwned(
  { diagnostic = false, buildId = null, localPackages = null, localPackageArgs = [] } = {},
  workspace,
) {
  const before = await sourceIdentity();
  if (!diagnostic && (!before.clean || localPackages))
    throw new Error('Official assembly requires a clean checkout and locked packages');
  buildId ||= before.sourceSha;
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(buildId)) throw new Error('Invalid build ID');
  const publishedOutput = path.join(root, 'build/output');
  // A new candidate never reads or copies the previous frozen distribution.
  const output = path.join(workspace, 'output');
  await mkdir(output, { recursive: true });
  const project = path.join(workspace, 'proto-dev');
  const inputs = execFileSync('git', ['ls-files', '-z', '--', 'proto-dev'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
    .sort();
  for (const input of inputs) {
    if (
      /(?:^|\/)(?:node_modules|dist|\.local-lab-workspace|\.local-dist|\.git|\.env[^/]*|config\.env)(?:\/|$)/.test(
        input,
      )
    )
      continue;
    await copyTree(path.join(root, input), path.join(workspace, input));
  }
  await mkdir(path.join(workspace, 'build'), { recursive: true });
  await copyTree(
    path.join(root, 'build/artifact-map.json'),
    path.join(workspace, 'build/artifact-map.json'),
  );
  const acquisitionEnvironment = { ...process.env };
  for (const key of Object.keys(acquisitionEnvironment)) {
    if (
      key.startsWith('npm_package_') ||
      key.startsWith('npm_lifecycle_') ||
      ['npm_config_prefix', 'npm_config_local_prefix', 'INIT_CWD'].includes(key)
    )
      delete acquisitionEnvironment[key];
  }
  const install = await command('npm', ['--prefix', project, 'ci', '--include=dev'], {
    cwd: project,
    env: acquisitionEnvironment,
    log: true,
  });
  if (install.status !== 'passed') throw new Error(`Isolated npm ci failed: ${install.stderr}`);
  let localPackageIdentity = null;
  const overlayScript = path.join(
    project,
    'tests/local-build-lab/scripts/local-package-workspace.cjs',
  );
  let assemblyFailure = null;
  let outcome;
  try {
    if (localPackages) {
      const overlay = await command(
        process.execPath,
        [
          overlayScript,
          'prepare',
          '--workspace-dir',
          project,
          '--project-root',
          path.join(root, 'proto-dev'),
          '--local-packages',
          localPackages,
          ...localPackageArgs,
        ],
        { cwd: project, log: true },
      );
      if (overlay.status !== 'passed') throw new Error('Local package overlay failed');
      const selected = (
        await readJson(path.join(project, '.local-package-links.json'))
      ).entries.map((entry) => entry.packageName);
      localPackageIdentity = [];
      for (const name of selected) {
        const packageDirectory = path.join(project, 'node_modules', name.trim());
        const packageFiles = await tree(packageDirectory);
        localPackageIdentity.push({
          name: name.trim(),
          sha256: packageFiles.sha256,
          files: packageFiles.files,
        });
      }
    }
    const environment = { ...acquisitionEnvironment };
    for (const key of Object.keys(environment)) {
      if (key.startsWith('VITE_')) delete environment[key];
    }
    environment.VITE_CACHE_BUILD_ID = buildId;
    const build = await command('npm', ['--prefix', project, 'run', 'build:deploy'], {
      cwd: project,
      env: environment,
      log: true,
    });
    if (build.status !== 'passed') throw new Error(`Vite deployment build failed: ${build.stderr}`);
    const distribution = path.join(output, 'dist');
    await copyTree(path.join(project, 'dist'), distribution);
    const map = await readJson(path.join(root, 'build/artifact-map.json'));
    await copyTree(path.join(root, map.assets), path.join(distribution, 'assets'), {
      filter: (file) => !file.endsWith('.map'),
    });
    for (const mapping of map.templates) {
      const target = path.join(distribution, mapping.publicPath);
      await mkdir(path.dirname(target), { recursive: true });
      await copyTree(path.join(root, mapping.source), target);
    }
    await copyTree(
      path.join(root, map.locales.source),
      path.join(distribution, map.locales.publicPath),
    );
    await mkdir(path.join(distribution, 'src/spirit-contacts/configuration'), { recursive: true });
    await copyTree(
      path.join(root, 'proto-dev/src/spirit-contacts/configuration/sample.json'),
      path.join(distribution, 'src/spirit-contacts/configuration/sample.json'),
    );
    await copyTree(
      path.join(root, 'proto-dev/assets/favicons/favicon.ico'),
      path.join(distribution, 'favicon.ico'),
    );
    await copyTree(path.join(root, 'proto-dev/sw.js'), path.join(distribution, 'sw.js'));
    const sw = await readFile(path.join(distribution, 'sw.js'), 'utf8');
    const marker = "self.__CACHE_BUILD_ID__ || 'dev';";
    if (sw.split(marker).length !== 2) throw new Error('Service worker build marker drift');
    await writeFile(
      path.join(distribution, 'sw.js'),
      sw.replace(marker, `self.__CACHE_BUILD_ID__ || '${buildId}';`),
    );
    const notices = path.join(distribution, 'notices');
    await mkdir(notices, { recursive: true });
    for (const file of ['LICENSE.md', 'LICENSING-OVERRIDES.md'])
      await copyTree(path.join(root, file), path.join(notices, file));
    await copyTree(
      path.join(root, '.licensing-policy'),
      path.join(distribution, '.licensing-policy'),
      {
        filter: (file) => !file.split(path.sep).includes('.git'),
      },
    );
    await copyTree(
      path.join(root, 'proto-dev/THIRD-PARTY-NOTICES.md'),
      path.join(notices, 'THIRD-PARTY-NOTICES.md'),
    );
    for (const name of ['LICENSE', 'LICENSE.md', 'NOTICE']) {
      const source = path.join(project, 'node_modules/@interdead/framework', name);
      try {
        await copyTree(source, path.join(notices, `framework-${name}`));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    const lock = await readJson(path.join(project, 'package-lock.json'));
    const dependencies = Object.entries(lock.packages)
      .filter(([name]) => name)
      .map(([name, record]) => ({
        path: name,
        name: record.name || name.split('node_modules/').at(-1),
        version: record.version,
        resolved: record.resolved || null,
        integrity: record.integrity || null,
        license: record.license || null,
        development: record.dev === true,
        optional: record.optional === true,
        installationScript: record.hasInstallScript === true,
      }))
      .sort((a, b) => (a.path < b.path ? -1 : 1));
    await writeFile(
      path.join(notices, 'dependency-inventory.json'),
      JSON.stringify(
        {
          schemaVersion: 1,
          lockfileSha256: await hashFile(path.join(root, 'proto-dev/package-lock.json')),
          scope:
            'Complete locked build/runtime tree; development dependencies are not automatically shipped as runtime code',
          dependencies,
        },
        null,
        2,
      ) + '\n',
    );
    // Public source maps are intentionally excluded; Vite emits none in this mode.
    const payload = await tree(distribution);
    if (
      payload.files.some(({ path: name }) =>
        ['artifact-manifest.json', 'build-provenance.json'].includes(name),
      )
    )
      throw new Error('Reserved provenance file present before payload finalization');
    if (
      payload.files.some(({ path: name }) =>
        /(?:^|\/)(?:tests|constitutional-guard|node_modules|governance|manual-evidence)(?:\/|$)|\.map$|(?:^|\/)\.env/.test(
          name,
        ),
      )
    )
      throw new Error('Development/evidence file leaked into distribution');
    const provenance = {
      schemaVersion: 1,
      assemblyVersion: '1.0.0',
      ...before,
      buildId,
      diagnostic: diagnostic || !!localPackages,
      localPackageIdentity,
      buildEnvironment: { VITE_CACHE_BUILD_ID: buildId },
      lockfileSha256: await hashFile(path.join(root, 'proto-dev/package-lock.json')),
      mappingSha256: await hashFile(path.join(root, 'build/artifact-map.json')),
      transformationSha256: await hashFile(path.join(root, 'build/transformations.json')),
      tools: { node: process.version, npm: (await command('npm', ['--version'])).stdout.trim() },
      payloadTreeSha256: payload.sha256,
      payloadPolicy:
        'Sorted relative paths, bytes and SHA-256; excludes the two embedded provenance files only',
    };
    await writeFile(
      path.join(distribution, 'build-provenance.json'),
      JSON.stringify(provenance, null, 2) + '\n',
    );
    await writeFile(
      path.join(distribution, 'artifact-manifest.json'),
      JSON.stringify(payload, null, 2) + '\n',
    );
    const artifact = await tree(distribution);
    const { zipSync } = await import(
      pathToFileURL(path.join(root, 'proto-dev/node_modules/fflate/esm/index.mjs'))
    );
    const archive = {};
    for (const file of artifact.files)
      archive[file.path] = [
        new Uint8Array(await readFile(path.join(distribution, file.path))),
        { mtime: new Date('1980-01-01T00:00:00Z') },
      ];
    const zipPath = path.join(output, `InterDeadProto_${buildId.slice(0, 12)}.zip`);
    await writeFile(zipPath, zipSync(archive, { level: 9 }));
    const after = await sourceIdentity();
    if (before.sourceTreeSha256 !== after.sourceTreeSha256)
      throw new Error('Assembler changed canonical sources');
    const zipSha256 = await hashFile(zipPath);
    const previousOutput = path.join(workspace, 'previous-output');
    let previousMoved = false;
    try {
      await rename(publishedOutput, previousOutput);
      previousMoved = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      await rename(output, publishedOutput);
    } catch (error) {
      if (previousMoved) await rename(previousOutput, publishedOutput);
      throw error;
    }
    const result = {
      ...provenance,
      artifactTreeSha256: artifact.sha256,
      zipSha256,
      distribution: 'build/output/dist',
      zipPath: `build/output/${path.basename(zipPath)}`,
      artifactFiles: artifact.files,
    };
    await mkdir(path.join(root, 'build/results'), { recursive: true });
    await writeFile(
      path.join(root, 'build/results/distribution.json'),
      JSON.stringify(result, null, 2) + '\n',
    );
    outcome = result;
  } catch (error) {
    assemblyFailure = error;
  } finally {
    if (localPackages) {
      const restored = await command(
        process.execPath,
        [
          overlayScript,
          'restore',
          '--workspace-dir',
          project,
          '--project-root',
          path.join(root, 'proto-dev'),
        ],
        { cwd: project, log: true },
      );
      if (restored.status !== 'passed') {
        assemblyFailure = new AggregateError(
          [
            assemblyFailure,
            new Error('Local package links could not be restored in the isolated workspace'),
          ].filter(Boolean),
          'Assembly/restore failure',
        );
      }
    }
  }
  if (assemblyFailure) throw assemblyFailure;
  return outcome;
}

export async function assemble(options = {}) {
  const results = path.join(root, 'build/results');
  const workspaceRoot = path.join(root, 'build/workspace');
  await mkdir(results, { recursive: true });
  const lease = path.join(results, 'assembly-lease');
  try {
    await mkdir(lease);
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        'Another or interrupted assembly owns the output lease; do not run concurrent assemblers',
      );
    throw error;
  }
  let workspace;
  try {
    await mkdir(workspaceRoot, { recursive: true });
    workspace = await mkdtemp(path.join(workspaceRoot, 'assembly-'));
    return await assembleOwned(options, workspace);
  } finally {
    if (workspace) await rm(workspace, { recursive: true, force: true });
    await rm(lease, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(root, 'build/assemble.mjs')) {
  const result = await assemble({
    diagnostic: process.argv.includes('--diagnostic'),
    localPackages: process.env.INTERDEAD_LOCAL_CORE || null,
  });
  process.stdout.write(`Assembly: ${result.artifactTreeSha256}\nZIP: ${result.zipSha256}\n`);
}
