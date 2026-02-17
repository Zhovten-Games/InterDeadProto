import IGeolocation from '../../src/ports/IGeolocation.js';
import { assertPortContract } from './assertPortContract.js';

describe('IGeolocation contract', () => {
  it('declares geolocation lookup', async () => {
    await assertPortContract(IGeolocation, [
      { name: 'getCurrentLocation', async: true }
    ]);
  });
});
