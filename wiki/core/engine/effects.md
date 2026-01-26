---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/engine/effects.js
used_by:
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/DialogOrchestratorService.js
  - src/core/engine/reducer.js
---

# effects.js

Enumerates effect descriptors emitted by the reducer to signal side effects such as camera detection, dialog progression, or history persistence.[^1]

These effect constants are referenced in the reducer's return values, allowing middleware or outer layers to interpret them.[^2]

[^1]: [src/core/engine/effects.js#L1-L6](../../../src/core/engine/effects.js#L1-L6)  
[^2]: Reducer emits `CAMERA_DETECT` on detection start [src/core/engine/reducer.js#L30-L32](../../../src/core/engine/reducer.js#L30-L32) and `DIALOG_PROGRESS`/`HISTORY_SAVE` when advancing dialog [src/core/engine/reducer.js#L57-L71](../../../src/core/engine/reducer.js#L57-L71).
