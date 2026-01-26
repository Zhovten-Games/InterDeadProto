import Container from '../container/Container.js';
import BootManager from './BootManager.js';
import config, { spiritConfigs } from '../../config/index.js';
import InfrastructureModule from './modules/InfrastructureModule.js';
import DomainModule from './modules/DomainModule.js';
import ApplicationModule from './modules/ApplicationModule.js';
import PresentationModule from './modules/PresentationModule.js';

/**
 * Compose the application container by registering infrastructure, domain, application, and presentation modules.
 * @returns {{ container: import('../container/Container.js').default, bootManager: BootManager, eventBus: import('../../ports/IEventBus.js').default }}
 */
export default function composeApplication() {
  const container = new Container();
  const context = { container, config, spiritConfigs };

  new InfrastructureModule(context).register();
  new DomainModule(context).register();
  new ApplicationModule(context).register();
  new PresentationModule(context).register();

  const bootManager = new BootManager(
    container,
    container.resolve('IEventBus'),
    container.resolve('Logging')
  );
  container.register('BootManager', () => bootManager, { priority: 0 });

  return {
    container,
    bootManager,
    eventBus: container.resolve('IEventBus'),
  };
}
