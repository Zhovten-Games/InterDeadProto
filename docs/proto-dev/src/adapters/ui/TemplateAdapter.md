---
domains: []
emits: []
implements: []
imports:
  - src/config/templateBaseUrl.js
  - src/ports/ITemplateRenderer.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/ui/TemplateAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# TemplateAdapter

Loads HTML templates over HTTP and performs simple `{{token}}` replacement before returning markup. The constructor normalizes the base URL, falling back to `TemplateBaseUrlResolver` when a specific path is not provided.[^1]

`render` and `renderSection` combine template loading with data binding and optional DOM injection, logging missing templates or render errors through the injected logger.[^2]

[^1]: Base URL normalization and template loading [src/adapters/ui/TemplateAdapter.js#L4-L21](../../../src/adapters/ui/TemplateAdapter.js#L4-L21)
[^2]: Token replacement, render flow, and DOM injection [src/adapters/ui/TemplateAdapter.js#L23-L46](../../../src/adapters/ui/TemplateAdapter.js#L23-L46)
