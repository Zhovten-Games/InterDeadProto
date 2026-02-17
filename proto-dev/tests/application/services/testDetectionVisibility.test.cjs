const assert = require('assert');
const CameraOrchestratorService = require('../../../src/application/services/CameraOrchestratorService.js').default;
const EventBusAdapter =
  require('../../../src/adapters/logging/EventBusAdapter.js').default ||
  require('../../../src/adapters/logging/EventBusAdapter.js');

class DummyCamera { async takeSelfie(){ return {}; } }
class DummyDetection { async detectTarget(){ return { ok: true }; } }
class DummyLogger { error(){} }

const dummyContainer = () => ({ offsetParent: {} });

describe('Camera detection visibility', function(){
  it('stops when container hidden', async function(){
    const camera = new DummyCamera();
    const detection = new DummyDetection();
      const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
      const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
      const manager = new CameraOrchestratorService(
        camera,
        detection,
        new DummyLogger(),
        null,
        { getRequirement() { return null; } },
        null,
        new EventBusAdapter(),
        null,
        null,
        null,
        null,
        null,
        imageComposer,
        repo
      );
    const el = dummyContainer();
    manager.toggleVisibility();
    manager.startDetection(el);
    el.offsetParent = null;
    await new Promise(r => setTimeout(r, 0));
    assert.strictEqual(manager.interval, null);
  });

  it('stops on finish action', async function(){
    const camera = new DummyCamera();
    const detection = new DummyDetection();
      const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
      const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
      const manager = new CameraOrchestratorService(
        camera,
        detection,
        new DummyLogger(),
        null,
        { getRequirement() { return null; } },
        null,
        new EventBusAdapter(),
        null,
        null,
        null,
        null,
        null,
        imageComposer,
        repo
      );
    const el = dummyContainer();
    manager.toggleVisibility();
    manager.startDetection(el);
    manager.stopDetection();
    assert.strictEqual(manager.interval, null);
  });
});
