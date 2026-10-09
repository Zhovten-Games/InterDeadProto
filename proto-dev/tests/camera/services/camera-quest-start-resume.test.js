import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
import { QUEST_STARTED } from '../../../src/runtime-events/domain/constants.js';
describe('camera quest activation', () => {
  it('resumes an open session when its quest starts', async () => {
    let active = false;
    const context = cameraContext({ duality: { isQuestActive: () => active } });
    try {
      await context.manager.open(context.container);
      await tick();
      assert.equal(context.calls.detections, 0);
      active = true;
      context.bus.emit({ type: QUEST_STARTED });
      await context.bus.settled();
      await tick();
      assert.equal(context.calls.detections, 1);
      assert.equal(context.calls.presence.person, true);
    } finally {
      await context.dispose();
    }
  });
});
