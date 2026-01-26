import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../../src/application/services/ViewService.js';

describe('capture validation', () => {
  it('retries when target missing', async () => {
    const dom = new JSDOM('<div data-js="detection-status"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    const detectionService = { detectTarget: async () => ({ ok: false }) };
    let resumed = false;
    const cameraSectionManager = {
      detectionService,
      resumeDetection() {
        this.stateService.resetCaptured();
        resumed = true;
      },
      captureOverlay: async () => {},
      markCaptured() {},
      stateService: { resetCapturedCalled: false, resetCaptured() { this.resetCapturedCalled = true; } }
    };
    const cameraService = { takeSelfie: async () => new Blob() };
    const bus = { emit() {}, subscribe() {}, unsubscribe() {} };
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async key => key },
      { saveProfile: async () => {}, canProceed: () => true },
      null,
      { loadUser: async () => ({}) },
      {},
      detectionService,
      cameraService,
      cameraSectionManager,
      null,
      { error() {} },
      { save() {}, load() {} },
      { setScreenState() {} },
      {
        getRequirement: () => ({ target: 'person' }),
        getQuest: () => ({ overlay: {} })
      },
      bus
    );
    view.currentScreen = 'camera';
    await view.handleCaptureEvents({ type: 'capture-btn' });
    assert.ok(resumed);
    assert.ok(cameraSectionManager.stateService.resetCapturedCalled);
    delete global.window;
    delete global.document;
  });

  it('handles absent quest target without falling back to person', async () => {
    const dom = new JSDOM('<div data-js="detection-status"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    let detectCalled = false;
    const detectionService = {
      detectTarget: async () => {
        detectCalled = true;
        return { ok: true };
      }
    };
    let resumed = false;
    const cameraSectionManager = {
      resumeDetection() {
        resumed = true;
      },
      captureOverlay: async () => {},
      markCaptured() {},
      stateService: { resetCaptured() {} }
    };
    const cameraService = { takeSelfie: async () => new Blob() };
    const statuses = [];
    const bus = {
      emit(evt) {
        if (evt.type === 'CAMERA_STATUS') statuses.push(evt.status);
      },
      subscribe() {},
      unsubscribe() {}
    };
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async key => key },
      { saveProfile: async () => {}, canProceed: () => true },
      null,
      { loadUser: async () => ({}) },
      {},
      detectionService,
      cameraService,
      cameraSectionManager,
      null,
      { error() {} },
      { save() {}, load() {} },
      { setScreenState() {} },
      { getRequirement: () => ({}) },
      bus
    );
    view.currentScreen = 'camera';
    await view.handleCaptureEvents({ type: 'capture-btn' });
    assert.strictEqual(detectCalled, false);
    assert.ok(resumed);
    assert.deepStrictEqual(statuses, ['checking', 'not_found']);
    delete global.window;
    delete global.document;
  });

  it('posts overlay when target found', async () => {
    const dom = new JSDOM('<div data-js="detection-status"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    global.URL.createObjectURL = () => 'blob:';
    const detectionService = {
      detectTarget: async () => ({ ok: true, box: { x: 0, y: 0, width: 1, height: 1 }, mask: { polygon: [] } })
    };
    let overlayCalled = false;
    const cameraSectionManager = {
      detectionService,
      resumeDetection() {},
      captureOverlay: async (coords, blob, box, mask) => {
        overlayCalled = !!blob && !!box && !!mask;
      },
      markCaptured() {},
      stateService: {}
    };
    const cameraService = { takeSelfie: async () => new Blob() };
    const bus = { emit() {}, subscribe() {}, unsubscribe() {} };
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async key => key },
      { saveProfile: async () => {}, canProceed: () => true },
      null,
      { loadUser: async () => ({}) },
      {},
      detectionService,
      cameraService,
      cameraSectionManager,
      null,
      { error() {} },
      { save() {}, load() {} },
      { setScreenState() {} },
      {
        getRequirement: () => ({ target: 'person' }),
        getQuest: () => ({ overlay: {} })
      },
      bus
    );
    view.currentScreen = 'camera';
    await view.handleCaptureEvents({ type: 'capture-btn' });
    assert.ok(overlayCalled);
    delete global.window;
    delete global.document;
  });

  it('uses stored detection without extra checks', async () => {
    global.window = new JSDOM().window;
    global.document = global.window.document;
    global.URL.createObjectURL = () => 'blob:';
    let detectCalls = 0;
    const detectionService = {
      detectTarget: async () => {
        detectCalls++;
        return { ok: true };
      }
    };
    let takeCalls = 0;
    const cameraService = {
      takeSelfie: async () => {
        takeCalls++;
        return new Blob();
      },
      stopStream() {}
    };
    let overlayCalled = false;
    const cameraSectionManager = {
      captureOverlay: async () => {
        overlayCalled = true;
      },
      markCaptured() {},
      resumeDetection() {},
      stateService: {}
    };
    const bus = { emit() {}, subscribe() {}, unsubscribe() {} };
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async key => key },
      { saveProfile: async () => {}, canProceed: () => true },
      null,
      { loadUser: async () => ({}) },
      {},
      detectionService,
      cameraService,
      cameraSectionManager,
      null,
      { error() {} },
      { save() {}, load() {} },
      { setScreenState() {} },
      {
        getRequirement: () => ({ target: 'person' }),
        getQuest: () => ({ overlay: {} })
      },
      bus
    );
    view.currentScreen = 'camera';
    view.lastDetection = { blob: new Blob(), box: {}, mask: {} };
    await view.handleCaptureEvents({ type: 'capture-btn' });
    assert.strictEqual(detectCalls, 0);
    assert.strictEqual(takeCalls, 0);
    assert.ok(overlayCalled);
    delete global.window;
    delete global.document;
  });
});
