import INotification from '../../src/notifications/ports/notification-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('INotification contract', () => {
  it('declares notification surface', async () => {
    await assertPortContract(INotification, [{ name: 'showNotification', args: ['message', {}] }]);
  });
});
