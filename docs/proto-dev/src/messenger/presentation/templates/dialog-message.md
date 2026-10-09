---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/messenger/presentation/templates/dialog-message.html
used_by: []
source_exists: true
runtime_role: dialog-message
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# Dialog Message Template

Represents a single chat message with placeholders for avatar, media, text, and the reaction container rendered by
`DialogWidget`.[^1] Reaction markup hosts the trigger button and status badge generated per message so the overlay workflow can
highlight or update reactions without re-rendering the entire message.[^2]

[^1]: Template fields in [dialog-message.html#L1-L5](../../../../../../proto-dev/src/messenger/presentation/templates/dialog-message.html)

[^2]: Reaction block population in [Dialog/index.js#L332-L368](../../../../../../proto-dev/src/messenger/presentation/dialog-widget.js)
