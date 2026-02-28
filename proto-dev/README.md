# proto-dev

> This application should be perceived as an art prototype for the game world: imperfect, but the original starting point of the whole direction. Learn more: [interdead.phantom-draft.com/about](https://interdead.phantom-draft.com/about/).

InterDeadProto `proto-dev` is a narrative-driven interface prototype (ES6 modules).

## Repository links

- Implementation directory (clean URL): [github.com/Zhovten-Games/InterDeadProto/proto-dev](https://github.com/Zhovten-Games/InterDeadProto/proto-dev)
- Build/deploy target branch: [github.com/Zhovten-Games/InterDeadProto/tree/proto](https://github.com/Zhovten-Games/InterDeadProto/tree/proto)

## Documentation map

- Runtime docs root: [`../docs/proto-dev`](../docs/proto-dev/)
- Application overview: [`../docs/proto-dev/overview/README.md`](../docs/proto-dev/overview/README.md)
- Technical narrative: [`../docs/proto-dev/technical/README.md`](../docs/proto-dev/technical/README.md)
- Source-level implementation docs (mirrors `proto-dev/src`): [`../docs/proto-dev/src`](../docs/proto-dev/src/)
- Tests docs: [`../docs/proto-dev/tests`](../docs/proto-dev/tests/)
- Assets docs: [`../docs/proto-dev/assets`](../docs/proto-dev/assets/)

## Scope notes

- The current version does **not** provide free user-authored communication flow.
- User-visible responses are hard-coded/configured and orchestrated as a deterministic NIRO-like generated flow.
- Related narrative references:
  - [InterDead application article](../InterDeadReferenceLibrary/wiki/en/Technologies_and_protocols/InterDead_application.md)
  - [Emoji Protocol article](../InterDeadReferenceLibrary/wiki/en/Technologies_and_protocols/Emoji_Protocol.md)
  - [NIRO article](../InterDeadReferenceLibrary/wiki/en/Technologies_and_protocols/Niro.md)

## Local development

Before every push, run the Local Build Lab pipeline directly from [`./tests/local-build-lab`](./tests/local-build-lab/README.md) and do not rely only on automated CI checks.

```bash
npm ci
npm run dev
npm run build
npm run format:check
```
