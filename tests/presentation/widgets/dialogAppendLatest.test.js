import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class MockBus {
  constructor() { this.subscribers = []; this.logs = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) {
    if (evt.type === 'log') this.logs.push(evt.message);
    this.subscribers.slice().forEach(fn => fn(evt));
  }
}

describe('DialogWidget append-only rendering', () => {
  it('renders each new message once', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<li>${d.text}</li>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg0 = { id: 0, text: 'a' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg0, message: msg0 });
    await new Promise(r => setTimeout(r, 0));
    const msg1 = { id: 1, text: 'b' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg1, message: msg1 });
    await new Promise(r => setTimeout(r, 0));

    assert.deepStrictEqual(bus.logs, [
      'DialogWidget.renderLatest: rendering message 0 (new)',
      'DialogWidget.renderLatest: rendering message 1 (new)'
    ]);
    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 2);

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
