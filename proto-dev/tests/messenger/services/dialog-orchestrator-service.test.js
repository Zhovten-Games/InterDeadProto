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
  DIALOG_AWAITING_INPUT_CHANGED,
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

describe('DialogOrchestratorService', () => {
  it('starts dialog only after widget readiness and enables Post', async () => {
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
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = { load: () => [], save() {} };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};

    class Gate {
      constructor(dialogManager, bus) {
        this.dialogManager = dialogManager;
        this.bus = bus;
      }
      advanceToUserTurn() {
        const dlg = this.dialogManager.dialog;
        const upcoming = dlg?.messages?.[dlg.index];
        if (upcoming && upcoming.author === 'user') {
          this.bus.emit({
            type: DIALOG_AWAITING_INPUT_CHANGED,
            awaits: true,
            kind: 'user_text',
            targetScreen: 'messenger',
          });
        } else {
          this.bus.emit({
            type: DIALOG_AWAITING_INPUT_CHANGED,
            awaits: false,
            kind: null,
            targetScreen: null,
          });
        }
      }
    }
    const gate = new Gate(dialogManager, bus);

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
              { author: 'ghost', text: 'Hello from the guide' },
              { author: 'user', text: 'Hi' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    // No messages should be emitted before the widget signals readiness
    let greetings = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY);
    assert.strictEqual(greetings.length, 0, 'no messages before widget ready');

    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    greetings = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.text === 'Hello from the guide',
    );
    assert.strictEqual(greetings.length, 1, 'greeting should be emitted once');
    assert.ok(buttons.isActive('post', 'messenger'), 'Post should be active');
    svc.dispose();
  });

  it('unlocks Post when dialog starts with a user turn even before widget ready', async () => {
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
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = { load: () => [], save() {} };
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

    svc._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'user', text: 'Hi there' },
              { author: 'ghost', text: 'Hello' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await flushEvents();
    await flushEvents();

    // Post should be enabled immediately via gate even without widget readiness
    const awaiting = bus.events.find((e) => e.type === DIALOG_AWAITING_INPUT_CHANGED && e.awaits);
    assert.ok(awaiting, 'awaiting user input event should fire');
    assert.ok(buttons.isActive('post', 'messenger'), 'Post should be active before widget ready');

    // No messages should have been emitted yet
    const msgs = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY);
    assert.strictEqual(msgs.length, 0, 'no messages before user reply');

    svc.dispose();
  });

  it('emits greeting once when widget ready precedes screen change', async () => {
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
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = { load: () => [], save() {} };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};

    class Gate {
      constructor(dialogManager, bus) {
        this.dialogManager = dialogManager;
        this.bus = bus;
      }
      advanceToUserTurn() {
        const dlg = this.dialogManager.dialog;
        const upcoming = dlg?.messages?.[dlg.index];
        if (upcoming && upcoming.author === 'user') {
          this.bus.emit({
            type: DIALOG_AWAITING_INPUT_CHANGED,
            awaits: true,
            kind: 'user_text',
            targetScreen: 'messenger',
          });
        } else {
          this.bus.emit({
            type: DIALOG_AWAITING_INPUT_CHANGED,
            awaits: false,
            kind: null,
            targetScreen: null,
          });
        }
      }
    }
    const gate = new Gate(dialogManager, bus);

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
              { author: 'ghost', text: 'Hello from the guide' },
              { author: 'user', text: 'Hi' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();

    bus.emit({ type: DIALOG_WIDGET_READY });
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await flushEvents();
    await flushEvents();

    const greetings = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.text === 'Hello from the guide',
    );
    assert.strictEqual(greetings.length, 1, 'greeting should be emitted once');
    assert.ok(buttons.isActive('post', 'messenger'), 'Post should be active');
    svc.dispose();
  });

  it('auto progresses ghost messages when input gate missing', async () => {
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
    const historyService = { load: () => [], save() {} };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};

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
      null,
      bus,
    );

    svc._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'Hello from the guide' },
              { author: 'user', text: 'Hi' },
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

    const greetings = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.text === 'Hello from the guide',
    );
    assert.strictEqual(greetings.length, 1, 'greeting should emit even without input gate');
    svc.dispose();
  });

  it('unlocks Post after switching ghosts', async () => {
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
    let currentGhost = 'guide';
    const ghostService = {
      getCurrentGhost: () => ({ name: currentGhost }),
    };
    const historyService = { load: () => [], save() {} };
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

    svc._loadConfig = async (name) => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: `${name} hello` },
              { author: 'user', text: 'reply' },
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

    const before = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY).length;
    // Complete guide dialog, leaving postLocked true
    bus.emit({ type: 'post' });
    await flushEvents();
    const after = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY).length;
    assert.strictEqual(after - before, 1, 'posting should emit one message');

    // Switch to guest1
    currentGhost = 'guest1';
    bus.emit({ type: 'GHOST_CHANGE', payload: { name: 'guest1' } });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    assert.strictEqual(svc.postLocked, false, 'post lock should reset');
    svc.dispose();
  });
});
