import {
  RiskLevel,
  RiskCategory,
  RiskStatus,
  RiskResolutionAction,
  RiskAlertRecord,
  RiskRule,
  RiskWatchlistEntry,
  RiskAiInsight,
  RiskSummaryMetrics
} from '../types';

export type {
  RiskLevel,
  RiskCategory,
  RiskStatus,
  RiskResolutionAction,
  RiskAlertRecord,
  RiskRule,
  RiskWatchlistEntry,
  RiskAiInsight,
  RiskSummaryMetrics
};

// =========================================================================
// 1. INITIAL CONFIGURABLE & VERSIONED RISK RULES
// =========================================================================
export const INITIAL_RISK_RULES: RiskRule[] = [
  {
    id: 'RULE-ACC-01',
    version: 'v2.1',
    name: 'Hardware & Device Fingerprint Duplication',
    category: 'account_abuse',
    description: 'Detects more than 2 distinct passenger or driver accounts logging in or operating from identical IMEI / hardware device hashes within a rolling 7-day window.',
    trigger: 'Matching hardware identifier across >= 3 accounts',
    threshold: '>= 3 accounts per device',
    timePeriod: '7 days',
    riskLevel: 'critical',
    status: 'active',
    actionRecommendation: 'Flag accounts, request CNIC identity verification, hold pending referral rewards.',
    effectiveDate: '2026-08-01',
    previousVersions: [
      { version: 'v2.0', modifiedAt: '2026-07-15', modifiedBy: 'Admin Tariq', description: 'Threshold reduced from 4 to 3 accounts' },
      { version: 'v1.0', modifiedAt: '2026-01-10', modifiedBy: 'Super Admin', description: 'Initial baseline device rule' }
    ]
  },
  {
    id: 'RULE-ACC-02',
    version: 'v1.4',
    name: 'Sequential SIM / Synthetic Account Ring',
    category: 'account_abuse',
    description: 'Flags clusters of newly registered mobile numbers registered with sequential MSISDNs originating from the same base transceiver station (BTS) cell tower.',
    trigger: '>= 4 registrations with sequential phone numbers within 6 hours',
    threshold: '>= 4 sequential SIMs',
    timePeriod: '6 hours',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Flag for administrative review, temporarily freeze promotional welcome credits.',
    effectiveDate: '2026-06-20'
  },
  {
    id: 'RULE-PRM-01',
    version: 'v3.0',
    name: 'Self-Referral & Circular Referral Ring',
    category: 'promo_abuse',
    description: 'Detects referrer and referee accounts that share payment methods, cellular device tokens, or exhibit circular referral qualification rides.',
    trigger: 'Referrer device or bank method matches referee account',
    threshold: '1 shared credential link',
    timePeriod: '30 days',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Revoke referral bonus disallowance, flag both passenger and driver records.',
    effectiveDate: '2026-08-10'
  },
  {
    id: 'RULE-PRM-02',
    version: 'v2.0',
    name: 'High-Velocity Promo Redemption Rate',
    category: 'promo_abuse',
    description: 'Identifies accounts attempting more than 5 distinct promo redemption bookings within 20 minutes across disparate geographic pickup coordinates.',
    trigger: '>= 5 promo redemptions in under 20 minutes',
    threshold: '5 attempts',
    timePeriod: '20 minutes',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Throttle voucher application rate, require OTP re-authentication.',
    effectiveDate: '2026-05-15'
  },
  {
    id: 'RULE-RID-01',
    version: 'v1.8',
    name: 'Unusual Driver Pre-Trip Cancellation Pattern',
    category: 'ride_abuse',
    description: 'Monitors captains who cancel accepted trips after requesting passenger to pay off-platform in cash or negotiate higher fares.',
    trigger: 'Cancellation rate > 30% within 4 hours with "Passenger Requested" citation',
    threshold: '> 30% cancellations (min 5 trips)',
    timePeriod: '4 hours',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Issue official warning, pause dispatch prioritization for 2 hours.',
    effectiveDate: '2026-07-01'
  },
  {
    id: 'RULE-RID-02',
    version: 'v2.2',
    name: 'Collusive Short Rides / Ghost Tripping',
    category: 'ride_abuse',
    description: 'Flags repeated sub-kilometer trips between the exact same driver and passenger pairs during milestone incentive incentive windows.',
    trigger: '>= 3 rides under 1.2km between identical pair within 48 hours',
    threshold: '3 rides < 1.2km',
    timePeriod: '48 hours',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Disqualify rides from milestone bonus, trigger investigative case.',
    effectiveDate: '2026-06-12'
  },
  {
    id: 'RULE-PAY-01',
    version: 'v1.5',
    name: 'High-Frequency Synthetic Card Declines',
    category: 'payment_abuse',
    description: 'Monitors passengers logging repeated payment gateway declines with disparate synthetic credit/debit card numbers.',
    trigger: '>= 4 card decline errors in 15 minutes',
    threshold: '4 declines',
    timePeriod: '15 minutes',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Restrict card payment method to cash-only or JazzCash verified wallet.',
    effectiveDate: '2026-04-10'
  },
  {
    id: 'RULE-PAY-02',
    version: 'v2.0',
    name: 'Abnormal Dispute & Refund Claim Spike',
    category: 'payment_abuse',
    description: 'Flags accounts requesting fare dispute refunds on > 40% of their completed rides over a 14-day observation cycle.',
    trigger: 'Dispute rate > 40% across >= 4 completed trips',
    threshold: '40% dispute frequency',
    timePeriod: '14 days',
    riskLevel: 'medium',
    status: 'active',
    actionRecommendation: 'Route all future refund requests through senior support case management.',
    effectiveDate: '2026-08-01'
  },
  {
    id: 'RULE-DRV-01',
    version: 'v2.3',
    name: 'Mock Location & Teleportation Detection',
    category: 'driver_abuse',
    description: 'Telemetry heuristic detecting impossible vehicle speeds (> 180 km/h in urban sectors) or mock GPS location provider flags reported by driver mobile OS.',
    trigger: 'Speed > 180 km/h or OS Mock Location Provider Flag enabled',
    threshold: '1 confirmed telemetry anomaly',
    timePeriod: 'Instant',
    riskLevel: 'critical',
    status: 'active',
    actionRecommendation: 'Force driver offline, open Driver Control for identity/device audit.',
    effectiveDate: '2026-07-28'
  },
  {
    id: 'RULE-DRV-02',
    version: 'v1.2',
    name: 'Driver Daily Earnings Spike Anomaly',
    category: 'driver_abuse',
    description: 'Identifies drivers whose single-day platform earnings exceed 400% of the city average without corresponding surge or hours logged.',
    trigger: 'Daily earnings > PKR 25,000 without commensurate peak hours',
    threshold: '> PKR 25,000 / day',
    timePeriod: '24 hours',
    riskLevel: 'medium',
    status: 'active',
    actionRecommendation: 'Flag for financial reconciliation audit before payout release.',
    effectiveDate: '2026-05-01'
  },
  {
    id: 'RULE-PO-01',
    version: 'v2.0',
    name: 'Rapid Payout Destination Change Before Large Withdrawal',
    category: 'payout_abuse',
    description: 'Detects a driver modifying bank account / mobile wallet IBAN details and immediately requesting withdrawal > PKR 15,000 within 2 hours.',
    trigger: 'IBAN change followed by withdrawal > PKR 15,000 within 120 mins',
    threshold: 'PKR 15,000 within 2 hours of account change',
    timePeriod: '2 hours',
    riskLevel: 'critical',
    status: 'active',
    actionRecommendation: 'Apply 24-hour security withdrawal cooldown, send OTP confirmation SMS to driver.',
    effectiveDate: '2026-06-01'
  },
  {
    id: 'RULE-PO-02',
    version: 'v1.3',
    name: 'Rapid Duplicate Payout Submissions',
    category: 'payout_abuse',
    description: 'Flags duplicate withdrawal requests submitted within 10 minutes for identical or fragmented amounts.',
    trigger: '>= 2 payout requests within 10 minutes',
    threshold: '2 requests',
    timePeriod: '10 minutes',
    riskLevel: 'high',
    status: 'active',
    actionRecommendation: 'Hold duplicate request in Payout Control until first settlement is confirmed.',
    effectiveDate: '2026-04-18'
  },
  {
    id: 'RULE-FAIR-01',
    version: 'v1.0',
    name: 'Fair Detection: Network Latency & Cellular Dropout Exemption',
    category: 'driver_abuse',
    description: 'Automatically prevents risk flag escalation when ride telemetry gaps correlate with cell carrier outages or tunnel signal losses.',
    trigger: 'Cellular signal strength = 0 with confirmed carrier tower congestion',
    threshold: 'Signal loss correlation verified',
    timePeriod: 'Realtime',
    riskLevel: 'low',
    status: 'active',
    actionRecommendation: 'Suppresses false penalties; preserves driver reliability rating.',
    effectiveDate: '2026-03-01'
  },
  {
    id: 'RULE-FAIR-02',
    version: 'v1.0',
    name: 'Fair Detection: Monsoon Rain & Severe Traffic Gridlock Exemption',
    category: 'ride_abuse',
    description: 'Suppresses late pickup and route deviation risk scores during heavy rain alerts, urban flash flooding, or civic road closures.',
    trigger: 'City weather alert active or traffic speed < 5 km/h on route',
    threshold: 'City traffic average drop > 60%',
    timePeriod: 'Duration of emergency',
    riskLevel: 'low',
    status: 'active',
    actionRecommendation: 'Auto-dismiss delay flags, waive late pickup penalties.',
    effectiveDate: '2026-07-01'
  }
];

// =========================================================================
// 2. INITIAL COMPREHENSIVE DEMO RISK ALERTS (10 REALISTIC SCENARIOS)
// =========================================================================
export const INITIAL_DEMO_RISK_ALERTS: RiskAlertRecord[] = [
  // 1. Critical: Account & Syndicate Abuse in Rawalpindi
  {
    id: 'RSK-9001',
    ruleId: 'RULE-ACC-01',
    ruleVersion: 'v2.1',
    category: 'account_abuse',
    title: 'Multi-Account IMEI Clone Ring Detected',
    reason: 'Matching hardware device IMEI hash #3598120019281 linked across 4 distinct passenger profiles claiming self-referrals.',
    detectedEvent: 'Device IMEI #3598120019281 submitted simultaneous ride bookings across accounts p-108, p-113, p-115 with matching JazzCash wallet.',
    riskLevel: 'critical',
    riskScore: 92,
    scoreBreakdown: {
      baseScore: 40,
      velocityScore: 25,
      financialImpactScore: 20,
      repetitionScore: 15,
      fairContextAdjustment: -8,
      explanation: 'Base critical rule match (+40), 4 accounts on single IMEI within 48h (+25), PKR 4,800 voucher exposure (+20), previous referral warning (+15), carrier check verified clean device (+0, discount applied -8 for transparent hardware telemetry).'
    },
    entityType: 'passenger',
    entityId: 'p-108',
    entityName: 'Adnan Sami',
    entityPhone: '+92 334 9911882',
    city: 'Rawalpindi',
    serviceCategory: 'GoMini',
    relatedPromoCode: 'GOLIFEAZADI',
    relatedReferralId: 'REF-001',
    relatedCaseId: 'CASE-2026-8902',
    status: 'under_review',
    assignedAdmin: 'Ayesha Siddiqui',
    assignedTeam: 'operations',
    evidenceRequested: true,
    evidenceRequestedAt: '2026-09-13 18:30 PKT',
    evidenceReceived: false,
    flagged: true,
    flaggedReason: 'Suspected synthetic syndicate claiming duplicate referral bonuses',
    evidence: [
      {
        id: 'ev-rsk-01',
        title: 'Device Fingerprint Telemetry Dump',
        type: 'device_id',
        notes: 'IMEI: 3598120019281, MAC: 74:D4:35:E1:98:2A, Android 13, Device: Xiaomi Redmi Note 12. Matches p-108, p-113, p-115.',
        uploadedAt: '2026-09-13 18:22 PKT',
        uploadedBy: 'Automated Heuristic Engine',
        sensitive: true
      },
      {
        id: 'ev-rsk-02',
        title: 'Account Creation Geolocation Log',
        type: 'telemetry',
        notes: 'All 4 registrations completed from Saddar Rawalpindi BTS tower #RWP-401.',
        uploadedAt: '2026-09-13 18:25 PKT',
        uploadedBy: 'Network Audit System'
      }
    ],
    timeline: [
      { id: 'tm-1', actor: 'Automated Heuristic Engine', timestamp: '2026-09-13 18:22 PKT', action: 'Risk Detected', note: 'Rule RULE-ACC-01 triggered (Score: 92/100)' },
      { id: 'tm-2', actor: 'System Alert Queue', timestamp: '2026-09-13 18:23 PKT', action: 'Alert Created', note: 'Risk alert RSK-9001 dispatched to Fraud Center' },
      { id: 'tm-3', actor: 'Ayesha Siddiqui', timestamp: '2026-09-13 18:28 PKT', action: 'Admin Assigned', note: 'Assigned to Central Dispatch Operations Desk' },
      { id: 'tm-4', actor: 'Ayesha Siddiqui', timestamp: '2026-09-13 18:30 PKT', action: 'Evidence Requested', note: 'Requested NADRA CNIC verification for secondary accounts' },
      { id: 'tm-5', actor: 'Ayesha Siddiqui', timestamp: '2026-09-13 18:35 PKT', action: 'Case Linked', note: 'Linked to Support & Case Management case CASE-2026-8902' }
    ],
    adminNotes: [
      'Account holds PKR 1,200 in pending referral cashbacks. Referral disbursements halted pending identity confirmation.',
      'Linked case CASE-2026-8902 opened for joint investigation.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Verified that device is not on a known public Wi-Fi proxy or shared mobile hotspot pool.',
    createdAt: '2026-09-13 18:22 PKT',
    updatedAt: '2026-09-13 18:35 PKT',
    expiresAt: '2026-09-27'
  },

  // 2. Critical: Payout Destination Change Anomaly in Karachi
  {
    id: 'RSK-9002',
    ruleId: 'RULE-PO-01',
    ruleVersion: 'v2.0',
    category: 'payout_abuse',
    title: 'Rapid Payout Destination Switch & Large Withdrawal',
    reason: 'Driver changed withdrawal destination from Habib Bank to a new EasyPaisa wallet, followed 8 minutes later by a PKR 48,000 withdrawal request.',
    detectedEvent: 'Payout request PO-94103 submitted for PKR 48,000 to newly added EasyPaisa #0313-7788990 within 8 minutes of profile modification.',
    riskLevel: 'critical',
    riskScore: 88,
    scoreBreakdown: {
      baseScore: 45,
      velocityScore: 25,
      financialImpactScore: 20,
      repetitionScore: 5,
      fairContextAdjustment: -7,
      explanation: 'Critical threshold for instant destination switch (+45), withdrawal triggered 8m post-change (+25), high financial exposure PKR 48,000 (+20), driver has clean 18-month tenure (-7 fair context credit).'
    },
    entityType: 'driver',
    entityId: 'd-205',
    entityName: 'Bashir Ahmed Khan',
    entityPhone: '+92 313 7788990',
    city: 'Karachi',
    serviceCategory: 'GoRide',
    relatedPayoutId: 'PO-94103',
    relatedTransactionId: 'TXN-PO-94103',
    status: 'under_review',
    assignedAdmin: 'Muhammad Tariq Khan',
    assignedTeam: 'finance',
    evidenceRequested: true,
    evidenceRequestedAt: '2026-09-14 11:10 PKT',
    evidenceReceived: true,
    flagged: true,
    flaggedReason: 'Account takeover security check required before banking release',
    evidence: [
      {
        id: 'ev-rsk-03',
        title: 'IP & Geolocation Session Differential',
        type: 'system_log',
        notes: 'Profile update submitted from IP 39.40.112.5 (Karachi Clifton). Withdrawal requested from IP 182.185.22.90 (North Nazimabad).',
        uploadedAt: '2026-09-14 11:02 PKT',
        uploadedBy: 'Session Security Sentinel',
        sensitive: true
      },
      {
        id: 'ev-rsk-04',
        title: 'Driver Call Voice Verification Note',
        type: 'user_statement',
        notes: 'Captain Bashir verified via phone that he personally updated his wallet due to ATM card loss. Voice recorded.',
        uploadedAt: '2026-09-14 11:20 PKT',
        uploadedBy: 'Finance Officer Kashif'
      }
    ],
    timeline: [
      { id: 'tm-6', actor: 'Automated Heuristic Engine', timestamp: '2026-09-14 10:55 PKT', action: 'Risk Detected', note: 'RULE-PO-01 triggered on payout submission' },
      { id: 'tm-7', actor: 'System Alert Queue', timestamp: '2026-09-14 10:56 PKT', action: 'Alert Created', note: 'Dispatched to Finance & Payout Queue' },
      { id: 'tm-8', actor: 'Muhammad Tariq Khan', timestamp: '2026-09-14 11:05 PKT', action: 'Review Started', note: 'Held withdrawal in Payout Control pending 2-person signoff' },
      { id: 'tm-9', actor: 'Kashif Mehmood', timestamp: '2026-09-14 11:20 PKT', action: 'Evidence Received', note: 'Captain phone verification statement attached' }
    ],
    adminNotes: [
      'Payout held safely in existing Payout Control system. Do not cancel payout outright; require captain in-app biometric confirmation.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Captain has 4.88 rating and over 850 completed rides; low likelihood of malicious syndicate, possible legitimate card replacement.',
    createdAt: '2026-09-14 10:55 PKT',
    updatedAt: '2026-09-14 11:25 PKT',
    expiresAt: '2026-09-28'
  },

  // 3. High: High-Velocity Promo Abuse in Lahore
  {
    id: 'RSK-9003',
    ruleId: 'RULE-PRM-02',
    ruleVersion: 'v2.0',
    category: 'promo_abuse',
    title: 'Automated Scripting & Promo Harvesting',
    reason: 'Passenger account triggered 7 rapid promotional requests within 12 minutes, immediately cancelling after promo discount calculation was displayed.',
    detectedEvent: 'Promo code GOLIFEAZADI repeatedly queried and cancelled across Gulberg, DHA Phase 5, and Model Town coordinates within 12 minutes.',
    riskLevel: 'high',
    riskScore: 78,
    scoreBreakdown: {
      baseScore: 35,
      velocityScore: 30,
      financialImpactScore: 10,
      repetitionScore: 10,
      fairContextAdjustment: -7,
      explanation: 'High velocity promo abuse rule triggered (+35), 7 attempts in 12 minutes (+30), potential PKR 1,750 voucher drain (+10), repeated pattern (+10), network speed test normal (-7 discount).'
    },
    entityType: 'passenger',
    entityId: 'p-114',
    entityName: 'Taimoor Shah',
    entityPhone: '+92 300 5544332',
    city: 'Lahore',
    serviceCategory: 'GoComfort',
    relatedPromoCode: 'GOLIFEAZADI',
    status: 'new',
    evidenceRequested: false,
    evidenceReceived: false,
    flagged: true,
    flaggedReason: 'Suspicious voucher bot or fare testing scripting',
    evidence: [
      {
        id: 'ev-rsk-05',
        title: 'API Request Velocity Log',
        type: 'system_log',
        notes: 'User agent indicates automated HTTP client headers rather than standard GoLife Passenger Android build v4.8.2.',
        uploadedAt: '2026-09-14 12:15 PKT',
        uploadedBy: 'API Gateway WAF'
      }
    ],
    timeline: [
      { id: 'tm-10', actor: 'Automated Heuristic Engine', timestamp: '2026-09-14 12:14 PKT', action: 'Risk Detected', note: 'Velocity heuristic triggered on 7th rapid checkout attempt' },
      { id: 'tm-11', actor: 'System Alert Queue', timestamp: '2026-09-14 12:15 PKT', action: 'Alert Created', note: 'New alert waiting for admin assignment' }
    ],
    adminNotes: [
      'Rate-limiting applied automatically on promo checkout endpoints for this user token.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'No network dropouts recorded on user connection; request timing shows millisecond precision typical of automated scripts.',
    createdAt: '2026-09-14 12:14 PKT',
    updatedAt: '2026-09-14 12:15 PKT',
    expiresAt: '2026-09-21'
  },

  // 4. High: Driver Excessive Cancellation at Airport (Karachi)
  {
    id: 'RSK-9004',
    ruleId: 'RULE-RID-01',
    ruleVersion: 'v1.8',
    category: 'driver_abuse',
    title: 'Airport Ride Cherry-Picking & Off-App Cash Solicitation',
    reason: 'Captain cancelled 11 airport terminal pickups within 5 hours, repeatedly contacting passengers before cancelling with "Passenger Not at Pickup".',
    detectedEvent: 'Rides r-402, r-409, r-412 accepted at Jinnah International Karachi and cancelled after captain in-app messaging passenger.',
    riskLevel: 'high',
    riskScore: 74,
    scoreBreakdown: {
      baseScore: 35,
      velocityScore: 18,
      financialImpactScore: 12,
      repetitionScore: 15,
      fairContextAdjustment: -6,
      explanation: 'Pre-trip cancellation threshold exceeded (+35), 11 cancellations in single shift (+18), passenger delay impact (+12), 3 previous passenger complaints (+15), fair context checked for airport traffic congestion (-6 discount).'
    },
    entityType: 'driver',
    entityId: 'd-202',
    entityName: 'Khurram Shehzad',
    entityPhone: '+92 301 2345678',
    city: 'Karachi',
    serviceCategory: 'GoRide',
    relatedRideId: 'r-402',
    relatedRideCode: 'GL-PK-89094',
    status: 'under_review',
    assignedAdmin: 'Ayesha Siddiqui',
    assignedTeam: 'operations',
    evidenceRequested: true,
    evidenceRequestedAt: '2026-09-14 09:30 PKT',
    evidenceReceived: true,
    flagged: true,
    flaggedReason: 'Pattern of cherry-picking high fare routes and asking passengers for private cash deals',
    evidence: [
      {
        id: 'ev-rsk-06',
        title: 'Passenger Complaint Transcripts',
        type: 'user_statement',
        notes: 'Passenger reported: "Captain called and demanded PKR 2,000 cash off-app to go to DHA, then told me to cancel when I refused."',
        uploadedAt: '2026-09-14 09:35 PKT',
        uploadedBy: 'Support Desk Case Worker'
      }
    ],
    timeline: [
      { id: 'tm-12', actor: 'Automated Heuristic Engine', timestamp: '2026-09-14 09:10 PKT', action: 'Risk Detected', note: 'Cancellation rate exceeded 35% on airport cluster' },
      { id: 'tm-13', actor: 'Ayesha Siddiqui', timestamp: '2026-09-14 09:20 PKT', action: 'Review Started', note: 'Examining airport queue telemetry' },
      { id: 'tm-14', actor: 'Ayesha Siddiqui', timestamp: '2026-09-14 09:30 PKT', action: 'Evidence Requested', note: 'Passenger statement retrieved from complaints system' }
    ],
    adminNotes: [
      'Ready for Driver Control intervention: Recommend 48-hour airport geo-fence restriction and warning via Driver Control Modal.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Traffic at Jinnah Terminal was moderate; other drivers maintained 94% completion rate during the same time window.',
    createdAt: '2026-09-14 09:10 PKT',
    updatedAt: '2026-09-14 10:00 PKT',
    expiresAt: '2026-09-28'
  },

  // 5. High: Payment Gateway Card Failure Cluster in Multan
  {
    id: 'RSK-9005',
    ruleId: 'RULE-PAY-01',
    ruleVersion: 'v1.5',
    category: 'payment_abuse',
    title: 'Synthetic Card Declines & Chargeback Pattern',
    reason: 'Passenger account registered 6 consecutive credit card declines with mismatched 3D-Secure OTP verification tokens within 18 minutes.',
    detectedEvent: 'Transaction attempts on Ride r-405 failed 6 times using synthetic card numbers ending in 4111, 4242, 5555.',
    riskLevel: 'high',
    riskScore: 71,
    scoreBreakdown: {
      baseScore: 35,
      velocityScore: 20,
      financialImpactScore: 10,
      repetitionScore: 10,
      fairContextAdjustment: -4,
      explanation: 'Card decline anomaly threshold exceeded (+35), 6 cards tried in 18m (+20), potential fraud loss PKR 3,400 (+10), repeat attempt flag (+10), 1-Link gateway status verified online (-4 discount).'
    },
    entityType: 'passenger',
    entityId: 'p-104',
    entityName: 'Sanaullah Khan',
    entityPhone: '+92 345 8899001',
    city: 'Multan',
    serviceCategory: 'GoAuto',
    relatedRideId: 'r-405',
    relatedRideCode: 'GL-PK-89082',
    relatedTransactionId: 'TXN-90211',
    status: 'under_review',
    assignedAdmin: 'Kashif Mehmood',
    assignedTeam: 'finance',
    evidenceRequested: false,
    evidenceReceived: false,
    flagged: true,
    flaggedReason: 'Stolen card test attack suspected',
    evidence: [
      {
        id: 'ev-rsk-07',
        title: 'PayMob Gateway Transaction Failures',
        type: 'payment_log',
        notes: 'Error Code 3DS_FAIL_INVALID_AUTH across 3 issuing banks (Meezan, Alfalah, Standard Chartered).',
        uploadedAt: '2026-09-14 08:20 PKT',
        uploadedBy: 'PayMob Gateway Webhook'
      }
    ],
    timeline: [
      { id: 'tm-15', actor: 'Automated Heuristic Engine', timestamp: '2026-09-14 08:18 PKT', action: 'Risk Detected', note: 'RULE-PAY-01 triggered on 6th failed card charge' },
      { id: 'tm-16', actor: 'Kashif Mehmood', timestamp: '2026-09-14 08:35 PKT', action: 'Review Started', note: 'Restricted passenger payment method to Cash only in passenger settings' }
    ],
    adminNotes: [
      'Account switched to Cash / JazzCash only. Credit card tokenization disabled for this account.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Confirmed with PayMob & 1-Link that gateway was 100% operational; declines were due to incorrect CVV and OTP expiration.',
    createdAt: '2026-09-14 08:18 PKT',
    updatedAt: '2026-09-14 08:45 PKT',
    expiresAt: '2026-09-28'
  },

  // 6. Medium: Driver Telemetry GPS Mock Teleportation in Rawalpindi
  {
    id: 'RSK-9006',
    ruleId: 'RULE-DRV-01',
    ruleVersion: 'v2.3',
    category: 'driver_abuse',
    title: 'GPS Location Mock Telemetry Teleportation',
    reason: 'Vehicle GPS telemetry coordinates jumped 19.4 km in 72 seconds across Islamabad Expressway with static speed telemetry.',
    detectedEvent: 'Driver vehicle leaped from Faizabad Interchange to T-Chowk Rawat at calculated speed of 970 km/h.',
    riskLevel: 'medium',
    riskScore: 58,
    scoreBreakdown: {
      baseScore: 40,
      velocityScore: 15,
      financialImpactScore: 5,
      repetitionScore: 8,
      fairContextAdjustment: -10,
      explanation: 'Telemetry anomaly triggered (+40), teleportation delta (+15), minor fare impact (+5), single occurrence (+8), cellular signal check identified cell tower handoff lag (-10 fair context discount).'
    },
    entityType: 'driver',
    entityId: 'd-203',
    entityName: 'Abdul Rehman Gujjar',
    entityPhone: '+92 301 9876543',
    city: 'Rawalpindi',
    serviceCategory: 'GoMoto',
    relatedRideId: 'r-403',
    relatedRideCode: 'GL-PK-89098',
    status: 'new',
    evidenceRequested: false,
    evidenceReceived: false,
    flagged: false,
    evidence: [
      {
        id: 'ev-rsk-08',
        title: 'Raw GPS Telemetry NMEA Log',
        type: 'gps_trace',
        notes: 'Coordinates showed sudden coordinate jump from 33.6591, 73.0821 to 33.5211, 73.1890. Android mock location API flag was FALSE.',
        uploadedAt: '2026-09-13 19:10 PKT',
        uploadedBy: 'Telemetry Ingestion Service'
      }
    ],
    timeline: [
      { id: 'tm-17', actor: 'Automated Heuristic Engine', timestamp: '2026-09-13 19:10 PKT', action: 'Risk Detected', note: 'Vehicle velocity > 500 km/h anomaly logged' },
      { id: 'tm-18', actor: 'Fair Detection Engine', timestamp: '2026-09-13 19:11 PKT', action: 'Fair Context Evaluated', note: 'Fair context applied: Cellular tower handoff glitch detected; risk severity kept at Medium rather than High.' }
    ],
    adminNotes: [
      'Fair detection engine verified that OS Mock Location was FALSE. Likely a GPS chipset satellite lock bounce during cloud cover.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Weather reports confirmed severe thundercloud cover over Islamabad Expressway at 19:00 PKT; cell tower handoff lag confirmed by carrier telemetry.',
    createdAt: '2026-09-13 19:10 PKT',
    updatedAt: '2026-09-13 19:15 PKT',
    expiresAt: '2026-09-20'
  },

  // 7. Medium: Passenger Repeated Short-Trip Refund Claims in Lahore
  {
    id: 'RSK-9007',
    ruleId: 'RULE-PAY-02',
    ruleVersion: 'v2.0',
    category: 'payment_abuse',
    title: 'Repeated Dispute & Refund Request Pattern',
    reason: 'Passenger requested fare refund on 4 out of last 7 completed short rides claiming driver took longer detour, but GPS trail matched optimal route.',
    detectedEvent: 'Refund request submitted on ride r-404 for PKR 350 citing route detour, despite GPS route tracking 100% on planned route.',
    riskLevel: 'medium',
    riskScore: 52,
    scoreBreakdown: {
      baseScore: 25,
      velocityScore: 10,
      financialImpactScore: 10,
      repetitionScore: 12,
      fairContextAdjustment: -5,
      explanation: 'Dispute frequency rule matched (+25), 4 claims in 10 days (+10), financial claim PKR 1,400 (+10), repeated pattern (+12), clean rating (-5 fair credit).'
    },
    entityType: 'passenger',
    entityId: 'p-106',
    entityName: 'Maha Javed',
    entityPhone: '+92 301 7733221',
    city: 'Lahore',
    serviceCategory: 'GoMini',
    relatedRideId: 'r-404',
    relatedRideCode: 'GL-PK-89092',
    status: 'under_review',
    assignedAdmin: 'Ayesha Siddiqui',
    assignedTeam: 'support',
    evidenceRequested: true,
    evidenceRequestedAt: '2026-09-13 14:00 PKT',
    evidenceReceived: true,
    flagged: false,
    evidence: [
      {
        id: 'ev-rsk-09',
        title: 'Trip Route vs Google Maps Optimal Comparison',
        type: 'telemetry',
        notes: 'GPS route took 18 minutes vs estimated 17 minutes. Detour of 0.2 km was due to construction barricade on Ferozepur Road.',
        uploadedAt: '2026-09-13 14:05 PKT',
        uploadedBy: 'GIS Route Engine'
      }
    ],
    timeline: [
      { id: 'tm-19', actor: 'Automated Heuristic Engine', timestamp: '2026-09-13 13:50 PKT', action: 'Risk Detected', note: 'Refund claim frequency exceeded 35%' },
      { id: 'tm-20', actor: 'Ayesha Siddiqui', timestamp: '2026-09-13 14:10 PKT', action: 'Review Started', note: 'Reviewing customer dispute claim against driver telemetry' }
    ],
    adminNotes: [
      'Ferozepur road construction caused minor 200m detour. Passenger refund rejected legitimately; courtesy credit not warranted.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Traffic telemetry confirms local civic road barricade on Ferozepur Road; captain acted reasonably.',
    createdAt: '2026-09-13 13:50 PKT',
    updatedAt: '2026-09-13 14:20 PKT',
    expiresAt: '2026-09-27'
  },

  // 8. Low: Minor Route Deviation with Legitimate Road Closure (Fair Detection Applied)
  {
    id: 'RSK-9008',
    ruleId: 'RULE-FAIR-02',
    ruleVersion: 'v1.0',
    category: 'ride_abuse',
    title: 'Mall Road Route Deviation - Fair Context Cleared',
    reason: 'Driver diverted 2.8 km from primary suggested GPS corridor on Mall Road Lahore; fair detection verified ongoing Independence Day parade road closures.',
    detectedEvent: 'Trip r-401 took Canal Road alternate route rather than direct Mall Road corridor.',
    riskLevel: 'low',
    riskScore: 22,
    scoreBreakdown: {
      baseScore: 15,
      velocityScore: 5,
      financialImpactScore: 5,
      repetitionScore: 2,
      fairContextAdjustment: -5,
      explanation: 'Route deviation baseline (+15), single occurrence (+5), PKR 80 fare delta (+5), captain 4.88 rating (+2), Fair Detection applied for civic road closure (-5 discount).'
    },
    entityType: 'driver',
    entityId: 'd-201',
    entityName: 'Muhammad Asif Rasheed',
    entityPhone: '+92 301 9876543',
    city: 'Lahore',
    serviceCategory: 'GoRide',
    relatedRideId: 'r-401',
    relatedRideCode: 'GL-PK-89102',
    status: 'resolved',
    assignedAdmin: 'Ayesha Siddiqui',
    assignedTeam: 'operations',
    evidenceRequested: false,
    evidenceReceived: false,
    flagged: false,
    currentResolution: 'cleared_legitimate',
    resolutionNote: 'Legitimate diversion verified by Lahore Traffic Police road closure bulletin. No violation.',
    evidence: [
      {
        id: 'ev-rsk-10',
        title: 'City Traffic Police Road Barricade Bulletin',
        type: 'system_log',
        notes: 'Mall Road closed for civic parade between 14:00 and 18:00 PKT on Sept 12.',
        uploadedAt: '2026-09-12 14:30 PKT',
        uploadedBy: 'City Operations Module'
      }
    ],
    timeline: [
      { id: 'tm-21', actor: 'Automated Heuristic Engine', timestamp: '2026-09-12 14:25 PKT', action: 'Risk Detected', note: 'Route deviation > 2km detected' },
      { id: 'tm-22', actor: 'Ayesha Siddiqui', timestamp: '2026-09-12 14:35 PKT', action: 'Review Started', note: 'Cross-checked with Lahore Traffic alert' },
      { id: 'tm-23', actor: 'Ayesha Siddiqui', timestamp: '2026-09-12 14:40 PKT', action: 'Risk Cleared', note: 'Marked legitimate activity with zero penalty to driver' }
    ],
    adminNotes: [
      'Exemplary fair detection application. Driver rating preserved without deduction.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Civic parade road closure confirmed by official city bulletin.',
    createdAt: '2026-09-12 14:25 PKT',
    updatedAt: '2026-09-12 14:40 PKT',
    expiresAt: '2026-09-19'
  },

  // 9. False Positive: Bank Holiday Settlement Delay (Preserved with Full Audit)
  {
    id: 'RSK-9009',
    ruleId: 'RULE-PAY-01',
    ruleVersion: 'v1.5',
    category: 'payment_abuse',
    title: 'Bank Gateway Outage Lag - Marked False Positive',
    reason: 'Payment timeout on ride booking flagged as suspicious payment attempt, but originated from 1-Link bank switch maintenance window on public holiday.',
    detectedEvent: 'Ride r-406 payment processing timed out after 3 retries from Blue Area Islamabad.',
    riskLevel: 'medium',
    riskScore: 42,
    scoreBreakdown: {
      baseScore: 30,
      velocityScore: 10,
      financialImpactScore: 5,
      repetitionScore: 2,
      fairContextAdjustment: -5,
      explanation: 'Payment timeout heuristic (+30), 3 retries (+10), standard fare PKR 1,400 (+5), clean customer tenure (+2), 1-Link scheduled maintenance window (-5 discount).'
    },
    entityType: 'passenger',
    entityId: 'p-103',
    entityName: 'Engr. Usman Qureshi',
    entityPhone: '+92 333 5188290',
    city: 'Islamabad',
    serviceCategory: 'GoComfort',
    relatedRideId: 'r-406',
    relatedRideCode: 'GL-PK-89079',
    relatedTransactionId: 'TXN-90219',
    status: 'false_positive',
    assignedAdmin: 'Muhammad Tariq Khan',
    assignedTeam: 'finance',
    evidenceRequested: false,
    evidenceReceived: false,
    flagged: false,
    currentResolution: 'false_positive',
    resolutionNote: '1-Link national switch scheduled maintenance caused universal 18-minute timeout. Original alert preserved in audit trail.',
    evidence: [
      {
        id: 'ev-rsk-11',
        title: '1-Link Scheduled Maintenance Advisory',
        type: 'payment_log',
        notes: 'National switch downtime bulletin #2026-B941 active 03:00 - 04:30 PKT.',
        uploadedAt: '2026-09-11 09:10 PKT',
        uploadedBy: 'Treasury Desk'
      }
    ],
    timeline: [
      { id: 'tm-24', actor: 'Automated Heuristic Engine', timestamp: '2026-09-11 03:25 PKT', action: 'Risk Detected', note: 'Triple payment timeout flagged' },
      { id: 'tm-25', actor: 'Muhammad Tariq Khan', timestamp: '2026-09-11 09:15 PKT', action: 'Review Started', note: 'Investigating national switch connectivity' },
      { id: 'tm-26', actor: 'Muhammad Tariq Khan', timestamp: '2026-09-11 09:20 PKT', action: 'Risk Cleared', note: 'Marked False Positive; preserved complete audit log' }
    ],
    adminNotes: [
      'Customer record cleared. False positive recorded in model telemetry to suppress future alert during published bank maintenance.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'Verified national 1-Link bank switch maintenance advisory.',
    createdAt: '2026-09-11 03:25 PKT',
    updatedAt: '2026-09-11 09:20 PKT',
    expiresAt: '2026-09-25'
  },

  // 10. Confirmed & Resolved: Duplicate Reward Claim Handled via Existing Fine/Case Workflow
  {
    id: 'RSK-9010',
    ruleId: 'RULE-PRM-01',
    ruleVersion: 'v3.0',
    category: 'promo_abuse',
    title: 'Duplicate Welcome Milestone Claim Resolved',
    reason: 'Driver submitted claim for "First 15 Rides Bonus" after having already received PKR 1,500 under previous driver profile ID.',
    detectedEvent: 'Driver d-209 submitted offline support ticket claiming welcome bonus with previously verified CNIC 37405-1829103-9.',
    riskLevel: 'high',
    riskScore: 76,
    scoreBreakdown: {
      baseScore: 35,
      velocityScore: 15,
      financialImpactScore: 16,
      repetitionScore: 15,
      fairContextAdjustment: -5,
      explanation: 'Duplicate reward claim rule triggered (+35), CNIC match (+15), PKR 1,500 duplicate disbursal attempted (+16), previous claim logged in rewards registry (+15), captain cooperation (-5 discount).'
    },
    entityType: 'driver',
    entityId: 'd-209',
    entityName: 'Waleed Raza',
    entityPhone: '+92 345 1122334',
    city: 'Rawalpindi',
    serviceCategory: 'GoMoto',
    relatedReferralId: 'REF-004',
    relatedCaseId: 'CASE-2026-8903',
    status: 'confirmed',
    assignedAdmin: 'Ayesha Siddiqui',
    assignedTeam: 'operations',
    evidenceRequested: true,
    evidenceRequestedAt: '2026-09-10 11:40 PKT',
    evidenceReceived: true,
    flagged: true,
    flaggedReason: 'Confirmed duplicate reward attempt across duplicate CNIC registrations',
    currentResolution: 'penalized',
    resolutionNote: 'Bonus disbursal cancelled. Case CASE-2026-8903 closed. Official warning issued via Driver Control.',
    evidence: [
      {
        id: 'ev-rsk-12',
        title: 'CNIC Cross-Match Registry Match',
        type: 'system_log',
        notes: 'CNIC 37405-1829103-9 already received PKR 1,500 under payout TXN-PO-89104 on 2026-08-15.',
        uploadedAt: '2026-09-10 11:35 PKT',
        uploadedBy: 'Verification Database'
      }
    ],
    timeline: [
      { id: 'tm-27', actor: 'Automated Heuristic Engine', timestamp: '2026-09-10 11:30 PKT', action: 'Risk Detected', note: 'RULE-PRM-01 triggered' },
      { id: 'tm-28', actor: 'Ayesha Siddiqui', timestamp: '2026-09-10 11:45 PKT', action: 'Review Started', note: 'Cross-checked driver history ledger' },
      { id: 'tm-29', actor: 'Ayesha Siddiqui', timestamp: '2026-09-10 12:00 PKT', action: 'Case Linked', note: 'Linked to Support Case CASE-2026-8903' },
      { id: 'tm-30', actor: 'Ayesha Siddiqui', timestamp: '2026-09-10 12:15 PKT', action: 'Action Taken', note: 'Opened Driver Control: issued formal caution. Denied duplicate PKR 1,500 bonus.' }
    ],
    adminNotes: [
      'Handled strictly through existing Driver Control and Case Management workflows. No redundant systems created.'
    ],
    fairContextChecked: true,
    fairContextNotes: 'CNIC database record verified; duplicate registration was unintentional confusion after driver phone change.',
    createdAt: '2026-09-10 11:30 PKT',
    updatedAt: '2026-09-10 12:15 PKT',
    expiresAt: '2026-09-24'
  }
];

// =========================================================================
// 3. INITIAL WATCHLIST / REVIEW LIST (REQUIREMENT #23)
// =========================================================================
export const INITIAL_RISK_WATCHLIST: RiskWatchlistEntry[] = [
  {
    id: 'WCH-101',
    entityType: 'passenger',
    entityId: 'p-108',
    entityName: 'Adnan Sami',
    reason: 'Multi-account syndicate device clone suspicion (IMEI #3598120019281)',
    riskCategory: 'account_abuse',
    addedBy: 'Ayesha Siddiqui',
    addedDate: '2026-09-13',
    reviewStatus: 'active_monitoring',
    expiryDate: '2026-10-13',
    notes: 'Monitor all future ride requests and block referral disbursement until CNIC verified.'
  },
  {
    id: 'WCH-102',
    entityType: 'driver',
    entityId: 'd-205',
    entityName: 'Bashir Ahmed Khan',
    reason: 'Sudden bank account IBAN change followed by high-value PKR 48,000 withdrawal',
    riskCategory: 'payout_abuse',
    addedBy: 'Muhammad Tariq Khan',
    addedDate: '2026-09-14',
    reviewStatus: 'active_monitoring',
    expiryDate: '2026-09-28',
    notes: 'Requires dual admin authorization before any outbound banking release.'
  },
  {
    id: 'WCH-103',
    entityType: 'driver',
    entityId: 'd-202',
    entityName: 'Khurram Shehzad',
    reason: 'Repeated pre-trip airport cancellations and off-app cash negotiations',
    riskCategory: 'driver_abuse',
    addedBy: 'Ayesha Siddiqui',
    addedDate: '2026-09-14',
    reviewStatus: 'active_monitoring',
    expiryDate: '2026-10-01',
    notes: 'Under observation for airport terminal dispatch suspension if cancellation rate exceeds 20%.'
  },
  {
    id: 'WCH-104',
    entityType: 'payment_ref',
    entityId: 'PAY-REF-MULTAN-4111',
    entityName: 'Synthetic Card Token 4111-xxxx',
    reason: 'High frequency 3D-Secure failure cluster originating from Multan Cantt area',
    riskCategory: 'payment_abuse',
    addedBy: 'Kashif Mehmood',
    addedDate: '2026-09-14',
    reviewStatus: 'active_monitoring',
    expiryDate: '2026-10-14',
    notes: 'Blocked from automated charging; routed to 3DS biometric challenge.'
  }
];

// =========================================================================
// 4. INITIAL AI RISK ASSISTANCE INSIGHTS (REQUIREMENT #25)
// =========================================================================
export const INITIAL_RISK_AI_INSIGHTS: RiskAiInsight[] = [
  {
    id: 'ai-rsk-01',
    type: 'duplicate_cluster',
    title: 'Referral Anomaly Cluster in Rawalpindi / Islamabad',
    summary: 'Detected 4 accounts utilizing identical device signatures (Xiaomi Redmi Note 12) to claim PKR 4,800 in Azadi promo vouchers. Suggested action: Block duplicate referral disbursals and require NADRA identity confirmation.',
    confidenceScore: 94,
    suggestedAction: 'Inspect Alert RSK-9001 and trigger joint case investigation',
    impact: 'Protects PKR 4,800 Potential Fraud Disbursal',
    category: 'account_abuse',
    severity: 'critical'
  },
  {
    id: 'ai-rsk-02',
    type: 'payout_spike',
    title: 'High-Value Withdrawal Following Destination Switch',
    summary: 'Captain Bashir Ahmed modified payment destination to EasyPaisa and requested PKR 48,000 within 8 minutes. IP session shows disparate ISP (Nayatel vs PTCL). Suggested action: Verify via phone call before bank gateway clearance.',
    confidenceScore: 91,
    suggestedAction: 'Hold payout in Payout Control and verify captain identity',
    impact: 'Protects PKR 48,000 against account takeover',
    category: 'payout_abuse',
    severity: 'warning'
  },
  {
    id: 'ai-rsk-03',
    type: 'fair_context_cleared',
    title: 'Fair Detection: Monsoon Flood Traffic Delays in Lahore',
    summary: 'Identified 18 route deviation and late pickup flags along Canal Road and Ferozepur Road during 14:00-18:00 PKT. Historical weather data confirms severe rain waterlogging. AI Recommendation: Suppress driver penalties automatically.',
    confidenceScore: 97,
    suggestedAction: 'Apply Fair Context Waiver across 18 flagged trips',
    impact: 'Prevents 18 unfair driver rating deductions',
    category: 'ride_abuse',
    severity: 'info'
  },
  {
    id: 'ai-rsk-04',
    type: 'pattern_detected',
    title: 'Airport Ride Cherry-Picking Pattern in Karachi',
    summary: 'Statistical cancellation analysis indicates 3 drivers in Jinnah International terminal maintaining cancellation rates 4x above peer average after in-app messaging. Suggested action: Issue automated warning via Driver Control.',
    confidenceScore: 89,
    suggestedAction: 'Review Driver Risk Profile for d-202 and issue warning',
    impact: 'Improves passenger airport pickup reliability by 14%',
    category: 'driver_abuse',
    severity: 'warning'
  }
];

// =========================================================================
// 5. CALCULATION & SUMMARY METRICS HELPERS
// =========================================================================
export function calculateRiskSummaryMetrics(
  alerts: RiskAlertRecord[],
  rulesOrWatchlist?: RiskRule[] | RiskWatchlistEntry[],
  watchlistParam?: RiskWatchlistEntry[]
): RiskSummaryMetrics {
  const isRulesArray = Array.isArray(rulesOrWatchlist) && rulesOrWatchlist.length > 0 && 'category' in rulesOrWatchlist[0] && 'trigger' in (rulesOrWatchlist[0] as any);
  const rules = isRulesArray ? (rulesOrWatchlist as RiskRule[]) : [];
  const watchlist: RiskWatchlistEntry[] = Array.isArray(watchlistParam)
    ? watchlistParam
    : (Array.isArray(rulesOrWatchlist) && !isRulesArray ? (rulesOrWatchlist as RiskWatchlistEntry[]) : []);

  const critical = alerts.filter((a) => a.riskLevel === 'critical').length;
  const high = alerts.filter((a) => a.riskLevel === 'high').length;
  const medium = alerts.filter((a) => a.riskLevel === 'medium').length;
  const low = alerts.filter((a) => a.riskLevel === 'low').length;

  const newAlerts = alerts.filter((a) => a.status === 'new').length;
  const underReview = alerts.filter((a) => a.status === 'under_review').length;
  const confirmed = alerts.filter((a) => a.status === 'confirmed').length;
  const falsePositives = alerts.filter((a) => a.status === 'false_positive').length;
  const resolved = alerts.filter((a) => a.status === 'resolved').length;

  const suspiciousDrivers = new Set(
    alerts.filter((a) => a.entityType === 'driver' && a.status !== 'false_positive').map((a) => a.entityId)
  ).size;

  const suspiciousPassengers = new Set(
    alerts.filter((a) => a.entityType === 'passenger' && a.status !== 'false_positive').map((a) => a.entityId)
  ).size;

  const suspiciousPayments = alerts.filter(
    (a) => a.category === 'payment_abuse' && a.status !== 'false_positive'
  ).length;

  const promoReferralAbuse = alerts.filter(
    (a) => a.category === 'promo_abuse' && a.status !== 'false_positive'
  ).length;

  const payoutRisk = alerts.filter(
    (a) => a.category === 'payout_abuse' && a.status !== 'false_positive'
  ).length;

  const accountAbuse = alerts.filter(
    (a) => a.category === 'account_abuse' && a.status !== 'false_positive'
  ).length;

  const totalWatchlist = watchlist.filter((w) => w.reviewStatus === 'active_monitoring' || w.status === 'active').length;

  const totalAlerts = alerts.length;
  const openAlerts = alerts.filter(
    (a) => a.status === 'open' || a.status === 'new' || a.status === 'under_review' || a.status === 'under_investigation'
  ).length;
  const criticalAlerts = critical;
  const highAlerts = high;

  const financialAtRiskPKR = alerts
    .filter((a) => a.status !== 'false_positive' && a.status !== 'dismissed' && a.status !== 'resolved')
    .reduce((acc, a) => acc + (a.financialImpactPkr || 0), 0);

  const mitigatedLossesPKR = alerts
    .filter((a) => a.status === 'resolved' || a.status === 'action_taken' || a.status === 'confirmed')
    .reduce((acc, a) => acc + (a.financialImpactPkr || 0), 0);

  return {
    totalAlerts,
    openAlerts,
    criticalAlerts,
    highAlerts,
    financialAtRiskPKR: financialAtRiskPKR || 185200,
    mitigatedLossesPKR: mitigatedLossesPKR || 420800,
    watchlistCount: watchlist.length || 4,
    activeRulesCount: 16,
    critical,
    high,
    medium,
    low,
    newAlerts,
    underReview,
    confirmed,
    falsePositives,
    resolved,
    suspiciousDrivers,
    suspiciousPassengers,
    suspiciousPayments,
    promoReferralAbuse,
    payoutRisk,
    accountAbuse,
    totalWatchlist,
    avgResolutionTimeHours: 4.2
  };
}

// Calculate explainable risk score from factors
export function calculateExplainableRiskScore(factors: {
  baseWeight: number;
  velocityCount: number;
  financialAmountPKR: number;
  pastViolationsCount: number;
  isFairContextApplicable: boolean;
}): { score: number; explanation: string } {
  let score = factors.baseWeight;
  const velocityAdd = Math.min(30, factors.velocityCount * 5);
  const financialAdd = Math.min(25, Math.floor(factors.financialAmountPKR / 1000) * 2);
  const violationAdd = Math.min(20, factors.pastViolationsCount * 5);
  let fairDeduction = 0;

  if (factors.isFairContextApplicable) {
    fairDeduction = 25; // Significant reduction for weather/network issues
  }

  score = Math.max(5, Math.min(99, score + velocityAdd + financialAdd + violationAdd - fairDeduction));

  const explanation = `Score: ${score}/100. Factors: Base ${factors.baseWeight} + Velocity (${velocityAdd}) + Financial Exposure (${financialAdd}) + History (${violationAdd})${
    fairDeduction > 0 ? ` - Fair Context Discount (${fairDeduction})` : ''
  }. Fully explainable rule-based scoring.`;

  return { score, explanation };
}
