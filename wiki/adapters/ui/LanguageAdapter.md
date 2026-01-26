---
domains: []
emits:
  - LANGUAGE_CHANGED
implements: []
imports:
  - src/adapters/ui/LocalizationAdapter.js
  - src/core/events/NullEventBus.js
  - src/core/logging/NullLogger.js
  - src/i18n/locales/combined/locales.js
  - src/ports/ILanguage.js
listens:
  - LANGUAGE_CHANGED
owns: []
schemaVersion: 1
source: src/adapters/ui/LanguageAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# LanguageAdapter

Coordinates locale selection and translation by wrapping `LocalizationAdapter`, persisting the chosen language, and broadcasting `LANGUAGE_CHANGED` through an injected event bus so UI components can refresh copy.[^1] `NullLogger` and `NullEventBus` defaults allow the adapter to surface missing bundles or translation failures without requiring infrastructure wiring in tests.[^2]

On boot it hydrates combined base locales, restores the last persisted language, and subscribes to bus updates so subsequent changes trigger DOM refreshes.[^3] `addGhostLocales` lazily imports spirit bundles, merging them into the in-memory map and logging a warning when optional translations are absent.[^4]

`applyLanguage` updates `data-i18n` text and placeholders asynchronously, skipping locked nodes and reporting translation errors through the injected logger.[^5]

[^1]: Construction, persistence, and bus integration [src/adapters/ui/LanguageAdapter.js#L1-L59](../../../src/adapters/ui/LanguageAdapter.js#L1-L59)
[^2]: Null defaults [src/adapters/ui/LanguageAdapter.js#L3-L21](../../../src/adapters/ui/LanguageAdapter.js#L3-L21); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Boot hydration [src/adapters/ui/LanguageAdapter.js#L23-L33](../../../src/adapters/ui/LanguageAdapter.js#L23-L33)
[^4]: Ghost locale loading and warnings [src/adapters/ui/LanguageAdapter.js#L35-L53](../../../src/adapters/ui/LanguageAdapter.js#L35-L53)
[^5]: DOM traversal and translation application [src/adapters/ui/LanguageAdapter.js#L55-L96](../../../src/adapters/ui/LanguageAdapter.js#L55-L96)
