/**
 * GoLife Taxi Pakistan - PassengerService
 * Manages passenger records, wallet balances, account status, and ride history in Firestore/Demo.
 */

import { BaseService } from './BaseService';
import { Passenger } from '../../types';
import { EntityFilter, PaginatedResult, PaginationOptions, ServiceResponse } from './types';

export class PassengerService extends BaseService {
  /**
   * List passengers with filters
   */
  public async getPassengers(filters?: EntityFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Passenger>> {
    return this.repository.list<Passenger>('passengers', filters, pagination);
  }

  /**
   * Get single passenger by ID
   */
  public async getPassengerById(passengerId: string): Promise<Passenger | null> {
    return this.repository.getById<Passenger>('passengers', passengerId);
  }

  /**
   * Update passenger account status (Active, Suspended, Blocked) with idempotency
   */
  public async setAccountStatus(
    passengerId: string,
    status: 'active' | 'suspended' | 'blocked',
    reason: string
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('PASSENGER_STATUS_CHANGE', passengerId, async () => {
      const ok = await this.repository.update('passengers', passengerId, {
        accountStatus: status,
        statusNote: reason,
        updatedAt: new Date().toISOString()
      });
      return ok;
    });
  }

  /**
   * Central ride access & payment availability controls
   */
  public async updatePassengerControls(
    passengerId: string,
    controls: {
      rideBookingEnabled?: boolean;
      cashPaymentEnabled?: boolean;
      walletPaymentEnabled?: boolean;
      promoUsageEnabled?: boolean;
      riskStatus?: 'normal' | 'watchlist' | 'restricted';
    }
  ): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('passengers', passengerId, {
      ...controls,
      updatedAt: new Date().toISOString()
    });
    return this.formatResponse(ok);
  }

  /**
   * Adjust passenger wallet balance
   */
  public async adjustWallet(passengerId: string, deltaAmount: number, note: string): Promise<ServiceResponse<number>> {
    return this.executeIdempotent('PASSENGER_WALLET_ADJUST', passengerId, async () => {
      const passenger = await this.getPassengerById(passengerId);
      const currentBalance = passenger?.walletBalance || 0;
      const newBalance = currentBalance + deltaAmount;

      await this.repository.update('passengers', passengerId, { walletBalance: newBalance });

      const tx = {
        id: `tx-pass-${Date.now()}`,
        userId: passengerId,
        userType: 'passenger',
        amount: Math.abs(deltaAmount),
        type: deltaAmount >= 0 ? 'credit' : 'debit',
        description: note,
        date: new Date().toISOString()
      };
      await this.repository.create('walletTransactions', tx.id, tx);
      return newBalance;
    });
  }

  /**
   * Subscribe to real-time passengers stream
   */
  public subscribePassengers(
    onData: (passengers: Passenger[]) => void,
    onError?: (err: Error) => void,
    filters?: EntityFilter
  ): () => void {
    return this.repository.subscribe<Passenger>('passengers', onData, onError);
  }

  /**
   * Calculate aggregated passenger ride statistics from ride records
   */
  public async getPassengerRideStats(passengerId: string): Promise<{
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    totalSpent: number;
    averageRating: number;
  }> {
    const ridesRes = await this.repository.list<any>('rides');
    const passengerRides = ridesRes.items.filter(
      (r) => r.passengerId === passengerId || r.riderId === passengerId
    );

    const completed = passengerRides.filter((r) => r.status === 'completed');
    const cancelled = passengerRides.filter((r) => r.status === 'cancelled');
    const totalSpent = completed.reduce((sum, r) => sum + (Number(r.fare) || Number(r.finalFare) || 0), 0);
    const ratings = completed
      .map((r) => r.rating || r.passengerRating)
      .filter((rate) => typeof rate === 'number' && rate > 0);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 5.0;

    return {
      totalRides: passengerRides.length,
      completedRides: completed.length,
      cancelledRides: cancelled.length,
      totalSpent,
      averageRating: Number(averageRating.toFixed(1))
    };
  }

  /**
   * Update passenger profile info
   */
  public async updatePassenger(passengerId: string, updates: Partial<Passenger>): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('passengers', passengerId, updates);
    return this.formatResponse(ok);
  }
}

export const passengerService = new PassengerService();
