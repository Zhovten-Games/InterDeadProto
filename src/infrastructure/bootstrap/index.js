import composeApplication from './composeApplication.js';

const { container } = composeApplication();
const embedding = container.resolve('EmbeddingModeResolver');
const embedState = embedding.resolve();

if (embedState.mode === 'launcher') {
  container
    .resolve('LauncherBootstrapper')
    .boot()
    .catch(err => container.resolve('Logger').error(`Launcher boot failed: ${err}`));
} else {
  container
    .resolve('FullAppBootstrapper')
    .boot()
    .catch(err => container.resolve('Logger').error(`Failed boot: ${err}`));
}
