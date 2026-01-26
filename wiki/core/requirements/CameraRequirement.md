---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/requirements/CameraRequirement.js
used_by:
  - src/core/requirements/QuestActivationRequirement.js
---

# CameraRequirement

Base wrapper for detection requirements passed to the camera. It normalizes the inner configuration into `type` and `target` fields and offers an overridable `isSatisfied()` hook that defaults to `true`[^1]. Specialized requirements, such as `QuestActivationRequirement`, extend it to gate detection until certain conditions are met[^2].

[^1]: [src/core/requirements/CameraRequirement.js](../../../src/core/requirements/CameraRequirement.js#L1-L16)
[^2]: [src/core/requirements/QuestActivationRequirement.js](../../../src/core/requirements/QuestActivationRequirement.js#L1-L18)
