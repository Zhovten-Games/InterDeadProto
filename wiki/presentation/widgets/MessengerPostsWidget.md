---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/MessengerPostsWidget.js
used_by:
  - src/presentation/adapters/GlobalViewPresenter.js
---

# MessengerPostsWidget

Renders the messenger feed using plain DOM manipulation. `render` clears existing posts, creates list items for each entry, assigns localization keys, and asks the language manager to translate and apply the correct copy.[^1]

`clear` simply empties the container so subsequent renders start from an empty list.[^2]

[^1]: Rendering and localization workflow [src/presentation/widgets/MessengerPostsWidget.js#L12-L32](../../../src/presentation/widgets/MessengerPostsWidget.js#L12-L32)
[^2]: Clear helper [src/presentation/widgets/MessengerPostsWidget.js#L7-L10](../../../src/presentation/widgets/MessengerPostsWidget.js#L7-L10)
