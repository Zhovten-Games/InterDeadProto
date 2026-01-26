---
domains: []
emits: []
implements: []
imports:
  - src/adapters/ai/DetectionAdapter.js
  - src/adapters/ai/ItemDetectionAdapter.js
  - src/adapters/camera/CameraAdapter.js
  - src/adapters/config/FetchConfigAdapter.js
  - src/adapters/database/DBPublisher.js
  - src/adapters/database/DatabaseAdapter.js
  - src/adapters/encryption/BrowserCryptoAdapter.js
  - src/adapters/geo/GeolocationAdapter.js
  - src/adapters/logging/LoggingAdapter.js
  - src/adapters/notification/NotificationAdapter.js
  - src/adapters/persistence/LocalStorageAdapter.js
  - src/adapters/ui/CanvasFactoryAdapter.js
  - src/adapters/ui/LanguageAdapter.js
  - src/adapters/ui/TemplateAdapter.js
  - src/application/managers/ErrorManager.js
  - src/infrastructure/bootstrap/Logger.js
  - src/infrastructure/factories/EventBusFactory.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/modules/InfrastructureModule.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
---

# InfrastructureModule

`InfrastructureModule` wires foundational adapters and shared services so all subsequent modules can rely on consistent eventing, logging, persistence, and gateway implementations.[^1]

The module creates a singleton `EventBusFactory`, exports the produced bus via the `IEventBus` port, and registers persistence, logger, logging adapter, and error manager instances that honour configured log levels.[^2]

It also provisions configuration, templating, language, database, and encryption adapters—bridging HTTP config fetches through `FetchConfigAdapter`, serverless SQLite access, crypto utilities, and localisation helpers into the container.[^3]

Finally, it registers geo, camera, detection, canvas, notification, and item detection adapters so application services can orchestrate sensing and UI notifications without coupling to browser APIs directly.[^4]

[^1]: Module description and context handling [`InfrastructureModule.js`](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L19-L34)
[^2]: Event bus factory creation plus logging and error manager registrations [`InfrastructureModule.js`](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L36-L55); [`EventBusFactory`](../factories/EventBusFactory.md); [`Logger`](../Logger.md)
[^3]: Config, template, language, database, publisher, and encryption adapters [`InfrastructureModule.js`](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L57-L101); [`FetchConfigAdapter`](../../../adapters/config/FetchConfigAdapter.md)
[^4]: Geolocation, camera, detection, canvas, notification, and item detection wiring [`InfrastructureModule.js`](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L102-L135)
