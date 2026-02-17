import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../src/application/services/ViewService.js';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

describe('ViewAdapter camera cleanup', () => {
  let dom;
  let bus;
  let gumCalls;
  let tracksStopped;
  beforeEach(() => {
    gumCalls = 0;
    tracksStopped = 0;
    dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    const mediaDevices = {
      getUserMedia: async () => {
        gumCalls++;
        return { getTracks: () => [{ stop: () => tracksStopped++ }] };
      }
    };
    Object.defineProperty(global, 'navigator', { value: { mediaDevices }, configurable: true });
    bus = new EventBusAdapter();
  });
  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.navigator;
  });

  it('stops detection and camera stream after finish', async () => {
    let interval;
    const cameraSectionManager = {
      stop() { clearInterval(interval); },
      stopDetection() { clearInterval(interval); },
      start(_el, cfg) {
        interval = setInterval(() => {
          clearInterval(interval);
          cfg.onDetected('person', new Blob(), { top: 0, left: 0, width: 10, height: 10 }, null);
        }, 10);
      },
      markCaptured() {},
      stateService: { setPresence() {} }
    };

    const templateService = {
      async renderSection(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (el) {
          el.innerHTML = '<div data-js="camera-widget"></div>';
        }
      },
      async render() { return ''; }
    };
    const panelService = { load: async () => {} };
    const langManager = { applyLanguage() {}, translate: async key => key };
    const profileRegService = { canProceed: () => true, saveProfile: async () => {}, setName() {} };
    const geoService = { getCurrentLocation: async () => null };
    const db = { loadUser: async () => null };
    const postsService = { getPostsForCurrent: async () => [] };
    const detectionService = {};
    const cameraService = {
      _stream: null,
      takeSelfie: async () => new Blob(),
      async startStream(container) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this._stream = stream;
        const video = document.createElement('video');
        video.className = 'camera__stream';
        video.autoplay = true;
        video.srcObject = stream;
        container.appendChild(video);
      },
      stopStream() {
        if (this._stream) {
          this._stream.getTracks().forEach(t => t.stop());
          this._stream = null;
        }
        const v = document.querySelector('video.camera__stream');
        v?.remove();
      }
    };
    const notificationManager = {};
    const logger = { error() {} };
    const persistence = { save() {}, load() {} };
    const buttonStateService = { setScreenState() {}, isActive() { return true; } };
    const dualityManager = { getRequirement() { return { type: 'object', target: 'person' }; } };
    bus.subscribe(evt => {
      if (evt.type === 'CAMERA_VIEW_OPENED') {
        cameraService.startStream(evt.container);
        cameraSectionManager.start(evt.container, evt.options);
      }
    });

    const view = new ViewService(
      templateService,
      panelService,
      langManager,
      profileRegService,
      geoService,
      db,
      postsService,
      detectionService,
      cameraService,
      cameraSectionManager,
      notificationManager,
      logger,
      persistence,
      buttonStateService,
      dualityManager,
      bus
    );
    view.boot();
    const presenter = new GlobalViewPresenter(
      templateService,
      panelService,
      langManager,
      bus,
      null,
      logger
    );
    presenter.boot();

    let detections = 0;
    bus.subscribe(evt => { if (evt.type === 'DETECTION_DONE') detections++; });

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'registration-camera' });
    await sleep(150);
    assert.ok(detections > 0);

    bus.emit({ type: 'finish' });
    await sleep(150);
    const after = detections;
    await sleep(150);
    assert.strictEqual(detections, after);
    assert.strictEqual(gumCalls, 1);
    assert.strictEqual(tracksStopped, 1);
    presenter.dispose();
  });
});

