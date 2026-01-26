---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/GhostService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# GhostService

Stores and retrieves the currently selected ghost. The service persists the selection in a provided storage and falls back to a default value when none is stored[^1]. Other services query this service to tailor behavior to the active ghost, such as `PostsService` when saving posts[^2].

[^1]: [src/application/services/GhostService.js](../../src/application/services/GhostService.js#L1-L15)
[^2]: [src/application/services/PostsService.js](../../src/application/services/PostsService.js#L2-L24)
