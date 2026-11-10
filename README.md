<pre>
╔═════════════════════════════════════════════════════════════════════════════╗
║                          INTERDEAD :: REPOSITORIES                          ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadReferenceLibrary">InterDead Reference Library (public)</a>                                      ║
║   Public reference library: research, engineering standards and notes.      ║
║   Materials are prepared for reuse outside the private workspace.           ║
║                                                                             ║
║ > <a href="https://github.com/Zhovten-Games/InterDeadProto">InterDeadProto (NOIR)</a>                                                     ║
║   Narrative interface prototype: Nectosphere-Oriented Interface Relay.      ║
║   A browser application with its own verified distribution pipeline.        ║
║                                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadIT">InterDeadIT (website / entry point)</a>                                       ║
║   The public website: localized articles, artifacts and project entry.      ║
║   Connects visitors with InterDead and the shared web-side services.        ║
║                                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDeadCore">InterDeadCore (identity + EFBD)</a>                                           ║
║   Shared identity, EFBD scoring and interface contracts for the web.        ║
║   Published packages are consumed by the website and related tools.         ║
║                                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/PsyFramework">PsyFramework (research / tooling)</a>                                         ║
║   Configurable research and scoring tools supporting the project.           ║
║   Browser presentation and methodology data retain separate roles.          ║
║                                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/InterDead">InterDead (private game repository)</a>                                       ║
║   Portable C++20 narrative core, playable projections and Workshop.         ║
║   Private production sources retain their own publication boundary.         ║
║                                                                             ║
║ ○ <a href="https://github.com/Zhovten-Games/SPIDER">SPIDER (methodology / contracts)</a>                                          ║
║   Literary pseudocode for attributed intent and consistent projections.     ║
║   Public contracts connect the method with reviewed project examples.       ║
║                                                                             ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                               INTERDEADPROTO                                ║
╠═════════════════════════════════════════════════════════════════════════════╣
║ NOIR is a narrative interface prototype within the InterDead universe. Its  ║
║ browser runtime, localized content and artifact pipeline provide a separate ║
║ experimental surface, delivered through Cloudflare Pages and itch.io.       ║
║                                                                             ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                ECHO OF AN UNFADING MEMORY  /  INTERDEAD WIKI                ║
║                                                                             ║
║ <a href="https://interdead.zhovten.games/about/">ABOUT (EN)</a>                          <a href="https://interdead.fandom.com/wiki/InterDead_Wiki">WIKI (EN)</a>                               ║
║ <a href="https://interdead.zhovten.games/ru/about/">ABOUT (RU)</a>                          <a href="https://interdead.fandom.com/ru/wiki/Interdead_%D0%92%D0%B8%D0%BA%D0%B8">WIKI (RU)</a>                               ║
║ <a href="https://interdead.zhovten.games/uk/about/">ABOUT (UK)</a>                          <a href="https://interdead.fandom.com/uk/wiki/Main_Page">WIKI (UK)</a>                               ║
║ <a href="https://interdead.zhovten.games/ja/about/">ABOUT (JA)</a>                          <a href="https://interdead.fandom.com/ja/wiki/InterDead_Wiki">WIKI (JA)</a>                               ║
║                                                                             ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                                   CONTACT                                   ║
║ <a href="https://www.linkedin.com/company/zhovten-games/">Zhovten Games — LinkedIn</a>                                                    ║
╚═════════════════════════════════════════════════════════════════════════════╝
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

## Verification

Initialize the pinned submodules, use Node 24.19.0 and npm 11.9.0, and install dependencies with `npm --prefix proto-dev ci`. Install Chromium with `./proto-dev/node_modules/.bin/playwright install --with-deps chromium`. Run `npm --prefix proto-dev run check` from a clean commit. Release publication consumes the exact frozen distribution after all mandatory WARDEN gates pass.
