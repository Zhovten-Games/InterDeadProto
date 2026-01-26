export class AssetsBaseUrlResolver {
  constructor({ documentRef = typeof document !== 'undefined' ? document : null, moduleUrl = import.meta.url } = {}) {
    this.documentRef = documentRef;
    this.moduleUrl = moduleUrl;
    this._cachedBaseUrl = null;
  }

  getBaseUrl() {
    if (this._cachedBaseUrl) return this._cachedBaseUrl;
    const fromEmbed = this._resolveFromEmbedMarker();
    const fromModule = this._resolveFromModuleUrl();
    const fallback = '/assets/';
    this._cachedBaseUrl = this._normalizeBaseUrl(fromEmbed || fromModule || fallback);
    return this._cachedBaseUrl;
  }

  resolve(assetPath = '') {
    if (!assetPath) return this.getBaseUrl();
    if (this._isAbsolute(assetPath)) return assetPath;
    const baseUrl = this.getBaseUrl();
    const normalizedBase = this._normalizeBaseUrl(baseUrl);
    const trimmedPath = this._stripAssetsPrefix(assetPath).replace(/^\/+/, '');
    return `${normalizedBase}${trimmedPath}`;
  }

  _resolveFromEmbedMarker() {
    if (!this.documentRef) return null;
    const candidates = [];
    if (this.documentRef.currentScript) {
      candidates.push(this.documentRef.currentScript);
    }
    if (this.documentRef.querySelector) {
      const explicit = this.documentRef.querySelector('[data-interdead-assets-base]');
      if (explicit) candidates.push(explicit);
    }
    for (const candidate of candidates) {
      const attr = candidate.getAttribute?.('data-interdead-assets-base');
      const dataset = candidate.dataset?.interdeadAssetsBase;
      const value = attr || dataset;
      if (value && value.trim()) return value.trim();
    }
    return null;
  }

  _resolveFromModuleUrl() {
    if (!this.moduleUrl) return null;
    const url = new URL(this.moduleUrl);
    const marker = '/assets/';
    const index = url.pathname.lastIndexOf(marker);
    if (index === -1) return null;
    const basePath = url.pathname.slice(0, index + marker.length);
    return `${url.origin}${basePath}`;
  }

  _normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return '/assets/';
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  _stripAssetsPrefix(assetPath) {
    if (assetPath.startsWith('/assets/')) return assetPath.slice('/assets/'.length);
    if (assetPath.startsWith('assets/')) return assetPath.slice('assets/'.length);
    return assetPath;
  }

  _isAbsolute(value) {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
  }
}

export class AssetUrlMapper {
  constructor(resolver = null) {
    this.resolver = resolver || new AssetsBaseUrlResolver();
  }

  mapConfig(value) {
    return this._mapValue(value);
  }

  _mapValue(value) {
    if (Array.isArray(value)) {
      return value.map(item => this._mapValue(item));
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, this._mapValue(val)]));
    }
    if (typeof value === 'string') {
      return this._mapString(value);
    }
    return value;
  }

  _mapString(value) {
    if (value.startsWith('/assets/') || value.startsWith('assets/')) {
      const stripped = value.replace(/^\/?assets\//, '');
      return this.resolver.resolve(stripped);
    }
    return value;
  }
}

export const assetsBaseUrlResolver = new AssetsBaseUrlResolver();
export const assetsBaseUrl = assetsBaseUrlResolver.getBaseUrl();
export const resolveAssetUrl = assetPath => assetsBaseUrlResolver.resolve(assetPath);
export const assetUrlMapper = new AssetUrlMapper(assetsBaseUrlResolver);
