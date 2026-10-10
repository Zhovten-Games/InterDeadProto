import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogWidget from '../../src/messenger/presentation/dialog-widget.js';
import { DIALOG_CLEAR, EVENT_MESSAGE_READY } from '../../src/runtime-events/domain/constants.js';
import { deferred, flush } from '../../../constitutional-guard/driver-tools.mjs';

// Simple event bus for widget tests
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
    this.subscribers.slice().forEach((f) => f(evt));
  }
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
    bus.emit({ ...msg, type: EVENT_MESSAGE_READY, message: msg });
    await new Promise((r) => setTimeout(r, 0));
    assert.ok(container.innerHTML.includes('new'));

    delete global.window;
    delete global.document;
  });
});

describe('DialogWidget asynchronous history replacement', () => {
  let dom, widget;
  afterEach(() => {
    widget?.dispose();
    dom?.window.close();
    delete global.window;
    delete global.document;
  });
  for (const transition of ['A to B', 'A to B to A', 'dispose and remount']) {
    it(`keeps the final visible snapshot when ${transition} interrupts a live animation`, async () => {
      dom = new JSDOM('<ul id="dialog"></ul>');
      global.window = dom.window;
      global.document = dom.window.document;
      const waiting = deferred();
      const entered = deferred();
      const language = {
        async translate(text) {
          if (text === 'live-A') {
            entered.resolve();
            await waiting.promise;
          }
          return text;
        },
        applyLanguage() {},
      };
      const bus = new MockBus();
      widget = new DialogWidget(
        '#dialog',
        { render: async (_, data) => `<li>${data.text}</li>` },
        language,
        bus,
      );
      widget.boot();
      await widget.replaceMessages({ ghost: 'A', revision: 1, messages: [] });
      bus.emit({
        type: EVENT_MESSAGE_READY,
        message: { author: 'ghost', text: 'live-A', fingerprint: 'A:live', sequence: 1 },
      });
      await entered.promise;
      if (transition === 'dispose and remount') {
        widget.dispose();
        widget.boot();
      }
      const intermediate = widget.replaceMessages({
        ghost: 'B',
        revision: 2,
        messages: [{ author: 'ghost', text: 'saved-B', fingerprint: 'B:saved', sequence: 1 }],
      });
      const final =
        transition === 'A to B to A'
          ? widget.replaceMessages({
              ghost: 'A',
              revision: 3,
              messages: [{ author: 'ghost', text: 'saved-A', fingerprint: 'A:saved', sequence: 1 }],
            })
          : intermediate;
      // Replacement is actionable even while the abandoned animation is pending.
      await final;
      waiting.resolve();
      await intermediate;
      await flush();
      const expected = transition === 'A to B to A' ? 'A:saved' : 'B:saved';
      assert.deepEqual(
        [...document.querySelectorAll('[data-fingerprint]')].map(
          (node) => node.dataset.fingerprint,
        ),
        [expected],
      );
    });
  }
  it('renders every live occurrence accepted while a previous message is animating', async () => {
    dom = new JSDOM('<ul id="dialog"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const waiting = deferred();
    const entered = deferred();
    const language = {
      async translate(text) {
        if (text === 'first') {
          entered.resolve();
          await waiting.promise;
        }
        return text;
      },
      applyLanguage() {},
    };
    const bus = new MockBus();
    widget = new DialogWidget(
      '#dialog',
      { render: async (_, data) => `<li>${data.text}</li>` },
      language,
      bus,
    );
    widget.boot();
    bus.emit({
      type: EVENT_MESSAGE_READY,
      message: { text: 'first', fingerprint: '1', sequence: 1 },
    });
    await entered.promise;
    for (const sequence of [2, 3, 4])
      bus.emit({
        type: EVENT_MESSAGE_READY,
        message: { text: String(sequence), fingerprint: String(sequence), sequence },
      });
    waiting.resolve();
    await widget.renderLatest();
    assert.deepEqual(
      [...document.querySelectorAll('[data-fingerprint]')].map((node) => node.dataset.fingerprint),
      ['1', '2', '3', '4'],
    );
  });
});
