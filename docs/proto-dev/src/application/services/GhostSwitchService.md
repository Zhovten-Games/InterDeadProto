---
domains: []
emits: 
  - GHOST_UNLOCKED
implements: []
imports: 
  - src/core/events/NullEventBus.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/GhostSwitchService.js
used_by: 
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
source_exists: true
runtime_role: ghost_switch_service
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: "executive coordination hub"
---

# GhostSwitchService

Tracks which ghosts have been completed and unlocks new ones when requirements are met. Completion state is persisted and unlocking triggers a `GHOST_UNLOCKED` event on the injected bus (`NullEventBus` fallback) so UI components such as `PanelAdapter` can highlight new spirits[^1][^2]. The service also exposes a helper to compute which ghosts are currently available based on configuration dependencies[^3].

[^1]: [src/application/services/GhostSwitchService.js](../../src/application/services/GhostSwitchService.js#L1-L21)
[^2]: [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: [src/application/services/GhostSwitchService.js](../../src/application/services/GhostSwitchService.js#L23-L28)
