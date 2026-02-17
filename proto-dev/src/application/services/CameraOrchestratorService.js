import IEventBus from '../../ports/IEventBus.js';
import NullEventBus from '../../core/events/NullEventBus.js';
import coreStore from '../../core/engine/store.js';
import { detectionStart, detectionDone } from '../../core/engine/actions.js';
import { CAMERA_DETECT } from '../../core/engine/effects.js';
import { ENGINE_V1_ENABLED } from '../../config/flags.js';
import {
  QUEST_ITEM_OVERLAY_READY,
  QUEST_STARTED,
  QUEST_COMPLETED,
  OVERLAY_SHOW,
  EVENT_MESSAGE_READY,
  REACTION_OVERLAY_REQUESTED,
  DETECTION_SEARCH,
  DETECTION_STOPPED
} from '../../core/events/constants.js';
import {
  RegistrationCameraStrategy,
  QuestCameraStrategy
} from './CameraDetectionStrategy.js';

export default class CameraSectionManager {
  constructor(
    cameraService,
    detectionService,
    logger,
    stateService = null,
    dualityManager = null,
    dialogManager = null,
    bus = new NullEventBus(),
    buttonStateService = null,
    buttonVisibilityService = null,
    overlayService = null,
    avatarService = null,
    inputGateService = null,
    imageComposer = null,
    mediaRepository = null,
    canvasFactory = null,
    store = coreStore,
    engineEnabled = ENGINE_V1_ENABLED
  ) {
    if (!imageComposer) {
      throw new Error('CameraOrchestratorService: missing imageComposer');
    }
    if (!mediaRepository) {
      throw new Error('CameraOrchestratorService: missing mediaRepository');
    }
    this.cameraService = cameraService;
    this.detectionService = detectionService;
    this.logger = logger;
    this.stateService = stateService;
    this.dualityManager = dualityManager;
    this.dialogManager = dialogManager;
    this.inputGate = inputGateService;
    /** @type {IEventBus} */
    this.bus = bus;
    this.buttonStateService = buttonStateService;
    this.buttonVisibilityService = buttonVisibilityService;
    this.overlayService = overlayService;
    this.avatarService = avatarService;
    this.imageComposer = imageComposer;
    this.mediaRepository = mediaRepository;
    this.canvasFactory = canvasFactory;
    this.store = store;
    this.engineEnabled = engineEnabled;
    this.effectHandlers = {
      [CAMERA_DETECT]: payload => this._runDetection(payload)
    };
    this.captured = false;
    this.active = false;
    this._handler = null;
    this.cameraOpen = false;
    this.lastContainer = null;
    this.lastRequirement = null;
    this.lastCameraType = 'quest';
    this.lastForce = false;
    this.registrationStrategy = new RegistrationCameraStrategy();
    this.questStrategy = new QuestCameraStrategy(this.dualityManager, this.bus);
    /**
     * Local counter used to disambiguate images captured at the same time.
     * @private
     */
    this._msgSeq = 0;
    /**
     * Mutex flag preventing parallel detection runs.
     * @private
     */
    this.detectionBusy = false;
    /**
     * Timeout id for repeated detection attempts.
     * @private
     */
    this._retryTimer = null;
  }

  _runEffects(effects = []) {
    const tasks = [];
    effects.forEach(effect => {
      const handler = this.effectHandlers[effect.type];
      if (handler) {
        const res = handler(effect.payload);
        if (res !== undefined) tasks.push(res);
      }
    });
    return tasks;
  }

  boot() {
    this._handler = async evt => {
      if (evt.type === 'CAMERA_VIEW_OPENED') {
        this.cameraOpen = true;
        const { cameraType = 'quest', force = false, onDetected } =
          evt.options || {};
        this.lastContainer = evt.container;
        this.lastCameraType = cameraType;
        this.lastOnDetected = onDetected;
        this.lastForce = force;
        try {
          await this.cameraService.startStream(evt.container);
        } catch (err) {
          this.logger?.error(err.message);
        }
        if (!this.cameraOpen) {
          // Camera was closed while waiting for the stream to start.
          // Skip any further initialization to prevent false detection restarts.
          this.logger?.info?.('[Camera] view closed before stream ready');
          return;
        }
        this.captured = false;
        this.stateService?.resetCaptured?.();
        this.stateService?.resetPresence?.();
        const questActive = this.dualityManager?.isQuestActive?.();
        const shouldStart = questActive || force || cameraType === 'registration';
        this.logger?.info?.('[Camera] view opened', {
          questActive,
          force,
          cameraType,
          shouldStart
        });
        if (shouldStart) {
          this.start(evt.container, { cameraType, force, onDetected });
          this.inputGate?.advanceToUserTurn();
        } else {
          this.logger?.info?.('[Camera] detection not started on open', {
            questActive,
            force,
            cameraType
          });
        }
        this.buttonVisibilityService?.setScreenVisibility('messenger', 'toggle-camera', false);
        this.buttonVisibilityService?.setScreenVisibility('camera', 'toggle-messenger', true);
        this.buttonVisibilityService?.setScreenVisibility('messenger', 'post', false);
        this.buttonVisibilityService?.setScreenVisibility(
          'camera',
          'capture-btn',
          !!questActive
        );
      }
      if (evt.type === 'CAMERA_VIEW_CLOSED') {
        this.cameraOpen = false;
        this.cameraService?.stopStream();
        this.stop();
        this.buttonVisibilityService?.setScreenVisibility('messenger', 'toggle-camera', true);
        this.buttonVisibilityService?.setScreenVisibility('camera', 'toggle-messenger', false);
        this.buttonVisibilityService?.setScreenVisibility('messenger', 'post', true);
        this.buttonVisibilityService?.setScreenVisibility('camera', 'capture-btn', false);
        const dlg = this.dialogManager?.dialog;
        const upcoming = dlg?.messages?.[dlg.index];
        const needsReply = upcoming && upcoming.author === 'user';
        this.inputGate?.advanceToUserTurn();
        this.captured = false;
        this.stateService?.resetCaptured?.();
        this.stateService?.resetPresence?.();
      }
      if (evt.type === QUEST_STARTED) {
        if (this.cameraOpen) {
          this.start(this.lastContainer, {
            cameraType: this.lastCameraType,
            force: this.lastForce,
            onDetected: this.lastOnDetected
          });
          this.inputGate?.advanceToUserTurn();
        }
      }
      if (evt.type === QUEST_COMPLETED) {
        this.stop();
        this.stateService?.resetCaptured?.();
        this.stateService?.resetPresence?.();
        this.inputGate?.advanceToUserTurn();
        this.lastRequirement = null;
      }
    };
    this.bus?.subscribe?.(this._handler);
  }

  start(container, options = {}) {
    if (!this.imageComposer || !this.mediaRepository) {
      this.logger?.error('[Camera] Missing deps', {
        imageComposer: !!this.imageComposer,
        mediaRepository: !!this.mediaRepository
      });
      this.buttonStateService?.setScreenState?.('camera', 'capture-btn', false);
      this.buttonStateService?.setScreenState?.('main', 'toggle-camera', false);
      return;
    }
    const { force = false, cameraType = 'quest', onDetected } = options;
    this.lastContainer = container;
    this.lastCameraType = cameraType;
    this.lastOnDetected = onDetected;
    this.lastForce = force;
    // Disable capture button until detection succeeds.
    this.buttonStateService?.setScreenState('camera', 'capture-btn', false);
    const strategy =
      cameraType === 'registration'
        ? this.registrationStrategy
        : this.questStrategy;
    const requirement = strategy.getRequirement();
    this.lastRequirement = requirement;
    this.logger?.info?.('[Camera] requirement selected', requirement);
    const questActive =
      cameraType === 'quest'
        ? this.dualityManager?.isQuestActive?.()
        : true;
    const target = requirement?.target || requirement?.object;
    this.logger?.info?.('[Camera] start parameters', {
      questActive,
      force,
      cameraType,
      target,
      requirementType: requirement?.type
    });
    if (cameraType === 'quest' && !target) {
      // Already emitted search status in strategy; wait for requirement.
      this.logger?.info?.('[Camera] waiting for requirement update');
      return;
    }
    const personTarget = target === 'person';
    const allowPersonWithoutQuest =
      cameraType === 'registration' && personTarget;
    const needDetection =
      force ||
      ((questActive || allowPersonWithoutQuest) &&
        target &&
        (requirement.type === 'presence' || requirement.type === 'object'));
    if (!needDetection) {
      this.logger?.info?.('[Camera] detection skipped', {
        questActive,
        force,
        target,
        requirementType: requirement?.type
      });
      return;
    }
    // Inform UI that detection has started for this target
    this.bus.emit({ type: DETECTION_SEARCH, target });
    this.active = true;
    this.startDetection(container, { requirement, onDetected });
  }

  startDetection(container, options = {}) {
    if (!this.active || this.detectionBusy) {
      this.logger?.info?.('[Camera] startDetection aborted', {
        active: this.active,
        busy: this.detectionBusy
      });
      return;
    }
    const { onDetected, requirement } = options;
    if (requirement?.isSatisfied && !requirement.isSatisfied()) {
      this.logger?.info?.('[Camera] waiting for requirement', requirement);
      const handler = evt => {
        if (evt.type === QUEST_STARTED) {
          this.bus?.unsubscribe?.(handler);
          this.startDetection(container, options);
        }
      };
      this.bus?.subscribe?.(handler);
      return;
    }
    this.logger?.info?.('[Camera] startDetection', requirement);
    const target = requirement?.target || requirement?.object;
    if (!target) {
      this.logger?.error?.('startDetection called without target');
      return;
    }
    this.detectionBusy = true;
    const effects = this.store.dispatch(
      detectionStart({ container, target, onDetected })
    );
    const tasks = this.engineEnabled
      ? this._runEffects(effects)
      : effects
          .filter(effect => effect.type === CAMERA_DETECT)
          .map(effect => this._runDetection(effect.payload));
    return Promise.all(tasks).finally(() => {
      this.detectionBusy = false;
    });
  }

  async _runDetection({ container, target, onDetected }) {
    let res = { ok: false };
    try {
      if (!this.active) {
        this.logger?.info?.('[Camera] _runDetection skipped: inactive');
        return;
      }
      if (!container || container.offsetParent === null) {
        this.logger?.info?.('[Camera] _runDetection skipped: container hidden');
        return;
      }
      const blob = await this.cameraService.takeSelfie();
      res = await this.detectionService.detectTarget(blob, target);
      this.logger?.info?.('[Camera] detection result', {
        ok: res.ok,
        box: res.box
      });
      if (res.ok) {
        clearTimeout(this._retryTimer);
        this._retryTimer = null;
        // Detection succeeded: freeze stream and forward the captured frame
        // so the caller can render a preview. Enable capture action.
        this.cameraService?.stopStream?.();
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'paused' });
        this.buttonStateService?.setScreenState('camera', 'capture-btn', true);
        if (onDetected) await onDetected(target, blob, res.box, res.mask);
        this.inputGate?.advanceToUserTurn();
      }
    } catch (err) {
      this.logger.error(err?.message || err);
    } finally {
      this.store.dispatch(detectionDone());
      if (!res.ok && this.active && this.cameraOpen) {
        this._retryTimer = setTimeout(() => {
          this.startDetection(this.lastContainer, {
            requirement: this.lastRequirement,
            onDetected: this.lastOnDetected
          });
        }, 500);
      }
    }
  }

  async resumeDetection({ hidePreview = false } = {}) {
    if (!this.active) return;
    clearTimeout(this._retryTimer);
    this._retryTimer = null;
    this.stateService?.resetCaptured?.();
    this.buttonStateService?.setScreenState('camera', 'capture-btn', false);
    const screen =
      this.lastCameraType === 'registration' ? 'registration-camera' : 'camera';
    this.bus.emit({ type: 'BUTTON_STATE_UPDATED', screen });
    this.bus.emit({ type: DETECTION_SEARCH });
    this.inputGate?.advanceToUserTurn();
    // Stream was stopped after detection; start a new one before continuing.
    await this.cameraService?.startStream?.(this.lastContainer);
    // Restore video view and hide the frozen preview frame only when requested.
    if (this.lastContainer) {
      this.lastContainer.hidden = false;
      if (hidePreview) {
        const preview = this.lastContainer.parentElement?.querySelector(
          '[data-js="selfie-preview"]'
        );
        if (preview) preview.hidden = true;
      }
    }
    const strategy =
      this.lastCameraType === 'registration'
        ? this.registrationStrategy
        : this.questStrategy;
    const requirement = strategy.getRequirement();
    this.lastRequirement = requirement;
    this.startDetection(this.lastContainer, {
      requirement,
      onDetected: this.lastOnDetected
    });
  }

  hasCaptured() {
    return this.captured;
  }

  markCaptured() {
    this.captured = true;
    if (this.stateService) this.stateService.markCaptured();
  }

  async captureOverlay(coords = {}, blob = null, box = null, mask = null) {
    if (!this.overlayService || !this.mediaRepository) {
      this.logger?.error('[Camera] Missing deps', {
        overlayService: !!this.overlayService,
        mediaRepository: !!this.mediaRepository
      });
      return;
    }
    const compositionMode = this._resolveOverlayMode(coords);
    const includeFrame = compositionMode !== 'background-only';
    const frame = includeFrame ? blob || (await this.cameraService.takeSelfie()) : null;
    const { background, ...placement } = coords;
    let bgImg = null;
    if (background?.src) {
      try {
        bgImg = await this._loadImage(background.src);
      } catch (err) {
        this.logger?.error?.(err.message);
      }
    } else if (background?.color) {
      const canvas = this.canvasFactory.create();
      canvas.width = background.width || placement.canvasWidth || placement.width || 0;
      canvas.height = background.height || placement.canvasHeight || placement.height || 0;
      const bgCtx = canvas.getContext('2d');
      bgCtx.fillStyle = background.color;
      bgCtx.fillRect(0, 0, canvas.width, canvas.height);
      bgImg = canvas;
    }
    if (!this.overlayService) {
      this.logger?.error?.('[Camera] Missing overlayService');
      return;
    }
    const crop = box
      ? { srcX: box.x, srcY: box.y, srcWidth: box.width, srcHeight: box.height }
      : {};
    const finalCoords = { ...placement, ...crop };
    const canvas = await this.overlayService.compose(
      frame,
      bgImg,
      finalCoords,
      mask,
      {
        includeFrame,
        compositionMode
      }
    );
    const fullDataUrl = canvas.toDataURL('image/png');
    const fullBlob = await this._toBlobWithFallback(canvas, 'full');
    const thumbCanvas = this.canvasFactory.create();
    thumbCanvas.width = 64;
    thumbCanvas.height = 64;
    thumbCanvas
      .getContext('2d')
      .drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 64, 64);
    const thumbBlob = await this._toBlobWithFallback(thumbCanvas, 'thumb');
    const thumbDataUrl = thumbCanvas.toDataURL('image/png');
    if (!fullBlob || !thumbBlob || !thumbDataUrl) {
      this.logger?.error?.('[Camera] overlay composition failed');
      return;
    }
    const mediaId = await this.mediaRepository.save(
      { full: fullBlob, thumb: thumbBlob },
      { crop, overlays: mask ? [{ mask }] : [] }
    );
    this.bus.emit({
      type: OVERLAY_SHOW,
      src: fullDataUrl,
      showMessengerButton: true
    });
    this.logger?.info?.('[Camera] overlay composed', { mediaId });
    const avatar = (await this.avatarService?.getUserAvatar?.()) || '';
    this.markCaptured();
    const record = await this.mediaRepository.get(mediaId);
    const thumbObj = await this.mediaRepository.getObjectURL(record.thumbKey);
    const displayUrl = thumbObj?.url || thumbDataUrl;
    if (!displayUrl) {
      this.logger?.error?.('[Camera] missing thumbnail URL');
      return;
    }
    this.bus.emit({
      type: QUEST_ITEM_OVERLAY_READY,
      src: displayUrl
    });
    const timestamp = Date.now();
    const id = this._msgSeq++;
    let order = Date.now();
    let dlg = null;
    if (this.dialogManager?.dialog) {
      dlg = this.dialogManager.dialog;
      const prev = dlg.messages?.[(dlg.index ?? 0) - 1];
      if (prev && typeof prev.order === 'number') {
        order = prev.order + 1;
      }
    }
    const stageConfig = this.dualityManager?.getStageConfig?.();
    const questConfig = stageConfig?.quest || null;
    const stageId =
      stageConfig?.id ||
      questConfig?.id ||
      stageConfig?.event?.id ||
      null;
    const { reaction: configuredReaction, origin: reactionOrigin } =
      this._resolveReaction(stageConfig);
    const msg = {
      type: 'image',
      src: displayUrl,
      persistSrc: thumbDataUrl,
      media: { id: mediaId },
      author: 'user',
      avatar,
      timestamp,
      id,
      order,
      fingerprint: `capture:${timestamp}`,
      _revoke: thumbObj?.revoke,
      stageId,
      questId: questConfig?.id || null,
      reaction: configuredReaction,
      reactionOrigin,
      reactionLocked: !!configuredReaction,
      revisionAllowed: false
    };
    if (dlg) {
      const idx = dlg.index ?? 0;
      dlg.messages.splice(idx, 0, { ...msg });
      dlg.index = idx + 1;
    }
    const { type: _mType, ...rest } = msg;
    this.bus.emit({ type: EVENT_MESSAGE_READY, ...rest, message: msg });
    if (configuredReaction) {
      this.bus.emit({
        type: REACTION_OVERLAY_REQUESTED,
        messageId: msg.id,
        fingerprint: msg.fingerprint,
        stageId,
        auto: true,
        locked: true,
        reaction: configuredReaction,
        origin: reactionOrigin
      });
    }
    this.buttonStateService?.setScreenState('main', 'toggle-camera', false);
    this.dualityManager?.completeQuest?.();
  }

  _resolveOverlayMode(coords = {}) {
    const configuredMode = typeof coords.mode === 'string' ? coords.mode.trim() : '';
    if (configuredMode) {
      return configuredMode;
    }
    return coords.collage === false ? 'background-only' : 'collage';
  }

  async _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  _resolveReaction(stageConfig) {
    const reactions = Array.isArray(stageConfig?.reactions)
      ? stageConfig.reactions.filter(r => typeof r === 'string' && r.trim() !== '')
      : [];
    const preset =
      typeof stageConfig?.reactionPreset === 'string'
        ? stageConfig.reactionPreset.trim()
        : '';
    if (preset && (!reactions.length || reactions.includes(preset))) {
      return { reaction: preset, origin: 'system' };
    }
    if (reactions.length) {
      return { reaction: reactions[0], origin: 'system' };
    }
    return { reaction: null, origin: null };
  }

  async _toBlobWithFallback(canvas, label) {
    const blob = await new Promise(res => canvas.toBlob(res));
    if (blob) return blob;
    this.logger?.error?.(`[Camera] ${label} toBlob failed`);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      return this._dataUrlToBlob(dataUrl);
    } catch (err) {
      this.logger?.error?.(`[Camera] ${label} toDataURL fallback failed`, err);
      return null;
    }
  }

  _dataUrlToBlob(dataUrl) {
    const [meta, data] = dataUrl.split(',');
    const mime = meta.match(/data:(.*);base64/)[1];
    const bin = Buffer.from(data, 'base64');
    return new Blob([bin], { type: mime });
  }

  stopDetection() {
    this.store.dispatch(detectionDone());
    this.bus?.emit?.({ type: DETECTION_STOPPED });
  }

  stop() {
    this.active = false;
    this.stopDetection();
    clearTimeout(this._retryTimer);
    this._retryTimer = null;
    this.buttonStateService?.setScreenState('camera', 'capture-btn', false);
  }

  toggleVisibility() {
    this.active = !this.active;
    if (!this.active) {
      this.cameraService?.stopStream?.();
      this.stopDetection();
    }
    this.bus.emit({ type: 'CAMERA_TOGGLE', active: this.active });
  }

  dispose() {
    if (this._handler) {
      this.bus?.unsubscribe?.(this._handler);
      this._handler = null;
    }
    this.cameraService?.stopStream?.();
    this.stop();
  }
}
