import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';

class MockBus {
  constructor() { this.handlers = []; }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) { this.handlers.slice().forEach(h => h(evt)); }
}

describe('CameraOrchestratorService overlay dedup', () => {
  it('renders only one image for duplicate captures', async () => {
    const dom = new JSDOM('<div id="dlg"></div><div class="panel__mask"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    const bus = new MockBus();
    const tpl = { render: async (_name, data) => `${data.avatarBlock || ''}${data.imageBlock || ''}${data.content || ''}` };
    const lang = { applyLanguage() {} };
    const repo = new MediaRepository();
    const widget = new DialogWidget('#dlg', tpl, lang, bus, repo);
    widget.boot();

    const canvasStub = {
      width: 1,
      height: 1,
      toDataURL: () => 'data:image/png;base64,',
      toBlob: cb => cb(new Blob(['f'])),
      getContext: () => ({ drawImage() {}, fillRect() {}, getImageData: () => ({ data: new Uint8ClampedArray(4) }) })
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
    const manager = new CameraOrchestratorService(
      cameraService,
      { detectTarget: async () => ({ ok: true }) },
      { error() {} },
      null,
      {},
      null,
      bus,
      buttonStateService,
      null,
      overlayService,
      null,
      null,
      {},
      repo,
      canvasFactory
    );

    const ts = 12345;
    const origNow = Date.now;
    Date.now = () => ts;
    await manager.captureOverlay(
      { x:0,y:0,width:1,height:1, background:{width:1,height:1} },
      '',
      {x:0,y:0,width:1,height:1},
      { polygon: [] }
    );
    await manager.captureOverlay(
      { x:0,y:0,width:1,height:1, background:{width:1,height:1} },
      '',
      {x:0,y:0,width:1,height:1},
      { polygon: [] }
    );
    Date.now = origNow;

    const images = document.querySelectorAll('.dialog__image');
    assert.strictEqual(images.length, 1);

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
