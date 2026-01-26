import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

describe('camera error logging', () => {
  it('logs meaningful errors', async () => {
    const camera = { takeSelfie: async () => ({}) };
    const detection = { detectTarget: async () => { throw 'fail'; } };
    const logged = [];
    const logger = { error(msg) { logged.push(msg); } };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const manager = new CameraOrchestratorService(
      camera,
      detection,
      logger,
      null,
      { isQuestActive: () => true, getRequirement: () => ({ type: 'presence', target: 'person' }) },
      null,
      { subscribe() {}, emit() {}, unsubscribe() {} },
      { setScreenState() {} },
      null,
      null,
      null,
      null,
      imageComposer,
      repo
    );
    manager.active = true;
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    global.setTimeout = fn => { fn(); return 1; };
    global.clearTimeout = () => {};
    manager.startDetection({}, { requirement: { target: 'person' } });
    await new Promise(r => setImmediate(r));
    assert.strictEqual(logged[0], 'fail');
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });
});
