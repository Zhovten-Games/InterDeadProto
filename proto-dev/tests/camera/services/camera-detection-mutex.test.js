import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera detection mutex', () => {
  it('prevents parallel detection runs through the public session', async () => {
    const pending = deferred();
    let calls = 0;
    const context = cameraContext({
      detection: {
        detectTarget: () => {
          calls++;
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
      assert.equal(calls, 1);
      pending.resolve({ ok: true });
      await tick();
      assert.equal(
        context.calls.buttons.filter((row) => row.action === 'capture-btn' && row.enabled).length,
        1,
      );
    } finally {
      await context.dispose();
    }
  });
});
