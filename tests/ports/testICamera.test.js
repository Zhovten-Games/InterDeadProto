import ICamera from '../../src/ports/ICamera.js';
import { assertPortContract } from './assertPortContract.js';

describe('ICamera contract', () => {
  it('declares lifecycle methods for camera control', async () => {
    await assertPortContract(ICamera, [
      { name: 'startStream', async: true, args: [null] },
      { name: 'stopStream' },
      { name: 'pauseStream' },
      { name: 'resumeStream', async: true, args: [null] },
      { name: 'takeSelfie', async: true }
    ]);
  });
});
