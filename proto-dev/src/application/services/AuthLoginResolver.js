export default class AuthLoginResolver {
  constructor(authVisibilityAdapter, logger = console) {
    this.authVisibilityAdapter = authVisibilityAdapter;
    this.logger = logger || console;
  }

  resolve() {
    const snapshot = this.authVisibilityAdapter?.getSnapshot?.();
    const session = snapshot?.session || snapshot;
    const candidates = [session?.username, session?.displayName].filter(Boolean);
    const resolved = candidates.map(value => String(value).trim()).find(value => value.length > 0) || null;
    if (resolved) {
      this.logger?.info?.('[InterDead][Embed] Resolved login from auth session');
    }
    return resolved;
  }
}
