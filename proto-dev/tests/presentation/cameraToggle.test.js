import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../src/application/services/ViewService.js';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';

describe('camera toggle stream cleanup', () => {
  it('stops stream and removes video when closing camera', async () => {
    const dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new EventBusAdapter();

    let streamStopped = false;
    let managerStopped = false;
    const cameraService = {
      async startStream(container) {
        const video = document.createElement('video');
        video.className = 'camera__stream';
        container.appendChild(video);
      },
      stopStream() {
        streamStopped = true;
        document.querySelector('video')?.remove();
      },
      takeSelfie: async () => new Blob()
    };

    const cameraSectionManager = {
      cameraService,
      start() {},
      stop() { managerStopped = true; }
    };

    const templateService = {
      async renderSection(target, screen) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        if (screen === 'camera') {
          el.innerHTML = '<div data-js="camera-view"></div>';
        } else {
          el.innerHTML = '<div></div>';
        }
      }
    };

    const stub = {};
    const buttonStateService = { getStatesForScreen: () => ({}), setScreenState() {}, isActive() { return true; } };
    const panelService = { load: async () => {} };
    const logger = { error() {} };
    bus.subscribe(evt => {
      if (evt.type === 'CAMERA_VIEW_OPENED') {
        cameraService.startStream(evt.container);
      }
    });
    const languageManager = { applyLanguage() {}, async translate(key) { return key; } };
    const view = new ViewService(
      templateService,
      panelService,
      languageManager,
      stub,
      stub,
      stub,
      { getPostsForCurrent: async () => [] },
      stub,
      cameraService,
      cameraSectionManager,
      stub,
      { error() {} },
      stub,
      buttonStateService,
      { getRequirement() { return null; } },
      bus
    );
    view.boot();
    const presenter = new GlobalViewPresenter(
      templateService,
      panelService,
      languageManager,
      bus,
      null,
      logger
    );
    presenter.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    await new Promise(r => setTimeout(r, 0));
    assert.ok(document.querySelector('video'));

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await new Promise(r => setTimeout(r, 0));
    assert.strictEqual(document.querySelector('video'), null);
    assert.ok(streamStopped);
    assert.ok(managerStopped);

    presenter.dispose();
    delete global.window;
    delete global.document;
  });
});

