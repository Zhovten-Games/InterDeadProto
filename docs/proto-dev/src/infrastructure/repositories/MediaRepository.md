---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/repositories/MediaRepository.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# MediaRepository

MediaRepository maintains in-memory blobs for captured media, assigning identifiers and tracking corresponding object URLs[^1][^2]. Stored entries can be retrieved by ID and transformed into revocable object URLs for display[^3]. The repository also provides a `revokeAll` utility to clean up any outstanding URLs[^4].

It is registered in the bootstrap container and injected into the `CameraSectionManager` for managing captured images[^5].

[^1]: Internal maps for blobs and metadata [src/infrastructure/repositories/MediaRepository.js#L1-L7](../../../src/infrastructure/repositories/MediaRepository.js#L1-L7)
[^2]: Saving blobs with generated keys [src/infrastructure/repositories/MediaRepository.js#L9-L17](../../../src/infrastructure/repositories/MediaRepository.js#L9-L17)
[^3]: Retrieval and object URL creation [src/infrastructure/repositories/MediaRepository.js#L19-L35](../../../src/infrastructure/repositories/MediaRepository.js#L19-L35)
[^4]: URL revocation [src/infrastructure/repositories/MediaRepository.js#L37-L41](../../../src/infrastructure/repositories/MediaRepository.js#L37-L41)
[^5]: Registration and injection into `CameraSectionManager` [src/infrastructure/bootstrap/index.js#L183-L199](../../../src/infrastructure/bootstrap/index.js#L183-L199)
