export default class AuthVisibilityAdapter {
  constructor({ windowRef = null, logger = console } = {}) {
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
    this.logger = logger || console;
    this.port = null;
    this.snapshot = null;
    this._listeners = new Set();
    this._portUnsubscribe = null;
    this._handlePortsReady = evt => this._bindFromPorts(evt?.detail?.ports);
  }

  boot() {
    this._bindFromPorts(this._getPorts());
    if (this.windowRef) {
      this.windowRef.addEventListener('interdead:ports-ready', this._handlePortsReady);
    }
  }

  dispose() {
    if (this.windowRef) {
      this.windowRef.removeEventListener('interdead:ports-ready', this._handlePortsReady);
    }
    this._portUnsubscribe?.();
    this._portUnsubscribe = null;
    this._listeners.clear();
  }

  hasPort() {
    return Boolean(this.port);
  }

  getSnapshot() {
    if (this.port?.getSnapshot) {
      try {
        return this.port.getSnapshot();
      } catch (err) {
        this.logger?.warn?.('[InterDead][Embed] Failed to read auth snapshot', err);
      }
    }
    return this.snapshot;
  }

  isAuthenticated() {
    const snapshot = this.getSnapshot();
    return snapshot?.status === 'authenticated';
  }

  onChange(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _getPorts() {
    if (!this.windowRef) return null;
    const direct = this.windowRef.InterdeadPorts || null;
    if (direct) return direct;
    return this._getParentPorts();
  }

  _getParentPorts() {
    if (!this.windowRef || this.windowRef.parent === this.windowRef) return null;
    try {
      return this.windowRef.parent?.InterdeadPorts || null;
    } catch (err) {
      this.logger?.warn?.('[InterDead][Embed] Unable to access parent ports', err);
      return null;
    }
  }

  _bindFromPorts(ports) {
    const nextPort = ports?.authVisibility || null;
    if (nextPort === this.port) return;
    this._portUnsubscribe?.();
    this._portUnsubscribe = null;
    this.port = nextPort;
    if (!this.port) {
      this.logger?.info?.('[InterDead][Embed] Auth visibility port missing');
      this._emit(this.snapshot);
      return;
    }
    this.logger?.info?.('[InterDead][Embed] Auth visibility port connected');
    this.snapshot = this.port.getSnapshot?.() || null;
    this._emit(this.snapshot);
    if (this.port.onChange) {
      this._portUnsubscribe = this.port.onChange(snapshot => {
        this.snapshot = snapshot;
        this._emit(snapshot);
      });
    }
  }

  _emit(snapshot) {
    this._listeners.forEach(listener => listener(snapshot));
  }
}
