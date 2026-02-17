import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../src/application/services/ViewService.js';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import { EVENT_MESSAGE_READY, VIEW_RENDER_REQUESTED } from '../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter(h => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach(h => h(evt));
  }
}

describe('Registration flow dialog visibility', () => {
  const waitFor = async (predicate, attempts = 10) => {
    for (let i = 0; i < attempts; i++) {
      const value = predicate();
      if (value) return value;
      await new Promise(r => setTimeout(r, 0));
    }
    return predicate();
  };

  it('shows initial guide message after registration and allows reply', async () => {
    const dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const bus = new Bus();
    const templateService = {
      async renderSection(target, screen) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (screen === 'messenger') {
          el.innerHTML = '<div data-js="dialog-list"></div><div data-js="posts-list"></div>';
        } else {
          el.innerHTML = '';
        }
      },
      async render(_tpl, data) {
        return `<div>${data.text}</div>`;
      }
    };
    const panelService = { load: async () => {} };
    const languageManager = { applyLanguage() {}, async translate(key) { return key; } };
    const profileRegService = { canProceed: () => true, setName() {} };
    const geoService = { getCurrentLocation: async () => null };
    const db = { loadUser: async () => null };
    const postsService = { getPostsForCurrent: async () => [] };
    const detectionService = {};
    const cameraService = {};
    const cameraSectionManager = { stop() {}, stopDetection() {}, resumeDetection() {} };
    const notificationManager = {};
    const logger = { error() {} };
    const store = { save() {}, load() {} };
    const buttons = { getStatesForScreen: () => ({}), setScreenState() {}, isActive() { return true; } };
    const dualityManager = {};

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
      store,
      buttons,
      dualityManager,
      bus
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

    bus.emit({ type: VIEW_RENDER_REQUESTED, screen: 'messenger', payload: {}, view: { posts: [] } });
    await new Promise(r => setTimeout(r, 0));
    const list = await waitFor(() => dom.window.document.querySelector('[data-js="dialog-list"]'));

    bus.emit({ type: EVENT_MESSAGE_READY, message: { text: 'Hello from the guide' } });
    await new Promise(r => setTimeout(r, 0));
    assert.ok(list.textContent.includes('Hello from the guide'));

    bus.emit({ type: EVENT_MESSAGE_READY, message: { text: 'Hi there' } });
    await new Promise(r => setTimeout(r, 0));
    assert.ok(list.textContent.includes('Hi there'));

    presenter.dispose();
    delete global.window;
    delete global.document;
  });
});
