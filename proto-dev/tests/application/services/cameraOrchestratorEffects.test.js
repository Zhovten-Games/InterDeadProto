import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import { CAMERA_DETECT } from '../../../src/core/engine/effects.js';

class StubBus {
  emit() {}
  subscribe() {}
  unsubscribe() {}
}

describe('CameraOrchestratorService effect runner', () => {
  it('executes camera detection effect once per action', async () => {
    let run = 0;
    const svc = new CameraOrchestratorService(
      { takeSelfie: async () => 'img', pauseStream() {}, resumeStream() {} },
      {},
      { error() {}, info() {}, warn() {} },
      null,
      null,
      null,
      new StubBus(),
      null,
      null,
      null,
      null,
      null,
      {},
      {},
      { dispatch: () => [{ type: CAMERA_DETECT, payload: {} }], getState() {} },
      true
    );

    svc.active = true;
    svc._runDetection = async () => { run++; };

    await svc.startDetection({ offsetParent: {} }, { requirement: { type: 'presence', target: 'x' } });

    assert.strictEqual(run, 1, 'camera.detect executed once');
  });
});
