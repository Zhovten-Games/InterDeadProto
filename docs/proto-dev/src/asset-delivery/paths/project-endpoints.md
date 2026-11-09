---
source: src/asset-delivery/paths/project-endpoints.json
source_exists: true
imports: []
implements: []
owns: [public-site-link-resolution]
listens: []
emits: []
used_by: [localization-adapter]
runtime_role: asset-delivery
contour_primary: asset-delivery
role_group: configuration
---

# Public site endpoint

Localizations retain the INTERDEAD_SITE_URL placeholder. Source and deployment localization adapters resolve it from one tracked endpoint. Locale paths and fragments are preserved; no remote fetch or identity side effect occurs.
