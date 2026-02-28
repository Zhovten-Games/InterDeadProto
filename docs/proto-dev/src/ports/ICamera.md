---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/ICamera.js
used_by:
  - src/adapters/camera/CameraAdapter.js
---

# ICamera Port

Defines a contract for controlling camera hardware and acquiring image streams for the application.[^1] Concrete implementations reside under camera adapters and typically supply frames to detection services.[^3]

## Relations
- Verified by a minimal import test ensuring the module is loadable.[^2]
- Feeds visual data to `IDetection` implementations for processing.[^3]
- Follows the project's port naming conventions.[^4]

[^1]: [src/ports/ICamera.js](../../src/ports/ICamera.js#L1)
[^2]: [tests/ports/testICamera.test.js](../../tests/ports/testICamera.test.js#L3-L14)
[^3]: [src/ports/IDetection.js](../../src/ports/IDetection.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
