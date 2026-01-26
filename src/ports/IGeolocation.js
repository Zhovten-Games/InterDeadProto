/**
 * Contract for obtaining geolocation coordinates.
 */
export default class IGeolocation {
  /**
   * Resolve the current location if permissions allow.
   * @returns {Promise<{lat:number,lng:number}|null>}
   */
  async getCurrentLocation() {
    throw new Error('Method getCurrentLocation must be implemented by geolocation adapters.');
  }
}
