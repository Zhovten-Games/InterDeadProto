import IView from '../../src/ports/IView.js';
import { assertPortContract } from './assertPortContract.js';

describe('IView contract', () => {
  it('declares view lifecycle', async () => {
    await assertPortContract(IView, [
      { name: 'boot' },
      { name: 'dispose' }
    ]);
  });
});
