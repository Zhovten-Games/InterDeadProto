---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _cachedBaseUrl
  - documentRef
  - moduleUrl
schemaVersion: 1
source: src/asset-delivery/paths/template-base-url.js
used_by:
  - src/app-shell/presentation/template-adapter.js
  - src/app-shell/composition/infrastructure-module.js
  - src/app-shell/controls/presentation/control-panel-widget.js
source_exists: true
runtime_role: TemplateBaseUrlResolver
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Template Base URL Resolver

`TemplateBaseUrlResolver` computes the base URL for HTML templates by checking an embed marker (`data-interdead-templates-base`), falling back to the current module URL, and finally defaulting to `/src/presentation/templates/`. The resolved base is cached after the first lookup and normalized to always include a trailing slash.[^1]

`resolve` accepts absolute template URLs or strips `/src/presentation/templates/` prefixes from relative paths so template references can be reused in both bundled and embedded contexts.[^2]

Helper exports `resolveTemplateBaseUrl` and `resolveTemplateUrl` provide single-call access to the resolver for modules that only need the base path or a specific template path.[^3]

[^1]: Embed/module URL resolution and caching [src/asset-delivery/paths/template-base-url.js#L1-L71](../../../../../proto-dev/src/asset-delivery/paths/template-base-url.js)

[^2]: Template path normalization and prefix stripping [src/asset-delivery/paths/template-base-url.js#L20-L85](../../../../../proto-dev/src/asset-delivery/paths/template-base-url.js)

[^3]: Convenience exports [src/asset-delivery/paths/template-base-url.js#L88-L92](../../../../../proto-dev/src/asset-delivery/paths/template-base-url.js)
