import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
import { QUEST_COMPLETED } from '../../../src/runtime-events/domain/constants.js';
describe('camera quest completion', () => {
  it('does not restart detection from a stale target after quest completion', async () => {
    let active = true;
    const context = cameraContext({ duality: { isQuestActive: () => active } });
    try {
      await context.manager.open(context.container);
      await tick();
      assert.equal(context.calls.detections, 1);
      active = false;
      context.bus.emit({ type: QUEST_COMPLETED });
      context.bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
      await context.bus.settled();
      await context.manager.open(context.container);
      await tick();
      assert.equal(context.calls.detections, 1);
    } finally {
      await context.dispose();
    }
  });
});
