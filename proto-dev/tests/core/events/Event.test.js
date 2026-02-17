import assert from 'assert';
import Event from '../../../src/core/events/Event.js';
import { EVENT_STARTED, EVENT_COMPLETED } from '../../../src/core/events/constants.js';

describe('Event', () => {
  it('emits start and complete events', () => {
    const emitted = [];
    const bus = { emit: e => emitted.push(e) };
    const store = { save: (k, v) => (store.saved = { k, v }) };
    const logs = [];
    const logger = { info: msg => logs.push(msg) };
    const event = new Event(bus, store, 'e1', logger);
    event.start();
    event.complete();
    assert.deepStrictEqual(emitted, [
      { type: EVENT_STARTED, id: 'e1' },
      { type: EVENT_COMPLETED, id: 'e1' }
    ]);
    assert.strictEqual(store.saved.k, 'event:e1');
    const state = event.serializeState();
    assert.strictEqual(state.completed, true);
    assert.deepStrictEqual(logs, ['Event started: e1', 'Event completed: e1']);
  });
});
