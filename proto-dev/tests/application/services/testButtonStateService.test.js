import assert from 'assert';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import LocalStorageAdapter from '../../../src/adapters/persistence/LocalStorageAdapter.js';
import NullLogger from '../../../src/core/logging/NullLogger.js';
import { BUTTON_STATE_UPDATED } from '../../../src/core/events/constants.js';

// Tests that button-state data is serialized to JSON and survives reload.
describe('ButtonStateService persistence', () => {
  it('stores JSON and restores state on boot', () => {
    const memory = {};
    const storage = {
      getItem: (k) => (k in memory ? memory[k] : null),
      setItem: (k, v) => {
        memory[k] = v;
      },
      removeItem: (k) => {
        delete memory[k];
      },
    };
    const bus = { emit: () => {}, subscribe() {}, unsubscribe() {} };
    const logger = new NullLogger();
    const screen = new ScreenService(bus);
    screen.boot();

    const adapter = new LocalStorageAdapter(storage);
    const service = new ButtonStateService(bus, adapter, screen, logger);
    service.boot();
    service.setState('alpha', true, 'messenger');
    service.setState('beta', false, 'messenger');

    assert.deepStrictEqual(JSON.parse(memory.buttonState), {
      'messenger:alpha': true,
      'messenger:beta': false,
    });

    const adapterReload = new LocalStorageAdapter(storage);
    const serviceReload = new ButtonStateService(bus, adapterReload, screen, logger);
    serviceReload.boot();

    assert.strictEqual(serviceReload.isActive('alpha', 'messenger'), true);
    assert.strictEqual(serviceReload.isActive('beta', 'messenger'), false);
    assert.strictEqual(serviceReload.isActive('gamma', 'messenger'), true);
  });
});

it('emits BUTTON_STATE_UPDATED when reapplying stored state', () => {
  const events = [];
  const bus = {
    emit(evt) {
      events.push(evt);
    },
    subscribe(handler) {
      this._handler = handler;
    },
    unsubscribe() {},
  };
  const store = {
    load() {
      return { 'messenger:foo': true };
    },
    save() {},
    remove() {},
  };
  const screen = {
    getActive() {
      return 'messenger';
    },
  };
  const logger = { warn() {} };

  const service = new ButtonStateService(bus, store, screen, logger);
  service.boot();

  const bootEmissions = events.filter(
    (evt) => evt.type === BUTTON_STATE_UPDATED && evt.button === 'foo',
  );
  assert.strictEqual(bootEmissions.length, 1);

  events.length = 0;
  bus._handler?.({ type: 'SCREEN_CHANGE', screen: 'messenger' });

  const changeEmissions = events.filter(
    (evt) => evt.type === BUTTON_STATE_UPDATED && evt.button === 'foo',
  );
  assert.strictEqual(changeEmissions.length, 1);
});

it('clearRuntimeState clears in-memory state without synthetic emits', () => {
  const events = [];
  const bus = {
    emit(evt) {
      events.push(evt);
    },
    subscribe() {},
    unsubscribe() {},
  };
  const store = {
    load() {
      return { 'messenger:foo': false, 'camera:capture-btn': true };
    },
    save() {},
    removeCalls: 0,
    remove() {
      this.removeCalls += 1;
    },
  };
  const screen = {
    getActive() {
      return 'messenger';
    },
  };
  const service = new ButtonStateService(bus, store, screen, new NullLogger());
  service.boot();
  service.awaiting = {
    awaits: true,
    kind: 'camera_capture',
    targetScreen: 'camera',
  };

  events.length = 0;
  service.clearRuntimeState({ clearPersisted: true });

  assert.strictEqual(store.removeCalls, 1);
  assert.deepStrictEqual(service.awaiting, { awaits: false });
  assert.strictEqual(service.isActive('post', 'messenger'), true);
  assert.strictEqual(service.isActive('capture-btn', 'camera'), false);
  assert.strictEqual(events.length, 0);
});

it('emits defaults on empty state after boot', () => {
  const events = [];
  const bus = {
    emit: (e) => events.push(e),
    subscribe: () => {},
    unsubscribe: () => {},
  };

  const store = {
    load: () => null,
  };

  const screen = {
    getActive: () => 'messenger',
  };

  const svc = new ButtonStateService(bus, store, screen);
  svc.boot();

  const hasPost = events.some((e) => e.type === 'BUTTON_STATE_UPDATED' && e.button === 'post');

  assert.ok(hasPost);
});

it('keeps persisted key when clearPersisted is false', () => {
  const bus = { emit() {}, subscribe() {}, unsubscribe() {} };
  const store = {
    load() {
      return { 'messenger:post': false };
    },
    save() {},
    removeCalls: 0,
    remove() {
      this.removeCalls += 1;
    },
  };
  const screen = { getActive: () => 'messenger' };

  const svc = new ButtonStateService(bus, store, screen, new NullLogger());
  svc.boot();
  svc.clearRuntimeState({ clearPersisted: false });

  assert.strictEqual(store.removeCalls, 0);
});

it('does not clear persisted key by default when no options are passed', () => {
  const bus = { emit() {}, subscribe() {}, unsubscribe() {} };
  const store = {
    load() {
      return { 'messenger:post': false };
    },
    save() {},
    removeCalls: 0,
    remove() {
      this.removeCalls += 1;
    },
  };
  const screen = { getActive: () => 'messenger' };

  const svc = new ButtonStateService(bus, store, screen, new NullLogger());
  svc.boot();
  svc.clearRuntimeState();

  assert.strictEqual(store.removeCalls, 0);
});
