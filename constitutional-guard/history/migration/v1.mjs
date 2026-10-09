import { assert, openDatabase, runDriver } from '../../driver-tools.mjs';
import DialogRepository from '../../../proto-dev/src/messenger/persistence/dialog-repository.js';
import MediaRepository from '../../../proto-dev/src/media/persistence/media-repository.js';

await runDriver(
  [
    'migration.legacy-determinism',
    'migration.idempotence',
    'migration.backup',
    'migration.invalid-import',
    'migration.media-reload',
  ],
  async () => {
    const database = await openDatabase();
    try {
      database.run(
        'CREATE TABLE dialog_messages(ghost TEXT,order_idx INTEGER,author TEXT,text TEXT,type TEXT,avatar TEXT,src TEXT,media_id TEXT,fingerprint TEXT,ts INTEGER,PRIMARY KEY(ghost,fingerprint))',
      );
      database.run(
        "INSERT INTO dialog_messages VALUES('A',2,'ghost','first',NULL,'avatar',NULL,NULL,'42',10)",
      );
      database.run(
        "INSERT INTO dialog_messages VALUES('A',1,'user','second',NULL,NULL,NULL,NULL,'43',10)",
      );
      const before = database.storage.load('sqlite_db');
      const repository = new DialogRepository(database);
      repository.boot();
      assert.equal(database.storage.load('sqlite_db_backup_before_dialog_v2'), before);
      assert.deepEqual(
        repository.loadAll('A').map((message) => [message.fingerprint, message.sequence]),
        [
          ['43', 1],
          ['42', 2],
        ],
      );
      const migrated = repository.loadAll('A');
      repository.ensureSchema();
      assert.deepEqual(repository.loadAll('A'), migrated);
      assert.throws(
        () =>
          repository.replaceAll({
            A: [
              { author: 'user', fingerprint: 'same', sequence: 1 },
              { author: 'user', fingerprint: 'same', sequence: 2 },
            ],
          }),
        /Conflicting/,
      );
      assert.deepEqual(repository.loadAll('A'), migrated);
      const media = new MediaRepository(database);
      media.boot();
      const id = await media.save(
        { thumb: new Blob(['thumbnail']), full: new Blob(['full image']) },
        { label: 'retained' },
      );
      const fork = database.fork(database.exportSnapshot());
      try {
        const restored = new MediaRepository(fork);
        restored.boot();
        assert.equal((await restored.get(id)).label, 'retained');
        const handle = await restored.getObjectURL(`full-${id}`);
        assert.ok(handle.url.startsWith('blob:'));
        handle.revoke();
        assert.equal(
          (await fork.get('SELECT length(full) AS size FROM media WHERE id=?', [id])).size,
          10,
        );
      } finally {
        fork.db.close();
      }
    } finally {
      await database.dispose();
    }
  },
);
