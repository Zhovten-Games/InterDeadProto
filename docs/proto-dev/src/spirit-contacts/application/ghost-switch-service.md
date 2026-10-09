---
domains: []
emits:
  - GHOST_UNLOCKED
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
listens: []
owns:
  - bus
  - completed
  - store
schemaVersion: 1
source: src/spirit-contacts/application/ghost-switch-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: GhostSwitchService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# GhostSwitchService

Tracks which ghosts have been completed and unlocks new ones when requirements are met. Completion state is persisted and unlocking triggers a `GHOST_UNLOCKED` event on the injected bus (`NullEventBus` fallback) so UI components such as `PanelAdapter` can highlight new spirits[^1][^2]. The service also exposes a helper to compute which ghosts are currently available based on configuration dependencies[^3].

[^1]: [src/spirit-contacts/application/ghost-switch-service.js](../../../../../proto-dev/src/spirit-contacts/application/ghost-switch-service.js)

[^2]: [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: [src/spirit-contacts/application/ghost-switch-service.js](../../../../../proto-dev/src/spirit-contacts/application/ghost-switch-service.js)

## Current lifecycle contract

The constructor creates an empty completion cache. `boot()`/`restoreUserContext()` read persisted completion. `clearUserRuntimeContext()` clears that cache on project reset; atomic profile import restores it after the committed storage context changes.
