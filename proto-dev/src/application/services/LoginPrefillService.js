export default class LoginPrefillService {
  constructor({
    authLoginResolver,
    profileRegistrationService,
    persistence,
    embeddingResolver,
    logger = console
  } = {}) {
    this.authLoginResolver = authLoginResolver;
    this.profileRegistrationService = profileRegistrationService;
    this.persistence = persistence;
    this.embeddingResolver = embeddingResolver;
    this.logger = logger || console;
  }

  prefillIfNeeded() {
    if (!this._isLauncherMode()) return false;
    if (!this.profileRegistrationService) return false;
    if (this.persistence?.load?.('login_prefilled')) return false;
    if (this.profileRegistrationService.name) return false;
    const resolved = this.authLoginResolver?.resolve?.();
    if (!resolved) return false;
    this.profileRegistrationService.setName(resolved);
    this.persistence?.save?.('login_prefilled', true);
    this.logger?.info?.('[InterDead][Embed] Prefilled registration login');
    return true;
  }

  _isLauncherMode() {
    const state = this.embeddingResolver?.resolve?.();
    return state?.mode === 'launcher';
  }
}
