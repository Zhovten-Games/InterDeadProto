const DEFAULT_PRIORITY = Object.freeze({
  app_already_open: 300,
  loading: 200,
  ai_loading: 100,
});

const VALID_MODES = new Set(['single', 'tabs', 'stack']);

export const OVERLAY_STAGE = Object.freeze({
  PRE_BOOT: 'pre_boot',
  BOOT_DONE: 'boot_done',
  AI_WARMUP: 'ai_warmup',
  READY: 'ready',
  BLOCKED: 'blocked',
});

const STAGE_ORDER = Object.freeze({
  [OVERLAY_STAGE.PRE_BOOT]: 0,
  [OVERLAY_STAGE.BOOT_DONE]: 1,
  [OVERLAY_STAGE.AI_WARMUP]: 2,
  [OVERLAY_STAGE.READY]: 3,
  [OVERLAY_STAGE.BLOCKED]: 4,
});

const TRANSIENT_ENTRY_DEFAULTS = Object.freeze({
  loading: 30_000,
});

const DEFAULT_TRANSITION_POLICY = Object.freeze({
  byEvent: {
    OVERLAY_SHOW: (service, event) => {
      if (event?.i18nKey === 'app_already_open') {
        service.setStage(OVERLAY_STAGE.BLOCKED, { reason: 'app_already_open' });
        service.updateEntry('app_already_open', { visible: true });
        return;
      }

      if (event?.i18nKey === 'loading') {
        service.setStage(OVERLAY_STAGE.PRE_BOOT, { force: true, reason: 'loading_overlay' });
        service.updateEntry('loading', { visible: true });
      }
    },
    OVERLAY_HIDE: (service) => {
      service.setStage(OVERLAY_STAGE.BOOT_DONE, { reason: 'boot_overlay_hidden' });
    },
    AI_STATE_CHANGED: (service, event) => {
      if (event?.state === 'READY') {
        service.setStage(OVERLAY_STAGE.READY, { reason: 'ai_ready' });
        return;
      }
      service.setStage(OVERLAY_STAGE.AI_WARMUP, { reason: `ai_${String(event?.state || 'unknown').toLowerCase()}` });
    },
  },
  byStage: {
    [OVERLAY_STAGE.PRE_BOOT]: {
      show: ['loading'],
      hide: ['ai_loading'],
    },
    [OVERLAY_STAGE.BOOT_DONE]: {
      hide: ['loading'],
    },
    [OVERLAY_STAGE.AI_WARMUP]: {
      hide: ['loading'],
      show: ['ai_loading'],
    },
    [OVERLAY_STAGE.READY]: {
      hide: ['loading', 'ai_loading'],
    },
    [OVERLAY_STAGE.BLOCKED]: {
      show: ['app_already_open'],
      hide: ['loading', 'ai_loading'],
    },
  },
  blockers: new Set(['app_already_open']),
});

/**
 * Keeps overlay state in a UI-agnostic form.
 * Producers publish domain entries, while presentation consumes derived render state.
 */
export default class OverlayOrchestratorService {
  constructor({ mode = 'single', transitionPolicy = DEFAULT_TRANSITION_POLICY, debounceMs = 0 } = {}) {
    this.mode = VALID_MODES.has(mode) ? mode : 'single';
    this.transitionPolicy = transitionPolicy;
    this.entries = new Map();
    this.listeners = new Set();
    this.activeCardId = null;
    this.stage = OVERLAY_STAGE.PRE_BOOT;
    this.lastTransitionAt = 0;
    this.lastTransitionSource = null;
    this.entryUpdateTimers = new Map();
    this.debounceMs = Number.isFinite(debounceMs) && debounceMs > 0 ? debounceMs : 0;
  }

  registerEntry(id, entry = {}) {
    this._upsertEntry(id, entry, false);
  }

  updateEntry(id, patch = {}) {
    this._upsertEntry(id, patch, true);
  }

  removeEntry(id) {
    if (!id || !this.entries.has(id)) return;
    this.entries.delete(id);
    if (this.activeCardId === id) this.activeCardId = null;
    this._touchTransition(`removeEntry:${id}`);
    this._emit();
  }

  setMode(mode) {
    if (!VALID_MODES.has(mode) || mode === this.mode) return;
    this.mode = mode;
    this._touchTransition(`setMode:${mode}`);
    this._emit();
  }

  setActiveCard(id) {
    if (this.activeCardId === id) return;
    this.activeCardId = id;
    this._touchTransition(`setActiveCard:${id}`);
    this._emit();
  }

  setStage(nextStage, { force = false, reason = 'manual' } = {}) {
    if (!STAGE_ORDER[nextStage] && nextStage !== OVERLAY_STAGE.PRE_BOOT) return false;

    const previous = this.stage;
    if (!force && previous === nextStage) return false;
    if (!force && STAGE_ORDER[nextStage] < STAGE_ORDER[previous]) return false;

    this.stage = nextStage;
    this._touchTransition(`stage:${reason}`);
    this._applyStagePolicy(nextStage);
    return true;
  }

  applyEventTransition(event = {}) {
    const resolver = this.transitionPolicy?.byEvent?.[event.type];
    if (typeof resolver !== 'function') return false;
    const prevStage = this.stage;
    resolver(this, event);
    this._touchTransition(`event:${event.type}`);
    this._emit();
    return prevStage !== this.stage;
  }

  reset({ clearEntries = false } = {}) {
    this.stage = OVERLAY_STAGE.PRE_BOOT;
    this.lastTransitionSource = 'reset';
    this.lastTransitionAt = Date.now();

    if (clearEntries) {
      this.entries.clear();
      this.activeCardId = null;
    } else {
      this.entries.forEach((entry, id) => {
        const isBlocker = this.transitionPolicy?.blockers?.has(id);
        this.entries.set(id, this._normalizeEntry(id, { ...entry, visible: isBlocker ? entry.visible : false }));
      });
    }

    this._emit();
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.listeners.add(listener);
    listener(this.getRenderState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getRenderState() {
    const now = Date.now();
    const visibleCards = [...this.entries.values()]
      .filter((entry) => this._isEntryVisible(entry, now))
      .sort((left, right) => right.priority - left.priority);

    const mode = this.mode;
    const cards = this._resolveCardsByMode(mode, visibleCards);
    const activeCardId = this._resolveActiveCardId(mode, cards);

    return {
      mode,
      stage: this.stage,
      visible: cards.length > 0,
      cards,
      activeCardId,
      availableModes: [...VALID_MODES],
      diagnostics: {
        lastTransitionAt: this.lastTransitionAt,
        lastTransitionSource: this.lastTransitionSource,
      },
    };
  }

  _isEntryVisible(entry, now) {
    if (entry.visible === false) return false;

    const isBlocker = this.transitionPolicy?.blockers?.has(entry.id);
    if (!isBlocker && Number.isFinite(entry.ttlMs) && entry.ttlMs > 0) {
      const age = now - (entry.lastUpdatedAt || 0);
      if (age > entry.ttlMs) return false;
    }
    return true;
  }

  _applyStagePolicy(stage) {
    const policy = this.transitionPolicy?.byStage?.[stage];
    if (!policy) return;

    const updates = [];
    (policy.hide || []).forEach((id) => {
      if (!this.entries.has(id)) return;
      updates.push({ id, patch: { visible: false } });
    });

    (policy.show || []).forEach((id) => {
      if (!this.entries.has(id)) return;
      updates.push({ id, patch: { visible: true } });
    });

    updates.forEach(({ id, patch }) => this._upsertEntry(id, patch, true, true));
  }

  _resolveCardsByMode(mode, visibleCards) {
    if (mode === 'single') {
      return visibleCards.length > 0 ? [visibleCards[0]] : [];
    }
    return visibleCards;
  }

  _resolveActiveCardId(mode, cards) {
    if (cards.length === 0) return null;
    if (mode === 'single') return cards[0].id;
    const hasActive = cards.some((card) => card.id === this.activeCardId);
    if (hasActive) return this.activeCardId;
    this.activeCardId = cards[0].id;
    return this.activeCardId;
  }

  _upsertEntry(id, payload, patchMode, skipEmit = false) {
    if (!id) return;
    const current = this.entries.get(id) || this._normalizeEntry(id, {});
    const nextRaw = patchMode ? { ...current, ...payload } : payload;
    const next = this._normalizeEntry(id, nextRaw);

    if (this._isNoopEntryUpdate(current, next)) return;

    const apply = () => {
      this.entries.set(id, next);
      this._touchTransition(`entry:${id}`);
      if (!skipEmit) this._emit();
    };

    if (this.debounceMs > 0) {
      clearTimeout(this.entryUpdateTimers.get(id));
      const timer = setTimeout(() => {
        this.entryUpdateTimers.delete(id);
        apply();
      }, this.debounceMs);
      this.entryUpdateTimers.set(id, timer);
      return;
    }

    apply();
  }

  _isNoopEntryUpdate(previous, next) {
    if (!previous) return false;
    const prevComparable = { ...previous };
    const nextComparable = { ...next };
    delete prevComparable.lastUpdatedAt;
    delete nextComparable.lastUpdatedAt;
    return JSON.stringify(prevComparable) === JSON.stringify(nextComparable);
  }

  _normalizeEntry(id, entry) {
    const now = Date.now();
    return {
      id,
      titleKey: entry.titleKey || null,
      contactKey: entry.contactKey || null,
      contactText: entry.contactText || '',
      statusKey: entry.statusKey || null,
      statusText: entry.statusText || '',
      warningKey: entry.warningKey || null,
      warningText: entry.warningText || '',
      actions: Array.isArray(entry.actions) ? entry.actions : [],
      visible: entry.visible !== false,
      priority: Number.isFinite(entry.priority) ? entry.priority : DEFAULT_PRIORITY[id] || 0,
      ttlMs: Number.isFinite(entry.ttlMs)
        ? entry.ttlMs
        : Number.isFinite(entry?.meta?.ttlMs)
          ? entry.meta.ttlMs
          : TRANSIENT_ENTRY_DEFAULTS[id] || null,
      meta: entry.meta || {},
      lastUpdatedAt: now,
    };
  }

  _touchTransition(source) {
    this.lastTransitionAt = Date.now();
    this.lastTransitionSource = source;
  }

  _emit() {
    const nextState = this.getRenderState();
    this.listeners.forEach((listener) => listener(nextState));
  }
}
