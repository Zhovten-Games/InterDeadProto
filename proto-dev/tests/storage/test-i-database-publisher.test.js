import IDatabasePublisher from '../../src/storage/ports/database-publisher-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IDatabasePublisher contract', () => {
  it('declares publisher operations', async () => {
    await assertPortContract(IDatabasePublisher, [
      { name: 'boot', async: true },
      { name: 'registerUser', async: true, args: ['name'] },
      { name: 'publishPost', async: true, args: [1, 'content'] },
      { name: 'fetchPosts', async: true, args: [1] },
    ]);
  });
});
