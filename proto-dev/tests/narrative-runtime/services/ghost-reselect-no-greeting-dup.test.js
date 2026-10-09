import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import {
  EVENT_MESSAGE_READY,
  DIALOG_WIDGET_READY,
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

describe('Ghost reselect does not duplicate greeting', () => {
  it('ignores GHOST_CHANGE to same ghost', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus);
    screen.boot();
    const store = {
      save() {},
      load() {
        return {};
      },
    };
    const buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();
    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) {
        this.dialog = new Dialog(cfg.stages[0].event.messages);
      },
      start() {
        dialogManager.progress();
      },
      getCurrentDialog() {
        return this.dialog;
      },
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      },
    };
    let current = { name: 'guide' };
    const ghostService = { getCurrentGhost: () => current };
    const historyService = { load: () => [], save() {}, append() {} };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};
    const gate = new DialogInputGateService(dialogManager, dualityManager, bus);
    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      buttons,
      { setScreenVisibility() {} },
      adaptHistoryPort(historyService),
      avatarService,
      ghostSwitchService,
      spiritConfigs,
      gate,
      bus,
    );
    const msgs = [
      { author: 'ghost', text: 'hello', fingerprint: 'g1' },
      { author: 'user', text: 'ok', fingerprint: 'u1' },
    ];
    svc._loadConfig = async () => ({ stages: [{ event: { messages: msgs } }] });
    // Configuration enrichment is exercised through the production contract.
    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();
    const before = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1',
    ).length;
    current = { name: 'guide' };
    bus.emit({ type: 'GHOST_CHANGE' });
    await flushEvents();
    const after = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1',
    ).length;
    assert.strictEqual(before, 1);
    assert.strictEqual(after, 1);
    svc.dispose();
  });
});
