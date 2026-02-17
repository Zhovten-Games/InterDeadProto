import IItemDetection from '../../src/ports/IItemDetection.js';
import { assertPortContract } from './assertPortContract.js';

describe('IItemDetection contract', () => {
  it('declares item detection', async () => {
    await assertPortContract(IItemDetection, [
      { name: 'detectItems', async: true, args: [null] }
    ]);
  });
});
