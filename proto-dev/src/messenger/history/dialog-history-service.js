/**
 * Provides per-ghost dialog history persistence backed by DialogRepository.
 * Stores and retrieves message arrays using SQLite.
 */
import messageFingerprint from '../identity/message-fingerprint.js';

export default class DialogHistoryService {
  constructor(repository) {
    this.repo = repository;
    // Tracks fingerprints of messages that have been processed this session.
    this._seen = new Map();
  }

  _normalizeReaction(value) {
    if (typeof value !== 'string') return '';
    return value.trim();
  }

  _prepare(ghost, messages = [], seen = new Set()) {
    const base = Date.now();
    const copy = [];
    messages.forEach((msg, idx) => {
      const timestamp = msg.timestamp ?? base + idx;
      const order = msg.sequence ?? msg.order;
      const candidateSrc = msg.persistSrc || msg.src;
      const rawSrc =
        typeof candidateSrc === 'string' && candidateSrc.startsWith('blob:') ? null : candidateSrc;
      const media = msg.media?.id ? { id: msg.media.id } : null;
      const normalizedReaction = this._normalizeReaction(msg.reaction);
      const reactionValue = normalizedReaction === '' ? null : normalizedReaction;
      const reactionOrigin = msg.reactionOrigin === 'system' ? 'system' : 'user';
      const stageId =
        typeof msg.stageId === 'string' && msg.stageId.trim() !== '' ? msg.stageId.trim() : null;
      const fingerprint = messageFingerprint({
        fingerprint:
          msg.fingerprint && !String(msg.fingerprint).includes('blob:')
            ? msg.fingerprint
            : undefined,
        ghost,
        stageId: stageId || '',
        occurrenceId: msg.occurrenceId,
        author: msg.author,
        text: msg.text || '',
        type: msg.type || '',
        src: rawSrc || undefined,
        media,
      });
      if (seen.has(fingerprint)) return;
      seen.add(fingerprint);
      if (msg.type === 'image') {
        copy.push({
          type: 'image',
          src: rawSrc,
          media_id: media?.id,
          timestamp,
          order,
          sequence: msg.sequence,
          fingerprint,
          author: msg.author,
          avatar: msg.avatar,
          reaction: reactionValue,
          reaction_origin: reactionValue ? reactionOrigin : null,
          stage_id: stageId,
        });
        return;
      }
      const obj = {
        author: msg.author,
        text: msg.text,
        timestamp,
        order,
        sequence: msg.sequence,
        fingerprint,
        reaction: reactionValue,
        reaction_origin: reactionValue ? reactionOrigin : null,
      };
      if (msg.avatar) obj.avatar = msg.avatar;
      if (rawSrc) obj.src = rawSrc;
      if (media) obj.media_id = media.id;
      if (stageId) obj.stage_id = stageId;
      copy.push(obj);
    });
    return copy;
  }

  _fingerprintKey(msg = {}) {
    if (msg.fingerprint !== undefined) return String(msg.fingerprint);
    if (msg.id !== undefined) return `id:${msg.id}`;
    return messageFingerprint({
      ghost: msg.ghost || '',
      stageId: msg.stageId || msg.stage_id || '',
      author: msg.author || '',
      type: msg.type || '',
      text: msg.text || '',
      src: msg.src || (msg.media && (msg.media.id || msg.media.src)) || '',
    });
  }

  has(ghost, msg) {
    const key = this._fingerprintKey(msg);
    if (key === null) return false;
    return this._seen.get(ghost)?.has(key) || false;
  }

  markSeen(ghost, msg) {
    const key = this._fingerprintKey(msg);
    if (key === null) return;
    if (!this._seen.has(ghost)) {
      this._seen.set(ghost, new Set());
    }
    this._seen.get(ghost).add(key);
  }

  /**
   * Clear seen fingerprints for a ghost so messages can be replayed.
   * @param {string} ghost
   */
  clearSeen(ghost) {
    if (!ghost) return;
    this._seen.delete(ghost);
  }

  /**
   * Remove stored history for a specific ghost and clear seen cache.
   * @param {string} ghost
   */
  clear(ghost) {
    if (!ghost) return;
    this.repo?.clearGhost?.(ghost);
    this.clearSeen(ghost);
  }

  /**
   * Clear all stored history and in-memory cache.
   */
  reset() {
    this.repo?.clearAll?.();
    this._seen.clear();
  }

  clearUserRuntimeContext() {
    // Runtime reset hook: clear only in-memory session cache.
    this._seen.clear();
  }

  /**
   * Save messages for a specific ghost.
   * Uses append semantics with unique constraint.
   * @param {string} ghostName
   * @param {Array<object>} messages
   */
  save(ghostName, messages) {
    const prepared = this._prepare(ghostName, messages);
    const accepted = this.repo?.appendUnique?.(ghostName, prepared) || prepared;
    accepted.forEach((m) => this.markSeen(ghostName, m));
    return accepted;
  }

  /**
   * Load messages saved for a ghost.
   * @param {string} ghostName
   * @returns {Array<object>} stored messages or empty array
   */
  load(ghostName) {
    let rows = this.repo?.loadAll?.(ghostName) || [];
    // Numeric/legacy identities are retained; changing identity must not merge
    // legitimate occurrences whose text happens to match.
    return rows.map((r) => {
      const msg = {
        author: r.author,
        text: r.text,
        type: r.type,
        avatar: r.avatar,
        fingerprint: r.fingerprint,
        timestamp: Number(r.timestamp),
        sequence: Number(r.sequence ?? r.order),
        order: Number(r.sequence ?? r.order),
        chronologyOrigin: r.chronologyOrigin,
      };
      if (r.src) msg.src = r.src;
      if (r.media_id) msg.media = { id: r.media_id };
      msg.reaction = this._normalizeReaction(r.reaction);
      msg.reactionOrigin = r.reaction_origin === 'system' ? 'system' : 'user';
      msg.reactionLocked = msg.reactionOrigin === 'system';
      if (r.stage_id) msg.stageId = r.stage_id;
      return msg;
    });
  }

  setReaction(ghostName, fingerprint, reaction, origin = null) {
    if (!ghostName || !fingerprint) return;
    const normalized = this._normalizeReaction(reaction);
    const value = normalized === '' ? null : normalized;
    const resolvedOrigin = origin === 'system' ? 'system' : 'user';
    this.repo?.updateReaction?.(ghostName, fingerprint, value, resolvedOrigin);
  }

  /**
   * Append new messages to existing history.
   * @param {string} ghostName
   * @param {Array<object>} messages
   */
  appendUnique(ghostName, messages) {
    const existing = this.load(ghostName);
    const seen = new Set(existing.map((m) => m.fingerprint));
    const prepared = this._prepare(ghostName, messages, seen);
    const accepted = this.repo?.appendUnique?.(ghostName, prepared) || prepared;
    accepted.forEach((m) => this.markSeen(ghostName, m));
    return accepted;
  }

  append(ghostName, messages) {
    return this.appendUnique(ghostName, messages);
  }

  exportAll() {
    return this.repo?.loadAllGrouped?.() || {};
  }

  replaceAll(histories = {}) {
    const prepared = Object.fromEntries(
      Object.entries(histories).map(([ghost, messages]) => [
        ghost,
        this.prepareImport(ghost, messages),
      ]),
    );
    this.repo?.replaceAll?.(prepared);
    this._seen.clear();
  }

  prepareImport(ghost, messages) {
    if (!Array.isArray(messages)) throw new Error('Invalid imported history');
    const normalized = messages.map((message) => ({
      ...message,
      stageId: message.stageId || message.stage_id,
      reactionOrigin: message.reactionOrigin || message.reaction_origin,
      media: message.media || (message.media_id ? { id: message.media_id } : null),
    }));
    const prepared = this._prepare(ghost, normalized);
    if (prepared.length !== messages.length)
      throw new Error('Conflicting imported message identity');
    return prepared;
  }

  clearAll() {
    this._seen.clear();
    this.repo?.clearAll?.();
  }
}
