import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

describe('camera presence reset', () => {
  it('clears presence when camera opens or closes without quest', () => {
    const stateService = {
      presence: { person: true },
      resetPresence() { this.presence = {}; },
      resetCaptured() {}
    };
    const bus = {
      handlers: [],
      subscribe(fn) { this.handlers.push(fn); },
      unsubscribe() {},
      emit(evt) { this.handlers.forEach(h => h(evt)); }
    };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const manager = new CameraOrchestratorService(
      { startStream: async () => {}, stopStream() {} },
      { detectTarget: async () => ({ ok: false }) },
      { error() {} },
      stateService,
      { isQuestActive: () => false },
      null,
      bus,
      { setScreenState() {} },
      { setScreenVisibility() {} },
      null,
      null,
      null,
      imageComposer,
      repo
    );
    manager.boot();
    bus.emit({ type: 'CAMERA_VIEW_OPENED', container: {}, options: {} });
    assert.deepStrictEqual(stateService.presence, {});
    stateService.presence.person = true;
    bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
    assert.deepStrictEqual(stateService.presence, {});
  });
});
