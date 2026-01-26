import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY, DIALOG_CLEAR } from '../../src/core/events/constants.js';

class MockBus {
  constructor() { this.subs = []; }
  subscribe(fn) { this.subs.push(fn); }
  unsubscribe(fn) { this.subs = this.subs.filter(f => f !== fn); }
  emit(evt) { this.subs.slice().forEach(fn => fn(evt)); }
}

describe('DialogWidget order and deduplication', () => {
  it('sorts by order and skips duplicate fingerprints', async () => {
    const dom = new JSDOM('<div id="dlg"></div><div id="scroll"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const tpl = { render: async (_, d) => `<div class="msg" data-id="${d.id}">${d.text}</div>` };
    const lang = { applyLanguage() {} };
    const bus = new MockBus();
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.batchSize = 10;
    widget.boot();

    const history = [
      { id: 1, order: 1, fingerprint: 'a', text: 'h1', timestamp: 1 },
      { id: 2, order: 2, fingerprint: 'b', text: 'h2', timestamp: 2 },
      { id: 3, order: 3, fingerprint: 'c', text: 'h3', timestamp: 3 }
    ];
    history.forEach(m => bus.emit({ type: EVENT_MESSAGE_READY, ...m, message: m }));
    await new Promise(r => setTimeout(r, 0));

    const live = [
      { id: 4, order: 4, fingerprint: 'd', text: 'n1', timestamp: 4 },
      { id: 5, order: 5, fingerprint: 'b', text: 'dup', timestamp: 5 },
      { id: 6, order: 6, fingerprint: 'e', text: 'n2', timestamp: 5 }
    ];
    live.forEach(m => bus.emit({ type: EVENT_MESSAGE_READY, ...m, message: m }));
    await new Promise(r => setTimeout(r, 0));

    const texts = widget.messages.map(m => m.text);
    assert.strictEqual(texts.length, 5);
    assert.deepStrictEqual(texts, ['h1', 'h2', 'h3', 'n1', 'n2']);

    bus.emit({ type: DIALOG_CLEAR });
    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
