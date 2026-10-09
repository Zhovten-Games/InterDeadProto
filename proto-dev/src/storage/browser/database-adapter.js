// Load WebAssembly build of SQL.js from local assets.
// Tests may provide a custom init function to avoid loading the real WASM.
import initSqlJs from '../../../assets/libs/db/sql-wasm.esm.js';

import IDatabase from '../ports/database-port.js';
import { resolveAssetUrl } from '../../asset-delivery/paths/assets-base-url.js';

export default class DatabaseAdapter extends IDatabase {
  constructor(path = ':memory:', logger, initOverride, persistence = null) {
    super();
    this.path = path;
    this.logger = logger;
    this.db = null;
    this._initSqlJs = initOverride;
    this.storage = persistence;
    this._bootPromise = null;
    this._transactionDepth = 0;
    this._writerRelease = null;
    this._SQL = null;
  }

  async boot() {
    if (this._bootPromise) return this._bootPromise;
    this._bootPromise = (async () => {
      const init = this._initSqlJs || initSqlJs;
      // When running in the browser we always load assets from the public path.
      // Node.js tests may override `_initSqlJs` to provide a custom initializer.
      const basePath = resolveAssetUrl('libs/db/');
      const initOptions = {
        locateFile: (file) => `${basePath}${file}`,
      };
      if (!this._initSqlJs && this._isBrowserRuntime()) {
        initOptions.wasmBinary = await this._fetchWasmBinary(`${basePath}sql-wasm.wasm`);
      }

      const SQL = await init(initOptions);
      this._SQL = SQL;
      await this._acquireWriter();

      const saved = this.storage?.load('sqlite_db');

      this.db = saved
        ? new SQL.Database(Uint8Array.from(atob(saved), (c) => c.charCodeAt(0)))
        : new SQL.Database();

      if (typeof this.db.get !== 'function') {
        this.db.get = (sql, params = []) => {
          const stmt = this.db.prepare(sql, params);
          const row = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return row;
        };
      }

      this.db.exec(
        `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        avatar BLOB
      );
      CREATE TABLE IF NOT EXISTS exports (
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        blob BLOB NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        lat REAL,
        lng REAL,
        mode TEXT,
        saved_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS selfies (
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        data BLOB NOT NULL,
        checked INTEGER NOT NULL,
        taken_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        ghost_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      `,
      );
      this._persist();
    })();
    try {
      return await this._bootPromise;
    } catch (error) {
      this._writerRelease?.();
      this._writerRelease = null;
      this.db?.close();
      this.db = null;
      this._bootPromise = null;
      throw error;
    }
  }

  _isBrowserRuntime() {
    return typeof window !== 'undefined' && typeof fetch === 'function';
  }

  async _fetchWasmBinary(wasmUrl) {
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to load SQL.js WASM binary: ${response.status} ${response.statusText}`,
      );
    }
    const binary = await response.arrayBuffer();
    return new Uint8Array(binary);
  }

  _persist() {
    if (!this.db || this._transactionDepth > 0) return;
    const bytes = this.db.export();
    const base64 = this._toBase64(bytes);
    this.storage?.save('sqlite_db', base64);
  }

  /**
   * Convert a Uint8Array to a base64 string without exceeding argument limits.
   * Processes the array in chunks to avoid RangeError: too many function arguments.
   * @param {Uint8Array} bytes
   * @returns {string}
   * @private
   */
  _toBase64(bytes) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  async exec(sql, params = []) {
    this.run(sql, params);
  }

  /** Synchronous atomic write boundary: SQL and persisted snapshot both commit. */
  transaction(callback, { backupKey = null } = {}) {
    if (this._transactionDepth) return callback();
    const before = this.db.export();
    if (backupKey && !this.storage?.load?.(backupKey)) {
      this.storage?.save?.(backupKey, this._toBase64(before));
    }
    this._transactionDepth = 1;
    try {
      this.db.run('BEGIN IMMEDIATE');
      const value = callback();
      if (value?.then) throw new Error('Database transaction callback must be synchronous');
      this.db.run('COMMIT');
      this._transactionDepth = 0;
      this._persist();
      return value;
    } catch (error) {
      this._transactionDepth = 0;
      // Restoring the entire pre-write snapshot also handles storage failure
      // after SQL COMMIT. The previous persisted save remains recoverable.
      this.db.close();
      this.db = new this._SQL.Database(before);
      this.db.get = (sql, params = []) => this.fetchAll(sql, params)[0];
      throw error;
    }
  }

  async _acquireWriter() {
    // Node/test initializers and in-memory stores do not compete across tabs.
    if (!this.storage || this._initSqlJs || typeof window === 'undefined') return;
    if (!navigator.locks?.request) {
      throw new Error(
        'Safe persistent storage requires browser Web Locks; use a supported direct host.',
      );
    }
    const acquired = new Promise((resolve, reject) => {
      this._writerTask = navigator.locks
        .request('interdead:sqlite-writer', { ifAvailable: true }, async (lock) => {
          if (!lock) {
            reject(new Error('This profile is open in another tab.'));
            return;
          }
          await new Promise((release) => {
            this._writerRelease = release;
            resolve();
          });
        })
        .catch(reject);
    });
    await acquired;
  }

  async dispose() {
    this._writerRelease?.();
    this._writerRelease = null;
    await this._writerTask;
    this._writerTask = null;
    this.db?.close();
    this.db = null;
    this._bootPromise = null;
  }

  async get(sql, params = []) {
    try {
      const row = this.db.get(sql, params);
      return row || null;
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }

  run(sql, params = []) {
    return this.transaction(() => this.db.run(sql, params));
  }

  executeQuery(sql, params = []) {
    return this.exec(sql, params);
  }

  fetchAll(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql, params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }

  async saveUser(profile) {
    await this.exec(`INSERT INTO users(name, created_at, avatar) VALUES(?, ?, ?)`, [
      profile.name,
      profile.created_at,
      profile.avatar || null,
    ]);
  }

  async loadUser() {
    const row = await this.get(`SELECT * FROM users ORDER BY id DESC LIMIT 1`);
    return row || null;
  }

  async recordExport(blob) {
    const user = await this.loadUser();
    const id = user ? user.id : null;
    await this.exec(`INSERT INTO exports(user_id, blob, created_at) VALUES(?, ?, ?)`, [
      id,
      blob,
      new Date().toISOString(),
    ]);
  }

  async saveLocation(data) {
    await this.exec(`INSERT INTO locations(user_id, lat, lng, mode, saved_at) VALUES(?,?,?,?,?)`, [
      data.user_id,
      data.lat,
      data.lng,
      data.mode,
      data.saved_at,
    ]);
  }

  async saveSelfie(data) {
    await this.exec(`INSERT INTO selfies(user_id, data, checked, taken_at) VALUES(?,?,?,?)`, [
      data.user_id,
      data.data,
      data.checked,
      data.taken_at,
    ]);
  }

  async clearAll() {
    this.transaction(() => {
      for (const table of [
        'users',
        'posts',
        'locations',
        'selfies',
        'exports',
        'dialog_messages',
        'dialog_timeline_sequences',
        'media',
      ]) {
        const exists = this.fetchAll(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          [table],
        );
        if (exists.length) this.run(`DELETE FROM ${table}`);
      }
    });
  }

  fork(snapshot = null) {
    const candidate = new DatabaseAdapter(':memory:', this.logger, this._initSqlJs);
    candidate._SQL = this._SQL;
    const bytes = snapshot
      ? Uint8Array.from(atob(snapshot), (character) => character.charCodeAt(0))
      : this.db.export();
    candidate.db = new this._SQL.Database(bytes);
    candidate.db.get = (sql, params = []) => candidate.fetchAll(sql, params)[0];
    const integrity = candidate.fetchAll('PRAGMA integrity_check');
    if (integrity.length !== 1 || Object.values(integrity[0])[0] !== 'ok') {
      candidate.db.close();
      throw new Error('Invalid SQLite snapshot');
    }
    if (
      candidate.fetchAll("SELECT name FROM sqlite_master WHERE type IN ('trigger','view')").length
    ) {
      candidate.db.close();
      throw new Error('Executable schema objects are not permitted in profile imports');
    }
    return candidate;
  }

  exportSnapshot() {
    const candidate = this.fork();
    try {
      candidate.db.run('DELETE FROM exports');
      candidate.db.run('VACUUM');
      return this._toBase64(candidate.db.export());
    } finally {
      candidate.db.close();
    }
  }

  commitSnapshot(
    candidate,
    backupKey = 'sqlite_db_backup_before_profile_import',
    ownedContext = null,
  ) {
    const previous = this.db;
    if (this.storage && !this.storage.load(backupKey))
      this.storage.save(backupKey, this._toBase64(previous.export()));
    if (ownedContext && this.storage) {
      this.storage.backupUserContext?.();
      if (typeof this.storage.replaceOwned !== 'function')
        throw new Error('Atomic profile context replacement is unavailable');
      this.storage.replaceOwned({
        ...ownedContext,
        sqlite_db: this._toBase64(candidate.db.export()),
      });
      this.db = candidate.db;
      this.db.get = (sql, params = []) => this.fetchAll(sql, params)[0];
      previous.close();
      return;
    }
    this.db = candidate.db;
    this.db.get = (sql, params = []) => this.fetchAll(sql, params)[0];
    try {
      this._persist();
    } catch (error) {
      this.db = previous;
      candidate.db.close();
      throw error;
    }
    previous.close();
  }
}
