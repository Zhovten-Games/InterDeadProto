---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IItemDetection.js
used_by: 
  - src/adapters/ai/ItemDetectionAdapter.js
source_exists: true
runtime_role: i_item_detection_port
contour_primary: THAL-GATE
contour_secondary: SAL-SWITCH
role_group: sensory_ingress
narrative_role: "sensory ingress gateway"
---

# IItemDetection Port

Targets detection of particular items or markers within a broader detection pipeline.[^1] It specializes `IDetection` for scenarios where specific objects must be identified.[^3]

## Relations
- Import test ensures availability.[^2]
- Extends the concepts of the general `IDetection` port.[^3]
- Respects port naming conventions.[^4]

[^1]: [src/ports/IItemDetection.js](../../src/ports/IItemDetection.js#L1)
[^2]: [tests/ports/testIItemDetection.test.js](../../tests/ports/testIItemDetection.test.js#L3-L14)
[^3]: [src/ports/IDetection.js](../../src/ports/IDetection.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
