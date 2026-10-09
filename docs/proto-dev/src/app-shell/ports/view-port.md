---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/ports/view-port.js
used_by:
  - src/app-shell/navigation/view-adapter.js
source_exists: true
runtime_role: IView
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IView Port

Defines the minimal contract for visual components capable of rendering and reacting to application events.[^1] Views typically render templates and subscribe to the event bus for updates.[^3]

## Relations

- Import test guarantees the module loads.[^2]
- Works with `IEventBus` to receive state changes.[^3]
- Honors repository port naming conventions.[^4]

[^1]: [src/app-shell/ports/view-port.js](../../../../../proto-dev/src/app-shell/ports/view-port.js)

[^2]: [tests/ports/testIView.test.js](../../../../../proto-dev/tests/app-shell/test-i-view.test.js)

[^3]: [src/runtime-events/ports/event-bus-port.js](../../../../../proto-dev/src/runtime-events/ports/event-bus-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
