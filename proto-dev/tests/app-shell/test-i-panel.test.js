import IPanel from '../../src/app-shell/ports/panel-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IPanel contract', () => {
  it('declares panel lifecycle', async () => {
    await assertPortContract(IPanel, [
      { name: 'boot' },
      { name: 'load', async: true, args: [{}] },
      { name: 'update', async: true, args: [null, {}] },
    ]);
  });
});
