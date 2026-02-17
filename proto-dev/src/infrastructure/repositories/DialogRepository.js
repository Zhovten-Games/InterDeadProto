export default class DialogRepository {
  constructor(db) {
    this.db = db;
  }

  ensureSchema() {
    this.db.run(`
        CREATE TABLE IF NOT EXISTS dialog_messages(
          ghost TEXT NOT NULL,
          order_idx INTEGER NOT NULL,
          author TEXT NOT NULL,
          text   TEXT,
          type   TEXT,
          avatar TEXT,
          src    TEXT,
          media_id TEXT,
          stage_id TEXT,
          reaction TEXT,
          reaction_origin TEXT,
          fingerprint TEXT NOT NULL,
          ts     INTEGER NOT NULL,
          PRIMARY KEY (ghost, fingerprint)
        );
      `);
    this._ensureColumn('dialog_messages', 'reaction', 'TEXT');
    this._ensureColumn('dialog_messages', 'reaction_origin', 'TEXT');
    this._ensureColumn('dialog_messages', 'stage_id', 'TEXT');
  }

  _ensureColumn(tableName, columnName, columnType) {
    const columns = this.db.fetchAll(`PRAGMA table_info(${tableName})`);
    const knownColumns = new Set(columns.map((col) => String(col.name || '').toLowerCase()));
    if (knownColumns.has(columnName.toLowerCase())) return;
    this.db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
  }

  appendUnique(ghost, messages = []) {
    const sql = `INSERT INTO dialog_messages(ghost, order_idx, author, text, type, avatar, src, media_id, stage_id, fingerprint, ts, reaction, reaction_origin)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(ghost, fingerprint) DO UPDATE SET
        order_idx=excluded.order_idx,
        author=excluded.author,
        text=excluded.text,
        type=excluded.type,
        avatar=excluded.avatar,
        src=excluded.src,
        media_id=excluded.media_id,
        stage_id=excluded.stage_id,
        ts=excluded.ts,
        reaction=excluded.reaction,
        reaction_origin=excluded.reaction_origin`;
    messages.forEach((m, idx) => {
      const ts = m.timestamp ?? Date.now();
      const order = m.order ?? idx + 1;
      const reaction =
        typeof m.reaction === 'string' && m.reaction.trim() !== '' ? m.reaction : null;
      const origin =
        typeof m.reaction_origin === 'string' && m.reaction_origin.trim() !== ''
          ? m.reaction_origin
          : null;
      this.db.run(sql, [
        ghost,
        order,
        m.author,
        m.text ?? null,
        m.type ?? null,
        m.avatar ?? null,
        m.src ?? null,
        m.media_id ?? null,
        m.stage_id ?? null,
        m.fingerprint,
        ts,
        reaction,
        origin,
      ]);
    });
  }

  /**
   * Replace legacy numeric fingerprints with content-based ones.
   * Inserts new records and removes the provided legacy fingerprints
   * within a single transaction to avoid data loss.
   * @param {string} ghost
   * @param {Array<object>} rows rows with updated fingerprints
   * @param {Array<string>} remove list of numeric fingerprints to delete
   */
  replaceFingerprints(ghost, rows = [], remove = []) {
    const insert = `INSERT INTO dialog_messages(ghost, order_idx, author, text, type, avatar, src, media_id, stage_id, fingerprint, ts, reaction, reaction_origin)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(ghost, fingerprint) DO UPDATE SET
        order_idx=excluded.order_idx,
        author=excluded.author,
        text=excluded.text,
        type=excluded.type,
        avatar=excluded.avatar,
        src=excluded.src,
        media_id=excluded.media_id,
        stage_id=excluded.stage_id,
        ts=excluded.ts,
        reaction=excluded.reaction,
        reaction_origin=excluded.reaction_origin`;
    rows.forEach((r) => {
      const ts = r.timestamp ?? Date.now();
      const order = r.order ?? 0;
      const reaction =
        typeof r.reaction === 'string' && r.reaction.trim() !== '' ? r.reaction : null;
      const origin =
        typeof r.reaction_origin === 'string' && r.reaction_origin.trim() !== ''
          ? r.reaction_origin
          : null;
      this.db.run(insert, [
        ghost,
        order,
        r.author,
        r.text ?? null,
        r.type ?? null,
        r.avatar ?? null,
        r.src ?? null,
        r.media_id ?? null,
        r.stage_id ?? null,
        r.fingerprint,
        ts,
        reaction,
        origin,
      ]);
    });
    if (remove.length) {
      const placeholders = remove.map(() => '?').join(',');
      this.db.run(
        `DELETE FROM dialog_messages WHERE ghost = ? AND fingerprint IN (${placeholders})`,
        [ghost, ...remove],
      );
    }
  }

  loadAll(ghost) {
    const rows = this.db.fetchAll(
      `SELECT author, text, type, avatar, src, media_id, stage_id, reaction, reaction_origin, fingerprint, ts as timestamp, order_idx FROM dialog_messages WHERE ghost = ? ORDER BY ts, order_idx`,
      [ghost],
    );
    return rows.map((r) => ({
      author: r.author,
      text: r.text,
      type: r.type,
      avatar: r.avatar,
      src: r.src,
      media_id: r.media_id,
      stage_id: r.stage_id,
      reaction: r.reaction,
      reaction_origin: r.reaction_origin,
      fingerprint: r.fingerprint,
      timestamp: Number(r.timestamp),
      order: Number(r.order_idx),
    }));
  }

  loadAllGrouped() {
    const rows = this.db.fetchAll(
      `SELECT ghost, author, text, type, avatar, src, media_id, stage_id, reaction, reaction_origin, fingerprint, ts as timestamp, order_idx
       FROM dialog_messages
       ORDER BY ghost, ts, order_idx`,
    );
    return rows.reduce((acc, row) => {
      if (!acc[row.ghost]) acc[row.ghost] = [];
      acc[row.ghost].push({
        author: row.author,
        text: row.text,
        type: row.type,
        avatar: row.avatar,
        src: row.src,
        media_id: row.media_id,
        stage_id: row.stage_id,
        reaction: row.reaction,
        reaction_origin: row.reaction_origin,
        fingerprint: row.fingerprint,
        timestamp: Number(row.timestamp),
        order: Number(row.order_idx),
      });
      return acc;
    }, {});
  }

  clearAll() {
    this.db.run(`DELETE FROM dialog_messages;`);
  }

  clearGhost(ghost) {
    if (!ghost) return;
    this.db.run(`DELETE FROM dialog_messages WHERE ghost = ?;`, [ghost]);
  }

  replaceAll(histories = {}) {
    this.clearAll();
    Object.entries(histories || {}).forEach(([ghost, messages]) => {
      if (!Array.isArray(messages)) return;
      this.appendUnique(
        ghost,
        messages.map((msg) => ({
          author: msg.author,
          text: msg.text,
          type: msg.type,
          avatar: msg.avatar,
          src: msg.src,
          media_id: msg.media_id,
          stage_id: msg.stage_id,
          reaction:
            typeof msg.reaction === 'string' && msg.reaction.trim() !== '' ? msg.reaction : null,
          reaction_origin:
            typeof msg.reaction_origin === 'string' && msg.reaction_origin.trim() !== ''
              ? msg.reaction_origin
              : null,
          fingerprint: msg.fingerprint,
          timestamp: msg.timestamp,
          order: msg.order,
        })),
      );
    });
  }

  updateReaction(ghost, fingerprint, reaction, origin = null) {
    if (!ghost || !fingerprint) return;
    const value = typeof reaction === 'string' && reaction.trim() !== '' ? reaction : null;
    const reactionOrigin = typeof origin === 'string' && origin.trim() !== '' ? origin : null;
    this.db.run(
      `UPDATE dialog_messages SET reaction = ?, reaction_origin = COALESCE(?, reaction_origin) WHERE ghost = ? AND fingerprint = ?`,
      [value, reactionOrigin, ghost, fingerprint],
    );
  }
}
