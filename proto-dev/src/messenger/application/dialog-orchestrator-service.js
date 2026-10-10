import ContactTransitionController from '../../contact-sessions/application/contact-transition-controller.js';
import DialogTimeline from '../history/dialog-timeline.js';
import NullLogger from '../../runtime-diagnostics/null-logger.js';
import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import DialogHistoryBuffer from '../history/dialog-history-buffer.js';
import coreStore from '../../narrative-runtime/engine/store.js';
import AutoReplyBuilder from '../../narrative-runtime/dialog/auto-reply-builder.js';
import { dialogAdvance } from '../../narrative-runtime/engine/actions.js';
import { DIALOG_PROGRESS, HISTORY_SAVE } from '../../narrative-runtime/engine/effects.js';
import { ENGINE_V1_ENABLED } from '../../runtime-configuration/feature-flags.js';
import messageFingerprint from '../identity/message-fingerprint.js';
import {
  DIALOG_WIDGET_READY,
  EVENT_MESSAGE_READY,
  QUEST_STARTED,
  DUALITY_COMPLETED,
  DUALITY_STAGE_STARTED,
  USER_PROFILE_SAVED,
  APP_RESET_COMPLETED,
  GHOST_RESET_REQUESTED,
  GHOST_RESET_COMPLETED,
  GHOST_REBOOT_REQUESTED,
  GHOST_REBOOT_COMPLETED,
} from '../../runtime-events/domain/constants.js';

/**
 * Generic dialog orchestrator for ghosts.
 * Loads ghost configuration and wires duality/dialog services.
 * Uses a two-stage start: setup occurs on the messenger screen and the dialog
 * progresses only after the UI widget signals readiness.
 * Logs configuration issues through the provided logger.
 */
export default class DialogOrchestratorService {
  constructor(
    dualityManager,
    dialogManager,
    ghostService,
    buttonStateService,
    buttonVisibilityService,
    historyService,
    avatarService,
    ghostSwitchService,
    spiritConfigs,
    inputGateService = null,
    bus = new NullEventBus(),
    logger = null,
    historyBuffer = new DialogHistoryBuffer(),
    store = coreStore,
    engineEnabled = ENGINE_V1_ENABLED,
    rebootCheckpointService = null,
    timeline = null,
  ) {
    this.dualityManager = dualityManager;
    this.dialogManager = dialogManager;
    this.ghostService = ghostService;
    this.buttonStateService = buttonStateService;
    this.buttonVisibilityService = buttonVisibilityService;
    this.historyService = historyService;
    this.transitions = new ContactTransitionController();
    this.timeline = timeline || new DialogTimeline(historyService, bus);
    if (this.dialogManager) this.dialogManager.timeline = this.timeline;
    this.avatarService = avatarService;
    this.ghostSwitchService = ghostSwitchService;
    this.spiritConfigs = spiritConfigs || {};
    this.inputGate = inputGateService;
    this.bus = bus;
    this.started = false;
    this._handler = null;
    this._readyHandler = null;
    // Indicates that dialog start is waiting for the UI widget to become ready
    this.waitingForWidget = false;
    this.currentGhost = null;
    // Tracks whether the messenger screen is currently active
    this.onMessenger = false;
    // Tracks ghosts that have already been initialized in this session
    this.initializedGhosts = new Set();
    // Buffer capturing messages before the widget becomes ready.
    this.historyBuffer = historyBuffer;
    // Reflects whether the dialog widget has reported ready state via
    // `DIALOG_WIDGET_READY` from the EventBus.
    this._widgetReady = false;
    // Remembers the index of the last message replayed to prevent
    // advancing the same line twice once the widget becomes ready.
    this._lastReplayedIndex = -1;
    // Tracks whether the dialog has progressed beyond restored history.
    this._hasAdvanced = false;
    // Retains fingerprints for replayed messages keyed by their dialog index
    // so subsequent progression reuses the same identifiers.
    this._replayedFingerprints = new Map();
    // Derived from the current screen/turn and a pending posting operation.
    // Gate evaluation restores it even when no new message is emitted.
    this.postLocked = false;
    this._postingTurn = null;
    // Captures user posts made before the dialog widget reports readiness so
    // they can be replayed once the UI becomes available.
    this._pendingPosts = [];
    this.logger = logger ?? new NullLogger();
    this.store = store;
    this.userAvatar = '';
    this.awaitingAvatar = false;
    this.autoReplyBuilder = new AutoReplyBuilder();
    // Tracks whether a profile update occurred while the dialog widget was
    // unavailable so avatars can be refreshed once it becomes ready.
    this._pendingAvatarRefresh = false;
    this.engineEnabled = engineEnabled;
    this.rebootCheckpointService = rebootCheckpointService;
    this.effectHandlers = {
      [DIALOG_PROGRESS]: () => this.dialogManager.progress(),
      [HISTORY_SAVE]: () => {
        const ghost = this.currentGhost;
        if (!ghost) return;
        const dlg = this.dialogManager.dialog;
        const msgs = dlg?.messages?.slice(0, dlg.index) || [];
        this.historyService?.appendUnique?.(ghost, msgs);
      },
    };
  }

  _runEffects(effects = []) {
    effects.forEach((effect) => {
      const handler = this.effectHandlers[effect.type];
      if (handler) handler(effect.payload);
    });
  }

  async _loadConfig(name) {
    const config = this.spiritConfigs[name];
    if (!config) throw new Error(`Unknown contact: ${name}`);
    return config;
  }

  async _prepareConfig(ghost, cfg) {
    const userAvatar = await this.avatarService?.getUserAvatar?.();

    const enrichedStages = (cfg.stages || []).map((stage, stageIdx) => {
      const stageIdentifier = stage.id || stage.event?.id || stage.quest?.id || `stage-${stageIdx}`;
      return {
        ...stage,
        event: {
          ...stage.event,
          messages: (stage.event?.messages || []).map((m, messageIndex) => {
            const autoText = this._resolveAutoGeneratedText(m, stage);
            const resolvedText = typeof m.text === 'string' ? m.text : autoText || '';
            const normalizedStageId = m.stageId || stageIdentifier;
            return {
              ...m,
              text: resolvedText,
              stageId: normalizedStageId,
              avatar: m.avatar || (m.author === 'ghost' ? cfg.avatar : userAvatar || ''),
              // Compute unified content fingerprint for compatibility with history service.
              fingerprint:
                m.fingerprint ||
                messageFingerprint({
                  ghost,
                  stageId: normalizedStageId,
                  author: m.author,
                  text: resolvedText,
                  type: m.type || '',
                  src: m.src || (m.media && (m.media.id || m.media.src)) || '',
                  occurrenceId: `${normalizedStageId}:${messageIndex}`,
                  fingerprint: m.fingerprint,
                }),
            };
          }),
        },
      };
    });
    return { cfg: { ...cfg, stages: enrichedStages }, userAvatar };
  }

  _resolveAutoGeneratedText(message = {}, stage = {}) {
    if (!message || typeof message !== 'object') return null;
    if (message.type === 'image' || message.type === 'youtube') return null;
    if (message.author !== 'user') return null;
    if (typeof message.text === 'string' && message.text.trim() !== '') return null;
    const auto =
      message.autoGenerated === true ||
      typeof message.autoGenerated === 'object' ||
      typeof message.autoReplyTarget === 'string';
    if (!auto) return null;
    const autoConfig = typeof message.autoGenerated === 'object' ? message.autoGenerated : {};
    const targetEmoji =
      (typeof message.autoReplyTarget === 'string' && message.autoReplyTarget.trim()) ||
      (typeof autoConfig.targetEmoji === 'string' && autoConfig.targetEmoji.trim()) ||
      (typeof autoConfig.target === 'string' && autoConfig.target.trim()) ||
      '';
    if (!targetEmoji) {
      this.logger?.warn?.('[Dialog] auto-generated reply missing target emoji', {
        stageId: stage?.id || stage?.event?.id || null,
      });
    }
    return this.autoReplyBuilder.buildDetectionReply(targetEmoji);
  }

  /**
   * Ensure historical messages contain chronological metadata.
   * Messages lacking timestamp or id will receive sequential values
   * so that rendering can establish a stable order.
   * @param {Array<object>} historyRaw
   * @returns {Array<object>} normalized messages
   * @private
   */
  _normalizeHistory(historyRaw, ghost = '') {
    const seen = new Set();
    return historyRaw.flatMap((message) => {
      const media = message.media || (message.media_id ? { id: message.media_id } : undefined);
      const fingerprint = String(messageFingerprint({ ...message, media, ghost }));
      if (seen.has(fingerprint)) return [];
      seen.add(fingerprint);
      const normalized = { ...message, ...(media ? { media } : {}), fingerprint };
      if (Number.isSafeInteger(message.sequence) && message.sequence > 0)
        normalized.order = message.sequence;
      delete normalized.media_id;
      return [normalized];
    });
  }

  _replayHistory(history) {
    this._replayedFingerprints.clear();
    history.forEach((message, index) =>
      this._replayedFingerprints.set(index, {
        id: message.id,
        fingerprint: message.fingerprint,
      }),
    );
    this.timeline.replaceMessages({
      ghost: this.currentGhost,
      revision: this.transitions.revision,
      messages: history,
    });
  }

  async _switchGhost(ghostName, { force = false } = {}) {
    if (!ghostName) return;
    if (!force && ghostName === this.currentGhost && this.transitions.requested === ghostName) {
      this._replayHistory(this.historyService?.load?.(ghostName) || []);
      return;
    }
    const previous = this.currentGhost;
    if (previous) {
      this.historyBuffer.flushTo(this.historyService, previous);
      const shown =
        this.dialogManager.dialog?.messages?.slice(0, this.dialogManager.dialog.index) || [];
      this.historyService?.save?.(previous, shown);
    }
    this.postLocked = true;
    this._postingTurn = null;
    try {
      return await this.transitions.request(
        ghostName,
        async ({ isCurrent }) => {
          const loaded = await this._loadConfig(ghostName);
          if (!isCurrent()) return null;
          const prepared = await this._prepareConfig(ghostName, loaded);
          if (!isCurrent()) return null;
          const history = this._normalizeHistory(
            this.historyService?.load?.(ghostName) || [],
            ghostName,
          ).map((message) => ({
            ...message,
            avatar:
              message.avatar ||
              (message.author === 'ghost' ? prepared.cfg.avatar : prepared.userAvatar || ''),
          }));
          const duality = this.dualityManager.prepare?.(prepared.cfg);
          return { ...prepared, history, duality };
        },
        ({ cfg, userAvatar, history, duality }, { revision }) => {
          this.inputGate?.reset?.();
          this.historyBuffer.reset();
          this.currentGhost = ghostName;
          this.userAvatar = userAvatar || '';
          this.awaitingAvatar = !userAvatar;
          this.ghostService.commitCurrentGhost?.(ghostName);
          if (duality) this.dualityManager.commitPrepared(duality, { notify: false });
          else this.dualityManager.load(cfg);
          this.dialogManager.dialog = this.dualityManager.getCurrentDialog();
          if (!this.dialogManager.dialog)
            throw new Error(`Missing dialog for ghost "${ghostName}"`);
          const dialog = this.dialogManager.dialog;
          // Match configured occurrences to persisted identity; history spans all
          // stages, while the current stage has its own remaining message suffix.
          const remaining = [...dialog.messages];
          // Preserve original legacy identity. Match a configured occurrence once,
          // by declared stage/content, without merging repeated accepted records.
          for (const saved of history) {
            const index = remaining.findIndex(
              (message) =>
                message.fingerprint === saved.fingerprint ||
                ((!saved.stageId || saved.stageId === message.stageId) &&
                  saved.author === message.author &&
                  (saved.text || '') === (message.text || '') &&
                  (saved.type || '') === (message.type || '') &&
                  (saved.src || '') === (message.src || '') &&
                  saved.chronologyOrigin !== 'accepted-sequence'),
            );
            if (index >= 0) remaining.splice(index, 1);
          }
          dialog.messages = [...history, ...remaining];
          dialog.restore(history.length);
          this.started = true;
          this.buttonVisibilityService?.setScreenVisibility?.('camera', 'capture-btn', false);
          this.timeline.replaceMessages(
            { ghost: ghostName, revision, messages: history },
            { mergeLive: false },
          );
          this.bus.emit({
            type: 'GHOST_CONTEXT_COMMITTED',
            payload: { name: ghostName },
            config: cfg,
            revision,
          });
          this.dualityManager.publishRestored?.();
          this._syncLastReplayedIndex();
          this.waitingForWidget =
            history.length === 0 && dialog.messages[dialog.index]?.author === 'ghost';
          this._updatePostLockFromDialogState();
          this._maybeStart();
          this._advanceGate();
        },
      );
    } catch (error) {
      this.logger.error?.(error.message);
      this.bus.emit({ type: 'STATUS_SHOW', message: 'contact_load_failed', error: error.message });
      this._updatePostLockFromDialogState();
    }
  }

  /**
   * Synchronize the replay tracker with the current dialog index.
   * @private
   */
  _refreshLastReplayedIndex() {
    const current = (this.dialogManager.dialog?.index ?? 0) - 1;
    if (current > this._lastReplayedIndex) {
      this._hasAdvanced = true;
    }
    this._lastReplayedIndex = current;
  }

  _syncLastReplayedIndex() {
    this._lastReplayedIndex = (this.dialogManager.dialog?.index ?? 0) - 1;
    this._hasAdvanced = false;
  }

  /**
   * Keep post-lock state in sync with the active dialog turn.
   * Posting should only be interactable when messenger is active and
   * the upcoming line expects user text input.
   * @private
   */
  _updatePostLockFromDialogState() {
    const upcoming = this.dialogManager.dialog?.messages?.[this.dialogManager.dialog?.index];
    const expectsUserInput =
      this.onMessenger &&
      !this._postingTurn &&
      !this.dialogManager.dialog?.isComplete?.() &&
      upcoming?.author === 'user';
    this.postLocked = !expectsUserInput;
    this.buttonStateService?.setScreenState?.('messenger', 'post', expectsUserInput);
  }

  _resetRuntimeState({ keepWidgetReady = false } = {}) {
    this._postingTurn = null;
    this.historyBuffer?.reset?.();
    this._pendingPosts = [];
    this._replayedFingerprints.clear();
    this._lastReplayedIndex = -1;
    this._hasAdvanced = false;
    this.postLocked = false;
    this.waitingForWidget = false;
    this._pendingAvatarRefresh = false;
    if (!keepWidgetReady) {
      this._widgetReady = false;
    }
  }

  _handleAppReset() {
    this.transitions.cancel();
    this.timeline.clearUserRuntimeContext();
    this._resetRuntimeState({ keepWidgetReady: false });
    this.inputGate?.reset?.();
    this.started = false;
    this.onMessenger = false;
    this.currentGhost = null;
    this.initializedGhosts.clear();
    this.userAvatar = '';
    this.awaitingAvatar = false;
    this.historyService?.clearUserRuntimeContext?.();
  }

  async _handleGhostReset(evt) {
    this.transitions.cancel();
    const revision = this.transitions.revision;
    const ghostName = evt?.payload?.ghost || this.ghostService?.getCurrentGhost?.()?.name;
    if (!ghostName) return;
    const loaded = await this._loadConfig(ghostName);
    if (revision !== this.transitions.revision) return;
    const { cfg, userAvatar } = await this._prepareConfig(ghostName, loaded);
    if (revision !== this.transitions.revision) return;
    this._resetRuntimeState({ keepWidgetReady: true });
    this.inputGate?.reset?.();
    this.historyService?.clear?.(ghostName);
    this.rebootCheckpointService?.clearGhost?.(ghostName);
    this.currentGhost = ghostName;
    this.initializedGhosts.delete(ghostName);
    this.dualityManager.resetProgress?.(cfg);
    this.dualityManager.load(cfg);
    this.dialogManager.dialog = this.dualityManager.getCurrentDialog();
    if (!this.dialogManager.dialog) {
      this.logger.error(`Missing dialog for ghost "${ghostName}" after reset`);
      return;
    }
    this.userAvatar = userAvatar;
    this.dialogManager.dialog.restore(0);
    this._replayHistory([]);
    this._syncLastReplayedIndex();
    const upcoming = this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
    this.waitingForWidget = this.onMessenger && upcoming?.author === 'ghost';
    if (this.onMessenger && this._widgetReady) {
      if (this.waitingForWidget) {
        this._maybeStart();
      }
      this._advanceGate();
    }
    this.bus.emit({ type: GHOST_RESET_COMPLETED, payload: { ghost: ghostName } });
  }

  _buildHistorySnapshot(ghostName) {
    const persisted = this._normalizeHistory(
      this.historyService?.load?.(ghostName) || [],
      ghostName,
    );
    const buffered = this._normalizeHistory(this.historyBuffer?.getAll?.() || [], ghostName);
    const seen = new Set();
    const result = [];
    [...persisted, ...buffered].forEach((message) => {
      const key = message.fingerprint ?? `${message.author}:${message.text}:${message.timestamp}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ ...message });
    });
    return result;
  }

  _captureRebootCheckpoint(ghostName) {
    if (!ghostName) return;
    const history = this._buildHistorySnapshot(ghostName);
    this.rebootCheckpointService?.saveCheckpoint?.(ghostName, {
      ghost: ghostName,
      history,
      savedAt: Date.now(),
    });
  }

  async _handleGhostReboot(evt) {
    this.transitions.cancel();
    const revision = this.transitions.revision;
    const ghostName = evt?.payload?.ghost || this.ghostService?.getCurrentGhost?.()?.name;
    if (!ghostName) return;
    const loaded = await this._loadConfig(ghostName);
    if (revision !== this.transitions.revision) return;
    const { cfg, userAvatar } = await this._prepareConfig(ghostName, loaded);
    if (revision !== this.transitions.revision) return;
    this._resetRuntimeState({ keepWidgetReady: true });
    this.inputGate?.reset?.();
    this.currentGhost = ghostName;
    this.initializedGhosts.delete(ghostName);
    this.dualityManager.resetProgress?.(cfg);
    this.dualityManager.load(cfg);
    this.dialogManager.dialog = this.dualityManager.getCurrentDialog();
    if (!this.dialogManager.dialog) {
      this.logger.error(`Missing dialog for ghost "${ghostName}" after reboot`);
      return;
    }
    this.userAvatar = userAvatar;
    const checkpoint = this.rebootCheckpointService?.getCheckpoint?.(ghostName);
    const checkpointHistory = this._normalizeHistory(checkpoint?.history || [], ghostName).map(
      (m) => ({
        ...m,
        avatar: m.avatar || (m.author === 'ghost' ? cfg.avatar : userAvatar || ''),
      }),
    );
    const dlg = this.dialogManager.dialog;
    const remaining = dlg.messages.slice(checkpointHistory.length);
    dlg.messages = [...checkpointHistory, ...remaining];
    dlg.restore(checkpointHistory.length);
    this._replayHistory(checkpointHistory);
    this._syncLastReplayedIndex();
    this.waitingForWidget = false;
    if (this.onMessenger && this._widgetReady) {
      this._maybeStart();
      this._advanceGate();
    }
    this.bus.emit({
      type: GHOST_REBOOT_COMPLETED,
      payload: { ghost: ghostName, hasCheckpoint: checkpointHistory.length > 0 },
    });
  }

  /**
   * Refresh user avatar after profile updates and re-emit user messages.
   * @private
   */
  async _refreshUserAvatar() {
    const revision = this.transitions.revision;
    const avatar = (await this.avatarService?.getUserAvatar?.()) || '';
    if (revision !== this.transitions.revision) return;
    this.userAvatar = avatar;
    const dlg = this.dialogManager.dialog;
    let reemitted = 0;
    if (dlg?.messages) {
      dlg.messages.forEach((m) => {
        if (m.author === 'user') m.avatar = avatar;
      });
      const shown = dlg.messages.slice(0, dlg.index);
      this.timeline.replaceMessages({ ghost: this.currentGhost, revision, messages: shown });
      reemitted = shown.filter((message) => message.author === 'user').length;
    }
    this.historyBuffer?.updateUserAvatars?.(avatar);
    this.logger?.info?.(`Refreshed user avatar to '${avatar}', re-emitted ${reemitted} messages`);
  }

  /**
   * Replay pending history if the widget has reported ready state.
   * @private
   */
  /**
   * Advance dialog input gate and cache newly progressed lines when the
   * widget has not yet reported ready state.
   * @private
   */
  _advanceGate() {
    const dlg = this.dialogManager.dialog;
    const idx = dlg?.index ?? 0;
    // Ensure upcoming message keeps its original fingerprint/id.
    const meta = this._replayedFingerprints.get(idx);
    if (meta && dlg && dlg.messages[idx]) {
      if (dlg.messages[idx].fingerprint === undefined) {
        dlg.messages[idx].fingerprint = meta.fingerprint;
      }
      if (typeof dlg.messages[idx].id !== 'number') {
        dlg.messages[idx].id = meta.id;
      }
    }
    this.inputGate?.advanceToUserTurn?.(dlg, this._replayedFingerprints);
    if ((this.dialogManager.dialog?.index ?? 0) !== idx && this._widgetReady) {
      this._refreshLastReplayedIndex();
    }
    // Returning to an already-awaited turn emits no new message. Derive the
    // command lock here as well as the visual button state, including quests
    // whose next stage was prepared while the camera remained active.
    this._updatePostLockFromDialogState();
  }

  /**
   * Start dialog progression once both the widget and orchestrator
   * are ready. Returns whether the first line was emitted.
   * @returns {boolean} true if progression occurred
   * @private
   */
  _maybeStart() {
    if (!this.waitingForWidget || !this._widgetReady) return false;
    this.waitingForWidget = false;
    const ghost = this.currentGhost;
    if (!this.initializedGhosts.has(ghost)) {
      this.dualityManager.start();
      this.initializedGhosts.add(ghost);
      this._refreshLastReplayedIndex();
      // Fallback: if the input gate is missing, manually advance through
      // ghost-authored messages so the opening line still appears.
      if (typeof this.inputGate?.advanceToUserTurn !== 'function') {
        let msg = this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
        while (msg && msg.author === 'ghost') {
          const effects = this.store.dispatch(dialogAdvance());
          if (this.engineEnabled) {
            this._runEffects(effects);
          } else {
            this.dialogManager.progress();
          }
          this._refreshLastReplayedIndex();
          msg = this.dialogManager.dialog.messages[this.dialogManager.dialog.index];
        }
      }
    }
    if (this.dialogManager.dialog?.isComplete?.() && this._hasAdvanced) {
      this.dualityManager.completeCurrentEvent();
    }
    return true;
  }

  boot() {
    if (this._handler) return;
    // Subscription for the widget readiness event is established up-front so
    // it cannot be missed before the main screen fires. The dialog progresses
    // only when this flag is set by screen/ghost handlers.
    this._readyHandler = async (evt) => {
      if (evt.type !== DIALOG_WIDGET_READY) return;
      this._widgetReady = true;
      const snapshot = this.timeline.getSnapshot();
      if (snapshot.ghost === this.currentGhost) this.timeline.replaceMessages(snapshot);
      if (this._pendingAvatarRefresh) {
        await this._refreshUserAvatar();
        this._pendingAvatarRefresh = false;
      }
      this._maybeStart();
      this._advanceGate();
      this._pendingPosts = [];
    };
    this.bus?.subscribe?.(this._readyHandler);

    this._handler = async (evt) => {
      if (evt.type === USER_PROFILE_SAVED) {
        // Mark avatar refresh pending so messages are re-emitted once the
        // dialog widget is able to observe them.
        this.awaitingAvatar = false;
        this._pendingAvatarRefresh = true;
        if (this._widgetReady) {
          await this._refreshUserAvatar();
          this._pendingAvatarRefresh = false;
        }
        return;
      }
      if (evt.type === 'APP_RESET_REQUESTED') {
        this.transitions.cancel();
        return;
      }
      if (evt.type === APP_RESET_COMPLETED) {
        this._handleAppReset();
        this.rebootCheckpointService?.reset?.();
        return;
      }
      if (evt.type === GHOST_RESET_REQUESTED) {
        await this._handleGhostReset(evt);
        return;
      }
      if (evt.type === GHOST_REBOOT_REQUESTED) {
        await this._handleGhostReboot(evt);
        return;
      }
      if (evt.type === DUALITY_STAGE_STARTED || evt.type === DUALITY_COMPLETED) {
        this._captureRebootCheckpoint(
          this.currentGhost || this.ghostService?.getCurrentGhost?.()?.name,
        );
      }
      if (evt.type === 'SCREEN_CHANGE') {
        this.waitingForWidget = false;
        if (evt.screen === 'messenger') {
          this.onMessenger = true;
          const ghost =
            this.ghostService.getRequestedGhost?.().name ||
            this.ghostService.getCurrentGhost().name;
          if (!this.started || ghost !== this.currentGhost) await this._switchGhost(ghost);
          else {
            this._replayHistory(
              this.historyService?.load?.(this.currentGhost) ||
                this.timeline.getSnapshot().messages,
            );
            this._maybeStart();
            this._advanceGate();
          }
        } else {
          this.transitions.cancel();
          this._postingTurn = null;
          this.postLocked = true;
          this._widgetReady = false;
          if (this.currentGhost) this.historyBuffer.flushTo(this.historyService, this.currentGhost);
          this.historyBuffer.reset();
          this.onMessenger = false;
        }
      }
      if (evt.type === 'GHOST_CHANGE') {
        const ghost =
          evt.payload?.name ||
          this.ghostService.getRequestedGhost?.().name ||
          this.ghostService.getCurrentGhost().name;
        await this._switchGhost(ghost);
      }
      // Unlock posting once the next user prompt is available.
      if (evt.type === EVENT_MESSAGE_READY) {
        this.historyBuffer.append({ ...(evt.message || evt), ghost: this.currentGhost });
        if (!evt.replay) {
          // `EVENT_MESSAGE_READY` indicates the dialog advanced and reveals the
          // upcoming speaker via the EventBus.
          if (this._widgetReady) {
            this._refreshLastReplayedIndex();
          }
          this._updatePostLockFromDialogState();
          this._advanceGate();
          this._updatePostLockFromDialogState();
        }
      }
      // Own the posting operation until avatar lookup/progression settles.
      // Readiness or nested message events cannot release this token early.
      if (evt.type === 'post') {
        if (this.postLocked) {
          return;
        }
        this.postLocked = true;
        const postingTurn = {
          revision: this.transitions.revision,
          dialog: this.dialogManager.dialog,
        };
        this._postingTurn = postingTurn;
        this._updatePostLockFromDialogState();
        try {
          const idx = this.dialogManager.dialog?.index;
          const upcoming = this.dialogManager.dialog?.messages?.[idx];
          if (upcoming?.author === 'user') {
            const revision = this.transitions.revision;
            const avatar = await this.avatarService?.getUserAvatar?.();
            if (
              revision !== this.transitions.revision ||
              !this.onMessenger ||
              this._postingTurn !== postingTurn ||
              this.dialogManager.dialog !== postingTurn.dialog
            )
              return;
            upcoming.avatar = avatar || '';
          }
          if (!this._widgetReady && upcoming) {
            const snapshot = { ...upcoming };
            if (snapshot.timestamp === undefined) {
              snapshot.timestamp = Date.now();
            }
            this.historyBuffer.append({ ...snapshot, ghost: this.currentGhost });
            this._pendingPosts.push(snapshot);
          }
          // Progress the user's line; subsequent ghost replies are handled
          // by the input gate to avoid duplicate advancement.
          if (typeof this.inputGate?.progressDialog === 'function') {
            this.inputGate.progressDialog();
          } else {
            const effects = this.store.dispatch(dialogAdvance());
            if (this.engineEnabled) {
              this._runEffects(effects);
            } else {
              this.dialogManager.progress();
            }
          }
          this._refreshLastReplayedIndex();
          let completed = this.dialogManager.dialog?.isComplete?.();
          if (completed && this._hasAdvanced) {
            // Starting the quest before evaluating the gate ensures the
            // camera path becomes available immediately.
            this.dualityManager.completeCurrentEvent();
          }
          if (typeof this.inputGate?.advanceToUserTurn === 'function') {
            this._advanceGate();
          } else {
            // Without an input gate, manually progress through ghost lines.
            let msg = this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
            while (msg && msg.author === 'ghost') {
              const effects = this.store.dispatch(dialogAdvance());
              if (this.engineEnabled) {
                this._runEffects(effects);
              } else {
                this.dialogManager.progress();
              }
              this._refreshLastReplayedIndex();
              msg = this.dialogManager.dialog.messages[this.dialogManager.dialog.index];
            }
          }
          if (!completed && this.dialogManager.dialog?.isComplete?.() && this._hasAdvanced) {
            this.dualityManager.completeCurrentEvent();
          }
        } finally {
          if (this._postingTurn === postingTurn) {
            this._postingTurn = null;
            this._updatePostLockFromDialogState();
          }
        }
      }
      if (evt.type === QUEST_STARTED) {
        // Highlight camera button without opening the camera view.
        this.buttonStateService?.setScreenState?.('main', 'toggle-camera', true);
        this._advanceGate();
        this._updatePostLockFromDialogState();
      }
      if (evt.type === DUALITY_STAGE_STARTED) {
        const newDialog = this.dualityManager.getCurrentDialog();
        const dlg = this.dialogManager.dialog;
        const startIdx = dlg.messages.length;
        dlg.messages.push(...newDialog.messages);
        dlg.restore(startIdx);
        if (typeof this.inputGate?.advanceToUserTurn === 'function') {
          this._advanceGate();
        } else {
          let msg = dlg.messages[dlg.index];
          while (msg && msg.author === 'ghost') {
            const effects = this.store.dispatch(dialogAdvance());
            if (this.engineEnabled) {
              this._runEffects(effects);
            } else {
              this.dialogManager.progress();
            }
            this._refreshLastReplayedIndex();
            msg = dlg.messages[dlg.index];
          }
        }
        if (dlg.isComplete?.() && this._hasAdvanced) {
          this.buttonStateService?.setState?.('post', false, 'main');
          this.dualityManager.completeCurrentEvent();
        }
        this._updatePostLockFromDialogState();
      }
      if (evt.type === DUALITY_COMPLETED) {
        const ghostName = evt.id || this.currentGhost;
        // Persist ghost completion and unlock additional ghosts.
        this.ghostSwitchService?.markCompleted?.(ghostName, this.spiritConfigs);
        // Make the ghost switcher button interactive once a duality ends.
        this.buttonStateService?.setScreenState?.('messenger', 'switch-ghost', true);
      }
    };
    this.bus?.subscribe?.(this._handler);
  }

  clearUserRuntimeContext() {
    this._handleAppReset();
  }

  dispose() {
    this.transitions.cancel();
    if (this._handler) {
      this.bus?.unsubscribe?.(this._handler);
      this._handler = null;
    }
    if (this._readyHandler) {
      this.bus?.unsubscribe?.(this._readyHandler);
      this._readyHandler = null;
    }
  }
}
