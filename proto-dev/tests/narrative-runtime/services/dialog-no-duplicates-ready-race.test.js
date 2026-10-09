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

describe('Dialog ready race', () => {
  it('emits each line only once when messages arrive before widget ready', async () => {
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
        if (dialogManager.dialog.index === 0) dialogManager.progress();
      },
      getCurrentDialog() {
        return this.dialog;
      },
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      },
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
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
      { author: 'ghost', text: 'one', fingerprint: 'fp1' },
      { author: 'ghost', text: 'two', fingerprint: 'fp2' },
      { author: 'user', text: 'ok', fingerprint: 'u1' },
    ];
    svc._loadConfig = async () => ({ stages: [{ event: { messages: msgs } }] });
    // Configuration enrichment is exercised through the production contract.
    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await flushEvents();
    await flushEvents();
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();
    const counts = {};
    bus.events
      .filter((e) => e.type === EVENT_MESSAGE_READY)
      .forEach((e) => {
        counts[e.fingerprint] = (counts[e.fingerprint] || 0) + 1;
      });
    assert.deepStrictEqual(counts, { fp1: 1, fp2: 1 });
    svc.dispose();
  });
});
