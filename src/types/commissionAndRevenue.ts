/**
 * GoLife Taxi Pakistan - Phase 56-C Central Commission, Platform Revenue & Financial Control Architecture
 * Production & Firebase-Ready Specifications
 */

export type CommissionType = 'percentage' | 'per_km' | 'fixed' | 'hybrid';

export type ServiceCategoryKey =
  | 'all'
  | 'bike'
  | 'rickshaw'
  | 'mini'
  | 'ride'
  | 'comfort'
  | 'intercity'
  | 'freight';

export interface CommissionRule {
  id: string;
  name: string;
  cityId: string; // 'all' or specific city key (e.g. 'lahore', 'karachi', 'islamabad')
  cityName: string;
  serviceCategory: ServiceCategoryKey;
  serviceCategoryName: string;
  commissionType: CommissionType;
  rateValue: number; // e.g. 12 (for 12%), 5 (for Rs 5/km), 35 (for Rs 35 fixed)
  fixedBookingFeePKR?: number; // Optional base booking fee for hybrid rules (e.g. Rs 20)
  minCommissionPKR: number; // Floor (e.g. Rs 15)
  maxCommissionPKR?: number; // Cap (e.g. Rs 400)
  status: 'active' | 'inactive' | 'draft';
  version: number;
  description: string;
  driverOverrideAllowed: boolean;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CommissionRuleVersion {
  id: string;
  ruleId: string;
  version: number;
  rateValue: number;
  commissionType: CommissionType;
  changedBy: string;
  changeReason: string;
  timestamp: string;
  snapshot: Partial<CommissionRule>;
}

export interface DriverCommissionOverride {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  city: string;
  overrideType: 'custom_rate' | 'zero_commission' | 'fixed_daily';
  customRateValue: number;
  commissionType: CommissionType;
  startDate: string;
  endDate: string;
  reason: string;
  authorizedBy: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
}

export interface CommissionCalculationRecord {
  id: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  city: string;
  serviceCategory: string;
  distanceKm: number;
  grossFare: number;
  ruleAppliedId: string;
  ruleAppliedName: string;
  ruleType: CommissionType;
  ruleRate: number;
  baseCommissionPKR: number;
  safetyFeePKR: number;
  tollChargesPKR: number;
  driverNetEarningsPKR: number;
  walletDeductionStatus: 'deducted' | 'pending' | 'failed' | 'overdrawn';
  walletTransactionId?: string;
  calculatedAt: string;
  isDriverOverride?: boolean;
  finalCommissionPKR?: number;
}

export type RevenuePeriod = 'today' | 'weekly' | 'monthly' | 'yearly';

export interface PlatformRevenueBreakdown {
  period: RevenuePeriod;
  periodLabel: string;
  grossRideValue: number;
  platformCommission: number;
  serviceCharges: number;
  otherPlatformRevenue: number;
  refundsDeducted: number;
  reimbursementsPaid: number;
  financialAdjustments: number;
  netPlatformRevenue: number;
  totalCompletedRides: number;
  cashRidesCount: number;
  advanceBookingsCount: number;
  averageCommissionPerRide: number;
  dateRange: string;
}

export type ReconciliationStatus = 'Pending' | 'Matched' | 'Mismatch' | 'Resolved';

export interface CashRideReconciliationRecord {
  id: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  city: string;
  serviceCategory: string;
  passengerCashPaid: number; // 100% Cash paid directly to driver
  driverEarningRecorded: number; // Gross - Commission
  platformCommission: number;
  driverWalletDeduction: number;
  walletTransactionId: string;
  reconciliationStatus: ReconciliationStatus;
  discrepancyAmount: number;
  discrepancyReason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  completedAt: string;
}

export interface AdvancePaymentReconciliationRecord {
  id: string;
  bookingId: string;
  bookingCode: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  driverName?: string;
  city: string;
  provider: 'easypaisa' | 'jazzcash';
  providerReferenceId: string;
  totalAdvanceAmount: number;
  providerFeePKR: number;
  netPlatformAmount: number;
  driverPayoutAmount: number;
  escrowStatus: 'held_in_escrow' | 'settled_to_driver' | 'refunded_to_passenger';
  reconciliationStatus: ReconciliationStatus;
  timestamp: string;
  settledAt?: string;
  notes?: string;
}

export interface PeriodicSettlementRecord {
  id: string;
  periodType: RevenuePeriod;
  periodLabel: string;
  date: string;
  openingBalance: number;
  grossRidesValue: number;
  totalCommissionEarned: number;
  serviceCharges: number;
  finesCollected: number;
  refundsIssued: number;
  reimbursementsGiven: number;
  financialAdjustments: number;
  driverPayoutsDisbursed: number;
  closingBalance: number;
  netPlatformRevenue: number;
  status: 'settled' | 'provisional' | 'reconciling';
  generatedAt: string;
  auditedBy: string;
}

export interface DriverUnifiedEarningsSummary {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  city: string;
  completedRidesCount: number;
  grossCashCollected: number;
  totalCommissionDeducted: number;
  totalFinesDeducted: number;
  totalReimbursementsCredited: number;
  totalRefundsCredited: number;
  totalAdjustments: number;
  totalTopUpsCredited: number;
  totalPayoutsWithdrawn: number;
  currentWalletBalance: number;
  currentPayableBalance: number;
  outstandingDue: number;
  lastActiveRideAt: string;
}

export type FinancialActionCategory =
  | 'approve_topup'
  | 'reject_topup'
  | 'refund_passenger'
  | 'reconcile_cash_ride'
  | 'reconcile_advance_booking'
  | 'adjust_driver_wallet'
  | 'settle_daily_close'
  | 'override_commission';

export interface FinancialActionPayload {
  actionType: FinancialActionCategory;
  targetId: string;
  targetReference?: string;
  driverId?: string;
  amountPKR: number;
  reason: string;
  notes: string;
  actorName: string;
  actorRole: string;
}

export interface AIFinancialInsight {
  id: string;
  type: 'revenue_trend' | 'commission_optimization' | 'reconciliation_warning' | 'anomaly_detection';
  title: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
  impactPKR?: number;
  recommendedAction: string;
  timestamp: string;
}
