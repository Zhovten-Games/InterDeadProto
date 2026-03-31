## Introduction

`@interdead/framework` is the shared UI runtime package for InterDead hosts. It provides a modular feature registry and a stable API for enabling only the needed interactive effects.

Current shipped feature set:

- `membrane` (interactive horizontal membrane lines with hover/click/touch/focus pulse reaction).
- `decorativeTitle` (prototype decorative title enhancement with SVG pattern fill and membrane pulse sync; currently in active development and not considered stable for production-wide rollout).

## Installation

```bash
npm install @interdead/framework
```

## Build targets

The package builds in three formats:

- ESM: `dist/esm`
- CJS: `dist/cjs`
- Browser global bundle: `dist/browser/interdead-framework.global.js` (`window.InterdeadFramework`)

## Usage (JavaScript host / InterDeadProto style)

```ts
import {
  FrameworkRuntime,
  JsObjectConfigSourceAdapter,
} from '@interdead/framework';

const runtime = new FrameworkRuntime(
  new JsObjectConfigSourceAdapter({
    enabledFeatures: { membrane: true, decorativeTitle: true },
    featureOptions: {
      membrane: {
        interactionSelectors: ['button', '[data-action]'],
        activeBodyClass: 'proto-membrane-active',
        canvasClassName: 'proto-membrane-canvas',
        reducedMotionMode: 'minimal',
      },
      decorativeTitle: {
        selectors: ['[data-decorative-title]'],
        pulseHighlightDurationMs: 220,
      },
    },
  }),
);

runtime.boot();
```

## Usage (Hugo host / InterDeadIT style)

```ts
import { FrameworkRuntime, HugoConfigSourceAdapter } from '@interdead/framework';

const runtime = new FrameworkRuntime(new HugoConfigSourceAdapter(document));
runtime.boot();
```

Provide config marker in HTML (recommended on `<body>`):

```html
<body
  data-interdead-framework="true"
  data-framework-membrane="true"
  data-framework-decorative-title="true"
  data-framework-decorative-title-selectors="[data-decorative-title]"
  data-framework-membrane-selectors="[data-modal-trigger], [data-auth-button], .gm-slider__arrow"
  data-framework-reduced-motion-mode="minimal"
></body>
```

Host-level selector override is supported per Hugo host. For example, InterDeadIT can roll out decorative titles for all primary headings without changing framework defaults by setting `data-framework-decorative-title-selectors="h1"` in its theme marker.

## Known limitations (prototype)

- `decorativeTitle` currently restores heading content as plain text on `destroy()`. If your opt-in heading contains complex nested markup, that markup is not reconstructed after teardown.

## Reduced motion

- `disable`: do not mount the feature when `prefers-reduced-motion: reduce` is active.
- `minimal`: mount with reduced membrane profile (lower line count and amplitude).
- `full`: mount with unchanged profile.

## API

- `createInterdeadFramework(config, options)`
- `FrameworkRuntime` (`boot`, `destroy`)
- `HugoConfigSourceAdapter`
- `JsObjectConfigSourceAdapter`

## Release

- Tag format: `framework-v0.1.0`
- Build and tests:
  - `npm run build`
  - `npm test`
