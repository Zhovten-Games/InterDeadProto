import assert from 'assert';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import { DIALOG_AWAITING_INPUT_CHANGED } from '../../../src/core/events/constants.js';

class Bus {
  constructor() { this.handlers = []; this.events = []; }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) { this.events.push(evt); this.handlers.slice().forEach(h => h(evt)); }
}

class Gate {
  constructor(bus) { this.bus = bus; }
  advanceToUserTurn(dlg) {
    const upcoming = dlg?.messages?.[dlg.index];
    const awaits = !!upcoming && upcoming.author === 'user';
    this.bus.emit({
      type: DIALOG_AWAITING_INPUT_CHANGED,
      awaits,
      kind: awaits ? 'user_text' : null,
      targetScreen: awaits ? 'messenger' : null
    });
  }
}

describe('DialogOrchestratorService ghost switch awaiting reset', () => {
  it('emits awaits=false when returning to completed ghost', async () => {
    const bus = new Bus();
    const guideMessages = [
      { author: 'ghost', text: 'hi', fingerprint: 'g1' },
      { author: 'user', text: 'ok', fingerprint: 'u1' }
    ];
    const guestMessages = [
      { author: 'ghost', text: 'hey', fingerprint: 'g2' },
      { author: 'user', text: 'reply', fingerprint: 'u2' }
    ];
    const dialogManager = new DialogManager(new Dialog(guideMessages), bus, null);
    dialogManager.dialog.restore(guideMessages.length); // guide completed
    const dualityManager = {
      load(cfg) { this.dialog = new Dialog(cfg.stages[0].event.messages); },
      start() { dialogManager.progress(); },
      getCurrentDialog() { return this.dialog; },
      completeCurrentEvent() {},
      isQuestActive() { return false; }
    };
    let current = { name: 'guide' };
    const ghostService = { getCurrentGhost: () => current };
    const historyService = {
      load: name => (name === 'guide' ? guideMessages : []),
      save() {},
      append() {},
      clearSeen() {}
    };
    const gate = new Gate(bus);
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
      gate,
      bus
    );
    svc.boot();
    svc.started = true;
    svc._widgetReady = true;
    svc.onMessenger = true;
    svc.currentGhost = 'guide';
    svc._loadConfig = async name => ({
      stages: [{ event: { messages: name === 'guide' ? guideMessages : guestMessages } }]
    });
    svc._prepareConfig = async (_g, cfg) => ({ cfg: { ...cfg, avatar: '' }, userAvatar: '' });

    // Switch to guest1, awaiting user input
    current = { name: 'guest1' };
    bus.emit({ type: 'GHOST_CHANGE' });
    await Promise.resolve();
    await Promise.resolve();
    const lastAwaitTrue = bus.events.filter(e => e.type === DIALOG_AWAITING_INPUT_CHANGED).pop();
    assert.ok(lastAwaitTrue.awaits);

    // Switch back to completed guide; should emit awaits=false
    current = { name: 'guide' };
    bus.emit({ type: 'GHOST_CHANGE' });
    await Promise.resolve();
    await Promise.resolve();
    const lastAwaitFalse = bus.events.filter(e => e.type === DIALOG_AWAITING_INPUT_CHANGED).pop();
    assert.strictEqual(lastAwaitFalse.awaits, false);
  });
});
