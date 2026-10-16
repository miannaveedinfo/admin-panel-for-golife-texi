/**
 * GoLife Taxi Pakistan - Central Maps, GPS, Live Location & Route Operations Engine
 * 
 * Phase 58: Central Maps, GPS, Live Location & Route Operations
 * 
 * Authoritative single engine for:
 * - Driver live telemetry & GPS quality assessment (FRESH / DELAYED / STALE / POOR_ACCURACY)
 * - Active ride tracking & route progress with Pakistani road waypoint interpolation
 * - Location history with capped retention buffer (prevents memory bloat)
 * - Pickup monitoring with fair exception logic (no punitive fines for network/GPS issues)
 * - City boundary definitions & service zones (Lahore, Karachi, Islamabad, etc.)
 * - Location events audit log (Firebase-ready, 100% Demo Mode compatible)
 * - Privacy fencing (stops passenger tracking on ride completion)
 */

import {
  Driver,
  Ride,
  Passenger,
  LocationFreshness,
  GpsQualityStatus,
  LocationHistoryPoint,
  RouteProgressSnapshot,
  PickupMonitoringRecord,
  LocationEventType,
  LocationEventRecord,
  CityMapBoundary,
  FairLateExclusionReason
} from '../../types';
import { demoRepository } from './DemoRepository';
import { firebaseRepository } from './FirebaseRepository';
import { isProductionDataSource } from '../../config/dataSourceMode';
import { IRepository } from './types';

// ============================================================================
// PAKISTAN MAJOR CITIES GEOGRAPHIC BOUNDARIES & LANDMARKS
// ============================================================================

export const PAKISTAN_CITY_BOUNDARIES: Record<string, CityMapBoundary> = {
  Lahore: {
    city: 'Lahore',
    center: { lat: 31.5204, lng: 74.3587 },
    zoom: 12,
    serviceRadiusKm: 32,
    landmarks: [
      { name: 'Liberty Chowk (Gulberg)', lat: 31.5117, lng: 74.3436, x: 48, y: 46 },
      { name: 'Packages Mall (Walton)', lat: 31.4721, lng: 74.3541, x: 30, y: 68 },
      { name: 'DHA Phase 5 Commercial', lat: 31.4642, lng: 74.4021, x: 74, y: 72 },
      { name: 'Mall Road / Anarkali', lat: 31.5657, lng: 74.3168, x: 38, y: 26 },
      { name: 'Ring Road Interchange', lat: 31.5812, lng: 74.4215, x: 82, y: 36 }
    ]
  },
  Karachi: {
    city: 'Karachi',
    center: { lat: 24.8607, lng: 67.0011 },
    zoom: 12,
    serviceRadiusKm: 45,
    landmarks: [
      { name: 'Dolmen Mall Clifton', lat: 24.8152, lng: 67.0315, x: 24, y: 74 },
      { name: 'Shahrah-e-Faisal / FTC', lat: 24.8569, lng: 67.0546, x: 62, y: 44 },
      { name: 'I.I. Chundrigar Rd', lat: 24.8532, lng: 67.0041, x: 32, y: 38 },
      { name: 'Gulshan Chowrangi', lat: 24.9287, lng: 67.0911, x: 78, y: 28 }
    ]
  },
  Islamabad: {
    city: 'Islamabad',
    center: { lat: 33.6844, lng: 73.0479 },
    zoom: 12,
    serviceRadiusKm: 28,
    landmarks: [
      { name: 'Blue Area / Beverly', lat: 33.7121, lng: 73.0642, x: 50, y: 42 },
      { name: 'F-7 Markaz Jinnah Super', lat: 33.7215, lng: 73.0561, x: 36, y: 32 },
      { name: 'Faisal Mosque Vista', lat: 33.7297, lng: 73.0372, x: 25, y: 22 },
      { name: 'Zero Point Interchange', lat: 33.6932, lng: 73.0654, x: 64, y: 62 }
    ]
  },
  Rawalpindi: {
    city: 'Rawalpindi',
    center: { lat: 33.5984, lng: 73.0441 },
    zoom: 12,
    serviceRadiusKm: 25,
    landmarks: [
      { name: 'Saddar Metro Station', lat: 33.5991, lng: 73.0532, x: 42, y: 52 },
      { name: 'Murree Road Commercial', lat: 33.6214, lng: 73.0721, x: 58, y: 44 },
      { name: 'Bahria Town Phase 7', lat: 33.5214, lng: 73.1124, x: 76, y: 78 }
    ]
  },
  Peshawar: {
    city: 'Peshawar',
    center: { lat: 34.0151, lng: 71.5249 },
    zoom: 12,
    serviceRadiusKm: 24,
    landmarks: [
      { name: 'Hayatabad Phase 4', lat: 33.9852, lng: 71.4362, x: 28, y: 58 },
      { name: 'Saddar Cantt Road', lat: 34.0041, lng: 71.5421, x: 64, y: 40 },
      { name: 'University Road', lat: 33.9984, lng: 71.4921, x: 44, y: 48 }
    ]
  },
  Faisalabad: {
    city: 'Faisalabad',
    center: { lat: 31.4504, lng: 73.1350 },
    zoom: 12,
    serviceRadiusKm: 26,
    landmarks: [
      { name: 'Clock Tower (Ghanta Ghar)', lat: 31.4187, lng: 73.0791, x: 50, y: 50 },
      { name: 'D-Ground Commercial', lat: 31.4112, lng: 73.1042, x: 62, y: 58 },
      { name: 'Kohinoor City', lat: 31.4285, lng: 73.1192, x: 72, y: 42 }
    ]
  },
  Multan: {
    city: 'Multan',
    center: { lat: 30.1575, lng: 71.5249 },
    zoom: 12,
    serviceRadiusKm: 25,
    landmarks: [
      { name: 'Ghanta Ghar Multan', lat: 30.1984, lng: 71.4721, x: 46, y: 48 },
      { name: 'Bosan Road Commercial', lat: 30.2241, lng: 71.4582, x: 38, y: 32 },
      { name: 'Cantt Commercial Area', lat: 30.1852, lng: 71.4421, x: 34, y: 64 }
    ]
  }
};

// ============================================================================
// CENTRAL LOCATION SERVICE
// ============================================================================

export class CentralLocationService {
  private repository: IRepository;

  // Capped in-memory history ring buffers (prevents memory leak, max 50 points each)
  private driverHistoryBuffer: Map<string, LocationHistoryPoint[]> = new Map();
  private rideHistoryBuffer: Map<string, LocationHistoryPoint[]> = new Map();

  // Active route snapshots
  private activeRoutes: Map<string, RouteProgressSnapshot> = new Map();

  // Pickup monitoring store
  private pickupMonitors: Map<string, PickupMonitoringRecord> = new Map();

  // Subscribed map listeners
  private listeners: Set<() => void> = new Set();

  constructor(repository: IRepository = demoRepository) {
    this.repository = repository;
  }

  private get repo(): IRepository {
    return isProductionDataSource() ? firebaseRepository : this.repository;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Error in location listener:', e);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 1. GPS QUALITY ASSESSMENT (ITEM 6)
  // --------------------------------------------------------------------------

  /**
   * Detects GPS quality without treating technical failures as driver misconduct
   */
  public evaluateGpsQuality(params: {
    lat?: number;
    lng?: number;
    accuracyMeters?: number;
    lastUpdated?: string;
  }): { quality: GpsQualityStatus; warning?: string; isOperationalIssue: boolean } {
    if (!params.lat || !params.lng || (params.lat === 0 && params.lng === 0)) {
      return {
        quality: 'MISSING',
        warning: 'GPS signal lost: Device is not returning valid coordinates.',
        isOperationalIssue: true
      };
    }

    const accuracy = params.accuracyMeters ?? 8;
    if (accuracy > 50) {
      return {
        quality: 'POOR_ACCURACY',
        warning: `Weak GPS signal (accuracy ±${Math.round(accuracy)}m). Driver positioning may fluctuate.`,
        isOperationalIssue: true
      };
    }

    const ageMs = params.lastUpdated ? Date.now() - new Date(params.lastUpdated).getTime() : 0;
    const ageSeconds = Math.max(0, Math.floor(ageMs / 1000));

    if (ageSeconds > 60) {
      return {
        quality: 'STALE',
        warning: `Telemetry telemetry delayed by ${ageSeconds}s. Cellular network or battery saver may be throttling updates.`,
        isOperationalIssue: true
      };
    }

    if (ageSeconds >= 15) {
      return {
        quality: 'DELAYED',
        warning: `Minor GPS delay (${ageSeconds}s).`,
        isOperationalIssue: false
      };
    }

    return {
      quality: 'FRESH',
      isOperationalIssue: false
    };
  }

  /**
   * Translates age into standard LocationFreshness
   */
  public getFreshnessFromTimestamp(timestamp?: string, isOnline: boolean = true): LocationFreshness {
    if (!isOnline || !timestamp) return 'OFFLINE';
    const ageMs = Date.now() - new Date(timestamp).getTime();
    if (ageMs < 15 * 1000) return 'LIVE';
    if (ageMs < 60 * 1000) return 'RECENT';
    if (ageMs < 5 * 60 * 1000) return 'STALE';
    return 'OFFLINE';
  }

  // --------------------------------------------------------------------------
  // 2. LOCATION HISTORY RETENTION (ITEM 5)
  // --------------------------------------------------------------------------

  /**
   * Records a coordinate point into the capped ring-buffer (max 50 points per driver / ride)
   */
  public recordLocationPoint(point: Omit<LocationHistoryPoint, 'id'>): LocationHistoryPoint {
    const fullPoint: LocationHistoryPoint = {
      id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...point
    };

    // Driver buffer
    if (point.driverId) {
      const existing = this.driverHistoryBuffer.get(point.driverId) || [];
      const updated = [...existing, fullPoint].slice(-50); // Keep last 50 points
      this.driverHistoryBuffer.set(point.driverId, updated);
    }

    // Ride buffer
    if (point.rideId) {
      const existing = this.rideHistoryBuffer.get(point.rideId) || [];
      const updated = [...existing, fullPoint].slice(-60); // Keep last 60 points
      this.rideHistoryBuffer.set(point.rideId, updated);
    }

    return fullPoint;
  }

  public getDriverLocationHistory(driverId: string): LocationHistoryPoint[] {
    return this.driverHistoryBuffer.get(driverId) || [];
  }

  public getRideLocationHistory(rideId: string): LocationHistoryPoint[] {
    return this.rideHistoryBuffer.get(rideId) || [];
  }

  // --------------------------------------------------------------------------
  // 3. ROUTE & ETA ARCHITECTURE (ITEM 8)
  // --------------------------------------------------------------------------

  /**
   * Calculates realistic intermediate Pakistani road waypoints between two coordinates
   */
  public generateRouteWaypoints(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    numWaypoints: number = 8
  ): Array<{ lat: number; lng: number }> {
    const points: Array<{ lat: number; lng: number }> = [{ ...start }];

    // Pseudo-random deterministic curve based on coordinates
    const deltaLat = end.lat - start.lat;
    const deltaLng = end.lng - start.lng;
    const midCurveFactor = ((Math.abs(start.lat * 1000) % 7) - 3) * 0.0015;

    for (let i = 1; i < numWaypoints; i++) {
      const fraction = i / numWaypoints;
      // Introduce subtle natural road curve (sine curve offset)
      const curveOffset = Math.sin(fraction * Math.PI) * midCurveFactor;

      points.push({
        lat: start.lat + deltaLat * fraction + curveOffset,
        lng: start.lng + deltaLng * fraction + curveOffset * 0.8
      });
    }

    points.push({ ...end });
    return points;
  }

  /**
   * Calculates Haversine great-circle distance in kilometers
   */
  public calculateDistanceKm(
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  /**
   * Calculates realistic ETA based on average urban Pakistani speeds (28 km/h)
   */
  public calculateEstimatedEtaMinutes(distanceKm: number, averageSpeedKmh: number = 28): number {
    if (distanceKm <= 0.2) return 1;
    const rawHours = distanceKm / averageSpeedKmh;
    const minutes = Math.ceil(rawHours * 60);
    return Math.max(1, minutes);
  }

  /**
   * Updates or initiates a live route tracking snapshot
   */
  public updateRideRouteProgress(params: {
    ride: Ride;
    driverLocation: { lat: number; lng: number };
  }): RouteProgressSnapshot {
    const { ride, driverLocation } = params;
    const pickup = {
      lat: ride.pickup?.lat || 31.5204,
      lng: ride.pickup?.lng || 74.3587,
      address: ride.pickup?.address || 'Pickup Location'
    };
    const destination = {
      lat: ride.destination?.lat || 31.4721,
      lng: ride.destination?.lng || 74.3541,
      address: ride.destination?.address || 'Destination'
    };

    const isEnRouteToPickup = ride.status === 'driver_assigned' || ride.status === 'driver_en_route';
    const isEnRouteToDest = ride.status === 'in_progress' || ride.status === 'ride_started';

    const target = isEnRouteToPickup ? pickup : destination;
    const remainingKm = this.calculateDistanceKm(driverLocation, target);
    const totalDist = ride.distanceKm || this.calculateDistanceKm(pickup, destination);
    const etaMin = this.calculateEstimatedEtaMinutes(remainingKm);

    let progressPercent = 0;
    if (isEnRouteToPickup) {
      progressPercent = Math.min(95, Math.max(10, Math.round((1 - remainingKm / 5) * 100)));
    } else if (isEnRouteToDest) {
      progressPercent = Math.min(99, Math.max(5, Math.round((1 - remainingKm / totalDist) * 100)));
    } else if (ride.status === 'completed' || ride.status === 'destination_reached') {
      progressPercent = 100;
    }

    const waypoints = this.generateRouteWaypoints(driverLocation, target);

    const snapshot: RouteProgressSnapshot = {
      rideId: ride.id,
      driverId: ride.driverId || 'DRV-101',
      pickup,
      destination,
      currentLocation: driverLocation,
      waypoints,
      distanceRemainingKm: remainingKm,
      totalDistanceKm: totalDist,
      etaMinutes: etaMin,
      progressPercent,
      phase: isEnRouteToPickup ? 'to_pickup' : isEnRouteToDest ? 'to_destination' : 'completed',
      updatedAt: new Date().toISOString()
    };

    this.activeRoutes.set(ride.id, snapshot);
    return snapshot;
  }

  public getRideRouteSnapshot(rideId: string): RouteProgressSnapshot | null {
    return this.activeRoutes.get(rideId) || null;
  }

  // --------------------------------------------------------------------------
  // 4. PICKUP MONITORING & FAIR EXCEPTION ENGINE (ITEM 7)
  // --------------------------------------------------------------------------

  /**
   * Tracks expected vs actual arrival with fair exception exemptions
   */
  public registerPickupDispatch(ride: Ride, expectedMinutes: number = 8): PickupMonitoringRecord {
    const now = new Date();
    const expectedTime = new Date(now.getTime() + expectedMinutes * 60 * 1000).toISOString();

    const record: PickupMonitoringRecord = {
      rideId: ride.id,
      driverId: ride.driverId || 'DRV-101',
      driverName: ride.driverName || 'Captain',
      passengerId: ride.passengerId,
      passengerName: ride.passengerName,
      expectedPickupTime: expectedTime,
      distanceFromPickupMeters: 2500,
      lateMinutes: 0,
      status: 'on_time',
      qualifiesForViolation: false
    };

    this.pickupMonitors.set(ride.id, record);
    return record;
  }

  public recordDriverPickupArrival(params: {
    rideId: string;
    driverLocation: { lat: number; lng: number };
    pickupLocation: { lat: number; lng: number };
    exclusionReason?: FairLateExclusionReason | string;
  }): PickupMonitoringRecord | null {
    const existing = this.pickupMonitors.get(params.rideId);
    if (!existing) return null;

    const now = new Date();
    const actualArrival = now.toISOString();
    const distKm = this.calculateDistanceKm(params.driverLocation, params.pickupLocation);
    const distMeters = Math.round(distKm * 1000);

    const expectedDate = new Date(existing.expectedPickupTime);
    const delayMinutes = Math.max(0, Math.floor((now.getTime() - expectedDate.getTime()) / (60 * 1000)));

    let status: 'on_time' | 'minor_delay' | 'significant_delay' | 'waived' = 'on_time';
    let qualifies = false;

    if (params.exclusionReason) {
      status = 'waived';
      qualifies = false;
    } else if (delayMinutes > 10) {
      status = 'significant_delay';
      qualifies = true;
    } else if (delayMinutes > 3) {
      status = 'minor_delay';
      qualifies = false;
    }

    const updated: PickupMonitoringRecord = {
      ...existing,
      actualArrival,
      driverArrivalTime: actualArrival,
      distanceFromPickupMeters: distMeters,
      lateMinutes: delayMinutes,
      status,
      exclusionReason: params.exclusionReason,
      qualifiesForViolation: qualifies
    };

    this.pickupMonitors.set(params.rideId, updated);
    return updated;
  }

  public getPickupMonitoringRecord(rideId: string): PickupMonitoringRecord | null {
    return this.pickupMonitors.get(rideId) || null;
  }

  // --------------------------------------------------------------------------
  // 5. LOCATION EVENTS & AUDITING (ITEM 14, 15)
  // --------------------------------------------------------------------------

  public async logLocationEvent(params: {
    eventType: LocationEventType;
    driverId?: string;
    passengerId?: string;
    rideId?: string;
    lat?: number;
    lng?: number;
    speedKmh?: number;
    heading?: number;
    accuracyMeters?: number;
    details?: string;
  }): Promise<LocationEventRecord> {
    const event: LocationEventRecord = {
      id: `ev-loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...params
    };

    await this.repo.create('locationEvents', event.id, event);
    return event;
  }

  /**
   * Fetches recent auditable location events from repository or memory
   */
  public async getRecentLocationEvents(limitCount: number = 50): Promise<LocationEventRecord[]> {
    try {
      const result = await this.repo.list<LocationEventRecord>('locationEvents', undefined, {
        limit: limitCount,
        sortBy: 'timestamp',
        sortDirection: 'desc'
      });
      return result.items || [];
    } catch {
      return [];
    }
  }

  /**
   * Seeds realistic telemetry breadcrumbs and initial events for demo drivers and rides
   */
  public seedInitialTelemetry(drivers: Driver[], rides: Ride[]): void {
    // In Production mode, never seed synthetic telemetry or simulated location events
    if (isProductionDataSource()) {
      return;
    }

    if (this.driverHistoryBuffer.size > 0) return; // Already seeded

    const now = Date.now();
    drivers.forEach((driver, idx) => {
      const cityKey = driver.city || 'Lahore';
      const boundary = PAKISTAN_CITY_BOUNDARIES[cityKey] || PAKISTAN_CITY_BOUNDARIES.Lahore;
      const baseLat = boundary.center.lat + ((idx * 7) % 20 - 10) * 0.004;
      const baseLng = boundary.center.lng + ((idx * 11) % 20 - 10) * 0.004;

      const points: LocationHistoryPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const timeOffset = i * 45 * 1000;
        const pLat = baseLat - (i * 0.0012);
        const pLng = baseLng - (i * 0.0009);
        points.push({
          id: `hist-${driver.id}-${i}`,
          driverId: driver.id,
          lat: parseFloat(pLat.toFixed(5)),
          lng: parseFloat(pLng.toFixed(5)),
          timestamp: new Date(now - timeOffset).toISOString(),
          accuracyMeters: 4 + (idx % 3) * 2,
          speedKmh: 28 + (idx * 5) % 30,
          heading: (idx * 60 + i * 15) % 360,
          quality: i === 0 ? 'FRESH' : i === 1 ? 'DELAYED' : 'FRESH'
        });
      }
      this.driverHistoryBuffer.set(driver.id, points);

      // Seed initial location event
      this.logLocationEvent({
        eventType: driver.status === 'online' || driver.status === 'on_trip' ? 'driver_online' : 'driver_offline',
        driverId: driver.id,
        lat: baseLat,
        lng: baseLng,
        speedKmh: 35,
        heading: (idx * 60) % 360,
        accuracyMeters: 4,
        details: `Driver ${driver.name} telemetry registered in ${cityKey}`
      });
    });

    // Seed ride route snapshots and history
    rides.forEach((ride) => {
      if (ride.status === 'in_progress' || ride.status === 'driver_assigned' || ride.status === 'arrived') {
        const cityKey = ride.city || 'Lahore';
        const boundary = PAKISTAN_CITY_BOUNDARIES[cityKey] || PAKISTAN_CITY_BOUNDARIES.Lahore;
        const pickupLoc = { lat: boundary.center.lat - 0.015, lng: boundary.center.lng - 0.012 };
        const destLoc = { lat: boundary.center.lat + 0.02, lng: boundary.center.lng + 0.018 };

        this.updateRideRouteProgress({
          ride,
          driverLocation: pickupLoc
        });

        this.registerPickupDispatch(ride, 7);

        this.logLocationEvent({
          eventType: 'route_progress',
          rideId: ride.id,
          driverId: ride.driverId,
          passengerId: ride.passengerId,
          lat: pickupLoc.lat,
          lng: pickupLoc.lng,
          speedKmh: 32,
          heading: 45,
          accuracyMeters: 4,
          details: `Active trip ${ride.rideCode} en route to ${ride.destination?.address || 'destination'}`
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. PRIVACY FENCING (ITEM 18)
  // --------------------------------------------------------------------------

  /**
   * Validates if a passenger's location can be exposed to a driver or admin.
   * Only active during active in-progress or arriving rides.
   */
  public isPassengerLocationVisible(passengerId: string, activeRides: Ride[]): boolean {
    return activeRides.some(
      (r) =>
        r.passengerId === passengerId &&
        (r.status === 'driver_assigned' ||
          r.status === 'driver_en_route' ||
          r.status === 'arrived' ||
          r.status === 'in_progress' ||
          r.status === 'ride_started')
    );
  }
}

export const centralLocationService = new CentralLocationService();
