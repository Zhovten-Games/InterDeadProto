export default class LocationStatusWidget {
  constructor(container, languageManager) {
    this.container = container;
    this.languageManager = languageManager;
  }

  async showLocalMode() {
    if (!this.container) return;
    this.container.hidden = false;
    this.container.classList.add('location-display--visible');
    const key = 'detect_location_local';
    this.container.setAttribute('data-i18n', key);
    const text = await this.languageManager.translate(key, 'ui');
    this.container.textContent = text;
  }

  async showCoordinates(lat, lng) {
    if (!this.container) return;
    this.container.hidden = false;
    this.container.classList.add('location-display--visible');
    const latKey = 'geo.latitude_label';
    const lngKey = 'geo.longitude_label';
    const latLabel = await this.languageManager.translate(latKey, 'ui');
    const lngLabel = await this.languageManager.translate(lngKey, 'ui');
    this.container.textContent = `${latLabel}: ${lat.toFixed(4)}, ${lngLabel}: ${lng.toFixed(4)}`;
    this.container.setAttribute('data-i18n', '');
  }

  clear() {
    if (!this.container) return;
    this.container.hidden = true;
    this.container.classList.remove('location-display--visible');
    this.container.textContent = '';
    this.container.removeAttribute('data-i18n');
  }
}

