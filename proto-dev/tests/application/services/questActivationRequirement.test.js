import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import QuestActivationRequirement from '../../../src/core/requirements/QuestActivationRequirement.js';
import { QUEST_STARTED } from '../../../src/core/events/constants.js';

describe('QuestActivationRequirement', () => {
  it('defers detection until quest starts', () => {
    let dispatched = false;
    let questActive = false;
    const store = { dispatch() { dispatched = true; return []; } };
    const bus = {
      subs: [],
      subscribe(fn) { this.subs.push(fn); },
      unsubscribe(fn) { this.subs = this.subs.filter(h => h !== fn); },
      emit(evt) { this.subs.forEach(h => h(evt)); }
    };
    const dualityManager = { isQuestActive: () => questActive };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke() {} }) };
    const mgr = new CameraOrchestratorService(
      {},
      {},
      {},
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
      repo,
      null,
      store,
      false
    );
    mgr.active = true;
    const req = new QuestActivationRequirement(dualityManager, { type: 'object', target: 'person' });
    mgr.startDetection({}, { requirement: req });
    assert.strictEqual(dispatched, false);
    questActive = true;
    bus.emit({ type: QUEST_STARTED });
    assert.strictEqual(dispatched, true);
  });
});
