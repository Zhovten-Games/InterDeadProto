---
domains: []
emits: []
implements:
  - ITemplateRenderer
imports:
  - src/app-shell/ports/template-renderer-port.js
  - src/asset-delivery/paths/template-base-url.js
listens: []
owns:
  - _renders
  - baseUrl
  - logger
schemaVersion: 1
source: src/app-shell/presentation/template-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: TemplateService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# TemplateAdapter

Loads HTML templates over HTTP and performs simple `{{token}}` replacement before returning markup. The constructor normalizes the base URL, falling back to `TemplateBaseUrlResolver` when a specific path is not provided.[^1]

`render` and `renderSection` combine template loading with data binding and optional DOM injection, logging missing templates or render errors through the injected logger.[^2]

[^1]: Base URL normalization and template loading [src/app-shell/presentation/template-adapter.js#L4-L21](../../../../../proto-dev/src/app-shell/presentation/template-adapter.js)

[^2]: Token replacement, render flow, and DOM injection [src/app-shell/presentation/template-adapter.js#L23-L46](../../../../../proto-dev/src/app-shell/presentation/template-adapter.js)
