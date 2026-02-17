import ITemplateRenderer from '../../src/ports/ITemplateRenderer.js';
import { assertPortContract } from './assertPortContract.js';

describe('ITemplateRenderer contract', () => {
  it('declares template rendering API', async () => {
    await assertPortContract(ITemplateRenderer, [
      { name: 'loadTemplate', async: true, args: ['name'] },
      { name: 'fill', args: ['template', {}] },
      { name: 'render', async: true, args: ['name', {}] },
      { name: 'renderSection', async: true, args: ['#app', 'name', {}] }
    ]);
  });
});
