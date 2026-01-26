import Service from '../Service.js';
import { EVENT_MESSAGE_READY } from '../events/constants.js';

/**
 * Manages dialog progression.
 */
export default class DialogManager extends Service {
  constructor(
    dialog,
    eventBus,
    persistence,
    buttonStateService = null,
    logger = null
  ) {
    super(logger);
    this.dialog = dialog;
    this.eventBus = eventBus;
    this.persistence = persistence;
    this.buttonStateService = buttonStateService;
    /**
     * Sequential identifier used as fallback for message ids.
     * @private
     */
    this._msgSeq = 0;
    /**
     * Monotonic order counter ensuring stable rendering across replayed
     * history and live messages.
     * @private
     */
    this._orderSeq = 0;
  }

  /** Publish next message if available and persist state. */
  progress() {
    const msg = this.dialog.next();
    if (!msg) return null;
    // Guard avatar to prevent undefined URLs
    msg.avatar = msg.avatar || '';
    // Attach timestamp and unique id/order for stable sorting
    msg.timestamp = msg.timestamp || Date.now();
    if (typeof msg.id !== 'number') {
      msg.id = this._msgSeq++;
    }
    if (typeof msg.order !== 'number') {
      this._orderSeq += 1;
      msg.order = this._orderSeq;
    }
    // Emit unified payload: message fields are spread on the event object
    // (excluding its own `type`) and the original message is exposed via
    // `message` for legacy listeners.
    const { type: _mType, ...rest } = msg;
    this.eventBus?.emit({ type: EVENT_MESSAGE_READY, ...rest, message: msg });
    if (this.buttonStateService) {
      const upcoming = this.dialog.messages?.[this.dialog.index];
      const needsReply = upcoming && upcoming.author === 'user';
      this.buttonStateService.setState?.('post', needsReply, 'main');
    }
    this.persistence?.save?.('dialog', this.dialog.serializeState());
    this.debug(`Progressed dialog to message ${msg.id}`);
    return msg;
  }
}
