import assert from 'assert';
import { JSDOM } from 'jsdom';
import MediaLightbox from '../../src/presentation/components/MediaLightbox.js';
import MediaRepository from '../../src/infrastructure/repositories/MediaRepository.js';
import { MEDIA_OPEN } from '../../src/core/events/constants.js';

class MockBus {
  constructor() { this.handlers = []; }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) { this.handlers.slice().forEach(h => h(evt)); }
}

describe('MediaLightbox', () => {
  it('delegates full media to modal service when thumbnail is clicked', async () => {
    const dom = new JSDOM('<div></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const origCreate = global.URL.createObjectURL;
    const origRevoke = global.URL.revokeObjectURL;
    global.URL.createObjectURL = () => 'blob:full';
    global.URL.revokeObjectURL = () => {};

    const bus = new MockBus();
    const repo = new MediaRepository();
    const modalInvocations = [];
    const modalService = {
      showFromDataURL: (url, revoke) => modalInvocations.push({ url, revoke })
    };

    const id = await repo.save({ thumb: new Blob(['t']), full: new Blob(['f']) }, {});
    const lightbox = new MediaLightbox(repo, modalService, bus);
    lightbox.boot();

    bus.emit({ type: MEDIA_OPEN, mediaId: id });
    await new Promise(r => setTimeout(r, 0));

    assert.strictEqual(modalInvocations.length, 1);
    assert.strictEqual(modalInvocations[0].url, 'blob:full');
    assert.strictEqual(typeof modalInvocations[0].revoke, 'function');

    modalInvocations[0].revoke?.();
    lightbox.dispose();
    global.URL.createObjectURL = origCreate;
    global.URL.revokeObjectURL = origRevoke;
    delete global.window;
    delete global.document;
  });
});
