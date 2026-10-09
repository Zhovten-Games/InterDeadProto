---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/controls/templates/panel.html
used_by: []
source_exists: true
runtime_role: panel
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Control Panel Template

Defines the markup for the bottom control panel, including the emoji reward drum, selection badge used by the reaction overlay,
scroll controls, and screen-specific button containers. A nested `.panel__bottom-inner` wrapper exposes `[data-js="panel-bottom"]`
for the `PanelEffectsWidget`, letting it insert a canvas while keeping the button layout intact.[^1]

`PanelAdapter` loads this template, populates the declared slots with buttons defined in configuration, and coordinates ghost
switcher options and reaction overlays by wiring the badge (`data-js="reaction-badge"`) and drum sectors for
`ReactionOverlayWidget`.[^2]

[^1]: Layout, drum, selection badge, and effect hook [src/app-shell/controls/templates/panel.html#L1-L61](../../../../../../proto-dev/src/app-shell/controls/templates/panel.html)

[^2]: Template usage in the adapter [src/app-shell/controls/panel-adapter.js#L100-L213](../../../../../../proto-dev/src/app-shell/controls/panel-adapter.js)
