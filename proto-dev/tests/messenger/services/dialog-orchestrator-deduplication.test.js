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

describe('DialogOrchestratorService message deduplication', () => {
  it('avoids duplicates when widget readiness follows history replay', async () => {
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
    const historyService = {
      load: () => [{ author: 'ghost', text: 'old', fingerprint: 'oldfp' }],
      save() {},
    };
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
              { author: 'ghost', text: 'old', fingerprint: 'oldfp' },
              { author: 'ghost', text: 'new', fingerprint: 'newfp' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();
    // Widget ready before screen change to ensure replay occurs
    bus.emit({ type: DIALOG_WIDGET_READY });
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await flushEvents();
    await flushEvents();

    // Simulate widget becoming ready again
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();

    const counts = {};
    bus.events
      .filter((e) => e.type === EVENT_MESSAGE_READY)
      .forEach((e) => {
        counts[e.fingerprint] = (counts[e.fingerprint] || 0) + 1;
      });
    assert.deepStrictEqual(counts, { newfp: 1 });
    assert.deepStrictEqual(
      svc.timeline.getSnapshot().messages.map((row) => row.fingerprint),
      ['oldfp', 'newfp'],
    );
    svc.dispose();
  });

  it('replays auto-progressed lines once widget becomes ready', async () => {
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
      load: () => [{ author: 'ghost', text: 'old', fingerprint: 'old' }],
      save() {},
    };
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
              { author: 'ghost', text: 'old', fingerprint: 'old' },
              { author: 'ghost', text: 'next', fingerprint: 'new' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });

    const readyIdx = bus.events.length;
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const after = bus.events.slice(readyIdx).filter((e) => e.type === EVENT_MESSAGE_READY);
    const counts = {};
    after.forEach((e) => {
      counts[e.fingerprint] = (counts[e.fingerprint] || 0) + 1;
    });
    assert.deepStrictEqual(counts, { new: 1 });
    assert.deepStrictEqual(
      svc.timeline.getSnapshot().messages.map((row) => row.fingerprint),
      ['old', 'new'],
    );
    svc.dispose();
  });

  it('deduplicates messages when widget readiness repeats after progress', async () => {
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
    const storeList = [];
    const historyService = {
      load: () => [...storeList],
      save() {},
      append(_g, msgs) {
        storeList.push(...msgs);
      },
    };
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
      { author: 'ghost', text: 'three', fingerprint: 'fp3' },
    ];
    svc._loadConfig = async () => ({ stages: [{ event: { messages: msgs } }] });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    for (let i = 1; i < msgs.length; i++) {
      dialogManager.progress();
      await flushEvents();
      bus.emit({ type: DIALOG_WIDGET_READY });
      await flushEvents();
    }

    const counts = {};
    bus.events
      .filter((e) => e.type === EVENT_MESSAGE_READY)
      .forEach((e) => {
        counts[e.fingerprint] = (counts[e.fingerprint] || 0) + 1;
      });
    assert.deepStrictEqual(counts, { fp1: 1, fp2: 1, fp3: 1 });
    svc.dispose();
  });

  it('emits each line once when switching ghosts', async () => {
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

    svc._loadConfig = async (name) => ({
      stages: [{ event: { messages: [{ author: 'ghost', text: name, fingerprint: name }] } }],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    current = { name: 'second' };
    bus.emit({ type: 'GHOST_CHANGE' });
    await flushEvents();
    await flushEvents();

    const counts = {};
    bus.events
      .filter((e) => e.type === EVENT_MESSAGE_READY)
      .forEach((e) => {
        counts[e.fingerprint] = (counts[e.fingerprint] || 0) + 1;
      });
    assert.deepStrictEqual(counts, { guide: 1, second: 1 });
    svc.dispose();
  });

  it('emits ghost reply once after posting', async () => {
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

    svc._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'start', fingerprint: 'g1' },
              { author: 'user', text: 'reply', fingerprint: 'u1' },
              { author: 'ghost', text: 'response', fingerprint: 'g2' },
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

    bus.emit({ type: 'post' });
    await flushEvents();
    await flushEvents();

    const counts = {};
    bus.events
      .filter((e) => e.type === EVENT_MESSAGE_READY)
      .forEach((e) => {
        counts[e.fingerprint] = (counts[e.fingerprint] || 0) + 1;
      });
    assert.deepStrictEqual(counts, { g1: 1, u1: 1, g2: 1 });
    svc.dispose();
  });

  it('emits opening ghost line only once when widget becomes ready later', async () => {
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
              { author: 'ghost', text: 'start', fingerprint: 'g1' },
              { author: 'user', text: 'reply', fingerprint: 'u1' },
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
    const beforeReady = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY);
    assert.strictEqual(beforeReady.length, 1, 'ghost line emitted once before widget ready');

    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const total = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1',
    );
    assert.strictEqual(total.length, 1, 'ghost line should not duplicate after readiness');
    svc.dispose();
  });
});
