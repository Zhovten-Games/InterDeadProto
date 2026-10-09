import EventBusFactory from '../../runtime-events/composition/event-bus-factory.js';
import Logger from '../../runtime-diagnostics/bootstrap/logger.js';
import LoggingAdapter from '../../runtime-diagnostics/adapters/logging-adapter.js';
import ErrorManager from '../../runtime-diagnostics/application/error-manager.js';
import LocalStorageAdapter from '../../storage/browser/local-storage-adapter.js';
import FetchConfigAdapter from '../../runtime-configuration/browser/fetch-config-adapter.js';
import TemplateAdapter from '../presentation/template-adapter.js';
import LanguageAdapter from '../../localization/browser/language-adapter.js';
import DatabaseAdapter from '../../storage/browser/database-adapter.js';
import DBPublisher from '../../storage/publication/db-publisher.js';
import BrowserCryptoAdapter from '../../storage/encryption/browser-crypto-adapter.js';
import GeolocationAdapter from '../../identity/browser/geolocation-adapter.js';
import CameraAdapter from '../../camera/browser/camera-adapter.js';
import DetectionAdapter from '../../camera/detection/detection-adapter.js';
import CanvasFactoryAdapter from '../../media/browser/canvas-factory-adapter.js';
import NotificationAdapter from '../../notifications/browser/notification-adapter.js';
import ItemDetectionAdapter from '../../camera/detection/item-detection-adapter.js';
import EmbeddingModeResolver from '../../host-integration/embedding/embedding-mode-resolver.js';
import EmbedPermissionsResolver from '../../host-integration/embedding/embed-permissions-resolver.js';
import AuthVisibilityAdapter from '../../identity/presentation/auth-visibility-adapter.js';
import HostModalAdapter from '../../host-integration/modal/host-modal-adapter.js';
import FullAppBootstrapper from '../bootstrap/full-app-bootstrapper.js';
import LauncherBootstrapper from '../bootstrap/launcher-bootstrapper.js';
import ServiceWorkerRegistrar from '../../asset-delivery/service-worker/service-worker-registrar.js';
import { resolveTemplateBaseUrl } from '../../asset-delivery/paths/template-base-url.js';

/**
 * Registers cross-cutting infrastructure adapters and shared services.
 */
export default class InfrastructureModule {
  /**
   * @param {{ container: import('./container.js').default, config: any, eventBus?: any }} context
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
      { priority: 15 },
    );
    container.register(
      'ErrorManager',
      () => new ErrorManager(container.resolve('IEventBus'), container.resolve('Logging')),
      { priority: 16 },
    );

    container.register(
      'IConfigLoader',
      () => new FetchConfigAdapter(container.resolve('Logging')),
      { priority: 35 },
    );

    container.register(
      'TemplateService',
      () =>
        new TemplateAdapter(
          resolveTemplateBaseUrl(import.meta.url),
          container.resolve('Logger'),
          import.meta.url,
        ),
      { priority: 40 },
    );

    container.register(
      'LanguageAdapter',
      () =>
        new LanguageAdapter(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('Logging'),
        ),
      { priority: 50 },
    );

    container.register(
      'DatabaseAdapter',
      () =>
        new DatabaseAdapter(
          ':memory:',
          container.resolve('Logger'),
          undefined,
          container.resolve('IPersistence'),
        ),
      { priority: 20 },
    );

    container.register(
      'DBPublisher',
      () => new DBPublisher(container.resolve('DatabaseAdapter'), container.resolve('Logger')),
      { priority: 21 },
    );

    container.register('IEncryption', () => new BrowserCryptoAdapter(container.resolve('Logger')), {
      priority: 70,
    });

    container.register(
      'GeoService',
      () =>
        new GeolocationAdapter(container.resolve('DatabaseAdapter'), container.resolve('Logger')),
      { priority: 90 },
    );

    container.register('CameraAdapter', () => new CameraAdapter(container.resolve('Logger')), {
      priority: 100,
    });

    container.register(
      'DetectionAdapter',
      () =>
        new DetectionAdapter(
          container.resolve('Logger'),
          container.resolve('StateService'),
          container.resolve('IEventBus'),
          config,
        ),
      { priority: 110, managed: false },
    );

    container.register('ICanvasFactory', () => new CanvasFactoryAdapter(), { priority: 109 });

    container.register(
      'NotificationManager',
      () => new NotificationAdapter(container.resolve('IEventBus')),
      { priority: 113 },
    );

    container.register(
      'ItemDetectionAdapter',
      () => new ItemDetectionAdapter(container.resolve('Logger')),
      { priority: 111 },
    );

    container.register(
      'EmbeddingModeResolver',
      () =>
        new EmbeddingModeResolver({
          logger: container.resolve('Logger'),
          documentRef: typeof document !== 'undefined' ? document : null,
        }),
      { priority: 7 },
    );

    container.register(
      'EmbedPermissionsResolver',
      () =>
        new EmbedPermissionsResolver({
          logger: container.resolve('Logger'),
          documentRef: typeof document !== 'undefined' ? document : null,
        }),
      { priority: 7 },
    );

    container.register(
      'AuthVisibilityAdapter',
      () =>
        new AuthVisibilityAdapter({
          windowRef: typeof window !== 'undefined' ? window : null,
          logger: container.resolve('Logger'),
        }),
      { priority: 8 },
    );

    container.register(
      'HostModalAdapter',
      () =>
        new HostModalAdapter({
          windowRef: typeof window !== 'undefined' ? window : null,
          documentRef: typeof document !== 'undefined' ? document : null,
          logger: container.resolve('Logger'),
        }),
      { priority: 9 },
    );

    container.register(
      'FullAppBootstrapper',
      () =>
        new FullAppBootstrapper({
          container,
          bootManager: container.resolve('BootManager'),
          eventBus: container.resolve('IEventBus'),
          logger: container.resolve('Logger'),
          windowRef: typeof window !== 'undefined' ? window : null,
        }),
      { priority: 12, managed: false },
    );

    container.register(
      'ServiceWorkerRegistrar',
      () =>
        new ServiceWorkerRegistrar({
          windowRef: typeof window !== 'undefined' ? window : null,
          logger: container.resolve('Logger'),
          embeddingResolver: container.resolve('EmbeddingModeResolver'),
        }),
      { priority: 11 },
    );

    container.register(
      'LauncherBootstrapper',
      () =>
        new LauncherBootstrapper({
          container,
          bootManager: container.resolve('BootManager'),
          windowRef: typeof window !== 'undefined' ? window : null,
        }),
      { priority: 13, managed: false },
    );
  }
}
