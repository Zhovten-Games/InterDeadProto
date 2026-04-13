import assert from 'assert';
import { JSDOM } from 'jsdom';
import ButtonLabelTruncator from '../../src/presentation/widgets/ControlPanel/ButtonLabelTruncator.js';

describe('ButtonLabelTruncator', () => {
  it('skips hidden labels and truncates only visible overflowing labels', () => {
    const dom = new JSDOM(`
      <div>
        <span id="visible" class="control-button__label">VeryLongLocalizedLabel</span>
        <span id="hidden" class="control-button__label">VeryLongHiddenLabel</span>
      </div>
    `);

    const documentRef = dom.window.document;
    const visible = documentRef.getElementById('visible');
    const hidden = documentRef.getElementById('hidden');

    Object.defineProperty(visible, 'offsetParent', { get: () => documentRef.body });
    Object.defineProperty(visible, 'clientWidth', { get: () => 40 });
    Object.defineProperty(visible, 'scrollWidth', {
      get() {
        return (visible.textContent || '').length * 8;
      },
    });

    Object.defineProperty(hidden, 'offsetParent', { get: () => null });
    Object.defineProperty(hidden, 'clientWidth', { get: () => 0 });
    Object.defineProperty(hidden, 'scrollWidth', {
      get() {
        return (hidden.textContent || '').length * 8;
      },
    });

    const truncator = new ButtonLabelTruncator({
      documentRef,
      getLanguage: () => 'en',
    });

    truncator.apply(documentRef.body);

    assert.ok(visible.textContent.endsWith('.'));
    assert.strictEqual(hidden.textContent, 'VeryLongHiddenLabel');
  });
});
