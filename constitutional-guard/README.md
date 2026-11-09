# Traditional WARDEN

`npm --prefix proto-dev run check` runs integrity, prebuild, isolated assembly, postbuild and aggregation against a clean committed source. Node 24.19.0 and npm 11.9.0 remain pinned. Install locked packages and Playwright Chromium before the full check.

Mandatory gates verify the immutable historical corpus, protected control hashes, governance applicability and adoption, the full unit corpus, dependency audit, lint/format, source/documentation map, browser/resource behavior and the frozen artifact. An unavailable mandatory gate blocks release. A phase-only or diagnostic pass never certifies release.

`governance/release-policy.json` and the owner-attributed adoption decision establish the current publication boundary. Physical Opera/camera and external host acceptance remains in `manifest/manual-matrix.json` with actual results; it is non-mandatory post-deployment acceptance. This preserves observations while allowing the exact artifact to reach its destination before host verification.

`build/results/warden-report.json` identifies source, tools, pins, gates and actual status. `node build/verify-release.mjs --candidate` checks an automatic candidate; `node build/verify-release.mjs` consumes a complete release verdict. Generated proto and itch use the same frozen distribution without rebuilding.

Historical drivers and cases keep their original bytes. A protected dependency change records before/after hashes and its attributed decision; checks never silently refresh them. New normative changes renew the adoption hash map. See the [historical candidate design](../docs/proto-dev/technical/warden-candidate-baseline.md) for the earlier design and provenance.
