import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import { QUEST_ITEM_OVERLAY_READY, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';

describe('camera quest overlay', () => {
  it('composes layer, posts to chat and disables camera', async () => {
    const events = [];
    const bus = {
      handlers: [],
      subscribe(fn) { this.handlers.push(fn); },
      unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); },
      emit(evt) { events.push(evt); this.handlers.forEach(h => h(evt)); }
    };
    const dom = new JSDOM('<div id="dlg"></div><div class="panel__mask"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    const canvasFactory = {
      create() {
        const ctx = {
          fillStyle: '',
          fillRect() {},
          drawImage() {},
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
    const tpl = { render: async (_n, d) => `${d.avatarBlock || ''}${d.imageBlock || ''}${d.content || ''}` };
    const lang = { applyLanguage() {} };
    const repo = new MediaRepository();
    const dialog = new DialogWidget(document.getElementById('dlg'), tpl, lang, bus, repo);
    dialog.boot();

    const composeArgs = [];
    const canvasStub = {
      width: 10,
      height: 10,
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
    const buttonStateService = {
      calls: [],
      setScreenState(screen, action, active) { this.calls.push({ screen, action, active }); }
    };
    const cameraService = { takeSelfie: async () => new Blob() };
    const dualityManager = { completeQuestCalled: false, completeQuest() { this.completeQuestCalled = true; } };
    const manager = new CameraOrchestratorService(
      cameraService,
      { detectTarget: async () => ({ ok: true }) },
      { error() {} },
      null,
      dualityManager,
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

      let loadCalled = false;
      manager._loadImage = async () => { loadCalled = true; return { width: 1, height: 1 }; };
      await manager.captureOverlay(
        { x: 0, y: 0, width: 10, height: 10, background: { color: '#ff0000', width: 10, height: 10 } },
        null,
        { x: 0, y: 0, width: 10, height: 10 },
        { polygon: [] }
      );
      await new Promise(r => setTimeout(r, 0));
      const img = document.querySelector('.dialog__image');
      assert.ok(img);
      assert.strictEqual(loadCalled, false);
      assert.strictEqual(composeArgs[0][1].getContext('2d').fillStyle, '#ff0000');
      assert.strictEqual(buttonStateService.calls[0].screen, 'main');
      assert.strictEqual(buttonStateService.calls[0].action, 'toggle-camera');
      assert.strictEqual(buttonStateService.calls[0].active, false);
      assert.ok(events.find(e => e.type === QUEST_ITEM_OVERLAY_READY));
      assert.ok(events.find(e => e.type === EVENT_MESSAGE_READY));
      assert.ok(dualityManager.completeQuestCalled);
      assert.deepStrictEqual(composeArgs[0][2], {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        srcX: 0,
        srcY: 0,
        srcWidth: 10,
        srcHeight: 10
      });
      assert.ok(composeArgs[0][3]);
      delete global.window;
      delete global.document;
  });
});
