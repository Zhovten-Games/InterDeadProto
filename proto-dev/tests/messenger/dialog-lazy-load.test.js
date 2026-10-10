import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/messenger/presentation/dialog-widget.js';
import { EVENT_MESSAGE_READY, CHAT_LOAD_OLDER } from '../../src/runtime-events/domain/constants.js';
import config from '../../src/app-shell/composition/configuration-index.js';
import { chatDisplayModes } from '../../src/messenger/configuration/chat-config.js';
import { deferred } from '../../../constitutional-guard/driver-tools.mjs';

class MockBus {
  constructor() {
    this.subscribers = [];
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((f) => f !== fn);
  }
  emit(evt) {
    this.subscribers.slice().forEach((fn) => fn(evt));
  }
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
      bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
      await new Promise((r) => setTimeout(r, 0));
    }
    let items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 6);
    assert.ok(items[0].textContent.includes('msg1'));
    assert.ok(items[5].textContent.includes('msg6'));

    bus.emit({ type: CHAT_LOAD_OLDER });
    await new Promise((r) => setTimeout(r, 0));
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
      bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
      await new Promise((r) => setTimeout(r, 0));
    }
    let items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 3);
    assert.ok(items[0].textContent.includes('msg4'));
    assert.ok(items[2].textContent.includes('msg6'));

    bus.emit({ type: CHAT_LOAD_OLDER });
    await new Promise((r) => setTimeout(r, 0));
    items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 6);
    assert.ok(items[0].textContent.includes('msg1'));
    assert.ok(items[5].textContent.includes('msg6'));
  });

  it('keeps a continuous loaded window when a live message arrives during an older render', async () => {
    config.chatDisplay = { mode: chatDisplayModes.BATCH, batchSize: 2 };
    const dom = new JSDOM('<ul id="dialog"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const waiting = deferred(),
      entered = deferred();
    const tpl = {
      async render(_, data) {
        if (data.text === 'msg4') {
          entered.resolve();
          await waiting.promise;
        }
        return `<li>${data.text}</li>`;
      },
    };
    const bus = new MockBus();
    const widget = new DialogWidget('#dialog', tpl, { applyLanguage() {} }, bus);
    widget.boot();
    try {
      await widget.replaceMessages({
        ghost: 'A',
        revision: 1,
        messages: Array.from({ length: 6 }, (_, i) => ({
          fingerprint: String(i + 1),
          sequence: i + 1,
          text: `msg${i + 1}`,
        })),
      });
      const older = widget.renderOlder();
      await entered.promise;
      bus.emit({
        type: EVENT_MESSAGE_READY,
        message: { fingerprint: '7', sequence: 7, text: 'msg7' },
      });
      waiting.resolve();
      await older;
      await widget.renderLatest();
      assert.deepEqual(
        [...document.querySelectorAll('[data-fingerprint]')].map(
          (node) => node.dataset.fingerprint,
        ),
        ['3', '4', '5', '6', '7'],
      );
      await Promise.all([widget.renderOlder(), widget.renderOlder()]);
      assert.deepEqual(
        [...document.querySelectorAll('[data-fingerprint]')].map(
          (node) => node.dataset.fingerprint,
        ),
        ['1', '2', '3', '4', '5', '6', '7'],
      );
    } finally {
      waiting.resolve();
      widget.dispose();
      dom.window.close();
    }
  });

  it('replaces a pending older render without waiting or leaking its messages into the next chat', async () => {
    config.chatDisplay = { mode: chatDisplayModes.BATCH, batchSize: 2 };
    const dom = new JSDOM('<ul id="dialog"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const waiting = deferred(),
      entered = deferred();
    const tpl = {
      async render(_, data) {
        if (data.text === 'old2') {
          entered.resolve();
          await waiting.promise;
        }
        return `<li>${data.text}</li>`;
      },
    };
    const widget = new DialogWidget('#dialog', tpl, { applyLanguage() {} }, new MockBus());
    widget.boot();
    try {
      await widget.replaceMessages({
        ghost: 'A',
        revision: 1,
        messages: Array.from({ length: 4 }, (_, i) => ({
          fingerprint: `A:${i + 1}`,
          sequence: i + 1,
          text: `old${i + 1}`,
        })),
      });
      const older = widget.renderOlder();
      await entered.promise;
      await widget.replaceMessages({
        ghost: 'B',
        revision: 2,
        messages: [{ fingerprint: 'B:1', sequence: 1, text: 'new1' }],
      });
      assert.deepEqual(
        [...document.querySelectorAll('[data-fingerprint]')].map(
          (node) => node.dataset.fingerprint,
        ),
        ['B:1'],
      );
      waiting.resolve();
      await older;
      assert.deepEqual(
        [...document.querySelectorAll('[data-fingerprint]')].map(
          (node) => node.dataset.fingerprint,
        ),
        ['B:1'],
      );
    } finally {
      waiting.resolve();
      widget.dispose();
      dom.window.close();
    }
  });
});
