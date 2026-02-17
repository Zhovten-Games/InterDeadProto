import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

describe('camera detection flow', () => {
  it('stops after first match and resumes on retry', async () => {
    const camera = {
      takeSelfie: async () => ({}),
      pauseStreamCalled: false,
      stopStreamCalled: false,
      resumeStreamCalled: false,
      pauseStream() { this.pauseStreamCalled = true; },
      stopStream() { this.stopStreamCalled = true; },
      resumeStream() { this.resumeStreamCalled = true; }
    };
    let calls = 0;
    const detection = {
      detectTarget: async () => {
        calls++;
        return { ok: true };
      }
    };
    const logger = { error() {} };
    const events = [];
    const bus = { subscribe() {}, emit(evt) { events.push(evt); }, unsubscribe() {} };
    const stateService = { resetCapturedCalled: false, resetCaptured() { this.resetCapturedCalled = true; } };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const manager = new CameraOrchestratorService(
      camera,
      detection,
      logger,
      stateService,
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
    manager.start({}, {
      cameraType: 'quest',
      onDetected: target => bus.emit({ type: 'DETECTION_DONE', target })
    });
    await new Promise(r => setImmediate(r));
    assert.strictEqual(calls, 1);
    // Stream should be either paused or fully stopped after detection
    assert.ok(camera.pauseStreamCalled || camera.stopStreamCalled);
    manager.resumeDetection();
    await new Promise(r => setImmediate(r));
    assert.strictEqual(calls, 2);
    assert.ok(stateService.resetCapturedCalled);
    assert.ok(events.find(e => e.type === 'BUTTON_STATE_UPDATED'));
    assert.ok(events.find(e => e.type === 'DETECTION_SEARCH'));
    assert.strictEqual(
      events.filter(e => e.type === 'DETECTION_DONE').length,
      2
    );
    manager.resumeDetection();
    await new Promise(r => setImmediate(r));
    assert.strictEqual(calls, 3);
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });
});
