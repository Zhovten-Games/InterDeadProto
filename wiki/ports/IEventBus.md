---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IEventBus.js
used_by:
  - src/adapters/logging/EventBusAdapter.js
  - src/application/services/ButtonService.js
  - src/application/services/CameraOrchestratorService.js
  - src/core/events/NullEventBus.js
---

# IEventBus Port

Facilitates publish/subscribe communication so services and views remain decoupled.[^1] It underpins the reactive UI approach described in the project ideals.[^4]

## Relations
- Import test ensures the module loads correctly.[^2]
- Views implementing `IView` subscribe to bus events.[^3]
- Complies with port naming conventions.[^5]

[^1]: [src/ports/IEventBus.js](../../src/ports/IEventBus.js#L1)
[^2]: [tests/ports/testIEventBus.test.js](../../tests/ports/testIEventBus.test.js#L3-L14)
[^3]: [src/ports/IView.js](../../src/ports/IView.js#L1)
[^4]: [README.md](../../README.md#L27-L27)
[^5]: [README.md](../../README.md#L23-L24)
