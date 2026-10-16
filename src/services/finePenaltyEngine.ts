import {
  DriverFine,
  FineTransaction,
  AutomaticFineRule,
  FineReason,
  FineRuleVersion,
  DeductionMethod,
  FairExclusionReason
} from '../types';

export interface DriverFineRecommendation {
  driverId: string;
  driverName: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
  reason: string;
  patternDetails: string;
  relatedRideCode?: string;
  suggestedFineAmount: number;
}

export const INITIAL_FINE_REASONS: FineReason[] = [
  {
    id: 'late_pickup',
    label: 'Late pickup',
    defaultAmount: 300,
    category: 'timing',
    enabled: true,
    noteTemplate: 'Fine issued for qualifying late pickup delay on ride {RIDE_CODE}.'
  },
  {
    id: 'repeated_late_pickup',
    label: 'Repeated late pickup',
    defaultAmount: 500,
    category: 'timing',
    enabled: true,
    noteTemplate: 'Fine issued for repeated qualifying late pickup violations.'
  },
  {
    id: 'late_customer_arrival',
    label: 'Late arrival at customer location',
    defaultAmount: 250,
    category: 'timing',
    enabled: true,
    noteTemplate: 'Fine issued for exceeding customer pickup arrival threshold on ride {RIDE_CODE}.'
  },
  {
    id: 'late_dropoff',
    label: 'Late drop-off',
    defaultAmount: 250,
    category: 'timing',
    enabled: true,
    noteTemplate: 'Fine issued for qualifying late drop-off delay without road exemption on ride {RIDE_CODE}.'
  },
  {
    id: 'repeated_late_dropoff',
    label: 'Repeated late drop-off',
    defaultAmount: 400,
    category: 'timing',
    enabled: true,
    noteTemplate: 'Fine issued for repeated late drop-off pattern across multiple trips.'
  },
  {
    id: 'unjustified_cancellation',
    label: 'Unjustified cancellation',
    defaultAmount: 300,
    category: 'cancellation',
    enabled: true,
    noteTemplate: 'Fine issued for unjustified trip cancellation after accepting ride {RIDE_CODE}.'
  },
  {
    id: 'driver_no_show',
    label: 'Driver no-show',
    defaultAmount: 400,
    category: 'cancellation',
    enabled: true,
    noteTemplate: 'Fine issued for confirmed driver no-show after rider acceptance on ride {RIDE_CODE}.'
  },
  {
    id: 'repeated_ride_cancellation',
    label: 'Repeated ride cancellation',
    defaultAmount: 500,
    category: 'cancellation',
    enabled: true,
    noteTemplate: 'Fine issued for exceeding daily ride cancellation threshold.'
  },
  {
    id: 'passenger_complaint',
    label: 'Passenger complaint',
    defaultAmount: 500,
    category: 'behavior',
    enabled: true,
    noteTemplate: 'Fine issued following verified passenger complaint regarding ride {RIDE_CODE}.'
  },
  {
    id: 'unsafe_driving',
    label: 'Unsafe driving',
    defaultAmount: 1000,
    category: 'safety',
    enabled: true,
    noteTemplate: 'Fine issued for verified hazardous driving / telemetry speed violation on ride {RIDE_CODE}.'
  },
  {
    id: 'misconduct',
    label: 'Misconduct',
    defaultAmount: 1000,
    category: 'behavior',
    enabled: true,
    noteTemplate: 'Fine issued for professional misconduct in violation of platform code of conduct.'
  },
  {
    id: 'vehicle_issue',
    label: 'Vehicle issue',
    defaultAmount: 500,
    category: 'compliance',
    enabled: true,
    noteTemplate: 'Fine issued for operating vehicle that failed safety standards on ride {RIDE_CODE}.'
  },
  {
    id: 'document_violation',
    label: 'Document violation',
    defaultAmount: 500,
    category: 'compliance',
    enabled: true,
    noteTemplate: 'Fine issued for missing or expired mandatory vehicular/driving credentials.'
  },
  {
    id: 'payment_violation',
    label: 'Payment violation',
    defaultAmount: 800,
    category: 'compliance',
    enabled: true,
    noteTemplate: 'Fine issued for offline cash manipulation or fare dispute on ride {RIDE_CODE}.'
  },
  {
    id: 'platform_policy_violation',
    label: 'Platform policy violation',
    defaultAmount: 1000,
    category: 'compliance',
    enabled: true,
    noteTemplate: 'Fine issued for breach of GoLife standard terms of driver platform service.'
  },
  {
    id: 'fraud_suspicious_activity',
    label: 'Fraud/suspicious activity',
    defaultAmount: 2000,
    category: 'safety',
    enabled: true,
    noteTemplate: 'Fine issued for GPS spoofing, ghost trip, or referral abuse on ride {RIDE_CODE}.'
  },
  {
    id: 'other',
    label: 'Other',
    defaultAmount: 300,
    category: 'other',
    enabled: true,
    noteTemplate: 'Administrative fine issued: {DETAIL}'
  }
];

export const INITIAL_AUTOMATIC_FINE_RULES: AutomaticFineRule[] = [
  {
    id: 'rule-late-pickup',
    title: 'Late Pickup Auto-Fine',
    reasonId: 'late_pickup',
    reasonLabel: 'Late pickup',
    enabled: true,
    thresholdCount: 5,
    thresholdMinutes: 10,
    timePeriod: '7d',
    fineAmount: 300,
    maxFinePerPeriod: 1500,
    noteTemplate: 'Fine issued for 5 qualifying late pickup delays within 7 days.',
    version: 'v1.0',
    exclusionsSupported: [
      'passenger_requested_delay',
      'passenger_unavailable',
      'pickup_changed',
      'road_closure',
      'severe_traffic'
    ],
    lastUpdated: '2026-09-10 12:00 PKT',
    updatedBy: 'Admin (SuperAdmin)'
  },
  {
    id: 'rule-late-arrival',
    title: 'Excessive Delay at Customer Location',
    reasonId: 'late_customer_arrival',
    reasonLabel: 'Late arrival at customer location',
    enabled: true,
    thresholdCount: 1,
    thresholdMinutes: 15,
    timePeriod: '24h',
    fineAmount: 250,
    maxFinePerPeriod: 1000,
    noteTemplate: 'Fine issued for arrival delay exceeding 15 minutes on ride {RIDE_CODE}.',
    version: 'v1.0',
    exclusionsSupported: [
      'passenger_requested_delay',
      'road_closure',
      'severe_traffic',
      'technical_issue'
    ],
    lastUpdated: '2026-09-10 12:00 PKT',
    updatedBy: 'Admin (SuperAdmin)'
  },
  {
    id: 'rule-late-dropoff',
    title: 'Unexcused Late Drop-off',
    reasonId: 'late_dropoff',
    reasonLabel: 'Late drop-off',
    enabled: true,
    thresholdCount: 1,
    thresholdMinutes: 25,
    timePeriod: '24h',
    fineAmount: 250,
    maxFinePerPeriod: 1000,
    noteTemplate: 'Fine issued for qualifying late drop-off delay without traffic exemption.',
    version: 'v1.0',
    exclusionsSupported: [
      'destination_changed',
      'road_closure',
      'severe_traffic',
      'approved_emergency'
    ],
    lastUpdated: '2026-09-10 12:00 PKT',
    updatedBy: 'Admin (SuperAdmin)'
  },
  {
    id: 'rule-repeated-cancellation',
    title: 'Repeated Ride Cancellation',
    reasonId: 'repeated_ride_cancellation',
    reasonLabel: 'Repeated ride cancellation',
    enabled: true,
    thresholdCount: 3,
    timePeriod: '24h',
    fineAmount: 500,
    maxFinePerPeriod: 2000,
    noteTemplate: 'Fine issued for repeated qualifying cancellation threshold (3+ within 24h).',
    version: 'v1.0',
    exclusionsSupported: [
      'passenger_unavailable',
      'approved_emergency',
      'technical_issue'
    ],
    lastUpdated: '2026-09-10 12:00 PKT',
    updatedBy: 'Admin (SuperAdmin)'
  },
  {
    id: 'rule-driver-noshow',
    title: 'Confirmed Driver No-Show',
    reasonId: 'driver_no_show',
    reasonLabel: 'Driver no-show',
    enabled: true,
    thresholdCount: 1,
    timePeriod: '24h',
    fineAmount: 400,
    maxFinePerPeriod: 1200,
    noteTemplate: 'Fine issued for driver failing to arrive at pickup location after dispatch.',
    version: 'v1.0',
    exclusionsSupported: [
      'passenger_requested_delay',
      'approved_emergency',
      'technical_issue'
    ],
    lastUpdated: '2026-09-10 12:00 PKT',
    updatedBy: 'Admin (SuperAdmin)'
  },
  {
    id: 'rule-unsafe-driving',
    title: 'Hazardous Driving & Telemetry Breach',
    reasonId: 'unsafe_driving',
    reasonLabel: 'Unsafe driving',
    enabled: true,
    thresholdCount: 1,
    timePeriod: '30d',
    fineAmount: 1000,
    maxFinePerPeriod: 3000,
    noteTemplate: 'Fine issued for high-risk telemetry infraction or passenger safety complaint.',
    version: 'v1.0',
    exclusionsSupported: [
      'other_approved_exception'
    ],
    lastUpdated: '2026-09-10 12:00 PKT',
    updatedBy: 'Admin (SuperAdmin)'
  }
];

export const INITIAL_DEMO_FINES: DriverFine[] = [
  {
    id: 'fn-401',
    fineCode: 'FINE-PK-89101',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    driverPhone: '+92 302 4491823',
    driverPlate: 'LEB-22-8419',
    city: 'Lahore',
    reasonId: 'late_pickup',
    reasonLabel: 'Late pickup',
    amount: 300,
    deductedAmount: 300,
    remainingAmount: 0,
    status: 'deducted',
    source: 'automatic',
    ruleId: 'rule-late-pickup',
    ruleVersion: 'v1.0',
    relatedRideId: 'r-401',
    relatedRideCode: 'GL-PK-89102',
    relatedRideDetails: {
      passengerName: 'Zainab Fatima',
      pickup: 'Packages Mall, Walton Road, Lahore',
      destination: 'DHA Phase 5, Sector C Commercial, Lahore',
      expectedTime: '18:10 PKT',
      actualTime: '18:24 PKT',
      delayMinutes: 14,
      fare: 680
    },
    note: 'Fine issued for qualifying late pickup delay on ride GL-PK-89102 (14 min delay beyond tolerance).',
    deductionMethod: 'driver_wallet',
    isQualifying: true,
    createdAt: '2026-09-12 18:30 PKT',
    updatedAt: '2026-09-12 18:31 PKT',
    createdByAdmin: 'Auto-Compliance Rule Engine'
  },
  {
    id: 'fn-402',
    fineCode: 'FINE-PK-89102',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPhone: '+92 302 5556677',
    driverPlate: 'ICT-4421',
    city: 'Islamabad',
    reasonId: 'repeated_ride_cancellation',
    reasonLabel: 'Repeated ride cancellation',
    amount: 500,
    deductedAmount: 300,
    remainingAmount: 200,
    status: 'partially_deducted',
    source: 'manual',
    note: 'Fine issued for repeated qualifying ride cancellation violations (3 unexcused cancellations in 12h). Partial deduction of PKR 300 applied to protect driver wallet balance floor; PKR 200 outstanding.',
    deductionMethod: 'driver_wallet',
    isQualifying: true,
    createdAt: '2026-09-13 11:15 PKT',
    updatedAt: '2026-09-13 11:15 PKT',
    createdByAdmin: 'Operations Admin (demo)'
  },
  {
    id: 'fn-403',
    fineCode: 'FINE-PK-89103',
    driverId: 'drv_04',
    driverName: 'Bilal Ahmed',
    driverPhone: '+92 303 9988776',
    driverPlate: 'FSD-7711',
    city: 'Faisalabad',
    reasonId: 'passenger_complaint',
    reasonLabel: 'Passenger complaint',
    amount: 1000,
    deductedAmount: 0,
    remainingAmount: 1000,
    status: 'disputed',
    source: 'manual',
    note: 'Fine issued following passenger complaint alleging fare dispute and rude behavior on ride GL-PK-89055.',
    deductionMethod: 'driver_earnings',
    isQualifying: true,
    createdAt: '2026-09-13 09:20 PKT',
    updatedAt: '2026-09-13 14:00 PKT',
    createdByAdmin: 'Support Admin (demo)',
    disputeDetails: {
      disputeId: 'dsp-101',
      status: 'pending',
      submittedAt: '2026-09-13 13:45 PKT',
      driverMessage:
        'Passenger refused the standard highway toll and insisted on taking a detour through unauthorized unpaved streets. I remained respectful and followed company route guidelines. Please review telemetry logs.',
      evidenceUrl: 'https://golife.pk/dispute/telemetry-r89055.pdf'
    }
  },
  {
    id: 'fn-404',
    fineCode: 'FINE-PK-89104',
    driverId: 'drv_02',
    driverName: 'Usman Ali',
    driverPhone: '+92 301 9876543',
    driverPlate: 'KHI-9921',
    city: 'Karachi',
    reasonId: 'late_dropoff',
    reasonLabel: 'Late drop-off',
    amount: 250,
    deductedAmount: 0,
    remainingAmount: 0,
    status: 'waived',
    source: 'automatic',
    ruleId: 'rule-late-dropoff',
    ruleVersion: 'v1.0',
    relatedRideId: 'r-403',
    relatedRideCode: 'GL-PK-89104',
    note: 'Fine originally generated for 28 min drop-off delay. Waived after verifying major road closure and protest on Canal Road.',
    deductionMethod: 'driver_wallet',
    isQualifying: false,
    exclusionReason: 'road_closure',
    createdAt: '2026-09-11 16:45 PKT',
    updatedAt: '2026-09-11 17:30 PKT',
    createdByAdmin: 'Auto-Compliance Rule Engine',
    waiverDetails: {
      waivedBy: 'City Manager (Lahore-Central)',
      waivedAt: '2026-09-11 17:30 PKT',
      reason: 'Exempted via City Operations Notification #LHR-491 (Emergency road blockage near Thokar Niaz Baig).',
      note: 'Driver was rerouted by traffic wardens; telematics confirms continuous movement along alternative bypass.'
    }
  },
  {
    id: 'fn-405',
    fineCode: 'FINE-PK-91901',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPhone: '+92 301 9876543',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    reasonId: 'unexcused_cancellation',
    reasonLabel: 'Unexcused ride cancellation',
    amount: 350,
    deductedAmount: 350,
    remainingAmount: 0,
    status: 'deducted',
    source: 'automatic',
    ruleId: 'rule-cancellation',
    ruleVersion: 'v1.0',
    relatedRideId: 'r-20260919-05',
    relatedRideCode: 'GL-PK-91905',
    note: 'Automatic fine deduction for unexcused rider cancellation after 12m dispatch.',
    deductionMethod: 'driver_wallet',
    isQualifying: true,
    createdAt: '2026-09-19 22:48 PKT',
    updatedAt: '2026-09-19 22:50 PKT',
    createdByAdmin: 'Auto-Compliance Rule Engine'
  }
];

export const INITIAL_DEMO_FINE_TRANSACTIONS: FineTransaction[] = [
  {
    id: 'ftx-01',
    transactionId: 'TX-FINE-9101',
    fineId: 'fn-401',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    relatedRideId: 'r-401',
    relatedRideCode: 'GL-PK-89102',
    originalFineAmount: 300,
    amountDeducted: 300,
    remainingAmount: 0,
    deductionSource: 'driver_wallet',
    type: 'fine_deduction',
    date: '2026-09-12 18:31 PKT',
    reason: 'Late pickup',
    note: 'Full deduction from driver eligible wallet balance for ride GL-PK-89102.',
    status: 'completed'
  },
  {
    id: 'ftx-02',
    transactionId: 'TX-FINE-9102',
    fineId: 'fn-402',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    originalFineAmount: 500,
    amountDeducted: 300,
    remainingAmount: 200,
    deductionSource: 'driver_wallet',
    type: 'fine_partial_deduction',
    date: '2026-09-13 11:15 PKT',
    reason: 'Repeated ride cancellation',
    note: 'Partial deduction of PKR 300 executed to maintain non-negative wallet balance floor. PKR 200 outstanding.',
    status: 'partial'
  }
];

/**
 * Generates an automatic note template according to business rules
 */
export function generateFineNote(
  reasonLabel: string,
  rideCode?: string,
  isRepeated?: boolean,
  extraDetails?: string
): string {
  if (reasonLabel.toLowerCase().includes('late pickup')) {
    if (isRepeated) {
      return 'Fine issued for repeated qualifying late pickup violations.';
    }
    return rideCode
      ? `Fine issued for qualifying late pickup delay on ride ${rideCode}.`
      : 'Fine issued for qualifying late pickup delay.';
  }

  if (reasonLabel.toLowerCase().includes('late drop-off') || reasonLabel.toLowerCase().includes('late dropoff')) {
    if (isRepeated) {
      return 'Fine issued for repeated qualifying late drop-off violations.';
    }
    return rideCode
      ? `Fine issued for qualifying late drop-off delay on ride ${rideCode}.`
      : 'Fine issued for qualifying late drop-off delay without traffic exemption.';
  }

  if (reasonLabel.toLowerCase().includes('cancellation')) {
    return rideCode
      ? `Fine issued for unexcused cancellation on ride ${rideCode}.`
      : 'Fine issued for repeated qualifying cancellation threshold.';
  }

  if (reasonLabel.toLowerCase().includes('complaint')) {
    return rideCode
      ? `Fine issued following verified passenger complaint on ride ${rideCode}.`
      : 'Fine issued following passenger complaint investigation.';
  }

  if (reasonLabel.toLowerCase().includes('unsafe driving')) {
    return rideCode
      ? `Fine issued for unsafe driving infractions detected on ride ${rideCode}.`
      : 'Fine issued for telemetry safety violation and reckless driving threshold.';
  }

  if (extraDetails) {
    return `Administrative penalty issued: ${extraDetails}`;
  }

  return rideCode
    ? `Fine issued regarding infraction on ride ${rideCode}.`
    : `Fine issued for platform policy violation: ${reasonLabel}.`;
}

/**
 * Checks if a delay or infraction qualifies for automatic fine (fair violation detection)
 */
export function isQualifyingIncident(
  delayMinutes: number,
  exclusionReason?: FairExclusionReason,
  thresholdMinutes = 10
): { isQualifying: boolean; explanation: string } {
  if (exclusionReason) {
    const reasonsMap: Record<FairExclusionReason, string> = {
      passenger_requested_delay: 'Passenger requested wait / delay (Exempt from fine)',
      passenger_unavailable: 'Passenger unavailable at designated pickup spot (Exempt from fine)',
      pickup_changed: 'Pickup location modified mid-transit by rider (Exempt from fine)',
      destination_changed: 'Destination modified mid-transit (Exempt from fine)',
      road_closure: 'Confirmed civil road blockage / construction (Exempt from fine)',
      severe_traffic: 'Severe traffic anomaly / weather hazard (Exempt from fine)',
      approved_emergency: 'Dispatcher-approved vehicle emergency (Exempt from fine)',
      technical_issue: 'App GPS / telemetry malfunction verified (Exempt from fine)',
      other_approved_exception: 'Admin discretion exception granted (Exempt from fine)'
    };
    return {
      isQualifying: false,
      explanation: reasonsMap[exclusionReason] || 'Excluded from automated penalty'
    };
  }

  if (delayMinutes <= thresholdMinutes) {
    return {
      isQualifying: false,
      explanation: `Delay of ${delayMinutes} min is within allowable grace window (${thresholdMinutes} min).`
    };
  }

  return {
    isQualifying: true,
    explanation: `Qualifying delay of ${delayMinutes} min exceeds policy threshold (${thresholdMinutes} min).`
  };
}

/**
 * Prepares Driver App compatible summary
 */
export function getDriverFineSummary(driverId: string, fines: DriverFine[]) {
  const driverFines = fines.filter((f) => f.driverId === driverId);
  const totalFines = driverFines.length;
  const totalAmount = driverFines.reduce((sum, f) => sum + f.amount, 0);
  const totalDeducted = driverFines.reduce((sum, f) => sum + f.deductedAmount, 0);
  const totalOutstanding = driverFines.reduce((sum, f) => sum + f.remainingAmount, 0);
  const disputedCount = driverFines.filter((f) => f.status === 'disputed').length;
  const waivedCount = driverFines.filter((f) => f.status === 'waived').length;

  return {
    driverId,
    totalFines,
    totalAmount,
    totalDeducted,
    totalOutstanding,
    disputedCount,
    waivedCount,
    fines: driverFines
  };
}
