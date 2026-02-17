# 0. Scope, trust model, and implementation status

This section draws a hard line between what is implemented in the application and what is a narrative framing described in `InterDeadReferenceLibrary/wiki/en`. The narrative documents are important, but they also include conceptual or world‑building elements that are not present as runtime features.

## 0.1 What the system is (and is not)

- **Not a chat or messenger.** The runtime is a scripted contract executor with a fixed stage sequence and input gates.
- **No model of “two humans in free conversation.”** The UI only opens input when the gate allows it; otherwise it advances deterministically.
- **Protocol definition.** “Protocol” here means **notation + scripted contract + deterministic transitions** (state machine), not a general‑purpose language of communication.
- **Hard‑configured behavior.** All runtime behavior is configured through the spirit config files; there is no protocol compliance verifier beyond deterministic gating.

## 0.2 Trust model and contract guarantees

- **Source of truth.** The contract is authored in first‑party configuration (`proto-dev/src/config/spirits` + `default.config.js`).
- **What “contract compliance” means in practice (invariants):**
  1. **Input gating** is enforced by `DialogInputGateService`.
  2. **ACK/reaction requirements** are enforced by reaction mapping + persistence.
  3. **Stage transitions** are deterministic and read from the stage config.
  4. **Replay/history** is reconstructed from persisted dialog data.
- **What is not guaranteed.** There is no guarantee of contract enforcement for arbitrary external input or free‑form two‑way communication, because that is outside the target scope.

## 0.3 Implementation status tags

When reading the narrative documents, treat features as one of:

- **Implemented** — exists in code and can be traced to a service or config.
- **Spec‑only (concept)** — described for clarity or world‑building, but not a runtime mechanism.
- **Planned** — explicitly intended but not yet implemented.

This technical document only claims **Implemented** behavior; narrative‑only features are called out as **Spec‑only (concept)**.

## 0.4 Term mapping: narrative term → runtime realization

- **RANGE** → input gating and turn ownership (`DialogInputGateService`).
- **ACK** → reaction requirement + persistence (`ReactionMappingService`, `ReactionPersistenceService`).
- **OUTPUT‑FORM** → message shape in stage config (text, media, camera quest).
- **POLICY** → configuration + deterministic stage flow (not a separate “language mode”).
- **stage/step** → `stages[]` entries in the spirit config.
- **gate** → dialog input gate (`kind=user_text`, `kind=camera_capture`).
- **reaction requirements** → stage `reactions` + overlay widget.

The contract is materialized as stage configuration and executed by the dialog state machine (`DialogOrchestratorService`).

## 0.5 Stack Form 6 status

**Stack Form 6** currently functions as a **human‑readable notation** for documentation and authoring. It is not required to exist as a distinct runtime object; the actual runtime schema is the stage config + dialog history.

## 0.6 POLICY modes (🧱/🔀/🌀/⚠️/🚫🧯) — runtime vs narrative

- **🧱 baseline flow** — implemented via deterministic stage ordering + gating.
- **🔀 branching** — currently not a distinct runtime mode; any “branching” must be encoded manually in config.
- **🌀 simulations/counterfactuals** — **Spec‑only (concept)** in the current code.
- **⚠️ risk/limited escalation** — **Spec‑only (concept)** unless manually described in text.
- **🚫🧯 stop/reset** — implemented as the global reset flow (Section 9).

## 0.7 Safety: enforcement vs authoring discipline

Safety is currently achieved by **authoring discipline** in first‑party configs and minimal runtime gating. There is no general‑purpose validator or anti‑abuse layer for arbitrary external input. Any safety boundaries should therefore be documented as part of the authoring policy.

## 0.8 Exposure/stealth and “effect regulators”

- The emoji drum/roulette exists in the UI but is **disabled by default** (Section 5.3).
- “Stealth/exposure/drum/roulette” should be treated as **implementation‑level toggles**, not user‑facing protocol commands.
- If additional exposure modes are introduced later, they should be marked **Planned** until wired in the runtime.

## 0.9 Output forms and input limits

- The user can only input what the gate allows: text posts, reaction selection, or camera capture during a quest.
- There is **no free input channel** outside the current gated step.

**Next:** [1. Boot sequence and runtime mode](01-boot-sequence.md)
