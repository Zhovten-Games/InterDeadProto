import assert from 'assert';
import { JSDOM } from 'jsdom';
const createBus = () => {
  const handlers = new Set();
  return {
    handlers,
    subscribe(fn) {
      handlers.add(fn);
    },
    unsubscribe(fn) {
      handlers.delete(fn);
    },
    emit(evt) {
      handlers.forEach(handler => handler(evt));
    }
  };
};
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';

class MockTemplate {
  async render() { return ''; }
}

describe('DialogWidget boot lifecycle', () => {
  let dom;
  let container;
  let scrollContainer;
  let widget;
  let bus;

  beforeEach(() => {
    dom = new JSDOM('<div id="wrap"><ul id="dlg"></ul></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    container = document.getElementById('dlg');
    scrollContainer = container.parentElement;
    bus = createBus();
  });

  afterEach(() => {
    widget?.dispose();
    delete global.window;
    delete global.document;
  });

  it('attaches handlers only once on repeated boot', () => {
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    widget = new DialogWidget(container, tpl, lang, bus);

    let addCount = 0;
    const origAdd = scrollContainer.addEventListener;
    scrollContainer.addEventListener = function(type, listener, options) {
      addCount++;
      return origAdd.call(this, type, listener, options);
    };

    widget.boot();
    widget.boot();

    assert.strictEqual(bus.handlers.size, 1);
    assert.strictEqual(addCount, 1);
  });

  it('dispose removes handlers and allows re-boot', () => {
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    widget = new DialogWidget(container, tpl, lang, bus);

    let addCount = 0;
    let removeCount = 0;
    const origAdd = scrollContainer.addEventListener;
    const origRemove = scrollContainer.removeEventListener;
    scrollContainer.addEventListener = function(type, listener, options) {
      addCount++;
      return origAdd.call(this, type, listener, options);
    };
    scrollContainer.removeEventListener = function(type, listener, options) {
      removeCount++;
      return origRemove.call(this, type, listener, options);
    };

    widget.boot();
    widget.dispose();

    assert.strictEqual(bus.handlers.size, 0);
    assert.strictEqual(removeCount, 1);

    widget.boot();
    assert.strictEqual(bus.handlers.size, 1);
    assert.strictEqual(addCount, 2);
  });
});
