import assert from 'assert';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/adapters/logging/EventBusAdapter.js';
import ModalWidget from '../../../src/presentation/widgets/Modal/index.js';
import { MODAL_SHOW, MODAL_HIDE } from '../../../src/core/events/constants.js';

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
