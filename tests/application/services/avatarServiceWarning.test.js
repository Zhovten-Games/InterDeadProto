import assert from 'assert';
import AvatarService from '../../../src/application/services/AvatarService.js';

describe('AvatarService logging', () => {
  it('warns when no avatar is found', async () => {
    const logs = [];
    const db = { get: async () => null };
    const logger = { info: () => {}, warn: msg => logs.push(msg) };
    const svc = new AvatarService(db, logger);
    const res = await svc.getUserAvatar();
    assert.strictEqual(res, null);
    assert.ok(logs.some(l => l.includes('User avatar not found')));
  });
});
