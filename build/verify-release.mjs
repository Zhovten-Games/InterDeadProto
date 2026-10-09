import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readJson, sourceIdentity, hashFile, tree, command } from './lib.mjs';
import { checkIntegrity } from '../constitutional-guard/integrity.mjs';
import { checkGovernance, checkRatification } from '../constitutional-guard/governance.mjs';
import { releaseVerdict, validateGateInventory } from '../constitutional-guard/verdict.mjs';
import Ajv from '../proto-dev/node_modules/ajv/dist/2020.js';
import { validateEvidence } from '../constitutional-guard/manual-evidence.mjs';

/** Consumption gate: it never rebuilds or modifies the certified artifact. */
export async function verifyRelease({ candidate = false } = {}) {
  const report = await readJson(path.join(root, 'build/results/warden-report.json'));
  const validate = new Ajv({ allErrors: true, strict: true }).compile(
    await readJson(path.join(root, 'constitutional-guard/schemas/report.schema.json')),
  );
  if (!validate(report))
    throw new Error(`Invalid WARDEN report: ${JSON.stringify(validate.errors)}`);
  const definitions = await readJson(path.join(root, 'constitutional-guard/manifest/gates.json'));
  const inventoryErrors = validateGateInventory(definitions.gates, report.gates);
  if (inventoryErrors.length) throw new Error(inventoryErrors.join('; '));
  const identity = await sourceIdentity();
  const errors = await checkIntegrity();
  if (errors.length) throw new Error(errors.join('; '));
  if ((await checkGovernance()).status !== 'passed')
    throw new Error('Governance applicability is incomplete');
  if (
    !['all', 'check'].includes(report.mode) ||
    report.diagnostic ||
    !report.clean ||
    !identity.clean
  )
    throw new Error('A full, clean, non-diagnostic WARDEN run is required');
  for (const field of ['sourceSha', 'sourceTreeSha256'])
    if (report[field] !== identity[field]) throw new Error(`Candidate ${field} changed`);
  if (JSON.stringify(report.pins) !== JSON.stringify(identity.pins))
    throw new Error('Normative pins changed');
  if (
    report.lockfileSha256 !== (await hashFile(path.join(root, 'proto-dev/package-lock.json'))) ||
    report.manifestSha256 !==
      (await hashFile(path.join(root, 'constitutional-guard/manifest/history.json')))
  )
    throw new Error('Lockfile/historical manifest changed');
  const tools = { node: process.version, npm: (await command('npm', ['--version'])).stdout.trim() };
  if (JSON.stringify(report.tools) !== JSON.stringify(tools))
    throw new Error('Consumption toolchain differs from certification');
  if (new Set(report.gates.map((row) => row.id)).size !== report.gates.length)
    throw new Error('Duplicate report gate');
  for (const gate of definitions.gates) {
    const observed = report.gates.find(
      (row) => row.id === gate.id && row.phase === gate.phase && row.mandatory === true,
    );
    if (
      !observed ||
      (((candidate && gate.phase !== 'manual') || !candidate) && observed.status !== 'passed')
    )
      throw new Error(`Incomplete mandatory gate: ${gate.id}`);
  }
  const distribution = await readJson(path.join(root, 'build/results/distribution.json'));
  if (
    distribution.diagnostic ||
    distribution.distribution !== 'build/output/dist' ||
    !/^build\/output\/InterDeadProto_[a-zA-Z0-9._-]+\.zip$/.test(distribution.zipPath)
  )
    throw new Error('Untrusted distribution scope');
  for (const field of [
    'sourceSha',
    'sourceTreeSha256',
    'buildId',
    'artifactTreeSha256',
    'zipSha256',
  ])
    if (report.distribution?.[field] !== distribution[field])
      throw new Error(`Distribution report mismatch: ${field}`);
  if (
    (await tree(path.join(root, distribution.distribution))).sha256 !==
      distribution.artifactTreeSha256 ||
    (await hashFile(path.join(root, distribution.zipPath))) !== distribution.zipSha256
  )
    throw new Error('Frozen output changed');
  if (!candidate) {
    if (releaseVerdict(report) !== 'passed' || report.releaseStatus !== 'passed')
      throw new Error('Public release is not authorized by the full verdict');
    if ((await checkRatification()).status !== 'passed')
      throw new Error('Current governance ratification is incomplete');
    const matrix = await readJson(
      path.join(root, 'constitutional-guard/manifest/manual-matrix.json'),
    );
    const records = report.gates
      .filter((row) => matrix.cases.some((definition) => definition.id === row.id))
      .map((row) => row.evidence);
    const manual = await validateEvidence(
      { schemaVersion: 1, results: records },
      matrix.cases,
      distribution,
    );
    if (manual.errors.length || records.some((record) => record?.result !== 'passed'))
      throw new Error('Manual confirmation is missing, stale or belongs to another artifact');
  }
  return {
    candidateStatus: 'passed',
    releaseStatus: report.releaseStatus,
    sourceSha: identity.sourceSha,
    artifactTreeSha256: distribution.artifactTreeSha256,
    zipSha256: distribution.zipSha256,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await verifyRelease({ candidate: process.argv.includes('--candidate') });
  process.stdout.write(JSON.stringify(result) + '\n');
}
