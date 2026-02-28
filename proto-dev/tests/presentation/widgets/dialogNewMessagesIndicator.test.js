import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

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

describe('DialogWidget new messages indicator', () => {
  function setupDom() {
    const dom = new JSDOM('<div class="messenger-screen__dialog"><ul id="dlg"></ul></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    return dom;
  }

  function createWidget(container, bus) {
    const tpl = { render: async (_, d) => `<li class="dialog__message">${d.text}</li>` };
    const lang = {
      applyLanguage() {},
      async translate(key) {
        return key === 'chat_new_messages' ? 'Есть новые сообщения' : '';
      },
    };
    const widget = new DialogWidget(container, tpl, lang, bus);
    widget.scrollMode = 'new-messages-button';
    return widget;
  }

  it('shows localized button when user is away from bottom and jumps to first unread', async () => {
    setupDom();
    const bus = new MockBus();
    const container = document.getElementById('dlg');

    Object.defineProperty(container, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true, configurable: true });

    let scrolledToUnread = false;
    global.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
      scrolledToUnread = true;
    };

    const widget = createWidget('#dlg', bus);
    widget.boot();

    const msg = { id: 10, text: 'new message' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise((r) => setTimeout(r, 10));

    const button = document.querySelector('[data-js="dialog-new-messages"]');
    assert.ok(button);
    assert.ok(!button.classList.contains('dialog__new-messages--hidden'));

    assert.strictEqual(button.textContent.trim(), 'Есть новые сообщения');

    button.click();
    assert.ok(scrolledToUnread);
    assert.ok(button.classList.contains('dialog__new-messages--hidden'));

    widget.dispose();
    delete global.window;
    delete global.document;
  });

  it('shows a button even when user is near bottom in strict button mode', async () => {
    setupDom();
    const bus = new MockBus();
    const container = document.getElementById('dlg');

    Object.defineProperty(container, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 600, configurable: true });
    Object.defineProperty(container, 'scrollTop', {
      value: 490,
      writable: true,
      configurable: true,
    });

    const widget = createWidget('#dlg', bus);
    widget.boot();

    const msg = { id: 11, text: 'at bottom' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise((r) => setTimeout(r, 10));

    assert.strictEqual(container.scrollTop, 490);
    const button = document.querySelector('[data-js="dialog-new-messages"]');
    assert.ok(!button.classList.contains('dialog__new-messages--hidden'));
    assert.strictEqual(button.textContent.trim(), 'Есть новые сообщения');

    widget.dispose();
    delete global.window;
    delete global.document;
  });
  it('keeps history replay pinned to bottom without unread indicator', async () => {
    setupDom();
    const bus = new MockBus();
    const container = document.getElementById('dlg');

    Object.defineProperty(container, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 900, configurable: true });
    Object.defineProperty(container, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });

    const widget = createWidget('#dlg', bus);
    widget.boot();

    const msg = { id: 12, text: 'history replay', replay: true };
    bus.emit({ type: EVENT_MESSAGE_READY, replay: true, ...msg, message: msg });
    await new Promise((r) => setTimeout(r, 10));

    const button = document.querySelector('[data-js="dialog-new-messages"]');
    assert.strictEqual(container.scrollTop, 900);
    assert.ok(button.classList.contains('dialog__new-messages--hidden'));

    widget.dispose();
    delete global.window;
    delete global.document;
  });

  it('anchors the first unread message to the top when multiple new messages arrive', async () => {
    setupDom();
    const bus = new MockBus();
    const container = document.getElementById('dlg');

    Object.defineProperty(container, 'clientHeight', { value: 100, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 900, configurable: true });
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true, configurable: true });

    const scrollCalls = [];
    global.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView(options) {
      scrollCalls.push({ id: this.dataset.dialogMessageId, options });
    };

    const widget = createWidget('#dlg', bus);
    widget.boot();

    const firstMsg = { id: 21, text: 'first unread' };
    const secondMsg = { id: 22, text: 'second unread' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...firstMsg, message: firstMsg });
    bus.emit({ type: EVENT_MESSAGE_READY, ...secondMsg, message: secondMsg });
    await new Promise((r) => setTimeout(r, 10));

    const button = document.querySelector('[data-js="dialog-new-messages"]');
    button.click();

    assert.deepStrictEqual(scrollCalls, [
      {
        id: '21',
        options: { behavior: 'smooth', block: 'start' },
      },
    ]);

    widget.dispose();
    delete global.window;
    delete global.document;
  });

});
