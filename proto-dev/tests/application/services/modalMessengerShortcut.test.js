import assert from 'assert';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/adapters/logging/EventBusAdapter.js';
import ModalService from '../../../src/application/services/ModalService.js';
import ModalWidget from '../../../src/presentation/widgets/Modal/index.js';

class ImmediateImage {
  constructor() {
    this._listeners = new Map();
    this.className = '';
    this.onload = null;
    this.onerror = null;
  }

  set src(value) {
    this._src = value;
    if (typeof this.onload === 'function') this.onload();
    const loadListener = this._listeners.get('load');
    if (typeof loadListener === 'function') loadListener();
  }

  get src() {
    return this._src;
  }

  addEventListener(event, handler) {
    this._listeners.set(event, handler);
  }

  removeEventListener(event) {
    this._listeners.delete(event);
  }
}

describe('ModalService messenger CTA overlay', () => {
  it('renders messenger button and navigates on click', async () => {
    const dom = new JSDOM('<body></body>');
    global.window = dom.window;
    global.document = dom.window.document;
    const originalImage = global.Image;
    global.Image = ImmediateImage;

    const bus = new EventBusAdapter();
    const modalService = new ModalService(bus);
    const modalWidget = new ModalWidget(document.body, bus);
    modalService.boot();
    modalWidget.boot();

    let navigated = null;
    bus.subscribe(evt => {
      if (evt.type === 'SCREEN_CHANGE') navigated = evt.screen;
    });

    let revoked = false;
    modalService.showFromDataURL('data:image/png;base64,AAA', () => {
      revoked = true;
    });
    await new Promise(r => setTimeout(r, 0));

    const button = document.querySelector('.modal__button[data-i18n="open_messenger"]');
    assert.ok(button, 'expected messenger shortcut button to render');
    button.click();
    await new Promise(r => setTimeout(r, 0));

    assert.strictEqual(navigated, 'messenger');
    assert.ok(revoked);
    assert.ok(!document.querySelector('.modal'));

    modalService.dispose();
    modalWidget.dispose();
    global.Image = originalImage;
    delete global.window;
    delete global.document;
  });
});
