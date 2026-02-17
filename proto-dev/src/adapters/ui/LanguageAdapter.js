import LocalizationAdapter from './LocalizationAdapter.js';
import NullEventBus from '../../core/events/NullEventBus.js';
import combinedLocales from '../../i18n/locales/combined/locales.js';
import ILanguage from '../../ports/ILanguage.js';
import NullLogger from '../../core/logging/NullLogger.js';
import {
  buildEmojiProtocolHtml,
  EMOJI_PROTOCOL_LABEL_KEYS,
  isEmojiProtocolText,
  splitEmojiProtocolLines
} from '../../utils/emojiProtocol.js';
import MessageTextFormatter from '../../utils/MessageTextFormatter.js';

export default class LanguageService extends ILanguage {
  constructor(bus = new NullEventBus(), persistence = null, logger = null) {
    super();
    this.bus = bus;
    this.storage = persistence;
    this.logger = logger ?? new NullLogger();
    this.localization = new LocalizationAdapter();
    this.current = 'en';
    this.locales = { ...combinedLocales };
    this.textFormatter = new MessageTextFormatter();
    this._handler = evt => {
      if (evt && evt.type === 'LANGUAGE_CHANGED') {
        this.applyLanguage();
      }
    };
  }

  async boot() {
    this.localization.setLanguage(this.current);
    this.locales = { ...combinedLocales };
    if (this.storage) {
      this.current = this.storage.load('language') || 'en';
    }
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
  }

  async addGhostLocales(ghostName) {
    try {
      const module = await import(
        `../../i18n/locales/spirits/locales.js`
      );
      const ghostLocales = module.default || {};
      for (const lang of Object.keys(ghostLocales)) {
        this.locales[lang] = { ...(this.locales[lang] || {}), ...ghostLocales[lang] };
      }
      this.applyLanguage();
    } catch (err) {
      this.logger.warn(`No locales for ghost "${ghostName}"`);
    }
  }

  setLanguage(code) {
    this.current = code;
    this.localization.setLanguage(code);
    if (this.storage) {
      this.storage.save('language', code);
    }
    this.bus.emit({ type: 'LANGUAGE_CHANGED', payload: { code } });
  }

  async applyLanguage(container = document) {
    const tasks = [];
    let emojiLabelsPromise = null;
    container.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.i18nLock === 'true') return;
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then(value => {
          if (!value) return;
          const isMessageText = el.classList.contains('dialog__message-text');
          const isFinaleText = el.classList.contains('dialog__finale-text');
          const shouldStylePlain = isMessageText || isFinaleText;
          if (el.dataset.emojiProtocol === 'true' && isEmojiProtocolText(value)) {
            if (!emojiLabelsPromise) {
              emojiLabelsPromise = Promise.all(
                EMOJI_PROTOCOL_LABEL_KEYS.map(labelKey =>
                  this.localization.translate(labelKey, 'ui').catch(() => labelKey)
                )
              );
            }
            return emojiLabelsPromise.then(labels => {
              if (isMessageText) {
                el.classList.add('dialog__message-text--protocol');
                el.classList.remove('dialog__message-text--plain');
              }
              const lines = splitEmojiProtocolLines(value);
              el.innerHTML = buildEmojiProtocolHtml(lines, labels);
            });
          }
          if (shouldStylePlain) {
            el.classList.remove('dialog__message-text--protocol');
            el.classList.add('dialog__message-text--plain');
          }
          if (el.dataset.allowLinks === 'true') {
            const { html, hasLinks } = this.textFormatter.format(value);
            if (hasLinks) {
              el.innerHTML = html;
            } else {
              el.textContent = value;
            }
            return;
          }
          el.textContent = value;
        })
        .catch(err => {
          this.logger?.warn?.(`Failed to translate ${key}: ${err?.message || err}`);
        });
      tasks.push(task);
    });
    container.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then(txt => {
          if (txt) el.placeholder = txt;
        })
        .catch(err => {
          this.logger?.warn?.(`Failed to translate placeholder ${key}: ${err?.message || err}`);
      });
      tasks.push(task);
    });
    container.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then(txt => {
          if (txt) el.title = txt;
        })
        .catch(err => {
          this.logger?.warn?.(`Failed to translate title ${key}: ${err?.message || err}`);
        });
      tasks.push(task);
    });
    container.querySelectorAll('[data-i18n-href]').forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then(txt => {
          if (txt) el.setAttribute('href', txt);
        })
        .catch(err => {
          this.logger?.warn?.(`Failed to translate href ${key}: ${err?.message || err}`);
        });
      tasks.push(task);
    });
    await Promise.all(tasks);
  }

  async translate(key, domain = 'ui') {
    return this.localization.translate(key, domain);
  }
}
