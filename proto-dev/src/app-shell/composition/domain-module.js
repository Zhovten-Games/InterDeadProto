import DualityManager from '../../narrative-runtime/sequence/duality-manager.js';
import DialogManager from '../../narrative-runtime/dialog/dialog-manager.js';
import Dialog from '../../narrative-runtime/dialog/dialog.js';

/**
 * Registers domain-level coordinators and aggregates.
 */
export default class DomainModule {
  /**
   * @param {{ container: import('./container.js').default, config: any }} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Bind domain collaborators into the container.
   */
  register() {
    const { container } = this.context;

    container.register(
      'DualityManager',
      () =>
        new DualityManager(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('Logging'),
        ),
      { priority: 140 },
    );

    container.register(
      'DialogManager',
      () =>
        new DialogManager(
          new Dialog([]),
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          null,
          container.resolve('Logger'),
          container.resolve('DialogTimeline'),
        ),
      { priority: 141 },
    );
  }
}
