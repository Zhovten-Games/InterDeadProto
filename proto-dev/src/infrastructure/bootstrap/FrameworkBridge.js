import { FrameworkRuntime, JsObjectConfigSourceAdapter } from '@interdead/framework';

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
          interactionSelectors: ['button', '[data-action]', '[data-choice]'],
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
