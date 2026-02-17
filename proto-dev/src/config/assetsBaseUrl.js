export class AssetsBaseUrlResolver {
  constructor({
    documentRef = typeof document !== 'undefined' ? document : null,
    moduleUrl = import.meta.url,
    locationUrl = typeof window !== 'undefined' ? window.location.href : null,
  } = {}) {
    this.documentRef = documentRef;
    this.moduleUrl = moduleUrl;
    this.locationUrl = locationUrl;
    this._cachedBaseUrl = null;
  }

  getBaseUrl() {
    if (this._cachedBaseUrl) return this._cachedBaseUrl;
    const fromEmbed = this._resolveFromEmbedMarker();
    const fromModule = this._resolveFromModuleUrl();
    const fromLocation = this._resolveFromLocationUrl();
    const fallback = 'assets/';
    this._cachedBaseUrl = this._normalizeBaseUrl(
      fromEmbed || fromModule || fromLocation || fallback,
    );
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
    const assetsMarker = '/assets/';
    const assetsIndex = url.pathname.lastIndexOf(assetsMarker);
    if (assetsIndex !== -1) {
      const basePath = url.pathname.slice(0, assetsIndex + assetsMarker.length);
      if (url.origin === 'null') return basePath;
      return `${url.origin}${basePath}`;
    }

    const sourceMarker = '/src/';
    const sourceIndex = url.pathname.lastIndexOf(sourceMarker);
    if (sourceIndex !== -1) {
      const appRoot = url.pathname.slice(0, sourceIndex + 1);
      if (url.origin === 'null') return `${appRoot}assets/`;
      return `${url.origin}${appRoot}assets/`;
    }

    return null;
  }

  _resolveFromLocationUrl() {
    if (!this.locationUrl) return null;
    try {
      const url = new URL(this.locationUrl);
      const pathname = url.pathname || '/';
      const hasTrailingSlash = pathname.endsWith('/');
      const lastSegment = pathname.split('/').filter(Boolean).pop() || '';
      const looksLikeFile = lastSegment.includes('.');
      const directoryPath = hasTrailingSlash
        ? pathname
        : looksLikeFile
          ? pathname.slice(0, pathname.lastIndexOf('/') + 1)
          : `${pathname}/`;
      if (url.origin === 'null') return `${directoryPath}assets/`;
      return `${url.origin}${directoryPath}assets/`;
    } catch (_error) {
      return null;
    }
  }

  _normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return 'assets/';
    const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (this._isAbsolute(normalized) || normalized.startsWith('/')) return normalized;

    const fromModule = this._resolveFromModuleUrl();
    if (!fromModule) return normalized;

    if (normalized === 'assets/' && fromModule.endsWith('/assets/')) {
      return fromModule;
    }

    try {
      return new URL(normalized, fromModule).toString();
    } catch (_error) {
      return normalized;
    }

    const fromLocation = this._resolveFromLocationUrl();
    if (fromLocation) {
      if (normalized === 'assets/' && fromLocation.endsWith('/assets/')) {
        return fromLocation;
      }
      try {
        return new URL(normalized, fromLocation).toString();
      } catch (_error) {
        // Keep original relative path as the final fallback.
      }
    }

    return normalized;
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
      return value.map((item) => this._mapValue(item));
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, this._mapValue(val)]),
      );
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
export const resolveAssetUrl = (assetPath) => assetsBaseUrlResolver.resolve(assetPath);
export const assetUrlMapper = new AssetUrlMapper(assetsBaseUrlResolver);
