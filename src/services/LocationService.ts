/**
 * GoLife Taxi Pakistan - Location Service Adapter
 * 
 * Provides centralized geospatial logic, city geofences, and driver simulation:
 * - Operates 100% locally without requiring a paid Google Maps API Key.
 * - Accurate coordinates for major Pakistani cities (Lahore, Karachi, Islamabad, Rawalpindi, etc.).
 * - Calculates geodesic distances (Haversine formula) in kilometers.
 * - Provides realistic travel time / ETA calculations for urban Pakistan traffic.
 */

export interface CityCoordinates {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  province: string;
}

export const PAKISTAN_CITIES: Record<string, CityCoordinates> = {
  lahore: { id: 'lahore', name: 'Lahore', lat: 31.5204, lng: 74.3587, zoom: 12, province: 'Punjab' },
  karachi: { id: 'karachi', name: 'Karachi', lat: 24.8607, lng: 67.0011, zoom: 11, province: 'Sindh' },
  islamabad: { id: 'islamabad', name: 'Islamabad', lat: 33.6844, lng: 73.0479, zoom: 12, province: 'Federal' },
  rawalpindi: { id: 'rawalpindi', name: 'Rawalpindi', lat: 33.5651, lng: 73.0169, zoom: 12, province: 'Punjab' },
  faisalabad: { id: 'faisalabad', name: 'Faisalabad', lat: 31.4504, lng: 73.135, zoom: 12, province: 'Punjab' },
  multan: { id: 'multan', name: 'Multan', lat: 30.1575, lng: 71.5249, zoom: 12, province: 'Punjab' },
  peshawar: { id: 'peshawar', name: 'Peshawar', lat: 34.0151, lng: 71.5249, zoom: 12, province: 'KPK' },
  quetta: { id: 'quetta', name: 'Quetta', lat: 30.1798, lng: 66.975, zoom: 12, province: 'Balochistan' }
};

export class LocationService {
  /**
   * Get city geographic center
   */
  public static getCityCenter(cityId: string): CityCoordinates {
    const key = (cityId || '').toLowerCase().trim();
    return PAKISTAN_CITIES[key] || PAKISTAN_CITIES.lahore;
  }

  /**
   * Calculate real distance between two GPS coordinates in Kilometers
   */
  public static calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10; // 1 decimal place
  }

  /**
   * Estimate ride ETA in minutes based on distance and Pakistani urban traffic average (~25 km/h)
   */
  public static estimateEtaMinutes(distanceKm: number): number {
    const averageSpeedKmh = 24; // Average urban speed in Lahore/Karachi
    const hours = distanceKm / averageSpeedKmh;
    const minutes = Math.ceil(hours * 60) + 3; // +3 mins buffer for signals
    return Math.max(5, minutes);
  }

  /**
   * Generate realistic simulated driver coordinates within city radius
   */
  public static getSimulatedDriverPosition(
    cityId: string,
    offsetIndex: number = 0
  ): { lat: number; lng: number } {
    const center = this.getCityCenter(cityId);
    // Dispersion factor ~0.02 deg ~ 2.2 km
    const angle = (offsetIndex * 137.5 * Math.PI) / 180;
    const radius = 0.015 + (offsetIndex % 5) * 0.008;
    return {
      lat: +(center.lat + Math.cos(angle) * radius).toFixed(5),
      lng: +(center.lng + Math.sin(angle) * radius).toFixed(5)
    };
  }
}

export default LocationService;
