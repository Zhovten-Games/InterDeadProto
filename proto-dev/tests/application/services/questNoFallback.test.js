import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

describe('quest target fallback', () => {
  it('waits for quest requirement instead of using person fallback', () => {
    let called = false;
    const cameraService = { takeSelfie: async () => ({}) };
    const detectionService = {
      detectTarget: async () => {
        called = true;
        return { ok: true };
      }
    };
    const events = [];
    const bus = {
      handlers: [],
      subscribe(fn) { this.handlers.push(fn); },
      unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); },
      emit(evt) {
        events.push(evt);
        this.handlers.forEach(h => h(evt));
      }
    };
    const duality = { getRequirement: () => null, isQuestActive: () => true };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const mgr = new CameraOrchestratorService(
      cameraService,
      detectionService,
      { error() {} },
      null,
      duality,
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
    mgr.start({}, { cameraType: 'quest' });
    assert.strictEqual(called, false);
    const searchEvt = events.find(e => e.type === 'DETECTION_SEARCH');
    assert.ok(searchEvt);
    assert.strictEqual(searchEvt.target, undefined);
  });
});
