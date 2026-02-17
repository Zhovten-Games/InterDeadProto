import INotification from '../../src/ports/INotification.js';
import { assertPortContract } from './assertPortContract.js';

describe('INotification contract', () => {
  it('declares notification surface', async () => {
    await assertPortContract(INotification, [
      { name: 'showNotification', args: ['message', {}] }
    ]);
  });
});
