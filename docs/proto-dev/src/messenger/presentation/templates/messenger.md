---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/messenger/presentation/templates/messenger.html
used_by: []
source_exists: true
runtime_role: messenger
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Messenger Screen Template

Sets up the messenger view with a scrollable dialog list and a container for posts[^1].
`ChatScrollWidget` uses the `[data-js="messenger-container"]` element to manage scrolling[^2], while `DialogWidget` renders messages into `[data-js="dialog-list"]`[^3].

[^1]: Layout defined in [messenger.html](/src/messenger/presentation/templates/messenger.html).

[^2]: Default selector in [ChatScrollWidget.js](/src/messenger/presentation/chat-scroll-widget.js).

[^3]: Dialog rendering handled by [Dialog/index.js](/src/messenger/presentation/dialog-widget.js).
