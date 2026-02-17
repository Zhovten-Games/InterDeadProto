import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';

class MockBus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter(h => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach(h => h(evt));
  }
}

describe('CameraOrchestratorService overlay order', () => {
  it('emits image message after previous dialog entry', async () => {
    const dom = new JSDOM('<div class="panel__mask"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const origObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = () => 'blob:';

    const events = [];
    const bus = new MockBus();
    bus.subscribe(e => events.push(e));

    const canvasStub = {
      width: 1,
      height: 1,
      toDataURL: () => 'data:image/png;base64,',
      toBlob: cb => cb(new Blob(['f'])),
      getContext: () => ({
        drawImage() {},
        fillRect() {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) })
      })
    };
    const overlayService = { compose: async () => canvasStub };
    const canvasFactory = {
      create() {
        const ctx = {
          drawImage() {},
          fillRect() {},
          getImageData: () => ({ data: new Uint8ClampedArray(4) })
        };
        return {
          width: 0,
          height: 0,
          getContext: () => ctx,
          toBlob: cb => cb(new Blob(['t'])),
          toDataURL: () => 'data:image/png;base64,'
        };
      }
    };

    const buttonStateService = { setScreenState() {} };
    const cameraService = { takeSelfie: async () => new Blob() };
    const avatarService = { getUserAvatar: async () => '' };
    const imageComposer = {};
    const repo = new MediaRepository();

    const dialog = { messages: [{ id: 0, order: 1 }], index: 1 };
    const dialogManager = { dialog };

    const manager = new CameraOrchestratorService(
      cameraService,
      { detectTarget: async () => ({ ok: true }) },
      { error() {}, info() {} },
      null,
      null,
      dialogManager,
      bus,
      buttonStateService,
      null,
      overlayService,
      avatarService,
      null,
      imageComposer,
      repo,
      canvasFactory
    );

    await manager.captureOverlay(
      { x: 0, y: 0, width: 1, height: 1, background: { width: 1, height: 1 } },
      '',
      null,
      { x: 0, y: 0, width: 1, height: 1 },
      { polygon: [] }
    );

    const evt = events.find(e => e.type === EVENT_MESSAGE_READY);
    assert.ok(evt, 'EVENT_MESSAGE_READY emitted');
    assert.strictEqual(dialog.messages.length, 2);
    assert.strictEqual(dialog.messages[1].order, 2);
    assert.strictEqual(evt.order, 2);

    global.URL.createObjectURL = origObjectURL;
    delete global.window;
    delete global.document;
  });
});

