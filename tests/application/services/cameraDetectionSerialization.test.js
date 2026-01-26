import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

// Ensures detection cycles do not overlap and emit only one DETECTION_DONE.
describe('camera detection serialization', () => {
  it('emits a single DETECTION_DONE per detection', async () => {
    const dom = new JSDOM('<div></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const camera = { takeSelfie: async () => ({}) };
    let detectCalls = 0;
    let resolveDetect;
    const detection = {
      detectTarget: () => {
        detectCalls++;
        return new Promise(res => { resolveDetect = res; });
      }
    };
    const logger = { error() {} };
    const events = [];
    const bus = { subscribe() {}, emit(evt) { events.push(evt); }, unsubscribe() {} };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke(){} }) };
    const mgr = new CameraOrchestratorService(
      camera,
      detection,
      logger,
      null,
      { isQuestActive: () => true, getRequirement: () => ({ type: 'presence', target: 'person' }) },
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
    mgr.active = true;
    const origSetTimeout = global.setTimeout;
    const origClearTimeout = global.clearTimeout;
    let scheduled;
    global.setTimeout = fn => { scheduled = fn; return 1; };
    global.clearTimeout = () => { scheduled = null; };
    mgr.startDetection({}, { requirement: { target: 'person' }, onDetected: t => bus.emit({ type: 'DETECTION_DONE', target: t }) });
    // First scheduled run
    scheduled();
    // Simulate an extra tick before the first resolves
    scheduled();
    resolveDetect({ ok: true });
    await new Promise(r => setImmediate(r));
    assert.strictEqual(detectCalls, 1);
    assert.strictEqual(events.filter(e => e.type === 'DETECTION_DONE').length, 1);
    global.setTimeout = origSetTimeout;
    global.clearTimeout = origClearTimeout;
    delete global.window;
    delete global.document;
  });
});
