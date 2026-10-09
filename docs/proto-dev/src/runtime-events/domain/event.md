---
domains: []
emits:
  - EVENT_COMPLETED
  - EVENT_STARTED
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
source: src/runtime-events/domain/event.js
used_by:
  - src/narrative-runtime/sequence/stage.js
source_exists: true
runtime_role: Event
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Event

Encapsulates a game event lifecycle, emitting `EVENT_STARTED` and `EVENT_COMPLETED` while persisting state. Logging flows through an injected logger defaulting to `NullLogger`, allowing lifecycle messages without requiring infrastructure adapters.[^1]

Events are typically constructed within a `Stage`, allowing duality sequences to trigger narrative progress and share the same logger instance across event and quest classes.[^2]

[^1]: Lifecycle emission, persistence, and logger default [src/runtime-events/domain/event.js#L1-L33](../../../../../proto-dev/src/runtime-events/domain/event.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Stage integration [src/narrative-runtime/sequence/stage.js#L5-L43](../../../../../proto-dev/src/narrative-runtime/sequence/stage.js)
