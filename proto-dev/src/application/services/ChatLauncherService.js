export default class ChatLauncherService {
  constructor({
    widget,
    visibilityService,
    modalAdapter,
    embeddingResolver,
    embedPermissionsResolver,
    documentRef = null,
    logger = console
  } = {}) {
    this.widget = widget;
    this.visibilityService = visibilityService;
    this.modalAdapter = modalAdapter;
    this.embeddingResolver = embeddingResolver;
    this.embedPermissionsResolver = embedPermissionsResolver;
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
    this._visibleUnsub = this.visibilityService?.onChange?.(status => {
      this._applyStatus(status);
    });
    this._applyStatus(this.visibilityService?.getStatus?.());
  }

  dispose() {
    this._visibleUnsub?.();
    this._visibleUnsub = null;
    this.visibilityService?.dispose?.();
    this.widget?.dispose?.();
  }

  open() {
    if (!this.visibilityService?.isAuthenticated?.()) {
      this.logger?.info?.('[InterDead][Launcher] Open blocked until site auth.');
      return;
    }
    const iframe = this._ensureIframe();
    if (!iframe) return;
    this.modalAdapter?.open?.(iframe);
  }

  _isLauncherMode() {
    return this.embeddingResolver?.resolve?.()?.mode === 'launcher';
  }

  _applyStatus(status = {}) {
    const visible = status?.visible ?? this.visibilityService?.isVisible?.() ?? true;
    const authenticated =
      status?.authenticated ?? this.visibilityService?.isAuthenticated?.() ?? true;
    this.widget.setVisible(visible);
    this.widget.setEnabled(authenticated);
    this.widget.setLabelKey(authenticated ? 'open_messenger' : 'launcher_auth_required');
  }

  _ensureIframe() {
    if (!this.documentRef) return null;
    if (this._iframe) return this._iframe;
    const iframe = this.documentRef.createElement('iframe');
    iframe.className = 'interdead-launcher-modal__iframe';
    iframe.src = this._resolveAppSrc();
    const allow = this.embedPermissionsResolver?.resolveAllowAttribute?.();
    if (allow) iframe.allow = allow;
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
