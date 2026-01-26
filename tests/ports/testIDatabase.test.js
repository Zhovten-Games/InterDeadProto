import IDatabase from '../../src/ports/IDatabase.js';
import { assertPortContract } from './assertPortContract.js';

describe('IDatabase contract', () => {
  it('declares core database operations', async () => {
    await assertPortContract(IDatabase, [
      { name: 'boot', async: true },
      { name: 'exec', async: true, args: ['SELECT 1'] },
      { name: 'run', args: ['SELECT 1'] },
      { name: 'get', async: true, args: ['SELECT 1'] },
      { name: 'fetchAll', args: ['SELECT 1'] },
      { name: 'executeQuery', async: true, args: ['SELECT 1'] },
      { name: 'saveUser', async: true, args: [{}] },
      { name: 'loadUser', async: true },
      { name: 'recordExport', async: true, args: [new Uint8Array()] },
      { name: 'saveLocation', async: true, args: [{}] },
      { name: 'saveSelfie', async: true, args: [{}] },
      { name: 'clearAll', async: true }
    ]);
  });
});
