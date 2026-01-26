import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import DialogHistoryService from '../../../src/application/services/DialogHistoryService.js';
import { DIALOG_CLEAR, EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class Bus {
  constructor() { this.events = []; }
  subscribe() {}
  emit(evt) { this.events.push(evt); }
}

describe('DialogOrchestratorService history replay idempotency', () => {
  it('does not emit duplicates when replaying history multiple times', () => {
    const bus = new Bus();
    const historyService = new DialogHistoryService();
    const ghostService = { getCurrentGhost: () => ({ name: 'g' }) };
    const svc = new DialogOrchestratorService(
      null,
      null,
      ghostService,
      null,
      null,
      historyService,
      null,
      null,
      {},
      null,
      bus
    );
    svc.currentGhost = 'g';
    const history = [{ author: 'ghost', text: 'hi', fingerprint: 'fp1' }];

    svc._replayHistory(history);
    svc._replayHistory(history);

    const readyEvents = bus.events.filter(e => e.type === EVENT_MESSAGE_READY);
    const clearEvents = bus.events.filter(e => e.type === DIALOG_CLEAR);

    assert.strictEqual(readyEvents.length, 1);
    assert.strictEqual(clearEvents.length, 1);
  });
});
