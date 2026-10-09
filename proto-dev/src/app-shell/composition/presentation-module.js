import Loader from '../bootstrap/loader.js';
import AiLoaderView from '../../camera/presentation/ai-loader-view.js';
import BootOverlayView from '../presentation/boot-overlay-view.js';
import OverlayOrchestratorService from '../overlays/overlay-orchestrator-service.js';
import UnifiedOverlayView from '../overlays/presentation/unified-overlay-view.js';
import StatusWidget from '../presentation/status-widget.js';
import ButtonAdapter from '../controls/button-adapter.js';
import PanelAdapter from '../controls/panel-adapter.js';
import ReactionOverlayWidget from '../../reactions/presentation/reaction-overlay-widget.js';
import GhostReactionReplayWidget from '../../reactions/presentation/ghost-reaction-replay-widget.js';
import MediaLightbox from '../../media/presentation/media-lightbox.js';
import ModalWidget from '../overlays/presentation/modal-widget.js';
import GlobalViewPresenter from '../presentation/global-view-presenter.js';
import ViewAdapter from '../navigation/view-adapter.js';
import ChatLauncherWidget from '../../messenger/presentation/chat-launcher-widget.js';
import {
  controlPanelOptions,
  sections as controls,
  screenMap,
} from '../controls/controls-config.js';

/**
 * Registers presentation adapters and widgets.
 */
export default class PresentationModule {
  /**
   * @param {{ container: import('./container.js').default, spiritConfigs: any }} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Register the presentation layer dependencies.
   */
  register() {
    const { container, spiritConfigs } = this.context;

    container.register(
      'ChatLauncherWidget',
      () =>
        new ChatLauncherWidget({
          documentRef: typeof document !== 'undefined' ? document : null,
          language: container.resolve('LanguageAdapter'),
          logger: container.resolve('Logger'),
        }),
      { priority: 52 },
    );

    container.register(
      'OverlayOrchestratorService',
      () => new OverlayOrchestratorService({ mode: 'single' }),
      { priority: 22 },
    );

    container.register(
      'UnifiedOverlayView',
      () =>
        new UnifiedOverlayView(
          container.resolve('OverlayOrchestratorService'),
          container.resolve('IEventBus'),
          container.resolve('LanguageAdapter'),
          typeof window !== 'undefined' ? window : null,
          typeof document !== 'undefined' ? document : null,
        ),
      { priority: 23 },
    );

    container.register(
      'BootOverlayView',
      () =>
        new BootOverlayView(
          container.resolve('IEventBus'),
          container.resolve('OverlayOrchestratorService'),
        ),
      { priority: 25 },
    );

    container.register(
      'AiLoaderView',
      () =>
        new AiLoaderView(
          container.resolve('IEventBus'),
          container.resolve('OverlayOrchestratorService'),
        ),
      { priority: 26 },
    );

    container.register(
      'StatusWidget',
      () => new StatusWidget(null, container.resolve('IEventBus')),
      { priority: 27 },
    );

    container.register(
      'ButtonAdapter',
      () => new ButtonAdapter(container.resolve('IEventBus'), container.resolve('LanguageAdapter')),
      { priority: 59 },
    );

    container.register(
      'PanelAdapter',
      () =>
        new PanelAdapter(
          container.resolve('TemplateService'),
          container.resolve('ButtonService'),
          container.resolve('LanguageAdapter'),
          controls,
          screenMap,
          container.resolve('ProfileRegistrationService'),
          container.resolve('StateService'),
          container.resolve('ButtonStateService'),
          container.resolve('ButtonVisibilityService'),
          container.resolve('GhostService'),
          container.resolve('GhostSwitchService'),
          spiritConfigs,
          container.resolve('DualityManager'),
          container.resolve('ModalService'),
          container.resolve('IEventBus'),
          '[data-js="bottom-panel"]',
          container.resolve('DrumLayoutService'),
          controlPanelOptions.showEmojiDrum,
        ),
      {
        priority: 120,
        deps: ['DrumLayoutService', 'ModalService'],
      },
    );

    container.register(
      'ReactionOverlayWidget',
      () =>
        new ReactionOverlayWidget({
          bus: container.resolve('IEventBus'),
          documentRef: typeof document !== 'undefined' ? document : null,
          windowRef: typeof window !== 'undefined' ? window : null,
        }),
      { priority: 121, deps: ['PanelAdapter'] },
    );

    container.register(
      'GhostReactionReplayWidget',
      () =>
        new GhostReactionReplayWidget({
          bus: container.resolve('IEventBus'),
          documentRef: typeof document !== 'undefined' ? document : null,
          windowRef: typeof window !== 'undefined' ? window : null,
          screenService: container.resolve('ScreenService'),
        }),
      { priority: 122, deps: ['PanelAdapter'] },
    );

    container.register(
      'ModalWidget',
      () =>
        new ModalWidget(
          document.body,
          container.resolve('IEventBus'),
          container.resolve('LanguageAdapter'),
        ),
      { priority: 146 },
    );

    container.register(
      'MediaLightbox',
      () => {
        const lightbox = new MediaLightbox(
          container.resolve('MediaRepository'),
          container.resolve('ModalService'),
          container.resolve('IEventBus'),
        );
        return lightbox;
      },
      { priority: 147, deps: ['ModalWidget'] },
    );

    container.register(
      'GlobalViewPresenter',
      () =>
        new GlobalViewPresenter(
          container.resolve('TemplateService'),
          container.resolve('PanelAdapter'),
          container.resolve('LanguageAdapter'),
          container.resolve('IEventBus'),
          container.resolve('MediaRepository'),
          container.resolve('Logger'),
          container.resolve('DetectionAdapter'),
          container.resolve('IPersistence'),
          container.resolve('DialogTimeline'),
        ),
      { priority: 131 },
    );

    container.register(
      'ViewAdapter',
      () =>
        new ViewAdapter(
          container.resolve('IEventBus'),
          container.resolve('DialogHistoryService'),
          container.resolve('GhostService'),
        ),
      { priority: 132 },
    );

    container.register(
      'Loader',
      () =>
        new Loader(
          container.resolve('Logger'),
          container.resolve('IPersistence'),
          container.resolve('IEventBus'),
        ),
      { priority: 30 },
    );
  }
}
