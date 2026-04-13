import { FrameworkRuntime, JsObjectConfigSourceAdapter } from '@interdead/framework';
import {
  PROFILE_UI_PREFERENCES_KEY,
  normalizeProfileUiPreferences,
} from '../../config/profileUiPreferences.config.js';

const INTERDEAD_PROTO_MEMBRANE_COLOR = '#e53935';

const BOTTOM_PANEL_INTERACTION_SELECTORS = [
  '.panel__bottom .control-button',
  '.panel__bottom .panel__scroll-button',
  '.panel__bottom .panel__bottom-button',
  '.panel__bottom [data-action]',
  '.panel__bottom [data-choice]',
];

export default class FrameworkBridge {
  constructor({
    windowRef = window,
    documentRef = document,
    logger = console,
    persistence = null,
  } = {}) {
    this.windowRef = windowRef;
    this.documentRef = documentRef;
    this.logger = logger;
    this.runtime = null;
    this.persistence = persistence;
    this.delegatedSelector = BOTTOM_PANEL_INTERACTION_SELECTORS.join(', ');
    this.boundDelegatedPointerHandler = (event) => this.handleDelegatedInteraction(event);
    this.boundDelegatedFocusHandler = (event) => this.handleDelegatedInteraction(event);
    this.boundDelegatedClickHandler = (event) => this.handleDelegatedInteraction(event);
    this.boundDelegatedTouchHandler = (event) => this.handleDelegatedInteraction(event);
    this.boundPreferencesHandler = (event) => this.applyMembranePreferences(event?.detail || {});
    this.preferences = normalizeProfileUiPreferences();
  }

  boot() {
    const configSource = new JsObjectConfigSourceAdapter({
      enabledFeatures: { membrane: true },
      featureOptions: {
        membrane: {
          canvasClassName: 'proto-membrane-canvas',
          activeBodyClass: 'proto-membrane-active',
          interactionSelectors: BOTTOM_PANEL_INTERACTION_SELECTORS,
          lineColor: INTERDEAD_PROTO_MEMBRANE_COLOR,
          pulseColor: INTERDEAD_PROTO_MEMBRANE_COLOR,
          reducedMotionMode: 'minimal',
        },
      },
    });

    this.runtime = new FrameworkRuntime(configSource, {
      windowRef: this.windowRef,
      documentRef: this.documentRef,
    });

    this.runtime.boot();
    this.bindDelegatedInteractions();
    this.applyMembranePreferences(this.loadPreferences());
    this.logger.info(
      '[InterDead][Proto][FrameworkBridge] Framework runtime booted from JS adapter.',
    );
  }

  dispose() {
    this.unbindDelegatedInteractions();
    this.documentRef.removeEventListener(
      'interdead:membrane-settings-updated',
      this.boundPreferencesHandler,
    );
    this.runtime?.destroy?.();
    this.runtime = null;
  }

  bindDelegatedInteractions() {
    this.documentRef.addEventListener('mouseover', this.boundDelegatedPointerHandler);
    this.documentRef.addEventListener('focusin', this.boundDelegatedFocusHandler);
    this.documentRef.addEventListener('click', this.boundDelegatedClickHandler);
    this.documentRef.addEventListener('touchstart', this.boundDelegatedTouchHandler, {
      passive: true,
    });
    this.documentRef.addEventListener(
      'interdead:membrane-settings-updated',
      this.boundPreferencesHandler,
    );
  }

  unbindDelegatedInteractions() {
    this.documentRef.removeEventListener('mouseover', this.boundDelegatedPointerHandler);
    this.documentRef.removeEventListener('focusin', this.boundDelegatedFocusHandler);
    this.documentRef.removeEventListener('click', this.boundDelegatedClickHandler);
    this.documentRef.removeEventListener('touchstart', this.boundDelegatedTouchHandler);
  }

  handleDelegatedInteraction(event) {
    if (this.preferences.membraneDisabled) return;
    const type = event?.type || '';
    if ((type === 'mouseover' || type === 'focusin') && this.preferences.disableHoverPulse) {
      return;
    }
    const interactionTarget = event?.target?.closest?.(this.delegatedSelector);
    if (!interactionTarget) return;
    this.triggerMembranePulse(interactionTarget);
  }

  loadPreferences() {
    try {
      return normalizeProfileUiPreferences(this.persistence?.load?.(PROFILE_UI_PREFERENCES_KEY));
    } catch (err) {
      this.logger?.warn?.(
        `[InterDead][Proto][FrameworkBridge] Failed to load preferences: ${err?.message || err}`,
      );
      return normalizeProfileUiPreferences();
    }
  }

  applyMembranePreferences(next = {}) {
    this.preferences = normalizeProfileUiPreferences(next);
    this.persistence?.save?.(PROFILE_UI_PREFERENCES_KEY, this.preferences);
    const body = this.documentRef?.body;
    body?.classList?.toggle?.('proto-membrane-disabled', this.preferences.membraneDisabled);
  }

  triggerMembranePulse(node) {
    const membraneFeature = this.runtime?.features?.find?.(
      (feature) => feature?.key === 'membrane',
    );
    const renderer = membraneFeature?.renderer;
    if (!renderer || typeof renderer.triggerPulse !== 'function') {
      return;
    }

    const rect = node.getBoundingClientRect();
    const xRatio = (rect.left + rect.width * 0.5) / this.windowRef.innerWidth;
    const yRatio = (rect.top + rect.height * 0.5) / this.windowRef.innerHeight;
    renderer.triggerPulse(xRatio, yRatio);
    this.windowRef.dispatchEvent(
      new CustomEvent('interdead:membrane-pulse', {
        detail: {
          xRatio,
          yRatio,
          timestamp: this.windowRef.performance.now(),
        },
      }),
    );
  }
}
