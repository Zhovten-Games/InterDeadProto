---
domains: []
emits:
  - BUTTON_STATE_UPDATED
implements: []
imports:
  - src/runtime-events/domain/constants.js
  - src/runtime-diagnostics/null-logger.js
listens:
  - DIALOG_AWAITING_INPUT_CHANGED
  - SCREEN_CHANGE
owns:
  - _booted
  - _handler
  - awaiting
  - bus
  - logger
  - ready
  - screenService
  - state
  - store
schemaVersion: 1
source: src/app-shell/controls/button-state-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ButtonStateService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ButtonStateService

Persists per-screen button enablement and republishes state changes through `BUTTON_STATE_UPDATED`. It subscribes to dialog awaiting-input signals and screen changes so stored flags are reapplied whenever the active screen changes.[^1]

On boot the service normalizes legacy persistence entries, seeds defaults for messenger post and camera capture actions, and restores persisted state for the current screen. Logging is routed through a `NullLogger` so corrupted storage produces warnings without crashing tests.[^2]

Helpers expose CRUD-style accessors (`setState`, `setScreenState`, `getStatesForScreen`, `isActive`, `isReady`) and guard against malformed state before re-emitting updates to keep presenters synchronized. Awaiting-input handling toggles capture/post buttons as dialog prompts change.[^3]

[^1]: Event subscriptions and handlers [src/app-shell/controls/button-state-service.js#L8-L48](../../../../../proto-dev/src/app-shell/controls/button-state-service.js)

[^2]: Boot initialization, normalization, and logging [src/app-shell/controls/button-state-service.js#L50-L86](../../../../../proto-dev/src/app-shell/controls/button-state-service.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^3]: State helpers and awaiting-input logic [src/app-shell/controls/button-state-service.js#L88-L141](../../../../../proto-dev/src/app-shell/controls/button-state-service.js)
