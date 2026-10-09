import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import { JSDOM } from 'jsdom';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
import ProfileRegistrationService from '../../../src/identity/application/profile-registration-service.js';
import AvatarService from '../../../src/identity/application/avatar-service.js';
import DialogWidget from '../../../src/messenger/presentation/dialog-widget.js';
import { DIALOG_WIDGET_READY } from '../../../src/runtime-events/domain/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach((h) => h(evt));
  }
}

class MockTemplate {
  async render(name, data) {
    return `<div>${data.avatarBlock || ''}${data.content || ''}</div>`;
  }
}

describe('Avatar persistence', () => {
  it('renders user avatar after messenger reload', async () => {
    const dom = new JSDOM('<div id="dlg"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

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
    const history = [];
    const historyService = {
      load: () => history,
      save: (_g, msgs) => {
        history.splice(0, history.length, ...msgs);
      },
      appendUnique() {},
      clearSeen() {},
      has: () => false,
      markSeen() {},
    };
    const db = {
      _avatar: null,
      async saveUser(profile) {
        this._avatar = profile.avatar;
      },
      async get() {
        return this._avatar ? { avatar: this._avatar } : null;
      },
    };
    const logger = { info() {}, warn() {} };
    const avatarService = new AvatarService(db, logger);

    const ghostSwitchService = {};
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
      {},
      gate,
      bus,
      logger,
    );
    orchestrator._loadConfig = async () => ({
      avatar: 'ghost-avatar.png',
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

    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const profileSvc = new ProfileRegistrationService(db, {}, null, bus, { setPresence() {} });
    profileSvc.setName('Alice');
    profileSvc.setAvatar('selfie');
    await profileSvc.saveProfile();
    await flushEvents();

    bus.emit({ type: 'post', text: 'hi' });
    await flushEvents();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const html = document.getElementById('dlg').innerHTML;
    assert.ok(html.includes('<img class="dialog__avatar"'));
    assert.ok(!html.includes('dialog__avatar--placeholder'));

    widget.dispose();
    orchestrator.dispose();
    delete global.window;
    delete global.document;
  });

  it('rejects saving profile without avatar', async () => {
    let called = false;
    const db = {
      saveUser: async () => {
        called = true;
      },
    };
    const logger = { warn() {}, info() {} };
    const bus = { emit() {} };
    const svc = new ProfileRegistrationService(db, {}, logger, bus);
    svc.setName('Bob');
    await assert.rejects(() => svc.saveProfile(), /Avatar is required/);
    assert.strictEqual(called, false);
  });
});
