---
domains: []
emits:
  - DETECTION_SEARCH
implements: []
imports:
  - src/core/requirements/QuestActivationRequirement.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/CameraDetectionStrategy.js
used_by:
  - src/application/services/CameraOrchestratorService.js
---

# CameraDetectionStrategy

Defines pluggable strategies describing what the camera should detect. `RegistrationCameraStrategy` always requests human presence, while `QuestCameraStrategy` wraps quest requirements in a `QuestActivationRequirement` so detection waits until the quest starts, normalizing `{ object }` fields into a `target` and defaulting to `type: 'object'` when unspecified[^1][^2]. When no requirement is available it emits a search status so detection pauses[^3]. These strategies are consumed by `CameraOrchestratorService` when initiating detection[^4].

[^1]: [src/application/services/CameraDetectionStrategy.js](../../src/application/services/CameraDetectionStrategy.js#L13-L20)
[^2]: [src/core/requirements/QuestActivationRequirement.js](../../src/core/requirements/QuestActivationRequirement.js#L1-L18)
[^3]: [src/application/services/CameraDetectionStrategy.js](../../src/application/services/CameraDetectionStrategy.js#L23-L45)
[^4]: [src/application/services/CameraOrchestratorService.js](../../src/application/services/CameraOrchestratorService.js#L168-L187) and diagnostic task ([`doc/log.md`](../../../doc/log.md#L1299))
