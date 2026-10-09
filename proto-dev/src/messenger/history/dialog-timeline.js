import { DIALOG_HISTORY_REPLACED } from '../../runtime-events/domain/constants.js';

/** Retained public snapshot port; transport is never the durable state owner. */
export default class DialogTimeline {
  constructor(history, bus) {
    this.history = history;
    this.bus = bus;
    this.snapshot = { schemaVersion: 2, ghost: null, revision: 0, messages: [] };
    this.listeners = new Set();
  }
  getSnapshot() {
    return {
      ...this.snapshot,
      messages: this.snapshot.messages.map((message) => ({ ...message })),
    };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }
  replaceMessages(snapshot, { mergeLive = true } = {}) {
    if (snapshot.revision < this.snapshot.revision) return false;
    const same =
      snapshot.ghost === this.snapshot.ghost && snapshot.revision === this.snapshot.revision;
    const messages = new Map(
      snapshot.messages.map((message) => [
        message.fingerprint,
        { ...message, ghost: snapshot.ghost },
      ]),
    );
    if (same && mergeLive)
      for (const message of this.snapshot.messages) {
        if (!messages.has(message.fingerprint)) messages.set(message.fingerprint, { ...message });
      }
    const ordered = [...messages.values()].sort(
      (a, b) => (a.sequence ?? a.order ?? 0) - (b.sequence ?? b.order ?? 0),
    );
    this.snapshot = {
      schemaVersion: 2,
      ghost: snapshot.ghost,
      revision: snapshot.revision,
      messages: ordered,
    };
    this._publish();
    return true;
  }
  accept(message) {
    const { ghost, revision } = this.snapshot;
    if (!ghost) throw new Error('No committed dialog timeline');
    const accepted = this.history.appendUnique(ghost, [{ ...message, ghost }]);
    const canonical =
      accepted?.[0] ||
      this.history.load(ghost).find((row) => row.fingerprint === message.fingerprint);
    if (!canonical) throw new Error('Message was not accepted by timeline storage');
    const result = { ...message, ...canonical, ghost, contextRevision: revision };
    const index = this.snapshot.messages.findIndex((row) => row.fingerprint === result.fingerprint);
    if (index < 0) this.snapshot.messages.push(result);
    return result;
  }
  _publish() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) listener(snapshot);
    this.bus?.emit?.({ type: DIALOG_HISTORY_REPLACED, snapshot });
  }
  clearUserRuntimeContext() {
    this.replaceMessages(
      { ghost: null, revision: this.snapshot.revision + 1, messages: [] },
      { mergeLive: false },
    );
  }
}
