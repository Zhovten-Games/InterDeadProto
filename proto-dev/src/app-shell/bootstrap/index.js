import ApplicationBootstrap from './application-bootstrap.js';

const application = new ApplicationBootstrap();
application.start().catch((error) => {
  console.error('Application boot failed', error);
  const content = document.querySelector('[data-js="global-content"]');
  if (!content || content.children.length) return;
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = `Application could not start: ${error.message}. Reload to retry.`;
  content.appendChild(message);
});
