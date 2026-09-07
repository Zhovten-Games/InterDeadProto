# InterDeadProto Governance

InterDeadProto uses the portable Code Constitution as an external, pinned
normative source rather than copying or editing the universal corpus inside
this repository.

- Constitution source: `.code-constitution/`
- Pinned Constitution revision: `220dc9c286ae06f8b6ed60cdda75112eed0408ed`
- Shared licensing policy: `.licensing-policy/`
- Pinned licensing-policy revision: `6e4c2627717c079827ed4aa9044a5346b3ea3ddb`
- Project legislation candidate: `governance/legislation/DEVELOPMENT.md`
- Repository licensing declaration: `LICENSE.md`
- Project licensing overrides: `LICENSING-OVERRIDES.md`

## Draft status

This integration is preparatory. It does not claim that a project-specific
Founding Profile has been completed or ratified.

Before the Constitution is treated as operative for InterDeadProto, the
competent human authority must complete and adopt a project-specific Founding
Profile from the pinned Constitution revision. In particular, the project must
expressly settle the P01-P18 values that cannot be inferred from source code,
including authority-holders, ratification and certification, canonical-source
status, amendment procedure, waivers, and verification responsibility.

Until that happens, `governance/legislation/DEVELOPMENT.md` is a candidate act:
it records the engineering rules selected for the stabilization work but does
not manufacture authority by itself.

## Working rule

The submodules are external normative sources. Project-specific changes belong
in the local Founding Profile, Legislation, registries, and verification
artifacts as applicable. The universal Constitution and licensing-policy
submodules are updated only by an explicit reviewed pin change.

Initialize the pinned sources with:

```bash
git submodule update --init --recursive
```
