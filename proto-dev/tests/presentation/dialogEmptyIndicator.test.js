import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../src/application/services/ViewService.js';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import { EVENT_MESSAGE_READY, DIALOG_CLEAR } from '../../src/core/events/constants.js';

class MockBus {
  constructor() {
    this.subscribers = [];
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter(f => f !== fn);
  }
  emit(evt) {
    this.subscribers.slice().forEach(fn => fn(evt));
  }
}

const createDeps = bus => {
  const templateService = { async renderSection() {}, async render() { return ''; } };
  const panelService = { load: async () => {} };
  const languageManager = { applyLanguage() {}, async translate(key) { return key; } };
  const stub = {};
  const logger = { error() {} };
  const buttonStateService = {
    setScreenState() {},
    isActive() { return true; },
    getStatesForScreen: () => ({})
  };
  const dualityManager = { getRequirement() { return null; } };
  const view = new ViewService(
    templateService,
    panelService,
    languageManager,
    stub,
    stub,
    stub,
    stub,
    stub,
    stub,
    stub,
    stub,
    logger,
    stub,
    buttonStateService,
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
  return { presenter, view };
};

describe('Dialog empty indicator', () => {
  it('operates without relying on an empty placeholder', () => {
    const dom = new JSDOM('<div data-js="dialog-list"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new MockBus();
    const { presenter } = createDeps(bus);

    assert.doesNotThrow(() => {
      bus.emit({ type: DIALOG_CLEAR });
      const msg = { text: 'hello' };
      bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
      bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
      bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
      bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
      bus.emit({ type: 'INIT' });
    });

    assert.strictEqual(dom.window.document.querySelector('[data-js="dialog-empty"]'), null);

    presenter.dispose();
    delete global.window;
    delete global.document;
  });
});
