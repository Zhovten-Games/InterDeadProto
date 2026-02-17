// Verifies ChatScrollWidget reacts to scroll events using configurable step size.
import assert from 'assert';
import { JSDOM } from 'jsdom';
import ChatScrollWidget from '../../src/presentation/widgets/ChatScrollWidget.js';
import { CHAT_SCROLL_UP, CHAT_SCROLL_DOWN, CHAT_LOAD_OLDER } from '../../src/core/events/constants.js';
import config from '../../src/config/index.js';

class MockBus {
  constructor() { this.subscribers = []; this.events = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) { this.events.push(evt); this.subscribers.slice().forEach(fn => fn(evt)); }
}

describe('ChatScrollWidget', () => {
  it('scrolls container via events', () => {
    const dom = new JSDOM('<ul data-js="dialog-list"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const container = dom.window.document.querySelector('[data-js="dialog-list"]');
    container.scrollTop = 0;
    Object.defineProperties(container, {
      clientHeight: { value: 100, configurable: true },
      scrollHeight: { value: 150, configurable: true }
    });
    container.scrollBy = function(x, y) {
      this.scrollTop = this.scrollTop + y;
    };

    const bus = new MockBus();
    const originalStep = config.chatScrollStep;
    config.chatScrollStep = 50;
    const widget = new ChatScrollWidget('[data-js="dialog-list"]', bus);
    widget.boot();

    bus.emit({ type: CHAT_SCROLL_UP });
    assert.strictEqual(container.scrollTop, -config.chatScrollStep);
    const loadEvt = bus.events.find(e => e.type === CHAT_LOAD_OLDER);
    assert.ok(loadEvt);

    bus.events = [];
    bus.emit({ type: CHAT_SCROLL_DOWN });
    assert.strictEqual(container.scrollTop, 0);
    assert.ok(!bus.events.find(e => e.type === CHAT_LOAD_OLDER));

    widget.dispose();
    config.chatScrollStep = originalStep;
    delete global.window;
    delete global.document;
  });
});
