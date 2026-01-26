import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { QUEST_STARTED } from '../../../src/core/events/constants.js';

// Ensures camera detection waits for quest activation
describe('cameraQuestActivation', () => {
  it('starts detection only after quest begins', () => {
    let started = 0;
    let questActive = false;
    const cameraService = { startStream: async () => {}, stopStream: () => {} };
    const detectionService = {};
    const logger = { error() {} };
    const dualityManager = {
      getRequirement: () => ({ type: 'object', target: 'toilet' }),
      isQuestActive: () => questActive
    };
    const bus = {
      subs: [],
      subscribe(fn) { this.subs.push(fn); },
      unsubscribe(fn) { this.subs = this.subs.filter(h => h !== fn); },
      emit(evt) { this.subs.forEach(h => h(evt)); }
    };

    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const mgr = new CameraOrchestratorService(
      cameraService,
      detectionService,
      logger,
      null,
      dualityManager,
      null,
      bus,
      null,
      null,
      null,
      null,
      null,
      imageComposer,
      repo
    );
    mgr.startDetection = () => {
      started++;
    };
    mgr.boot();

    // Opening camera before quest should not start detection
    bus.emit({ type: 'CAMERA_VIEW_OPENED', container: {}, options: { force: false } });
    assert.strictEqual(started, 0);

    // After quest starts, detection should begin without reopening camera
    questActive = true;
    bus.emit({ type: QUEST_STARTED });
    assert.strictEqual(started, 1);
  });
});
