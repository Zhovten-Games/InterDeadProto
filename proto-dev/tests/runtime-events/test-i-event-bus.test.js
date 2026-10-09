import IEventBus from '../../src/runtime-events/ports/event-bus-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('IEventBus contract', () => {
  it('declares event bus pub/sub operations', async () => {
    await assertPortContract(IEventBus, [
      { name: 'subscribe', args: [() => {}] },
      { name: 'unsubscribe', args: [() => {}] },
      { name: 'emit', args: [{}] },
    ]);
  });
});
