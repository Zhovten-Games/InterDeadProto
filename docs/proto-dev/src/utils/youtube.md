---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/utils/youtube.js
used_by: 
  - src/utils/messageFingerprint.js
  - src/presentation/widgets/Dialog/index.js
source_exists: true
runtime_role: youtube_utility
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: "executive coordination hub"
---

# youtube utilities

`resolveYoutubeId` normalizes a sequence of candidate strings into a YouTube video id. It accepts raw ids, full URLs, and embed/shorts links, returning the first valid identifier found.[^1] This keeps fingerprints stable and enables dialog widgets to render YouTube thumbnails even when authors provide full URLs instead of bare ids.[^2]

[^1]: Host filtering and id extraction [src/utils/youtube.js#L1-L44](../../src/utils/youtube.js#L1-L44)
[^2]: Candidate normalization and resolver loop [src/utils/youtube.js#L46-L64](../../src/utils/youtube.js#L46-L64)
