import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera presence reset', () => {
  it('clears presence on a non-quest open and close', async () => {
    const context = cameraContext({ active: false });
    try {
      context.calls.presence.person = true;
      await context.manager.open(context.container);
      assert.deepEqual(context.calls.presence, {});
      context.calls.presence.person = true;
      context.bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
      await context.bus.settled();
      assert.deepEqual(context.calls.presence, {});
      assert.equal(context.calls.detections, 0);
    } finally {
      await context.dispose();
    }
  });
});
