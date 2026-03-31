#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const KNOWN_LOCAL_PACKAGES = {
  '@interdead/framework': 'framework',
  '@interdead/identity-core': 'identity-core',
  '@interdead/efbd-scale': 'efbd-scale',
};

class CliOptions {
  constructor(argv) {
    this.command = 'prepare';
    this.workspaceDir = '';
    this.projectRoot = '';
    this.localPackages = '';
    this.localPackagesRoot = '';
    this.localPackagesWorkspace = '';
    this.localPackagesPrepareMode = 'copy';
    this.skipLocalPackageBuild = false;
    this.forceLocalPackageBuild = false;
    this.cleanupLocalPackagesWorkspace = false;
    this.localPackageOverrides = new Map();
    this.parse(argv.slice(2));
    this.validate();
  }

  parse(rawArgs) {
    for (let index = 0; index < rawArgs.length; index += 1) {
      const current = rawArgs[index];

      if (current === 'prepare' || current === 'restore') {
        this.command = current;
        continue;
      }

      if (current === '--workspace-dir') {
        this.workspaceDir = this.readValue(rawArgs, index, current);
        index += 1;
        continue;
      }
      if (current === '--project-root') {
        this.projectRoot = this.readValue(rawArgs, index, current);
        index += 1;
        continue;
      }
      if (current === '--local-packages') {
        this.localPackages = this.readValue(rawArgs, index, current);
        index += 1;
        continue;
      }
      if (current === '--local-packages-root') {
        this.localPackagesRoot = this.readValue(rawArgs, index, current);
        index += 1;
        continue;
      }
      if (current === '--local-packages-workspace') {
        this.localPackagesWorkspace = this.readValue(rawArgs, index, current);
        index += 1;
        continue;
      }
      if (current === '--local-packages-prepare-mode') {
        this.localPackagesPrepareMode =
          (this.readValue(rawArgs, index, current).trim() || 'copy').toLowerCase();
        index += 1;
        continue;
      }
      if (current === '--skip-local-package-build') {
        this.skipLocalPackageBuild = true;
        continue;
      }
      if (current === '--force-local-package-build') {
        this.forceLocalPackageBuild = true;
        continue;
      }
      if (current === '--cleanup-local-packages-workspace') {
        this.cleanupLocalPackagesWorkspace = true;
        continue;
      }
      if (current === '--local-package-map') {
        this.parseLocalPackageMap(this.readValue(rawArgs, index, current));
        index += 1;
        continue;
      }

      throw new Error(`Unknown argument: ${current}`);
    }
  }

  readValue(rawArgs, index, flag) {
    const value = rawArgs[index + 1] || '';
    if (!value || value.startsWith('--')) {
      throw new Error(`A value is required for ${flag}`);
    }
    return value;
  }

  parseLocalPackageMap(rawValue) {
    const separatorIndex = rawValue.indexOf('=');
    if (separatorIndex < 1) {
      throw new Error(`Invalid --local-package-map value: ${rawValue}`);
    }

    const packageName = rawValue.slice(0, separatorIndex).trim();
    const packagePath = rawValue.slice(separatorIndex + 1).trim();
    if (!packageName || !packagePath) {
      throw new Error(`Invalid --local-package-map value: ${rawValue}`);
    }

    this.localPackageOverrides.set(packageName, packagePath);
  }

  validate() {
    if (!['prepare', 'restore'].includes(this.command)) {
      throw new Error(`Unsupported command: ${this.command}`);
    }

    if (!['copy', 'link'].includes(this.localPackagesPrepareMode)) {
      throw new Error(`Invalid local package prepare mode: ${this.localPackagesPrepareMode}`);
    }

    if (this.skipLocalPackageBuild && this.forceLocalPackageBuild) {
      throw new Error('Flags conflict: --skip-local-package-build and --force-local-package-build');
    }
  }

  hasLocalPackageSelection() {
    return Boolean(this.localPackages) || this.localPackageOverrides.size > 0;
  }
}

class LocalPackageResolver {
  constructor({ options }) {
    this.options = options;
  }

  resolveTargets() {
    const packageNames = this.resolvePackageNames();
    const rootPath = this.resolveLocalPackagesRoot();

    return packageNames.map((packageName) => {
      const overridePath = this.options.localPackageOverrides.get(packageName);
      const sourcePath = overridePath
        ? this.resolveOverridePath(overridePath)
        : path.resolve(rootPath, KNOWN_LOCAL_PACKAGES[packageName] || packageName);

      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Local package source is not found: ${packageName} -> ${sourcePath}`);
      }

      return { packageName, sourcePath };
    });
  }

  resolvePackageNames() {
    const selected = (this.options.localPackages || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const resolved = new Set();
    const selectedAll = selected.includes('all');

    if (selectedAll) {
      Object.keys(KNOWN_LOCAL_PACKAGES).forEach((name) => resolved.add(name));
    }

    selected.forEach((name) => {
      if (name !== 'all') {
        resolved.add(name);
      }
    });

    this.options.localPackageOverrides.forEach((_, packageName) => {
      resolved.add(packageName);
    });

    if (resolved.size === 0) {
      return [];
    }

    return Array.from(resolved);
  }

  resolveOverridePath(overridePath) {
    if (path.isAbsolute(overridePath)) {
      return path.normalize(overridePath);
    }

    return path.resolve(this.options.projectRoot, overridePath);
  }

  resolveLocalPackagesRoot() {
    if (this.options.localPackagesRoot) {
      return path.resolve(this.options.projectRoot, this.options.localPackagesRoot);
    }

    return path.resolve(this.options.projectRoot, '../../InterDeadCore');
  }
}

class LocalPackageWorkspaceManager {
  constructor({ options }) {
    this.options = options;
  }

  resolveWorkspacePath() {
    if (this.options.localPackagesWorkspace) {
      return path.resolve(this.options.projectRoot, this.options.localPackagesWorkspace);
    }

    return path.resolve(this.options.projectRoot, 'tests/local-build-lab/packages-workspace');
  }

  prepare(targets) {
    const workspacePath = this.resolveWorkspacePath();
    fs.mkdirSync(workspacePath, { recursive: true });

    return targets.map((target) => {
      const sanitized = target.packageName.replace(/[@/]/g, '_');
      const preparedPath = path.join(workspacePath, sanitized);

      if (this.pathExists(preparedPath)) {
        fs.rmSync(preparedPath, { recursive: true, force: true });
      }

      if (this.options.localPackagesPrepareMode === 'link') {
        DirectoryLinkOperator.create({ sourcePath: target.sourcePath, targetPath: preparedPath });
      } else {
        fs.cpSync(target.sourcePath, preparedPath, {
          recursive: true,
          filter: (source) => this.shouldCopyPath(source),
        });
      }

      this.ensureBuildArtifacts({ packageName: target.packageName, packagePath: preparedPath });

      return {
        packageName: target.packageName,
        sourcePath: preparedPath,
      };
    });
  }

  shouldCopyPath(sourcePath) {
    const blockedNames = new Set(['node_modules', '.git', '.cache', '.turbo', 'coverage']);
    const name = path.basename(sourcePath);
    return !blockedNames.has(name);
  }

  ensureBuildArtifacts({ packageName, packagePath }) {
    const distPath = path.join(packagePath, 'dist');

    if (this.options.forceLocalPackageBuild) {
      this.runInstall(packagePath);
      this.runBuild(packageName, packagePath);
      return;
    }

    if (this.options.skipLocalPackageBuild) {
      if (!this.pathExists(distPath)) {
        throw new Error(
          `skip-local-package-build is enabled, but dist/ is missing for ${packageName}: ${distPath}`,
        );
      }
      return;
    }

    if (!this.pathExists(distPath)) {
      this.runInstall(packagePath);
      this.runBuild(packageName, packagePath);
    }
  }

  runInstall(packagePath) {
    this.runNpm(packagePath, ['install', '--no-fund', '--no-audit']);
  }

  runBuild(packageName, packagePath) {
    const packageJsonPath = path.join(packagePath, 'package.json');
    if (!this.pathExists(packageJsonPath)) {
      throw new Error(`package.json not found for ${packageName}: ${packageJsonPath}`);
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts || !packageJson.scripts.build) {
      throw new Error(`The local package has no build script: ${packageName}`);
    }

    this.runNpm(packagePath, ['run', 'build']);

    const distPath = path.join(packagePath, 'dist');
    if (!this.pathExists(distPath)) {
      throw new Error(`Build completed without dist/ artifacts for ${packageName}: ${distPath}`);
    }
  }

  runNpm(cwd, args) {
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error(`Command failed in ${cwd}: ${command} ${args.join(' ')}`);
    }
  }

  pathExists(targetPath) {
    try {
      fs.lstatSync(targetPath);
      return true;
    } catch (_error) {
      return false;
    }
  }
}

class LocalPackageManifestStore {
  constructor({ workspaceDir }) {
    this.manifestPath = path.join(workspaceDir, '.local-package-links.json');
  }

  load() {
    if (!fs.existsSync(this.manifestPath)) {
      return {
        schemaVersion: 1,
        cleanupLocalPackagesWorkspace: false,
        localPackagesWorkspacePath: '',
        entries: [],
      };
    }

    return JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
  }

  save(manifest) {
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
  }

  remove() {
    fs.rmSync(this.manifestPath, { force: true });
  }
}

class DirectoryLinkOperator {
  static create({ sourcePath, targetPath }) {
    try {
      fs.symlinkSync(sourcePath, targetPath, 'dir');
    } catch (error) {
      if (process.platform === 'win32' && error.code === 'EPERM') {
        fs.symlinkSync(sourcePath, targetPath, 'junction');
        return;
      }
      throw error;
    }
  }
}

class LocalPackageLinker {
  constructor({ options }) {
    this.options = options;
    this.manifestStore = new LocalPackageManifestStore({ workspaceDir: options.workspaceDir });
  }

  apply(targets, workspacePath) {
    const manifest = {
      schemaVersion: 1,
      cleanupLocalPackagesWorkspace: this.options.cleanupLocalPackagesWorkspace,
      localPackagesWorkspacePath: workspacePath,
      entries: [],
    };

    this.manifestStore.save(manifest);

    targets.forEach((target) => {
      const packageSegments = target.packageName.split('/');
      const packagePath = path.join(this.options.workspaceDir, 'node_modules', ...packageSegments);
      const parentDir = path.dirname(packagePath);
      const backupPath = `${packagePath}.backup-local-lab`;

      fs.mkdirSync(parentDir, { recursive: true });

      if (this.pathExists(backupPath)) {
        fs.rmSync(backupPath, { recursive: true, force: true });
      }

      if (this.pathExists(packagePath)) {
        fs.renameSync(packagePath, backupPath);
      }

      DirectoryLinkOperator.create({ sourcePath: target.sourcePath, targetPath: packagePath });

      manifest.entries.push({
        packageName: target.packageName,
        linkedPath: packagePath,
        backupPath,
      });

      this.manifestStore.save(manifest);
    });
  }

  restore() {
    const manifest = this.manifestStore.load();

    const entriesInReverse = [...manifest.entries].reverse();
    entriesInReverse.forEach((entry) => {
      if (this.pathExists(entry.linkedPath)) {
        fs.rmSync(entry.linkedPath, { recursive: true, force: true });
      }

      if (this.pathExists(entry.backupPath)) {
        fs.renameSync(entry.backupPath, entry.linkedPath);
      }
    });

    if (manifest.cleanupLocalPackagesWorkspace && manifest.localPackagesWorkspacePath) {
      fs.rmSync(manifest.localPackagesWorkspacePath, { recursive: true, force: true });
      console.log(`[LocalPackages] Workspace cleaned: ${manifest.localPackagesWorkspacePath}`);
    }

    this.manifestStore.remove();
  }

  pathExists(targetPath) {
    try {
      fs.lstatSync(targetPath);
      return true;
    } catch (_error) {
      return false;
    }
  }
}

function ensureRequired(value, label) {
  if (!value) {
    throw new Error(`${label} is required.`);
  }
}

function run() {
  const options = new CliOptions(process.argv);
  ensureRequired(options.workspaceDir, 'workspace-dir');
  ensureRequired(options.projectRoot, 'project-root');

  const linker = new LocalPackageLinker({ options });

  if (options.command === 'restore') {
    linker.restore();
    return;
  }

  if (!options.hasLocalPackageSelection()) {
    console.log('[LocalPackages] No local package selection was provided. Skipping.');
    return;
  }

  const resolver = new LocalPackageResolver({ options });
  const workspaceManager = new LocalPackageWorkspaceManager({ options });

  const targets = resolver.resolveTargets();
  const preparedTargets = workspaceManager.prepare(targets);
  const workspacePath = workspaceManager.resolveWorkspacePath();

  linker.apply(preparedTargets, workspacePath);

  preparedTargets.forEach((target) => {
    console.log(`[LocalPackages] Linked ${target.packageName} -> ${target.sourcePath}`);
  });
}

run();
