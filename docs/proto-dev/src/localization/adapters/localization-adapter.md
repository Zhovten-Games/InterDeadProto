---
domains: []
emits: []
implements:
  - ILocalization
imports:
  - src/localization/ports/localization-port.js
listens: []
owns:
  - basePath
  - cache
  - language
schemaVersion: 1
source: src/localization/adapters/localization-adapter.js
used_by:
  - src/localization/browser/language-adapter.js
source_exists: true
runtime_role: LocalizationAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# LocalizationAdapter

Dynamically imports JSON locale files from a configurable base path and caches them per language and domain[^1]. The `translate` method resolves keys using the cache, returning the key itself when no translation is found[^2].

[^1]: [`LocalizationAdapter.js`](../../../../../proto-dev/src/localization/adapters/localization-adapter.js)

[^2]: [`LocalizationAdapter.js`](../../../../../proto-dev/src/localization/adapters/localization-adapter.js)
