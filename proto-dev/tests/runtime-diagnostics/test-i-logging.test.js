import ILogging from '../../src/runtime-diagnostics/ports/logging-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('ILogging contract', () => {
  it('declares logging operations', async () => {
    await assertPortContract(ILogging, [
      { name: 'boot' },
      { name: 'dispose' },
      { name: 'debug', args: ['message'] },
      { name: 'info', args: ['message'] },
      { name: 'warn', args: ['message'] },
      { name: 'error', args: ['message'] },
    ]);
  });
});
