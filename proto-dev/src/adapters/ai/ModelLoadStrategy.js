const DEFAULT_RETRY_DELAYS_MS = Object.freeze([250, 750, 1500]);

export default class ModelLoadStrategy {
  constructor({
    logger = console,
    loadModel,
    retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = {}) {
    this.logger = logger || console;
    this.loadModel = loadModel;
    this.retryDelaysMs = Array.isArray(retryDelaysMs) ? retryDelaysMs : DEFAULT_RETRY_DELAYS_MS;
    this.sleep = sleep;
  }

  async loadWithFallback({ primaryUrl, fallbackUrl }) {
    const primaryResult = await this._loadPrimary(primaryUrl);
    if (primaryResult.ok) {
      return { model: primaryResult.model, source: primaryUrl };
    }

    if (!fallbackUrl || fallbackUrl === primaryUrl) {
      throw primaryResult.error;
    }

    this.logger.warn(
      `Failed to load COCO-SSD model from primary source after retries. Switching to fallback ${fallbackUrl}.`,
    );

    const fallbackModel = await this.loadModel(fallbackUrl);
    return { model: fallbackModel, source: fallbackUrl };
  }

  async _loadPrimary(primaryUrl) {
    const maxAttempts = this.retryDelaysMs.length + 1;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const model = await this.loadModel(primaryUrl);
        return { ok: true, model };
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `COCO-SSD primary model load failed (attempt ${attempt}/${maxAttempts}) for ${primaryUrl}: ${error?.message || error}`,
        );
        if (attempt >= maxAttempts) break;
        const delayMs = this.retryDelaysMs[attempt - 1] ?? 0;
        await this.sleep(delayMs);
      }
    }

    return { ok: false, error: lastError || new Error('Unknown model load error') };
  }
}
