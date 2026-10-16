import {
  PassengerRefundRecord,
  DriverReimbursementRecord,
  FinancialAdjustmentRecord,
  ComprehensiveLedgerTransaction,
  DailySettlementRecord,
  ReconciliationRecord,
  AiFinancialAnomaly,
  RefundReasonItem
} from '../types';

export const INITIAL_REFUND_REASONS: RefundReasonItem[] = [
  {
    id: 'ride_cancelled',
    label: 'Ride cancelled by driver/system',
    category: 'both',
    enabled: true,
    defaultNote: 'Ride cancelled after booking dispatch. Refund issued to customer.'
  },
  {
    id: 'driver_no_show',
    label: 'Driver no-show',
    category: 'refund',
    enabled: true,
    defaultNote: 'Driver failed to arrive at pickup location. Full fare refund issued.'
  },
  {
    id: 'passenger_no_show',
    label: 'Passenger no-show (Driver compensation)',
    category: 'reimbursement',
    enabled: true,
    defaultNote: 'Passenger did not appear after mandatory wait time. Driver arrival compensation reimbursed.'
  },
  {
    id: 'incorrect_fare',
    label: 'Incorrect fare calculation / overcharge',
    category: 'refund',
    enabled: true,
    defaultNote: 'Route detour or incorrect meter rate charged. Fare difference refund processed.'
  },
  {
    id: 'duplicate_payment',
    label: 'Duplicate payment / double debit',
    category: 'refund',
    enabled: true,
    defaultNote: 'Duplicate digital gateway debit detected. Instant reversal refund issued.'
  },
  {
    id: 'payment_issue',
    label: 'Payment gateway error / failed capture',
    category: 'both',
    enabled: true,
    defaultNote: 'Digital payment gateway capture discrepancy corrected via manual financial resolution.'
  },
  {
    id: 'service_issue',
    label: 'Service quality / AC / vehicle cleanliness',
    category: 'refund',
    enabled: true,
    defaultNote: 'Partial goodwill refund granted due to verified vehicle comfort service issue.'
  },
  {
    id: 'safety_issue',
    label: 'Safety incident / premature trip termination',
    category: 'both',
    enabled: true,
    defaultNote: 'Ride terminated early due to safety concern. Fare refunded and driver compensation balanced.'
  },
  {
    id: 'platform_error',
    label: 'Platform system malfunction / GPS glitch',
    category: 'both',
    enabled: true,
    defaultNote: 'Platform dispatch or fare calculation error resolved in favor of customer/driver.'
  },
  {
    id: 'incorrect_fine',
    label: 'Incorrect fine reversal / waiver refund',
    category: 'reimbursement',
    enabled: true,
    defaultNote: 'Penalty deduction verified as unjustified upon administrative review. Full reversal credited to driver.'
  },
  {
    id: 'approved_expense',
    label: 'Approved toll / parking / passenger assist expense',
    category: 'reimbursement',
    enabled: true,
    defaultNote: 'Highway toll or authorized incidental expense reimbursed to driver.'
  },
  {
    id: 'other',
    label: 'Other administrative resolution',
    category: 'both',
    enabled: true,
    defaultNote: 'Administrative adjustment executed under operations manager review.'
  }
];

export const INITIAL_PASSENGER_REFUNDS: PassengerRefundRecord[] = [
  {
    id: 'rfn-101',
    refundCode: 'RFN-PK-90101',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    passengerId: 'p-01',
    passengerName: 'Zainab Fatima',
    passengerPhone: '+92 300 1234567',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    originalFare: 680,
    paidAmount: 680,
    previousRefunds: 0,
    refundType: 'partial',
    amount: 250,
    remainingRefundable: 430,
    paymentMethod: 'jazzcash',
    refundDestination: 'wallet_credit',
    status: 'completed',
    reason: 'Incorrect fare calculation / overcharge',
    note: 'Route detour charged due to navigational glitch. Partial refund of PKR 250 credited directly to customer GoLife wallet.',
    requiresHighValueApproval: false,
    approvedBy: 'Admin (Operations)',
    approvedAt: '2026-09-12 19:15 PKT',
    createdBy: 'Support Agent (Ali)',
    createdAt: '2026-09-12 19:10 PKT',
    transactionId: 'TXN-LEDGER-90401'
  },
  {
    id: 'rfn-102',
    refundCode: 'RFN-PK-90102',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    passengerId: 'p-02',
    passengerName: 'Hamza Sheikh',
    passengerPhone: '+92 321 9876543',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    originalFare: 1150,
    paidAmount: 1150,
    previousRefunds: 0,
    refundType: 'full',
    amount: 1150,
    remainingRefundable: 0,
    paymentMethod: 'easypaisa',
    refundDestination: 'wallet_credit',
    status: 'completed',
    reason: 'Driver no-show',
    note: 'Driver failed to arrive at pickup location after accepting ride. Full refund of PKR 1,150 credited immediately to rider wallet.',
    requiresHighValueApproval: false,
    approvedBy: 'Admin (SuperAdmin)',
    approvedAt: '2026-09-13 10:05 PKT',
    createdBy: 'Operations Lead (Bilal)',
    createdAt: '2026-09-13 10:00 PKT',
    transactionId: 'TXN-LEDGER-90402'
  },
  {
    id: 'rfn-103',
    refundCode: 'RFN-PK-90103',
    rideId: 'r-405',
    rideCode: 'GL-PK-89105',
    passengerId: 'p-03',
    passengerName: 'Dr. Ayesha Malik',
    passengerPhone: '+92 333 4567890',
    driverId: 'drv_04',
    driverName: 'Bilal Ahmed',
    originalFare: 2400,
    paidAmount: 2400,
    previousRefunds: 0,
    refundType: 'partial',
    amount: 600,
    remainingRefundable: 1800,
    paymentMethod: 'card',
    refundDestination: 'payment_refund_pending',
    status: 'pending',
    reason: 'Service quality / AC / vehicle cleanliness',
    note: 'Intercity AC breakdown during summer transit. Requested 25% courtesy refund for passenger comfort compensation.',
    requiresHighValueApproval: false,
    createdBy: 'Support Desk (Sara)',
    createdAt: '2026-09-13 14:20 PKT'
  },
  {
    id: 'rfn-104',
    refundCode: 'RFN-PK-91901',
    rideId: 'r-20260919-01',
    rideCode: 'GL-PK-91901',
    passengerId: 'p-104',
    passengerName: 'Maha Javed',
    passengerPhone: '+92 300 8401122',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    originalFare: 850,
    paidAmount: 850,
    previousRefunds: 0,
    refundType: 'partial',
    amount: 150,
    remainingRefundable: 700,
    paymentMethod: 'cash',
    refundDestination: 'wallet_credit',
    status: 'completed',
    reason: 'Route adjustment courtesy refund',
    note: 'Partial toll reroute adjustment credited to passenger wallet.',
    requiresHighValueApproval: false,
    approvedBy: 'Admin (Operations)',
    approvedAt: '2026-09-19 10:15 PKT',
    createdBy: 'Support Agent',
    createdAt: '2026-09-19 10:10 PKT',
    transactionId: 'TXN-LEDGER-91901'
  }
];

export const INITIAL_DRIVER_REIMBURSEMENTS: DriverReimbursementRecord[] = [
  {
    id: 'rmb-204',
    reimbursementCode: 'RMB-PK-91901',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPhone: '+92 300 1234567',
    driverPlate: 'LEA-9214',
    rideId: 'r-20260919-01',
    rideCode: 'GL-PK-91901',
    amount: 200,
    reason: 'Ring road toll fee reimbursement',
    note: 'Lahore Ring Road toll clearance verified via receipt.',
    paymentDestination: 'driver_wallet',
    status: 'completed',
    requiresHighValueApproval: false,
    approvedBy: 'Admin (Finance)',
    approvedAt: '2026-09-19 11:00 PKT',
    createdBy: 'Finance Operations',
    createdAt: '2026-09-19 10:50 PKT',
    transactionId: 'TXN-LEDGER-91902'
  },
  {
    id: 'rmb-201',
    reimbursementCode: 'RMB-PK-90201',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPhone: '+92 302 5556677',
    driverPlate: 'ICT-4421',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    amount: 350,
    reason: 'Approved toll / parking / passenger assist expense',
    note: 'M2 Motorway Rawalpindi-Islamabad toll fee paid in cash by driver with receipt uploaded. Reimbursed directly to driver wallet.',
    paymentDestination: 'driver_wallet',
    status: 'completed',
    requiresHighValueApproval: false,
    approvedBy: 'Admin (Finance)',
    approvedAt: '2026-09-13 11:30 PKT',
    createdBy: 'Finance Desk',
    createdAt: '2026-09-13 11:20 PKT',
    transactionId: 'TXN-LEDGER-90403'
  },
  {
    id: 'rmb-202',
    reimbursementCode: 'RMB-PK-90202',
    driverId: 'drv_02',
    driverName: 'Usman Ali',
    driverPhone: '+92 301 9876543',
    driverPlate: 'KHI-9921',
    rideId: 'r-403',
    rideCode: 'GL-PK-89104',
    amount: 500,
    reason: 'Passenger no-show (Driver compensation)',
    note: 'Driver waited 18 minutes at Karachi Airport Domestic terminal. Passenger did not arrive; cancellation fee reimbursed.',
    paymentDestination: 'driver_wallet',
    status: 'completed',
    requiresHighValueApproval: false,
    approvedBy: 'City Manager (Karachi)',
    approvedAt: '2026-09-12 16:40 PKT',
    createdBy: 'Operations Lead (Hassan)',
    createdAt: '2026-09-12 16:30 PKT',
    transactionId: 'TXN-LEDGER-90404'
  },
  {
    id: 'rmb-203',
    reimbursementCode: 'RMB-PK-90203',
    driverId: 'drv_04',
    driverName: 'Bilal Ahmed',
    driverPhone: '+92 303 9988776',
    driverPlate: 'FSD-7711',
    amount: 1000,
    reason: 'Incorrect fine reversal / waiver refund',
    note: 'Reimbursement reversal for disputed fine fn-403 pending final admin authorization.',
    paymentDestination: 'driver_wallet',
    status: 'pending',
    requiresHighValueApproval: false,
    createdBy: 'Support Operations',
    createdAt: '2026-09-13 15:00 PKT'
  }
];

export const INITIAL_FINANCIAL_ADJUSTMENTS: FinancialAdjustmentRecord[] = [
  {
    id: 'adj-301',
    adjustmentCode: 'ADJ-PK-90301',
    type: 'payment_correction',
    targetType: 'passenger',
    targetId: 'p-01',
    targetName: 'Zainab Fatima',
    originalAmount: 1000,
    adjustmentAmount: 150,
    direction: 'credit',
    reason: 'Promotional discount voucher not applied during checkout',
    note: 'Promo code GOLIFE20 failed due to intermittent network; PKR 150 adjusted to rider wallet.',
    status: 'completed',
    createdBy: 'Promo Marketing Desk',
    createdAt: '2026-09-13 12:10 PKT',
    transactionId: 'TXN-LEDGER-90405'
  }
];

export const INITIAL_COMPREHENSIVE_TRANSACTIONS: ComprehensiveLedgerTransaction[] = [
  {
    id: 'ctx-01',
    transactionId: 'TXN-LEDGER-90401',
    type: 'Refund',
    partyType: 'passenger',
    partyId: 'p-01',
    partyName: 'Zainab Fatima',
    partyPhone: '+92 300 1234567',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    originalAmount: 680,
    adjustmentAmount: 250,
    netImpact: 250,
    reason: 'Fare overcharge adjustment',
    note: 'Partial refund credited to customer wallet.',
    paymentMethod: 'JazzCash Wallet',
    status: 'completed',
    createdBy: 'Support Agent (Ali)',
    approvedBy: 'Admin (Operations)',
    date: '2026-09-12 19:15 PKT',
    ruleOrSource: 'Manual Resolution Portal',
    relatedRecordId: 'rfn-101'
  },
  {
    id: 'ctx-02',
    transactionId: 'TXN-LEDGER-90402',
    type: 'Refund',
    partyType: 'passenger',
    partyId: 'p-02',
    partyName: 'Hamza Sheikh',
    partyPhone: '+92 321 9876543',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    originalAmount: 1150,
    adjustmentAmount: 1150,
    netImpact: 1150,
    reason: 'Driver no-show full refund',
    note: '100% fare reimbursement to passenger wallet.',
    paymentMethod: 'EasyPaisa Wallet',
    status: 'completed',
    createdBy: 'Operations Lead (Bilal)',
    approvedBy: 'Admin (SuperAdmin)',
    date: '2026-09-13 10:05 PKT',
    ruleOrSource: 'Manual Resolution Portal',
    relatedRecordId: 'rfn-102'
  },
  {
    id: 'ctx-03',
    transactionId: 'TXN-LEDGER-90403',
    type: 'Reimbursement',
    partyType: 'driver',
    partyId: 'drv_03',
    partyName: 'Tariq Mehmood',
    partyPhone: '+92 302 5556677',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    originalAmount: 0,
    adjustmentAmount: 350,
    netImpact: 350,
    reason: 'Approved motorway toll expense',
    note: 'Toll fee reimbursement deposited to driver wallet.',
    paymentMethod: 'Driver Wallet Credit',
    status: 'completed',
    createdBy: 'Finance Desk',
    approvedBy: 'Admin (Finance)',
    date: '2026-09-13 11:30 PKT',
    ruleOrSource: 'Driver Expense Reimbursement System',
    relatedRecordId: 'rmb-201'
  },
  {
    id: 'ctx-04',
    transactionId: 'TXN-LEDGER-90404',
    type: 'Reimbursement',
    partyType: 'driver',
    partyId: 'drv_02',
    partyName: 'Usman Ali',
    partyPhone: '+92 301 9876543',
    rideId: 'r-403',
    rideCode: 'GL-PK-89104',
    originalAmount: 0,
    adjustmentAmount: 500,
    netImpact: 500,
    reason: 'Passenger no-show compensation',
    note: 'Driver wait time reimbursement credited to driver wallet.',
    paymentMethod: 'Driver Wallet Credit',
    status: 'completed',
    createdBy: 'Operations Lead (Hassan)',
    approvedBy: 'City Manager (Karachi)',
    date: '2026-09-12 16:40 PKT',
    ruleOrSource: 'Policy Compensation Rule',
    relatedRecordId: 'rmb-202'
  },
  {
    id: 'ctx-05',
    transactionId: 'TXN-LEDGER-90405',
    type: 'Fine',
    partyType: 'driver',
    partyId: 'd-201',
    partyName: 'Muhammad Asif Rasheed',
    partyPhone: '+92 302 4491823',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    originalAmount: 300,
    adjustmentAmount: 300,
    netImpact: -300,
    reason: 'Late pickup compliance penalty',
    note: 'Automated 14-minute pickup delay penalty deducted from wallet.',
    paymentMethod: 'Driver Wallet Deduction',
    status: 'completed',
    createdBy: 'Auto-Compliance Engine',
    date: '2026-09-12 18:31 PKT',
    ruleOrSource: 'Rule #rule-late-pickup',
    relatedRecordId: 'fn-401'
  },
  {
    id: 'ctx-06',
    transactionId: 'TXN-LEDGER-90406',
    type: 'Ride Payment',
    partyType: 'driver',
    partyId: 'd-201',
    partyName: 'Muhammad Asif Rasheed',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    originalAmount: 680,
    adjustmentAmount: 680,
    netImpact: 564.4,
    reason: 'Ride fare completed (PKR 680 gross - 17% commission)',
    note: 'Ride completed successfully in Lahore.',
    paymentMethod: 'Customer Online Payment',
    status: 'completed',
    createdBy: 'Ride Dispatch Server',
    date: '2026-09-12 18:24 PKT',
    ruleOrSource: 'Core Fare Calculation'
  }
];

export const INITIAL_RECONCILIATION_RECORDS: ReconciliationRecord[] = [
  {
    id: 'rec-01',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    date: '2026-09-12',
    driverName: 'Muhammad Asif Rasheed',
    passengerName: 'Zainab Fatima',
    rideFareRecorded: 680,
    paymentRecorded: 680,
    driverLedgerRecorded: 564.4,
    platformCommissionRecorded: 115.6,
    refundsRecorded: 250,
    finesRecorded: 300,
    reimbursementsRecorded: 0,
    differenceAmount: 0,
    status: 'matched'
  },
  {
    id: 'rec-02',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    date: '2026-09-13',
    driverName: 'Tariq Mehmood',
    passengerName: 'Hamza Sheikh',
    rideFareRecorded: 1150,
    paymentRecorded: 1150,
    driverLedgerRecorded: 0,
    platformCommissionRecorded: 0,
    refundsRecorded: 1150,
    finesRecorded: 0,
    reimbursementsRecorded: 350,
    differenceAmount: 0,
    status: 'matched'
  },
  {
    id: 'rec-03',
    rideId: 'r-409',
    rideCode: 'GL-PK-89109',
    date: '2026-09-13',
    driverName: 'Bilal Ahmed',
    passengerName: 'Kashif Mehmood',
    rideFareRecorded: 1400,
    paymentRecorded: 1250,
    driverLedgerRecorded: 1162,
    platformCommissionRecorded: 238,
    refundsRecorded: 0,
    finesRecorded: 0,
    reimbursementsRecorded: 0,
    differenceAmount: 150,
    status: 'review_required',
    mismatchReason: 'Gateway settlement discrepancy: Rider charged PKR 1,250 but calculated meter recorded PKR 1,400. Difference of PKR 150 requires administrative resolution.'
  }
];

export const INITIAL_DAILY_SETTLEMENTS: DailySettlementRecord[] = [
  {
    id: 'set-01',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    driverPlate: 'LEB-22-8419',
    city: 'Lahore',
    date: '2026-09-12',
    openingBalance: 4200,
    grossRideEarnings: 3850,
    commission: 654.5,
    serviceCharges: 77,
    fines: 300,
    refunds: 0,
    reimbursements: 0,
    otherAdjustments: 0,
    netEarnings: 2818.5,
    credits: 3850,
    deductions: 1031.5,
    closingBalance: 7018.5,
    status: 'Settled',
    settledAt: '2026-09-12 23:59 PKT',
    settledBy: 'Automated Daily Settlement Batch',
    payoutReference: 'STL-LHR-20260912-001'
  },
  {
    id: 'set-02',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPlate: 'ICT-4421',
    city: 'Islamabad',
    date: '2026-09-13',
    openingBalance: 3100,
    grossRideEarnings: 4500,
    commission: 765,
    serviceCharges: 90,
    fines: 300,
    refunds: 0,
    reimbursements: 350,
    otherAdjustments: 0,
    netEarnings: 3695,
    credits: 4850,
    deductions: 1155,
    closingBalance: 6795,
    status: 'Pending'
  },
  {
    id: 'set-03',
    driverId: 'drv_02',
    driverName: 'Usman Ali',
    driverPlate: 'KHI-9921',
    city: 'Karachi',
    date: '2026-09-13',
    openingBalance: 5600,
    grossRideEarnings: 6200,
    commission: 1054,
    serviceCharges: 124,
    fines: 0,
    refunds: 0,
    reimbursements: 500,
    otherAdjustments: 0,
    netEarnings: 5522,
    credits: 6700,
    deductions: 1178,
    closingBalance: 11122,
    status: 'Pending'
  }
];

export const INITIAL_AI_FINANCIAL_ANOMALIES: AiFinancialAnomaly[] = [
  {
    id: 'anm-01',
    type: 'reconciliation_issue',
    severity: 'high',
    title: 'Ride GL-PK-89109 Gateway Fare Mismatch',
    description: 'Calculated ride fare is PKR 1,400 while recorded customer card debit was PKR 1,250 (discrepancy of PKR 150). Driver ledger was credited with full fare.',
    relatedEntityId: 'GL-PK-89109',
    relatedEntityName: 'Ride GL-PK-89109',
    suggestedAction: 'Review gateway log and apply PKR 150 Payment Correction via Financial Action desk.',
    recommendedReview: true,
    flaggedAt: '2026-09-13 15:30 PKT',
    status: 'open'
  },
  {
    id: 'anm-02',
    type: 'repeated_reimbursements',
    severity: 'medium',
    title: 'Multiple Toll Reimbursements on Same Sector',
    description: 'Driver Tariq Mehmood submitted 2 toll reimbursement claims totaling PKR 700 on M2 motorway within a 4-hour window.',
    relatedEntityId: 'drv_03',
    relatedEntityName: 'Tariq Mehmood',
    suggestedAction: 'Verify timestamp on physical toll slip against driver GPS track before approving second reimbursement.',
    recommendedReview: true,
    flaggedAt: '2026-09-13 14:10 PKT',
    status: 'open'
  }
];

/**
 * Calculates remaining refundable amount safely
 */
export function calculateRefundableAmount(paidAmount: number, previousRefunds = 0): number {
  const remaining = Math.max(0, paidAmount - previousRefunds);
  return remaining;
}

/**
 * Generates an automatic professional note for refund
 */
export function generateRefundNote(reason: string, rideCode?: string, type: 'full' | 'partial' = 'full', amount?: number): string {
  const typeText = type === 'full' ? 'Full fare refund' : `Partial fare adjustment of PKR ${amount || 0}`;
  if (rideCode) {
    return `${typeText} issued for ride ${rideCode} due to: ${reason}. Credited to customer GoLife account.`;
  }
  return `${typeText} processed: ${reason}.`;
}

/**
 * Generates an automatic professional note for reimbursement
 */
export function generateReimbursementNote(reason: string, driverName?: string, rideCode?: string, amount?: number): string {
  const driverText = driverName ? `Driver ${driverName}` : 'Driver';
  if (rideCode) {
    return `Compensation of PKR ${amount || 0} credited to ${driverText} for ride ${rideCode} due to: ${reason}.`;
  }
  return `Operational reimbursement of PKR ${amount || 0} credited to ${driverText} due to: ${reason}.`;
}
