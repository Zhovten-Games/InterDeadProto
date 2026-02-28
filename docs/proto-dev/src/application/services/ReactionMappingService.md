---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ReactionMappingService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ReactionMappingService

Resolves which reaction emoji are valid for the active spirit stage. It inspects the current ghost via `GhostService`, derives
the active stage from `DualityManager`, and looks up the configured reaction list. Missing mappings trigger a warning so content
gaps can be diagnosed.[^1]

`getReactionsForStage()` exposes direct lookup by spirit/stage id, filtering out empty entries, while `_extractStageId()`
normalizes ids from event, quest, or explicit stage properties in the configuration.[^2]

[^1]: Current stage resolution and logging [src/application/services/ReactionMappingService.js#L5-L27](../../src/application/services/ReactionMappingService.js#L5-L27)
[^2]: Stage lookup and id normalization helpers [src/application/services/ReactionMappingService.js#L29-L65](../../src/application/services/ReactionMappingService.js#L29-L65)
