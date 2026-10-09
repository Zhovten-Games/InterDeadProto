---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _handler
  - bus
  - logger
schemaVersion: 1
source: src/runtime-diagnostics/application/error-manager.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: ErrorManager
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ErrorManager

Wires the event bus to the logger by subscribing to error events. When an `error` message arrives, it extracts the message from the payload and forwards it to the provided logger instance[^1]. Boot and dispose simply manage the event subscription lifecycle[^2].

[^1]: [src/runtime-diagnostics/application/error-manager.js](../../../../../proto-dev/src/runtime-diagnostics/application/error-manager.js)

[^2]: [src/runtime-diagnostics/application/error-manager.js](../../../../../proto-dev/src/runtime-diagnostics/application/error-manager.js)
