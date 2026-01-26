import assert from 'assert';
import { JSDOM } from 'jsdom';
import Observer from '../../src/utils/Observer.js';
import CameraStatusWidget from '../../src/presentation/widgets/CameraStatusWidget.js';

// Verifies retry overlay button is revealed when detection pauses the stream

describe('retry overlay visibility', () => {
  it('shows control after detection and hides on new search', async () => {
    const dom = new JSDOM('<div data-js="camera-widget"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new Observer();
    const container = document.querySelector('[data-js="camera-widget"]');
    const widget = new CameraStatusWidget(
      container,
      { applyLanguage() {}, translate: async k => k },
      bus
    );
    widget.render();
    widget.boot();
    const btn = document.querySelector('[data-js="retry-detection"]');
    // Hidden by default via modifier class
    assert.ok(btn.classList.contains('retry-detection--hidden'));
    bus.emit({ type: 'DETECTION_DONE', target: 'person' });
    await new Promise(r => setImmediate(r));
    assert.ok(!btn.classList.contains('retry-detection--hidden'));
    bus.emit({ type: 'DETECTION_SEARCH' });
    assert.ok(btn.classList.contains('retry-detection--hidden'));
    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
