---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/narrative-runtime/engine/effects.js
used_by:
  - src/camera/application/camera-orchestrator-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/narrative-runtime/engine/reducer.js
source_exists: true
runtime_role: CAMERA_DETECT
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# effects.js

Enumerates effect descriptors emitted by the reducer to signal side effects such as camera detection, dialog progression, or history persistence.[^1]

These effect constants are referenced in the reducer's return values, allowing middleware or outer layers to interpret them.[^2]

[^1]: [src/narrative-runtime/engine/effects.js#L1-L6](../../../../../proto-dev/src/narrative-runtime/engine/effects.js)

[^2]: Reducer emits `CAMERA_DETECT` on detection start [src/narrative-runtime/engine/reducer.js#L30-L32](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js) and `DIALOG_PROGRESS`/`HISTORY_SAVE` when advancing dialog [src/narrative-runtime/engine/reducer.js#L57-L71](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js).
