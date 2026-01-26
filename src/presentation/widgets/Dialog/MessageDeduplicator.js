import messageFingerprint from '../../../utils/messageFingerprint.js';

export default class MessageDeduplicator {
  constructor() {
    this._seen = new Set();
  }

  /**
   * Check whether the message with provided fingerprint, id or content key
   * was already rendered. Fingerprint and id are tracked independently, and a
   * locally computed content key acts as a fallback when those differ.
   *
   * @param {object} msg dialog message
   * @returns {boolean} whether message should be rendered
   */
  register(msg = {}) {
    const fp = msg.fingerprint;
    const id = typeof msg.id === 'number' ? msg.id : undefined;
    const ck = messageFingerprint({
      ghost: msg.ghost || '',
      author: msg.author || '',
      type: msg.type || '',
      text: msg.text || '',
      src: msg.src || (msg.media && (msg.media.id || msg.media.src)) || ''
    });
    if (
      (fp && this._seen.has(fp)) ||
      (id !== undefined && this._seen.has(`id:${id}`)) ||
      (ck && this._seen.has(`ck:${ck}`))
    ) {
      return false;
    }
    if (fp) this._seen.add(fp);
    if (id !== undefined) this._seen.add(`id:${id}`);
    if (ck) this._seen.add(`ck:${ck}`);
    return true;
  }

  /** Clear recorded keys. */
  clear() {
    this._seen.clear();
  }
}
