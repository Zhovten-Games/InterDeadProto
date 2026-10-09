---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - db
  - ghostService
schemaVersion: 1
source: src/messenger/application/posts-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: PostsService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# PostsService

Publishes and retrieves posts associated with the logged-in user and the currently selected ghost. Before inserting a post it boots the database, loads the user, and resolves the active spirit through `GhostService`.[^1] Retrieval uses the same user/ghost pairing to return posts in reverse chronological order.[^2]

Profile transfer workflows call `exportAllByGhost` and `replaceAllByGhost` to snapshot per-ghost posts and restore them later, ensuring imports clear existing records for the user before replaying ordered entries.[^3]

[^1]: Publish pipeline [src/messenger/application/posts-service.js#L1-L16](../../../../../proto-dev/src/messenger/application/posts-service.js)

[^2]: Retrieval for the active ghost [src/messenger/application/posts-service.js#L18-L24](../../../../../proto-dev/src/messenger/application/posts-service.js)

[^3]: Export/import helpers [src/messenger/application/posts-service.js#L27-L61](../../../../../proto-dev/src/messenger/application/posts-service.js)
