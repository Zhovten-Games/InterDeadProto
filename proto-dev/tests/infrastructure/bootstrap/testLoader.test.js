import assert from 'assert';
import { JSDOM } from 'jsdom';
import Loader from '../../../src/infrastructure/bootstrap/Loader.js';
import Observer from '../../../src/utils/Observer.js';

class DummyStore {
  constructor() {
    this.data = new Map();
  }

  load(k) {
    return this.data.get(k);
  }
  save(k, v) {
    this.data.set(k, v);
  }
  remove(k) {
    this.data.delete(k);
  }
}

class DummyBC {
  constructor() {
    this.messages = [];
  }

  postMessage(m) {
    this.messages.push(m);
  }

  addEventListener() {}

  removeEventListener() {}
}

class DummyLogger {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  info() {}

  warn(message) {
    this.warnings.push(message);
  }

  error(message) {
    this.errors.push(message);
  }
}

describe('Loader.js', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<body></body>', { url: 'http://localhost' });
    global.document = dom.window.document;
    global.window = dom.window;
    global.sessionStorage = dom.window.sessionStorage;
    global.BroadcastChannel = DummyBC;
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
    delete global.sessionStorage;
    delete global.BroadcastChannel;
  });

  it('broadcasts start and done and clears flag', async () => {
    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();
    const loader = new Loader(logger, store, bus);

    await loader.load(async () => {
      bus.emit({ type: 'BOOT_COMPLETE' });
    });

    const channel = loader.channel;
    assert.deepStrictEqual(channel.messages, [
      'start',
      { type: 'BOOT_START', tabId: loader.tabId },
      'done',
      { type: 'BOOT_DONE', tabId: loader.tabId },
    ]);
    assert.strictEqual(store.load('appLoading'), undefined);
    clearInterval(loader.heartbeat);
  });

  it('uses a null-channel shim and logs warning when BroadcastChannel is missing', () => {
    delete global.BroadcastChannel;

    const logger = new DummyLogger();
    const loader = new Loader(logger, new DummyStore(), new Observer());

    assert.deepStrictEqual(logger.warnings, [
      '[Loader] BroadcastChannel unavailable, running in storage-only mode',
    ]);
    assert.doesNotThrow(() => loader._sendChannelMessage('safe-noop'));
  });

  it('does not throw and still emits overlay lifecycle events without BroadcastChannel', async () => {
    delete global.BroadcastChannel;

    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();
    const events = [];
    bus.subscribe((evt) => events.push(evt));

    assert.doesNotThrow(() => new Loader(logger, store, bus));

    const loader = new Loader(logger, store, bus);
    await loader.load(async () => {
      bus.emit({ type: 'BOOT_COMPLETE' });
    });

    assert.strictEqual(
      events.some((evt) => evt.type === 'OVERLAY_SHOW' && evt.i18nKey === 'loading'),
      true,
    );
    assert.strictEqual(
      events.some((evt) => evt.type === 'OVERLAY_HIDE'),
      true,
    );
    assert.strictEqual(store.load('appLoading'), undefined);
    clearInterval(loader.heartbeat);
  });

  it('reuses tab id from window.name when sessionStorage is unavailable', () => {
    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();

    const originalSessionStorage = global.sessionStorage;
    Object.defineProperty(global, 'sessionStorage', {
      configurable: true,
      get() {
        throw new Error('sessionStorage blocked');
      },
    });

    try {
      const first = new Loader(logger, store, bus);
      const second = new Loader(logger, store, bus);

      assert.ok(first.tabId);
      assert.strictEqual(first.tabId, second.tabId);
      assert.match(global.window.name, /interdead_tab_id=/);
    } finally {
      Object.defineProperty(global, 'sessionStorage', {
        configurable: true,
        value: originalSessionStorage,
      });
    }
  });

  it('does not block when only stale foreign loading marker exists without active tab', async () => {
    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();
    const events = [];
    bus.subscribe((evt) => events.push(evt));

    store.save('appLoading', { value: 'boot:foreign-tab', timestamp: Date.now() });

    const loader = new Loader(logger, store, bus);
    await loader.load(async () => {
      bus.emit({ type: 'BOOT_COMPLETE' });
    });

    assert.strictEqual(
      events.some((evt) => evt.type === 'OVERLAY_SHOW' && evt.i18nKey === 'app_already_open'),
      false,
    );
    assert.strictEqual(store.load('appLoading'), undefined);
    clearInterval(loader.heartbeat);
  });

  it('bypasses multi-tab protection when bypass flag is enabled', async () => {
    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();
    const events = [];
    bus.subscribe((evt) => events.push(evt));

    window.localStorage.setItem('interdead_disable_multi_tab_guard', '1');
    store.save('activeTab', { value: 'foreign-tab', timestamp: Date.now() });

    const loader = new Loader(logger, store, bus);
    await loader.load(async () => {
      bus.emit({ type: 'BOOT_COMPLETE' });
    });

    assert.strictEqual(
      events.some((evt) => evt.type === 'OVERLAY_SHOW' && evt.i18nKey === 'app_already_open'),
      false,
    );
    assert.strictEqual(
      logger.warnings.some((entry) => entry.includes('Multi-tab guard bypass is active')),
      true,
    );
    window.localStorage.removeItem('interdead_disable_multi_tab_guard');
  });

  it('emits loading overlay before hide in a deterministic sequence', async () => {
    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();
    const events = [];
    bus.subscribe((evt) => events.push(evt));

    const loader = new Loader(logger, store, bus);
    await loader.load(async () => {
      bus.emit({ type: 'BOOT_COMPLETE' });
    });

    const loadingIndex = events.findIndex(
      (evt) => evt.type === 'OVERLAY_SHOW' && evt.i18nKey === 'loading',
    );
    const hideIndex = events.findIndex((evt) => evt.type === 'OVERLAY_HIDE');
    assert.ok(loadingIndex >= 0);
    assert.ok(hideIndex > loadingIndex);
    clearInterval(loader.heartbeat);
  });
});
