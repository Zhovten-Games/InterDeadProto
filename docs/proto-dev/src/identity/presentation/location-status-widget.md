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
source: src/identity/presentation/location-status-widget.js
used_by:
  - src/app-shell/presentation/global-view-presenter.js
source_exists: true
runtime_role: LocationStatusWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# LocationStatusWidget

Displays the geo-detection status within the apartment plan screen. It toggles visibility, applies translation keys, and shows either a localized "local mode" message or formatted coordinates with translated latitude/longitude labels.[^1]

`clear` hides the container, removes helper classes, and clears any translated content so future updates start from a clean state.[^2]

[^1]: Local/coordinate rendering [src/identity/presentation/location-status-widget.js#L7-L27](../../../../../proto-dev/src/identity/presentation/location-status-widget.js)

[^2]: Reset behaviour [src/identity/presentation/location-status-widget.js#L29-L34](../../../../../proto-dev/src/identity/presentation/location-status-widget.js)
