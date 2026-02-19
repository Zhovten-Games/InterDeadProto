import loadScript from '../../utils/loadScript.js';

import NullEventBus from '../../core/events/NullEventBus.js';
import IDetection from '../../ports/IDetection.js';
import { resolveAssetUrl } from '../../config/assetsBaseUrl.js';
import { appendCacheBuildParam } from '../../config/cacheBuildId.js';
import { AI_STATE_CHANGED } from '../../core/events/constants.js';
import ModelLoadStrategy from './ModelLoadStrategy.js';

const AI_STATES = Object.freeze({
  IDLE: 'IDLE',
  LOADING_RUNTIME: 'LOADING_RUNTIME',
  LOADING_MODEL: 'LOADING_MODEL',
  WARMUP: 'WARMUP',
  READY: 'READY',
  FAILED: 'FAILED',
});
let cacheFetchWrapped = false;

export default class DetectionService extends IDetection {
  constructor(logger, stateService = null, eventBus = new NullEventBus(), config = {}) {
    super();
    this.logger = logger;
    this.stateService = stateService;
    this.eventBus = eventBus;
    this.config = config;
    this.model = null;
    this.state = AI_STATES.IDLE;
    this._bootPromise = null;
    this._runtimePromise = null;
    this._modelPromise = null;
    /**
     * Internal mutex to avoid parallel model inference.
     * @private
     */
    this.busy = false;
  }

  async loadAssets() {
    if (this._runtimePromise) return this._runtimePromise;
    const tfUrl = appendCacheBuildParam(resolveAssetUrl('libs/tf.min.js'));
    const cocoUrl = appendCacheBuildParam(resolveAssetUrl('libs/coco-ssd.min.js'));
    this._runtimePromise = Promise.all([loadScript(tfUrl), loadScript(cocoUrl)]);
    try {
      await this._runtimePromise;
    } catch (err) {
      this._runtimePromise = null;
      throw err;
    }
    return this._runtimePromise;
  }

  async loadModel() {
    if (this.model) return this.model;
    if (this._modelPromise) return this._modelPromise;
    if (typeof window.cocoSsd === 'undefined') {
      this.logger.warn('cocoSsd global not found');
      return null;
    }
    this._ensureCacheBuildFetch();
    const modelUrl = appendCacheBuildParam(resolveAssetUrl('models/coco-ssd/model.json'));
    const fallbackBase = this.config?.ai?.cocoSsdFallbackUrl || '';
    const fallbackUrl = fallbackBase ? appendCacheBuildParam(fallbackBase) : '';
    this._modelPromise = this.loadModelWithFallback(modelUrl, fallbackUrl)
      .then((result) => {
        this.model = result?.model || null;
        if (this.model) {
          const label = result.source === modelUrl ? 'assets' : 'fallback CDN';
          this.logger.info(`COCO-SSD model loaded from ${label}`);
        }
        return this.model;
      })
      .catch((error) => {
        this.model = null;
        this.logger.error('Failed to load COCO-SSD model.', error);
        throw error;
      })
      .finally(() => {
        this._modelPromise = null;
      });
    return this._modelPromise;
  }

  async boot({ warmup = true, force = false } = {}) {
    if (!force && this.state === AI_STATES.READY && this.model) {
      return this.model;
    }
    if (!force && this._bootPromise) {
      return this._bootPromise;
    }
    const bootPromise = this._bootSequence({ warmup, force });
    this._bootPromise = bootPromise;
    try {
      return await bootPromise;
    } finally {
      if (this._bootPromise === bootPromise) {
        this._bootPromise = null;
      }
    }
  }

  async retry() {
    this._reset();
    return this.boot({ warmup: true, force: true });
  }

  getState() {
    return this.state;
  }

  _reset() {
    this.model = null;
    this._runtimePromise = null;
    this._modelPromise = null;
    this._setState(AI_STATES.IDLE);
  }

  async _bootSequence({ warmup, force }) {
    try {
      this._setState(AI_STATES.LOADING_RUNTIME);
      if (typeof window.cocoSsd === 'undefined' || force) {
        await this.loadAssets();
      }
      this._setState(AI_STATES.LOADING_MODEL);
      await this.loadModel();
      if (!this.model) {
        throw new Error('AI model not loaded');
      }
      if (warmup && this.config?.ai?.warmupWithDummyFrame !== false) {
        this._setState(AI_STATES.WARMUP);
        await this._warmupModel();
      }
      this._setState(AI_STATES.READY);
      return this.model;
    } catch (err) {
      this._setState(AI_STATES.FAILED, err);
      throw err;
    }
  }

  async _warmupModel() {
    if (!this.model) return;
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    ctx?.fillRect(0, 0, canvas.width, canvas.height);
    try {
      await this.model.detect(canvas);
    } catch (err) {
      this.logger?.warn?.('DetectionService warmup failed', err);
    }
  }

  async detectTarget(image, target = 'person') {
    if (this.busy) {
      this.logger?.warn?.('Detection already in progress');
      return { ok: false };
    }
    this.busy = true;
    try {
      if (this.state !== AI_STATES.READY || !this.model) {
        await this.boot({ warmup: false });
      }
      if (!this.model) return { ok: false };
      const bitmap = await createImageBitmap(image);
      const preds = await this.model.detect(bitmap);
      this.logger.info(`Detection: ${preds.length} objects`);
      const found = preds.find((p) => p.class === target && p.score > 0.5);
      const ok = !!found;
      if (this.stateService) {
        const alreadyPresent = this.stateService.presence?.[target];
        if (ok && !alreadyPresent) {
          this.stateService.setPresence(target, true);
          const screen = this.stateService?.currentScreen || 'registration-camera';
          this.eventBus.emit({ type: 'BUTTON_STATE_UPDATED', screen });
        }
      }
      if (!ok) return { ok };
      const [x, y, width, height] = found.bbox;
      let mask = null;

      // Prefer segmentation data when supplied by the model
      if (Array.isArray(found.segmentation) && found.segmentation.length) {
        const poly = found.segmentation[0];
        const polygon = [];
        for (let i = 0; i < poly.length; i += 2) {
          polygon.push({ x: poly[i], y: poly[i + 1] });
        }
        mask = { polygon };
      } else if (found.mask) {
        // Some models return a per-pixel mask
        mask = { imageData: found.mask };
      }

      // Fallback to bounding box polygon when segmentation is unavailable
      if (!mask) {
        mask = {
          polygon: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height },
          ],
        };
      }

      return { ok, box: { x, y, width, height }, mask };
    } finally {
      this.busy = false;
    }
  }

  async loadModelWithFallback(modelUrl, fallbackUrl) {
    const strategy = new ModelLoadStrategy({
      logger: this.logger,
      loadModel: (url) => cocoSsd.load({ modelUrl: url }),
    });
    return strategy.loadWithFallback({
      primaryUrl: modelUrl,
      fallbackUrl,
    });
  }

  _setState(state, error = null) {
    if (this.state === state) return;
    this.state = state;
    this.eventBus.emit({
      type: AI_STATE_CHANGED,
      state,
      error: error ? String(error.message || error) : null,
    });
  }

  _ensureCacheBuildFetch() {
    if (cacheFetchWrapped) return;
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const next = this._withCacheBuildParam(input);
      return originalFetch(next, init);
    };
    cacheFetchWrapped = true;
    this.logger?.info?.('[AI] Installed cache-build fetch wrapper for AI assets');
  }

  _withCacheBuildParam(input) {
    const url = this._resolveFetchUrl(input);
    if (!url) return input;
    if (!this._isAiAssetUrl(url)) return input;
    const nextUrl = appendCacheBuildParam(url);
    return nextUrl;
  }

  _resolveFetchUrl(input) {
    if (typeof input === 'string') return input;
    if (input instanceof Request) return input.url;
    return null;
  }

  _isAiAssetUrl(url) {
    return url.includes('/models/coco-ssd/') || url.includes('/libs/');
  }
}
