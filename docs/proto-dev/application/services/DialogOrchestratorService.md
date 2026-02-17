---
domains: []
emits:
  - DIALOG_CLEAR
  - EVENT_MESSAGE_READY
  - GHOST_RESET_COMPLETED
  - GHOST_REBOOT_COMPLETED
implements: []
imports:
  - proto-dev/src/application/services/DialogHistoryBuffer.js
  - proto-dev/src/application/services/GhostRebootCheckpointService.js
  - proto-dev/src/config/flags.js
  - proto-dev/src/core/dialog/AutoReplyBuilder.js
  - proto-dev/src/core/engine/actions.js
  - proto-dev/src/core/engine/effects.js
  - proto-dev/src/core/engine/store.js
  - proto-dev/src/core/events/NullEventBus.js
  - proto-dev/src/core/events/constants.js
  - proto-dev/src/core/logging/NullLogger.js
  - proto-dev/src/utils/messageFingerprint.js
listens:
  - APP_RESET_COMPLETED
  - DIALOG_WIDGET_READY
  - DUALITY_COMPLETED
  - DUALITY_STAGE_STARTED
  - EVENT_MESSAGE_READY
  - GHOST_RESET_REQUESTED
  - GHOST_REBOOT_REQUESTED
  - SCREEN_CHANGE
  - USER_PROFILE_SAVED
  - post
owns: []
schemaVersion: 1
source: proto-dev/src/application/services/DialogOrchestratorService.js
used_by:
  - proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogOrchestratorService

Coordinates ghost dialog lifecycle, including config loading, stage preparation, history replay, and progression gates tied to `DIALOG_WIDGET_READY`.[^1]

Recent behavior includes ghost-scoped reset/reboot handling (`GHOST_RESET_REQUESTED`, `GHOST_REBOOT_REQUESTED`) and checkpoint capture on stage boundaries via `GhostRebootCheckpointService`. This allows replaying stable checkpoints instead of rebuilding state from scratch after reboot operations.[^2]

The service enriches messages with fingerprints and avatars, buffers pre-widget posts/history, protects against duplicate user post handling (`postLocked`), and routes engine effects (`DIALOG_PROGRESS`, `HISTORY_SAVE`) through dedicated handlers.[^3]

[^1]: Constructor state, widget readiness gate, and lifecycle orchestration [proto-dev/src/application/services/DialogOrchestratorService.js#L1-L260](../../../../proto-dev/src/application/services/DialogOrchestratorService.js#L1-L260)
[^2]: Reset/reboot event handling and checkpoint flow [proto-dev/src/application/services/DialogOrchestratorService.js#L261-L620](../../../../proto-dev/src/application/services/DialogOrchestratorService.js#L261-L620)
[^3]: Stage enrichment, history normalization/replay, and effect handling [proto-dev/src/application/services/DialogOrchestratorService.js#L90-L360](../../../../proto-dev/src/application/services/DialogOrchestratorService.js#L90-L360)
