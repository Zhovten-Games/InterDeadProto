import NullEventBus from '../../core/events/NullEventBus.js';
import {
  BUTTON_STATE_UPDATED,
  VIEW_RENDER_REQUESTED,
  VIEW_CAMERA_RENDER_REQUESTED,
  MESSENGER_POSTS_READY,
  REGISTRATION_NAME_CHANGED,
  GEO_STATUS_UPDATED,
  CAMERA_PREVIEW_READY,
  CAMERA_PREVIEW_CLEARED,
  RESET_OPTIONS_REQUESTED,
  DETECTION_DONE_EVENT,
  APP_RESET_REQUESTED
} from '../../core/events/constants.js';

export default class ViewService {
  constructor(
    templateService,
    panelService,
    languageManager,
    profileRegService,
    geoService,
    databaseService,
    postsService,
    detectionService,
    cameraService,
    cameraSectionManager,
    notificationManager,
    logger,
    persistence,
    buttonStateService,
    dualityManager,
    bus = new NullEventBus(),
    ghostService = null,
    historyService = null,
    historyBuffer = null,
    mediaRepository = null,
    loginPrefillService = null
  ) {
    this.templateService = templateService;
    this.panelService = panelService;
    this.languageManager = languageManager;
    this.profileRegService = profileRegService;
    this.geoService = geoService;
    this.bus = bus;
    this.db = databaseService;
    this.postsService = postsService;
    this.detectionService = detectionService;
    this.cameraService = cameraService;
    this.cameraSectionManager = cameraSectionManager;
    this.notificationManager = notificationManager;
    this.logger = logger;
    this.storage = persistence;
    this.buttonStateService = buttonStateService;
    this.dualityManager = dualityManager;
    this.ghostService = ghostService;
    this.historyService = historyService;
    this.historyBuffer = historyBuffer;
    this.mediaRepository = mediaRepository;
    this.loginPrefillService = loginPrefillService;
    this._booted = false;
    this.currentScreen = null;
    /**
     * Store last successful detection result for reuse on capture.
     * @private
     */
    this.lastDetection = null;

    this._nextHandler = async evt => {
      if (evt.type !== 'next') return;
      let nextScreen = null;
      if (this.currentScreen === 'welcome') nextScreen = 'registration';
      else if (
        this.currentScreen === 'registration' &&
        this.profileRegService?.canProceed()
      )
        nextScreen = 'apartment-plan';
      else if (this.currentScreen === 'apartment-plan') nextScreen = 'registration-camera';
      if (nextScreen && nextScreen !== this.currentScreen) {
        this.bus.emit({ type: 'SCREEN_CHANGE', screen: nextScreen });
      }
    };

    this._handler = async evt => {
      if (!evt || evt.type !== 'SCREEN_CHANGE') return;

      if (
        (this.currentScreen === 'camera' ||
          this.currentScreen === 'registration-camera') &&
        evt.screen !== this.currentScreen
      ) {
        this.bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
        this.cameraSectionManager?.cameraService?.stopStream?.();
        this.cameraSectionManager?.stop?.();
      }

      if (this.currentScreen === 'messenger' && evt.screen !== 'messenger') {
        const ghost = this.ghostService?.getCurrentGhost?.()?.name;
        this.historyBuffer?.flushTo?.(this.historyService, ghost);
      }

      if (evt.screen === 'registration-camera' || evt.screen === 'camera') {
        this.cameraSectionManager?.stateService?.resetCaptured?.();
        this.cameraSectionManager?.stateService?.resetPresence?.();
        this.storage?.remove?.('captured');
        const cameraType = evt.screen === 'registration-camera' ? 'registration' : 'quest';
        const cameraOptions = {
          cameraType,
          force: evt.screen === 'registration-camera' ? true : evt.options?.force,
          onDetected: (target, blob, box, mask) =>
            this.bus.emit({ type: DETECTION_DONE_EVENT, target, blob, box, mask }),
          ...evt.options
        };
        this.bus.emit({
          type: VIEW_CAMERA_RENDER_REQUESTED,
          screen: evt.screen,
          camera: {
            options: cameraOptions,
            panel: { screen: evt.screen }
          }
        });
      } else {
        const viewPayload = {};
      if (evt.screen === 'messenger') {
        const posts = await this.postsService.getPostsForCurrent();
        viewPayload.posts = posts;
      }
      if (evt.screen === 'registration') {
        this.loginPrefillService?.prefillIfNeeded?.();
        viewPayload.registration = { name: this.profileRegService?.name || '' };
      }
        this.bus.emit({
          type: VIEW_RENDER_REQUESTED,
          screen: evt.screen,
          payload: evt.payload || {},
          view: viewPayload
        });
        if (evt.screen === 'messenger' && viewPayload.posts) {
          this.bus.emit({ type: MESSENGER_POSTS_READY, posts: viewPayload.posts });
        }
      }

      const states = this.buttonStateService?.getStatesForScreen?.(evt.screen) || {};
      Object.entries(states).forEach(([btn, active]) => {
        this.bus.emit({
          type: BUTTON_STATE_UPDATED,
          button: btn,
          active,
          screen: evt.screen
        });
      });
      this.currentScreen = evt.screen;
    };

    this._geoHandler = async evt => {
      if (evt.type === 'detect-geo') {
        try {
          const coords = await this.geoService.getCurrentLocation();
          this.bus.emit({
            type: GEO_STATUS_UPDATED,
            status: coords ? { mode: 'coords', coords } : { mode: 'local' },
            panel: { screen: 'apartment-plan', cameraSectionManager: this.cameraSectionManager }
          });
          this.bus.emit({ type: 'NEXT_BUTTON_ENABLE', enabled: true });
        } catch (err) {
          this.geoService.logger?.error(err.message);
        }
      }
    };

    this._mainHandler = async evt => {
      if (evt.type === 'post') {
        await this.publishPost();
      } else if (evt.type === 'toggle-camera' || evt.type === 'toggle-messenger') {
        this.toggleCameraSection();
      } else if (evt.type === 'reset-data') {
        await this.resetData();
      }
    };

    this._captureHandler = evt => this.handleCaptureEvents(evt);

    this._registrationHandler = evt => {
      if (evt.type !== REGISTRATION_NAME_CHANGED) return;
      const value = evt.payload?.value || '';
      this.profileRegService.setName(value);
      this.bus.emit({
        type: 'NEXT_BUTTON_ENABLE',
        enabled: this.profileRegService.canProceed()
      });
      this.bus.emit({ type: 'enter-name', payload: { value } });
    };
  }

  boot() {
    if (this._booted) return;
    this._booted = true;
    this.bus.subscribe(this._handler);
    this.bus.subscribe(this._nextHandler);
    this.bus.subscribe(this._geoHandler);
    this.bus.subscribe(this._mainHandler);
    this.bus.subscribe(this._captureHandler);
    this.bus.subscribe(this._registrationHandler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this.bus.unsubscribe(this._nextHandler);
    this.bus.unsubscribe(this._geoHandler);
    this.bus.unsubscribe(this._mainHandler);
    if (this._captureHandler) this.bus.unsubscribe(this._captureHandler);
    if (this._registrationHandler) this.bus.unsubscribe(this._registrationHandler);
  }

  handleCaptureEvents = async evt => {
    if (evt.type === 'capture-btn') {
      if (this.lastDetection?.blob) {
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'hidden' });
        if (this.currentScreen === 'camera') {
          const quest = this.dualityManager?.getQuest?.() || null;
          const coords = quest?.overlay || {};
          await this.cameraSectionManager.captureOverlay(
            coords,
            this.lastDetection.blob,
            this.lastDetection.box,
            this.lastDetection.mask
          );
        } else {
          const avatar = await this._storeAvatarFromBlob(this.lastDetection.blob);
          this.cameraService.stopStream?.();
          this.bus.emit({ type: CAMERA_PREVIEW_READY, avatarUrl: avatar });
          this.cameraSectionManager.markCaptured();
          this.bus.emit({
            type: 'BUTTON_STATE_UPDATED',
            screen: this.currentScreen
          });
        }
        this.lastDetection = null;
        return;
      }
      const blob = await this.cameraService.takeSelfie();
      this.bus.emit({ type: 'CAMERA_STATUS', status: 'checking' });
      const req = this.dualityManager?.getRequirement?.();
      const target =
        this.currentScreen === 'registration-camera'
          ? 'person'
          : req?.target;
      if (!target) {
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'not_found' });
        this.cameraSectionManager.resumeDetection();
        return;
      }
      const result = await this.detectionService.detectTarget(blob, target);
      if (!result.ok) {
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'not_found' });
        this.cameraSectionManager.resumeDetection();
        return;
      }
      this.bus.emit({ type: 'CAMERA_STATUS', status: 'hidden' });
      if (this.currentScreen === 'camera') {
        const quest = this.dualityManager?.getQuest?.() || null;
        const coords = quest?.overlay || {};
        await this.cameraSectionManager.captureOverlay(
          coords,
          blob,
          result.box,
          result.mask
        );
      } else {
        const avatar = await this._storeAvatarFromBlob(blob);
        this.cameraService.stopStream?.();
        this.bus.emit({ type: CAMERA_PREVIEW_READY, avatarUrl: avatar });
        this.cameraSectionManager.markCaptured();
        this.bus.emit({ type: 'BUTTON_STATE_UPDATED', screen: this.currentScreen });
      }
    }

    if (evt.type === 'finish') {
      const state = this.cameraSectionManager.stateService;
      if (state?.captured && state?.presence?.person) {
        await this.profileRegService.saveProfile();
        const user = await this.db.loadUser();
        if (user && this.storage) {
          this.storage.save('userId', String(user.id));
          this.storage.save('captured', true);
        }
        this.notificationManager?.notify?.({
          type: 'success',
          message: 'profile-saved'
        });
        this.cameraSectionManager.stopDetection?.();
        this.cameraService.stopStream?.();
        this.bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
      }
    }

    if (evt.type === DETECTION_DONE_EVENT) {
      if (evt.blob) {
        const url = URL.createObjectURL(evt.blob);
        this.bus.emit({ type: CAMERA_PREVIEW_READY, blobUrl: url });
      }
      if (this.currentScreen === 'registration-camera') {
        if (evt.blob) {
          await this._storeAvatarFromBlob(evt.blob);
          this.cameraService.stopStream?.();
        }
        this.cameraSectionManager.markCaptured();
      }
      if (this.cameraSectionManager.stateService) {
        this.cameraSectionManager.stateService.setPresence(evt.target, true);
      }
      this.lastDetection = {
        target: evt.target,
        blob: evt.blob,
        box: evt.box,
        mask: evt.mask
      };
      this.bus.emit({ type: 'BUTTON_STATE_UPDATED', screen: this.currentScreen });
    }

    if (evt.type === 'RETRY_DETECTION') {
      this.bus.emit({ type: CAMERA_PREVIEW_CLEARED });
      this.lastDetection = null;
      this.cameraSectionManager.resumeDetection({ hidePreview: true });
    }
  };

  async publishPost() {
    try {
      await this.postsService.publish();
      const posts = await this.postsService.getPostsForCurrent();
      this.bus.emit({ type: MESSENGER_POSTS_READY, posts });
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  toggleCameraSection() {
    const next = this.currentScreen === 'camera' ? 'messenger' : 'camera';
    const options = next === 'camera' ? { force: false } : {};
    this.bus.emit({ type: 'SCREEN_CHANGE', screen: next, options });
  }

  openMessenger() {
    this.bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
  }

  async _storeAvatarFromBlob(blob) {
    try {
      const avatar = await this._blobToBase64(blob);
      if (avatar) {
        this.profileRegService.setAvatar(avatar);
        this.logger?.info?.(
          `ViewService: captured avatar (${avatar.length} chars)`
        );
      } else {
        this.logger?.warn?.('ViewService: empty avatar after conversion');
      }
      return avatar || '';
    } catch (err) {
      this.logger?.error?.(`ViewService: avatar conversion failed: ${err.message}`);
      return '';
    }
  }

  async _blobToBase64(blob) {
    if (typeof FileReader !== 'undefined') {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    const buffer = await blob.arrayBuffer();
    return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
  }

  async resetData() {
    try {
      if (typeof document === 'undefined') {
        this.bus.emit({
          type: APP_RESET_REQUESTED,
          payload: { source: 'view', reason: 'no_modal' }
        });
        return;
      }
      this.bus.emit({ type: RESET_OPTIONS_REQUESTED, payload: { source: 'view' } });
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async handle() {}
}
