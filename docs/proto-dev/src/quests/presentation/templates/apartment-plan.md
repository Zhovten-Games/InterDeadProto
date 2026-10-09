---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/quests/presentation/templates/apartment-plan.html
used_by: []
source_exists: true
runtime_role: apartment-plan
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Apartment Plan Template

Provides the layout for the location detection screen with a heading and placeholders for coordinates.
Control buttons for this screen appear in the `apartment-plan-buttons` slot of the main control panel[^2].

[^1]: Structure defined in [apartment-plan.html](/src/quests/presentation/templates/apartment-plan.html).

[^2]: Buttons mount into the `apartment-plan-buttons` container declared in [panel.html](/src/app-shell/controls/templates/panel.html).
