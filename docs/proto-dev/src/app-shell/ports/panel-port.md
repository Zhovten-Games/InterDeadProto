---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/ports/panel-port.js
used_by:
  - src/app-shell/controls/panel-adapter.js
source_exists: true
runtime_role: IPanel
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IPanel Port

Represents a UI panel capable of showing or hiding interface sections and hosting child views.[^1] Panels act as specialized views that respond to application events.[^3]

## Relations

- Import test confirms the module loads.[^2]
- Extends the general concepts defined by `IView`.[^3]
- Observes standard naming conventions for ports.[^4]

[^1]: [src/app-shell/ports/panel-port.js](../../../../../proto-dev/src/app-shell/ports/panel-port.js)

[^2]: [tests/ports/testIPanel.test.js](../../../../../proto-dev/tests/app-shell/test-i-panel.test.js)

[^3]: [src/app-shell/ports/view-port.js](../../../../../proto-dev/src/app-shell/ports/view-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
