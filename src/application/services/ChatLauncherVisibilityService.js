export default class ChatLauncherVisibilityService {
  constructor(authVisibilityAdapter, logger = console) {
    this.authVisibilityAdapter = authVisibilityAdapter;
    this.logger = logger || console;
    this._listeners = new Set();
    this._unsubscribeAuth = null;
  }

  boot() {
    if (!this.authVisibilityAdapter?.boot) return;
    this.authVisibilityAdapter.boot();
    this._unsubscribeAuth = this.authVisibilityAdapter.onChange(() => {
      this._emit(this.isVisible());
    });
    this._emit(this.isVisible());
  }

  dispose() {
    this._unsubscribeAuth?.();
    this._unsubscribeAuth = null;
    this.authVisibilityAdapter?.dispose?.();
    this._listeners.clear();
  }

  isVisible() {
    if (!this.authVisibilityAdapter?.hasPort?.()) return true;
    return this.authVisibilityAdapter.isAuthenticated?.() === true;
  }

  onChange(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _emit(visible) {
    this._listeners.forEach(listener => listener(visible));
  }
}
