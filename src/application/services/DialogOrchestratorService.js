import NullLogger from '../../core/logging/NullLogger.js';
import NullEventBus from '../../core/events/NullEventBus.js';
import DialogHistoryBuffer from './DialogHistoryBuffer.js';
import coreStore from '../../core/engine/store.js';
import { dialogAdvance } from '../../core/engine/actions.js';
import { DIALOG_PROGRESS, HISTORY_SAVE } from '../../core/engine/effects.js';
import { ENGINE_V1_ENABLED } from '../../config/flags.js';
import messageFingerprint from '../../utils/messageFingerprint.js';
import {
  DIALOG_WIDGET_READY,
  EVENT_MESSAGE_READY,
  DIALOG_CLEAR,
  QUEST_STARTED,
  DUALITY_COMPLETED,
  DUALITY_STAGE_STARTED,
  USER_PROFILE_SAVED
} from '../../core/events/constants.js';

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
    engineEnabled = ENGINE_V1_ENABLED
  ) {
    this.dualityManager = dualityManager;
    this.dialogManager = dialogManager;
    this.ghostService = ghostService;
    this.buttonStateService = buttonStateService;
    this.buttonVisibilityService = buttonVisibilityService;
    this.historyService = historyService;
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
    // Prevents handling multiple `post` events for a single user prompt.
    // Cleared when the EventBus emits `EVENT_MESSAGE_READY` for the next
    // user-facing message, unlocking the button.
    this.postLocked = false;
    // Captures user posts made before the dialog widget reports readiness so
    // they can be replayed once the UI becomes available.
    this._pendingPosts = [];
    this.logger = logger ?? new NullLogger();
    this.store = store;
    this.userAvatar = '';
    this.awaitingAvatar = false;
    // Tracks whether a profile update occurred while the dialog widget was
    // unavailable so avatars can be refreshed once it becomes ready.
    this._pendingAvatarRefresh = false;
    this.engineEnabled = engineEnabled;
    this.effectHandlers = {
      [DIALOG_PROGRESS]: () => this.dialogManager.progress(),
      [HISTORY_SAVE]: () => {
        const ghost = this.currentGhost;
        if (!ghost) return;
        const dlg = this.dialogManager.dialog;
        const msgs = dlg?.messages?.slice(0, dlg.index) || [];
        this.historyService?.appendUnique?.(ghost, msgs);
      }
    };
  }

  _runEffects(effects = []) {
    effects.forEach(effect => {
      const handler = this.effectHandlers[effect.type];
      if (handler) handler(effect.payload);
    });
  }

  async _loadConfig(name) {
    const mod = await import(
      new URL(`../../config/spirits/${name}.js`, import.meta.url)
    );
    return mod.default;
  }

  async _prepareConfig(ghost, cfg) {
    const userAvatar = await this.avatarService?.getUserAvatar?.();
    this.awaitingAvatar = !userAvatar;
    const enrichedStages = (cfg.stages || []).map((stage, stageIdx) => {
      const stageIdentifier = stage.id || stage.event?.id || stage.quest?.id || `stage-${stageIdx}`;
      return {
        ...stage,
        event: {
          ...stage.event,
          messages: (stage.event?.messages || []).map((m, msgIdx) => ({
            ...m,
            stageId: m.stageId || stageIdentifier,
            avatar: m.avatar || (m.author === 'ghost' ? cfg.avatar : userAvatar || ''),
            // Compute unified content fingerprint for compatibility with history service.
            fingerprint: messageFingerprint({
              ghost,
              author: m.author,
              text: m.text || '',
              type: m.type || '',
              src: m.src || (m.media && (m.media.id || m.media.src)) || '',
              fingerprint: m.fingerprint
            })
          }))
        }
      };
    });
    return { cfg: { ...cfg, stages: enrichedStages }, userAvatar };
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
        const base = Date.now() - historyRaw.length;
        const seen = new Set();
        const result = [];
        historyRaw.forEach((m, idx) => {
          const media = m.media || (m.media_id ? { id: m.media_id } : undefined);
          const fingerprint = messageFingerprint({ ...m, media, ghost });
          const key = m.fingerprint ?? m.id ?? fingerprint;
          if (key !== undefined && seen.has(key)) return;
          if (key !== undefined) seen.add(key);
          const normalized = {
            ...m,
            ...(media ? { media } : {}),
            timestamp: m.timestamp ?? base + idx,
            id: typeof m.id === 'number' ? m.id : idx,
            order: typeof m.order === 'number' ? m.order : idx + 1,
            fingerprint
          };
          delete normalized.media_id;
          result.push(normalized);
        });
        return result;
    }

  /**
   * Clear the dialog widget and replay stored messages.
   * The dialog widget may be recreated whenever the user leaves the messenger
   * screen (e.g. by opening the camera). Replaying ensures that the restored
   * widget renders the existing conversation each time it is shown.
  * @param {Array<object>} history normalized history messages
  * @private
  */
  _replayHistory(history) {
    const ghost = this.currentGhost;
    const seen = new Set();
    const toEmit = [];
    this._replayedFingerprints.clear();
      history.forEach((m, idx) => {
        // Ensure media object persists for fingerprinting and replay.
        const media = m.media || (m.media_id ? { id: m.media_id } : undefined);
        if (media) {
          m.media = media;
          delete m.media_id;
        }
        // Compute fingerprint up-front so later field mutations do not alter it.
        if (m.fingerprint === undefined) {
          m.fingerprint = messageFingerprint({ ...m, ghost });
        }
        if (typeof m.id !== 'number') {
          m.id = idx;
        }
      this._replayedFingerprints.set(idx, {
        id: m.id,
        fingerprint: m.fingerprint
      });
      const key = m.fingerprint ?? m.id;
      if (key !== undefined && seen.has(key)) return;
      if (key !== undefined) seen.add(key);
      if (this.historyService?.has?.(ghost, m)) return;
      toEmit.push(m);
    });
    if (!toEmit.length) {
      this.bus.emit({ type: DIALOG_CLEAR });
      return;
    }
    this.bus.emit({ type: DIALOG_CLEAR });
    toEmit.forEach(m => {
      const { type: _mType, ...restM } = m;
      // Replay events carry the `replay` flag so listeners can ignore
      // them when calculating live history or analytics.
      this.bus.emit({ type: EVENT_MESSAGE_READY, replay: true, ...restM, message: m });
      this.historyService?.markSeen?.(ghost, m);
    });
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
   * Refresh user avatar after profile updates and re-emit user messages.
   * @private
   */
  async _refreshUserAvatar() {
    const avatar = (await this.avatarService?.getUserAvatar?.()) || '';
    this.userAvatar = avatar;
    const dlg = this.dialogManager.dialog;
    let reemitted = 0;
    if (dlg?.messages) {
      dlg.messages.forEach(m => {
        if (m.author === 'user') m.avatar = avatar;
      });
      const shown = dlg.messages.slice(0, dlg.index);
      shown.forEach(m => {
        if (m.author === 'user') {
          this.bus.emit({
            type: EVENT_MESSAGE_READY,
            replay: true,
            ...m,
            message: m
          });
          reemitted++;
        }
      });
    }
    this.historyBuffer?.updateUserAvatars?.(avatar);
    this.logger?.info?.(
      `Refreshed user avatar to '${avatar}', re-emitted ${reemitted} messages`
    );
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
    // Subscription for the widget readiness event is established up-front so
    // it cannot be missed before the main screen fires. The dialog progresses
    // only when this flag is set by screen/ghost handlers.
    this._readyHandler = async evt => {
      if (evt.type === DIALOG_WIDGET_READY) {
        this._widgetReady = true;
        let hadHistory = false;
        if (this.dialogManager.dialog) {
          const ghost = this.ghostService.getCurrentGhost().name;
          const persisted = this._normalizeHistory(
            this.historyService.load(ghost) || [],
            ghost
          );
          const delta = this.historyBuffer.merge(persisted);
          const fullHistory = [...persisted, ...delta];
          hadHistory = fullHistory.length > 0;
          if (hadHistory) {
            const dlg = this.dialogManager.dialog;
            const remaining = dlg.messages.slice(persisted.length);
            dlg.messages = [...fullHistory, ...remaining];
            dlg.restore(fullHistory.length);
            this._replayHistory(fullHistory);
            this._syncLastReplayedIndex();
          }
          this.historyBuffer.clear();
        }
        if (this._pendingAvatarRefresh) {
          await this._refreshUserAvatar();
          this._pendingAvatarRefresh = false;
        }
        this._maybeStart();
        const upcoming = this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
        if (hadHistory && upcoming?.author === 'user') {
          this._advanceGate();
        }
        if (!hadHistory) {
          this._advanceGate();
        }
        if (this._pendingPosts.length) {
          // Replay buffered posts so the UI receives the messages.
          this._replayHistory(this._pendingPosts);
          // Previously posted user messages are now replayed; unlock posting.
          this.postLocked = false;
          this._pendingPosts = [];
        }
      }
    };
    this.bus?.subscribe?.(this._readyHandler);

    this._handler = async evt => {
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
      if (evt.type === 'SCREEN_CHANGE') {
        this.waitingForWidget = false;
        if (evt.screen === 'messenger') {
          const ghostName = this.ghostService.getCurrentGhost().name;
          this.historyService?.clearSeen?.(ghostName);
          const persistedRaw = this.historyService?.load?.(ghostName) || [];
          let history = this._normalizeHistory(persistedRaw, ghostName);
          if (!this.started) {
            const loaded = await this._loadConfig(ghostName);
            const { cfg, userAvatar } = await this._prepareConfig(
              ghostName,
              loaded
            );
            this.userAvatar = userAvatar;
            this.dualityManager.load(cfg);
            this.dialogManager.dialog = this.dualityManager.getCurrentDialog();
            if (!this.dialogManager.dialog) {
            // Log configuration errors if a dialog is missing for the current ghost.
            this.logger.error(`Missing dialog for ghost "${ghostName}"`);
              return;
            }
            this.buttonVisibilityService?.setScreenVisibility?.('camera', 'capture-btn', false);
            history = history.map(m => ({
              ...m,
              avatar: m.avatar || (m.author === 'ghost' ? cfg.avatar : userAvatar || '')
            }));
            const dlg = this.dialogManager.dialog;
            const remaining = dlg.messages.slice(history.length);
            dlg.messages = [...history, ...remaining];
            dlg.restore(history.length);
            this.started = true;
            this.currentGhost = ghostName;
          } else {
            this.dialogManager.dialog?.restore?.(history.length);
          }
          const upcoming =
            this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
          if (this._widgetReady) {
            const delta = this.historyBuffer.merge(history);
            const fullHistory = [...history, ...delta];
            const dlg = this.dialogManager.dialog;
            const remaining = dlg.messages.slice(history.length);
            dlg.messages = [...fullHistory, ...remaining];
            dlg.restore(fullHistory.length);
            this._replayHistory(fullHistory);
            this._syncLastReplayedIndex();
            this.historyBuffer.clear();
            this._maybeStart();
            if (fullHistory.length === 0) {
              this._advanceGate();
            }
          } else {
            this.waitingForWidget =
              history.length === 0 && upcoming?.author === 'ghost';
          }

          this.onMessenger = true;
        } else if (this.onMessenger) {
          this._widgetReady = false;
          this.historyBuffer.flushTo(this.historyService, this.currentGhost);
          this.historyBuffer.reset();
          this.onMessenger = false;
        }
      }
      if (evt.type === 'GHOST_CHANGE' && this.started) {
        this.waitingForWidget = false;
        // Reset posting lock so the Post button works for the new ghost.
        this.postLocked = false;
        const newGhost = this.ghostService.getCurrentGhost().name;
        const previous = this.currentGhost;
        // Ignore duplicate events for the currently active ghost
        if (newGhost === previous) {
          return;
        }
        this.currentGhost = newGhost;
        const prevHistory =
          this.dialogManager.dialog?.messages?.slice(0, this.dialogManager.dialog?.index) || [];
        this.historyBuffer.flushTo(this.historyService, previous);
        this.historyBuffer.reset();
        this.historyService?.save?.(previous, prevHistory);
        const loaded = await this._loadConfig(newGhost);
        const { cfg, userAvatar } = await this._prepareConfig(newGhost, loaded);
        this.userAvatar = userAvatar;
        this.dualityManager.load(cfg);
        this.dialogManager.dialog = this.dualityManager.getCurrentDialog();
        if (!this.dialogManager.dialog) {
          // Log configuration errors if the new ghost has no dialog.
          this.logger.error(`Missing dialog for ghost "${newGhost}"`);
          return;
        }
        // Reset capture button for the new ghost until its quest starts
        this.buttonVisibilityService?.setScreenVisibility?.('camera', 'capture-btn', false);
        const historyRaw = this.historyService?.load?.(newGhost) || [];
        const history = this._normalizeHistory(historyRaw, newGhost).map(m => ({
          ...m,
          avatar: m.avatar || (m.author === 'ghost' ? cfg.avatar : userAvatar || '')
        }));
        const dlg = this.dialogManager.dialog;
        const remaining = dlg.messages.slice(history.length);
        dlg.messages = [...history, ...remaining];
        dlg.restore(history.length);
        // Rebuild dialog widget when switching ghosts
        this._replayHistory(history);
        this._syncLastReplayedIndex();
        const upcoming =
          this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
        // Stage one repeated on ghost change
        this.waitingForWidget =
          history.length === 0 && upcoming?.author === 'ghost';
        this._maybeStart();
        // Always re-evaluate input gate so button states reflect
        // the newly selected ghost's dialog, even when history exists.
        this._advanceGate();
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
          const upcoming =
            this.dialogManager.dialog?.messages?.[this.dialogManager.dialog.index];
          const needsReply = upcoming && upcoming.author === 'user';
          if (needsReply) {
            this.postLocked = false;
            this._advanceGate();
          }
        }
      }
      // Guard against rapid fire `post` events by ignoring additional clicks
      // until the lock is released by the next message-ready event.
      if (evt.type === 'post') {
        if (this.postLocked) {
          return;
        }
        this.postLocked = true;
        const idx = this.dialogManager.dialog?.index;
        const upcoming = this.dialogManager.dialog?.messages?.[idx];
        if (upcoming?.author === 'user') {
          const avatar = await this.avatarService?.getUserAvatar?.();
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
      }
      if (evt.type === QUEST_STARTED) {
        // Highlight camera button without opening the camera view.
        this.buttonStateService?.setScreenState?.('main', 'toggle-camera', true);
        this._advanceGate();
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
      }
      if (evt.type === DUALITY_COMPLETED) {
        const ghostName = evt.id || this.currentGhost;
        // Persist ghost completion and unlock additional ghosts.
        this.ghostSwitchService?.markCompleted?.(
          ghostName,
          this.spiritConfigs
        );
        // Make the ghost switcher button interactive once a duality ends.
        this.buttonStateService?.setScreenState?.(
          'messenger',
          'switch-ghost',
          true
        );
      }
    };
    this.bus?.subscribe?.(this._handler);
  }

  dispose() {
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
