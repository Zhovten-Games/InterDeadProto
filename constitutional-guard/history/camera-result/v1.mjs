import { assert, deferred, flush, runDriver } from '../../driver-tools.mjs';
import { cameraContext } from '../../../proto-dev/tests/fixtures/camera-context.js';

await runDriver(
  [
    'camera.stale-inference',
    'camera.stale-finally',
    'camera.close-current',
    'camera.no-stale-retry',
  ],
  async () => {
    const first = deferred(),
      second = deferred();
    let detections = 0;
    const context = cameraContext({
      detection: { detectTarget: () => (++detections === 1 ? first.promise : second.promise) },
    });
    try {
      await context.manager.open(context.container);
      await flush();
      const oldSession = context.manager.getSessionToken();
      assert.equal(detections, 1);
      context.bus.emit({ type: 'GHOST_CHANGE', payload: { name: 'B' } });
      await context.bus.settled();
      await context.manager.open(context.container);
      await flush();
      assert.equal(context.manager.isSessionCurrent(oldSession), false);
      assert.equal(detections, 2);
      first.resolve({ ok: true });
      await flush();
      await flush();
      assert.deepEqual(context.calls.presence, {});
      assert.equal(
        context.calls.buttons.filter((row) => row.action === 'capture-btn' && row.enabled).length,
        0,
      );
      assert.equal(context.store.getState().detection.busy, true);
      await context.manager.startDetection(context.container, {
        requirement: { target: 'person' },
      });
      assert.equal(detections, 2, 'Old finally cannot release the new operation mutex');
      context.manager.closeSession();
      second.resolve({ ok: false });
      await flush();
      await flush();
      await new Promise((resolve) => setTimeout(resolve, 550));
      assert.equal(detections, 2, 'A closed generation cannot schedule a retry');
      assert.deepEqual(context.calls.presence, {});
      assert.equal(context.store.getState().detection.busy, false);
    } finally {
      first.resolve({ ok: false });
      second.resolve({ ok: false });
      await context.dispose();
    }
  },
);
