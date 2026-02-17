import assert from 'assert';
import { JSDOM } from 'jsdom';

import { ScreeningApp } from '../../../person/src/presentation/components/ScreeningApp.js';
import { ConfigMethodology } from '../../../person/src/core/methodology/ConfigMethodology.js';

function createMethodology() {
  return new ConfigMethodology({
    id: 'demo',
    label: 'Demo',
    languages: ['en'],
    categories: [
      { id: 'cat', names: { default: 'Category' } }
    ],
    questions: [
      {
        id: 'core-1',
        categoryId: 'cat',
        type: 'core',
        text: { default: 'Core question?' },
        impact: true
      },
      {
        id: 'support-1',
        categoryId: 'cat',
        type: 'support',
        text: { default: 'Support question?' }
      }
    ],
    labels: []
  });
}

describe('ScreeningApp question highlighting', () => {
  it('marks key questions with dedicated badges and data attributes', () => {
    const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;

    const root = dom.window.document.getElementById('root');
    const app = new ScreeningApp(root);
    app.state.language = 'en';
    app.state.methodology = createMethodology();

    app.render();

    const coreCard = root.querySelector('.question-card[data-type="core"]');
    assert.ok(coreCard, 'Core question card should be present');
    assert.strictEqual(coreCard.dataset.questionId, 'core-1');
    assert.strictEqual(coreCard.dataset.impact, 'true');
    assert.ok(coreCard.classList.contains('question-card--core'));

    const coreBadge = coreCard.querySelector('.question-badge--core');
    assert.ok(coreBadge, 'Core badge should be rendered');
    assert.strictEqual(coreBadge.textContent, app.translator.t('question.badge.core'));

    const impactBadge = coreCard.querySelector('.question-badge--impact');
    assert.ok(impactBadge, 'Impact badge should be rendered for marked questions');

    const supportCard = root.querySelector('.question-card[data-type="support"]');
    assert.ok(supportCard, 'Support question card should be present');
    assert.strictEqual(supportCard.dataset.questionId, 'support-1');
    assert.ok(supportCard.querySelector('.question-badge--support'));

    delete global.window;
    delete global.document;
  });
});
