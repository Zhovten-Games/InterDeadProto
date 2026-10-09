import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import {
  DIALOG_WIDGET_READY,
  EVENT_MESSAGE_READY,
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

describe('Replay dedup retains fingerprint on late attachment', () => {
  it('emits only once when media data arrives after replay', async () => {
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
      start() {},
      getCurrentDialog() {
        return this.dialog;
      },
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      },
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const seen = new Set();
    const history = [{ author: 'ghost', text: 'Hi', media: {}, fingerprint: 'g1' }];
    const historyService = {
      load: () => history,
      save() {},
      appendUnique() {},
      has: (_g, m) => seen.has(m.fingerprint),
      markSeen: (_g, m) => seen.add(m.fingerprint),
    };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};

    const gate = new DialogInputGateService(dialogManager, dualityManager, bus);
    gate.boot();

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

    svc._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'Hi', media: {}, fingerprint: 'g1' },
              { author: 'user', text: 'Ok', fingerprint: 'u1' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const first = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1',
    );
    assert.strictEqual(first.length, 0, 'snapshot restore has no live effects');
    assert.strictEqual(
      svc.timeline.getSnapshot().messages.filter((row) => row.fingerprint === 'g1').length,
      1,
    );

    // Late media attachment for the already replayed message
    const msg = dialogManager.dialog.messages[0];
    msg.media = { src: 'later.jpg' };

    // Replaying history should not emit the same line again
    svc._replayHistory([msg]);

    const after = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1',
    );
    assert.strictEqual(after.length, 0, 'no live emission after media attachment');
    assert.strictEqual(
      svc.timeline.getSnapshot().messages.filter((row) => row.fingerprint === 'g1').length,
      1,
    );
    svc.dispose();
  });
});
