import { adaptHistoryPort } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import DialogHistoryService from '../../../src/messenger/history/dialog-history-service.js';
import { DIALOG_CLEAR, EVENT_MESSAGE_READY } from '../../../src/runtime-events/domain/constants.js';

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
      adaptHistoryPort(historyService),
      null,
      null,
      {},
      null,
      bus,
    );

    // Initial ghost with existing history
    svc.currentGhost = 'g1';
    svc._replayHistory([{ author: 'ghost', text: 'hi', fingerprint: 'fp1' }]);

    // Switch to new ghost with no stored history
    svc.currentGhost = 'g2';
    svc._replayHistory([]);

    const readyEvents = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY);
    const clearEvents = bus.events.filter((e) => e.type === DIALOG_CLEAR);

    assert.strictEqual(clearEvents.length, 0);
    const snapshots = bus.events.filter((event) => event.type === 'DIALOG_HISTORY_REPLACED');
    assert.deepStrictEqual(
      snapshots.map((event) => [event.snapshot.ghost, event.snapshot.messages.length]),
      [
        ['g1', 1],
        ['g2', 0],
      ],
    );
    assert.strictEqual(readyEvents.length, 0);
    assert.strictEqual(bus.events.at(-1).type, 'DIALOG_HISTORY_REPLACED');
  });
});
