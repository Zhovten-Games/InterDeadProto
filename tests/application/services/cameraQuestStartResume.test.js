import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { QUEST_STARTED } from '../../../src/core/events/constants.js';

describe('cameraQuestStartResume', () => {
  it('restarts detection with stored force flag when quest starts', () => {
    let started = 0;
    const bus = {
      subs: [],
      subscribe(fn) { this.subs.push(fn); },
      unsubscribe(fn) { this.subs = this.subs.filter(h => h !== fn); },
      emit(evt) { this.subs.slice().forEach(h => h(evt)); }
    };
    const cameraService = { startStream: async () => {}, stopStream() {} };
    const detectionService = {};
    const logger = { error() {} };
    const dualityManager = { isQuestActive: () => false };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke() {} }) };
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
    mgr.startDetection = () => { started++; };
    mgr.boot();
    bus.emit({ type: 'CAMERA_VIEW_OPENED', container: {}, options: { force: true } });
    assert.strictEqual(started, 1);
    bus.emit({ type: QUEST_STARTED });
    assert.strictEqual(started, 2);
  });
});
