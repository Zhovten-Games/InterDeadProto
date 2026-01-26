export default class LauncherBootstrapper {
  constructor({ container, windowRef = null } = {}) {
    this.container = container;
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
  }

  async boot() {
    this.container.resolve('Logging').boot();
    const language = this.container.resolve('LanguageService');
    await language.boot?.();
    const launcher = this.container.resolve('ChatLauncherService');
    await launcher.boot?.();
    if (this.windowRef) {
      this.windowRef.addEventListener('beforeunload', () => launcher.dispose?.());
    }
  }
}
