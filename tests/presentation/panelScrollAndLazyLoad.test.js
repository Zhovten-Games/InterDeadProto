import assert from 'assert';
import { JSDOM } from 'jsdom';
import ControlPanel from '../../src/presentation/widgets/ControlPanel/index.js';
import ChatScrollWidget from '../../src/presentation/widgets/ChatScrollWidget.js';
import { CHAT_LOAD_OLDER, CHAT_SCROLL_UP } from '../../src/core/events/constants.js';
import { sections, createScreenMap } from '../../src/config/controls.config.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import config from '../../src/config/index.js';
import { chatDisplayModes } from '../../src/config/chat.config.js';

describe('panel scroll and lazy load', () => {
  it('shows arrows and loads older messages', async () => {
    const originalDisplay = { ...config.chatDisplay };
    config.chatDisplay = { mode: chatDisplayModes.BATCH, batchSize: 3 };
    config.chatMessageBatchSize = 3;
    const dom = new JSDOM('<div data-js="bottom-panel"></div><ul data-js="dialog-list"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
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
    panel.loadTemplate = async () => '<div data-js="panel-controls"><button data-js="scroll-up"></button><button data-js="scroll-down"></button></div>';
    panel.init();
    await panel.render('messenger');
    let up = document.querySelector('[data-js="scroll-up"]');
    let down = document.querySelector('[data-js="scroll-down"]');
    assert.ok(!up.classList.contains('panel--hidden'));
    assert.ok(!down.classList.contains('panel--hidden'));
    await panel.render('main');
    up = document.querySelector('[data-js="scroll-up"]');
    assert.ok(!up.classList.contains('panel--hidden'));

    const container = {
      scrollTop: 0,
      clientHeight: 100,
      scrollHeight: 200,
      scrollBy(x, y) { this.scrollTop += y; },
      addEventListener() {},
      removeEventListener() {}
    };
    const scrollWidget = new ChatScrollWidget(container, bus);
    scrollWidget.boot();
    const events = [];
    bus.subscribe(e => events.push(e));
    document.querySelector('[data-js="scroll-up"]').click();
    assert.strictEqual(container.scrollTop, -100);
    assert.ok(events.find(e => e.type === CHAT_SCROLL_UP));
    assert.ok(events.find(e => e.type === CHAT_LOAD_OLDER));

    scrollWidget.dispose();
    panel.dispose();
    config.chatDisplay = { ...originalDisplay };
    config.chatMessageBatchSize = originalDisplay.batchSize;
    delete global.window;
    delete global.document;
  });
});
