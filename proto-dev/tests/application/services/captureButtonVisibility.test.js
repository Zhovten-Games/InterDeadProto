import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

// Ensures capture button stays hidden when no quest is active

describe('capture button visibility', () => {
  it('hides capture button until quest starts', () => {
    const cameraService = { startStream: async () => {}, stopStream: () => {} };
    const detectionService = {};
    const logger = { error() {} };
    const dualityManager = { isQuestActive: () => false, getRequirement: () => ({ type: 'presence', target: 'person' }) };
    const bus = {
      handlers: [],
      subscribe(fn){ this.handlers.push(fn); },
      unsubscribe(fn){ this.handlers = this.handlers.filter(h => h !== fn); },
      emit(evt){ this.handlers.forEach(h => h(evt)); }
    };
    const visibilityCalls = [];
    const buttonVisibilityService = { setScreenVisibility(screen, action, visible){ visibilityCalls.push({ screen, action, visible }); } };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const manager = new CameraOrchestratorService(
      cameraService,
      detectionService,
      logger,
      null,
      dualityManager,
      null,
      bus,
      null,
      buttonVisibilityService,
      null,
      null,
      null,
      imageComposer,
      repo
    );
    manager.boot();
    bus.emit({ type: 'CAMERA_VIEW_OPENED', container: {}, options: {} });
    const captureVis = visibilityCalls.find(c => c.action === 'capture-btn');
    assert.ok(captureVis);
    assert.strictEqual(captureVis.visible, false);
  });
});
