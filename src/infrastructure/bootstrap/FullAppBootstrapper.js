export default class FullAppBootstrapper {
  constructor({ container, bootManager, eventBus, logger, windowRef = null } = {}) {
    this.container = container;
    this.bootManager = bootManager;
    this.eventBus = eventBus;
    this.logger = logger;
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
  }

  async boot() {
    if (this.windowRef) {
      this.windowRef.addEventListener('beforeunload', () => {
        this.bootManager.disposeAll();
      });
    }

    this.container.resolve('Logging').boot();
    this.container.resolve('LoaderView').boot();

    await this.container.resolve('Loader').load(async () => {
      await this.bootManager.bootAll();
      const visibility = this.container.resolve('ButtonVisibilityService');
      visibility.setScreenVisibility('registration-camera', 'toggle-messenger', false);
      visibility.setScreenVisibility('camera', 'toggle-messenger', false);
      this.container.resolve('ResetService').boot();
      this.container.resolve('GlobalViewPresenter').boot();
      await this.container.resolve('ViewService').boot();
      await this.container.resolve('ViewAdapter').boot();
      await this._restoreState();
    });
  }

  async _restoreState() {
    const persistence = this.container.resolve('IPersistence');
    const db = this.container.resolve('DatabaseService');
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
      this.container.resolve('GhostService');
      this.container.resolve('PostsService');
      this.eventBus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    } else if (existing) {
      await db.clearAll?.();
      persistence.remove?.('userId');
      persistence.remove?.('captured');
      this.eventBus.emit({ type: 'SCREEN_CHANGE', screen: 'registration' });
    } else {
      this.eventBus.emit({ type: 'SCREEN_CHANGE', screen: 'welcome' });
    }
  }
}
