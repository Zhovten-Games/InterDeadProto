---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/localization/locales/en/loader.json
used_by: []
source_exists: true
runtime_role: loader
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# English Loader Strings

Provides themed module names for loader steps (`boot.db`, `boot.camera`, `boot.lang`, `boot.templates`, `boot.geo`). Each key maps to an array so `LoaderModuleNameProvider` can surface a different phrase on every animation pass.[^1]

[^1]: Loader name arrays [src/localization/locales/en/loader.json#L1-L21](../../../../../../proto-dev/src/localization/locales/en/loader.json)
