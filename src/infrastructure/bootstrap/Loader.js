import Logger from './Logger.js';
import moduleAliases from '../../config/loaderModules.config.js';

const NULL_BUS = {
  emit: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
};

/**
 * Loader emits overlay events during application boot.
 * It no longer touches the DOM directly; instead, a view
 * module listens for emitted events and updates the UI.
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
    this.channel = new BroadcastChannel('app-loading');
    this.tabId = this._createTabId();

    this.timeout = 5000;
    this.heartbeatInterval = 1000;
    this.heartbeat = null;

    this.channel.addEventListener('message', e => {
      if (e.data === 'start') {
        this._markLoadingInProgress();
        if (!this._getActiveTab()) {
          this.bus.emit({
            type: 'OVERLAY_SHOW',
            i18nKey: 'app_already_open'
          });
        }
      } else if (e.data === 'done') {
        this._clearLoadingState();
        if (!this._getActiveTab()) {
          this.bus.emit({ type: 'OVERLAY_HIDE' });
        }
      }
    });

    window.addEventListener('storage', e => {
      if (e.key === 'activeTab') {
        this._handleStorageOverlayUpdate(e.newValue);
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
        if (!this._getActiveTab()) {
          this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
        }
      }
    });
  }

  async load(bootFn) {
    if (this._getActiveTab() || this._getLoadingState()) {
      this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
      return;
    }

    this._refreshActiveTab();
    this.heartbeat = setInterval(() => this._refreshActiveTab(), this.heartbeatInterval);
    window.addEventListener('beforeunload', () => {
      clearInterval(this.heartbeat);
      this.storage?.remove('activeTab');
      this._clearLoadingState();
      this.channel.postMessage('done');
    });
    this._markLoadingInProgress();
    this.channel.postMessage('start');
    this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'loading' });

    const handler = evt => {
      if (evt.type === 'BOOT_STEP') {
        const key = moduleAliases[evt.name];
        if (key) {
          this.bus.emit({ type: 'OVERLAY_STEP', i18nKey: key });
        }
      } else if (evt.type === 'BOOT_COMPLETE') {
        this.bus.unsubscribe(handler);
        this.bus.emit({ type: 'OVERLAY_HIDE' });
        this._clearLoadingState();
        this.channel.postMessage('done');
      }
    };
    this.bus.subscribe(handler);

    if (bootFn) {
      try {
        return await bootFn();
      } catch (err) {
        this.logger.error(err.message);
      }
    }
  }

  _getActiveTab() {
    return this._readFreshState('activeTab');
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

  _readFreshState(key) {
    const state = this.storage?.load(key);
    if (this._isStateFresh(state)) {
      return state;
    }
    if (state) {
      this.storage?.remove(key);
    }
    return null;
  }

  _writeState(key, value) {
    this.storage?.save(key, { value, timestamp: Date.now() });
  }

  _isStateFresh(state) {
    if (!state || typeof state !== 'object' || !('timestamp' in state)) {
      return false;
    }
    return Date.now() - state.timestamp <= this.timeout;
  }

  _parseState(raw) {
    if (!raw) {
      return null;
    }
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
      this.bus.emit({ type: 'OVERLAY_SHOW', i18nKey: 'app_already_open' });
      return;
    }
    this.storage?.remove('activeTab');
    this.bus.emit({ type: 'OVERLAY_HIDE' });
  }

  _createTabId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

