<pre>
╔════════════════════════════════════════════════════════════════════════════╗
║ INTERDEAD :: REPOSITORIES                                                  ║
╠════════════════════════════════════════════════════════════════════════════╣
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadReferenceLibrary">InterDeadReferenceLibrary</a>                                                ║
║ ▶ <a href="https://github.com/Zhovten-Games/InterDeadProto">InterDeadProto</a>                                                           ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadIT">InterDeadIT</a>                                                              ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadCore">InterDeadCore</a>                                                            ║
║ ○ <a href="https://github.com/Zhovten-Games/PsyFramework">PsyFramework</a>                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDead">InterDead</a> (private)                                                      ║
║ ○ <a href="https://github.com/Zhovten-Games/SPIDER">SPIDER</a>                                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝
</pre>

# InterDeadProto

NOIR browser prototype and its verified distribution.

[Governance and adoption](governance/README.md)

## Monorepo layout

This repository is a monorepo that contains multiple InterDead application versions, experiments, and supporting libraries.

- Main ES6 implementation: [`InterDeadProto/proto-dev`](./proto-dev/)
- Production build/deploy branch: [`proto`](https://github.com/Zhovten-Games/InterDeadProto/tree/proto)

For implementation details, start from [`proto-dev/README.md`](./proto-dev/README.md).

## Governance and licensing

This repository connects two reviewed external policy sources as pinned Git
submodules:

- [Code Constitution](https://github.com/FOP-Oksana-Dubinetska/code-constitution) at `.code-constitution/`;
- [Repository Licensing Policy](https://github.com/FOP-Oksana-Dubinetska/repository-licensing-policy) at `.licensing-policy/`.

Initialize them after cloning:

```bash
git submodule update --init --recursive
```

Project-specific governance material lives under [`governance/`](./governance/).
The current Development Regulation is a draft candidate pending completion and
ratification of the project Founding Profile. Licensing is declared by
[`LICENSE.md`](./LICENSE.md), with game-content exceptions in
[`LICENSING-OVERRIDES.md`](./LICENSING-OVERRIDES.md).

The stabilization candidate is checked through
[`experimental WARDEN`](./constitutional-guard/README.md). From the root, install
the pinned Node/npm environment, initialize submodules, run
`npm --prefix proto-dev ci`, install Playwright Chromium and run
`npm --prefix proto-dev run check`. The complete
[`acceptance map`](./docs/proto-dev/technical/implementation-matrix.md) identifies
automatic checks and required human evidence. `proto` is generated; the main-push
release pipeline sends the same verified tree to `proto` and itch.io.

## Verification and domain migration

Run `npm --prefix proto-dev run check` for the complete traditional WARDEN pipeline. The operator runbook and variable registry accompany the 2026-11-07 local migration delivery. Public site: https://interdead.zhovten.games/; prototype: https://noir.zhovten.games/. Cloudflare and Discord settings are applied separately from repository edits.
