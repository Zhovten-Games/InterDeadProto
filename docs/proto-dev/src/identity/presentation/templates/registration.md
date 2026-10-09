---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/identity/presentation/templates/registration.html
used_by: []
source_exists: true
runtime_role: registration
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Registration Template

Wraps the registration panel, providing the localized title, label, and name input hooked by `GlobalViewPresenter`. The label carries `data-js="registration-label"` for text animation, while the input exposes `data-js="input-name"` and `data-action="enter-name"` so button services and validators can react to user typing.[^1]

[^1]: Markup in [registration.html](/src/identity/presentation/templates/registration.html) reuses the shared [input fragment](/src/identity/presentation/templates/input-name.html).
