import { FrameworkRuntime, JsObjectConfigSourceAdapter } from '@interdead/framework';

const INTERDEAD_PROTO_MEMBRANE_COLOR = '#e53935';
const BOTTOM_PANEL_INTERACTION_SELECTORS = [
  '.panel__bottom .control-button',
  '.panel__bottom .panel__scroll-button',
  '.panel__bottom .panel__bottom-button',
  '.panel__bottom [data-action]',
  '.panel__bottom [data-choice]',
];

export default class FrameworkBridge {
  constructor({ windowRef = window, documentRef = document, logger = console } = {}) {
    this.windowRef = windowRef;
    this.documentRef = documentRef;
    this.logger = logger;
    this.runtime = null;
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
    this.logger.info(
      '[InterDead][Proto][FrameworkBridge] Framework runtime booted from JS adapter.',
    );
  }

  dispose() {
    this.runtime?.destroy?.();
    this.runtime = null;
  }
}
