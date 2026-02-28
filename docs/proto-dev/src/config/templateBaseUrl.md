---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/templateBaseUrl.js
used_by:
  - src/adapters/ui/TemplateAdapter.js
  - src/presentation/widgets/ControlPanel/index.js
---

# Template Base URL Resolver

`TemplateBaseUrlResolver` computes the base URL for HTML templates by checking an embed marker (`data-interdead-templates-base`), falling back to the current module URL, and finally defaulting to `/src/presentation/templates/`. The resolved base is cached after the first lookup and normalized to always include a trailing slash.[^1]

`resolve` accepts absolute template URLs or strips `/src/presentation/templates/` prefixes from relative paths so template references can be reused in both bundled and embedded contexts.[^2]

Helper exports `resolveTemplateBaseUrl` and `resolveTemplateUrl` provide single-call access to the resolver for modules that only need the base path or a specific template path.[^3]

[^1]: Embed/module URL resolution and caching [src/config/templateBaseUrl.js#L1-L71](../../src/config/templateBaseUrl.js#L1-L71)
[^2]: Template path normalization and prefix stripping [src/config/templateBaseUrl.js#L20-L85](../../src/config/templateBaseUrl.js#L20-L85)
[^3]: Convenience exports [src/config/templateBaseUrl.js#L88-L92](../../src/config/templateBaseUrl.js#L88-L92)
