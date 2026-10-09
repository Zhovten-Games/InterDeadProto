import Container from './container.js';
import BootManager from '../bootstrap/boot-manager.js';
import config, { spiritConfigs } from './configuration-index.js';
import InfrastructureModule from './infrastructure-module.js';
import DomainModule from './domain-module.js';
import ApplicationModule from './application-module.js';
import PresentationModule from './presentation-module.js';

/**
 * Compose the application container by registering infrastructure, domain, application, and presentation modules.
 * @returns {{ container: import('./container.js').default, bootManager: BootManager, eventBus: import('../../runtime-events/ports/event-bus-port.js').default }}
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
    container.resolve('Logging'),
  );
  container.register('BootManager', () => bootManager, { priority: 0, managed: false });

  return {
    container,
    bootManager,
    eventBus: container.resolve('IEventBus'),
  };
}
