import assert from 'assert';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/runtime-events/adapters/event-bus-adapter.js';
import ModalWidget from '../../../src/app-shell/overlays/presentation/modal-widget.js';
import { MODAL_SHOW, MODAL_HIDE } from '../../../src/runtime-events/domain/constants.js';

describe('ModalWidget', () => {
  it('mounts and removes modal element', () => {
    const dom = new JSDOM('<body></body>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new EventBusAdapter();
    const lang = { applyLanguage() {} };
    const widget = new ModalWidget(document.body, bus, lang);
    widget.boot();
    const canvas = document.createElement('canvas');
    bus.emit({ type: MODAL_SHOW, node: canvas });
    let modal = document.querySelector('.modal');
    assert.ok(modal && modal.querySelector('canvas'));
    bus.emit({ type: MODAL_HIDE });
    modal = document.querySelector('.modal');
    assert.strictEqual(modal, null);
    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
