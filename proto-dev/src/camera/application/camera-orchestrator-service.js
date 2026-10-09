import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import coreStore from '../../narrative-runtime/engine/store.js';
import { detectionStart, detectionDone } from '../../narrative-runtime/engine/actions.js';
import { CAMERA_DETECT } from '../../narrative-runtime/engine/effects.js';
import { ENGINE_V1_ENABLED } from '../../runtime-configuration/feature-flags.js';
import {
  QUEST_ITEM_OVERLAY_READY,
  QUEST_STARTED,
  QUEST_COMPLETED,
  OVERLAY_SHOW,
  EVENT_MESSAGE_READY,
  REACTION_OVERLAY_REQUESTED,
  DETECTION_SEARCH,
  DETECTION_STOPPED,
} from '../../runtime-events/domain/constants.js';
import {
  RegistrationCameraStrategy,
  QuestCameraStrategy,
} from '../detection/camera-detection-strategy.js';

export default class CameraOrchestratorService {
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
    engineEnabled = ENGINE_V1_ENABLED,
    timeline = null,
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
    /** @type {import('../../runtime-events/ports/event-bus-port.js').default} */
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
    this.timeline = timeline;
    this.effectHandlers = {
      [CAMERA_DETECT]: (payload) => this._runDetection(payload),
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
    this._sessionRevision = 0;
    this._operationRevision = 0;
    this.sessionState = 'idle';
    this._requirementHandler = null;
  }

  _runEffects(effects = []) {
    const tasks = [];
    effects.forEach((effect) => {
      const handler = this.effectHandlers[effect.type];
      if (handler) {
        const res = handler(effect.payload);
        if (res !== undefined) tasks.push(res);
      }
    });
    return tasks;
  }

  boot() {
    if (this._handler) return;
    this._handler = async (evt) => {
      if (evt.type === 'CAMERA_VIEW_OPENED') {
        await this.open(evt.container, evt.options || {});
        return;
      }
      if (evt.type === 'CAMERA_VIEW_CLOSED') {
        this.closeSession();
        this.buttonVisibilityService?.setScreenVisibility('messenger', 'toggle-camera', true);
        this.buttonVisibilityService?.setScreenVisibility('camera', 'toggle-messenger', false);
        this.buttonVisibilityService?.setScreenVisibility('messenger', 'post', true);
        this.buttonVisibilityService?.setScreenVisibility('camera', 'capture-btn', false);
        this.inputGate?.advanceToUserTurn();
        this.captured = false;
        this.stateService?.resetCaptured?.();
        this.stateService?.resetPresence?.();
      }
      if (
        ['GHOST_CHANGE', 'APP_RESET_REQUESTED', 'APP_RESET_COMPLETED', 'HOST_HIDDEN'].includes(
          evt.type,
        )
      )
        this.closeSession();
      if (evt.type === QUEST_STARTED) {
        if (this.cameraOpen) {
          this.start(this.lastContainer, {
            cameraType: this.lastCameraType,
            force: this.lastForce,
            onDetected: this.lastOnDetected,
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

  async open(container, options = {}) {
    this.closeSession();
    const session = ++this._sessionRevision;
    this.sessionState = 'opening';
    this.cameraOpen = true;
    const { cameraType = 'quest', force = false, onDetected } = options || {};
    this.lastContainer = container;
    this.lastCameraType = cameraType;
    this.lastOnDetected = onDetected;
    this.lastForce = force;
    try {
      await this.cameraService.startStream(container);
    } catch (err) {
      if (this._sessionRevision === session && this.cameraOpen && err.name !== 'AbortError') {
        this.sessionState = 'error';
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'error', error: err.message });
      }
      return;
    }
    if (this._sessionRevision !== session || !this.cameraOpen) {
      // Camera was closed while waiting for the stream to start.
      // Skip any further initialization to prevent false detection restarts.
      this.logger?.info?.('[Camera] view closed before stream ready');
      return;
    }
    this.sessionState = 'active';
    this.captured = false;
    this.stateService?.resetCaptured?.();
    this.stateService?.resetPresence?.();
    const questActive = this.dualityManager?.isQuestActive?.();
    const shouldStart = questActive || force || cameraType === 'registration';
    this.logger?.info?.('[Camera] view opened', {
      questActive,
      force,
      cameraType,
      shouldStart,
    });
    if (shouldStart) {
      this.start(container, { cameraType, force, onDetected });
      this.inputGate?.advanceToUserTurn();
    } else {
      this.logger?.info?.('[Camera] detection not started on open', {
        questActive,
        force,
        cameraType,
      });
    }
    this.buttonVisibilityService?.setScreenVisibility('messenger', 'toggle-camera', false);
    this.buttonVisibilityService?.setScreenVisibility('camera', 'toggle-messenger', true);
    this.buttonVisibilityService?.setScreenVisibility('messenger', 'post', false);
    this.buttonVisibilityService?.setScreenVisibility('camera', 'capture-btn', !!questActive);
  }

  start(container, options = {}) {
    if (!this.cameraOpen) return this.open(container, options);
    if (!this.imageComposer || !this.mediaRepository) {
      this.logger?.error('[Camera] Missing deps', {
        imageComposer: !!this.imageComposer,
        mediaRepository: !!this.mediaRepository,
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
    const strategy = cameraType === 'registration' ? this.registrationStrategy : this.questStrategy;
    const requirement = strategy.getRequirement();
    this.lastRequirement = requirement;
    this.logger?.info?.('[Camera] requirement selected', requirement);
    const questActive = cameraType === 'quest' ? this.dualityManager?.isQuestActive?.() : true;
    const target = requirement?.target || requirement?.object;
    this.logger?.info?.('[Camera] start parameters', {
      questActive,
      force,
      cameraType,
      target,
      requirementType: requirement?.type,
    });
    if (cameraType === 'quest' && !target) {
      // Already emitted search status in strategy; wait for requirement.
      this.logger?.info?.('[Camera] waiting for requirement update');
      return;
    }
    const personTarget = target === 'person';
    const allowPersonWithoutQuest = cameraType === 'registration' && personTarget;
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
        requirementType: requirement?.type,
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
        busy: this.detectionBusy,
      });
      return;
    }
    const { onDetected, requirement } = options;
    if (requirement?.isSatisfied && !this.lastForce && !requirement.isSatisfied()) {
      this.logger?.info?.('[Camera] waiting for requirement', requirement);
      const handler = (evt) => {
        if (evt.type === QUEST_STARTED) {
          this.bus?.unsubscribe?.(handler);
          this.startDetection(container, options);
        }
      };
      if (this._requirementHandler) this.bus?.unsubscribe?.(this._requirementHandler);
      this._requirementHandler = handler;
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
    const operation = ++this._operationRevision;
    const session = this._sessionRevision;
    this._runningToken = { session, operation };
    const effects = this.store.dispatch(detectionStart({ container, target, onDetected }));
    const tasks = this.engineEnabled
      ? this._runEffects(effects)
      : effects
          .filter((effect) => effect.type === CAMERA_DETECT)
          .map((effect) => this._runDetection(effect.payload));
    return Promise.all(tasks).finally(() => {
      if (this._validOperation(session, operation)) this.detectionBusy = false;
    });
  }

  getSessionToken() {
    return { session: this._sessionRevision };
  }

  isSessionCurrent(token) {
    return !!token && token.session === this._sessionRevision && this.cameraOpen;
  }

  _validOperation(session, operation) {
    return (
      session === this._sessionRevision &&
      operation === this._operationRevision &&
      this.active &&
      this.cameraOpen
    );
  }

  async _runDetection({ container, target, onDetected }) {
    const token = this._runningToken || {
      session: this._sessionRevision,
      operation: this._operationRevision,
    };
    const valid = () => this._validOperation(token.session, token.operation);
    let result = { ok: false };
    try {
      if (!valid() || !container || container.offsetParent === null) return;
      const blob = await this.cameraService.takeSelfie();
      if (!valid()) return;
      result = await this.detectionService.detectTarget(blob, target, {
        sessionRevision: token.session,
        contextRevision: token.operation,
      });
      if (!valid()) return;
      if (result.ok) {
        clearTimeout(this._retryTimer);
        this._retryTimer = null;
        this.stateService?.setPresence?.(target, true);
        this.cameraService.stopStream?.();
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'paused', sessionRevision: token.session });
        this.buttonStateService?.setScreenState?.('camera', 'capture-btn', true);
        if (onDetected)
          await onDetected(target, blob, result.box, result.mask, { session: token.session });
        if (!valid()) return;
        this.inputGate?.advanceToUserTurn();
      }
    } catch (error) {
      if (valid() && error.name !== 'AbortError') this.logger?.error?.(error?.message || error);
    } finally {
      if (valid()) {
        this.store.dispatch(detectionDone());
        if (!result.ok) {
          this._retryTimer = setTimeout(() => {
            if (!valid()) return;
            this.startDetection(this.lastContainer, {
              requirement: this.lastRequirement,
              onDetected: this.lastOnDetected,
            });
          }, 500);
        }
      }
    }
  }

  async resumeDetection({ hidePreview = false } = {}) {
    if (!this.active || !this.cameraOpen) return;
    const token = this.getSessionToken();
    clearTimeout(this._retryTimer);
    this._retryTimer = null;
    this.stateService?.resetCaptured?.();
    this.buttonStateService?.setScreenState('camera', 'capture-btn', false);
    const screen = this.lastCameraType === 'registration' ? 'registration-camera' : 'camera';
    this.bus.emit({ type: 'BUTTON_STATE_UPDATED', screen });
    this.bus.emit({ type: DETECTION_SEARCH });
    this.inputGate?.advanceToUserTurn();
    // Stream was stopped after detection; start a new one before continuing.
    await this.cameraService?.startStream?.(this.lastContainer);
    if (!this.isSessionCurrent(token)) return;
    // Restore video view and hide the frozen preview frame only when requested.
    if (this.lastContainer) {
      this.lastContainer.hidden = false;
      if (hidePreview) {
        const preview = this.lastContainer.parentElement?.querySelector(
          '[data-js="selfie-preview"]',
        );
        if (preview) preview.hidden = true;
      }
    }
    const strategy =
      this.lastCameraType === 'registration' ? this.registrationStrategy : this.questStrategy;
    const requirement = strategy.getRequirement();
    this.lastRequirement = requirement;
    this.startDetection(this.lastContainer, {
      requirement,
      onDetected: this.lastOnDetected,
    });
  }

  hasCaptured() {
    return this.captured;
  }

  markCaptured() {
    this.captured = true;
    if (this.stateService) this.stateService.markCaptured();
  }

  captureOverlay(coords = {}, blob = null, box = null, mask = null) {
    const session = this._sessionRevision;
    if (this.captured || !this.cameraOpen) return Promise.resolve();
    if (this._captureSession === session && this._capturePromise) return this._capturePromise;
    this._captureSession = session;
    const pending = this._captureOverlay(coords, blob, box, mask).finally(() => {
      if (this._capturePromise === pending) this._capturePromise = null;
    });
    this._capturePromise = pending;
    return pending;
  }

  async _captureOverlay(coords = {}, blob = null, box = null, mask = null) {
    const token = this.getSessionToken();
    const valid = () => this.isSessionCurrent(token);
    if (!valid()) return;
    if (!this.overlayService || !this.mediaRepository) {
      this.logger?.error('[Camera] Missing deps', {
        overlayService: !!this.overlayService,
        mediaRepository: !!this.mediaRepository,
      });
      return;
    }
    const compositionMode = this._resolveOverlayMode(coords);
    const includeFrame = compositionMode !== 'background-only';
    const frame = includeFrame ? blob || (await this.cameraService.takeSelfie()) : null;
    if (!valid()) return;
    const { background, ...placement } = coords;
    let bgImg = null;
    if (background?.src) {
      try {
        bgImg = await this._loadImage(background.src);
        if (!valid()) return;
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
    const canvas = await this.overlayService.compose(frame, bgImg, finalCoords, mask, {
      includeFrame,
      compositionMode,
    });
    const fullDataUrl = canvas.toDataURL('image/png');
    if (!valid()) return;
    const fullBlob = await this._toBlobWithFallback(canvas, 'full');
    if (!valid()) return;
    const thumbCanvas = this.canvasFactory.create();
    thumbCanvas.width = 64;
    thumbCanvas.height = 64;
    thumbCanvas.getContext('2d').drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 64, 64);
    const thumbBlob = await this._toBlobWithFallback(thumbCanvas, 'thumb');
    if (!valid()) return;
    const thumbDataUrl = thumbCanvas.toDataURL('image/png');
    if (!fullBlob || !thumbBlob || !thumbDataUrl) {
      this.logger?.error?.('[Camera] overlay composition failed');
      return;
    }
    const mediaId = await this.mediaRepository.save(
      { full: fullBlob, thumb: thumbBlob },
      { crop, overlays: mask ? [{ mask }] : [] },
    );
    if (!valid()) {
      await this.mediaRepository.remove?.(mediaId);
      return;
    }
    this.logger?.info?.('[Camera] overlay composed', { mediaId });
    const avatar = (await this.avatarService?.getUserAvatar?.()) || '';
    if (!valid()) {
      await this.mediaRepository.remove?.(mediaId);
      return;
    }
    const record = await this.mediaRepository.get(mediaId);
    if (!valid()) {
      await this.mediaRepository.remove?.(mediaId);
      return;
    }
    const thumbObj = await this.mediaRepository.getObjectURL(record.thumbKey);
    if (!valid()) {
      thumbObj?.revoke?.();
      await this.mediaRepository.remove?.(mediaId);
      return;
    }
    const displayUrl = thumbObj?.url || thumbDataUrl;
    if (!displayUrl) {
      this.logger?.error?.('[Camera] missing thumbnail URL');
      return;
    }
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
    const stageId = stageConfig?.id || questConfig?.id || stageConfig?.event?.id || null;
    const { reaction: configuredReaction, origin: reactionOrigin } =
      this._resolveReaction(stageConfig);
    let msg = {
      type: 'image',
      src: displayUrl,
      persistSrc: thumbDataUrl,
      media: { id: mediaId },
      author: 'user',
      avatar,
      timestamp,
      id,
      order,
      fingerprint: `capture:${token.session}:${timestamp}:${id}`,
      _revoke: thumbObj?.revoke,
      stageId,
      questId: questConfig?.id || null,
      reaction: configuredReaction,
      reactionOrigin,
      reactionLocked: !!configuredReaction,
      revisionAllowed: false,
    };
    try {
      if (this.timeline) msg = this.timeline.accept(msg);
    } catch (error) {
      thumbObj?.revoke?.();
      await this.mediaRepository.remove?.(mediaId);
      throw error;
    }
    this.markCaptured();
    this.bus.emit({ type: OVERLAY_SHOW, src: fullDataUrl, showMessengerButton: true });
    this.bus.emit({ type: QUEST_ITEM_OVERLAY_READY, src: displayUrl });
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
        origin: reactionOrigin,
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
      ? stageConfig.reactions.filter((r) => typeof r === 'string' && r.trim() !== '')
      : [];
    const preset =
      typeof stageConfig?.reactionPreset === 'string' ? stageConfig.reactionPreset.trim() : '';
    if (preset && (!reactions.length || reactions.includes(preset))) {
      return { reaction: preset, origin: 'system' };
    }
    if (reactions.length) {
      return { reaction: reactions[0], origin: 'system' };
    }
    return { reaction: null, origin: null };
  }

  async _toBlobWithFallback(canvas, label) {
    const blob = await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Camera ${label} encoding timed out`)),
        10000,
      );
      try {
        canvas.toBlob((value) => {
          clearTimeout(timer);
          resolve(value);
        });
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
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
    const bin = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
    return new Blob([bin], { type: mime });
  }

  stopDetection() {
    this.store.dispatch(detectionDone());
    this.bus?.emit?.({ type: DETECTION_STOPPED });
  }

  stop() {
    this._operationRevision += 1;
    this._runningToken = null;
    this.detectionBusy = false;
    if (this._requirementHandler) this.bus?.unsubscribe?.(this._requirementHandler);
    this._requirementHandler = null;
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
    this.closeSession();
  }

  closeSession() {
    this._sessionRevision += 1;
    this.cameraOpen = false;
    this.sessionState = 'closing';
    this.stop();
    this.cameraService?.stopStream?.();
    this.detectionService?.cancelPending?.();
    this.lastOnDetected = null;
    this.lastContainer = null;
    this.sessionState = 'idle';
  }

  clearUserRuntimeContext() {
    this.closeSession();
  }
}
