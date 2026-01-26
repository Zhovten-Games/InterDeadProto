---
domains: []
emits:
  - BUTTON_STATE_UPDATED
implements: []
imports:
  - src/config/button-state.config.js
  - src/utils/deepMerge.js
listens:
  - GHOST_CHANGE
owns: []
schemaVersion: 1
source: src/application/services/StateService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# StateService

Evaluates button enablement rules based on profile readiness, presence data and ghost-specific configuration. On boot it loads default button state rules and merges overrides for the current ghost, reloading them when the ghost changes[^1]. `isButtonEnabled` now returns `false` when no rules exist, preventing unintended activation[^2]. Presence flags and capture status influence rules such as `afterCapture` or `presence`[^3].

The service depends on `GhostService` to determine which spirit's overrides to load[^4]. Recent log entries required explicit enablement for guest actions and clarified rule lookups[^5].

[^1]: [src/application/services/StateService.js](../../src/application/services/StateService.js#L18-L33)
[^2]: [src/application/services/StateService.js](../../src/application/services/StateService.js#L38-L44)
[^3]: [src/application/services/StateService.js](../../src/application/services/StateService.js#L67-L90)
[^4]: [src/application/services/GhostService.js](../../src/application/services/GhostService.js#L1-L15)
[^5]: Button rules and isButtonEnabled changes ([`doc/log.md`](../../../doc/log.md#L1461-L1470 and L1586-L1668))
