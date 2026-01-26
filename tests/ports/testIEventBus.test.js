import IEventBus from '../../src/ports/IEventBus.js';
import { assertPortContract } from './assertPortContract.js';

describe('IEventBus contract', () => {
  it('declares event bus pub/sub operations', async () => {
    await assertPortContract(IEventBus, [
      { name: 'subscribe', args: [() => {}] },
      { name: 'unsubscribe', args: [() => {}] },
      { name: 'emit', args: [{}] }
    ]);
  });
});
