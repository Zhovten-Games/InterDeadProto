import assert from 'assert';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import DialogInputGateService from '../../../src/application/services/DialogInputGateService.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) { this.events.push(evt); this.handlers.slice().forEach(h => h(evt)); }
}

describe('DialogInputGateService ghost deduplication', () => {
  it('does not re-emit ghost lines when called repeatedly', () => {
    const bus = new Bus();
    const dialog = new Dialog([
      { author: 'ghost', text: 'one', fingerprint: 'g1' },
      { author: 'ghost', text: 'two', fingerprint: 'g2' },
      { author: 'user', text: 'reply', fingerprint: 'u1' }
    ]);
    const manager = new DialogManager(dialog, bus, null);
    const gate = new DialogInputGateService(manager, { isQuestActive: () => false }, bus);

    gate.advanceToUserTurn();
    const first = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.author === 'ghost').length;

    // Second evaluation should not emit additional ghost messages
    gate.advanceToUserTurn();
    const second = bus.events.filter(e => e.type === EVENT_MESSAGE_READY && e.author === 'ghost').length;

    assert.strictEqual(second, first);
  });
});
