---
domains: []
emits:
  - LANGUAGE_CHANGED
implements:
  - ILanguage
imports:
  - src/localization/adapters/localization-adapter.js
  - src/runtime-events/domain/null-event-bus.js
  - src/localization/locales/combined/locales.js
  - src/localization/ports/language-port.js
  - src/runtime-diagnostics/null-logger.js
  - src/messenger/protocol/emoji-protocol.js
  - src/messenger/presentation/message-text-formatter.js
listens:
  - LANGUAGE_CHANGED
owns:
  - _booted
  - _handler
  - _languageRevision
  - bus
  - current
  - locales
  - localization
  - logger
  - storage
  - textFormatter
schemaVersion: 1
source: src/localization/browser/language-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: LanguageAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# LanguageAdapter

Coordinates locale selection and translation by wrapping `LocalizationAdapter`, persisting the chosen language, and broadcasting `LANGUAGE_CHANGED` through an injected event bus so UI components can refresh copy.[^1] `NullLogger` and `NullEventBus` defaults allow the adapter to surface missing bundles or translation failures without requiring infrastructure wiring in tests.[^2]

On boot it hydrates combined base locales, restores the last persisted language, and subscribes to bus updates so subsequent changes trigger DOM refreshes.[^3] `addGhostLocales` lazily imports spirit bundles, merging them into the in-memory map and logging a warning when optional translations are absent.[^4]

`applyLanguage` updates `data-i18n` text, placeholders, titles, and hrefs asynchronously, skipping locked nodes and reporting translation errors through the injected logger.[^5] When a node is marked with `data-emoji-protocol`, it renders the Emoji Protocol layout by splitting lines and injecting localized labels.[^6]

[^1]: Construction, persistence, and bus integration [src/localization/browser/language-adapter.js#L1-L59](../../../../../proto-dev/src/localization/browser/language-adapter.js)

[^2]: Null defaults [src/localization/browser/language-adapter.js#L3-L21](../../../../../proto-dev/src/localization/browser/language-adapter.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Boot hydration [src/localization/browser/language-adapter.js#L23-L33](../../../../../proto-dev/src/localization/browser/language-adapter.js)

[^4]: Ghost locale loading and warnings [src/localization/browser/language-adapter.js#L35-L53](../../../../../proto-dev/src/localization/browser/language-adapter.js)

[^5]: DOM traversal and translation application [src/localization/browser/language-adapter.js#L55-L119](../../../../../proto-dev/src/localization/browser/language-adapter.js)

[^6]: Emoji Protocol formatting and label resolution [src/localization/browser/language-adapter.js#L60-L90](../../../../../proto-dev/src/localization/browser/language-adapter.js); [docs/utils/emojiProtocol.md](../../messenger/protocol/emoji-protocol.md)

## Current lifecycle contract

Boot subscribes once and disposal invalidates pending translations. Language changes increment a revision; text, protocol labels, placeholders, titles and links are written only by the current revision. A delayed earlier locale cannot overwrite the latest choice.
