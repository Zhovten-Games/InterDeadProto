import IView from '../../src/app-shell/ports/view-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IView contract', () => {
  it('declares view lifecycle', async () => {
    await assertPortContract(IView, [{ name: 'boot' }, { name: 'dispose' }]);
  });
});
