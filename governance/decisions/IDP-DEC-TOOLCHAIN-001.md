# IDP-DEC-TOOLCHAIN-001 — Supported JS environment

Status: candidate engineering decision, 2026-10-09. Node 20 was the CI baseline;
Node 24.19.0/npm 11.9.0 are the observed implementation environment, pinned for
reproducibility. The application stays JavaScript ESM. SQL.js is an explicit
test dependency; ESLint verifies actual JS, not a fictitious TS typecheck.
This is a project-local environment choice. The earlier claimed universal
technology-profile defect is WITHDRAWN-DEBT-KC-001: upstream BASE-T01 belongs to
repository Legislation, not the universal Constitution. Actual debt was missing
project PROFILE, supplied by this package. Human adoption is pending P10.

Implementation extension, still candidate: locked dependency audit found 15
vulnerabilities in the earlier tool set. Vite 8.3.4 uses Rolldown/Oxc, replacing
legacy esbuild minification/rollupOptions with the supported Vite configuration.
Mocha 12.0.3, AJV 8.20.0, fflate 0.8.3 and js-yaml 4.3.2 fix affected tools.
ESLint 10.12.0 replaces the unsupported 9.x line and supports the selected Node 24
runtime. Direct dependencies and native/install-script risks are declared in
manifest/dependencies.json; the assembled notices include the resolved tree.
The refreshed lockfile was checked with npm audit (zero reported vulnerabilities
on 2026-10-09); every certification repeats the online audit and records its result.
Migration source: https://vite.dev/guide/migration. Artifact compatibility and
browser execution are verified separately; this decision does not ratify P10.
