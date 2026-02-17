import assert from 'assert';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import DialogHistoryBuffer from '../../../src/application/services/DialogHistoryBuffer.js';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import {
  APP_RESET_COMPLETED,
  DIALOG_CLEAR,
  GHOST_REBOOT_COMPLETED,
  GHOST_REBOOT_REQUESTED,
  GHOST_RESET_COMPLETED,
  GHOST_RESET_REQUESTED
} from '../../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach(handler => handler(evt));
  }
}

describe('DialogOrchestratorService reset handling', () => {
  it('clears runtime state on app reset completion', async () => {
    const bus = new Bus();
    const dialogManager = new DialogManager(new Dialog([{ author: 'ghost', text: 'hi' }]), bus, null);
    const dualityManager = {
      load() {},
      getCurrentDialog() {
        return dialogManager.dialog;
      },
      start() {},
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = {
      resetCalled: 0,
      reset() {
        this.resetCalled += 1;
      }
    };
    const historyBuffer = new DialogHistoryBuffer();
    historyBuffer.append({ author: 'ghost', text: 'hi', type: 'text' });
    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      null,
      { setScreenVisibility() {} },
      historyService,
      { getUserAvatar: async () => '' },
      null,
      {},
      null,
      bus,
      null,
      historyBuffer
    );
    svc.boot();
    svc.started = true;
    svc.onMessenger = true;
    svc.currentGhost = 'guide';
    svc._widgetReady = true;
    svc.initializedGhosts.add('guide');
    svc.postLocked = true;
    svc._pendingPosts = [{ author: 'user', text: 'hello' }];

    bus.emit({ type: APP_RESET_COMPLETED });
    await Promise.resolve();

    assert.strictEqual(historyBuffer.getAll().length, 0);
    assert.strictEqual(svc.started, false);
    assert.strictEqual(svc.onMessenger, false);
    assert.strictEqual(svc.currentGhost, null);
    assert.strictEqual(svc._widgetReady, false);
    assert.strictEqual(svc.postLocked, false);
    assert.strictEqual(historyService.resetCalled, 1);
  });

  it('clears current ghost history and dialog state on ghost reset', async () => {
    const bus = new Bus();
    const dialogManager = new DialogManager(new Dialog([]), bus, null);
    const dualityManager = {
      loaded: null,
      resetCalls: [],
      load(config) {
        this.loaded = config;
        this.dialog = new Dialog(config.stages[0].event.messages);
      },
      getCurrentDialog() {
        return this.dialog;
      },
      resetProgress(config) {
        this.resetCalls.push(config);
      },
      start() {},
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = {
      clearCalls: [],
      clear(ghost) {
        this.clearCalls.push(ghost);
      },
      clearSeen() {},
      has() {
        return false;
      },
      markSeen() {}
    };
    const historyBuffer = new DialogHistoryBuffer();
    historyBuffer.append({ author: 'ghost', text: 'older message', type: 'text' });
    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      null,
      { setScreenVisibility() {} },
      historyService,
      { getUserAvatar: async () => '' },
      null,
      {},
      { advanceToUserTurn() {} },
      bus,
      null,
      historyBuffer
    );
    svc.boot();
    svc.started = true;
    svc.onMessenger = true;
    svc.currentGhost = 'guide';
    svc._widgetReady = true;
    svc.initializedGhosts.add('guide');
    const config = {
      id: 'guide',
      avatar: 'avatar.png',
      stages: [
        {
          event: {
            messages: [{ author: 'ghost', text: 'fresh start' }]
          }
        }
      ]
    };
    svc._loadConfig = async () => config;
    svc._prepareConfig = async () => ({ cfg: config, userAvatar: '' });

    bus.emit({ type: GHOST_RESET_REQUESTED });
    await Promise.resolve();

    assert.deepStrictEqual(historyService.clearCalls, ['guide']);
    assert.strictEqual(historyBuffer.getAll().length, 0);
    assert.deepStrictEqual(dualityManager.resetCalls, [config]);
    assert.strictEqual(dualityManager.loaded, config);
    assert.strictEqual(dialogManager.dialog.index, 0);
    assert.ok(bus.events.some(evt => evt.type === DIALOG_CLEAR));
    assert.ok(bus.events.some(evt => evt.type === GHOST_RESET_COMPLETED));
  });

  it('reboots current ghost from saved checkpoint history', async () => {
    const bus = new Bus();
    const dialogManager = new DialogManager(new Dialog([]), bus, null);
    const dualityManager = {
      loaded: null,
      resetCalls: [],
      load(config) {
        this.loaded = config;
        this.dialog = new Dialog(config.stages[0].event.messages);
      },
      getCurrentDialog() {
        return this.dialog;
      },
      resetProgress(config) {
        this.resetCalls.push(config);
      },
      start() {},
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      }
    };
    const checkpointService = {
      getCheckpoint() {
        return {
          history: [{ author: 'ghost', text: 'checkpoint ghost', fingerprint: 'cp-1' }]
        };
      }
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = {
      load() {
        return [];
      },
      has() {
        return false;
      },
      markSeen() {}
    };
    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      null,
      { setScreenVisibility() {} },
      historyService,
      { getUserAvatar: async () => '' },
      null,
      {},
      { advanceToUserTurn() {} },
      bus,
      null,
      new DialogHistoryBuffer(),
      undefined,
      undefined,
      checkpointService
    );
    svc.boot();
    svc.onMessenger = true;
    svc._widgetReady = true;
    const config = {
      id: 'guide',
      avatar: 'avatar.png',
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'checkpoint ghost' },
              { author: 'user', text: 'next user' }
            ]
          }
        }
      ]
    };
    svc._loadConfig = async () => config;
    svc._prepareConfig = async () => ({ cfg: config, userAvatar: '' });

    bus.emit({ type: GHOST_REBOOT_REQUESTED });
    await Promise.resolve();

    assert.deepStrictEqual(dualityManager.resetCalls, [config]);
    assert.strictEqual(dialogManager.dialog.index, 1);
    assert.ok(bus.events.some(evt => evt.type === DIALOG_CLEAR));
    assert.ok(bus.events.some(evt => evt.type === GHOST_REBOOT_COMPLETED));
  });
});
