---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/spirit-contacts/presentation/templates/ghost-switcher.html
used_by: []
source_exists: true
runtime_role: ghost-switcher
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Ghost Switcher Template

Offers a selector for choosing a ghost profile, emitting selection changes through the `ghost-select` element[^1].
It appears within the `ghost-switcher-buttons` area of the control panel template[^2].

[^1]: Structure in [ghost-switcher.html](/src/spirit-contacts/presentation/templates/ghost-switcher.html).

[^2]: Placeholder defined in [panel.html](/src/app-shell/controls/templates/panel.html).
