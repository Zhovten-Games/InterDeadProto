import assert from 'node:assert/strict';
import { test } from 'node:test';
import { releaseVerdict, validateGateInventory } from '../../../constitutional-guard/verdict.mjs';

const report = (gates) => ({
  mode: 'all',
  diagnostic: false,
  clean: true,
  distribution: { diagnostic: false },
  gates,
  phaseStatus: Object.fromEntries(
    ['integrity', 'prebuild', 'assembly', 'postbuild', 'manual', 'aggregation'].map((phase) => [
      phase,
      'passed',
    ]),
  ),
});
test('host acceptance stays pending without blocking a fully certified automatic release', () => {
  assert.equal(
    releaseVerdict(
      report([
        { mandatory: true, status: 'passed' },
        { mandatory: false, status: 'manual evidence required' },
      ]),
    ),
    'passed',
  );
});
test('an unavailable mandatory check still refuses release', () => {
  assert.equal(releaseVerdict(report([{ mandatory: true, status: 'unavailable' }])), 'pending');
});
test('a report cannot silently reclassify a mandatory gate', () => {
  assert.ok(
    validateGateInventory(
      [{ id: 'integrity', phase: 'integrity', mandatory: true }],
      [{ id: 'integrity', phase: 'integrity', mandatory: false, status: 'passed' }],
    ).length > 0,
  );
});
