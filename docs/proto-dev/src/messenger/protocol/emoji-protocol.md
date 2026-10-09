---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/messenger/protocol/emoji-protocol.js
used_by:
  - src/localization/browser/language-adapter.js
source_exists: true
runtime_role: EMOJI_PROTOCOL_LABEL_KEYS
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# emojiProtocol utilities

These helpers detect and format Emoji Protocol blocks for UI rendering. `isEmojiProtocolText` treats a message as protocol text when it contains exactly six non‑empty lines, and `splitEmojiProtocolLines` normalizes the lines for further processing.[^1]

`buildEmojiProtocolHtml` escapes labels and values and renders a consistent line‑by‑line HTML structure so the dialog UI can display labeled protocol rows without risking markup injection.[^2]

[^1]: Line parsing and protocol detection [src/messenger/protocol/emoji-protocol.js#L1-L29](../../../../../proto-dev/src/messenger/protocol/emoji-protocol.js)

[^2]: HTML generation and escaping [src/messenger/protocol/emoji-protocol.js#L31-L62](../../../../../proto-dev/src/messenger/protocol/emoji-protocol.js)
