/**
 * GoLife Taxi Pakistan - Phase 56-B Central Payment, Driver Wallet & Top-Up Architecture
 * Production & Firebase-Ready Specifications
 */

export type TopUpStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Processing'
  | 'Completed'
  | 'Rejected'
  | 'Failed'
  | 'Cancelled'
  | 'INITIATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'REFUNDED';

export type TopUpMethod = 'easypaisa' | 'jazzcash' | 'bank' | 'cash';

export interface TopUpAuditEntry {
  action: string;
  actor: string;
  timestamp: string;
  note: string;
  previousStatus?: TopUpStatus;
  newStatus?: TopUpStatus;
  metadata?: Record<string, any>;
}

export interface TopUpRequest {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  driverCity: string;
  driverRating: number;
  amount: number; // PKR: Min 100, Max 20,000
  fee?: number; // Configurable payment method fee deducted
  netCredit?: number; // Amount credited to wallet after fee
  paymentMethod: TopUpMethod;
  referenceId: string; // e.g. TRX ID from JazzCash/Easypaisa/Bank UTR
  senderAccountNumber: string;
  senderAccountTitle: string;
  companyAccountId: string;
  companyAccountTitle: string;
  requestedAt: string;
  createdAt?: string;
  updatedAt?: string;
  status: TopUpStatus;
  proofUrl?: string;
  proofNotes?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  processingBy?: string;
  processingAt?: string;
  completedAt?: string;
  verificationTime?: string;
  rejectedReason?: string;
  failedReason?: string;
  cancelledReason?: string;
  demoMode?: boolean;
  isSuspicious: boolean;
  suspiciousReason?: string;
  idempotencyKey: string;
  providerVerificationStatus: 'pending' | 'verified_match' | 'verification_failed' | 'manual_review_required';
  providerVerificationWindowMinutes: number; // Operational verification target: ~5 minutes
  providerVerifiedAt?: string;
  auditTrail: TopUpAuditEntry[];
}

export interface DriverWallet {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  driverCity: string;
  balance: number; // Current spendable / net ledger balance in PKR
  currentBalance?: number; // Alias for balance
  pendingBalance: number; // In-process top-ups or hold items in PKR
  availableBalance?: number; // Alias for payableBalance
  payableBalance: number; // Eligible for cashout / withdrawal in PKR
  outstandingDeductions: number; // Outstanding negative dues, fines, or unpaid platform commissions
  minimumReserve: number; // Reserve cushion e.g. 500 PKR
  totalEarnings: number; // Lifetime ride earnings
  totalCommissionPaid: number; // Lifetime GoLife commission paid
  totalFinesDeducted: number; // Lifetime fines paid
  totalTopUps: number; // Lifetime top-ups credited
  totalFees?: number; // Lifetime transaction processing fees deducted
  totalWithdrawals: number; // Lifetime payouts withdrawn
  status: 'active' | 'frozen' | 'restricted';
  updatedAt: string;
  lastTransaction?: {
    id: string;
    amount: number;
    type: string;
    status: string;
    timestamp: string;
    referenceId?: string;
  };
}

export interface CompanyPaymentAccount {
  id: string;
  provider: TopUpMethod;
  accountTitle: string; // e.g. "GoLife Taxi Pakistan (Pvt) Ltd"
  accountName?: string; // Standard alias
  accountNumber: string; // e.g. "03451234567"
  mobileNumber?: string; // Dedicated mobile account number
  tillNumber?: string; // e.g. "908122"
  iban?: string; // IBAN
  bankName?: string; // e.g. "Habib Bank Limited (HBL)"
  branch?: string; // e.g. "Gulberg Main Branch Lahore"
  merchantId: string; // e.g. "GL-PK-MERCHANT-01"
  accountType: 'Corporate Merchant Till' | 'Direct Merchant Account' | 'Corporate Bank Account' | 'Cash Operations Desk';
  status: 'active' | 'inactive';
  accountStatus?: 'active' | 'inactive'; // Alias
  environment?: 'demo' | 'production' | 'DEMO' | 'PRODUCTION';
  instructionsUrdu: string;
  instructionsEnglish: string;
  secretStatus: string; // Masked secret placeholder
  createdAt: string;
  updatedAt: string;
}

export type PaymentTransactionType =
  | 'ride_cash_payment'
  | 'commission_deduction'
  | 'ride_earnings'
  | 'topup_credit'
  | 'fine_deduction'
  | 'wallet_adjustment'
  | 'payout_withdrawal'
  | 'advance_booking_hold'
  | 'advance_booking_release';

export interface CentralPaymentTransaction {
  id: string;
  referenceId: string;
  userType: 'driver' | 'passenger';
  userId: string;
  userName: string;
  userPhone: string;
  rideId?: string;
  rideCode?: string;
  amount: number;
  fee?: number; // Deducted transaction processing fee
  netAmount?: number; // Net credited/debited amount
  walletCredit?: number; // Alias for netAmount/walletEffect
  paymentMethod: 'cash' | 'easypaisa' | 'jazzcash' | 'bank' | 'wallet';
  transactionType: PaymentTransactionType;
  status: 'Completed' | 'Pending' | 'Failed' | 'Reversed' | 'Processing' | 'INITIATED' | 'SUCCESS' | 'DECLINED' | 'EXPIRED' | 'REFUNDED';
  providerReference?: string;
  companyAccountId?: string;
  companyAccountTitle?: string;
  demoMode?: boolean;
  commissionAmount?: number;
  refundAmount?: number;
  walletEffect: number; // Positive for credit, negative for debit
  balanceBefore?: number;
  balanceAfter: number;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  verificationTime?: string;
  failureReason?: string;
  description: string;
  auditTrail: Array<{ action: string; actor: string; timestamp: string; note: string }>;
}

export interface WalletLedgerEntry {
  id: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
  transactionId: string;
  eventType: 'topup' | 'adjustment_credit' | 'adjustment_debit' | 'commission_cut' | 'fine' | 'refund' | 'payout';
  openingBalance: number;
  amount: number;
  fee: number;
  netCredit: number; // Net effect on balance (positive or negative)
  closingBalance: number;
  referenceId?: string;
  provider?: string;
  companyAccountId?: string;
  reason?: string;
  adminId?: string;
  adminName?: string;
  demoMode?: boolean;
  timestamp: string;
}

export interface PaymentFeeRule {
  id: string;
  method: 'jazzcash' | 'easypaisa' | 'bank' | 'cash';
  name: string;
  feeType: 'fixed' | 'percentage';
  feeValue: number; // e.g. 1 for 1%, 20 for PKR 20
  active: boolean;
  minAmount?: number;
  maxAmount?: number;
  updatedAt: string;
}

export interface DriverWalletNotification {
  notificationId: string;
  driverId: string;
  title: string;
  message: string;
  type:
    | 'topup_initiated'
    | 'topup_pending'
    | 'topup_success'
    | 'topup_failed'
    | 'topup_declined'
    | 'refund'
    | 'admin_adjustment';
  transactionId?: string;
  read: boolean;
  createdAt: string;
}

export interface AdvanceBookingHold {
  id: string;
  bookingCode: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  city: string;
  pickupAddress: string;
  dropAddress: string;
  scheduledTime: string;
  advanceAmount: number;
  paymentMethod: 'easypaisa' | 'jazzcash';
  referenceId: string;
  escrowStatus: 'held_in_escrow' | 'released_to_driver' | 'refunded';
  holdTimestamp: string;
  releaseTimestamp?: string;
  notes?: string;
}

export interface PaymentTestSuiteResult {
  id: string;
  testName: string;
  scenario: string;
  passed: boolean;
  input: any;
  output: any;
  message: string;
  timestamp: string;
}

// ============================================================================
// PHASE 59 — EASYPAISA, JAZZCASH & PRODUCTION PAYMENT GATEWAY FOUNDATION
// ============================================================================

export type PaymentProviderCode = 'easypaisa' | 'jazzcash' | 'bank' | 'cash';
export type PaymentProviderStatus = 'active' | 'maintenance' | 'inactive' | 'testing';
export type PaymentEnvironment = 'demo' | 'production';

export type PaymentRealisticStatus =
  | 'Pending'
  | 'Verifying'
  | 'Verified'
  | 'Approved'
  | 'Processing'
  | 'Completed'
  | 'Rejected'
  | 'Failed'
  | 'Cancelled';

export interface PaymentProcessingFee {
  type: 'fixed' | 'percentage';
  value: number; // e.g. 0 PKR or 1.5%
}

export interface PaymentProviderConfig {
  id: string;
  code: PaymentProviderCode;
  name: string;
  subTitle: string;
  enabled: boolean;
  environment: PaymentEnvironment;
  merchantId: string;
  accountIdentifier: string; // Phone / Till / IBAN
  apiEndpoint: string;
  callbackWebhookUrl: string;
  verificationEndpoint: string;
  currency: 'PKR';
  minTransaction: number;
  maxTransaction: number;
  processingFee: PaymentProcessingFee;
  settlementAccount: string; // Company Receiving Account reference
  status: PaymentProviderStatus;
  secretStatus: string; // Masked secret indicator e.g. "•••••••••••• (AES-256 Vault / Server Environment)"
  description: string;
  normalRidesAllowed: boolean; // MUST BE FALSE for Easypaisa/JazzCash/Bank (Cash Only policy)
  supportedFlows: Array<'driver_topup' | 'advance_booking' | 'cash_ride' | 'payout_settlement'>;
  productionReady: boolean;
  lastTestedAt?: string;
  healthPingMs?: number;
}

export interface PaymentWebhookRecord {
  id: string;
  provider: PaymentProviderCode;
  eventType:
    | 'payment.created'
    | 'payment.pending'
    | 'payment.success'
    | 'payment.failed'
    | 'payment.reversed'
    | 'refund.completed'
    | 'settlement.completed';
  transactionId: string;
  referenceId: string;
  amount: number;
  currency: 'PKR';
  signature: string;
  signatureVerified: boolean;
  idempotencyKey: string;
  isDuplicate: boolean;
  receivedAt: string;
  processedAt?: string;
  status: 'Processed' | 'Rejected' | 'Duplicate_Ignored' | 'Pending';
  payload: Record<string, any>;
  notes?: string;
}

export interface PaymentReconciliationItem {
  id: string;
  provider: PaymentProviderCode;
  referenceId: string;
  providerAmount: number;
  internalAmount: number;
  transactionId: string;
  transactionType: PaymentTransactionType;
  transactionStatus: PaymentRealisticStatus;
  walletEffect: number;
  settlementStatus: 'Settled' | 'Pending' | 'On Hold';
  status: 'Matched' | 'Mismatch' | 'Pending' | 'Resolved';
  difference: number;
  differenceReason?: string;
  driverId?: string;
  driverName?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface PaymentReportSummary {
  period: 'today' | 'weekly' | 'monthly' | 'yearly';
  totalPayments: number;
  totalVolumePKR: number;
  cashRidesVolumePKR: number;
  cashRidesCount: number;
  advancePaymentsVolumePKR: number;
  advancePaymentsCount: number;
  driverTopUpsVolumePKR: number;
  driverTopUpsCount: number;
  refundsVolumePKR: number;
  refundsCount: number;
  failedPaymentsCount: number;
  platformCommissionPKR: number;
  platformRevenuePKR: number;
  providerTotals: Record<PaymentProviderCode, { count: number; volume: number }>;
  reconciliationMismatches: number;
}

