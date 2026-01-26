import assert from 'assert';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/adapters/logging/EventBusAdapter.js';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import DialogHistoryService from '../../../src/application/services/DialogHistoryService.js';
import DialogRepository from '../../../src/infrastructure/repositories/DialogRepository.js';
import DatabaseAdapter from '../../../src/adapters/database/DatabaseAdapter.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';
import { EVENT_MESSAGE_READY, MEDIA_OPEN } from '../../../src/core/events/constants.js';

class MockTemplate {
  async render(name, data) {
    return `<li class="dialog__message dialog__message--${data.author}">${data.avatarBlock || ''}${data.imageBlock || ''}${data.content || ''}</li>`;
  }
}

describe('DialogWidget image messages', () => {
  it('renders thumbnail and reopens modal on click', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul><ul id="dlg2"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const origCreate = global.URL.createObjectURL;
    const origRevoke = global.URL.revokeObjectURL;
    global.URL.createObjectURL = () => 'blob:';
    global.URL.revokeObjectURL = () => {};
    const bus = new EventBusAdapter();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const repo = new MediaRepository();
    const widget = new DialogWidget('#dlg', tpl, lang, bus, repo);
    widget.boot();

      let opened = null;
      bus.subscribe(evt => { if (evt.type === MEDIA_OPEN) opened = evt.mediaId; });
      const id = await repo.save({ thumb:new Blob(['t']), full:new Blob(['f']) }, {});
      const msg = {
        type: 'image',
        media: { id },
        author: 'user',
        avatar: 'data:image/png;base64,BBB'
      };
      const { type: _mt, ...rest } = msg;
      bus.emit({ type: EVENT_MESSAGE_READY, ...rest, message: msg });
      await new Promise(r => setTimeout(r, 0));
      await widget.renderLatest();
      const imgEl = document.querySelector('.dialog__image');
      assert.ok(imgEl);
      assert.ok(document.querySelector('.dialog__avatar'));
      imgEl.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
      assert.strictEqual(opened, id);

    // persistence
    const db = new DatabaseAdapter(':memory:', { error() {} }, undefined, { save(){}, load(){} });
    await db.boot();
    const dialogRepo = new DialogRepository(db);
    dialogRepo.ensureSchema();
    const history = new DialogHistoryService(dialogRepo);
    history.save('g1', widget.messages);
      const loaded = history.load('g1');
      const widget2 = new DialogWidget('#dlg2', tpl, lang, bus, repo);
      widget2.messages = loaded;
      await widget2.renderLatest();
      const img2 = document.querySelector('#dlg2 .dialog__image');
      assert.ok(img2);
      assert.ok(img2.getAttribute('src'));
      assert.strictEqual(img2.dataset.mediaId, String(id));

    widget.dispose();
    widget2.dispose();
    global.URL.createObjectURL = origCreate;
    global.URL.revokeObjectURL = origRevoke;
    delete global.window;
    delete global.document;
  });

  it('renders provided data URL when repository has no object URL', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new EventBusAdapter();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const repo = {
      async get() {
        return {};
      },
      async getObjectURL() {
        return null;
      },
      revokeAll() {}
    };
    const widget = new DialogWidget('#dlg', tpl, lang, bus, repo);
    widget.boot();
    const msg = { type: 'image', src: 'data:image/png;base64,CCC', author: 'user', avatar: '' };
    const { type: _mt, ...rest } = msg;
    bus.emit({ type: EVENT_MESSAGE_READY, ...rest, message: msg });
    await new Promise(r => setTimeout(r, 0));
    await widget.renderLatest();
    assert.ok(document.querySelector('.dialog__image'));
    widget.dispose();
    delete global.window;
    delete global.document;
  });

  it('revokes blob URL only after paint when image is already complete', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new EventBusAdapter();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    let revoked = false;
    const repo = {
      async get() { return { thumbKey: 't1' }; },
      async getObjectURL() {
        return { url: 'blob:test', revoke: () => { revoked = true; } };
      },
      revokeAll() {}
    };
    const proto = dom.window.HTMLImageElement.prototype;
    const orig = Object.getOwnPropertyDescriptor(proto, 'complete');
    Object.defineProperty(proto, 'complete', { configurable: true, get() { return true; } });
    const widget = new DialogWidget('#dlg', tpl, lang, bus, repo);
    widget.boot();
    const msg = { type: 'image', media: { id: 1 }, author: 'user', avatar: '' };
    const { type: _mt, ...rest } = msg;
    bus.emit({ type: EVENT_MESSAGE_READY, ...rest, message: msg });
    await widget.renderLatest();
    const imgEl = document.querySelector('.dialog__image');
    assert.ok(imgEl);
    assert.strictEqual(imgEl.getAttribute('src'), 'blob:test');
    await new Promise(r => setTimeout(r, 10));
    assert.ok(revoked);
    widget.dispose();
    if (orig) Object.defineProperty(proto, 'complete', orig);
    delete global.window;
    delete global.document;
  });
});
