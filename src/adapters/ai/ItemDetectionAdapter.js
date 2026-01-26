import IItemDetection from '../../ports/IItemDetection.js';

export default class ItemDetectionService extends IItemDetection {
  constructor(logger) {
    super();
    this.logger = logger;
  }

  async detectItems(blob) {
    this.logger.info('ItemDetectionService: detectItems called');
    // TODO: integrate AI model
    return [];
  }
}
