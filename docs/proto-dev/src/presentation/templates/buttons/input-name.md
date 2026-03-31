---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/input-name.html
used_by: []
source_exists: true
runtime_role: input_name_template
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: "narrative context builder"
---

# Input Name Template

Provides the localized inline name field reused across registration flows. The label exposes `data-js="registration-label"` for `GlobalViewPresenter`'s text animation and the input exposes `data-js="input-name"` plus the `enter-name` action so `ButtonService` can hook validation and submission.[^1]

[^1]: Markup in [buttons/input-name.html](/src/presentation/templates/buttons/input-name.html#L1-L7).
