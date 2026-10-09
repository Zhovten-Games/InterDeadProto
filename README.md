<pre>
╔═════════════════════════════════════════════════════════════════════╗
║                     INTERDEAD :: REPOSITORIES                       ║
╠═════════════════════════════════════════════════════════════════════╣
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadReferenceLibrary">InterDead Reference Library (public)</a>                              ║
║   Public reference library: documents and notes that are safe       ║
║   to share outside the private workspace.                           ║
║                                                                     ║
║ > InterDeadProto (NOIR)                                             ║
║   InterDeadProto is a narrative-driven interface prototype.         ║
║   NOIR: Nectosphere-Oriented Interface Relay.                       ║
║                                                                     ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadIT">InterDeadIT (website / entry point)</a>                               ║
║   The website: the public entry point into the InterDead meta-verse.║
║   Hosts the “About” and related public-facing materials.            ║
║                                                                     ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadCore">InterDeadCore</a> (identity + EFBD core)                              ║
║   Core modules used by the website: identity/auth and EFBD logic.   ║
║   Published as packages and consumed by InterDeadIT.                ║
║                                                                     ║
║ ○ <a href="https://github.com/Zhovten-Games/PsyFramework">PsyFramework</a> (research / tooling)                                 ║
║   Research and tooling repo referenced by the project; supporting   ║
║   framework work that may be mentioned from public docs.            ║
╠═════════════════════════════════════════════════════════════════════╣
║                          INTERDEADPROTO                             ║
║═════════════════════════════════════════════════════════════════════║
║ InterDeadProto is the prototype-first foundation of InterDead:      ║
║ a playable concept space where narrative loops, systems, and        ║
║ UX ideas are validated early before entering full production.       ║
║ It bundles rapid gameplay experiments, content scaffolding, and     ║
║ integration hooks so shared platform services can evolve safely.    ║
║═════════════════════════════════╦═══════════════════════════════════║
║    ECHO OF AN UNFADING MEMORY   ║   INTERDEAD WIKI (ALL LANGUAGES)  ║
╠═════════════════════════════════╬═══════════════════════════════════╣
║ <a href="https://interdead.phantom-draft.com/about/">READ (EN)</a>                       ║ <a href="https://interdead.fandom.com/wiki/InterDead_Wiki">READ (EN)</a>                         ║
╠═════════════════════════════════╬═══════════════════════════════════╣
║ <a href="https://interdead.phantom-draft.com/ru/about/">READ (RU)</a>                       ║ <a href="https://interdead.fandom.com/ru/wiki/Interdead_%D0%92%D0%B8%D0%BA%D0%B8">READ (RU)</a>                         ║
╠═════════════════════════════════╬═══════════════════════════════════╣
║ <a href="https://interdead.phantom-draft.com/uk/about/">READ (UK)</a>                       ║ <a href="https://interdead.fandom.com/uk/wiki/Main_Page">READ (UK)</a>                         ║
╠═════════════════════════════════╬═══════════════════════════════════╣
║ <a href="https://interdead.phantom-draft.com/ja/about/">READ (JA)</a>                       ║ <a href="https://interdead.fandom.com/ja/wiki/InterDead_Wiki">READ (JA)</a>                         ║
║═════════════════════════════════╩═══════════════════════════════════║
║                            CONTACT                                  ║
╠═════════════════════════════════════════════════════════════════════╣
║ <a href="https://www.linkedin.com/company/zhovten-games/">Zhovten Games — LinkedIn</a>                                            ║
╚═════════════════════════════════════════════════════════════════════╝
</pre>

# InterDeadProto Monorepo

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
