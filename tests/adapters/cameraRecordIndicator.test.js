import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraAdapter from '../../src/adapters/camera/CameraAdapter.js';
import CameraStatusWidget from '../../src/presentation/widgets/CameraStatusWidget.js';
import Observer from '../../src/utils/Observer.js';

// Ensures play overlay visibility matches camera stream state

describe('camera stream lifecycle', () => {
  it('shows play control when detection completes', async () => {
    const dom = new JSDOM('<div data-js="camera-widget"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new Observer();
    const widget = new CameraStatusWidget(
      document.querySelector('[data-js="camera-widget"]'),
      { applyLanguage() {}, translate: async k => k },
      bus
    );
    widget.render();
    widget.boot();
    const retry = document.querySelector('[data-js="retry-detection"]');
    assert.ok(retry.classList.contains('retry-detection--hidden'));
    bus.emit({ type: 'DETECTION_DONE', target: 'person' });
    await new Promise(r => setImmediate(r));
    assert.ok(!retry.classList.contains('retry-detection--hidden'));
    widget.dispose();
    delete global.window;
    delete global.document;
  });
  it('stops stream after selfie and shows play control', async () => {
    const dom = new JSDOM(
      '<div data-js="selfie-content"><div data-js="camera-view"><video></video></div><div data-js="record-indicator"></div><button data-js="retry-detection" class="retry-detection retry-detection--hidden"></button></div>'
    );
    global.window = dom.window;
    global.document = dom.window.document;
    const logger = { error() {} };
    const camera = new CameraAdapter(logger);
    const video = document.querySelector('video');
    Object.defineProperty(video, 'videoWidth', { value: 100 });
    Object.defineProperty(video, 'videoHeight', { value: 100 });
    Object.defineProperty(video, 'readyState', { value: 2, configurable: true });
    video.pause = () => {};
    const track = { stopCalled: false, readyState: 'live', stop() { this.stopCalled = true; this.readyState = 'ended'; } };
    camera._videoEl = video;
    camera._stream = { getTracks: () => [track] };

    const origCreateElement = document.createElement.bind(document);
    document.createElement = tag => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage() {} }),
          toBlob: cb => cb(new Blob())
        };
      }
      return origCreateElement(tag);
    };

    const indicator = document.querySelector('[data-js="record-indicator"]');
    const retry = document.querySelector('[data-js="retry-detection"]');
    indicator.hidden = false;
    retry.classList.add('retry-detection--hidden');

    await camera.takeSelfie();

    // Stream remains active during detection; no tracks are stopped.
    assert.strictEqual(track.stopCalled, false);
    // Indicator stays visible while stream is running.
    assert.strictEqual(indicator.hidden, false);
    // Play control remains hidden until detection finishes externally.
    assert.ok(retry.classList.contains('retry-detection--hidden'));

    document.createElement = origCreateElement;
    delete global.window;
    delete global.document;
  });

  it('resumes stream and hides play control', async () => {
    const dom = new JSDOM(
      '<div data-js="selfie-content"><div data-js="camera-view"><video></video></div><div data-js="record-indicator" hidden></div><button data-js="retry-detection" class="retry-detection"></button></div>'
    );
    global.window = dom.window;
    global.document = dom.window.document;
    Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
    const logger = { error() {} };
    const camera = new CameraAdapter(logger);
    const video = document.querySelector('video');
    let played = false;
    video.play = () => { played = true; };
    camera._videoEl = video;
    const endedTrack = { readyState: 'ended', stop() {} };
    camera._stream = { getTracks: () => [endedTrack] };

    const newTrack = { readyState: 'live', stop() {} };
    let getUserMediaCalled = false;
    dom.window.navigator.mediaDevices = {
      getUserMedia: async () => {
        getUserMediaCalled = true;
        return { getTracks: () => [newTrack] };
      }
    };

    const resumePromise = camera.resumeStream();
    setTimeout(() =>
      video.dispatchEvent(new dom.window.Event('loadedmetadata'))
    );
    await resumePromise;

    const indicator = document.querySelector('[data-js="record-indicator"]');
    const retry = document.querySelector('[data-js="retry-detection"]');
    assert.strictEqual(getUserMediaCalled, true);
    assert.strictEqual(indicator.hidden, false);
    assert.ok(retry.classList.contains('retry-detection--hidden'));
    assert.strictEqual(played, true);

    delete global.window;
    delete global.document;
    delete global.navigator;
  });
});
