import messageFingerprint from '../identity/message-fingerprint.js';

/** Identity deduplication; equal content may represent distinct occurrences. */
export default class MessageDeduplicator {
  constructor() {
    this._seen = new Set();
  }
  register(message = {}) {
    const ghost = message.ghost || '';
    let identity = `content:${messageFingerprint(message)}`;
    if (message.fingerprint != null) identity = `fp:${ghost}:${message.fingerprint}`;
    else if (message.id != null) identity = `id:${ghost}:${message.id}`;
    if (this._seen.has(identity)) return false;
    this._seen.add(identity);
    return true;
  }
  clear() {
    this._seen.clear();
  }
}
