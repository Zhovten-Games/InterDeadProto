import { cacheBuildId } from '../../config/cacheBuildId.js';

export default class ServiceWorkerRegistrar {
  constructor({ windowRef = null, logger = console, embeddingResolver = null } = {}) {
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
    this.logger = logger || console;
    this.embeddingResolver = embeddingResolver;
  }

  async boot() {
    if (!this._shouldRegister()) return;
    if (!this.windowRef?.navigator?.serviceWorker) return;
    try {
      const url = new URL('sw.js', this.windowRef.location.href);
      url.searchParams.set('v', cacheBuildId);
      await this.windowRef.navigator.serviceWorker.register(url.toString());
      this.logger?.info?.(`[SW] Registered with build id ${cacheBuildId}`);
    } catch (err) {
      this.logger?.warn?.(`[SW] Registration failed: ${err?.message || err}`);
    }
  }

  _shouldRegister() {
    const mode = this.embeddingResolver?.resolve?.()?.mode;
    return mode !== 'launcher';
  }
}
