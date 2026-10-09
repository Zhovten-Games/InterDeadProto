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
      adaptHistoryPort(historyService),
      null,
      null,
      {},
      null,
      bus,
    );
    svc.currentGhost = 'g';
    const history = [{ author: 'ghost', text: 'hi', fingerprint: 'fp1' }];

    svc._replayHistory(history);
    svc._replayHistory(history);

    const readyEvents = bus.events.filter((e) => e.type === EVENT_MESSAGE_READY);
    const clearEvents = bus.events.filter((e) => e.type === DIALOG_CLEAR);

    assert.strictEqual(readyEvents.length, 0);
    const snapshots = bus.events.filter((event) => event.type === 'DIALOG_HISTORY_REPLACED');
    assert.strictEqual(snapshots.length, 2);
    for (const { snapshot } of snapshots)
      assert.deepStrictEqual(
        snapshot.messages.map((row) => row.fingerprint),
        ['fp1'],
      );
    assert.strictEqual(clearEvents.length, 0);
  });
});
