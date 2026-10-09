import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { chromium } from '../../proto-dev/node_modules/playwright/index.mjs';
import { root, readJson } from '../../build/lib.mjs';
import { serve } from '../../build/serve.mjs';
import { openDatabase, persistence } from '../driver-tools.mjs';

const ids = [
  'browser-fresh-four-locales',
  'browser-profile-reload-subpath',
  'browser-worker-cpu-responsive',
  'browser-service-worker-generation',
];
const result = (id, status, details = {}) => ({
  id,
  phase: 'postbuild',
  mandatory: true,
  status,
  ...details,
});
export async function browserChecks(distribution) {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.IRON_WARDEN_CHROMIUM_EXECUTABLE || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (error) {
    return ids.map((id) =>
      result(id, 'unavailable', { reason: `Chromium could not launch: ${error.message}` }),
    );
  }
  const directory = path.join(root, distribution.distribution);
  const gates = [];
  const check = async (id, task) => {
    let deadline;
    const deadlineMs = id === 'browser-profile-reload-subpath' ? 300000 : 120000;
    try {
      gates.push(
        result(id, 'passed', {
          browser: { name: 'Chromium', version: browser.version() },
          ...(await Promise.race([
            task(),
            new Promise((_, reject) => {
              deadline = setTimeout(() => {
                void browser.close().catch(() => {});
                reject(
                  new Error(`Browser gate exceeded its ${deadlineMs}-millisecond deadline: ${id}`),
                );
              }, deadlineMs);
            }),
          ])),
        }),
      );
    } catch (error) {
      gates.push(result(id, 'failed', { reason: error.stack || String(error) }));
    } finally {
      clearTimeout(deadline);
    }
    process.stderr.write(`Browser gate ${id}: ${gates.at(-1).status}\n`);
  };
  const local = async (prefix, task) => {
    const server = await serve(directory, { prefix });
    try {
      return await task(`http://127.0.0.1:${server.address().port}${prefix}`);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  };
  const newContext = async () => {
    const context = await browser.newContext();
    context.setDefaultTimeout(30000);
    context.setDefaultNavigationTimeout(30000);
    return context;
  };
  await mkdir(path.join(root, 'build/results/browser'), { recursive: true });
  try {
    await check(ids[0], () =>
      local('/', async (base) => {
        const observations = [];
        for (const locale of ['en', 'ru', 'uk', 'ja']) {
          const context = await newContext();
          try {
            await context.addInitScript(
              (code) => localStorage.setItem('language', JSON.stringify(code)),
              locale,
            );
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.goto(base, { waitUntil: 'domcontentloaded' });
            await page.locator('[data-i18n="welcome"]').waitFor({ timeout: 30000 });
            await page.waitForFunction(
              () =>
                document.documentElement.lang ===
                localStorage.getItem('language')?.replaceAll('"', ''),
            );
            const expected = (
              await readJson(path.join(directory, `src/i18n/locales/${locale}/ui.json`))
            ).welcome;
            await page.waitForFunction(
              (value) => document.querySelector('[data-i18n="welcome"]')?.textContent === value,
              expected,
            );
            const text = await page.locator('[data-i18n="welcome"]').textContent();
            if (text !== expected || errors.length)
              throw new Error(
                `${locale}: ${errors.join('; ') || `Expected ${expected}, observed ${text}`}`,
              );
            const controls = page.locator('.panel button:not([disabled])');
            if (!(await controls.count()))
              throw new Error('No enabled public controls after bootstrap');
            await page.screenshot({
              path: path.join(root, `build/results/browser/welcome-${locale}.png`),
            });
            observations.push({ locale, text, pageErrors: errors });
          } finally {
            await context.close();
          }
        }
        return { observations };
      }),
    );
    await check(ids[1], () =>
      local('/interdead/', async (base) => {
        const store = persistence();
        const db = await openDatabase(store);
        db.run('INSERT INTO users(id,name,created_at,avatar) VALUES(?,?,?,?)', [
          1,
          'WARDEN fixture',
          '2025-01-01T00:00:00Z',
          'data:image/png;base64,iVBORw0KGgo=',
        ]);
        db.run(
          'CREATE TABLE dialog_messages(ghost TEXT,order_idx INTEGER,author TEXT,text TEXT,type TEXT,avatar TEXT,src TEXT,media_id TEXT,fingerprint TEXT,ts INTEGER,PRIMARY KEY(ghost,fingerprint))',
        );
        db.run(
          "INSERT INTO dialog_messages VALUES('guide',1,'ghost','guide.stage1',NULL,NULL,NULL,NULL,'warden:legacy:guide:1',0)",
        );
        db.run(
          "INSERT INTO dialog_messages VALUES('guide',2,'user','guide.user.reply1',NULL,NULL,NULL,NULL,'warden:legacy:guide:2',1)",
        );
        const snapshot = store.load('sqlite_db');
        await db.dispose();
        const context = await newContext();
        try {
          await context.addInitScript((saved) => {
            if (!sessionStorage.getItem('fixture-initialized')) {
              localStorage.setItem('sqlite_db', JSON.stringify(saved));
              localStorage.setItem('userId', JSON.stringify('1'));
              localStorage.setItem('captured', 'true');
              sessionStorage.setItem('fixture-initialized', '1');
            }
          }, snapshot);
          await context.addInitScript(() => {
            const externalMedia = { streams: [], canvases: [] };
            Object.defineProperty(window, '__wardenExternalMedia', { value: externalMedia });
            Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
              configurable: true,
              value: async () => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                canvas.getContext('2d').fillRect(0, 0, 64, 64);
                const stream = canvas.captureStream(10);
                externalMedia.canvases.push(canvas);
                externalMedia.streams.push(stream);
                return stream;
              },
            });
          });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.goto(base, { waitUntil: 'domcontentloaded' });
          await page.locator('[data-js="messenger-screen"]').waitFor({ timeout: 30000 });
          await page
            .locator('.dialog__message[data-fingerprint="warden:legacy:guide:2"]')
            .waitFor({ timeout: 30000 });
          const before = await page.locator('.dialog__message').count();
          const fingerprints = await page
            .locator('.dialog__message[data-fingerprint]')
            .evaluateAll((nodes) => nodes.map((node) => node.dataset.fingerprint));
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.locator('[data-js="messenger-screen"]').waitFor({ timeout: 30000 });
          await page
            .locator('.dialog__message[data-fingerprint="warden:legacy:guide:2"]')
            .waitFor({ timeout: 30000 });
          if (errors.length) throw new Error(errors.join('; '));
          const restored = await page
            .locator('.dialog__message[data-fingerprint]')
            .evaluateAll((nodes) => nodes.map((node) => node.dataset.fingerprint));
          if (
            fingerprints.some((identity) => !restored.includes(identity)) ||
            new Set(restored).size !== restored.length
          )
            throw new Error('Reload lost or duplicated occurrence identities');
          const after = await page.locator('.dialog__message').count();
          if (after < before) throw new Error(`Reload lost rendered history: ${before} → ${after}`);
          for (let cycle = 0; cycle < 20; cycle += 1) {
            const camera = page.locator('[data-action="toggle-camera"]');
            await camera.waitFor({ timeout: 30000 });
            await page.waitForFunction(
              () => {
                const button = document.querySelector('[data-action="toggle-camera"]');
                return button && !button.disabled;
              },
              null,
              { timeout: 60000 },
            );
            await camera.click();
            await page.locator('[data-js="camera-screen"]').waitFor({ timeout: 30000 });
            await page.locator('[data-action="toggle-messenger"]').click();
            await page.locator('[data-js="messenger-screen"]').waitFor({ timeout: 30000 });
            await page.waitForFunction(() =>
              window.__wardenExternalMedia.streams.every((stream) =>
                stream.getTracks().every((track) => track.readyState === 'ended'),
              ),
            );
            const select = page.locator('[data-js="ghost-select"]');
            await select.selectOption('guest1');
            const confirm = page.locator('.ghost-switch-modal__button--confirm');
            if (await confirm.count()) await confirm.click();
            await page.waitForFunction(
              () => JSON.parse(localStorage.getItem('ghostType')) === 'guest1',
            );
            await select.selectOption('guide');
            if (await confirm.count()) await confirm.click();
            await page.waitForFunction(
              () =>
                document.querySelector('[data-js="ghost-select"]')?.value === 'guide' &&
                JSON.parse(localStorage.getItem('ghostType')) === 'guide',
            );
            await page
              .locator('.dialog__message[data-fingerprint="warden:legacy:guide:2"]')
              .waitFor();
            for (const identity of fingerprints) {
              await page
                .locator(`.dialog__message[data-fingerprint=${JSON.stringify(identity)}]`)
                .waitFor();
            }
            process.stderr.write(`Browser stress cycle ${cycle + 1}/20 completed\n`);
          }
          const stress = await page.evaluate(() => ({
            cycles: 20,
            streams: window.__wardenExternalMedia.streams.length,
            liveTracks: window.__wardenExternalMedia.streams
              .flatMap((stream) => stream.getTracks())
              .filter((track) => track.readyState !== 'ended').length,
            identities: [...document.querySelectorAll('.dialog__message[data-fingerprint]')].map(
              (node) => node.dataset.fingerprint,
            ),
          }));
          if (
            stress.streams < 20 ||
            stress.liveTracks ||
            new Set(stress.identities).size !== stress.identities.length ||
            fingerprints.some((identity) => !stress.identities.includes(identity))
          )
            throw new Error(
              `Public transition stress violated resource/history ownership: ${JSON.stringify(stress)}`,
            );
          const saved = await page.evaluate(() => ({
            profile: JSON.parse(localStorage.getItem('userId')),
            captured: JSON.parse(localStorage.getItem('captured')),
            database: Boolean(localStorage.getItem('sqlite_db')),
          }));
          // captured is the current camera-operation flag; returning from camera
          // legitimately resets it. Profile restoration comes from persisted data.
          if (String(saved.profile) !== '1' || !saved.database)
            throw new Error(`Profile/database identity disappeared: ${JSON.stringify(saved)}`);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.locator('[data-js="messenger-screen"]').waitFor({ timeout: 30000 });
          for (const identity of fingerprints) {
            await page
              .locator(`.dialog__message[data-fingerprint=${JSON.stringify(identity)}]`)
              .waitFor();
          }
          return {
            prefix: '/interdead/',
            before,
            after,
            fingerprints,
            restored,
            saved,
            stress,
            scope:
              'Chromium with controlled external canvas MediaStreams; physical Opera permissions remain manual',
          };
        } finally {
          await context.close();
        }
      }),
    );
    await check(ids[2], () =>
      local('/', async (base) => {
        const context = await newContext();
        try {
          const page = await context.newPage();
          // A document from the assembled tree supplies the real origin; no app
          // debug commands or source-runtime substitution are exposed.
          await page.goto(base + 'src/presentation/templates/welcome.html');
          const manifest = await readJson(path.join(directory, 'artifact-manifest.json'));
          const file = manifest.files.find((row) =>
            /(?:^|\/)detection-worker-[^/]+\.js$/.test(row.path),
          );
          if (!file) throw new Error('Production detection worker missing from artifact');
          const observed = await page.evaluate(
            async ({ workerUrl, baseUrl, buildId }) => {
              const worker = new Worker(workerUrl);
              const states = [],
                gaps = [];
              let previous = performance.now();
              const interval = setInterval(() => {
                const now = performance.now();
                gaps.push(now - previous);
                previous = now;
              }, 16);
              const requests = new Map();
              const submissions = new Map();
              worker.onmessage = ({ data }) => {
                if (data.type === 'state') {
                  states.push(data.state);
                  return;
                }
                const callback = requests.get(data.id);
                if (callback) {
                  requests.delete(data.id);
                  data.error
                    ? callback.reject(new Error(data.error))
                    : callback.resolve(data.result);
                }
              };
              const request = (id, type, payload) =>
                new Promise((resolve, reject) => {
                  requests.set(id, { resolve, reject });
                  const submittedAt = performance.now();
                  worker.postMessage({ protocol: 1, id, type, ...payload });
                  submissions.set(id, performance.now() - submittedAt);
                });
              const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Real CPU worker exceeded 60 seconds')), 60000),
              );
              try {
                const initializedAt = performance.now();
                const ready = await Promise.race([
                  request(1, 'initialize', {
                    options: {
                      tfUrl: baseUrl + 'assets/libs/tf.min.js',
                      cocoUrl: baseUrl + 'assets/libs/coco-ssd.min.js',
                      modelUrl: baseUrl + 'assets/models/coco-ssd/model.json',
                      buildId,
                    },
                  }),
                  timeout,
                ]);
                const initializationDurationMs = performance.now() - initializedAt;
                const tensorSubmittedAt = performance.now();
                const detected = await Promise.race([
                  request(2, 'detect', {
                    frame: { data: new Int32Array(32 * 32 * 3), width: 32, height: 32 },
                    context: { sessionRevision: 1 },
                  }),
                  timeout,
                ]);
                const tensorRoundtripMs = performance.now() - tensorSubmittedAt;
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const context = canvas.getContext('2d');
                context.fillStyle = 'black';
                context.fillRect(0, 0, canvas.width, canvas.height);
                const encodedAt = performance.now();
                const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
                if (!blob) throw new Error('Browser JPEG encoding failed');
                const encodingDurationMs = performance.now() - encodedAt;
                const imageSubmittedAt = performance.now();
                const imageDetected = await Promise.race([
                  request(3, 'detect', {
                    frame: blob,
                    context: { sessionRevision: 2 },
                  }),
                  timeout,
                ]);
                if (imageDetected.context.sessionRevision !== 2)
                  throw new Error('Image result lost its session context');
                return {
                  backend: ready.backend,
                  states,
                  predictions: detected.predictions.length,
                  heartbeats: gaps.length,
                  maximumGapMs: Math.max(0, ...gaps),
                  initializationDurationMs,
                  tensorInput: {
                    width: 32,
                    height: 32,
                    bytes: 32 * 32 * 3 * 4,
                    submissionDurationMs: submissions.get(2),
                    roundtripMs: tensorRoundtripMs,
                  },
                  imageInput: {
                    kind: 'image/jpeg Blob',
                    width: canvas.width,
                    height: canvas.height,
                    encodedBytes: blob.size,
                    encodingDurationMs,
                    submissionDurationMs: submissions.get(3),
                    roundtripMs: performance.now() - imageSubmittedAt,
                    predictions: imageDetected.predictions.length,
                  },
                };
              } finally {
                clearInterval(interval);
                worker.terminate();
              }
            },
            { workerUrl: base + file.path, baseUrl: base, buildId: distribution.buildId },
          );
          if (
            observed.backend !== 'cpu' ||
            !observed.states.includes('READY') ||
            observed.heartbeats < 2 ||
            observed.maximumGapMs > 250
          )
            throw new Error(
              `Worker responsiveness/readiness violated: ${JSON.stringify(observed)}`,
            );
          return {
            ...observed,
            thresholdMs: 250,
            scope: 'local Chromium CPU worker; physical Opera host matrix remains manual',
          };
        } finally {
          await context.close();
        }
      }),
    );
    await check(ids[3], () =>
      local('/', async (base) => {
        const context = await newContext();
        try {
          const page = await context.newPage();
          await page.goto(base + 'src/presentation/templates/welcome.html');
          const observed = await page.evaluate(
            async ({ baseUrl, buildId }) => {
              const oldCache = await caches.open('ai-runtime::previous-fixture');
              await oldCache.put(
                baseUrl + 'assets/libs/tf.min.js',
                new Response('previous generation'),
              );
              const registration = await navigator.serviceWorker.register(
                baseUrl + `sw.js?v=${encodeURIComponent(buildId)}`,
                { scope: '/' },
              );
              await navigator.serviceWorker.ready;
              await new Promise((resolve) => {
                if (navigator.serviceWorker.controller) resolve();
                else
                  navigator.serviceWorker.addEventListener('controllerchange', resolve, {
                    once: true,
                  });
              });
              await fetch(baseUrl + 'assets/libs/tf.min.js');
              const names = await caches.keys();
              await registration.unregister();
              return { names, buildId };
            },
            { baseUrl: base, buildId: distribution.buildId },
          );
          if (
            observed.names.includes('ai-runtime::previous-fixture') ||
            !observed.names.includes(`ai-runtime::${distribution.buildId}`)
          )
            throw new Error('Service worker mixed generations');
          return observed;
        } finally {
          await context.close();
        }
      }),
    );
  } finally {
    await browser.close();
  }
  return gates;
}
