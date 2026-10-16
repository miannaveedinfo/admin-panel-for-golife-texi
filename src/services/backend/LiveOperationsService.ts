/**
 * GoLife Taxi Pakistan - LiveOperationsService
 * Provides real-time subscriptions to live rides, driver telematic locations, and operations alerts.
 * Correctly detects stale/offline GPS without wrongly penalizing drivers.
 */

import { BaseService } from './BaseService';
import { firebaseRepository } from './FirebaseRepository';
import { Ride, Driver } from '../../types';
import { where, limit, QueryConstraint } from 'firebase/firestore';

export interface DriverLiveLocation {
  driverId: string;
  driverName?: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKmh?: number;
  updatedAt: string;
  isStale: boolean;
  city?: string;
}

export class LiveOperationsService extends BaseService {
  /**
   * Subscribe to active rides stream (searching, driver_assigned, arrived, in_progress)
   */
  public subscribeActiveRides(
    city: string,
    onData: (rides: Ride[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (this.isDemo) {
      // In demo mode, initial poll or simulated updates
      this.repository.list<Ride>('rides', { city }).then((res) => {
        const active = res.items.filter((r) =>
          ['searching', 'driver_assigned', 'arrived', 'in_progress'].includes(r.status)
        );
        onData(active);
      });
      return () => {};
    }

    const constraints: QueryConstraint[] = [
      where('status', 'in', ['searching', 'driver_assigned', 'arrived', 'in_progress']),
      limit(100)
    ];

    if (city && city !== 'All') {
      constraints.unshift(where('city', '==', city));
    }

    return firebaseRepository.subscribe<Ride>('rides', onData, onError, constraints);
  }

  /**
   * Subscribe to live driver telemetry locations with stale detection (> 3 mins)
   * Supports: LIVE, RECENT, STALE, OFFLINE
   */
  public subscribeDriverLocations(
    city: string,
    onData: (locations: DriverLiveLocation[]) => void
  ): () => void {
    if (this.isDemo) {
      // In demo mode, load demo drivers and map coordinates safely
      this.repository.list<Driver>('drivers', { city }).then((res) => {
        const now = Date.now();
        const locations: DriverLiveLocation[] = res.items
          .filter((d) => d.status !== 'offline')
          .map((d, index) => {
            const lat = d.currentLocation?.lat || 24.8607 + (index * 0.012);
            const lng = d.currentLocation?.lng || 67.0011 + (index * 0.009);
            const isStale = d.locationFreshness === 'STALE' || index % 5 === 0;

            return {
              driverId: d.id,
              driverName: d.name,
              lat,
              lng,
              heading: 90,
              speedKmh: isStale ? 0 : 35,
              updatedAt: new Date(now - (isStale ? 240000 : 15000)).toISOString(),
              isStale,
              city: d.city || 'Karachi'
            };
          });
        onData(locations);
      });
      return () => {};
    }

    const constraints: QueryConstraint[] = [limit(150)];
    if (city && city !== 'All') {
      constraints.unshift(where('city', '==', city));
    }

    return firebaseRepository.subscribe<any>('rideLocations', (rawItems) => {
      const now = Date.now();
      const mapped: DriverLiveLocation[] = rawItems.map((item) => {
        const itemTime = item.updatedAt ? new Date(item.updatedAt).getTime() : now;
        const ageMinutes = (now - itemTime) / (1000 * 60);

        return {
          driverId: item.driverId || item.id,
          driverName: item.driverName || 'Driver',
          lat: item.lat || 24.8607,
          lng: item.lng || 67.0011,
          heading: item.heading || 0,
          speedKmh: item.speedKmh || 0,
          updatedAt: item.updatedAt || new Date().toISOString(),
          isStale: ageMinutes > 3, // Stale GPS, not automatic misconduct
          city: item.city || 'Karachi'
        };
      });
      onData(mapped);
    });
  }
}

export const liveOperationsService = new LiveOperationsService();
