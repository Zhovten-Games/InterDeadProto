import NullEventBus from '../../core/events/NullEventBus.js';
import NullLogger from '../../core/logging/NullLogger.js';
import {
  DETECTION_DONE_EVENT,
  DETECTION_SEARCH,
  DETECTION_STOPPED,
  EVENT_MESSAGE_READY,
} from '../../core/events/constants.js';

class BaseSoundInstance {
  constructor(signature, logger = null) {
    this.signature = signature;
    this.logger = logger ?? new NullLogger();
  }

  play() {}

  stop() {}
}

class UrlSoundInstance extends BaseSoundInstance {
  constructor(src, logger = null) {
    super(`url:${src}`, logger);
    this.src = src;
    this.audio = null;
  }

  play({ loop = false } = {}) {
    if (!this.src || typeof Audio === 'undefined') return;
    try {
      this.audio = new Audio(this.src);
      this.audio.loop = loop;
      this.audio.play().catch((err) => this.logger?.warn?.(err?.message || err));
    } catch (err) {
      this.logger?.warn?.(err?.message || err);
    }
  }

  stop() {
    if (!this.audio) return;
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch (err) {
      this.logger?.warn?.(err?.message || err);
    }
    this.audio = null;
  }
}

class WebAudioPulseSoundInstance extends BaseSoundInstance {
  constructor(signaturePrefix, definition = {}, contextProvider = null, logger = null) {
    super(signaturePrefix, logger);
    this.definition = definition;
    this.contextProvider = contextProvider;
    this.intervalId = null;
  }

  play({ loop = false } = {}) {
    const context = this.contextProvider?.();
    if (!context) return;
    context.resume?.().catch?.((err) => this.logger?.warn?.(err?.message || err));
    this._emitPulseSequence(context);
    if (!loop) return;
    const beatIntervalMs = 60000 / this.definition.bpm;
    this.intervalId = setInterval(() => {
      this._emitPulseSequence(context);
    }, beatIntervalMs);
  }

  _emitPulseSequence(context) {
    const now = context.currentTime;
    const { intervalPatternSeconds, frequency, volume, pulseDurationSeconds, waveform } =
      this.definition;

    intervalPatternSeconds.forEach((offset) => {
      const startAt = now + Math.max(0, offset);
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = waveform;
      osc.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(Math.max(0.0001, volume), startAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + pulseDurationSeconds);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(startAt);
      osc.stop(startAt + pulseDurationSeconds + 0.01);
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

class WebAudioHeartbeatSoundInstance extends WebAudioPulseSoundInstance {
  constructor(definition = {}, contextProvider = null, logger = null) {
    const normalized = WebAudioHeartbeatSoundInstance.normalize(definition);
    super(`generated-heartbeat:${JSON.stringify(normalized)}`, normalized, contextProvider, logger);
  }

  static normalize(definition = {}) {
    return {
      type: 'generated-heartbeat',
      bpm: Number.isFinite(definition.bpm) ? definition.bpm : 72,
      frequency: Number.isFinite(definition.frequency) ? definition.frequency : 48,
      volume: Number.isFinite(definition.volume) ? definition.volume : 0.12,
      pulseDurationSeconds: Number.isFinite(definition.pulseDurationSeconds)
        ? definition.pulseDurationSeconds
        : 0.14,
      intervalPatternSeconds:
        Array.isArray(definition.intervalPatternSeconds) && definition.intervalPatternSeconds.length
          ? definition.intervalPatternSeconds.map((value) => Number(value)).filter(Number.isFinite)
          : [0, 0.22],
      waveform: definition.waveform || 'sine',
    };
  }
}

class WebAudioBeepSoundInstance extends WebAudioPulseSoundInstance {
  constructor(definition = {}, contextProvider = null, logger = null) {
    const normalized = WebAudioBeepSoundInstance.normalize(definition);
    super(`generated-beep:${JSON.stringify(normalized)}`, normalized, contextProvider, logger);
  }

  static normalize(definition = {}) {
    return {
      type: 'generated-beep',
      bpm: Number.isFinite(definition.bpm) ? definition.bpm : 84,
      frequency: Number.isFinite(definition.frequency) ? definition.frequency : 960,
      volume: Number.isFinite(definition.volume) ? definition.volume : 0.08,
      pulseDurationSeconds: Number.isFinite(definition.pulseDurationSeconds)
        ? definition.pulseDurationSeconds
        : 0.06,
      intervalPatternSeconds:
        Array.isArray(definition.intervalPatternSeconds) && definition.intervalPatternSeconds.length
          ? definition.intervalPatternSeconds.map((value) => Number(value)).filter(Number.isFinite)
          : [0],
      waveform: definition.waveform || 'square',
    };
  }
}

/**
 * Audio orchestrator that plays configured sounds for dialog and detection flows.
 * Supports sound definitions as:
 * - URL string / URL object { type: 'url', src: '...' }
 * - Generated heartbeat object { type: 'generated-heartbeat', ... }
 * - Generated monitor beep object { type: 'generated-beep', ... }
 */
export default class SoundService {
  constructor(bus = new NullEventBus(), ghostService = null, spiritConfigs = {}, logger = null) {
    this.bus = bus;
    this.ghostService = ghostService;
    this.spiritConfigs = spiritConfigs || {};
    this.logger = logger ?? new NullLogger();
    this._handler = this._handleEvent.bind(this);
    this._loops = new Map();
    this._audioContext = null;
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
    const definition = this._resolveMessageSound(author);
    if (!definition) return;
    this._playOnce(definition);
  }

  _startDetectionSound() {
    const definition = this._resolveDetectionSound();
    if (!definition) return;
    this._startLoop('detection', definition);
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

  _playOnce(definition) {
    const instance = this._createSoundInstance(definition);
    if (!instance) return;
    instance.play({ loop: false });
  }

  _startLoop(key, definition) {
    const instance = this._createSoundInstance(definition);
    if (!instance) return;
    const current = this._loops.get(key);
    if (current?.signature === instance.signature) return;
    this._stopLoop(key);
    instance.play({ loop: true });
    this._loops.set(key, instance);
  }

  _stopLoop(key) {
    const instance = this._loops.get(key);
    if (!instance) return;
    instance.stop();
    this._loops.delete(key);
  }

  _createSoundInstance(definition) {
    if (!definition) return null;

    if (typeof definition === 'string') {
      return new UrlSoundInstance(definition, this.logger);
    }

    if (typeof definition !== 'object') return null;

    if (definition.type === 'url' && definition.src) {
      return new UrlSoundInstance(definition.src, this.logger);
    }

    if (definition.type === 'generated-heartbeat') {
      return new WebAudioHeartbeatSoundInstance(
        definition,
        () => this._getAudioContext(),
        this.logger,
      );
    }

    if (definition.type === 'generated-beep') {
      return new WebAudioBeepSoundInstance(definition, () => this._getAudioContext(), this.logger);
    }

    return null;
  }

  _getAudioContext() {
    if (this._audioContext) return this._audioContext;
    const AudioContextRef = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextRef) return null;
    this._audioContext = new AudioContextRef();
    return this._audioContext;
  }
}
