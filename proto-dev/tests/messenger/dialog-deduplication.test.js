import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/messenger/presentation/dialog-widget.js';
import { EVENT_MESSAGE_READY } from '../../src/runtime-events/domain/constants.js';

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

describe('DialogWidget deduplication', () => {
  it('skips messages with duplicate fingerprints', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li data-id="${d.id}">${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    let msg = { fingerprint: 'a', text: 'hello' };
    bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
    await new Promise((r) => setTimeout(r, 0));
    msg = { fingerprint: 'a', text: 'hello again' };
    bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
    await new Promise((r) => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 1);

    delete global.window;
    delete global.document;
  });

  it('preserves distinct fingerprints even when legacy ids repeat', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li data-id="${d.id}">${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    let msg = { id: 1, fingerprint: 'a', text: 'hello' };
    bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
    await new Promise((r) => setTimeout(r, 0));
    msg = { id: 1, fingerprint: 'b', text: 'hello again' };
    bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
    await new Promise((r) => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 2);

    delete global.window;
    delete global.document;
  });

  it('preserves legitimate equal text with distinct occurrence fingerprints', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li>${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg1 = { fingerprint: 'a1', text: 'hey', ghost: 'g', author: 'ghost' };
    bus.emit({ ...msg1, type: EVENT_MESSAGE_READY, message: msg1 });
    await new Promise((r) => setTimeout(r, 0));
    const msg2 = { fingerprint: 'b2', text: 'hey', ghost: 'g', author: 'ghost' };
    bus.emit({ ...msg2, type: EVENT_MESSAGE_READY, message: msg2 });
    await new Promise((r) => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 2);

    widget.dispose();
    delete global.window;
    delete global.document;
  });

  it('does not dedupe identical text from different ghosts', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li>${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg1 = { fingerprint: 'a1', text: 'hey', ghost: 'g1', author: 'ghost' };
    bus.emit({ ...msg1, type: EVENT_MESSAGE_READY, message: msg1 });
    await new Promise((r) => setTimeout(r, 0));
    const msg2 = { fingerprint: 'b2', text: 'hey', ghost: 'g2', author: 'ghost' };
    bus.emit({ ...msg2, type: EVENT_MESSAGE_READY, message: msg2 });
    await new Promise((r) => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 2);

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
