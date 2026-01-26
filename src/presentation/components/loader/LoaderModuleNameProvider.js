export default class LoaderModuleNameProvider {
  constructor(languageService = null, domain = 'ui') {
    this.languageService = languageService;
    this.domain = domain;
    this.cache = new Map();
  }

  async getRandomName(key) {
    if (!key) return '';
    const locale = this.languageService?.current || 'en';
    const collection = await this._loadLocale(locale);
    const names = Array.isArray(collection?.[key]) ? collection[key] : null;
    if (names && names.length > 0) {
      const index = Math.floor(Math.random() * names.length);
      return names[index];
    }
    if (typeof this.languageService?.translate === 'function') {
      try {
        return await this.languageService.translate(key, this.domain);
      } catch {
        return key;
      }
    }
    return key;
  }

  async _loadLocale(locale) {
    if (!this.cache.has(locale)) {
      try {
        const module = await import(`../../../i18n/locales/${locale}/loader.json`, {
          with: { type: 'json' }
        });
        this.cache.set(locale, module.default || {});
      } catch {
        this.cache.set(locale, {});
      }
    }
    return this.cache.get(locale);
  }
}
