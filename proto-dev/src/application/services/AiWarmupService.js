import {
  AI_RETRY_REQUESTED
} from '../../core/events/constants.js';

export default class AiWarmupService {
  constructor({
    detectionService,
    authVisibilityAdapter,
    eventBus,
    stateService,
    logger,
    config = {}
  } = {}) {
    this.detectionService = detectionService;
    this.authVisibilityAdapter = authVisibilityAdapter;
    this.bus = eventBus;
    this.stateService = stateService;
    this.logger = logger || console;
    this.config = config;
    this._started = false;
    this._unsubscribeAuth = null;
    this._handler = evt => this._handleEvent(evt);
  }

  boot() {
    if (this._started) return;
    if (this.bus) this.bus.subscribe(this._handler);
    this.authVisibilityAdapter?.boot?.();
    this._unsubscribeAuth = this.authVisibilityAdapter?.onChange?.(() => {
      this._maybeWarmup();
    });
    this._maybeWarmup();
    this._started = true;
  }

  dispose() {
    this.bus?.unsubscribe?.(this._handler);
    this._unsubscribeAuth?.();
    this._unsubscribeAuth = null;
    this.authVisibilityAdapter?.dispose?.();
  }

  _handleEvent(evt) {
    if (!evt) return;
    if (evt.type === AI_RETRY_REQUESTED) {
      this._retryWarmup();
    }
  }

  _retryWarmup() {
    if (!this.detectionService?.retry) return;
    this.detectionService
      .retry()
      .catch(err => this.logger?.warn?.(`[AI] Retry failed: ${err?.message || err}`));
  }

  _maybeWarmup() {
    if (!this.config?.ai?.warmupEnabled) return;
    if (!this._isWarmupAllowed()) return;
    if (!this.detectionService?.boot) return;
    this.detectionService
      .boot({ warmup: true })
      .catch(err => this.logger?.warn?.(`[AI] Warmup failed: ${err?.message || err}`));
  }

  _isWarmupAllowed() {
    const gateEnabled = this.config?.ai?.warmupAfterAuth !== false;
    if (!gateEnabled) return true;
    if (!this.authVisibilityAdapter?.hasPort?.()) return true;
    return this.authVisibilityAdapter?.isAuthenticated?.() === true;
  }
}
