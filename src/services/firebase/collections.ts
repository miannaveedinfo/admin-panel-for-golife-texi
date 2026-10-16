/**
 * GoLife Taxi Pakistan - Unified Firestore Collection Architecture
 * Shared data schema connecting the GoLife Passenger Mobile App, Driver Mobile App, and Admin Panel.
 *
 * Core Principle: The Admin Panel, Passenger App, and Driver App connect to the SAME Firebase project
 * and utilize the exact SAME collections and document schemas.
 */

export const FIRESTORE_COLLECTIONS = {
  // 1. Identity & RBAC Collections
  users: 'users',
  adminUsers: 'adminUsers',
  adminRoles: 'adminRoles',
  adminPermissions: 'adminPermissions',
  adminRoleAssignments: 'adminRoleAssignments',
  adminSessions: 'adminSessions',
  adminInvitations: 'adminInvitations',

  // 2. Users & Fleet Ecosystem (Mobile Apps Shared)
  passengers: 'passengers',
  drivers: 'drivers',
  driverDocuments: 'driverDocuments',
  driverVerifications: 'driverVerifications',
  vehicles: 'vehicles',
  driverStatuses: 'driverStatuses',
  passengerStatuses: 'passengerStatuses',
  driverPerformance: 'driverPerformance',
  driverWarnings: 'driverWarnings',
  driverSuspensions: 'driverSuspensions',

  // 3. Rides & Real-Time Operations
  rides: 'rides',
  rideLocations: 'rideLocations',
  driverLocations: 'driverLocations',
  locationEvents: 'locationEvents',
  locationHistory: 'locationHistory',
  routeSnapshots: 'routeSnapshots',
  etaUpdates: 'etaUpdates',
  geofenceEvents: 'geofenceEvents',
  rideOffers: 'rideOffers',
  rideEvents: 'rideEvents',
  latePickupIncidents: 'latePickupIncidents',

  // 4. Financial & Settlement Ledger (Immutable Records)
  payments: 'payments',
  transactions: 'transactions',
  driverBalances: 'driverBalances',
  driverEarnings: 'driverEarnings',
  driverDailySummaries: 'driverDailySummaries',
  payouts: 'payouts',
  withdrawalRequests: 'withdrawalRequests',
  settlements: 'settlements',
  refunds: 'refunds',
  reimbursements: 'reimbursements',
  financialAdjustments: 'financialAdjustments',
  driverFines: 'driverFines',
  fineTransactions: 'fineTransactions',
  fineRules: 'fineRules',
  wallets: 'wallets',
  walletTransactions: 'walletTransactions',
  platformRevenue: 'platformRevenue',
  driverWallets: 'driverWallets',
  topUpRequests: 'topUpRequests',
  walletLedger: 'walletLedger',
  paymentAttempts: 'paymentAttempts',
  paymentTransactions: 'paymentTransactions',
  paymentMethods: 'paymentMethods',
  companyPaymentAccounts: 'companyPaymentAccounts',
  paymentProviderConfigs: 'paymentProviderConfigs',
  paymentWebhooks: 'paymentWebhooks',
  paymentReconciliation: 'paymentReconciliation',
  commissionRules: 'commissionRules',
  commissionRuleVersions: 'commissionRuleVersions',
  commissionCalculations: 'commissionCalculations',
  driverCommissions: 'driverCommissions',
  cashRideReconciliation: 'cashRideReconciliation',
  advancePaymentReconciliation: 'advancePaymentReconciliation',
  dailySettlements: 'dailySettlements',

  // 5. Central Pricing & Regional Tariffs
  pricingRules: 'pricingRules',
  pricingRuleVersions: 'pricingRuleVersions',
  cityPricing: 'cityPricing',
  categoryPricing: 'categoryPricing',
  driverPricingOverrides: 'driverPricingOverrides',

  // 6. Cities, Routes & Service Categories (Operational Matrix)
  cities: 'cities',
  serviceCategories: 'serviceCategories',
  cityServices: 'cityServices',
  cityCategoryConfigurations: 'cityCategoryConfigurations',
  intercityRoutes: 'intercityRoutes',
  freightConfigurations: 'freightConfigurations',
  freight: 'freight',

  // 7. Promotions, Referrals & Loyalty Rewards
  promoCodes: 'promoCodes',
  promoUsage: 'promoUsage',
  promotionCampaigns: 'promotionCampaigns',
  referrals: 'referrals',
  rewardRules: 'rewardRules',
  rewards: 'rewards',
  rewardTransactions: 'rewardTransactions',

  // 8. Complaints, Support & Disputes
  complaints: 'complaints',
  disputes: 'disputes',
  supportCases: 'supportCases',
  caseMessages: 'caseMessages',
  caseNotes: 'caseNotes',
  caseEvidence: 'caseEvidence',
  caseAssignments: 'caseAssignments',
  caseEvents: 'caseEvents',
  feedbacks: 'feedbacks',

  // 9. Safety, SOS Emergency & Incident Control
  safetyEvents: 'safetyEvents',
  emergencyEvents: 'emergencyEvents',
  safetyIncidents: 'safetyIncidents',
  safetyEventTimeline: 'safetyEventTimeline',
  safetyAssignments: 'safetyAssignments',
  safetyEvidence: 'safetyEvidence',

  // 10. Fraud Detection & Anti-Abuse Risk
  fraudRiskAlerts: 'fraudRiskAlerts',
  riskAlerts: 'riskAlerts',
  riskRules: 'riskRules',
  riskRuleVersions: 'riskRuleVersions',
  riskEvents: 'riskEvents',
  riskInvestigations: 'riskInvestigations',
  riskWatchlist: 'riskWatchlist',
  riskEvidence: 'riskEvidence',

  // 11. Notifications, Communications & System Audit
  notifications: 'notifications',
  auditLogs: 'auditLogs',
  reports: 'reports',
  reportSnapshots: 'reportSnapshots',

  // 12. System Settings, Business Rules & Feature Controls (Phase 54)
  systemSettings: 'systemSettings',
  featureControls: 'featureControls',
  businessRules: 'businessRules',
  businessRuleVersions: 'businessRuleVersions',
  approvalRules: 'approvalRules',
  configurationOverrides: 'configurationOverrides',
  maintenanceSchedules: 'maintenanceSchedules'
} as const;

export type FirestoreCollectionKey = keyof typeof FIRESTORE_COLLECTIONS;
export type FirestoreCollectionName = (typeof FIRESTORE_COLLECTIONS)[FirestoreCollectionKey];

export const ALL_COLLECTIONS_LIST: string[] = Object.values(FIRESTORE_COLLECTIONS);

export interface CollectionMetadata {
  key: FirestoreCollectionKey;
  name: string;
  category: 'auth' | 'fleet' | 'rides' | 'finance' | 'pricing' | 'geo' | 'promo' | 'support' | 'safety' | 'risk' | 'system';
  description: string;
  sharedWithMobile: boolean;
  isImmutable?: boolean;
}

export const COLLECTIONS_METADATA: Record<FirestoreCollectionKey, CollectionMetadata> = {
  users: { key: 'users', name: 'Users', category: 'auth', description: 'Unified user identity records across Passenger, Driver, and Admin apps', sharedWithMobile: true },
  adminUsers: { key: 'adminUsers', name: 'Admin Users', category: 'auth', description: 'Admin accounts with role assignments', sharedWithMobile: false },
  adminRoles: { key: 'adminRoles', name: 'Admin Roles', category: 'auth', description: 'RBAC role definitions and privileges', sharedWithMobile: false },
  adminPermissions: { key: 'adminPermissions', name: 'Admin Permissions', category: 'auth', description: 'Granular permission keys', sharedWithMobile: false },
  adminRoleAssignments: { key: 'adminRoleAssignments', name: 'Role Assignments', category: 'auth', description: 'Mapping of admins to role IDs', sharedWithMobile: false },
  adminSessions: { key: 'adminSessions', name: 'Admin Sessions', category: 'auth', description: 'Active token sessions with device tracking', sharedWithMobile: false },
  adminInvitations: { key: 'adminInvitations', name: 'Admin Invitations', category: 'auth', description: 'Pending onboarding invites', sharedWithMobile: false },

  passengers: { key: 'passengers', name: 'Passengers', category: 'fleet', description: 'Passenger profiles, ratings, wallet and ride counts', sharedWithMobile: true },
  drivers: { key: 'drivers', name: 'Drivers', category: 'fleet', description: 'Driver profiles, ratings, status, KYC and city assignments', sharedWithMobile: true },
  driverStatuses: { key: 'driverStatuses', name: 'Driver Statuses', category: 'fleet', description: 'Real-time driver availability, shift, and heartbeat presence', sharedWithMobile: true },
  passengerStatuses: { key: 'passengerStatuses', name: 'Passenger Statuses', category: 'fleet', description: 'Real-time passenger ride request, wait-state, and active journey presence', sharedWithMobile: true },
  driverDocuments: { key: 'driverDocuments', name: 'Driver Documents', category: 'fleet', description: 'CNIC, driving license, police cert metadata', sharedWithMobile: true },
  driverVerifications: { key: 'driverVerifications', name: 'Driver Verifications', category: 'fleet', description: 'Driver verification applications and KYC review audit queue', sharedWithMobile: true },
  vehicles: { key: 'vehicles', name: 'Vehicles', category: 'fleet', description: 'Car/bike/rickshaw details, registration, inspection', sharedWithMobile: true },
  driverPerformance: { key: 'driverPerformance', name: 'Driver Performance', category: 'fleet', description: 'Acceptance, cancellation rates and hours', sharedWithMobile: true },
  driverWarnings: { key: 'driverWarnings', name: 'Driver Warnings', category: 'fleet', description: 'Policy warning notices issued', sharedWithMobile: true },
  driverSuspensions: { key: 'driverSuspensions', name: 'Driver Suspensions', category: 'fleet', description: 'Suspension history with appeal audit', sharedWithMobile: true },

  rides: { key: 'rides', name: 'Rides', category: 'rides', description: 'Master ride records, fares, pickup, dropoff and status', sharedWithMobile: true },
  rideLocations: { key: 'rideLocations', name: 'Ride Locations', category: 'rides', description: 'Real-time GPS coordinates and breadcrumbs', sharedWithMobile: true },
  driverLocations: { key: 'driverLocations', name: 'Driver Locations', category: 'fleet', description: 'Real-time live driver GPS telemetry and freshness', sharedWithMobile: true },
  locationEvents: { key: 'locationEvents', name: 'Location Events', category: 'rides', description: 'Auditable GPS and trip lifecycle telemetry events', sharedWithMobile: true, isImmutable: true },
  locationHistory: { key: 'locationHistory', name: 'Location History', category: 'rides', description: 'Retained coordinate breadcrumbs for rides and drivers', sharedWithMobile: false, isImmutable: true },
  routeSnapshots: { key: 'routeSnapshots', name: 'Route Snapshots', category: 'rides', description: 'Calculated route waypoints, geometry and deviations', sharedWithMobile: true },
  etaUpdates: { key: 'etaUpdates', name: 'ETA Updates', category: 'rides', description: 'Chronological ETA progression and arrival detection logs', sharedWithMobile: true },
  geofenceEvents: { key: 'geofenceEvents', name: 'Geofence Events', category: 'geo', description: 'City boundary and operational zone entry/exit events', sharedWithMobile: false, isImmutable: true },
  rideOffers: { key: 'rideOffers', name: 'Ride Offers', category: 'rides', description: 'Bidding / dispatch broadcast offers to drivers', sharedWithMobile: true },
  rideEvents: { key: 'rideEvents', name: 'Ride Events', category: 'rides', description: 'Immutable chronological status transitions', sharedWithMobile: true, isImmutable: true },
  latePickupIncidents: { key: 'latePickupIncidents', name: 'Late Pickup Incidents', category: 'rides', description: 'Driver arrival delay incidents', sharedWithMobile: true },

  payments: { key: 'payments', name: 'Payments', category: 'finance', description: 'Payment transactions (JazzCash, Easypaisa, Raast, Cash)', sharedWithMobile: true, isImmutable: true },
  transactions: { key: 'transactions', name: 'Transactions', category: 'finance', description: 'Comprehensive financial double-entry ledger', sharedWithMobile: true, isImmutable: true },
  driverBalances: { key: 'driverBalances', name: 'Driver Balances', category: 'finance', description: 'Real-time payable balance, reserve and collateral', sharedWithMobile: true },
  driverEarnings: { key: 'driverEarnings', name: 'Driver Earnings', category: 'finance', description: 'Gross fares, commissions, bonuses and tax deductions', sharedWithMobile: true },
  driverDailySummaries: { key: 'driverDailySummaries', name: 'Driver Daily Summaries', category: 'finance', description: 'Daily aggregated performance and earnings', sharedWithMobile: true },
  payouts: { key: 'payouts', name: 'Payouts', category: 'finance', description: 'Processed and pending driver disbursements', sharedWithMobile: true, isImmutable: true },
  withdrawalRequests: { key: 'withdrawalRequests', name: 'Withdrawal Requests', category: 'finance', description: 'Driver requested bank/wallet withdrawals', sharedWithMobile: true },
  settlements: { key: 'settlements', name: 'Settlements', category: 'finance', description: 'Platform bank reconciliations and settlement batches', sharedWithMobile: false, isImmutable: true },
  refunds: { key: 'refunds', name: 'Refunds', category: 'finance', description: 'Passenger fare refunds with ledger audit', sharedWithMobile: true, isImmutable: true },
  reimbursements: { key: 'reimbursements', name: 'Reimbursements', category: 'finance', description: 'Driver compensations for tolls, cleaning, cancellation', sharedWithMobile: true, isImmutable: true },
  financialAdjustments: { key: 'financialAdjustments', name: 'Financial Adjustments', category: 'finance', description: 'Audit corrections with reversal logic', sharedWithMobile: false, isImmutable: true },
  driverFines: { key: 'driverFines', name: 'Driver Fines', category: 'finance', description: 'Penalty charges for violations with dispute tracking', sharedWithMobile: true },
  fineTransactions: { key: 'fineTransactions', name: 'Fine Transactions', category: 'finance', description: 'Deductions from driver balances for fines', sharedWithMobile: true, isImmutable: true },
  fineRules: { key: 'fineRules', name: 'Fine Rules', category: 'finance', description: 'Configured automated penalty policies', sharedWithMobile: false },
  wallets: { key: 'wallets', name: 'Wallets', category: 'finance', description: 'In-app balances for passengers and drivers', sharedWithMobile: true },
  walletTransactions: { key: 'walletTransactions', name: 'Wallet Transactions', category: 'finance', description: 'Top-ups, fare debits and credit disbursements', sharedWithMobile: true, isImmutable: true },
  platformRevenue: { key: 'platformRevenue', name: 'Platform Revenue', category: 'finance', description: 'Net commission, platform fees and tax withholding', sharedWithMobile: false },
  driverWallets: { key: 'driverWallets', name: 'Driver Wallets', category: 'finance', description: 'Central Driver Wallet ledger balances, holds and deductions', sharedWithMobile: true },
  topUpRequests: { key: 'topUpRequests', name: 'Top-Up Requests', category: 'finance', description: 'Easypaisa & JazzCash driver top-up verification requests', sharedWithMobile: true },
  walletLedger: { key: 'walletLedger', name: 'Wallet Ledger', category: 'finance', description: 'Immutable double-entry balance progression and transaction log', sharedWithMobile: true, isImmutable: true },
  paymentAttempts: { key: 'paymentAttempts', name: 'Payment Attempts', category: 'finance', description: 'Idempotency and anti-double-credit payment verification attempts', sharedWithMobile: false, isImmutable: true },
  paymentTransactions: { key: 'paymentTransactions', name: 'Payment Transactions', category: 'finance', description: 'Central payment transaction ledger with ride and audit links', sharedWithMobile: true, isImmutable: true },
  paymentMethods: { key: 'paymentMethods', name: 'Payment Methods', category: 'finance', description: 'Supported system payment methods (Cash, Easypaisa, JazzCash)', sharedWithMobile: true },
  companyPaymentAccounts: { key: 'companyPaymentAccounts', name: 'Company Payment Accounts', category: 'finance', description: 'GoLife Taxi corporate receiving accounts (Easypaisa/JazzCash)', sharedWithMobile: false },
  paymentProviderConfigs: { key: 'paymentProviderConfigs', name: 'Payment Provider Configs', category: 'finance', description: 'Provider gateway settings, endpoints and webhook rules', sharedWithMobile: false },
  paymentWebhooks: { key: 'paymentWebhooks', name: 'Payment Webhooks', category: 'finance', description: 'Inbound provider webhook logs for automated reconciliation', sharedWithMobile: false, isImmutable: true },
  paymentReconciliation: { key: 'paymentReconciliation', name: 'Payment Reconciliation', category: 'finance', description: 'Periodic banking reconciliation summaries and discrepancy alerts', sharedWithMobile: false },
  commissionRules: { key: 'commissionRules', name: 'Commission Rules', category: 'finance', description: 'Central GoLife Taxi commission rates (per KM, percentage, fixed, city, category)', sharedWithMobile: true },
  commissionRuleVersions: { key: 'commissionRuleVersions', name: 'Commission Rule Versions', category: 'finance', description: 'Audit history of commission tariff changes', sharedWithMobile: false, isImmutable: true },
  commissionCalculations: { key: 'commissionCalculations', name: 'Commission Calculations', category: 'finance', description: 'Per-ride breakdown of platform fees and driver net earnings', sharedWithMobile: true, isImmutable: true },
  driverCommissions: { key: 'driverCommissions', name: 'Driver Commission Overrides', category: 'finance', description: 'Special authorized driver-level commission overrides', sharedWithMobile: true },
  cashRideReconciliation: { key: 'cashRideReconciliation', name: 'Cash Ride Reconciliation', category: 'finance', description: 'Audit matching for normal cash rides vs wallet deductions', sharedWithMobile: false, isImmutable: true },
  advancePaymentReconciliation: { key: 'advancePaymentReconciliation', name: 'Advance Payment Reconciliation', category: 'finance', description: 'Easypaisa & JazzCash advance escrow settlements', sharedWithMobile: false, isImmutable: true },
  dailySettlements: { key: 'dailySettlements', name: 'Daily Settlements', category: 'finance', description: 'Daily, weekly, monthly platform financial close summaries', sharedWithMobile: false, isImmutable: true },

  pricingRules: { key: 'pricingRules', name: 'Pricing Rules', category: 'pricing', description: 'Base fares, per-km, per-minute, surge multipliers', sharedWithMobile: true },
  pricingRuleVersions: { key: 'pricingRuleVersions', name: 'Pricing Rule Versions', category: 'pricing', description: 'Immutable tariff versions for historical ride audit', sharedWithMobile: false, isImmutable: true },
  cityPricing: { key: 'cityPricing', name: 'City Pricing', category: 'pricing', description: 'City-specific tariff adjustments', sharedWithMobile: true },
  categoryPricing: { key: 'categoryPricing', name: 'Category Pricing', category: 'pricing', description: 'Vehicle tier pricing rules (Mini, Ride, Comfort, etc.)', sharedWithMobile: true },
  driverPricingOverrides: { key: 'driverPricingOverrides', name: 'Driver Pricing Overrides', category: 'pricing', description: 'Custom driver commission concessions or incentives', sharedWithMobile: false },

  cities: { key: 'cities', name: 'Cities', category: 'geo', description: 'Operating territories, boundary geofences, operating status', sharedWithMobile: true },
  serviceCategories: { key: 'serviceCategories', name: 'Service Categories', category: 'geo', description: 'Vehicle classes (Bike, Auto, Ride, Comfort, Cargo)', sharedWithMobile: true },
  cityServices: { key: 'cityServices', name: 'City Services', category: 'geo', description: 'Active services available in each city', sharedWithMobile: true },
  cityCategoryConfigurations: { key: 'cityCategoryConfigurations', name: 'City Category Configs', category: 'geo', description: 'Matrix overrides per city and service tier', sharedWithMobile: true },
  intercityRoutes: { key: 'intercityRoutes', name: 'Intercity Routes', category: 'geo', description: 'Fixed intercity corridors and toll matrices', sharedWithMobile: true },
  freightConfigurations: { key: 'freightConfigurations', name: 'Freight Configs', category: 'geo', description: 'Cargo capacity, dimension restrictions and base fees', sharedWithMobile: true },
  freight: { key: 'freight', name: 'Freight Orders', category: 'geo', description: 'Goods delivery orders, manifests and status', sharedWithMobile: true },

  promoCodes: { key: 'promoCodes', name: 'Promo Codes', category: 'promo', description: 'Discount vouchers, caps, expirations, city restrictions', sharedWithMobile: true },
  promoUsage: { key: 'promoUsage', name: 'Promo Usage', category: 'promo', description: 'Redemption logs linking passenger, ride and voucher', sharedWithMobile: true, isImmutable: true },
  promotionCampaigns: { key: 'promotionCampaigns', name: 'Promotion Campaigns', category: 'promo', description: 'Marketing growth initiatives and budget ceilings', sharedWithMobile: false },
  referrals: { key: 'referrals', name: 'Referrals', category: 'promo', description: 'Referral attribution between passengers and drivers', sharedWithMobile: true },
  rewardRules: { key: 'rewardRules', name: 'Reward Rules', category: 'promo', description: 'Streak, milestone and loyalty reward definitions', sharedWithMobile: true },
  rewards: { key: 'rewards', name: 'Rewards', category: 'promo', description: 'Granted rewards waiting for claim or disbursement', sharedWithMobile: true },
  rewardTransactions: { key: 'rewardTransactions', name: 'Reward Transactions', category: 'promo', description: 'Ledger records of reward disbursements', sharedWithMobile: true, isImmutable: true },

  complaints: { key: 'complaints', name: 'Complaints', category: 'support', description: 'Support tickets and dispute claims', sharedWithMobile: true },
  disputes: { key: 'disputes', name: 'Disputes', category: 'support', description: 'Formal fare or penalty dispute proceedings', sharedWithMobile: true },
  supportCases: { key: 'supportCases', name: 'Support Cases', category: 'support', description: 'Integrated omnichannel case files', sharedWithMobile: true },
  caseMessages: { key: 'caseMessages', name: 'Case Messages', category: 'support', description: 'Customer support messages and user replies', sharedWithMobile: true },
  caseNotes: { key: 'caseNotes', name: 'Case Notes', category: 'support', description: 'Internal admin notes and investigation remarks', sharedWithMobile: false },
  caseEvidence: { key: 'caseEvidence', name: 'Case Evidence', category: 'support', description: 'Uploaded screenshots, receipts and voice notes', sharedWithMobile: true },
  caseAssignments: { key: 'caseAssignments', name: 'Case Assignments', category: 'support', description: 'Case routing to specific admin agents and teams', sharedWithMobile: false },
  caseEvents: { key: 'caseEvents', name: 'Case Events', category: 'support', description: 'Chronological case status transition timeline', sharedWithMobile: false, isImmutable: true },
  feedbacks: { key: 'feedbacks', name: 'Feedbacks', category: 'support', description: 'Post-ride ratings, tags and passenger/driver feedback', sharedWithMobile: true },

  safetyEvents: { key: 'safetyEvents', name: 'Safety Events', category: 'safety', description: 'Telematics crash alerts, route deviations and SOS alerts', sharedWithMobile: true },
  emergencyEvents: { key: 'emergencyEvents', name: 'Emergency Events', category: 'safety', description: 'High-priority SOS trigger logs', sharedWithMobile: true },
  safetyIncidents: { key: 'safetyIncidents', name: 'Safety Incidents', category: 'safety', description: 'Active safety incident dossiers with SLA tracking', sharedWithMobile: true },
  safetyEventTimeline: { key: 'safetyEventTimeline', name: 'Safety Timeline', category: 'safety', description: 'Chronological actions taken by safety response team', sharedWithMobile: false, isImmutable: true },
  safetyAssignments: { key: 'safetyAssignments', name: 'Safety Assignments', category: 'safety', description: 'Assignments to on-duty safety response officers', sharedWithMobile: false },
  safetyEvidence: { key: 'safetyEvidence', name: 'Safety Evidence', category: 'safety', description: 'Audio recordings, police reports, dashcam evidence', sharedWithMobile: false },

  fraudRiskAlerts: { key: 'fraudRiskAlerts', name: 'Fraud Risk Alerts', category: 'risk', description: 'Algorithmic abuse flags (GPS spoof, fake rides)', sharedWithMobile: false },
  riskAlerts: { key: 'riskAlerts', name: 'Risk Alerts', category: 'risk', description: 'Triaged risk alert queue', sharedWithMobile: false },
  riskRules: { key: 'riskRules', name: 'Risk Rules', category: 'risk', description: 'Configured fraud detection thresholds', sharedWithMobile: false },
  riskRuleVersions: { key: 'riskRuleVersions', name: 'Risk Rule Versions', category: 'risk', description: 'Historical changes to risk detection algorithms', sharedWithMobile: false, isImmutable: true },
  riskEvents: { key: 'riskEvents', name: 'Risk Events', category: 'risk', description: 'Detected anomalies in real-time telemetry', sharedWithMobile: false, isImmutable: true },
  riskInvestigations: { key: 'riskInvestigations', name: 'Risk Investigations', category: 'risk', description: 'Formal investigations into syndicates and colluders', sharedWithMobile: false },
  riskWatchlist: { key: 'riskWatchlist', name: 'Risk Watchlist', category: 'risk', description: 'Monitored IMEI, phone numbers and bank accounts', sharedWithMobile: false },
  riskEvidence: { key: 'riskEvidence', name: 'Risk Evidence', category: 'risk', description: 'Cell-tower traces, mock location logs, device hashes', sharedWithMobile: false },

  notifications: { key: 'notifications', name: 'Notifications', category: 'system', description: 'Targeted in-app notifications and alerts', sharedWithMobile: true },
  auditLogs: { key: 'auditLogs', name: 'Audit Logs', category: 'system', description: 'Immutable administrative audit trail of all actions', sharedWithMobile: false, isImmutable: true },
  reports: { key: 'reports', name: 'Reports', category: 'system', description: 'Generated business intelligence reports', sharedWithMobile: false },
  reportSnapshots: { key: 'reportSnapshots', name: 'Report Snapshots', category: 'system', description: 'Scheduled weekly/monthly data exports', sharedWithMobile: false },

  systemSettings: { key: 'systemSettings', name: 'System Settings', category: 'system', description: 'Global platform settings, helplines, maintenance mode', sharedWithMobile: false },
  featureControls: { key: 'featureControls', name: 'Feature Controls', category: 'system', description: 'Granular feature toggles with city/category scoping', sharedWithMobile: true },
  businessRules: { key: 'businessRules', name: 'Business Rules', category: 'system', description: 'Global dispatch, safety and wait-time policies', sharedWithMobile: true },
  businessRuleVersions: { key: 'businessRuleVersions', name: 'Business Rule Versions', category: 'system', description: 'Versioned rule history for rollback capabilities', sharedWithMobile: false, isImmutable: true },
  approvalRules: { key: 'approvalRules', name: 'Approval Rules', category: 'system', description: 'Two-tier maker-checker authorization policies', sharedWithMobile: false },
  configurationOverrides: { key: 'configurationOverrides', name: 'Config Overrides', category: 'system', description: 'City and category localized policy overrides', sharedWithMobile: true },
  maintenanceSchedules: { key: 'maintenanceSchedules', name: 'Maintenance Schedules', category: 'system', description: 'Scheduled maintenance windows with bypass keys', sharedWithMobile: true }
};
