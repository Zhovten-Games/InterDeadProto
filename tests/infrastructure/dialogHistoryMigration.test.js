import assert from 'assert';
import fs from 'fs';
import path from 'path';
import DatabaseAdapter from '../../src/adapters/database/DatabaseAdapter.js';
import DialogRepository from '../../src/infrastructure/repositories/DialogRepository.js';
import DialogHistoryService from '../../src/application/services/DialogHistoryService.js';

function createDB() {
  return new DatabaseAdapter(':memory:', { error() {} }, undefined, { save() {}, load() {} });
}

before(() => {
  try {
    fs.symlinkSync(path.resolve('assets'), '/assets');
  } catch {}
});

after(() => {
  try {
    fs.unlinkSync('/assets');
  } catch {}
});

describe('DialogHistoryService migration', () => {
  it('replaces numeric fingerprints with stable ones', async () => {
    const db = createDB();
    await db.boot();
    const repo = new DialogRepository(db);
    repo.ensureSchema();
    // Seed legacy numeric fingerprints
    repo.appendUnique('g1', [
      { author: 'ghost', text: 'hi', fingerprint: '1', timestamp: 1, order: 1 },
      { author: 'user', text: 'yo', fingerprint: '2', timestamp: 2, order: 2 }
    ]);
    const svc = new DialogHistoryService(repo);
    const rows = svc.load('g1');
    assert.strictEqual(rows.length, 2);
    rows.forEach(r => assert.ok(!/^\d+$/.test(r.fingerprint)));
    const stored = repo.loadAll('g1');
    assert.strictEqual(stored.length, 2);
    stored.forEach(r => assert.ok(!/^\d+$/.test(r.fingerprint)));
  });
});
