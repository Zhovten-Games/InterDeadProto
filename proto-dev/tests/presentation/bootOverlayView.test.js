import assert from 'assert';
import Observer from '../../src/utils/Observer.js';
import BootOverlayView from '../../src/presentation/widgets/BootOverlayView.js';
import { OVERLAY_SHOW } from '../../src/core/events/constants.js';
import OverlayOrchestratorService from '../../src/application/services/OverlayOrchestratorService.js';

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
