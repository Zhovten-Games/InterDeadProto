---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/PostsService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# PostsService

Publishes and retrieves posts associated with the logged-in user and the currently selected ghost. Before inserting a post it boots the database, loads the user, and resolves the active spirit through `GhostService`.[^1] Retrieval uses the same user/ghost pairing to return posts in reverse chronological order.[^2]

Profile transfer workflows call `exportAllByGhost` and `replaceAllByGhost` to snapshot per-ghost posts and restore them later, ensuring imports clear existing records for the user before replaying ordered entries.[^3]

[^1]: Publish pipeline [src/application/services/PostsService.js#L1-L16](../../src/application/services/PostsService.js#L1-L16)
[^2]: Retrieval for the active ghost [src/application/services/PostsService.js#L18-L24](../../src/application/services/PostsService.js#L18-L24)
[^3]: Export/import helpers [src/application/services/PostsService.js#L27-L61](../../src/application/services/PostsService.js#L27-L61)
