---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/identity/presentation/templates/import-button.html
used_by: []
source_exists: true
runtime_role: import-button
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Import Button Template

Defines an "Import Profile" control that triggers the `import-profile` action[^1].
Control panel sections such as `registration-buttons` host this template via the button service[^2][^3].

[^1]: Markup in [import-button.html](/src/identity/presentation/templates/import-button.html).

[^2]: `ControlPanel` renders button templates via `buttonService.init` ([ControlPanel/index.js](/src/app-shell/controls/presentation/control-panel-widget.js)).

[^3]: The `registration-buttons` placeholder is defined in [panel.html](/src/app-shell/controls/templates/panel.html).
