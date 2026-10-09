---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - container
  - languageManager
schemaVersion: 1
source: src/messenger/presentation/messenger-posts-widget.js
used_by:
  - src/app-shell/presentation/global-view-presenter.js
source_exists: true
runtime_role: MessengerPostsWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# MessengerPostsWidget

Renders the messenger feed using plain DOM manipulation. `render` clears existing posts, creates list items for each entry, assigns localization keys, and asks the language manager to translate and apply the correct copy.[^1]

`clear` simply empties the container so subsequent renders start from an empty list.[^2]

[^1]: Rendering and localization workflow [src/messenger/presentation/messenger-posts-widget.js#L12-L32](../../../../../proto-dev/src/messenger/presentation/messenger-posts-widget.js)

[^2]: Clear helper [src/messenger/presentation/messenger-posts-widget.js#L7-L10](../../../../../proto-dev/src/messenger/presentation/messenger-posts-widget.js)
