import NullEventBus from '../../../core/events/NullEventBus.js';
import {
    EVENT_MESSAGE_READY,
    DIALOG_CLEAR,
    CHAT_LOAD_OLDER,
    MEDIA_OPEN,
    OVERLAY_SHOW,
    REACTION_REMINDER_READY,
    REACTION_SELECTED,
    REACTION_OVERLAY_REQUESTED,
    REACTION_FINALE_STATE_UPDATED,
  REACTION_FINALE_RECALCULATE_REQUESTED
  } from '../../../core/events/constants.js';
import config from '../../../config/index.js';
import { chatDisplayModes } from '../../../config/chat.config.js';
import MessageDeduplicator from './MessageDeduplicator.js';
import TextAnimationManager from '../../components/dialog/animations/TextAnimationManager.js';

/**
 * Renders dialog messages reactively from EventBus events.
 */
export default class DialogWidget {
  constructor(
    container,
    templateService,
    languageService,
    bus = new NullEventBus(),
    mediaRepository = null,
    animationManager = null
  ) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.tpl = templateService;
    this.language = languageService;
    this.bus = bus;
    this.mediaRepository = mediaRepository;
    this._textAnimator =
      animationManager ||
      new TextAnimationManager(languageService, config.textAnimation, this.bus);
    const display = this._resolveDisplayMode(config);
    this.displayMode = display.mode;
    this.batchSize = display.batchSize;
    this._isBatchMode = display.isBatchMode;
    this.messages = [];
    this.renderCount = 0;
    /**
     * Index of the first message that has not yet been rendered.
     * Used to append only new messages without re-rendering the whole slice.
     */
    this.lastRenderedIndex = 0;
    this.scrollContainer = this.container?.parentElement || this.container;
    this._booted = false;
    /**
     * Sequence counter for messages rendered by this widget.
     * Used as fallback id for messages lacking one.
     * @private
     */
    this._msgSeq = 0;
    /**
     * Helper responsible for deduplicating messages. It stores
     * fingerprints of messages that were already rendered. If a
     * fingerprint is missing it falls back to message id to keep
     * replayed history and live events consistent.
     * @private
     */
    this._dedupe = new MessageDeduplicator();
    /**
     * Promise used to serialize renderLatest executions.
     * Ensures rendering operations do not overlap.
     * @private
     */
    this._renderLock = Promise.resolve();
    /**
     * Stores reaction reminders received before messages render.
     * @type {Map<string, boolean>}
     * @private
     */
    this._pendingReactions = new Map();
    /**
     * Stores currently selected note index per message.
     * Keyed by message fingerprint or id to persist selection across rerenders.
     * @type {Map<string, number>}
     * @private
     */
    this._noteSelections = new Map();
    this._scrollListener = () => {
      // When the user scrolls to the top, request older messages to be
      // prepended to the dialog.
      const { scrollTop } = this.scrollContainer;
      if (scrollTop <= 0) {
        this.bus.emit({ type: CHAT_LOAD_OLDER });
      }
    };
    this._handler = async evt => {
      if (evt.type === DIALOG_CLEAR) {
        this.container.innerHTML = '';
        this.messages = [];
        this.renderCount = 0;
        this.lastRenderedIndex = 0;
        this._dedupe.clear();
        this.mediaRepository?.revokeAll();
        this._textAnimator.reset();
        this._noteSelections.clear();
        return;
      }
      if (evt.type === REACTION_SELECTED) {
        this._applyReaction(evt);
        return;
      }
      if (evt.type === REACTION_REMINDER_READY) {
        this._markReactionPending(evt);
        return;
      }
      if (evt.type === REACTION_FINALE_STATE_UPDATED) {
        this._updateFinaleState(evt);
        return;
      }
      if (evt.type === EVENT_MESSAGE_READY) {
        // EVENT_MESSAGE_READY provides message fields at the top level and a
        // `message` reference; prefer the flattened data.
        const { message, type: _t, replay = false, ...rest } = evt;
        const raw = message ?? rest;
        const msg = {
          ...raw,
          timestamp: raw.timestamp || Date.now(),
          id: typeof raw.id === 'number' ? raw.id : this._msgSeq++,
          replay,
          reaction:
            typeof raw.reaction === 'string' && raw.reaction.trim().length > 0
              ? raw.reaction
              : '',
          reactionOrigin:
            typeof raw.reactionOrigin === 'string' && raw.reactionOrigin.trim() !== ''
              ? raw.reactionOrigin.trim()
              : null,
          reactionLocked: raw.reactionLocked === true,
          revisionAllowed: !!raw.revisionAllowed,
          _reactionPending: !!raw._reactionPending
        };
        const existed = !this._dedupe.register(msg);
        if (existed) {
          if (replay) {
            const idx = this.messages.findIndex(
              m =>
                (msg.fingerprint && m.fingerprint === msg.fingerprint) ||
                m.id === msg.id
            );
            if (idx !== -1) {
              this.messages[idx] = { ...this.messages[idx], ...msg };
              const node = this.container.children[idx];
              if (node) {
                const avatarHtml =
                  msg.avatar && msg.avatar.trim() !== ''
                    ? `<img class="dialog__avatar" src="${msg.avatar}" alt="avatar" />`
                    : '<div class="dialog__avatar dialog__avatar--placeholder"></div>';
                const avatarEl = node.querySelector('.dialog__avatar');
                if (avatarEl) avatarEl.outerHTML = avatarHtml;
                this._refreshReactionNode(node, this.messages[idx]);
              }
            }
          }
          return;
        }
        const reactionKey = this._getLocatorKey(msg);
        if (!msg._reactionPending && reactionKey && this._pendingReactions.has(reactionKey)) {
          msg._reactionPending = true;
          this._pendingReactions.delete(reactionKey);
        }
        this.messages.push(msg);
        this.messages.sort(
          // Maintain chronological order using order, timestamp and id as
          // successive tie‑breakers for stability.
          (a, b) =>
            (a.order ?? 0) - (b.order ?? 0) ||
            (a.timestamp ?? 0) - (b.timestamp ?? 0) ||
            (a.id ?? 0) - (b.id ?? 0)
        );
        await this.renderLatest();
        // Always scroll to the latest message after rendering new content.
        this.scrollContainer.scrollTop = 0;
      }
      if (evt.type === CHAT_LOAD_OLDER) {
        await this.renderOlder();
      }
    };
  }

  boot() {
    if (this._booted) return;
    this._booted = true;
    this.bus.subscribe(this._handler);
    this.scrollContainer.addEventListener('scroll', this._scrollListener);
  }

  dispose() {
    if (!this._booted) return;
    this.bus.unsubscribe(this._handler);
    this.scrollContainer.removeEventListener('scroll', this._scrollListener);
    this.mediaRepository?.revokeAll();
    this.lastRenderedIndex = 0;
    this._textAnimator.reset();
    this._noteSelections.clear();
    this._booted = false;
  }

  _resolveDisplayMode(cfg) {
    const mode = (cfg?.chatDisplay?.mode || '').toLowerCase();
    const rawBatchSize = cfg?.chatDisplay?.batchSize ?? cfg?.chatMessageBatchSize ?? 3;
    const parsedBatchSize = Number.isFinite(Number(rawBatchSize)) ? Number(rawBatchSize) : 3;
    const batchSize = parsedBatchSize > 0 ? parsedBatchSize : 3;
    const isBatchMode = mode === chatDisplayModes.BATCH;
    return {
      mode: isBatchMode ? chatDisplayModes.BATCH : chatDisplayModes.ALL,
      batchSize,
      isBatchMode
    };
  }

  async renderLatest() {
    this._renderLock = this._renderLock.then(() => this._renderLatest());
    return this._renderLock;
  }

  async _renderLatest() {
    this.renderCount = this._isBatchMode
      ? Math.min(this.batchSize, this.messages.length)
      : this.messages.length;
    const start = this._isBatchMode
      ? Math.max(this.lastRenderedIndex, this.messages.length - this.renderCount)
      : this.lastRenderedIndex;

    for (let i = start; i < this.messages.length; i++) {
      const msg = this.messages[i];
      const isNew = i >= this.lastRenderedIndex;

      // Log each rendering attempt for traceability via the EventBus.
      this.bus.emit({
        type: 'log',
        level: 'info',
        message: `DialogWidget.renderLatest: rendering message ${msg.id} (${isNew ? 'new' : 're-rendered'})`
      });

      if (!isNew) continue;

      const avatarUsed =
        msg.avatar && msg.avatar.trim() !== '' ? msg.avatar : 'placeholder avatar';
      this.bus.emit({
        type: 'log',
        level: 'info',
        message: `DialogWidget.renderLatest: avatar for message ${msg.id}: ${avatarUsed}`
      });

      const data = await this._toTemplateData(msg);
      const html = await this.tpl.render('widgets/dialog-message', data);
      this.container.insertAdjacentHTML('beforeend', html);
      const node = this.container.lastElementChild;
      this._initializeNoteBlock(node, msg);

      if (msg._revoke) {
        const img = this.container.lastElementChild?.querySelector('.dialog__image');
        if (img) {
          this._handleImageRevoke(img, msg);
        }
      }

      await this._animateMessage(node, msg, {
        isReplay: msg.replay === true,
        isNew
      });
    }

    if (this._isBatchMode) {
      while (this.container.children.length > this.renderCount) {
        this.container.removeChild(this.container.firstElementChild);
      }
    }

    this._attachImageListeners(this.container);
    this._attachYoutubeListeners(this.container);
    this._attachReactionListeners(this.container);
    this._attachNoteListeners(this.container);
    this._attachFinaleListeners(this.container);
    this.lastRenderedIndex = this.messages.length;
  }

  async renderOlder() {
    if (!this._isBatchMode) {
      this.renderCount = this.messages.length;
      this.lastRenderedIndex = this.messages.length;
      return;
    }

    const newCount = Math.min(this.messages.length, this.renderCount + this.batchSize);
    if (newCount === this.renderCount) return;

    const start = this.messages.length - newCount;
    const end = this.messages.length - this.renderCount;
    const older = this.messages.slice(start, end);
    const prevHeight = this.scrollContainer.scrollHeight;

    for (const msg of [...older].reverse()) {
      // Log rendering of older messages to aid debugging of prepends.
      this.bus.emit({
        type: 'log',
        level: 'info',
        message: `DialogWidget.renderOlder: rendering message ${msg.id}`
      });

      const data = await this._toTemplateData(msg);
      const html = await this.tpl.render('widgets/dialog-message', data);
      this.container.insertAdjacentHTML('afterbegin', html);
      const node = this.container.firstElementChild;
      this._initializeNoteBlock(node, msg);

      if (msg._revoke) {
        const img = this.container.firstElementChild?.querySelector('.dialog__image');
        if (img) {
          this._handleImageRevoke(img, msg);
        }
      }

      await this._animateMessage(node, msg, {
        isReplay: true,
        isNew: false
      });
    }

    this.renderCount = newCount;
    this._attachImageListeners(this.container);
    this._attachYoutubeListeners(this.container);
    this._attachReactionListeners(this.container);
    this._attachNoteListeners(this.container);
    this._attachFinaleListeners(this.container);

    const diff = this.scrollContainer.scrollHeight - prevHeight;
    // Offset scrolling so the user's viewport stays at the same message
    // after older messages are prepended.
    this.scrollContainer.scrollTop += diff;
    this.lastRenderedIndex = this.messages.length;
  }

  async _animateMessage(node, msg, context = {}) {
    if (!node || !this._textAnimator) return;
    await this._textAnimator.animateMessage(node, msg, context);
  }

  async _toTemplateData(msg) {
    const avatarBlock =
      msg.avatar && msg.avatar.trim() !== ''
        ? `<img class="dialog__avatar" src="${msg.avatar}" alt="avatar" />`
        : '<div class="dialog__avatar dialog__avatar--placeholder"></div>';

    if (msg.type === 'image') {
      const imageBlock = await this._buildImageBlock(msg);
      return {
        author: msg.author || 'user',
        messageModifiers: this._buildMessageModifiers(msg),
        avatarBlock,
        imageBlock,
        content: '',
        reactionBlock: ''
      };
    }

    if (msg.type === 'youtube') {
      return {
        author: msg.author || 'user',
        messageModifiers: this._buildMessageModifiers(msg),
        avatarBlock,
        imageBlock: this._buildYoutubeBlock(msg),
        content: this._buildContentBlock(msg),
        reactionBlock: ''
      };
    }

    return {
      ...msg,
      messageModifiers: this._buildMessageModifiers(msg),
      avatarBlock,
      imageBlock: '',
      content: this._buildContentBlock(msg),
      reactionBlock: ''
    };
  }

  async _buildImageBlock(msg) {
    let src = msg.src || '';
    if (!src && msg.media?.id && this.mediaRepository) {
      const rec = await this.mediaRepository.get(msg.media.id);
      if (rec?.fullKey || rec?.thumbKey) {
        const key = rec.fullKey || rec.thumbKey;
        const obj = await this.mediaRepository.getObjectURL(key);
        if (obj) {
          src = obj.url;
          msg._revoke = obj.revoke;
        }
      } else {
        // Warn if the expected media record is missing to aid debugging
        this.bus.emit({
          type: 'log',
          level: 'warn',
          message: `DialogWidget._toTemplateData: missing media record for id ${msg.media.id}`
        });
      }
    }

    if (!src) return '';

    const reactionBlock = this._buildReactionBlock(msg);
    const mediaAttr = msg.media?.id ? ` data-media-id="${this._escapeAttr(msg.media.id)}"` : '';
    return `
      <div class="dialog__analysis" data-js="dialog-analysis">
        <img class="dialog__image dialog__analysis-image" src="${src}" alt=""${mediaAttr} />
        ${reactionBlock}
      </div>
    `;
  }

  _buildYoutubeBlock(msg) {
    const rawId = msg.youtubeId || msg.videoId || msg.youtube?.id || '';
    const videoId = typeof rawId === 'string' ? rawId.trim() : '';
    const thumb =
      msg.youtubeThumb ||
      (videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : '');
    const alt = msg.youtubeAlt || 'YouTube thumbnail';
    if (!videoId || !thumb) return '';
    const safeId = this._escapeAttr(videoId);
    const safeThumb = this._escapeAttr(thumb);
    const safeAlt = this._escapeAttr(alt);
    return `
      <div class="dialog__youtube" data-js="dialog-youtube" data-video-id="${safeId}">
        <button class="dialog__youtube-thumb" type="button" data-js="dialog-youtube-thumb" data-video-id="${safeId}">
          <img class="dialog__youtube-image" src="${safeThumb}" alt="${safeAlt}" />
          <span class="dialog__youtube-play" aria-hidden="true">▶</span>
          <span class="sr-only">Play video</span>
        </button>
      </div>
    `;
  }

  _buildContentBlock(msg) {
    if (this._isFinaleMessage(msg)) {
      return this._buildFinaleBlock(msg);
    }
    const hasText = typeof msg.text === 'string' && msg.text.trim() !== '';
    const noteBlock = this._buildNoteBlock(msg);
    if (!hasText && !noteBlock) return '';
    const layout = this._resolveNoteLayout(msg, noteBlock !== '');
    const contentClasses = ['dialog__message-content'];
    if (layout === 'inline') contentClasses.push('dialog__message-content--inline');
    const textClasses = ['dialog__message-text'];
    if (layout === 'inline' && hasText) textClasses.push('dialog__message-text--emoji');
    const textBlock = hasText
      ? `<p class="${textClasses.join(' ')}" data-i18n="${msg.text}"></p>`
      : '';
    return `<div class="${contentClasses.join(' ')}">${textBlock}${noteBlock}</div>`;
  }

  _resolveNoteLayout(msg, hasNote = false) {
    if (!hasNote) return 'stacked';
    const layout = typeof msg.noteLayout === 'string' ? msg.noteLayout.toLowerCase() : '';
    return layout === 'inline' ? 'inline' : 'stacked';
  }

  _buildNoteBlock(msg) {
    const notes = Array.isArray(msg.notes) ? msg.notes.filter(n => typeof n === 'string' && n.trim() !== '') : [];
    if (!notes.length) return '';
    const layout = this._resolveNoteLayout(msg, true);
    const classes = ['dialog__message-note'];
    classes.push(layout === 'inline' ? 'dialog__message-note--inline' : 'dialog__message-note--stacked');
    const key = this._getLocatorKey(msg) || '';
    const safeKey = this._escapeAttr(key);
    const texts = notes
      .map(
        (noteKey, idx) =>
          `<p class="dialog__message-note-text" data-js="dialog-note-text" data-note-index="${idx}" data-i18n="${noteKey}"></p>`
      )
      .join('');
    const toggle =
      notes.length > 1
        ? `<button class="dialog__message-note-toggle" type="button" data-js="dialog-note-toggle"><span class="dialog__message-note-toggle-icon" aria-hidden="true">↻</span><span class="sr-only" data-i18n="note_next"></span></button>`
        : '';
    return `
      <div class="${classes.join(' ')}" data-js="dialog-note" data-note-count="${notes.length}" data-message-key="${safeKey}">
        <div class="dialog__message-note-body">
          ${texts}
        </div>
        ${toggle}
      </div>
    `;
  }

  _isFinaleMessage(msg) {
    if (!msg || typeof msg !== 'object') return false;
    const effects = msg.effects;
    if (!effects || typeof effects !== 'object') return false;
    if (effects.reactionFinale === true) return true;
    return typeof effects.reactionFinale === 'object';
  }

  _buildFinaleBlock(msg) {
    const key = this._getLocatorKey(msg) || '';
    const stageId = msg.stageId || '';
    const fingerprintAttr = key ? ` data-fingerprint="${this._escapeAttr(key)}"` : '';
    const stageAttr = stageId ? ` data-stage-id="${this._escapeAttr(stageId)}"` : '';
    const hasText = typeof msg.text === 'string' && msg.text.trim() !== '';
    const initialText = hasText
      ? `<p class="dialog__finale-text" data-i18n="${msg.text}"></p>`
      : '';
    return `
      <div class="dialog__finale" data-js="dialog-finale"${fingerprintAttr}${stageAttr}>
        <div class="dialog__finale-body" data-js="dialog-finale-body">
          ${initialText}
        </div>
      </div>
    `;
  }

  async _updateFinaleState(evt) {
    const target = this._findFinaleNode(evt);
    if (!target) return;
    const body = target.querySelector('[data-js="dialog-finale-body"]');
    if (!body) return;
    if (evt.status === 'complete') {
      body.dataset.state = 'complete';
      body.innerHTML = this._renderFinaleComplete(evt);
    } else {
      body.dataset.state = 'pending';
      body.innerHTML = this._renderFinalePending(evt);
    }
    this._attachFinaleListeners(body);
    if (typeof this.language?.applyLanguage === 'function') {
      try {
        await this.language.applyLanguage(body);
      } catch (err) {
        this.bus.emit({
          type: 'log',
          level: 'warn',
          message: `DialogWidget._updateFinaleState translation failed: ${err?.message || err}`
        });
      }
    }
  }

  _findFinaleNode(evt) {
    const nodes = Array.from(this.container.querySelectorAll('[data-js="dialog-finale"]'));
    if (!nodes.length) return null;
    const fingerprint = evt?.fingerprint || null;
    const stageId = evt?.stageId || null;
    return (
      nodes.find(node => {
        if (fingerprint && node.dataset.fingerprint === fingerprint) {
          return true;
        }
        if (!fingerprint && stageId && node.dataset.stageId === stageId) {
          return true;
        }
        return false;
      }) || null
    );
  }

  _renderFinalePending(evt) {
    const promptKey = evt?.promptKey || '';
    const buttonKey = evt?.buttonKey || '';
    const ghostAttr = evt?.ghostId ? ` data-ghost-id="${this._escapeAttr(evt.ghostId)}"` : '';
    const fingerprintAttr = evt?.fingerprint
      ? ` data-fingerprint="${this._escapeAttr(evt.fingerprint)}"`
      : '';
    const prompt = promptKey
      ? `<p class="dialog__finale-text" data-i18n="${promptKey}"></p>`
      : '';
    const buttonLabel = buttonKey
      ? `<span class="dialog__finale-button-label" data-i18n="${buttonKey}"></span>`
      : '';
    return `
      ${prompt}
      <button class="dialog__finale-button" type="button" data-js="dialog-finale-recalculate"${ghostAttr}${fingerprintAttr}>
        ${buttonLabel}
      </button>
    `;
  }

  _renderFinaleComplete(evt) {
    const parts = [];
    if (evt?.titleKey) {
      parts.push(`<h3 class="dialog__finale-title" data-i18n="${evt.titleKey}"></h3>`);
    }
    if (evt?.messageKey) {
      parts.push(`<p class="dialog__finale-text" data-i18n="${evt.messageKey}"></p>`);
    }
    if (evt?.imageUrl) {
      const url = this._escapeAttr(evt.imageUrl);
      parts.push(`<img class="dialog__finale-image" src="${url}" alt="" />`);
      if (evt?.imageAltKey) {
        parts.push(`<p class="dialog__finale-image-caption" data-i18n="${evt.imageAltKey}"></p>`);
      }
    }
    if (!parts.length && evt?.promptKey) {
      parts.push(`<p class="dialog__finale-text" data-i18n="${evt.promptKey}"></p>`);
    }
    return parts.join('');
  }

  _attachFinaleListeners(scope) {
    if (!scope) return;
    const buttons = scope.querySelectorAll('[data-js="dialog-finale-recalculate"]');
    buttons.forEach(btn => {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const container = btn.closest('[data-js="dialog-finale"]');
        const fingerprint = container?.dataset.fingerprint || btn.dataset.fingerprint || null;
        const stageId = container?.dataset.stageId || null;
        const ghostId = btn.dataset.ghostId || null;
        this.bus.emit({
          type: REACTION_FINALE_RECALCULATE_REQUESTED,
          ghostId,
          fingerprint,
          stageId
        });
      });
    });
  }

  _escapeAttr(value) {
    if (!value) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;');
  }

  _initializeNoteBlock(node, msg) {
    if (!node) return;
    const container = node.querySelector('[data-js="dialog-note"]');
    if (!container) return;
    const texts = Array.from(container.querySelectorAll('[data-js="dialog-note-text"]'));
    if (!texts.length) return;
    if (!container.dataset.messageKey) {
      const key = this._getLocatorKey(msg) || '';
      if (key) container.dataset.messageKey = key;
    }
    const key = container.dataset.messageKey || '';
    const saved = key && this._noteSelections.has(key) ? this._noteSelections.get(key) : 0;
    const idx = Number.isInteger(saved) && saved >= 0 && saved < texts.length ? saved : 0;
    this._applyNoteVisibility(container, idx);
    const toggle = container.querySelector('[data-js="dialog-note-toggle"]');
    if (toggle) {
      toggle.hidden = texts.length <= 1;
      if (typeof this.language?.applyLanguage === 'function') {
        this.language.applyLanguage(toggle);
      }
    }
  }

  _applyNoteVisibility(container, index) {
    const texts = Array.from(container.querySelectorAll('[data-js="dialog-note-text"]'));
    texts.forEach((el, idx) => {
      el.hidden = idx !== index;
    });
    container.dataset.activeIndex = String(index);
  }

  _attachNoteListeners(scope) {
    scope.querySelectorAll('[data-js="dialog-note-toggle"]').forEach(btn => {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const container = btn.closest('[data-js="dialog-note"]');
        if (!container) return;
        this._cycleNote(container);
      });
    });
  }

  _cycleNote(container) {
    const texts = Array.from(container.querySelectorAll('[data-js="dialog-note-text"]'));
    if (texts.length <= 1) return;
    const current = Number.parseInt(container.dataset.activeIndex || '0', 10);
    const next = Number.isNaN(current) ? 0 : (current + 1) % texts.length;
    this._applyNoteVisibility(container, next);
    const key = container.dataset.messageKey;
    if (key) {
      this._noteSelections.set(key, next);
    }
  }

  /**
   * Ensures blob URLs are revoked only after the browser has painted the image.
   * Immediate revocation can lead to blank thumbnails when images load
   * synchronously, so the cleanup is deferred to the next frame.
   * @param {HTMLImageElement} img
   * @param {Object} msg
   * @private
   */
  _handleImageRevoke(img, msg) {
    const revoke = msg._revoke;
    const schedule = cb =>
      typeof globalThis.requestAnimationFrame === 'function'
        ? globalThis.requestAnimationFrame(cb)
        : setTimeout(cb, 0);
    const onLoad = () => {
      schedule(() => {
        revoke();
        delete msg._revoke;
      });
    };
    img.addEventListener('load', onLoad, { once: true });
    if (img.complete) onLoad();
  }

  _attachImageListeners(scope) {
    scope.querySelectorAll('.dialog__image').forEach(img => {
      if (img.dataset.bound === 'true') return;
      img.dataset.bound = 'true';
      img.addEventListener('click', () => {
        const rawId = img.dataset.mediaId;
        const mediaId = Number(rawId);
        if (!Number.isNaN(mediaId) && rawId !== '') {
          this.bus.emit({ type: MEDIA_OPEN, mediaId });
          return;
        }
        const src = img.getAttribute('src');
        if (src) {
          this.bus.emit({ type: OVERLAY_SHOW, src });
          return;
        }
        this.bus.emit({
          type: 'log',
          level: 'warn',
          message: 'DialogWidget: unable to open image, missing media source'
        });
      });
    });
  }

  _attachYoutubeListeners(scope) {
    scope.querySelectorAll('[data-js="dialog-youtube-thumb"]').forEach(btn => {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const videoId = btn.dataset.videoId || btn.closest('[data-js="dialog-youtube"]')?.dataset.videoId;
        this._openYoutubeModal(videoId);
      });
    });
  }

  _openYoutubeModal(videoId) {
    if (!videoId) return;
    const iframe = document.createElement('iframe');
    iframe.className = 'dialog__youtube-frame';
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    const media = document.createElement('div');
    media.className = 'modal__media modal__media--video';
    media.appendChild(iframe);

    const viewer = document.createElement('div');
    viewer.className = 'modal__viewer modal__viewer--video';
    viewer.appendChild(media);

    this.bus.emit({ type: OVERLAY_SHOW, node: viewer });
  }

  _attachReactionListeners(scope) {
    scope.querySelectorAll('.dialog__reaction-trigger').forEach(btn => {
      if (btn.dataset.bound === 'true') return;
      if (btn.dataset.locked === 'true') return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const payload = this._getReactionPayload(btn);
        const hasReaction = btn.dataset.hasReaction === 'true';
        const revisionEnabled = btn.dataset.revisionEnabled === 'true';
        if (hasReaction && !revisionEnabled) return;
        if (hasReaction && revisionEnabled) {
          payload.revision = true;
        }
        this.bus.emit({ type: REACTION_OVERLAY_REQUESTED, ...payload });
      });
    });
  }

  _buildReactionBlock(msg) {
    const messageId = typeof msg.id === 'number' ? msg.id : '';
    const fingerprint = msg.fingerprint || '';
    const stageId = msg.stageId || '';
    const triggerClasses = ['dialog__reaction-trigger'];
    if (msg._reactionPending) triggerClasses.push('dialog__reaction-trigger--pending');
    const locked = msg.reactionLocked === true || msg.reactionOrigin === 'system';
    if (locked) triggerClasses.push('dialog__reaction-trigger--locked');
    const reaction =
      typeof msg.reaction === 'string' && msg.reaction.trim().length > 0
        ? msg.reaction
        : '';
    const hasReaction = reaction !== '';
    if (hasReaction) triggerClasses.push('dialog__reaction-trigger--filled');
    const allowRevision = msg.revisionAllowed === true;
    const revisionEnabled = allowRevision && hasReaction;
    const attrs = `data-message-id="${messageId}"${fingerprint ? ` data-fingerprint="${fingerprint}"` : ''}${stageId ? ` data-stage-id="${stageId}"` : ''}`;
    const srKey = locked ? 'reaction_locked' : hasReaction ? 'reaction_change' : 'reaction_add';
    const disabled = locked || (hasReaction && !allowRevision) ? 'disabled' : '';
    return `
      <div class="dialog__reaction" data-js="dialog-reaction" ${attrs}>
        <button class="${triggerClasses.join(' ')}" type="button" ${attrs} data-has-reaction="${hasReaction}" data-revision-enabled="${revisionEnabled}" data-allow-revision="${allowRevision}" data-locked="${locked}" ${disabled}>
          <span class="sr-only dialog__reaction-trigger-label" data-i18n="${srKey}"></span>
          <span class="dialog__reaction-trigger-icon" aria-hidden="true">${reaction || '+'}</span>
        </button>
      </div>
    `;
  }

  _buildMessageModifiers(msg) {
    const modifiers = [];
    if (msg.type === 'youtube') {
      modifiers.push('dialog__message--youtube');
    }
    if (msg.reactionLocked === true || msg.reactionOrigin === 'system') {
      modifiers.push('dialog__message--reaction-locked');
    }
    return modifiers.length ? ` ${modifiers.join(' ')}` : '';
  }

  _getReactionPayload(el) {
    const messageId = Number(el.dataset.messageId);
    return {
      messageId: Number.isNaN(messageId) ? null : messageId,
      fingerprint: el.dataset.fingerprint || null,
      stageId: el.dataset.stageId || null
    };
  }

  _getLocatorKey(input) {
    const fingerprint = input.fingerprint || null;
    if (fingerprint) return `fp:${fingerprint}`;
    const candidate =
      typeof input.messageId === 'number' && !Number.isNaN(input.messageId)
        ? input.messageId
        : typeof input.id === 'number' && !Number.isNaN(input.id)
        ? input.id
        : null;
    if (candidate !== null) {
      return `id:${candidate}`;
    }
    return null;
  }

  _findMessageIndex({ messageId, fingerprint }) {
    return this.messages.findIndex(msg => {
      if (fingerprint && msg.fingerprint) {
        return msg.fingerprint === fingerprint;
      }
      if (
        typeof messageId === 'number' &&
        !Number.isNaN(messageId) &&
        typeof msg.id === 'number'
      ) {
        return msg.id === messageId;
      }
      return false;
    });
  }

  _markReactionPending(evt) {
    const messageId =
      typeof evt.messageId === 'number' ? evt.messageId : Number(evt.messageId);
    const payload = { messageId, fingerprint: evt.fingerprint || null };
    const idx = this._findMessageIndex(payload);
    if (idx === -1) {
      const key = this._getLocatorKey(payload);
      if (key) this._pendingReactions.set(key, true);
      return;
    }
    this._setReactionPending(idx, true);
  }

  _applyReaction(evt) {
    const messageId =
      typeof evt.messageId === 'number' ? evt.messageId : Number(evt.messageId);
    const payload = { messageId, fingerprint: evt.fingerprint || null };
    const idx = this._findMessageIndex(payload);
    if (idx === -1) return;
    const reaction =
      typeof evt.emoji === 'string'
        ? evt.emoji
        : typeof evt.reaction === 'string'
        ? evt.reaction
        : '';
    this.messages[idx].reaction = reaction;
    this.messages[idx].revisionAllowed = evt.allowRevision === true;
    const origin =
      typeof evt.origin === 'string' && evt.origin.trim() !== ''
        ? evt.origin.trim()
        : this.messages[idx].reactionOrigin || null;
    const locked = evt.locked === true || origin === 'system' || this.messages[idx].reactionLocked === true;
    this.messages[idx].reactionOrigin = origin;
    this.messages[idx].reactionLocked = locked;
    this._setReactionPending(idx, false);
    const key = this._getLocatorKey({
      messageId: this.messages[idx].id,
      fingerprint: this.messages[idx].fingerprint || null
    });
    if (key) this._pendingReactions.delete(key);
  }

  _setReactionPending(index, pending) {
    if (!this.messages[index]) return;
    this.messages[index]._reactionPending = pending;
    this._updateReactionNode(index);
  }

  _updateReactionNode(index) {
    if (!this.container || !this.container.children?.length) return;
    const firstRenderedIndex = Math.max(
      0,
      this.messages.length - this.container.children.length
    );
    const domIndex = index - firstRenderedIndex;
    if (domIndex < 0 || domIndex >= this.container.children.length) return;
    const node = this.container.children[domIndex];
    if (!node) return;
    this._refreshReactionNode(node, this.messages[index]);
  }

  _refreshReactionNode(node, msg) {
    if (!node) return;
    const trigger = node.querySelector('.dialog__reaction-trigger');
    if (trigger) {
      trigger.classList.toggle(
        'dialog__reaction-trigger--pending',
        !!msg._reactionPending
      );
      const hasReaction =
        typeof msg.reaction === 'string' && msg.reaction.trim() !== '';
      const locked = msg.reactionLocked === true || msg.reactionOrigin === 'system';
      trigger.classList.toggle('dialog__reaction-trigger--filled', hasReaction);
      trigger.classList.toggle('dialog__reaction-trigger--locked', locked);
      const allowRevision = msg.revisionAllowed === true;
      const revisionEnabled = allowRevision && hasReaction;
      trigger.dataset.hasReaction = String(hasReaction);
      trigger.dataset.revisionEnabled = String(revisionEnabled);
      trigger.dataset.allowRevision = String(allowRevision);
      trigger.dataset.locked = String(locked);
      trigger.disabled = locked || (hasReaction && !allowRevision);
      const icon = trigger.querySelector('.dialog__reaction-trigger-icon');
      if (icon) {
        icon.textContent = hasReaction ? msg.reaction : '+';
      }
      const label = trigger.querySelector('.dialog__reaction-trigger-label');
      if (label) {
        const srKey = locked ? 'reaction_locked' : hasReaction ? 'reaction_change' : 'reaction_add';
        label.setAttribute('data-i18n', srKey);
        if (typeof this.language?.applyLanguage === 'function') {
          this.language.applyLanguage(trigger);
        }
      }
    }
  }
}
