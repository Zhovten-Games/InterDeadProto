import assert from 'assert';
import DualityManager from '../../../src/core/sequence/DualityManager.js';
import { DUALITY_STARTED, QUEST_STARTED, QUEST_COMPLETED, DUALITY_COMPLETED } from '../../../src/core/events/constants.js';

describe('DualityManager', () => {
  it('runs event-quest flow', () => {
    const events = [];
    const bus = { emit: e => events.push(e) };
    const store = { save: (k,v)=>{ store.saved={k,v}; } };
    const config = {
      id: 'guide',
      stages: [
        { event: { id: 'e1', autoStart: true, messages: [] }, quest: { id: 'q1' } }
      ]
    };
    const mgr = new DualityManager(bus, store);
    mgr.load(config);
    mgr.start();
    mgr.completeCurrentEvent();
    mgr.completeQuest();
    assert.ok(events.some(e => e.type === DUALITY_STARTED));
    assert.ok(events.some(e => e.type === QUEST_STARTED));
    assert.ok(events.some(e => e.type === QUEST_COMPLETED));
    assert.ok(events.some(e => e.type === DUALITY_COMPLETED));
    assert.strictEqual(store.saved.k, 'duality:guide');
  });
});
