import IDetection from '../../src/camera/ports/detection-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IDetection contract', () => {
  it('declares detection capability', async () => {
    await assertPortContract(IDetection, [
      { name: 'detectTarget', async: true, args: [null, 'person'] },
    ]);
  });
});
