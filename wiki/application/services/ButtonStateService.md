---
domains: []
emits:
  - BUTTON_STATE_UPDATED
implements: []
imports:
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
listens:
  - DIALOG_AWAITING_INPUT_CHANGED
  - SCREEN_CHANGE
owns: []
schemaVersion: 1
source: src/application/services/ButtonStateService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ButtonStateService

Persists per-screen button enablement and republishes state changes through `BUTTON_STATE_UPDATED`. It subscribes to dialog awaiting-input signals and screen changes so stored flags are reapplied whenever the active screen changes.[^1]

On boot the service normalizes legacy persistence entries, seeds defaults for messenger post and camera capture actions, and restores persisted state for the current screen. Logging is routed through a `NullLogger` so corrupted storage produces warnings without crashing tests.[^2]

Helpers expose CRUD-style accessors (`setState`, `setScreenState`, `getStatesForScreen`, `isActive`, `isReady`) and guard against malformed state before re-emitting updates to keep presenters synchronized. Awaiting-input handling toggles capture/post buttons as dialog prompts change.[^3]

[^1]: Event subscriptions and handlers [src/application/services/ButtonStateService.js#L8-L48](../../src/application/services/ButtonStateService.js#L8-L48)
[^2]: Boot initialization, normalization, and logging [src/application/services/ButtonStateService.js#L50-L86](../../src/application/services/ButtonStateService.js#L50-L86); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^3]: State helpers and awaiting-input logic [src/application/services/ButtonStateService.js#L88-L141](../../src/application/services/ButtonStateService.js#L88-L141)
