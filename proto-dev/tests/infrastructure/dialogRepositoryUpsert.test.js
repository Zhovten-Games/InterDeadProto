import assert from 'assert';
import DatabaseAdapter from '../../src/adapters/database/DatabaseAdapter.js';
import DialogRepository from '../../src/infrastructure/repositories/DialogRepository.js';

describe('DialogRepository appendUnique', () => {
  it('ignores duplicates for same fingerprint', async () => {
    const db = new DatabaseAdapter(':memory:', { error() {} }, undefined, {
      save() {},
      load() {}
    });
    await db.boot();
    const repo = new DialogRepository(db);
    repo.ensureSchema();
    const msg = {
      author: 'ghost',
      text: 'hi',
      fingerprint: 'fp1',
      timestamp: Date.now(),
      order: 1
    };
    repo.appendUnique('g1', [msg]);
    repo.appendUnique('g1', [msg]);
    const rows = repo.loadAll('g1');
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].fingerprint, 'fp1');
  });
});
