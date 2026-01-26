import ICamera from '../../ports/ICamera.js';

export default class CameraService extends ICamera {
  constructor(logger) {
    super();
    this.logger = logger;
    this._stream = null;
    this._videoEl = null;
    this._streamStart = null;
    this._metadataHandler = null;
  }

  async _initStream(container) {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.logger?.error('Camera API not available');
      throw new Error('Camera not available');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    let video = this._videoEl;
    if (!video) {
      video = document.createElement('video');
      video.className = 'camera__stream';
      video.autoplay = true;
      video.playsInline = true;
      if (container) container.appendChild(video);
      this._videoEl = video;
    } else if (container && !container.contains(video)) {
      container.appendChild(video);
    }
    video.srcObject = stream;
    await new Promise(resolve => {
      this._metadataHandler = () => {
        video.play();
        video.removeEventListener('loadedmetadata', this._metadataHandler);
        this._metadataHandler = null;
        resolve();
      };
      video.addEventListener('loadedmetadata', this._metadataHandler);
    });
    this._stream = stream;
    this._toggleIndicator(true);
    this._toggleRetry(false);
  }

  _stopTracks() {
    this._stream?.getTracks().forEach(t => t.stop());
  }

  _getContainer() {
    return (
      this._videoEl?.parentElement?.parentElement || this._videoEl?.parentElement
    );
  }

  _toggleIndicator(show) {
    const indicator = this._getContainer()?.querySelector(
      '[data-js="record-indicator"]'
    );
    if (indicator) indicator.hidden = !show;
  }

  _toggleRetry(show) {
    const retry = this._getContainer()?.querySelector(
      '[data-js="retry-detection"]'
    );
    if (retry) {
      // Use BEM modifier to control visibility
      if (show) retry.classList.remove('retry-detection--hidden');
      else retry.classList.add('retry-detection--hidden');
    }
  }

  /**
   * Capture a single frame from the active video stream without
   * stopping or pausing it. Stream lifecycle is handled by callers.
   */
  async takeSelfie() {
    try {
      let video = this._videoEl;
      let stream = this._stream;

      if (!video || !stream) {
        await this._initStream();
        video = this._videoEl;
        stream = this._stream;
      } else if (video.readyState < 2) {
        await new Promise(r => video.addEventListener('loadeddata', r, { once: true }));
      }

      // Capture current frame into a Blob while keeping the stream alive.
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'));

      // Stream lifecycle is managed externally. Returning blob leaves stream untouched.
      return blob;
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }

  async startStream(container) {
    try {
      await this._initStream(container);
      this._streamStart = Date.now();
      this.logger?.info?.('Camera stream started');
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }

  stopStream() {
    try {
      if (this._videoEl && this._metadataHandler) {
        this._videoEl.removeEventListener('loadedmetadata', this._metadataHandler);
        this._metadataHandler = null;
      }
      const lifetime = this._streamStart ? Date.now() - this._streamStart : 0;
      this._toggleIndicator(false);
      this._toggleRetry(false);
      this._stopTracks();
      this._stream = null;
      this._videoEl?.remove();
      this._videoEl = null;
      this._streamStart = null;
      this.logger?.info?.(`Camera stream stopped after ${lifetime}ms`);
    } catch (err) {
      this.logger?.error(err.message);
    }
  }

  pauseStream() {
    try {
      this._videoEl?.pause();
      this._stopTracks();
      this._toggleIndicator(false);
      this._toggleRetry(true);
    } catch (err) {
      this.logger?.error(err?.message || err);
    }
  }

  async resumeStream(container) {
    try {
      const needsRestart =
        !this._stream ||
        this._stream.getTracks().every(t => t.readyState === 'ended');
      if (needsRestart) {
        await this._initStream(
          container ||
            this._videoEl?.parentElement ||
            this._videoEl?.parentElement?.parentElement
        );
      } else {
        this._videoEl?.play();
        this._toggleIndicator(true);
        this._toggleRetry(false);
      }
    } catch (err) {
      this.logger?.error(err?.message || err);
    }
  }
}
