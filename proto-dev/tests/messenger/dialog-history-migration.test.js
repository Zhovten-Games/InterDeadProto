import { testSqlInitializer } from '../fixtures/sql-initializer.js';
import assert from 'assert';
import DatabaseAdapter from '../../src/storage/browser/database-adapter.js';
import DialogRepository from '../../src/messenger/persistence/dialog-repository.js';
import DialogHistoryService from '../../src/messenger/history/dialog-history-service.js';

function createDB() {
  return new DatabaseAdapter(':memory:', { error() {} }, testSqlInitializer, {
    save() {},
    load() {},
  });
}

describe('DialogHistoryService migration', () => {
  it('retains declared numeric identities and immutable accepted sequence', async () => {
    const db = createDB();
    await db.boot();
    const repo = new DialogRepository(db);
    repo.ensureSchema();
    // Seed legacy numeric fingerprints
    repo.appendUnique('g1', [
      { author: 'ghost', text: 'hi', fingerprint: '1', timestamp: 1, order: 1 },
      { author: 'user', text: 'yo', fingerprint: '2', timestamp: 2, order: 2 },
    ]);
    const svc = new DialogHistoryService(repo);
    const rows = svc.load('g1');
    assert.strictEqual(rows.length, 2);
    assert.deepStrictEqual(
      rows.map((row) => [row.fingerprint, row.sequence]),
      [
        ['1', 1],
        ['2', 2],
      ],
    );
    const stored = repo.loadAll('g1');
    assert.strictEqual(stored.length, 2);
    assert.deepStrictEqual(
      stored.map((row) => [row.fingerprint, row.sequence]),
      [
        ['1', 1],
        ['2', 2],
      ],
    );
    await db.dispose();
  });
});
