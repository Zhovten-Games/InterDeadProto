import { testSqlInitializer } from '../../fixtures/sql-initializer.js';
import { cameraPort } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/camera/application/camera-orchestrator-service.js';
import DialogWidget from '../../../src/messenger/presentation/dialog-widget.js';
import DialogHistoryService from '../../../src/messenger/history/dialog-history-service.js';
import DialogRepository from '../../../src/messenger/persistence/dialog-repository.js';
import DatabaseAdapter from '../../../src/storage/browser/database-adapter.js';
import MediaRepository from '../../../src/media/persistence/media-repository.js';

class MockBus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach((h) => h(evt));
  }
}

describe('camera overlay history replay', () => {
  it('replays captured image once from history', async () => {
    const dom = new JSDOM(
      '<div id="dlg1"></div><div id="dlg2"></div><div class="panel__mask"></div>',
    );
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    const bus = new MockBus();
    const tpl = {
      render: async (_n, d) => `${d.avatarBlock || ''}${d.imageBlock || ''}${d.content || ''}`,
    };
    const lang = { applyLanguage() {} };
    const repo = new MediaRepository();
    const widget = new DialogWidget('#dlg1', tpl, lang, bus, repo);
    widget.boot();

    const canvasStub = {
      width: 1,
      height: 1,
      toDataURL: () => 'data:image/png;base64,',
      toBlob: (cb) => cb(new Blob(['f'])),
      getContext: () => ({
        drawImage() {},
        fillRect() {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      }),
    };
    const overlayService = { compose: async () => canvasStub };
    const canvasFactory = {
      create() {
        const ctx = {
          drawImage() {},
          fillRect() {},
          getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        };
        return {
          width: 0,
          height: 0,
          getContext: () => ctx,
          toBlob: (cb) => cb(new Blob(['t'])),
          toDataURL: () => 'data:image/png;base64,',
        };
      },
    };
    const buttonStateService = { setScreenState() {} };
    const cameraService = { takeSelfie: async () => new Blob() };
    const manager = new CameraOrchestratorService(
      cameraPort(cameraService),
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
      canvasFactory,
    );

    await manager.open({});
    await manager.captureOverlay(
      { x: 0, y: 0, width: 1, height: 1, background: { width: 1, height: 1 } },
      '',
      { x: 0, y: 0, width: 1, height: 1 },
      { polygon: [] },
    );
    assert.strictEqual(widget.messages.length, 1);
    const savedId = widget.messages[0].media.id;

    const db = new DatabaseAdapter(':memory:', { error() {} }, testSqlInitializer, {
      save() {},
      load() {},
    });
    await db.boot();
    const dialogRepo = new DialogRepository(db);
    dialogRepo.ensureSchema();
    const history = new DialogHistoryService(dialogRepo);
    history.save('g1', widget.messages);

    const loaded = history.load('g1');
    const widget2 = new DialogWidget('#dlg2', tpl, lang, bus, repo);
    widget2.boot();
    widget2.messages = loaded;
    await widget2.renderLatest();
    const images = dom.window.document.querySelectorAll('#dlg2 .dialog__image');
    assert.strictEqual(images.length, 1);
    const img = images[0];
    assert.ok(img.getAttribute('src'));
    assert.strictEqual(img.dataset.mediaId, String(savedId));

    widget.dispose();
    widget2.dispose();
    delete global.window;
    delete global.document;
  });
});
