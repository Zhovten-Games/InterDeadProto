import assert from 'assert';
import { JSDOM } from 'jsdom';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import {
  APP_RESET_REQUESTED,
  GHOST_REBOOT_REQUESTED,
  GHOST_RESET_REQUESTED,
  MODAL_HIDE,
  MODAL_SHOW,
  RESET_OPTIONS_REQUESTED
} from '../../src/core/events/constants.js';

class StubBus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach(handler => handler(evt));
  }
}

describe('GlobalViewPresenter reset modal', () => {
  let dom;
  let bus;
  let presenter;
  let templateService;
  let panelService;
  let languageManager;

  beforeEach(() => {
    dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    bus = new StubBus();
    templateService = { renderSection: async () => {}, render: async () => '' };
    panelService = { load: async () => {} };
    languageManager = { applyLanguage() {}, translate: async key => key };
    presenter = new GlobalViewPresenter(
      templateService,
      panelService,
      languageManager,
      bus,
      null,
      { error() {} }
    );
    presenter.boot();
  });

  afterEach(() => {
    presenter.dispose();
    delete global.window;
    delete global.document;
  });

  it('emits ghost reset request from modal selection', () => {
    bus.emit({ type: RESET_OPTIONS_REQUESTED });

    assert.ok(presenter._modalNode);
    const buttons = presenter._modalNode.querySelectorAll('button');
    const resetCurrent = buttons[0];
    resetCurrent.click();

    assert.ok(bus.events.some(evt => evt.type === MODAL_SHOW));
    assert.ok(bus.events.some(evt => evt.type === GHOST_RESET_REQUESTED));
    assert.ok(bus.events.some(evt => evt.type === MODAL_HIDE));
    assert.strictEqual(presenter._modalNode, null);
  });

  it('emits app reset request from modal selection', () => {
    bus.emit({ type: RESET_OPTIONS_REQUESTED });

    const buttons = presenter._modalNode.querySelectorAll('button');
    const resetAll = buttons[2];
    resetAll.click();

    assert.ok(bus.events.some(evt => evt.type === APP_RESET_REQUESTED));
  });

  it('emits ghost reboot request from modal selection', () => {
    bus.emit({ type: RESET_OPTIONS_REQUESTED });

    const buttons = presenter._modalNode.querySelectorAll('button');
    const rebootCurrent = buttons[1];
    rebootCurrent.click();

    assert.ok(bus.events.some(evt => evt.type === GHOST_REBOOT_REQUESTED));
  });
});
