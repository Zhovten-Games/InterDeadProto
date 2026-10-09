import { cp, mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, readJson, tree, hashFile } from '../build/lib.mjs';
import { verifyIntegrity } from './integrity.mjs';
import { validateEvidence } from './manual-evidence.mjs';
import { releaseVerdict, validateCollection, validateGateInventory } from './verdict.mjs';
import { verifyFrozen } from './postbuild.mjs';

export async function negativeChecks() {
  const directory = await mkdtemp(path.join(root, 'build/results/refusal-'));
  const results = [];
  const fixture = async (id, task) => {
    try {
      if (!(await task())) throw new Error('Expected refusal was not observed');
      results.push({ id, status: 'passed' });
    } catch (error) {
      results.push({ id, status: 'failed', reason: error.message });
    }
  };
  try {
    const manifest = await readJson(path.join(root, 'constitutional-guard/manifest/history.json'));
    const files = [
      ...manifest.entries.map((row) => row.path),
      ...manifest.protectedDependencies.map((row) => row.path),
      ...manifest.productionContracts.map((row) => row.path),
    ];
    for (const file of new Set(files))
      await cp(path.join(root, file), path.join(directory, file), { recursive: true });
    const historical = path.join(directory, manifest.entries[0].path);
    const original = await readFile(historical);
    await fixture('refusal.changed-history', async () => {
      await writeFile(historical, 'changed');
      const errors = await verifyIntegrity(manifest, directory);
      await writeFile(historical, original);
      return errors.some((error) => error.includes('Changed historical'));
    });
    await fixture('refusal.missing-history', async () => {
      await rm(historical);
      const errors = await verifyIntegrity(manifest, directory);
      await writeFile(historical, original);
      return errors.some((error) => error.includes('Missing historical'));
    });
    await fixture('refusal.unregistered-history', async () => {
      const extra = path.join(path.dirname(historical), 'extra.mjs');
      await writeFile(extra, '');
      const errors = await verifyIntegrity(manifest, directory);
      await rm(extra);
      return errors.some((error) => error.includes('Unregistered historical'));
    });
    await fixture('refusal.protected-dependency', async () => {
      const file = path.join(directory, manifest.protectedDependencies[0].path);
      const bytes = await readFile(file);
      await writeFile(file, 'changed');
      const errors = await verifyIntegrity(manifest, directory);
      await writeFile(file, bytes);
      return errors.some((error) => error.includes('Changed protected dependency'));
    });
    await fixture('refusal.public-interface', async () => {
      const file = path.join(directory, manifest.productionContracts[0].path);
      const bytes = await readFile(file);
      await writeFile(file, 'export default class Empty {}');
      const errors = await verifyIntegrity(manifest, directory);
      await writeFile(file, bytes);
      return errors.some((error) => error.includes('Changed protected public interface'));
    });
    await fixture('refusal.supersession-orphan', async () => {
      const corrupted = structuredClone(manifest);
      Object.assign(corrupted.entries[0], {
        status: 'superseded',
        supersededBy: 'IDP-WH-MISSING-999.v1',
        decision: 'governance/decisions/missing.md',
      });
      return (await verifyIntegrity(corrupted, directory)).some(
        (error) => error.includes('successor') || error.includes('supersededBy'),
      );
    });
    await fixture('refusal.schema-traversal', async () => {
      const corrupted = structuredClone(manifest);
      corrupted.entries[0].path = '../../outside.mjs';
      return (await verifyIntegrity(corrupted, directory)).length > 0;
    });
    await fixture(
      'refusal.missing-mandatory-gate',
      async () => validateGateInventory([{ id: 'required', phase: 'prebuild' }], []).length > 0,
    );
    await fixture(
      'refusal.unknown-successful-gate',
      async () =>
        validateGateInventory(
          [{ id: 'required', phase: 'prebuild' }],
          [
            { id: 'required', phase: 'prebuild', mandatory: true, status: 'passed' },
            { id: 'unknown', phase: 'prebuild', mandatory: true, status: 'passed' },
          ],
        ).length > 0,
    );
    await fixture(
      'refusal.skipped-collection',
      async () =>
        validateCollection(
          ['a.test.js', 'b.test.js'],
          ['a.test.js'],
          [{ file: 'a.test.js', status: 'passed', tests: 1, pending: 0 }],
        ).length > 0,
    );
    await fixture(
      'refusal.pending-test',
      async () =>
        validateCollection(
          ['a.test.js'],
          ['a.test.js'],
          [{ file: 'a.test.js', status: 'passed', tests: 1, pending: 1 }],
        ).length > 0,
    );
    const identity = {
      sourceSha: 'a'.repeat(40),
      artifactTreeSha256: 'b'.repeat(64),
      zipSha256: 'c'.repeat(64),
      buildId: 'fixture',
    };
    const matrix = [{ id: 'fixture', browser: 'Opera', origin: 'itch.io' }];
    const record = {
      schemaVersion: 1,
      results: [
        {
          caseId: 'fixture',
          reviewer: 'Refusal fixture',
          date: new Date().toISOString(),
          ...identity,
          browser: { name: 'Opera', version: 'fixture' },
          os: 'fixture',
          origins: ['https://itch.io'],
          result: 'passed',
          references: ['isolated synthetic refusal fixture; not release evidence'],
        },
      ],
    };
    await fixture('refusal.stale-evidence', async () => {
      const stale = structuredClone(record);
      stale.results[0].date = '2000-01-01T00:00:00Z';
      return (await validateEvidence(stale, matrix, identity)).errors.length > 0;
    });
    await fixture('refusal.foreign-artifact', async () => {
      const foreign = structuredClone(record);
      foreign.results[0].artifactTreeSha256 = 'd'.repeat(64);
      return (await validateEvidence(foreign, matrix, identity)).errors.length > 0;
    });
    await fixture('refusal.duplicate-evidence', async () => {
      const duplicated = structuredClone(record);
      duplicated.results.push(duplicated.results[0]);
      return (await validateEvidence(duplicated, matrix, identity)).errors.length > 0;
    });
    const report = {
      mode: 'all',
      diagnostic: false,
      clean: true,
      distribution: { diagnostic: false },
      phaseStatus: Object.fromEntries(
        ['integrity', 'prebuild', 'assembly', 'postbuild', 'manual', 'aggregation'].map((phase) => [
          phase,
          'passed',
        ]),
      ),
      gates: [{ status: 'passed' }],
    };
    for (const status of ['unavailable', 'failed', 'pending', 'manual evidence required'])
      await fixture(
        `refusal.release-${status.replaceAll(' ', '-')}`,
        async () => releaseVerdict({ ...report, gates: [{ status }] }) === 'pending',
      );
    await fixture(
      'refusal.diagnostic-release',
      async () => releaseVerdict({ ...report, diagnostic: true }) === 'pending',
    );
    await fixture('refusal.postbuild-mutation', async () => {
      const output = path.join(directory, 'output');
      await cp(path.join(root, 'build/artifact-map.json'), path.join(output, 'fixture.json'));
      const zip = path.join(directory, 'fixture.zip');
      await writeFile(zip, 'fixture');
      const distribution = {
        distribution: path.relative(root, output),
        artifactTreeSha256: (await tree(output)).sha256,
        zipPath: path.relative(root, zip),
        zipSha256: await hashFile(zip),
      };
      if (!(await verifyFrozen(distribution))) return false;
      await writeFile(path.join(output, 'fixture.json'), 'mutated after verification');
      return !(await verifyFrozen(distribution));
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
  return {
    status: results.length && results.every((row) => row.status === 'passed') ? 'passed' : 'failed',
    scenarios: results,
  };
}
