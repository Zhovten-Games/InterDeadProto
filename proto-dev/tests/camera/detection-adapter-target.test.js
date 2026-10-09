import assert from 'node:assert/strict';
import DetectionAdapter from '../../src/camera/detection/detection-adapter.js';
describe('DetectionAdapter target', () => {
  it('returns the target box and mask without taking ownership of presence', async () => {
    let presence = 0;
    const events = [],
      contexts = [];
    const workerPort = {
      initialize: async () => ({ backend: 'cpu' }),
      detect: async (_, context) => {
        contexts.push(context);
        return { predictions: [{ class: 'cat', score: 0.9, bbox: [0, 0, 1, 1] }], context };
      },
      cancelPending() {},
      dispose() {},
    };
    const adapter = new DetectionAdapter(
      null,
      {
        setPresence() {
          presence++;
        },
      },
      { emit: (event) => events.push(event) },
      { workerPort },
    );
    const result = await adapter.detectTarget(new Blob(), 'cat', { sessionRevision: 1 });
    assert.equal(result.ok, true);
    assert.deepEqual(result.box, { x: 0, y: 0, width: 1, height: 1 });
    assert.equal(result.mask.polygon.length, 4);
    assert.equal(presence, 0);
    assert.deepEqual(contexts, [{ sessionRevision: 1 }]);
    assert.ok(events.some((event) => event.state === 'READY'));
    adapter.dispose();
  });
});
