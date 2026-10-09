---
domains: []
emits:
  - DUALITY_COMPLETED
  - DUALITY_STAGE_STARTED
  - DUALITY_STARTED
implements: []
imports:
  - src/narrative-runtime/sequence/stage.js
  - src/runtime-events/domain/constants.js
  - src/runtime-diagnostics/null-logger.js
listens: []
owns:
  - _completionDeferred
  - _restoredCompleted
  - bus
  - completionGuard
  - current
  - logger
  - sequence
  - stages
  - store
schemaVersion: 1
source: src/narrative-runtime/sequence/duality-manager.js
used_by:
  - src/app-shell/composition/domain-module.js
source_exists: true
runtime_role: DualityManager
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DualityManager

Drives a sequence of `Stage` instances, emitting lifecycle events as the player progresses through events and quests. A `NullLogger` default records lifecycle milestones without requiring the infrastructure logger during tests.[^1]

Upon loading it restores persisted stage/duality state, resuming active quests when necessary and emitting `DUALITY_COMPLETED` immediately if a run finished in a previous session.[^2] Advancement persists the current stage index, announces `DUALITY_STAGE_STARTED`, and delegates to the active `Stage` to start events or quests.[^3]

Completion can be guarded via `setCompletionGuard`, enabling services like `ReactionFinaleService` to defer completion until conditions are met. `resumeCompletion` continues the sequence once guards allow it.[^4] Convenience accessors expose the current requirement, dialog, quest overlay, quest object, and raw stage config so downstream services can tailor UI based on the active step.[^5]

[^1]: Construction, logger default, and start flow [src/narrative-runtime/sequence/duality-manager.js#L9-L61](../../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Reload logic and quest resumption [src/narrative-runtime/sequence/duality-manager.js#L22-L52](../../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js)

[^3]: Advancement, persistence, and stage start [src/narrative-runtime/sequence/duality-manager.js#L73-L118](../../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js)

[^4]: Completion guard handling and resume [src/narrative-runtime/sequence/duality-manager.js#L120-L156](../../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js); guard usage in `ReactionFinaleService` [src/reactions/application/reaction-finale-service.js#L17-L118](../../../../../proto-dev/src/reactions/application/reaction-finale-service.js)

[^5]: Accessors for stage config, quest, overlay, and quest activity [src/narrative-runtime/sequence/duality-manager.js#L158-L189](../../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js)
