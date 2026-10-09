import { assert, deferred, flush, runDriver } from '../../driver-tools.mjs';
import CameraAdapter from '../../../proto-dev/src/camera/browser/camera-adapter.js';

await runDriver(
  ['camera.late-permission', 'camera.metadata-close', 'camera.repeated-close'],
  async () => {
    const permission = deferred();
    let stopped = 0;
    const stream = {
      getTracks: () => [
        {
          stop: () => {
            stopped++;
          },
        },
      ],
    };
    const documentRef = {
      createElement() {
        throw new Error('A cancelled late stream must not create a video');
      },
    };
    const camera = new CameraAdapter(null, {
      navigatorRef: { mediaDevices: { getUserMedia: () => permission.promise } },
      documentRef,
      timeoutMs: 1000,
    });
    const opening = camera.startStream({});
    const rejected = assert.rejects(opening, /closed|cancel/i);
    await flush();
    camera.stopStream();
    permission.resolve(stream);
    await rejected;
    await flush();
    assert.equal(stopped, 1);
    assert.equal(camera.getState(), 'idle');
    const listeners = new Map();
    let removed = 0;
    const video = {
      readyState: 0,
      setAttribute() {},
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
      play: async () => {},
      pause() {},
      remove: () => {
        removed++;
      },
    };
    const second = new CameraAdapter(null, {
      navigatorRef: { mediaDevices: { getUserMedia: async () => stream } },
      documentRef: { createElement: () => video },
      timeoutMs: 1000,
    });
    const pending = second.startStream({ appendChild() {} });
    const cancelled = assert.rejects(pending, /closed|cancel/i);
    await flush();
    second.stopStream();
    await cancelled;
    second.stopStream();
    assert.equal(listeners.size, 0);
    assert.equal(stopped, 2);
    assert.ok(removed >= 1);
  },
);
