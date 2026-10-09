---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/localization/ports/localization-port.js
used_by:
  - src/localization/adapters/localization-adapter.js
source_exists: true
runtime_role: ILocalization
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ILocalization Port

Exposes localized resources such as strings or formatting rules, enabling the interface to adapt to different cultures.[^1] Language services query this port to render text in the user's language.[^3]

## Relations

- Import test verifies availability.[^2]
- Supplies data consumed by `ILanguage` implementations.[^3]
- Meets repository port-naming requirements.[^4]

[^1]: [src/localization/ports/localization-port.js](../../../../../proto-dev/src/localization/ports/localization-port.js)

[^2]: [tests/ports/testILocalization.test.js](../../../../../proto-dev/tests/localization/test-i-localization.test.js)

[^3]: [src/localization/ports/language-port.js](../../../../../proto-dev/src/localization/ports/language-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
