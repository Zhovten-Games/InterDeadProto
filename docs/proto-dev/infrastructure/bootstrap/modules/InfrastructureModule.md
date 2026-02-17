---
domains: []
emits: []
implements: []
imports:
  - src/adapters/ai/DetectionAdapter.js
  - src/adapters/ai/ItemDetectionAdapter.js
  - src/adapters/auth/AuthVisibilityAdapter.js
  - src/adapters/camera/CameraAdapter.js
  - src/adapters/config/FetchConfigAdapter.js
  - src/adapters/database/DBPublisher.js
  - src/adapters/database/DatabaseAdapter.js
  - src/adapters/encryption/BrowserCryptoAdapter.js
  - src/adapters/geo/GeolocationAdapter.js
  - src/adapters/logging/LoggingAdapter.js
  - src/adapters/modal/HostModalAdapter.js
  - src/adapters/notification/NotificationAdapter.js
  - src/adapters/persistence/LocalStorageAdapter.js
  - src/adapters/ui/CanvasFactoryAdapter.js
  - src/adapters/ui/LanguageAdapter.js
  - src/adapters/ui/TemplateAdapter.js
  - src/application/managers/ErrorManager.js
  - src/config/templateBaseUrl.js
  - src/infrastructure/bootstrap/FullAppBootstrapper.js
  - src/infrastructure/bootstrap/LauncherBootstrapper.js
  - src/infrastructure/bootstrap/Logger.js
  - src/infrastructure/bootstrap/ServiceWorkerRegistrar.js
  - src/infrastructure/bootstrap/EmbeddingModeResolver.js
  - src/infrastructure/bootstrap/EmbedPermissionsResolver.js
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

The module creates the `EventBusFactory`, exposes an `IEventBus` singleton, and registers persistence, logging, and error management with the configured log level.[^2] It also provisions configuration fetching, template rendering (with `TemplateBaseUrlResolver`), localization, database access, and encryption utilities for upstream services.[^3]

Additional registrations now include embedding mode resolvers, auth visibility and modal adapters, plus bootstrappers for the full app, launcher-only mode, and service worker registration. These components ensure embedded contexts, launcher experiences, and caching behaviors are available through the container.[^4]

[^1]: Module setup and registration entry point [src/infrastructure/bootstrap/modules/InfrastructureModule.js#L27-L80](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L27-L80)
[^2]: Event bus creation, logging, persistence, and error manager bindings [src/infrastructure/bootstrap/modules/InfrastructureModule.js#L44-L63](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L44-L63)
[^3]: Config loader, template service, language adapter, database services, and encryption [src/infrastructure/bootstrap/modules/InfrastructureModule.js#L65-L113](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L65-L113)
[^4]: Embedding helpers, auth/modal adapters, bootstrappers, and service worker registrar [src/infrastructure/bootstrap/modules/InfrastructureModule.js#L151-L224](../../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L151-L224)
