---
title: assetsBaseUrl
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _cachedBaseUrl
  - documentRef
  - locationUrl
  - moduleUrl
  - resolver
schemaVersion: 1
source: src/asset-delivery/paths/assets-base-url.js
source_exists: true
runtime_role: AssetsBaseUrlResolver
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
used_by:
  - src/camera/detection/detection-adapter.js
  - src/storage/browser/database-adapter.js
  - src/narrative-runtime/configuration/duality-config-service.js
  - src/reactions/configuration/reaction-finale-config.js
  - src/spirit-contacts/configuration/guest1.js
  - src/spirit-contacts/configuration/guide.js
  - src/app-shell/presentation/global-view-presenter.js
---

# assetsBaseUrl

Computes base URL used to resolve static asset paths. Source: `proto-dev/src/asset-delivery/paths/assets-base-url.js`.
