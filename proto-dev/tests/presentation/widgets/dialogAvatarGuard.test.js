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
    return `<div>${data.avatarBlock || ''}${data.imageBlock || ''}${data.content || ''}</div>`;
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

  it('updates avatar on replayed messages when avatar URL is safe', async () => {
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

  it('falls back to placeholder for unsafe avatar URLs during replay updates', async () => {
    const dom = new JSDOM('<div id="dlg"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const bus = new MockBus();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const msg = { id: 2, author: 'user', text: 'hi' };
    bus.emit({ type: EVENT_MESSAGE_READY, ...msg, message: msg });
    await new Promise(r => setTimeout(r, 0));

    const replayJavaScript = { ...msg, avatar: 'javascript:alert(1)', replay: true };
    bus.emit({ type: EVENT_MESSAGE_READY, ...replayJavaScript, message: replayJavaScript });
    await new Promise(r => setTimeout(r, 0));

    const replayDataHtml = { ...msg, avatar: 'data:text/html,<script>alert(1)</script>', replay: true };
    bus.emit({ type: EVENT_MESSAGE_READY, ...replayDataHtml, message: replayDataHtml });
    await new Promise(r => setTimeout(r, 0));

    const html = document.getElementById('dlg').innerHTML;
    assert.ok(!html.includes('<img class="dialog__avatar" src="javascript:'));
    assert.ok(!html.includes('<img class="dialog__avatar" src="data:text/html'));
    assert.ok(html.includes('dialog__avatar--placeholder'));

    widget.dispose();
    delete global.window;
    delete global.document;
  });

  it('renders youtube thumbnail only for safe URL schemes', async () => {
    const dom = new JSDOM('<div id="dlg"></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const bus = new MockBus();
    const tpl = new MockTemplate();
    const lang = { applyLanguage() {} };
    const widget = new DialogWidget('#dlg', tpl, lang, bus);
    widget.boot();

    const unsafeScriptThumb = {
      id: 10,
      author: 'ghost',
      type: 'youtube',
      youtubeId: 'dQw4w9WgXcQ',
      youtubeThumb: 'javascript:alert(1)'
    };
    bus.emit({ type: EVENT_MESSAGE_READY, ...unsafeScriptThumb, message: unsafeScriptThumb });
    await new Promise(r => setTimeout(r, 0));

    const unsafeDataHtmlThumb = {
      id: 11,
      author: 'ghost',
      type: 'youtube',
      youtubeId: 'dQw4w9WgXcQ',
      youtubeThumb: 'data:text/html,<script>alert(1)</script>'
    };
    bus.emit({ type: EVENT_MESSAGE_READY, ...unsafeDataHtmlThumb, message: unsafeDataHtmlThumb });
    await new Promise(r => setTimeout(r, 0));

    const safeThumb = {
      id: 12,
      author: 'ghost',
      type: 'youtube',
      youtubeId: 'dQw4w9WgXcQ',
      youtubeThumb: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    };
    bus.emit({ type: EVENT_MESSAGE_READY, ...safeThumb, message: safeThumb });
    await new Promise(r => setTimeout(r, 0));

    const html = document.getElementById('dlg').innerHTML;
    assert.ok(!html.includes('src="javascript:alert(1)"'));
    assert.ok(!html.includes('src="data:text/html'));
    assert.ok(html.includes('class="dialog__youtube-image"'));
    assert.ok(html.includes('src="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"'));

    widget.dispose();
    delete global.window;
    delete global.document;
  });
});
