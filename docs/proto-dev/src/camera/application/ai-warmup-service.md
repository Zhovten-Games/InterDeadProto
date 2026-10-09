---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/constants.js
listens:
  - AI_RETRY_REQUESTED
owns:
  - _handler
  - _started
  - _unsubscribeAuth
  - authVisibilityAdapter
  - bus
  - config
  - detectionService
  - logger
  - stateService
schemaVersion: 1
source: src/camera/application/ai-warmup-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: AiWarmupService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# AiWarmupService

Coordinates AI model warmup in response to authentication visibility and loader events. On boot it subscribes to the event bus, initializes the auth visibility adapter, and triggers warmup if configuration permits and authentication requirements are met.[^1]

It reacts to `AI_LOADER_HIDE_REQUESTED` by marking the loader as hidden and emitting `AI_LOADER_VISIBILITY_CHANGED`, and handles `AI_RETRY_REQUESTED` by resetting loader visibility and calling `DetectionService.retry` with warnings on failure.[^2]

[^1]: Boot flow, auth visibility subscription, and warmup gating [src/camera/application/ai-warmup-service.js#L27-L86](../../../../../proto-dev/src/camera/application/ai-warmup-service.js)

[^2]: Event handling for hide/retry actions [src/camera/application/ai-warmup-service.js#L45-L69](../../../../../proto-dev/src/camera/application/ai-warmup-service.js)
