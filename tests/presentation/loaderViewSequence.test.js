import assert from 'assert';
import { JSDOM } from 'jsdom';
import LoaderView from '../../src/presentation/widgets/LoaderView.js';

class StubProvider {
  async getRandomName(key) {
    return `name:${key}`;
  }
}

class StubEffect {
  async play(element, text) {
    element.textContent = text;
  }
}

class MockBus {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
  emit(evt) { this.subscribers.slice().forEach(fn => fn(evt)); }
}

describe('LoaderView progress sequencing', () => {
  it('deduplicates steps and clears between runs', () => {
    const dom = new JSDOM('<div data-js="global-content"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new MockBus();
    const view = new LoaderView(bus, null, new StubProvider(), () => new StubEffect());
    view.boot();

    bus.emit({ type: 'OVERLAY_SHOW' });
    bus.emit({ type: 'OVERLAY_STEP', i18nKey: 'moduleA' });
    let items = document.querySelectorAll('.loader__list li');
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].dataset.loaderKey, 'moduleA');

    // Duplicate step should be ignored
    bus.emit({ type: 'OVERLAY_STEP', i18nKey: 'moduleA' });
    items = document.querySelectorAll('.loader__list li');
    assert.strictEqual(items.length, 1);

    // New step appends when unique
    bus.emit({ type: 'OVERLAY_STEP', i18nKey: 'moduleB' });
    items = document.querySelectorAll('.loader__list li');
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[1].dataset.loaderKey, 'moduleB');

    // Hide resets list
    bus.emit({ type: 'OVERLAY_HIDE' });
    items = document.querySelectorAll('.loader__list li');
    assert.strictEqual(items.length, 0);

    delete global.window;
    delete global.document;
  });
});
