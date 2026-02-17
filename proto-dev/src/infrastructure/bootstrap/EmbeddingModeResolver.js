export default class EmbeddingModeResolver {
  constructor({ logger = console, documentRef = null } = {}) {
    this.logger = logger;
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this._cached = null;
  }

  resolve() {
    if (this._cached) return this._cached;
    const mode = this._detectMode();
    const result = { mode };
    this._cached = result;
    this.logger?.info?.(`[InterDead][Embed] Resolved embedding mode: ${mode}`);
    return result;
  }

  _detectMode() {
    const doc = this.documentRef;
    if (!doc) return 'full';
    const marker = this._findModeMarker(doc);
    if (!marker) return 'full';
    const value = marker.getAttribute('data-interdead-embed') || marker.dataset.interdeadEmbed;
    return (value || '').toLowerCase() === 'launcher' ? 'launcher' : 'full';
  }

  _findModeMarker(doc) {
    const explicit = doc.querySelector('[data-interdead-embed]');
    if (explicit) return explicit;
    return doc.querySelector('[data-interdead-launcher]');
  }
}
