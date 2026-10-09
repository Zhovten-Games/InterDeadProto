---
domains: []
emits:
  - DETECTION_SEARCH
implements:
  - CameraDetectionStrategy
  - CameraDetectionStrategy
imports:
  - src/quests/requirements/quest-activation-requirement.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - bus
  - dualityManager
schemaVersion: 1
source: src/camera/detection/camera-detection-strategy.js
used_by:
  - src/camera/application/camera-orchestrator-service.js
source_exists: true
runtime_role: CameraDetectionStrategy
contour_primary: THAL-GATE
contour_secondary: SAL-SWITCH
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# CameraDetectionStrategy

Defines pluggable strategies describing what the camera should detect. `RegistrationCameraStrategy` always requests human presence, while `QuestCameraStrategy` wraps quest requirements in a `QuestActivationRequirement` so detection waits until the quest starts, normalizing `{ object }` fields into a `target` and defaulting to `type: 'object'` when unspecified[^1][^2]. When no requirement is available it emits a search status so detection pauses[^3]. These strategies are consumed by `CameraOrchestratorService` when initiating detection[^4].

[^1]: [src/camera/detection/camera-detection-strategy.js](../../../../../proto-dev/src/camera/detection/camera-detection-strategy.js)

[^2]: [src/quests/requirements/quest-activation-requirement.js](../../../../../proto-dev/src/quests/requirements/quest-activation-requirement.js)

[^3]: [src/camera/detection/camera-detection-strategy.js](../../../../../proto-dev/src/camera/detection/camera-detection-strategy.js)

[^4]: [src/camera/application/camera-orchestrator-service.js](../../../../../proto-dev/src/camera/application/camera-orchestrator-service.js) and diagnostic task (`doc/log.md` (историческая ссылка отсутствует в baseline; не используется как evidence))
