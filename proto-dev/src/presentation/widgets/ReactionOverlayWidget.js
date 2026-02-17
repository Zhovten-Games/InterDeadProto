import NullEventBus from '../../core/events/NullEventBus.js';
import {
  DIALOG_CLEAR,
  REACTION_OVERLAY_REQUESTED,
  REACTION_SELECTED
} from '../../core/events/constants.js';

const DEFAULT_COUNTDOWN_MS = 6000;
const DEFAULT_RESUME_DELAY_MS = 1000;
const DEFAULT_ROTATION_SPEED = 90; // degrees per second while overlay is active.

/**
 * Controls the emoji drum overlay, countdown and manual rotation handling.
 */
export default class ReactionOverlayWidget {
  constructor({
    panelSelector = '[data-js="panel-controls"]',
    dialogSelector = '[data-js="dialog-list"]',
    circleSelector = '.panel__circle',
    badgeSelector = '[data-js="reaction-badge"]',
    emojiSelector = '.panel__sector-emoji',
    countdownSelector = '.panel__selection-badge-countdown',
    overlayClass = 'reaction-overlay',
    countdownMs = DEFAULT_COUNTDOWN_MS,
    resumeDelayMs = DEFAULT_RESUME_DELAY_MS,
    rotationSpeed = DEFAULT_ROTATION_SPEED,
    bus = new NullEventBus(),
    documentRef = typeof document !== 'undefined' ? document : null,
    windowRef = typeof window !== 'undefined' ? window : null
  } = {}) {
    this.bus = bus;
    this.document = documentRef;
    this.window = windowRef;
    this.config = {
      panelSelector,
      dialogSelector,
      circleSelector,
      badgeSelector,
      emojiSelector,
      countdownSelector,
      overlayClass,
      overlayVisibleClass: `${overlayClass}--visible`,
      countdownMs,
      resumeDelayMs,
      rotationSpeed
    };

    this._panel = null;
    this._circle = null;
    this._badge = null;
    this._countdownNode = null;
    this._overlayNode = null;
    this._messageNode = null;
    this._activeEmoji = null;

    this._state = {
      active: false,
      request: null,
      deadline: 0,
      resumeAt: 0,
      animationDuration: 40,
      committed: false,
      locked: false,
      targetReaction: null,
      origin: null,
      auto: false
    };

    this._currentAngle = 0;
    this._lastTick = null;
    this._raf = null;
    this._isDragging = false;
    this._dragPointerId = null;
    this._dragOffset = 0;
    this._badgeBound = false;

    this._handler = this._handleEvent.bind(this);
    this._onBadgeClick = this._handleBadgeClick.bind(this);
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerMove = this._handlePointerMove.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._tickRef = this._tick.bind(this);
  }

  boot() {
    this.bus?.subscribe(this._handler);
  }

  dispose() {
    this.bus?.unsubscribe(this._handler);
    this._teardownOverlay();
  }

  _handleEvent(evt) {
    if (!evt) return;
    if (evt.type === REACTION_OVERLAY_REQUESTED) {
      if (this._state.active) {
        this._teardownOverlay();
      }
      if (this._ensureElements()) {
        this._activateOverlay(evt);
      }
      return;
    }
    if (evt.type === REACTION_SELECTED) {
      if (this._state.active && this._matchesRequest(evt)) {
        this._teardownOverlay();
      }
      return;
    }
    if (evt.type === DIALOG_CLEAR) {
      this._teardownOverlay();
    }
  }

  _ensureElements() {
    if (!this.document) return false;
    const panel = this.document.querySelector(this.config.panelSelector);
    if (!panel) return false;
    if (panel !== this._panel) {
      this._panel = panel;
      this._circle = panel.querySelector(this.config.circleSelector);
      this._badge = panel.querySelector(this.config.badgeSelector);
      this._countdownNode = this._badge?.querySelector(this.config.countdownSelector) || null;
      this._badgeBound = false;
    }
    return Boolean(this._panel && this._circle && this._badge);
  }

  _activateOverlay(request) {
    const locked = request?.locked === true;
    const targetReaction =
      typeof request?.reaction === 'string' && request.reaction.trim() !== ''
        ? request.reaction
        : null;
    this._state = {
      active: true,
      request: { ...request },
      deadline: this._now() + this.config.countdownMs,
      resumeAt: this._now(),
      animationDuration: this._readRotationDuration(),
      committed: false,
      locked,
      targetReaction,
      origin: request?.origin || null,
      auto: request?.auto === true || locked
    };
    this._currentAngle = this._extractCurrentAngle();
    this._lastTick = null;
    this._isDragging = false;
    this._dragPointerId = null;
    this._dragOffset = 0;

    this._highlightMessage(request);
    this._showOverlay();
    this._prepareCircle();
    this._showBadge();
    if (!locked) {
      this._bindBadge();
      this._bindCircle();
    }
    this._updateActiveSlice();
    this._updateCountdown(this._now());
    this._startAnimationLoop();
  }

  _teardownOverlay() {
    if (!this._state.active) {
      this._cleanupVisuals();
      return;
    }
    this._state.active = false;
    this._state.request = null;
    this._stopAnimationLoop();
    this._cleanupVisuals();
  }

  _cleanupVisuals() {
    this._unbindCircle();
    this._unbindBadge();
    this._hideBadge();
    this._restoreCircle();
    this._removeOverlay();
    this._clearMessage();
    this._activeEmoji?.classList.remove('panel__sector-emoji--active');
    this._activeEmoji = null;
  }

  _highlightMessage(request) {
    if (!this.document) return;
    const dialog = this.document.querySelector(this.config.dialogSelector);
    if (!dialog) return;
    const triggers = Array.from(dialog.querySelectorAll('.dialog__reaction-trigger'));
    const match = triggers.find(btn => {
      if (!btn) return false;
      if (request.fingerprint && btn.dataset.fingerprint === request.fingerprint) {
        return true;
      }
      if (request.messageId != null) {
        const btnId = Number(btn.dataset.messageId);
        if (!Number.isNaN(btnId) && Number(request.messageId) === btnId) {
          return true;
        }
      }
      return false;
    });
    const message = match?.closest('.dialog__message');
    if (message) {
      message.classList.add('dialog__message--reaction-active');
      if (request?.locked) {
        message.classList.add('dialog__message--reaction-locked');
      }
      message.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    }
    this._messageNode = message || null;
  }

  _clearMessage() {
    if (this._messageNode) {
      this._messageNode.classList.remove('dialog__message--reaction-active');
      this._messageNode = null;
    }
  }

  _showOverlay() {
    if (!this.document || this._overlayNode) return;
    const overlay = this.document.createElement('div');
    overlay.className = this.config.overlayClass;
    this.document.body.appendChild(overlay);
    this._overlayNode = overlay;
    const frame = this.window?.requestAnimationFrame?.bind(this.window) ?? (cb => setTimeout(cb, 0));
    frame(() => {
      this._overlayNode?.classList.add(this.config.overlayVisibleClass);
    });
  }

  _removeOverlay() {
    if (!this._overlayNode) return;
    this._overlayNode.classList.remove(this.config.overlayVisibleClass);
    const node = this._overlayNode;
    this._overlayNode = null;
    const delay = this.window?.setTimeout?.bind(this.window) ?? setTimeout;
    delay(() => node.remove(), 200);
  }

  _prepareCircle() {
    if (!this._panel || !this._circle) return;
    this._panel.classList.add('panel--reaction-active');
    this._circle.classList.add('panel__circle--manual');
    this._circle.style.transform = `rotate(${this._currentAngle}deg)`;
  }

  _restoreCircle() {
    if (!this._panel || !this._circle) return;
    const duration = this._state.animationDuration;
    const normalized = this._normalizeAngle(this._currentAngle);
    this._circle.classList.remove('panel__circle--manual');
    this._circle.style.transform = '';
    if (Number.isFinite(duration) && duration > 0) {
      const delay = -(normalized / 360) * duration;
      this._circle.style.animationDelay = `${delay}s`;
    }
    this._panel.classList.remove('panel--reaction-active');
  }

  _showBadge() {
    if (!this._badge) return;
    this._badge.classList.remove('panel__selection-badge--hidden');
    this._badge.disabled = this._state.locked === true;
  }

  _hideBadge() {
    if (!this._badge) return;
    this._badge.classList.add('panel__selection-badge--hidden');
    this._badge.disabled = true;
    if (this._countdownNode) {
      this._countdownNode.textContent = '';
    }
  }

  _bindBadge() {
    if (!this._badge || this._badgeBound) return;
    this._badge.addEventListener('click', this._onBadgeClick);
    this._badgeBound = true;
  }

  _unbindBadge() {
    if (!this._badge || !this._badgeBound) return;
    this._badge.removeEventListener('click', this._onBadgeClick);
    this._badgeBound = false;
  }

  _bindCircle() {
    if (!this._circle) return;
    this._circle.addEventListener('pointerdown', this._onPointerDown);
  }

  _unbindCircle() {
    if (!this._circle) return;
    this._circle.removeEventListener('pointerdown', this._onPointerDown);
    this._unregisterPointerListeners();
  }

  _handleBadgeClick() {
    this._confirmSelection(false);
  }

  _handlePointerDown(evt) {
    if (!this._state.active || this._isDragging || this._state.locked) return;
    evt.preventDefault();
    this._isDragging = true;
    this._dragPointerId = evt.pointerId;
    const pointerAngle = this._getPointerAngle(evt);
    this._dragOffset = this._currentAngle - pointerAngle;
    this._state.resumeAt = this._now() + this.config.resumeDelayMs;
    this._registerPointerListeners();
    this._circle?.setPointerCapture?.(evt.pointerId);
  }

  _handlePointerMove(evt) {
    if (!this._isDragging || evt.pointerId !== this._dragPointerId) return;
    const pointerAngle = this._getPointerAngle(evt);
    this._currentAngle = pointerAngle + this._dragOffset;
    this._applyAngle();
    this._updateActiveSlice();
  }

  _handlePointerUp(evt) {
    if (evt.pointerId !== this._dragPointerId) return;
    this._circle?.releasePointerCapture?.(evt.pointerId);
    this._isDragging = false;
    this._dragPointerId = null;
    this._state.resumeAt = this._now() + this.config.resumeDelayMs;
    this._unregisterPointerListeners();
  }

  _registerPointerListeners() {
    if (!this.document) return;
    this.document.addEventListener('pointermove', this._onPointerMove);
    this.document.addEventListener('pointerup', this._onPointerUp);
    this.document.addEventListener('pointercancel', this._onPointerUp);
  }

  _unregisterPointerListeners() {
    if (!this.document) return;
    this.document.removeEventListener('pointermove', this._onPointerMove);
    this.document.removeEventListener('pointerup', this._onPointerUp);
    this.document.removeEventListener('pointercancel', this._onPointerUp);
  }

  _startAnimationLoop() {
    this._stopAnimationLoop();
    this._raf = this.window?.requestAnimationFrame?.(this._tickRef);
  }

  _stopAnimationLoop() {
    if (this._raf && this.window?.cancelAnimationFrame) {
      this.window.cancelAnimationFrame(this._raf);
    }
    this._raf = null;
    this._lastTick = null;
  }

  _tick(timestamp) {
    if (!this._state.active) return;
    if (this._lastTick === null) {
      this._lastTick = timestamp;
    }
    const delta = timestamp - this._lastTick;
    this._lastTick = timestamp;

    if (!this._isDragging && timestamp >= this._state.resumeAt) {
      this._currentAngle += (this.config.rotationSpeed * delta) / 1000;
    }

    this._applyAngle();
    this._updateActiveSlice();
    this._updateCountdown(timestamp);

    if (!this._state.committed && timestamp >= this._state.deadline) {
      this._state.committed = true;
      this._confirmSelection(true);
      return;
    }

    this._raf = this.window?.requestAnimationFrame?.(this._tickRef);
  }

  _applyAngle() {
    if (!this._circle) return;
    this._circle.style.transform = `rotate(${this._currentAngle}deg)`;
  }

  _updateActiveSlice() {
    if (!this._panel || !this._circle) return;
    const emojis = Array.from(this._panel.querySelectorAll(this.config.emojiSelector));
    if (!emojis.length) return;
    const sectorAngle = this._getSectorAngle(emojis.length);
    if (!Number.isFinite(sectorAngle) || sectorAngle <= 0) return;
    const baseIndex = this._getBaseIndex(emojis.length);
    const steps = Math.round(this._currentAngle / sectorAngle);
    const targetIndex = this._wrapIndex(baseIndex - steps, emojis.length);
    const candidate = emojis[targetIndex];
    if (candidate && candidate !== this._activeEmoji) {
      this._activeEmoji?.classList.remove('panel__sector-emoji--active');
      candidate.classList.add('panel__sector-emoji--active');
      this._activeEmoji = candidate;
    }
  }

  _updateCountdown(nowTs) {
    if (!this._countdownNode || !this._state.active) return;
    const remaining = Math.max(0, this._state.deadline - nowTs);
    const seconds = Math.ceil(remaining / 1000);
    this._countdownNode.textContent = String(seconds);
  }

  _confirmSelection(auto) {
    if (!this._state.active || (this._state.committed && !auto)) {
      return;
    }
    const emoji = this._state.locked
      ? this._state.targetReaction || this._activeEmoji?.textContent?.trim()
      : this._activeEmoji?.textContent?.trim();
    if (!emoji) {
      this._state.committed = false;
      return;
    }
    this._state.committed = true;
    const payload = {
      type: REACTION_SELECTED,
      reaction: emoji,
      messageId: this._state.request?.messageId ?? null,
      fingerprint: this._state.request?.fingerprint ?? null,
      stageId: this._state.request?.stageId ?? null,
      revision: this._state.request?.revision === true,
      auto: auto === true || this._state.auto === true,
      origin: this._state.origin || null
    };
    this.bus?.emit(payload);
    this._teardownOverlay();
  }

  _matchesRequest(evt) {
    const req = this._state.request;
    if (!req) return false;
    if (req.messageId != null && evt.messageId != null && Number(req.messageId) !== Number(evt.messageId)) {
      return false;
    }
    if (req.fingerprint && evt.fingerprint && req.fingerprint !== evt.fingerprint) {
      return false;
    }
    if (req.stageId && evt.stageId && req.stageId !== evt.stageId) {
      return false;
    }
    return true;
  }

  _extractCurrentAngle() {
    if (!this._circle || !this.window?.getComputedStyle) return 0;
    const style = this.window.getComputedStyle(this._circle);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === 'none') {
      return 0;
    }
    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
      const parts = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
      if (parts.length >= 2) {
        const angle = Math.atan2(parts[1], parts[0]) * (180 / Math.PI);
        return Number.isFinite(angle) ? angle : 0;
      }
    }
    const matrix3dMatch = transform.match(/matrix3d\(([^)]+)\)/);
    if (matrix3dMatch) {
      const parts = matrix3dMatch[1].split(',').map(v => parseFloat(v.trim()));
      if (parts.length >= 4) {
        const angle = Math.atan2(parts[1], parts[0]) * (180 / Math.PI);
        return Number.isFinite(angle) ? angle : 0;
      }
    }
    return 0;
  }

  _readRotationDuration() {
    if (!this._circle || !this.window?.getComputedStyle) {
      return 40;
    }
    const style = this.window.getComputedStyle(this._circle);
    const variable = style.getPropertyValue('--rotation-duration');
    if (variable) {
      const parsed = parseFloat(variable);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    const raw = style.animationDuration || '';
    if (raw) {
      const first = raw.split(',')[0];
      const parsed = parseFloat(first);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 40;
  }

  _normalizeAngle(angle) {
    let result = angle % 360;
    if (result < 0) {
      result += 360;
    }
    return result;
  }

  _getSectorAngle(count) {
    if (!count) return 0;
    const style = this.window?.getComputedStyle?.(this._circle);
    if (style) {
      const cssValue = style.getPropertyValue('--sector-angle');
      const parsed = parseFloat(cssValue);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 360 / count;
  }

  _getBaseIndex(count) {
    if (!count) return 0;
    return Math.floor(count / 2);
  }

  _wrapIndex(index, length) {
    if (!length) return 0;
    let value = index % length;
    if (value < 0) {
      value += length;
    }
    return value;
  }

  _getPointerAngle(evt) {
    if (!this._circle) return 0;
    const rect = this._circle.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = evt.clientX - cx;
    const dy = evt.clientY - cy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return Number.isFinite(angle) ? angle : 0;
  }

  _now() {
    return this.window?.performance?.now?.() ?? Date.now();
  }
}
