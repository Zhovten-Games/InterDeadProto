import IPersistence from '../../src/storage/ports/persistence-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IPersistence contract', () => {
  it('declares persistence operations', async () => {
    await assertPortContract(IPersistence, [
      { name: 'load', args: ['key'] },
      { name: 'save', args: ['key', {}] },
      { name: 'remove', args: ['key'] },
      { name: 'clear' },
    ]);
  });
});
