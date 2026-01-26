import IGeolocation from '../../ports/IGeolocation.js';

export default class GeoService extends IGeolocation {
  constructor(dbService, logger) {
    super();
    this.db = dbService;
    this.logger = logger;
  }

  async getCurrentLocation() {
    try {
      const user = await this.db.loadUser();
      const userId = user ? user.id : null;
      return await new Promise(resolve => {
        if (!navigator.geolocation) {
          this.db.saveLocation({ user_id: userId, lat: null, lng: null, mode: 'local', saved_at: new Date().toISOString() });
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            this.db.saveLocation({ ...coords, user_id: userId, mode: 'remote', saved_at: new Date().toISOString() });
            resolve(coords);
          },
          () => {
            this.db.saveLocation({ user_id: userId, lat: null, lng: null, mode: 'local', saved_at: new Date().toISOString() });
            resolve(null);
          }
        );
      });
    } catch (err) {
      this.logger?.error(err.message);
      return null;
    }
  }
}
