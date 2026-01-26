import assert from 'assert';
import { JSDOM } from 'jsdom';
import TextAnimationManager from '../../../src/presentation/components/dialog/animations/TextAnimationManager.js';

class StubLanguage {
  constructor() {
    this.applied = 0;
  }

  async translate(key) {
    return `translated:${key}`;
  }

  async applyLanguage() {
    this.applied += 1;
  }
}

describe('TextAnimationManager', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM('<ul id="dialog"></ul>');
    global.window = dom.window;
    global.document = dom.window.document;
    document = dom.window.document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('runs animations sequentially', async () => {
    const lang = new StubLanguage();
    let active = 0;
    const order = [];
    const effects = new Map([
      [
        'fx1',
        () => ({
          async play(el, text) {
            active += 1;
            assert.strictEqual(active, 1, 'effects should not overlap');
            order.push(text);
            await new Promise(resolve => setTimeout(resolve, 0));
            active -= 1;
          }
        })
      ],
      [
        'fx3',
        () => ({
          async play(el, text) {
            active += 1;
            assert.strictEqual(active, 1, 'effects should run sequentially');
            order.push(text);
            await new Promise(resolve => setTimeout(resolve, 0));
            active -= 1;
          }
        })
      ]
    ]);
    const manager = new TextAnimationManager(lang, undefined, null, effects);
    const root = document.getElementById('dialog');

    const first = document.createElement('li');
    first.innerHTML =
      '<p class="dialog__message-text" data-i18n="first"></p>';
    root.appendChild(first);

    const second = document.createElement('li');
    second.innerHTML =
      '<p class="dialog__message-text" data-i18n="second"></p>';
    root.appendChild(second);

    await Promise.all([
      manager.animateMessage(first, { text: 'first' }, { isNew: true }),
      manager.animateMessage(second, { text: 'second' }, { isReplay: true })
    ]);

    assert.deepStrictEqual(order, ['translated:first', 'translated:second']);
  });

  it('aborts running animations on reset', async () => {
    const lang = new StubLanguage();
    const manager = new TextAnimationManager(lang);
    const root = document.getElementById('dialog');
    const li = document.createElement('li');
    li.innerHTML = '<p class="dialog__message-text" data-i18n="slow"></p>';
    root.appendChild(li);

    const promise = manager.animateMessage(li, { text: 'slow' }, { isNew: true });
    manager.reset();
    await promise;
    assert.strictEqual(manager._activeControllers.size, 0);
  });

  it('uses replay configuration for history messages', async () => {
    const lang = new StubLanguage();
    const invoked = [];
    const effects = new Map([
      [
        'fx1',
        () => ({
          async play() {
            invoked.push('fx1');
          }
        })
      ],
      [
        'fx3',
        () => ({
          async play() {
            invoked.push('fx3');
          }
        })
      ]
    ]);
    const manager = new TextAnimationManager(lang, undefined, null, effects);
    const root = document.getElementById('dialog');
    const li = document.createElement('li');
    li.innerHTML = '<p class="dialog__message-text" data-i18n="msg"></p>';
    root.appendChild(li);

    await manager.animateMessage(li, { text: 'msg' }, { isReplay: true });
    assert.deepStrictEqual(invoked, ['fx3']);
  });
});
