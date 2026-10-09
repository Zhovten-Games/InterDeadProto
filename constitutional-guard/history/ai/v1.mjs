import { assert, deferred, flush, runDriver } from '../../driver-tools.mjs';
import WorkerDetectionPort from '../../../proto-dev/src/camera/detection/worker-detection-port.js';
import DetectionAdapter from '../../../proto-dev/src/camera/detection/detection-adapter.js';

await runDriver(
  ['ai.bounded-frame', 'ai.cancel-retains-model', 'ai.stale-result', 'ai.restart-dispose'],
  async () => {
    const sent = [];
    let terminated = 0;
    const worker = {
      postMessage: (message) => sent.push(message),
      terminate: () => {
        terminated++;
      },
    };
    const port = new WorkerDetectionPort({ workerFactory: () => worker, timeoutMs: 1000 });
    const init = port.initialize({});
    worker.onmessage({ data: { protocol: 1, id: sent[0].id, result: { backend: 'cpu' } } });
    await init;
    const frame = port.detect(new Blob());
    const cancelled = assert.rejects(frame, /cancel/i);
    await assert.rejects(port.detect(new Blob()), /busy/);
    port.cancelPending();
    await cancelled;
    await assert.rejects(port.detect(new Blob()), /busy/);
    worker.onmessage({ data: { protocol: 1, id: sent[1].id, result: { predictions: [] } } });
    const next = port.detect(new Blob());
    worker.onmessage({ data: { protocol: 1, id: sent.at(-1).id, result: { predictions: [] } } });
    await next;
    port.dispose();
    assert.equal(terminated, 1);
    const result = deferred();
    let initialized = 0,
      presence = 0;
    const adapter = new DetectionAdapter(
      null,
      {
        setPresence() {
          presence++;
        },
      },
      { emit() {} },
      {
        workerPort: {
          initialize: async () => {
            initialized++;
            return { backend: 'cpu' };
          },
          detect: () => result.promise,
          cancelPending() {},
          dispose() {},
        },
      },
    );
    const detecting = adapter.detectTarget(new Blob(), 'person');
    await flush();
    adapter.cancelPending();
    result.resolve({ predictions: [{ class: 'person', score: 1, bbox: [0, 0, 1, 1] }] });
    assert.equal((await detecting).ok, false);
    await adapter.boot();
    assert.equal(initialized, 1);
    assert.equal(presence, 0);
    adapter.dispose();
  },
);
