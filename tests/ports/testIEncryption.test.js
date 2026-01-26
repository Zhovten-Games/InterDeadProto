import IEncryption from '../../src/ports/IEncryption.js';
import { assertPortContract } from './assertPortContract.js';

describe('IEncryption contract', () => {
  it('declares async encrypt/decrypt operations', async () => {
    await assertPortContract(IEncryption, [
      { name: 'encrypt', async: true, args: [{}, 'secret'] },
      { name: 'decrypt', async: true, args: [new Uint8Array(), 'secret'] }
    ]);
  });
});
