/**
 * GoLife Taxi Pakistan - Real-Time Operations Service
 * 
 * Abstracted architecture for Real-Time Operations.
 * In Demo Mode: provides simulated telemetry feeds and live updates.
 * In Firebase Mode: seamlessly hooks into Firestore listeners (rides, drivers, alerts).
 */

import { Ride, Driver, OperationsAlert, RideStatus } from '../types';

export interface OperationsStats {
  activeRides: number;
  searchingRides: number;
  driversOnline: number;
  driversOffline: number;
  driversOnRide: number;
  driversAvailable: number;
  pendingRequests: number;
  cancelledRidesToday: number;
  emergencyAlerts: number;
}

export class OperationsService {
  private static instance: OperationsService;
  private isSimulating: boolean = true;

  private constructor() {}

  public static getInstance(): OperationsService {
    if (!OperationsService.instance) {
      OperationsService.instance = new OperationsService();
    }
    return OperationsService.instance;
  }

  public isSimulationActive(): boolean {
    return this.isSimulating;
  }

  public setSimulationActive(active: boolean): void {
    this.isSimulating = active;
  }

  /**
   * Calculate live KPI metrics from local or remote datasets
   */
  public calculateStats(rides: Ride[] = [], drivers: Driver[] = [], alerts: OperationsAlert[] = []): OperationsStats {
    const safeRides = rides || [];
    const safeDrivers = drivers || [];
    const safeAlerts = alerts || [];

    const activeRides = safeRides.filter(
      (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived'
    ).length;

    const searchingRides = safeRides.filter((r) => r.status === 'searching').length;

    const driversOnline = safeDrivers.filter((d) => d.status === 'online' || d.status === 'on_trip').length;
    const driversOffline = safeDrivers.filter((d) => d.status === 'offline').length;
    const driversOnRide = safeDrivers.filter(
      (d) => d.status === 'on_trip' || d.operationalStatus === 'on_ride'
    ).length;
    const driversAvailable = safeDrivers.filter(
      (d) => d.status === 'online' && d.operationalStatus !== 'on_ride' && d.accountStatus === 'active'
    ).length;

    const pendingRequests = searchingRides;
    const cancelledRidesToday = safeRides.filter((r) => r.status === 'cancelled').length;
    const emergencyAlerts = safeAlerts.filter(
      (a) => (a.priority === 'critical' || a.priority === 'high') && a.status !== 'resolved'
    ).length;

    return {
      activeRides,
      searchingRides,
      driversOnline,
      driversOffline,
      driversOnRide,
      driversAvailable,
      pendingRequests,
      cancelledRidesToday,
      emergencyAlerts
    };
  }

  /**
   * Generates a realistic slight movement delta for simulated telemetry
   */
  public getSimulatedCoordinateShift(baseLat: number, baseLng: number, step: number) {
    const radius = 0.0035; // ~350m
    const angle = (step % 360) * (Math.PI / 180);
    return {
      lat: baseLat + Math.sin(angle) * radius,
      lng: baseLng + Math.cos(angle) * radius
    };
  }
}

export const operationsService = OperationsService.getInstance();
