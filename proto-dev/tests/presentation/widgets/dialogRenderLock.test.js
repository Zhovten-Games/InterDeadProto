import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class MockBus {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) { this.subscribers.slice().forEach(fn => fn(evt)); }
}

describe('DialogWidget render locking', () => {
  it('renders only once when events arrive concurrently', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = {
      render: async (_, d) => {
        await new Promise(r => setTimeout(r, 5));
        return `<li>${d.text}</li>`;
      }
    };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg = { fingerprint: 'a', text: 'hello' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });

    await widget._renderLock;

    const items = dom.window.document.querySelectorAll('li');
    assert.strictEqual(items.length, 1);

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});

