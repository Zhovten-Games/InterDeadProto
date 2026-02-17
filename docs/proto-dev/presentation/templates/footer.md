---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/footer.html
used_by:
  - src/presentation/adapters/GlobalViewPresenter.js
---

# footer.html

Footer template rendered by `GlobalViewPresenter` on every screen. It contains the logo slot, localized disclaimer text, and a link list whose hrefs are resolved through `data-i18n-href` so localization can supply target URLs.[^1]

[^1]: Template structure and data hooks [src/presentation/templates/footer.html#L1-L15](../../../src/presentation/templates/footer.html#L1-L15)
