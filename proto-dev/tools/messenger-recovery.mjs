import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium, firefox } from '../node_modules/playwright/index.mjs';
import { root, hashFile, readJson } from '../../build/lib.mjs';
import { serve } from '../../build/serve.mjs';
import { openDatabase, persistence } from '../../constitutional-guard/driver-tools.mjs';

// Additional diagnostic public UI scenarios. Historical WARDEN gates are frozen;
// the registered unit families cover the same recovery contracts automatically.
const argumentsByName = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index],
    value = process.argv[index + 1];
  if (
    !['--browser', '--camera-frame', '--artifact-dir'].includes(name) ||
    !value ||
    argumentsByName.has(name)
  )
    throw new Error(`Invalid argument: ${name}`);
  argumentsByName.set(name, value);
}
const selected = argumentsByName.get('--browser') || 'all';
if (!['all', 'firefox', 'chromium'].includes(selected)) throw new Error('Unknown browser');
const distribution = argumentsByName.has('--artifact-dir')
  ? path.resolve(argumentsByName.get('--artifact-dir'))
  : path.join(
      root,
      (await readJson(path.join(root, 'build/results/distribution.json'))).distribution,
    );
const provenance = await readJson(path.join(distribution, 'build-provenance.json'));
const framePath = argumentsByName.get('--camera-frame');
const frameBytes = framePath ? await readFile(path.resolve(framePath)) : null;
let frameMime = 'image/jpeg';
if (framePath?.endsWith('.png')) frameMime = 'image/png';
if (framePath?.endsWith('.webp')) frameMime = 'image/webp';
const frameDataUrl = frameBytes
  ? `data:${frameMime};base64,${frameBytes.toString('base64')}`
  : null;
const report = {
  schemaVersion: 1,
  diagnostic: true,
  startedAt: new Date().toISOString(),
  sourceSha: provenance.sourceSha,
  artifactManifestSha256: await hashFile(path.join(distribution, 'artifact-manifest.json')),
  cameraFrameSha256: framePath ? await hashFile(path.resolve(framePath)) : null,
  scope:
    'Frozen deployment artifact; public DOM controls; external profile/canvas MediaStream fixtures; real production CPU inference',
  results: [],
};
const storage = persistence(),
  database = await openDatabase(storage);
database.run('INSERT INTO users(id,name,created_at,avatar) VALUES(?,?,?,?)', [
  1,
  'Messenger recovery fixture',
  '2026-10-10',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jX1sAAAAASUVORK5CYII=',
]);
const profile = storage.load('sqlite_db');
await database.dispose();
const server = await serve(distribution, { prefix: '/interdead/' });
const base = `http://127.0.0.1:${server.address().port}/interdead/`;
const output = path.join(root, 'build/results/messenger-recovery');
await mkdir(output, { recursive: true });

function intro(count) {
  return Array.from({ length: count }, (_, index) => `guide:occurrence:guide-intro:${index}`);
}
const cameraMessage = 'guide:occurrence:guide-camera:0';
async function createPage(browser) {
  const context = await browser.newContext();
  context.setDefaultTimeout(30000);
  context.setDefaultNavigationTimeout(30000);
  await context.addInitScript(
    ({ profile, frameDataUrl }) => {
      if (!sessionStorage.getItem('messenger-fixture-seeded')) {
        localStorage.setItem('sqlite_db', JSON.stringify(profile));
        localStorage.setItem('userId', JSON.stringify('1'));
        localStorage.setItem('ghostType', JSON.stringify('guide'));
        localStorage.setItem('captured', 'true');
        localStorage.setItem('language', JSON.stringify('en'));
        sessionStorage.setItem('messenger-fixture-seeded', '1');
      }
      const media = { streams: [] };
      Object.defineProperty(window, '__idpRecoveryMedia', { value: media });
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 600;
          canvas.height = 400;
          const drawing = canvas.getContext('2d');
          let frame;
          if (frameDataUrl) {
            frame = new Image();
            frame.src = frameDataUrl;
            await frame.decode();
            canvas.height = Math.round((canvas.width * frame.height) / frame.width);
          }
          const draw = () =>
            frame
              ? drawing.drawImage(frame, 0, 0, canvas.width, canvas.height)
              : drawing.fillRect(0, 0, canvas.width, canvas.height);
          draw();
          const stream = canvas.captureStream(10);
          const timer = setInterval(() => {
            if (stream.getTracks().every((track) => track.readyState === 'ended'))
              clearInterval(timer);
            else draw();
          }, 100);
          media.streams.push(stream);
          return stream;
        },
      });
    },
    { profile, frameDataUrl },
  );
  const page = await context.newPage(),
    errors = [],
    consoleErrors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (event) => {
    if (event.type() === 'error') consoleErrors.push(event.text());
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-js="messenger-screen"]').waitFor();
  return { page, context, errors, consoleErrors };
}
async function rows(page) {
  const values = await page
    .locator('.dialog__message[data-fingerprint]')
    .evaluateAll((nodes) => nodes.map((node) => node.dataset.fingerprint));
  assert.equal(new Set(values).size, values.length, 'Visible occurrence identities must be unique');
  return values;
}
async function expectRows(page, expected) {
  await page.waitForFunction((values) => {
    const visible = [...document.querySelectorAll('.dialog__message[data-fingerprint]')].map(
      (node) => node.dataset.fingerprint,
    );
    return JSON.stringify(visible) === JSON.stringify(values);
  }, expected);
  assert.deepEqual(
    await rows(page),
    expected,
    'Visible history must match in both content and order',
  );
}
async function enabled(page, action, timeout = 60000) {
  await page.waitForFunction(
    (name) => {
      const button = document.querySelector(`[data-action="${name}"]`);
      return button && !button.disabled;
    },
    action,
    { timeout },
  );
}
async function post(page, expected) {
  const before = await rows(page);
  await enabled(page, 'post');
  await page.locator('[data-action="post"]').click();
  await expectRows(page, expected);
  assert.ok(expected.length > before.length, 'Post must accept a new occurrence');
}
async function cameraReturn(page, expected) {
  await enabled(page, 'toggle-camera');
  await page.locator('[data-action="toggle-camera"]').click();
  await page.locator('[data-js="camera-screen"]').waitFor();
  await page.locator('[data-action="toggle-messenger"]').click();
  await page.locator('[data-js="messenger-screen"]').waitFor();
  await expectRows(page, expected);
  await page.waitForFunction(() =>
    window.__idpRecoveryMedia.streams.every((stream) =>
      stream.getTracks().every((track) => track.readyState === 'ended'),
    ),
  );
}
async function switchTo(page, name, expected) {
  await page.locator('[data-js="ghost-select"]').selectOption(name);
  await page.waitForFunction(
    (value) =>
      JSON.parse(localStorage.getItem('ghostType')) === value ||
      Boolean(document.querySelector('.ghost-switch-modal__button--confirm')),
    name,
  );
  const confirm = page.locator('.ghost-switch-modal__button--confirm');
  if (await confirm.isVisible()) await confirm.click();
  await page.waitForFunction(
    (value) =>
      JSON.parse(localStorage.getItem('ghostType')) === value &&
      document.querySelector('[data-js="ghost-select"]')?.value === value,
    name,
  );
  await expectRows(page, expected);
}
async function reload(page, expected) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-js="messenger-screen"]').waitFor();
  await expectRows(page, expected);
}

try {
  for (const name of selected === 'all' ? ['firefox', 'chromium'] : [selected]) {
    let browser;
    try {
      const options = { headless: true };
      if (name === 'chromium') {
        options.executablePath = process.env.IRON_WARDEN_CHROMIUM_EXECUTABLE || undefined;
        options.args = ['--no-sandbox', '--disable-dev-shm-usage'];
      } else {
        options.executablePath = process.env.IRON_WARDEN_FIREFOX_EXECUTABLE || undefined;
        if (process.env.IRON_WARDEN_FIREFOX_DISABLE_SANDBOX === '1') {
          options.env = { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1' };
          options.firefoxUserPrefs = {
            'security.sandbox.content.level': 0,
            'fission.autostart': false,
            'media.rdd-process.enabled': false,
          };
        }
      }
      browser = await (name === 'firefox' ? firefox : chromium).launch(options);
    } catch (error) {
      report.results.push({
        browser: name,
        id: 'launch',
        status: 'unavailable',
        reason: error.message,
      });
      continue;
    }
    const check = async (id, task) => {
      let owned, deadline;
      try {
        deadline = setTimeout(() => {
          void browser.close();
        }, 240000);
        owned = await createPage(browser);
        const details = await task(owned.page);
        assert.deepEqual(owned.errors, [], 'Production page errors');
        await owned.page.screenshot({ path: path.join(output, `${name}-${id}.png`) });
        report.results.push({
          browser: name,
          version: browser.version(),
          id,
          status: 'passed',
          ...details,
        });
      } catch (error) {
        const observed = await owned?.page
          .evaluate(() => ({
            content: document.querySelector('[data-js="global-content"]')?.textContent,
            buttons: [...document.querySelectorAll('[data-action]')].map((node) => ({
              action: node.dataset.action,
              disabled: node.disabled,
            })),
            fingerprints: [...document.querySelectorAll('.dialog__message[data-fingerprint]')].map(
              (node) => node.dataset.fingerprint,
            ),
            streams: window.__idpRecoveryMedia?.streams.map((stream) =>
              stream.getTracks().map((track) => track.readyState),
            ),
          }))
          .catch(() => null);
        report.results.push({
          browser: name,
          version: browser.version(),
          id,
          status: 'failed',
          reason: error.stack || String(error),
          pageErrors: owned?.errors,
          consoleErrors: owned?.consoleErrors,
          observed,
        });
      } finally {
        clearTimeout(deadline);
        await owned?.context.close();
      }
      process.stdout.write(`${name} ${id}: ${report.results.at(-1).status}\n`);
    };
    try {
      await check('guide-unfinished', async (page) => {
        await expectRows(page, intro(1));
        for (let cycle = 0; cycle < 3; cycle += 1) await cameraReturn(page, intro(1));
        await post(page, intro(3));
        await switchTo(page, 'guest1', []);
        await switchTo(page, 'guide', intro(3));
        await reload(page, intro(3));
        await cameraReturn(page, intro(3));
        await post(page, intro(5));
        await reload(page, intro(5));
        await switchTo(page, 'guest1', []);
        await switchTo(page, 'guide', intro(5));
        await post(page, [...intro(6), cameraMessage]);
        return {
          cameraReturns: 4,
          reloads: 2,
          chatRoundTrips: 2,
          acceptedPosts: 3,
          fingerprints: await rows(page),
        };
      });
      await check('spirit-unfinished', async (page) => {
        await expectRows(page, intro(1));
        await switchTo(page, 'guest1', []);
        for (let cycle = 0; cycle < 3; cycle += 1) await cameraReturn(page, []);
        const first = [
          'guest1:occurrence:guest1-handshake:0',
          'guest1:occurrence:guest1-handshake:1',
        ];
        await post(page, first);
        await reload(page, first);
        await switchTo(page, 'guide', intro(1));
        await switchTo(page, 'guest1', first);
        await cameraReturn(page, first);
        const completedEvent = Array.from(
          { length: 5 },
          (_, index) => `guest1:occurrence:guest1-handshake:${index}`,
        );
        await post(page, completedEvent);
        await reload(page, completedEvent);
        await switchTo(page, 'guide', intro(1));
        await switchTo(page, 'guest1', completedEvent);
        return {
          cameraReturns: 4,
          reloads: 2,
          chatRoundTrips: 2,
          acceptedPosts: 2,
          fingerprints: await rows(page),
        };
      });
      if (!frameDataUrl)
        report.results.push({
          browser: name,
          id: 'guide-reset-photo-completed',
          status: 'unavailable',
          reason:
            'Supply --camera-frame with a JPEG/PNG/WebP containing a person for real inference',
        });
      else
        await check('guide-reset-photo-completed', async (page) => {
          await expectRows(page, intro(1));
          await post(page, intro(3));
          await page.locator('[data-action="reset-account"]').click();
          await page.locator('[data-i18n="reset_modal_current"]').click();
          await expectRows(page, intro(1));
          await post(page, intro(3));
          await post(page, intro(5));
          await post(page, [...intro(6), cameraMessage]);
          await enabled(page, 'toggle-camera');
          await page.locator('[data-action="toggle-camera"]').click();
          await page.locator('[data-js="camera-screen"]').waitFor();
          // The announced successful detection includes a visible decoded
          // preview; initial panel markup can precede its state application.
          await page.waitForFunction(
            () => {
              const preview = document.querySelector('[data-js="selfie-preview"]');
              return preview && !preview.hidden && preview.complete && preview.naturalWidth > 0;
            },
            null,
            { timeout: 90000 },
          );
          await enabled(page, 'capture-btn', 90000);
          await page.locator('[data-action="capture-btn"]').click();
          await page.locator('.modal__button[data-i18n="open_messenger"]').click();
          await page.locator('[data-js="messenger-screen"]').waitFor();
          await page.locator('.dialog__message[data-fingerprint^="capture:"]').waitFor();
          const captured = await rows(page);
          assert.equal(captured.length, 8);
          assert.ok(captured[7].startsWith('capture:'));
          await post(page, [
            ...captured,
            'guide:occurrence:guide-outro:0',
            'guide:occurrence:guide-outro:1',
          ]);
          const awaitingLast = await rows(page);
          await reload(page, awaitingLast);
          await switchTo(page, 'guest1', []);
          await switchTo(page, 'guide', awaitingLast);
          await cameraReturn(page, awaitingLast);
          await post(page, [
            ...awaitingLast,
            'guide:occurrence:guide-outro:2',
            'guide:occurrence:guide-outro:3',
          ]);
          const completed = await rows(page);
          assert.equal(await page.locator('[data-action="post"]').isDisabled(), true);
          await reload(page, completed);
          await switchTo(page, 'guest1', []);
          await switchTo(page, 'guide', completed);
          await cameraReturn(page, completed);
          assert.equal(await page.locator('[data-action="post"]').isDisabled(), true);
          const image = page.locator(
            '.dialog__message[data-fingerprint^="capture:"] .dialog__image',
          );
          await image.waitFor();
          await page.waitForFunction(() => {
            const image = document.querySelector(
              '.dialog__message[data-fingerprint^="capture:"] .dialog__image',
            );
            return image?.complete && image.naturalWidth > 0;
          });
          return {
            reset: true,
            realCapture: true,
            imageRestored: true,
            reloads: 2,
            chatRoundTrips: 2,
            acceptedPostsAfterCapture: 2,
            fingerprints: completed,
          };
        });
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
  report.finishedAt = new Date().toISOString();
  report.status =
    report.results.length && report.results.every((result) => result.status === 'passed')
      ? 'passed'
      : 'failed';
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
process.stdout.write(`Messenger browser recovery: ${report.status}\n`);
process.exitCode = report.status === 'passed' ? 0 : 1;
