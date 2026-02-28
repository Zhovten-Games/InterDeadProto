---
domains: []
emits: []
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/utils/messageFingerprint.js
listens:
  - REACTION_SELECTED
owns: []
schemaVersion: 1
source: src/application/services/ReactionPersistenceService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ReactionPersistenceService

Listens for `REACTION_SELECTED` events on the injected bus (`NullEventBus` fallback) and persists the choice to both the in-memory
history buffer and the database-backed history service.[^1][^2] It resolves the active ghost, normalizes the emoji, and backfills
fingerprints for dialog messages when necessary so subsequent updates share the same identifier.[^3]

Fallbacks search the live dialog for a message by fingerprint or numeric id, computing a fingerprint via `messageFingerprint`
when absent. Unknown ghosts or missing fingerprints log warnings through the injected logger to aid debugging.[^4]

[^1]: Event bus injection and defaults [src/application/services/ReactionPersistenceService.js#L1-L35](../../src/application/services/ReactionPersistenceService.js#L1-L35); [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^2]: Subscription and reaction handling [src/application/services/ReactionPersistenceService.js#L37-L63](../../src/application/services/ReactionPersistenceService.js#L37-L63)
[^3]: Dialog mutation and buffer/history updates [src/application/services/ReactionPersistenceService.js#L55-L63](../../src/application/services/ReactionPersistenceService.js#L55-L63)
[^4]: Message lookup, fingerprint resolution, and logging helpers [src/application/services/ReactionPersistenceService.js#L65-L102](../../src/application/services/ReactionPersistenceService.js#L65-L102)
