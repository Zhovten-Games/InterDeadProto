import assert from 'assert';
import DualityManager from '../../../src/core/sequence/DualityManager.js';
import { QUEST_STARTED } from '../../../src/core/events/constants.js';

describe('DualityManager quest load behavior', () => {
  const config = {
    id: 'guide',
    stages: [{ event: { id: 'e1' }, quest: { id: 'q1' } }]
  };

  it('does not auto-start quest on first load', () => {
    const events = [];
    const bus = { emit: e => events.push(e) };
    const store = { load: () => null, save() {} };
    const mgr = new DualityManager(bus, store);
    mgr.load(config);
    assert.ok(!events.some(e => e.type === QUEST_STARTED));
  });

  it('resumes quest when previously started', () => {
    const events = [];
    const bus = { emit: e => events.push(e) };
    const store = {
      load: key => (key === 'quest:q1' ? { started: true } : null),
      save() {}
    };
    const mgr = new DualityManager(bus, store);
    mgr.load(config);
    assert.ok(events.some(e => e.type === QUEST_STARTED));
  });
});
