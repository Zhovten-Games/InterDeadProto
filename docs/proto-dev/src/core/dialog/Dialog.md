---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/dialog/Dialog.js
used_by:
  - src/core/sequence/Stage.js
  - src/infrastructure/bootstrap/modules/DomainModule.js
---

# Dialog

`Dialog` encapsulates a queue of messages exchanged between the user and the ghost, advancing with `next()` and tracking completion state.[^1]

A `Stage` builds a new `Dialog` from event messages, enabling each duality stage to provide its own conversation.[^2]  
`DialogManager` consumes a `Dialog` instance to emit messages onto the event bus and persist progress.[^3]

[^1]: [src/core/dialog/Dialog.js#L1-L32](../../../src/core/dialog/Dialog.js#L1-L32)
[^2]: [src/core/sequence/Stage.js#L30-L31](../../../src/core/sequence/Stage.js#L30-L31)
[^3]: [src/core/dialog/DialogManager.js#L35-L36](../../../src/core/dialog/DialogManager.js#L35-L36)
