import assert from 'assert';
import { JSDOM } from 'jsdom';
import loadScript from '../../src/utils/loadScript.js';

describe('loadScript.js', () => {
  let window, document;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    window = dom.window;
    document = window.document;
    global.document = document;
  });

  afterEach(() => {
    delete global.document;
  });

  it('appends script element and resolves on load', async () => {
    const promise = loadScript('foo.js');
    const script = document.querySelector('script[src="foo.js"]');
    assert.ok(script, 'script tag should be created');
    script.dispatchEvent(new window.Event('load'));
    await promise;
  });

  it('rejects when error event fires', async () => {
    const promise = loadScript('bar.js');
    const script = document.querySelector('script[src="bar.js"]');
    script.dispatchEvent(new window.Event('error'));
    await assert.rejects(promise);
  });
});
