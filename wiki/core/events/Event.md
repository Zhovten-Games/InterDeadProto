---
domains: []
emits:
  - EVENT_COMPLETED
  - EVENT_STARTED
implements: []
imports:
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
listens: []
owns: []
schemaVersion: 1
source: src/core/events/Event.js
used_by:
  - src/core/sequence/Stage.js
---

# Event

Encapsulates a game event lifecycle, emitting `EVENT_STARTED` and `EVENT_COMPLETED` while persisting state. Logging flows through an injected logger defaulting to `NullLogger`, allowing lifecycle messages without requiring infrastructure adapters.[^1]

Events are typically constructed within a `Stage`, allowing duality sequences to trigger narrative progress and share the same logger instance across event and quest classes.[^2]

[^1]: Lifecycle emission, persistence, and logger default [src/core/events/Event.js#L1-L33](../../../src/core/events/Event.js#L1-L33); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Stage integration [src/core/sequence/Stage.js#L5-L43](../../../src/core/sequence/Stage.js#L5-L43)
