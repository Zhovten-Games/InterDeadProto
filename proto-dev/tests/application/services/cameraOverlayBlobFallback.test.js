import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

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

describe('CameraOrchestratorService blob fallback', () => {
  it('uses dataURL when toBlob fails and emits thumbnail', async () => {
    const dom = new JSDOM('<div class="panel__mask"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const errors = [];
    const logger = { error: msg => errors.push(msg), info() {} };

    const canvasStub = {
      width: 1,
      height: 1,
      toDataURL: () => 'data:image/png;base64,AAAA',
      toBlob: cb => cb(null),
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
          width: 64,
          height: 64,
          getContext: () => ctx,
          toBlob: cb => cb(null),
          toDataURL: () => 'data:image/png;base64,BBBB'
        };
      }
    };

    const events = [];
    const bus = new MockBus();
    bus.subscribe(e => events.push(e));

    const repo = {
      async save({ full, thumb }) {
        assert.ok(full instanceof Blob);
        assert.ok(thumb instanceof Blob);
        return 1;
      },
      async get() {
        return { thumbKey: 't' };
      },
      async getObjectURL() {
        return null;
      }
    };

    const cameraService = { takeSelfie: async () => new Blob() };
    const avatarService = { getUserAvatar: async () => '' };

    const manager = new CameraOrchestratorService(
      cameraService,
      { detectTarget: async () => ({ ok: true }) },
      logger,
      null,
      null,
      { dialog: { messages: [], index: 0 } },
      bus,
      { setScreenState() {} },
      null,
      overlayService,
      avatarService,
      null,
      {},
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
    assert.ok(evt.src && evt.src.startsWith('data:image/png'), 'src defined');
    assert.ok(errors.length > 0, 'logger captured error');

    delete global.window;
    delete global.document;
  });
});
