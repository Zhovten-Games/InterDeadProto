import assert from 'assert';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import DialogInputGateService from '../../../src/application/services/DialogInputGateService.js';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import { DIALOG_WIDGET_READY, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class Bus {
  constructor(){ this.handlers = []; this.events = []; }
  subscribe(fn){ this.handlers.push(fn); }
  unsubscribe(fn){ this.handlers = this.handlers.filter(h => h!==fn); }
  emit(evt){ this.events.push(evt); this.handlers.slice().forEach(h=>h(evt)); }
}

describe('Cold start without duplicates', () => {
  it('emits the first ghost line only once after widget ready', async () => {
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
    const historyService = { load: () => [], save(){} };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};

    const gate = new DialogInputGateService(dialogManager, dualityManager, bus);
    gate.boot();

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

    svc._loadConfig = async () => ({ stages: [{ event: { messages: [
      { author: 'ghost', text: 'Hi', fingerprint: 'g1' },
      { author: 'user', text: 'Ok', fingerprint: 'u1' }
    ] } }] });
    svc._prepareConfig = async (_g, cfg) => ({ cfg: { ...cfg, avatar: '' }, userAvatar: '' });

    svc.boot();

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    const before = bus.events.filter(e => e.type === EVENT_MESSAGE_READY);
    assert.strictEqual(before.length, 0, 'no messages before widget ready');

    bus.emit({ type: DIALOG_WIDGET_READY });
    await Promise.resolve();
    await Promise.resolve();

    const after = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1');
    assert.strictEqual(after.length, 1, 'greeting emitted once');
    svc.dispose();
  });
});
