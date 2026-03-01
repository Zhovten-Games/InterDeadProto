---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/events/constants.js
used_by:
  - src/application/services/DialogOrchestratorService.js
  - src/application/services/ResetService.js
  - src/presentation/adapters/GlobalViewPresenter.js
---

# Event constants

Defines the canonical event names used across the app and exports `ALL_EVENTS` as an immutable registry.[^1]

Recent additions include ghost reboot events (`GHOST_REBOOT_REQUESTED`, `GHOST_REBOOT_COMPLETED`), reset/profile-transfer lifecycle events, dialog-widget readiness events, and UI transport events for modal/overlay/media flows.[^1]

[^1]: Event list and `ALL_EVENTS` registry [proto-dev/src/core/events/constants.js#L1-L160](../../../../proto-dev/src/core/events/constants.js#L1-L160)
