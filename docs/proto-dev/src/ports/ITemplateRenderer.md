---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/ITemplateRenderer.js
used_by: 
  - src/adapters/ui/TemplateAdapter.js
source_exists: true
runtime_role: i_template_renderer_port
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: "executive coordination hub"
---

# ITemplateRenderer Port

Renders HTML templates into DOM fragments or strings ready for insertion into the UI.[^1] Views use this port to generate their markup in a technology-agnostic way.[^3]

## Relations
- Import test validates the existence of the module.[^2]
- Consumed by `IView` implementations to build UI elements.[^3]
- Follows repository naming conventions for ports.[^4]

[^1]: [src/ports/ITemplateRenderer.js](../../src/ports/ITemplateRenderer.js#L1)
[^2]: [tests/ports/testITemplateRenderer.test.js](../../tests/ports/testITemplateRenderer.test.js#L3-L14)
[^3]: [src/ports/IView.js](../../src/ports/IView.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
