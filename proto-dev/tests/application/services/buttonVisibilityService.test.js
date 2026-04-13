import assert from 'assert';
import ButtonVisibilityService from '../../../src/application/services/ButtonVisibilityService.js';
import LocalStorageAdapter from '../../../src/adapters/persistence/LocalStorageAdapter.js';
import NullLogger from '../../../src/core/logging/NullLogger.js';

describe('ButtonVisibilityService persistence', () => {
  it('stores JSON and restores visibility on boot', () => {
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
    const bus = { emit: () => {} };
    const logger = new NullLogger();
    const adapter = new LocalStorageAdapter(storage);
    const svc = new ButtonVisibilityService(bus, adapter, logger);
    svc.boot();
    svc.setScreenVisibility('messenger', 'post', false);
    svc.setScreenVisibility('camera', 'capture-btn', true);
    assert.deepStrictEqual(JSON.parse(memory.buttonVisibility), {
      'messenger:post': false,
      'camera:capture-btn': true,
    });
    const adapterReload = new LocalStorageAdapter(storage);
    const reload = new ButtonVisibilityService(bus, adapterReload, logger);
    reload.boot();
    assert.strictEqual(reload.isVisible('post', 'messenger'), false);
    assert.strictEqual(reload.isVisible('capture-btn', 'camera'), true);
    assert.strictEqual(reload.isVisible('toggle-camera', 'messenger'), true);
  });
});

it('clearRuntimeVisibility clears runtime flags without synthetic emits', () => {
  const events = [];
  const bus = { emit: (evt) => events.push(evt) };
  const adapter = {
    load() {
      return { 'messenger:post': false, 'camera:capture-btn': true };
    },
    save() {},
    removeCalls: 0,
    remove() {
      this.removeCalls += 1;
    },
  };
  const svc = new ButtonVisibilityService(bus, adapter, new NullLogger());
  svc.boot();

  events.length = 0;
  svc.clearRuntimeVisibility({ clearPersisted: true });

  assert.strictEqual(adapter.removeCalls, 1);
  assert.strictEqual(svc.isVisible('post', 'messenger'), true);
  assert.strictEqual(svc.isVisible('capture-btn', 'camera'), false);
  assert.strictEqual(events.length, 0);
});

it('emits visibility defaults on empty state after boot', () => {
  const events = [];
  const bus = {
    emit: (e) => events.push(e),
    subscribe: () => {},
    unsubscribe: () => {},
  };
  const store = { load: () => null };
  const screen = { getActive: () => 'messenger' };
  const svc = new ButtonVisibilityService(bus, store, new NullLogger(), screen);
  svc.boot();

  const hasToggleCamera = events.some(
    (e) => e.type === 'BUTTON_VISIBILITY_UPDATED' && e.button === 'toggle-camera',
  );
  const hasPost = events.some((e) => e.type === 'BUTTON_VISIBILITY_UPDATED' && e.button === 'post');

  assert.ok(hasToggleCamera);
  assert.ok(hasPost);
});

it('reapplies stored visibility on SCREEN_CHANGE', () => {
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
      return { 'messenger:post': false };
    },
    save() {},
    remove() {},
  };
  const screen = {
    getActive() {
      return 'messenger';
    },
  };
  const svc = new ButtonVisibilityService(bus, store, new NullLogger(), screen);
  svc.boot();

  const bootEmits = events.filter(
    (evt) => evt.type === 'BUTTON_VISIBILITY_UPDATED' && evt.button === 'post',
  );
  assert.strictEqual(bootEmits.length >= 1, true);

  events.length = 0;
  bus._handler?.({ type: 'SCREEN_CHANGE', screen: 'messenger' });

  const changeEmits = events.filter(
    (evt) => evt.type === 'BUTTON_VISIBILITY_UPDATED' && evt.button === 'post',
  );
  assert.strictEqual(changeEmits.length >= 1, true);
});

it('keeps persisted visibility key when clearPersisted is false', () => {
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

  const svc = new ButtonVisibilityService(bus, store, new NullLogger(), screen);
  svc.boot();
  svc.clearRuntimeVisibility({ clearPersisted: false });

  assert.strictEqual(store.removeCalls, 0);
});

it('does not clear persisted visibility key by default when no options are passed', () => {
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

  const svc = new ButtonVisibilityService(bus, store, new NullLogger(), screen);
  svc.boot();
  svc.clearRuntimeVisibility();

  assert.strictEqual(store.removeCalls, 0);
});
