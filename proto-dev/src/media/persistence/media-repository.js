/** Durable captured media; each displayed URL has an explicit release handle. */
export default class MediaRepository {
  constructor(database = null) {
    this.database = database;
    this._id = 0;
    this._blobs = new Map();
    this._meta = new Map();
    this._urls = new Set();
  }
  boot() {
    this.database?.run(
      'CREATE TABLE IF NOT EXISTS media(id INTEGER PRIMARY KEY, thumb BLOB NOT NULL, full BLOB NOT NULL, mime TEXT NOT NULL, metadata TEXT NOT NULL)',
    );
  }
  async save(blobs, metadata = {}) {
    let id;
    if (this.database) {
      const thumb = new Uint8Array(await blobs.thumb.arrayBuffer());
      const full = new Uint8Array(await blobs.full.arrayBuffer());
      this.database.transaction(() => {
        this.database.run('INSERT INTO media(thumb,full,mime,metadata) VALUES(?,?,?,?)', [
          thumb,
          full,
          blobs.full.type || 'image/png',
          JSON.stringify(metadata),
        ]);
        id = this.database.fetchAll('SELECT last_insert_rowid() AS id')[0].id;
      });
    } else {
      id = ++this._id;
      this._blobs.set(`thumb-${id}`, blobs.thumb);
      this._blobs.set(`full-${id}`, blobs.full);
      this._meta.set(id, { thumbKey: `thumb-${id}`, fullKey: `full-${id}`, ...metadata });
    }
    return id;
  }
  async get(id) {
    if (!this.database) return this._meta.get(Number(id));
    const row = this.database.fetchAll('SELECT metadata FROM media WHERE id=?', [id])[0];
    return row
      ? { ...JSON.parse(row.metadata), thumbKey: `thumb-${id}`, fullKey: `full-${id}` }
      : null;
  }
  async getObjectURL(key) {
    let blob;
    if (this.database) {
      const match = /^(thumb|full)-(\d+)$/.exec(key);
      if (!match) return null;
      const row = this.database.fetchAll('SELECT thumb,full,mime FROM media WHERE id=?', [
        Number(match[2]),
      ])[0];
      if (row) blob = new Blob([row[match[1]]], { type: row.mime });
    } else blob = this._blobs.get(key);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    this._urls.add(url);
    const revoke = () => {
      if (!this._urls.delete(url)) return;
      URL.revokeObjectURL(url);
    };
    return { url, revoke };
  }
  remove(id) {
    this.database?.run('DELETE FROM media WHERE id=?', [id]);
    this._blobs.delete(`thumb-${id}`);
    this._blobs.delete(`full-${id}`);
    this._meta.delete(id);
  }
  revokeAll() {
    for (const url of this._urls) URL.revokeObjectURL(url);
    this._urls.clear();
  }
  clearUserRuntimeContext() {
    this.revokeAll();
    this._blobs.clear();
    this._meta.clear();
  }
  restoreUserContext() {
    this.clearUserRuntimeContext();
  }
  dispose() {
    this.revokeAll();
  }
}
