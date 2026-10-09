---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/controls/templates/button.html
used_by: []
source_exists: true
runtime_role: button
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Generic Button Template

Parameterized snippet for styled control buttons. `ButtonService` fills in the `type`, `action`, `icon`, and `i18nKey` placeholders so screen-specific controls render with proper icons, translated labels, and `data-action` hooks.[^1]

The template includes a badge slot (`data-js="control-badge"`) used for AI loading indicators on camera controls.[^2]

[^1]: Template placeholders and structural markup [src/app-shell/controls/templates/button.html#L1-L5](../../../../../../proto-dev/src/app-shell/controls/templates/button.html)

[^2]: Badge slot used for AI loading state [src/app-shell/controls/templates/button.html#L3-L5](../../../../../../proto-dev/src/app-shell/controls/templates/button.html)
