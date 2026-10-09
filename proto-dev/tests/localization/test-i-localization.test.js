import ILocalization from '../../src/localization/ports/localization-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('ILocalization contract', () => {
  it('declares localisation helpers', async () => {
    await assertPortContract(ILocalization, [
      { name: 'setLanguage', args: ['en'] },
      { name: 'translate', async: true, args: ['key', 'ui'] },
    ]);
  });
});
