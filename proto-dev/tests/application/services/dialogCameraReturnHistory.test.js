import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import DialogInputGateService from '../../../src/application/services/DialogInputGateService.js';
import { DIALOG_WIDGET_READY, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach(h => h(evt));
  }
}

describe('DialogOrchestratorService camera return', () => {
  it('replays history when returning from camera without duplicates', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus); screen.boot();
    const store = { save(){}, load(){ return {}; } };
    const buttons = new ButtonStateService(bus, store, screen); buttons.boot();

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg){ this.dialog = new Dialog(cfg.stages[0].event.messages); },
      start(){ dialogManager.progress(); },
      getCurrentDialog(){ return this.dialog; },
      completeCurrentEvent(){},
      isQuestActive(){ return false; }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyStore = [];
    const historyService = {
      load: () => [...historyStore],
      save(){},
      append(_g, msgs){ historyStore.push(...msgs); }
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
      { setScreenVisibility(){} },
      historyService,
      avatarService,
      ghostSwitchService,
      spiritConfigs,
      gate,
      bus
    );

    svc._loadConfig = async () => ({
      stages: [{ event: { messages: [
        { author: 'ghost', text: 'hello', fingerprint: 'g1' },
        { author: 'user', text: 'ok', fingerprint: 'u1' }
      ] } }]
    });
    svc._prepareConfig = async (_g, cfg) => ({ cfg: { ...cfg, avatar: '' }, userAvatar: '' });

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await Promise.resolve();
    await Promise.resolve();

    // Progress user reply
    bus.emit({ type: 'post' });
    await Promise.resolve();

    const initialGhost = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && !e.replay && e.fingerprint === 'g1');
    const initialUser = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && !e.replay && e.fingerprint === 'u1');
    assert.strictEqual(initialGhost.length, 1);
    assert.strictEqual(initialUser.length, 1);

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await Promise.resolve();
    await Promise.resolve();

    const replayGhost = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.replay && e.fingerprint === 'g1');
    const replayUser = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.replay && e.fingerprint === 'u1');
    assert.strictEqual(replayGhost.length, 1);
    assert.strictEqual(replayUser.length, 1);
    const totalGhost = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1');
    const totalUser = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'u1');
    assert.strictEqual(totalGhost.length, 2);
    assert.strictEqual(totalUser.length, 2);
    svc.dispose();
  });

  it('preserves order without duplicates across repeated screen toggles', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus); screen.boot();
    const store = { save(){}, load(){ return {}; } };
    const buttons = new ButtonStateService(bus, store, screen); buttons.boot();

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg){ this.dialog = new Dialog(cfg.stages[0].event.messages); },
      start(){ dialogManager.progress(); },
      getCurrentDialog(){ return this.dialog; },
      completeCurrentEvent(){},
      isQuestActive(){ return false; }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = {
      load: () => [
        { author: 'ghost', text: 'hello', fingerprint: 'g1' },
        { author: 'user', text: 'ok', fingerprint: 'u1' }
      ],
      save(){}
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
      { setScreenVisibility(){} },
      historyService,
      avatarService,
      ghostSwitchService,
      spiritConfigs,
      gate,
      bus
    );

    svc._loadConfig = async () => ({
      stages: [{ event: { messages: [
        { author: 'ghost', text: 'hello', fingerprint: 'g1' },
        { author: 'user', text: 'ok', fingerprint: 'u1' }
      ] } }]
    });
    svc._prepareConfig = async (_g, cfg) => ({ cfg: { ...cfg, avatar: '' }, userAvatar: '' });

    svc.boot();

    const cycle = async () => {
      bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
      bus.emit({ type: DIALOG_WIDGET_READY });
      await Promise.resolve();
      await Promise.resolve();
      bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    };

    // Perform three messenger entries
    await cycle();
    await cycle();
    await cycle();

    const sequence = bus.events
      .filter(e => e.type === EVENT_MESSAGE_READY)
      .map(e => e.fingerprint);
    assert.deepStrictEqual(sequence, ['g1', 'u1', 'g1', 'u1', 'g1', 'u1']);
    svc.dispose();
  });
});
