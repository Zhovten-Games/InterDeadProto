---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/asset-delivery/paths/url-utils.js
used_by: []
source_exists: true
runtime_role: url-utils
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# urlUtils

The `urlUtils` module is intended for URL-related helpers such as parsing query parameters.[^1] Legacy bootstrap code used `parseUrlParam` to choose the initial ghost at startup.[^2] The present module is an empty placeholder awaiting a modern implementation.[^3]

[^1]: old/utils/urlUtils.js#L1-L30 (историческая ссылка отсутствует в baseline; не используется как evidence)

[^2]: old/bootstrap/index.js#L18 (историческая ссылка отсутствует в baseline; не используется как evidence) and old/bootstrap/index.js#L101-L104 (историческая ссылка отсутствует в baseline; не используется как evidence)

[^3]: [src/asset-delivery/paths/url-utils.js#L1](../../../../../proto-dev/src/asset-delivery/paths/url-utils.js)
