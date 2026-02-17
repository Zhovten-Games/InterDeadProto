---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/import-button.html
used_by: []
---

# Import Button Template

Defines an "Import Profile" control that triggers the `import-profile` action[^1].
Control panel sections such as `registration-buttons` host this template via the button service[^2][^3].

[^1]: Markup in [import-button.html](/src/presentation/templates/buttons/import-button.html#L1).
[^2]: `ControlPanel` renders button templates via `buttonService.init` ([ControlPanel/index.js](/src/presentation/widgets/ControlPanel/index.js#L83-L90)).
[^3]: The `registration-buttons` placeholder is defined in [panel.html](/src/presentation/templates/panel.html#L36).
