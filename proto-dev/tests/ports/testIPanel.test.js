import IPanel from '../../src/ports/IPanel.js';
import { assertPortContract } from './assertPortContract.js';

describe('IPanel contract', () => {
  it('declares panel lifecycle', async () => {
    await assertPortContract(IPanel, [
      { name: 'boot' },
      { name: 'load', async: true, args: [{}] },
      { name: 'update', async: true, args: [null, {}] }
    ]);
  });
});
