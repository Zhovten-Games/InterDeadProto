import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
import guide from '../../../src/spirit-contacts/configuration/guide.js';
describe('guide person detection', () => {
  it('honors an explicit force flag for the declared person requirement', async () => {
    const requirement = guide.stages.find((stage) => stage.quest?.requirement?.target === 'person')
      .quest.requirement;
    const context = cameraContext({ requirement, active: false });
    try {
      await context.manager.open(context.container, { force: true });
      await tick();
      assert.equal(context.calls.detections, 1);
      assert.equal(context.calls.presence.person, true);
    } finally {
      await context.dispose();
    }
  });
});
