import Logger from './Logger.js';

const NULL_BUS = {
  emit: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
};

/**
 * Loader emits overlay events during application boot.
 * It no longer touches the DOM directly; instead, a view
 * module listens for emitted events and updates the UI.
 *
 * Multi-tab detection:
 * 1) Primary (when persistence works): localStorage heartbeat lock ("activeTab") + loading marker ("appLoading").
 * 2) Fallback (when persistence is blocked/restricted, common in embeds): BroadcastChannel leader handshake.
 */
export default class Loader {
  /**
   * @param {Logger} logger Logging adapter.
   * @param {import('../../ports/IPersistence.js').default|null} persistence Persistence adapter.
   * @param {import('../../ports/IEventBus.js').default} bus Event bus.
   */
  constructor(logger, persistence, bus = NULL_BUS) {
    this.logger = logger;
    this.storage = persistence;
    this.bus = bus;

    this.timeout = 5000;
    this.heartbeatInterval = 1000;

    this.channel = new BroadcastChannel('app-loading');
    this.tabId = this._getOrCreateTabId();

    // Boot lifecycle guard (prevents double boot inside the same tab/app instance).
    this.bootState = 'idle'; // 'idle' | 'booting' | 'booted'

    // LocalStorage-based heartbeat (when persistence works).
    this.heartbeat = null;

    // BroadcastChannel-based leadership (fallback when persistence is unavailable).
    this.bcHeartbeat = null;
    this.isLeader = false;

    this.unloadHandlerRegistered = false;
    this.bootHandler = null;

    // Probe whether persistence actually works (embed/privacy modes may silently break it).
    this.storageOk = this._probePersistence();

    // BroadcastChannel message handler: accept both legacy string messages and structured messages.
    this.channel.addEventListener('message', e => {
      const msg = e?.data;

      // Legacy protocol support (older tabs may send plain strings).
      if (msg === 'start') {
        // Never write to storage here (it creates false positives when storage is blocked).
        // Only show "already open" if we are NOT the active tab.
        if (this.storageOk && !this._isMyTabActive()) {
          this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
        }
        return;
      }
      if (msg === 'done') {
        if (this.storageOk && !this._isMyTabActive()) {
          this.bus.emit({ type: 'OVERLAY_HIDE' });
        }
        return;
      }

      // Structured protocol
      if (!msg || typeof msg !== 'object') return;
      if (msg.tabId && msg.tabId === this.tabId) return; // ignore own messages

      if (msg.type === 'LEADER_PING') {
        if (this.isLeader || (this.storageOk && this._isMyTabActive())) {
          this.channel.postMessage({ type: 'LEADER_ACK', tabId: this.tabId });
        }
        return;
      }

      if (msg.type === 'LEADER_ACK') {
        // Handled in _detectForeignLeader() with a temporary listener.
        return;
      }

      if (msg.type === 'BOOT_START') {
        // Optional UX: another tab started booting.
        if (!this._isMyTabActive()) {
          this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
        }
        return;
      }

      if (msg.type === 'BOOT_DONE') {
        // Optional UX: another tab finished booting.
        if (!this._isMyTabActive()) {
          this.bus.emit({ type: 'OVERLAY_HIDE' });
        }
      }
    });

    // Storage events only make sense when persistence is actually working.
    window.addEventListener('storage', e => {
      if (!this.storageOk) return;

      if (e.key === 'activeTab') {
        this._handleStorageOverlayUpdate(e.newValue);
        return;
      }

      if (e.key === 'appLoading') {
        if (!e.newValue) {
          this.bus.emit({ type: 'OVERLAY_HIDE' });
          return;
        }
        const state = this._parseState(e.newValue);
        if (!this._isStateFresh(state)) {
          this._clearLoadingState();
          this.bus.emit({ type: 'OVERLAY_HIDE' });
          return;
        }
        // Show only when another tab is the active one.
        if (!this._isMyTabActive()) {
          this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
        }
      }
    });
  }

  async load(bootFn) {
    // Idempotency: prevent repeated bootstrap inside the same tab/app instance.
    if (this.bootState === 'booting' || this.bootState === 'booted') {
      return;
    }
    this.bootState = 'booting';

    try {
      // 1) Decide whether we should boot or show "already open".
      if (!this.storageOk) {
        const foreignLeader = await this._detectForeignLeader();
        if (foreignLeader) {
          this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
          this.bootState = 'idle';
          return;
        }
        // Become leader (fallback mode).
        this._startBroadcastHeartbeat();
      } else {
        // Clean stale states proactively (supports "storage not cleared" situations).
        const active = this._getActiveTabState(); // removes stale on read
        const loading = this._getLoadingState();  // removes stale on read

        // Another active tab OR another loading tab => block.
        if ((active && active.value !== this.tabId) || loading) {
          this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
          this.bootState = 'idle';
          return;
        }

        // Claim leadership via localStorage heartbeat.
        this._startStorageHeartbeat();
      }

      this._registerUnloadHandler();

      // 2) Boot overlay.
      this._markLoadingInProgress();
      // Notify other contexts (both legacy + structured).
      this.channel.postMessage('start');
      this.channel.postMessage({ type: 'BOOT_START', tabId: this.tabId });

      this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'loading' });

      // 3) Subscribe to boot progress events.
      const handler = evt => {
        if (evt.type === 'BOOT_COMPLETE') {
          this.bus.unsubscribe(handler);
          if (this.bootHandler === handler) this.bootHandler = null;

          this.bus.emit({ type: 'OVERLAY_HIDE' });
          this._clearLoadingState();

          // Notify other contexts (both legacy + structured).
          this.channel.postMessage('done');
          this.channel.postMessage({ type: 'BOOT_DONE', tabId: this.tabId });

          this.bootState = 'booted';
        }
      };

      this.bootHandler = handler;
      this.bus.subscribe(handler);

      // 4) Execute boot function.
      if (bootFn) {
        return await bootFn();
      }
      return undefined;
    } catch (err) {
      this._handleBootFailure(err);
      this.bootState = 'idle';
      return undefined;
    }
  }

  /* ------------------------- Persistence probe ------------------------- */

  _probePersistence() {
    try {
      if (!this.storage?.save || !this.storage?.load || !this.storage?.remove) return false;
      const key = '__interdead_probe__';
      const value = { value: 'ok', timestamp: Date.now() };
      this.storage.save(key, value);
      const read = this.storage.load(key);
      this.storage.remove(key);
      return !!read && typeof read === 'object' && read.value === 'ok';
    } catch {
      return false;
    }
  }

  /* ------------------------- Leader detection (BroadcastChannel fallback) ------------------------- */

  async _detectForeignLeader() {
    // Ask any leader to respond quickly.
    return new Promise(resolve => {
      let done = false;

      const cleanup = result => {
        if (done) return;
        done = true;
        this.channel.removeEventListener('message', onMsg);
        resolve(result);
      };

      const onMsg = e => {
        const msg = e?.data;
        if (!msg || typeof msg !== 'object') return;
        if (msg.tabId && msg.tabId === this.tabId) return;
        if (msg.type === 'LEADER_ACK') {
          cleanup(true);
        }
      };

      this.channel.addEventListener('message', onMsg);
      this.channel.postMessage({ type: 'LEADER_PING', tabId: this.tabId });

      // If nobody answers quickly, we assume no leader exists.
      setTimeout(() => cleanup(false), 250);
    });
  }

  _startBroadcastHeartbeat() {
    this.isLeader = true;
    this.bcHeartbeat = setInterval(() => {
      // Heartbeat is optional here; leadership is primarily established by handshakes.
      // Keeping it can help other contexts decide UX (if needed later).
      this.channel.postMessage({ type: 'LEADER_HEARTBEAT', tabId: this.tabId });
    }, this.heartbeatInterval);
  }

  _stopBroadcastHeartbeat() {
    if (this.bcHeartbeat) clearInterval(this.bcHeartbeat);
    this.bcHeartbeat = null;
    this.isLeader = false;
  }

  /* ------------------------- LocalStorage lock (primary path) ------------------------- */

  _getActiveTabState() {
    return this._readFreshState('activeTab');
  }

  _isMyTabActive() {
    if (!this.storageOk) return false;
    const s = this._getActiveTabState();
    return !!s && s.value === this.tabId;
  }

  _startStorageHeartbeat() {
    this._refreshActiveTab();
    this.heartbeat = setInterval(() => this._refreshActiveTab(), this.heartbeatInterval);
  }

  _stopStorageHeartbeat() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  _getLoadingState() {
    return this._readFreshState('appLoading');
  }

  _refreshActiveTab() {
    this._writeState('activeTab', this.tabId);
  }

  _markLoadingInProgress() {
    this._writeState('appLoading', `boot:${this.tabId}`);
  }

  _clearLoadingState() {
    this.storage?.remove('appLoading');
  }

  _clearActiveTab() {
    this.storage?.remove('activeTab');
  }

  _readFreshState(key) {
    if (!this.storageOk) return null;

    const state = this.storage?.load(key);
    if (this._isStateFresh(state)) return state;

    if (state) this.storage?.remove(key);
    return null;
  }

  _writeState(key, value) {
    if (!this.storageOk) return;
    this.storage?.save(key, { value, timestamp: Date.now() });
  }

  _isStateFresh(state) {
    if (!state || typeof state !== 'object' || !('timestamp' in state)) return false;
    return Date.now() - state.timestamp <= this.timeout;
  }

  _parseState(raw) {
    if (!raw) return null;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }

  _handleStorageOverlayUpdate(newValue) {
    if (!newValue) {
      this.bus.emit({ type: 'OVERLAY_HIDE' });
      return;
    }
    const state = this._parseState(newValue);
    if (this._isStateFresh(state)) {
      // Show only if the active tab is NOT us.
      if (!this._isMyTabActive()) {
        this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
      }
      return;
    }
    this.storage?.remove('activeTab');
    this.bus.emit({ type: 'OVERLAY_HIDE' });
  }

  /* ------------------------- Unload + failure handling ------------------------- */

  _registerUnloadHandler() {
    if (this.unloadHandlerRegistered) return;
    this.unloadHandlerRegistered = true;

    const cleanup = () => {
      this._stopStorageHeartbeat();
      this._stopBroadcastHeartbeat();

      this._clearLoadingState();
      if (this.storageOk) this._clearActiveTab();

      // Notify other contexts (both legacy + structured).
      this.channel.postMessage('done');
      this.channel.postMessage({ type: 'BOOT_DONE', tabId: this.tabId });
    };

    // pagehide is more reliable than beforeunload in modern browsers (bfcache/embeds).
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);
  }

  _handleBootFailure(err) {
    const message = err?.message
      ? `Boot failed, clearing loading state: ${err.message}`
      : 'Boot failed, clearing loading state.';
    this.logger?.error?.(message);

    this._stopStorageHeartbeat();
    this._stopBroadcastHeartbeat();

    this._clearLoadingState();
    if (this.storageOk) this._clearActiveTab();

    if (this.bootHandler) {
      this.bus.unsubscribe(this.bootHandler);
      this.bootHandler = null;
    }

    this.bus.emit({ type: 'OVERLAY_HIDE' });

    // Notify other contexts (both legacy + structured).
    this.channel.postMessage('done');
    this.channel.postMessage({ type: 'BOOT_DONE', tabId: this.tabId });
  }

  /* ------------------------- Tab id ------------------------- */

  _getOrCreateTabId() {
    // Persist tabId for the lifetime of the tab to avoid false positives on reload.
    const key = 'interdead_tab_id';
    try {
      if (typeof sessionStorage !== 'undefined') {
        const existing = sessionStorage.getItem(key);
        if (existing) return existing;
        const created = this._createTabId();
        sessionStorage.setItem(key, created);
        return created;
      }
    } catch {
      // Ignore sessionStorage restrictions and fallback to volatile id.
    }
    return this._createTabId();
  }

  _createTabId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
