---
domains: []
emits: []
implements: []
imports:
  - src/core/requirements/CameraRequirement.js
listens: []
owns: []
schemaVersion: 1
source: src/core/requirements/QuestActivationRequirement.js
used_by:
  - src/application/services/CameraDetectionStrategy.js
---

# QuestActivationRequirement

Extends `CameraRequirement` to postpone detection until a quest becomes active. It queries the duality manager in `isSatisfied()` and only allows detection when `isQuestActive()` returns true[^1]. `QuestCameraStrategy` wraps quest configuration in this requirement so the camera waits for readiness before scanning[^2].

[^1]: [src/core/requirements/QuestActivationRequirement.js](../../../src/core/requirements/QuestActivationRequirement.js#L1-L18)
[^2]: [src/application/services/CameraDetectionStrategy.js](../../../src/application/services/CameraDetectionStrategy.js#L23-L45)
