import EventBusFactory from '../../factories/EventBusFactory.js';
import Logger from '../Logger.js';
import LoggingAdapter from '../../../adapters/logging/LoggingAdapter.js';
import ErrorManager from '../../../application/managers/ErrorManager.js';
import LocalStorageAdapter from '../../../adapters/persistence/LocalStorageAdapter.js';
import FetchConfigAdapter from '../../../adapters/config/FetchConfigAdapter.js';
import TemplateAdapter from '../../../adapters/ui/TemplateAdapter.js';
import LanguageAdapter from '../../../adapters/ui/LanguageAdapter.js';
import DatabaseAdapter from '../../../adapters/database/DatabaseAdapter.js';
import DBPublisher from '../../../adapters/database/DBPublisher.js';
import BrowserCryptoAdapter from '../../../adapters/encryption/BrowserCryptoAdapter.js';
import GeolocationAdapter from '../../../adapters/geo/GeolocationAdapter.js';
import CameraAdapter from '../../../adapters/camera/CameraAdapter.js';
import DetectionAdapter from '../../../adapters/ai/DetectionAdapter.js';
import CanvasFactoryAdapter from '../../../adapters/ui/CanvasFactoryAdapter.js';
import NotificationAdapter from '../../../adapters/notification/NotificationAdapter.js';
import ItemDetectionAdapter from '../../../adapters/ai/ItemDetectionAdapter.js';
import EmbeddingModeResolver from '../EmbeddingModeResolver.js';
import AuthVisibilityAdapter from '../../../adapters/auth/AuthVisibilityAdapter.js';
import HostModalAdapter from '../../../adapters/modal/HostModalAdapter.js';
import FullAppBootstrapper from '../FullAppBootstrapper.js';
import LauncherBootstrapper from '../LauncherBootstrapper.js';
import { resolveTemplateBaseUrl } from '../../../config/templateBaseUrl.js';

/**
 * Registers cross-cutting infrastructure adapters and shared services.
 */
export default class InfrastructureModule {
  /**
   * @param {{ container: import('../../container/Container.js').default, config: any, eventBus?: any }} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Configure the infrastructure layer inside the container.
   */
  register() {
    const { container, config } = this.context;

    const eventBusFactory = new EventBusFactory();
    const eventBus = eventBusFactory.create();
    this.context.eventBusFactory = eventBusFactory;
    this.context.eventBus = eventBus;

    container.register('EventBusFactory', () => eventBusFactory, { priority: 1 });
    container.register('IEventBus', () => eventBus, { priority: 5 });
    container.register('IPersistence', () => new LocalStorageAdapter(), { priority: 6 });

    container.register('Logger', () => new Logger(config.LOG_LEVEL), { priority: 10 });
    container.register(
      'Logging',
      () => new LoggingAdapter(config.LOG_LEVEL, container.resolve('IEventBus')),
      { priority: 15 }
    );
    container.register(
      'ErrorManager',
      () => new ErrorManager(container.resolve('IEventBus'), container.resolve('Logging')),
      { priority: 16 }
    );

    container.register(
      'IConfigLoader',
      () => new FetchConfigAdapter(container.resolve('Logging')),
      { priority: 35 }
    );

    container.register(
      'TemplateService',
      () =>
        new TemplateAdapter(
          resolveTemplateBaseUrl(import.meta.url),
          container.resolve('Logger'),
          import.meta.url
        ),
      { priority: 40 }
    );

    container.register(
      'LanguageService',
      () =>
        new LanguageAdapter(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('Logging')
        ),
      { priority: 50 }
    );

    container.register(
      'DatabaseService',
      () =>
        new DatabaseAdapter(
          ':memory:',
          container.resolve('Logger'),
          undefined,
          container.resolve('IPersistence')
        ),
      { priority: 20 }
    );

    container.register(
      'DBPublisher',
      () => new DBPublisher(container.resolve('DatabaseService'), container.resolve('Logger')),
      { priority: 21 }
    );

    container.register('IEncryption', () => new BrowserCryptoAdapter(container.resolve('Logger')), {
      priority: 70,
    });

    container.register(
      'GeoService',
      () => new GeolocationAdapter(container.resolve('DatabaseService'), container.resolve('Logger')),
      { priority: 90 }
    );

    container.register('CameraService', () => new CameraAdapter(container.resolve('Logger')), {
      priority: 100,
    });

    container.register(
      'DetectionService',
      () =>
        new DetectionAdapter(
          container.resolve('Logger'),
          container.resolve('StateService'),
          container.resolve('IEventBus'),
          config
        ),
      { priority: 110 }
    );

    container.register('ICanvasFactory', () => new CanvasFactoryAdapter(), { priority: 109 });

    container.register(
      'NotificationManager',
      () => new NotificationAdapter(container.resolve('IEventBus')),
      { priority: 113 }
    );

    container.register(
      'ItemDetectionService',
      () => new ItemDetectionAdapter(container.resolve('Logger')),
      { priority: 111 }
    );

    container.register(
      'EmbeddingModeResolver',
      () =>
        new EmbeddingModeResolver({
          logger: container.resolve('Logger'),
          documentRef: typeof document !== 'undefined' ? document : null
        }),
      { priority: 7 }
    );

    container.register(
      'AuthVisibilityAdapter',
      () =>
        new AuthVisibilityAdapter({
          windowRef: typeof window !== 'undefined' ? window : null,
          logger: container.resolve('Logger')
        }),
      { priority: 8 }
    );

    container.register(
      'HostModalAdapter',
      () =>
        new HostModalAdapter({
          windowRef: typeof window !== 'undefined' ? window : null,
          documentRef: typeof document !== 'undefined' ? document : null,
          logger: container.resolve('Logger')
        }),
      { priority: 9 }
    );

    container.register(
      'FullAppBootstrapper',
      () =>
        new FullAppBootstrapper({
          container,
          bootManager: container.resolve('BootManager'),
          eventBus: container.resolve('IEventBus'),
          logger: container.resolve('Logger'),
          windowRef: typeof window !== 'undefined' ? window : null
        }),
      { priority: 12 }
    );

    container.register(
      'LauncherBootstrapper',
      () =>
        new LauncherBootstrapper({
          container,
          windowRef: typeof window !== 'undefined' ? window : null
        }),
      { priority: 13 }
    );
  }
}
