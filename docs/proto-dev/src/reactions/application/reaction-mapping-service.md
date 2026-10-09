---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - dualityManager
  - ghostService
  - logger
  - spiritConfigs
schemaVersion: 1
source: src/reactions/application/reaction-mapping-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ReactionMappingService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ReactionMappingService

Resolves which reaction emoji are valid for the active spirit stage. It inspects the current ghost via `GhostService`, derives
the active stage from `DualityManager`, and looks up the configured reaction list. Missing mappings trigger a warning so content
gaps can be diagnosed.[^1]

`getReactionsForStage()` exposes direct lookup by spirit/stage id, filtering out empty entries, while `_extractStageId()`
normalizes ids from event, quest, or explicit stage properties in the configuration.[^2]

[^1]: Current stage resolution and logging [src/reactions/application/reaction-mapping-service.js#L5-L27](../../../../../proto-dev/src/reactions/application/reaction-mapping-service.js)

[^2]: Stage lookup and id normalization helpers [src/reactions/application/reaction-mapping-service.js#L29-L65](../../../../../proto-dev/src/reactions/application/reaction-mapping-service.js)
