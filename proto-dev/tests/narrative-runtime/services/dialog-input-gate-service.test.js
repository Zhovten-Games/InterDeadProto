import assert from 'assert';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';

class Bus {
  constructor() {
    this.subs = [];
  }
  subscribe(fn) {
    this.subs.push(fn);
  }
  unsubscribe(fn) {
    this.subs = this.subs.filter((f) => f !== fn);
  }
  emit(evt) {
    this.subs.slice().forEach((f) => f(evt));
  }
}

describe('DialogInputGateService', () => {
  it('activates post on dialog start', () => {
    const bus = new Bus();
    const screen = new ScreenService(bus);
    screen.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    const store = {
      save() {},
      load() {
        return {};
      },
    };
    const buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();
    const dialog = new Dialog([{ author: 'user', text: 'hello' }]);
    const mgr = new DialogManager(dialog, bus, null);
    const gate = new DialogInputGateService(mgr, { isQuestActive: () => false }, bus);
    gate.boot();
    gate.advanceToUserTurn();
    assert.ok(buttons.isActive('post', 'messenger'));
  });

  it('keeps capture button disabled until detection succeeds', () => {
    const bus = new Bus();
    const screen = new ScreenService(bus);
    screen.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    const store = {
      save() {},
      load() {
        return {};
      },
    };
    const buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();
    const mgr = new DialogManager(new Dialog([]), bus, null);
    const gate = new DialogInputGateService(mgr, { isQuestActive: () => true }, bus);
    gate.boot();
    gate.advanceToUserTurn();
    assert.strictEqual(buttons.isActive('capture-btn', 'camera'), false);
  });

  it('restores state after reload', () => {
    const bus = new Bus();
    const screen = new ScreenService(bus);
    screen.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    const memory = {};
    const store = {
      save(k, v) {
        memory[k] = v;
      },
      load(k) {
        return memory[k];
      },
    };
    let buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();
    const mgr = new DialogManager(new Dialog([{ author: 'user', text: 'hi' }]), bus, null);
    let gate = new DialogInputGateService(mgr, { isQuestActive: () => false }, bus);
    gate.boot();
    gate.advanceToUserTurn();
    assert.ok(buttons.isActive('post', 'messenger'));
    // simulate reload
    buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();
    gate = new DialogInputGateService(mgr, { isQuestActive: () => false }, bus);
    gate.boot();
    gate.advanceToUserTurn();
    assert.ok(buttons.isActive('post', 'messenger'));
  });
});
