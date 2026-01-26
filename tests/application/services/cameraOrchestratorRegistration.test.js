import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

// Ensures detection starts during registration when no quest requirement exists
describe('cameraOrchestratorRegistration', () => {
  it('triggers detection without DualityManager requirement', () => {
    let called = false;
    let received = null;
    const cameraService = {};
    const detectionService = {};
    const logger = { error() {} };
    const dualityManager = { getRequirement: () => null };
    const bus = { subscribe() {}, emit() {}, unsubscribe() {} };
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
        null,
        null,
        null,
        null,
        imageComposer,
        repo
      );

    manager.startDetection = (container, opts) => {
      called = true;
      received = opts.requirement;
    };

    manager.start({}, { force: true, cameraType: 'registration' });
    assert.ok(called);
    assert.deepStrictEqual(received, { type: 'presence', target: 'person' });
  });
});

