import { adaptHistoryPort, cameraSessionPort } from '../fixtures/port-contracts.js';
import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../src/app-shell/navigation/view-service.js';
import GlobalViewPresenter from '../../src/app-shell/presentation/global-view-presenter.js';
import DialogOrchestratorService from '../../src/messenger/application/dialog-orchestrator-service.js';
import DialogManager from '../../src/narrative-runtime/dialog/dialog-manager.js';
import Dialog from '../../src/narrative-runtime/dialog/dialog.js';
import ButtonStateService from '../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../src/app-shell/navigation/screen-service.js';
import { DIALOG_AWAITING_INPUT_CHANGED } from '../../src/runtime-events/domain/constants.js';

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
  async renderSection(target, screen) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (screen === 'messenger') {
      el.innerHTML = '<div data-js="dialog-list"></div><div data-js="posts-list"></div>';
    } else {
      el.innerHTML = '';
    }
  }
  async render(_tpl, data) {
    return `<div>${data.text}</div>`;
  }
}

describe('Messenger initial greeting', () => {
  it('renders guide greeting on first load', async () => {
    const dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>');
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

    const dialogManager = new DialogManager(new Dialog([]), bus, store);
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
    const visibility = { setScreenVisibility() {} };
    class Gate {
      constructor(dialogManager, bus) {
        this.dialogManager = dialogManager;
        this.bus = bus;
      }
      advanceToUserTurn() {
        const dlg = this.dialogManager.dialog;
        const upcoming = dlg?.messages?.[dlg.index];
        this.bus.emit({
          type: DIALOG_AWAITING_INPUT_CHANGED,
          awaits: upcoming && upcoming.author === 'user',
          kind: upcoming && upcoming.author === 'user' ? 'user_text' : null,
          targetScreen: upcoming && upcoming.author === 'user' ? 'messenger' : null,
        });
      }
    }
    const gate = new Gate(dialogManager, bus);

    const orchestrator = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      buttons,
      visibility,
      adaptHistoryPort(historyService),
      avatarService,
      ghostSwitchService,
      {},
      gate,
      bus,
    );
    orchestrator._loadConfig = async () => ({
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
    orchestrator.boot();

    const templateService = new MockTemplate();
    const panelService = { load: async () => {} };
    const languageManager = {
      applyLanguage() {},
      async translate(key) {
        return key;
      },
    };
    const profileRegService = { canProceed: () => true, setName() {} };
    const geoService = { getCurrentLocation: async () => null };
    const db = { loadUser: async () => null };
    const postsService = { getPostsForCurrent: async () => [] };
    const detectionService = {};
    const cameraService = {};
    const cameraSectionManager = {
      stop() {},
      stopDetection() {},
      resumeDetection() {},
      cameraService: { stopStream() {} },
    };
    const notificationManager = {};
    const logger = { error() {} };

    const view = new ViewService(
      templateService,
      panelService,
      languageManager,
      profileRegService,
      geoService,
      db,
      postsService,
      detectionService,
      cameraService,
      cameraSessionPort(cameraSectionManager),
      notificationManager,
      logger,
      store,
      buttons,
      dualityManager,
      bus,
      ghostService,
      historyService,
      { flushTo() {} },
    );
    view.boot();
    const presenter = new GlobalViewPresenter(
      templateService,
      panelService,
      languageManager,
      bus,
      null,
      logger,
    );
    presenter.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    const list = dom.window.document.querySelector('[data-js="dialog-list"]');
    assert.ok(list.textContent.includes('Hello from the guide'));

    presenter.dispose();
    delete global.window;
    delete global.document;
  });
});
