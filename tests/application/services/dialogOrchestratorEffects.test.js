import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import { DIALOG_PROGRESS, HISTORY_SAVE } from '../../../src/core/engine/effects.js';

class StubBus {
  subscribe() {}
  unsubscribe() {}
  emit() {}
}

describe('DialogOrchestratorService effect runner', () => {
  it('executes mapped effects once per action', () => {
    const dialogManager = new DialogManager(null, null, null);
    dialogManager.dialog = { messages: [{ author: 'ghost', text: 'hi' }], index: 1 };
    let progressed = 0;
    dialogManager.progress = () => { progressed++; };

    let saved = 0;
    const historyService = { appendUnique: () => { saved++; } };

    const svc = new DialogOrchestratorService(
      {},
      dialogManager,
      { getCurrentGhost: () => ({ name: 'g1' }) },
      {},
      {},
      historyService,
      {},
      {},
      {},
      null,
      new StubBus(),
      { info() {}, warn() {}, error() {} },
      {},
      { dispatch() {}, getState() {} },
      true
    );

    svc.currentGhost = 'g1';
    svc._runEffects([
      { type: DIALOG_PROGRESS },
      { type: HISTORY_SAVE }
    ]);

    assert.strictEqual(progressed, 1, 'dialog.progress executed once');
    assert.strictEqual(saved, 1, 'history.save executed once');
  });
});
