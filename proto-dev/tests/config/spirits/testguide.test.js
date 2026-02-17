import assert from 'assert';
import guide from '../../../src/config/spirits/guide.js';

describe('guide config', () => {
  it('uses consolidated intro/camera/outro stage structure', () => {
    assert.ok(Array.isArray(guide.stages));
    assert.strictEqual(guide.stages.length, 3);
    assert.strictEqual(guide.stages[0].event.autoStart, true);
    assert.strictEqual(guide.stages[0].id, 'guide-intro');
    assert.strictEqual(guide.stages[1].id, 'guide-camera');
    assert.strictEqual(guide.stages[2].id, 'guide-outro');
    assert.ok(guide.stages[1].quest);
    assert.deepStrictEqual(guide.stages[1].quest.requirement, { type: 'object', target: 'person' });
    assert.deepStrictEqual(guide.unlock.requires, []);
  });
});
