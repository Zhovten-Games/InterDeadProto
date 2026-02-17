import assert from 'assert';
import DialogInputGateService from '../../../src/application/services/DialogInputGateService.js';
import ButtonStateService from '../../../src/application/services/ButtonStateService.js';
import ScreenService from '../../../src/application/services/ScreenService.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import Dialog from '../../../src/core/dialog/Dialog.js';
import { DIALOG_AWAITING_INPUT_CHANGED, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

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

describe('Dialog post progression', () => {
  it('emits one ghost message and unlocks Post after clicking', () => {
    const bus = new Bus();
    const screen = new ScreenService(bus); screen.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    const store = { save() {}, load() { return {}; } };
    const buttons = new ButtonStateService(bus, store, screen); buttons.boot();

    const dialog = new Dialog([
      { author: 'ghost', text: 'start', fingerprint: 'g1' },
      { author: 'user', text: 'hi', fingerprint: 'u1' },
      { author: 'ghost', text: 'reply', fingerprint: 'g2' },
      { author: 'user', text: 'next', fingerprint: 'u2' }
    ]);
    const manager = new DialogManager(dialog, bus, null);
    const gate = new DialogInputGateService(manager, { isQuestActive: () => false }, bus);

    // Progress initial ghost line and simulate awaiting user input.
    manager.progress();
    bus.emit({
      type: DIALOG_AWAITING_INPUT_CHANGED,
      awaits: true,
      kind: 'user_text',
      targetScreen: 'messenger'
    });

    const ghostBefore = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.author === 'ghost').length;

    // Simulate clicking Post: progress user line then let the gate
    // traverse ghost messages.
    manager.progress();
    gate.advanceToUserTurn();

    const ghostAfter = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.author === 'ghost').length;
    assert.strictEqual(ghostAfter - ghostBefore, 1);
    assert.ok(buttons.isActive('post', 'messenger'));

    const lastAwait = bus.events.filter(e => e.type === DIALOG_AWAITING_INPUT_CHANGED).pop();
    assert.ok(lastAwait?.awaits);
    assert.strictEqual(lastAwait.kind, 'user_text');
    assert.strictEqual(lastAwait.targetScreen, 'messenger');
  });
});
