import { MEDIA_OPEN } from '../../core/events/constants.js';

export default class MediaLightbox {
  constructor(mediaRepository, modalService, bus = new NullEventBus()) {
    this.mediaRepository = mediaRepository;
    this.modalService = modalService;
    this.bus = bus;
    this._handler = async evt => {
      if (evt.type === MEDIA_OPEN) {
        await this._open(evt.mediaId, evt.src);
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

  async _open(mediaId, srcFallback) {
    if (!this.modalService) return;

    let opened = false;

    if (this.mediaRepository && mediaId) {
      try {
        const rec = await this.mediaRepository.get(mediaId);
        if (rec?.fullKey) {
          const obj = await this.mediaRepository.getObjectURL(rec.fullKey);
          if (obj?.url) {
            this.modalService.showFromDataURL(obj.url, obj.revoke);
            opened = true;
          }
        }
      } catch (err) {
        this.bus.emit?.({
          type: 'log',
          level: 'warn',
          message: `MediaLightbox: failed to open media ${mediaId}: ${err?.message || err}`
        });
      }
    }

    if (!opened && typeof srcFallback === 'string' && srcFallback.trim() !== '') {
      this.modalService.showFromDataURL(srcFallback);
    }
  }
}
