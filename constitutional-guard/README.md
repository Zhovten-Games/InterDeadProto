# Experimental WARDEN for InterDeadProto

This is the project-local verification contour under IDP-DEV-012–014. It records
the exact candidate and refuses an incomplete release. It does not authenticate
human authority, physical browser permissions or the current external host setup.

## Complete candidate

From the repository root, with the exact environment in `proto-dev/package.json`:

```bash
git submodule update --init --recursive
npm --prefix proto-dev ci
./proto-dev/node_modules/.bin/playwright install chromium
npm --prefix proto-dev run check
```

Commit the prepared candidate before certification. The check reads canonical
files and writes disposable output only under `build/results`, `build/workspace`
and `build/output`. It never rewrites historical/control hashes. `npm ci` in the
isolated assembler and the explicit dependency audit need network access; that
project-local adaptation is declared in IDP-DEV-009.

The assembler copies registered Git inputs serially into a unique workspace and
cleans it after success or failure. An exclusive ignored output lease prevents
concurrent assemblers from replacing the frozen tree. An interrupted lease is
removed only after the operator has established that its assembly is no longer
running. Parent npm lifecycle/prefix variables are excluded from isolated npm
commands; the absolute project prefix selects the intended locked package.
Assembly also finalizes a fresh staged distribution before replacing the public
output directory. A failed preparation retains the previous output; a failed
replacement restores it. Previous provenance cannot enter the new payload.

The complete pass executes integrity, formatting, all JavaScript lint scopes,
dependency audit, governance and source/CodeMap checks, the complete registered
unit corpus, historical public-boundary drivers, refusal fixtures, isolated
assembly, HTTP/resource checks, real Chromium execution, manual evidence and
aggregation. Missing, unavailable and unrun gates remain visible.

`build/results/warden-report.json` is the report; `distribution.json` binds the
exact frozen tree and ZIP. `source-check.json`, `unit-tests.json`, audit JSON and
browser screenshots retain their narrower evidence. Generated reports are not
canonical sources and are excluded from the public artifact.

```bash
node build/verify-release.mjs --candidate
node build/verify-release.mjs
```

The first command requires all automatic gates from a full, clean,
non-diagnostic run. It permits a candidate with incomplete manual acceptance.
The second requires the complete release verdict, operative human ratification
and fresh manual evidence, then rechecks the exact source/toolchain/tree/ZIP.
Neither command rebuilds the distribution. A changed byte invalidates the result.

## Diagnostics

```bash
node constitutional-guard/run.mjs integrity
node constitutional-guard/run.mjs prebuild
node constitutional-guard/run.mjs postbuild
node constitutional-guard/run.mjs all --diagnostic
npm --prefix proto-dev run local:pipeline:smoke
```

Narrow modes and Local Build Lab are diagnostic. They cannot produce a passed
release verdict. `postbuild` consumes the current `distribution.json` and verifies
source identity; a full run creates its own assembly. A local Chromium executable
may be explicitly supplied through `IRON_WARDEN_CHROMIUM_EXECUTABLE`; the observed
browser version and scope remain in the report. CI installs its declared browser.

## Frozen history and control changes

`manifest/history.json` registers every historical file, immutable ID/version,
cases, rule revision, phase and hash. Its protected dependencies include drivers,
fixtures, schemas, runner/verdict, test collection, artifact assembly and CI
consumption. The first candidate adoption freezes those bytes for review; checks
do not create or refresh the freeze.

After adoption, preserve predecessors. Add a new version and a reviewed decision
to supersede an incompatible driver. Never edit an old expectation in place.
Changing a protected helper or control requires `controlChange` to reference a
reviewed JSON decision under `governance/decisions`: `status: reviewed`, actual UTC
`date`, identified `reviewers`, and `changes` containing `path`, `before` and `after`
SHA-256 values.
The declaration is evidence of the review record, not proof of a human signature.
An emergency follows PROFILE P14 with compensating checks and a bounded term.

The unit corpus retains all baseline families in `manifest/test-corpus.json`.
Two absent foreign Person modules are explicitly archived with baseline
provenance; their archival needs `manual.test-boundary`. An import exception,
zero collected tests, pending/skipped tests or missing family is a failure.

## Manual acceptance

`manifest/manual-matrix.json` names every required procedure. Browser/media scope
and the exact candidate matter: local Chromium with controlled external media
does not satisfy physical Opera Desktop on itch/NOIR. The matrix includes
grant/deny/pending permissions, recovery, legacy saves, reset, four locales,
accessibility, host/licensing boundaries and substantive normative review.

Provide actual results in an external JSON file or an ignored results file, then
set `IRON_WARDEN_MANUAL_EVIDENCE_FILE` to its absolute path. The file follows
`schemas/manual-evidence.schema.json`: one record per matrix `caseId`, actual
reviewer and UTC date, browser/version, OS/origins, observed result and references,
and the current `sourceSha`, `buildId`, `artifactTreeSha256`, `zipSha256`.
Evidence is valid for 30 days and is rejected if duplicated, malformed, stale,
incomplete or tied to another artifact. Sample results are never release evidence.

Governance acceptance separately follows
[`governance/attestations/README.md`](../governance/attestations/README.md).
Complete the human decisions first, commit that candidate and build it. Test
those exact bytes. Changing an operative document or source requires a new pass
and new exact-candidate manual evidence.

CI receives actual manual records through `IRON_WARDEN_MANUAL_EVIDENCE_JSON`.
For a reviewed main-push candidate, add the exact evidence and rerun that same
Actions run without changing its SHA. PR and manual-dispatch runs never publish.
The two publishing jobs consume the same uploaded tree after the release gate.

## Evaluation of the experiment

Evaluate detected regressions, stability of the public driver interface,
reproducibility, runtime and maintenance cost. Replacement preserves historical
provenance, refusal fixtures and the release-blocking contract. Coverage and
diagnostic counts are evidence about their scopes, not a substitute for acceptance.
