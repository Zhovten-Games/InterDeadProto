import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY, CHAT_LOAD_OLDER } from '../../src/core/events/constants.js';
import config from '../../src/config/index.js';
import { chatDisplayModes } from '../../src/config/chat.config.js';

class MockBus {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) { this.subscribers.slice().forEach(fn => fn(evt)); }
}

describe('Dialog lazy loading', () => {
  const originalDisplay = { ...config.chatDisplay };

  afterEach(() => {
    config.chatDisplay = { ...originalDisplay };
    config.chatMessageBatchSize = originalDisplay.batchSize;
    delete global.window;
    delete global.document;
  });

  it('renders all messages when display mode is all', async () => {
    config.chatDisplay = { mode: chatDisplayModes.ALL, batchSize: 3 };
    config.chatMessageBatchSize = 3;
    const dom = new JSDOM('<ul data-js="dialog-list" style="height:100px;overflow:auto"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new MockBus();
    const tpl = { render: async (_, d) => `<li>${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('[data-js="dialog-list"]', tpl, lang, bus);
    widget.boot();
    for (let i = 1; i <= 6; i++) {
      const msg = { text: `msg${i}` };
      bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
      await new Promise(r => setTimeout(r, 0));
    }
    let items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 6);
    assert.ok(items[0].textContent.includes('msg1'));
    assert.ok(items[5].textContent.includes('msg6'));

    bus.emit({ type: CHAT_LOAD_OLDER });
    await new Promise(r => setTimeout(r, 0));
    items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 6);
  });

  it('renders only latest batch and prepends older on demand', async () => {
    config.chatDisplay = { mode: chatDisplayModes.BATCH, batchSize: 3 };
    config.chatMessageBatchSize = 3;
    const dom = new JSDOM('<ul data-js="dialog-list" style="height:100px;overflow:auto"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new MockBus();
    const tpl = { render: async (_, d) => `<li>${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('[data-js="dialog-list"]', tpl, lang, bus);
    widget.boot();
    for (let i = 1; i <= 6; i++) {
      const msg = { text: `msg${i}` };
      bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
      await new Promise(r => setTimeout(r, 0));
    }
    let items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 3);
    assert.ok(items[0].textContent.includes('msg4'));
    assert.ok(items[2].textContent.includes('msg6'));

    bus.emit({ type: CHAT_LOAD_OLDER });
    await new Promise(r => setTimeout(r, 0));
    items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 6);
    assert.ok(items[0].textContent.includes('msg1'));
    assert.ok(items[5].textContent.includes('msg6'));
  });
});
