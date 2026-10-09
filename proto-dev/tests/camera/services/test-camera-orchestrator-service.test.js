import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera orchestration public lifecycle', () => {
  it('serializes detection and ignores a result after closing the session', async () => {
    const pending = deferred();
    let count = 0;
    const context = cameraContext({
      detection: {
        detectTarget: () => {
          count++;
          return pending.promise;
        },
      },
    });
    try {
      await context.manager.open(context.container);
      await tick();
      await context.manager.startDetection(context.container, {
        requirement: { target: 'person' },
      });
      assert.equal(count, 1);
      context.manager.closeSession();
      pending.resolve({ ok: true });
      await tick();
      assert.deepEqual(context.calls.presence, {});
      assert.equal(
        context.calls.buttons.filter((row) => row.action === 'capture-btn' && row.enabled).length,
        0,
      );
    } finally {
      await context.dispose();
    }
  });
});
