import loadScript from '../../utils/loadScript.js';

import NullEventBus from '../../core/events/NullEventBus.js';
import IDetection from '../../ports/IDetection.js';
import { resolveAssetUrl } from '../../config/assetsBaseUrl.js';

export default class DetectionService extends IDetection {
  constructor(logger, stateService = null, eventBus = new NullEventBus(), config = {}) {
    super();
    this.logger = logger;
    this.stateService = stateService;
    this.eventBus = eventBus;
    this.config = config;
    this.model = null;
    /**
     * Internal mutex to avoid parallel model inference.
     * @private
     */
    this.busy = false;
  }

  async loadAssets() {
    await loadScript(resolveAssetUrl('libs/tf.min.js'));
    await loadScript(resolveAssetUrl('libs/coco-ssd.min.js'));
  }

  async loadModel() {
    if (typeof window.cocoSsd === 'undefined') {
      this.logger.warn('cocoSsd global not found');
      return;
    }
    const modelUrl = resolveAssetUrl('models/coco-ssd/model.json');
    const fallbackUrl = this.config?.ai?.cocoSsdFallbackUrl;
    try {
      const result = await this.loadModelWithFallback(modelUrl, fallbackUrl);
      this.model = result?.model || null;
      if (this.model) {
        const label = result.source === modelUrl ? 'assets' : 'fallback CDN';
        this.logger.info(`COCO-SSD model loaded from ${label}`);
      }
    } catch (error) {
      this.model = null;
      this.logger.error('Failed to load COCO-SSD model.', error);
    }
  }

  async boot() {
    if (typeof window.cocoSsd === 'undefined') {
      await this.loadAssets();
    }
    await this.loadModel();
  }

  async detectTarget(image, target = 'person') {
    if (this.busy) {
      this.logger?.warn?.('Detection already in progress');
      return { ok: false };
    }
    this.busy = true;
    try {
      if (!this.model) await this.loadModel();
      if (!this.model) return { ok: false };
      const bitmap = await createImageBitmap(image);
      const preds = await this.model.detect(bitmap);
      this.logger.info(`Detection: ${preds.length} objects`);
      const found = preds.find(p => p.class === target && p.score > 0.5);
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
            { x, y: y + height }
          ]
        };
      }

      return { ok, box: { x, y, width, height }, mask };
    } finally {
      this.busy = false;
    }
  }

  async loadModelWithFallback(modelUrl, fallbackUrl) {
    try {
      const model = await cocoSsd.load({ modelUrl });
      return { model, source: modelUrl };
    } catch (error) {
      if (!fallbackUrl || fallbackUrl === modelUrl) {
        throw error;
      }
      this.logger.warn(
        `Failed to load COCO-SSD model from ${modelUrl}. Switching to fallback ${fallbackUrl}.`
      );
      const model = await cocoSsd.load({ modelUrl: fallbackUrl });
      return { model, source: fallbackUrl };
    }
  }
}
