import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera error logging', () => {
  it('reports active inference errors and cancels retries on close', async () => {
    const context = cameraContext({
      detection: {
        detectTarget: async () => {
          throw new Error('fail');
        },
      },
    });
    await context.manager.open(context.container);
    await tick();
    assert.equal(context.calls.errors[0][0], 'fail');
    context.manager.closeSession();
    const frames = context.calls.frames;
    await new Promise((resolve) => setTimeout(resolve, 550));
    assert.equal(context.calls.frames, frames);
    await context.dispose();
  });
});
