import {
  SystemControlSettings,
  FeatureControl,
  BusinessRulesConfig,
  SensitiveApprovalRule,
  ConfigurationOverride,
  RuleVersionRecord,
  ConfigurationConflict,
  SettingsAiRecommendation
} from '../types';

// ============================================================================
// 1. DEFAULT SYSTEM CONTROL SETTINGS (PAKISTAN OPERATIONS)
// ============================================================================

export const DEFAULT_SYSTEM_SETTINGS: SystemControlSettings = {
  platformName: 'GoLife Taxi Pakistan',
  appName: 'GoLife Taxi',
  tagline: 'Move Freely. Live Fully.',
  taglineUrdu: 'آسانی سے چلیں، کھل کر جئیں',
  supportContact: {
    helplineUan: '+92 21 111 465 433 (111-GOLIFE)',
    emergencyHelpline: '+92 42 15 / 1122 (Punjab & Sindh Police Bridge)',
    whatsapp: '+92 300 1234567',
    email: 'support@golife.pk',
    safetyEmail: 'safety@golife.pk',
    headOfficeAddress: 'Level 4, Tricon Corporate Centre, Main Boulevard Gulberg, Lahore, Pakistan'
  },
  defaultCountry: 'Pakistan',
  defaultCurrency: 'PKR',
  defaultCurrencySymbol: 'Rs.',
  defaultCountryCode: '+92',
  defaultLanguage: 'en',
  secondaryLanguage: 'ur',
  timezone: 'Asia/Karachi (PKT, UTC+5)',
  dateTimeFormat: 'DD/MM/YYYY hh:mm A',
  distanceUnit: 'km',
  currencyFormatting: 'Rs. {amount}',
  operatingStatus: 'online',
  mode: 'demo',
  maintenance: {
    enabled: false,
    scope: 'all',
    message: 'GoLife Taxi platform is undergoing scheduled maintenance to upgrade core dispatch servers. Service will resume shortly.',
    messageUrdu: 'گو لائف ٹیکسی سروس میں سسٹم اپ گریڈ کا کام جاری ہے۔ جلد سروس بحال کر دی جائے گی۔',
    startSchedule: '2026-09-20T02:00:00+05:00',
    endSchedule: '2026-09-20T04:30:00+05:00',
    adminBypassAllowed: true,
    activatedBy: 'superadmin@golife.pk',
    activatedAt: '2026-09-14 10:00 PKT'
  },
  lastUpdated: '2026-09-14 14:30 PKT',
  updatedBy: 'superadmin@golife.pk'
};

// ============================================================================
// 2. CENTRAL FEATURE CONTROLS (32 ESSENTIAL MODULES)
// ============================================================================

export const INITIAL_FEATURE_CONTROLS: FeatureControl[] = [
  // Core Mobility
  {
    id: 'feat-passenger-mode',
    name: 'Passenger Mode',
    nameUrdu: 'مسافر موڈ',
    description: 'Allow passengers to log in, search rides, view live estimates, and book transport.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Primary core passenger gateway across all operating cities.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-driver-mode',
    name: 'Driver Mode',
    nameUrdu: 'ڈرائیور موڈ',
    description: 'Driver online switch, ride matching radar, counter-bidding, and trip navigation.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Driver application operational switch.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-ride-booking',
    name: 'Ride Booking Engine',
    nameUrdu: 'سواری بکنگ سسٹم',
    description: 'Real-time on-demand trip dispatching and request broadcast.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Master dispatch engine for all intra-city trips.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-fare-negotiation',
    name: 'Fare Negotiation (Bidding)',
    nameUrdu: 'کرایہ پر بات چیت',
    description: 'Enable passenger initial bid and driver counter-offer fare agreement mechanism.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    startDate: '2026-01-15',
    adminNote: 'Popular peer-to-peer bidding across Pakistan.',
    lastUpdated: '2026-09-11 16:40 PKT',
    updatedBy: 'ops_director@golife.pk',
    dependencies: ['feat-ride-booking']
  },
  {
    id: 'feat-driver-matching',
    name: 'Driver Matching & Proximity Radar',
    nameUrdu: 'قریبی ڈرائیور کی تلاش',
    description: 'Geospatial H3 index proximity matcher for nearest eligible online captains.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Core location-based driver dispatch filter.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-driver-verification',
    name: 'Driver NADRA & License Verification',
    nameUrdu: 'ڈرائیور کی تصدیق و نادرا چیک',
    description: 'Mandatory verification gate requiring approved CNIC and driving license before taking trips.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Security compliance requirement under Punjab/Sindh transport regulations.',
    lastUpdated: '2026-09-12 09:15 PKT',
    updatedBy: 'verification_admin@golife.pk'
  },
  {
    id: 'feat-intercity',
    name: 'City-to-City (Intercity)',
    nameUrdu: 'بین الشہری سفر',
    description: 'Long-distance intercity booking across M-2, M-3, M-5 Motorways and GT Road.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'cities',
    cityScope: ['Lahore', 'Islamabad', 'Rawalpindi', 'Karachi', 'Faisalabad', 'Peshawar'],
    serviceCategoryScope: ['GoRide', 'GoComfort', 'GoIntercity'],
    startDate: '2026-02-01',
    adminNote: 'Active on designated motorway intercity corridors.',
    lastUpdated: '2026-09-11 10:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-freight',
    name: 'Freight & Cargo Logistics',
    nameUrdu: 'سامان برداری و لوڈر',
    description: 'Commercial cargo, furniture, and light freight delivery with Shahzore & Suzuki Ravi.',
    category: 'core_mobility',
    status: 'active',
    availabilityScope: 'cities',
    cityScope: ['Lahore', 'Karachi', 'Rawalpindi', 'Islamabad', 'Faisalabad'],
    serviceCategoryScope: ['GoFreight'],
    startDate: '2026-02-15',
    adminNote: 'Enabled in major industrial and commercial urban hubs.',
    lastUpdated: '2026-09-11 10:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },

  // Payments & Financials
  {
    id: 'feat-payments-master',
    name: 'Payments Master Engine',
    nameUrdu: 'ادائیگیوں کا مرکزی نظام',
    description: 'Master payment gateway processing all electronic, cash, and wallet settlements.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Do not disable unless undergoing total banking reconciliation.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'feat-pay-cash',
    name: 'Cash Payments (COD)',
    nameUrdu: 'نقد ادائیگی',
    description: 'Direct cash handover from rider to captain upon trip arrival.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Represents ~78% of all ride volume in Pakistan.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'feat-pay-jazzcash',
    name: 'JazzCash Gateway',
    nameUrdu: 'جاز کیش',
    description: 'Mobile wallet debit & direct USSD push prompt via Mobilink Microfinance Bank.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Connected with Jazz shortcode 9444 merchant terminal.',
    lastUpdated: '2026-09-12 14:00 PKT',
    updatedBy: 'finance_admin@golife.pk',
    dependencies: ['feat-payments-master']
  },
  {
    id: 'feat-pay-easypaisa',
    name: 'Easypaisa Gateway',
    nameUrdu: 'ایزی پیسہ',
    description: 'Telenor Bank Easypaisa in-app checkout and mobile wallet direct link.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Connected via Telenor Microfinance API sandbox/live bridge.',
    lastUpdated: '2026-09-12 14:00 PKT',
    updatedBy: 'finance_admin@golife.pk',
    dependencies: ['feat-payments-master']
  },
  {
    id: 'feat-pay-bank',
    name: '1Link Raast Bank Payments',
    nameUrdu: 'بینک ٹرانسفر و راست',
    description: 'State Bank of Pakistan Raast instant payment ID & 1Link IBFT integration.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-02-01',
    adminNote: 'Zero-fee instant P2M clearing under SBP regulations.',
    lastUpdated: '2026-09-12 14:00 PKT',
    updatedBy: 'finance_admin@golife.pk',
    dependencies: ['feat-payments-master']
  },
  {
    id: 'feat-pay-card',
    name: 'Visa & Mastercard Processing',
    nameUrdu: 'بینک کارڈ ادائیگی',
    description: 'Debit/credit card processing via PayFast / Habib Bank payment gateway.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-03-01',
    adminNote: 'Secured via 3D Secure OTP verification.',
    lastUpdated: '2026-09-12 14:00 PKT',
    updatedBy: 'finance_admin@golife.pk',
    dependencies: ['feat-payments-master']
  },
  {
    id: 'feat-wallet',
    name: 'GoLife In-App Closed-Loop Wallet',
    nameUrdu: 'گو لائف والیٹ',
    description: 'Digital stored value balance for automated fare deduct, bonuses, and driver top-up.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Enables negative balance credit tolerance up to Rs 200.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'finance_admin@golife.pk',
    dependencies: ['feat-payments-master']
  },
  {
    id: 'feat-driver-payouts',
    name: 'Driver Payouts (Daily/Weekly)',
    nameUrdu: 'ڈرائیور کی رقوم کی ادائیگی',
    description: 'Automated and on-demand disbursement of driver earnings to JazzCash, Easypaisa, or Raast.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Requires minimum wallet balance of Rs 500.',
    lastUpdated: '2026-09-13 18:00 PKT',
    updatedBy: 'finance_admin@golife.pk',
    dependencies: ['feat-payments-master', 'feat-wallet']
  },
  {
    id: 'feat-refunds',
    name: 'Passenger Instant Refunds',
    nameUrdu: 'مسافر کی رقم کی واپسی',
    description: 'Automated and admin-approved refunds for cancelled trips or route overcharges.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Directly credit passenger GoLife wallet or original payment instrument.',
    lastUpdated: '2026-09-11 12:00 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'feat-reimbursements',
    name: 'Driver Expense Reimbursements',
    nameUrdu: 'ڈرائیور کے اخراجات کی واپسی',
    description: 'Compensate drivers for approved motorway toll receipts, cleaning fees, and unpaid passenger cash debts.',
    category: 'payments',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Reimbursement requires review and supervisor sign-off.',
    lastUpdated: '2026-09-11 12:00 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },

  // Growth & Engagement
  {
    id: 'feat-promotions',
    name: 'Promotions & Promo Codes',
    nameUrdu: 'پروموشن و ڈسکاؤنٹ کوڈز',
    description: 'Discount coupons, percentage rebates, and seasonal festival marketing offers.',
    category: 'growth',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Integrated with anti-stacking and velocity abuse safeguards.',
    lastUpdated: '2026-09-12 11:00 PKT',
    updatedBy: 'marketing_head@golife.pk'
  },
  {
    id: 'feat-referrals',
    name: 'Referrals Engine',
    nameUrdu: 'دوستوں کو مدعو کرنے کا بونس',
    description: 'Reward riders with Rs 150 and captains with Rs 500 when invited peers complete qualifying trips.',
    category: 'growth',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Auto-disbursed only after 3 completed trips by referee.',
    lastUpdated: '2026-09-12 11:00 PKT',
    updatedBy: 'marketing_head@golife.pk'
  },
  {
    id: 'feat-rewards',
    name: 'Rewards & Loyalty Points',
    nameUrdu: 'وفاداری کے انعامات',
    description: 'Tier progression (Silver, Gold, Platinum) with fuel vouchers and commission discount perks.',
    category: 'growth',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-02-01',
    adminNote: 'Calculated at end of each calendar month.',
    lastUpdated: '2026-09-12 11:00 PKT',
    updatedBy: 'marketing_head@golife.pk'
  },
  {
    id: 'feat-academy',
    name: 'Drivers Academy',
    nameUrdu: 'ڈرائیور اکیڈمی',
    description: 'Mandatory online training modules covering customer etiquette, traffic rules, and Urdu/English lessons.',
    category: 'growth',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Graduation quiz is required for first-time onboarding.',
    lastUpdated: '2026-09-10 16:00 PKT',
    updatedBy: 'ops_director@golife.pk'
  },
  {
    id: 'feat-loans',
    name: 'Driver Micro-Loans & Fuel Advances',
    nameUrdu: 'ڈرائیور فیول و مرمت ایڈوانس',
    description: 'Short-term credit advances with Finja and Mobilink Microfinance for tyres, maintenance, and fuel.',
    category: 'growth',
    status: 'active',
    availabilityScope: 'cities',
    cityScope: ['Lahore', 'Karachi', 'Rawalpindi', 'Islamabad'],
    serviceCategoryScope: ['GoMini', 'GoRide', 'GoAuto'],
    startDate: '2026-03-01',
    adminNote: 'Restricted to captains with > 4.75 rating and 500+ completed rides.',
    lastUpdated: '2026-09-10 16:00 PKT',
    updatedBy: 'ops_director@golife.pk',
    dependencies: ['feat-wallet', 'feat-academy']
  },

  // Safety & Operations
  {
    id: 'feat-live-ops',
    name: 'Live Operations & Telematics',
    nameUrdu: 'لائیو مانیٹرنگ و ٹیلی میٹکس',
    description: 'Real-time vehicle GPS pinging, route deviation tracker, and city-wide heatmap monitoring.',
    category: 'operations',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Operates with 3-second heartbeat telematics during active trips.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'safety_admin@golife.pk'
  },
  {
    id: 'feat-sos-safety',
    name: 'SOS Panic Dispatch & Police 15',
    nameUrdu: 'ایمرجنسی ایس او ایس و پولیس 15',
    description: 'Emergency panic button connecting directly to GoLife 24/7 incident response room and Punjab/Sindh Police 15.',
    category: 'safety',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Mission critical. Automatically escalates unacknowledged alerts after 90 seconds.',
    lastUpdated: '2026-09-12 18:30 PKT',
    updatedBy: 'safety_admin@golife.pk'
  },
  {
    id: 'feat-in-app-chat',
    name: 'In-App Secure Chat',
    nameUrdu: 'ان ایپ میسجنگ',
    description: 'Encrypted textual messaging between rider and captain before and during the trip.',
    category: 'operations',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Includes automated profanity filter for Urdu and English.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-voip-calling',
    name: 'VoIP Masked Calling',
    nameUrdu: 'محفوظ کالنگ سسٹم',
    description: 'In-app internet audio call protecting passenger and captain private phone numbers.',
    category: 'safety',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Eliminates privacy leakage and harassment risks.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'safety_admin@golife.pk'
  },
  {
    id: 'feat-notifications',
    name: 'Push & SMS Notification Hub',
    nameUrdu: 'نوٹیفیکیشن و ایس ایم ایس ہب',
    description: 'FCM push messages and Jazz/Telenor shortcode 9444 SMS delivery.',
    category: 'operations',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Primary channel for trip updates, OTPs, and emergency broadcast.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-ratings',
    name: 'Ratings & Ride Feedback',
    nameUrdu: 'ریٹنگز اور آراء',
    description: 'Two-way 5-star rating system with predefined tags and detailed review submission.',
    category: 'operations',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Sub-4.0 star ratings trigger automatic supervisor review.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-complaints',
    name: 'Complaints & Dispute Support Desk',
    nameUrdu: 'شکایات و تنازعات سپورٹ ڈیسک',
    description: 'Centralized ticket management, evidence ingestion, and passenger/driver dispute handling.',
    category: 'operations',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Connected to Phase 48 Universal Case Management.',
    lastUpdated: '2026-09-10 11:20 PKT',
    updatedBy: 'support_admin@golife.pk'
  },

  // Automation & Intelligence
  {
    id: 'feat-automatic-rules',
    name: 'Automatic Business Rules Engine',
    nameUrdu: 'خودکار پالیسی و فائن انجن',
    description: 'Autonomous execution of fine assessments, late pickup exclusions, and inactivity suspensions.',
    category: 'automation',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-01-01',
    adminNote: 'Executes verified rules without manual dispatcher intervention.',
    lastUpdated: '2026-09-12 17:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'feat-ai-insights',
    name: 'AI Insights & Anomaly Detection',
    nameUrdu: 'اے آئی انٹیلی جنس و غیر معمولی سرگرمی الرٹ',
    description: 'Automated predictive supply/demand warnings, fraud scoring, and route anomaly detection.',
    category: 'automation',
    status: 'active',
    availabilityScope: 'global',
    cityScope: ['all'],
    serviceCategoryScope: ['all'],
    startDate: '2026-02-01',
    adminNote: 'Strict rule: AI advises and highlights anomalies; human admin approval is mandatory for critical financial or suspension actions.',
    lastUpdated: '2026-09-13 15:30 PKT',
    updatedBy: 'superadmin@golife.pk'
  }
];

// ============================================================================
// 3. DEFAULT CENTRAL BUSINESS RULES (PAKISTAN PRODUCTION-READY CONFIG)
// ============================================================================

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  rides: {
    maxRideRequestDistanceKm: 25,
    maxDriverSearchRadiusKm: 5.0,
    rideRequestExpirySec: 90,
    driverOfferExpirySec: 25,
    passengerOfferExpirySec: 45,
    maxCounterOffers: 3,
    driverArrivalFreeWaitMins: 5,
    passengerWaitBeforeCancelFeeMins: 5,
    rideCompletionRequirement: 'otp_and_proximity',
    pinRequirement: 'always',
    cancellationWindowFreeMins: 2,
    passengerCancellationFeePkr: 100
  },
  driver: {
    minDriverRatingThreshold: 4.2,
    maxActiveRidesLimit: 1,
    requireApprovedCnic: true,
    requireApprovedLicense: true,
    requireVehicleInspection: true,
    minWalletBalancePkr: 150,
    requiredDocuments: [
      'cnic_front',
      'cnic_back',
      'driving_license',
      'vehicle_reg',
      'vehicle_photos'
    ],
    driverInactivityThresholdDays: 30,
    latePickupWarningThresholdMins: 8,
    lateDropoffReviewThresholdMins: 15
  },
  passenger: {
    minPassengerRatingForCash: 3.0,
    passengerMaxOutstandingDebtPkr: 500,
    consecutiveCancellationsLockCount: 3,
    passengerNoShowFeePkr: 150,
    accountAutoLockOnAbuse: true
  },
  safety: {
    sosPoliceEscalationTimeoutSec: 90,
    criticalIncidentPriorityLevel: 'P1',
    autoShareLiveGpsWithEmergencyContacts: true,
    telemetryPingFrequencySeconds: 3,
    highSpeedWarningThresholdKmH: 95
  },
  payments: {
    minRidePaymentPkr: 50,
    maxRidePaymentPkr: 50000,
    minDriverWithdrawalPkr: 500,
    maxDriverWithdrawalPerDayPkr: 25000,
    maxNegativeWalletLimitPkr: -200,
    gatewayTimeoutSeconds: 180,
    failedPaymentAction: 'downgrade_to_cash_debt'
  },
  commission: {
    defaultCommissionPct: 15,
    punjabPraTaxPct: 16,
    sindhSrbTaxPct: 13,
    kpKpraTaxPct: 15,
    islamabadIctTaxPct: 16,
    balochistanBraTaxPct: 15,
    fbrWhtTaxPct: 5,
    driverReferralBonusPkr: 500,
    passengerReferralBonusPkr: 200
  },
  lastUpdated: '2026-09-14 12:00 PKT',
  updatedBy: 'superadmin@golife.pk'
};

// ============================================================================
// 4. SENSITIVE APPROVAL RULES (CONNECTED WITH PHASE 52 RBAC)
// ============================================================================

export const INITIAL_SENSITIVE_APPROVAL_RULES: SensitiveApprovalRule[] = [
  {
    id: 'appr-drv-suspend',
    actionCode: 'driver_suspension',
    actionTitle: 'Driver Account Suspension',
    category: 'driver',
    approvalType: 'role_based',
    requiredRole: 'safety_admin',
    enabled: true,
    description: 'Requires Safety Admin or Super Admin review before driver access is locked.',
    lastUpdated: '2026-09-10 11:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-drv-reinstate',
    actionCode: 'driver_reinstatement',
    actionTitle: 'Driver Account Reinstatement',
    category: 'driver',
    approvalType: 'two_level_maker_checker',
    requiredRole: 'operations_admin',
    enabled: true,
    description: 'Two-person maker-checker workflow: Support Agent recommends, Operations Lead approves.',
    lastUpdated: '2026-09-10 11:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-fine-waiver',
    actionCode: 'fine_waiver',
    actionTitle: 'Driver Fine Waiver / Dispute Relief',
    category: 'financial',
    approvalType: 'single_approval',
    requiredRole: 'support_admin',
    thresholdAmountPkr: 1000,
    autoApproveBelowThreshold: false,
    enabled: true,
    description: 'Support Supervisor can waive penalties under Rs 1,000; larger amounts require Finance Admin.',
    lastUpdated: '2026-09-11 14:20 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'appr-fine-refund',
    actionCode: 'fine_refund',
    actionTitle: 'Deducted Fine Reversal / Refund',
    category: 'financial',
    approvalType: 'two_level_maker_checker',
    requiredRole: 'finance_admin',
    thresholdAmountPkr: 2000,
    enabled: true,
    description: 'Maker-checker sign-off required before reversing fine balance to driver bank/wallet.',
    lastUpdated: '2026-09-11 14:20 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'appr-psg-refund',
    actionCode: 'passenger_refund',
    actionTitle: 'Passenger Wallet / Card Refund',
    category: 'financial',
    approvalType: 'single_approval',
    requiredRole: 'support_admin',
    thresholdAmountPkr: 1500,
    autoApproveBelowThreshold: true,
    enabled: true,
    description: 'Auto-approved for verified trip cancellations under Rs 1,500; high amounts require Finance Admin.',
    lastUpdated: '2026-09-11 14:20 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'appr-drv-reimburse',
    actionCode: 'driver_reimbursement',
    actionTitle: 'Driver Toll & Tollway Reimbursement',
    category: 'financial',
    approvalType: 'single_approval',
    requiredRole: 'finance_admin',
    thresholdAmountPkr: 3000,
    enabled: true,
    description: 'Finance review of toll plazas (M-2, M-3, Swat Motorway) before credit transfer.',
    lastUpdated: '2026-09-12 10:00 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'appr-payout-standard',
    actionCode: 'payout_approval',
    actionTitle: 'Standard Driver Payout Processing',
    category: 'financial',
    approvalType: 'single_approval',
    requiredRole: 'finance_admin',
    thresholdAmountPkr: 15000,
    autoApproveBelowThreshold: true,
    enabled: true,
    description: 'Automated batch release for normal daily payouts under Rs 15,000.',
    lastUpdated: '2026-09-12 10:00 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'appr-payout-large',
    actionCode: 'large_payout_approval',
    actionTitle: 'High-Value Driver Payout (> Rs. 15,000)',
    category: 'financial',
    approvalType: 'two_level_maker_checker',
    requiredRole: 'finance_admin',
    thresholdAmountPkr: 15000,
    enabled: true,
    description: 'Requires Finance Officer submission followed by Finance Director / Super Admin authorization.',
    lastUpdated: '2026-09-12 10:00 PKT',
    updatedBy: 'finance_admin@golife.pk'
  },
  {
    id: 'appr-pricing-change',
    actionCode: 'pricing_changes',
    actionTitle: 'Base Tariff & Per-Km Pricing Changes',
    category: 'pricing',
    approvalType: 'super_admin_only',
    enabled: true,
    description: 'Strict Super Admin authority. Any price change triggers platform-wide notification.',
    lastUpdated: '2026-09-08 09:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-commission-change',
    actionCode: 'commission_changes',
    actionTitle: 'Platform Commission & Fee Adjustments',
    category: 'pricing',
    approvalType: 'super_admin_only',
    enabled: true,
    description: 'Strict Super Admin authority for adjusting platform revenue percentage.',
    lastUpdated: '2026-09-08 09:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-tax-change',
    actionCode: 'tax_changes',
    actionTitle: 'Provincial Sales Tax & FBR WHT Changes',
    category: 'pricing',
    approvalType: 'super_admin_only',
    enabled: true,
    description: 'Strict Super Admin authorization aligned with PRA, SRB, KPRA, and BRA notifications.',
    lastUpdated: '2026-09-08 09:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-feature-toggle',
    actionCode: 'feature_activation',
    actionTitle: 'Core Feature Enable/Disable',
    category: 'system',
    approvalType: 'super_admin_only',
    enabled: true,
    description: 'Enabling or disabling platform modules requires Super Admin authorization.',
    lastUpdated: '2026-09-08 09:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-maintenance-mode',
    actionCode: 'maintenance_mode_toggle',
    actionTitle: 'Platform Maintenance Mode Activation',
    category: 'system',
    approvalType: 'super_admin_only',
    enabled: true,
    description: 'Taking passenger or driver services offline requires Super Admin confirmation.',
    lastUpdated: '2026-09-08 09:00 PKT',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'appr-safety-escalation',
    actionCode: 'critical_safety_escalation',
    actionTitle: 'Police 15 Emergency Telematics Dispatch',
    category: 'safety',
    approvalType: 'role_based',
    requiredRole: 'safety_admin',
    enabled: true,
    description: 'Authorizes urgent transmission of passenger and vehicle coordinates to Punjab Safe Cities or 15 desk.',
    lastUpdated: '2026-09-12 18:00 PKT',
    updatedBy: 'safety_admin@golife.pk'
  }
];

// ============================================================================
// 5. CONFIGURATION OVERRIDES (CITY & CATEGORY INHERITANCE LOGIC)
// ============================================================================

export const INITIAL_CONFIGURATION_OVERRIDES: ConfigurationOverride[] = [
  {
    id: 'ovr-lhe-radius',
    targetScope: 'city',
    cityName: 'Lahore',
    ruleGroup: 'rides',
    ruleKey: 'maxDriverSearchRadiusKm',
    ruleLabel: 'Max Driver Search Radius',
    inheritedValue: 5.0,
    overrideValue: 6.5,
    unit: 'km',
    status: 'active',
    reason: 'Lahore ring road and sprawling DHA Phase 6-8 suburbs require broader driver search perimeter.',
    effectiveDate: '2026-08-01',
    updatedBy: 'ops_director@golife.pk'
  },
  {
    id: 'ovr-khi-wait',
    targetScope: 'city',
    cityName: 'Karachi',
    ruleGroup: 'rides',
    ruleKey: 'driverArrivalFreeWaitMins',
    ruleLabel: 'Driver Free Waiting Time',
    inheritedValue: 5,
    overrideValue: 7,
    unit: 'minutes',
    status: 'active',
    reason: 'Heavy congestion along Shahrah-e-Faisal and University Road leads to extended passenger boarding delays.',
    effectiveDate: '2026-08-15',
    updatedBy: 'city_manager_khi@golife.pk'
  },
  {
    id: 'ovr-isb-rating',
    targetScope: 'city',
    cityName: 'Islamabad',
    ruleGroup: 'driver',
    ruleKey: 'minDriverRatingThreshold',
    ruleLabel: 'Minimum Driver Rating Threshold',
    inheritedValue: 4.2,
    overrideValue: 4.35,
    unit: 'stars',
    status: 'active',
    reason: 'Diplomatic Enclave and capital compliance standards necessitate higher service quality floor.',
    effectiveDate: '2026-07-20',
    updatedBy: 'superadmin@golife.pk'
  },
  {
    id: 'ovr-lhe-moto-fee',
    targetScope: 'city_category',
    cityName: 'Lahore',
    categoryName: 'GoMoto',
    ruleGroup: 'rides',
    ruleKey: 'passengerCancellationFeePkr',
    ruleLabel: 'Passenger Cancellation Fee',
    inheritedValue: 100,
    overrideValue: 40,
    unit: 'PKR',
    status: 'active',
    reason: 'GoMoto economy segment is highly price-sensitive; lower cancellation charge improves rider retention.',
    effectiveDate: '2026-08-10',
    updatedBy: 'marketing_head@golife.pk'
  },
  {
    id: 'ovr-rwp-wait',
    targetScope: 'city',
    cityName: 'Rawalpindi',
    ruleGroup: 'rides',
    ruleKey: 'cancellationWindowFreeMins',
    ruleLabel: 'Free Cancellation Window',
    inheritedValue: 2,
    overrideValue: 3,
    unit: 'minutes',
    status: 'active',
    reason: 'Twin-cities traffic bottlenecks allow passengers an extra minute of grace period.',
    effectiveDate: '2026-09-01',
    updatedBy: 'ops_director@golife.pk'
  }
];

// ============================================================================
// 6. RULE VERSIONING (HISTORICAL AUDIT FOR FINANCIAL INTEGRITY)
// ============================================================================

export const INITIAL_RULE_VERSIONS: RuleVersionRecord[] = [
  {
    id: 'ver-001',
    ruleId: 'rides.maxDriverSearchRadiusKm',
    ruleTitle: 'Max Driver Search Radius (Lahore)',
    ruleCategory: 'override',
    version: 'v1.1',
    previousValue: 5.0,
    newValue: 6.5,
    effectiveDate: '2026-08-01',
    changedBy: 'Kashif Mehmood (Ops Director)',
    changedByRole: 'operations_admin',
    reason: 'Expanded DHA Phases 6-8 radius.',
    adminNote: 'Verified driver density matches expanded perimeter.',
    approvalInfo: {
      approvedBy: 'superadmin@golife.pk',
      approvalType: 'super_admin_only',
      approvedAt: '2026-07-31 18:00 PKT'
    },
    timestamp: '2026-07-31 18:05 PKT'
  },
  {
    id: 'ver-002',
    ruleId: 'payments.minDriverWithdrawalPkr',
    ruleTitle: 'Minimum Driver Withdrawal Limit',
    ruleCategory: 'business_rule',
    version: 'v2.0',
    previousValue: 1000,
    newValue: 500,
    effectiveDate: '2026-08-10',
    changedBy: 'Farhan Zaidi (Finance Head)',
    changedByRole: 'finance_admin',
    reason: 'Lowered barrier to support daily driver cash flow on JazzCash / Easypaisa.',
    adminNote: 'Approved under Driver Welfare Initiative.',
    approvalInfo: {
      approvedBy: 'superadmin@golife.pk',
      approvalType: 'super_admin_only',
      approvedAt: '2026-08-09 16:30 PKT'
    },
    timestamp: '2026-08-09 16:35 PKT'
  },
  {
    id: 'ver-003',
    ruleId: 'feat-driver-loans',
    ruleTitle: 'Driver Micro-Loans & Advances',
    ruleCategory: 'feature_control',
    version: 'v1.0',
    previousValue: 'inactive',
    newValue: 'active',
    effectiveDate: '2026-03-01',
    changedBy: 'superadmin@golife.pk',
    changedByRole: 'super_admin',
    reason: 'Launched Finja & Mobilink pilot for tyre replacement and fuel advances in Lahore.',
    adminNote: 'Pilot restricted to captains with rating > 4.75.',
    approvalInfo: {
      approvedBy: 'superadmin@golife.pk',
      approvalType: 'super_admin_only',
      approvedAt: '2026-02-28 12:00 PKT'
    },
    timestamp: '2026-02-28 12:15 PKT'
  }
];

export function recordRuleVersion(
  ruleTitle: string,
  ruleCategory: RuleVersionRecord['ruleCategory'],
  previousValue: any,
  newValue: any,
  changedBy: string,
  changedByRole: string,
  reason: string,
  approvedBy?: string,
  isRollback?: boolean
): RuleVersionRecord {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} PKT`;

  return {
    id: `ver-${Date.now()}`,
    ruleId: `rule-${Date.now()}`,
    ruleTitle,
    ruleCategory,
    version: `v${Date.now().toString().slice(-3)}`,
    previousValue,
    newValue,
    effectiveDate: dateStr,
    changedBy,
    changedByRole,
    reason,
    adminNote: isRollback ? 'Rollback execution to previous stable state.' : 'Standard operational policy modification.',
    approvalInfo: approvedBy
      ? {
          approvedBy,
          approvalType: 'super_admin_only',
          approvedAt: timeStr
        }
      : undefined,
    timestamp: timeStr
  };
}

// ============================================================================
// 7. CONFIGURATION CONFLICT DETECTION ENGINE
// ============================================================================

export function detectConfigurationConflicts(
  settings: SystemControlSettings,
  features: FeatureControl[],
  rules: BusinessRulesConfig,
  overrides: ConfigurationOverride[]
): ConfigurationConflict[] {
  const conflicts: ConfigurationConflict[] = [];

  // 1. Dependency Check: Feature active but required dependencies inactive
  features.forEach((feat) => {
    if (feat.status === 'active' && feat.dependencies && feat.dependencies.length > 0) {
      feat.dependencies.forEach((depId) => {
        const depFeat = features.find((f) => f.id === depId);
        if (!depFeat || depFeat.status !== 'active') {
          conflicts.push({
            id: `conf-dep-${feat.id}-${depId}`,
            title: `Feature Dependency Conflict: ${feat.name}`,
            description: `${feat.name} is enabled, but its prerequisite "${depFeat?.name || depId}" is disabled.`,
            severity: 'critical',
            category: 'dependency',
            affectedEntities: [feat.name, depFeat?.name || depId],
            suggestedFix: `Enable ${depFeat?.name || depId} or disable ${feat.name}.`,
            autoFixActionKey: `enable_dep_${depId}`,
            detectedAt: 'Just now'
          });
        }
      });
    }
  });

  // 2. Driver Verification disabled while verification is strictly required in rules
  const verificationFeat = features.find((f) => f.id === 'feat-driver-verification');
  if (verificationFeat && verificationFeat.status === 'inactive' && rules.driver.requireApprovedCnic) {
    conflicts.push({
      id: 'conf-verification-contradiction',
      title: 'Regulatory Conflict: Driver Verification Offline',
      description: 'Driver Verification feature is disabled, but Business Rules require approved CNIC for online dispatch.',
      severity: 'critical',
      category: 'contradiction',
      affectedEntities: ['Driver Verification', 'Driver Business Rules'],
      suggestedFix: 'Re-enable Driver Verification module to prevent unverified drivers from bypassing NADRA checks.',
      autoFixActionKey: 'enable_driver_verification',
      detectedAt: 'Just now'
    });
  }

  // 3. Payouts enabled without any payout payment method active
  const payoutsFeat = features.find((f) => f.id === 'feat-driver-payouts');
  const jazzcashFeat = features.find((f) => f.id === 'feat-pay-jazzcash');
  const easypaisaFeat = features.find((f) => f.id === 'feat-pay-easypaisa');
  const bankFeat = features.find((f) => f.id === 'feat-pay-bank');

  if (
    payoutsFeat &&
    payoutsFeat.status === 'active' &&
    jazzcashFeat?.status !== 'active' &&
    easypaisaFeat?.status !== 'active' &&
    bankFeat?.status !== 'active'
  ) {
    conflicts.push({
      id: 'conf-payout-no-gateway',
      title: 'Financial Conflict: Payouts Enabled without Active Disbursement Gateway',
      description: 'Driver Payouts module is active, but JazzCash, Easypaisa, and 1Link Bank gateways are all inactive.',
      severity: 'high',
      category: 'missing_config',
      affectedEntities: ['Driver Payouts', 'JazzCash', 'Easypaisa', 'Bank Transfer'],
      suggestedFix: 'Activate at least one mobile wallet or 1Link Raast payment gateway for driver disbursements.',
      autoFixActionKey: 'enable_payout_gateways',
      detectedAt: 'Just now'
    });
  }

  // 4. Overrides contradict sensible boundaries
  overrides.forEach((ovr) => {
    if (ovr.status === 'active') {
      if (ovr.ruleKey === 'maxDriverSearchRadiusKm' && Number(ovr.overrideValue) > 15) {
        conflicts.push({
          id: `conf-ovr-radius-${ovr.id}`,
          title: `Excessive Search Radius in ${ovr.cityName || 'City'}`,
          description: `Search radius is set to ${ovr.overrideValue}km, which exceeds typical city boundary and increases dispatch delay.`,
          severity: 'warning',
          category: 'contradiction',
          affectedEntities: [ovr.cityName || 'City', ovr.ruleLabel],
          suggestedFix: 'Reduce search radius to 8km or below to maintain quick ETA.',
          autoFixActionKey: `fix_radius_${ovr.id}`,
          detectedAt: 'Just now'
        });
      }
      if (ovr.ruleKey === 'driverArrivalFreeWaitMins' && Number(ovr.overrideValue) > 12) {
        conflicts.push({
          id: `conf-ovr-wait-${ovr.id}`,
          title: `Protracted Free Waiting Time in ${ovr.cityName || 'City'}`,
          description: `Free waiting time of ${ovr.overrideValue} minutes causes high driver dissatisfaction and trip cancellations.`,
          severity: 'warning',
          category: 'contradiction',
          affectedEntities: [ovr.cityName || 'City', ovr.ruleLabel],
          suggestedFix: 'Set free waiting time between 4 and 6 minutes.',
          autoFixActionKey: `fix_wait_${ovr.id}`,
          detectedAt: 'Just now'
        });
      }
    }
  });

  // 5. Maintenance Mode enabled without Admin Bypass
  if (settings.maintenance.enabled && !settings.maintenance.adminBypassAllowed) {
    conflicts.push({
      id: 'conf-maintenance-lockout',
      title: 'Dangerous Configuration: Maintenance Active without Admin Bypass',
      description: 'Platform Maintenance is turned on with Admin Bypass disabled. Admins may be locked out of operational dashboards.',
      severity: 'high',
      category: 'availability',
      affectedEntities: ['Platform Maintenance Mode', 'Admin Control Panel'],
      suggestedFix: 'Enable Admin Bypass Permission so authorized staff can monitor and resolve maintenance tasks.',
      autoFixActionKey: 'enable_admin_bypass',
      detectedAt: 'Just now'
    });
  }

  return conflicts;
}

// ============================================================================
// 8. AI CONFIGURATION RECOMMENDATIONS (ASSISTANCE ONLY — REQUIRES HUMAN APPROVAL)
// ============================================================================

export const INITIAL_SETTINGS_AI_RECOMMENDATIONS: SettingsAiRecommendation[] = [
  {
    id: 'ai-rec-01',
    title: 'Karachi Peak-Hours Waiting Grace Period',
    summary: 'Shahrah-e-Faisal and Clifton evening bottlenecks cause high passenger cancellation disputes.',
    impact: 'Estimated 14% reduction in rider dispute tickets and improved driver arrival completion.',
    riskLevel: 'low',
    category: 'City Rules',
    proposedChange: {
      targetType: 'city_override',
      targetId: 'ovr-khi-wait',
      currentValue: 7,
      recommendedValue: 6,
      rationale: 'Telemetry data shows average rider boarding occurs at 5.2 minutes in Karachi. 6 minutes balances driver satisfaction while giving riders adequate time.'
    },
    confidenceScore: 92,
    status: 'pending'
  },
  {
    id: 'ai-rec-02',
    title: 'JazzCash USSD Timeout Optimization',
    summary: 'Telecom USSD flash notifications on Jazz network expire at 120s during high traffic.',
    impact: 'Reduces failed checkout transactions by ~8.5% across Punjab and Sindh.',
    riskLevel: 'low',
    category: 'Payment Rules',
    proposedChange: {
      targetType: 'payment_rule',
      targetId: 'payments.gatewayTimeoutSeconds',
      currentValue: 180,
      recommendedValue: 120,
      rationale: 'Aligning timeout with Jazz gateway threshold prevents lingering pending states on rider wallets.'
    },
    confidenceScore: 95,
    status: 'pending'
  },
  {
    id: 'ai-rec-03',
    title: 'Rawalpindi & Islamabad Twin-Cities Cancellation Fee Harmonization',
    summary: 'Passengers booking across I-8 / Rawalpindi border experience mismatched cancellation penalties.',
    impact: 'Consistent user experience across twin cities border crossings.',
    riskLevel: 'medium',
    category: 'Pricing & Rules',
    proposedChange: {
      targetType: 'city_override',
      targetId: 'ovr-rwp-wait',
      currentValue: 3,
      recommendedValue: 2,
      rationale: 'Unifying free cancellation window at 2 minutes prevents fare gaming across the twin cities divide.'
    },
    confidenceScore: 88,
    status: 'pending'
  }
];

// ============================================================================
// 9. INHERITANCE RESOLVER: Global Default -> City Override -> Category Override
// ============================================================================

export interface ResolvedRuleResult {
  effectiveValue: any;
  source: 'category_override' | 'city_override' | 'global_default';
  sourceLabel: string;
  inheritedValue: any;
  isOverridden: boolean;
  overrideRecord?: ConfigurationOverride;
}

export function resolveEffectiveRule(
  rules: BusinessRulesConfig,
  overrides: ConfigurationOverride[],
  ruleGroup: keyof BusinessRulesConfig,
  ruleKey: string,
  cityName?: string,
  categoryName?: string
): ResolvedRuleResult {
  const globalGroup = rules[ruleGroup] as any;
  const globalDefault = globalGroup ? globalGroup[ruleKey] : undefined;

  // 1. Check City + Category Override
  if (cityName && categoryName) {
    const catOvr = overrides.find(
      (o) =>
        o.status === 'active' &&
        o.targetScope === 'city_category' &&
        o.cityName?.toLowerCase() === cityName.toLowerCase() &&
        o.categoryName?.toLowerCase() === categoryName.toLowerCase() &&
        o.ruleKey === ruleKey
    );
    if (catOvr) {
      return {
        effectiveValue: catOvr.overrideValue,
        source: 'category_override',
        sourceLabel: `${cityName} • ${categoryName} Override`,
        inheritedValue: globalDefault,
        isOverridden: true,
        overrideRecord: catOvr
      };
    }
  }

  // 2. Check City Override
  if (cityName) {
    const cityOvr = overrides.find(
      (o) =>
        o.status === 'active' &&
        o.targetScope === 'city' &&
        o.cityName?.toLowerCase() === cityName.toLowerCase() &&
        o.ruleKey === ruleKey
    );
    if (cityOvr) {
      return {
        effectiveValue: cityOvr.overrideValue,
        source: 'city_override',
        sourceLabel: `${cityName} City Override`,
        inheritedValue: globalDefault,
        isOverridden: true,
        overrideRecord: cityOvr
      };
    }
  }

  // 3. Fallback to Global Default
  return {
    effectiveValue: globalDefault,
    source: 'global_default',
    sourceLabel: 'Global Platform Default',
    inheritedValue: globalDefault,
    isOverridden: false
  };
}
