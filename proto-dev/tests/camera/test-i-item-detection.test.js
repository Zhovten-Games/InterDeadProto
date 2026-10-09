import IItemDetection from '../../src/camera/ports/item-detection-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IItemDetection contract', () => {
  it('declares item detection', async () => {
    await assertPortContract(IItemDetection, [{ name: 'detectItems', async: true, args: [null] }]);
  });
});
