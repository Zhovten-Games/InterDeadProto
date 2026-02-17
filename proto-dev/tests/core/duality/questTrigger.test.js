import assert from 'assert';
import DualityManager from '../../../src/core/sequence/DualityManager.js';
import { QUEST_STARTED } from '../../../src/core/events/constants.js';

describe('DualityManager quest trigger', () => {
  it('emits QUEST_STARTED after user reply', () => {
    const events = [];
    const bus = { emit: e => events.push(e) };
    const config = {
      id: 'guide',
      stages: [
        { event: { id: 'intro', autoStart: true, messages: [
          { author: 'ghost', text: 'hi' },
          { author: 'user', text: 'hello' }
        ] }, quest: { id: 'q1', requirement: { type: 'object', target: 'person' } } }
      ]
    };
    const mgr = new DualityManager(bus, {});
    mgr.load(config);
    mgr.start();
    const dlg = mgr.getCurrentDialog();
    dlg.next();
    dlg.next();
    mgr.completeCurrentEvent();
    assert.ok(events.some(e => e.type === QUEST_STARTED));
  });
});
