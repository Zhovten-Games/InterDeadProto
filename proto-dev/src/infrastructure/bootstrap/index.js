import FrameworkBridge from './FrameworkBridge.js';
import composeApplication from './composeApplication.js';

const { container } = composeApplication();
const frameworkBridge = new FrameworkBridge({ windowRef: window, documentRef: document });
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
