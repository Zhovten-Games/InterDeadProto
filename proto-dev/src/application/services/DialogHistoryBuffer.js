import messageFingerprint from '../../utils/messageFingerprint.js';

/**
 * In-memory buffer for dialog history.
 * Captures each EVENT_MESSAGE_READY regardless of widget state
 * and provides deduplicated lists for replay or persistence.
 */
export default class DialogHistoryBuffer {
  constructor() {
    this._messages = [];
    this._fingerprints = new Set();
  }

  /**
   * Append a message if its fingerprint was not seen before.
   * @param {object} msg
   */
  append(msg) {
    const fp = messageFingerprint(msg);
    if (!fp || this._fingerprints.has(fp)) return;
    this._fingerprints.add(fp);
    const origin =
      typeof msg.reactionOrigin === 'string' && msg.reactionOrigin.trim() !== ''
        ? msg.reactionOrigin.trim()
        : null;
    this._messages.push({
      ...msg,
      fingerprint: fp,
      reaction: this._normalizeReaction(msg.reaction),
      reactionOrigin: origin,
      reactionLocked: msg.reactionLocked === true || origin === 'system'
    });
  }

  /**
   * Merge with previously persisted messages and return new ones.
   * @param {Array<object>} persistedList
   * @returns {Array<object>} delta list of unseen messages
   */
  merge(persistedList = []) {
    const persisted = new Set();
    (persistedList || []).forEach(m => {
      const fp = messageFingerprint(m);
      if (!fp) return;
      persisted.add(fp);
      if (!this._fingerprints.has(fp)) {
        this._fingerprints.add(fp);
      }
    });
    const fresh = this._messages.filter(m => !persisted.has(m.fingerprint));
    this._messages = [...persistedList, ...fresh];
    return [...fresh];
  }

  /**
   * Update avatar for all user-authored messages in the buffer.
   * @param {string} avatar
   */
  updateUserAvatars(avatar) {
    this._messages = this._messages.map(m =>
      m.author === 'user' ? { ...m, avatar } : m
    );
  }

  /**
   * Update the stored reaction for a specific message.
   * @param {string} fingerprint
   * @param {string} reaction
   */
  updateReaction(fingerprint, reaction, origin = null) {
    if (!fingerprint) return;
    const normalized = this._normalizeReaction(reaction);
    this._messages = this._messages.map(m =>
      m.fingerprint === fingerprint
        ? {
            ...m,
            reaction: normalized,
            reactionOrigin: origin || m.reactionOrigin || null,
            reactionLocked: origin === 'system' || m.reactionLocked === true
          }
        : m
    );
  }

  /**
   * Flush buffered messages to history service and keep fingerprints.
   * @param {object} historyService
   * @param {string} ghostName
   */
  flushTo(historyService, ghostName) {
    if (!this._messages.length) return;
    historyService?.append?.(ghostName, this._messages);
  }

  /**
   * Clear buffered messages but retain fingerprint registry.
   */
  clear() {
    this._messages.length = 0;
  }

  /**
   * Remove all buffered messages and fingerprints.
   * Use this when switching ghosts or leaving the messenger
   * so each ghost maintains its own registry.
   */
  reset() {
    this._messages.length = 0;
    this._fingerprints.clear();
  }

  /**
   * Retrieve a shallow copy of buffered messages for inspection.
   * @returns {Array<object>}
   */
  getAll() {
    return this._messages.map(msg => ({ ...msg }));
  }

  _normalizeReaction(value) {
    if (typeof value !== 'string') return '';
    return value.trim();
  }
}
