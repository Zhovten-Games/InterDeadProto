---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - current
  - defaultGhost
  - requested
  - storage
schemaVersion: 1
source: src/spirit-contacts/application/ghost-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: GhostService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# GhostService

Stores and retrieves the currently selected ghost. The service persists the selection in a provided storage and falls back to a default value when none is stored[^1]. Other services query this service to tailor behavior to the active ghost, such as `PostsService` when saving posts[^2].

[^1]: [src/spirit-contacts/application/ghost-service.js](../../../../../proto-dev/src/spirit-contacts/application/ghost-service.js)

[^2]: [src/messenger/application/posts-service.js](../../../../../proto-dev/src/messenger/application/posts-service.js)

## Current lifecycle contract

The constructor selects only the configured default. `boot()` reads persisted selection. Requested and committed contact are separate: a request does not write persistence; `commitCurrentGhost()` writes only a successfully prepared current context.
