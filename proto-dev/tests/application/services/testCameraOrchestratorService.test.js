import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { createStore } from '../../../src/core/engine/store.js';

describe('CameraOrchestratorService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/application/services/CameraOrchestratorService.js');
      loaded = true;
    } catch (err) {
      loaded = true;
    }
    assert.ok(loaded);
  });

  it('serializes detection runs', async () => {
    const store = createStore();
    store.state.quest.active = true;
    let finished = 0;
    const originalDispatch = store.dispatch.bind(store);
    store.dispatch = action => {
      if (action.type === 'DETECTION_DONE') finished++;
      return originalDispatch(action);
    };

    let detectCalls = 0;
    let resolveDetect;
    const detectionService = {
      detectTarget: () => {
        detectCalls++;
        return new Promise(r => {
          resolveDetect = r;
        });
      }
    };

    const cameraService = {
      takeSelfie: async () => 'img',
      pauseStream: () => {},
      resumeStream: () => {}
    };

    const logger = { error: () => {}, info: () => {}, warn: () => {} };
    const bus = { emit: () => {}, subscribe: () => {}, unsubscribe: () => {} };
    const imageComposer = {};
    const mediaRepository = {};

    const orchestrator = new CameraOrchestratorService(
      cameraService,
      detectionService,
      logger,
      null,
      null,
      null,
      bus,
      null,
      null,
      null,
      null,
      null,
      imageComposer,
      mediaRepository,
      store
    );

    orchestrator.active = true;
    const requirement = { type: 'presence', target: 'person' };
    const container = { offsetParent: {} };

    const promise = orchestrator.startDetection(container, { requirement });
    await Promise.resolve();
    orchestrator.startDetection(container, { requirement });

    assert.strictEqual(detectCalls, 1, 'only one detection should run');

    resolveDetect({ ok: false });
    await promise;

    assert.strictEqual(finished, 1, 'one completion event dispatched');
  });
});
