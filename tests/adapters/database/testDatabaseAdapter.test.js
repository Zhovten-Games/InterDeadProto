import assert from 'assert';
import initSqlJs from 'sql.js';
import path from 'path';
import DatabaseAdapter from '../../../src/adapters/database/DatabaseAdapter.js';

function createDb() {
  const init = opts => initSqlJs({ locateFile: file => path.join('node_modules/sql.js/dist', file) });
  return new DatabaseAdapter(':memory:', null, init);
}

describe('DatabaseAdapter boot', function() {
  it('creates required tables', async function() {
    const db = createDb();
    await db.boot();
    const rows = await db.fetchAll("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = rows.map(r => r.name);
    ['users','exports','locations','selfies','posts'].forEach(t => {
      assert.ok(tableNames.includes(t), `missing table ${t}`);
    });
  });

  it('loadUser returns last saved user', async function() {
    const db = createDb();
    await db.boot();
    await db.saveUser({ name: 'Alice', created_at: '2020-01-01T00:00:00Z' });
    await db.saveUser({ name: 'Bob', created_at: '2020-01-02T00:00:00Z' });
    const user = await db.loadUser();
    assert.strictEqual(user.name, 'Bob');
  });
});
