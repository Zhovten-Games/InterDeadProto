import ILanguage from '../../src/ports/ILanguage.js';
import { assertPortContract } from './assertPortContract.js';

describe('ILanguage contract', () => {
  it('declares language management methods', async () => {
    await assertPortContract(ILanguage, [
      { name: 'boot', async: true },
      { name: 'dispose' },
      { name: 'addGhostLocales', async: true, args: ['guide'] },
      { name: 'setLanguage', args: ['en'] },
      { name: 'applyLanguage', async: true, args: [null] },
      { name: 'translate', async: true, args: ['key', 'ui'] }
    ]);
  });
});
