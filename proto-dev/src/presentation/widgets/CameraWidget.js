export default class CameraWidget {
  /**
   * @param {HTMLElement} container Root element for the widget.
   */
  constructor(container) {
    this.container = container;
  }

  /**
   * Render camera markup inside the container.
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div data-js="selfie-content-container">
        <div data-js="selfie-content">
          <div data-js="camera-view"></div>
          <div data-js="detection-threshold" class="detection-threshold">
            <label class="detection-threshold__label" for="detection-threshold-slider">
              Sensitivity
            </label>
            <input
              id="detection-threshold-slider"
              data-js="detection-threshold-slider"
              class="detection-threshold__slider"
              type="range"
              min="0.1"
              max="0.95"
              step="0.05"
              value="0.5"
            >
            <span data-js="detection-threshold-value" class="detection-threshold__value">0.50</span>
          </div>
          <div data-js="record-indicator" class="record-indicator" hidden></div>
          <div data-js="detection-status" class="detection-status is-hidden"></div>
          <button data-js="retry-detection" class="retry-detection retry-detection--hidden">▶</button>
          <img data-js="selfie-preview" class="selfie-preview" hidden>
          <img data-js="selfie-thumbnail" class="selfie-thumbnail" hidden>
        </div>
      </div>`;
  }
}
