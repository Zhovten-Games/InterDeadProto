---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-events/ports/event-bus-port.js
used_by:
  - src/runtime-events/adapters/event-bus-adapter.js
  - src/runtime-events/domain/null-event-bus.js
source_exists: true
runtime_role: IEventBus
contour_primary: SAL-SWITCH
contour_secondary: none
role_group: salience_threat
narrative_role: salience routing switch
---

# IEventBus Port

Facilitates publish/subscribe communication so services and views remain decoupled.[^1] It underpins the reactive UI approach described in the project ideals.[^4]

## Relations

- Import test ensures the module loads correctly.[^2]
- Views implementing `IView` subscribe to bus events.[^3]
- Complies with port naming conventions.[^5]

[^1]: [src/runtime-events/ports/event-bus-port.js](../../../../../proto-dev/src/runtime-events/ports/event-bus-port.js)

[^2]: [tests/ports/testIEventBus.test.js](../../../../../proto-dev/tests/runtime-events/test-i-event-bus.test.js)

[^3]: [src/app-shell/ports/view-port.js](../../../../../proto-dev/src/app-shell/ports/view-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)

[^5]: [README.md](../../../../../proto-dev/README.md)
