/**
 * GoLife Taxi Pakistan - DriverService
 * Connects Drivers & Verification to Firestore/Demo repository with idempotency and audit protection.
 */

import { BaseService } from './BaseService';
import { Driver, VerificationItem } from '../../types';
import { EntityFilter, PaginatedResult, PaginationOptions, ServiceResponse } from './types';

export class DriverService extends BaseService {
  /**
   * Fetch drivers with city/status filter and pagination
   */
  public async getDrivers(filters?: EntityFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Driver>> {
    return this.repository.list<Driver>('drivers', filters, pagination);
  }

  /**
   * Get single driver by ID
   */
  public async getDriverById(driverId: string): Promise<Driver | null> {
    return this.repository.getById<Driver>('drivers', driverId);
  }

  /**
   * Update driver profile details
   */
  public async updateDriver(driverId: string, updates: Partial<Driver>): Promise<ServiceResponse<boolean>> {
    const success = await this.repository.update('drivers', driverId, updates);
    return this.formatResponse(success);
  }

  /**
   * Change driver account status (Suspend, Reinstate, Block) with idempotency protection
   */
  public async setAccountStatus(
    driverId: string,
    status: 'active' | 'suspended' | 'blocked',
    reason: string,
    durationHours?: number
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('DRIVER_STATUS_CHANGE', driverId, async () => {
      const updates: Partial<Driver> = {
        accountStatus: status
      };
      const ok = await this.repository.update('drivers', driverId, updates);

      // Record suspension dossier if suspended
      if (status === 'suspended') {
        const suspensionRecord = {
          id: `susp-${Date.now()}`,
          driverId,
          reason,
          durationHours: durationHours || 24,
          suspendedAt: new Date().toISOString(),
          status: 'active'
        };
        await this.repository.create('driverSuspensions', suspensionRecord.id, suspensionRecord);
      }
      return ok;
    });
  }

  /**
   * Reinstate a suspended or restricted driver
   */
  public async reinstateDriver(driverId: string, reason: string, adminId: string): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('DRIVER_REINSTATE', driverId, async () => {
      const ok = await this.repository.update('drivers', driverId, {
        accountStatus: 'active',
        isSuspended: false,
        reinstatedAt: new Date().toISOString(),
        reinstatementNote: reason
      });
      return ok;
    });
  }

  /**
   * Central driver operational controls (city eligibility, category eligibility, risk status)
   */
  public async updateDriverOperationalEligibility(
    driverId: string,
    controls: {
      cityEligibility?: string[];
      categoryEligibility?: string[];
      onlineAllowed?: boolean;
      riskStatus?: 'normal' | 'watchlist' | 'restricted';
      manualReviewRequired?: boolean;
    }
  ): Promise<ServiceResponse<boolean>> {
    const ok = await this.repository.update('drivers', driverId, {
      ...controls,
      updatedAt: new Date().toISOString()
    });
    return this.formatResponse(ok);
  }

  /**
   * Update document verification status
   */
  public async verifyDocument(
    driverId: string,
    docKey: string,
    verificationStatus: 'verified' | 'rejected' | 'pending',
    reasonNote?: string
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('DOCUMENT_VERIFY', `${driverId}_${docKey}`, async () => {
      const docRecord = {
        driverId,
        documentType: docKey,
        status: verificationStatus,
        verifiedAt: new Date().toISOString(),
        notes: reasonNote || ''
      };
      const ok = await this.repository.create('driverDocuments', `${driverId}_${docKey}`, docRecord);
      return ok;
    });
  }

  /**
   * Adjust driver wallet balance
   */
  public async adjustWallet(driverId: string, deltaAmount: number, reason: string): Promise<ServiceResponse<number>> {
    return this.executeIdempotent('DRIVER_WALLET_ADJUST', driverId, async () => {
      const driver = await this.getDriverById(driverId);
      const currentBalance = driver?.walletBalance || 0;
      const newBalance = currentBalance + deltaAmount;

      await this.repository.update('drivers', driverId, { walletBalance: newBalance });

      // Log wallet transaction
      const tx = {
        id: `tx-${Date.now()}`,
        userId: driverId,
        userType: 'driver',
        amount: Math.abs(deltaAmount),
        type: deltaAmount >= 0 ? 'credit' : 'debit',
        description: reason,
        date: new Date().toISOString()
      };
      await this.repository.create('walletTransactions', tx.id, tx);
      return newBalance;
    });
  }

  /**
   * Subscribe to real-time drivers stream
   */
  public subscribeDrivers(
    onData: (drivers: Driver[]) => void,
    onError?: (err: Error) => void,
    filters?: EntityFilter
  ): () => void {
    return this.repository.subscribe<Driver>('drivers', onData, onError);
  }

  /**
   * Calculate aggregated driver operational and trip stats
   */
  public async getDriverStats(driverId: string): Promise<{
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    totalEarnings: number;
    rating: number;
    acceptanceRate: number;
    cancellationRate: number;
  }> {
    const ridesRes = await this.repository.list<any>('rides');
    const driverRides = ridesRes.items.filter((r) => r.driverId === driverId);

    const completed = driverRides.filter((r) => r.status === 'completed');
    const cancelled = driverRides.filter((r) => r.status === 'cancelled' && r.cancelledBy === 'driver');
    const totalEarnings = completed.reduce((sum, r) => sum + (Number(r.driverEarnings) || 0), 0);
    const ratings = completed
      .map((r) => r.driverRating || r.rating)
      .filter((rate) => typeof rate === 'number' && rate > 0);
    const rating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 5.0;

    const totalOffers = Math.max(driverRides.length, 1);
    const acceptanceRate = Math.min(100, Math.round((driverRides.length / totalOffers) * 100));
    const cancellationRate = driverRides.length > 0
      ? Math.round((cancelled.length / driverRides.length) * 100)
      : 0;

    return {
      totalRides: driverRides.length,
      completedRides: completed.length,
      cancelledRides: cancelled.length,
      totalEarnings,
      rating: Number(rating.toFixed(1)),
      acceptanceRate,
      cancellationRate
    };
  }
}

export const driverService = new DriverService();
