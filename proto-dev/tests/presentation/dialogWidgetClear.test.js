import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/presentation/widgets/Dialog/index.js';
import { DIALOG_CLEAR, EVENT_MESSAGE_READY } from '../../src/core/events/constants.js';

// Simple event bus for widget tests
class MockBus {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) { this.subscribers.slice().forEach(f => f(evt)); }
}

describe('DialogWidget clearing', () => {
  it('clears container on DIALOG_CLEAR', async () => {
    const dom = new JSDOM('<div id="dlg"><p>old</p></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const container = document.getElementById('dlg');
    const tpl = { render: async () => '<p>new</p>' };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget(container, tpl, lang, bus);
    widget.boot();

    bus.emit({ type: DIALOG_CLEAR });
    assert.strictEqual(container.innerHTML, '');

    const msg = { text: 'hello' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));
    assert.ok(container.innerHTML.includes('new'));

    delete global.window;
    delete global.document;
  });
});
