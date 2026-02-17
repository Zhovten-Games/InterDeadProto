---
domains: []
emits:
  - AI_LOADER_VISIBILITY_CHANGED
implements: []
imports:
  - src/core/events/constants.js
listens:
  - AI_LOADER_HIDE_REQUESTED
  - AI_RETRY_REQUESTED
owns: []
schemaVersion: 1
source: src/application/services/AiWarmupService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
  - src/infrastructure/bootstrap/LauncherBootstrapper.js
---

# AiWarmupService

Coordinates AI model warmup in response to authentication visibility and loader events. On boot it subscribes to the event bus, initializes the auth visibility adapter, and triggers warmup if configuration permits and authentication requirements are met.[^1]

It reacts to `AI_LOADER_HIDE_REQUESTED` by marking the loader as hidden and emitting `AI_LOADER_VISIBILITY_CHANGED`, and handles `AI_RETRY_REQUESTED` by resetting loader visibility and calling `DetectionService.retry` with warnings on failure.[^2]

[^1]: Boot flow, auth visibility subscription, and warmup gating [src/application/services/AiWarmupService.js#L27-L86](../../../src/application/services/AiWarmupService.js#L27-L86)
[^2]: Event handling for hide/retry actions [src/application/services/AiWarmupService.js#L45-L69](../../../src/application/services/AiWarmupService.js#L45-L69)
