---
domains: []
emits: []
implements: []
imports:
  - src/ports/ITemplateRenderer.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/ui/TemplateAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# TemplateAdapter

Loads HTML templates over HTTP and performs simple placeholder substitution before returning markup[^1]. `renderSection` injects rendered content directly into a DOM element and logs failures via the supplied logger[^2].

[^1]: [`TemplateAdapter.js`](../../../src/adapters/ui/TemplateAdapter.js#L1-L27)
[^2]: [`TemplateAdapter.js`](../../../src/adapters/ui/TemplateAdapter.js#L29-L41)

