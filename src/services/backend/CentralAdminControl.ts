/**
 * GoLife Taxi Pakistan - Central Admin Control & Shared System Foundation
 * 
 * Phase 57: Central Real-Time Backend & Passenger/Driver App Control Foundation
 * 
 * Single authoritative source of truth across all domains:
 * - Rides & Real-Time Lifecycle State Transitions (14 canonical states)
 * - Driver Status, Verification, Location Telemetry & Live Eligibility (10 states)
 * - Passenger Account Status, Controls, Warnings & Restrictions
 * - Dynamic Pricing & Deterministic Fare Engine Connection
 * - Central Commission & Platform Revenue Settlement
 * - Double-Entry Wallet & Financial Ledger Connection
 * - Real-Time Multi-Actor Notifications (Passenger, Driver, Admin)
 * - Conflict & Duplicate Protection with Idempotency Locks
 * - Event & Timeline Audit Architecture
 * - 100% Offline Demo Mode Simulation
 */

import {
  Ride,
  Driver,
  Passenger,
  RideCategory,
  CanonicalRideState,
  RideStatus,
  RealtimeRideState,
  RealtimeDriverStatus,
  CentralTimelineRecord,
  CentralTimelineActor,
  LocationFreshness,
  DriverFine,
  PassengerRefundRecord,
  SafetyIncident,
  Complaint,
  AuditLog,
  CentralPricingRule
} from '../../types';
import { BaseService } from './BaseService';
import { calculateCentralFare, DEFAULT_CENTRAL_PRICING_RULE } from '../pricingEngine';
import { calculateCommissionForRide, INITIAL_COMMISSION_RULES } from '../commissionService';
import { financialService } from './FinancialService';

// ============================================================================
// 1. CANONICAL RIDE STATE MACHINE & TRANSITIONS (14 PHASES)
// ============================================================================

export const REALTIME_RIDE_STATES: RealtimeRideState[] = [
  'requested',
  'searching_drivers',
  'driver_offer',
  'counter_offer',
  'driver_accepted',
  'passenger_accepted',
  'driver_en_route',
  'driver_arrived',
  'ride_started',
  'ride_in_progress',
  'destination_reached',
  'ride_completed',
  'cancelled',
  'disputed'
];

export const CANONICAL_RIDE_STATES: CanonicalRideState[] = [
  'REQUESTED',
  'SEARCHING',
  'OFFER_RECEIVED',
  'DRIVER_SELECTED',
  'DRIVER_ACCEPTED',
  'DRIVER_ARRIVING',
  'DRIVER_ARRIVED',
  'READY_TO_START',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED'
];

/**
 * Standard progression sequence for simulation and progress indicator
 */
export const RIDE_STATE_FLOW_SEQUENCE: RealtimeRideState[] = [
  'requested',
  'searching_drivers',
  'driver_offer',
  'counter_offer',
  'driver_accepted',
  'passenger_accepted',
  'driver_en_route',
  'driver_arrived',
  'ride_started',
  'ride_in_progress',
  'destination_reached',
  'ride_completed'
];

/**
 * Valid state transitions for the GoLife ride lifecycle
 */
export const VALID_RIDE_TRANSITIONS: Record<string, string[]> = {
  // Lowercase keys
  requested: ['searching_drivers', 'cancelled', 'disputed'],
  searching_drivers: ['driver_offer', 'driver_accepted', 'cancelled', 'disputed'],
  driver_offer: ['counter_offer', 'passenger_accepted', 'driver_accepted', 'searching_drivers', 'cancelled'],
  counter_offer: ['driver_accepted', 'driver_offer', 'searching_drivers', 'cancelled'],
  driver_accepted: ['passenger_accepted', 'driver_en_route', 'driver_arrived', 'cancelled', 'disputed'],
  passenger_accepted: ['driver_en_route', 'driver_arrived', 'cancelled', 'disputed'],
  driver_en_route: ['driver_arrived', 'cancelled', 'disputed'],
  driver_arrived: ['ride_started', 'ride_in_progress', 'cancelled', 'disputed'],
  ride_started: ['ride_in_progress', 'ride_completed', 'disputed', 'cancelled'],
  ride_in_progress: ['destination_reached', 'ride_completed', 'disputed'],
  destination_reached: ['ride_completed', 'disputed'],
  ride_completed: ['disputed', 'refunded'],
  cancelled: ['refunded'],
  disputed: ['ride_completed', 'cancelled', 'refunded'],
  refunded: [],

  // Uppercase compatibility
  REQUESTED: ['SEARCHING', 'CANCELLED', 'EXPIRED', 'DISPUTED'],
  SEARCHING: ['OFFER_RECEIVED', 'DRIVER_ACCEPTED', 'CANCELLED', 'EXPIRED', 'DISPUTED'],
  OFFER_RECEIVED: ['DRIVER_SELECTED', 'SEARCHING', 'CANCELLED', 'EXPIRED'],
  DRIVER_SELECTED: ['DRIVER_ACCEPTED', 'SEARCHING', 'CANCELLED'],
  DRIVER_ACCEPTED: ['DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'CANCELLED', 'DISPUTED'],
  DRIVER_ARRIVING: ['DRIVER_ARRIVED', 'CANCELLED', 'DISPUTED'],
  DRIVER_ARRIVED: ['READY_TO_START', 'IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  READY_TO_START: ['IN_PROGRESS', 'CANCELLED', 'DISPUTED'],
  IN_PROGRESS: ['COMPLETED', 'DISPUTED'],
  COMPLETED: ['DISPUTED', 'REFUNDED'],
  CANCELLED: ['REFUNDED'],
  EXPIRED: [],
  DISPUTED: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
  REFUNDED: []
};

export function isValidRideTransition(from: string, to: string): boolean {
  if (from === to) return true;
  const normalizedFrom = normalizeRideState(from);
  const normalizedTo = normalizeRideState(to);
  if (normalizedFrom === normalizedTo) return true;

  const allowed = VALID_RIDE_TRANSITIONS[from] || VALID_RIDE_TRANSITIONS[normalizedFrom];
  return allowed ? (allowed.includes(to) || allowed.includes(normalizedTo)) : false;
}

export function normalizeRideState(state: string): CanonicalRideState {
  const clean = (state || '').toLowerCase().trim().replace(/[-\s]+/g, '_');
  switch (clean) {
    case 'requested':
      return 'REQUESTED';
    case 'searching':
    case 'searching_drivers':
      return 'SEARCHING';
    case 'offer_received':
    case 'driver_offer':
      return 'OFFER_RECEIVED';
    case 'driver_selected':
    case 'passenger_accepted':
      return 'DRIVER_SELECTED';
    case 'driver_assigned':
    case 'assigned':
    case 'driver_accepted':
      return 'DRIVER_ACCEPTED';
    case 'driver_arriving':
    case 'driver_en_route':
      return 'DRIVER_ARRIVING';
    case 'arrived':
    case 'driver_arrived':
      return 'DRIVER_ARRIVED';
    case 'ready_to_start':
    case 'ride_started':
      return 'READY_TO_START';
    case 'in_progress':
    case 'ride_in_progress':
    case 'on_trip':
    case 'destination_reached':
      return 'IN_PROGRESS';
    case 'completed':
    case 'ride_completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    case 'expired':
      return 'EXPIRED';
    case 'disputed':
      return 'DISPUTED';
    case 'refunded':
    case 'ride_refunded':
      return 'REFUNDED';
    default:
      return 'SEARCHING';
  }
}

export function getCanonicalRideStateLabel(state: string): { label: string; urdu: string; color: string } {
  const norm = normalizeRideState(state);
  switch (norm) {
    case 'REQUESTED':
      return { label: 'Ride Requested', urdu: 'سواری کی درخواست کی گئی', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    case 'SEARCHING':
      return { label: 'Searching Drivers', urdu: 'ڈرائیور کی تلاش جاری ہے', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
    case 'OFFER_RECEIVED':
      return { label: 'Driver Offer Made', urdu: 'ڈرائیور کی پیشکش موصول ہوئی', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' };
    case 'DRIVER_SELECTED':
      return { label: 'Passenger Accepted Offer', urdu: 'مسافر نے پیشکش قبول کر لی', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' };
    case 'DRIVER_ACCEPTED':
      return { label: 'Driver Assigned', urdu: 'ڈرائیور تعینات کر دیا گیا', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    case 'DRIVER_ARRIVING':
      return { label: 'Driver En Route to Pickup', urdu: 'ڈرائیور روانہ ہے', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' };
    case 'DRIVER_ARRIVED':
      return { label: 'Driver Arrived at Pickup', urdu: 'ڈرائیور پہنچ گیا ہے', color: 'text-teal-400 bg-teal-400/10 border-teal-400/30' };
    case 'READY_TO_START':
      return { label: 'Ride Started (Boarded)', urdu: 'سفر شروع ہو گیا ہے', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    case 'IN_PROGRESS':
      return { label: 'Ride in Progress', urdu: 'سفر جاری ہے', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    case 'COMPLETED':
      return { label: 'Ride Completed & Settled', urdu: 'سفر مکمل اور حساب طے', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' };
    case 'CANCELLED':
      return { label: 'Ride Cancelled', urdu: 'سفر منسوخ کر دیا گیا', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
    case 'DISPUTED':
      return { label: 'Ride Disputed / Under Review', urdu: 'سفر زیرِ تنازع / جائزہ', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
    case 'REFUNDED':
      return { label: 'Ride Refunded', urdu: 'کرایہ واپس کر دیا گیا', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    default:
      return { label: state, urdu: state, color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' };
  }
}

// ============================================================================
// 2. REAL-TIME DRIVER STATUS (10 STATUSES)
// ============================================================================

export const REALTIME_DRIVER_STATUSES: RealtimeDriverStatus[] = [
  'online',
  'offline',
  'searching',
  'available',
  'on_the_way_to_pickup',
  'arrived',
  'on_trip',
  'suspended',
  'restricted',
  'verification_pending'
];

export function getDriverStatusLabel(status: string): { label: string; urdu: string; color: string } {
  switch (status) {
    case 'available':
    case 'online':
      return { label: 'Online / Available', urdu: 'آن لائن / دستیاب', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    case 'searching':
      return { label: 'Searching Rides', urdu: 'سواریاں تلاش کر رہا ہے', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
    case 'on_the_way_to_pickup':
      return { label: 'On The Way to Pickup', urdu: 'پک اپ کے راستے پر', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    case 'arrived':
      return { label: 'Arrived at Pickup', urdu: 'پک اپ پر پہنچ گیا', color: 'text-teal-400 bg-teal-400/10 border-teal-400/30' };
    case 'on_trip':
      return { label: 'On Trip / Serving Ride', urdu: 'سفر پر / سواری جاری', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    case 'suspended':
      return { label: 'Account Suspended', urdu: 'اکاؤنٹ معطل', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
    case 'restricted':
      return { label: 'Dispatch Restricted', urdu: 'ڈسپیچ محدود', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
    case 'verification_pending':
      return { label: 'Verification Pending', urdu: 'تصدیق زیر التواء', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' };
    case 'offline':
    default:
      return { label: 'Offline', urdu: 'آف لائن', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' };
  }
}

// ============================================================================
// 3. REAL-TIME LOCATION TELEMETRY
// ============================================================================

export interface DriverLocationTelemetry {
  driverId: string;
  driverName: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  accuracyMeters?: number;
  freshness: LocationFreshness;
  lastUpdated: string;
  city: string;
  activeRideId?: string;
  isTrackingActiveForPassenger: boolean;
}

export interface DriverMatchingConfig {
  searchRadiusKm: number;
  minDriverRating: number;
  maxActiveRidesPerDriver: number;
  matchingTimeoutSeconds: number;
  requireActiveVerification: boolean;
  requireVehicleMatch: boolean;
  cityRestrictionsEnabled: boolean;
}

export const DEFAULT_MATCHING_CONFIG: DriverMatchingConfig = {
  searchRadiusKm: 5.0,
  minDriverRating: 4.2,
  maxActiveRidesPerDriver: 1,
  matchingTimeoutSeconds: 45,
  requireActiveVerification: true,
  requireVehicleMatch: true,
  cityRestrictionsEnabled: true
};

// ============================================================================
// 4. CENTRAL ADMIN CONTROL SERVICE
// ============================================================================

export class CentralAdminControlService extends BaseService {
  private driverTelemetryStore: Map<string, DriverLocationTelemetry> = new Map();
  private matchingConfig: DriverMatchingConfig = { ...DEFAULT_MATCHING_CONFIG };
  private simulationTimer: any = null;

  constructor() {
    super();
    this.seedInitialTelemetry();
  }

  private seedInitialTelemetry(): void {
    // Seed initial coordinates for major cities
    const seeds: Array<{ id: string; name: string; lat: number; lng: number; city: string }> = [
      { id: 'DRV-101', name: 'Muhammad Tariq', lat: 31.5204, lng: 74.3587, city: 'Lahore' },
      { id: 'DRV-102', name: 'Ahmed Raza', lat: 31.4826, lng: 74.3032, city: 'Lahore' },
      { id: 'DRV-103', name: 'Zubair Khan', lat: 24.8607, lng: 67.0011, city: 'Karachi' },
      { id: 'DRV-104', name: 'Usman Ali', lat: 33.6844, lng: 73.0479, city: 'Islamabad' },
      { id: 'DRV-105', name: 'Bilal Hassan', lat: 31.5546, lng: 74.3572, city: 'Lahore' }
    ];

    seeds.forEach((s) => {
      this.driverTelemetryStore.set(s.id, {
        driverId: s.id,
        driverName: s.name,
        lat: s.lat,
        lng: s.lng,
        heading: Math.floor(Math.random() * 360),
        speedKmh: Math.floor(Math.random() * 30),
        accuracyMeters: 8,
        freshness: 'LIVE',
        lastUpdated: new Date().toISOString(),
        city: s.city,
        isTrackingActiveForPassenger: false
      });
    });
  }

  // --------------------------------------------------------------------------
  // RIDE LIFECYCLE STATE MACHINE (ITEM 2)
  // --------------------------------------------------------------------------

  public async transitionRideState(
    rideId: string,
    targetState: string,
    actor: CentralTimelineActor,
    note?: string,
    options?: {
      overrideFare?: number;
      cancellationReason?: string;
      cancellationFee?: number;
    }
  ): Promise<{ success: boolean; error?: string; updatedRide?: Ride }> {
    const idempotencyKey = `RIDE_TRANSITION_${rideId}_${targetState}`;

    return this.executeIdempotent('RIDE_STATE_TRANSITION', idempotencyKey, async () => {
      const ride = await this.repository.getById<Ride>('rides', rideId);
      if (!ride) {
        throw new Error(`Ride ${rideId} not found`);
      }

      const currentState = ride.status;
      const normalizedCurrent = normalizeRideState(currentState);
      const normalizedTarget = normalizeRideState(targetState);

      // Guard: Completed or cancelled rides cannot be altered unless moving to DISPUTED
      if ((normalizedCurrent === 'COMPLETED' || normalizedCurrent === 'CANCELLED') && normalizedTarget !== 'DISPUTED') {
        throw new Error(`Immutable record: Ride ${rideId} is already ${normalizedCurrent} and cannot transition to ${targetState}`);
      }

      const valid = isValidRideTransition(currentState, targetState);
      if (!valid && actor.role !== 'admin') {
        throw new Error(`Invalid lifecycle transition from ${currentState} to ${targetState}`);
      }

      const now = new Date().toISOString();
      const updates: Partial<Ride> = {
        status: targetState as any,
        updatedAt: now
      };

      // Lifecycle-specific state assignments
      if (normalizedTarget === 'DRIVER_ARRIVING' || targetState === 'driver_en_route') {
        if (ride.driverId) {
          await this.setDriverRealtimeStatus(ride.driverId, 'on_the_way_to_pickup', actor, `En route to pickup for Ride #${ride.rideCode || rideId}`);
          this.setTrackingPrivacy(ride.driverId, true, rideId);
        }
      } else if (normalizedTarget === 'DRIVER_ARRIVED' || targetState === 'driver_arrived') {
        if (ride.driverId) {
          await this.setDriverRealtimeStatus(ride.driverId, 'arrived', actor, `Arrived at pickup for Ride #${ride.rideCode || rideId}`);
        }
      } else if (normalizedTarget === 'READY_TO_START' || normalizedTarget === 'IN_PROGRESS' || targetState === 'ride_started' || targetState === 'ride_in_progress') {
        if (!ride.startTime) {
          updates.startTime = now;
        }
        if (ride.driverId) {
          await this.setDriverRealtimeStatus(ride.driverId, 'on_trip', actor, `Serving Ride #${ride.rideCode || rideId}`);
        }
      } else if (normalizedTarget === 'COMPLETED' || targetState === 'ride_completed') {
        updates.endTime = now;

        // Stop live privacy tracking immediately
        if (ride.driverId) {
          this.setTrackingPrivacy(ride.driverId, false);
          await this.setDriverRealtimeStatus(ride.driverId, 'available', actor, `Completed Ride #${ride.rideCode || rideId}`);
        }

        // Execute deterministic pricing & commission settlement
        await this.settleCompletedRideFinancials(ride, options?.overrideFare);
      } else if (normalizedTarget === 'CANCELLED' || targetState === 'cancelled') {
        updates.endTime = now;
        updates.cancellationReason = options?.cancellationReason || note || `Cancelled by ${actor.name} (${actor.role})`;
        updates.cancelledBy = actor.role;

        if (ride.driverId) {
          this.setTrackingPrivacy(ride.driverId, false);
          await this.setDriverRealtimeStatus(ride.driverId, 'available', actor, `Ride #${ride.rideCode || rideId} cancelled`);
        }
      }

      await this.repository.update('rides', rideId, updates);

      // Create unified Event / Timeline record (Item 13)
      await this.recordTimelineEvent({
        id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        eventType: `RIDE_${targetState.toUpperCase()}`,
        actor,
        entityId: rideId,
        previousState: currentState,
        newState: targetState,
        timestamp: now,
        reason: note || `Transitioned from ${currentState} to ${targetState}`,
        relatedRideOrUser: ride.passengerId,
        auditInfo: {
          idempotencyKey,
          ruleVersion: '2027.1'
        }
      });

      // Dispatch appropriate real-time notifications (Item 11)
      await this.dispatchRideNotifications(ride, targetState, actor);

      const updated = { ...ride, ...updates };
      return { success: true, updatedRide: updated };
    }).then((res) => res.data || { success: false, error: res.error });
  }

  // --------------------------------------------------------------------------
  // DETERMINISTIC FINANCIAL SETTLEMENT ON COMPLETION (ITEMS 8, 9, 10)
  // --------------------------------------------------------------------------

  private async settleCompletedRideFinancials(ride: Ride, overrideFare?: number): Promise<void> {
    try {
      const grossFare = overrideFare !== undefined ? overrideFare : (ride.finalFare || ride.fare || 500);
      const distanceKm = ride.distanceKm || 8.5;
      const durationMin = ride.durationMin || 15;
      const city = ride.city || 'Lahore';
      const category = (ride.category as string) || 'Economy';

      // 1. Fetch active central pricing rule (or fallback to default)
      const rules = await this.repository.list<CentralPricingRule>('pricingRules', undefined, { limit: 10 });
      const activeRule = rules.items.length > 0 ? rules.items[0] : DEFAULT_CENTRAL_PRICING_RULE;

      // 2. Deterministic fare calculation breakdown
      const fareSnapshot = calculateCentralFare({
        category,
        city,
        distanceKm,
        durationMinutes: durationMin,
        baseOverrideFare: overrideFare,
        paymentMethod: ride.paymentMethod || 'cash'
      }, activeRule);

      const calculatedFare = grossFare;
      const commissionAmount = fareSnapshot.commissionAmount || Math.round(calculatedFare * 0.15);
      const driverNetEarnings = fareSnapshot.driverNetEarnings || Math.max(0, calculatedFare - commissionAmount);
      const taxAmount = fareSnapshot.taxAmount || 0;

      // 3. Delegate authoritative financial settlement to FinancialService
      await financialService.recordRideSettlement({
        rideId: ride.id,
        rideCode: ride.rideCode || `RIDE-${ride.id}`,
        driverId: ride.driverId || 'DRV-101',
        driverName: ride.driverName || 'Captain',
        passengerId: ride.passengerId || 'PAS-101',
        passengerName: ride.passengerName || 'Passenger',
        fare: calculatedFare,
        commission: commissionAmount,
        driverEarnings: driverNetEarnings,
        tax: taxAmount,
        paymentMethod: ride.paymentMethod || 'cash',
        fareBreakdown: fareSnapshot,
        pricingRuleVersionId: activeRule.versionId || 'v1'
      });
    } catch (e) {
      console.error('Error settling ride financials:', e);
    }
  }

  // --------------------------------------------------------------------------
  // DRIVER REAL-TIME CONTROL & STATUS (ITEMS 3, 4)
  // --------------------------------------------------------------------------

  public async setDriverRealtimeStatus(
    driverId: string,
    targetStatus: RealtimeDriverStatus,
    actor: CentralTimelineActor,
    reason?: string
  ): Promise<boolean> {
    const driver = await this.repository.getById<Driver>('drivers', driverId);
    if (!driver) return false;

    const previousStatus = driver.status;
    const now = new Date().toISOString();

    const updates: Partial<Driver> = {
      status: targetStatus as any,
      operationalStatus: targetStatus as any
    };

    if (targetStatus === 'suspended') {
      updates.accountStatus = 'suspended';
    } else if (targetStatus === 'available' || targetStatus === 'online') {
      if (driver.accountStatus === 'suspended') {
        updates.accountStatus = 'active';
      }
    }

    await this.repository.update('drivers', driverId, updates);

    // Record presence snapshot in driverStatuses collection
    const statusRecord = {
      id: `ds-${driverId}-${Date.now()}`,
      driverId,
      status: targetStatus,
      changedBy: actor.name,
      reason: reason || 'Status updated via Central Admin Control',
      timestamp: now
    };
    await this.repository.create('driverStatuses', statusRecord.id, statusRecord);

    // Record event
    await this.recordTimelineEvent({
      id: `dev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType: 'DRIVER_STATUS_CHANGE',
      actor,
      entityId: driverId,
      previousState: previousStatus,
      newState: targetStatus,
      timestamp: now,
      reason: reason || `Status changed from ${previousStatus} to ${targetStatus}`
    });

    return true;
  }

  /**
   * Central Driver Authority Actions (Item 4)
   */
  public async warnDriver(driverId: string, warningReason: string, actor: CentralTimelineActor): Promise<boolean> {
    const driver = await this.repository.getById<Driver>('drivers', driverId);
    if (!driver) return false;

    const warningDoc = {
      id: `dwrn-${Date.now()}`,
      driverId,
      driverName: driver.name,
      reason: warningReason,
      issuedBy: actor.name,
      timestamp: new Date().toISOString()
    };
    await this.repository.create('driverWarnings', warningDoc.id, warningDoc);

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'WARNING_ISSUED',
      module: 'drivers',
      resourceId: driverId,
      resourceType: 'driver',
      reason: warningReason,
      details: `Official warning issued to driver ${driver.name}: ${warningReason}`
    });

    // Notify driver
    await this.sendNotification({
      recipientType: 'driver',
      recipientId: driverId,
      eventType: 'suspension_warning',
      title: 'Official Compliance Warning',
      message: `Warning issued: ${warningReason}. Please review GoLife captain standards.`,
      priority: 'high'
    });

    return true;
  }

  public async suspendDriver(driverId: string, reason: string, durationHours: number, actor: CentralTimelineActor): Promise<boolean> {
    await this.setDriverRealtimeStatus(driverId, 'suspended', actor, reason);

    const suspensionDoc = {
      id: `dsusp-${Date.now()}`,
      driverId,
      reason,
      durationHours,
      issuedBy: actor.name,
      suspendedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
      status: 'active'
    };
    await this.repository.create('driverSuspensions', suspensionDoc.id, suspensionDoc);

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'SUSPEND',
      module: 'drivers',
      resourceId: driverId,
      resourceType: 'driver',
      reason,
      details: `Driver suspended for ${durationHours} hours: ${reason}`
    });

    await this.sendNotification({
      recipientType: 'driver',
      recipientId: driverId,
      eventType: 'suspension_warning',
      title: 'Captain Account Suspended',
      message: `Your driver account has been suspended for ${durationHours}h. Reason: ${reason}. Contact support to appeal.`,
      priority: 'urgent'
    });

    return true;
  }

  public async reinstateDriver(driverId: string, reason: string, actor: CentralTimelineActor): Promise<boolean> {
    await this.setDriverRealtimeStatus(driverId, 'available', actor, reason);

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'REINSTATE',
      module: 'drivers',
      resourceId: driverId,
      resourceType: 'driver',
      reason,
      details: `Driver reinstated by ${actor.name}: ${reason}`
    });

    await this.sendNotification({
      recipientType: 'driver',
      recipientId: driverId,
      eventType: 'admin_message',
      title: 'Account Reinstated & Active',
      message: `Your driver account has been reinstated. You can now go online and accept rides.`,
      priority: 'normal'
    });

    return true;
  }

  public async levyDriverFine(driverId: string, amount: number, reason: string, rideId: string | undefined, actor: CentralTimelineActor): Promise<boolean> {
    const fineDoc: DriverFine = {
      id: `fine-${Date.now()}`,
      fineCode: `FINE-PK-${Date.now().toString().slice(-6)}`,
      driverId,
      driverName: 'Captain',
      driverPhone: '+92 300 1234567',
      driverPlate: 'LED-0000',
      city: 'Lahore',
      reasonId: 'manual_admin_fine',
      reasonLabel: reason,
      amount,
      deductedAmount: amount,
      remainingAmount: 0,
      status: 'deducted',
      source: 'manual',
      relatedRideId: rideId,
      note: reason,
      deductionMethod: 'driver_wallet',
      isQualifying: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByAdmin: actor.name || 'Admin'
    };
    await this.repository.create('driverFines', fineDoc.id, fineDoc);

    // Deduct from captain wallet
    const wallets = await this.repository.list<any>('driverWallets');
    const driverWallet = wallets.items.find((w) => w.driverId === driverId);
    if (driverWallet) {
      await this.repository.update('driverWallets', driverWallet.id, {
        balance: (driverWallet.balance || 0) - amount
      });
    }

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'FINE_LEVIED',
      module: 'drivers',
      resourceId: driverId,
      resourceType: 'driver',
      reason,
      details: `Fine of Rs. ${amount} levied on driver ${driverId}: ${reason}`
    });

    await this.sendNotification({
      recipientType: 'driver',
      recipientId: driverId,
      eventType: 'fine',
      title: `Compliance Fine: Rs. ${amount}`,
      message: `A fine of Rs. ${amount} has been deducted from your wallet for: ${reason}.`,
      priority: 'high'
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // PASSENGER REAL-TIME CONTROL & STATUS (ITEM 5)
  // --------------------------------------------------------------------------

  public async setPassengerRealtimeStatus(
    passengerId: string,
    status: 'active' | 'suspended' | 'blocked',
    actor: CentralTimelineActor,
    reason: string,
    controls?: {
      rideBookingEnabled?: boolean;
      cashPaymentEnabled?: boolean;
      walletPaymentEnabled?: boolean;
      promoUsageEnabled?: boolean;
      riskStatus?: 'normal' | 'watchlist' | 'restricted';
    }
  ): Promise<boolean> {
    const passenger = await this.repository.getById<Passenger>('passengers', passengerId);
    if (!passenger) return false;

    const previousStatus = passenger.accountStatus || 'active';
    const now = new Date().toISOString();

    const updates: Partial<Passenger> = {
      accountStatus: status,
      statusNote: reason,
      updatedAt: now,
      ...controls
    };

    await this.repository.update('passengers', passengerId, updates);

    // Presence record in passengerStatuses collection
    const statusRecord = {
      id: `ps-${passengerId}-${Date.now()}`,
      passengerId,
      status,
      changedBy: actor.name,
      reason,
      timestamp: now
    };
    await this.repository.create('passengerStatuses', statusRecord.id, statusRecord);

    await this.recordTimelineEvent({
      id: `pev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType: 'PASSENGER_STATUS_CHANGE',
      actor,
      entityId: passengerId,
      previousState: previousStatus,
      newState: status,
      timestamp: now,
      reason
    });

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'UPDATE_STATUS',
      module: 'passengers',
      resourceId: passengerId,
      resourceType: 'passenger',
      reason,
      details: `Passenger status changed to ${status}: ${reason}`
    });

    return true;
  }

  public async warnPassenger(passengerId: string, warningReason: string, actor: CentralTimelineActor): Promise<boolean> {
    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'WARNING_ISSUED',
      module: 'passengers',
      resourceId: passengerId,
      resourceType: 'passenger',
      reason: warningReason,
      details: `Policy warning issued to passenger ${passengerId}: ${warningReason}`
    });

    await this.sendNotification({
      recipientType: 'passenger',
      recipientId: passengerId,
      eventType: 'admin_message',
      title: 'Important Account Notice',
      message: `Notice from GoLife: ${warningReason}. Please follow passenger code of conduct.`,
      priority: 'high'
    });

    return true;
  }

  public async issuePassengerRefund(
    passengerId: string,
    rideId: string,
    amount: number,
    reason: string,
    actor: CentralTimelineActor
  ): Promise<boolean> {
    const passenger = await this.repository.getById<Passenger>('passengers', passengerId);
    if (!passenger) return false;

    const newBalance = (passenger.walletBalance || 0) + amount;
    await this.repository.update('passengers', passengerId, { walletBalance: newBalance });

    const refundDoc: PassengerRefundRecord = {
      id: `ref-${Date.now()}`,
      refundCode: `RFN-PK-${Date.now().toString().slice(-6)}`,
      rideId,
      rideCode: `RIDE-${rideId}`,
      passengerId,
      passengerName: passenger.name,
      passengerPhone: passenger.phone || '+92 300 1234567',
      driverId: 'DRV-101',
      driverName: 'Captain',
      originalFare: amount,
      paidAmount: amount,
      previousRefunds: 0,
      refundType: 'full',
      amount,
      remainingRefundable: 0,
      paymentMethod: 'wallet',
      refundDestination: 'wallet_credit',
      status: 'completed',
      reason,
      note: `Approved by ${actor.name || 'Admin'}`,
      requiresHighValueApproval: false,
      approvedBy: actor.name || 'Admin',
      approvedAt: new Date().toISOString(),
      createdBy: actor.name || 'Admin',
      createdAt: new Date().toISOString()
    };
    await this.repository.create('refunds', refundDoc.id, refundDoc);

    const txDoc = {
      id: `tx-ref-${Date.now()}`,
      userId: passengerId,
      userType: 'passenger',
      amount,
      type: 'credit',
      description: `Refund for Ride #${rideId}: ${reason}`,
      date: new Date().toISOString()
    };
    await this.repository.create('walletTransactions', txDoc.id, txDoc);

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'REFUND_ISSUED',
      module: 'passengers',
      resourceId: passengerId,
      resourceType: 'passenger',
      reason,
      details: `Issued refund of Rs. ${amount} for Ride #${rideId}`
    });

    await this.sendNotification({
      recipientType: 'passenger',
      recipientId: passengerId,
      eventType: 'refund',
      title: `Refund Credited: Rs. ${amount}`,
      message: `A refund of Rs. ${amount} has been added to your GoLife wallet for Ride #${rideId}.`,
      priority: 'high'
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // CENTRAL RIDE CONTROL (ITEM 6)
  // --------------------------------------------------------------------------

  public async getRideDetailsWithRelations(rideId: string): Promise<{
    ride: Ride | null;
    driver: Driver | null;
    passenger: Passenger | null;
    timeline: any[];
    telemetry: DriverLocationTelemetry | null;
  }> {
    const ride = await this.repository.getById<Ride>('rides', rideId);
    if (!ride) {
      return { ride: null, driver: null, passenger: null, timeline: [], telemetry: null };
    }

    const [driver, passenger, events] = await Promise.all([
      ride.driverId ? this.repository.getById<Driver>('drivers', ride.driverId) : Promise.resolve(null),
      ride.passengerId ? this.repository.getById<Passenger>('passengers', ride.passengerId) : Promise.resolve(null),
      this.repository.list<any>('rideEvents', { searchQuery: rideId })
    ]);

    const telemetry = ride.driverId ? this.getDriverTelemetry(ride.driverId) : null;

    return {
      ride,
      driver,
      passenger,
      timeline: events.items,
      telemetry
    };
  }

  public async adjustRideFare(rideId: string, newFare: number, reason: string, actor: CentralTimelineActor): Promise<boolean> {
    const ride = await this.repository.getById<Ride>('rides', rideId);
    if (!ride) return false;

    const previousFare = ride.fare;
    await this.repository.update('rides', rideId, {
      fare: newFare,
      finalFare: newFare,
      fareAdjustmentReason: reason,
      adjustedBy: actor.name
    });

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'ADJUST_FARE',
      module: 'rides',
      resourceId: rideId,
      resourceType: 'ride',
      reason,
      details: `Fare adjusted from Rs. ${previousFare} to Rs. ${newFare}: ${reason}`
    });

    return true;
  }

  public async resolveRideDispute(
    rideId: string,
    resolution: 'uphold_original' | 'refund_passenger' | 'compensate_driver' | 'split_difference',
    refundAmount: number,
    compensationAmount: number,
    reason: string,
    actor: CentralTimelineActor
  ): Promise<boolean> {
    const ride = await this.repository.getById<Ride>('rides', rideId);
    if (!ride) return false;

    await this.repository.update('rides', rideId, {
      status: 'completed' as any,
      disputeResolution: {
        resolution,
        refundAmount,
        compensationAmount,
        resolvedBy: actor.name,
        resolvedAt: new Date().toISOString(),
        notes: reason
      }
    });

    if (refundAmount > 0 && ride.passengerId) {
      await this.issuePassengerRefund(ride.passengerId, rideId, refundAmount, `Dispute Resolution: ${reason}`, actor);
    }

    if (compensationAmount > 0 && ride.driverId) {
      const wallets = await this.repository.list<any>('driverWallets');
      const driverWallet = wallets.items.find((w) => w.driverId === ride.driverId);
      if (driverWallet) {
        await this.repository.update('driverWallets', driverWallet.id, {
          balance: (driverWallet.balance || 0) + compensationAmount
        });
      }
    }

    await this.logAdminAudit({
      adminId: actor.id,
      adminName: actor.name,
      action: 'RESOLVE_DISPUTE',
      module: 'rides',
      resourceId: rideId,
      resourceType: 'ride',
      reason,
      details: `Dispute resolved: ${resolution}. Refund: Rs. ${refundAmount}, Comp: Rs. ${compensationAmount}`
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // REAL-TIME LOCATION TELEMETRY & PRIVACY FENCING (ITEM 7)
  // --------------------------------------------------------------------------

  public recordDriverTelemetry(
    driverId: string,
    driverName: string,
    lat: number,
    lng: number,
    city: string,
    speedKmh: number = 0,
    heading: number = 0,
    accuracyMeters: number = 8,
    activeRideId?: string
  ): DriverLocationTelemetry {
    const now = new Date();
    const existing = this.driverTelemetryStore.get(driverId);
    const trackingForPassenger = existing ? existing.isTrackingActiveForPassenger : Boolean(activeRideId);

    const record: DriverLocationTelemetry = {
      driverId,
      driverName,
      lat,
      lng,
      heading,
      speedKmh,
      accuracyMeters,
      freshness: 'LIVE',
      lastUpdated: now.toISOString(),
      city,
      activeRideId,
      isTrackingActiveForPassenger: trackingForPassenger
    };

    this.driverTelemetryStore.set(driverId, record);
    return record;
  }

  public setTrackingPrivacy(driverId: string, isTrackingActive: boolean, activeRideId?: string): void {
    const existing = this.driverTelemetryStore.get(driverId);
    if (existing) {
      existing.isTrackingActiveForPassenger = isTrackingActive;
      existing.activeRideId = isTrackingActive ? (activeRideId || existing.activeRideId) : undefined;
      this.driverTelemetryStore.set(driverId, existing);
    }
  }

  public getDriverTelemetry(driverId: string): DriverLocationTelemetry | null {
    const item = this.driverTelemetryStore.get(driverId);
    if (!item) return null;

    const ageMs = Date.now() - new Date(item.lastUpdated).getTime();
    if (ageMs < 60 * 1000) {
      item.freshness = 'LIVE';
    } else if (ageMs < 3 * 60 * 1000) {
      item.freshness = 'RECENT';
    } else if (ageMs < 10 * 60 * 1000) {
      item.freshness = 'STALE';
    } else {
      item.freshness = 'OFFLINE';
    }

    return item;
  }

  public getAllDriverTelemetry(): DriverLocationTelemetry[] {
    return Array.from(this.driverTelemetryStore.values()).map((item) => {
      const copy = { ...item };
      const ageMs = Date.now() - new Date(copy.lastUpdated).getTime();
      if (ageMs < 60 * 1000) copy.freshness = 'LIVE';
      else if (ageMs < 3 * 60 * 1000) copy.freshness = 'RECENT';
      else if (ageMs < 10 * 60 * 1000) copy.freshness = 'STALE';
      else copy.freshness = 'OFFLINE';
      return copy;
    });
  }

  // --------------------------------------------------------------------------
  // DRIVER MATCHING PIPELINE
  // --------------------------------------------------------------------------

  public isDriverEligibleForDispatch(driver: Driver, requestedCategory: RideCategory, city: string): { eligible: boolean; reason?: string } {
    if (driver.accountStatus === 'suspended') {
      return { eligible: false, reason: 'Driver account is currently suspended by Admin' };
    }
    if (driver.accountStatus === 'blocked') {
      return { eligible: false, reason: 'Driver account is permanently blocked' };
    }
    if (driver.status === 'offline') {
      return { eligible: false, reason: 'Driver is currently offline' };
    }
    if (driver.status === 'on_trip' || driver.operationalStatus === 'on_ride' || driver.operationalStatus === 'going_to_pickup') {
      return { eligible: false, reason: 'Driver is already serving an active ride' };
    }
    if (this.matchingConfig.requireActiveVerification && driver.verificationStatus !== 'verified') {
      return { eligible: false, reason: 'Driver KYC verification is not completed' };
    }
    if (this.matchingConfig.cityRestrictionsEnabled && driver.city && driver.city !== city) {
      return { eligible: false, reason: `Driver is registered in ${driver.city}, not ${city}` };
    }
    if (driver.rating < this.matchingConfig.minDriverRating) {
      return { eligible: false, reason: `Driver rating (${driver.rating}) below threshold (${this.matchingConfig.minDriverRating})` };
    }
    return { eligible: true };
  }

  public findEligibleDispatchDrivers(
    allDrivers: Driver[],
    ride: { category: RideCategory; city: string; pickup: { lat: number; lng: number } }
  ): Driver[] {
    return allDrivers.filter((driver) => {
      const eligibility = this.isDriverEligibleForDispatch(driver, ride.category, ride.city);
      if (!eligibility.eligible) return false;

      if (driver.currentLocation) {
        const dLat = Math.abs(driver.currentLocation.lat - ride.pickup.lat) * 111;
        const dLng = Math.abs(driver.currentLocation.lng - ride.pickup.lng) * 111 * Math.cos(ride.pickup.lat * (Math.PI / 180));
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng);
        if (distKm > this.matchingConfig.searchRadiusKm) {
          return false;
        }
      }
      return true;
    });
  }

  // --------------------------------------------------------------------------
  // EVENT / TIMELINE ARCHITECTURE (ITEM 13)
  // --------------------------------------------------------------------------

  public async recordTimelineEvent(record: CentralTimelineRecord): Promise<void> {
    await this.repository.create('rideEvents', record.id, record);
  }

  // --------------------------------------------------------------------------
  // MULTI-ACTOR NOTIFICATIONS (ITEM 11)
  // --------------------------------------------------------------------------

  public async sendNotification(payload: {
    recipientType: 'passenger' | 'driver' | 'admin';
    recipientId: string;
    eventType: string;
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<void> {
    const notif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientType: payload.recipientType,
      recipientId: payload.recipientId,
      eventType: payload.eventType,
      title: payload.title,
      message: payload.message,
      priority: payload.priority || 'normal',
      status: 'delivered',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    await this.repository.create('notifications', notif.id, notif);
  }

  private async dispatchRideNotifications(ride: Ride, targetState: string, actor: CentralTimelineActor): Promise<void> {
    const code = ride.rideCode || `#${ride.id}`;

    switch (targetState) {
      case 'driver_offer':
        if (ride.passengerId) {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'driver_offer',
            title: 'Captain Made an Offer',
            message: `Captain has offered a fare for your ride ${code}.`,
            priority: 'high'
          });
        }
        break;

      case 'driver_accepted':
        if (ride.passengerId) {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'driver_accepted',
            title: 'Captain Assigned',
            message: `Captain ${ride.driverName || 'assigned'} has accepted ride ${code}.`,
            priority: 'high'
          });
        }
        break;

      case 'driver_en_route':
        if (ride.passengerId) {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'driver_arriving',
            title: 'Captain En Route',
            message: `Your captain is heading towards pickup location.`,
            priority: 'normal'
          });
        }
        break;

      case 'driver_arrived':
        if (ride.passengerId) {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'driver_arrived',
            title: 'Captain Arrived',
            message: `Your captain has arrived at the pickup location.`,
            priority: 'urgent'
          });
        }
        break;

      case 'ride_started':
      case 'ride_in_progress':
        if (ride.passengerId) {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'ride_started',
            title: 'Ride Started',
            message: `Your trip ${code} has commenced safely. Have a pleasant journey!`,
            priority: 'normal'
          });
        }
        if (ride.driverId) {
          await this.sendNotification({
            recipientType: 'driver',
            recipientId: ride.driverId,
            eventType: 'ride_started',
            title: 'Trip in Progress',
            message: `Navigate carefully to destination: ${ride.destination?.address || 'Destination'}.`,
            priority: 'normal'
          });
        }
        break;

      case 'ride_completed':
        if (ride.passengerId) {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'ride_completed',
            title: 'Trip Completed',
            message: `You reached your destination. Fare: Rs. ${ride.fare}. Thank you for riding GoLife!`,
            priority: 'high'
          });
        }
        if (ride.driverId) {
          await this.sendNotification({
            recipientType: 'driver',
            recipientId: ride.driverId,
            eventType: 'ride_completed',
            title: 'Trip Completed & Settled',
            message: `Trip ${code} completed. Fare: Rs. ${ride.fare}. Settlement recorded in wallet.`,
            priority: 'high'
          });
        }
        break;

      case 'cancelled':
        if (ride.passengerId && actor.role !== 'passenger') {
          await this.sendNotification({
            recipientType: 'passenger',
            recipientId: ride.passengerId,
            eventType: 'cancellation',
            title: 'Ride Cancelled',
            message: `Ride ${code} was cancelled. Reason: ${ride.cancellationReason || 'Operation cancelled'}.`,
            priority: 'high'
          });
        }
        if (ride.driverId && actor.role !== 'driver') {
          await this.sendNotification({
            recipientType: 'driver',
            recipientId: ride.driverId,
            eventType: 'cancellation',
            title: 'Ride Cancelled',
            message: `Ride ${code} was cancelled. You are now available for new dispatches.`,
            priority: 'high'
          });
        }
        break;
    }
  }

  // --------------------------------------------------------------------------
  // DEMO REAL-TIME SIMULATION RUNNER (ITEM 16)
  // --------------------------------------------------------------------------

  /**
   * Advances an active demo ride to its next canonical step
   */
  public async advanceRideSimulationStep(rideId: string, adminActor: CentralTimelineActor): Promise<{
    success: boolean;
    previousState: string;
    newState: string;
    message: string;
  }> {
    const ride = await this.repository.getById<Ride>('rides', rideId);
    if (!ride) {
      return { success: false, previousState: '', newState: '', message: `Ride ${rideId} not found` };
    }

    const currentState = (ride.status || 'requested').toLowerCase();
    const currentIndex = RIDE_STATE_FLOW_SEQUENCE.indexOf(currentState as any);

    if (currentIndex === -1) {
      // If it's in a non-standard or terminal state
      return { success: false, previousState: currentState, newState: currentState, message: `Ride is currently in terminal/disputed state '${currentState}'.` };
    }

    if (currentIndex >= RIDE_STATE_FLOW_SEQUENCE.length - 1) {
      return { success: false, previousState: currentState, newState: currentState, message: 'Ride is already completed.' };
    }

    const nextState = RIDE_STATE_FLOW_SEQUENCE[currentIndex + 1];

    // Jitter driver GPS slightly along the route
    if (ride.driverId) {
      this.simulateDriverMovement(ride.driverId);
    }

    const res = await this.transitionRideState(rideId, nextState, adminActor, `Simulation step: advanced to ${nextState}`);

    if (res.success) {
      return {
        success: true,
        previousState: currentState,
        newState: nextState,
        message: `Successfully advanced ride from ${currentState} to ${nextState}`
      };
    } else {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        message: res.error || 'Failed to transition state'
      };
    }
  }

  /**
   * Simulates slight movement of a driver's GPS coordinates
   */
  public simulateDriverMovement(driverId: string): DriverLocationTelemetry | null {
    if (!this.isDemo) {
      return this.driverTelemetryStore.get(driverId) || null;
    }
    const telemetry = this.driverTelemetryStore.get(driverId);
    if (!telemetry) return null;

    // Move slightly (approx 50-100 meters)
    const latDelta = (Math.random() - 0.5) * 0.0015;
    const lngDelta = (Math.random() - 0.5) * 0.0015;

    telemetry.lat += latDelta;
    telemetry.lng += lngDelta;
    telemetry.speedKmh = Math.floor(20 + Math.random() * 25);
    telemetry.heading = (telemetry.heading + Math.floor((Math.random() - 0.5) * 40) + 360) % 360;
    telemetry.lastUpdated = new Date().toISOString();
    telemetry.freshness = 'LIVE';

    this.driverTelemetryStore.set(driverId, telemetry);
    return telemetry;
  }

  // --------------------------------------------------------------------------
  // VERIFICATION REVIEW PIPELINE
  // --------------------------------------------------------------------------

  public async reviewDriverVerification(
    driverId: string,
    verificationId: string,
    decision: 'approved' | 'rejected' | 'resubmission_required',
    reviewerId: string,
    reviewerName: string,
    notes: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const verStatus = decision === 'approved' ? 'verified' : decision === 'resubmission_required' ? 'pending' : 'rejected';
    const accStatus = decision === 'approved' ? 'active' : 'suspended';
    const rideStatus = decision === 'approved' ? 'online' : 'offline';

    await this.repository.update('drivers', driverId, {
      verificationStatus: verStatus,
      accountStatus: accStatus,
      status: rideStatus,
      isVerified: decision === 'approved',
      verifiedAt: decision === 'approved' ? now : undefined,
      rejectionReason: decision !== 'approved' ? notes : undefined
    });

    await this.repository.update('driverVerifications', verificationId, {
      status: decision,
      reviewStatus: decision,
      reviewedBy: reviewerName,
      reviewedAt: now,
      rejectionReason: decision !== 'approved' ? notes : undefined,
      notes
    });

    await this.logAdminAudit({
      adminId: reviewerId,
      adminName: reviewerName,
      action: decision === 'approved' ? 'APPROVE_VERIFICATION' : decision === 'resubmission_required' ? 'REQUEST_RESUBMISSION' : 'REJECT_VERIFICATION',
      module: 'verification',
      resourceId: driverId,
      resourceType: 'verification',
      reason: notes,
      details: `Driver verification ${decision} by ${reviewerName}. Notes: ${notes}`
    });

    return true;
  }

  public async updateDriverDocumentStatus(
    driverId: string,
    docType: string,
    status: 'verified' | 'invalid' | 'rejected',
    reviewerId: string,
    reviewerName: string,
    notes?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    await this.repository.update('driverDocuments', `${driverId}_${docType}`, {
      status,
      reviewedBy: reviewerName,
      reviewedAt: now,
      notes: notes || ''
    });

    await this.logAdminAudit({
      adminId: reviewerId,
      adminName: reviewerName,
      action: `DOCUMENT_${status.toUpperCase()}`,
      module: 'verification',
      resourceId: `${driverId}_${docType}`,
      resourceType: 'verification',
      reason: notes,
      details: `Document ${docType} for driver ${driverId} marked ${status} by ${reviewerName}`
    });

    return true;
  }

  public async updateSafetyIncidentStatus(
    incidentId: string,
    status: 'active' | 'under_investigation' | 'resolved' | 'false_alarm' | 'escalated' | 'closed',
    reviewerId: string,
    reviewerName: string,
    notes?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    await this.repository.update('safetyIncidents', incidentId, {
      status: status === 'escalated' ? 'escalated' : status === 'closed' ? 'resolved' : status,
      resolvedAt: status === 'resolved' || status === 'closed' ? now : undefined,
      notes: notes || undefined
    });

    await this.logAdminAudit({
      adminId: reviewerId,
      adminName: reviewerName,
      action: `SAFETY_STATUS_${status.toUpperCase()}`,
      module: 'safety',
      resourceId: incidentId,
      resourceType: 'safety',
      reason: notes,
      details: `Safety incident #${incidentId} updated to ${status} by ${reviewerName}`
    });

    return true;
  }

  public async assignCaseRecord(
    caseId: string,
    assignedAdmin: string,
    reviewerId: string,
    reviewerName: string,
    assignedTeam: string = 'support',
    notes?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    await this.repository.update('supportCases', caseId, {
      assignedAdmin,
      assignedTeam,
      status: 'under_review',
      updatedAt: now
    });

    await this.logAdminAudit({
      adminId: reviewerId,
      adminName: reviewerName,
      action: 'ASSIGN_SUPPORT_CASE',
      module: 'support',
      resourceId: caseId,
      resourceType: 'case',
      reason: notes,
      details: `Case #${caseId} assigned to ${assignedAdmin} (${assignedTeam}) by ${reviewerName}`
    });

    return true;
  }

  public async resolveCaseRecord(
    caseId: string,
    outcome: string,
    note: string,
    reviewerId: string,
    reviewerName: string,
    financialActionTaken: boolean = false
  ): Promise<boolean> {
    const now = new Date().toISOString();
    await this.repository.update('supportCases', caseId, {
      status: 'resolved',
      resolvedAt: now,
      updatedAt: now,
      resolution: {
        outcome,
        note,
        resolvedBy: reviewerName,
        resolvedAt: now,
        financialActionTaken
      }
    });

    await this.logAdminAudit({
      adminId: reviewerId,
      adminName: reviewerName,
      action: 'RESOLVE_SUPPORT_CASE',
      module: 'support',
      resourceId: caseId,
      resourceType: 'case',
      reason: note,
      details: `Case #${caseId} resolved (${outcome}) by ${reviewerName}`
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGGING HELPER (ITEM 13, 15)
  // --------------------------------------------------------------------------

  public async logAdminAudit(params: {
    adminId: string;
    adminName: string;
    action: string;
    module: string;
    resourceId: string;
    resourceType: string;
    previousState?: any;
    newState?: any;
    reason?: string;
    details?: string;
  }): Promise<void> {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminEmail: params.adminId.includes('@') ? params.adminId : `${params.adminId}@golife.pk`,
      adminRole: 'super_admin',
      action: params.action,
      module: params.module,
      targetId: params.resourceId,
      targetType: (params.resourceType as any) || 'system',
      target: params.resourceId,
      details: params.details || `${params.action} on ${params.resourceType} (${params.resourceId})`,
      ipAddress: typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost'
        ? `${window.location.hostname} (Admin Client)`
        : 'Admin Client Console',
      timestamp: new Date().toISOString()
    };

    await this.repository.create('auditLogs', log.id, log);
  }
}

export const centralAdminControl = new CentralAdminControlService();

// ============================================================================
// DETERMINISTIC CENTRAL PRICING ADAPTER (Cross-Surface Parity)
// ============================================================================

export type PricingCalculationInput = {
  category: string;
  city: string;
  distanceKm: number;
  durationMinutes: number;
  baseOverrideFare?: number;
  paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'card' | string;
  driverId?: string;
  waitingMinutes?: number;
};

export type CalculatedFareBreakdown = {
  grossFare: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  serviceFee: number;
  bookingFee: number;
  taxAmount: number;
  platformCommission: number;
  driverNetEarnings: number;
  ruleVersionId: string;
  calculatedAt: string;
};

export function calculateDeterministicFare(
  input: PricingCalculationInput,
  rule: CentralPricingRule = DEFAULT_CENTRAL_PRICING_RULE
): CalculatedFareBreakdown {
  const snapshot = calculateCentralFare(input, rule);
  return {
    grossFare: snapshot.passengerTotal,
    baseFare: snapshot.baseFare,
    distanceFare: snapshot.distanceFare,
    timeFare: snapshot.timeFare,
    serviceFee: snapshot.passengerServiceFee,
    bookingFee: snapshot.passengerBookingFee,
    taxAmount: snapshot.taxAmount,
    platformCommission: snapshot.platformCommissionEarned,
    driverNetEarnings: snapshot.driverNetEarnings,
    ruleVersionId: snapshot.ruleVersionId || 'PRV-2027-V1',
    calculatedAt: snapshot.calculatedAt || new Date().toISOString()
  };
}

