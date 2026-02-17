
import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { createStore } from '../../../src/core/engine/store.js';

// Verifies that camera detection runs are serialized through the core store.
describe('CameraOrchestratorService detection mutex', () => {
  it('prevents parallel detection runs', async () => {
    const cameraService = { takeSelfie: async () => ({}), pauseStream: () => {} };
    let detectCalls = 0;
    const detectionService = {
      async detectTarget() {
        detectCalls++;
        await new Promise(r => setTimeout(r, 10));
        return { ok: false };
      }
    };
    const logger = { error: () => {} };
    const store = createStore();
    const imageComposer = {};
    const mediaRepository = { save: async () => {}, get: async () => ({}), getObjectURL: async () => ({}) };

    const svc = new CameraOrchestratorService(
      cameraService,
      detectionService,
      logger,
      null,
      null,
      null,
      { emit: () => {} },
      null,
      null,
      null,
      null,
      null,
      imageComposer,
      mediaRepository,
      store
    );
    svc.active = true;
    const container = { offsetParent: {} };
    const requirement = { target: 'person' };

    await Promise.all([
      svc.startDetection(container, { requirement }),
      svc.startDetection(container, { requirement })
    ]);

    assert.strictEqual(detectCalls, 1);
  });
});

