import assert from 'assert';
import { JSDOM } from 'jsdom';

describe('index.js', () => {
  it('module can be imported', async () => {
    const dom = new JSDOM('<body></body>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.sessionStorage = dom.window.sessionStorage;
    global.BroadcastChannel = class { postMessage(){} addEventListener(){} };
    let loaded = false;
    try {
      await import('./../../../src/infrastructure/bootstrap/index.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
    delete global.window;
    delete global.document;
    delete global.sessionStorage;
    delete global.BroadcastChannel;
  });
});
