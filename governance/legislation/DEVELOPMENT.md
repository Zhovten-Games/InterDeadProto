# InterDeadProto Development Regulation

Status: `draft-candidate`

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

Restoring an existing state snapshot SHOULD use an atomic state/view replacement
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
