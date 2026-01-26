import NullEventBus from '../../core/events/NullEventBus.js';
import { DIALOG_WIDGET_READY, EVENT_MESSAGE_READY } from '../../core/events/constants.js';

const SCREEN_CHANGE = 'SCREEN_CHANGE';

const HIDDEN_ICON_CLASS = 'dialog__reaction-trigger-icon--ghost-hidden';
const TRIGGER_CLASS = 'dialog__reaction-trigger--ghost-replay';
const DRUM_CLASS = 'panel__circle--ghost-replay';
const DRUM_TARGET_CLASS = 'panel__sector-emoji--ghost-target';
const DRUM_SCAN_CLASS = 'panel__sector-emoji--ghost-scan';
const GHOST_SPIN_DURATION_MS = 1350;
const REVEAL_DELAY_MS = 1450;
const SCAN_INTERVAL_MS = 180;
const MIN_SCAN_DURATION_MS = 500;
const MAX_SCAN_DURATION_MS = 1200;
const OVERLAY_FADE_MS = 240;
const OVERLAY_MESSAGES = {
  en: 'Spirit is choosing an emoji',
  ru: 'Дух выбирает эмоцию'
};

/**
 * Cosmetic helper that replays a "ghost" reaction when returning
 * to the messenger. Kept isolated from core dialog/panel logic.
 */
export default class GhostReactionReplayWidget {
  constructor({
    bus = new NullEventBus(),
    documentRef = typeof document !== 'undefined' ? document : null,
    windowRef = typeof window !== 'undefined' ? window : null,
    panelSelector = '[data-js="panel-controls"]',
    dialogSelector = '[data-js="dialog-list"]',
    screenService = null
  } = {}) {
    this.bus = bus;
    this.document = documentRef;
    this.window = windowRef;
    this.panelSelector = panelSelector;
    this.dialogSelector = dialogSelector;
    this.screenService = screenService;
    this._currentScreen = null;
    this._lastSystemReaction = null;
    this._pendingTimer = null;
    this._revealTimer = null;
    this._scanTimer = null;
    this._scanStopTimer = null;
    this._overlayTimer = null;
    this._activeIcon = null;
    this._activeTrigger = null;
    this._activeSector = null;
    this._overlayLabel = null;
    this._circleAnimationBackup = null;
    this._handler = this._handleEvent.bind(this);
  }

  boot() {
    this.bus?.subscribe(this._handler);
    this._currentScreen = this._resolveInitialScreen();
    if (this._currentScreen === 'messenger') {
      this._scheduleReplay();
    }
  }

  dispose() {
    this.bus?.unsubscribe(this._handler);
    this._clearTimers();
    this._teardownVisuals();
  }

  _handleEvent(evt) {
    if (!evt) return;
    if (evt.type === EVENT_MESSAGE_READY) {
      this._rememberSystemReaction(evt);
      return;
    }
    if (evt.type === SCREEN_CHANGE) {
      this._currentScreen = evt.screen || null;
      if (evt.screen === 'messenger') {
        this._scheduleReplay();
      } else {
        this._teardownVisuals();
      }
      return;
    }
    if (evt.type === DIALOG_WIDGET_READY && this._currentScreen === 'messenger') {
      this._scheduleReplay();
    }
  }

  _resolveInitialScreen() {
    const resolvedFromService = this.screenService?.getActive?.();
    if (resolvedFromService) return resolvedFromService;
    return this._isMessengerRendered() ? 'messenger' : null;
  }

  _isMessengerRendered() {
    if (!this.document) return false;
    const dialog = this.document.querySelector(this.dialogSelector);
    const panel = this.document.querySelector(this.panelSelector);
    return Boolean(dialog && panel);
  }

  _rememberSystemReaction(evt) {
    const reaction = this._normalizeReaction(evt);
    const origin = evt.origin || evt.reactionOrigin || null;
    const locked = evt.locked === true || evt.reactionLocked === true || origin === 'system';
    if (!reaction || !locked) return;
    const fingerprint = evt.fingerprint || evt.message?.fingerprint || null;
    const messageId = this._normalizeId(evt.messageId ?? evt.id ?? null);
    this._lastSystemReaction = { reaction, fingerprint, messageId };
  }

  _normalizeReaction(evt) {
    const raw =
      typeof evt.reaction === 'string'
        ? evt.reaction
        : typeof evt.emoji === 'string'
        ? evt.emoji
        : '';
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : '';
  }

  _normalizeId(value) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  _scheduleReplay() {
    this._clearTimers();
    const delay = typeof this.window?.setTimeout === 'function' ? this.window.setTimeout : setTimeout;
    this._pendingTimer = delay(() => this._runReplay(), 200);
  }

  _runReplay() {
    this._pendingTimer = null;
    if (this._currentScreen !== 'messenger') return;
    const dialog = this.document?.querySelector(this.dialogSelector);
    const panel = this.document?.querySelector(this.panelSelector);
    if (!dialog || !panel) return;
    const targetTrigger = this._findTargetTrigger(dialog);
    if (!targetTrigger) return;

    const icon = targetTrigger.querySelector('.dialog__reaction-trigger-icon');
    const emoji = icon?.textContent?.trim();
    if (!icon || !emoji) return;

    this._teardownVisuals();
    this._activeTrigger = targetTrigger;
    this._activeIcon = icon;

    this._showOverlay();
    targetTrigger.classList.add(TRIGGER_CLASS);
    icon.classList.add(HIDDEN_ICON_CLASS);
    this._highlightDrum(panel, emoji);

    const reveal = typeof this.window?.setTimeout === 'function' ? this.window.setTimeout : setTimeout;
    this._revealTimer = reveal(() => this._reveal(panel), REVEAL_DELAY_MS);
  }

  _findTargetTrigger(dialog) {
    const triggers = Array.from(
      dialog.querySelectorAll('.dialog__reaction-trigger[data-has-reaction="true"]')
    );
    if (!triggers.length) return null;
    if (this._lastSystemReaction) {
      const found = triggers.find(btn => {
        const fp = btn.dataset.fingerprint || null;
        const id = this._normalizeId(btn.dataset.messageId);
        return (
          (this._lastSystemReaction.fingerprint && fp === this._lastSystemReaction.fingerprint) ||
          (this._lastSystemReaction.messageId !== null && id === this._lastSystemReaction.messageId)
        );
      });
      if (found) return found;
    }
    return triggers[triggers.length - 1];
  }

  _highlightDrum(panel, emoji) {
    const circle = panel.querySelector('.panel__circle');
    if (!circle) return;
    this._circleAnimationBackup = {
      manual: circle.classList.contains('panel__circle--manual'),
      animation: circle.style.animation,
      playState: circle.style.animationPlayState,
    };
    circle.classList.remove('panel__circle--manual');
    circle.style.animationPlayState = 'running';
    circle.style.animation = `ghost-replay-spin ${GHOST_SPIN_DURATION_MS}ms linear 1`;
    // Force reflow to restart the spin even if a previous overlay paused it.
    void circle.offsetWidth; // eslint-disable-line no-unused-expressions
    circle.classList.add(DRUM_CLASS);
    const sectors = Array.from(panel.querySelectorAll('.panel__sector-emoji'));
    const target = sectors.find(node => node.textContent.trim() === emoji) || sectors[0] || null;
    this._startSectorScan(sectors, target);
  }

  _reveal(panel) {
    this._revealTimer = null;
    this._activeIcon?.classList.remove(HIDDEN_ICON_CLASS);
    this._activeTrigger?.classList.remove(TRIGGER_CLASS);
    this._clearDrum(panel);
    this._activeIcon = null;
    this._activeTrigger = null;
    this._hideOverlay();
  }

  _clearDrum(panel) {
    const container = panel || this.document?.querySelector(this.panelSelector);
    if (!container) return;
    this._stopSectorScan(container);
    const circle = container.querySelector('.panel__circle');
    if (circle) {
      circle.classList.remove(DRUM_CLASS);
      if (this._circleAnimationBackup?.manual) {
        circle.classList.add('panel__circle--manual');
      }
      circle.style.animation = this._circleAnimationBackup?.animation || '';
      circle.style.animationPlayState = this._circleAnimationBackup?.playState || 'paused';
    }
    container.querySelectorAll(`.${DRUM_TARGET_CLASS}`).forEach(node =>
      node.classList.remove(DRUM_TARGET_CLASS)
    );
    container.querySelectorAll(`.${DRUM_SCAN_CLASS}`).forEach(node =>
      node.classList.remove(DRUM_SCAN_CLASS)
    );
    this._circleAnimationBackup = null;
    this._activeSector = null;
  }

  _clearTimers() {
    this._clearOverlayTimer();
    this._stopSectorScan();
    if (this._pendingTimer) {
      clearTimeout(this._pendingTimer);
      this._pendingTimer = null;
    }
    if (this._revealTimer) {
      clearTimeout(this._revealTimer);
      this._revealTimer = null;
    }
  }

  _teardownVisuals() {
    this._clearTimers();
    this._activeIcon?.classList.remove(HIDDEN_ICON_CLASS);
    this._activeTrigger?.classList.remove(TRIGGER_CLASS);
    this._activeIcon = null;
    this._activeTrigger = null;
    this._hideOverlay(true);
    this._clearDrum();
  }

  _startSectorScan(sectors, target) {
    if (!sectors.length) return;
    this._stopSectorScan();
    let index = 0;
    this._scanTimer = setInterval(() => {
      const current = sectors[index % sectors.length];
      sectors.forEach(node => node.classList.remove(DRUM_SCAN_CLASS));
      current?.classList.add(DRUM_SCAN_CLASS);
      index += 1;
    }, SCAN_INTERVAL_MS);

    const duration = Math.min(
      Math.max(MIN_SCAN_DURATION_MS, REVEAL_DELAY_MS - 250),
      MAX_SCAN_DURATION_MS
    );
    const delay = typeof this.window?.setTimeout === 'function' ? this.window.setTimeout : setTimeout;
    this._scanStopTimer = delay(() => {
      this._stopSectorScan();
      this._applyTargetHighlight(target);
    }, duration);
  }

  _applyTargetHighlight(target) {
    if (!target) return;
    target.classList.add(DRUM_TARGET_CLASS);
    this._activeSector = target;
  }

  _stopSectorScan(container = this.document?.querySelector(this.panelSelector)) {
    if (this._scanTimer) {
      clearInterval(this._scanTimer);
      this._scanTimer = null;
    }
    if (this._scanStopTimer) {
      clearTimeout(this._scanStopTimer);
      this._scanStopTimer = null;
    }
    if (container) {
      container.querySelectorAll(`.${DRUM_SCAN_CLASS}`).forEach(node =>
        node.classList.remove(DRUM_SCAN_CLASS)
      );
    }
  }

  _showOverlay(message = this._getOverlayMessage()) {
    if (!this.document) return;
    const panel = this.document.querySelector(this.panelSelector);
    if (!panel) return;
    this._hideOverlay(true);
    const label = this.document.createElement('div');
    label.className = 'panel__ghost-overlay';
    label.textContent = message;
    panel.appendChild(label);
    this._overlayLabel = label;
    const reveal = () => label.classList.add('panel__ghost-overlay--visible');
    if (typeof this.window?.requestAnimationFrame === 'function') {
      this.window.requestAnimationFrame(reveal);
    } else {
      this._overlayTimer = setTimeout(reveal, 0);
    }
  }

  _hideOverlay(force = false) {
    this._clearOverlayTimer();
    if (!this._overlayLabel) return;
    const overlay = this._overlayLabel;
    if (force) {
      overlay.remove();
      this._overlayLabel = null;
      return;
    }
    overlay.classList.remove('panel__ghost-overlay--visible');
    const delay = typeof this.window?.setTimeout === 'function' ? this.window.setTimeout : setTimeout;
    this._overlayTimer = delay(() => {
      overlay.remove();
      this._overlayLabel = null;
      this._overlayTimer = null;
    }, OVERLAY_FADE_MS);
  }

  _clearOverlayTimer() {
    if (this._overlayTimer) {
      clearTimeout(this._overlayTimer);
      this._overlayTimer = null;
    }
  }

  _getOverlayMessage() {
    const lang =
      this.document?.documentElement?.lang?.toLowerCase() ||
      this.window?.navigator?.language?.toLowerCase() ||
      'en';
    const short = lang.slice(0, 2);
    return OVERLAY_MESSAGES[short] || OVERLAY_MESSAGES.en;
  }
}
