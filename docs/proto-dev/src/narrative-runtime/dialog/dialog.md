---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - index
  - messages
  - typingDelay
schemaVersion: 1
source: src/narrative-runtime/dialog/dialog.js
used_by:
  - src/narrative-runtime/sequence/stage.js
  - src/app-shell/composition/domain-module.js
source_exists: true
runtime_role: Dialog
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Dialog

`Dialog` encapsulates a queue of messages exchanged between the user and the ghost, advancing with `next()` and tracking completion state.[^1]

A `Stage` builds a new `Dialog` from event messages, enabling each duality stage to provide its own conversation.[^2]  
`DialogManager` consumes a `Dialog` instance to emit messages onto the event bus and persist progress.[^3]

[^1]: [src/narrative-runtime/dialog/dialog.js#L1-L32](../../../../../proto-dev/src/narrative-runtime/dialog/dialog.js)

[^2]: [src/narrative-runtime/sequence/stage.js#L30-L31](../../../../../proto-dev/src/narrative-runtime/sequence/stage.js)

[^3]: [src/narrative-runtime/dialog/dialog-manager.js#L35-L36](../../../../../proto-dev/src/narrative-runtime/dialog/dialog-manager.js)
