---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IDetection.js
used_by:
  - src/adapters/ai/DetectionAdapter.js
---

# IDetection Port

Represents generalized detection capabilities, such as recognizing objects or patterns in image streams.[^1] Concrete detectors consume camera feeds and may delegate to more specialized item detectors.[^3]

## Relations
- Validated by an import test.[^2]
- Consumes visual data supplied by `ICamera` adapters.[^3]
- Maintains repository naming conventions for ports.[^4]

[^1]: [src/ports/IDetection.js](../../src/ports/IDetection.js#L1)
[^2]: [tests/ports/testIDetection.test.js](../../tests/ports/testIDetection.test.js#L3-L14)
[^3]: [src/ports/ICamera.js](../../src/ports/ICamera.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
