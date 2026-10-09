---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/identity/presentation/templates/export-button.html
used_by: []
source_exists: true
runtime_role: export-button
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Export Button Template

Provides an "Export Profile" control bound to the `export-profile` action[^1].
It is inserted into panel sections like `registration-buttons` through the button service[^2][^3].

[^1]: Markup in [export-button.html](/src/identity/presentation/templates/export-button.html).

[^2]: `ControlPanel` renders button templates via `buttonService.init` ([ControlPanel/index.js](/src/app-shell/controls/presentation/control-panel-widget.js)).

[^3]: The `registration-buttons` placeholder is defined in [panel.html](/src/app-shell/controls/templates/panel.html).
