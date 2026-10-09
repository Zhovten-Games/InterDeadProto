---
domains: []
emits:
  - BUTTON_VISIBILITY_UPDATED
implements: []
imports:
  - src/runtime-events/domain/constants.js
  - src/runtime-diagnostics/null-logger.js
listens:
  - SCREEN_CHANGE
owns:
  - _handler
  - bus
  - logger
  - ready
  - screenService
  - store
  - visibility
schemaVersion: 1
source: src/app-shell/controls/button-visibility-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ButtonVisibilityService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ButtonVisibilityService

Persists and broadcasts button visibility across screens. On boot it restores saved flags, normalizes legacy storage values, seeds defaults for messenger/camera toggles, and reports malformed data through a `NullLogger` fallback.[^1]

Visibility changes are persisted and published as `BUTTON_VISIBILITY_UPDATED` events so views can react, mirroring `ButtonStateService` which manages enabled/disabled state for the same actions.[^2]

[^1]: Boot normalization and logging [src/app-shell/controls/button-visibility-service.js#L6-L39](../../../../../proto-dev/src/app-shell/controls/button-visibility-service.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Event emission helpers [src/app-shell/controls/button-visibility-service.js#L41-L86](../../../../../proto-dev/src/app-shell/controls/button-visibility-service.js); relation to ButtonStateService [src/app-shell/controls/button-state-service.js#L88-L141](../../../../../proto-dev/src/app-shell/controls/button-state-service.js)

## Current lifecycle contract

The constructor stores ports and an inert handler. `boot()` restores visibility and subscribes once; `dispose()` unsubscribes and clears readiness. Reset removes user overrides, then ordinary screen events rederive policy.
