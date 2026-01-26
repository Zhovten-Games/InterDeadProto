import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import guide from '../../../src/config/spirits/guide.js';

// Ensures person detection starts when opening the camera for Guide quests
describe('cameraGuidePersonDetection', () => {
  it('invokes detection even if quest inactive', () => {
    const requirement = guide.stages[0].quest.requirement;
    let detected = 0;
    const cameraService = { startStream: async () => {}, takeSelfie: async () => ({}) };
    const detectionService = { detectTarget: async () => ({ ok: true }) };
    const logger = { info() {}, error() {} };
    const dualityManager = {
      getRequirement: () => requirement,
      isQuestActive: () => false
    };
    const bus = { subscribe() {}, emit() {}, unsubscribe() {} };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
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
    mgr.startDetection = () => {
      detected++;
    };
    mgr.start({}, { cameraType: 'quest' });
    assert.strictEqual(detected, 1);
  });
});

