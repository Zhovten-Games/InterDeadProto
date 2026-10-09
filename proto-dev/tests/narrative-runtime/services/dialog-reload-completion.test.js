import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import StateService from '../../../src/app-shell/state/application-state-service.js';
import {
  DIALOG_WIDGET_READY,
  DUALITY_COMPLETED,
} from '../../../src/runtime-events/domain/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }
  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach((h) => h(evt));
  }
}

describe('DialogOrchestratorService reload completion', () => {
  it('keeps guide locked after full history reload until new progress', async () => {
    const bus = new Bus();
    const states = new Map();
    const buttonStateService = {
      setState() {},
      setScreenState(screen, action, enabled) {
        states.set(`${screen}:${action}`, enabled);
      },
    };
    let completed = false;
    const ghostSwitchService = {
      markCompleted: () => {
        completed = true;
      },
    };

    const fullHistory = [
      { author: 'ghost', text: 'guide.start' },
      { author: 'user', text: 'guide.reply' },
      { author: 'ghost', text: 'guide.end' },
    ];

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) {
        this.dialog = new Dialog(cfg.stages[0].event.messages);
      },
      start() {},
      getCurrentDialog() {
        return this.dialog;
      },
      completeCurrentEvent() {
        bus.emit({ type: DUALITY_COMPLETED });
      },
      isQuestActive() {
        return false;
      },
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
      adaptHistoryPort(historyService),
      avatarService,
      ghostSwitchService,
      {},
      null,
      bus,
    );

    svc._loadConfig = async () => ({
      stages: [{ event: { messages: fullHistory, autoStart: true } }],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();

    assert.ok(!bus.events.some((e) => e.type === DUALITY_COMPLETED), 'no completion on reload');
    assert.strictEqual(completed, false, 'ghost switching locked');

    const profile = { canProceed: () => true };
    const geo = {};
    const stateSvc = new StateService(profile, geo, ghostService, bus, { warn() {} });
    await stateSvc.boot();
    assert.strictEqual(states.get('messenger:post'), false, 'effective button owner disables Post');
    assert.strictEqual(svc.postLocked, true);
    stateSvc.dispose();

    dialogManager.dialog.messages.push({ author: 'ghost', text: 'extra' });
    dialogManager.dialog.index++;
    svc._refreshLastReplayedIndex();
    bus.emit({ type: DUALITY_COMPLETED });
    assert.strictEqual(completed, true, 'ghost unlocked after progress');
  });
});
