---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/i18n/locales/en/loader.json
used_by: []
---

# English Loader Strings

Provides themed module names for loader steps (`boot.db`, `boot.camera`, `boot.lang`, `boot.templates`, `boot.geo`). Each key maps to an array so `LoaderModuleNameProvider` can surface a different phrase on every animation pass.[^1]

[^1]: Loader name arrays [src/i18n/locales/en/loader.json#L1-L21](../../../../src/i18n/locales/en/loader.json#L1-L21)
