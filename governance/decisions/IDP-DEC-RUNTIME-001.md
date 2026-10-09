# IDP-DEC-RUNTIME-001 — Runtime and release decision register

Status: candidate engineering decisions for competent review. No human decision,
operative adoption or platform certification is asserted. Owners are the project
roles pending identification under PROFILE; implementation owners below denote
modules rather than human authority.

| Decision          | Selected mechanism / implementation owner                                                                                                                     | Stage and review                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Timeline identity | DatabaseAdapter/DialogHistoryRepository allocate immutable per-ghost sequence and occurrence fingerprint; reactions update separately                         | History, before writing v2 data; legacy chronological uncertainty remains explicit        |
| Legacy/import     | Deterministic migration plus immutable snapshot/context backups; ProfileRegistrationService validates a fork and commits one authoritative storage envelope   | Migration, before real imports; manual legacy recovery and downgrade drill required       |
| Multi-tab writes  | DatabaseAdapter holds exclusive Web Lock `interdead:sqlite-writer`; persistent boot refuses without lock API or when another writer owns it                   | Storage, before persistent writes; no silent last-writer-wins snapshot replacement        |
| Contact/camera    | Requested contact differs from committed contact; transition/session/operation revisions invalidate stale results                                             | Camera/switch, before UI/progression commit; public historical permutations               |
| Worker/backend    | Classic same-origin CPU Worker; one occupied frame slot, explicit model fallback only inside Worker, 60-second timeout/restart                                | AI; worker-feasibility.md records experiment, buffer estimates and measured-report fields |
| Browsers/budgets  | Local installed Chromium version recorded at execution; physical Opera version/OS/reference hardware unresolved; 16-ms heartbeat and 250-ms candidate max gap | Integrated candidate; 21-case manual matrix and actual platform traces                    |
| Locales/templates | Bundled locale loaders plus explicit compatibility route; 16 dictionaries and 17 template paths retain public namespaces                                      | Structure/build, before source moves; build/artifact-map.json and HTTP/browser gates      |
| Service Worker    | Cache namespaces and model URLs bind to build ID; activation evicts previous AI cache generations without clearing owned save data                            | Distribution, before upgrade; actual old-installed-version manual drill                   |
| Publication       | Only main push with fully passed release; generated proto and itch use the same downloaded frozen tree and consume gate, without rebuild                      | CI, before either publication job                                                         |
| Normative source  | Scoped local adoption/adaptation; upstream BASE is repository legislation, not universally mandatory language policy                                          | Governance, before structural work; original global-profile debt withdrawn                |

Human authority/ratification, test archival, live host binding/permissions,
reference hardware and substantive normative review remain unresolved. Their
review owners and competence must be filled under PROFILE P02/P05/P10–P14; the
manual matrix and attestations define required evidence. The technical register
cannot fill those decisions for them. Related records: IDP-DEC-REFACTOR-001,
IDP-DEC-TOOLCHAIN-001, IDP-DEC-TEST-BOUNDARY-001.
