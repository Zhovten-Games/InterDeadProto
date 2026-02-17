import NullEventBus from '../../core/events/NullEventBus.js';
import NullLogger from '../../core/logging/NullLogger.js';
import {
  DETECTION_DONE_EVENT,
  DETECTION_SEARCH,
  DETECTION_STOPPED,
  EVENT_MESSAGE_READY
} from '../../core/events/constants.js';

/**
 * Simple audio orchestrator that plays configured sounds for dialog and detection flows.
 */
export default class SoundService {
  constructor(bus = new NullEventBus(), ghostService = null, spiritConfigs = {}, logger = null) {
    this.bus = bus;
    this.ghostService = ghostService;
    this.spiritConfigs = spiritConfigs || {};
    this.logger = logger ?? new NullLogger();
    this._handler = this._handleEvent.bind(this);
    this._loops = new Map();
  }

  boot() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this._stopLoop('detection');
  }

  _handleEvent(evt) {
    if (!evt) return;
    if (evt.type === EVENT_MESSAGE_READY && !evt.replay) {
      const author = evt.author || evt.message?.author;
      this._playMessageSound(author);
    }
    if (evt.type === DETECTION_SEARCH) {
      this._startDetectionSound();
    }
    if (
      evt.type === DETECTION_DONE_EVENT ||
      evt.type === DETECTION_STOPPED ||
      evt.type === 'CAMERA_VIEW_CLOSED'
    ) {
      this._stopLoop('detection');
    }
  }

  _playMessageSound(author) {
    const src = this._resolveMessageSound(author);
    if (!src) return;
    this._playOnce(src);
  }

  _startDetectionSound() {
    const src = this._resolveDetectionSound();
    if (!src) return;
    this._startLoop('detection', src);
  }

  _resolveMessageSound(author) {
    if (!author) return null;
    const ghost = this.ghostService?.getCurrentGhost?.()?.name;
    if (!ghost) return null;
    const sounds = this._getSoundsForGhost(ghost);
    const messageSounds = sounds.message || {};
    if (author === 'ghost') {
      return sounds.ghostMessage || messageSounds.ghost || null;
    }
    if (author === 'user') {
      return sounds.userMessage || messageSounds.user || null;
    }
    return null;
  }

  _resolveDetectionSound() {
    const ghost = this.ghostService?.getCurrentGhost?.()?.name;
    if (!ghost) return null;
    const sounds = this._getSoundsForGhost(ghost);
    return sounds.detection || null;
  }

  _getSoundsForGhost(name) {
    return this.spiritConfigs?.[name]?.sounds || {};
  }

  _playOnce(src) {
    if (!src || typeof Audio === 'undefined') return;
    try {
      const audio = new Audio(src);
      audio.play().catch(err => this.logger?.warn?.(err?.message || err));
    } catch (err) {
      this.logger?.warn?.(err?.message || err);
    }
  }

  _startLoop(key, src) {
    if (!src || typeof Audio === 'undefined') return;
    const current = this._loops.get(key);
    if (current?.source === src) return;
    this._stopLoop(key);
    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.play().catch(err => this.logger?.warn?.(err?.message || err));
      this._loops.set(key, { audio, source: src });
    } catch (err) {
      this.logger?.warn?.(err?.message || err);
    }
  }

  _stopLoop(key) {
    const entry = this._loops.get(key);
    const audio = entry?.audio || entry;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (err) {
      this.logger?.warn?.(err?.message || err);
    }
    this._loops.delete(key);
  }
}
