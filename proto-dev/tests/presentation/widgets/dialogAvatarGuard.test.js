import assert from 'assert';
import { JSDOM } from 'jsdom';
import Dialog from '../../../src/core/dialog/Dialog.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import DialogWidget from '../../../src/presentation/widgets/Dialog/index.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

class MockBus {
  constructor() { this.subs = []; }
  subscribe(fn) { this.subs.push(fn); }
  unsubscribe(fn) { this.subs = this.subs.filter(s => s !== fn); }
  emit(evt) { this.subs.forEach(s => s(evt)); }
}

class MockTemplate {
  async render(name, data) {
    return `<div>${data.avatarBlock || ''}${data.content || ''}</div>`;
  }
}

describe('Dialog avatar guard', () => {
  it('renders placeholder block without image when no avatar is provided', async () => {
    const dom = new JSDOM('<div id="dlg"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const bus = new MockBus();
    const dialog = new Dialog([{ author: 'npc', text: 'hello' }]);
    const persistence = { save() {} };
    const postObserver = { isReady: () => false, setState() {} };
    const manager = new DialogManager(dialog, bus, persistence, postObserver);

    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    manager.progress();
    await new Promise(r => setTimeout(r, 0));

    const html = document.getElementById('dlg').innerHTML;
    assert.ok(!html.includes('undefined'));
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('dialog__avatar--placeholder'));

    widget.dispose();
    delete global.window;
    delete global.document;
  });

  it('updates avatar on replayed messages', async () => {
    const dom = new JSDOM('<div id="dlg"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const bus = new MockBus();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg = { id: 1, author: 'user', text: 'hi' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));

    // Replay with avatar
    const replay = { ...msg, avatar: 'data:image/png;base64,abc', replay: true };
    bus.emit({ type: EVENT_MESSAGE_READY, ...replay, message: replay });
    await new Promise(r => setTimeout(r, 0));

    const html = document.getElementById('dlg').innerHTML;
    assert.ok(html.includes('img class="dialog__avatar"'));
    assert.ok(!html.includes('dialog__avatar--placeholder'));

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
