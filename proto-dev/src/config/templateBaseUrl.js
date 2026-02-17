export class TemplateBaseUrlResolver {
  constructor({
    documentRef = typeof document !== 'undefined' ? document : null,
    moduleUrl = null,
  } = {}) {
    this.documentRef = documentRef;
    this.moduleUrl = moduleUrl;
    this._cachedBaseUrl = null;
  }

  getBaseUrl() {
    if (this._cachedBaseUrl) return this._cachedBaseUrl;
    const fromEmbed = this._resolveFromEmbedMarker();
    const fromModule = this._resolveFromModuleUrl();
    const fallback = '/src/presentation/templates/';
    this._cachedBaseUrl = this._normalizeBaseUrl(fromEmbed || fromModule || fallback);
    return this._cachedBaseUrl;
  }

  resolve(templatePath = '') {
    if (!templatePath) return this.getBaseUrl();
    if (this._isAbsolute(templatePath)) return templatePath;
    const baseUrl = this.getBaseUrl();
    const normalizedBase = this._normalizeBaseUrl(baseUrl);
    const trimmedPath = this._stripTemplatesPrefix(templatePath).replace(/^\/+/, '');
    return `${normalizedBase}${trimmedPath}`;
  }

  normalizeBaseUrl(baseUrl) {
    return this._normalizeBaseUrl(baseUrl);
  }

  _resolveFromEmbedMarker() {
    if (!this.documentRef) return null;
    const candidates = [];
    if (this.documentRef.currentScript) {
      candidates.push(this.documentRef.currentScript);
    }
    if (this.documentRef.querySelector) {
      const explicit = this.documentRef.querySelector('[data-interdead-templates-base]');
      if (explicit) candidates.push(explicit);
    }
    for (const candidate of candidates) {
      const attr = candidate.getAttribute?.('data-interdead-templates-base');
      const dataset = candidate.dataset?.interdeadTemplatesBase;
      const value = attr || dataset;
      if (value && value.trim()) return value.trim();
    }
    return null;
  }

  _resolveFromModuleUrl() {
    if (!this.moduleUrl) return null;
    const url = new URL(this.moduleUrl);
    const marker = '/src/presentation/templates/';
    const index = url.pathname.lastIndexOf(marker);
    if (index !== -1) {
      const basePath = url.pathname.slice(0, index + marker.length);
      return `${url.origin}${basePath}`;
    }
    const fallbackMarker = '/src/';
    const fallbackIndex = url.pathname.lastIndexOf(fallbackMarker);
    if (fallbackIndex === -1) return null;
    const basePath = url.pathname.slice(0, fallbackIndex + fallbackMarker.length);
    return `${url.origin}${basePath}presentation/templates/`;
  }

  _normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return '/src/presentation/templates/';
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  _stripTemplatesPrefix(templatePath) {
    if (templatePath.startsWith('/src/presentation/templates/')) {
      return templatePath.slice('/src/presentation/templates/'.length);
    }
    if (templatePath.startsWith('src/presentation/templates/')) {
      return templatePath.slice('src/presentation/templates/'.length);
    }
    return templatePath;
  }

  _isAbsolute(value) {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
  }
}

export const resolveTemplateBaseUrl = moduleUrl =>
  new TemplateBaseUrlResolver({ moduleUrl }).getBaseUrl();

export const resolveTemplateUrl = (templatePath, moduleUrl) =>
  new TemplateBaseUrlResolver({ moduleUrl }).resolve(templatePath);
