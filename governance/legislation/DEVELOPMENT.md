# InterDeadProto Development Regulation

Act ID: `idp-act-development-001`. Revision: `1.0.0-candidate`.
Status: `candidate`

Constitution source: `.code-constitution/` at
`220dc9c286ae06f8b6ed60cdda75112eed0408ed`.

This act is project-specific Legislation for the InterDeadProto application.
It is deliberately narrower than the universal Code Constitution and becomes
operative only through the authority and adoption procedure established by a
completed project Founding Profile.

## Scope

The rules below govern application runtime, persistence, service lifecycle,
event-driven coordination, asynchronous state transitions, bootstrap code, and
the regression tests that verify those boundaries. They apply primarily to
`proto-dev/` and to repository-level tooling that changes its runtime behavior.

## IDP-DEV-001 — Authoritative state

Each durable or user-visible state dimension MUST have one identified
authoritative source. Derived caches, widgets, event payloads, and persistence
projections MUST NOT establish competing state laws.

A consumer MAY derive a view from authoritative state, but MUST NOT invent a
second ordering, ownership, or restoration rule that can diverge from it.

## IDP-DEV-002 — Resource lifecycle ownership

Each stateful external or runtime resource MUST have one lifecycle owner. This
includes camera streams, timers, retry loops, observers, subscriptions, and
other resources that require deterministic release.

Other components MAY request a lifecycle transition, but MUST NOT perform a
second independent teardown or activation path for the same resource.

Teardown MUST be idempotent.

## IDP-DEV-003 — Bootstrap and disposal authority

A service registered for managed bootstrap MUST be booted and disposed by one
lifecycle authority.

Dependency-injection factories MUST construct and return objects without
calling their managed `boot()` or `dispose()` lifecycle methods as a creation
side effect.

A bootstrap orchestrator MAY sequence phases, but MUST NOT manually boot a
service that is already included in the managed bootstrap set.

## IDP-DEV-004 — Asynchronous revision safety

An asynchronous operation MAY commit a result only to the state revision,
session, or lifecycle generation in which that operation was started.

When a newer transition invalidates an in-flight operation, stale completion
MUST NOT mutate current state. Any resource produced by a stale operation MUST
be released when release is required.

Code that crosses an `await` boundary while acting on replaceable state SHOULD
carry and re-check an explicit epoch, revision, session identifier, or an
equivalent cancellation mechanism.

## IDP-DEV-005 — Persistent identity and chronology

Persistent message identity and canonical chronology MUST be assigned once and
remain stable.

A canonical sequence is ordering state. Timestamps are metadata unless a
specific storage contract explicitly declares otherwise. Deduplication keys
identify equivalent records but MUST NOT be used to rewrite the original
canonical sequence during an upsert.

Storage queries, restoration, and presentation MUST consume the same canonical
ordering rule.

## IDP-DEV-006 — Event transport versus state restoration

The EventBus is a transport for notifications and commands; it MUST NOT become
the sole durable state store.

Restoring an existing state snapshot MUST use an atomic state/view replacement
contract rather than simulating a sequence of new live events when those events
have side effects such as deduplication, progression, persistence, analytics,
or seen-state mutation.

## IDP-DEV-007 — Regression evidence

A change that repairs or modifies an invariant governed by this act MUST include
a regression or invariant test that fails for the prohibited behavior and
passes for the corrected behavior whenever that behavior is testable in the
repository.

For lifecycle and race-condition defects, tests SHOULD control promise
completion order or time explicitly instead of relying on nondeterministic wall
clock timing.

## IDP-DEV-008 — Persistent migration policy

A change to persistent identity, ordering, or schema semantics MUST state how
existing stored data is handled.

Development-only reset is acceptable only when declared as such. A production
migration MUST NOT claim to reconstruct information that the previous schema did
not preserve reliably.

## Initial stabilization targets

The first implementation work under this candidate act SHOULD address, in this
order:

1. duplicate bootstrap and lifecycle ownership;
2. canonical dialog chronology and persistence;
3. camera lifecycle races and stale asynchronous completion;
4. ghost-switch revision races;
5. atomic dialog-history restoration.

This section records the initial remediation sequence, not a permanent priority
rule. Changing the sequence does not amend IDP-DEV-001 through IDP-DEV-008.

## IDP-DEV-009 — Profile-controlled environment

The technical environment MUST follow PROFILE P16. JavaScript ES modules and scoped JS lint replace unadopted TypeScript-only BASE requirements. No test/typecheck interface is declared unless implemented. Toolchain changes require a separate decision and locked verification.

JavaScript uses two spaces for indentation and `.test.js` for unit families;
UTF-8, LF and a final newline are retained. This explicitly adapts BASE-F01/F02.
JavaScript input adapters validate external shapes and convert them to the
application port contract; this adapts the TypeScript-specific part of BASE-T02.
The complete candidate pass performs declared external acquisition (`npm ci`,
browser installation before the pass, and the separate dependency-audit command).
Payload construction uses locked local inputs after acquisition. This explicitly
adapts the offline requirements in BASE-Q03/D02; an unavailable audit is a blocker.

## IDP-DEV-010 — Semantic module topology

The first source level MUST name a product capability or an exact external boundary. Program and test filenames MUST use kebab-case, except declared entry/conventional names. Placement follows actual responsibility. Splitting responsibility MAY require subsequent moves; the migration map MUST retain provenance.

## IDP-DEV-011 — Source-to-artifact compatibility

Source relocation MUST update imports, dynamic paths, docs, tests, licensing, CI and Local Build Lab together. Public paths MUST be preserved through an explicit artifact map or migrated by a reviewed compatibility decision. Diagnostic builds MUST NOT mutate canonical checkout sources.

## IDP-DEV-012 — Experimental WARDEN

Full check MUST execute integrity, prebuild, distribution assembly, postbuild and evidence aggregation. Missing/modified/unregistered history or protected dependencies MUST cause fail-closed refusal before dependent phases. Supersession MUST preserve predecessor and reviewed decision. Check MUST NOT update control hashes.

## IDP-DEV-013 — Verification evidence

Evidence MUST bind exact source SHA, normative pins, lockfile, toolchain, build ID, artifact tree and ZIP. passed, failed, unavailable and pending MUST be distinguished. releaseStatus is passed only after every mandatory gate passes in a full run. Any diagnostic or incomplete run MUST exit nonzero for release certification.

## IDP-DEV-014 — Deployment assembly

CI and Local Build Lab MUST invoke the same isolated locked assembler. Publication MUST use its verified artifact without rebuild or mutation, only on an authorized main push and passed release gate. proto is generated; itch ZIP has no enclosing directory. PR/manual diagnostic runs MUST NOT publish.

## IDP-DEV-015 — Profile reset boundary

Reset MUST invalidate user/session operations, transient history/UI and camera queries while preserving infrastructure AI readiness. Persisted data is removed only by an explicit option. APP_RESET_COMPLETED/SCREEN_CHANGE MUST rederive UI through its ordinary contract.
