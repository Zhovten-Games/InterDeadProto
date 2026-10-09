---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - inner
  - target
  - type
schemaVersion: 1
source: src/quests/requirements/camera-requirement.js
used_by:
  - src/quests/requirements/quest-activation-requirement.js
source_exists: true
runtime_role: CameraRequirement
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# CameraRequirement

Base wrapper for detection requirements passed to the camera. It normalizes the inner configuration into `type` and `target` fields and offers an overridable `isSatisfied()` hook that defaults to `true`[^1]. Specialized requirements, such as `QuestActivationRequirement`, extend it to gate detection until certain conditions are met[^2].

[^1]: [src/quests/requirements/camera-requirement.js](../../../../../proto-dev/src/quests/requirements/camera-requirement.js)

[^2]: [src/quests/requirements/quest-activation-requirement.js](../../../../../proto-dev/src/quests/requirements/quest-activation-requirement.js)
