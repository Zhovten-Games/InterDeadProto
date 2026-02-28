---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/Service.js
used_by:
  - src/application/services/AvatarService.js
  - src/core/dialog/DialogManager.js
---

# Service

`Service` is an abstract base class offering optional logging facilities.  
Child classes call `debug`, `info`, `warn`, or `error` to emit messages through the injected logger.[^1]

Many core managers extend `Service` to inherit consistent logging, such as `DialogManager` which progresses dialogs while emitting state changes.[^2]

[^1]: [src/core/Service.js#L1-L21](../../src/core/Service.js#L1-L21)
[^2]: [src/core/dialog/DialogManager.js#L7-L31](../../src/core/dialog/DialogManager.js#L7-L31)
