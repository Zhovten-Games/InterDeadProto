/**
 * Observes dialog messages and persists history for the active ghost.
 * Saves asynchronously after each EVENT_MESSAGE_READY to avoid blocking other flows.
 */
import { EVENT_MESSAGE_READY } from '../../runtime-events/domain/constants.js';
import NullEventBus from '../../runtime-events/domain/null-event-bus.js';

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
    if (this._handler) return;
    this._handler = (evt) => {
      if (evt.type !== EVENT_MESSAGE_READY || evt.replay) return;
      const current = this.ghostService?.getCurrentGhost?.().name;
      const msg = evt.message || evt;
      if (!msg.sequence) this.historyService?.append?.(msg.ghost || current, [msg]);
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
