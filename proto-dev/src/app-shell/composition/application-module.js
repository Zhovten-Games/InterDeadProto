import DialogTimeline from '../../messenger/history/dialog-timeline.js';
import DualityConfigService from '../../narrative-runtime/configuration/duality-config-service.js';
import ProfileRegistrationService from '../../identity/application/profile-registration-service.js';
import GhostService from '../../spirit-contacts/application/ghost-service.js';
import GhostSwitchService from '../../spirit-contacts/application/ghost-switch-service.js';
import DialogRepository from '../../messenger/persistence/dialog-repository.js';
import DialogHistoryService from '../../messenger/history/dialog-history-service.js';
import ScreenService from '../navigation/screen-service.js';
import ButtonStateService from '../controls/button-state-service.js';
import ButtonVisibilityService from '../controls/button-visibility-service.js';
import ModalService from '../overlays/modal-service.js';
import PostsService from '../../messenger/application/posts-service.js';
import AvatarService from '../../identity/application/avatar-service.js';
import ButtonService from '../controls/button-service.js';
import StateService from '../state/application-state-service.js';
import CameraOrchestratorService from '../../camera/application/camera-orchestrator-service.js';
import ItemOverlayService from '../../quests/presentation/item-overlay-service.js';
import ImageComposerService from '../../media/composition/image-composer-service.js';
import MediaRepository from '../../media/persistence/media-repository.js';
import DrumLayoutService from '../controls/drum-layout-service.js';
import ReactionMappingService from '../../reactions/application/reaction-mapping-service.js';
import ReactionPersistenceService from '../../reactions/application/reaction-persistence-service.js';
import ReactionFinaleService from '../../reactions/application/reaction-finale-service.js';
import DialogOrchestratorService from '../../messenger/application/dialog-orchestrator-service.js';
import ChatScrollService from '../../messenger/application/chat-scroll-service.js';
import DialogHistoryObserverService from '../../messenger/application/dialog-history-observer-service.js';
import ResetService from '../../identity/application/profile-reset-service.js';
import ProfileTransferService from '../../identity/application/profile-transfer-service.js';
import EffectsManager from '../../narrative-runtime/effects/effects-manager.js';
import DialogInputGateService from '../../messenger/application/dialog-input-gate-service.js';
import DialogHistoryBuffer from '../../messenger/history/dialog-history-buffer.js';
import GhostRebootCheckpointService from '../../contact-sessions/checkpoints/ghost-reboot-checkpoint-service.js';
import ViewService from '../navigation/view-service.js';
import SoundService from '../../media/audio/sound-service.js';
import AuthLoginResolver from '../../identity/authentication/auth-login-resolver.js';
import LoginPrefillService from '../../identity/authentication/login-prefill-service.js';
import ChatLauncherVisibilityService from '../../messenger/application/chat-launcher-visibility-service.js';
import ChatLauncherService from '../../messenger/application/chat-launcher-service.js';
import AiWarmupService from '../../camera/application/ai-warmup-service.js';

/**
 * Registers application services that orchestrate domain logic.
 */
export default class ApplicationModule {
  /**
   * @param {{ container: import('./container.js').default, config: any, spiritConfigs: any }} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   * Register application services and repositories.
   */
  register() {
    const { container, config, spiritConfigs } = this.context;

    container.register(
      'DualityConfigService',
      () =>
        new DualityConfigService(
          container.resolve('IConfigLoader'),
          'src/spirit-contacts/configuration',
        ),
      { priority: 36 },
    );

    container.register(
      'ProfileRegistrationService',
      () =>
        new ProfileRegistrationService(
          container.resolve('DatabaseAdapter'),
          container.resolve('IEncryption'),
          container.resolve('Logger'),
          container.resolve('IEventBus'),
        ),
      { priority: 80 },
    );

    container.register(
      'AuthLoginResolver',
      () =>
        new AuthLoginResolver(
          container.resolve('AuthVisibilityAdapter'),
          container.resolve('Logger'),
        ),
      { priority: 79 },
    );

    container.register(
      'LoginPrefillService',
      () =>
        new LoginPrefillService({
          authLoginResolver: container.resolve('AuthLoginResolver'),
          profileRegistrationService: container.resolve('ProfileRegistrationService'),
          persistence: container.resolve('IPersistence'),
          embeddingResolver: container.resolve('EmbeddingModeResolver'),
          logger: container.resolve('Logger'),
        }),
      { priority: 80, deps: ['AuthLoginResolver', 'ProfileRegistrationService'] },
    );

    container.register(
      'ChatLauncherVisibilityService',
      () =>
        new ChatLauncherVisibilityService(
          container.resolve('AuthVisibilityAdapter'),
          container.resolve('Logger'),
          config,
        ),
      { priority: 81 },
    );

    container.register(
      'ChatLauncherService',
      () =>
        new ChatLauncherService({
          widget: container.resolve('ChatLauncherWidget'),
          visibilityService: container.resolve('ChatLauncherVisibilityService'),
          modalAdapter: container.resolve('HostModalAdapter'),
          embeddingResolver: container.resolve('EmbeddingModeResolver'),
          embedPermissionsResolver: container.resolve('EmbedPermissionsResolver'),
          documentRef: typeof document !== 'undefined' ? document : null,
          logger: container.resolve('Logger'),
        }),
      { priority: 82 },
    );

    container.register(
      'AiWarmupService',
      () =>
        new AiWarmupService({
          detectionService: container.resolve('DetectionAdapter'),
          authVisibilityAdapter: container.resolve('AuthVisibilityAdapter'),
          eventBus: container.resolve('IEventBus'),
          stateService: container.resolve('StateService'),
          logger: container.resolve('Logger'),
          config,
        }),
      { priority: 84 },
    );

    container.register(
      'GhostService',
      () => new GhostService(container.resolve('IPersistence'), config),
      { priority: 55 },
    );

    container.register(
      'GhostSwitchService',
      () =>
        new GhostSwitchService(container.resolve('IPersistence'), container.resolve('IEventBus')),
      { priority: 55, deps: ['GhostService'] },
    );

    container.register(
      'DialogRepository',
      () => {
        return new DialogRepository(container.resolve('DatabaseAdapter'));
      },
      { priority: 55, deps: ['DatabaseAdapter'] },
    );

    container.register(
      'DialogHistoryService',
      () => new DialogHistoryService(container.resolve('DialogRepository')),
      { priority: 56 },
    );

    container.register(
      'DialogTimeline',
      () =>
        new DialogTimeline(
          container.resolve('DialogHistoryService'),
          container.resolve('IEventBus'),
        ),
      { priority: 57, deps: ['DialogHistoryService'] },
    );

    container.register('ScreenService', () => new ScreenService(container.resolve('IEventBus')), {
      priority: 56,
    });

    container.register(
      'ButtonStateService',
      () =>
        new ButtonStateService(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('ScreenService'),
          container.resolve('Logging'),
        ),
      { priority: 57 },
    );

    container.register(
      'ButtonVisibilityService',
      () =>
        new ButtonVisibilityService(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('Logging'),
          container.resolve('ScreenService'),
        ),
      { priority: 58 },
    );

    container.register('ModalService', () => new ModalService(container.resolve('IEventBus')), {
      priority: 59,
    });

    container.register(
      'PostsService',
      () =>
        new PostsService(container.resolve('DatabaseAdapter'), container.resolve('GhostService')),
      { priority: 56 },
    );

    container.register(
      'AvatarService',
      () => new AvatarService(container.resolve('DatabaseAdapter'), container.resolve('Logger')),
      { priority: 56 },
    );

    container.register(
      'ButtonService',
      () =>
        new ButtonService(
          container.resolve('TemplateService'),
          container.resolve('LanguageAdapter'),
          container.resolve('ProfileRegistrationService'),
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
        ),
      { priority: 60 },
    );

    container.register(
      'StateService',
      () => {
        const svc = new StateService(
          container.resolve('ProfileRegistrationService'),
          container.resolve('GeoService'),
          container.resolve('GhostService'),
          container.resolve('IEventBus'),
          container.resolve('Logger'),
          container.resolve('ScreenService'),
        );
        container.resolve('ProfileRegistrationService').stateService = svc;
        return svc;
      },
      { priority: 50 },
    );

    container.register(
      'ItemOverlayService',
      () => new ItemOverlayService(container.resolve('ICanvasFactory')),
      {
        priority: 111,
      },
    );

    container.register(
      'ImageComposerService',
      () => new ImageComposerService(container.resolve('ICanvasFactory')),
      { priority: 111 },
    );

    container.register(
      'MediaRepository',
      () => new MediaRepository(container.resolve('DatabaseAdapter')),
      { priority: 111, deps: ['DatabaseAdapter'] },
    );

    container.register(
      'CameraSectionManager',
      () =>
        new CameraOrchestratorService(
          container.resolve('CameraAdapter'),
          container.resolve('DetectionAdapter'),
          container.resolve('Logger'),
          container.resolve('StateService'),
          container.resolve('DualityManager'),
          container.resolve('DialogManager'),
          container.resolve('IEventBus'),
          container.resolve('ButtonStateService'),
          container.resolve('ButtonVisibilityService'),
          container.resolve('ItemOverlayService'),
          container.resolve('AvatarService'),
          container.resolve('DialogInputGateService'),
          container.resolve('ImageComposerService'),
          container.resolve('MediaRepository'),
          container.resolve('ICanvasFactory'),
          undefined,
          undefined,
          container.resolve('DialogTimeline'),
        ),
      { priority: 112 },
    );

    container.register(
      'DrumLayoutService',
      () =>
        new DrumLayoutService(container.resolve('IPersistence'), container.resolve('IEventBus')),
      { priority: 119 },
    );

    container.register(
      'ReactionMappingService',
      () =>
        new ReactionMappingService(
          container.resolve('GhostService'),
          container.resolve('DualityManager'),
          spiritConfigs,
          container.resolve('Logger'),
        ),
      { priority: 145, deps: ['DualityManager', 'GhostService'] },
    );

    container.register('DialogHistoryBuffer', () => new DialogHistoryBuffer(), { priority: 141 });

    container.register(
      'GhostRebootCheckpointService',
      () => new GhostRebootCheckpointService(container.resolve('IPersistence')),
      { priority: 142 },
    );

    container.register(
      'ReactionPersistenceService',
      () =>
        new ReactionPersistenceService(
          container.resolve('DialogManager'),
          container.resolve('DialogHistoryService'),
          container.resolve('DialogHistoryBuffer'),
          container.resolve('GhostService'),
          container.resolve('IEventBus'),
          container.resolve('Logger'),
          container.resolve('IPersistence'),
        ),
      {
        priority: 146,
        deps: ['DialogManager', 'DialogHistoryService', 'DialogHistoryBuffer', 'GhostService'],
      },
    );

    container.register(
      'ReactionFinaleService',
      () =>
        new ReactionFinaleService(
          container.resolve('IEventBus'),
          container.resolve('DualityManager'),
          container.resolve('GhostService'),
          spiritConfigs,
          undefined,
          container.resolve('Logger'),
        ),
      { priority: 147, deps: ['DualityManager', 'GhostService'] },
    );

    container.register(
      'DialogOrchestratorService',
      () =>
        new DialogOrchestratorService(
          container.resolve('DualityManager'),
          container.resolve('DialogManager'),
          container.resolve('GhostService'),
          container.resolve('ButtonStateService'),
          container.resolve('ButtonVisibilityService'),
          container.resolve('DialogHistoryService'),
          container.resolve('AvatarService'),
          container.resolve('GhostSwitchService'),
          spiritConfigs,
          container.resolve('DialogInputGateService'),
          container.resolve('IEventBus'),
          container.resolve('Logging'),
          container.resolve('DialogHistoryBuffer'),
          undefined,
          undefined,
          container.resolve('GhostRebootCheckpointService'),
          container.resolve('DialogTimeline'),
        ),
      { priority: 129, deps: ['DialogManager', 'DualityManager', 'GhostService'] },
    );

    container.register(
      'ChatScrollService',
      () =>
        new ChatScrollService('[data-js="messenger-container"]', container.resolve('IEventBus')),
      { priority: 143 },
    );

    container.register(
      'DialogHistoryObserverService',
      () =>
        new DialogHistoryObserverService(
          container.resolve('DialogManager'),
          container.resolve('DialogHistoryService'),
          container.resolve('GhostService'),
          container.resolve('IEventBus'),
        ),
      { priority: 145, deps: ['DialogManager', 'DialogHistoryService', 'GhostService'] },
    );

    container.register(
      'ResetService',
      () =>
        new ResetService(
          config,
          container.resolve('DatabaseAdapter'),
          container.resolve('IPersistence'),
          container.resolve('IEventBus'),
          container.resolve('Logger'),
          [
            container.resolve('ButtonStateService'),
            container.resolve('ButtonVisibilityService'),
            container.resolve('ProfileRegistrationService'),
            container.resolve('DialogHistoryService'),
            container.resolve('GhostSwitchService'),
            container.resolve('MediaRepository'),
          ],
        ),
      { priority: 128 },
    );

    container.register(
      'ProfileTransferService',
      () =>
        new ProfileTransferService(
          container.resolve('ProfileRegistrationService'),
          container.resolve('PostsService'),
          container.resolve('DialogHistoryService'),
          container.resolve('GhostService'),
          container.resolve('IEventBus'),
          container.resolve('Logger'),
          container.resolve('IPersistence'),
          [container.resolve('GhostSwitchService'), container.resolve('MediaRepository')],
          Object.keys(spiritConfigs),
        ),
      { priority: 127 },
    );

    container.register(
      'SoundService',
      () =>
        new SoundService(
          container.resolve('IEventBus'),
          container.resolve('GhostService'),
          spiritConfigs,
          container.resolve('Logger'),
        ),
      { priority: 128, deps: ['GhostService'] },
    );

    container.register(
      'EffectsManager',
      () =>
        new EffectsManager(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('GhostService'),
          container.resolve('DualityManager'),
          undefined,
          container.resolve('Logger'),
          spiritConfigs,
        ),
      { priority: 150, deps: ['DualityManager'] },
    );

    container.register(
      'DialogInputGateService',
      () =>
        new DialogInputGateService(
          container.resolve('DialogManager'),
          container.resolve('DualityManager'),
          container.resolve('IEventBus'),
        ),
      { priority: 142 },
    );

    container.register(
      'ViewService',
      () =>
        new ViewService(
          container.resolve('TemplateService'),
          container.resolve('PanelAdapter'),
          container.resolve('LanguageAdapter'),
          container.resolve('ProfileRegistrationService'),
          container.resolve('GeoService'),
          container.resolve('DatabaseAdapter'),
          container.resolve('PostsService'),
          container.resolve('DetectionAdapter'),
          container.resolve('CameraAdapter'),
          container.resolve('CameraSectionManager'),
          container.resolve('NotificationManager'),
          container.resolve('Logger'),
          container.resolve('IPersistence'),
          container.resolve('ButtonStateService'),
          container.resolve('DualityManager'),
          container.resolve('IEventBus'),
          container.resolve('GhostService'),
          container.resolve('DialogHistoryService'),
          container.resolve('DialogHistoryBuffer'),
          container.resolve('MediaRepository'),
          container.resolve('LoginPrefillService'),
        ),
      { priority: 130 },
    );
  }
}
