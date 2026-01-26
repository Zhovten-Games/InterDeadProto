export default class MediaRepository {
  constructor() {
    this._id = 0;
    this._blobs = new Map();
    this._meta = new Map();
    this._urls = new Set();
  }

  async save(blobs, meta = {}) {
    const id = ++this._id;
    const thumbKey = `thumb-${id}`;
    const fullKey = `full-${id}`;
    this._blobs.set(thumbKey, blobs.thumb);
    this._blobs.set(fullKey, blobs.full);
    this._meta.set(id, { thumbKey, fullKey, ...meta });
    return id;
  }

  async get(id) {
    return this._meta.get(id);
  }

  async getObjectURL(key) {
    const blob = this._blobs.get(key);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    this._urls.add(url);
    const revoke = () => {
      if (this._urls.has(url)) {
        URL.revokeObjectURL(url);
        this._urls.delete(url);
      }
    };
    return { url, revoke };
  }

  revokeAll() {
    for (const url of this._urls) {
      URL.revokeObjectURL(url);
    }
    this._urls.clear();
  }
}
