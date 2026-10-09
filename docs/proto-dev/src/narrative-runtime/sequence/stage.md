---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/event.js
  - src/quests/domain/quest.js
  - src/narrative-runtime/dialog/dialog.js
  - src/runtime-diagnostics/null-logger.js
listens: []
owns:
  - bus
  - event
  - eventConfig
  - id
  - logger
  - quest
  - questConfig
  - reactionPreset
  - reactions
  - store
schemaVersion: 1
source: src/narrative-runtime/sequence/stage.js
used_by:
  - src/narrative-runtime/sequence/duality-manager.js
source_exists: true
runtime_role: Stage
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Stage

Represents a single event–quest duality stage, pairing configuration-driven `Event` and `Quest` instances with optional overlay metadata and per-stage reaction lists. Constructors pass a shared logger (defaulting to `NullLogger`) into each component so lifecycle logging stays consistent.[^1]

When an event completes, the stage may start its quest and later mark quest completion, exposing helpers like `getDialog`, `getRequirement`, `getQuest`, and `getReactions` to the outer `DualityManager`. Reaction arrays are cloned to keep configuration immutable for services such as `ReactionMappingService`.[^2]

[^1]: Stage constructor wiring event, quest, reactions, and logger [src/narrative-runtime/sequence/stage.js#L5-L32](../../../../../proto-dev/src/narrative-runtime/sequence/stage.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Event/quest lifecycle helpers and reaction cloning [src/narrative-runtime/sequence/stage.js#L24-L65](../../../../../proto-dev/src/narrative-runtime/sequence/stage.js); `ReactionMappingService` usage [src/reactions/application/reaction-mapping-service.js#L10-L54](../../../../../proto-dev/src/reactions/application/reaction-mapping-service.js)
