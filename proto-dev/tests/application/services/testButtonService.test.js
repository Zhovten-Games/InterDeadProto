import assert from 'assert';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import NullLogger from '../../../src/core/logging/NullLogger.js';
import { BUTTON_STATE_UPDATED } from '../../../src/core/events/constants.js';

describe('ButtonStateService', () => {
  it('emits updates and persists state', () => {
    const events = [];
    const bus = { emit: e => events.push(e), subscribe(){}, unsubscribe(){} };
    const store = {
      data: null,
      save(k, v) {
        this.data = { k, v };
      },
      load() {
        return this.data ? this.data.v : {};
      }
    };
    const logger = new NullLogger();
    const screen = new ScreenService(bus); screen.boot();
    let svc = new ButtonStateService(bus, store, screen, logger);
    svc.boot();
    svc.setState('post', true, 'messenger');
    assert.strictEqual(events[0].type, BUTTON_STATE_UPDATED);
    assert.strictEqual(events[0].screen, 'messenger');
    assert.strictEqual(events[0].button, 'post');
    assert.strictEqual(events[0].active, true);
    assert.strictEqual(store.data.k, 'buttonState');
    assert.ok(svc.isActive('post', 'messenger'));
    svc = new ButtonStateService(bus, store, screen, logger);
    svc.boot();
    assert.ok(svc.isActive('post', 'messenger'));
    assert.ok(svc.isReady());
  });
});
