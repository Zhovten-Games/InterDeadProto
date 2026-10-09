# Worker feasibility and measurement protocol

Basis: AI-001 / AC-AI-01, IDP-DEV-004/012 and candidate PROFILE P16.
Status: implemented engineering experiment; physical Opera/host acceptance and
reference hardware remain unresolved. This document does not ratify a budget.

## Pinned inputs and selected backend

| Vendored input relative to proto-dev |   Bytes | SHA-256                                                            |
| ------------------------------------ | ------: | ------------------------------------------------------------------ |
| `assets/libs/tf.min.js`              | 1469843 | `300dfae273d20b4046f46a06d735688f03675a807561e9bcb5f664eb2f3d2831` |
| `assets/libs/coco-ssd.min.js`        |    9258 | `95a1abd543043e4606b301bdc85fbd378e50747cc6d84d077192fa2a69fe18ea` |
| `assets/models/coco-ssd/model.json`  |  527315 | `3770b2528339b1e3340cb74360e1e40401816b009779aeb8d0cce3a4353ea3a9` |

The model weight groups listed in model.json are tracked with the source and
included in the frozen artifact manifest. Runtime/provenance and licensing are
also covered by THIRD-PARTY-NOTICES and the dependency inventory. npm TensorFlow
is not silently substituted for the vendored runtime.

The production classic Worker loads TF/COCO via same-origin importScripts, selects
`cpu`, awaits readiness, loads the local model and warms it with an int32 Tensor3D.
The COCO path receives tensors rather than HTML video/image objects: no window or
document shim is installed. It accepts either RGB Int32Array data or a captured
JPEG Blob. The latter is decoded with createImageBitmap/OffscreenCanvas in the
Worker, converted from RGBA to RGB and disposed in finally. The selected backend
is returned through the public initialization protocol and checked by its owner.

One detection occupies one port slot until completion or infrastructure failure.
Cancellation rejects the user waiter immediately and suppresses the eventual
response; it cannot preempt synchronous CPU execution. It retains the occupied
slot until that response, or terminates the Worker at the 60-second deadline.
The Worker retains no cancellation-ID accumulator. Tensor/bitmap cleanup runs in
finally. Reset cancels user requests and retains model readiness; retry/dispose
terminates infrastructure and starts a new generation. There is no heavy
main-thread fallback. A configured fallback model URL stays in the same Worker;
external URL/CORS/CSP acceptance remains a declared host decision.

## Reproducible experiment

A complete WARDEN run executes `browser-worker-cpu-responsive` against the actual
assembled production Worker, vendored runtime and model, on a real local origin.
It observes LOADING_RUNTIME → LOADING_MODEL → WARMUP → READY and requires `cpu`.
On the same Worker it runs an actual 32×32 RGB tensor and a browser-encoded
640×480 JPEG Blob through the production input/decoding/inference path. Results
must retain the supplied session context. A 16-ms main-page heartbeat continues
through loading, warmup and both requests. The report contains:

- observed browser/version, backend, state transitions and predictions;
- initializationDurationMs, including runtime/model loading and warmup;
- input bytes and dimensions, synchronous postMessage submissionDurationMs;
- image encodingDurationMs and full request roundtripMs;
- heartbeat count, maximumGapMs and the candidate 250-ms threshold.

Submission duration measures the sending call, not zero-copy behavior or the
Worker's receipt time. Roundtrip combines scheduling, decode/conversion/inference
and messaging; it is not an isolated model benchmark. Blank-image predictions
are not an accuracy test. The deadline includes initialization and both requests.
At least two heartbeats and max gap ≤250 ms are required by the current candidate
profile. The device/Opera hardware budget still needs an actual owner decision;
a local measurement does not establish a universal performance guarantee.

Run from the committed source with the declared toolchain and inspect the named
gate in build/results/warden-report.json. Diagnostic standalone execution may
help investigate, but cannot produce an authorized release. The handoff evidence
includes exact source/build/artifact/ZIP identities and the observed timings.

## Memory and transfer bounds

A Blob is sent with structured clone; the application does not claim a measured
zero-copy transfer and does not retain an ImageBitmap on the main thread. RGB
Int32Array input uses 12×width×height bytes before worker tensor allocation.
For the image path, RGBA readback costs 4×pixels and RGB conversion 12×pixels;
TensorFlow/backend/model allocations are additional. The selected 640×480 test
has 1,228,800 RGBA bytes and 3,686,400 RGB bytes. These are calculated buffer sizes,
not measured process RSS or peak TF memory. Queue length is bounded to one,
bitmaps/tensors are disposed, and final disposal terminates the Worker. Actual
peak memory, thermal behavior, frame-resolution limits and hardware responsiveness
remain part of physical platform review; do not invent measured memory values.

## Host compatibility and refusal

The host must permit the production Worker and same-origin vendored scripts/model
through worker-src/script-src/connect-src, valid MIME types and the model/WASM
routes. Blob image decoding also needs createImageBitmap and OffscreenCanvas.
A missing API, denied asset fetch, backend/model error, Worker error or timeout
produces an explicit failed/retry state; it does not bypass CSP or camera policy.
The automated HTTP gate checks root/subpath URLs and MIME/404 behavior. Live
itch/NOIR iframe allow/sandbox/Permissions-Policy/CSP and physical grant/deny/
pending flows are mandatory manual cases. Cancellation/model failure/restart/
stale-result permutations are separately tested through public historical ports.
