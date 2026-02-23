import assert from 'assert';
import { JSDOM } from 'jsdom';
import DetectionSensitivityControl from '../../../src/presentation/widgets/DetectionSensitivityControl.js';

describe('DetectionSensitivityControl', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM(
      `<div id="root">
        <input data-js="detection-threshold-slider" type="range" min="0.1" max="0.95" step="0.05" value="0.5" />
        <span data-js="detection-threshold-value"></span>
      </div>`,
    );
    global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('initializes slider from current threshold and updates callback on input', () => {
    let current = 0.65;
    const root = document.getElementById('root');
    const control = new DetectionSensitivityControl(root, {
      getThreshold: () => current,
      setThreshold: (value) => {
        current = value;
        return value;
      },
    });

    control.mount();

    const slider = root.querySelector('[data-js="detection-threshold-slider"]');
    const value = root.querySelector('[data-js="detection-threshold-value"]');

    assert.strictEqual(slider.value, '0.65');
    assert.strictEqual(value.textContent, '0.65');

    slider.value = '0.4';
    slider.dispatchEvent(new window.Event('input', { bubbles: true }));

    assert.strictEqual(current, 0.4);
    assert.strictEqual(value.textContent, '0.40');

    control.dispose();
  });
});
