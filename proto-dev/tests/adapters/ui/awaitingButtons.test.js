import assert from 'assert';
import { createStore } from '../../../src/core/engine/store.js';
import { awaitUser, questStart, questComplete } from '../../../src/core/engine/actions.js';
import ViewAdapter from '../../../src/adapters/ui/ViewAdapter.js';
import { BUTTON_STATE_UPDATED } from '../../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.events = [];
    this.subscribers = [];
  }
  emit(evt) {
    this.events.push(evt);
    this.subscribers.slice().forEach(fn => fn(evt));
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter(f => f !== fn);
  }
}

describe('ViewAdapter awaiting button mapping', () => {
  it('emits button states for messenger/camera transitions', () => {
    const store = createStore();
    const bus = new Bus();
    const adapter = new ViewAdapter(bus, null, null, store);
    adapter.boot();

    // Clear initial sync events
    bus.events = [];

    // Messenger awaiting user text -> enable Post, disable Capture
    store.dispatch(awaitUser());
    assert.deepStrictEqual(bus.events[0], {
      type: BUTTON_STATE_UPDATED,
      button: 'post',
      active: true,
      screen: 'messenger'
    });
    assert.deepStrictEqual(bus.events[1], {
      type: BUTTON_STATE_UPDATED,
      button: 'capture-btn',
      active: false,
      screen: 'camera'
    });
    bus.events = [];

    // Quest activates camera capture -> enable Capture, disable Post
    store.dispatch(questStart());
    assert.deepStrictEqual(bus.events[0], {
      type: BUTTON_STATE_UPDATED,
      button: 'post',
      active: false,
      screen: 'messenger'
    });
    assert.deepStrictEqual(bus.events[1], {
      type: BUTTON_STATE_UPDATED,
      button: 'capture-btn',
      active: true,
      screen: 'camera'
    });
    bus.events = [];

    // Quest completes, awaiting returns to messenger
    store.dispatch(questComplete());
    assert.deepStrictEqual(bus.events[0], {
      type: BUTTON_STATE_UPDATED,
      button: 'post',
      active: true,
      screen: 'messenger'
    });
    assert.deepStrictEqual(bus.events[1], {
      type: BUTTON_STATE_UPDATED,
      button: 'capture-btn',
      active: false,
      screen: 'camera'
    });

    adapter.dispose();
  });
});
