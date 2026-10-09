---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/camera/ports/detection-port.js
used_by:
  - src/camera/detection/detection-adapter.js
source_exists: true
runtime_role: IDetection
contour_primary: THAL-GATE
contour_secondary: SAL-SWITCH
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# IDetection Port

Represents generalized detection capabilities, such as recognizing objects or patterns in image streams.[^1] Concrete detectors consume camera feeds and may delegate to more specialized item detectors.[^3]

## Relations

- Validated by an import test.[^2]
- Consumes visual data supplied by `ICamera` adapters.[^3]
- Maintains repository naming conventions for ports.[^4]

[^1]: [src/camera/ports/detection-port.js](../../../../../proto-dev/src/camera/ports/detection-port.js)

[^2]: [tests/ports/testIDetection.test.js](../../../../../proto-dev/tests/camera/test-i-detection.test.js)

[^3]: [src/camera/ports/camera-port.js](../../../../../proto-dev/src/camera/ports/camera-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
