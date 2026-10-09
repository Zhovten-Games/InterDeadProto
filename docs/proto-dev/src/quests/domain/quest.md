---
domains: []
emits:
  - QUEST_COMPLETED
  - QUEST_STARTED
implements: []
imports:
  - src/runtime-events/domain/constants.js
  - src/runtime-diagnostics/null-logger.js
listens: []
owns:
  - completed
  - eventBus
  - id
  - logger
  - persistence
  - started
schemaVersion: 1
source: src/quests/domain/quest.js
used_by:
  - src/narrative-runtime/sequence/stage.js
source_exists: true
runtime_role: Quest
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Quest

Represents a quest within the duality system, tracking start and completion while persisting progress. Logging is routed through a `NullLogger` default so lifecycle updates can be emitted even when the infrastructure logger is absent (e.g., tests).[^1]

`Stage` instantiates quests when a stage requires user interaction, attaching overlay or reward metadata for later use. Quest state changes emit `QUEST_STARTED`/`QUEST_COMPLETED` events shared across the system and saved through the injected persistence adapter.[^2]

[^1]: Lifecycle, persistence, and logger default [src/quests/domain/quest.js#L1-L37](../../../../../proto-dev/src/quests/domain/quest.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Stage integration and event emission [src/narrative-runtime/sequence/stage.js#L5-L43](../../../../../proto-dev/src/narrative-runtime/sequence/stage.js); [src/runtime-events/domain/constants.js#L4-L7](../../../../../proto-dev/src/runtime-events/domain/constants.js)
