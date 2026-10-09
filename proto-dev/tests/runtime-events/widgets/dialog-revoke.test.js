import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/runtime-events/adapters/event-bus-adapter.js';
import DialogWidget from '../../../src/messenger/presentation/dialog-widget.js';
import MediaRepository from '../../../src/media/persistence/media-repository.js';
import { EVENT_MESSAGE_READY, DIALOG_CLEAR } from '../../../src/runtime-events/domain/constants.js';

class MockTemplate {
  async render(name, data) {
    return `<li class="dialog__message dialog__message--${data.author}">${data.avatarBlock || ''}${data.imageBlock || ''}${data.content || ''}</li>`;
  }
}

describe('DialogWidget object URL cleanup', () => {
  it('releases its own handles once and preserves another consumer across clear/dispose', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    const previous = {
      window: global.window,
      document: global.document,
      create: URL.createObjectURL,
      revoke: URL.revokeObjectURL,
    };
    global.window = dom.window;
    global.document = dom.window.document;
    let sequence = 0;
    const revoked = [];
    URL.createObjectURL = () => `blob:fixture-${++sequence}`;
    URL.revokeObjectURL = (url) => revoked.push(url);
    const bus = new EventBusAdapter();
    const repo = new MediaRepository();
    const widget = new DialogWidget('#dlg', new MockTemplate(), { applyLanguage() {} }, bus, repo);
    try {
      widget.boot();
      const id = await repo.save({ thumb: new Blob(['t']), full: new Blob(['f']) }, {});
      const otherConsumer = await repo.getObjectURL(`full-${id}`);
      const message = {
        type: 'image',
        media: { id },
        author: 'user',
        fingerprint: 'url-ownership',
      };
      bus.emit({ type: EVENT_MESSAGE_READY, message });
      await bus.settled();
      await widget.renderLatest();
      const image = document.querySelector('.dialog__image');
      assert.ok(image);
      const source = image.src;
      assert.notEqual(source, otherConsumer.url);
      image.dispatchEvent(new dom.window.Event('load'));
      bus.emit({ type: DIALOG_CLEAR });
      await bus.settled();
      widget.dispose();
      widget.dispose();
      assert.equal(revoked.filter((url) => url === source).length, 1);
      assert.equal(revoked.includes(otherConsumer.url), false);
      assert.equal(image.src, source);
      otherConsumer.revoke();
      assert.equal(revoked.filter((url) => url === otherConsumer.url).length, 1);
    } finally {
      widget.dispose();
      URL.createObjectURL = previous.create;
      URL.revokeObjectURL = previous.revoke;
      global.window = previous.window;
      global.document = previous.document;
      dom.window.close();
    }
  });
});
