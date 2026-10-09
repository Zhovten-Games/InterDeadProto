import FrameworkBridge from '../../host-integration/framework/framework-bridge.js';
import composeApplication from '../composition/compose-application.js';

/** Public lifecycle boundary. The entry point does not own a second boot graph. */
export default class ApplicationBootstrap {
  constructor({
    compose = composeApplication,
    windowRef = globalThis.window,
    documentRef = globalThis.document,
    bridgeFactory = (options) => new FrameworkBridge(options),
  } = {}) {
    this.compose = compose;
    this.windowRef = windowRef;
    this.documentRef = documentRef;
    this.bridgeFactory = bridgeFactory;
    this.generation = 0;
    this._unload = () => {
      this.dispose().catch((error) => console.error(error));
    };
  }
  start() {
    if (this._startPromise) return this._startPromise;
    if (this.ready) return Promise.resolve();
    const generation = this.generation;
    this._startPromise = this._start(generation).finally(() => {
      this._startPromise = null;
    });
    return this._startPromise;
  }
  async _start(generation) {
    if (!this.windowRef || !this.documentRef) throw new Error('Browser document required');
    this.context ||= this.compose();
    const { container } = this.context;
    const mode = container.resolve('EmbeddingModeResolver').resolve().mode;
    this.bootstrapper = container.resolve(
      mode === 'launcher' ? 'LauncherBootstrapper' : 'FullAppBootstrapper',
    );
    this.bridge ||= this.bridgeFactory({
      windowRef: this.windowRef,
      documentRef: this.documentRef,
      persistence: container.resolve('IPersistence'),
    });
    this.windowRef.addEventListener('beforeunload', this._unload);
    try {
      await this.bootstrapper.boot();
      if (generation !== this.generation) return;
      this.bridge.boot();
      this.ready = true;
    } catch (error) {
      await this.dispose();
      throw error;
    }
  }
  async dispose() {
    this.generation++;
    this.windowRef?.removeEventListener('beforeunload', this._unload);
    this.bridge?.dispose();
    await this.bootstrapper?.dispose();
    this.ready = false;
  }
}
