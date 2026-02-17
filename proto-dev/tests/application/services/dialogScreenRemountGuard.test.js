import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';

class Bus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) { this.handlers.push(fn); }
  unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
  emit(evt) { this.handlers.slice().forEach(h => h(evt)); }
}

class TrackingInputGate {
  constructor() {
    this._lastGhostIndex = -1;
    this.resetCalls = 0;
    this.progressedGhostLines = 0;
  }

  reset() {
    this.resetCalls += 1;
    this._lastGhostIndex = -1;
  }

  advanceToUserTurn(dialog) {
    if (!dialog) return;
    while (!dialog.isComplete?.()) {
      const idx = dialog.index;
      if (idx === this._lastGhostIndex) break;
      const next = dialog.messages?.[idx];
      if (next?.author !== 'ghost') break;
      this._lastGhostIndex = idx;
      dialog.restore(idx + 1);
      this.progressedGhostLines += 1;
    }
    if (dialog.messages?.[dialog.index]?.author === 'user') {
      this._lastGhostIndex = dialog.index - 1;
    }
  }
}

describe('DialogOrchestratorService screen remount guard', () => {
  it('keeps input gate guard across messenger remounts', async () => {
    const bus = new Bus();
    const dialogManager = new DialogManager(null, bus, null);
    const dialog = new Dialog([
      { author: 'ghost', text: 'greeting' },
      { author: 'user', text: 'reply' }
    ]);
    dialogManager.dialog = dialog;

    const dualityManager = {
      load() {},
      start() {},
      getCurrentDialog() { return dialogManager.dialog; },
      completeCurrentEvent() {},
      isQuestActive() { return false; }
    };

    const historyService = {
      clearSeen() {},
      load() {
        return [{ author: 'ghost', text: 'greeting' }];
      }
    };

    const gate = new TrackingInputGate();

    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      { getCurrentGhost: () => ({ name: 'guide' }) },
      { setScreenVisibility() {}, setState() {} },
      { setScreenVisibility() {} },
      historyService,
      { getUserAvatar: async () => '' },
      {},
      {},
      gate,
      bus
    );

    svc.started = true;
    svc.currentGhost = 'guide';
    svc.boot();

    svc._advanceGate();
    assert.strictEqual(gate.progressedGhostLines, 1);
    assert.strictEqual(dialogManager.dialog.index, 1);

    await svc._handler({ type: 'SCREEN_CHANGE', screen: 'messenger' });

    assert.strictEqual(gate.resetCalls, 0, 'screen remount must not reset input gate guard');

    svc._advanceGate();
    assert.strictEqual(
      gate.progressedGhostLines,
      1,
      'advance gate must not re-progress already handled ghost line'
    );

    svc.dispose();
  });
});
