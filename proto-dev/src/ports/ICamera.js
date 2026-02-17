/**
 * Contract for camera hardware orchestration.
 */
export default class ICamera {
  /**
   * Start the live video stream.
   * @param {HTMLElement} [container] Optional container receiving the video element.
   * @returns {Promise<void>}
   */
  async startStream(container) {
    throw new Error('Method startStream must be implemented by camera adapters.');
  }

  /**
   * Stop the active stream and release resources.
   */
  stopStream() {
    throw new Error('Method stopStream must be implemented by camera adapters.');
  }

  /**
   * Temporarily pause the stream while preserving the video element.
   */
  pauseStream() {
    throw new Error('Method pauseStream must be implemented by camera adapters.');
  }

  /**
   * Resume a paused stream or reinitialise it if required.
   * @param {HTMLElement} [container]
   * @returns {Promise<void>}
   */
  async resumeStream(container) {
    throw new Error('Method resumeStream must be implemented by camera adapters.');
  }

  /**
   * Capture the current frame as a Blob.
   * @returns {Promise<Blob>}
   */
  async takeSelfie() {
    throw new Error('Method takeSelfie must be implemented by camera adapters.');
  }
}
