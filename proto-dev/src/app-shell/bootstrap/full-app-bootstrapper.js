export default class FullAppBootstrapper {
  constructor({ container, bootManager, eventBus, logger, windowRef = null } = {}) {
    this.container = container;
    this.bootManager = bootManager;
    this.eventBus = eventBus;
    this.logger = logger;
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
  }

  boot() {
    if (this._bootPromise) return this._bootPromise;
    if (this._ready) return Promise.resolve();
    this._bootPromise = this._boot().finally(() => {
      this._bootPromise = null;
    });
    return this._bootPromise;
  }

  async _boot() {
    this._unloadHandler ||= () => {
      this.dispose().catch((error) => this.logger?.error?.(error?.message || error));
    };
    this.windowRef?.addEventListener('beforeunload', this._unloadHandler);
    try {
      await this.bootManager.bootPhase([
        'Logging',
        'OverlayOrchestratorService',
        'UnifiedOverlayView',
        'BootOverlayView',
      ]);
      await this.container.resolve('Loader').load(async () => {
        await this.bootManager.bootAll({ complete: false });
        const visibility = this.container.resolve('ButtonVisibilityService');
        visibility.setScreenVisibility('registration-camera', 'toggle-messenger', false);
        visibility.setScreenVisibility('camera', 'toggle-messenger', false);
        await this._restoreState();
        this.bootManager.completeBoot();
        this._ready = true;
      });
    } catch (error) {
      await this.dispose();
      throw error;
    }
  }

  async dispose() {
    this.windowRef?.removeEventListener('beforeunload', this._unloadHandler);
    await this.bootManager.disposeAll();
    this.container.resolve('Loader').dispose?.();
    this._ready = false;
  }

  async _restoreState() {
    const persistence = this.container.resolve('IPersistence');
    const db = this.container.resolve('DatabaseAdapter');
    let existing = persistence?.load('userId');
    let captured = persistence?.load('captured') === true;

    // Fallback to database if persistence keys are missing but user data exists.
    if (!existing || !captured) {
      try {
        const user = await db.loadUser();
        if (user?.id && user?.avatar) {
          existing = existing || String(user.id);
          captured = captured || Boolean(user.avatar);
          persistence?.save?.('userId', String(user.id));
          persistence?.save?.('captured', true);
        }
      } catch {
        // Ignore database errors and continue with persistence data only.
      }
    }

    const state = this.container.resolve('StateService');
    if (existing && captured) {
      state?.markCaptured?.();
      state?.setLocalAuthReady?.(true);
      this.container.resolve('GhostService');
      this.container.resolve('PostsService');
      this.eventBus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    } else if (existing) {
      // An incomplete registration is recoverable; do not erase an existing save.
      state?.setLocalAuthReady?.(false);
      this.eventBus.emit({ type: 'SCREEN_CHANGE', screen: 'registration' });
    } else {
      state?.setLocalAuthReady?.(false);
      this.eventBus.emit({ type: 'SCREEN_CHANGE', screen: 'welcome' });
    }
  }
}
