---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/camera/ports/camera-port.js
used_by:
  - src/camera/browser/camera-adapter.js
source_exists: true
runtime_role: ICamera
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# ICamera Port

Defines a contract for controlling camera hardware and acquiring image streams for the application.[^1] Concrete implementations reside under camera adapters and typically supply frames to detection services.[^3]

## Relations

- Verified by a minimal import test ensuring the module is loadable.[^2]
- Feeds visual data to `IDetection` implementations for processing.[^3]
- Follows the project's port naming conventions.[^4]

[^1]: [src/camera/ports/camera-port.js](../../../../../proto-dev/src/camera/ports/camera-port.js)

[^2]: [tests/ports/testICamera.test.js](../../../../../proto-dev/tests/camera/test-i-camera.test.js)

[^3]: [src/camera/ports/detection-port.js](../../../../../proto-dev/src/camera/ports/detection-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
