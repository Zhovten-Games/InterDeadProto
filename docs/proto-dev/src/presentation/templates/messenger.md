---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/messenger.html
used_by: []
source_exists: true
runtime_role: messenger_template
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: "narrative context builder"
---

# Messenger Screen Template

Sets up the messenger view with a scrollable dialog list and a container for posts[^1].
`ChatScrollWidget` uses the `[data-js="messenger-container"]` element to manage scrolling[^2], while `DialogWidget` renders messages into `[data-js="dialog-list"]`[^3].

[^1]: Layout defined in [messenger.html](/src/presentation/templates/messenger.html#L1-L7).
[^2]: Default selector in [ChatScrollWidget.js](/src/presentation/widgets/ChatScrollWidget.js#L15-L33).
[^3]: Dialog rendering handled by [Dialog/index.js](/src/presentation/widgets/Dialog/index.js#L107-L118).
