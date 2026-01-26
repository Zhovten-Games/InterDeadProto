// Load WebAssembly build of SQL.js from local assets.
// Tests may provide a custom init function to avoid loading the real WASM.
import initSqlJs from '../../../assets/libs/db/sql-wasm.esm.js';

import IDatabase from '../../ports/IDatabase.js';

export default class DatabaseService extends IDatabase {
  constructor(path = ':memory:', logger, initOverride, persistence = null) {
    super();
    this.path = path;
    this.logger = logger;
    this.db = null;
    this._initSqlJs = initOverride;
    this.storage = persistence;
    this._bootPromise = null;
  }

  async boot() {
    if (this._bootPromise) return this._bootPromise;
    this._bootPromise = (async () => {
      const init = this._initSqlJs || initSqlJs;
      // When running in the browser we always load assets from the public path.
      // Node.js tests may override `_initSqlJs` to provide a custom initializer.
      const basePath = '/assets/libs/db/';
      const SQL = await init({
        locateFile: file => `${basePath}${file}`,
      });

      const saved = this.storage?.load('sqlite_db');

      this.db = saved
        ? new SQL.Database(Uint8Array.from(atob(saved), c => c.charCodeAt(0)))
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
      `
      );
      this._persist();
    })();
    return this._bootPromise;
  }

  _persist() {
    if (!this.db) return;
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

  exec(sql, params = []) {
    return new Promise((resolve, reject) => {
      try {
        this.db.run(sql, params);
        this._persist();
        resolve();
      } catch (err) {
        this.logger?.error(err?.message || err);
        reject(err);
      }
    });
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
    try {
      this.db.run(sql, params);
      this._persist();
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
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
    await this.exec(
      `INSERT INTO users(name, created_at, avatar) VALUES(?, ?, ?)`,
      [profile.name, profile.created_at, profile.avatar || null]
    );
  }

  async loadUser() {
    const row = await this.get(`SELECT * FROM users ORDER BY id DESC LIMIT 1`);
    return row || null;
  }

  async recordExport(blob) {
    const user = await this.loadUser();
    const id = user ? user.id : null;
    await this.exec(`INSERT INTO exports(user_id, blob, created_at) VALUES(?, ?, ?)`, [id, blob, new Date().toISOString()]);
  }

  async saveLocation(data) {
    await this.exec(
      `INSERT INTO locations(user_id, lat, lng, mode, saved_at) VALUES(?,?,?,?,?)`,
      [data.user_id, data.lat, data.lng, data.mode, data.saved_at]
    );
  }

  async saveSelfie(data) {
    await this.exec(
      `INSERT INTO selfies(user_id, data, checked, taken_at) VALUES(?,?,?,?)`,
      [data.user_id, data.data, data.checked, data.taken_at]
    );
  }

  async clearAll() {
    await this.exec(`DELETE FROM users;`);
    await this.exec(`DELETE FROM posts;`);
    await this.exec(`DELETE FROM locations;`);
    await this.exec(`DELETE FROM selfies;`);
    await this.exec(`DELETE FROM exports;`);
    await this.exec(`DELETE FROM dialog_messages;`);
  }
}
