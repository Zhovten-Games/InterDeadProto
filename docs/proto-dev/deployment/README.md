# Deployment policy and targets

This document defines deployment behavior for `InterDeadProto/proto-dev` and explains why compatibility path fixes are handled by shell scripts.

## Core policy: immutable source, mutable artifacts

- `proto-dev/src` is the canonical, environment-agnostic source of truth.
- Environment-specific path rewrites are applied only during build/deploy stages.
- Rewrites are performed on isolated workspace files and/or generated artifacts.
- Direct edits to source files only for a deployment host are considered a policy violation.

This policy keeps runtime behavior deterministic across targets, avoids accidental source drift, and preserves a clean review history.

## Why shell scripts are required

Shell-based pipeline steps provide a reproducible compatibility layer that can:

- normalize host-specific path roots,
- apply deploy-only substitutions,
- verify expected markers after rewrite,
- fail fast when compatibility assumptions no longer hold.

In this repository, Local Build Lab (`proto-dev/tests/local-build-lab`) reproduces CI behavior in an isolated workspace so these transformations stay explicit and auditable.

## Deployment targets

`proto-dev` is deployed to more than one host platform:

1. **Cloudflare** (project hosting and related delivery pipeline).
2. **itch.io** (distribution using itch.io deployment mechanisms).

Because these targets can differ in path/root semantics, compatibility rewrites are intentionally centralized in pipeline scripts rather than encoded in source modules.

## Operational note

If a path issue appears (for example malformed `/s` fragments in runtime requests), fix the pipeline compatibility layer first.
Do not patch canonical source files only to satisfy one deployment host.
