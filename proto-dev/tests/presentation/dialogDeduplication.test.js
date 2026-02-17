import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY } from '../../src/core/events/constants.js';

class MockBus {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) { this.subscribers.slice().forEach(fn => fn(evt)); }
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
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));
    msg = { fingerprint: 'a', text: 'hello again' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 1);

    delete global.window;
    delete global.document;
  });

  it('skips messages with duplicate ids', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li data-id="${d.id}">${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    let msg = { id: 1, fingerprint: 'a', text: 'hello' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));
    msg = { id: 1, fingerprint: 'b', text: 'hello again' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 1);

    delete global.window;
    delete global.document;
  });

  it('dedupes by content when fingerprint changes', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li>${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg1 = { fingerprint: 'a1', text: 'hey', ghost: 'g', author: 'ghost' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg1, message: msg1 });
    await new Promise(r => setTimeout(r, 0));
    const msg2 = { fingerprint: 'b2', text: 'hey', ghost: 'g', author: 'ghost' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg2, message: msg2 });
    await new Promise(r => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 1);

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
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg1, message: msg1 });
    await new Promise(r => setTimeout(r, 0));
    const msg2 = { fingerprint: 'b2', text: 'hey', ghost: 'g2', author: 'ghost' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg2, message: msg2 });
    await new Promise(r => setTimeout(r, 0));

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 2);

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
