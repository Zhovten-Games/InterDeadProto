---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/language-selector.html
used_by: []
source_exists: true
runtime_role: language_selector_template
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: "narrative context builder"
---

# Language Selector Button

Renders a dropdown for choosing application language and dispatches a `change-language` action for the button service to handle[^1].
It is loaded into control panel sections through `buttonService` invoked by `ControlPanel`[^2].

[^1]: Structure and action attribute in [language-selector.html](/src/presentation/templates/buttons/language-selector.html#L1-L7).
[^2]: `ControlPanel` populates sections with button templates via `buttonService.init` ([ControlPanel/index.js](/src/presentation/widgets/ControlPanel/index.js#L83-L90)).
