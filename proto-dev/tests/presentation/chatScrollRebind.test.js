import assert from 'assert';
import { JSDOM } from 'jsdom';
import ControlPanel from '../../src/presentation/widgets/ControlPanel/index.js';
import ChatScrollWidget from '../../src/presentation/widgets/ChatScrollWidget.js';
import { CHAT_LOAD_OLDER } from '../../src/core/events/constants.js';
import { sections, createScreenMap } from '../../src/config/controls.config.js';
import config from '../../src/config/index.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import { chatDisplayModes } from '../../src/config/chat.config.js';

const preDom = new JSDOM('<div></div>');
global.window = preDom.window;
global.document = preDom.window.document;

describe('chat scroll rebinding', () => {
  it('maintains scrolling after returning to messenger', async () => {
    const dom = new JSDOM('<div data-js="bottom-panel"></div><ul data-js="dialog-list"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const originalDisplay = { ...config.chatDisplay };
    config.chatDisplay = { mode: chatDisplayModes.BATCH, batchSize: 3 };
    config.chatMessageBatchSize = 3;

    const bus = new EventBusAdapter();
    const buttonService = { init: async () => {} };
    const panel = new ControlPanel(
      sections,
      createScreenMap(),
      buttonService,
      { applyLanguage() {} },
      '[data-js="bottom-panel"]',
      bus
    );
    panel.loadTemplate = async () =>
      '<div data-js="panel-controls"><button data-js="scroll-up"></button><button data-js="scroll-down"></button></div>';
    panel.init();

    const widget = new ChatScrollWidget('[data-js="dialog-list"]', bus);
    widget.boot();

    const prepare = el => {
      Object.defineProperties(el, {
        scrollTop: { value: 20, writable: true, configurable: true },
        clientHeight: { value: 100, configurable: true },
        scrollHeight: { value: 200, configurable: true }
      });
      el.scrollBy = function(x, y) {
        this.scrollTop = this.scrollTop + y;
      };
    };

    let events = [];
    const record = e => events.push(e);
    bus.subscribe(record);

    let container = document.querySelector('[data-js="dialog-list"]');
    prepare(container);
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await new Promise(r => setTimeout(r, 0));
    document.querySelector('[data-js="scroll-up"]').click();
    assert.strictEqual(container.scrollTop, 20 - config.chatScrollStep);
    assert.ok(events.find(e => e.type === CHAT_LOAD_OLDER));

    // simulate navigation away from messenger
    events = [];
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'main' });
    await new Promise(r => setTimeout(r, 0));
    container.remove();
    const fresh = document.createElement('ul');
    fresh.setAttribute('data-js', 'dialog-list');
    document.body.appendChild(fresh);
    prepare(fresh);

    // return to messenger and ensure rebinding
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await new Promise(r => setTimeout(r, 0));
    document.querySelector('[data-js="scroll-up"]').click();
    assert.strictEqual(fresh.scrollTop, 20 - config.chatScrollStep);
    assert.ok(events.find(e => e.type === CHAT_LOAD_OLDER));

    // manual scroll still triggers lazy loading
    events = [];
    fresh.scrollTop = 0;
    fresh.dispatchEvent(new dom.window.Event('scroll'));
    assert.ok(events.find(e => e.type === CHAT_LOAD_OLDER));

    widget.dispose();
    panel.dispose();
    config.chatDisplay = { ...originalDisplay };
    config.chatMessageBatchSize = originalDisplay.batchSize;
    delete global.window;
    delete global.document;
  });
});

