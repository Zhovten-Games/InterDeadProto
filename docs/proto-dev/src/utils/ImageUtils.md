---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/utils/ImageUtils.js
used_by: []
---

# ImageUtils

`ImageUtils` is reserved for browser-side image processing helpers such as grayscale conversion and histogram analysis.[^1] Legacy UI code employed it to pre-process selfies before registration, converting camera captures to grayscale data URLs.[^2] The current implementation remains a stub awaiting reintroduction of these utilities.[^3]

[^1]: [old/utils/ImageUtils.js#L3-L104](../../old/utils/ImageUtils.js#L3-L104)
[^2]: [old/managers/ViewManager.js#L5](../../old/managers/ViewManager.js#L5) and [old/managers/ViewManager.js#L955-L956](../../old/managers/ViewManager.js#L955-L956)
[^3]: [src/utils/ImageUtils.js#L1](../../src/utils/ImageUtils.js#L1)
