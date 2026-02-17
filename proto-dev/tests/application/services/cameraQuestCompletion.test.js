import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { QUEST_COMPLETED } from '../../../src/core/events/constants.js';

// Ensures detection does not run after quest completion
// when reopening the camera with a stale person target

describe('cameraQuestCompletion', () => {
  it('skips detection after quest is completed', () => {
    let detectCalls = 0;
    const container = {};
    const cameraService = {
      startStream: async () => {},
      stopStream: () => {},
      takeSelfie: async () => ({})
    };
    const detectionService = {
      detectTarget: async () => {
        detectCalls++;
        return { ok: true };
      }
    };
    const logger = { info() {}, error() {} };
    let questActive = true;
    const dualityManager = {
      getRequirement: () => ({ type: 'presence', target: 'person' }),
      isQuestActive: () => questActive
    };
    const bus = {
      subs: [],
      subscribe(fn) {
        this.subs.push(fn);
      },
      unsubscribe(fn) {
        this.subs = this.subs.filter(h => h !== fn);
      },
      emit(evt) {
        this.subs.forEach(h => h(evt));
      }
    };
    const imageComposer = {
      compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} })
    };
    const repo = {
      save: async () => 1,
      get: async () => ({ thumbKey: '', fullKey: '' }),
      getObjectURL: async () => ({ url: '', revoke: () => {} })
    };
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

    mgr.startDetection = (_c, { requirement }) => {
      detectionService.detectTarget({}, requirement.target);
    };

    mgr.boot();

    // Open camera with active quest - detection runs
    bus.emit({ type: 'CAMERA_VIEW_OPENED', container });
    assert.strictEqual(detectCalls, 1);

    // Complete quest and close camera
    questActive = false;
    bus.emit({ type: QUEST_COMPLETED });
    bus.emit({ type: 'CAMERA_VIEW_CLOSED' });

    // Reopen camera - detection should not run
    bus.emit({ type: 'CAMERA_VIEW_OPENED', container });
    assert.strictEqual(detectCalls, 1);
  });
});
