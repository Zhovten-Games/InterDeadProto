---
source: src/asset-delivery/paths/project-links.js
source_exists: true
imports: [./project-endpoints.json]
implements: []
owns: [public-site-link-resolution]
listens: []
emits: []
used_by: [localization-adapter]
runtime_role: asset-delivery
contour_primary: asset-delivery
role_group: configuration
---

# Configurable public links

Localizations retain the INTERDEAD_SITE_URL placeholder. Source and deployment localization adapters resolve it from one tracked endpoint. Locale paths and fragments are preserved; no remote fetch or identity side effect occurs.
