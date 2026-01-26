---
domains: []
emits:
  - DUALITY_COMPLETED
  - DUALITY_STAGE_STARTED
  - DUALITY_STARTED
implements: []
imports:
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
  - src/core/sequence/Stage.js
listens: []
owns: []
schemaVersion: 1
source: src/core/sequence/DualityManager.js
used_by:
  - src/infrastructure/bootstrap/modules/DomainModule.js
---

# DualityManager

Drives a sequence of `Stage` instances, emitting lifecycle events as the player progresses through events and quests. A `NullLogger` default records lifecycle milestones without requiring the infrastructure logger during tests.[^1]

Upon loading it restores persisted stage/duality state, resuming active quests when necessary and emitting `DUALITY_COMPLETED` immediately if a run finished in a previous session.[^2] Advancement persists the current stage index, announces `DUALITY_STAGE_STARTED`, and delegates to the active `Stage` to start events or quests.[^3]

Completion can be guarded via `setCompletionGuard`, enabling services like `ReactionFinaleService` to defer completion until conditions are met. `resumeCompletion` continues the sequence once guards allow it.[^4] Convenience accessors expose the current requirement, dialog, quest overlay, quest object, and raw stage config so downstream services can tailor UI based on the active step.[^5]

[^1]: Construction, logger default, and start flow [src/core/sequence/DualityManager.js#L9-L61](../../../src/core/sequence/DualityManager.js#L9-L61); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Reload logic and quest resumption [src/core/sequence/DualityManager.js#L22-L52](../../../src/core/sequence/DualityManager.js#L22-L52)
[^3]: Advancement, persistence, and stage start [src/core/sequence/DualityManager.js#L73-L118](../../../src/core/sequence/DualityManager.js#L73-L118)
[^4]: Completion guard handling and resume [src/core/sequence/DualityManager.js#L120-L156](../../../src/core/sequence/DualityManager.js#L120-L156); guard usage in `ReactionFinaleService` [src/application/services/ReactionFinaleService.js#L17-L118](../../../src/application/services/ReactionFinaleService.js#L17-L118)
[^5]: Accessors for stage config, quest, overlay, and quest activity [src/core/sequence/DualityManager.js#L158-L189](../../../src/core/sequence/DualityManager.js#L158-L189)
