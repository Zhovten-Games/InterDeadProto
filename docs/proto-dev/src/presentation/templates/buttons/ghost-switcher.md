---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/ghost-switcher.html
used_by: []
source_exists: true
runtime_role: ghost_switcher_template
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: "narrative context builder"
---

# Ghost Switcher Template

Offers a selector for choosing a ghost profile, emitting selection changes through the `ghost-select` element[^1].
It appears within the `ghost-switcher-buttons` area of the control panel template[^2].

[^1]: Structure in [ghost-switcher.html](/src/presentation/templates/buttons/ghost-switcher.html#L1-L4).
[^2]: Placeholder defined in [panel.html](/src/presentation/templates/panel.html#L51).
