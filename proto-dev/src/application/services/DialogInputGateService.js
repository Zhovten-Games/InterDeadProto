import { DIALOG_AWAITING_INPUT_CHANGED } from '../../core/events/constants.js';
import coreStore from '../../core/engine/store.js';
import { dialogAdvance } from '../../core/engine/actions.js';

/**
 * Central service controlling when user input is awaited.
 * It inspects dialog progression and emits a unified event
 * describing which kind of input is expected and on which screen.
 */
export default class DialogInputGateService {
  constructor(dialogManager, dualityManager, bus, store = coreStore) {
    this.dialogManager = dialogManager;
    this.dualityManager = dualityManager;
    this.bus = bus;
    this.store = store;
    /**
     * Remembers the index of the last ghost line progressed to avoid
     * re‑emitting the same message on subsequent evaluations.
     * @private
     */
    this._lastGhostIndex = -1;
  }


  /**
   * Reset progression guards when dialog context changes
   * (e.g. ghost switch, app reset, hard replay).
   */
  reset() {
    this._lastGhostIndex = -1;
  }

  /**
   * Evaluate current dialog state and emit awaiting status.
   * This method progresses ghost messages automatically until
   * the next user action is required.
   *
   * @param {object} [dialog] Optional dialog override.
   */
  advanceToUserTurn(dialog = this.dialogManager?.dialog, fingerprints = null) {
    if (!dialog) {
      this._emit(false);
      return;
    }

    // Walk through ghost messages so the user is presented only
    // with actionable prompts. Guard the index to prevent duplicate
    // progression when the gate is triggered multiple times for the
    // same ghost line.
    while (!dialog.isComplete?.()) {
      const idx = dialog.index;
      if (idx === this._lastGhostIndex) break;
      const next = dialog.messages?.[idx];
      if (next && next.author === 'ghost') {
        const meta = fingerprints?.get?.(idx);
        if (meta) {
          if (next.fingerprint === undefined) {
            next.fingerprint = meta.fingerprint;
          }
          if (typeof next.id !== 'number') {
            next.id = meta.id;
          }
        }
        this._lastGhostIndex = idx;
        this.progressDialog();
        continue;
      }
      break;
    }
    // Reset dedupe marker when awaiting user input.
    if (dialog.messages?.[dialog.index]?.author === 'user') {
      this._lastGhostIndex = dialog.index - 1;
    }

    const upcoming = dialog.messages?.[dialog.index];
    if (upcoming && upcoming.author === 'user') {
      this._emit(true, 'user_text', 'messenger');
      return;
    }

    if (this.dualityManager?.isQuestActive?.()) {
      this._emit(true, 'camera_capture', 'camera');
      return;
    }

    this._emit(false);
  }

  boot() {
    // No automatic progression on boot; the orchestrator triggers
    // advancement once the dialog widget reports readiness.
  }

  /**
   * Progress the dialog by one step through the core store and execute
   * resulting effects. Exposed so orchestrator can progress user lines
   * without duplicating dialogManager logic.
   */
  progressDialog() {
    const effects = this.store.dispatch(dialogAdvance());
    effects.forEach(effect => {
      if (effect.type === 'dialog.progress') {
        this.dialogManager.progress();
      }
    });
  }

  /**
   * Emit awaiting-input status to the EventBus.
   * @param {boolean} awaits whether input is awaited
   * @param {string|null} kind expected input kind
   * @param {string|null} targetScreen screen that should receive focus
   * @private
   */
  _emit(awaits, kind = null, targetScreen = null) {
    this.bus?.emit({
      type: DIALOG_AWAITING_INPUT_CHANGED,
      awaits,
      kind,
      targetScreen
    });
  }
}
