import IItemDetection from '../ports/item-detection-port.js';

export default class ItemDetectionAdapter extends IItemDetection {
  constructor(logger) {
    super();
    this.logger = logger;
  }

  async detectItems(blob) {
    this.logger.info('ItemDetectionAdapter: detectItems called');
    // TODO: integrate AI model
    return [];
  }
}
