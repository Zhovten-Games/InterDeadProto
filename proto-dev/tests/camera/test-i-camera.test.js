import ICamera from '../../src/camera/ports/camera-port.js';
import { assertPortContract } from '../contracts/assert-port-contract.js';

describe('ICamera contract', () => {
  it('declares lifecycle methods for camera control', async () => {
    await assertPortContract(ICamera, [
      { name: 'startStream', async: true, args: [null] },
      { name: 'stopStream' },
      { name: 'pauseStream' },
      { name: 'resumeStream', async: true, args: [null] },
      { name: 'takeSelfie', async: true },
    ]);
  });
});
