import ICamera from '../ports/camera-port.js';

const abortError = () => new DOMException('Camera session closed', 'AbortError');
const stopTracks = (stream) => stream?.getTracks().forEach((track) => track.stop());

/** Owns browser resources only; application orchestration owns session purpose. */
export default class CameraAdapter extends ICamera {
  constructor(logger, { navigatorRef = null, documentRef = null, timeoutMs = 10000 } = {}) {
    super();
    this.logger = logger;
    this.navigatorRef = navigatorRef;
    this.documentRef = documentRef;
    this.timeoutMs = timeoutMs;
    this._generation = 0;
    this._session = null;
    this._stream = null;
    this._videoEl = null;
    this._streamStart = null;
    this.state = 'idle';
  }

  getSession() {
    return this._session?.id ?? null;
  }
  getState() {
    return this.state;
  }
  _current(session) {
    return this._session === session && !session.abort.signal.aborted;
  }

  _wait(session, operation, timeoutMs = this.timeoutMs) {
    return new Promise((resolve, reject) => {
      let timer;
      const signal = session.abort.signal;
      const finish = (fn, value) => {
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
        fn(value);
      };
      const cancel = () => finish(reject, abortError());
      if (signal.aborted) {
        reject(abortError());
        return;
      }
      signal.addEventListener('abort', cancel, { once: true });
      if (timeoutMs)
        timer = setTimeout(() => finish(reject, new Error('Camera frame/play timeout')), timeoutMs);
      Promise.resolve(operation).then(
        (value) => finish(resolve, value),
        (error) => finish(reject, error),
      );
    });
  }

  _waitForVideo(session, name, readyState) {
    const video = session.video;
    if (video.readyState >= readyState) return Promise.resolve();
    let loaded, failed;
    const waiting = new Promise((resolve, reject) => {
      loaded = resolve;
      failed = () => reject(new Error('Camera video unavailable'));
      video.addEventListener(name, loaded, { once: true });
      video.addEventListener('error', failed, { once: true });
    });
    return this._wait(session, waiting).finally(() => {
      video.removeEventListener(name, loaded);
      video.removeEventListener('error', failed);
    });
  }

  startStream(container) {
    if (this._session && ['opening', 'active'].includes(this.state)) {
      const session = this._session;
      if (container && session.video && !container.contains(session.video))
        container.appendChild(session.video);
      return session.open;
    }
    this.stopStream();
    const session = {
      id: ++this._generation,
      abort: new AbortController(),
      stream: null,
      video: null,
      container,
    };
    this._session = session;
    this.state = 'opening';
    session.open = this._open(session).catch((error) => {
      if (this._current(session)) {
        this.stopStream();
        this.state = 'error';
      }
      if (error.name !== 'AbortError') this.logger?.error?.(error.message);
      throw error;
    });
    return session.open;
  }

  async _open(session) {
    const navigatorRef = this.navigatorRef || globalThis.navigator;
    if (!navigatorRef?.mediaDevices?.getUserMedia) throw new Error('Camera API not available');
    const acquired = navigatorRef.mediaDevices.getUserMedia({ video: true, audio: false });
    // Own a returned stream immediately, even before metadata/play can complete.
    Promise.resolve(acquired).then(
      (stream) => {
        if (!this._current(session)) stopTracks(stream);
        else {
          session.stream = stream;
          this._stream = stream;
        }
      },
      () => {},
    );
    const stream = await this._wait(session, acquired, 0);
    if (!this._current(session)) {
      stopTracks(stream);
      throw abortError();
    }
    const documentRef = this.documentRef || globalThis.document;
    const video = documentRef.createElement('video');
    video.className = 'camera__stream';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    session.video = video;
    this._videoEl = video;
    session.container?.appendChild(video);
    video.srcObject = stream;
    await this._waitForVideo(session, 'loadedmetadata', 1);
    if (!this._current(session)) throw abortError();
    await this._wait(session, video.play());
    if (!this._current(session)) throw abortError();
    this._streamStart = Date.now();
    this.state = 'active';
    this._toggleIndicator(true);
    this._toggleRetry(false);
    return session.id;
  }

  async takeSelfie() {
    if (!this._session) await this.startStream();
    const session = this._session;
    if (!session) throw abortError();
    await session.open;
    if (!this._current(session)) throw abortError();
    await this._waitForVideo(session, 'loadeddata', 2);
    if (!this._current(session)) throw abortError();
    const canvas = (this.documentRef || globalThis.document).createElement('canvas');
    canvas.width = session.video.videoWidth;
    canvas.height = session.video.videoHeight;
    if (!canvas.width || !canvas.height) throw new Error('Camera has no frames');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Camera canvas unavailable');
    context.drawImage(session.video, 0, 0);
    const blob = await this._wait(
      session,
      new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg')),
    );
    if (!this._current(session)) throw abortError();
    if (!blob) throw new Error('Camera frame capture failed');
    return blob;
  }

  stopStream() {
    const session = this._session;
    if (!session) {
      this.state = 'idle';
      return;
    }
    this._session = null;
    this._generation += 1;
    session.abort.abort();
    this._toggleIndicator(false);
    this._toggleRetry(false);
    stopTracks(session.stream);
    if (session.video) {
      session.video.srcObject = null;
      session.video.remove();
    }
    this._stream = null;
    this._videoEl = null;
    this._streamStart = null;
    this.state = 'idle';
  }
  pauseStream() {
    const container = this._session?.container;
    this.stopStream();
    this._pausedContainer = container;
  }
  resumeStream(container) {
    return this.startStream(container || this._pausedContainer);
  }
  dispose() {
    this.stopStream();
  }
  _getContainer() {
    return this._videoEl?.parentElement?.parentElement || this._videoEl?.parentElement;
  }
  _toggleIndicator(show) {
    const indicator = this._getContainer()?.querySelector('[data-js="record-indicator"]');
    if (indicator) indicator.hidden = !show;
  }
  _toggleRetry(show) {
    const retry = this._getContainer()?.querySelector('[data-js="retry-detection"]');
    retry?.classList.toggle('retry-detection--hidden', !show);
  }
}
