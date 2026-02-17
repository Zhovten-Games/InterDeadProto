import assert from 'assert';
import { JSDOM } from 'jsdom';

describe('Registration Next button', function(){
  it('toggles with input text', function(){
    const dom = new JSDOM('<input data-js="input-name"><button data-action="next" disabled></button>');
    const document = dom.window.document;
    const input = document.querySelector('[data-js="input-name"]');
    const next = document.querySelector('[data-action="next"]');
    input.addEventListener('input', () => {
      next.disabled = input.value === '';
    });
    input.value = '';
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.strictEqual(next.disabled, true);
    input.value = 'A';
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.strictEqual(next.disabled, false);
    input.value = '';
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.strictEqual(next.disabled, true);
  });
});
