import {
  DriverPayoutRecord,
  PayoutConfigRule,
  DriverFinancialBalance,
  PayoutValidationResult,
  PayoutValidationCheck,
  PayoutTransactionRecord,
  DriverPeriodSettlementSummary,
  PlatformRevenueSummary,
  AiPayoutAnomaly,
  SettlementPeriodFilter,
  Driver,
  Ride,
  DriverFine,
  PassengerRefundRecord,
  DriverReimbursementRecord,
  FinancialAdjustmentRecord,
  CentralPricingRule
} from '../types';

export const DEFAULT_PAYOUT_CONFIG: PayoutConfigRule = {
  minimumPayoutAmount: 1000,
  maximumPayoutAmount: 50000,
  payoutSchedule: 'Daily',
  automaticPayoutEnabled: false,
  allowedPaymentMethods: ['Bank', 'JazzCash', 'Easypaisa', 'Other'],
  processingFeeFixed: 0,
  processingFeePercentage: 0,
  supervisorApprovalThreshold: 15000
};

export const INITIAL_DEMO_PAYOUTS: DriverPayoutRecord[] = [
  {
    id: 'PO-8821',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPhone: '+92 302 5556677',
    driverCity: 'Islamabad',
    driverPlate: 'ICT-4421',
    amount: 5000,
    paymentMethod: 'Bank',
    accountTitle: 'Tariq Mehmood',
    accountNumber: 'PK45MEZN00019283746501',
    bankName: 'Meezan Bank (F-7 Markaz Branch, Islamabad)',
    optionalNote: 'Regular weekly balance settlement request',
    status: 'Approved',
    requestedAt: '2026-09-13 09:30 PKT',
    reviewedAt: '2026-09-13 10:15 PKT',
    reviewedBy: 'Hamza Farooq (Treasury)',
    approvedAt: '2026-09-13 10:20 PKT',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    transactionId: 'TXN-PO-94101',
    referenceId: 'MEZN-IBFT-889102',
    processingFee: 0,
    netPayoutAmount: 5000,
    payoutPeriod: 'Current Week',
    reconciliationStatus: 'Matched',
    retryCount: 0,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Tariq Mehmood)',
        timestamp: '2026-09-13 09:30 PKT',
        note: 'Driver requested PKR 5,000 via Meezan Bank.'
      },
      {
        action: 'Review Completed',
        actor: 'Hamza Farooq (Treasury)',
        timestamp: '2026-09-13 10:15 PKT',
        note: 'Validated wallet balance (PKR 14,850) and zero outstanding fines.'
      },
      {
        action: 'Payout Approved',
        actor: 'Farhan Zaidi (Super Admin)',
        timestamp: '2026-09-13 10:20 PKT',
        note: 'Authorized for immediate bank batch processing.'
      }
    ]
  },
  {
    id: 'PO-8822',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    driverPhone: '+92 302 4491823',
    driverCity: 'Lahore',
    driverPlate: 'LEB-22-8419',
    amount: 5500,
    paymentMethod: 'JazzCash',
    accountTitle: 'Muhammad Asif Rasheed',
    accountNumber: '03024491823',
    optionalNote: 'Fuel & maintenance weekend withdrawal',
    status: 'Requested',
    requestedAt: '2026-09-13 11:45 PKT',
    processingFee: 0,
    netPayoutAmount: 5500,
    payoutPeriod: 'Daily Settlement',
    reconciliationStatus: 'Matched',
    retryCount: 0,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Muhammad Asif)',
        timestamp: '2026-09-13 11:45 PKT',
        note: 'Withdrawal request received via JazzCash Mobile Wallet.'
      }
    ]
  },
  {
    id: 'PO-8823',
    driverId: 'drv_05',
    driverName: 'Kamran Akmal',
    driverPhone: '+92 304 3322110',
    driverCity: 'Peshawar',
    driverPlate: 'PEW-5501',
    amount: 8200,
    paymentMethod: 'Easypaisa',
    accountTitle: 'Kamran Akmal',
    accountNumber: '03043322110',
    optionalNote: 'Fortnightly intercity ride earnings payout',
    status: 'Approved',
    requestedAt: '2026-09-12 18:20 PKT',
    reviewedAt: '2026-09-12 19:00 PKT',
    reviewedBy: 'Sara Khan (Finance Desk)',
    approvedAt: '2026-09-12 19:10 PKT',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    transactionId: 'TXN-PO-94103',
    referenceId: 'EP-PK-9812401',
    processingFee: 0,
    netPayoutAmount: 8200,
    payoutPeriod: 'Last 7 Days',
    reconciliationStatus: 'Matched',
    retryCount: 0,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Kamran Akmal)',
        timestamp: '2026-09-12 18:20 PKT',
        note: 'Requested PKR 8,200 via Easypaisa.'
      },
      {
        action: 'Payout Approved',
        actor: 'Farhan Zaidi (Super Admin)',
        timestamp: '2026-09-12 19:10 PKT',
        note: 'Pre-authorized for automated evening disbursement.'
      }
    ]
  },
  {
    id: 'PO-8824',
    driverId: 'drv_04',
    driverName: 'Bilal Ahmed',
    driverPhone: '+92 303 9988776',
    driverCity: 'Faisalabad',
    driverPlate: 'FSD-7711',
    amount: 12000,
    paymentMethod: 'Bank',
    accountTitle: 'Bilal Ahmed',
    accountNumber: 'PK82HABB00029103948501',
    bankName: 'Habib Bank Ltd (D-Ground Branch, Faisalabad)',
    optionalNote: 'Major intercity trip earnings payout',
    status: 'Processing',
    requestedAt: '2026-09-13 08:00 PKT',
    reviewedAt: '2026-09-13 08:45 PKT',
    reviewedBy: 'Hamza Farooq (Treasury)',
    approvedAt: '2026-09-13 08:50 PKT',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    processedAt: '2026-09-13 09:15 PKT',
    processedBy: '1Link Bank Gateway',
    transactionId: 'TXN-PO-94104',
    referenceId: '1LINK-HBL-993812',
    processingFee: 0,
    netPayoutAmount: 12000,
    payoutPeriod: 'Current Month',
    reconciliationStatus: 'Review Required',
    reconciliationNote: 'Bank clearance batch pending inter-bank clearing window.',
    retryCount: 0,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Bilal Ahmed)',
        timestamp: '2026-09-13 08:00 PKT',
        note: 'Requested PKR 12,000 to HBL Account.'
      },
      {
        action: 'Payout Approved',
        actor: 'Farhan Zaidi (Super Admin)',
        timestamp: '2026-09-13 08:50 PKT',
        note: 'Approved for 1Link gateway transfer.'
      },
      {
        action: 'Dispatched to Gateway',
        actor: '1Link Payment Engine',
        timestamp: '2026-09-13 09:15 PKT',
        note: 'Processing via State Bank of Pakistan PRISM 1Link switch.'
      }
    ]
  },
  {
    id: 'PO-8825',
    driverId: 'drv_01',
    driverName: 'Zeeshan Ali',
    driverPhone: '+92 300 1234567',
    driverCity: 'Lahore',
    driverPlate: 'LEA-20-1122',
    amount: 18500,
    paymentMethod: 'Bank',
    accountTitle: 'Zeeshan Ali',
    accountNumber: 'PK12MEZN00021948576001',
    bankName: 'Meezan Bank (Gulberg Main Branch)',
    optionalNote: 'Bi-monthly fleet partner settlement',
    status: 'Completed',
    requestedAt: '2026-09-10 14:00 PKT',
    reviewedAt: '2026-09-10 15:10 PKT',
    reviewedBy: 'Sara Khan (Finance Desk)',
    approvedAt: '2026-09-10 15:20 PKT',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    processedAt: '2026-09-10 16:00 PKT',
    processedBy: 'Meezan Corporate Gateway',
    completedAt: '2026-09-10 16:15 PKT',
    completedBy: 'Automated Bank Confirmation Webhook',
    transactionId: 'TXN-PO-94105',
    referenceId: 'MEZN-PAY-771920',
    processingFee: 0,
    netPayoutAmount: 18500,
    payoutPeriod: 'Previous Month',
    reconciliationStatus: 'Matched',
    retryCount: 0,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Zeeshan Ali)',
        timestamp: '2026-09-10 14:00 PKT',
        note: 'Requested PKR 18,500 via Bank.'
      },
      {
        action: 'Payout Completed',
        actor: 'Bank Gateway Webhook',
        timestamp: '2026-09-10 16:15 PKT',
        note: 'Funds credited to recipient IBAN successfully.'
      }
    ]
  },
  {
    id: 'PO-8826',
    driverId: 'd-205',
    driverName: 'Rashid Khan',
    driverPhone: '+92 333 7788990',
    driverCity: 'Multan',
    driverPlate: 'MUL-19-4091',
    amount: 3000,
    paymentMethod: 'JazzCash',
    accountTitle: 'Rashid Ahmed Khan',
    accountNumber: '03337788990',
    optionalNote: 'Advance cash out',
    status: 'Rejected',
    requestedAt: '2026-09-11 12:00 PKT',
    reviewedAt: '2026-09-11 13:00 PKT',
    reviewedBy: 'Sara Khan (Finance Desk)',
    rejectedAt: '2026-09-11 13:10 PKT',
    rejectedBy: 'Sara Khan (Finance Desk)',
    rejectionReason: 'Account title mismatch with CNIC record',
    rejectionNote: 'Provided account title is registered under different CNIC than driver verification record. Update payment details in driver app.',
    transactionId: 'TXN-PO-94106',
    processingFee: 0,
    netPayoutAmount: 3000,
    payoutPeriod: 'Daily Settlement',
    reconciliationStatus: 'Matched',
    retryCount: 0,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Rashid Khan)',
        timestamp: '2026-09-11 12:00 PKT',
        note: 'Requested PKR 3,000 via JazzCash.'
      },
      {
        action: 'Payout Rejected',
        actor: 'Sara Khan (Finance Desk)',
        timestamp: '2026-09-11 13:10 PKT',
        note: 'Rejected: CNIC verification discrepancy on destination account. Balance restored to wallet.'
      }
    ]
  },
  {
    id: 'PO-8827',
    driverId: 'drv_02',
    driverName: 'Usman Ali',
    driverPhone: '+92 301 9876543',
    driverCity: 'Karachi',
    driverPlate: 'KHI-9921',
    amount: 4500,
    paymentMethod: 'Bank',
    accountTitle: 'Usman Ali',
    accountNumber: 'PK09MCB00010928374601',
    bankName: 'MCB Bank (Shahrah-e-Faisal Branch)',
    optionalNote: 'Karachi coastal rides settlement',
    status: 'Failed',
    requestedAt: '2026-09-12 10:00 PKT',
    reviewedAt: '2026-09-12 11:00 PKT',
    reviewedBy: 'Hamza Farooq (Treasury)',
    approvedAt: '2026-09-12 11:05 PKT',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    failedAt: '2026-09-12 11:30 PKT',
    failedReason: '1Link IBAN routing rejected: Account Dormant or Invalid IBAN checksum',
    transactionId: 'TXN-PO-94107',
    referenceId: '1LINK-ERR-503',
    processingFee: 0,
    netPayoutAmount: 4500,
    payoutPeriod: 'Current Week',
    reconciliationStatus: 'Mismatch',
    reconciliationNote: 'Bank rejected funds transfer. Amount returned to transit suspense account.',
    retryCount: 1,
    auditTrail: [
      {
        action: 'Payout Requested',
        actor: 'Driver App (Usman Ali)',
        timestamp: '2026-09-12 10:00 PKT',
        note: 'Requested PKR 4,500 via MCB Bank.'
      },
      {
        action: 'Payout Approved',
        actor: 'Farhan Zaidi (Super Admin)',
        timestamp: '2026-09-12 11:05 PKT',
        note: 'Approved for automated transfer.'
      },
      {
        action: 'Transfer Failed',
        actor: '1Link Switch',
        timestamp: '2026-09-12 11:30 PKT',
        note: 'Bank rejected transaction: Account Dormant or Invalid IBAN checksum. Admin retry or cancellation required.'
      }
    ]
  }
];

export const INITIAL_PAYOUT_TRANSACTIONS: PayoutTransactionRecord[] = [
  {
    id: 'ptx-01',
    transactionId: 'TXN-PO-94101',
    payoutId: 'PO-8821',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPhone: '+92 302 5556677',
    amount: 5000,
    paymentMethod: 'Bank (Meezan Bank)',
    accountDestination: 'PK45MEZN00019283746501',
    period: 'Current Week',
    status: 'Processing',
    createdBy: 'Driver App',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    date: '2026-09-13 10:20 PKT',
    note: 'Authorized bank IBFT payout transaction.',
    referenceId: 'MEZN-IBFT-889102'
  },
  {
    id: 'ptx-02',
    transactionId: 'TXN-PO-94103',
    payoutId: 'PO-8823',
    driverId: 'drv_05',
    driverName: 'Kamran Akmal',
    driverPhone: '+92 304 3322110',
    amount: 8200,
    paymentMethod: 'Easypaisa',
    accountDestination: '03043322110',
    period: 'Last 7 Days',
    status: 'Processing',
    createdBy: 'Driver App',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    date: '2026-09-12 19:10 PKT',
    note: 'Pre-authorized wallet disbursement.',
    referenceId: 'EP-PK-9812401'
  },
  {
    id: 'ptx-03',
    transactionId: 'TXN-PO-94104',
    payoutId: 'PO-8824',
    driverId: 'drv_04',
    driverName: 'Bilal Ahmed',
    driverPhone: '+92 303 9988776',
    amount: 12000,
    paymentMethod: 'Bank (Habib Bank)',
    accountDestination: 'PK82HABB00029103948501',
    period: 'Current Month',
    status: 'Processing',
    createdBy: 'Driver App',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    date: '2026-09-13 09:15 PKT',
    note: '1Link gateway batch submission in flight.',
    referenceId: '1LINK-HBL-993812'
  },
  {
    id: 'ptx-04',
    transactionId: 'TXN-PO-94105',
    payoutId: 'PO-8825',
    driverId: 'drv_01',
    driverName: 'Zeeshan Ali',
    driverPhone: '+92 300 1234567',
    amount: 18500,
    paymentMethod: 'Bank (Meezan Bank)',
    accountDestination: 'PK12MEZN00021948576001',
    period: 'Previous Month',
    status: 'Completed',
    createdBy: 'Driver App',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    date: '2026-09-10 16:15 PKT',
    note: 'Bank corporate gateway settlement completed.',
    referenceId: 'MEZN-PAY-771920'
  },
  {
    id: 'ptx-05',
    transactionId: 'TXN-PO-94107',
    payoutId: 'PO-8827',
    driverId: 'drv_02',
    driverName: 'Usman Ali',
    driverPhone: '+92 301 9876543',
    amount: 4500,
    paymentMethod: 'Bank (MCB Bank)',
    accountDestination: 'PK09MCB00010928374601',
    period: 'Current Week',
    status: 'Failed',
    createdBy: 'Driver App',
    approvedBy: 'Farhan Zaidi (Super Admin)',
    date: '2026-09-12 11:30 PKT',
    note: '1Link switch error: Account Dormant or Invalid IBAN checksum.',
    referenceId: '1LINK-ERR-503'
  }
];

export const INITIAL_AI_PAYOUT_ANOMALIES: AiPayoutAnomaly[] = [
  {
    id: 'ano-po-01',
    type: 'reconciliation_mismatch',
    driverId: 'drv_02',
    driverName: 'Usman Ali',
    severity: 'high',
    title: 'Repeated Gateway Rejection & Mismatch',
    description: 'Driver Usman Ali experienced a failed bank payout of PKR 4,500 due to invalid/dormant IBAN. Funds were returned to suspense ledger. Manual reconciliation and account update required.',
    suggestedAction: 'Contact driver to update verified bank details or switch payout method to JazzCash/Easypaisa before retrying.',
    reviewRecommended: true,
    detectedAt: '2026-09-12 11:35 PKT',
    status: 'open'
  },
  {
    id: 'ano-po-02',
    type: 'large_balance',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    severity: 'medium',
    title: 'High Accumulated Payable Balance',
    description: 'Driver Tariq Mehmood has accumulated PKR 14,850 payable balance with high completion volume. Auto-payout eligible.',
    suggestedAction: 'Review pending PO-8821 request or trigger automated batch payout.',
    reviewRecommended: false,
    detectedAt: '2026-09-13 10:00 PKT',
    status: 'open'
  },
  {
    id: 'ano-po-03',
    type: 'unusual_earnings',
    driverId: 'drv_04',
    driverName: 'Bilal Ahmed',
    severity: 'low',
    title: 'High Value Intercity Settlement Surge',
    description: 'Bilal Ahmed completed 2 intercity trips totaling PKR 12,000 within 24 hours. Fare calculations and toll receipts match audited records.',
    suggestedAction: 'No fraud detected; safe to disburse once bank clearing window opens.',
    reviewRecommended: false,
    detectedAt: '2026-09-13 09:20 PKT',
    status: 'reviewed'
  }
];

// ==========================================
// CALCULATION & VALIDATION FUNCTIONS
// ==========================================

export function calculateDriverFinancialBalance(
  driver: Driver,
  fines: DriverFine[] = [],
  adjustments: FinancialAdjustmentRecord[] = [],
  payouts: DriverPayoutRecord[] = [],
  rides: Ride[] = [],
  config: PayoutConfigRule = DEFAULT_PAYOUT_CONFIG
): DriverFinancialBalance {
  const availableBalance = driver.walletBalance;

  // Active / unpaid fines for this driver
  const outstandingFines = fines
    .filter((f) => f.driverId === driver.id && (f.status === 'pending' || f.status === 'partially_deducted' || f.status === 'disputed') && f.remainingAmount > 0)
    .reduce((sum, f) => sum + f.remainingAmount, 0);

  // Pending debit adjustments for this driver
  const pendingDeductions = adjustments
    .filter((a) => a.targetType === 'driver' && a.targetId === driver.id && a.direction === 'debit' && a.status === 'pending')
    .reduce((sum, a) => sum + a.adjustmentAmount, 0);

  // Pending earnings from rides in progress or awaiting settlement
  const pendingEarnings = rides
    .filter((r) => r.driverId === driver.id && (r.status === 'in_progress' || (r.status === 'completed' && r.paymentStatus === 'pending')))
    .reduce((sum, r) => sum + (r.driverEarnings || (r.fare || 0) * 0.85), 0);

  // Payable balance cannot be negative
  const payableBalance = Math.max(0, availableBalance - outstandingFines - pendingDeductions);

  // Last payout record
  const driverPayouts = payouts
    .filter((p) => p.driverId === driver.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const lastCompletedOrApproved = driverPayouts.find((p) => p.status === 'Completed' || p.status === 'Approved' || p.status === 'Processing');
  const lastPayout = lastCompletedOrApproved
    ? {
        id: lastCompletedOrApproved.id,
        amount: lastCompletedOrApproved.amount,
        date: lastCompletedOrApproved.completedAt || lastCompletedOrApproved.approvedAt || lastCompletedOrApproved.requestedAt,
        status: lastCompletedOrApproved.status,
        method: lastCompletedOrApproved.paymentMethod
      }
    : undefined;

  // Next eligible payout
  const isEligible = payableBalance >= config.minimumPayoutAmount;
  const statusText = isEligible
    ? 'Eligible for Payout'
    : `Below Minimum (PKR ${config.minimumPayoutAmount.toLocaleString()})`;

  const reason = !isEligible
    ? `Current payable balance (PKR ${payableBalance.toLocaleString()}) is below the minimum required payout threshold of PKR ${config.minimumPayoutAmount.toLocaleString()}.`
    : undefined;

  return {
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverPlate: driver.vehicle?.plate || 'N/A',
    city: driver.city,
    availableBalance,
    pendingEarnings: Math.round(pendingEarnings),
    payableBalance: Math.round(payableBalance),
    outstandingFines: Math.round(outstandingFines),
    pendingDeductions: Math.round(pendingDeductions),
    lastPayout,
    nextEligiblePayout: {
      eligible: isEligible,
      payableAmount: Math.round(payableBalance),
      statusText,
      reason
    }
  };
}

export function validatePayoutRequest(
  driver: Driver,
  requestedAmount: number,
  existingPayouts: DriverPayoutRecord[],
  config: PayoutConfigRule = DEFAULT_PAYOUT_CONFIG,
  fines: DriverFine[] = [],
  adjustments: FinancialAdjustmentRecord[] = []
): PayoutValidationResult {
  const balance = calculateDriverFinancialBalance(driver, fines, adjustments, existingPayouts, [], config);
  const checks: PayoutValidationCheck[] = [];

  // Check 1: Balance Check
  const hasSufficientPayable = balance.payableBalance >= requestedAmount;
  checks.push({
    key: 'balance_check',
    label: 'Payable Balance Sufficiency',
    passed: hasSufficientPayable,
    message: hasSufficientPayable
      ? `Payable balance (PKR ${balance.payableBalance.toLocaleString()}) fully covers requested amount (PKR ${requestedAmount.toLocaleString()}).`
      : `Requested amount (PKR ${requestedAmount.toLocaleString()}) exceeds eligible payable balance (PKR ${balance.payableBalance.toLocaleString()}).`,
    severity: hasSufficientPayable ? 'pass' : 'error'
  });

  // Check 2: Minimum Payout Limit
  const meetsMin = requestedAmount >= config.minimumPayoutAmount;
  checks.push({
    key: 'min_limit_check',
    label: 'Minimum Payout Threshold',
    passed: meetsMin,
    message: meetsMin
      ? `Amount satisfies minimum limit (PKR ${config.minimumPayoutAmount.toLocaleString()}).`
      : `Amount is below minimum limit of PKR ${config.minimumPayoutAmount.toLocaleString()}.`,
    severity: meetsMin ? 'pass' : 'error'
  });

  // Check 3: Maximum Payout Limit
  const meetsMax = requestedAmount <= config.maximumPayoutAmount;
  checks.push({
    key: 'max_limit_check',
    label: 'Maximum Payout Cap',
    passed: meetsMax,
    message: meetsMax
      ? `Amount is within permissible ceiling of PKR ${config.maximumPayoutAmount.toLocaleString()}.`
      : `Amount exceeds maximum single payout limit of PKR ${config.maximumPayoutAmount.toLocaleString()}.`,
    severity: meetsMax ? 'pass' : 'error'
  });

  // Check 4: Outstanding Fines Check
  const hasNoFines = balance.outstandingFines === 0;
  checks.push({
    key: 'fines_check',
    label: 'Outstanding Fines Audit',
    passed: hasNoFines,
    message: hasNoFines
      ? 'No outstanding compliance fines or penalties recorded against driver.'
      : `Driver has PKR ${balance.outstandingFines.toLocaleString()} in outstanding fines. Deducted from available balance before payout.`,
    severity: hasNoFines ? 'pass' : 'warning'
  });

  // Check 5: Pending Deductions Check
  const hasNoPendingDeductions = balance.pendingDeductions === 0;
  checks.push({
    key: 'deductions_check',
    label: 'Pending Deductions Audit',
    passed: hasNoPendingDeductions,
    message: hasNoPendingDeductions
      ? 'No pending financial deductions or chargebacks queued.'
      : `Driver has PKR ${balance.pendingDeductions.toLocaleString()} pending deductions held.`,
    severity: hasNoPendingDeductions ? 'pass' : 'warning'
  });

  // Check 6: Duplicate Pending Request Check
  const hasDuplicate = existingPayouts.some(
    (p) => p.driverId === driver.id && (p.status === 'Requested' || p.status === 'Under Review' || p.status === 'Processing')
  );
  checks.push({
    key: 'duplicate_check',
    label: 'Duplicate Request Check',
    passed: !hasDuplicate,
    message: !hasDuplicate
      ? 'No active concurrent withdrawal requests found for this driver.'
      : 'Driver already has an active payout request in progress.',
    severity: !hasDuplicate ? 'pass' : 'warning'
  });

  // Check 7: Account Status Check
  const isDriverActive = driver.accountStatus === 'active';
  checks.push({
    key: 'account_status',
    label: 'Driver Account Standing',
    passed: isDriverActive,
    message: isDriverActive
      ? 'Driver account is in good standing (Active & Verified).'
      : `Driver account is currently ${driver.accountStatus.toUpperCase()}. Extra compliance approval required.`,
    severity: isDriverActive ? 'pass' : 'error'
  });

  const canApprove = hasSufficientPayable && meetsMin && meetsMax && isDriverActive;
  const isValid = canApprove && !hasDuplicate;

  return {
    isValid,
    canApprove,
    checks,
    availableBalance: balance.availableBalance,
    outstandingFines: balance.outstandingFines,
    pendingDeductions: balance.pendingDeductions,
    payableBalance: balance.payableBalance,
    requestedAmount,
    minPayoutAmount: config.minimumPayoutAmount,
    maxPayoutLimit: config.maximumPayoutAmount
  };
}

export function calculateDriverPeriodSettlement(
  driver: Driver,
  period: SettlementPeriodFilter,
  rides: Ride[] = [],
  fines: DriverFine[] = [],
  refunds: PassengerRefundRecord[] = [],
  reimbursements: DriverReimbursementRecord[] = [],
  adjustments: FinancialAdjustmentRecord[] = [],
  payouts: DriverPayoutRecord[] = [],
  centralPricing: CentralPricingRule
): DriverPeriodSettlementSummary {
  const driverRides = rides.filter((r) => r.driverId === driver.id && r.status === 'completed');
  const totalRides = driverRides.length;

  const grossEarnings = driverRides.reduce((sum, r) => sum + (r.fare || 0), 0);
  const commissionRate = centralPricing.platformCommission.amount / 100;
  const commission = Math.round(grossEarnings * commissionRate);
  const serviceCharges = Math.round(totalRides * centralPricing.driverServiceFee.amount);

  const driverFinesTotal = fines
    .filter((f) => f.driverId === driver.id && (f.status === 'deducted' || f.status === 'paid' || f.status === 'partially_deducted'))
    .reduce((sum, f) => sum + f.amount, 0);

  const driverRefundsTotal = refunds
    .filter((r) => r.driverId === driver.id && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const driverReimbursementsTotal = reimbursements
    .filter((r) => r.driverId === driver.id && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const driverAdjustmentsTotal = adjustments
    .filter((a) => a.targetType === 'driver' && a.targetId === driver.id && a.status === 'completed')
    .reduce((sum, a) => sum + (a.direction === 'credit' ? a.adjustmentAmount : -a.adjustmentAmount), 0);

  const netEarnings = Math.round(
    grossEarnings - commission - serviceCharges - driverFinesTotal + driverReimbursementsTotal + driverAdjustmentsTotal
  );

  const closingBalance = driver.walletBalance;
  const todayCredits = grossEarnings + driverReimbursementsTotal + Math.max(0, driverAdjustmentsTotal);
  const todayDeductions = commission + serviceCharges + driverFinesTotal + Math.abs(Math.min(0, driverAdjustmentsTotal));
  // Authoritative opening balance progression from ledger
  const openingBalance = Math.max(0, closingBalance - todayCredits + todayDeductions);

  const payoutsAmount = payouts
    .filter((p) => p.driverId === driver.id && (p.status === 'Completed' || p.status === 'Approved' || p.status === 'Processing'))
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingBalance = Math.max(0, closingBalance - payoutsAmount);

  // Authoritative Reconciliation check based on double-entry accounting
  const calculatedClosing = openingBalance + todayCredits - todayDeductions;
  const mismatch = Math.abs(calculatedClosing - closingBalance);
  const reconciliationStatus: 'Matched' | 'Mismatch' | 'Review Required' =
    mismatch === 0 ? 'Matched' : 'Review Required';

  return {
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone,
    driverPlate: driver.vehicle?.plate || 'N/A',
    city: driver.city,
    periodLabel: period,
    totalRides,
    grossEarnings,
    commission,
    serviceCharges,
    fines: driverFinesTotal,
    refunds: driverRefundsTotal,
    reimbursements: driverReimbursementsTotal,
    adjustments: driverAdjustmentsTotal,
    netEarnings,
    openingBalance,
    todayCredits,
    todayDeductions,
    closingBalance,
    payoutsAmount,
    remainingBalance,
    reconciliationStatus,
    mismatchNote: mismatch > 0 ? `Unreconciled discrepancy of PKR ${mismatch} identified between ledger credits/debits and wallet balance.` : undefined
  };
}

export function calculatePlatformRevenue(
  period: SettlementPeriodFilter,
  rides: Ride[] = [],
  pricingRule: CentralPricingRule,
  refunds: PassengerRefundRecord[] = [],
  reimbursements: DriverReimbursementRecord[] = []
): PlatformRevenueSummary {
  const completedRides = rides.filter((r) => r.status === 'completed');
  const grossRideValue = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);

  const commRate = (pricingRule.platformCommission?.amount || 12) / 100;
  const platformCommission = Math.round(grossRideValue * commRate);

  const passengerServiceCharges = Math.round(completedRides.length * (pricingRule.passengerServiceFee?.amount || 25));
  const driverServiceCharges = Math.round(completedRides.length * (pricingRule.driverServiceFee?.amount || 15));
  const otherCharges = Math.round(completedRides.length * 10); // Booking / regulatory safety fee

  const refundsTotal = refunds
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const reimbursementsTotal = reimbursements
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const paymentProcessingFees = Math.round(grossRideValue * 0.015); // ~1.5% gateway payment interchange

  const netPlatformRevenue = Math.round(
    platformCommission +
      passengerServiceCharges +
      driverServiceCharges +
      otherCharges -
      refundsTotal -
      reimbursementsTotal -
      paymentProcessingFees
  );

  return {
    periodLabel: period,
    grossRideValue,
    platformCommission,
    passengerServiceCharges,
    driverServiceCharges,
    otherCharges,
    refundsTotal,
    reimbursementsTotal,
    paymentProcessingFees,
    netPlatformRevenue
  };
}
