/**
 * GoLife Taxi Pakistan - Payment Service Adapter
 * 
 * Provides unified interface for:
 * - Driver wallet top-up lifecycle (Easypaisa / JazzCash)
 * - Corporate receiving accounts (Till / Merchant accounts)
 * - Advance booking escrow holds and releases
 * - Normal ride cash commission debits
 * - Driver payout requests
 */

import {
  TopUpRequest,
  DriverWallet,
  CompanyPaymentAccount,
  CentralPaymentTransaction,
  AdvanceBookingHold,
  PaymentTestSuiteResult
} from '../types/paymentArchitecture';
import {
  INITIAL_COMPANY_PAYMENT_ACCOUNTS,
  INITIAL_TOPUP_REQUESTS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_ADVANCE_BOOKINGS,
  createInitialDriverWallets,
  processTopUpStatusChange,
  settleCashRide,
  creditDriverWallet,
  debitDriverWallet,
  runPhase56BTestSuite
} from './centralPaymentService';
import { INITIAL_DRIVERS } from './mockData';

export class PaymentService {
  private static companyAccounts: CompanyPaymentAccount[] = [...INITIAL_COMPANY_PAYMENT_ACCOUNTS];
  private static topUpRequests: TopUpRequest[] = [...INITIAL_TOPUP_REQUESTS];
  private static transactions: CentralPaymentTransaction[] = [...INITIAL_PAYMENT_TRANSACTIONS];
  private static advanceHolds: AdvanceBookingHold[] = [...INITIAL_ADVANCE_BOOKINGS];
  private static driverWallets: DriverWallet[] = createInitialDriverWallets(INITIAL_DRIVERS);

  public static getCompanyAccounts(): CompanyPaymentAccount[] {
    return [...this.companyAccounts];
  }

  public static getTopUpRequests(): TopUpRequest[] {
    return [...this.topUpRequests];
  }

  public static getTransactions(): CentralPaymentTransaction[] {
    return [...this.transactions];
  }

  public static getAdvanceHolds(): AdvanceBookingHold[] {
    return [...this.advanceHolds];
  }

  public static getDriverWallets(): DriverWallet[] {
    return [...this.driverWallets];
  }

  public static getWalletByDriverId(driverId: string): DriverWallet | undefined {
    return this.driverWallets.find((w) => w.driverId === driverId);
  }

  public static handleTopUpStatusChange(
    requestId: string,
    targetStatus: any,
    adminActorName: string,
    note?: string,
    reason?: string
  ) {
    const result = processTopUpStatusChange(
      this.topUpRequests,
      this.driverWallets,
      this.transactions,
      requestId,
      targetStatus,
      adminActorName,
      note,
      reason
    );
    this.topUpRequests = result.updatedRequests;
    this.driverWallets = result.updatedWallets;
    this.transactions = result.updatedTransactions;
    return result;
  }

  public static recordCashRide(params: {
    id: string;
    rideCode: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    fare: number;
    commissionRate?: number;
    adminActorName: string;
  }) {
    const result = settleCashRide(
      this.driverWallets,
      this.transactions,
      {
        id: params.id,
        rideCode: params.rideCode,
        driverId: params.driverId,
        driverName: params.driverName,
        driverPhone: params.driverPhone,
        fare: params.fare,
        commissionRate: params.commissionRate
      },
      params.adminActorName
    );
    this.driverWallets = result.updatedWallets;
    this.transactions = result.updatedTransactions;
    return result;
  }

  public static runTests(): PaymentTestSuiteResult[] {
    return runPhase56BTestSuite(this.driverWallets, this.topUpRequests, this.transactions);
  }
}

export default PaymentService;
