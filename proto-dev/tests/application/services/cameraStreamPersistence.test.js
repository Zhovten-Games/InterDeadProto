import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

// Verifies that detection pauses the stream without removing the video element
// and that detection can be resumed for both registration and quest flows.

describe('camera stream persistence', () => {
  const setupDom = () => {
    const dom = new JSDOM('<div data-js="cam"><video></video></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    return document.querySelector('[data-js="cam"]');
  };

  const teardownDom = () => {
    delete global.window;
    delete global.document;
  };

  /**
   * Helper to run detection once and verify video persistence and resume.
   * @param {string} cameraType 'registration' or 'quest'
   */
  const runFlow = async cameraType => {
    const container = setupDom();
    Object.defineProperty(container, 'offsetParent', { value: {}, configurable: true });
    const camera = {
      pauseStreamCalled: false,
      stopStreamCalled: false,
      resumeStreamCalled: false,
      takeSelfie: async () => ({}),
      pauseStream() { this.pauseStreamCalled = true; },
      stopStream() {
        this.stopStreamCalled = true;
        container.querySelector('video')?.remove();
      },
      resumeStream() { this.resumeStreamCalled = true; }
    };
    let detections = 0;
    const detection = { detectTarget: async () => ({ ok: true }) };
    const bus = { subscribe() {}, emit() {}, unsubscribe() {} };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const manager = new CameraOrchestratorService(
      camera,
      detection,
      { error() {} },
      null,
      { isQuestActive: () => true, getRequirement: () => ({ type: 'presence', target: 'person' }) },
      null,
      bus,
      { setScreenState() {} },
      null,
      null,
      null,
      null,
      imageComposer,
      repo
    );
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    global.setTimeout = fn => { fn(); return 1; };
    global.clearTimeout = () => {};
    manager.start(container, {
      cameraType,
      onDetected: () => { detections++; }
    });
    await new Promise(r => setImmediate(r));
    assert.strictEqual(detections, 1);
    assert.ok(camera.pauseStreamCalled);
    assert.ok(!camera.stopStreamCalled);
    assert.ok(container.querySelector('video'));
    manager.resumeDetection();
    await new Promise(r => setImmediate(r));
    assert.ok(camera.resumeStreamCalled);
    assert.strictEqual(detections, 2);
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
    teardownDom();
  };

  it('keeps video and resumes in registration flow', async () => {
    await runFlow('registration');
  });

  it('keeps video and resumes in quest flow', async () => {
    await runFlow('quest');
  });
});

