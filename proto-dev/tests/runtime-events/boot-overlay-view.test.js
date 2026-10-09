import assert from 'assert';
import Observer from '../../src/runtime-events/subscriptions/observer.js';
import BootOverlayView from '../../src/app-shell/presentation/boot-overlay-view.js';
import { OVERLAY_SHOW } from '../../src/runtime-events/domain/constants.js';
import OverlayOrchestratorService from '../../src/app-shell/overlays/overlay-orchestrator-service.js';

describe('BootOverlayView', () => {
  it('publishes app_already_open entry with bypass metadata', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService();
    const view = new BootOverlayView(bus, orchestrator);
    view.boot();

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'app_already_open' });

    const state = orchestrator.getRenderState();
    const card = state.cards.find((entry) => entry.id === 'app_already_open');
    assert.ok(card);
    assert.strictEqual(card.warningKey, 'app_already_open_warning');
    assert.strictEqual(card.actions[0].kind, 'disable_multi_tab_guard');
  });

  it('hides entries on OVERLAY_HIDE', () => {
    const bus = new Observer();
    const orchestrator = new OverlayOrchestratorService();
    const view = new BootOverlayView(bus, orchestrator);
    view.boot();

    bus.emit({ type: OVERLAY_SHOW, i18nKey: 'loading' });
    bus.emit({ type: 'OVERLAY_HIDE' });

    assert.strictEqual(orchestrator.getRenderState().visible, false);
  });
});
