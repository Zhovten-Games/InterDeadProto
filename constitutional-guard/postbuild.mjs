import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, tree, hashFile, readJson, sha256, sourceIdentity } from '../build/lib.mjs';
import { httpSmoke } from '../build/http-smoke.mjs';
import { checkIntegrity } from './integrity.mjs';
import { browserChecks } from './testing-interface/artifact-driver.mjs';
import { unzipSync } from '../proto-dev/node_modules/fflate/esm/index.mjs';

export async function verifyFrozen(distribution) {
  const actual = await tree(path.join(root, distribution.distribution));
  return (
    actual.sha256 === distribution.artifactTreeSha256 &&
    (await hashFile(path.join(root, distribution.zipPath))) === distribution.zipSha256
  );
}

export async function checkArtifacts(distribution) {
  const gates = [];
  const gate = async (id, task) => {
    try {
      const detail = await task();
      gates.push({ id, phase: 'postbuild', mandatory: true, status: 'passed', ...detail });
    } catch (error) {
      gates.push({
        id,
        phase: 'postbuild',
        mandatory: true,
        status: 'failed',
        reason: error.stack || String(error),
      });
    }
  };
  const errors = await checkIntegrity();
  if (errors.length)
    return [
      { id: 'postbuild-integrity', phase: 'postbuild', mandatory: true, status: 'failed', errors },
    ];
  const directory = path.join(root, distribution.distribution);
  await gate('artifact-content-identity', async () => {
    if (!(await verifyFrozen(distribution))) throw new Error('Artifact/ZIP changed after assembly');
    const actual = await tree(directory);
    const payload = {
      files: actual.files.filter(
        (row) => !['artifact-manifest.json', 'build-provenance.json'].includes(row.path),
      ),
    };
    payload.sha256 = sha256(JSON.stringify(payload.files));
    const manifest = await readJson(path.join(directory, 'artifact-manifest.json'));
    const provenance = await readJson(path.join(directory, 'build-provenance.json'));
    if (
      JSON.stringify(manifest) !== JSON.stringify(payload) ||
      payload.sha256 !== distribution.payloadTreeSha256
    )
      throw new Error('Embedded payload manifest mismatch');
    for (const field of [
      'sourceSha',
      'sourceTreeSha256',
      'buildId',
      'lockfileSha256',
      'mappingSha256',
      'transformationSha256',
    ])
      if (provenance[field] !== distribution[field])
        throw new Error(`Embedded provenance mismatch: ${field}`);
    const source = await sourceIdentity();
    if (
      source.sourceSha !== distribution.sourceSha ||
      source.sourceTreeSha256 !== distribution.sourceTreeSha256
    )
      throw new Error('Artifact belongs to another source');
    if (JSON.stringify(provenance.pins) !== JSON.stringify(source.pins))
      throw new Error('Normative pin mismatch');
    const zip = unzipSync(new Uint8Array(await readFile(path.join(root, distribution.zipPath))));
    const entries = Object.entries(zip)
      .filter(([name]) => !name.endsWith('/'))
      .map(([name, bytes]) => ({ path: name, bytes: bytes.length, sha256: sha256(bytes) }))
      .sort((a, b) => (a.path < b.path ? -1 : 1));
    if (
      JSON.stringify(entries.map((row) => [row.path, row.bytes, row.sha256])) !==
      JSON.stringify(actual.files.map((row) => [row.path, row.bytes, row.sha256]))
    )
      throw new Error('ZIP and published directory differ');
    return {
      files: actual.files.length,
      treeSha256: actual.sha256,
      zipSha256: distribution.zipSha256,
    };
  });
  await gate('distribution-scope-licensing', async () => {
    const actual = await tree(directory);
    const leaked = actual.files.filter((row) =>
      /(?:^|\/)(?:tests|constitutional-guard|node_modules|governance|manual-evidence)(?:\/|$)|\.map$|(?:^|\/)\.env/.test(
        row.path,
      ),
    );
    if (leaked.length)
      throw new Error(`Non-runtime files: ${leaked.map((row) => row.path).join(', ')}`);
    for (const name of [
      'notices/LICENSE.md',
      'notices/LICENSING-OVERRIDES.md',
      'notices/THIRD-PARTY-NOTICES.md',
      '.licensing-policy/LICENSES/LicenseRef-FOPOD-Repository-Policy-1.0.txt',
    ]) {
      try {
        await readFile(path.join(directory, name));
      } catch {
        throw new Error(`Missing distribution notice: ${name}`);
      }
    }
    const wasm = await readFile(path.join(directory, 'assets/libs/db/sql-wasm.wasm'));
    if (!wasm.subarray(0, 4).equals(Buffer.from([0, 97, 115, 109])))
      throw new Error('SQL.js response is not WASM');
    const model = await readJson(path.join(directory, 'assets/models/coco-ssd/model.json'));
    for (const group of model.weightsManifest)
      for (const shard of group.paths)
        await readFile(path.join(directory, 'assets/models/coco-ssd', shard));
  });
  await gate('http-resources-root-subpath', () => httpSmoke(directory));
  gates.push(...(await browserChecks(distribution)));
  await gate('frozen-artifact-after-postbuild', async () => {
    if (!(await verifyFrozen(distribution)))
      throw new Error('Postbuild mutated the frozen distribution');
  });
  return gates;
}
