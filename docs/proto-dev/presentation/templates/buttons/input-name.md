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
---

# Input Name Template

Provides the localized inline name field reused across registration flows. The label exposes `data-js="registration-label"` for `GlobalViewPresenter`'s text animation and the input exposes `data-js="input-name"` plus the `enter-name` action so `ButtonService` can hook validation and submission.[^1]

[^1]: Markup in [buttons/input-name.html](/src/presentation/templates/buttons/input-name.html#L1-L7).
