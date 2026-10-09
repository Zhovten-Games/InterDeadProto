---
domains: []
emits:
  - BUTTON_STATE_UPDATED
implements: []
imports:
  - src/app-shell/composition/configuration-index.js
  - src/app-shell/controls/button-state-config.js
  - src/runtime-configuration/merge-configuration.js
  - src/runtime-events/domain/constants.js
listens:
  - AI_STATE_CHANGED
  - APP_RESET_COMPLETED
  - GHOST_CONTEXT_COMMITTED
  - SCREEN_CHANGE
  - USER_PROFILE_SAVED
  - afterCapture
  - aiReady
  - always
  - localAuthReady
  - presence
  - profileReady
owns:
  - _handler
  - aiState
  - captured
  - config
  - currentScreen
  - eventBus
  - geo
  - ghostService
  - localAuthReady
  - logger
  - presence
  - profile
  - screenService
schemaVersion: 1
source: src/app-shell/state/application-state-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: StateService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# StateService

Evaluates button enablement rules based on profile readiness, presence data and ghost-specific configuration. On boot it loads default button state rules and merges overrides for the current ghost, reloading them when the ghost changes[^1]. `isButtonEnabled` now returns `false` when no rules exist, preventing unintended activation[^2]. Presence flags and capture status influence rules such as `afterCapture` or `presence`[^3].

The service depends on `GhostService` to determine which spirit's overrides to load[^4]. Recent log entries required explicit enablement for guest actions and clarified rule lookups[^5].

[^1]: [src/app-shell/state/application-state-service.js](../../../../../proto-dev/src/app-shell/state/application-state-service.js)

[^2]: [src/app-shell/state/application-state-service.js](../../../../../proto-dev/src/app-shell/state/application-state-service.js)

[^3]: [src/app-shell/state/application-state-service.js](../../../../../proto-dev/src/app-shell/state/application-state-service.js)

[^4]: [src/spirit-contacts/application/ghost-service.js](../../../../../proto-dev/src/spirit-contacts/application/ghost-service.js)

[^5]: Button rules and isButtonEnabled changes ([`doc/log.md`](../../../doc/log.md#L1461-L1470 and L1586-L1668))
