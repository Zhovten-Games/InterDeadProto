import LocalizationAdapter from '../adapters/localization-adapter.js';
import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import combinedLocales from '../locales/combined/locales.js';
import ILanguage from '../ports/language-port.js';
import NullLogger from '../../runtime-diagnostics/null-logger.js';
import {
  buildEmojiProtocolHtml,
  EMOJI_PROTOCOL_LABEL_KEYS,
  isEmojiProtocolText,
  splitEmojiProtocolLines,
} from '../../messenger/protocol/emoji-protocol.js';
import MessageTextFormatter from '../../messenger/presentation/message-text-formatter.js';

export default class LanguageAdapter extends ILanguage {
  constructor(bus = new NullEventBus(), persistence = null, logger = null) {
    super();
    this.bus = bus;
    this.storage = persistence;
    this.logger = logger ?? new NullLogger();
    this.localization = new LocalizationAdapter();
    this.current = 'en';
    this.locales = { ...combinedLocales };
    this.textFormatter = new MessageTextFormatter();
    this._booted = false;
    this._languageRevision = 0;
    this._handler = (evt) => {
      if (evt && evt.type === 'LANGUAGE_CHANGED') {
        this.applyLanguage();
      }
    };
  }

  async boot() {
    if (this._booted) return;
    this._languageRevision += 1;
    if (this.storage) {
      this.current = this.storage.load('language') || 'en';
    }
    this.localization.setLanguage(this.current);
    this.locales = { ...combinedLocales };
    this._syncDocumentLanguage(this.current);
    this.bus.subscribe(this._handler);
    this._booted = true;
  }

  dispose() {
    this._languageRevision += 1;
    this.bus.unsubscribe(this._handler);
    this._booted = false;
  }

  async addGhostLocales(ghostName) {
    try {
      const module = await import(`../locales/spirits/locales.js`);
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
    this._languageRevision += 1;
    this.current = code;
    this.localization.setLanguage(code);
    this._syncDocumentLanguage(code);
    if (this.storage) {
      this.storage.save('language', code);
    }
    this.bus.emit({ type: 'LANGUAGE_CHANGED', payload: { code } });
  }

  _syncDocumentLanguage(code) {
    if (typeof document === 'undefined') return;
    const normalizedCode =
      typeof code === 'string' && code.trim().length > 0 ? code.trim().toLowerCase() : 'en';
    document.documentElement?.setAttribute('lang', normalizedCode);
  }

  async applyLanguage(container = document) {
    const revision = this._languageRevision;
    const tasks = [];
    let emojiLabelsPromise = null;
    container.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.dataset.i18nLock === 'true') return;
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then((value) => {
          if (!value || revision !== this._languageRevision) return;
          const isMessageText = el.classList.contains('dialog__message-text');
          const isFinaleText = el.classList.contains('dialog__finale-text');
          const shouldStylePlain = isMessageText || isFinaleText;
          if (el.dataset.emojiProtocol === 'true' && isEmojiProtocolText(value)) {
            if (!emojiLabelsPromise) {
              emojiLabelsPromise = Promise.all(
                EMOJI_PROTOCOL_LABEL_KEYS.map((labelKey) =>
                  this.localization.translate(labelKey, 'ui').catch(() => labelKey),
                ),
              );
            }
            return emojiLabelsPromise.then((labels) => {
              if (revision !== this._languageRevision) return;
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
        .catch((err) => {
          this.logger?.warn?.(`Failed to translate ${key}: ${err?.message || err}`);
        });
      tasks.push(task);
    });
    container.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then((txt) => {
          if (txt && revision === this._languageRevision) el.placeholder = txt;
        })
        .catch((err) => {
          this.logger?.warn?.(`Failed to translate placeholder ${key}: ${err?.message || err}`);
        });
      tasks.push(task);
    });
    container.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then((txt) => {
          if (txt && revision === this._languageRevision) el.title = txt;
        })
        .catch((err) => {
          this.logger?.warn?.(`Failed to translate title ${key}: ${err?.message || err}`);
        });
      tasks.push(task);
    });
    container.querySelectorAll('[data-i18n-href]').forEach((el) => {
      const key = el.getAttribute('data-i18n-href');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then((txt) => {
          if (txt && revision === this._languageRevision) el.setAttribute('href', txt);
        })
        .catch((err) => {
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
