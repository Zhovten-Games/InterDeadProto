---
domains: []
emits: []
implements: []
imports: 
  - src/ports/ICamera.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/camera/CameraAdapter.js
used_by: 
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
source_exists: true
runtime_role: camera_adapter
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: "sensory ingress gateway"
---

# CameraAdapter

Handles camera stream lifecycle. `_initStream` requests `getUserMedia`, creates a video element, and toggles indicator widgets for recording and retry states[^1]. The `takeSelfie` helper captures a still frame without interrupting the ongoing stream, returning a JPEG blob for downstream services[^2]. Logging is delegated to implementations like `LoggingAdapter` passed in via the constructor[^3].

[^1]: [`CameraAdapter.js`](../../../src/adapters/camera/CameraAdapter.js#L10-L40)
[^2]: [`CameraAdapter.js`](../../../src/adapters/camera/CameraAdapter.js#L70-L96)
[^3]: [`LoggingAdapter.js`](../../../src/adapters/logging/LoggingAdapter.js#L3-L46)

