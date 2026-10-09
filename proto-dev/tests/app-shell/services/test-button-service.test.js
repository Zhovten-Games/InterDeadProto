import assert from 'assert';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import NullLogger from '../../../src/runtime-diagnostics/null-logger.js';
import { BUTTON_STATE_UPDATED } from '../../../src/runtime-events/domain/constants.js';

describe('ButtonStateService', () => {
  it('emits updates and persists state', () => {
    const events = [];
    const bus = { emit: (e) => events.push(e), subscribe() {}, unsubscribe() {} };
    const store = {
      data: null,
      save(k, v) {
        this.data = { k, v };
      },
      load() {
        return this.data ? this.data.v : {};
      },
    };
    const logger = new NullLogger();
    const screen = new ScreenService(bus);
    screen.boot();
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
