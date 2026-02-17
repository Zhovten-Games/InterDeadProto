# 7. History, persistence, and recovery

## 7.1 Database as persistent memory

`DatabaseAdapter` boots SQL.js and stores its binary image in persistence (`sqlite_db`). It creates tables for users, posts, locations, and dialog messages. This is the mechanical basis of “memory fragments” described in InterDead_application.

## 7.2 Dialog history buffering

`DialogHistoryBuffer` collects messages that arrive while the UI widget is not ready (e.g., during screen transitions). The orchestrator merges the buffer into history and replays it once the dialog widget is ready.

This avoids “silent gaps” and replaces the removed “no_messages” placeholder logic. The UI is always reconstructed from stored and buffered history rather than an empty‑state label.

**Next:** [8. Ghost switching and completion](08-ghost-switching.md)
