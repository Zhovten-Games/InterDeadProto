import assert from 'assert';
import initSqlJs from 'sql.js';
import path from 'path';
import DatabaseAdapter from '../../../src/adapters/database/DatabaseAdapter.js';

function createInit() {
  return opts => initSqlJs({ locateFile: file => path.join('node_modules/sql.js/dist', file) });
}

describe('DatabaseAdapter persistence', function() {
  it('reloads saved user from storage', async function() {
    const store = {};
    const persistence = {
      save(k, v) { store[k] = v; },
      load(k) { return store[k]; },
      remove(k) { delete store[k]; }
    };
    const db1 = new DatabaseAdapter(':memory:', null, createInit(), persistence);
    await db1.boot();
    await db1.saveUser({ name: 'Eve', created_at: '2020-01-01T00:00:00Z' });
    const saved = store.sqlite_db;
    const db2 = new DatabaseAdapter(':memory:', null, createInit(), persistence);
    await db2.boot();
    const user = await db2.loadUser();
    assert.strictEqual(saved, store.sqlite_db);
    assert.strictEqual(user.name, 'Eve');
  });
});

