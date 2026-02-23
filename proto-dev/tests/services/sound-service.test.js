import test from 'node:test';
import assert from 'node:assert/strict';

import SoundService from '../../src/application/services/SoundService.js';
import { DETECTION_SEARCH, EVENT_MESSAGE_READY } from '../../src/core/events/constants.js';

class FakeBus {
  constructor() {
    this.handler = null;
  }

  subscribe(handler) {
    this.handler = handler;
  }

  unsubscribe(handler) {
    if (this.handler === handler) this.handler = null;
  }

  emit(event) {
    this.handler?.(event);
  }
}

class FakeAudio {
  static created = [];

  constructor(src) {
    this.src = src;
    this.loop = false;
    this.currentTime = 0;
    this.paused = false;
    FakeAudio.created.push(this);
  }

  play() {
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
}

const createFakeAudioContext = () => {
  const calls = [];
  class FakeAudioContext {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
    }

    resume() {
      return Promise.resolve();
    }

    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: (value, at) => calls.push(['frequency', value, at]) },
        connect: () => {},
        start: (at) => calls.push(['start', at]),
        stop: (at) => calls.push(['stop', at]),
      };
    }

    createGain() {
      return {
        gain: {
          setValueAtTime: (value, at) => calls.push(['gain-set', value, at]),
          exponentialRampToValueAtTime: (value, at) => calls.push(['gain-ramp', value, at]),
        },
        connect: () => {},
      };
    }
  }

  return { FakeAudioContext, calls };
};

test('SoundService keeps URL playback compatibility', () => {
  const bus = new FakeBus();
  const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
  const service = new SoundService(
    bus,
    ghostService,
    {
      guide: {
        sounds: {
          message: {
            ghost: 'https://example.com/sound.ogg',
          },
        },
      },
    },
    { warn: () => {} },
  );

  const originalAudio = globalThis.Audio;
  globalThis.Audio = FakeAudio;
  FakeAudio.created = [];

  service.boot();
  bus.emit({ type: EVENT_MESSAGE_READY, author: 'ghost' });

  assert.equal(FakeAudio.created.length, 1);
  assert.equal(FakeAudio.created[0].src, 'https://example.com/sound.ogg');

  globalThis.Audio = originalAudio;
});

test('SoundService can generate monitor beep loop via Web Audio API', async () => {
  const bus = new FakeBus();
  const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
  const service = new SoundService(
    bus,
    ghostService,
    {
      guide: {
        sounds: {
          detection: {
            type: 'generated-beep',
            bpm: 66,
            frequency: 860,
            intervalPatternSeconds: [0, 0.2],
          },
        },
      },
    },
    { warn: () => {} },
  );

  const { FakeAudioContext, calls } = createFakeAudioContext();
  const originalAudioContext = globalThis.AudioContext;
  globalThis.AudioContext = FakeAudioContext;

  service.boot();
  bus.emit({ type: DETECTION_SEARCH });

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.ok(calls.some((call) => call[0] === 'start'));

  service.dispose();
  globalThis.AudioContext = originalAudioContext;
});
