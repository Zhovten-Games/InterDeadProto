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

Aggregates shared UI strings for English, Russian, and Ukrainian locales. The combined dataset covers geolocation labels, camera detection prompts, generic loading states, and cross-screen actions such as import/export and capture controls.[^1]

Newer keys cover AI loader status copy (`ai_loading_status`, `ai_failed_status`), chat launcher gating (`launcher_auth_required`), and camera badge labeling (`ai_loading_badge`), which are consumed by AI warmup UI and launcher widgets.[^2]

[^1]: Locale dictionaries for common UI copy [src/i18n/locales/combined/locales.js#L1-L112](../../../src/i18n/locales/combined/locales.js#L1-L112)
[^2]: AI/launcher-related strings [src/i18n/locales/combined/locales.js#L24-L37](../../../src/i18n/locales/combined/locales.js#L24-L37)
