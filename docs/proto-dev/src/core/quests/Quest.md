---
domains: []
emits: 
  - QUEST_COMPLETED
  - QUEST_STARTED
implements: []
imports: 
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
listens: []
owns: []
schemaVersion: 1
source: src/core/quests/Quest.js
used_by: 
  - src/core/sequence/Stage.js
source_exists: true
runtime_role: quest_core
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: "executive coordination hub"
---

# Quest

Represents a quest within the duality system, tracking start and completion while persisting progress. Logging is routed through a `NullLogger` default so lifecycle updates can be emitted even when the infrastructure logger is absent (e.g., tests).[^1]

`Stage` instantiates quests when a stage requires user interaction, attaching overlay or reward metadata for later use. Quest state changes emit `QUEST_STARTED`/`QUEST_COMPLETED` events shared across the system and saved through the injected persistence adapter.[^2]

[^1]: Lifecycle, persistence, and logger default [src/core/quests/Quest.js#L1-L37](../../../src/core/quests/Quest.js#L1-L37); [docs/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Stage integration and event emission [src/core/sequence/Stage.js#L5-L43](../../../src/core/sequence/Stage.js#L5-L43); [src/core/events/constants.js#L4-L7](../../../src/core/events/constants.js#L4-L7)
