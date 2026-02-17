import Loader from '../Loader.js';
import AiLoaderView from '../../../presentation/widgets/AiLoaderView.js';
import StatusWidget from '../../../presentation/widgets/StatusWidget.js';
import ButtonAdapter from '../../../adapters/ui/ButtonAdapter.js';
import PanelAdapter from '../../../adapters/ui/PanelAdapter.js';
import ReactionOverlayWidget from '../../../presentation/widgets/ReactionOverlayWidget.js';
import GhostReactionReplayWidget from '../../../presentation/widgets/GhostReactionReplayWidget.js';
import MediaLightbox from '../../../presentation/components/MediaLightbox.js';
import ModalWidget from '../../../presentation/widgets/Modal/index.js';
import GlobalViewPresenter from '../../../presentation/adapters/GlobalViewPresenter.js';
import ViewAdapter from '../../../adapters/ui/ViewAdapter.js';
import ChatLauncherWidget from '../../../presentation/widgets/ChatLauncher/index.js';
import {
  controlPanelOptions,
  sections as controls,
  screenMap
} from '../../../config/controls.config.js';

/**
 * Registers presentation adapters and widgets.
 */
export default class PresentationModule {
  /**
   * @param {{ container: import('../../container/Container.js').default, spiritConfigs: any }} context
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
          language: container.resolve('LanguageService'),
          logger: container.resolve('Logger')
        }),
      { priority: 52 }
    );

    container.register(
      'AiLoaderView',
      () =>
        new AiLoaderView(
          container.resolve('IEventBus'),
          container.resolve('LanguageService')
        ),
      { priority: 26 }
    );

    container.register(
      'StatusWidget',
      () => new StatusWidget(null, container.resolve('IEventBus')),
      { priority: 27 }
    );

    container.register(
      'ButtonAdapter',
      () => new ButtonAdapter(container.resolve('IEventBus'), container.resolve('LanguageService')),
      { priority: 59 }
    );

    container.register(
      'PanelService',
      () =>
        new PanelAdapter(
          container.resolve('TemplateService'),
          container.resolve('ButtonService'),
          container.resolve('LanguageService'),
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
          controlPanelOptions.showEmojiDrum
        ),
      {
        priority: 120,
        deps: ['DrumLayoutService', 'ModalService']
      }
    );

    container.register(
      'ReactionOverlayWidget',
      () =>
        new ReactionOverlayWidget({
          bus: container.resolve('IEventBus'),
          documentRef: typeof document !== 'undefined' ? document : null,
          windowRef: typeof window !== 'undefined' ? window : null,
        }),
      { priority: 121, deps: ['PanelService'] }
    );

    container.register(
      'GhostReactionReplayWidget',
      () =>
        new GhostReactionReplayWidget({
          bus: container.resolve('IEventBus'),
          documentRef: typeof document !== 'undefined' ? document : null,
          windowRef: typeof window !== 'undefined' ? window : null,
          screenService: container.resolve('ScreenService')
        }),
      { priority: 122, deps: ['PanelService'] }
    );

    container.register(
      'ModalWidget',
      () => new ModalWidget(document.body, container.resolve('IEventBus'), container.resolve('LanguageService')),
      { priority: 146 }
    );

    container.register(
      'MediaLightbox',
      () => {
        const lightbox = new MediaLightbox(
          container.resolve('MediaRepository'),
          container.resolve('ModalService'),
          container.resolve('IEventBus')
        );
        lightbox.boot?.();
        return lightbox;
      },
      { priority: 147, deps: ['ModalWidget'] }
    );

    container.register(
      'GlobalViewPresenter',
      () =>
        new GlobalViewPresenter(
          container.resolve('TemplateService'),
          container.resolve('PanelService'),
          container.resolve('LanguageService'),
          container.resolve('IEventBus'),
          container.resolve('MediaRepository'),
          container.resolve('Logger')
        ),
      { priority: 131 }
    );

    container.register(
      'ViewAdapter',
      () =>
        new ViewAdapter(
          container.resolve('IEventBus'),
          container.resolve('DialogHistoryService'),
          container.resolve('GhostService')
        ),
      { priority: 132 }
    );

    container.register(
      'Loader',
      () => new Loader(container.resolve('Logger'), container.resolve('IPersistence'), container.resolve('IEventBus')),
      { priority: 30 }
    );
  }
}
