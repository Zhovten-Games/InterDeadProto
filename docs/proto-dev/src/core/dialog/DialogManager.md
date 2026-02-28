---
domains: []
emits:
  - EVENT_MESSAGE_READY
implements: []
imports:
  - src/core/Service.js
  - src/core/events/constants.js
listens: []
owns: []
schemaVersion: 1
source: src/core/dialog/DialogManager.js
used_by:
  - src/infrastructure/bootstrap/modules/DomainModule.js
---

# DialogManager

`DialogManager` orchestrates dialog progression, emitting `EVENT_MESSAGE_READY` for each message and persisting state.[^1]  
It extends `Service` to reuse logging helpers.[^2]

The manager collaborates with other components:  
- It wraps a `Dialog` instance to fetch the next message.[^3]  
- Button state updates depend on a button state service, aligning UI with dialog expectations.[^4]  
- Events use constants from the core event registry, enabling other subsystems to react.[^5]

[^1]: [src/core/dialog/DialogManager.js#L33-L60](../../../src/core/dialog/DialogManager.js#L33-L60)  
[^2]: [src/core/dialog/DialogManager.js#L7-L31](../../../src/core/dialog/DialogManager.js#L7-L31)  
[^3]: [src/core/dialog/DialogManager.js#L35-L36](../../../src/core/dialog/DialogManager.js#L35-L36)  
[^4]: [src/core/dialog/DialogManager.js#L53-L56](../../../src/core/dialog/DialogManager.js#L53-L56)  
[^5]: [src/core/events/constants.js#L1-L3](../../../src/core/events/constants.js#L1-L3)
