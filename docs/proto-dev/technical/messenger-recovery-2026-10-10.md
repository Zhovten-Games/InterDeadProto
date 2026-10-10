# Messenger recovery correction

Status: PREPARED. Target: `refactor/idp-stabilization` at
`d0d1838546ef94dcb81cd5f468cbafaca76b0d1e`. User application, deployment and
physical browser acceptance are recorded after the user's verification.

## Observed defects and ownership

| Trigger                                                         | Cause                                                                                                             | Correction                                                                                                                 |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Camera return at an unfinished GUIDE or spirit turn             | `postLocked` remains set although the input gate has enabled the visible button; no new message event releases it | Every orchestrated gate evaluation derives the command and UI state; pending post work owns a cancellable turn token       |
| Chat replacement while a live animation is awaiting translation | Old render commits `lastRenderedIndex` using the new message array, skipping its history                          | Immutable render ranges and a generation check after every await; replacement opens its own queue                          |
| Reload or A → B → A combined with a pending render              | Obsolete render/animation queues delay or alter the current projection                                            | Render and animation reset invalidate old work and permit current context work immediately                                 |
| Live acceptance during older-history loading                    | The older render advances the newest cursor although it did not render that message                               | Older and latest rendering share a queue; older rendering preserves the newest cursor and loaded window                    |
| Reset GUIDE, complete a photo quest, then return                | The next user turn was prepared while the camera was active, leaving the command locked                           | Screen readiness evaluates the current turn; capture publication and stage progression use the existing canonical timeline |

The fixes retain capability paths, snapshot/history schema and public artifact paths.
The common assembler still produces the `proto` branch and itch.io payload from the same
frozen distribution. No deployment workflow, constitutional act or protected WARDEN
driver/hash/gate is rewritten by this correction.

## Automatic regression matrix

The following cases extend existing registered unit families. They therefore run through
`complete-unit-corpus` in the normal WARDEN run without replacing historical evidence.

| Family                                 | Added cases                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dialog-camera-return-history.test.js` | GUIDE/spirit unfinished camera returns; camera + reload + A-B-A; GUIDE reset and quest completion; reload each GUIDE turn; real CameraOrchestrator capture with external camera/model/canvas ports plus real SQLite/timeline/sequence; completed-history restoration; rapid second post during avatar await; cancellation on camera departure |
| `dialog-widget-clear.test.js`          | A-B, A-B-A and dispose/remount during an unresolved live animation; multiple live occurrences during rendering                                                                                                                                                                                                                                |
| `dialog-lazy-load.test.js`             | Live acceptance during older-history rendering; context replacement while an older template is unresolved                                                                                                                                                                                                                                     |

Assertions cover accepted next user occurrences, exact history content/order, unique
fingerprints, image/media restoration and disabled Post after a completed conversation.
Artificial latency is applied at external translation, template, avatar, camera and model
ports. Production controllers, renderers, sequence managers and SQLite repositories execute.

## Additional artifact browser diagnostic

`proto-dev/tools/messenger-recovery.mjs` drives public controls in a fresh isolated context
against the assembled deployment tree, served at `/interdead/`. It checks unfinished GUIDE,
unfinished spirit and reset GUIDE → real person detection → capture → outro → completed
history across reloads and chat/camera transitions. Fingerprints are compared exactly in DOM
order. Post must append the next occurrence; a merely enabled button does not satisfy it.

The profile and canvas MediaStream are external fixtures. Inference uses the assembled
production CPU Worker. Supply a JPEG/PNG/WebP clearly containing a person. Frame hash,
artifact hash, source SHA, browser version and results are recorded; a missing frame or
browser is `unavailable` and the diagnostic exits nonzero.

```bash
npm --prefix proto-dev ci
npm --prefix proto-dev check
node proto-dev/tools/messenger-recovery.mjs --browser all --camera-frame /absolute/path/person.jpg
```

Install the corresponding locked Playwright browser binaries if needed. The ordinary WARDEN
publication verdict still requires existing manual evidence and ratification; this diagnostic
does not change that verdict. Reports and screenshots are under
`build/results/messenger-recovery/`. Physical Firefox permissions, NOIR and the itch.io iframe
remain user acceptance boundaries.

In a container that cannot create Firefox content namespaces, the diagnostic alone accepts
`IRON_WARDEN_FIREFOX_DISABLE_SANDBOX=1`. It launches an isolated test profile; it does not
change application or browser deployment settings. Existing Chromium executable override
`IRON_WARDEN_CHROMIUM_EXECUTABLE` and optional `IRON_WARDEN_FIREFOX_EXECUTABLE` are supported.
