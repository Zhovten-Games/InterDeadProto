---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/LocationStatusWidget.js
used_by:
  - src/presentation/adapters/GlobalViewPresenter.js
---

# LocationStatusWidget

Displays the geo-detection status within the apartment plan screen. It toggles visibility, applies translation keys, and shows either a localized "local mode" message or formatted coordinates with translated latitude/longitude labels.[^1]

`clear` hides the container, removes helper classes, and clears any translated content so future updates start from a clean state.[^2]

[^1]: Local/coordinate rendering [src/presentation/widgets/LocationStatusWidget.js#L7-L27](../../../src/presentation/widgets/LocationStatusWidget.js#L7-L27)
[^2]: Reset behaviour [src/presentation/widgets/LocationStatusWidget.js#L29-L34](../../../src/presentation/widgets/LocationStatusWidget.js#L29-L34)
