const PROTOCOL = 1;

/** One worker and one in-flight frame. User cancellation retains model readiness. */
export default class WorkerDetectionPort {
  constructor({
    workerFactory = () => new Worker(new URL('./detection-worker.js', import.meta.url)),
    timeoutMs = 60000,
    onState = () => {},
  } = {}) {
    this.workerFactory = workerFactory;
    this.timeoutMs = timeoutMs;
    this.onState = onState;
    this.worker = null;
    this.requests = new Map();
    this.nextId = 0;
    this.activeFrame = null;
    this.readyPromise = null;
  }

  initialize(options) {
    if (this.readyPromise) return this.readyPromise;
    this.worker = this.workerFactory();
    this.worker.onmessage = (event) => this._receive(event.data);
    this.worker.onerror = (event) =>
      this._fail(new Error(event.message || 'Detection worker failed'));
    this.readyPromise = this._request('initialize', { options }).catch((error) => {
      this.dispose();
      throw error;
    });
    return this.readyPromise;
  }

  detect(frame, context = {}) {
    if (!this.worker || !this.readyPromise)
      return Promise.reject(new Error('Detection worker is not initialized'));
    if (this.activeFrame !== null) return Promise.reject(new Error('Detection worker is busy'));
    const id = ++this.nextId;
    this.activeFrame = id;
    return this._request('detect', { frame, context }, id);
  }

  cancelPending() {
    const id = this.activeFrame;
    const pending = this.requests.get(id);
    if (!pending) return;
    pending.cancelled = true;
    pending.reject(new DOMException('Camera operation cancelled', 'AbortError'));
    // Keep the bounded slot occupied until the worker acknowledges/completes it.
    this.worker?.postMessage({ protocol: PROTOCOL, type: 'cancel', id });
  }

  _request(type, payload, id = ++this.nextId) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => this._fail(new Error(`Detection worker ${type} timed out`)),
        this.timeoutMs,
      );
      this.requests.set(id, { resolve, reject, timer, cancelled: false });
      try {
        this.worker.postMessage({ protocol: PROTOCOL, type, id, ...payload });
      } catch (error) {
        this._fail(error);
      }
    });
  }

  _receive(message) {
    if (message?.protocol !== PROTOCOL) return;
    if (message.type === 'state') {
      if (this.requests.has(message.id)) this.onState(message.state);
      return;
    }
    const pending = this.requests.get(message.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.requests.delete(message.id);
    if (this.activeFrame === message.id) this.activeFrame = null;
    if (pending.cancelled) return;
    if (message.error) pending.reject(new Error(message.error));
    else pending.resolve(message.result);
  }

  _fail(error) {
    for (const pending of this.requests.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.requests.clear();
    this.activeFrame = null;
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
    this.onState('FAILED');
  }

  dispose() {
    this._fail(new DOMException('Detection infrastructure disposed', 'AbortError'));
  }
}
