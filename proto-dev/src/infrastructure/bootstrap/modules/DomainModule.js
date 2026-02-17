import DualityManager from '../../../core/sequence/DualityManager.js';
import DialogManager from '../../../core/dialog/DialogManager.js';
import Dialog from '../../../core/dialog/Dialog.js';

/**
 * Registers domain-level coordinators and aggregates.
 */
export default class DomainModule {
  /**
   * @param {{ container: import('../../container/Container.js').default, config: any }} context
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
          container.resolve('Logging')
        ),
      { priority: 140 }
    );

    container.register(
      'DialogManager',
      () =>
        new DialogManager(
          new Dialog([]),
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          null,
          container.resolve('Logger')
        ),
      { priority: 141 }
    );
  }
}
