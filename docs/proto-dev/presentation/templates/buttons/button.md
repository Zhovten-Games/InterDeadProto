---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/buttons/button.html
used_by: []
---

# Generic Button Template

Parameterized snippet for styled control buttons. `ButtonService` fills in the `type`, `action`, `icon`, and `i18nKey` placeholders so screen-specific controls render with proper icons, translated labels, and `data-action` hooks.[^1]

The template includes a badge slot (`data-js="control-badge"`) used for AI loading indicators on camera controls.[^2]

[^1]: Template placeholders and structural markup [src/presentation/templates/buttons/button.html#L1-L5](../../../src/presentation/templates/buttons/button.html#L1-L5)
[^2]: Badge slot used for AI loading state [src/presentation/templates/buttons/button.html#L3-L5](../../../src/presentation/templates/buttons/button.html#L3-L5)
