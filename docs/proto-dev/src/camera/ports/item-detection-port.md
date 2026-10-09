---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/camera/ports/item-detection-port.js
used_by:
  - src/camera/detection/item-detection-adapter.js
source_exists: true
runtime_role: IItemDetection
contour_primary: THAL-GATE
contour_secondary: SAL-SWITCH
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# IItemDetection Port

Targets detection of particular items or markers within a broader detection pipeline.[^1] It specializes `IDetection` for scenarios where specific objects must be identified.[^3]

## Relations

- Import test ensures availability.[^2]
- Extends the concepts of the general `IDetection` port.[^3]
- Respects port naming conventions.[^4]

[^1]: [src/camera/ports/item-detection-port.js](../../../../../proto-dev/src/camera/ports/item-detection-port.js)

[^2]: [tests/ports/testIItemDetection.test.js](../../../../../proto-dev/tests/camera/test-i-item-detection.test.js)

[^3]: [src/camera/ports/detection-port.js](../../../../../proto-dev/src/camera/ports/detection-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
