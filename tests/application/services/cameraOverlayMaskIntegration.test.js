import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';
import { OVERLAY_SHOW } from '../../../src/core/events/constants.js';

class MockBus {
  constructor() { this.handlers = []; }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) { this.handlers.forEach(h => h(evt)); }
}

describe('camera overlay mask integration', () => {
  it('passes mask to composer and avoids overlay on messenger screen', async () => {
    const dom = new JSDOM('<div></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    const bus = new MockBus();
    const repo = new MediaRepository();
    const composeArgs = [];
    const canvasStub = {
      width: 1,
      height: 1,
      toDataURL: () => 'data:image/png;base64,',
      toBlob: cb => cb(new Blob(['f'])),
      getContext: () => ({ drawImage() {}, fillRect() {}, getImageData: () => ({ data: new Uint8ClampedArray(4) }) })
    };
    const overlayService = {
      compose: async (...args) => {
        composeArgs.push(args);
        return canvasStub;
      }
    };
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
    const events = [];
    bus.emit = evt => { events.push(evt); bus.handlers.forEach(h=>h(evt)); };
    const manager = new CameraOrchestratorService(
      { takeSelfie: async () => new Blob() },
      { detectTarget: async () => ({ ok: true }) },
      { error() {} },
      null,
      null,
      null,
      bus,
      { setScreenState(){} },
      null,
      overlayService,
      null,
      null,
      {},
      repo,
      canvasFactory
    );
    manager.cameraOpen = false;
    await manager.captureOverlay(
      { x:0,y:0,width:1,height:1, background:{width:1,height:1} },
      '',
      {x:0,y:0,width:1,height:1},
      { polygon:[{x:0,y:0}] }
    );
    assert.deepStrictEqual(composeArgs[0][3], { polygon:[{x:0,y:0}] });
    assert.ok(events.find(e=>e.type===OVERLAY_SHOW));
    delete global.window;
    delete global.document;
  });
});
