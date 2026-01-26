---
domains: []
emits: []
implements: []
imports:
  - src/utils/messageFingerprint.js
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/Dialog/MessageDeduplicator.js
used_by:
  - src/presentation/widgets/Dialog/index.js
---

# MessageDeduplicator

Tracks fingerprints, ids, and content keys to prevent duplicate chat messages from rendering[^1].
The content key is composed from the message's ghost, author, type, text, and source URL or media identifier.
It exposes `register(msg)` to determine if a message is new and `clear()` to reset its cache.
Instantiated by [DialogWidget](./index.md) to filter incoming events before rendering[^2].

[^1]: Deduplication logic in [MessageDeduplicator.js](/src/presentation/widgets/Dialog/MessageDeduplicator.js#L1-L41).
[^2]: Created and used within [Dialog/index.js](/src/presentation/widgets/Dialog/index.js#L31-L39 and L66-L71).
