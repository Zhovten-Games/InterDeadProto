import assert from 'assert';
import { JSDOM } from 'jsdom';
import Observer from '../../src/utils/Observer.js';
import OverlayOrchestratorService from '../../src/application/services/OverlayOrchestratorService.js';
import UnifiedOverlayView from '../../src/presentation/widgets/UnifiedOverlayView.js';
import BootOverlayView from '../../src/presentation/widgets/BootOverlayView.js';
import AiLoaderView from '../../src/presentation/widgets/AiLoaderView.js';
import { AI_STATE_CHANGED, OVERLAY_SHOW } from '../../src/core/events/constants.js';

describe('UnifiedOverlayView', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM(
      '<body><div data-js="global-content"></div><div class="app__loader"></div></body>',
      {
        url: 'http://localhost',
      },
    );
    global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('keeps only one .app__loader root', () => {
    const orchestrator = new OverlayOrchestratorService();
    const bus = new Observer();
    const view = new UnifiedOverlayView(orchestrator, bus, null, window, document);
    view.boot();

    assert.strictEqual(document.querySelectorAll('.app__loader').length, 1);
  });

  it('renders cards by mode (single/tabs/stack)', () => {
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });
    const bus = new Observer();
    const view = new UnifiedOverlayView(orchestrator, bus, null, window, document);
    view.boot();

    orchestrator.registerEntry('loading', { statusKey: 'loading', priority: 200 });
    orchestrator.registerEntry('ai_loading', { statusKey: 'ai_loading_status', priority: 100 });

    assert.strictEqual(document.querySelectorAll('[data-overlay-card]').length, 1);

    orchestrator.setMode('tabs');
    assert.ok(document.querySelector('[data-js="overlay-tabs"]'));
    assert.strictEqual(document.querySelectorAll('[data-js="overlay-tab"]').length, 2);

    orchestrator.setMode('stack');
    assert.strictEqual(document.querySelectorAll('[data-overlay-card]').length, 2);
  });

  it('executes bypass action via unified host', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService();
    const bootOverlay = new BootOverlayView(bus, orchestrator);
    const calls = { count: 0 };
    const windowRef = {
      localStorage: {
        setItem: (key, value) => {
          calls.key = key;
          calls.value = value;
        },
      },
      location: {
        reload: () => {
          calls.count += 1;
        },
      },
    };
    const view = new UnifiedOverlayView(orchestrator, bus, null, windowRef, document);

    view.boot();
    bootOverlay.boot();

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'app_already_open' });
    document.querySelector('[data-js="overlay-action"]').click();

    assert.strictEqual(calls.key, 'interdead_disable_multi_tab_guard');
    assert.strictEqual(calls.value, '1');
    assert.strictEqual(calls.count, 1);
  });

  it('selects ai_loading after boot hide and ai non-ready sequence in single mode', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });
    const unified = new UnifiedOverlayView(orchestrator, bus, null, window, document);
    const bootOverlay = new BootOverlayView(bus, orchestrator);
    const aiOverlay = new AiLoaderView(bus, orchestrator);

    unified.boot();
    bootOverlay.boot();
    aiOverlay.boot();

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'loading' });
    bus.emit({ type: 'OVERLAY_HIDE' });
    bus.emit({ type: AI_STATE_CHANGED, state: 'LOADING_MODEL' });

    assert.strictEqual(orchestrator.getRenderState().activeCardId, 'ai_loading');
    assert.strictEqual(
      document.querySelector('[data-overlay-card]')?.getAttribute('data-overlay-card'),
      'ai_loading',
    );
  });

  it('hides overlay when ai is ready and no blockers exist', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });
    const unified = new UnifiedOverlayView(orchestrator, bus, null, window, document);
    const aiOverlay = new AiLoaderView(bus, orchestrator);

    unified.boot();
    aiOverlay.boot();

    bus.emit({ type: AI_STATE_CHANGED, state: 'READY' });

    assert.strictEqual(orchestrator.getRenderState().visible, false);
    assert.ok(!document.querySelector('[data-overlay-card]'));
  });


  it('uses dedicated contact i18n keys for boot, ai, and blocker cards', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });
    const unified = new UnifiedOverlayView(orchestrator, bus, null, window, document);
    const bootOverlay = new BootOverlayView(bus, orchestrator);
    const aiOverlay = new AiLoaderView(bus, orchestrator);

    unified.boot();
    bootOverlay.boot();
    aiOverlay.boot();

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'loading' });
    const loadingCard = orchestrator.getRenderState().cards.find((entry) => entry.id === 'loading');
    assert.strictEqual(loadingCard.contactKey, 'overlay_contact_loading');
    assert.ok(!loadingCard.contactText);

    bus.emit({ type: AI_STATE_CHANGED, state: 'LOADING_MODEL' });
    const aiCard = orchestrator.getRenderState().cards.find((entry) => entry.id === 'ai_loading');
    assert.strictEqual(aiCard.contactKey, 'overlay_contact_ai');

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'app_already_open' });
    const blockedCard = orchestrator
      .getRenderState()
      .cards.find((entry) => entry.id === 'app_already_open');
    assert.strictEqual(blockedCard.contactKey, 'overlay_contact_blocked');

    assert.strictEqual(
      document.querySelector('[data-overlay-card="app_already_open"] .app__loader-contact')?.getAttribute('data-i18n'),
      'overlay_contact_blocked',
    );
  });

  it('preempts active card with app_already_open blocker', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });
    const unified = new UnifiedOverlayView(orchestrator, bus, null, window, document);
    const bootOverlay = new BootOverlayView(bus, orchestrator);
    const aiOverlay = new AiLoaderView(bus, orchestrator);

    unified.boot();
    bootOverlay.boot();
    aiOverlay.boot();

    bus.emit({ type: AI_STATE_CHANGED, state: 'LOADING_MODEL' });
    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'app_already_open' });

    assert.strictEqual(orchestrator.getRenderState().activeCardId, 'app_already_open');
  });

  it('keeps deterministic final card after rapid event burst', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });
    const bootOverlay = new BootOverlayView(bus, orchestrator);
    const aiOverlay = new AiLoaderView(bus, orchestrator);

    bootOverlay.boot();
    aiOverlay.boot();

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'loading' });
    bus.emit({ type: 'OVERLAY_HIDE' });
    bus.emit({ type: AI_STATE_CHANGED, state: 'LOADING_RUNTIME' });
    bus.emit({ type: AI_STATE_CHANGED, state: 'READY' });
    bus.emit({ type: AI_STATE_CHANGED, state: 'LOADING_MODEL' });

    assert.strictEqual(orchestrator.getRenderState().activeCardId, 'ai_loading');
  });

  it('deduplicates repeated duplicate events without flicker', () => {
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });

    orchestrator.registerEntry('loading', { visible: true, statusKey: 'loading' });
    const firstStamp = orchestrator.getRenderState().diagnostics.lastTransitionAt;

    orchestrator.updateEntry('loading', { visible: true, statusKey: 'loading' });
    const secondStamp = orchestrator.getRenderState().diagnostics.lastTransitionAt;

    assert.strictEqual(firstStamp, secondStamp);
  });

  it('expires stale transient loading entries by ttl', () => {
    const orchestrator = new OverlayOrchestratorService({ mode: 'single' });

    orchestrator.registerEntry('loading', { visible: true, ttlMs: 1 });
    const stale = orchestrator.entries.get('loading');
    stale.lastUpdatedAt = Date.now() - 100;
    orchestrator.entries.set('loading', stale);

    const state = orchestrator.getRenderState();
    assert.strictEqual(state.visible, false);
  });
});
