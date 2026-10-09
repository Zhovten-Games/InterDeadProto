---
domains: []
emits: []
implements:
  - IItemDetection
imports:
  - src/camera/ports/item-detection-port.js
listens: []
owns:
  - logger
schemaVersion: 1
source: src/camera/detection/item-detection-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: ItemDetectionAdapter
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# ItemDetectionAdapter

Placeholder service for future item recognition. It currently logs invocation and returns an empty result set, awaiting integration with a concrete AI model[^1][^2].

[^1]: [`ItemDetectionAdapter.js`](../../../../../proto-dev/src/camera/detection/item-detection-adapter.js)

[^2]: [`IItemDetection.js`](../../../../../proto-dev/src/camera/ports/item-detection-port.js)
