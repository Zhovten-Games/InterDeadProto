---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/media/images/image-utils.js
used_by: []
source_exists: true
runtime_role: image-utils
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ImageUtils

`ImageUtils` is reserved for browser-side image processing helpers such as grayscale conversion and histogram analysis.[^1] Legacy UI code employed it to pre-process selfies before registration, converting camera captures to grayscale data URLs.[^2] The current implementation remains a stub awaiting reintroduction of these utilities.[^3]

[^1]: old/utils/ImageUtils.js#L3-L104 (историческая ссылка отсутствует в baseline; не используется как evidence)

[^2]: old/managers/ViewManager.js#L5 (историческая ссылка отсутствует в baseline; не используется как evidence) and old/managers/ViewManager.js#L955-L956 (историческая ссылка отсутствует в baseline; не используется как evidence)

[^3]: [src/media/images/image-utils.js#L1](../../../../../proto-dev/src/media/images/image-utils.js)
