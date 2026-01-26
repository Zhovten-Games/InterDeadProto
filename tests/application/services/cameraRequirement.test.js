import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import QuestActivationRequirement from '../../../src/core/requirements/QuestActivationRequirement.js';

describe('Camera requirement propagation', () => {
  it('passes quest requirement to detection', () => {
    let received = null;
    const cameraService = { takeSelfie: async () => ({}) };
    const detectionService = { detectTarget: async () => ({ ok: true }) };
    const logger = { error() {} };
    const dualityManager = {
      getRequirement: () => ({ type: 'object', target: 'person' }),
      isQuestActive: () => true
    };
      const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
      const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
      const manager = new CameraOrchestratorService(
        cameraService,
        detectionService,
        logger,
        null,
        dualityManager,
        null,
        { subscribe() {}, emit() {}, unsubscribe() {} },
        null,
        null,
        null,
        null,
        null,
        imageComposer,
        repo
      );
    manager.startDetection = (container, options) => {
      received = options.requirement;
    };
    manager.start({}, { cameraType: 'quest' });
    assert.ok(received instanceof QuestActivationRequirement);
    assert.strictEqual(received.type, 'object');
    assert.strictEqual(received.target, 'person');
  });
});
