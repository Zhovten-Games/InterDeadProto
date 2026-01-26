import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import DialogInputGateService from '../../../src/application/services/DialogInputGateService.js';
import ProfileRegistrationService from '../../../src/application/services/ProfileRegistrationService.js';
import { DIALOG_WIDGET_READY, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

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

describe('Dialog avatar refresh', () => {
  it('applies saved avatar to user messages after profile registration', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus); screen.boot();
    const store = { save() {}, load() { return {}; } };
    const buttons = new ButtonStateService(bus, store, screen); buttons.boot();

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) { this.dialog = new Dialog(cfg.stages[0].event.messages); },
      start() { dialogManager.progress(); },
      getCurrentDialog() { return this.dialog; },
      completeCurrentEvent() {},
      isQuestActive() { return false; }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = { load: () => [], save() {}, has() {}, markSeen() {} };
    let avatarValue = '';
    const avatarService = { getUserAvatar: async () => avatarValue };
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
      stages: [
        { event: { messages: [
          { author: 'ghost', text: 'Hello' },
          { author: 'user', text: 'Hi there' }
        ] } }
      ]
    });

    orchestrator.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await Promise.resolve();
    await Promise.resolve();

    const dbService = { saveUser: async profile => { avatarValue = profile.avatar; } };
    const enc = {};
    const profileSvc = new ProfileRegistrationService(dbService, enc, null, bus);
    profileSvc.setName('Alice');
    profileSvc.setAvatar('selfie');
    await profileSvc.saveProfile();
    await Promise.resolve();

    bus.emit({ type: 'post', text: 'hi' });
    await Promise.resolve();

    const userMsg = bus.events.find(e => e.type === EVENT_MESSAGE_READY && e.author === 'user');
    assert.strictEqual(userMsg.avatar, 'selfie');
    orchestrator.dispose();
  });
});
