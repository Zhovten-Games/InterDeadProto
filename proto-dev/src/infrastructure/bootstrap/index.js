import FrameworkBridge from './FrameworkBridge.js';
import composeApplication from './composeApplication.js';

const DEFAULT_FRAMEWORK_WAIT_MS = 4000;
const PANEL_READY_SELECTOR = '[data-js="panel-controls"] .panel__bottom';

function waitForElement(selector, timeoutMs = DEFAULT_FRAMEWORK_WAIT_MS) {
  const existing = document.querySelector(selector);
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const target = document.querySelector(selector);
      if (!target) return;
      observer.disconnect();
      resolve(target);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}

async function bootFrameworkBridge(frameworkBridge, { waitForPanel = false } = {}) {
  if (waitForPanel) {
    await waitForElement(PANEL_READY_SELECTOR);
  }
  frameworkBridge.boot();
}

const { container } = composeApplication();
const frameworkBridge = new FrameworkBridge({
  windowRef: window,
  documentRef: document,
  persistence: container.resolve('IPersistence'),
});
const embedding = container.resolve('EmbeddingModeResolver');
const embedState = embedding.resolve();

if (embedState.mode === 'launcher') {
  container
    .resolve('LauncherBootstrapper')
    .boot()
    .then(() => frameworkBridge.boot())
    .catch((err) => container.resolve('Logger').error(`Launcher boot failed: ${err}`));
} else {
  container
    .resolve('FullAppBootstrapper')
    .boot()
    .then(() => frameworkBridge.boot())
    .catch((err) => container.resolve('Logger').error(`Failed boot: ${err}`));
}

window.addEventListener('beforeunload', () => {
  frameworkBridge.dispose();
});
