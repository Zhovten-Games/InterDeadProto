---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/ports/template-renderer-port.js
used_by:
  - src/app-shell/presentation/template-adapter.js
source_exists: true
runtime_role: ITemplateRenderer
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ITemplateRenderer Port

Renders HTML templates into DOM fragments or strings ready for insertion into the UI.[^1] Views use this port to generate their markup in a technology-agnostic way.[^3]

## Relations

- Import test validates the existence of the module.[^2]
- Consumed by `IView` implementations to build UI elements.[^3]
- Follows repository naming conventions for ports.[^4]

[^1]: [src/app-shell/ports/template-renderer-port.js](../../../../../proto-dev/src/app-shell/ports/template-renderer-port.js)

[^2]: [tests/ports/testITemplateRenderer.test.js](../../../../../proto-dev/tests/app-shell/test-i-template-renderer.test.js)

[^3]: [src/app-shell/ports/view-port.js](../../../../../proto-dev/src/app-shell/ports/view-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
