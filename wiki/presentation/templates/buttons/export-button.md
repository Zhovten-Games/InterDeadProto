---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/export-button.html
used_by: []
---

# Export Button Template

Provides an "Export Profile" control bound to the `export-profile` action[^1].
It is inserted into panel sections like `registration-buttons` through the button service[^2][^3].

[^1]: Markup in [export-button.html](/src/presentation/templates/buttons/export-button.html#L1).
[^2]: `ControlPanel` renders button templates via `buttonService.init` ([ControlPanel/index.js](/src/presentation/widgets/ControlPanel/index.js#L83-L90)).
[^3]: The `registration-buttons` placeholder is defined in [panel.html](/src/presentation/templates/panel.html#L36).
