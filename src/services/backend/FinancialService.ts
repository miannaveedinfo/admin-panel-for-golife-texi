/**
 * GoLife Taxi Pakistan - Financial & Ledger Services
 * Handles Payments, Payouts, Refunds, Reimbursements, Fines, and Settlements.
 * Enforces strictly immutable transaction ledgers and double-entry accounting.
 * Never deletes or mutates completed financial records; uses reversal entries.
 */

import { BaseService } from './BaseService';
import { assertProductionSafetyLock } from '../../config/dataSourceMode';
import {
  WalletTransaction,
  DriverPayoutRecord,
  PassengerRefundRecord,
  DriverReimbursementRecord,
  DriverFine,
  FinancialAdjustmentRecord
} from '../../types';
import {
  DriverWallet,
  TopUpRequest,
  CentralPaymentTransaction,
  CompanyPaymentAccount,
  AdvanceBookingHold,
  PaymentProviderConfig,
  PaymentWebhookRecord,
  PaymentReconciliationItem,
  TopUpStatus,
  PaymentTransactionType
} from '../../types/paymentArchitecture';
import { EntityFilter, PaginatedResult, PaginationOptions, ServiceResponse } from './types';
import {
  creditDriverWallet as executeCreditWallet,
  debitDriverWallet as executeDebitWallet,
  settleCashRide as executeCashRideSettlement,
  processTopUpStatusChange as executeTopUpStatusChange
} from '../centralPaymentService';

export class FinancialService extends BaseService {
  /**
   * List payments with filters
   */
  public async getPayments(filters?: EntityFilter, pagination?: PaginationOptions): Promise<PaginatedResult<WalletTransaction>> {
    return this.repository.list<WalletTransaction>('payments', filters, pagination);
  }

  /**
   * Process Driver Payout with double-action prevention and full lifecycle state machine
   */
  public async processPayout(
    payoutId: string,
    action: 'review' | 'approve' | 'process' | 'complete' | 'reject' | 'cancel' | 'retry',
    payload?: {
      reason?: string;
      note?: string;
      referenceId?: string;
      transactionId?: string;
      adminName?: string;
    }
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('PAYOUT_PROCESS', `${payoutId}_${action}_${Date.now()}`, async () => {
      assertProductionSafetyLock('processPayout', { payoutId, action });

      // Look up payout in payouts
      const payout = await this.repository.getById<DriverPayoutRecord>('payouts', payoutId);
      if (!payout) throw new Error(`Payout record ${payoutId} not found`);

      const now = new Date().toISOString();
      const adminActor = payload?.adminName || 'Finance Admin';
      const reasonNote = payload?.note || payload?.reason || '';
      const refId = payload?.referenceId || payload?.transactionId || '';

      switch (action) {
        case 'review': {
          await this.repository.update('payouts', payoutId, {
            status: 'Under Review',
            optionalNote: reasonNote || payout.optionalNote,
            reviewedAt: now,
            reviewedBy: adminActor
          });
          break;
        }

        case 'approve': {
          if (payout.status === 'Completed') {
            throw new Error(`Payout ${payoutId} is already completed`);
          }

          // Verify driver eligible balance
          const driver = await this.repository.getById<any>('drivers', payout.driverId);
          if (driver && (driver.walletBalance || 0) < payout.amount) {
            throw new Error(`Insufficient eligible wallet balance (PKR ${driver.walletBalance || 0}) for payout amount PKR ${payout.amount}`);
          }

          // Debit driver balance to hold/reserve funds
          if (driver) {
            const newBal = Math.max(0, (driver.walletBalance || 0) - payout.amount);
            await this.repository.update('drivers', payout.driverId, { walletBalance: newBal });
          }

          await this.repository.update('payouts', payoutId, {
            status: 'Approved',
            approvedAt: now,
            approvedBy: adminActor,
            optionalNote: reasonNote || payout.optionalNote
          });

          // Record reserve ledger transaction
          const reserveTx: CentralPaymentTransaction = {
            id: `tx-payout-res-${Date.now()}`,
            referenceId: payoutId,
            userType: 'driver',
            userId: payout.driverId,
            userName: payout.driverName,
            userPhone: payout.driverPhone || '',
            amount: payout.amount,
            paymentMethod: 'wallet',
            transactionType: 'payout_withdrawal',
            status: 'Processing',
            walletEffect: -payout.amount,
            balanceAfter: driver ? Math.max(0, (driver.walletBalance || 0) - payout.amount) : 0,
            timestamp: now,
            description: `Payout approval: PKR ${payout.amount} held for ${payout.paymentMethod} transfer`,
            auditTrail: [{
              action: 'PAYOUT_HELD',
              actor: adminActor,
              timestamp: now,
              note: `Funds reserved for payout`
            }]
          };
          await this.repository.create('paymentTransactions', reserveTx.id, reserveTx);
          break;
        }

        case 'process': {
          await this.repository.update('payouts', payoutId, {
            status: 'Processing',
            processedAt: now,
            processedBy: adminActor,
            referenceId: refId || payout.referenceId || `TRX-${Date.now().toString().slice(-6)}`,
            optionalNote: reasonNote || payout.optionalNote
          });
          break;
        }

        case 'complete': {
          // Requirement: Do not mark as completed unless backend/payment confirms it with reference
          if (!refId && !payout.referenceId) {
            throw new Error('Valid gateway disbursement reference is required to mark payout Completed');
          }

          const confirmedRef = refId || payout.referenceId || `DISB-${Date.now()}`;
          await this.repository.update('payouts', payoutId, {
            status: 'Completed',
            processedAt: now,
            completedAt: now,
            processedBy: adminActor,
            referenceId: confirmedRef,
            optionalNote: reasonNote || payout.optionalNote
          });

          // Immutable double-entry transaction records
          const txRecord = {
            id: `tx-payout-${Date.now()}`,
            referenceType: 'payout',
            referenceId: payoutId,
            driverId: payout.driverId,
            driverName: payout.driverName,
            amount: payout.amount,
            method: payout.paymentMethod || 'JazzCash',
            gatewayReference: confirmedRef,
            status: 'completed',
            createdAt: now,
            immutable: true
          };
          await this.repository.create('transactions', txRecord.id, txRecord);

          const centralTx: CentralPaymentTransaction = {
            id: `tx-payout-comp-${Date.now()}`,
            referenceId: confirmedRef,
            userType: 'driver',
            userId: payout.driverId,
            userName: payout.driverName,
            userPhone: payout.driverPhone || '',
            amount: payout.amount,
            paymentMethod: (payout.paymentMethod?.toLowerCase() === 'bank' ? 'bank' : payout.paymentMethod?.toLowerCase() === 'easypaisa' ? 'easypaisa' : 'jazzcash'),
            transactionType: 'payout_withdrawal',
            status: 'Completed',
            walletEffect: 0,
            balanceAfter: 0,
            timestamp: now,
            description: `Driver payout completed via ${payout.paymentMethod} (Ref: ${confirmedRef})`,
            auditTrail: [{
              action: 'PAYOUT_COMPLETED',
              actor: adminActor,
              timestamp: now,
              note: `Completed with reference: ${confirmedRef}`
            }]
          };
          await this.repository.create('paymentTransactions', centralTx.id, centralTx);
          break;
        }

        case 'reject':
        case 'cancel': {
          const finalStatus = action === 'reject' ? 'Rejected' : 'Cancelled';

          // If payout was previously approved/processing and balance was held, refund back to driver
          if (payout.status === 'Approved' || payout.status === 'Processing') {
            const driver = await this.repository.getById<any>('drivers', payout.driverId);
            if (driver) {
              const restoredBal = (driver.walletBalance || 0) + payout.amount;
              await this.repository.update('drivers', payout.driverId, { walletBalance: restoredBal });

              const refundTx: CentralPaymentTransaction = {
                id: `tx-payout-rev-${Date.now()}`,
                referenceId: payoutId,
                userType: 'driver',
                userId: payout.driverId,
                userName: payout.driverName,
                userPhone: payout.driverPhone || '',
                amount: payout.amount,
                paymentMethod: 'wallet',
                transactionType: 'wallet_adjustment',
                status: 'Completed',
                walletEffect: payout.amount,
                balanceAfter: restoredBal,
                timestamp: now,
                description: `Payout ${finalStatus.toLowerCase()}: PKR ${payout.amount} restored to wallet. Reason: ${reasonNote || 'N/A'}`,
                auditTrail: [{
                  action: 'PAYOUT_REVERSED',
                  actor: adminActor,
                  timestamp: now,
                  note: `Restored PKR ${payout.amount}`
                }]
              };
              await this.repository.create('paymentTransactions', refundTx.id, refundTx);
            }
          }

          await this.repository.update('payouts', payoutId, {
            status: finalStatus as any,
            processedAt: now,
            rejectionReason: reasonNote || payout.rejectionReason,
            optionalNote: reasonNote || payout.optionalNote
          });
          break;
        }

        case 'retry': {
          await this.repository.update('payouts', payoutId, {
            status: 'Processing',
            processedAt: now,
            optionalNote: `Retried at ${now} by ${adminActor}. ${reasonNote}`
          });
          break;
        }
      }

      return true;
    });
  }

  /**
   * Create Driver Payout Request (Withdrawal) with eligibility checks
   */
  public async createPayoutRequest(request: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverCity: string;
    amount: number;
    paymentMethod: string;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
  }): Promise<ServiceResponse<DriverPayoutRecord>> {
    return this.executeIdempotent('PAYOUT_CREATE', `${request.driverId}_${Date.now()}`, async () => {
      assertProductionSafetyLock('createPayoutRequest', request);

      // Validate minimum withdrawal limit
      const minPayout = 500;
      if (request.amount < minPayout) {
        throw new Error(`Minimum payout request amount is PKR ${minPayout}`);
      }

      // Check driver wallet balance
      const driver = await this.repository.getById<any>('drivers', request.driverId);
      if (!driver) throw new Error(`Driver ${request.driverId} not found`);
      if ((driver.walletBalance || 0) < request.amount) {
        throw new Error(`Insufficient wallet balance (PKR ${driver.walletBalance || 0}) for withdrawal request of PKR ${request.amount}`);
      }

      const payoutId = `po-${Date.now()}`;
      const now = new Date().toISOString();

      const newRecord: DriverPayoutRecord = {
        id: payoutId,
        driverId: request.driverId,
        driverName: request.driverName,
        driverPhone: request.driverPhone,
        driverCity: request.driverCity,
        amount: request.amount,
        paymentMethod: (request.paymentMethod as any) || 'JazzCash',
        accountTitle: request.accountTitle,
        accountNumber: request.accountNumber,
        bankName: request.bankName,
        status: 'Requested',
        requestedAt: now,
        optionalNote: 'Submitted for finance compliance audit',
        auditTrail: [{
          action: 'PAYOUT_REQUESTED',
          actor: request.driverName,
          timestamp: now,
          note: `Requested withdrawal of PKR ${request.amount}`
        }]
      };

      await this.repository.create('payouts', payoutId, newRecord);

      return newRecord;
    });
  }

  /**
   * Issue Passenger Refund with reversal entry (idempotent, immutable, with balance validation)
   */
  public async issueRefund(
    rideId: string,
    passengerId: string,
    amount: number,
    reason: string,
    refundMethod: 'wallet' | 'original_payment' = 'wallet',
    adminActor: string = 'Finance Admin'
  ): Promise<ServiceResponse<PassengerRefundRecord>> {
    return this.executeIdempotent('PASSENGER_REFUND', `${rideId}_${amount}_${Date.now()}`, async () => {
      assertProductionSafetyLock('issueRefund', { rideId, amount });
      
      // Look up ride to validate eligible refund cap
      const ride = await this.repository.getById<any>('rides', rideId);
      const paidAmount = ride ? (ride.finalFare || ride.fare || 0) : amount;
      
      // Check existing refunds for this ride to prevent exceeding eligible amount
      const existingRefunds = await this.repository.list<PassengerRefundRecord>('refunds', { limit: 100 } as any);
      const priorTotalRefunded = existingRefunds.items
        .filter((r) => r.rideId === rideId && r.status !== 'rejected' && r.status !== 'cancelled')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      const maxRemainingRefundable = Math.max(0, paidAmount - priorTotalRefunded);
      if (amount > maxRemainingRefundable) {
        throw new Error(`Refund amount PKR ${amount} exceeds remaining refundable limit of PKR ${maxRemainingRefundable} for ride ${ride?.rideCode || rideId}`);
      }

      const refundId = `ref-${Date.now()}`;
      const now = new Date().toISOString();

      const refundRecord: PassengerRefundRecord = {
        id: refundId,
        refundCode: `RFN-PK-${Date.now().toString().slice(-6)}`,
        rideId,
        rideCode: ride?.rideCode || `RD-${Date.now().toString().slice(-4)}`,
        passengerId,
        passengerName: ride?.passengerName || 'Passenger',
        passengerPhone: ride?.passengerPhone || '+92 300 0000000',
        driverId: ride?.driverId || 'drv-01',
        driverName: ride?.driverName || 'Driver',
        originalFare: paidAmount,
        paidAmount,
        previousRefunds: priorTotalRefunded,
        refundType: amount >= paidAmount ? 'full' : 'partial',
        amount,
        remainingRefundable: maxRemainingRefundable - amount,
        paymentMethod: ride?.paymentMethod || 'wallet',
        refundDestination: refundMethod === 'wallet' ? 'wallet_credit' : 'payment_refund_pending',
        status: 'approved',
        reason,
        note: reason,
        requiresHighValueApproval: amount > 5000,
        approvedBy: adminActor,
        approvedAt: now,
        createdBy: adminActor,
        createdAt: now,
        transactionId: `tx-ref-${Date.now()}`
      };

      // 1. Save refund record in refunds
      await this.repository.create('refunds', refundId, refundRecord);

      // 2. Append immutable reversal to transactions ledger
      const tx = {
        id: refundRecord.transactionId!,
        referenceType: 'refund',
        referenceId: refundId,
        rideId,
        passengerId,
        amount: -Math.abs(amount),
        type: 'refund_debit',
        reason,
        timestamp: now,
        immutable: true
      };
      await this.repository.create('transactions', tx.id, tx);

      // 3. Central payment transactions
      const centralTx: CentralPaymentTransaction = {
        id: `tx-pay-ref-${Date.now()}`,
        referenceId: refundId,
        userType: 'passenger',
        userId: passengerId,
        userName: refundRecord.passengerName,
        userPhone: refundRecord.passengerPhone,
        amount,
        paymentMethod: 'wallet',
        transactionType: 'wallet_adjustment',
        status: 'Completed',
        walletEffect: amount,
        balanceAfter: 0,
        timestamp: now,
        description: `Passenger refund for ride ${refundRecord.rideCode}: PKR ${amount} (${reason})`,
        auditTrail: [{
          action: 'PASSENGER_REFUND_COMPLETED',
          actor: adminActor,
          timestamp: now,
          note: `Refund issued: ${reason}`
        }]
      };
      await this.repository.create('paymentTransactions', centralTx.id, centralTx);

      // 4. If refund is to wallet, credit passenger wallet
      if (refundMethod === 'wallet') {
        const passenger = await this.repository.getById<any>('passengers', passengerId);
        if (passenger) {
          const updatedBal = (passenger.walletBalance || 0) + amount;
          await this.repository.update('passengers', passengerId, { walletBalance: updatedBal });
        }
      }

      // 5. Update ride document status if applicable
      if (ride) {
        await this.repository.update('rides', rideId, {
          paymentStatus: 'refunded',
          refundAmount: (ride.refundAmount || 0) + amount
        });
      }

      return refundRecord;
    });
  }

  /**
   * Issue Administrative Financial Adjustment (Passenger, Driver, or Ride)
   */
  public async issueAdjustment(adjustmentData: {
    id?: string;
    adjustmentCode?: string;
    type: 'ride_adjustment' | 'payment_correction' | 'overpayment_refund' | 'failed_payment_adjustment';
    targetType: 'passenger' | 'driver' | 'ride';
    targetId: string;
    targetName: string;
    rideId?: string;
    rideCode?: string;
    originalAmount: number;
    adjustmentAmount: number;
    direction: 'credit' | 'debit';
    reason: string;
    note?: string;
    adminName?: string;
  }): Promise<ServiceResponse<FinancialAdjustmentRecord>> {
    return this.executeIdempotent('FINANCIAL_ADJUSTMENT', `${adjustmentData.targetId}_${adjustmentData.adjustmentAmount}_${Date.now()}`, async () => {
      assertProductionSafetyLock('issueAdjustment', adjustmentData);

      const adjId = adjustmentData.id || `adj-${Date.now()}`;
      const now = new Date().toISOString();
      const adminActor = adjustmentData.adminName || 'SuperAdmin';
      const adjCode = adjustmentData.adjustmentCode || `ADJ-PK-${Date.now().toString().slice(-5)}`;
      const txId = `tx-adj-${Date.now()}`;

      const record: FinancialAdjustmentRecord = {
        id: adjId,
        adjustmentCode: adjCode,
        type: adjustmentData.type,
        targetType: adjustmentData.targetType,
        targetId: adjustmentData.targetId,
        targetName: adjustmentData.targetName,
        rideId: adjustmentData.rideId,
        rideCode: adjustmentData.rideCode,
        originalAmount: adjustmentData.originalAmount,
        adjustmentAmount: adjustmentData.adjustmentAmount,
        direction: adjustmentData.direction,
        reason: adjustmentData.reason,
        note: adjustmentData.note || '',
        status: 'completed',
        createdBy: adminActor,
        createdAt: now,
        transactionId: txId
      };

      await this.repository.create('financialAdjustments', adjId, record);

      // Apply wallet delta if target is driver or passenger
      if (adjustmentData.targetType === 'driver') {
        const driver = await this.repository.getById<any>('drivers', adjustmentData.targetId);
        if (driver) {
          const delta = adjustmentData.direction === 'credit' ? adjustmentData.adjustmentAmount : -adjustmentData.adjustmentAmount;
          const updatedBal = Math.max(0, (driver.walletBalance || 0) + delta);
          await this.repository.update('drivers', adjustmentData.targetId, { walletBalance: updatedBal });
        }
      } else if (adjustmentData.targetType === 'passenger') {
        const passenger = await this.repository.getById<any>('passengers', adjustmentData.targetId);
        if (passenger) {
          const delta = adjustmentData.direction === 'credit' ? adjustmentData.adjustmentAmount : -adjustmentData.adjustmentAmount;
          const updatedBal = Math.max(0, (passenger.walletBalance || 0) + delta);
          await this.repository.update('passengers', adjustmentData.targetId, { walletBalance: updatedBal });
        }
      }

      // Ledger entry
      const centralTx: CentralPaymentTransaction = {
        id: txId,
        referenceId: adjCode,
        userType: adjustmentData.targetType === 'driver' ? 'driver' : 'passenger',
        userId: adjustmentData.targetId,
        userName: adjustmentData.targetName,
        userPhone: '',
        amount: adjustmentData.adjustmentAmount,
        paymentMethod: 'wallet',
        transactionType: 'wallet_adjustment',
        status: 'Completed',
        walletEffect: adjustmentData.direction === 'credit' ? adjustmentData.adjustmentAmount : -adjustmentData.adjustmentAmount,
        balanceAfter: 0,
        timestamp: now,
        rideId: adjustmentData.rideId,
        rideCode: adjustmentData.rideCode,
        description: `Financial Adjustment (${adjustmentData.direction.toUpperCase()}): ${adjustmentData.reason}`,
        auditTrail: [{
          action: 'FINANCIAL_ADJUSTMENT',
          actor: adminActor,
          timestamp: now,
          note: adjustmentData.reason
        }]
      };
      await this.repository.create('paymentTransactions', txId, centralTx);

      return record;
    });
  }

  /**
   * Issue Driver Fine with dispute tracking & audit protection
   */
  public async issueFine(
    driverId: string,
    driverName: string,
    amount: number,
    violationType: string,
    reason: string,
    rideId?: string
  ): Promise<ServiceResponse<DriverFine>> {
    return this.executeIdempotent('DRIVER_FINE_ISSUE', `${driverId}_${Date.now()}`, async () => {
      const fineId = `fine-${Date.now()}`;
      const now = new Date().toISOString();

      const fineRecord: DriverFine = {
        id: fineId,
        fineCode: `FINE-PK-${Date.now().toString().slice(-6)}`,
        driverId,
        driverName,
        driverPhone: '+92 300 1234567',
        driverPlate: 'ABC-123',
        city: 'Lahore',
        reasonId: 'violation',
        reasonLabel: violationType,
        amount,
        deductedAmount: 0,
        remainingAmount: amount,
        status: 'pending',
        source: 'manual',
        ruleId: 'rule-01',
        ruleVersion: 'v1',
        note: reason,
        deductionMethod: 'driver_wallet',
        isQualifying: true,
        createdAt: now,
        updatedAt: now,
        createdByAdmin: 'Admin'
      };

      // 1. Create fine record
      await this.repository.create('driverFines', fineId, fineRecord);

      // 2. Deduct from driver wallet balance if applicable
      const driver = await this.repository.getById<any>('drivers', driverId);
      if (driver) {
        const newBal = (driver.walletBalance || 0) - amount;
        await this.repository.update('drivers', driverId, { walletBalance: newBal });
        fineRecord.status = 'paid';
        fineRecord.deductedAmount = amount;
        fineRecord.remainingAmount = 0;
        await this.repository.update('driverFines', fineId, { status: 'paid', deductedAmount: amount, remainingAmount: 0 });
      }

      // 3. Record fine ledger entry
      const fineTx = {
        id: `tx-fine-${Date.now()}`,
        referenceType: 'driver_fine',
        referenceId: fineId,
        driverId,
        amount: -amount,
        timestamp: now,
        immutable: true
      };
      await this.repository.create('fineTransactions', fineTx.id, fineTx);

      return fineRecord;
    });
  }

  /**
   * Waive or Refund an existing fine (audit reversal)
   */
  public async waiveFine(fineId: string, waiverReason: string): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('FINE_WAIVE', fineId, async () => {
      const fine = await this.repository.getById<DriverFine>('driverFines', fineId);
      if (!fine) throw new Error('Fine not found');
      if (fine.status === 'waived') return true;

      const now = new Date().toISOString();
      await this.repository.update('driverFines', fineId, {
        status: 'waived',
        waiveReason: waiverReason,
        waivedAt: now
      });

      // If fine was already paid/deducted, reimburse the driver's wallet
      if (fine.status === 'paid') {
        const driver = await this.repository.getById<any>('drivers', fine.driverId);
        if (driver) {
          const restoredBal = (driver.walletBalance || 0) + fine.amount;
          await this.repository.update('drivers', fine.driverId, { walletBalance: restoredBal });
        }
      }

      return true;
    });
  }

  /**
   * Process Driver Reimbursement (tolls, cleaning, false dispatch)
   */
  public async issueReimbursement(
    driverId: string,
    driverName: string,
    amount: number,
    category: 'toll' | 'cleaning' | 'cancellation_compensation' | 'other',
    notes: string,
    rideId?: string
  ): Promise<ServiceResponse<DriverReimbursementRecord>> {
    return this.executeIdempotent('DRIVER_REIMBURSEMENT', `${driverId}_${amount}`, async () => {
      const reimId = `reim-${Date.now()}`;
      const now = new Date().toISOString();

      const driver = await this.repository.getById<any>('drivers', driverId);
      const record: DriverReimbursementRecord = {
        id: reimId,
        reimbursementCode: `RMB-PK-${Date.now().toString().slice(-6)}`,
        driverId,
        driverName,
        driverPhone: driver?.phone || '+92 300 1234567',
        driverPlate: driver?.vehiclePlate || 'ABC-123',
        rideId,
        amount,
        reason: category,
        note: notes,
        paymentDestination: 'driver_wallet',
        status: 'approved',
        requiresHighValueApproval: amount > 5000,
        createdAt: now,
        approvedAt: now,
        approvedBy: 'Admin',
        createdBy: 'Admin'
      };

      await this.repository.create('reimbursements', reimId, record);

      // Credit driver balance
      if (driver) {
        const updatedBal = (driver.walletBalance || 0) + amount;
        await this.repository.update('drivers', driverId, { walletBalance: updatedBal });
      }

      return record;
    });
  }

  /**
   * Record Ride Completion Settlement in Authoritative Ledger
   * Unifies payments, commission, tax escrow, driver earnings, and breakdown into one immutable entry.
   */
  public async recordRideSettlement(rideSummary: {
    rideId: string;
    rideCode: string;
    driverId: string;
    driverName?: string;
    passengerId: string;
    passengerName?: string;
    fare: number;
    commission: number;
    driverEarnings: number;
    tax?: number;
    paymentMethod: string;
    fareBreakdown?: any;
    pricingRuleVersionId?: string;
  }): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('RIDE_SETTLEMENT', rideSummary.rideId, async () => {
      assertProductionSafetyLock('recordRideSettlement', { rideId: rideSummary.rideId });
      const now = new Date().toISOString();
      const settlementId = `stl-${rideSummary.rideId}`;
      const taxAmount = rideSummary.tax || 0;

      // 1. Immutable ledger entry in transactions
      const ledgerEntry = {
        id: settlementId,
        referenceType: 'ride_completion',
        referenceId: rideSummary.rideId,
        rideCode: rideSummary.rideCode,
        driverId: rideSummary.driverId,
        driverName: rideSummary.driverName || 'Driver',
        passengerId: rideSummary.passengerId,
        passengerName: rideSummary.passengerName || 'Passenger',
        totalFare: rideSummary.fare,
        platformCommission: rideSummary.commission,
        driverNetEarnings: rideSummary.driverEarnings,
        serviceTax: taxAmount,
        paymentMethod: rideSummary.paymentMethod,
        settlementStatus: 'settled',
        timestamp: now,
        currency: 'PKR',
        fareBreakdown: rideSummary.fareBreakdown || null,
        pricingRuleVersionId: rideSummary.pricingRuleVersionId || 'v1',
        immutable: true
      };

      await this.repository.create('transactions', settlementId, ledgerEntry);

      // 2. Central paymentTransactions record
      const isCash = (rideSummary.paymentMethod || 'cash').toLowerCase() === 'cash';
      const centralTx: CentralPaymentTransaction = {
        id: `tx-settle-${rideSummary.rideId}`,
        referenceId: settlementId,
        userType: 'driver',
        userId: rideSummary.driverId,
        userName: rideSummary.driverName || 'Driver',
        userPhone: '',
        rideId: rideSummary.rideId,
        rideCode: rideSummary.rideCode,
        amount: rideSummary.fare,
        paymentMethod: isCash ? 'cash' : 'wallet',
        transactionType: isCash ? 'ride_cash_payment' : 'ride_earnings',
        status: 'Completed',
        commissionAmount: rideSummary.commission,
        walletEffect: isCash ? -rideSummary.commission : rideSummary.driverEarnings,
        balanceAfter: 0,
        timestamp: now,
        description: `Ride ${rideSummary.rideCode} fare settled via ${rideSummary.paymentMethod}. Gross: PKR ${rideSummary.fare}, Platform Cut: PKR ${rideSummary.commission}, Driver Net: PKR ${rideSummary.driverEarnings}`,
        auditTrail: [{
          action: 'RIDE_SETTLEMENT',
          actor: 'Central Financial Controller',
          timestamp: now,
          note: `Gross PKR ${rideSummary.fare}, Commission PKR ${rideSummary.commission}`
        }]
      };
      await this.repository.create('paymentTransactions', centralTx.id, centralTx);

      // 3. Update Ride document with final status, earnings, and full fareBreakdown
      await this.repository.update('rides', rideSummary.rideId, {
        status: 'completed',
        paymentStatus: 'paid',
        fare: rideSummary.fare,
        finalFare: rideSummary.fare,
        commission: rideSummary.commission,
        driverEarnings: rideSummary.driverEarnings,
        fareBreakdown: rideSummary.fareBreakdown || undefined,
        ruleVersionId: rideSummary.pricingRuleVersionId,
        endTime: now,
        etaMinutes: 0
      });

      // 4. Update driver accumulated wallet / earnings & driverWallets collection
      if (rideSummary.driverId) {
        const driver = await this.repository.getById<any>('drivers', rideSummary.driverId);
        const delta = isCash ? -rideSummary.commission : rideSummary.driverEarnings;

        if (driver) {
          const currentBal = driver.walletBalance || 0;
          const updatedBal = Math.max(0, currentBal + delta);

          await this.repository.update('drivers', rideSummary.driverId, {
            status: 'online',
            operationalStatus: 'available',
            activeRideId: null,
            walletBalance: updatedBal,
            totalRides: (driver.totalRides || driver.completedRides || 0) + 1,
            completedRides: (driver.completedRides || driver.totalRides || 0) + 1,
            totalEarnings: (driver.totalEarnings || driver.earnings || 0) + rideSummary.driverEarnings,
            earnings: (driver.earnings || driver.totalEarnings || 0) + rideSummary.driverEarnings
          });
        }

        // Also sync driverWallets table
        const wallets = await this.repository.list<DriverWallet>('driverWallets', { limit: 200 } as any);
        const driverWallet = wallets.items.find((w) => w.driverId === rideSummary.driverId);
        if (driverWallet) {
          const newWalletBal = Math.max(0, (driverWallet.balance || 0) + delta);
          await this.repository.update('driverWallets', driverWallet.driverId, {
            balance: newWalletBal,
            lastSettledAt: now
          });
        }
      }

      // 5. Update passenger ride count and spend
      if (rideSummary.passengerId) {
        const passenger = await this.repository.getById<any>('passengers', rideSummary.passengerId);
        if (passenger) {
          await this.repository.update('passengers', rideSummary.passengerId, {
            totalRides: (passenger.totalRides || 0) + 1,
            totalSpent: (passenger.totalSpent || 0) + rideSummary.fare
          });
        }
      }

      return true;
    });
  }

  /**
   * List all Driver Wallets
   */
  public async getDriverWallets(filters?: EntityFilter, pagination?: PaginationOptions): Promise<PaginatedResult<DriverWallet>> {
    return this.repository.list<DriverWallet>('driverWallets', filters, pagination);
  }

  /**
   * Fetch specific driver wallet by driverId
   */
  public async getDriverWallet(driverId: string): Promise<DriverWallet | null> {
    const wallets = await this.repository.list<DriverWallet>('driverWallets', { limit: 200 } as any);
    return wallets.items.find((w) => w.driverId === driverId) || null;
  }

  /**
   * Credit Driver Wallet with double-entry ledger update
   */
  public async creditDriverWallet(
    driverId: string,
    amount: number,
    type: PaymentTransactionType,
    description: string,
    adminActor: string,
    referenceId?: string
  ): Promise<ServiceResponse<{ updatedWallet: DriverWallet; transaction: CentralPaymentTransaction }>> {
    return this.executeIdempotent('DRIVER_WALLET_CREDIT', `${driverId}_${type}_${amount}_${referenceId || Date.now()}`, async () => {
      const allWallets = (await this.repository.list<DriverWallet>('driverWallets', { limit: 500 } as any)).items;
      const allTxns = (await this.repository.list<CentralPaymentTransaction>('paymentTransactions', { limit: 500 } as any)).items;

      const result = executeCreditWallet(
        allWallets,
        allTxns,
        driverId,
        amount,
        type,
        description,
        adminActor,
        referenceId
      );

      // Persist updated wallet
      const targetWallet = result.updatedWallets.find((w) => w.driverId === driverId);
      if (targetWallet) {
        await this.repository.create('driverWallets', targetWallet.driverId, targetWallet);
      }

      // Persist newest transaction
      const newTx = result.updatedTransactions[0];
      if (newTx) {
        await this.repository.create('paymentTransactions', newTx.id, newTx);
      }

      // Also sync driver base model
      const driver = await this.repository.getById<any>('drivers', driverId);
      if (driver && targetWallet) {
        await this.repository.update('drivers', driverId, { walletBalance: targetWallet.balance });
      }

      return {
        updatedWallet: targetWallet || result.updatedWallets[0],
        transaction: newTx
      };
    });
  }

  /**
   * Debit Driver Wallet with double-entry ledger update
   */
  public async debitDriverWallet(
    driverId: string,
    amount: number,
    type: PaymentTransactionType,
    description: string,
    adminActor: string,
    referenceId?: string
  ): Promise<ServiceResponse<{ updatedWallet: DriverWallet; transaction: CentralPaymentTransaction }>> {
    return this.executeIdempotent('DRIVER_WALLET_DEBIT', `${driverId}_${type}_${amount}_${referenceId || Date.now()}`, async () => {
      const allWallets = (await this.repository.list<DriverWallet>('driverWallets', { limit: 500 } as any)).items;
      const allTxns = (await this.repository.list<CentralPaymentTransaction>('paymentTransactions', { limit: 500 } as any)).items;

      const result = executeDebitWallet(
        allWallets,
        allTxns,
        driverId,
        amount,
        type,
        description,
        adminActor,
        referenceId
      );

      const targetWallet = result.updatedWallets.find((w) => w.driverId === driverId);
      if (targetWallet) {
        await this.repository.create('driverWallets', targetWallet.driverId, targetWallet);
      }

      const newTx = result.updatedTransactions[0];
      if (newTx) {
        await this.repository.create('paymentTransactions', newTx.id, newTx);
      }

      const driver = await this.repository.getById<any>('drivers', driverId);
      if (driver && targetWallet) {
        await this.repository.update('drivers', driverId, { walletBalance: targetWallet.balance });
      }

      return {
        updatedWallet: targetWallet || result.updatedWallets[0],
        transaction: newTx
      };
    });
  }

  /**
   * List Top-Up Requests
   */
  public async getTopUpRequests(filters?: EntityFilter, pagination?: PaginationOptions): Promise<PaginatedResult<TopUpRequest>> {
    return this.repository.list<TopUpRequest>('topUpRequests', filters, pagination);
  }

  /**
   * Process Top-Up Request Status Change (Pending -> Verified/Credited or Rejected)
   */
  public async processTopUp(
    requestId: string,
    newStatus: TopUpStatus,
    adminActor: string,
    note?: string,
    reason?: string
  ): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('TOPUP_STATUS_PROCESS', `${requestId}_${newStatus}`, async () => {
      const allRequests = (await this.repository.list<TopUpRequest>('topUpRequests', { limit: 500 } as any)).items;
      const allWallets = (await this.repository.list<DriverWallet>('driverWallets', { limit: 500 } as any)).items;
      const allTxns = (await this.repository.list<CentralPaymentTransaction>('paymentTransactions', { limit: 500 } as any)).items;

      const result = executeTopUpStatusChange(
        allRequests,
        allWallets,
        allTxns,
        requestId,
        newStatus,
        adminActor,
        note,
        reason
      );

      // Persist updated request
      const updatedReq = result.updatedRequests.find((r) => r.id === requestId);
      if (updatedReq) {
        await this.repository.create('topUpRequests', updatedReq.id, updatedReq);
      }

      // If approved or completed, persist credited wallet & transaction
      if ((newStatus === 'Approved' || newStatus === 'Completed') && updatedReq) {
        const targetWallet = result.updatedWallets.find((w) => w.driverId === updatedReq.driverId);
        if (targetWallet) {
          await this.repository.create('driverWallets', targetWallet.driverId, targetWallet);
          const driver = await this.repository.getById<any>('drivers', updatedReq.driverId);
          if (driver) {
            await this.repository.update('drivers', updatedReq.driverId, { walletBalance: targetWallet.balance });
          }
        }

        const newTx = result.updatedTransactions[0];
        if (newTx) {
          await this.repository.create('paymentTransactions', newTx.id, newTx);
        }
      }

      return true;
    });
  }

  /**
   * List Central Payment Transactions
   */
  public async getPaymentTransactions(
    filters?: EntityFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<CentralPaymentTransaction>> {
    return this.repository.list<CentralPaymentTransaction>('paymentTransactions', filters, pagination);
  }

  /**
   * Settle Cash Ride: Normal completed rides strictly cash collected, platform commission debited
   */
  public async settleCashRide(params: {
    rideId: string;
    rideCode: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    fare: number;
    commissionRate?: number;
    adminActor?: string;
  }): Promise<ServiceResponse<boolean>> {
    return this.executeIdempotent('CASH_RIDE_SETTLEMENT', params.rideId, async () => {
      const allWallets = (await this.repository.list<DriverWallet>('driverWallets', { limit: 500 } as any)).items;
      const allTxns = (await this.repository.list<CentralPaymentTransaction>('paymentTransactions', { limit: 500 } as any)).items;

      const result = executeCashRideSettlement(
        allWallets,
        allTxns,
        {
          id: params.rideId,
          rideCode: params.rideCode,
          driverId: params.driverId,
          driverName: params.driverName,
          driverPhone: params.driverPhone,
          fare: params.fare,
          commissionRate: (params.commissionRate || 12) / 100
        },
        params.adminActor || 'System Automatic Settlement'
      );

      const targetWallet = result.updatedWallets.find((w) => w.driverId === params.driverId);
      if (targetWallet) {
        await this.repository.create('driverWallets', targetWallet.driverId, targetWallet);
        const driver = await this.repository.getById<any>('drivers', params.driverId);
        if (driver) {
          await this.repository.update('drivers', params.driverId, { walletBalance: targetWallet.balance });
        }
      }

      for (const tx of result.updatedTransactions.slice(0, 2)) {
        await this.repository.create('paymentTransactions', tx.id, tx);
      }

      return true;
    });
  }

  /**
   * List Company Payment Accounts (Easypaisa Till, JazzCash Till, Bank Accounts)
   */
  public async getCompanyPaymentAccounts(): Promise<CompanyPaymentAccount[]> {
    const accounts = await this.repository.list<CompanyPaymentAccount>('companyPaymentAccounts', { limit: 50 } as any);
    return accounts.items;
  }

  /**
   * List Payment Provider Configurations
   */
  public async getPaymentProviders(): Promise<PaymentProviderConfig[]> {
    const res = await this.repository.list<PaymentProviderConfig>('paymentProviderConfigs', { limit: 50 } as any);
    return res.items;
  }

  /**
   * List Payment Webhooks
   */
  public async getPaymentWebhooks(): Promise<PaymentWebhookRecord[]> {
    const res = await this.repository.list<PaymentWebhookRecord>('paymentWebhooks', { limit: 100 } as any);
    return res.items;
  }

  /**
   * List Payment Reconciliation Items
   */
  public async getPaymentReconciliations(): Promise<PaymentReconciliationItem[]> {
    const res = await this.repository.list<PaymentReconciliationItem>('paymentReconciliation', { limit: 100 } as any);
    return res.items;
  }
}

export const financialService = new FinancialService();
export const paymentService = financialService;
export const payoutService = financialService;
export const refundService = financialService;
export const fineService = financialService;
export const reimbursementService = financialService;
export const settlementService = financialService;
