import assert from 'assert';
import DualityManager from '../../../src/core/sequence/DualityManager.js';

// Ensures quest is not reported active after completion

describe('DualityManager.isQuestActive', () => {
  it('returns false once the quest is completed', () => {
    const bus = { emit() {} };
    const store = { save() {}, load() { return {}; } };
    const cfg = {
      id: 'quest-test',
      stages: [
        { event: { id: 'e1', autoStart: true }, quest: { id: 'q1' } }
      ]
    };
    const mgr = new DualityManager(bus, store);
    mgr.load(cfg);
    mgr.start();
    mgr.completeCurrentEvent(); // start quest
    assert.strictEqual(mgr.isQuestActive(), true);
    mgr.completeQuest();
    assert.strictEqual(mgr.isQuestActive(), false);
  });
});
