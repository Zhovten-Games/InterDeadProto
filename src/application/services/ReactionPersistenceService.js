import NullEventBus from '../../core/events/NullEventBus.js';
import { REACTION_SELECTED } from '../../core/events/constants.js';
import messageFingerprint from '../../utils/messageFingerprint.js';

/**
 * Persists reaction selections into the dialog history storage.
 */
export default class ReactionPersistenceService {
  constructor(
    dialogManager,
    historyService,
    historyBuffer,
    ghostService,
    bus = new NullEventBus(),
    logger = console
  ) {
    this.dialogManager = dialogManager;
    this.historyService = historyService;
    this.historyBuffer = historyBuffer;
    this.ghostService = ghostService;
    this.bus = bus;
    this.logger = logger;
    this._handler = this._handleEvent.bind(this);
  }

  boot() {
    this.bus?.subscribe?.(this._handler);
  }

  dispose() {
    this.bus?.unsubscribe?.(this._handler);
  }

  _handleEvent(evt) {
    if (!evt || evt.type !== REACTION_SELECTED) {
      return;
    }
    const ghost = this.ghostService?.getCurrentGhost?.();
    const ghostName = ghost?.name || null;
    if (!ghostName) {
      this._log('warn', 'Skipping reaction persistence because active ghost is unknown.', {
        event: evt
      });
      return;
    }
    const normalizedReaction = this._normalizeReaction(evt.reaction);
    const origin = this._normalizeOrigin(evt.origin);
    const message = this._findMessage(evt);
    const fingerprint = this._resolveFingerprint(evt, message, ghostName);
    if (!fingerprint) {
      this._log('warn', 'Failed to persist reaction because fingerprint is missing.', {
        event: evt
      });
      return;
    }
    if (message) {
      if (!message.fingerprint) {
        message.fingerprint = fingerprint;
      }
      message.reaction = normalizedReaction;
      message.reactionOrigin = origin;
      message.reactionLocked = origin === 'system' || message.reactionLocked === true;
    }
    this.historyBuffer?.updateReaction?.(fingerprint, normalizedReaction, origin);
    this.historyService?.setReaction?.(ghostName, fingerprint, normalizedReaction, origin);
  }

  _findMessage(evt) {
    const dialog = this.dialogManager?.dialog;
    if (!dialog?.messages?.length) return null;
    const byFingerprint = evt?.fingerprint;
    if (byFingerprint) {
      const match = dialog.messages.find(m => m?.fingerprint === byFingerprint);
      if (match) return match;
    }
    const id = evt?.messageId;
    if (id !== undefined && id !== null) {
      const numericId = Number(id);
      if (!Number.isNaN(numericId)) {
        const match = dialog.messages.find(m => Number(m?.id) === numericId);
        if (match) return match;
      }
    }
    return null;
  }

  _resolveFingerprint(evt, message, ghostName) {
    if (evt?.fingerprint) return evt.fingerprint;
    if (message?.fingerprint) return message.fingerprint;
    if (!message) return null;
    const computed = messageFingerprint({ ...message, ghost: ghostName });
    return computed || null;
  }

  _normalizeReaction(value) {
    if (typeof value !== 'string') return '';
    return value.trim();
  }

  _normalizeOrigin(value) {
    if (value === 'system' || value === 'user') return value;
    return 'user';
  }

  _log(level, message, context) {
    const target = this.logger?.[level];
    if (typeof target === 'function') {
      target.call(this.logger, `[ReactionPersistence] ${message}`, context);
    }
  }
}
