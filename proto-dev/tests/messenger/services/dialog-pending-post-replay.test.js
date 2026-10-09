import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
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

describe('DialogOrchestratorService pending post replay', () => {
  it('replays a post made before widget readiness', async () => {
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
    const historyService = {
      load: () => [{ author: 'ghost', text: 'Hello' }],
      save() {},
      clearSeen() {},
      has() {},
      markSeen() {},
    };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};
    const gate = new DialogInputGateService(dialogManager, dualityManager, bus);

    const orchestrator = new DialogOrchestratorService(
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

    orchestrator._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'Hello' },
              { author: 'user', text: 'Hi' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    orchestrator.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    // Wait for dialog setup to complete
    await flushEvents();
    await flushEvents();
    // User posts before widget is ready
    bus.emit({ type: 'post' });
    // Allow post handler to enqueue the message
    await flushEvents();
    // Simulate buffer loss during reload
    orchestrator.historyBuffer.clear();
    // Widget now becomes ready
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    assert.strictEqual(
      bus.events.filter((e) => e.type === EVENT_MESSAGE_READY && e.replay).length,
      0,
    );
    const messages = orchestrator.timeline.getSnapshot().messages;
    assert.strictEqual(messages.length, 2);
    assert.strictEqual(messages[1].author, 'user');
    assert.strictEqual(messages[1].text, 'Hi');

    orchestrator.dispose();
  });
});
