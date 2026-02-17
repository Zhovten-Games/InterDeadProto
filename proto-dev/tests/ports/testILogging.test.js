import ILogging from '../../src/ports/ILogging.js';
import { assertPortContract } from './assertPortContract.js';

describe('ILogging contract', () => {
  it('declares logging operations', async () => {
    await assertPortContract(ILogging, [
      { name: 'boot' },
      { name: 'dispose' },
      { name: 'debug', args: ['message'] },
      { name: 'info', args: ['message'] },
      { name: 'warn', args: ['message'] },
      { name: 'error', args: ['message'] }
    ]);
  });
});
