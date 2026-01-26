---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/i18n/locales/combined/locales.js
used_by:
  - src/adapters/ui/LanguageAdapter.js
---

# combined/locales.js

Aggregates shared UI strings for English, Russian, and Ukrainian locales. Each entry supplies labels for navigation, geo detection, camera status, loading overlays, and error messaging used across presenters and widgets.[^1]

The dataset backs components such as `LocationStatusWidget`, `GlobalViewPresenter`, and the loader overlay, providing consistent translations for status keys like `detect_location_local`, `app_already_open`, and camera feedback (`searching`, `checking`, `object_not_found`).[^2]

[^1]: Locale dictionaries [src/i18n/locales/combined/locales.js#L1-L83](../../../src/i18n/locales/combined/locales.js#L1-L83)
[^2]: Usage examples in UI widgets [src/presentation/widgets/LocationStatusWidget.js#L7-L27](../../../src/presentation/widgets/LocationStatusWidget.js#L7-L27); [src/presentation/adapters/GlobalViewPresenter.js#L97-L210](../../../src/presentation/adapters/GlobalViewPresenter.js#L97-L210); [src/infrastructure/bootstrap/Loader.js#L60-L99](../../../src/infrastructure/bootstrap/Loader.js#L60-L99)
