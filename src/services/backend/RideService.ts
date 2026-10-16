/**
 * GoLife Taxi Pakistan - RideService
 * Handles ride lifecycle, dispatch assignment, cancellations, and preserves historical financial records.
 */

import { BaseService } from './BaseService';
import { Ride, RideStatus, CanonicalRideState } from '../../types';
import { EntityFilter, PaginatedResult, PaginationOptions, ServiceResponse } from './types';
import { centralAdminControl, normalizeRideState } from './CentralAdminControl';

export class RideService extends BaseService {
  /**
   * List rides with filters and pagination
   */
  public async getRides(filters?: EntityFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Ride>> {
    return this.repository.list<Ride>('rides', filters, pagination);
  }

  /**
   * Get single ride with historical snapshot
   */
  public async getRideById(rideId: string): Promise<Ride | null> {
    return this.repository.getById<Ride>('rides', rideId);
  }

  /**
   * Central lifecycle transition with canonical state validation
   */
  public async updateLifecycleState(
    rideId: string,
    targetState: CanonicalRideState,
    actor: { id: string; role: 'passenger' | 'driver' | 'admin' | 'system'; name?: string },
    note?: string
  ): Promise<ServiceResponse<boolean>> {
    const res = await centralAdminControl.transitionRideState(rideId, targetState, actor, note);
    if (!res.success) {
      return {
        success: false,
        error: res.error,
        source: this.isDemo ? 'demo_repository' : 'firestore_repository'
      };
    }
    return {
      success: true,
      data: true,
      source: this.isDemo ? 'demo_repository' : 'firestore_repository'
    };
  }

  /**
   * Assign driver to pending ride
   */
  public async assignDriver(rideId: string, driverId: string, driverName: string): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('RIDE_ASSIGN_DRIVER', rideId, async () => {
      const now = new Date().toISOString();
      const updates = {
        driverId,
        driverName,
        status: 'driver_assigned' as RideStatus,
        assignedAt: now,
        updatedAt: now
      };

      const ok = await this.repository.update('rides', rideId, updates);

      // Record immutable ride event
      const eventRecord = {
        id: `rev-${Date.now()}`,
        rideId,
        eventType: 'DRIVER_ASSIGNED',
        driverId,
        timestamp: now,
        note: `Assigned driver ${driverName} (${driverId})`
      };
      await this.repository.create('rideEvents', eventRecord.id, eventRecord);

      return ok;
    });
  }

  /**
   * Cancel ride with reason and attribution
   */
  public async cancelRide(
    rideId: string,
    reason: string,
    cancelledBy: 'passenger' | 'driver' | 'admin' | 'system' = 'admin'
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('RIDE_CANCEL', rideId, async () => {
      const ride = await this.getRideById(rideId);
      // Guard: Completed rides can NEVER be cancelled or have fares altered
      if (ride?.status === 'completed') {
        throw new Error('Historical Protection: Completed rides cannot be cancelled or altered.');
      }

      const now = new Date().toISOString();
      const updates = {
        status: 'cancelled' as RideStatus,
        cancellationReason: reason,
        cancelledBy,
        cancelledAt: now,
        updatedAt: now
      };

      const ok = await this.repository.update('rides', rideId, updates);

      const eventRecord = {
        id: `rev-${Date.now()}`,
        rideId,
        eventType: 'RIDE_CANCELLED',
        cancelledBy,
        reason,
        timestamp: now
      };
      await this.repository.create('rideEvents', eventRecord.id, eventRecord);

      return ok;
    });
  }

  /**
   * Flag/Unflag ride for manual operations review
   */
  public async flagRide(rideId: string, flagReason: string, isFlagged: boolean): Promise<ServiceResponse<boolean>> {
    const updates = {
      isFlagged,
      flagReason: isFlagged ? flagReason : null,
      flaggedAt: isFlagged ? new Date().toISOString() : null
    };
    const ok = await this.repository.update('rides', rideId, updates);
    return this.formatResponse(ok);
  }

  /**
   * Subscribe to real-time rides stream
   */
  public subscribeRides(
    onData: (rides: Ride[]) => void,
    onError?: (err: Error) => void,
    filters?: EntityFilter
  ): () => void {
    return this.repository.subscribe<Ride>('rides', onData, onError);
  }

  /**
   * Update ride operational status
   */
  public async updateRideStatus(
    rideId: string,
    status: RideStatus,
    note?: string
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('RIDE_STATUS_CHANGE', `${rideId}_${status}`, async () => {
      const now = new Date().toISOString();
      const updates: any = {
        status,
        updatedAt: now
      };
      if (status === 'completed') {
        updates.completedAt = now;
      }
      const ok = await this.repository.update('rides', rideId, updates);

      const eventRecord = {
        id: `rev-${Date.now()}`,
        rideId,
        eventType: `STATUS_${status.toUpperCase()}`,
        timestamp: now,
        note: note || `Ride status updated to ${status}`
      };
      await this.repository.create('rideEvents', eventRecord.id, eventRecord);

      return ok;
    });
  }

  /**
   * Fetch truthful operational timeline events for a ride.
   * Does NOT invent missing historical events. If an event is missing, it is omitted or marked unavailable.
   */
  public async getRideTimeline(rideId: string): Promise<Array<{
    stage: 'requested' | 'assigned' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
    title: string;
    timestamp: string | null;
    recorded: boolean;
    note?: string;
  }>> {
    const ride = await this.getRideById(rideId);
    if (!ride) return [];

    // Fetch actual stored ride events
    const eventsRes = await this.repository.list<any>('rideEvents');
    const rideEvents = eventsRes.items.filter((e) => e.rideId === rideId);

    const findEventTime = (typePrefix: string) => {
      const ev = rideEvents.find((e) => e.eventType && e.eventType.includes(typePrefix));
      return ev?.timestamp || null;
    };

    const timeline: Array<{
      stage: 'requested' | 'assigned' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
      title: string;
      timestamp: string | null;
      recorded: boolean;
      note?: string;
    }> = [];

    // 1. Booking Requested
    const reqTime = (ride as any).createdAt || (ride as any).requestTime || (ride as any).startTime || findEventTime('REQUESTED');
    timeline.push({
      stage: 'requested',
      title: 'Booking Requested by Passenger',
      timestamp: reqTime || null,
      recorded: Boolean(reqTime),
      note: reqTime ? `Pickup: ${ride.pickup?.address || 'Pickup address'}` : 'Historical timestamp not recorded'
    });

    // 2. Driver Assigned
    const assignTime = (ride as any).assignedAt || findEventTime('ASSIGN');
    const hasAssigned = Boolean(ride.driverId || assignTime);
    timeline.push({
      stage: 'assigned',
      title: ride.driverName ? `Driver Assigned (${ride.driverName})` : 'Driver Assignment',
      timestamp: assignTime || null,
      recorded: Boolean(assignTime),
      note: hasAssigned
        ? (assignTime ? `Captain accepted dispatch` : 'Driver was assigned; timestamp unrecorded')
        : 'Pending driver assignment'
    });

    // 3. Driver Arrived
    const arrivedTime = (ride as any).arrivedAt || findEventTime('ARRIVED');
    const isArrivedOrLater = ['arrived', 'in_progress', 'completed'].includes(ride.status);
    timeline.push({
      stage: 'arrived',
      title: 'Captain Arrived at Pickup',
      timestamp: arrivedTime || null,
      recorded: Boolean(arrivedTime),
      note: isArrivedOrLater
        ? (arrivedTime ? 'Vehicle arrived at pickup location' : 'Status reached; timestamp unrecorded')
        : 'Waiting for driver arrival'
    });

    // 4. Trip Started (In Progress)
    const startTime = (ride as any).startedAt || (ride as any).pickupTime || findEventTime('IN_PROGRESS');
    const isInProgressOrDone = ['in_progress', 'completed'].includes(ride.status);
    timeline.push({
      stage: 'in_progress',
      title: 'Trip Started & In-Transit',
      timestamp: startTime || null,
      recorded: Boolean(startTime),
      note: isInProgressOrDone
        ? (startTime ? 'Passenger boarded, meter started' : 'Status reached; timestamp unrecorded')
        : 'Trip has not yet commenced'
    });

    // 5. Completed or Cancelled
    if (ride.status === 'cancelled') {
      const cancelTime = (ride as any).cancelledAt || findEventTime('CANCEL');
      timeline.push({
        stage: 'cancelled',
        title: `Ride Cancelled (${(ride as any).cancelledBy || 'system'})`,
        timestamp: cancelTime || null,
        recorded: Boolean(cancelTime),
        note: (ride as any).cancellationReason || 'Ride was cancelled'
      });
    } else {
      const compTime = (ride as any).completedAt || (ride as any).endTime || findEventTime('COMPLETED');
      const isDone = ride.status === 'completed';
      timeline.push({
        stage: 'completed',
        title: 'Ride Completed & Fare Settled',
        timestamp: compTime || null,
        recorded: Boolean(compTime),
        note: isDone
          ? (compTime ? `Fare: PKR ${ride.fare || (ride as any).finalFare || 0}` : 'Completed; timestamp unrecorded')
          : 'Pending ride completion'
      });
    }

    return timeline;
  }
}

export const rideService = new RideService();
