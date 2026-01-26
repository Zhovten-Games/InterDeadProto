import ILocalization from '../../ports/ILocalization.js';

export default class LocalizationAdapter extends ILocalization {
  constructor(basePath = '/src/i18n/locales') {
    super();
    this.basePath = basePath.replace(/\/$/, '');
    this.cache = {};
    this.language = 'en';
  }

  setLanguage(lang) {
    this.language = lang;
  }

  async _loadDomain(lang, domain) {
    const path = `${this.basePath}/${lang}/${domain}.json`;
    this.cache[lang] = this.cache[lang] || {};
    if (!this.cache[lang][domain]) {
      try {
        const mod = await import(path, { with: { type: 'json' } });
        this.cache[lang][domain] = mod.default;
      } catch {
        this.cache[lang][domain] = {};
      }
    }
    return this.cache[lang][domain];
  }

  async translate(key, domain = 'ui') {
    const data = await this._loadDomain(this.language, domain);
    return data[key] || key;
  }
}
