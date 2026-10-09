---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/composition/event-bus-factory.js
  - src/runtime-diagnostics/bootstrap/logger.js
  - src/runtime-diagnostics/adapters/logging-adapter.js
  - src/runtime-diagnostics/application/error-manager.js
  - src/storage/browser/local-storage-adapter.js
  - src/runtime-configuration/browser/fetch-config-adapter.js
  - src/app-shell/presentation/template-adapter.js
  - src/localization/browser/language-adapter.js
  - src/storage/browser/database-adapter.js
  - src/storage/publication/db-publisher.js
  - src/storage/encryption/browser-crypto-adapter.js
  - src/identity/browser/geolocation-adapter.js
  - src/camera/browser/camera-adapter.js
  - src/camera/detection/detection-adapter.js
  - src/media/browser/canvas-factory-adapter.js
  - src/notifications/browser/notification-adapter.js
  - src/camera/detection/item-detection-adapter.js
  - src/host-integration/embedding/embedding-mode-resolver.js
  - src/host-integration/embedding/embed-permissions-resolver.js
  - src/identity/presentation/auth-visibility-adapter.js
  - src/host-integration/modal/host-modal-adapter.js
  - src/app-shell/bootstrap/full-app-bootstrapper.js
  - src/app-shell/bootstrap/launcher-bootstrapper.js
  - src/asset-delivery/service-worker/service-worker-registrar.js
  - src/asset-delivery/paths/template-base-url.js
listens: []
owns:
  - context
schemaVersion: 1
source: src/app-shell/composition/infrastructure-module.js
used_by:
  - src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: InfrastructureModule
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# InfrastructureModule

`InfrastructureModule` wires foundational adapters and shared services so all subsequent modules can rely on consistent eventing, logging, persistence, and gateway implementations.[^1]

The module creates the `EventBusFactory`, exposes an `IEventBus` singleton, and registers persistence, logging, and error management with the configured log level.[^2] It also provisions configuration fetching, template rendering (with `TemplateBaseUrlResolver`), localization, database access, and encryption utilities for upstream services.[^3]

Additional registrations now include embedding mode resolvers, auth visibility and modal adapters, plus bootstrappers for the full app, launcher-only mode, and service worker registration. These components ensure embedded contexts, launcher experiences, and caching behaviors are available through the container.[^4]

[^1]: Module setup and registration entry point [src/app-shell/composition/infrastructure-module.js#L27-L80](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)

[^2]: Event bus creation, logging, persistence, and error manager bindings [src/app-shell/composition/infrastructure-module.js#L44-L63](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)

[^3]: Config loader, template service, language adapter, database services, and encryption [src/app-shell/composition/infrastructure-module.js#L65-L113](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)

[^4]: Embedding helpers, auth/modal adapters, bootstrappers, and service worker registrar [src/app-shell/composition/infrastructure-module.js#L151-L224](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)
