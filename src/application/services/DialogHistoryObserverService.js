/**
 * Observes dialog messages and persists history for the active ghost.
 * Saves asynchronously after each EVENT_MESSAGE_READY to avoid blocking other flows.
 */
import { EVENT_MESSAGE_READY } from '../../core/events/constants.js';
import NullEventBus from '../../core/events/NullEventBus.js';

export default class DialogHistoryObserverService {
  constructor(dialogManager, historyService, ghostService, bus = new NullEventBus()) {
    this.dialogManager = dialogManager;
    this.historyService = historyService;
    this.ghostService = ghostService;
    this.bus = bus;
    this._handler = null;
  }

  /** Subscribe to message events and persist dialog state. */
  boot() {
    this._handler = evt => {
      if (evt.type !== EVENT_MESSAGE_READY || evt.replay) return;
      const current = this.ghostService?.getCurrentGhost?.().name;
      const msg = evt.message || evt;
      queueMicrotask(() => {
        this.historyService?.append?.(current, [msg]);
      });
    };
    this.bus?.subscribe?.(this._handler);
  }

  /** Unsubscribe to release resources. */
  dispose() {
    if (this._handler) {
      this.bus?.unsubscribe?.(this._handler);
      this._handler = null;
    }
  }
}
