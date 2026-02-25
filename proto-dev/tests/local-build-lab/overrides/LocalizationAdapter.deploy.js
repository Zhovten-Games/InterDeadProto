import ILocalization from '../../../src/ports/ILocalization.js';

class BundledLocaleSource {
  constructor(loaders) {
    this.loaders = loaders;
  }

  async load(lang, domain) {
    const key = `../../../src/i18n/locales/${lang}/${domain}.json`;
    const loader = this.loaders[key];
    if (!loader) {
      return {};
    }

    const mod = await loader();
    return mod?.default || {};
  }
}

class RemoteLocaleSource {
  constructor(basePath) {
    this.basePath = basePath.replace(/\/$/, '');
  }

  async load(lang, domain) {
    const path = `${this.basePath}/${lang}/${domain}.json`;

    try {
      const mod = await import(path, { with: { type: 'json' } });
      return mod.default || {};
    } catch {
      return {};
    }
  }
}

export default class LocalizationAdapter extends ILocalization {
  constructor(basePath = null) {
    super();
    this.localeSource = basePath
      ? new RemoteLocaleSource(basePath)
      : new BundledLocaleSource(import.meta.glob('../../../src/i18n/locales/*/*.json'));
    this.cache = {};
    this.language = 'en';
  }

  setLanguage(lang) {
    this.language = lang;
  }

  async _loadDomain(lang, domain) {
    this.cache[lang] = this.cache[lang] || {};
    if (!this.cache[lang][domain]) {
      this.cache[lang][domain] = await this.localeSource.load(lang, domain);
    }
    return this.cache[lang][domain];
  }

  async translate(key, domain = 'ui') {
    const data = await this._loadDomain(this.language, domain);
    return data[key] || key;
  }
}
