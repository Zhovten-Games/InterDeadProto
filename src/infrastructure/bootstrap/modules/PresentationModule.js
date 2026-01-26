import Loader from '../Loader.js';
import LoaderView from '../../../presentation/widgets/LoaderView.js';
import LoaderModuleNameProvider from '../../../presentation/components/loader/LoaderModuleNameProvider.js';
import StatusWidget from '../../../presentation/widgets/StatusWidget.js';
import ButtonAdapter from '../../../adapters/ui/ButtonAdapter.js';
import PanelAdapter from '../../../adapters/ui/PanelAdapter.js';
import PanelEffectsWidget from '../../../presentation/widgets/PanelEffectsWidget.js';
import ReactionOverlayWidget from '../../../presentation/widgets/ReactionOverlayWidget.js';
import GhostReactionReplayWidget from '../../../presentation/widgets/GhostReactionReplayWidget.js';
import MediaLightbox from '../../../presentation/components/MediaLightbox.js';
import ModalWidget from '../../../presentation/widgets/Modal/index.js';
import GlobalViewPresenter from '../../../presentation/adapters/GlobalViewPresenter.js';
import ViewAdapter from '../../../adapters/ui/ViewAdapter.js';
import TextFieldAnimator from '../../../presentation/components/forms/TextFieldAnimator.js';
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

    container.register('TextFieldAnimator', () => new TextFieldAnimator(), { priority: 51 });

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
      'LoaderNameProvider',
      () => new LoaderModuleNameProvider(container.resolve('LanguageService')),
      { priority: 52 }
    );

    container.register(
      'LoaderView',
      () =>
        new LoaderView(
          container.resolve('IEventBus'),
          container.resolve('LanguageService'),
          container.resolve('LoaderNameProvider')
        ),
      { priority: 25 }
    );

    container.register(
      'StatusWidget',
      () => new StatusWidget(null, container.resolve('IEventBus')),
      { priority: 26 }
    );

    container.register(
      'ButtonAdapter',
      () => new ButtonAdapter(container.resolve('IEventBus'), container.resolve('LanguageService')),
      { priority: 59 }
    );

    container.register(
      'PanelEffectsWidget',
      () => new PanelEffectsWidget(container.resolve('IEventBus'), container.resolve('Logging')),
      { priority: 118 }
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
          container.resolve('PanelEffectsWidget'),
          container.resolve('ModalService'),
          container.resolve('IEventBus'),
          '[data-js="bottom-panel"]',
          container.resolve('DrumLayoutService'),
          controlPanelOptions.showEmojiDrum
        ),
      {
        priority: 120,
        deps: ['PanelEffectsWidget', 'DrumLayoutService', 'ModalService']
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
          container.resolve('Logger'),
          container.resolve('TextFieldAnimator')
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
