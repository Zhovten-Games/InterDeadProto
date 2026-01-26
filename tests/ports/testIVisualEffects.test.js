import IVisualEffects from '../../src/ports/IVisualEffects.js';
import { assertPortContract } from './assertPortContract.js';

describe('IVisualEffects contract', () => {
  it('declares visual effect hooks', async () => {
    await assertPortContract(IVisualEffects, [
      { name: 'mount', args: [null] },
      { name: 'applyEffect', args: ['effect', {}] },
      { name: 'clearEffect', args: ['effect'] },
      { name: 'clearAll' }
    ]);
  });
});
