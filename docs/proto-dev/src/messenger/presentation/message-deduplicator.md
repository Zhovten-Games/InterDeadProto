---
domains: []
emits: []
implements: []
imports:
  - src/messenger/identity/message-fingerprint.js
listens: []
owns:
  - _seen
schemaVersion: 1
source: src/messenger/presentation/message-deduplicator.js
used_by:
  - src/messenger/presentation/dialog-widget.js
source_exists: true
runtime_role: MessageDeduplicator
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# MessageDeduplicator

Tracks fingerprints, ids, and content keys to prevent duplicate chat messages from rendering[^1].
The content key is composed from the message's ghost, author, type, text, and source URL or media identifier.
It exposes `register(msg)` to determine if a message is new and `clear()` to reset its cache.
Instantiated by [DialogWidget](dialog-widget.md) to filter incoming events before rendering[^2].

[^1]: Deduplication logic in [MessageDeduplicator.js](/src/messenger/presentation/message-deduplicator.js).

[^2]: Created and used within [Dialog/index.js](/src/messenger/presentation/dialog-widget.js#L31-L39 and L66-L71).
