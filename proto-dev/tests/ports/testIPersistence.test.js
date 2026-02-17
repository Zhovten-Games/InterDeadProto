import IPersistence from '../../src/ports/IPersistence.js';
import { assertPortContract } from './assertPortContract.js';

describe('IPersistence contract', () => {
  it('declares persistence operations', async () => {
    await assertPortContract(IPersistence, [
      { name: 'load', args: ['key'] },
      { name: 'save', args: ['key', {}] },
      { name: 'remove', args: ['key'] },
      { name: 'clear' }
    ]);
  });
});
