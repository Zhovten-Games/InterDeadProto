import assert from 'assert';
import { JSDOM } from 'jsdom';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import { APP_RESET_COMPLETED } from '../../src/core/events/constants.js';

class StubBus {
  constructor() {
    this.handlers = [];
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(evt) {
    this.handlers.slice().forEach(handler => handler(evt));
  }
}

describe('GlobalViewPresenter reset handling', () => {
  let dom;
  let bus;
  let presenter;
  let templateService;
  let panelService;
  let languageManager;

  beforeEach(() => {
    dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    bus = new StubBus();
    templateService = { renderSection: async () => {}, render: async () => '' };
    panelService = { load: async () => {} };
    languageManager = { applyLanguage() {}, translate: async key => key };
    presenter = new GlobalViewPresenter(
      templateService,
      panelService,
      languageManager,
      bus,
      null,
      { error() {} }
    );
    presenter.boot();
  });

  afterEach(() => {
    presenter.dispose();
    delete global.window;
    delete global.document;
  });

  it('disposes widgets and clears preview when reset completes', () => {
    const container = document.createElement('div');
    container.setAttribute('data-js', 'camera-widget');
    const preview = document.createElement('img');
    preview.setAttribute('data-js', 'selfie-preview');
    preview.src = 'blob:foo';
    preview.hidden = false;
    container.appendChild(preview);
    const camView = document.createElement('div');
    camView.setAttribute('data-js', 'camera-view');
    camView.hidden = true;
    container.appendChild(camView);
    document.body.appendChild(container);

    let cameraDisposed = false;
    let dialogDisposed = false;
    let revokeCalled = false;
    presenter.cameraUi = { container, dispose: () => { cameraDisposed = true; } };
    presenter.dialogWidget = { dispose: () => { dialogDisposed = true; } };
    presenter._previewRevoke = () => { revokeCalled = true; };
    presenter.currentScreen = 'camera';

    bus.emit({ type: APP_RESET_COMPLETED });

    assert.strictEqual(cameraDisposed, true, 'camera widget disposed');
    assert.strictEqual(dialogDisposed, true, 'dialog widget disposed');
    assert.strictEqual(revokeCalled, true, 'preview URL revoked');
    assert.strictEqual(preview.hidden, true, 'preview hidden after reset');
    assert.strictEqual(preview.src, '', 'preview src cleared');
    assert.strictEqual(camView.hidden, false, 'camera view shown again');
    assert.strictEqual(presenter.currentScreen, null, 'current screen cleared');
  });
});
