---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/localization/locales/en/ui.json
used_by: []
source_exists: true
runtime_role: ui
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# English UI Strings

English UI copy for navigation, AI loader feedback, chat launcher labels, and profile registration flows. It also includes spirit dialog keys (`guide.*`, `guest1.*`), profile import/export prompts, and reaction finale messaging used by the dialog widgets and overlays.[^1]

Ghost switching confirmation strings (`ghost_switch.*`) and AI camera badge/loader text are included so control panels and AI overlays can surface contextual prompts and status updates.[^2]

[^1]: UI labels, spirit dialog text, profile import/export, and reactions [src/localization/locales/en/ui.json#L2-L101](../../../../../../proto-dev/src/localization/locales/en/ui.json)

[^2]: Launcher, AI loader, and ghost-switch prompts [src/localization/locales/en/ui.json#L21-L105](../../../../../../proto-dev/src/localization/locales/en/ui.json)
