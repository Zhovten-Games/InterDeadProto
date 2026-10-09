/** Canonical append owner. Calls are synchronous under the database writer lease. */
export default class DialogRepository {
  constructor(db) {
    this.db = db;
  }
  boot() {
    this.ensureSchema();
  }

  ensureSchema() {
    const existed =
      this.db.fetchAll(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='dialog_messages'",
      ).length > 0;
    this.db.transaction(
      () => {
        this.db.run(`CREATE TABLE IF NOT EXISTS dialog_messages(
        ghost TEXT NOT NULL, order_idx INTEGER NOT NULL, author TEXT NOT NULL,
        text TEXT, type TEXT, avatar TEXT, src TEXT, media_id TEXT, stage_id TEXT,
        reaction TEXT, reaction_origin TEXT, fingerprint TEXT NOT NULL, ts INTEGER NOT NULL,
        sequence INTEGER, chronology_origin TEXT, PRIMARY KEY(ghost, fingerprint))`);
        for (const [column, type] of [
          ['reaction', 'TEXT'],
          ['reaction_origin', 'TEXT'],
          ['stage_id', 'TEXT'],
          ['sequence', 'INTEGER'],
          ['chronology_origin', 'TEXT'],
        ]) {
          const columns = this.db.fetchAll('PRAGMA table_info(dialog_messages)');
          if (!columns.some((entry) => entry.name === column))
            this.db.run(`ALTER TABLE dialog_messages ADD COLUMN ${column} ${type}`);
        }
        this.db.run(
          'CREATE TABLE IF NOT EXISTS idp_schema_versions(name TEXT PRIMARY KEY, version INTEGER NOT NULL, provenance TEXT)',
        );
        const current = this.db.fetchAll(
          "SELECT version FROM idp_schema_versions WHERE name='dialog'",
        )[0];
        if (current?.version > 2) throw new Error('Unsupported newer dialog schema; save retained');
        if (!current || current.version < 2) {
          const rows = this.db.fetchAll(
            'SELECT rowid AS legacy_rowid, ghost, fingerprint FROM dialog_messages ORDER BY ghost, ts, order_idx, rowid, fingerprint',
          );
          const sequences = new Map();
          for (const row of rows) {
            const sequence = (sequences.get(row.ghost) || 0) + 1;
            sequences.set(row.ghost, sequence);
            this.db.run(
              'UPDATE dialog_messages SET sequence=?, chronology_origin=? WHERE ghost=? AND fingerprint=?',
              [sequence, 'legacy:ts-order-rowid-fingerprint', row.ghost, row.fingerprint],
            );
          }
          this.db.run(
            "INSERT OR REPLACE INTO idp_schema_versions(name, version, provenance) VALUES('dialog',2,'deterministic legacy order; original timestamps and identities retained')",
          );
        }
        this.db.run(
          'CREATE UNIQUE INDEX IF NOT EXISTS dialog_sequence_identity ON dialog_messages(ghost, sequence)',
        );
        this.db.run(
          'CREATE TABLE IF NOT EXISTS dialog_timeline_sequences(ghost TEXT PRIMARY KEY, next_sequence INTEGER NOT NULL)',
        );
        for (const row of this.db.fetchAll(
          'SELECT ghost, MAX(sequence)+1 AS next_sequence FROM dialog_messages GROUP BY ghost',
        )) {
          this.db.run(
            'INSERT INTO dialog_timeline_sequences(ghost,next_sequence) VALUES(?,?) ON CONFLICT(ghost) DO UPDATE SET next_sequence=MAX(next_sequence,excluded.next_sequence)',
            [row.ghost, row.next_sequence],
          );
        }
      },
      { backupKey: existed ? 'sqlite_db_backup_before_dialog_v2' : null },
    );
  }

  appendUnique(ghost, messages = []) {
    if (!ghost || !Array.isArray(messages)) throw new Error('Timeline and messages required');
    return this.db.transaction(() => {
      this.db.run(
        'INSERT OR IGNORE INTO dialog_timeline_sequences(ghost,next_sequence) VALUES(?,1)',
        [ghost],
      );
      for (const message of messages) {
        if (!message.fingerprint) throw new Error('Persistent occurrence identity required');
        const identity = String(message.fingerprint);
        if (
          this.db.fetchAll('SELECT sequence FROM dialog_messages WHERE ghost=? AND fingerprint=?', [
            ghost,
            identity,
          ]).length
        )
          continue;
        const sequence = Number(
          this.db.fetchAll('SELECT next_sequence FROM dialog_timeline_sequences WHERE ghost=?', [
            ghost,
          ])[0].next_sequence,
        );
        this.db.run(
          `INSERT INTO dialog_messages(ghost,order_idx,author,text,type,avatar,src,media_id,stage_id,reaction,reaction_origin,fingerprint,ts,sequence,chronology_origin)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            ghost,
            sequence,
            message.author || 'system',
            message.text ?? null,
            message.type ?? null,
            message.avatar ?? null,
            message.src ?? null,
            message.media_id ?? null,
            message.stage_id ?? null,
            message.reaction || null,
            message.reaction_origin || null,
            identity,
            message.timestamp ?? Date.now(),
            sequence,
            'accepted-sequence',
          ],
        );
        this.db.run('UPDATE dialog_timeline_sequences SET next_sequence=? WHERE ghost=?', [
          sequence + 1,
          ghost,
        ]);
      }
      const identities = new Set(messages.map((message) => String(message.fingerprint)));
      return this.loadAll(ghost).filter((message) => identities.has(message.fingerprint));
    });
  }

  _row(row) {
    return {
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
      timestamp: Number(row.ts),
      sequence: Number(row.sequence),
      order: Number(row.sequence),
      chronologyOrigin: row.chronology_origin,
    };
  }
  loadAll(ghost) {
    return this.db
      .fetchAll('SELECT * FROM dialog_messages WHERE ghost=? ORDER BY sequence ASC', [ghost])
      .map((row) => this._row(row));
  }
  loadAllGrouped() {
    const result = {};
    for (const row of this.db.fetchAll(
      'SELECT * FROM dialog_messages ORDER BY ghost,sequence ASC',
    )) {
      (result[row.ghost] ||= []).push(this._row(row));
    }
    return result;
  }
  clearAll() {
    this.db.run('DELETE FROM dialog_messages');
  }
  clearGhost(ghost) {
    if (ghost) this.db.run('DELETE FROM dialog_messages WHERE ghost=?', [ghost]);
  }

  /** Explicit alias migration retains sequence and created metadata; collisions refuse. */
  replaceFingerprints(ghost, rows = [], remove = []) {
    return this.db.transaction(() => {
      for (let index = 0; index < remove.length; index++) {
        const old = remove[index],
          next = rows[index]?.fingerprint;
        if (next && String(next) !== String(old)) {
          this.db.run('UPDATE dialog_messages SET fingerprint=? WHERE ghost=? AND fingerprint=?', [
            String(next),
            ghost,
            String(old),
          ]);
        }
      }
    });
  }

  replaceAll(histories = {}) {
    return this.db.transaction(
      () => {
        this.clearAll();
        this.db.run('DELETE FROM dialog_timeline_sequences');
        for (const [ghost, messages] of Object.entries(histories)) {
          if (!Array.isArray(messages)) throw new Error('Invalid imported history');
          const ordered = messages
            .map((message, index) => ({ ...message, _index: index }))
            .sort(
              (a, b) =>
                (a.sequence ?? a.order ?? a._index + 1) - (b.sequence ?? b.order ?? b._index + 1),
            );
          const accepted = this.appendUnique(ghost, ordered);
          const declared = ordered.every(
            (message) => Number.isSafeInteger(message.sequence) && message.sequence > 0,
          );
          if (declared) {
            const sequenceSet = new Set(ordered.map((message) => message.sequence));
            if (sequenceSet.size !== ordered.length || accepted.length !== ordered.length)
              throw new Error('Conflicting imported sequence/identity');
            // Clear the unique index values before restoring possibly gapped numbering.
            this.db.run('UPDATE dialog_messages SET sequence=NULL WHERE ghost=?', [ghost]);
            for (const message of ordered)
              this.db.run(
                'UPDATE dialog_messages SET sequence=?,order_idx=? WHERE ghost=? AND fingerprint=?',
                [message.sequence, message.sequence, ghost, message.fingerprint],
              );
            const next = Math.max(0, ...ordered.map((message) => message.sequence)) + 1;
            this.db.run('UPDATE dialog_timeline_sequences SET next_sequence=? WHERE ghost=?', [
              next,
              ghost,
            ]);
          }
        }
      },
      { backupKey: 'sqlite_db_backup_before_history_import' },
    );
  }

  updateReaction(ghost, fingerprint, reaction, origin = null) {
    if (!ghost || !fingerprint) return;
    this.db.run(
      'UPDATE dialog_messages SET reaction=?, reaction_origin=COALESCE(?,reaction_origin) WHERE ghost=? AND fingerprint=?',
      [reaction || null, origin || null, ghost, fingerprint],
    );
  }
}
