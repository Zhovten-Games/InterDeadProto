import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

describe('camera detection retry loop', () => {
  it('retries until target is detected', async () => {
    const camera = { takeSelfie: async () => ({}) };
    let calls = 0;
    const detection = {
      detectTarget: async () => ({ ok: ++calls >= 2 })
    };
    const logger = { error() {} };
    const bus = { subscribe() {}, emit() {}, unsubscribe() {} };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = {
      save: async () => 1,
      get: async () => ({ thumbKey: '', fullKey: '' }),
      getObjectURL: async () => ({ url: '', revoke() {} })
    };
    const mgr = new CameraOrchestratorService(
      camera,
      detection,
      logger,
      null,
      { isQuestActive: () => true, getRequirement: () => ({ type: 'object', target: 'person' }) },
      null,
      bus,
      { setScreenState() {} },
      null,
      null,
      null,
      null,
      imageComposer,
      repo
    );
    const origSetTimeout = global.setTimeout;
    const origClearTimeout = global.clearTimeout;
    global.setTimeout = fn => { fn(); return 0; };
    global.clearTimeout = () => {};
    mgr.start({}, { onDetected: () => {} });
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));
    assert.strictEqual(calls, 2);
    global.setTimeout = origSetTimeout;
    global.clearTimeout = origClearTimeout;
  });
});
