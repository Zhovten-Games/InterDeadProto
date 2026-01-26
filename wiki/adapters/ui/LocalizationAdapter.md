---
domains: []
emits: []
implements: []
imports:
  - src/ports/ILocalization.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/ui/LocalizationAdapter.js
used_by:
  - src/adapters/ui/LanguageAdapter.js
---

# LocalizationAdapter

Dynamically imports JSON locale files from a configurable base path and caches them per language and domain[^1]. The `translate` method resolves keys using the cache, returning the key itself when no translation is found[^2].

[^1]: [`LocalizationAdapter.js`](../../../src/adapters/ui/LocalizationAdapter.js#L1-L24)
[^2]: [`LocalizationAdapter.js`](../../../src/adapters/ui/LocalizationAdapter.js#L26-L29)

