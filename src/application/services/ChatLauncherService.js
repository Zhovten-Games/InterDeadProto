export default class ChatLauncherService {
  constructor({
    widget,
    visibilityService,
    modalAdapter,
    embeddingResolver,
    documentRef = null,
    logger = console
  } = {}) {
    this.widget = widget;
    this.visibilityService = visibilityService;
    this.modalAdapter = modalAdapter;
    this.embeddingResolver = embeddingResolver;
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this.logger = logger || console;
    this._iframe = null;
    this._visibleUnsub = null;
  }

  async boot() {
    if (!this._isLauncherMode()) return;
    this.widget.render();
    this.widget.onOpen(() => this.open());
    this.visibilityService?.boot?.();
    this._visibleUnsub = this.visibilityService?.onChange?.(visible => {
      this.widget.setVisible(visible);
    });
    this.widget.setVisible(this.visibilityService?.isVisible?.() ?? true);
  }

  dispose() {
    this._visibleUnsub?.();
    this._visibleUnsub = null;
    this.visibilityService?.dispose?.();
    this.widget?.dispose?.();
  }

  open() {
    const iframe = this._ensureIframe();
    if (!iframe) return;
    this.modalAdapter?.open?.(iframe);
  }

  _isLauncherMode() {
    return this.embeddingResolver?.resolve?.()?.mode === 'launcher';
  }

  _ensureIframe() {
    if (!this.documentRef) return null;
    if (this._iframe) return this._iframe;
    const iframe = this.documentRef.createElement('iframe');
    iframe.className = 'interdead-launcher-modal__iframe';
    iframe.src = this._resolveAppSrc();
    this._iframe = iframe;
    return iframe;
  }

  _resolveAppSrc() {
    const fallback = '/InterDeadProto/index.html';
    if (!this.documentRef) return fallback;
    const marker = this.documentRef.querySelector('[data-interdead-embed], [data-interdead-launcher]');
    const explicit = marker?.getAttribute('data-interdead-src') || marker?.dataset?.interdeadSrc;
    if (explicit && explicit.trim()) return explicit.trim();
    return fallback;
  }
}
