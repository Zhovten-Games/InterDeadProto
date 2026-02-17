---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/repositories/DialogRepository.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogRepository

SQL-backed repository for storing dialog messages keyed by ghost and fingerprint. `ensureSchema` creates a table with unique
constraints on `(ghost, fingerprint)` and includes a `reaction` column so UI selections persist, adding the column lazily for
existing installs.[^1]

`appendUnique` performs conflict-aware inserts while persisting reactions, and `replaceFingerprints` migrates legacy numeric
fingerprints to content-derived hashes without losing reaction data.[^2] Higher-level services rely on `loadAll`,
`loadAllGrouped`, `replaceAll`, and `clearAll` to hydrate histories per ghost, export grouped transcripts, and bulk replace data
during profile transfers.[^3] `updateReaction` updates a single message's reaction in place for the active ghost.[^4]

[^1]: Schema creation with reaction column [src/infrastructure/repositories/DialogRepository.js#L6-L38](../../../src/infrastructure/repositories/DialogRepository.js#L6-L38)
[^2]: Upsert and migration helpers [src/infrastructure/repositories/DialogRepository.js#L40-L98](../../../src/infrastructure/repositories/DialogRepository.js#L40-L98)
[^3]: Retrieval and bulk replacement APIs [src/infrastructure/repositories/DialogRepository.js#L100-L160](../../../src/infrastructure/repositories/DialogRepository.js#L100-L160)
[^4]: Reaction update helper [src/infrastructure/repositories/DialogRepository.js#L162-L169](../../../src/infrastructure/repositories/DialogRepository.js#L162-L169)
