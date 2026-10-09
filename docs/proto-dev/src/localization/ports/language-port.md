---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/localization/ports/language-port.js
used_by:
  - src/localization/browser/language-adapter.js
source_exists: true
runtime_role: ILanguage
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ILanguage Port

Manages the active language of the user interface and applies translations to DOM elements.[^1] Implementations typically rely on localization resources to retrieve text.[^3]

## Relations

- Presence confirmed by an import test.[^2]
- Collaborates with `ILocalization` to supply translated strings.[^3]
- Observes the project's naming standard for ports.[^4]

[^1]: [src/localization/ports/language-port.js](../../../../../proto-dev/src/localization/ports/language-port.js)

[^2]: [tests/ports/testILanguage.test.js](../../../../../proto-dev/tests/localization/test-i-language.test.js)

[^3]: [src/localization/ports/localization-port.js](../../../../../proto-dev/src/localization/ports/localization-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
