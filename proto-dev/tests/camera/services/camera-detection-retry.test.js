import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera detection retry', () => {
  it('retries until the declared target is detected and stops the retry timer', async () => {
    let calls = 0;
    const matched = deferred();
    const context = cameraContext({
      detection: {
        detectTarget: async () => {
          calls++;
          return { ok: calls >= 2 };
        },
      },
    });
    try {
      await context.manager.open(context.container, { onDetected: () => matched.resolve() });
      await Promise.race([
        matched.promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Retry did not complete')), 1500),
        ),
      ]);
      assert.equal(calls, 2);
      await new Promise((resolve) => setTimeout(resolve, 550));
      assert.equal(calls, 2);
    } finally {
      await context.dispose();
    }
  });
});
