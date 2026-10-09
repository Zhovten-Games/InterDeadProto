import assert from 'assert';
import initSqlJs from 'sql.js';
import path from 'path';

describe('PostsService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/messenger/application/posts-service.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });

  it('publishes post after boot without errors', async () => {
    const init = (opts) =>
      initSqlJs({ locateFile: (f) => path.join('node_modules/sql.js/dist', f) });
    const errors = [];
    const logger = { error: (msg) => errors.push(msg) };
    const db = new (await import('../../../src/storage/browser/database-adapter.js')).default(
      ':memory:',
      logger,
      init,
    );
    await db.boot();
    await db.saveUser({ name: 'Tester', created_at: new Date().toISOString() });
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const PostsService = (await import('../../../src/messenger/application/posts-service.js'))
      .default;
    const posts = new PostsService(db, ghostService);
    await posts.publish('hello');
    assert.strictEqual(errors.length, 0);
    const rows = await db.fetchAll('SELECT * FROM posts');
    assert.strictEqual(rows.length, 1);
  });
});
