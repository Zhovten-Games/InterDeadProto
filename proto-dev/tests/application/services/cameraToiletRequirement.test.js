import assert from 'assert';
import CameraSectionManager from '../../../src/application/services/CameraOrchestratorService.js';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import DialogInputGateService from '../../../src/application/services/DialogInputGateService.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import Dialog from '../../../src/core/dialog/Dialog.js';

class MockBus {
  constructor() { this.subs = []; }
  subscribe(fn) { this.subs.push(fn); }
  unsubscribe(fn) { this.subs = this.subs.filter(f => f !== fn); }
  emit(evt) { this.subs.slice().forEach(fn => fn(evt)); }
}

describe('camera quest requirement', () => {
  it('activates capture button only after toilet detection', async () => {
    const bus = new MockBus();
    const screen = new ScreenService(bus); screen.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    const buttonState = new ButtonStateService(bus, { load(){return{};}, save(){}, remove(){} }, screen);
    buttonState.boot();
    const dialogManager = new DialogManager(new Dialog([]), bus, null);
    const inputGate = new DialogInputGateService(dialogManager, { isQuestActive: () => true }, bus);
    const cameraService = {
      startStream: async () => {},
      takeSelfie: async () => ({}),
      pauseStream: () => {}
    };
    const detectionService = { detectTarget: async () => ({ ok: true }) };
    const logger = { error() {} };
    const stateService = { resetCaptured() {}, resetPresence() {} };
    const duality = { isQuestActive: () => true, getRequirement: () => ({ type: 'object', target: 'toilet' }) };

    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const mgr = new CameraSectionManager(
      cameraService,
      detectionService,
      logger,
      stateService,
      duality,
      dialogManager,
      bus,
      buttonState,
      { setScreenVisibility() {} },
      null,
      null,
      inputGate,
      imageComposer,
      repo
    );

    // trigger detection cycle immediately
    const origSetTimeout = global.setTimeout;
    global.setTimeout = fn => { fn(); return 0; };

    mgr.start(
      {},
      {
        force: true,
        cameraType: 'quest',
        onDetected: target => bus.emit({ type: 'DETECTION_DONE', target })
      }
    );
    await new Promise(r => setTimeout(r, 0));

    global.setTimeout = origSetTimeout;

    assert.strictEqual(buttonState.isActive('capture-btn', 'camera'), true);
  });
});
