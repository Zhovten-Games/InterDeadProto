---
domains: []
emits:
  - APP_RESET_COMPLETED
  - SCREEN_CHANGE
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - APP_RESET_REQUESTED
owns: []
schemaVersion: 1
source: src/application/services/ResetService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ResetService

Listens for `APP_RESET_REQUESTED` events and orchestrates full application resets. During boot the service subscribes to the injected event bus (`NullEventBus` fallback) and removes its handler on disposal.[^1][^2]

When a reset is requested it merges payload options with defaults from `default.config`, clears the database and persistence stores unless explicitly disabled, emits `APP_RESET_COMPLETED`, and navigates to the requested initial screen with a forced screen change.[^2] Errors are logged through the injected logger to aid troubleshooting.[^3]

[^1]: Subscription lifecycle [src/application/services/ResetService.js#L1-L20](../../src/application/services/ResetService.js#L1-L20)
[^2]: Event bus default [src/application/services/ResetService.js#L1-L13](../../src/application/services/ResetService.js#L1-L13); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Reset flow and option merging [src/application/services/ResetService.js#L22-L42](../../src/application/services/ResetService.js#L22-L42); default options [src/config/default.config.js#L1-L11](../../src/config/default.config.js#L1-L11)
[^4]: Error logging on reset failure [src/application/services/ResetService.js#L43-L45](../../src/application/services/ResetService.js#L43-L45)
