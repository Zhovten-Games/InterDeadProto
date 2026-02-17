import ILocalization from '../../ports/ILocalization.js';

export default class LocalizationAdapter extends ILocalization {
  constructor(basePath = null, moduleUrl = import.meta.url) {
    super();
    const resolvedBasePath = basePath || this._resolveModuleBasePath(moduleUrl);
    this.basePath = this._normalizeBasePath(resolvedBasePath);
    this.cache = {};
    this.language = 'en';
  }

  setLanguage(lang) {
    this.language = lang;
  }

  _resolveModuleBasePath(moduleUrl) {
    if (!moduleUrl) return '/src/i18n/locales';
    const baseUrl = new URL('../../i18n/locales/', moduleUrl);
    return baseUrl.href;
  }

  _normalizeBasePath(basePath) {
    const fallback = '/src/i18n/locales';
    if (!basePath) return fallback;
    return basePath.replace(/\/$/, '');
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
