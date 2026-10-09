---
domains: []
emits: []
implements:
  - CameraRequirement
imports:
  - src/quests/requirements/camera-requirement.js
listens: []
owns:
  - dualityManager
schemaVersion: 1
source: src/quests/requirements/quest-activation-requirement.js
used_by:
  - src/camera/detection/camera-detection-strategy.js
source_exists: true
runtime_role: QuestActivationRequirement
contour_primary: BG-SELECT
contour_secondary: none
role_group: executive_control
narrative_role: branch selection gate
---

# QuestActivationRequirement

Extends `CameraRequirement` to postpone detection until a quest becomes active. It queries the duality manager in `isSatisfied()` and only allows detection when `isQuestActive()` returns true[^1]. `QuestCameraStrategy` wraps quest configuration in this requirement so the camera waits for readiness before scanning[^2].

[^1]: [src/quests/requirements/quest-activation-requirement.js](../../../../../proto-dev/src/quests/requirements/quest-activation-requirement.js)

[^2]: [src/camera/detection/camera-detection-strategy.js](../../../../../proto-dev/src/camera/detection/camera-detection-strategy.js)
