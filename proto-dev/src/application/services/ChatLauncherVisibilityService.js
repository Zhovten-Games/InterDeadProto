export default class ChatLauncherVisibilityService {
  constructor(authVisibilityAdapter, logger = console, config = {}) {
    this.authVisibilityAdapter = authVisibilityAdapter;
    this.logger = logger || console;
    this.config = config;
    this._listeners = new Set();
    this._unsubscribeAuth = null;
  }

  boot() {
    if (!this.authVisibilityAdapter?.boot) return;
    this.authVisibilityAdapter.boot();
    this._unsubscribeAuth = this.authVisibilityAdapter.onChange(() => {
      this._emit(this.getStatus());
    });
    this._emit(this.getStatus());
  }

  dispose() {
    this._unsubscribeAuth?.();
    this._unsubscribeAuth = null;
    this.authVisibilityAdapter?.dispose?.();
    this._listeners.clear();
  }

  isVisible() {
    const mode = this._getVisibilityMode();
    if (mode === 'hidden-until-auth') {
      return this.isAuthenticated();
    }
    return true;
  }

  isAuthenticated() {
    const mode = this._getVisibilityMode();
    if (mode === 'always') return true;
    if (!this.authVisibilityAdapter?.hasPort?.()) return true;
    return this.authVisibilityAdapter.isAuthenticated?.() === true;
  }

  getStatus() {
    return {
      visible: this.isVisible(),
      authenticated: this.isAuthenticated()
    };
  }

  onChange(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _emit(status) {
    this._listeners.forEach(listener => listener(status));
  }

  _getVisibilityMode() {
    const mode = this.config?.launcher?.visibility;
    return typeof mode === 'string' ? mode : 'auth-gated';
  }
}
