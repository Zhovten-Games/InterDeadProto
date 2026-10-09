---
domains: []
emits:
  - EVENT_MESSAGE_READY
implements:
  - Service
imports:
  - src/runtime-diagnostics/service.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - _msgSeq
  - _orderSeq
  - buttonStateService
  - dialog
  - eventBus
  - persistence
  - timeline
schemaVersion: 1
source: src/narrative-runtime/dialog/dialog-manager.js
used_by:
  - src/app-shell/composition/domain-module.js
source_exists: true
runtime_role: DialogManager
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DialogManager

`DialogManager` orchestrates dialog progression, emitting `EVENT_MESSAGE_READY` for each message and persisting state.[^1]  
It extends `Service` to reuse logging helpers.[^2]

The manager collaborates with other components:

- It wraps a `Dialog` instance to fetch the next message.[^3]
- Button state updates depend on a button state service, aligning UI with dialog expectations.[^4]
- Events use constants from the core event registry, enabling other subsystems to react.[^5]

[^1]: [src/narrative-runtime/dialog/dialog-manager.js#L33-L60](../../../../../proto-dev/src/narrative-runtime/dialog/dialog-manager.js)

[^2]: [src/narrative-runtime/dialog/dialog-manager.js#L7-L31](../../../../../proto-dev/src/narrative-runtime/dialog/dialog-manager.js)

[^3]: [src/narrative-runtime/dialog/dialog-manager.js#L35-L36](../../../../../proto-dev/src/narrative-runtime/dialog/dialog-manager.js)

[^4]: [src/narrative-runtime/dialog/dialog-manager.js#L53-L56](../../../../../proto-dev/src/narrative-runtime/dialog/dialog-manager.js)

[^5]: [src/runtime-events/domain/constants.js#L1-L3](../../../../../proto-dev/src/runtime-events/domain/constants.js)
