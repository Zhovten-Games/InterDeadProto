import NullEventBus from '../../core/events/NullEventBus.js';
import { MEDIA_OPEN } from '../../core/events/constants.js';

export default class MediaLightbox {
  constructor(mediaRepository, modalService, bus = new NullEventBus()) {
    this.mediaRepository = mediaRepository;
    this.modalService = modalService;
    this.bus = bus;
    this._handler = async evt => {
      if (evt.type === MEDIA_OPEN) {
        await this._open(evt.mediaId);
      }
    };
  }

  boot() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this.mediaRepository?.revokeAll();
  }

  async _open(mediaId) {
    if (!this.mediaRepository || !this.modalService || !mediaId) return;
    try {
      const rec = await this.mediaRepository.get(mediaId);
      if (!rec?.fullKey) return;
      const obj = await this.mediaRepository.getObjectURL(rec.fullKey);
      if (!obj?.url) return;
      this.modalService.showFromDataURL(obj.url, obj.revoke);
    } catch (err) {
      this.bus.emit?.({
        type: 'log',
        level: 'warn',
        message: `MediaLightbox: failed to open media ${mediaId}: ${err?.message || err}`
      });
    }
  }
}
