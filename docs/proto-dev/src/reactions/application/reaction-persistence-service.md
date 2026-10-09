---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/messenger/identity/message-fingerprint.js
listens: []
owns:
  - _handler
  - bus
  - dialogManager
  - ghostService
  - historyBuffer
  - historyService
  - logger
schemaVersion: 1
source: src/reactions/application/reaction-persistence-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ReactionPersistenceService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ReactionPersistenceService

Listens for `REACTION_SELECTED` events on the injected bus (`NullEventBus` fallback) and persists the choice to both the in-memory
history buffer and the database-backed history service.[^1][^2] It resolves the active ghost, normalizes the emoji, and backfills
fingerprints for dialog messages when necessary so subsequent updates share the same identifier.[^3]

Fallbacks search the live dialog for a message by fingerprint or numeric id, computing a fingerprint via `messageFingerprint`
when absent. Unknown ghosts or missing fingerprints log warnings through the injected logger to aid debugging.[^4]

[^1]: Event bus injection and defaults [src/reactions/application/reaction-persistence-service.js#L1-L35](../../../../../proto-dev/src/reactions/application/reaction-persistence-service.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^2]: Subscription and reaction handling [src/reactions/application/reaction-persistence-service.js#L37-L63](../../../../../proto-dev/src/reactions/application/reaction-persistence-service.js)

[^3]: Dialog mutation and buffer/history updates [src/reactions/application/reaction-persistence-service.js#L55-L63](../../../../../proto-dev/src/reactions/application/reaction-persistence-service.js)

[^4]: Message lookup, fingerprint resolution, and logging helpers [src/reactions/application/reaction-persistence-service.js#L65-L102](../../../../../proto-dev/src/reactions/application/reaction-persistence-service.js)
