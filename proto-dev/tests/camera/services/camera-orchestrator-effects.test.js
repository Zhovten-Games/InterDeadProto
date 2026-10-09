import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera effect ownership', () => {
  it('runs a production store detection effect once for one public action', async () => {
    const context = cameraContext();
    try {
      await context.manager.open(context.container);
      await tick();
      assert.equal(context.calls.effects.filter((row) => row.type === 'DETECTION_START').length, 1);
      assert.equal(context.calls.detections, 1);
      assert.equal(context.calls.frames, 1);
    } finally {
      await context.dispose();
    }
  });
});
