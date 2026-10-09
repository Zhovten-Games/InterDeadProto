import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraAdapter from '../../src/camera/browser/camera-adapter.js';
import CameraStatusWidget from '../../src/camera/presentation/camera-status-widget.js';
import Observer from '../../src/runtime-events/subscriptions/observer.js';

// Ensures play overlay visibility matches camera stream state

describe('camera stream lifecycle', () => {
  it('shows play control when detection completes', async () => {
    const dom = new JSDOM('<div data-js="camera-widget"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new Observer();
    const widget = new CameraStatusWidget(
      document.querySelector('[data-js="camera-widget"]'),
      { applyLanguage() {}, translate: async (k) => k },
      bus,
    );
    widget.render();
    widget.boot();
    const retry = document.querySelector('[data-js="retry-detection"]');
    assert.ok(retry.classList.contains('retry-detection--hidden'));
    bus.emit({ type: 'DETECTION_DONE', target: 'person' });
    await new Promise((r) => setImmediate(r));
    assert.ok(!retry.classList.contains('retry-detection--hidden'));
    widget.dispose();
    delete global.window;
    delete global.document;
  });
  function browserCamera() {
    const dom = new JSDOM(
      '<div data-js="selfie-content"><div data-js="camera-view"></div><div data-js="record-indicator" hidden></div><button data-js="retry-detection" class="retry-detection--hidden"></button></div>',
    );
    global.window = dom.window;
    global.document = dom.window.document;
    const tracks = [],
      videos = [];
    const documentRef = {
      createElement(tag) {
        if (tag === 'canvas')
          return {
            getContext: () => ({ drawImage() {} }),
            toBlob: (callback) => callback(new Blob(['frame'])),
          };
        const video = document.createElement(tag);
        Object.defineProperties(video, {
          readyState: { value: 2 },
          videoWidth: { value: 100 },
          videoHeight: { value: 100 },
        });
        video.play = async () => {
          video.playedByFixture = true;
        };
        videos.push(video);
        return video;
      },
    };
    const navigatorRef = {
      mediaDevices: {
        getUserMedia: async () => {
          const track = {
            stopped: 0,
            stop() {
              this.stopped++;
            },
          };
          tracks.push(track);
          return { getTracks: () => [track] };
        },
      },
    };
    const camera = new CameraAdapter(null, { navigatorRef, documentRef });
    return {
      camera,
      tracks,
      videos,
      container: document.querySelector('[data-js="camera-view"]'),
      cleanup() {
        camera.dispose();
        dom.window.close();
        delete global.window;
        delete global.document;
      },
    };
  }
  it('retains tracks for capture and releases them on explicit close', async () => {
    const fixture = browserCamera();
    try {
      await fixture.camera.startStream(fixture.container);
      const blob = await fixture.camera.takeSelfie();
      assert.ok(blob.size > 0);
      assert.equal(fixture.tracks[0].stopped, 0);
      assert.equal(fixture.camera.getState(), 'active');
      assert.equal(document.querySelector('[data-js="record-indicator"]').hidden, false);
      fixture.camera.stopStream();
      assert.equal(fixture.tracks[0].stopped, 1);
      assert.equal(document.querySelector('video'), null);
      assert.equal(document.querySelector('[data-js="record-indicator"]').hidden, true);
    } finally {
      fixture.cleanup();
    }
  });
  it('resumes a paused stream with a new track and hides retry control', async () => {
    const fixture = browserCamera();
    try {
      await fixture.camera.startStream(fixture.container);
      fixture.camera.pauseStream();
      await fixture.camera.resumeStream();
      assert.equal(fixture.tracks.length, 2);
      assert.equal(fixture.tracks[0].stopped, 1);
      assert.equal(fixture.tracks[1].stopped, 0);
      assert.equal(fixture.videos[1].playedByFixture, true);
      assert.equal(document.querySelector('[data-js="record-indicator"]').hidden, false);
      assert.ok(
        document
          .querySelector('[data-js="retry-detection"]')
          .classList.contains('retry-detection--hidden'),
      );
    } finally {
      fixture.cleanup();
    }
  });
});
