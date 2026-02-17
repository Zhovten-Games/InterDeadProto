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

describe('DialogOrchestratorService pending post replay', () => {
  it('replays a post made before widget readiness', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus); screen.boot();
    const store = { save() {}, load() { return {}; } };
    const buttons = new ButtonStateService(bus, store, screen); buttons.boot();

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) { this.dialog = new Dialog(cfg.stages[0].event.messages); },
      start() {},
      getCurrentDialog() { return this.dialog; },
      completeCurrentEvent() {},
      isQuestActive() { return false; }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = {
      load: () => [{ author: 'ghost', text: 'Hello' }],
      save() {},
      clearSeen() {},
      has() {},
      markSeen() {}
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
      historyService,
      avatarService,
      ghostSwitchService,
      spiritConfigs,
      gate,
      bus
    );

    orchestrator._loadConfig = async () => ({
      stages: [{ event: { messages: [
        { author: 'ghost', text: 'Hello' },
        { author: 'user', text: 'Hi' }
      ] } }]
    });
    orchestrator._prepareConfig = async (_g, cfg) => ({ cfg: { ...cfg, avatar: '' }, userAvatar: '' });

    orchestrator.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    // Wait for dialog setup to complete
    await Promise.resolve();
    await Promise.resolve();
    // User posts before widget is ready
    bus.emit({ type: 'post' });
    // Allow post handler to enqueue the message
    await Promise.resolve();
    // Simulate buffer loss during reload
    orchestrator.historyBuffer.clear();
    // Widget now becomes ready
    bus.emit({ type: DIALOG_WIDGET_READY });
    await Promise.resolve();
    await Promise.resolve();

    const messages = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.replay);
    assert.strictEqual(messages.length, 2);
    assert.strictEqual(messages[1].author, 'user');
    assert.strictEqual(messages[1].text, 'Hi');

    orchestrator.dispose();
  });
});
