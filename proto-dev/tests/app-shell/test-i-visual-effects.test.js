import IVisualEffects from '../../src/app-shell/ports/visual-effects-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IVisualEffects contract', () => {
  it('declares visual effect hooks', async () => {
    await assertPortContract(IVisualEffects, [
      { name: 'mount', args: [null] },
      { name: 'applyEffect', args: ['effect', {}] },
      { name: 'clearEffect', args: ['effect'] },
      { name: 'clearAll' },
    ]);
  });
});
