import assert from 'assert';
import DualityManager from '../../../src/narrative-runtime/sequence/duality-manager.js';
import { DUALITY_COMPLETED } from '../../../src/runtime-events/domain/constants.js';

describe('DualityManager reload completion', () => {
  it('emits completion when stored state is finished', () => {
    const events = [];
    const bus = { emit: (evt) => events.push(evt) };
    const store = {
      load(key) {
        if (key === 'duality:guide') return { completed: true };
        if (key === 'duality:guide:stage') return { index: 1 };
        return null;
      },
    };
    const config = {
      id: 'guide',
      stages: [{ event: { id: 'intro', messages: [] } }, { event: { id: 'outro', messages: [] } }],
    };
    const mgr = new DualityManager(bus, store);
    mgr.load(config);
    assert.ok(events.some((e) => e.type === DUALITY_COMPLETED));
  });
});
