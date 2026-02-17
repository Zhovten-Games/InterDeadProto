import IPersistence from '../../ports/IPersistence.js';

export default class LocalStorageAdapter extends IPersistence {
  constructor(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    super();
    this.storage = storage;
  }

  load(key) {
    try {
      if (!this.storage) return null;
      const raw = this.storage.getItem(key);
      if (raw === null) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    } catch {
      return null;
    }
  }

  save(key, value) {
    try {
      if (this.storage) {
        const serialized = JSON.stringify(value);
        this.storage.setItem(key, serialized);
      }
    } catch {}
  }

  remove(key) {
    try { if (this.storage) this.storage.removeItem(key); } catch {}
  }

  clear() {
    try { this.storage?.clear(); } catch {}
  }
}
