import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import IDetection from '../ports/detection-port.js';
import { resolveAssetUrl } from '../../asset-delivery/paths/assets-base-url.js';
import { appendCacheBuildParam, cacheBuildId } from '../../asset-delivery/cache/cache-build-id.js';
import { AI_STATE_CHANGED } from '../../runtime-events/domain/constants.js';
import WorkerDetectionPort from './worker-detection-port.js';

export default class DetectionAdapter extends IDetection {
  constructor(logger, stateService = null, eventBus = new NullEventBus(), config = {}) {
    super();
    this.logger = logger;
    this.eventBus = eventBus;
    this.config = config;
    this.model = null;
    this.state = 'IDLE';
    this.busy = false;
    this.generation = 0;
    this.infrastructureGeneration = 0;
    this._bootPromise = null;
    this.detectionThreshold = this._clampDetectionThreshold(config?.ai?.detectionThreshold);
    this.port =
      config.workerPort || new WorkerDetectionPort({ onState: (state) => this._setState(state) });
  }

  boot() {
    if (this.model && this.state === 'READY') return Promise.resolve(this.model);
    if (this._bootPromise) return this._bootPromise;
    const generation = this.infrastructureGeneration;
    this._setState('LOADING_RUNTIME');
    const url = (path) => appendCacheBuildParam(resolveAssetUrl(path));
    this._bootPromise = this.port
      .initialize({
        tfUrl: url('libs/tf.min.js'),
        cocoUrl: url('libs/coco-ssd.min.js'),
        modelUrl: url('models/coco-ssd/model.json'),
        fallbackUrl: this.config?.ai?.cocoSsdFallbackUrl || '',
        buildId: cacheBuildId,
      })
      .then((metadata) => {
        if (generation !== this.infrastructureGeneration)
          throw new DOMException('AI infrastructure disposed', 'AbortError');
        if (metadata.backend !== 'cpu') throw new Error('Required CPU worker backend unavailable');
        this.model = Object.freeze(metadata);
        this._setState('READY');
        return this.model;
      })
      .catch((error) => {
        this.model = null;
        this._setState('FAILED', error);
        throw error;
      })
      .finally(() => {
        this._bootPromise = null;
      });
    return this._bootPromise;
  }

  loadAssets() {
    return this.boot();
  }
  loadModel() {
    return this.boot();
  }
  retry() {
    this.dispose();
    return this.boot();
  }
  getState() {
    return this.state;
  }

  async detectTarget(frame, target = 'person', context = {}) {
    if (this.busy) return { ok: false, reason: 'busy' };
    const generation = this.generation;
    this.busy = true;
    try {
      await this.boot();
      if (generation !== this.generation) return { ok: false, reason: 'cancelled' };
      const result = await this.port.detect(frame, context);
      if (generation !== this.generation) return { ok: false, reason: 'cancelled' };
      const found = result.predictions.find(
        (prediction) => prediction.class === target && prediction.score >= this.detectionThreshold,
      );
      if (!found) return { ok: false };
      const [x, y, width, height] = found.bbox;
      const polygon = Array.isArray(found.segmentation?.[0])
        ? found.segmentation[0].reduce((points, value, index, values) => {
            if (index % 2 === 0) points.push({ x: value, y: values[index + 1] });
            return points;
          }, [])
        : [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height },
          ];
      return {
        ok: true,
        box: { x, y, width, height },
        mask: found.mask ? { imageData: found.mask } : { polygon },
        context: result.context,
      };
    } finally {
      if (generation === this.generation) this.busy = false;
    }
  }

  cancelPending() {
    this.generation++;
    this.busy = false;
    this.port.cancelPending();
  }

  dispose() {
    this.infrastructureGeneration++;
    this.cancelPending();
    this.port.dispose();
    this.model = null;
    this._bootPromise = null;
    this._setState('IDLE');
  }

  _setState(state, error = null) {
    if (this.state === state && !error) return;
    this.state = state;
    this.eventBus.emit({
      type: AI_STATE_CHANGED,
      state,
      error: error ? String(error.message || error) : null,
    });
  }

  _clampDetectionThreshold(value) {
    if (value === undefined || value === null || value === '') return 0.5;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.min(0.95, Math.max(0.1, numeric)) : 0.5;
  }
  getDetectionThreshold() {
    return this.detectionThreshold;
  }
  setDetectionThreshold(value) {
    return (this.detectionThreshold = this._clampDetectionThreshold(value));
  }

  _withCacheBuildParam(input) {
    const url = typeof input === 'string' ? input : input?.url;
    return url && (url.includes('/models/coco-ssd/') || url.includes('/libs/'))
      ? appendCacheBuildParam(url)
      : input;
  }
}
