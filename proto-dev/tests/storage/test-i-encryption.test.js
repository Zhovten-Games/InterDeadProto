import IEncryption from '../../src/storage/ports/encryption-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IEncryption contract', () => {
  it('declares async encrypt/decrypt operations', async () => {
    await assertPortContract(IEncryption, [
      { name: 'encrypt', async: true, args: [{}, 'secret'] },
      { name: 'decrypt', async: true, args: [new Uint8Array(), 'secret'] },
    ]);
  });
});
