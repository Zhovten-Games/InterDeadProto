---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/ILocalization.js
used_by:
  - src/adapters/ui/LocalizationAdapter.js
---

# ILocalization Port

Exposes localized resources such as strings or formatting rules, enabling the interface to adapt to different cultures.[^1] Language services query this port to render text in the user's language.[^3]

## Relations
- Import test verifies availability.[^2]
- Supplies data consumed by `ILanguage` implementations.[^3]
- Meets repository port-naming requirements.[^4]

[^1]: [src/ports/ILocalization.js](../../src/ports/ILocalization.js#L1)
[^2]: [tests/ports/testILocalization.test.js](../../tests/ports/testILocalization.test.js#L3-L14)
[^3]: [src/ports/ILanguage.js](../../src/ports/ILanguage.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
