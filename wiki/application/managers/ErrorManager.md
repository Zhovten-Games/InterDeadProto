---
domains: []
emits: []
implements: []
imports: []
listens:
  - error
owns: []
schemaVersion: 1
source: src/application/managers/ErrorManager.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# ErrorManager

Wires the event bus to the logger by subscribing to error events. When an `error` message arrives, it extracts the message from the payload and forwards it to the provided logger instance[^1]. Boot and dispose simply manage the event subscription lifecycle[^2].

[^1]: [src/application/managers/ErrorManager.js](../../src/application/managers/ErrorManager.js#L4-L25)
[^2]: [src/application/managers/ErrorManager.js](../../src/application/managers/ErrorManager.js#L11-L19)
