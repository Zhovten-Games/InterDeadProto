export default class ChatLauncherService {
  constructor({
    widget,
    visibilityService,
    modalAdapter,
    embeddingResolver,
    embedPermissionsResolver,
    documentRef = null,
    logger = console,
  } = {}) {
    this.widget = widget;
    this.visibilityService = visibilityService;
    this.modalAdapter = modalAdapter;
    this.embeddingResolver = embeddingResolver;
    this.embedPermissionsResolver = embedPermissionsResolver;
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this.logger = logger || console;
    this._iframe = null;
    this._chooser = null;
    this._visibleUnsub = null;
  }

  async boot() {
    if (!this._isLauncherMode()) return;
    this.widget.render();
    this.widget.onOpen(() => this.open());
    this.visibilityService?.boot?.();
    this._visibleUnsub = this.visibilityService?.onChange?.((status) => {
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
    const chooser = this._ensureChooser();
    if (!chooser) return;
    this.modalAdapter?.open?.(chooser);
  }

  _isLauncherMode() {
    return this.embeddingResolver?.resolve?.()?.mode === 'launcher';
  }

  _applyStatus(status = {}) {
    const visible = status?.visible ?? this.visibilityService?.isVisible?.() ?? true;
    const authenticated =
      status?.authenticated ?? this.visibilityService?.isAuthenticated?.() ?? true;
    this.widget.setVisible(visible);
    this.widget.setEnabled(true);
    this.widget.setLabelKey(authenticated ? 'open_messenger' : 'open_messenger');
  }

  _ensureChooser() {
    if (!this.documentRef) return null;
    if (this._chooser) return this._chooser;
    const wrapper = this.documentRef.createElement('div');
    wrapper.className = 'interdead-launcher-choice';

    const title = this.documentRef.createElement('h2');
    title.className = 'interdead-launcher-choice__title';
    title.textContent = 'Choose how to open chat';

    const actions = this.documentRef.createElement('div');
    actions.className = 'interdead-launcher-choice__actions';

    const openExternalButton = this.documentRef.createElement('button');
    openExternalButton.type = 'button';
    openExternalButton.className =
      'interdead-launcher-choice__button interdead-launcher-choice__button--external';
    openExternalButton.textContent = 'Open chat in a new tab';
    openExternalButton.addEventListener('click', () => {
      const target = this._resolveExternalSrc();
      if (target && typeof window !== 'undefined') {
        window.open(target, '_blank', 'noopener,noreferrer');
      }
      this.modalAdapter?.close?.();
    });

    const openInsideButton = this.documentRef.createElement('button');
    openInsideButton.type = 'button';
    openInsideButton.className =
      'interdead-launcher-choice__button interdead-launcher-choice__button--inline';
    openInsideButton.textContent = 'Open directly here';
    openInsideButton.addEventListener('click', () => {
      const iframe = this._ensureIframe();
      this.modalAdapter?.close?.();
      if (!iframe) return;
      this.modalAdapter?.open?.(iframe);
    });

    actions.appendChild(openExternalButton);
    actions.appendChild(openInsideButton);
    wrapper.appendChild(title);
    wrapper.appendChild(actions);
    this._chooser = wrapper;
    return wrapper;
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
    const marker = this.documentRef.querySelector(
      '[data-interdead-embed], [data-interdead-launcher]',
    );
    const explicit = marker?.getAttribute('data-interdead-src') || marker?.dataset?.interdeadSrc;
    if (explicit && explicit.trim()) return explicit.trim();
    return fallback;
  }

  _resolveExternalSrc() {
    if (!this.documentRef) return this._resolveAppSrc();
    const marker = this.documentRef.querySelector(
      '[data-interdead-embed], [data-interdead-launcher]',
    );
    const explicit =
      marker?.getAttribute('data-interdead-external-src') || marker?.dataset?.interdeadExternalSrc;
    if (explicit && explicit.trim()) return explicit.trim();
    return this._resolveAppSrc();
  }
}
