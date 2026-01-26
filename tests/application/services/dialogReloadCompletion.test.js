import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import Dialog from '../../../src/core/dialog/Dialog.js';
import StateService from '../../../src/application/services/StateService.js';
import { DIALOG_WIDGET_READY, DUALITY_COMPLETED } from '../../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter(h => h !== fn);
  }
  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach(h => h(evt));
  }
}

describe('DialogOrchestratorService reload completion', () => {
  it('keeps guide locked after full history reload until new progress', async () => {
    const bus = new Bus();
    const buttonStateService = { setState() {}, setScreenState() {} };
    let completed = false;
    const ghostSwitchService = { markCompleted: () => { completed = true; } };

    const fullHistory = [
      { author: 'ghost', text: 'guide.start' },
      { author: 'user', text: 'guide.reply' },
      { author: 'ghost', text: 'guide.end' }
    ];

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) {
        this.dialog = new Dialog(cfg.stages[0].event.messages);
      },
      start() {},
      getCurrentDialog() { return this.dialog; },
      completeCurrentEvent() { bus.emit({ type: DUALITY_COMPLETED }); },
      isQuestActive() { return false; }
    };

    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = { load: () => fullHistory, clearSeen() {}, save() {} };
    const avatarService = { getUserAvatar: async () => '' };

    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      buttonStateService,
      { setScreenVisibility() {} },
      historyService,
      avatarService,
      ghostSwitchService,
      {},
      null,
      bus
    );

    svc._loadConfig = async () => ({
      stages: [{ event: { messages: fullHistory, autoStart: true } }]
    });
    svc._prepareConfig = async (_g, cfg) => ({ cfg: { ...cfg, avatar: '' }, userAvatar: '' });

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await Promise.resolve();

    assert.ok(!bus.events.some(e => e.type === DUALITY_COMPLETED), 'no completion on reload');
    assert.strictEqual(completed, false, 'ghost switching locked');

    const profile = { canProceed: () => true };
    const geo = {};
    const stateSvc = new StateService(profile, geo, ghostService, bus, { warn() {} });
    await stateSvc.boot();
    assert.strictEqual(stateSvc.isButtonEnabled('messenger', 'post'), false, 'post disabled');

    dialogManager.dialog.messages.push({ author: 'ghost', text: 'extra' });
    dialogManager.dialog.index++;
    svc._refreshLastReplayedIndex();
    bus.emit({ type: DUALITY_COMPLETED });
    assert.strictEqual(completed, true, 'ghost unlocked after progress');
  });
});
