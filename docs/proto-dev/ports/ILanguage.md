---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/ILanguage.js
used_by:
  - src/adapters/ui/LanguageAdapter.js
---

# ILanguage Port

Manages the active language of the user interface and applies translations to DOM elements.[^1] Implementations typically rely on localization resources to retrieve text.[^3]

## Relations
- Presence confirmed by an import test.[^2]
- Collaborates with `ILocalization` to supply translated strings.[^3]
- Observes the project's naming standard for ports.[^4]

[^1]: [src/ports/ILanguage.js](../../src/ports/ILanguage.js#L1)
[^2]: [tests/ports/testILanguage.test.js](../../tests/ports/testILanguage.test.js#L3-L14)
[^3]: [src/ports/ILocalization.js](../../src/ports/ILocalization.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
