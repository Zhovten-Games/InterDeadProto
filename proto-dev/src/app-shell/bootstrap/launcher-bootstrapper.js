/** Launcher has a restricted managed phase, using the same lifecycle authority. */
export default class LauncherBootstrapper {
  constructor({ container, bootManager, windowRef = null } = {}) {
    this.container = container;
    this.bootManager = bootManager;
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
    this._bootPromise = null;
    this._ready = false;
    this._unload = () => {
      this.dispose().catch(() => {});
    };
  }

  boot() {
    if (this._bootPromise) return this._bootPromise;
    if (this._ready) return Promise.resolve();
    this._bootPromise = this.bootManager
      .bootPhase([
        'Logging',
        'LanguageAdapter',
        'AuthVisibilityAdapter',
        'ChatLauncherService',
        'AiWarmupService',
      ])
      .then(() => {
        this._ready = true;
        this.windowRef?.addEventListener('beforeunload', this._unload);
      })
      .finally(() => {
        this._bootPromise = null;
      });
    return this._bootPromise;
  }

  async dispose() {
    this.windowRef?.removeEventListener('beforeunload', this._unload);
    await this.bootManager.disposeAll();
    this._ready = false;
  }
}
