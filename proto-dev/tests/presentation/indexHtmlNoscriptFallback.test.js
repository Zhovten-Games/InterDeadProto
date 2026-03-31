import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('index.html noscript fallback', () => {
  it('contains a full-screen blocker with required javascript markers', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

    assert.ok(html.includes('<noscript>'));
    assert.ok(html.includes('Contact suspended'));
    assert.ok(html.includes('JavaScript is required to establish protocol contact.'));
    assert.ok(html.includes('Enable JavaScript and reload this page to continue.'));
    assert.ok(html.includes('[data-js="global-content"]'));
    assert.ok(html.includes('[data-js="bottom-panel"]'));
    assert.ok(html.includes('[data-js="app-footer"]'));
  });
});
