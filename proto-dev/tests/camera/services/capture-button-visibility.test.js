import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('capture button visibility', () => {
  it('hides capture until an active quest permits it', async () => {
    const context = cameraContext({ active: false });
    try {
      await context.manager.open(context.container);
      assert.deepEqual(
        context.calls.visibility.find((row) => row.action === 'capture-btn'),
        { screen: 'camera', action: 'capture-btn', visible: false },
      );
      assert.equal(context.calls.detections, 0);
    } finally {
      await context.dispose();
    }
  });
});
