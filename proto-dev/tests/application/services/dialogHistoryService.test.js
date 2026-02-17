import assert from 'assert';
import DialogHistoryService from '../../../src/application/services/DialogHistoryService.js';
import DialogRepository from '../../../src/infrastructure/repositories/DialogRepository.js';
import DatabaseAdapter from '../../../src/adapters/database/DatabaseAdapter.js';

/**
 * Ensures dialog history saves and loads per ghost.
 */
describe('DialogHistoryService', () => {
  const createService = async () => {
    const db = new DatabaseAdapter(':memory:', { error() {} }, undefined, {
      save() {},
      load() {}
    });
    await db.boot();
    const repo = new DialogRepository(db);
    repo.ensureSchema();
    const svc = new DialogHistoryService(repo);
    return { svc, db };
  };

  it('persists messages for each ghost separately', async () => {
    const { svc } = await createService();
    const msgs = [{ author: 'ghost', text: 'hi', fingerprint: 'g:hi' }];
    svc.save('g1', msgs);
    const loaded = svc.load('g1');
    assert.strictEqual(loaded[0].author, 'ghost');
    assert.strictEqual(loaded[0].text, 'hi');
    assert.strictEqual(loaded[0].fingerprint, 'g:hi');
    assert.deepStrictEqual(svc.load('g2'), []);
  });

  it('overwrites history without creating duplicates', async () => {
    const { svc } = await createService();
    const msgs = [{ author: 'ghost', text: 'hi', fingerprint: 'f1' }];
    svc.save('g1', msgs);
    svc.save('g1', msgs);
    const loaded = svc.load('g1');
    assert.strictEqual(loaded.length, 1);
    assert.strictEqual(loaded[0].author, 'ghost');
  });

      it('handles image messages with media id', async () => {
        const { svc } = await createService();
        const msgs = [{ type: 'image', src: 'data:x', media: { id: 'm1' }, fingerprint: 'cap:1' }];
        svc.save('g1', msgs);
        const loaded = svc.load('g1')[0];
        assert.strictEqual(loaded.type, 'image');
        assert.strictEqual(loaded.src, 'data:x');
        assert.strictEqual(loaded.media.id, 'm1');
        assert.strictEqual(loaded.fingerprint, 'cap:1');
      });

      it('persists data URL from persistSrc when src is a blob', async () => {
        const { svc } = await createService();
        const msgs = [{ type: 'image', src: 'blob:tmp', persistSrc: 'data:y', fingerprint: 'img:1' }];
        svc.save('g1', msgs);
        const loaded = svc.load('g1')[0];
        assert.strictEqual(loaded.src, 'data:y');
        assert.strictEqual(loaded.fingerprint, 'img:1');
      });

    it('avoids history collapse for blob images without media id', async () => {
      const { svc } = await createService();
      svc.save('g1', [{ author: 'ghost', text: 'hi', fingerprint: 't1' }]);
      svc.appendUnique('g1', [{ type: 'image', src: 'blob:123', author: 'ghost' }]);
      const loaded = svc.load('g1');
      assert.strictEqual(loaded.length, 2);
      assert.strictEqual(loaded[1].type, 'image');
    });

  it('deduplicates entries by fingerprint or id', async () => {
    const { svc } = await createService();
    const msgs = [
      { author: 'ghost', text: 'hi', id: 1, fingerprint: 'f1' },
      { author: 'ghost', text: 'hi', id: 1, fingerprint: 'f1' },
      { author: 'ghost', text: 'hey', id: 2 },
      { author: 'ghost', text: 'hey', id: 2 },
      { author: 'ghost', text: 'unique', id: 3 }
    ];
    svc.save('g1', msgs);
    const loaded = svc.load('g1');
    assert.strictEqual(loaded.length, 3);
    assert.deepStrictEqual(loaded.map(m => m.text), ['hi', 'hey', 'unique']);
  });

  it('appends messages to existing history', async () => {
    const { svc } = await createService();
    svc.save('g1', [{ author: 'ghost', text: 'a', fingerprint: 'a' }]);
    svc.appendUnique('g1', [{ author: 'ghost', text: 'b', fingerprint: 'b' }]);
    const loaded = svc.load('g1');
    assert.strictEqual(loaded.length, 2);
    assert.strictEqual(loaded[1].text, 'b');
  });

  it('ignores duplicates on repeated appendUnique calls', async () => {
    const { svc } = await createService();
    const first = { author: 'ghost', text: 'hi', id: 1, fingerprint: 'fp1' };
    const second = { author: 'ghost', text: 'hi again', id: 1, fingerprint: 'fp2' };
    svc.appendUnique('g1', [first]);
    svc.appendUnique('g1', [second]);
    const loaded = svc.load('g1');
    assert.strictEqual(loaded.length, 1);
    assert.strictEqual(loaded[0].fingerprint, 'fp1');
  });
});
