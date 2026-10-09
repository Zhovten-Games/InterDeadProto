import { mkdir, writeFile, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { root, sourceIdentity, command, readJson, hashFile, tree } from '../build/lib.mjs';
import { assemble } from '../build/assemble.mjs';
import { checkIntegrity } from './integrity.mjs';
import { checkGovernance, checkRatification } from './governance.mjs';
import { manualGates } from './manual-evidence.mjs';
import { checkArtifacts } from './postbuild.mjs';
import { negativeChecks } from './negative-checks.mjs';
import { releaseVerdict, validateCollection, validateGateInventory } from './verdict.mjs';
import Ajv from '../proto-dev/node_modules/ajv/dist/2020.js';
import os from 'node:os';

const mode = process.argv[2] || 'all';
const modes = ['integrity', 'prebuild', 'postbuild', 'all', 'check'];
if (!modes.includes(mode)) throw new Error(`Unknown WARDEN mode: ${mode}`);
const diagnostic = process.argv.includes('--diagnostic') || (mode !== 'all' && mode !== 'check');
const startedAt = new Date().toISOString();
const report = {
  schemaVersion: 1,
  runId: randomUUID(),
  startedAt,
  mode,
  diagnostic,
  command: process.argv.slice(1),
  environment: { platform: process.platform, architecture: process.arch, osRelease: os.release() },
  driverProtocol: 'idp-public-driver-v1',
  gates: [],
  phaseStatus: {},
  releaseStatus: 'pending',
};
const gate = (id, phase, result) => report.gates.push({ id, phase, mandatory: true, ...result });
async function execute(id, args, cwd = root) {
  const result = await command(process.execPath, args, { cwd });
  gate(id, 'prebuild', result);
}
try {
  Object.assign(report, await sourceIdentity());
  report.tools = {
    node: process.version,
    npm: (await command('npm', ['--version'])).stdout.trim(),
  };
  report.waivers = await readJson(path.join(root, 'governance/waivers.json'));
  report.dependencyManifestSha256 = await hashFile(path.join(root, 'manifest/dependencies.json'));
  report.lockfileSha256 = await hashFile(path.join(root, 'proto-dev/package-lock.json'));
  report.manifestSha256 = await hashFile(
    path.join(root, 'constitutional-guard/manifest/history.json'),
  );
  report.driverHashes = (
    await readJson(path.join(root, 'constitutional-guard/manifest/history.json'))
  ).entries.map((entry) => ({ id: entry.id, path: entry.path, sha256: entry.sha256 }));
  const errors = await checkIntegrity();
  gate('historical-integrity', 'integrity', {
    status: errors.length ? 'failed' : 'passed',
    errors,
  });
  const includesPrebuild = ['prebuild', 'all', 'check'].includes(mode);
  const includesPostbuild = ['postbuild', 'all', 'check'].includes(mode);
  if (includesPrebuild && !errors.length) {
    gate('toolchain', 'prebuild', {
      status:
        report.tools.node === 'v24.19.0' && report.tools.npm === '11.9.0' ? 'passed' : 'failed',
      expected: { node: 'v24.19.0', npm: '11.9.0' },
    });
    const governance = await checkGovernance();
    gate('governance-corpus', 'prebuild', governance);
    report.profileRevision = governance.profileRevision;
    report.actRevisions = governance.actRevisions;
    await execute('format', [path.join(root, 'build/format.mjs')]);
    await execute('javascript-lint', [path.join(root, 'build/lint.mjs')]);
    await execute('dependency-audit', [path.join(root, 'build/audit.mjs')]);
    await execute('source-codemap', [path.join(root, 'build/check-source.mjs')]);
    await execute('ci-publication-policy', [path.join(root, 'build/check-ci.mjs')]);
    await rm(path.join(root, 'build/results/unit-tests.json'), { force: true });
    await execute('complete-unit-corpus', [path.join(root, 'proto-dev/tools/run-tests.mjs')]);
    try {
      report.unitCorpus = await readJson(path.join(root, 'build/results/unit-tests.json'));
      const corpus = await readJson(path.join(root, 'manifest/test-corpus.json'));
      const problems = validateCollection(
        corpus.active.map((row) => row.path),
        report.unitCorpus.results.map((row) => row.file),
        report.unitCorpus.results,
      );
      if (problems.length)
        Object.assign(
          report.gates.find((row) => row.id === 'complete-unit-corpus'),
          { status: 'failed', errors: problems },
        );
      report.unitCorpus.baselineCount = corpus.baselineCount;
      report.unitCorpus.archived = corpus.archived;
    } catch (error) {
      Object.assign(
        report.gates.find((row) => row.id === 'complete-unit-corpus'),
        { status: 'failed', reason: `Missing/invalid fresh unit report: ${error.message}` },
      );
    }
    if (!errors.length) {
      const history = await readJson(path.join(root, 'constitutional-guard/manifest/history.json'));
      for (const driver of history.entries.filter(
        (entry) => entry.status === 'active' && entry.phase === 'prebuild',
      )) {
        const result = await command(process.execPath, [path.join(root, driver.path)], {
          timeoutMs: 90000,
        });
        try {
          const output = JSON.parse(result.stdout.trim());
          const declared = [...driver.cases].sort();
          const observed = output.results.map((row) => row.id).sort();
          if (
            output.protocol !== report.driverProtocol ||
            JSON.stringify(declared) !== JSON.stringify(observed) ||
            output.results.some((row) => row.status !== 'passed')
          )
            result.status = 'failed';
          result.scenarios = output.results;
        } catch {
          result.status = 'failed';
          result.reason = 'Invalid/empty driver protocol report';
        }
        gate(driver.id, 'prebuild', result);
      }
    } else
      gate('historical-execution', 'prebuild', {
        status: 'pending',
        reason: 'Integrity refusal prevents executing changed/unregistered drivers',
      });
    gate('warden-refusal-fixtures', 'prebuild', await negativeChecks());
  }
  let distribution;
  if (includesPostbuild) {
    const blocked = report.gates.some((row) => row.status !== 'passed');
    if (mode === 'postbuild' && !errors.length) {
      distribution = await readJson(path.join(root, 'build/results/distribution.json'));
      if (
        distribution.sourceSha !== report.sourceSha ||
        distribution.sourceTreeSha256 !== report.sourceTreeSha256
      )
        throw new Error('Postbuild source identity mismatch');
    } else if (!blocked) {
      try {
        distribution = await assemble({ diagnostic });
        gate('isolated-assembly', 'assembly', { status: 'passed' });
      } catch (error) {
        gate('isolated-assembly', 'assembly', { status: 'failed', reason: error.message });
      }
    } else
      gate('isolated-assembly', 'assembly', {
        status: 'pending',
        reason: 'Prebuild/integrity gate blocks official assembly',
      });
    if (distribution && !errors.length) {
      report.distribution = distribution;
      report.gates.push(...(await checkArtifacts(distribution)));
      const historical = await readJson(
        path.join(root, 'constitutional-guard/manifest/history.json'),
      );
      for (const driver of historical.entries.filter(
        (entry) => entry.status === 'active' && entry.phase === 'postbuild',
      )) {
        const result = await command(process.execPath, [path.join(root, driver.path)], {
          timeoutMs: 90000,
        });
        try {
          const output = JSON.parse(result.stdout.trim());
          if (
            output.protocol !== report.driverProtocol ||
            JSON.stringify([...driver.cases].sort()) !==
              JSON.stringify(output.results.map((row) => row.id).sort()) ||
            output.results.some((row) => row.status !== 'passed')
          )
            result.status = 'failed';
          result.scenarios = output.results;
        } catch {
          result.status = 'failed';
          result.reason = 'Invalid historical postbuild report';
        }
        gate(driver.id, 'postbuild', result);
      }
      const required = await readJson(
        path.join(root, 'constitutional-guard/manifest/manual-matrix.json'),
      );
      report.gates.push(...(await manualGates(required.cases, distribution)));
      const current = await tree(path.join(root, distribution.distribution));
      gate('frozen-artifact', 'postbuild', {
        status:
          current.sha256 === distribution.artifactTreeSha256 &&
          (await hashFile(path.join(root, distribution.zipPath))) === distribution.zipSha256
            ? 'passed'
            : 'failed',
      });
    } else
      gate('artifact-verification', 'postbuild', {
        status: 'pending',
        reason: 'No verified assembly in this run',
      });
    gate('governance-ratification', 'manual', await checkRatification());
    if (!distribution) {
      const matrix = await readJson(
        path.join(root, 'constitutional-guard/manifest/manual-matrix.json'),
      );
      report.gates.push(
        ...matrix.cases.map((row) => ({
          id: row.id,
          phase: 'manual',
          mandatory: true,
          status: 'manual evidence required',
          reason: 'No verified current artifact identity',
        })),
      );
    }
  }
  const after = await sourceIdentity();
  gate('immutable-source', 'aggregation', {
    status: report.sourceTreeSha256 === after.sourceTreeSha256 ? 'passed' : 'failed',
  });
  gate('clean-source', 'aggregation', {
    status: report.clean ? 'passed' : 'failed',
    reason: report.clean ? null : 'Commit candidate changes before certification',
  });
} catch (error) {
  gate('runner', 'aggregation', { status: 'failed', reason: error.stack || String(error) });
}
try {
  const inventory = await readJson(path.join(root, 'constitutional-guard/manifest/gates.json'));
  for (const definition of inventory.gates) {
    const rows = report.gates.filter((row) => row.id === definition.id);
    if (!rows.length)
      gate(definition.id, definition.phase, {
        status: 'pending',
        reason: 'Gate was not run in this mode or blocked by an earlier phase',
      });
  }
  const inventoryErrors = validateGateInventory(inventory.gates, report.gates);
  Object.assign(
    report.gates.find((row) => row.id === 'gate-inventory'),
    {
      status: inventoryErrors.length ? 'failed' : 'passed',
      errors: inventoryErrors,
    },
  );
  for (const phase of ['integrity', 'prebuild', 'assembly', 'postbuild', 'manual', 'aggregation']) {
    const rows = report.gates.filter((row) => row.phase === phase);
    let phaseStatus = 'pending';
    if (rows.length && rows.every((row) => row.status === 'passed')) phaseStatus = 'passed';
    else if (rows.some((row) => row.status === 'failed')) phaseStatus = 'failed';
    report.phaseStatus[phase] = phaseStatus;
  }
  report.releaseStatus = releaseVerdict(report);
} catch (error) {
  gate('inventory-finalization', 'aggregation', {
    status: 'failed',
    reason: error.stack || String(error),
  });
}
report.finishedAt = new Date().toISOString();
report.blockers = report.gates
  .filter((row) => row.status !== 'passed')
  .map((row) => ({ id: row.id, status: row.status, reason: row.reason || row.errors || null }));
const schemaGate = report.gates.find((row) => row.id === 'report-schema');
if (schemaGate) {
  schemaGate.status = 'passed';
  delete schemaGate.reason;
}
try {
  const reportSchema = await readJson(
    path.join(root, 'constitutional-guard/schemas/report.schema.json'),
  );
  const validate = new Ajv({ allErrors: true, strict: true }).compile(reportSchema);
  if (!validate(report)) throw new Error(JSON.stringify(validate.errors));
} catch (error) {
  const failure = {
    id: 'report-schema',
    phase: 'aggregation',
    mandatory: true,
    status: 'failed',
    reason: error.message,
  };
  if (schemaGate) Object.assign(schemaGate, failure);
  else report.gates.push(failure);
}
const aggregation = report.gates.filter((row) => row.phase === 'aggregation');
report.phaseStatus.aggregation = aggregation.every((row) => row.status === 'passed')
  ? 'passed'
  : 'pending';
if (aggregation.some((row) => row.status === 'failed')) report.phaseStatus.aggregation = 'failed';
report.releaseStatus = releaseVerdict(report);
report.blockers = report.gates
  .filter((row) => row.status !== 'passed')
  .map((row) => ({ id: row.id, status: row.status, reason: row.reason || row.errors || null }));
await mkdir(path.join(root, 'build/results'), { recursive: true });
await writeFile(
  path.join(root, 'build/results/warden-report.json'),
  JSON.stringify(report, null, 2) + '\n',
);
process.stdout.write(`WARDEN ${mode}: releaseStatus=${report.releaseStatus}\n`);
for (const blocker of report.blockers)
  process.stdout.write(`${blocker.id}: ${blocker.status} ${blocker.reason || ''}\n`);
const full = ['all', 'check'].includes(mode);
let selectedPhases = ['integrity', 'postbuild', 'aggregation'];
if (mode === 'integrity') selectedPhases = ['integrity', 'aggregation'];
else if (mode === 'prebuild') selectedPhases = ['integrity', 'prebuild', 'aggregation'];
let incomplete = report.gates.some(
  (row) => selectedPhases.includes(row.phase) && row.status !== 'passed',
);
if (full) incomplete = report.releaseStatus !== 'passed';
process.exitCode = incomplete ? 1 : 0;
