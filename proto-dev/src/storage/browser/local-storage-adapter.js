import IPersistence from '../ports/persistence-port.js';

const CONTEXT_KEY = 'interdead:user-context:v1';
const OWNED_KEY =
  /^(?:sqlite_db$|userId$|captured$|ghostType$|ghostsCompleted$|language$|profile:ui-preferences$|duality:|quest:|dialog:|ghost:|interdead:|reboot:|buttonState$|buttonVisibility$|button:|screen:|ghost-switch:|reactions:|checkpoint:)/;
const PROGRESS_KEY = /^(?:duality:|quest:|ghostsCompleted$|ghost-switch:|reactions:|checkpoint:)/;

export default class LocalStorageAdapter extends IPersistence {
  constructor(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    super();
    this.storage = storage;
  }

  load(key) {
    if (OWNED_KEY.test(key)) {
      const context = this._readContext();
      if (context) return Object.hasOwn(context, key) ? context[key] : null;
    }
    try {
      if (!this.storage) return null;
      const raw = this.storage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch {
      return null;
    }
  }

  save(key, value) {
    if (!this.storage) throw new Error('Persistent storage unavailable');
    const context = OWNED_KEY.test(key) ? this._readContext() : null;
    if (context) {
      if (JSON.stringify(context[key]) === JSON.stringify(value)) return;
      context[key] = value;
      this.replaceOwned(context);
    } else this.storage.setItem(key, JSON.stringify(value));
  }

  remove(key) {
    const context = OWNED_KEY.test(key) ? this._readContext() : null;
    if (context) {
      delete context[key];
      this.replaceOwned(context);
    } else if (this.storage) this.storage.removeItem(key);
  }

  _readContext() {
    if (!this.storage) return null;
    const raw = this.storage.getItem(CONTEXT_KEY);
    if (raw === null) return null;
    const data = JSON.parse(raw);
    if (
      data?.schemaVersion !== 1 ||
      !data.values ||
      typeof data.values !== 'object' ||
      Array.isArray(data.values)
    ) {
      throw new Error('Invalid user context envelope; preserve storage and restore its backup');
    }
    return data.values;
  }

  backupUserContext(key = 'sqlite_context_backup_before_profile_import') {
    if (!this.storage || this.storage.getItem(key) !== null) return;
    let values = this._readContext();
    if (!values) {
      const keys = Array.from({ length: this.storage.length }, (_, index) =>
        this.storage.key(index),
      );
      values = Object.fromEntries(
        keys
          .filter((name) => OWNED_KEY.test(name) && name !== CONTEXT_KEY)
          .map((name) => [name, this.load(name)]),
      );
    }
    this.storage.setItem(key, JSON.stringify({ schemaVersion: 1, values }));
  }

  exportUserProgress() {
    const values = this._readContext();
    const keys = values
      ? Object.keys(values)
      : Array.from({ length: this.storage?.length || 0 }, (_, index) => this.storage.key(index));
    return Object.fromEntries(
      keys.filter((key) => PROGRESS_KEY.test(key)).map((key) => [key, this.load(key)]),
    );
  }

  /** One storage write commits SQLite, progression and preferences together.
   * Legacy keys remain untouched as an additional recovery source.
   */
  replaceOwned(values) {
    if (!this.storage) throw new Error('Persistent storage unavailable');
    if (
      !values ||
      Array.isArray(values) ||
      Object.keys(values).some((key) => !OWNED_KEY.test(key) || key === CONTEXT_KEY)
    ) {
      throw new Error('Invalid owned context');
    }
    const encoded = JSON.stringify({ schemaVersion: 1, values });
    this.storage.setItem(CONTEXT_KEY, encoded);
  }

  clear() {
    if (!this.storage) return;
    // Keep an authoritative empty envelope so legacy keys cannot reappear.
    if (this._readContext()) this.replaceOwned({});
    const keys = [];
    for (let index = 0; index < this.storage.length; index++) keys.push(this.storage.key(index));
    for (const key of keys) {
      if (key !== CONTEXT_KEY && OWNED_KEY.test(key)) this.storage.removeItem(key);
    }
  }
}
