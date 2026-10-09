---
domains: []
emits: []
implements: []
imports:
  - src/narrative-runtime/engine/actions.js
  - src/narrative-runtime/engine/effects.js
  - src/runtime-configuration/feature-flags.js
listens:
  - AWAIT_USER
  - DETECTION_DONE
  - DETECTION_FINISHED
  - DETECTION_START
  - DIALOG_ADVANCE
  - DIALOG_POST
  - QUEST_COMPLETE
  - QUEST_START
  - REPLAY_HISTORY
owns: []
schemaVersion: 1
source: src/narrative-runtime/engine/reducer.js
used_by:
  - src/narrative-runtime/engine/store.js
source_exists: true
runtime_role: initialState
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# reducer.js

Implements the pure reducer at the heart of the core engine, managing detection, dialog, quest, and DSL indices.[^1]

For each action type, it returns a new state along with effect descriptors, enabling a functional architecture where side effects are processed externally.[^2]

The reducer consumes action constants and effect identifiers defined in sibling modules, maintaining clear separation of concerns.[^3]

[^1]: [src/narrative-runtime/engine/reducer.js#L1-L23](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js)

[^2]: [src/narrative-runtime/engine/reducer.js#L24-L97](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js)

[^3]: [src/narrative-runtime/engine/reducer.js#L4-L14](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js)
