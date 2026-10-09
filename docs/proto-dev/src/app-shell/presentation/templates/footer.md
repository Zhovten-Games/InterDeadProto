---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/presentation/templates/footer.html
used_by: []
source_exists: true
runtime_role: footer
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# footer.html

Footer template rendered by `GlobalViewPresenter` on every screen. It contains the logo slot, localized disclaimer text, and a link list whose hrefs are resolved through `data-i18n-href` so localization can supply target URLs.[^1]

[^1]: Template structure and data hooks [src/app-shell/presentation/templates/footer.html#L1-L15](../../../../../../proto-dev/src/app-shell/presentation/templates/footer.html)
