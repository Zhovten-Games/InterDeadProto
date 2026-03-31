---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IVisualEffects.js
used_by: 
  - src/adapters/ui/VisualEffectsAdapter.js
source_exists: true
runtime_role: i_visual_effects_port
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: "embodied feedback channel"
---

# IVisualEffects Port

Provides hooks for applying animations or other visual enhancements to UI elements.[^1] Views call into this port to keep effect logic separate from rendering logic.[^3]

## Relations
- Import test checks the module is present.[^2]
- Applied by `IView` implementations when animating transitions.[^3]
- Compliant with port naming conventions.[^4]

[^1]: [src/ports/IVisualEffects.js](../../src/ports/IVisualEffects.js#L1)
[^2]: [tests/ports/testIVisualEffects.test.js](../../tests/ports/testIVisualEffects.test.js#L3-L14)
[^3]: [src/ports/IView.js](../../src/ports/IView.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
