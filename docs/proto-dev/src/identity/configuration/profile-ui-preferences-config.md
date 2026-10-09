---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/identity/configuration/profile-ui-preferences-config.js
used_by:
  - src/identity/application/profile-transfer-service.js
  - src/host-integration/framework/framework-bridge.js
  - src/app-shell/presentation/global-view-presenter.js
source_exists: true
runtime_role: PROFILE_UI_PREFERENCES_KEY
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Profile UI Preferences Config

Defines a shared storage key and normalization routine for profile-level UI settings.

- `PROFILE_UI_PREFERENCES_KEY` is the single source key for persistence.
- `DEFAULT_PROFILE_UI_PREFERENCES` defines default values.
- `normalizeProfileUiPreferences(value)` coerces unknown/legacy payloads into a stable shape.

This module keeps preference handling consistent across export/import services, presenter UI toggles, and runtime membrane behavior.
