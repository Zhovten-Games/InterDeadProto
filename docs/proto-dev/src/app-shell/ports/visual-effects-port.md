---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/ports/visual-effects-port.js
used_by:
  - src/app-shell/visual-effects/visual-effects-adapter.js
source_exists: true
runtime_role: IVisualEffects
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# IVisualEffects Port

Provides hooks for applying animations or other visual enhancements to UI elements.[^1] Views call into this port to keep effect logic separate from rendering logic.[^3]

## Relations

- Import test checks the module is present.[^2]
- Applied by `IView` implementations when animating transitions.[^3]
- Compliant with port naming conventions.[^4]

[^1]: [src/app-shell/ports/visual-effects-port.js](../../../../../proto-dev/src/app-shell/ports/visual-effects-port.js)

[^2]: [tests/ports/testIVisualEffects.test.js](../../../../../proto-dev/tests/app-shell/test-i-visual-effects.test.js)

[^3]: [src/app-shell/ports/view-port.js](../../../../../proto-dev/src/app-shell/ports/view-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
