import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../src/application/services/ViewService.js';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import { EVENT_MESSAGE_READY } from '../../src/core/events/constants.js';

class MockTemplate {
  async renderSection(target, screen) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (screen === 'messenger') {
      el.innerHTML = '<div data-js="dialog-list"></div><div data-js="posts-list"></div>';
    } else {
      el.innerHTML = '';
    }
  }
  async render(_tpl, msg) { return `<div>${msg.text}</div>`; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('ViewAdapter dialog history', () => {
    it('renders messages only when events arrive', async () => {
    const dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new EventBusAdapter();

    const templateService = new MockTemplate();
    const panelService = { load: async () => {} };
    const languageManager = { applyLanguage() {}, async translate(key) { return key; } };
    const profileRegService = { canProceed: () => true, setName() {} };
    const geoService = { getCurrentLocation: async () => null };
    const db = { loadUser: async () => null };
    const postsService = { getPostsForCurrent: async () => [] };
    const detectionService = {};
    const cameraService = {};
    const cameraSectionManager = { stopDetection() {}, markCaptured() {} };
    const notificationManager = {};
    const logger = { error() {} };
    const persistence = { save() {}, load() {} };
    const buttonStateService = { getStatesForScreen: () => ({}), setScreenState() {}, isActive() { return true; } };
    const dualityManager = {};
    const ghostService = { getCurrentGhost: () => ({ name: 'ghost1' }) };
    let loadCalled = false;
    const historyService = {
      load: () => {
        loadCalled = true;
        return [{ author: 'ghost', text: 'hello' }];
      },
      save() {},
      append() {}
    };

    const view = new ViewService(
      templateService,
      panelService,
      languageManager,
      profileRegService,
      geoService,
      db,
      postsService,
      detectionService,
      cameraService,
      cameraSectionManager,
      notificationManager,
      logger,
      persistence,
      buttonStateService,
      dualityManager,
      bus,
      ghostService,
      historyService,
      { flushTo() {} }
    );
    view.boot();
    const presenter = new GlobalViewPresenter(
      templateService,
      panelService,
      languageManager,
      bus,
      null,
      logger
    );
    presenter.boot();

    // Initial entry should not preload history
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await sleep(0);
    let list = document.querySelector('[data-js="dialog-list"]');
    assert.strictEqual(list.children.length, 0);
    assert.strictEqual(document.querySelector('[data-js="dialog-empty"]'), null);

    // History arrives via events
    const msg = { author: 'ghost', text: 'hello', fingerprint: 'g:hello' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await sleep(0);
    assert.ok(list.innerHTML.includes('hello'));
    assert.strictEqual(document.querySelector('[data-js="dialog-empty"]'), null);
    assert.strictEqual(loadCalled, false);

    presenter.dispose();
    delete global.window;
    delete global.document;
  });
});
