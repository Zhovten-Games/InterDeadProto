---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/button.html
used_by: []
---

# Generic Button Template

Serves as a parameterized snippet for building styled buttons.
`ButtonService` fills in `type`, `action`, and `i18nKey` placeholders to produce screen-specific controls[^1].
These buttons populate sections of the control panel during rendering[^2].

[^1]: Template placeholders defined in [button.html](/src/presentation/templates/buttons/button.html#L1).
[^2]: Sections are initialized by `ControlPanel` via `buttonService.init` ([ControlPanel/index.js](/src/presentation/widgets/ControlPanel/index.js#L83-L90)).
