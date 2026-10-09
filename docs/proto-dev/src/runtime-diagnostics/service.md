---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - logger
schemaVersion: 1
source: src/runtime-diagnostics/service.js
used_by:
  - src/identity/application/avatar-service.js
  - src/narrative-runtime/dialog/dialog-manager.js
source_exists: true
runtime_role: Service
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Service

`Service` is an abstract base class offering optional logging facilities.  
Child classes call `debug`, `info`, `warn`, or `error` to emit messages through the injected logger.[^1]

Many core managers extend `Service` to inherit consistent logging, such as `DialogManager` which progresses dialogs while emitting state changes.[^2]

[^1]: [src/runtime-diagnostics/service.js#L1-L21](../../../../proto-dev/src/runtime-diagnostics/service.js)

[^2]: [src/narrative-runtime/dialog/dialog-manager.js#L7-L31](../../../../proto-dev/src/narrative-runtime/dialog/dialog-manager.js)
