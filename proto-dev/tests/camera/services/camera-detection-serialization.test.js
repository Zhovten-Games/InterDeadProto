import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera detection serialization', () => {
  it('finishes one detection once even with concurrent requests', async () => {
    const pending = deferred();
    let detected = 0,
      calls = 0;
    const context = cameraContext({
      detection: {
        detectTarget: () => {
          calls++;
          return pending.promise;
        },
      },
    });
    try {
      await context.manager.open(context.container, {
        onDetected: () => {
          detected++;
        },
      });
      await tick();
      const before = context.calls.effects.filter((row) => row.type === 'DETECTION_DONE').length;
      await context.manager.startDetection(context.container, {
        requirement: { target: 'person' },
      });
      pending.resolve({ ok: true });
      await tick();
      assert.equal(calls, 1);
      assert.equal(detected, 1);
      assert.equal(
        context.calls.effects.filter((row) => row.type === 'DETECTION_DONE').length - before,
        1,
      );
    } finally {
      await context.dispose();
    }
  });
});
