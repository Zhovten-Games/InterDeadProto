import IDetection from '../../src/ports/IDetection.js';
import { assertPortContract } from './assertPortContract.js';

describe('IDetection contract', () => {
  it('declares detection capability', async () => {
    await assertPortContract(IDetection, [
      { name: 'detectTarget', async: true, args: [null, 'person'] }
    ]);
  });
});
