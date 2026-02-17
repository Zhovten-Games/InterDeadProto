import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import DialogHistoryService from '../../../src/application/services/DialogHistoryService.js';
import { DIALOG_CLEAR, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class Bus {
  constructor() {
    this.events = [];
  }
  subscribe() {}
  emit(evt) {
    this.events.push(evt);
  }
}

describe('DialogOrchestratorService ghost switch clearing', () => {
  it('clears widget when switching to ghost with empty history', () => {
    const bus = new Bus();
    const historyService = new DialogHistoryService();
    const svc = new DialogOrchestratorService(
      null,
      null,
      null,
      null,
      null,
      historyService,
      null,
      null,
      {},
      null,
      bus
    );

    // Initial ghost with existing history
    svc.currentGhost = 'g1';
    svc._replayHistory([{ author: 'ghost', text: 'hi', fingerprint: 'fp1' }]);

    // Switch to new ghost with no stored history
    svc.currentGhost = 'g2';
    svc._replayHistory([]);

    const readyEvents = bus.events.filter(e => e.type === EVENT_MESSAGE_READY);
    const clearEvents = bus.events.filter(e => e.type === DIALOG_CLEAR);

    assert.strictEqual(clearEvents.length, 2);
    assert.strictEqual(readyEvents.length, 1);
    assert.strictEqual(bus.events.at(-1).type, DIALOG_CLEAR);
  });
});
