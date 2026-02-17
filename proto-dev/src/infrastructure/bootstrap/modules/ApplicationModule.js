import DualityConfigService from '../../../application/services/DualityConfigService.js';
import ProfileRegistrationService from '../../../application/services/ProfileRegistrationService.js';
import GhostService from '../../../application/services/GhostService.js';
import GhostSwitchService from '../../../application/services/GhostSwitchService.js';
import DialogRepository from '../../repositories/DialogRepository.js';
import DialogHistoryService from '../../../application/services/DialogHistoryService.js';
import ScreenService from '../../../application/services/ScreenService.js';
import ButtonStateService from '../../../application/services/ButtonStateService.js';
import ButtonVisibilityService from '../../../application/services/ButtonVisibilityService.js';
import ModalService from '../../../application/services/ModalService.js';
import PostsService from '../../../application/services/PostsService.js';
import AvatarService from '../../../application/services/AvatarService.js';
import ButtonService from '../../../application/services/ButtonService.js';
import StateService from '../../../application/services/StateService.js';
import CameraOrchestratorService from '../../../application/services/CameraOrchestratorService.js';
import ItemOverlayService from '../../../application/services/ItemOverlayService.js';
import ImageComposerService from '../../../application/services/ImageComposerService.js';
import MediaRepository from '../../repositories/MediaRepository.js';
import DrumLayoutService from '../../../application/services/DrumLayoutService.js';
import ReactionMappingService from '../../../application/services/ReactionMappingService.js';
import ReactionPersistenceService from '../../../application/services/ReactionPersistenceService.js';
import ReactionFinaleService from '../../../application/services/ReactionFinaleService.js';
import DialogOrchestratorService from '../../../application/services/DialogOrchestratorService.js';
import ChatScrollService from '../../../application/services/ChatScrollService.js';
import DialogHistoryObserverService from '../../../application/services/DialogHistoryObserverService.js';
import ResetService from '../../../application/services/ResetService.js';
import ProfileTransferService from '../../../application/services/ProfileTransferService.js';
import EffectsManager from '../../../application/services/EffectsManager.js';
import DialogInputGateService from '../../../application/services/DialogInputGateService.js';
import DialogHistoryBuffer from '../../../application/services/DialogHistoryBuffer.js';
import GhostRebootCheckpointService from '../../../application/services/GhostRebootCheckpointService.js';
import ViewService from '../../../application/services/ViewService.js';
import SoundService from '../../../application/services/SoundService.js';
import AuthLoginResolver from '../../../application/services/AuthLoginResolver.js';
import LoginPrefillService from '../../../application/services/LoginPrefillService.js';
import ChatLauncherVisibilityService from '../../../application/services/ChatLauncherVisibilityService.js';
import ChatLauncherService from '../../../application/services/ChatLauncherService.js';
import AiWarmupService from '../../../application/services/AiWarmupService.js';

/**
 * Registers application services that orchestrate domain logic.
 */
export default class ApplicationModule {
  /**
   * @param {{ container: import('../../container/Container.js').default, config: any, spiritConfigs: any }} context
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
      () => new DualityConfigService(container.resolve('IConfigLoader'), 'src/config/spirits'),
      { priority: 36 }
    );

    container.register(
      'ProfileRegistrationService',
      () =>
        new ProfileRegistrationService(
          container.resolve('DatabaseService'),
          container.resolve('IEncryption'),
          container.resolve('Logger'),
          container.resolve('IEventBus')
        ),
      { priority: 80 }
    );

    container.register(
      'AuthLoginResolver',
      () =>
        new AuthLoginResolver(
          container.resolve('AuthVisibilityAdapter'),
          container.resolve('Logger')
        ),
      { priority: 79 }
    );

    container.register(
      'LoginPrefillService',
      () =>
        new LoginPrefillService({
          authLoginResolver: container.resolve('AuthLoginResolver'),
          profileRegistrationService: container.resolve('ProfileRegistrationService'),
          persistence: container.resolve('IPersistence'),
          embeddingResolver: container.resolve('EmbeddingModeResolver'),
          logger: container.resolve('Logger')
        }),
      { priority: 80, deps: ['AuthLoginResolver', 'ProfileRegistrationService'] }
    );

    container.register(
      'ChatLauncherVisibilityService',
      () =>
        new ChatLauncherVisibilityService(
          container.resolve('AuthVisibilityAdapter'),
          container.resolve('Logger'),
          config
        ),
      { priority: 81 }
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
          logger: container.resolve('Logger')
        }),
      { priority: 82 }
    );

    container.register(
      'AiWarmupService',
      () =>
        new AiWarmupService({
          detectionService: container.resolve('DetectionService'),
          authVisibilityAdapter: container.resolve('AuthVisibilityAdapter'),
          eventBus: container.resolve('IEventBus'),
          stateService: container.resolve('StateService'),
          logger: container.resolve('Logger'),
          config
        }),
      { priority: 84 }
    );

    container.register(
      'GhostService',
      () => new GhostService(container.resolve('IPersistence'), config),
      { priority: 55 }
    );

    container.register(
      'GhostSwitchService',
      () => new GhostSwitchService(container.resolve('IPersistence'), container.resolve('IEventBus')),
      { priority: 55, deps: ['GhostService'] }
    );

    container.register(
      'DialogRepository',
      () => {
        const repo = new DialogRepository(container.resolve('DatabaseService'));
        repo.ensureSchema();
        return repo;
      },
      { priority: 55 }
    );

    container.register(
      'DialogHistoryService',
      () => new DialogHistoryService(container.resolve('DialogRepository')),
      { priority: 56 }
    );

    container.register(
      'ScreenService',
      () => new ScreenService(container.resolve('IEventBus')),
      { priority: 56 }
    );

    container.register(
      'ButtonStateService',
      () =>
        new ButtonStateService(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('ScreenService'),
          container.resolve('Logging')
        ),
      { priority: 57 }
    );

    container.register(
      'ButtonVisibilityService',
      () =>
        new ButtonVisibilityService(
          container.resolve('IEventBus'),
          container.resolve('IPersistence'),
          container.resolve('Logging')
        ),
      { priority: 58 }
    );

    container.register('ModalService', () => new ModalService(container.resolve('IEventBus')), {
      priority: 59,
    });

    container.register(
      'PostsService',
      () => new PostsService(container.resolve('DatabaseService'), container.resolve('GhostService')),
      { priority: 56 }
    );

    container.register(
      'AvatarService',
      () => new AvatarService(container.resolve('DatabaseService'), container.resolve('Logger')),
      { priority: 56 }
    );

    container.register(
      'ButtonService',
      () =>
        new ButtonService(
          container.resolve('TemplateService'),
          container.resolve('LanguageService'),
          container.resolve('ProfileRegistrationService'),
          container.resolve('IEventBus'),
          container.resolve('IPersistence')
        ),
      { priority: 60 }
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
          container.resolve('ScreenService')
        );
        container.resolve('ProfileRegistrationService').stateService = svc;
        return svc;
      },
      { priority: 50 }
    );

    container.register('ItemOverlayService', () => new ItemOverlayService(container.resolve('ICanvasFactory')), {
      priority: 111,
    });

    container.register(
      'ImageComposerService',
      () => new ImageComposerService(container.resolve('ICanvasFactory')),
      { priority: 111 }
    );

    container.register('MediaRepository', () => new MediaRepository(), { priority: 111 });

    container.register(
      'CameraSectionManager',
      () =>
        new CameraOrchestratorService(
          container.resolve('CameraService'),
          container.resolve('DetectionService'),
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
          container.resolve('ICanvasFactory')
        ),
      { priority: 112 }
    );

    container.register(
      'DrumLayoutService',
      () => new DrumLayoutService(container.resolve('IPersistence'), container.resolve('IEventBus')),
      { priority: 119 }
    );

    container.register(
      'ReactionMappingService',
      () =>
        new ReactionMappingService(
          container.resolve('GhostService'),
          container.resolve('DualityManager'),
          spiritConfigs,
          container.resolve('Logger')
        ),
      { priority: 145, deps: ['DualityManager', 'GhostService'] }
    );

    container.register('DialogHistoryBuffer', () => new DialogHistoryBuffer(), { priority: 141 });

    container.register(
      'GhostRebootCheckpointService',
      () => new GhostRebootCheckpointService(container.resolve('IPersistence')),
      { priority: 142 }
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
          container.resolve('Logger')
        ),
      {
        priority: 146,
        deps: ['DialogManager', 'DialogHistoryService', 'DialogHistoryBuffer', 'GhostService'],
      }
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
          container.resolve('Logger')
        ),
      { priority: 147, deps: ['DualityManager', 'GhostService'] }
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
          container.resolve('GhostRebootCheckpointService')
        ),
      { priority: 129, deps: ['DialogManager', 'DualityManager', 'GhostService'] }
    );

    container.register(
      'ChatScrollService',
      () => new ChatScrollService('[data-js="messenger-container"]', container.resolve('IEventBus')),
      { priority: 143 }
    );

    container.register(
      'DialogHistoryObserverService',
      () =>
        new DialogHistoryObserverService(
          container.resolve('DialogManager'),
          container.resolve('DialogHistoryService'),
          container.resolve('GhostService'),
          container.resolve('IEventBus')
        ),
      { priority: 145, deps: ['DialogManager', 'DialogHistoryService', 'GhostService'] }
    );

    container.register(
      'ResetService',
      () =>
        new ResetService(
          config,
          container.resolve('DatabaseService'),
          container.resolve('IPersistence'),
          container.resolve('IEventBus'),
          container.resolve('Logger')
        ),
      { priority: 128 }
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
          container.resolve('Logger')
        ),
      { priority: 127 }
    );

    container.register(
      'SoundService',
      () =>
        new SoundService(
          container.resolve('IEventBus'),
          container.resolve('GhostService'),
          spiritConfigs,
          container.resolve('Logger')
        ),
      { priority: 128, deps: ['GhostService'] }
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
          spiritConfigs
        ),
      { priority: 150, deps: ['DualityManager'] }
    );

    container.register(
      'DialogInputGateService',
      () =>
        new DialogInputGateService(
          container.resolve('DialogManager'),
          container.resolve('DualityManager'),
          container.resolve('IEventBus')
        ),
      { priority: 142 }
    );

    container.register(
      'ViewService',
      () =>
        new ViewService(
          container.resolve('TemplateService'),
          container.resolve('PanelService'),
          container.resolve('LanguageService'),
          container.resolve('ProfileRegistrationService'),
          container.resolve('GeoService'),
          container.resolve('DatabaseService'),
          container.resolve('PostsService'),
          container.resolve('DetectionService'),
          container.resolve('CameraService'),
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
          container.resolve('LoginPrefillService')
        ),
      { priority: 130 }
    );
  }
}
