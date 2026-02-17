const DEFAULT_REQUIRED_PERMISSIONS = ['camera', 'microphone'];

export default class EmbedPermissionsResolver {
  constructor({ documentRef = null, logger = console, requiredPermissions = null } = {}) {
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this.logger = logger;
    this.requiredPermissions = Array.isArray(requiredPermissions) && requiredPermissions.length
      ? [...requiredPermissions]
      : DEFAULT_REQUIRED_PERMISSIONS;
    this._cached = null;
  }

  resolveAllowAttribute() {
    if (this._cached) return this._cached;
    const allowList = this._resolveAllowList();
    const allow = allowList.join('; ');
    this._cached = allow;
    this.logger?.info?.(`[InterDead][Embed] Resolved iframe allow list: ${allow}`);
    return allow;
  }

  _resolveAllowList() {
    const marker = this._findMarker();
    const explicit = marker?.getAttribute('data-interdead-allow') || marker?.dataset?.interdeadAllow;
    const requested = this._parsePermissions(explicit);
    return this._mergePermissions(requested);
  }

  _findMarker() {
    const doc = this.documentRef;
    if (!doc) return null;
    const explicit = doc.querySelector('[data-interdead-embed], [data-interdead-launcher]');
    return explicit;
  }

  _parsePermissions(value) {
    if (!value || !value.trim()) return [];
    const tokens = value
      .split(/[;,]/)
      .map(token => token.trim())
      .filter(Boolean);
    return [...new Set(tokens)];
  }

  _mergePermissions(requested) {
    const unique = new Set(this.requiredPermissions);
    requested.forEach(permission => unique.add(permission));
    return [...unique];
  }
}
