import IGeolocation from '../../src/identity/ports/geolocation-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IGeolocation contract', () => {
  it('declares geolocation lookup', async () => {
    await assertPortContract(IGeolocation, [{ name: 'getCurrentLocation', async: true }]);
  });
});
