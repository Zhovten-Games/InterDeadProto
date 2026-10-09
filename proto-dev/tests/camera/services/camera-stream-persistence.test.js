import assert from 'node:assert/strict';
import { cameraContext, deferred, tick } from '../../fixtures/camera-context.js';
describe('camera stream release and retry', () => {
  for (const cameraType of ['registration', 'quest'])
    it(`releases tracks and opens a new stream in ${cameraType} flow`, async () => {
      const context = cameraContext();
      try {
        await context.manager.open(context.container, { cameraType });
        await tick();
        assert.equal(context.calls.detections, 1);
        const starts = context.calls.starts,
          stops = context.calls.stops;
        assert.ok(stops >= 1);
        await context.manager.resumeDetection();
        await tick();
        assert.equal(context.calls.starts, starts + 1);
        assert.equal(context.calls.detections, 2);
        assert.equal(context.calls.stops, stops + 1);
      } finally {
        await context.dispose();
      }
    });
});
