import assert from 'assert';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';

describe('MediaRepository object URLs', () => {
  it('revoke revokes URL', async () => {
    const repo = new MediaRepository();
    const blob = new Blob(['x']);
    repo._blobs.set('k', blob);
    let revoked = '';
    const origURL = global.URL;
    global.URL = {
      createObjectURL: () => 'blob:test',
      revokeObjectURL: url => { revoked = url; }
    };
    const { url, revoke } = await repo.getObjectURL('k');
    assert.strictEqual(url, 'blob:test');
    revoke();
    assert.strictEqual(revoked, 'blob:test');
    global.URL = origURL;
  });

  it('revokeAll revokes remaining URLs', async () => {
    const repo = new MediaRepository();
    const blob = new Blob(['y']);
    repo._blobs.set('k', blob);
    let revoked = [];
    const origURL = global.URL;
    global.URL = {
      createObjectURL: () => 'blob:test2',
      revokeObjectURL: url => revoked.push(url)
    };
    await repo.getObjectURL('k');
    repo.revokeAll();
    assert.deepStrictEqual(revoked, ['blob:test2']);
    global.URL = origURL;
  });
});
