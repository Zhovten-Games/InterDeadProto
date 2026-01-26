import LocalizationAdapter from './LocalizationAdapter.js';
import NullEventBus from '../../core/events/NullEventBus.js';
import combinedLocales from '../../i18n/locales/combined/locales.js';
import ILanguage from '../../ports/ILanguage.js';
import NullLogger from '../../core/logging/NullLogger.js';

export default class LanguageService extends ILanguage {
  constructor(bus = new NullEventBus(), persistence = null, logger = null) {
    super();
    this.bus = bus;
    this.storage = persistence;
    this.logger = logger ?? new NullLogger();
    this.localization = new LocalizationAdapter();
    this.current = 'en';
    this.locales = { ...combinedLocales };
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
    container.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.i18nLock === 'true') return;
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const task = this.localization
        .translate(key, 'ui')
        .then(value => {
          if (value) el.textContent = value;
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
    await Promise.all(tasks);
  }

  async translate(key, domain = 'ui') {
    return this.localization.translate(key, domain);
  }
}
