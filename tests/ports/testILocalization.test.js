import ILocalization from '../../src/ports/ILocalization.js';
import { assertPortContract } from './assertPortContract.js';

describe('ILocalization contract', () => {
  it('declares localisation helpers', async () => {
    await assertPortContract(ILocalization, [
      { name: 'setLanguage', args: ['en'] },
      { name: 'translate', async: true, args: ['key', 'ui'] }
    ]);
  });
});
