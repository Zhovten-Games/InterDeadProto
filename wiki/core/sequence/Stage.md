---
domains: []
emits: []
implements: []
imports:
  - src/core/dialog/Dialog.js
  - src/core/events/Event.js
  - src/core/logging/NullLogger.js
  - src/core/quests/Quest.js
listens: []
owns: []
schemaVersion: 1
source: src/core/sequence/Stage.js
used_by:
  - src/core/sequence/DualityManager.js
---

# Stage

Represents a single event–quest duality stage, pairing configuration-driven `Event` and `Quest` instances with optional overlay metadata and per-stage reaction lists. Constructors pass a shared logger (defaulting to `NullLogger`) into each component so lifecycle logging stays consistent.[^1]

When an event completes, the stage may start its quest and later mark quest completion, exposing helpers like `getDialog`, `getRequirement`, `getQuest`, and `getReactions` to the outer `DualityManager`. Reaction arrays are cloned to keep configuration immutable for services such as `ReactionMappingService`.[^2]

[^1]: Stage constructor wiring event, quest, reactions, and logger [src/core/sequence/Stage.js#L5-L32](../../../src/core/sequence/Stage.js#L5-L32); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Event/quest lifecycle helpers and reaction cloning [src/core/sequence/Stage.js#L24-L65](../../../src/core/sequence/Stage.js#L24-L65); `ReactionMappingService` usage [src/application/services/ReactionMappingService.js#L10-L54](../../../src/application/services/ReactionMappingService.js#L10-L54)
