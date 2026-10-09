import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
import ProfileRegistrationService from '../../../src/identity/application/profile-registration-service.js';
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

describe('Dialog avatar refresh', () => {
  it('applies saved avatar to user messages after profile registration', async () => {
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
              { author: 'user', text: 'Hi there' },
            ],
          },
        },
      ],
    });

    orchestrator.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const dbService = {
      saveUser: async (profile) => {
        avatarValue = profile.avatar;
      },
    };
    const enc = {};
    const profileSvc = new ProfileRegistrationService(dbService, enc, null, bus);
    profileSvc.setName('Alice');
    profileSvc.setAvatar('selfie');
    await profileSvc.saveProfile();
    await flushEvents();

    bus.emit({ type: 'post', text: 'hi' });
    await flushEvents();

    const userMsg = bus.events.find((e) => e.type === EVENT_MESSAGE_READY && e.author === 'user');
    assert.strictEqual(userMsg.avatar, 'selfie');
    orchestrator.dispose();
  });
});
