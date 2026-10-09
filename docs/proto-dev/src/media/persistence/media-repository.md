---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _blobs
  - _id
  - _meta
  - _urls
  - database
schemaVersion: 1
source: src/media/persistence/media-repository.js
used_by:
  - src/identity/application/profile-transfer-service.js
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: MediaRepository
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# MediaRepository

MediaRepository maintains in-memory blobs for captured media, assigning identifiers and tracking corresponding object URLs[^1][^2]. Stored entries can be retrieved by ID and transformed into revocable object URLs for display[^3]. The repository also provides a `revokeAll` utility to clean up any outstanding URLs[^4].

It is registered in the bootstrap container and injected into the `CameraSectionManager` for managing captured images[^5].

[^1]: Internal maps for blobs and metadata [src/media/persistence/media-repository.js#L1-L7](../../../../../proto-dev/src/media/persistence/media-repository.js)

[^2]: Saving blobs with generated keys [src/media/persistence/media-repository.js#L9-L17](../../../../../proto-dev/src/media/persistence/media-repository.js)

[^3]: Retrieval and object URL creation [src/media/persistence/media-repository.js#L19-L35](../../../../../proto-dev/src/media/persistence/media-repository.js)

[^4]: URL revocation [src/media/persistence/media-repository.js#L37-L41](../../../../../proto-dev/src/media/persistence/media-repository.js)

[^5]: Registration and injection into `CameraSectionManager` [src/app-shell/bootstrap/index.js#L183-L199](../../../../../proto-dev/src/app-shell/bootstrap/index.js)
