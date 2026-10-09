import { ImmediateImage } from '../../fixtures/dom-image.js';
import assert from 'assert';
import { JSDOM } from 'jsdom';
import ModalService from '../../../src/app-shell/overlays/modal-service.js';
import EventBusAdapter from '../../../src/runtime-events/adapters/event-bus-adapter.js';
import {
  MODAL_SHOW,
  MODAL_HIDE,
  OVERLAY_SHOW,
} from '../../../src/runtime-events/domain/constants.js';

describe('ModalService', () => {
  let bus;

  beforeEach(() => {
    bus = new EventBusAdapter();
  });

  it('emits show and hide events', () => {
    const dom = new JSDOM('');
    global.window = dom.window;
    global.document = dom.window.document;
    const events = [];
    bus.subscribe((evt) => events.push(evt));
    const svc = new ModalService(bus);
    svc.show(document.createElement('div'));
    svc.hide();
    assert.strictEqual(events[0].type, MODAL_SHOW);
    assert.strictEqual(events[1].type, MODAL_HIDE);
    delete global.window;
    delete global.document;
  });

  it('responds to OVERLAY_SHOW with image', (done) => {
    const dom = new JSDOM('');
    global.window = dom.window;
    global.document = dom.window.document;
    global.Image = ImmediateImage;
    const svc = new ModalService(bus);
    svc.boot();
    bus.subscribe((evt) => {
      if (evt.type === MODAL_SHOW) {
        assert.ok(evt.node);
        svc.dispose();
        delete global.window;
        delete global.document;
        delete global.Image;
        done();
      }
    });
    bus.emit({ type: OVERLAY_SHOW, src: 'data:image/png;base64,AAA' });
  });
});
