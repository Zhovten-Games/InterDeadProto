---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/utils/emojiProtocol.js
used_by:
  - src/adapters/ui/LanguageAdapter.js
  - src/presentation/components/dialog/animations/TextAnimationManager.js
---

# emojiProtocol utilities

These helpers detect and format Emoji Protocol blocks for UI rendering. `isEmojiProtocolText` treats a message as protocol text when it contains exactly six non‑empty lines, and `splitEmojiProtocolLines` normalizes the lines for further processing.[^1]

`buildEmojiProtocolHtml` escapes labels and values and renders a consistent line‑by‑line HTML structure so the dialog UI can display labeled protocol rows without risking markup injection.[^2]

[^1]: Line parsing and protocol detection [src/utils/emojiProtocol.js#L1-L29](../../src/utils/emojiProtocol.js#L1-L29)
[^2]: HTML generation and escaping [src/utils/emojiProtocol.js#L31-L62](../../src/utils/emojiProtocol.js#L31-L62)
