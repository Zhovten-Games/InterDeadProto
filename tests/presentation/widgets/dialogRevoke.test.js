import assert from 'assert';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/adapters/logging/EventBusAdapter.js';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';
import { EVENT_MESSAGE_READY, DIALOG_CLEAR } from '../../../src/core/events/constants.js';

class MockTemplate {
  async render(name, data) {
    return `<li class="dialog__message dialog__message--${data.author}">${data.avatarBlock || ''}${data.imageBlock || ''}${data.content || ''}</li>`;
  }
}

describe('DialogWidget object URL cleanup', () => {
  it('revokeAll is called on clear and dispose without breaking images', async () => {
    const dom = new JSDOM('<ul id="dlg"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    const origCreate = global.URL.createObjectURL;
    const origRevoke = global.URL.revokeObjectURL;
    global.URL.createObjectURL = () => 'blob:test';
    global.URL.revokeObjectURL = () => {};
    const bus = new EventBusAdapter();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const repo = new MediaRepository();
    const widget = new DialogWidget('#dlg', tpl, lang, bus, repo);
    widget.boot();

    const originalRevokeAll = repo.revokeAll.bind(repo);
    let revokeAllCount = 0;
    repo.revokeAll = () => { revokeAllCount++; originalRevokeAll(); };

    const id = await repo.save({ thumb: new Blob(['t']), full: new Blob(['f']) }, {});
    const msg = { type: 'image', media: { id }, author: 'user' };
    const { type: _t, ...rest } = msg;
    bus.emit({ type: EVENT_MESSAGE_READY, ...rest, message: msg });
    await new Promise(r => setTimeout(r, 0));
    await widget.renderLatest();
    const imgEl = document.querySelector('.dialog__image');
    assert.ok(imgEl);
    const src = imgEl.src;
    imgEl.dispatchEvent(new dom.window.Event('load'));

    bus.emit({ type: DIALOG_CLEAR });
    await new Promise(r => setTimeout(r, 0));
    assert.strictEqual(revokeAllCount, 1);
    assert.strictEqual(imgEl.src, src);

    widget.dispose();
    assert.strictEqual(revokeAllCount, 2);
    assert.strictEqual(imgEl.src, src);

    global.URL.createObjectURL = origCreate;
    global.URL.revokeObjectURL = origRevoke;
    delete global.window;
    delete global.document;
  });
});
