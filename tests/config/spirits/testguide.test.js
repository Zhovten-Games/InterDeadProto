import assert from 'assert';
import guide from '../../../src/config/spirits/guide.js';

describe('guide config', () => {
  it('uses stage-based event and quest structure', () => {
    assert.ok(Array.isArray(guide.stages));
    assert.strictEqual(guide.stages[0].event.autoStart, true);
    assert.ok(guide.stages[0].quest);
    assert.deepStrictEqual(guide.stages[0].quest.requirement, { type: 'object', target: 'person' });
    assert.deepStrictEqual(guide.unlock.requires, []);
  });
});
