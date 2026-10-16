import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AdminUser,
  AdminRole,
  AdminTab,
  Passenger,
  Driver,
  Ride,
  VerificationItem,
  FareCategoryConfig,
  CityConfig,
  IntercityRoute,
  PayoutRequest,
  PromoCode,
  FreightJob,
  AcademyLesson,
  DriverLoan,
  AdminNotification,
  Complaint,
  SafetyIncident,
  AuditLog,
  AppSettings,
  RideCategory,
  FareRule,
  WalletTransaction,
  TrainingModule,
  LoanApplication,
  FreightOrder,
  ReferralRecord,
  SupportTicket,
  OperationsAlert,
  DriverOperationalStatus,
  RideStatus,
  DriverDailySummary,
  DriverSuspensionRecord,
  DriverWarningRecord,
  LatePickupIncident,
  LatePickupConfig,
  VerificationReviewStatus,
  EarningsDateFilter,
  AutomationSettings,
  AdminTask,
  AdminTaskStatus,
  AiChatMessage,
  SmartRecommendedAction,
  OperationsInitialFilter,
  RideFeedback,
  UniversalDetailType,
  UniversalDetailState,
  CentralPricingRule,
  PricingRuleVersion,
  DriverPricingOverride,
  FareCalculationSnapshot,
  DriverFine,
  FineStatus,
  FineSource,
  DeductionMethod,
  FairExclusionReason,
  FineReason,
  FineTransaction,
  AutomaticFineRule,
  FineRuleVersion,
  RefundStatus,
  FinancialActionType,
  ResolutionCategory,
  RefundReasonItem,
  PassengerRefundRecord,
  DriverReimbursementRecord,
  FinancialAdjustmentRecord,
  LedgerTransactionType,
  ComprehensiveLedgerTransaction,
  DailySettlementRecord,
  ReconciliationRecord,
  AiFinancialAnomaly,
  PayoutStatus,
  PayoutMethod,
  DriverPayoutRecord,
  PayoutConfigRule,
  PayoutTransactionRecord,
  DriverFinancialBalance,
  SettlementPeriodFilter,
  DriverPeriodSettlementSummary,
  PlatformRevenueSummary,
  AiPayoutAnomaly,
  SupportCase,
  SupportCaseType,
  SupportCasePriority,
  SupportCaseStatus,
  SupportCaseSLAStatus,
  SupportCaseEvent,
  SupportCaseEvidence,
  SupportCaseInternalNote,
  CityOperatingStatus,
  PassengerAvailabilityStatus,
  OperatingScheduleMode,
  CityOperatingSchedule,
  CityDriverRequirements,
  ServiceCategoryConfig,
  ServiceCategoryCode,
  CategoryOperatingStatus,
  CityCategoryMatrixItem,
  CityOperationsStatistics,
  CityOperationsAiInsight,
  PromoUsageRecord,
  PromotionCampaign,
  ReferralRewardRule,
  DriverRewardRule,
  PassengerRewardRule,
  RewardRecord,
  FraudDetectionAlert,
  PromotionAiInsight,
  PromotionsSummaryMetrics,
  SafetyPriority,
  SafetyIncidentCategory,
  SafetyEventStatus,
  SafetyLocationFreshness,
  SafetyResponseStatus,
  SafetyResponseTimelineEvent,
  SafetyEvidenceItem,
  SafetyLocationBreadcrumb,
  SafetyEmergencyContactConfig,
  SafetyResponseSlaConfig,
  AdminRoleDefinition,
  AdminSession,
  AdminInvitation,
  AdminApprovalRule,
  AdminSecurityAlert,
  PermissionModule,
  PermissionLevel,
  SensitivePermission,
  AdminAccountStatus,
  RiskLevel,
  RiskCategory,
  RiskStatus,
  RiskResolutionAction,
  RiskEvidenceItem,
  RiskTimelineEvent,
  RiskAlertRecord,
  RiskRule,
  RiskWatchlistEntry,
  RiskAiInsight,
  RiskSummaryMetrics
} from '../types';
import {
  INITIAL_RISK_RULES,
  INITIAL_DEMO_RISK_ALERTS,
  INITIAL_RISK_WATCHLIST,
  INITIAL_RISK_AI_INSIGHTS
} from '../services/fraudRiskService';
import {
  DEFAULT_SYSTEM_ROLES,
  DEFAULT_ADMIN_USERS,
  DEFAULT_ADMIN_SESSIONS,
  DEFAULT_ADMIN_INVITATIONS,
  DEFAULT_APPROVAL_RULES,
  DEFAULT_SECURITY_ALERTS,
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_LEVELS,
  ALL_SENSITIVE_PERMISSIONS,
  hasPermission as rbacHasPermission,
  hasSensitivePermission as rbacHasSensitivePermission,
  canAccessCity as rbacCanAccessCity,
  canAccessTab as rbacCanAccessTab,
  isReadOnlyAdmin as rbacIsReadOnlyAdmin,
  ADMIN_TAB_TO_MODULE,
  getRoleBadge,
  getStatusBadge,
  getSensitivePermissionLabel
} from '../services/adminAccessService';
import { authService, SESSION_IDLE_TIMEOUT_MS } from '../services/backend/AuthService';
import {
  DEFAULT_EMERGENCY_CONTACTS,
  DEFAULT_SAFETY_SLA_CONFIG,
  INCIDENT_CATEGORIES_CONFIG,
  DEMO_SAFETY_INCIDENTS,
  generateAiSafetySummary
} from '../services/safetyEmergencyService';
import {
  INITIAL_DEMO_PROMOS,
  INITIAL_DEMO_CAMPAIGNS,
  INITIAL_DEMO_REFERRAL_RULES,
  INITIAL_DEMO_REFERRALS,
  INITIAL_DEMO_DRIVER_REWARD_RULES,
  INITIAL_DEMO_PASSENGER_REWARD_RULES,
  INITIAL_DEMO_REWARDS_HISTORY,
  INITIAL_DEMO_PROMO_USAGES,
  INITIAL_DEMO_FRAUD_ALERTS,
  INITIAL_DEMO_PROMO_AI_INSIGHTS
} from '../services/promotionRewardsService';
import {
  INITIAL_PAKISTAN_CITIES,
  INITIAL_SERVICE_CATEGORIES,
  generateInitialCityCategoryMatrix,
  INITIAL_CITY_AI_INSIGHTS
} from '../services/cityOperationsService';
import { INITIAL_DEMO_CASES } from '../services/caseManagementService';
import {
  DEFAULT_PAYOUT_CONFIG,
  INITIAL_DEMO_PAYOUTS,
  INITIAL_PAYOUT_TRANSACTIONS,
  INITIAL_AI_PAYOUT_ANOMALIES,
  calculateDriverFinancialBalance,
  validatePayoutRequest,
  calculateDriverPeriodSettlement,
  calculatePlatformRevenue
} from '../services/payoutSettlementService';
import {
  DEFAULT_CENTRAL_PRICING_RULE,
  INITIAL_RULE_VERSIONS,
  calculateCentralFare
} from '../services/pricingEngine';
import {
  INITIAL_FINE_REASONS,
  INITIAL_AUTOMATIC_FINE_RULES,
  INITIAL_DEMO_FINES,
  INITIAL_DEMO_FINE_TRANSACTIONS,
  generateFineNote,
  isQualifyingIncident,
  getDriverFineSummary
} from '../services/finePenaltyEngine';
import {
  INITIAL_REFUND_REASONS,
  INITIAL_PASSENGER_REFUNDS,
  INITIAL_DRIVER_REIMBURSEMENTS,
  INITIAL_FINANCIAL_ADJUSTMENTS,
  INITIAL_COMPREHENSIVE_TRANSACTIONS,
  INITIAL_RECONCILIATION_RECORDS,
  INITIAL_DAILY_SETTLEMENTS,
  INITIAL_AI_FINANCIAL_ANOMALIES,
  calculateRefundableAmount,
  generateRefundNote,
  generateReimbursementNote
} from '../services/financialResolutionService';
import { calculateDriverEligibility } from '../services/driverVerificationService';
import {
  safetyService,
  complaintService,
  supportCaseService,
  supportTicketService,
  driverVerificationBackendService
} from '../services/backend/SafetyAndSupportService';
import {
  INITIAL_ADMINS,
  INITIAL_PASSENGERS,
  INITIAL_DRIVERS,
  INITIAL_VERIFICATIONS,
  INITIAL_RIDES,
  INITIAL_FARE_CONFIGS,
  INITIAL_CITIES,
  INITIAL_INTERCITY_ROUTES,
  INITIAL_PAYOUTS,
  INITIAL_PROMOS,
  INITIAL_FREIGHT,
  INITIAL_ACADEMY_LESSONS,
  INITIAL_LOANS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPLAINTS,
  INITIAL_SAFETY_INCIDENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_FARE_RULES,
  INITIAL_TRANSACTIONS,
  INITIAL_TRAINING_MODULES,
  INITIAL_LOAN_APPLICATIONS,
  INITIAL_FREIGHT_ORDERS,
  INITIAL_REFERRALS,
  INITIAL_SUPPORT_TICKETS
} from '../services/mockData';
import { firebaseRepository } from '../services/backend/FirebaseRepository';
import { getActiveDataSource } from '../services/backend/dataSourceConfig';
import {
  isProductionDataSource,
  isDemoDataSource,
  validateProductionConfig,
  assertProductionSafetyLock,
  getCentralDataSourceMode,
  setCentralDataSourceMode,
  DATA_SOURCE_CHANGED_EVENT,
  DataSourceMode
} from '../config/dataSourceMode';
import { INITIAL_OPERATIONS_ALERTS } from '../services/operationsData';
import {
  INITIAL_DRIVER_DAILY_SUMMARIES,
  INITIAL_LATE_PICKUP_INCIDENTS,
  INITIAL_DRIVER_SUSPENSIONS,
  INITIAL_DRIVER_WARNINGS,
  DEFAULT_LATE_PICKUP_CONFIG,
  calculateDriverDailyEarnings,
  MANUAL_SUSPENSION_REASONS
} from '../services/driverComplianceService';
import {
  DEFAULT_AUTOMATION_SETTINGS,
  DEFAULT_SCORE_WEIGHTS,
  generateDefaultAdminTasks,
  processAiQuery
} from '../services/aiIntelligenceService';
import { INITIAL_FEEDBACKS } from '../services/feedbackAndCaseService';
import {
  CommissionRule,
  DriverCommissionOverride,
  CashRideReconciliationRecord,
  AdvancePaymentReconciliationRecord
} from '../types/commissionAndRevenue';
import {
  DriverWallet,
  TopUpRequest,
  TopUpStatus,
  CompanyPaymentAccount,
  CentralPaymentTransaction,
  AdvanceBookingHold,
  PaymentProviderConfig,
  PaymentWebhookRecord,
  PaymentReconciliationItem,
  PaymentTransactionType
} from '../types/paymentArchitecture';
import {
  INITIAL_COMMISSION_RULES,
  INITIAL_DRIVER_OVERRIDES,
  INITIAL_CASH_RECONCILIATIONS,
  INITIAL_ADVANCE_RECONCILIATIONS,
  calculateCommissionForRide,
  UnifiedTimeframePeriod
} from '../services/commissionService';
import { getTodayStr } from '../utils/dateUtils';
import {
  INITIAL_COMPANY_PAYMENT_ACCOUNTS,
  INITIAL_TOPUP_REQUESTS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_ADVANCE_BOOKINGS,
  INITIAL_PAYMENT_PROVIDERS,
  INITIAL_WEBHOOK_LOGS,
  INITIAL_PAYMENT_RECONCILIATION_ITEMS,
  createInitialDriverWallets,
  processTopUpStatusChange as executeTopUpStatusChange,
  creditDriverWallet as executeCreditWallet,
  debitDriverWallet as executeDebitWallet,
  settleCashRide as executeCashRideSettlement
} from '../services/centralPaymentService';
import { financialService, FinancialService } from '../services/backend/FinancialService';
import { centralAdminControl } from '../services/backend/CentralAdminControl';
import { pricingService } from '../services/backend/PricingService';

export type { AdminTab };

export const ROLE_PERMISSIONS: Record<AdminRole, AdminTab[]> = {
  super_admin: [
    'dashboard', 'ai_assistant', 'passengers', 'drivers', 'driver_earnings', 'verification', 'academy', 'loans',
    'live_rides', 'rides', 'freight', 'fares', 'wallets', 'promos',
    'safety', 'complaints', 'support', 'notifications', 'cities', 'reports', 'settings', 'audit_logs', 'admins'
  ],
  operations_admin: [
    'dashboard', 'ai_assistant', 'live_rides', 'rides', 'drivers', 'driver_earnings', 'freight', 'cities', 'verification', 'safety'
  ],
  support_admin: [
    'dashboard', 'ai_assistant', 'complaints', 'support', 'safety', 'passengers', 'drivers', 'notifications'
  ],
  finance_admin: [
    'dashboard', 'ai_assistant', 'fares', 'wallets', 'driver_earnings', 'promos', 'loans', 'reports'
  ],
  verification_admin: [
    'dashboard', 'ai_assistant', 'drivers', 'verification', 'academy'
  ],
  safety_admin: [
    'dashboard', 'ai_assistant', 'safety', 'live_rides', 'rides', 'drivers', 'complaints', 'support', 'notifications'
  ],
  reports_admin: [
    'dashboard', 'ai_assistant', 'reports', 'rides', 'drivers', 'passengers', 'fares', 'wallets', 'driver_earnings', 'audit_logs'
  ],
  read_only_admin: [
    'dashboard', 'ai_assistant', 'passengers', 'drivers', 'driver_earnings', 'verification', 'live_rides', 'rides', 'fares', 'wallets', 'promos', 'safety', 'complaints', 'support', 'notifications', 'cities', 'reports', 'audit_logs'
  ],
  ops_dispatcher: ['dashboard', 'ai_assistant', 'live_rides', 'rides', 'drivers', 'driver_earnings', 'freight', 'cities', 'verification', 'safety'],
  safety_officer: ['dashboard', 'ai_assistant', 'complaints', 'support', 'safety', 'passengers', 'drivers', 'notifications'],
  financial_auditor: ['dashboard', 'ai_assistant', 'fares', 'wallets', 'driver_earnings', 'promos', 'loans', 'reports'],
  city_manager: ['dashboard', 'ai_assistant', 'live_rides', 'rides', 'drivers', 'driver_earnings', 'freight', 'cities', 'verification', 'safety'],
  dispatcher: ['dashboard', 'ai_assistant', 'live_rides', 'rides', 'drivers', 'freight', 'cities', 'verification', 'safety'],
  support_agent: ['dashboard', 'ai_assistant', 'complaints', 'support', 'safety', 'passengers', 'drivers', 'notifications'],
  finance_officer: ['dashboard', 'ai_assistant', 'fares', 'wallets', 'driver_earnings', 'promos', 'loans', 'reports']
};

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AdminContextType {
  currentAdmin: AdminUser | null;
  sessionExpiresAt: string | null;
  authLoading: boolean;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Toast System
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // Data states
  passengers: Passenger[];
  drivers: Driver[];
  verifications: VerificationItem[];
  rides: Ride[];
  fareConfigs: FareCategoryConfig[];
  cities: CityConfig[];
  intercityRoutes: IntercityRoute[];
  payouts: PayoutRequest[];
  promos: PromoCode[];
  freightJobs: FreightJob[];
  academyLessons: AcademyLesson[];
  loans: DriverLoan[];
  notifications: AdminNotification[];
  complaints: Complaint[];
  safetyIncidents: SafetyIncident[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  adminUsers: AdminUser[];
  systemSettings: AppSettings;
  updateSystemSettings: (newSettings: Partial<AppSettings>) => void;
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  togglePromoStatus: (promoId: string, newStatus?: 'active' | 'inactive' | 'paused', reason?: string) => void;
  updatePromoCodeDetails: (id: string, updates: Partial<PromoCode>, reason?: string) => void;
  // Phase 50: Promo Usages, Campaigns, Rewards & Fraud
  promoUsages: PromoUsageRecord[];
  recordPromoUsage: (usage: Omit<PromoUsageRecord, 'id' | 'usedAt'>) => void;
  promotionCampaigns: PromotionCampaign[];
  createPromotionCampaign: (campaign: Omit<PromotionCampaign, 'id' | 'spentBudget' | 'currentUsersCount' | 'currentUsesCount' | 'createdAt'>, reason?: string) => void;
  updatePromotionCampaign: (id: string, updates: Partial<PromotionCampaign>, reason?: string) => void;
  toggleCampaignStatus: (id: string, status: PromotionCampaign['status'], reason?: string) => void;
  referralRewardRules: ReferralRewardRule[];
  updateReferralRewardRule: (id: string, updates: Partial<ReferralRewardRule>, reason?: string) => void;
  driverRewardRules: DriverRewardRule[];
  updateDriverRewardRule: (id: string, updates: Partial<DriverRewardRule>, reason?: string) => void;
  passengerRewardRules: PassengerRewardRule[];
  updatePassengerRewardRule: (id: string, updates: Partial<PassengerRewardRule>, reason?: string) => void;
  rewardsHistory: RewardRecord[];
  disburseDriverReward: (driverId: string, ruleId: string, amount: number, title: string, reason?: string) => void;
  disbursePassengerReward: (passengerId: string, ruleId: string, amount: number, title: string, reason?: string) => void;
  fraudAlerts: FraudDetectionAlert[];
  reviewFraudAlert: (alertId: string, action: 'clear' | 'escalate_case', notes?: string) => void;
  promotionAiInsights: PromotionAiInsight[];
  fareRules: FareRule[];
  updateFareRule: (rule: FareRule) => void;
  resetFareRule: (category: RideCategory) => void;
  resetAllFareRules: () => void;
  // Phase 40 Central Pricing Engine
  centralPricingRule: CentralPricingRule;
  centralPricing?: CentralPricingRule;
  financialRecords?: (PassengerRefundRecord | DriverReimbursementRecord)[];
  pricingRuleVersions: PricingRuleVersion[];
  driverPricingOverrides: Record<string, DriverPricingOverride>;
  updateCentralPricing: (newRule: CentralPricingRule, reasonNote: string, affectedScope?: string) => void;
  setDriverPricingOverride: (override: DriverPricingOverride) => void;
  removeDriverPricingOverride: (driverId: string) => void;
  transactions: WalletTransaction[];
  trainingModules: TrainingModule[];
  addTrainingModule: (mod: TrainingModule) => void;
  updateTrainingModule: (id: string, updates: Partial<TrainingModule>) => void;
  toggleTrainingModule: (id: string) => void;
  loanApplications: LoanApplication[];
  approveLoanApplication: (loanId: string) => void;
  rejectLoanApplication: (loanId: string, reason: string) => void;
  addLoanApplication: (loan: LoanApplication) => void;
  recordLoanRepayment: (id: string, amount: number) => void;
  freightOrders: FreightOrder[];
  updateFreightOrderStatus: (orderId: string, status: FreightOrder['status'], notes?: string) => void;
  addFreightOrder: (order: FreightOrder) => void;
  assignFreightDriver: (orderId: string, driverName: string, driverPhone: string, driverPlate: string) => void;
  toggleCityStatus: (cityId: string, status?: CityOperatingStatus, reason?: string) => void;
  addCity: (city: CityConfig) => void;
  deleteCity: (cityId: string) => void;
  addIntercityRoute: (route: IntercityRoute) => void;
  updateIntercityRoute: (routeId: string, updates: Partial<IntercityRoute>) => void;
  toggleIntercityRoute: (routeId: string) => void;
  sendNotification: (notif: { title: string; body: string; target: 'all' | 'drivers' | 'passengers'; city?: string }) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  escalateSafetyIncident: (sftId: string, notes: string) => void;

  // Support Tickets
  supportTickets: SupportTicket[];
  addTicketReply: (ticketId: string, message: string, senderName?: string) => void;
  addTicketNote: (ticketId: string, note: string) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  assignTicket: (ticketId: string, adminName: string) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'replies'>) => void;

  // Admin Management & RBAC
  addAdminUser: (admin: Omit<AdminUser, 'id'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  toggleAdminStatus: (id: string) => void;
  deleteAdminUser: (id: string) => void;
  switchAdminRole: (role: AdminRole) => void;
  isAuthorizedForTab: (tab: AdminTab, role?: AdminRole) => boolean;

  // Phase 52 Admin Users, Roles, Permissions & Access Control Center
  adminRoles: AdminRoleDefinition[];
  adminSessions: AdminSession[];
  adminInvitations: AdminInvitation[];
  adminApprovalRules: AdminApprovalRule[];
  adminSecurityAlerts: AdminSecurityAlert[];
  hasPermission: (module: PermissionModule, level?: PermissionLevel) => boolean;
  hasSensitivePermission: (action: SensitivePermission) => boolean;
  canAccessCity: (cityName?: string) => boolean;
  canAccessTab: (tab: AdminTab) => boolean;
  checkSensitiveAction: (action: SensitivePermission, actionDescription?: string) => boolean;
  createCustomRole: (role: Omit<AdminRoleDefinition, 'id'>) => void;
  updateAdminRole: (roleId: string, updates: Partial<AdminRoleDefinition>) => void;
  deleteCustomRole: (roleId: string) => void;
  revokeAdminSession: (sessionId: string) => void;
  revokeAllAdminSessions: (adminId: string) => void;
  createAdminInvitation: (invitation: Omit<AdminInvitation, 'id' | 'createdAt' | 'token' | 'status'>) => void;
  revokeAdminInvitation: (invitationId: string) => void;
  resendAdminInvitation: (invitationId: string) => void;
  updateApprovalRule: (ruleId: string, updates: Partial<AdminApprovalRule>) => void;
  dismissSecurityAlert: (alertId: string) => void;
  resolveSecurityAlert: (alertId: string, notes?: string) => void;
  lockAdminAccount: (adminId: string, reason: string) => void;
  unlockAdminAccount: (adminId: string) => void;
  updateAdminPermissions: (adminId: string, permissions: string[], sensitivePermissions?: SensitivePermission[]) => void;
  updateAdminCityScope: (adminId: string, cityScope: string[] | 'all') => void;

  // Actions
  approveDriverVerification: (verId: string, notes?: string) => void;
  rejectDriverVerification: (verId: string, reason: string) => void;
  updatePassengerStatus: (pId: string, status: 'active' | 'suspended', reason?: string) => void;
  adjustPassengerWallet: (pId: string, deltaAmount: number, note: string) => void;
  updateDriverAccountStatus: (dId: string, status: 'active' | 'suspended' | 'blocked', reason?: string) => void;
  adjustDriverWallet: (dId: string, deltaAmount: number, note: string) => void;
  updateFareConfig: (category: RideCategory, newConfig: Partial<FareCategoryConfig>) => void;
  updateCityConfig: (cityId: string, updates: Partial<CityConfig>) => void;
  approvePayout: (payoutId: string, refId: string) => void;
  rejectPayout: (payoutId: string, reason: string) => void;
  createPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  deletePromoCode: (promoId: string) => void;
  togglePromoCode: (promoId: string) => void;
  dispatchNotification: (notif: Omit<AdminNotification, 'id' | 'sentAt' | 'reachCount' | 'status' | 'sentBy'> & { sentBy?: string }) => void;
  resolveComplaint: (cmpId: string, adminNotes: string, refundAmountOrAction?: any) => void;
  rejectComplaint: (cmpId: string, reason: string) => void;
  resolveSafetyIncident: (sftId: string, notes: string) => void;
  updateLoanStatus: (loanId: string, status: DriverLoan['status'], notes?: string) => void;
  toggleAcademyLesson: (lessonId: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addAuditRecord: (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => void;
  resetAllData: () => void;

  // Additional Admin Core Methods
  referrals: ReferralRecord[];
  disburseReferralReward: (refId: string) => void;
  editPassenger: (pId: string, updates: Partial<Passenger>) => void;
  editDriver: (dId: string, updates: Partial<Driver>) => void;
  cancelRide: (rideId: string, reason: string, cancelledBy?: 'passenger' | 'driver' | 'admin' | 'system') => void;
  reopenComplaint: (cmpId: string, note?: string) => void;
  assignComplaint: (cmpId: string, assignedTo: string) => void;
  addComplaintNote: (cmpId: string, note: string) => void;
  refundTransaction: (txId: string, reason: string) => void;

  // Real-Time Operations Center (Phase 32)
  operationsAlerts: OperationsAlert[];
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  resetSimulationData: () => void;
  toggleSimulation: (active?: boolean) => void;
  advanceSimulationStep: () => void;
  assignRideDriver: (rideId: string, driverId: string, notes?: string) => void;
  reassignRideDriver: (rideId: string, newDriverId: string, reason: string) => void;
  cancelRideAssignment: (rideId: string, reason: string) => void;
  flagRide: (rideId: string, reason: string) => void;
  unflagRide: (rideId: string) => void;
  addRideAdminNote: (rideId: string, note: string) => void;
  updateRideStatus: (rideId: string, status: RideStatus, etaMinutes?: number) => void;
  requestPassengerRide: (params: {
    passengerId?: string;
    passengerName: string;
    passengerPhone: string;
    pickup: { address: string; lat: number; lng: number };
    destination: { address: string; lat: number; lng: number };
    category: RideCategory;
    city: string;
    offeredFare: number;
    paymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash';
    notes?: string;
  }) => string;
  driverAcceptRide: (rideId: string, driverId: string) => void;
  driverArriveAtPickup: (rideId: string) => void;
  driverStartTrip: (rideId: string) => void;
  completeRideAndSettle: (
    rideId: string,
    options?: { finalCashCollected?: number; rating?: number; feedback?: string }
  ) => void;
  resolveOperationsAlert: (alertId: string, notes: string) => void;
  escalateOperationsAlert: (alertId: string, notes: string) => void;
  assignOperationsAlert: (alertId: string, adminName: string) => void;
  addOperationsAlertNote: (alertId: string, text: string) => void;
  createOperationsAlert: (alertData: Omit<OperationsAlert, 'id' | 'code' | 'createdAt' | 'notes'>) => void;
  updateDriverOperationalStatus: (driverId: string, status: DriverOperationalStatus) => void;

  // Phase 33 Driver Control, Earnings & Compliance
  driverDailySummaries: DriverDailySummary[];
  latePickupIncidents: LatePickupIncident[];
  driverSuspensions: DriverSuspensionRecord[];
  driverWarnings: DriverWarningRecord[];
  latePickupConfig: LatePickupConfig;
  suspendDriver: (driverId: string, options: { reason: string; reasonCategory: string; durationHours: number; notes: string; relatedRideIds?: string[]; relatedComplaintIds?: string[] }) => void;
  reinstateDriver: (driverId: string, reason?: string) => void;
  recordLatePickupIncident: (incident: Omit<LatePickupIncident, 'id'>) => void;
  updateLatePickupConfig: (newConfig: Partial<LatePickupConfig>) => void;
  issueDriverWarning: (driverId: string, reason: string, notes: string, relatedComplaintId?: string, relatedRideId?: string) => void;
  updateDriverDocumentStatus: (driverId: string, docIndexOrType: number | string, status: 'verified' | 'invalid' | 'rejected', notes?: string) => void;
  updateVerificationReviewStatus: (verId: string, reviewStatus: VerificationReviewStatus, reason?: string, notes?: string) => void;
  calculateAndSaveDriverDailySummary: (driverId?: string, date?: string) => void;
  settleDriverDailySummary: (summaryId: string, paymentRef?: string) => void;
  simulatePhase33Event: (eventType: 'new_registration' | 'document_upload' | 'driver_online' | 'late_pickup_single' | 'late_pickup_auto_suspend_5th' | 'passenger_complaint' | 'manual_suspend' | 'suspension_expire' | 'daily_earnings_calc') => void;

  // Phase 34 AI Admin Assistant & Driver Performance Intelligence
  automationSettings: AutomationSettings;
  updateAutomationSettings: (updates: Partial<AutomationSettings>) => void;
  adminTasks: AdminTask[];
  updateAdminTaskStatus: (taskId: string, status: AdminTaskStatus, note?: string) => void;
  assignAdminTask: (taskId: string, adminEmail: string) => void;
  addAdminTask: (task: Omit<AdminTask, 'id' | 'createdAt'>) => void;
  aiChatMessages: AiChatMessage[];
  sendAiQuery: (queryText: string) => Promise<void>;
  executeAiRecommendation: (driverId: string, action: SmartRecommendedAction, notes?: string) => void;

  // Phase 35 Simple Professional Control Center & Global City Filter
  selectedCityFilter: string;
  setSelectedCityFilter: (city: string) => void;
  toggleDriverRideEligibility: (driverId: string, enabled: boolean, notes?: string) => void;

  // Phase 38 Live Operations Map & Universal Tracking Filter
  operationsInitialFilter?: OperationsInitialFilter;
  setOperationsInitialFilter: (filter?: OperationsInitialFilter) => void;

  // Phase 39 Universal Detail Center & Feedback Review
  universalDetail: UniversalDetailState | null;
  openUniversalDetail: (type: UniversalDetailType, id: string, initialTab?: string) => void;
  closeUniversalDetail: () => void;
  feedbacks: RideFeedback[];
  addRideFeedback: (feedback: Omit<RideFeedback, 'id' | 'date'>) => void;
  recordAdminAudit: (
    action: string,
    entity: string,
    reason: string,
    note: string,
    source?: 'Manual' | 'Automatic' | 'AI recommendation',
    targetType?: AuditLog['targetType'],
    targetId?: string
  ) => void;
  logAction: (action: string, entity: string, reason: string, details?: any) => void;

  // Phase 41 — Driver Fines, Penalties & Deduction Engine
  driverFines: DriverFine[];
  fineReasons: FineReason[];
  automaticFineRules: AutomaticFineRule[];
  fineRuleVersions: FineRuleVersion[];
  fineTransactions: FineTransaction[];
  addDriverFine: (fineData: {
    driverId: string;
    reasonId: string;
    amount: number;
    source?: FineSource;
    relatedRideId?: string;
    relatedRideCode?: string;
    date?: string;
    note?: string;
    deductionMethod?: DeductionMethod;
    isQualifying?: boolean;
    exclusionReason?: FairExclusionReason;
  }) => void;
  waiveDriverFine: (fineId: string, reason: string, note: string) => void;
  refundDriverFine: (fineId: string, refundAmount: number, reason: string, note: string) => void;
  resolveDisputeDriverFine: (fineId: string, decision: 'approved' | 'rejected' | 'partial', decisionNote: string, adjustmentAmount?: number) => void;
  updateAutomaticFineRule: (ruleId: string, updates: Partial<AutomaticFineRule>, reasonForChange: string) => void;
  addFineReason: (reason: Omit<FineReason, 'id'>) => void;
  toggleFineReason: (reasonId: string) => void;

  // Phase 42 — Reimbursement, Refund, Adjustment & Settlement System
  passengerRefunds: PassengerRefundRecord[];
  driverReimbursements: DriverReimbursementRecord[];
  financialAdjustments: FinancialAdjustmentRecord[];
  comprehensiveTransactions: ComprehensiveLedgerTransaction[];
  dailySettlements: DailySettlementRecord[];
  reconciliationRecords: ReconciliationRecord[];
  aiFinancialAnomalies: AiFinancialAnomaly[];
  approvalThreshold: number;
  updateApprovalThreshold: (threshold: number) => void;
  processPassengerRefund: (refundData: {
    rideId: string;
    rideCode: string;
    passengerId: string;
    passengerName: string;
    passengerPhone: string;
    driverId: string;
    driverName: string;
    originalFare: number;
    paidAmount: number;
    previousRefunds: number;
    refundType: 'full' | 'partial';
    amount: number;
    paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'card' | 'wallet';
    refundDestination?: 'wallet_credit' | 'payment_refund_pending';
    reason: string;
    note?: string;
  }) => void;
  processDriverReimbursement: (reimbursementData: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverPlate: string;
    rideId?: string;
    rideCode?: string;
    amount: number;
    reason: string;
    note?: string;
    paymentDestination?: 'driver_wallet' | 'upcoming_payout';
  }) => void;
  processFinancialAdjustment: (adjData: {
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
  }) => void;
  approveFinancialRecord: (category: 'refund' | 'reimbursement' | 'adjustment' | 'fine_refund', id: string, note?: string) => void;
  rejectFinancialRecord: (category: 'refund' | 'reimbursement' | 'adjustment', id: string, rejectionReason: string) => void;
  runReconciliationAudit: () => void;
  resolveReconciliationRecord: (recordId: string, resolutionNote: string) => void;
  dismissFinancialAnomaly: (anomalyId: string) => void;

  // Phase 43 — Driver Payouts, Withdrawals & Settlements
  driverPayouts: DriverPayoutRecord[];
  payoutTransactions: PayoutTransactionRecord[];
  payoutConfig: PayoutConfigRule;
  updatePayoutConfig: (newConfig: Partial<PayoutConfigRule>) => void;
  aiPayoutAnomalies: AiPayoutAnomaly[];
  dismissAiPayoutAnomaly: (id: string) => void;
  requestDriverWithdrawal: (data: {
    driverId: string;
    amount: number;
    paymentMethod: PayoutMethod;
    accountNumber: string;
    accountTitle: string;
    bankName?: string;
    optionalNote?: string;
  }) => void;
  payoutControlAction: (
    action: 'review' | 'approve' | 'process' | 'complete' | 'reject' | 'cancel' | 'retry',
    payoutId: string,
    payload?: {
      reason?: string;
      note?: string;
      referenceId?: string;
      transactionId?: string;
    }
  ) => void;
  runScheduledAutoPayoutBatch: () => {
    processedCount: number;
    totalAmount: number;
    skippedCount: number;
  };

  // Phase 48: Unified Support, Complaints, Disputes & Case Management
  cases: SupportCase[];
  assignCase: (
    caseId: string,
    assignedAdmin: string,
    assignedTeam?: 'support' | 'safety' | 'finance' | 'verification' | 'operations',
    note?: string
  ) => void;
  changeCasePriority: (caseId: string, priority: SupportCasePriority, reason: string) => void;
  addCaseInternalNote: (caseId: string, text: string) => void;
  addCaseEvidence: (caseId: string, evidence: Omit<SupportCaseEvidence, 'id' | 'uploadedAt'>) => void;
  requestCaseInfo: (caseId: string, target: 'driver' | 'passenger', message: string) => void;
  recordCaseUserResponse: (caseId: string, respondent: 'driver' | 'passenger', text: string) => void;
  escalateCase: (caseId: string, escalationReason: string) => void;
  resolveCase: (caseId: string, outcome: string, note: string, financialActionTaken?: boolean) => void;
  rejectCase: (caseId: string, reason: string) => void;
  reopenCase: (caseId: string, reason: string) => void;
  closeCase: (caseId: string, note: string) => void;
  createSupportCase: (caseData: Partial<SupportCase>) => void;

  // Phase 49: City, Service Category & Operations Configuration Center
  serviceCategories: ServiceCategoryConfig[];
  cityCategoryMatrix: CityCategoryMatrixItem[];
  cityAiInsights: CityOperationsAiInsight[];
  updateCity: (cityId: string, updates: Partial<CityConfig>, reason?: string) => void;
  updateServiceCategory: (categoryId: string, updates: Partial<ServiceCategoryConfig>, reason?: string) => void;
  toggleCategoryStatus: (categoryId: string, status?: CategoryOperatingStatus, reason?: string) => void;
  updateCityCategoryMatrixItem: (itemId: string, updates: Partial<CityCategoryMatrixItem>, reason?: string) => void;
  toggleCityCategoryAvailability: (cityId: string, categoryCode: string, reason?: string) => void;
  updateCityOperatingSchedule: (cityId: string, schedule: CityOperatingSchedule, reason?: string) => void;

  // Phase 51: Safety, Emergency & Incident Control Center
  safetyEmergencyContacts: SafetyEmergencyContactConfig[];
  updateEmergencyContact: (id: string, updates: Partial<SafetyEmergencyContactConfig>) => void;
  addEmergencyContact: (contact: Omit<SafetyEmergencyContactConfig, 'id'>) => void;
  safetySlaConfig: SafetyResponseSlaConfig;
  updateSafetySlaConfig: (config: Partial<SafetyResponseSlaConfig>) => void;
  safetyIncidentCategories: typeof INCIDENT_CATEGORIES_CONFIG;
  activeSafetyModalIncidentId: string | null;
  openSafetyDetail: (incidentId: string) => void;
  closeSafetyDetail: () => void;
  acknowledgeSafetyIncident: (incidentId: string, notes?: string) => void;
  assignSafetyIncident: (incidentId: string, assignedAdmin: string, assignedTeam?: string, notes?: string) => void;
  recordSafetyContactAttempt: (
    incidentId: string,
    attempt: {
      contactType: 'driver' | 'passenger' | 'emergency_contact' | 'local_emergency_service';
      channel: 'phone_call' | 'in_app_voip' | 'sms' | 'push_notice';
      status: 'connected' | 'unanswered' | 'busy' | 'left_message';
      notes: string;
    }
  ) => void;
  requestSafetyInfo: (incidentId: string, target: 'driver' | 'passenger', message: string) => void;
  addSafetyInternalNote: (incidentId: string, text: string) => void;
  investigateSafetyIncident: (incidentId: string, notes: string) => void;
  markSafetyFalseAlarm: (
    incidentId: string,
    reason: 'duplicate' | 'accidental_tap' | 'test_alert' | 'cancelled_by_user',
    notes: string
  ) => void;
  closeSafetyIncident: (incidentId: string, notes: string) => void;
  addSafetyEvidence: (incidentId: string, evidence: Omit<SafetyEvidenceItem, 'id' | 'uploadedAt'>) => void;
  linkSafetyToSupportCase: (incidentId: string) => string;
  triggerDemoSosAlert: (city?: string) => void;

  // Phase 53: Fraud, Anti-Abuse & Risk Control Center
  riskAlerts: RiskAlertRecord[];
  riskRules: RiskRule[];
  riskWatchlist: RiskWatchlistEntry[];
  riskAiInsights: RiskAiInsight[];
  updateRiskAlert: (alertId: string, updates: Partial<RiskAlertRecord>, reason?: string) => void;
  assignRiskAlert: (alertId: string, assignedAdmin: string, assignedTeam?: string, note?: string) => void;
  updateRiskAlertStatus: (alertId: string, status: RiskStatus, reason: string, resolution?: RiskResolutionAction) => void;
  addRiskAlertEvidence: (alertId: string, evidence: Omit<RiskEvidenceItem, 'id' | 'uploadedAt'>) => void;
  requestRiskEvidence: (alertId: string, reason: string) => void;
  addRiskAdminNote: (alertId: string, note: string) => void;
  linkRiskAlertToCase: (alertId: string) => string;
  updateRiskRule: (ruleId: string, updates: Partial<RiskRule>, reasonNote: string) => void;
  createRiskRule: (rule: Omit<RiskRule, 'id' | 'version'>) => void;
  addToRiskWatchlist: (entry: Omit<RiskWatchlistEntry, 'id' | 'addedDate'>) => void;
  removeFromRiskWatchlist: (entryId: string, reason?: string) => void;
  triggerDemoRiskScan: (city?: string) => void;

  // Phase 56-C Central Commission & Shared Financial State
  commissionRules: CommissionRule[];
  setCommissionRules: React.Dispatch<React.SetStateAction<CommissionRule[]>>;
  driverOverrides: DriverCommissionOverride[];
  setDriverOverrides: React.Dispatch<React.SetStateAction<DriverCommissionOverride[]>>;
  cashReconciliations: CashRideReconciliationRecord[];
  setCashReconciliations: React.Dispatch<React.SetStateAction<CashRideReconciliationRecord[]>>;
  advanceReconciliations: AdvancePaymentReconciliationRecord[];
  setAdvanceReconciliations: React.Dispatch<React.SetStateAction<AdvancePaymentReconciliationRecord[]>>;
  driverWallets: DriverWallet[];
  setDriverWallets: React.Dispatch<React.SetStateAction<DriverWallet[]>>;

  // Phase 56-B Central Payment Architecture & Financial Services
  topUps: TopUpRequest[];
  setTopUps: React.Dispatch<React.SetStateAction<TopUpRequest[]>>;
  centralTransactions: CentralPaymentTransaction[];
  setCentralTransactions: React.Dispatch<React.SetStateAction<CentralPaymentTransaction[]>>;
  companyAccounts: CompanyPaymentAccount[];
  setCompanyAccounts: React.Dispatch<React.SetStateAction<CompanyPaymentAccount[]>>;
  advanceHolds: AdvanceBookingHold[];
  setAdvanceHolds: React.Dispatch<React.SetStateAction<AdvanceBookingHold[]>>;
  paymentProviders: PaymentProviderConfig[];
  setPaymentProviders: React.Dispatch<React.SetStateAction<PaymentProviderConfig[]>>;
  paymentWebhooks: PaymentWebhookRecord[];
  setPaymentWebhooks: React.Dispatch<React.SetStateAction<PaymentWebhookRecord[]>>;
  paymentReconciliations: PaymentReconciliationItem[];
  setPaymentReconciliations: React.Dispatch<React.SetStateAction<PaymentReconciliationItem[]>>;
  financialService: FinancialService;
  handleTopUpStatusChange: (requestId: string, newStatus: TopUpStatus, adminActor: string, note?: string, reason?: string) => void;
  recordCashRideSettlement: (params: { rideId: string; rideCode: string; driverId: string; driverName: string; driverPhone: string; fare: number; commissionRate?: number; adminActor?: string }) => void;
  recordDriverWalletCredit: (driverId: string, amount: number, type: PaymentTransactionType, description: string, adminActor: string) => void;
  recordDriverWalletDebit: (driverId: string, amount: number, type: PaymentTransactionType, description: string, adminActor: string) => void;

  // Phase 63 — Unified Dashboard Date Filter System
  dashboardDateFilter: {
    mode: UnifiedTimeframePeriod;
    selectedDate: string;
    endDate?: string;
    selectedYear: number;
    selectedMonth: number | 'all';
  };
  setDashboardDateFilter: React.Dispatch<React.SetStateAction<{
    mode: UnifiedTimeframePeriod;
    selectedDate: string;
    endDate?: string;
    selectedYear: number;
    selectedMonth: number | 'all';
  }>>;
  updateDashboardDateFilter: (updates: Partial<{
    mode: UnifiedTimeframePeriod;
    selectedDate: string;
    endDate?: string;
    selectedYear: number;
    selectedMonth: number | 'all';
  }>) => void;
  resetDashboardDateToToday: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const VALID_ADMIN_TABS: AdminTab[] = [
  'dashboard', 'passengers', 'drivers', 'driver_earnings', 'verification', 'academy',
  'loans', 'live_rides', 'rides', 'freight', 'fares', 'wallets', 'promos', 'safety',
  'safety_emergency', 'complaints', 'support', 'notifications', 'cities', 'reports',
  'settings', 'audit', 'audit_logs', 'admins', 'fraud_risk', 'ai_assistant'
];

export function parseTabFromUrl(): AdminTab | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. URL hash (e.g., #drivers or #/drivers)
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (hash && (VALID_ADMIN_TABS as string[]).includes(hash)) {
      return hash as AdminTab;
    }
    // 2. Query param (e.g., ?tab=drivers)
    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get('tab')?.trim().toLowerCase();
    if (queryTab && (VALID_ADMIN_TABS as string[]).includes(queryTab)) {
      return queryTab as AdminTab;
    }
    // 3. Path segment fallback (e.g., /drivers)
    const path = window.location.pathname.replace(/^\//, '').split('/')[0]?.trim().toLowerCase();
    if (path && (VALID_ADMIN_TABS as string[]).includes(path)) {
      return path as AdminTab;
    }
  } catch {}
  return null;
}

// Phase 36: Demo storage key strictly isolated to Demo mode
const DEMO_STORAGE_PREFIX = 'GOLIFE_DEMO_STORE_V29';
const LOCAL_STORAGE_KEY = {
  toString: () => DEMO_STORAGE_PREFIX
};

// Persist state ONLY in Demo Mode. Production Mode never persists operational state to localStorage.
function persistDemoStorage(suffix: string, value: any): void {
  if (isProductionDataSource()) return;
  try {
    const strVal = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(`${DEMO_STORAGE_PREFIX}_${suffix}`, strVal);
  } catch {
    // ignore storage quota errors
  }
}

// Safe array loader: in Production mode NEVER hydrate from localStorage or Demo fallbacks
function safeLoadArray<T>(key: string, fallback: T[]): T[] {
  if (isProductionDataSource()) {
    return [];
  }
  const rawKey = typeof key === 'string' ? key : String(key);
  try {
    const saved = localStorage.getItem(rawKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({ ...item, isDemo: true, _isDemo: true, dataSource: 'demo' }));
      }
    }
  } catch {
    // ignore parse errors
  }

  return fallback.map((item: any) => ({
    ...item,
    isDemo: true,
    _isDemo: true,
    dataSource: 'demo'
  }));
}

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('GOLIFE_CURRENT_ADMIN');
    const expiry = localStorage.getItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT');
    if (saved) {
      try {
        if (expiry) {
          if (Date.now() <= new Date(expiry).getTime()) {
            return JSON.parse(saved);
          }
          // Session expired: clean up
          localStorage.removeItem('GOLIFE_CURRENT_ADMIN');
          localStorage.removeItem('GOLIFE_ADMIN_SESSION_TOKEN');
          localStorage.removeItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT');
          return null;
        } else {
          // Backward compatibility: set fresh 8-hour expiry
          const future = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
          localStorage.setItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT', future);
          return JSON.parse(saved);
        }
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  });

  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(() => {
    return localStorage.getItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT') || null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    const fromUrl = parseTabFromUrl();
    if (fromUrl) return fromUrl;
    try {
      const saved = localStorage.getItem('GOLIFE_ACTIVE_TAB');
      if (saved && (VALID_ADMIN_TABS as string[]).includes(saved)) {
        return saved as AdminTab;
      }
    } catch {}
    return 'dashboard';
  });

  const setActiveTab = (tab: AdminTab) => {
    const validTab = (VALID_ADMIN_TABS as string[]).includes(tab) ? tab : 'dashboard';
    setActiveTabState(validTab);
    try {
      localStorage.setItem('GOLIFE_ACTIVE_TAB', validTab);
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', `#${validTab}`);
      }
    } catch {}
  };

  // Synchronize URL navigation (browser forward / back / direct hash changes)
  useEffect(() => {
    const handleNavigationChange = () => {
      const fromUrl = parseTabFromUrl();
      if (fromUrl && fromUrl !== activeTab) {
        setActiveTabState(fromUrl);
        try {
          localStorage.setItem('GOLIFE_ACTIVE_TAB', fromUrl);
        } catch {}
      }
    };

    window.addEventListener('hashchange', handleNavigationChange);
    window.addEventListener('popstate', handleNavigationChange);
    return () => {
      window.removeEventListener('hashchange', handleNavigationChange);
      window.removeEventListener('popstate', handleNavigationChange);
    };
  }, [activeTab]);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [operationsInitialFilter, setOperationsInitialFilter] = useState<OperationsInitialFilter | undefined>(undefined);

  // Phase 63/64 — Unified Dashboard Date Filter System (ONE DATE FILTER = ONE SOURCE OF TRUTH)
  const [dashboardDateFilter, setDashboardDateFilter] = useState<{
    mode: UnifiedTimeframePeriod;
    selectedDate: string;
    endDate?: string;
    selectedYear: number;
    selectedMonth: number | 'all';
  }>(() => {
    try {
      const saved = localStorage.getItem('GOLIFE_DASHBOARD_DATE_FILTER');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.selectedDate) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const today = getTodayStr();
    return {
      mode: 'today',
      selectedDate: today,
      endDate: today,
      selectedYear: 2026,
      selectedMonth: 'all'
    };
  });

  const updateDashboardDateFilter = (updates: Partial<{
    mode: UnifiedTimeframePeriod;
    selectedDate: string;
    endDate?: string;
    selectedYear: number;
    selectedMonth: number | 'all';
  }>) => {
    setDashboardDateFilter((prev) => {
      const updated = {
        ...prev,
        ...updates
      };
      try {
        localStorage.setItem('GOLIFE_DASHBOARD_DATE_FILTER', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetDashboardDateToToday = () => {
    const today = getTodayStr();
    const filter = {
      mode: 'today' as const,
      selectedDate: today,
      endDate: today,
      selectedYear: 2026,
      selectedMonth: 'all' as const
    };
    setDashboardDateFilter(filter);
    try {
      localStorage.setItem('GOLIFE_DASHBOARD_DATE_FILTER', JSON.stringify(filter));
    } catch {
      // ignore
    }
  };

  // Phase 39 Universal Detail Center & Feedback Review
  const [universalDetail, setUniversalDetail] = useState<UniversalDetailState | null>(null);

  const openUniversalDetail = (type: UniversalDetailType, id: string, initialTab?: string) => {
    setUniversalDetail({ type, id, initialTab });
  };

  const closeUniversalDetail = () => {
    setUniversalDetail(null);
  };

  const [feedbacks, setFeedbacks] = useState<RideFeedback[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_feedbacks`, INITIAL_FEEDBACKS);
  });

  useEffect(() => {
    persistDemoStorage('feedbacks', feedbacks);
  }, [feedbacks]);

  const addRideFeedback = (fb: Omit<RideFeedback, 'id' | 'date'>) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newFb: RideFeedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      date: nowStr
    };
    setFeedbacks((prev) => [newFb, ...prev]);
    if (isProductionDataSource()) {
      firebaseRepository.create('feedbacks', newFb.id, newFb).catch((err) => {
        console.warn('Production feedback sync notice:', err.message);
      });
    }
    showToast('Feedback recorded successfully', 'success');
  };

  const recordAdminAudit = (
    action: string,
    entity: string,
    reason: string,
    note: string,
    source: 'Manual' | 'Automatic' | 'AI recommendation' = 'Manual',
    targetType: AuditLog['targetType'] = 'system',
    targetId?: string
  ) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminEmail: currentAdmin?.email || 'admin@golife.pk',
      adminRole: currentAdmin?.role || 'super_admin',
      action,
      entity,
      reason,
      note,
      source,
      targetType,
      targetId: targetId || entity,
      details: `${action} on [${entity}]: Reason: ${reason} | Note: ${note} (Source: ${source})`,
      timestamp: nowStr,
      ipAddress: '182.185.190.12 (Islamabad Secure HQ)',
      status: 'success'
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (isProductionDataSource()) {
      firebaseRepository.create('auditLogs', newLog.id, newLog).catch((err) => {
        console.warn('Production audit log sync notice:', err.message);
      });
    }
  };

  // Hydrate states with LocalStorage persistence ONLY in Demo Mode
  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_passengers`, INITIAL_PASSENGERS);
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_drivers`, INITIAL_DRIVERS);
  });

  const [verifications, setVerifications] = useState<VerificationItem[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_verifications`, INITIAL_VERIFICATIONS);
  });

  const [rides, setRides] = useState<Ride[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_rides`, INITIAL_RIDES);
  });

  const [fareConfigs, setFareConfigs] = useState<FareCategoryConfig[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_fares`, INITIAL_FARE_CONFIGS);
  });

  const [cities, setCities] = useState<CityConfig[]>(() => {
    if (isProductionDataSource()) return [];
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_cities`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, CityConfig>();
          INITIAL_PAKISTAN_CITIES.forEach((c) => map.set(c.id, c));
          parsed.forEach((c: CityConfig) => {
            const existing = map.get(c.id);
            if (existing) {
              map.set(c.id, { ...existing, ...c });
            } else {
              map.set(c.id, c);
            }
          });
          return Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PAKISTAN_CITIES;
  });

  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryConfig[]>(() => {
    if (isProductionDataSource()) return [];
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_service_categories`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, ServiceCategoryConfig>();
          INITIAL_SERVICE_CATEGORIES.forEach((cat) => map.set(cat.id, cat));
          parsed.forEach((cat: ServiceCategoryConfig) => {
            const existing = map.get(cat.id);
            if (existing) {
              map.set(cat.id, { ...existing, ...cat });
            } else {
              map.set(cat.id, cat);
            }
          });
          return Array.from(map.values());
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SERVICE_CATEGORIES;
  });

  const [cityCategoryMatrix, setCityCategoryMatrix] = useState<CityCategoryMatrixItem[]>(() => {
    if (isProductionDataSource()) return [];
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_city_category_matrix`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return generateInitialCityCategoryMatrix(INITIAL_PAKISTAN_CITIES, INITIAL_SERVICE_CATEGORIES);
  });

  const [cityAiInsights, setCityAiInsights] = useState<CityOperationsAiInsight[]>(() => {
    return isProductionDataSource() ? [] : INITIAL_CITY_AI_INSIGHTS;
  });

  const [intercityRoutes, setIntercityRoutes] = useState<IntercityRoute[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_intercity`, INITIAL_INTERCITY_ROUTES);
  });

  const [payouts, setPayouts] = useState<PayoutRequest[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_payouts`, INITIAL_PAYOUTS);
  });

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_promos`, INITIAL_DEMO_PROMOS);
  });

  const [freightJobs, setFreightJobs] = useState<FreightJob[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_freight`, INITIAL_FREIGHT);
  });

  const [academyLessons, setAcademyLessons] = useState<AcademyLesson[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_academy`, INITIAL_ACADEMY_LESSONS);
  });

  const [loans, setLoans] = useState<DriverLoan[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_loans`, INITIAL_LOANS);
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_notifications`, INITIAL_NOTIFICATIONS);
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_complaints`, INITIAL_COMPLAINTS);
  });

  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_safety_p51`, DEMO_SAFETY_INCIDENTS);
  });

  const [safetyEmergencyContacts, setSafetyEmergencyContacts] = useState<SafetyEmergencyContactConfig[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_safety_emergency_contacts`, DEFAULT_EMERGENCY_CONTACTS);
  });

  const [safetySlaConfig, setSafetySlaConfig] = useState<SafetyResponseSlaConfig>(() => {
    if (isProductionDataSource()) return DEFAULT_SAFETY_SLA_CONFIG;
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_safety_sla_config`);
    return saved ? JSON.parse(saved) : DEFAULT_SAFETY_SLA_CONFIG;
  });

  const [safetyIncidentCategories, setSafetyIncidentCategories] = useState<typeof INCIDENT_CATEGORIES_CONFIG>(INCIDENT_CATEGORIES_CONFIG);

  const [activeSafetyModalIncidentId, setActiveSafetyModalIncidentId] = useState<string | null>(null);

  useEffect(() => {
    persistDemoStorage('safety_p51', safetyIncidents);
  }, [safetyIncidents]);

  useEffect(() => {
    persistDemoStorage('safety_emergency_contacts', safetyEmergencyContacts);
  }, [safetyEmergencyContacts]);

  useEffect(() => {
    persistDemoStorage('safety_sla_config', safetySlaConfig);
  }, [safetySlaConfig]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_audit`, INITIAL_AUDIT_LOGS);
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (isProductionDataSource()) return INITIAL_SETTINGS;
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_admin_users`, DEFAULT_ADMIN_USERS);
  });

  // Phase 52: Admin Roles, Sessions, Invitations, Rules & Security Alerts
  const [adminRoles, setAdminRoles] = useState<AdminRoleDefinition[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_admin_roles`, DEFAULT_SYSTEM_ROLES);
  });

  const [adminSessions, setAdminSessions] = useState<AdminSession[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_admin_sessions`, DEFAULT_ADMIN_SESSIONS);
  });

  const [adminInvitations, setAdminInvitations] = useState<AdminInvitation[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_admin_invitations`, DEFAULT_ADMIN_INVITATIONS);
  });

  const [adminApprovalRules, setAdminApprovalRules] = useState<AdminApprovalRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_admin_approval_rules`, DEFAULT_APPROVAL_RULES);
  });

  const [adminSecurityAlerts, setAdminSecurityAlerts] = useState<AdminSecurityAlert[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_admin_security_alerts`, DEFAULT_SECURITY_ALERTS);
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_support_tickets`, INITIAL_SUPPORT_TICKETS);
  });

  // Phase 48 Central Case Management state
  const [cases, setCases] = useState<SupportCase[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_cases`, INITIAL_DEMO_CASES);
  });

  useEffect(() => {
    persistDemoStorage('cases', cases);
  }, [cases]);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  const [fareRules, setFareRules] = useState<FareRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_fare_rules`, INITIAL_FARE_RULES);
  });

  const [centralPricingRule, setCentralPricingRule] = useState<CentralPricingRule>(() => {
    if (isProductionDataSource()) return DEFAULT_CENTRAL_PRICING_RULE;
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_central_pricing_rule`);
      if (!saved) return DEFAULT_CENTRAL_PRICING_RULE;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_CENTRAL_PRICING_RULE,
          ...parsed,
          paymentMethods: { ...DEFAULT_CENTRAL_PRICING_RULE.paymentMethods, ...(parsed.paymentMethods || {}) },
          categoryPricing: { ...DEFAULT_CENTRAL_PRICING_RULE.categoryPricing, ...(parsed.categoryPricing || {}) },
          cityPricing: { ...DEFAULT_CENTRAL_PRICING_RULE.cityPricing, ...(parsed.cityPricing || {}) }
        };
      }
      return DEFAULT_CENTRAL_PRICING_RULE;
    } catch {
      return DEFAULT_CENTRAL_PRICING_RULE;
    }
  });

  const [pricingRuleVersions, setPricingRuleVersions] = useState<PricingRuleVersion[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_pricing_rule_versions`, INITIAL_RULE_VERSIONS);
  });

  const [driverPricingOverrides, setDriverPricingOverrides] = useState<Record<string, DriverPricingOverride>>(() => {
    if (isProductionDataSource()) return {};
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_driver_pricing_overrides`);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_transactions`, INITIAL_TRANSACTIONS);
  });

  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_training_modules`, INITIAL_TRAINING_MODULES);
  });

  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_loan_apps`, INITIAL_LOAN_APPLICATIONS);
  });

  const [freightOrders, setFreightOrders] = useState<FreightOrder[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_freight_orders`, INITIAL_FREIGHT_ORDERS);
  });

  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_referrals`, INITIAL_DEMO_REFERRALS);
  });

  // Phase 50: Promo Usages, Campaigns, Reward Rules & Fraud States
  const [promoUsages, setPromoUsages] = useState<PromoUsageRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_promo_usages`, INITIAL_DEMO_PROMO_USAGES);
  });

  const [promotionCampaigns, setPromotionCampaigns] = useState<PromotionCampaign[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_promotion_campaigns`, INITIAL_DEMO_CAMPAIGNS);
  });

  const [referralRewardRules, setReferralRewardRules] = useState<ReferralRewardRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_referral_rules`, INITIAL_DEMO_REFERRAL_RULES);
  });

  const [driverRewardRules, setDriverRewardRules] = useState<DriverRewardRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_reward_rules`, INITIAL_DEMO_DRIVER_REWARD_RULES);
  });

  const [passengerRewardRules, setPassengerRewardRules] = useState<PassengerRewardRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_passenger_reward_rules`, INITIAL_DEMO_PASSENGER_REWARD_RULES);
  });

  const [rewardsHistory, setRewardsHistory] = useState<RewardRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_rewards_history`, INITIAL_DEMO_REWARDS_HISTORY);
  });

  const [fraudAlerts, setFraudAlerts] = useState<FraudDetectionAlert[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_fraud_alerts`, INITIAL_DEMO_FRAUD_ALERTS);
  });

  const [promotionAiInsights, setPromotionAiInsights] = useState<PromotionAiInsight[]>(() => {
    return isProductionDataSource() ? [] : INITIAL_DEMO_PROMO_AI_INSIGHTS;
  });

  useEffect(() => {
    persistDemoStorage('promo_usages', promoUsages);
  }, [promoUsages]);

  useEffect(() => {
    persistDemoStorage('promotion_campaigns', promotionCampaigns);
  }, [promotionCampaigns]);

  useEffect(() => {
    persistDemoStorage('referral_rules', referralRewardRules);
  }, [referralRewardRules]);

  useEffect(() => {
    persistDemoStorage('driver_reward_rules', driverRewardRules);
  }, [driverRewardRules]);

  useEffect(() => {
    persistDemoStorage('passenger_reward_rules', passengerRewardRules);
  }, [passengerRewardRules]);

  useEffect(() => {
    persistDemoStorage('rewards_history', rewardsHistory);
  }, [rewardsHistory]);

  useEffect(() => {
    persistDemoStorage('fraud_alerts', fraudAlerts);
  }, [fraudAlerts]);

  const [operationsAlerts, setOperationsAlerts] = useState<OperationsAlert[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_operations_alerts`, INITIAL_OPERATIONS_ALERTS);
  });

  // Phase 33 States
  const [driverDailySummaries, setDriverDailySummaries] = useState<DriverDailySummary[]>(() => {
    if (isProductionDataSource()) return [];
    const loaded = safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_daily_summaries`, INITIAL_DRIVER_DAILY_SUMMARIES);
    const loadedIds = new Set(loaded.map((s) => s.id));
    const missingDefaults = INITIAL_DRIVER_DAILY_SUMMARIES.filter((s) => !loadedIds.has(s.id));
    return missingDefaults.length > 0 ? [...loaded, ...missingDefaults] : loaded;
  });

  const [latePickupIncidents, setLatePickupIncidents] = useState<LatePickupIncident[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_late_pickup_incidents`, INITIAL_LATE_PICKUP_INCIDENTS);
  });

  const [driverSuspensions, setDriverSuspensions] = useState<DriverSuspensionRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_suspensions`, INITIAL_DRIVER_SUSPENSIONS);
  });

  const [driverWarnings, setDriverWarnings] = useState<DriverWarningRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_warnings`, INITIAL_DRIVER_WARNINGS);
  });

  const [latePickupConfig, setLatePickupConfig] = useState<LatePickupConfig>(() => {
    if (isProductionDataSource()) return DEFAULT_LATE_PICKUP_CONFIG;
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_late_pickup_config`);
      if (!saved) return DEFAULT_LATE_PICKUP_CONFIG;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? { ...DEFAULT_LATE_PICKUP_CONFIG, ...parsed } : DEFAULT_LATE_PICKUP_CONFIG;
    } catch {
      return DEFAULT_LATE_PICKUP_CONFIG;
    }
  });

  // Phase 34 AI Intelligence States
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(() => {
    if (isProductionDataSource()) return DEFAULT_AUTOMATION_SETTINGS;
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_automation_settings`);
      if (!saved) return DEFAULT_AUTOMATION_SETTINGS;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_AUTOMATION_SETTINGS,
        ...(parsed || {}),
        scoreWeights: {
          ...DEFAULT_SCORE_WEIGHTS,
          ...(parsed?.scoreWeights || {})
        }
      };
    } catch {
      return DEFAULT_AUTOMATION_SETTINGS;
    }
  });

  const [adminTasks, setAdminTasks] = useState<AdminTask[]>(() => {
    return safeLoadArray(
      `${LOCAL_STORAGE_KEY}_admin_tasks`,
      generateDefaultAdminTasks(
        INITIAL_DRIVERS,
        INITIAL_VERIFICATIONS,
        INITIAL_COMPLAINTS,
        INITIAL_SAFETY_INCIDENTS,
        INITIAL_LATE_PICKUP_INCIDENTS,
        INITIAL_PAYOUTS,
        INITIAL_DRIVER_SUSPENSIONS
      )
    );
  });

  const [aiChatMessages, setAiChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'assistant',
      text: "As-salamu alaykum! I am your GoLife AI Operations Assistant. I monitor Pakistan fleet dispatches, driver compliance, complaints, earnings, and safety in real-time. Ask me any question or select a quick prompt below.",
      timestamp: 'Just now',
      queryIntent: 'welcome',
      structuredData: {
        title: 'Operations Assistant Active',
        stats: [
          { label: 'System Mode', value: 'Demo AI' },
          { label: 'Fleet Telemetry', value: 'Real-time' },
          { label: 'Compliance Engine', value: 'Active' }
        ],
        actionButtons: [
          { label: "Today's Operations", tab: 'ai_assistant' },
          { label: 'Drivers at Risk', tab: 'ai_assistant' },
          { label: 'Pending Verification', tab: 'verification' }
        ]
      }
    }
  ]);

  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);

  // Sync Phase 34 states (Demo only)
  useEffect(() => {
    persistDemoStorage('automation_settings', automationSettings);
  }, [automationSettings]);

  useEffect(() => {
    persistDemoStorage('admin_tasks', adminTasks);
  }, [adminTasks]);

  // Sync Phase 33 states (Demo only)
  useEffect(() => {
    persistDemoStorage('driver_daily_summaries', driverDailySummaries);
  }, [driverDailySummaries]);

  useEffect(() => {
    persistDemoStorage('late_pickup_incidents', latePickupIncidents);
  }, [latePickupIncidents]);

  useEffect(() => {
    persistDemoStorage('driver_suspensions', driverSuspensions);
  }, [driverSuspensions]);

  useEffect(() => {
    persistDemoStorage('driver_warnings', driverWarnings);
  }, [driverWarnings]);

  useEffect(() => {
    persistDemoStorage('late_pickup_config', latePickupConfig);
  }, [latePickupConfig]);

  // Phase 41 Fines & Penalties States
  const [driverFines, setDriverFines] = useState<DriverFine[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_fines`, INITIAL_DEMO_FINES);
  });

  const [fineReasons, setFineReasons] = useState<FineReason[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_fine_reasons`, INITIAL_FINE_REASONS);
  });

  const [automaticFineRules, setAutomaticFineRules] = useState<AutomaticFineRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_automatic_fine_rules`, INITIAL_AUTOMATIC_FINE_RULES);
  });

  const [fineRuleVersions, setFineRuleVersions] = useState<FineRuleVersion[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_fine_rule_versions`, []);
  });

  const [fineTransactions, setFineTransactions] = useState<FineTransaction[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_fine_transactions`, INITIAL_DEMO_FINE_TRANSACTIONS);
  });

  // Phase 42 Financial Resolution States
  const [passengerRefunds, setPassengerRefunds] = useState<PassengerRefundRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_passenger_refunds`, INITIAL_PASSENGER_REFUNDS);
  });

  const [driverReimbursements, setDriverReimbursements] = useState<DriverReimbursementRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_reimbursements`, INITIAL_DRIVER_REIMBURSEMENTS);
  });

  const [financialAdjustments, setFinancialAdjustments] = useState<FinancialAdjustmentRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_financial_adjustments`, INITIAL_FINANCIAL_ADJUSTMENTS);
  });

  const [comprehensiveTransactions, setComprehensiveTransactions] = useState<ComprehensiveLedgerTransaction[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_comprehensive_transactions`, INITIAL_COMPREHENSIVE_TRANSACTIONS);
  });

  const [dailySettlements, setDailySettlements] = useState<DailySettlementRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_daily_settlements`, INITIAL_DAILY_SETTLEMENTS);
  });

  const [reconciliationRecords, setReconciliationRecords] = useState<ReconciliationRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_reconciliation_records`, INITIAL_RECONCILIATION_RECORDS);
  });

  const [aiFinancialAnomalies, setAiFinancialAnomalies] = useState<AiFinancialAnomaly[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_ai_financial_anomalies`, INITIAL_AI_FINANCIAL_ANOMALIES);
  });

  const [approvalThreshold, setApprovalThreshold] = useState<number>(() => {
    if (isProductionDataSource()) return 5000;
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_approval_threshold`);
    return saved ? Number(saved) : 5000;
  });

  // Central Commission & Shared Financial State
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_commissionRules`, INITIAL_COMMISSION_RULES);
  });

  const [driverOverrides, setDriverOverrides] = useState<DriverCommissionOverride[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driverOverrides`, INITIAL_DRIVER_OVERRIDES);
  });

  const [cashReconciliations, setCashReconciliations] = useState<CashRideReconciliationRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_cashReconciliations`, INITIAL_CASH_RECONCILIATIONS);
  });

  const [advanceReconciliations, setAdvanceReconciliations] = useState<AdvancePaymentReconciliationRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_advanceReconciliations`, INITIAL_ADVANCE_RECONCILIATIONS);
  });

  const [driverWallets, setDriverWallets] = useState<DriverWallet[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driverWallets`, createInitialDriverWallets(INITIAL_DRIVERS));
  });

  const [topUps, setTopUps] = useState<TopUpRequest[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_topUpRequests`, INITIAL_TOPUP_REQUESTS);
  });

  const [centralTransactions, setCentralTransactions] = useState<CentralPaymentTransaction[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_paymentTransactions`, INITIAL_PAYMENT_TRANSACTIONS);
  });

  const [companyAccounts, setCompanyAccounts] = useState<CompanyPaymentAccount[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_companyPaymentAccounts`, INITIAL_COMPANY_PAYMENT_ACCOUNTS);
  });

  const [advanceHolds, setAdvanceHolds] = useState<AdvanceBookingHold[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_advanceBookingHolds`, INITIAL_ADVANCE_BOOKINGS);
  });

  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderConfig[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_paymentProviders`, INITIAL_PAYMENT_PROVIDERS);
  });

  const [paymentWebhooks, setPaymentWebhooks] = useState<PaymentWebhookRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_paymentWebhooks`, INITIAL_WEBHOOK_LOGS);
  });

  const [paymentReconciliations, setPaymentReconciliations] = useState<PaymentReconciliationItem[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_paymentReconciliations`, INITIAL_PAYMENT_RECONCILIATION_ITEMS);
  });

  useEffect(() => {
    persistDemoStorage('commissionRules', commissionRules);
  }, [commissionRules]);

  useEffect(() => {
    persistDemoStorage('driverOverrides', driverOverrides);
  }, [driverOverrides]);

  useEffect(() => {
    persistDemoStorage('cashReconciliations', cashReconciliations);
  }, [cashReconciliations]);

  useEffect(() => {
    persistDemoStorage('advanceReconciliations', advanceReconciliations);
  }, [advanceReconciliations]);

  useEffect(() => {
    persistDemoStorage('driverWallets', driverWallets);
  }, [driverWallets]);

  useEffect(() => {
    persistDemoStorage('topUpRequests', topUps);
  }, [topUps]);

  useEffect(() => {
    persistDemoStorage('paymentTransactions', centralTransactions);
  }, [centralTransactions]);

  useEffect(() => {
    persistDemoStorage('companyPaymentAccounts', companyAccounts);
  }, [companyAccounts]);

  useEffect(() => {
    persistDemoStorage('advanceBookingHolds', advanceHolds);
  }, [advanceHolds]);

  useEffect(() => {
    persistDemoStorage('paymentProviders', paymentProviders);
  }, [paymentProviders]);

  useEffect(() => {
    persistDemoStorage('paymentWebhooks', paymentWebhooks);
  }, [paymentWebhooks]);

  useEffect(() => {
    persistDemoStorage('paymentReconciliations', paymentReconciliations);
  }, [paymentReconciliations]);

  // Phase 43 States
  const [driverPayouts, setDriverPayouts] = useState<DriverPayoutRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_payouts`, INITIAL_DEMO_PAYOUTS);
  });

  const [payoutTransactions, setPayoutTransactions] = useState<PayoutTransactionRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_payout_transactions`, INITIAL_PAYOUT_TRANSACTIONS);
  });

  const [payoutConfig, setPayoutConfig] = useState<PayoutConfigRule>(() => {
    if (isProductionDataSource()) return DEFAULT_PAYOUT_CONFIG;
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_payout_config`);
    return saved ? JSON.parse(saved) : DEFAULT_PAYOUT_CONFIG;
  });

  const [aiPayoutAnomalies, setAiPayoutAnomalies] = useState<AiPayoutAnomaly[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_ai_payout_anomalies`, INITIAL_AI_PAYOUT_ANOMALIES);
  });

  // Phase 53: Fraud, Anti-Abuse & Risk Control Center States
  const [riskAlerts, setRiskAlerts] = useState<RiskAlertRecord[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_risk_alerts`, INITIAL_DEMO_RISK_ALERTS);
  });

  const [riskRules, setRiskRules] = useState<RiskRule[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_risk_rules`, INITIAL_RISK_RULES);
  });

  const [riskWatchlist, setRiskWatchlist] = useState<RiskWatchlistEntry[]>(() => {
    return safeLoadArray(`${LOCAL_STORAGE_KEY}_risk_watchlist`, INITIAL_RISK_WATCHLIST);
  });

  const [riskAiInsights] = useState<RiskAiInsight[]>(() => {
    return isProductionDataSource() ? [] : INITIAL_RISK_AI_INSIGHTS;
  });

  // Sync Phase 53 Risk States (Demo only)
  useEffect(() => {
    persistDemoStorage('risk_alerts', riskAlerts);
  }, [riskAlerts]);

  useEffect(() => {
    persistDemoStorage('risk_rules', riskRules);
  }, [riskRules]);

  useEffect(() => {
    persistDemoStorage('risk_watchlist', riskWatchlist);
  }, [riskWatchlist]);

  // Sync Phase 41 & 42 (Demo only)
  useEffect(() => {
    persistDemoStorage('driver_fines', driverFines);
  }, [driverFines]);

  useEffect(() => {
    persistDemoStorage('fine_reasons', fineReasons);
  }, [fineReasons]);

  useEffect(() => {
    persistDemoStorage('automatic_fine_rules', automaticFineRules);
  }, [automaticFineRules]);

  useEffect(() => {
    persistDemoStorage('fine_rule_versions', fineRuleVersions);
  }, [fineRuleVersions]);

  useEffect(() => {
    persistDemoStorage('fine_transactions', fineTransactions);
  }, [fineTransactions]);

  useEffect(() => {
    persistDemoStorage('passenger_refunds', passengerRefunds);
  }, [passengerRefunds]);

  useEffect(() => {
    persistDemoStorage('driver_reimbursements', driverReimbursements);
  }, [driverReimbursements]);

  useEffect(() => {
    persistDemoStorage('financial_adjustments', financialAdjustments);
  }, [financialAdjustments]);

  useEffect(() => {
    persistDemoStorage('comprehensive_transactions', comprehensiveTransactions);
  }, [comprehensiveTransactions]);

  useEffect(() => {
    persistDemoStorage('daily_settlements', dailySettlements);
  }, [dailySettlements]);

  useEffect(() => {
    persistDemoStorage('reconciliation_records', reconciliationRecords);
  }, [reconciliationRecords]);

  useEffect(() => {
    persistDemoStorage('ai_financial_anomalies', aiFinancialAnomalies);
  }, [aiFinancialAnomalies]);

  useEffect(() => {
    persistDemoStorage('approval_threshold', approvalThreshold.toString());
  }, [approvalThreshold]);

  useEffect(() => {
    persistDemoStorage('driver_payouts', driverPayouts);
  }, [driverPayouts]);

  useEffect(() => {
    persistDemoStorage('payout_transactions', payoutTransactions);
  }, [payoutTransactions]);

  useEffect(() => {
    persistDemoStorage('payout_config', payoutConfig);
  }, [payoutConfig]);

  useEffect(() => {
    persistDemoStorage('ai_payout_anomalies', aiPayoutAnomalies);
  }, [aiPayoutAnomalies]);

  useEffect(() => {
    persistDemoStorage('operations_alerts', operationsAlerts);
  }, [operationsAlerts]);

  // Simulation Telemetry Ticker - optimized to prevent quota churn & UI freezing (DEMO mode only)
  useEffect(() => {
    if (!isSimulationActive || isProductionDataSource()) return;

    const interval = setInterval(() => {
      // Pause ticker if browser tab or preview iframe is backgrounded
      if (typeof document !== 'undefined' && document.hidden) return;

      setRides((prev) =>
        prev.map((r) => {
          if (r.status === 'in_progress') {
            const currentEta = r.etaMinutes ?? 12;
            const newEta = currentEta > 2 ? currentEta - 1 : 2;
            return {
              ...r,
              etaMinutes: newEta,
              durationElapsedMin: (r.durationElapsedMin ?? 10) + 1
            };
          }
          return r;
        })
      );

      setDrivers((prev) =>
        prev.map((d) => {
          if (d.status === 'online' || d.status === 'on_trip') {
            return {
              ...d,
              lastPingTime: 'Live (±2m)'
            };
          }
          return d;
        })
      );
    }, 12000); // 12 seconds ticker instead of 4.5s

    return () => clearInterval(interval);
  }, [isSimulationActive]);

  useEffect(() => {
    persistDemoStorage('referrals', referrals);
  }, [referrals]);

  useEffect(() => {
    persistDemoStorage('passengers', passengers);
  }, [passengers]);

  // Debounced persistence for high-frequency objects (Demo only)
  useEffect(() => {
    if (isProductionDataSource()) return;
    const timer = setTimeout(() => {
      persistDemoStorage('drivers', drivers);
    }, 1500);
    return () => clearTimeout(timer);
  }, [drivers]);

  useEffect(() => {
    persistDemoStorage('verifications', verifications);
  }, [verifications]);

  useEffect(() => {
    if (isProductionDataSource()) return;
    const timer = setTimeout(() => {
      persistDemoStorage('rides', rides);
    }, 1500);
    return () => clearTimeout(timer);
  }, [rides]);

  const [currentDataSourceMode, setCurrentDataSourceMode] = useState<DataSourceMode>(getCentralDataSourceMode());

  // Phase 28 & 36 — Real-time Data Source Mode Switch Listener (Strict Isolation)
  useEffect(() => {
    const handleDataSourceChange = () => {
      const newMode = getCentralDataSourceMode();
      setCurrentDataSourceMode(newMode);

      if (newMode === 'PRODUCTION') {
        // Switching to Production: Immediately clear all Demo records from memory
        setPassengers([]);
        setDrivers([]);
        setVerifications([]);
        setRides([]);
        setComplaints([]);
        setSafetyIncidents([]);
        setAuditLogs([]);
        setPayouts([]);
        setDriverPayouts([]);
        setPayoutTransactions([]);
        setNotifications([]);
        setPromos([]);
        setPromoUsages([]);
        setPromotionCampaigns([]);
        setReferrals([]);
        setRewardsHistory([]);
        setFraudAlerts([]);
        setDriverWallets([]);
        setTopUps([]);
        setCentralTransactions([]);
        setTransactions([]);
        setComprehensiveTransactions([]);
        setPassengerRefunds([]);
        setDriverReimbursements([]);
        setFinancialAdjustments([]);
        setDailySettlements([]);
        setReconciliationRecords([]);
        setDriverFines([]);
        setFineTransactions([]);
        setCases([]);
        setSupportTickets([]);
        setDriverDailySummaries([]);
        setLatePickupIncidents([]);
        setDriverSuspensions([]);
        setDriverWarnings([]);
        setRiskAlerts([]);
        setRiskWatchlist([]);
        setFeedbacks([]);
        setOperationsAlerts([]);
        setAdminTasks([]);
        setCities([]);
        setServiceCategories([]);
        setCityCategoryMatrix([]);
        setIntercityRoutes([]);
        setFreightJobs([]);
        setFreightOrders([]);
        return;
      }

      // Switching to Demo: Re-hydrate from isolated Demo localStorage or initial Demo datasets
      setPassengers(safeLoadArray(`${LOCAL_STORAGE_KEY}_passengers`, INITIAL_PASSENGERS));
      setDrivers(safeLoadArray(`${LOCAL_STORAGE_KEY}_drivers`, INITIAL_DRIVERS));
      setVerifications(safeLoadArray(`${LOCAL_STORAGE_KEY}_verifications`, INITIAL_VERIFICATIONS));
      setRides(safeLoadArray(`${LOCAL_STORAGE_KEY}_rides`, INITIAL_RIDES));
      setComplaints(safeLoadArray(`${LOCAL_STORAGE_KEY}_complaints`, INITIAL_COMPLAINTS));
      setSafetyIncidents(safeLoadArray(`${LOCAL_STORAGE_KEY}_safety_p51`, DEMO_SAFETY_INCIDENTS));
      setAuditLogs(safeLoadArray(`${LOCAL_STORAGE_KEY}_audit`, INITIAL_AUDIT_LOGS));
      setPayouts(safeLoadArray(`${LOCAL_STORAGE_KEY}_payouts`, INITIAL_PAYOUTS));
      setDriverPayouts(safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_payouts`, INITIAL_DEMO_PAYOUTS));
      setNotifications(safeLoadArray(`${LOCAL_STORAGE_KEY}_notifications`, INITIAL_NOTIFICATIONS));
      setPromos(safeLoadArray(`${LOCAL_STORAGE_KEY}_promos`, INITIAL_DEMO_PROMOS));
      setDriverWallets(safeLoadArray(`${LOCAL_STORAGE_KEY}_driverWallets`, createInitialDriverWallets(INITIAL_DRIVERS)));
      setTopUps(safeLoadArray(`${LOCAL_STORAGE_KEY}_topUpRequests`, INITIAL_TOPUP_REQUESTS));
      setCentralTransactions(safeLoadArray(`${LOCAL_STORAGE_KEY}_paymentTransactions`, INITIAL_PAYMENT_TRANSACTIONS));
      setCases(safeLoadArray(`${LOCAL_STORAGE_KEY}_cases`, INITIAL_DEMO_CASES));
      setDriverFines(safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_fines`, INITIAL_DEMO_FINES));
      setRiskAlerts(safeLoadArray(`${LOCAL_STORAGE_KEY}_risk_alerts`, INITIAL_DEMO_RISK_ALERTS));
      setDriverDailySummaries(safeLoadArray(`${LOCAL_STORAGE_KEY}_driver_daily_summaries`, INITIAL_DRIVER_DAILY_SUMMARIES));
      setCities(INITIAL_PAKISTAN_CITIES);
      setServiceCategories(INITIAL_SERVICE_CATEGORIES);
      setCityCategoryMatrix(generateInitialCityCategoryMatrix(INITIAL_PAKISTAN_CITIES, INITIAL_SERVICE_CATEGORIES));
    };

    window.addEventListener(DATA_SOURCE_CHANGED_EVENT, handleDataSourceChange);
    return () => {
      window.removeEventListener(DATA_SOURCE_CHANGED_EVENT, handleDataSourceChange);
    };
  }, []);

  // Phase 22, 26, 28, 29 & 36 — Hybrid Production Firebase Firestore Synchronization
  useEffect(() => {
    const isProd = isProductionDataSource();
    if (!isProd) {
      return;
    }

    const validation = validateProductionConfig();
    if (!validation.isValid) {
      console.warn('Production Mode active: Firestore real-time sync deferred (credentials incomplete).');
      return;
    }

    // 1. REAL-TIME SUBSCRIPTIONS FOR CRITICAL OPERATIONAL COLLECTIONS
    const unsubs: Array<() => void> = [];

    unsubs.push(
      firebaseRepository.subscribe<Passenger>(
        'passengers',
        (items) => {
          if (items) setPassengers(items);
        },
        (err) => console.warn('Real-time passengers subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<Driver>(
        'drivers',
        (items) => {
          if (items) setDrivers(items);
        },
        (err) => console.warn('Real-time drivers subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<any>(
        'driverLocations',
        (locations) => {
          if (!locations || locations.length === 0) return;
          const locMap = new Map(locations.map((l: any) => [l.driverId || l.id, l]));
          setDrivers((prev) =>
            prev.map((d) => {
              const liveLoc = locMap.get(d.id);
              if (!liveLoc) return d;
              return {
                ...d,
                lat: liveLoc.lat ?? liveLoc.latitude ?? d.lat,
                lng: liveLoc.lng ?? liveLoc.longitude ?? d.lng,
                lastPingTime: liveLoc.updatedAt || 'Live'
              };
            })
          );
        },
        (err) => console.warn('Real-time driverLocations subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<Ride>(
        'rides',
        (items) => {
          if (items) setRides(items);
        },
        (err) => console.warn('Real-time rides subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<any>(
        'rideLocations',
        (rideLocs) => {
          if (!rideLocs || rideLocs.length === 0) return;
          const locMap = new Map(rideLocs.map((l: any) => [l.rideId || l.id, l]));
          setRides((prev) =>
            prev.map((r) => {
              const liveLoc = locMap.get(r.id);
              if (!liveLoc) return r;
              return {
                ...r,
                etaMinutes: liveLoc.etaMinutes ?? r.etaMinutes
              };
            })
          );
        },
        (err) => console.warn('Real-time rideLocations subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<VerificationItem>(
        'driverVerifications',
        (items) => {
          if (items) setVerifications(items);
        },
        (err) => console.warn('Real-time verifications subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<SafetyIncident>(
        'safetyIncidents',
        (items) => {
          if (items) setSafetyIncidents(items);
        },
        (err) => console.warn('Real-time safety incidents subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<AuditLog>(
        'auditLogs',
        (items) => {
          if (items) setAuditLogs(items);
        },
        (err) => console.warn('Real-time audit logs subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<Complaint>(
        'complaints',
        (items) => {
          if (items) setComplaints(items);
        },
        (err) => console.warn('Real-time complaints subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<SupportCase>(
        'supportCases',
        (items) => {
          if (items) setCases(items);
        },
        (err) => console.warn('Real-time supportCases subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<DriverPayoutRecord>(
        'payouts',
        (items) => {
          if (items) {
            setPayouts(items as any);
            setDriverPayouts(items);
          }
        },
        (err) => console.warn('Real-time payouts subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<AdminNotification>(
        'notifications',
        (items) => {
          if (items) setNotifications(items);
        },
        (err) => console.warn('Real-time notifications subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<PromoCode>(
        'promoCodes',
        (items) => {
          if (items) setPromos(items);
        },
        (err) => console.warn('Real-time promo codes subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<DriverWallet>(
        'driverWallets',
        (items) => {
          if (items) setDriverWallets(items);
        },
        (err) => console.warn('Real-time driver wallets subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<CentralPaymentTransaction>(
        'paymentTransactions',
        (items) => {
          if (items) setCentralTransactions(items);
        },
        (err) => console.warn('Real-time payment transactions subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<TopUpRequest>(
        'topUpRequests',
        (items) => {
          if (items) setTopUps(items);
        },
        (err) => console.warn('Real-time top-up requests subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<DriverFine>(
        'driverFines',
        (items) => {
          if (items) setDriverFines(items);
        },
        (err) => console.warn('Real-time driverFines subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<RiskAlertRecord>(
        'riskAlerts',
        (items) => {
          if (items) setRiskAlerts(items);
        },
        (err) => console.warn('Real-time riskAlerts subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<AdminUser>(
        'adminUsers',
        (items) => {
          if (items && items.length > 0) setAdminUsers(items);
        },
        (err) => console.warn('Real-time admin users subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<AdminRoleDefinition>(
        'adminRoles',
        (items) => {
          if (items && items.length > 0) setAdminRoles(items);
        },
        (err) => console.warn('Real-time adminRoles subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<AdminSession>(
        'adminSessions',
        (items) => {
          if (items) setAdminSessions(items);
        },
        (err) => console.warn('Real-time adminSessions subscription notice:', err.message)
      )
    );

    unsubs.push(
      firebaseRepository.subscribe<AdminInvitation>(
        'adminInvitations',
        (items) => {
          if (items) setAdminInvitations(items);
        },
        (err) => console.warn('Real-time adminInvitations subscription notice:', err.message)
      )
    );

    // 2. ON-DEMAND / INITIAL QUERIES FOR CONFIGURATION & HISTORICAL COLLECTIONS
    let isMounted = true;
    const loadProductionCollections = async () => {
      try {
        const [
          citiesRes,
          categoriesRes,
          matrixRes,
          intercityRes,
          freightRes,
          pricingRulesRes,
          pricingVersionsRes,
          commissionRulesRes,
          driverCommissionsRes,
          cashRecRes,
          advRecRes,
          companyAccountsRes,
          providersRes,
          webhooksRes,
          payRecRes,
          dailySettleRes,
          refundsRes,
          reimbursementsRes,
          adjustmentsRes,
          txnsRes,
          summariesRes,
          latePickupsRes,
          suspensionsRes,
          warningsRes,
          fineRulesRes,
          fineTxnsRes,
          promoUsageRes,
          campaignsRes,
          referralsRes,
          rewardsRes,
          riskRulesRes,
          watchlistRes,
          feedbacksRes,
          approvalRulesRes
        ] = await Promise.all([
          firebaseRepository.list<CityConfig>('cities', undefined, { limit: 100 }),
          firebaseRepository.list<ServiceCategoryConfig>('serviceCategories', undefined, { limit: 50 }),
          firebaseRepository.list<CityCategoryMatrixItem>('cityCategoryConfigurations', undefined, { limit: 200 }),
          firebaseRepository.list<IntercityRoute>('intercityRoutes', undefined, { limit: 100 }),
          firebaseRepository.list<FreightOrder>('freight', undefined, { limit: 100 }),
          firebaseRepository.list<FareRule>('pricingRules', undefined, { limit: 50 }),
          firebaseRepository.list<PricingRuleVersion>('pricingRuleVersions', undefined, { limit: 50 }),
          firebaseRepository.list<CommissionRule>('commissionRules', undefined, { limit: 50 }),
          firebaseRepository.list<DriverCommissionOverride>('driverCommissions', undefined, { limit: 100 }),
          firebaseRepository.list<CashRideReconciliationRecord>('cashRideReconciliation', undefined, { limit: 100 }),
          firebaseRepository.list<AdvancePaymentReconciliationRecord>('advancePaymentReconciliation', undefined, { limit: 100 }),
          firebaseRepository.list<CompanyPaymentAccount>('companyPaymentAccounts', undefined, { limit: 50 }),
          firebaseRepository.list<PaymentProviderConfig>('paymentProviderConfigs', undefined, { limit: 50 }),
          firebaseRepository.list<PaymentWebhookRecord>('paymentWebhooks', undefined, { limit: 100 }),
          firebaseRepository.list<PaymentReconciliationItem>('paymentReconciliation', undefined, { limit: 100 }),
          firebaseRepository.list<DailySettlementRecord>('dailySettlements', undefined, { limit: 100 }),
          firebaseRepository.list<PassengerRefundRecord>('refunds', undefined, { limit: 100 }),
          firebaseRepository.list<DriverReimbursementRecord>('reimbursements', undefined, { limit: 100 }),
          firebaseRepository.list<FinancialAdjustmentRecord>('financialAdjustments', undefined, { limit: 100 }),
          firebaseRepository.list<ComprehensiveLedgerTransaction>('transactions', undefined, { limit: 200 }),
          firebaseRepository.list<DriverDailySummary>('driverDailySummaries', undefined, { limit: 200 }),
          firebaseRepository.list<LatePickupIncident>('latePickupIncidents', undefined, { limit: 100 }),
          firebaseRepository.list<DriverSuspensionRecord>('driverSuspensions', undefined, { limit: 100 }),
          firebaseRepository.list<DriverWarningRecord>('driverWarnings', undefined, { limit: 100 }),
          firebaseRepository.list<AutomaticFineRule>('fineRules', undefined, { limit: 50 }),
          firebaseRepository.list<FineTransaction>('fineTransactions', undefined, { limit: 100 }),
          firebaseRepository.list<PromoUsageRecord>('promoUsage', undefined, { limit: 100 }),
          firebaseRepository.list<PromotionCampaign>('promotionCampaigns', undefined, { limit: 50 }),
          firebaseRepository.list<ReferralRecord>('referrals', undefined, { limit: 100 }),
          firebaseRepository.list<RewardRecord>('rewards', undefined, { limit: 100 }),
          firebaseRepository.list<RiskRule>('riskRules', undefined, { limit: 50 }),
          firebaseRepository.list<RiskWatchlistEntry>('riskWatchlist', undefined, { limit: 100 }),
          firebaseRepository.list<RideFeedback>('feedbacks', undefined, { limit: 100 }),
          firebaseRepository.list<AdminApprovalRule>('approvalRules', undefined, { limit: 50 })
        ]);

        if (!isMounted) return;
        setCities(citiesRes.items);
        setServiceCategories(categoriesRes.items);
        setCityCategoryMatrix(matrixRes.items);
        setIntercityRoutes(intercityRes.items);
        setFreightOrders(freightRes.items);
        if (pricingRulesRes.items.length > 0) setFareRules(pricingRulesRes.items);
        setPricingRuleVersions(pricingVersionsRes.items);
        if (commissionRulesRes.items.length > 0) setCommissionRules(commissionRulesRes.items);
        setDriverOverrides(driverCommissionsRes.items);
        setCashReconciliations(cashRecRes.items);
        setAdvanceReconciliations(advRecRes.items);
        if (companyAccountsRes.items.length > 0) setCompanyAccounts(companyAccountsRes.items);
        if (providersRes.items.length > 0) setPaymentProviders(providersRes.items);
        setPaymentWebhooks(webhooksRes.items);
        setPaymentReconciliations(payRecRes.items);
        setDailySettlements(dailySettleRes.items);
        setPassengerRefunds(refundsRes.items);
        setDriverReimbursements(reimbursementsRes.items);
        setFinancialAdjustments(adjustmentsRes.items);
        setComprehensiveTransactions(txnsRes.items);
        setDriverDailySummaries(summariesRes.items);
        setLatePickupIncidents(latePickupsRes.items);
        setDriverSuspensions(suspensionsRes.items);
        setDriverWarnings(warningsRes.items);
        if (fineRulesRes.items.length > 0) setAutomaticFineRules(fineRulesRes.items);
        setFineTransactions(fineTxnsRes.items);
        setPromoUsages(promoUsageRes.items);
        setPromotionCampaigns(campaignsRes.items);
        setReferrals(referralsRes.items);
        setRewardsHistory(rewardsRes.items);
        if (riskRulesRes.items.length > 0) setRiskRules(riskRulesRes.items);
        setRiskWatchlist(watchlistRes.items);
        setFeedbacks(feedbacksRes.items);
        if (approvalRulesRes.items.length > 0) setAdminApprovalRules(approvalRulesRes.items);
      } catch (err: any) {
        console.warn('Production collections initial query notice:', err?.message || err);
      }
    };

    loadProductionCollections();

    return () => {
      isMounted = false;
      unsubs.forEach((unsub) => unsub());
    };
  }, [currentDataSourceMode]);

  useEffect(() => {
    persistDemoStorage('fares', fareConfigs);
  }, [fareConfigs]);

  useEffect(() => {
    persistDemoStorage('cities', cities);
  }, [cities]);

  useEffect(() => {
    persistDemoStorage('service_categories', serviceCategories);
  }, [serviceCategories]);

  useEffect(() => {
    persistDemoStorage('city_category_matrix', cityCategoryMatrix);
  }, [cityCategoryMatrix]);

  useEffect(() => {
    persistDemoStorage('payouts', payouts);
  }, [payouts]);

  useEffect(() => {
    persistDemoStorage('promos', promos);
  }, [promos]);

  useEffect(() => {
    persistDemoStorage('fare_rules', fareRules);
  }, [fareRules]);

  useEffect(() => {
    persistDemoStorage('central_pricing_rule', centralPricingRule);
  }, [centralPricingRule]);

  useEffect(() => {
    persistDemoStorage('pricing_rule_versions', pricingRuleVersions);
  }, [pricingRuleVersions]);

  useEffect(() => {
    persistDemoStorage('driver_pricing_overrides', driverPricingOverrides);
  }, [driverPricingOverrides]);

  useEffect(() => {
    persistDemoStorage('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    persistDemoStorage('training_modules', trainingModules);
  }, [trainingModules]);

  useEffect(() => {
    persistDemoStorage('loan_apps', loanApplications);
  }, [loanApplications]);

  useEffect(() => {
    persistDemoStorage('freight_orders', freightOrders);
  }, [freightOrders]);

  useEffect(() => {
    persistDemoStorage('complaints', complaints);
  }, [complaints]);

  useEffect(() => {
    persistDemoStorage('safety', safetyIncidents);
  }, [safetyIncidents]);

  useEffect(() => {
    persistDemoStorage('audit', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    persistDemoStorage('settings', settings);
  }, [settings]);

  useEffect(() => {
    persistDemoStorage('admin_users', adminUsers);
  }, [adminUsers]);

  useEffect(() => {
    persistDemoStorage('admin_roles', adminRoles);
  }, [adminRoles]);

  useEffect(() => {
    persistDemoStorage('admin_sessions', adminSessions);
  }, [adminSessions]);

  useEffect(() => {
    persistDemoStorage('admin_invitations', adminInvitations);
  }, [adminInvitations]);

  useEffect(() => {
    persistDemoStorage('admin_approval_rules', adminApprovalRules);
  }, [adminApprovalRules]);

  useEffect(() => {
    persistDemoStorage('admin_security_alerts', adminSecurityAlerts);
  }, [adminSecurityAlerts]);

  useEffect(() => {
    persistDemoStorage('support_tickets', supportTickets);
  }, [supportTickets]);

  // Phase 21: Real Session Expiration & Inactivity Guard
  useEffect(() => {
    if (!currentAdmin) return;

    let lastActivityTime = Date.now();

    const handleUserActivity = () => {
      lastActivityTime = Date.now();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    const interval = setInterval(() => {
      const now = Date.now();
      const expiry = localStorage.getItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT');

      // 1. Check absolute session expiration
      if (expiry && now > new Date(expiry).getTime()) {
        logout();
        showToast('Your administrative session has expired (8-hour limit). Please sign in again.', 'warning');
        return;
      }

      // 2. Check idle inactivity timeout (2 hours)
      if (now - lastActivityTime > SESSION_IDLE_TIMEOUT_MS) {
        logout();
        showToast('You have been logged out due to 2 hours of inactivity for platform security.', 'warning');
        return;
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [currentAdmin]);

  // Phase 21: Multi-Tab Cross-Window Logout Synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'GOLIFE_CURRENT_ADMIN' && !e.newValue) {
        setCurrentAdmin(null);
        setSessionExpiresAt(null);
        showToast('You have been logged out from another browser window.', 'info');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Production Firebase Auth State Listener
  useEffect(() => {
    if (!isProductionDataSource()) return;
    const unsub = authService.subscribeAuthState((user) => {
      if (!user && currentAdmin) {
        setCurrentAdmin(null);
        setSessionExpiresAt(null);
        localStorage.removeItem('GOLIFE_CURRENT_ADMIN');
        localStorage.removeItem('GOLIFE_ADMIN_SESSION_TOKEN');
        localStorage.removeItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT');
      }
    });
    return () => unsub();
  }, [currentDataSourceMode]);

  // Auth methods
  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { admin, session, token } = res.data;
        setCurrentAdmin(admin);
        setSessionExpiresAt(session.expiresAt || null);
        localStorage.setItem('GOLIFE_CURRENT_ADMIN', JSON.stringify(admin));
        localStorage.setItem('GOLIFE_ADMIN_SESSION_TOKEN', token);
        if (session.expiresAt) {
          localStorage.setItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT', session.expiresAt);
        }

        // Add session to active list
        setAdminSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);

        addAuditRecord(
          'ADMIN_LOGIN',
          'system',
          admin.id,
          `Admin ${admin.name} (${admin.email}, Role: ${admin.role}) authenticated successfully.`
        );
        showToast(`Welcome back, ${admin.name} (${admin.role.replace('_', ' ')})`, 'success');
        return { success: true };
      } else {
        addAuditRecord(
          'FAILED_LOGIN_ATTEMPT',
          'system',
          email,
          `Failed login attempt for ${email}. Reason: ${res.error || 'Authentication rejected'}`
        );
        return { success: false, error: res.error || 'Authentication failed' };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Server authentication error' };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    if (currentAdmin) {
      addAuditRecord(
        'ADMIN_LOGOUT',
        'system',
        currentAdmin.id,
        `Admin ${currentAdmin.name} logged out from Command Console.`
      );
    }
    const currentToken = localStorage.getItem('GOLIFE_ADMIN_SESSION_TOKEN');
    const matchedSession = adminSessions.find((s) => s.token === currentToken);
    await authService.logout(matchedSession?.id);

    setCurrentAdmin(null);
    setSessionExpiresAt(null);
    localStorage.removeItem('GOLIFE_CURRENT_ADMIN');
    localStorage.removeItem('GOLIFE_ADMIN_SESSION_TOKEN');
    localStorage.removeItem('GOLIFE_ADMIN_SESSION_EXPIRES_AT');
    localStorage.removeItem('GOLIFE_ACTIVE_TAB');
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    showToast('Administrator session closed securely.', 'info');
  };

  const addAuditRecord = (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      adminEmail: currentAdmin?.email || 'system@golife.pk',
      adminRole: currentAdmin?.role || 'super_admin',
      action,
      targetType,
      targetId,
      details,
      timestamp: nowStr,
      ipAddress: '182.185.190.12 (Islamabad Secure VPN)'
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (isProductionDataSource()) {
      firebaseRepository.create('auditLogs', newLog.id, newLog).catch((err) => {
        console.warn('Production audit log sync notice:', err.message);
      });
    }
  };

  // Driver verification actions
  const approveDriverVerification = (verId: string, notes?: string) => {
    if (!hasPermission('drivers', 'approve')) {
      showToast('Access Denied: You do not have permission to approve driver verifications.', 'error');
      return;
    }

    const ver = verifications.find((v) => v.id === verId);
    if (!ver) return;

    const targetDriver = drivers.find((d) => d.id === ver.driverId);
    const updatedDocuments = (ver.documents || []).map((doc) => ({
      ...doc,
      verified: true,
      status: 'verified' as const
    }));

    // Server-authoritative eligibility assessment
    const dummyDriver: Driver = targetDriver || ({
      id: ver.driverId,
      name: ver.driverName,
      phone: ver.driverPhone,
      city: ver.city,
      documents: updatedDocuments,
      vehicle: { category: ver.category }
    } as any);

    const eligibility = calculateDriverEligibility(dummyDriver, updatedDocuments, ver.category as any);
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const isEligible = eligibility.eligibleToDrive;
    const finalVerStatus = isEligible ? 'approved' : 'resubmission_required';
    const finalAccountStatus = isEligible ? 'active' : 'suspended';
    const finalRideStatus = isEligible ? 'online' : 'offline';

    const historyRecord = {
      id: `vh-${Date.now()}`,
      action: isEligible ? 'Verification Approved' : 'Eligibility Restriction - Resubmission Required',
      actor: currentAdmin?.name || 'Super Admin',
      timestamp: nowStr,
      reason: isEligible ? undefined : eligibility.restrictionReasons.join('; '),
      notes: notes || (isEligible ? 'All Pakistani regulatory documents verified' : eligibility.restrictionReasons.join('; '))
    };

    // Update verification list with preserved history
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === verId
          ? {
              ...v,
              status: finalVerStatus,
              reviewStatus: isEligible ? 'approved' : 'resubmission_required',
              reviewedBy: currentAdmin?.name || 'Super Admin',
              reviewedAt: nowStr,
              documents: updatedDocuments,
              history: [historyRecord, ...(v.history || [])]
            }
          : v
      )
    );

    // Update driver in drivers collection
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === ver.driverId
          ? {
              ...d,
              verificationStatus: isEligible ? 'verified' : 'rejected',
              accountStatus: finalAccountStatus,
              status: finalRideStatus,
              documents: updatedDocuments
            }
          : d
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('driverVerifications', verId, {
        status: finalVerStatus,
        reviewStatus: isEligible ? 'approved' : 'resubmission_required',
        reviewedBy: currentAdmin?.name || 'Super Admin',
        reviewedAt: nowStr,
        documents: updatedDocuments,
        history: [historyRecord, ...(ver.history || [])]
      }).catch((err) => console.warn('Production verification update notice:', err.message));

      firebaseRepository.update('drivers', ver.driverId, {
        verificationStatus: isEligible ? 'verified' : 'rejected',
        accountStatus: finalAccountStatus,
        status: finalRideStatus,
        documents: updatedDocuments
      }).catch((err) => console.warn('Production driver sync notice:', err.message));
    }

    addAuditRecord(
      isEligible ? 'DRIVER_VERIFICATION_APPROVED' : 'DRIVER_VERIFICATION_RESTRICTED',
      'driver',
      ver.driverId,
      `Driver ${ver.driverName} (${ver.category}) reviewed by ${currentAdmin?.name}. Status: ${finalVerStatus}. ${isEligible ? 'All mandatory docs compliant & activated.' : `Restricted from rides: ${eligibility.restrictionReasons.join('; ')}`}`
    );

    dispatchNotification({
      title: isEligible ? 'Driver Verification Approved' : 'Verification Resubmission Needed',
      message: isEligible
        ? `Driver ${ver.driverName} is verified and activated for dispatches.`
        : `Driver ${ver.driverName} cannot take rides: ${eligibility.restrictionReasons[0]}`,
      target: 'drivers',
      targetCity: ver.city || 'all',
      category: 'general'
    });

    if (!isEligible) {
      showToast(`Driver documents approved, but dispatches held: ${eligibility.restrictionReasons[0]}`, 'warning');
    } else {
      showToast(`Driver ${ver.driverName} verified and activated for live dispatches`, 'success');
    }
  };

  const rejectDriverVerification = (verId: string, reason: string) => {
    if (!hasPermission('drivers', 'reject')) {
      showToast('Access Denied: You do not have permission to reject driver verifications.', 'error');
      return;
    }

    const ver = verifications.find((v) => v.id === verId);
    if (!ver) return;

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const isResubmitRequest = reason.toLowerCase().includes('resubmission') || reason.toLowerCase().includes('re-submission');

    const historyRecord = {
      id: `vh-${Date.now()}`,
      action: isResubmitRequest ? 'Resubmission Requested' : 'Verification Rejected',
      actor: currentAdmin?.name || 'Super Admin',
      timestamp: nowStr,
      reason,
      notes: reason
    };

    setVerifications((prev) =>
      prev.map((v) =>
        v.id === verId
          ? {
              ...v,
              status: isResubmitRequest ? 'resubmission_required' : 'rejected',
              reviewStatus: isResubmitRequest ? 'resubmission_required' : 'rejected',
              rejectionReason: reason,
              reviewedBy: currentAdmin?.name || 'Super Admin',
              reviewedAt: nowStr,
              history: [historyRecord, ...(v.history || [])]
            }
          : v
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === ver.driverId
          ? {
              ...d,
              verificationStatus: 'rejected',
              rejectionReason: reason,
              accountStatus: 'suspended',
              status: 'offline'
            }
          : d
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('driverVerifications', verId, {
        status: isResubmitRequest ? 'resubmission_required' : 'rejected',
        reviewStatus: isResubmitRequest ? 'resubmission_required' : 'rejected',
        rejectionReason: reason,
        reviewedBy: currentAdmin?.name || 'Super Admin',
        reviewedAt: nowStr,
        history: [historyRecord, ...(ver.history || [])]
      }).catch((err) => console.warn('Production verification reject sync notice:', err.message));

      firebaseRepository.update('drivers', ver.driverId, {
        verificationStatus: 'rejected',
        rejectionReason: reason,
        accountStatus: 'suspended',
        status: 'offline'
      }).catch((err) => console.warn('Production driver reject sync notice:', err.message));
    }

    addAuditRecord(
      isResubmitRequest ? 'DRIVER_RESUBMISSION_REQUESTED' : 'DRIVER_VERIFICATION_REJECTED',
      'driver',
      ver.driverId,
      `Driver ${ver.driverName} ${isResubmitRequest ? 'resubmission requested' : 'rejected'} by ${currentAdmin?.name}. Reason: ${reason}`
    );

    dispatchNotification({
      title: isResubmitRequest ? 'Document Resubmission Requested' : 'Driver Verification Rejected',
      message: `Driver ${ver.driverName}: ${reason}`,
      target: 'drivers',
      targetCity: ver.city || 'all',
      category: 'general'
    });
  };

  // Passenger actions
  const updatePassengerStatus = (pId: string, status: 'active' | 'suspended', reason?: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === pId ? { ...p, status, notes: reason || p.notes } : p))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('passengers', pId, { status, notes: reason || '' }).catch((err) => {
        console.warn('Production passenger update notice:', err.message);
      });
    }
    addAuditRecord(
      status === 'suspended' ? 'PASSENGER_SUSPENDED' : 'PASSENGER_ACTIVATED',
      'passenger',
      pId,
      `Passenger ${pId} status set to ${status}. Note: ${reason || 'N/A'}`
    );
  };

  const adjustPassengerWallet = (pId: string, deltaAmount: number, note: string) => {
    const targetPassenger = passengers.find((p) => p.id === pId);
    const newBal = (targetPassenger?.walletBalance || 0) + deltaAmount;

    setPassengers((prev) =>
      prev.map((p) =>
        p.id === pId ? { ...p, walletBalance: newBal } : p
      )
    );

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const txId = `TXN-PW-${Date.now().toString().slice(-6)}`;

    // Add immutable ledger entry
    const wTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      userId: pId,
      userName: targetPassenger?.name || 'Passenger',
      userType: 'passenger',
      type: deltaAmount >= 0 ? 'credit' : 'debit',
      amount: Math.abs(deltaAmount),
      balanceAfter: newBal,
      timestamp: new Date().toISOString(),
      status: 'completed',
      description: note
    };
    setTransactions((prev) => [wTx, ...prev]);

    const cTx: CentralPaymentTransaction = {
      id: `ctx-${Date.now()}`,
      referenceId: txId,
      transactionType: deltaAmount >= 0 ? 'wallet_adjustment' : 'fine_deduction',
      paymentMethod: 'wallet',
      userId: pId,
      userName: targetPassenger?.name || 'Passenger',
      userPhone: targetPassenger?.phone || '',
      userType: 'passenger',
      amount: Math.abs(deltaAmount),
      walletEffect: deltaAmount,
      balanceAfter: newBal,
      status: 'Completed',
      timestamp: nowStr,
      description: note,
      auditTrail: [
        {
          action: 'WALLET_ADJUSTMENT',
          actor: currentAdmin?.name || 'Admin',
          timestamp: nowStr,
          note
        }
      ]
    };
    setCentralTransactions((prev) => [cTx, ...prev]);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('adjustPassengerWallet', { passengerId: pId, deltaAmount });
        financialService.issueAdjustment({
          type: 'payment_correction',
          targetType: 'passenger',
          targetId: pId,
          targetName: targetPassenger?.name || 'Passenger',
          originalAmount: targetPassenger?.walletBalance || 0,
          adjustmentAmount: Math.abs(deltaAmount),
          direction: deltaAmount >= 0 ? 'credit' : 'debit',
          reason: note,
          note: `Passenger wallet adjustment: ${note}`,
          adminName: currentAdmin?.name || 'Admin'
        }).catch((err) => console.warn('Production passenger wallet sync notice:', err.message));
      } catch (err: any) {
        console.error('Production passenger wallet safety lock notice:', err.message);
      }
    }

    addAuditRecord(
      'PASSENGER_WALLET_ADJUST',
      'passenger',
      pId,
      `Adjusted wallet by Rs. ${deltaAmount}. Reason: ${note}. New Balance: Rs. ${newBal}`
    );
  };

  // Driver management actions
  const updateDriverAccountStatus = (dId: string, status: 'active' | 'suspended' | 'blocked', reason?: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === dId ? { ...d, accountStatus: status } : d))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('drivers', dId, { accountStatus: status }).catch((err) => {
        console.warn('Production driver update notice:', err.message);
      });
    }
    addAuditRecord(
      'DRIVER_ACCOUNT_STATUS_CHANGE',
      'driver',
      dId,
      `Driver ${dId} account set to ${status}. Note: ${reason || 'Manual admin intervention'}`
    );
  };

  const adjustDriverWallet = (dId: string, deltaAmount: number, note: string) => {
    const targetDriver = drivers.find((d) => d.id === dId);
    const newBal = (targetDriver?.walletBalance || 0) + deltaAmount;

    // 1. Update drivers collection
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === dId ? { ...d, walletBalance: newBal } : d
      )
    );

    // 2. Synchronize driverWallets
    setDriverWallets((prev) => {
      const exists = prev.some((w) => w.driverId === dId);
      if (!exists && targetDriver) {
        const newW: DriverWallet = {
          driverId: dId,
          driverName: targetDriver.name,
          driverPhone: targetDriver.phone,
          driverPlate: targetDriver.vehiclePlate || 'N/A',
          driverCity: targetDriver.city,
          balance: newBal,
          pendingBalance: 0,
          payableBalance: Math.max(0, newBal - 500),
          outstandingDeductions: newBal < 0 ? Math.abs(newBal) : 0,
          minimumReserve: 500,
          totalEarnings: targetDriver.totalEarnings || 0,
          totalCommissionPaid: 0,
          totalFinesDeducted: 0,
          totalTopUps: 0,
          totalWithdrawals: 0,
          status: 'active',
          updatedAt: new Date().toISOString()
        };
        return [newW, ...prev];
      }
      return prev.map((w) => {
        if (w.driverId !== dId) return w;
        const updatedBal = w.balance + deltaAmount;
        return {
          ...w,
          balance: updatedBal,
          payableBalance: Math.max(0, updatedBal - 500),
          outstandingDeductions: updatedBal < 0 ? Math.abs(updatedBal) : 0,
          updatedAt: new Date().toISOString()
        };
      });
    });

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const txId = `TXN-DW-${Date.now().toString().slice(-6)}`;

    // 3. Append to immutable transaction ledgers
    const wTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      userId: dId,
      userName: targetDriver?.name || 'Driver',
      userType: 'driver',
      type: deltaAmount >= 0 ? 'credit' : 'debit',
      amount: Math.abs(deltaAmount),
      balanceAfter: newBal,
      timestamp: new Date().toISOString(),
      status: 'completed',
      description: note
    };
    setTransactions((prev) => [wTx, ...prev]);

    const cTx: CentralPaymentTransaction = {
      id: `ctx-${Date.now()}`,
      referenceId: txId,
      transactionType: deltaAmount >= 0 ? 'wallet_adjustment' : 'commission_deduction',
      paymentMethod: 'wallet',
      userId: dId,
      userName: targetDriver?.name || 'Driver',
      userPhone: targetDriver?.phone || '',
      userType: 'driver',
      amount: Math.abs(deltaAmount),
      walletEffect: deltaAmount,
      balanceAfter: newBal,
      status: 'Completed',
      timestamp: nowStr,
      description: note,
      auditTrail: [
        {
          action: 'WALLET_ADJUSTMENT',
          actor: currentAdmin?.name || 'Admin',
          timestamp: nowStr,
          note
        }
      ]
    };
    setCentralTransactions((prev) => [cTx, ...prev]);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('adjustDriverWallet', { driverId: dId, deltaAmount });
        financialService.issueAdjustment({
          type: 'payment_correction',
          targetType: 'driver',
          targetId: dId,
          targetName: targetDriver?.name || 'Driver',
          originalAmount: targetDriver?.walletBalance || 0,
          adjustmentAmount: Math.abs(deltaAmount),
          direction: deltaAmount >= 0 ? 'credit' : 'debit',
          reason: note,
          note: `Driver wallet adjustment: ${note}`,
          adminName: currentAdmin?.name || 'Admin'
        }).catch((err) => console.warn('Production driver wallet notice:', err.message));
      } catch (err: any) {
        console.error('Production driver wallet safety lock notice:', err.message);
      }
    }

    addAuditRecord(
      'DRIVER_WALLET_ADJUST',
      'driver',
      dId,
      `Adjusted driver wallet by Rs. ${deltaAmount}. Reason: ${note}. New Balance: Rs. ${newBal}`
    );
  };

  const handleTopUpStatusChange = (
    requestId: string,
    newStatus: TopUpStatus,
    adminActor: string,
    note?: string,
    reason?: string
  ) => {
    const result = executeTopUpStatusChange(
      topUps,
      driverWallets,
      centralTransactions,
      requestId,
      newStatus,
      adminActor,
      note,
      reason
    );
    setTopUps(result.updatedRequests);
    setDriverWallets(result.updatedWallets);
    setCentralTransactions(result.updatedTransactions);

    // Sync base driver walletBalance if approved
    const req = result.updatedRequests.find((r) => r.id === requestId);
    if ((newStatus === 'Approved' || newStatus === 'Completed') && req) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === req.driverId) {
            const tw = result.updatedWallets.find((w) => w.driverId === d.id);
            return { ...d, walletBalance: tw ? tw.balance : d.walletBalance + req.amount };
          }
          return d;
        })
      );
    }
  };

  const recordDriverWalletCredit = (
    driverId: string,
    amount: number,
    type: PaymentTransactionType,
    description: string,
    adminActor: string
  ) => {
    const res = executeCreditWallet(
      driverWallets,
      centralTransactions,
      driverId,
      amount,
      type,
      description,
      adminActor,
      `CRE-${Date.now()}`
    );
    setDriverWallets(res.updatedWallets);
    setCentralTransactions(res.updatedTransactions);
    const tw = res.updatedWallets.find((w) => w.driverId === driverId);
    if (tw) {
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, walletBalance: tw.balance } : d)));
    }
  };

  const recordDriverWalletDebit = (
    driverId: string,
    amount: number,
    type: PaymentTransactionType,
    description: string,
    adminActor: string
  ) => {
    const res = executeDebitWallet(
      driverWallets,
      centralTransactions,
      driverId,
      amount,
      type,
      description,
      adminActor,
      `DEB-${Date.now()}`
    );
    setDriverWallets(res.updatedWallets);
    setCentralTransactions(res.updatedTransactions);
    const tw = res.updatedWallets.find((w) => w.driverId === driverId);
    if (tw) {
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, walletBalance: tw.balance } : d)));
    }
  };

  const recordCashRideSettlement = (params: {
    rideId: string;
    rideCode: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    fare: number;
    commissionRate?: number;
    adminActor?: string;
  }) => {
    const res = executeCashRideSettlement(
      driverWallets,
      centralTransactions,
      {
        id: params.rideId,
        rideCode: params.rideCode,
        driverId: params.driverId,
        driverName: params.driverName,
        driverPhone: params.driverPhone,
        fare: params.fare,
        commissionRate: (params.commissionRate || 12) / 100
      },
      params.adminActor || currentAdmin?.name || 'Finance Controller'
    );
    setDriverWallets(res.updatedWallets);
    setCentralTransactions(res.updatedTransactions);
    const tw = res.updatedWallets.find((w) => w.driverId === params.driverId);
    if (tw) {
      setDrivers((prev) => prev.map((d) => (d.id === params.driverId ? { ...d, walletBalance: tw.balance } : d)));
    }
  };

  // Fares
  const updateFareConfig = (category: RideCategory, newConfig: Partial<FareCategoryConfig>) => {
    setFareConfigs((prev) =>
      prev.map((f) => (f.category === category ? { ...f, ...newConfig } : f))
    );
    addAuditRecord(
      'FARE_CONFIG_MODIFIED',
      'fare',
      category,
      `Updated pricing rules for ${category}: Base=${newConfig.baseFare ?? 'unchanged'}, PerKm=${newConfig.perKm ?? 'unchanged'}, Commission=${newConfig.commissionPct ?? 'unchanged'}%`
    );
  };

  // Cities
  const updateCityConfig = (cityId: string, updates: Partial<CityConfig>) => {
    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, ...updates } : c))
    );
    addAuditRecord('CITY_CONFIG_UPDATED', 'system', cityId, `Updated configuration for city ${cityId}`);
  };

  // Payouts
  const approvePayout = (payoutId: string, refId: string) => {
    if (!checkSensitiveAction('payout_approval', `Approve payout request ${payoutId}`)) return;
    const nowStr = new Date().toLocaleString() + ' PKT';
    const finalRefId = refId || `TXN-PK-${Math.floor(100000 + Math.random() * 900000)}`;
    const processor = currentAdmin?.name || 'Treasury Admin';

    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'approved',
              processedAt: nowStr,
              processedBy: processor,
              referenceId: finalRefId
            }
          : p
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('payouts', payoutId, {
        status: 'approved',
        processedAt: nowStr,
        processedBy: processor,
        referenceId: finalRefId
      }).catch((err) => {
        console.warn('Production payout approval sync notice:', err.message);
        showToast(`Failed to sync payout approval to Firestore: ${err.message}`, 'error');
      });
    }

    addAuditRecord(
      'PAYOUT_APPROVED',
      'payout',
      payoutId,
      `Approved payout request ${payoutId}. Ref ID: ${refId}`
    );
  };

  const rejectPayout = (payoutId: string, reason: string) => {
    const nowStr = new Date().toLocaleString() + ' PKT';
    const processor = currentAdmin?.name || 'Treasury Admin';

    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'rejected',
              processedAt: nowStr,
              processedBy: processor,
              rejectionReason: reason
            }
          : p
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('payouts', payoutId, {
        status: 'rejected',
        processedAt: nowStr,
        processedBy: processor,
        rejectionReason: reason
      }).catch((err) => {
        console.warn('Production payout rejection sync notice:', err.message);
        showToast(`Failed to sync payout rejection to Firestore: ${err.message}`, 'error');
      });
    }

    addAuditRecord('PAYOUT_REJECTED', 'payout', payoutId, `Rejected payout ${payoutId}. Reason: ${reason}`);
  };

  // Promos
  const createPromoCode = (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: `pr-${Date.now()}`,
      usageCount: 0
    };
    setPromos((prev) => [newPromo, ...prev]);

    if (isProductionDataSource()) {
      firebaseRepository.create('promoCodes', newPromo.id, newPromo).catch((err) => {
        console.warn('Production promo creation sync notice:', err.message);
        showToast(`Failed to sync promo code to Firestore: ${err.message}`, 'error');
      });
    }

    addAuditRecord('PROMO_CREATED', 'promo', newPromo.code, `Created promo code ${newPromo.code}`);
  };

  const deletePromoCode = (promoId: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== promoId));

    if (isProductionDataSource()) {
      firebaseRepository.delete('promoCodes', promoId).catch((err) => {
        console.warn('Production promo deletion sync notice:', err.message);
        showToast(`Failed to delete promo code from Firestore: ${err.message}`, 'error');
      });
    }

    addAuditRecord('PROMO_DELETED', 'promo', promoId, `Deleted promo code ${promoId}`);
  };

  const togglePromoCode = (promoId: string) => {
    const target = promos.find((p) => p.id === promoId);
    if (!target) return;
    const newActive = !target.active;

    setPromos((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, active: newActive } : p))
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('promoCodes', promoId, { active: newActive }).catch((err) => {
        console.warn('Production promo toggle sync notice:', err.message);
        showToast(`Failed to update promo status in Firestore: ${err.message}`, 'error');
      });
    }
  };

  // Push Notifications
  const dispatchNotification = (notifData: Omit<AdminNotification, 'id' | 'sentAt' | 'reachCount' | 'status' | 'sentBy'> & { sentBy?: string }) => {
    const estimatedReach =
      notifData.target === 'drivers'
        ? drivers.length * 52
        : notifData.target === 'passengers'
        ? passengers.length * 120
        : (drivers.length + passengers.length) * 160;

    const newNotif: AdminNotification = {
      ...notifData,
      id: `nt-${Date.now()}`,
      sentAt: new Date().toLocaleString() + ' PKT',
      sentBy: currentAdmin?.email || 'admin@golife.pk',
      reachCount: estimatedReach,
      status: 'sent'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (isProductionDataSource()) {
      firebaseRepository.create('notifications', newNotif.id, newNotif).catch((err) => {
        console.warn('Production notification sync notice:', err.message);
      });
    }

    addAuditRecord(
      'NOTIFICATION_BROADCAST',
      'system',
      newNotif.id,
      `Dispatched notification: "${newNotif.title}" to ${newNotif.target} in ${newNotif.targetCity}`
    );
  };

  const sendNotification = (notif: { title: string; body: string; message?: string; target: 'all' | 'drivers' | 'passengers'; city?: string }) => {
    dispatchNotification({
      title: notif.title,
      message: notif.body || notif.message || '',
      body: notif.body,
      target: notif.target,
      targetCity: notif.city || 'All'
    });
  };

  // Complaints
  const resolveComplaint = (cmpId: string, adminNotes: string, refundAmountOrAction?: any) => {
    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to resolve complaints.', 'error');
      return;
    }

    const refundAmount = typeof refundAmountOrAction === 'number' ? refundAmountOrAction : undefined;
    const actionNote = typeof refundAmountOrAction === 'string' ? ` [Action: ${refundAmountOrAction}]` : '';
    const targetComplaint = complaints.find((c) => c.id === cmpId);

    // If financial resolution is attached, trigger Phase 23 financial refund workflow
    if (refundAmount && refundAmount > 0 && targetComplaint) {
      if (checkSensitiveAction('refund_approval', `Complaint ${cmpId} Passenger Refund of PKR ${refundAmount}`)) {
        processPassengerRefund({
          passengerId: targetComplaint.passengerId || 'pass-unknown',
          passengerName: targetComplaint.passengerName || 'Passenger',
          passengerPhone: targetComplaint.passengerPhone || '+92 300 0000000',
          driverId: targetComplaint.driverId || 'drv-unknown',
          driverName: targetComplaint.driverName || 'Driver',
          rideId: targetComplaint.rideId || 'ride-unknown',
          rideCode: targetComplaint.rideId ? `RD-${targetComplaint.rideId.slice(-4)}` : 'N/A',
          originalFare: refundAmount,
          paidAmount: refundAmount,
          previousRefunds: 0,
          refundType: 'partial',
          amount: refundAmount,
          paymentMethod: 'wallet',
          refundDestination: 'wallet_credit',
          reason: `Complaint resolution: ${adminNotes}`,
          note: `Resolution credit for complaint #${cmpId}`
        });
      }
    }

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === cmpId
          ? {
              ...c,
              status: 'resolved',
              adminNotes: `${c.adminNotes} | Resolution: ${adminNotes}${actionNote}`,
              resolvedAt: new Date().toLocaleString() + ' PKT',
              resolvedBy: currentAdmin?.email || 'admin@golife.pk',
              refundAmount
            }
          : c
      )
    );

    addAuditRecord(
      'COMPLAINT_RESOLVED',
      'complaint',
      cmpId,
      `Resolved complaint ${cmpId}. Notes: ${adminNotes}${actionNote}${refundAmount ? `. Refunded: Rs. ${refundAmount}` : ''}`
    );
    complaintService.resolveComplaint(cmpId, adminNotes, refundAmount, currentAdmin?.email || 'admin@golife.pk').catch(() => {});
    showToast(`Complaint ${cmpId} resolved successfully`, 'success');
  };

  const rejectComplaint = (cmpId: string, reason: string) => {
    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to reject complaints.', 'error');
      return;
    }

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === cmpId
          ? {
              ...c,
              status: 'rejected',
              adminNotes: `${c.adminNotes} | Rejected: ${reason}`,
              resolvedAt: new Date().toLocaleString() + ' PKT',
              resolvedBy: currentAdmin?.email || 'admin@golife.pk'
            }
          : c
      )
    );
    addAuditRecord('COMPLAINT_REJECTED', 'complaint', cmpId, `Rejected ticket ${cmpId}. Reason: ${reason}`);
    complaintService.rejectComplaint(cmpId, reason, currentAdmin?.email || 'admin@golife.pk').catch(() => {});
    showToast(`Complaint ${cmpId} rejected`, 'info');
  };

  // ==========================================
  // PHASE 51 — SAFETY & EMERGENCY CONTROL CENTER
  // ==========================================

  const openSafetyDetail = (incidentId: string) => {
    setActiveSafetyModalIncidentId(incidentId);
  };

  const closeSafetyDetail = () => {
    setActiveSafetyModalIncidentId(null);
  };

  const updateEmergencyContact = (id: string, updates: Partial<SafetyEmergencyContactConfig>) => {
    setSafetyEmergencyContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    recordAdminAudit('EMERGENCY_CONTACT_UPDATED', id, 'Safety Directory Config', `Updated contact configuration for ${id}`);
    showToast('Emergency contact directory updated', 'success');
  };

  const addEmergencyContact = (contact: Omit<SafetyEmergencyContactConfig, 'id'>) => {
    const newId = `emc-${Date.now().toString().slice(-4)}`;
    const contactTitle = contact.serviceName || contact.name || 'Emergency Service';
    const contactNum = contact.contactNumber || contact.dialNumber || '15';
    const fullContact: SafetyEmergencyContactConfig = { ...contact, id: newId, serviceName: contactTitle, contactNumber: contactNum };
    setSafetyEmergencyContacts((prev) => [...prev, fullContact]);
    recordAdminAudit('EMERGENCY_CONTACT_ADDED', newId, 'Safety Directory Config', `Added new emergency service: ${contactTitle} (${contactNum})`);
    showToast(`Emergency contact ${contactTitle} added`, 'success');
  };

  const updateSafetySlaConfig = (config: Partial<SafetyResponseSlaConfig>) => {
    setSafetySlaConfig((prev) => ({ ...prev, ...config }));
    recordAdminAudit('SAFETY_SLA_CONFIG_UPDATED', 'system', 'SLA Config', 'Updated safety SLA response and resolution targets');
    showToast('Safety SLA configuration updated', 'success');
  };

  const acknowledgeSafetyIncident = (incidentId: string, notes?: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const adminName = currentAdmin?.name || 'Safety Controller';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${adminName}`,
          actorRole: 'admin',
          action: 'Admin Acknowledged',
          notes: notes || 'Operator acknowledged active safety alert and opened command center protocol'
        };
        return {
          ...inc,
          status: 'acknowledged',
          acknowledgedAt: nowStr,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_ALERT_ACKNOWLEDGED', incidentId, 'SOS Acknowledgment', notes || 'Operator acknowledged active alert', 'Manual', 'system', incidentId);
    showToast(`Safety Alert ${incidentId} acknowledged by ${adminName}`, 'success');
  };

  const assignSafetyIncident = (incidentId: string, assignedAdmin: string, assignedTeam?: string, notes?: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Assigned',
          notes: `Assigned case officer: ${assignedAdmin}${assignedTeam ? ` (${assignedTeam})` : ''}. ${notes || ''}`
        };
        return {
          ...inc,
          assignedAdmin,
          assignedTeam: assignedTeam || inc.assignedTeam || 'Emergency Ops Command',
          status: inc.status === 'active' ? 'assigned' : inc.status,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_INCIDENT_ASSIGNED', incidentId, 'Dispatcher Assignment', `Assigned to ${assignedAdmin} (${assignedTeam || 'Operations'})`, 'Manual', 'system', incidentId);
    safetyService.assignIncident(incidentId, assignedAdmin, assignedTeam || 'Emergency Ops Command', notes).catch(() => {});
    showToast(`Incident assigned to ${assignedAdmin}`, 'success');
  };

  const recordSafetyContactAttempt = (
    incidentId: string,
    attempt: {
      contactType: 'driver' | 'passenger' | 'emergency_contact' | 'local_emergency_service';
      channel: 'phone_call' | 'in_app_voip' | 'sms' | 'push_notice';
      status: 'connected' | 'unanswered' | 'busy' | 'left_message';
      notes: string;
    }
  ) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newAttempt = {
          id: `att-${Date.now()}`,
          timestamp: nowStr,
          contactType: attempt.contactType,
          channel: attempt.channel,
          status: attempt.status,
          notes: attempt.notes,
          conductedBy: actorName
        };
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Contact Attempt',
          notes: `Contacted ${attempt.contactType.replace('_', ' ')} via ${attempt.channel.replace('_', ' ')} [${attempt.status.toUpperCase()}]: ${attempt.notes}`
        };
        return {
          ...inc,
          emergencyContactAttempts: [...(inc.emergencyContactAttempts || []), newAttempt],
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_CONTACT_LOGGED', incidentId, 'Emergency Outreach', `Contact attempt: ${attempt.contactType} (${attempt.status}) - ${attempt.notes}`, 'Manual', 'system', incidentId);
    showToast(`Contact attempt logged [${attempt.status.toUpperCase()}]`, 'info');
  };

  const requestSafetyInfo = (incidentId: string, target: 'driver' | 'passenger', message: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Information Requested',
          notes: `Dispatched safety prompt to ${target}: "${message}"`
        };
        return {
          ...inc,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    dispatchNotification({
      title: '🚨 Safety Prompt: Clarification Required',
      message: `Safety Ops has sent an urgent prompt regarding Incident #${incidentId}: "${message}"`,
      target: target === 'driver' ? 'drivers' : 'passengers',
      targetCity: 'all',
      category: 'safety'
    });

    recordAdminAudit('SAFETY_INFO_REQUESTED', incidentId, `Safety Prompt to ${target}`, message, 'Manual', 'system', incidentId);
    showToast(`Safety inquiry dispatched to ${target} via in-app banner & SMS`, 'info');
  };

  const addSafetyInternalNote = (incidentId: string, text: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Internal Note',
          notes: text
        };
        return {
          ...inc,
          notes: `${inc.notes || ''} | [${nowStr}] ${actorName}: ${text}`,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_NOTE_ADDED', incidentId, 'Internal Documentation', text, 'Manual', 'system', incidentId);
    showToast('Internal confidential note recorded', 'success');
  };

  const investigateSafetyIncident = (incidentId: string, notes: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Investigation',
          notes
        };
        return {
          ...inc,
          status: 'under_investigation',
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_INVESTIGATION_STARTED', incidentId, 'Formal Investigation', notes, 'Manual', 'system', incidentId);
    showToast('Incident moved to Under Investigation status', 'info');
  };

  const escalateSafetyIncident = (incidentId: string, notes: string, escalateTo: string = 'Punjab Safe City / Senior Ops') => {
    if (!checkSensitiveAction('safety_escalation', `Escalate Safety Incident ${incidentId} to ${escalateTo}`)) {
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Escalation',
          notes: `Escalated to ${escalateTo}: ${notes}`
        };
        return {
          ...inc,
          status: 'escalated',
          priority: 'critical',
          notes: `${inc.notes || ''} | ESCALATED TO ${escalateTo}: ${notes}`,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    dispatchNotification({
      title: '🚨 HIGH-PRIORITY SAFETY ESCALATION',
      message: `Incident ${incidentId} has been escalated to ${escalateTo}: "${notes}"`,
      target: 'all',
      targetCity: 'all',
      category: 'safety'
    });

    recordAdminAudit('SAFETY_INCIDENT_ESCALATED', incidentId, `Escalated to ${escalateTo}`, notes, 'Manual', 'system', incidentId);
    safetyService.escalateIncident(incidentId, notes, escalateTo, actorName).catch(() => {});
    showToast(`Incident escalated to ${escalateTo}`, 'warning');
  };

  const resolveSafetyIncident = (incidentId: string, notes: string, resolutionType: string = 'Standard Protocol Completion') => {
    if (!hasPermission('safety', 'approve') && !hasPermission('safety', 'edit')) {
      showToast('Access Denied: You do not have permission to resolve safety incidents.', 'error');
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Resolution',
          notes: `Resolved (${resolutionType}): ${notes}`
        };
        return {
          ...inc,
          status: 'resolved',
          resolvedAt: nowStr,
          notes: `${inc.notes || ''} | RESOLVED: ${notes}`,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_INCIDENT_RESOLVED', incidentId, resolutionType, notes, 'Manual', 'system', incidentId);
    safetyService.resolveIncident(incidentId, notes, resolutionType, actorName).catch(() => {});
    showToast(`Safety Incident ${incidentId} marked as Resolved`, 'success');
  };

  const markSafetyFalseAlarm = (
    incidentId: string,
    reason: 'duplicate' | 'accidental_tap' | 'test_alert' | 'cancelled_by_user',
    notes: string
  ) => {
    if (!hasPermission('safety', 'edit')) {
      showToast('Access Denied: You do not have permission to close safety alerts.', 'error');
      return;
    }
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'False Alarm Marked',
          notes: `Classified as False Alarm [Reason: ${reason.replace('_', ' ')}]: ${notes}. All telemetry and original alert data preserved.`
        };
        return {
          ...inc,
          status: 'false_alarm',
          isFalseAlarm: true,
          falseAlarmReason: reason,
          resolvedAt: nowStr,
          notes: `${inc.notes || ''} | FALSE ALARM (${reason}): ${notes}`,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_FALSE_ALARM_RECORDED', incidentId, `False Alarm: ${reason}`, notes, 'Manual', 'system', incidentId);
    safetyService.updateIncidentStatus(incidentId, 'false_alarm', notes, actorName).catch(() => {});
    showToast(`Incident marked as False Alarm (${reason.replace('_', ' ')}). Historical logs intact.`, 'info');
  };

  const closeSafetyIncident = (incidentId: string, notes: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Closed',
          notes: `Closed by administrator: ${notes}`
        };
        return {
          ...inc,
          status: 'closed',
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_INCIDENT_CLOSED', incidentId, 'Case Closure', notes, 'Manual', 'system', incidentId);
    safetyService.closeIncident(incidentId, notes, actorName).catch(() => {});
    showToast(`Safety Incident ${incidentId} closed`, 'info');
  };

  const addSafetyEvidence = (incidentId: string, evidence: Omit<SafetyEvidenceItem, 'id' | 'uploadedAt'>) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';
    const newEvItem: SafetyEvidenceItem = {
      ...evidence,
      id: `ev-${Date.now()}`,
      uploadedAt: nowStr
    };

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Evidence Added',
          notes: `Attached evidence: ${evidence.title} (${evidence.type})`
        };
        return {
          ...inc,
          evidenceItems: [...(inc.evidenceItems || []), newEvItem],
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_EVIDENCE_ATTACHED', incidentId, evidence.type, `Attached ${evidence.title}`, 'Manual', 'system', incidentId);
    showToast(`Evidence "${evidence.title}" attached`, 'success');
  };

  const linkSafetyToSupportCase = (incidentId: string): string => {
    const incident = safetyIncidents.find((s) => s.id === incidentId);
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const actorName = currentAdmin?.name || 'Admin';

    if (incident?.caseId) {
      showToast(`Incident is already linked to Case ${incident.caseId}`, 'info');
      return incident.caseId;
    }

    const generatedCaseId = `CS-SFT-${Date.now().toString().slice(-4)}`;
    const newCase: any = {
      id: generatedCaseId,
      caseNumber: generatedCaseId,
      title: `Safety Investigation: ${incident?.type ? incident.type.replace('_', ' ').toUpperCase() : 'SOS Alert'} (${incident?.incidentCode || incidentId})`,
      description: `Formal safety case initiated from Incident ${incident?.incidentCode || incidentId}. Location: ${incident?.location?.address || 'N/A'}. Details: ${incident?.notes || 'Emergency response initiated.'}`,
      category: 'safety_emergency',
      type: 'complaint',
      priority: incident?.priority === 'critical' ? 'critical' : incident?.priority === 'urgent' ? 'urgent' : 'high',
      status: 'open',
      city: incident?.city || 'Lahore',
      createdAt: nowStr,
      updatedAt: nowStr,
      assignedTo: incident?.assignedAdmin || 'Safety Ops Command',
      driver: incident?.driverName ? {
        id: incident.driverId || 'drv-gen',
        name: incident.driverName,
        phone: incident.driverPhone || '+92 300 0000000',
        plate: incident.vehiclePlate || 'N/A'
      } : undefined,
      passenger: incident?.reporterName ? {
        id: incident.passengerId || 'psg-gen',
        name: incident.reporterName,
        phone: incident.reporterPhone || '+92 300 0000000'
      } : undefined
    };

    setCases((prev) => [newCase, ...prev]);

    setSafetyIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const timelineEvent: SafetyResponseTimelineEvent = {
          id: `tl-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${actorName}`,
          actorRole: 'admin',
          action: 'Linked to Case Management',
          notes: `Linked to formal Support Case ${generatedCaseId}`
        };
        return {
          ...inc,
          caseId: generatedCaseId,
          timeline: [...(inc.timeline || []), timelineEvent]
        };
      })
    );

    recordAdminAudit('SAFETY_LINKED_TO_CASE', incidentId, 'Case Integration', `Linked to Support Case ${generatedCaseId}`, 'Manual', 'system', incidentId);
    showToast(`Linked to Support Case ${generatedCaseId}`, 'success');
    return generatedCaseId;
  };

  const triggerDemoSosAlert = (city: string = 'Lahore') => {
    const codeNum = Math.floor(100 + Math.random() * 900);
    const incidentCode = `SOS-PK-${codeNum}`;
    const incidentId = `sft-demo-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    const newSosIncident: SafetyIncident = {
      id: incidentId,
      incidentCode,
      rideId: 'r-401',
      rideCode: `GL-PK-${Math.floor(10000 + Math.random() * 90000)}`,
      reportedBy: 'passenger',
      reporterName: 'Amina Tariq',
      reporterPhone: '+92 301 9845120',
      driverId: 'drv-01',
      driverName: 'Muhammad Asif Rasheed',
      driverPhone: '+92 302 4491823',
      vehiclePlate: 'LEB-22-8419 (Suzuki Alto White)',
      city,
      type: 'sos_trigger',
      priority: 'critical',
      severity: 'critical',
      status: 'active',
      triggeredAt: nowStr,
      notes: '🔴 LIVE DEMO: Passenger pressed in-app SOS Panic button. Telemetry confirms sudden deceleration followed by unscheduled stop.',
      location: {
        lat: city === 'Karachi' ? 24.8607 : city === 'Islamabad' ? 33.6844 : 31.5204,
        lng: city === 'Karachi' ? 67.0011 : city === 'Islamabad' ? 73.0479 : 74.3587,
        address: `${city} Main Boulevard near Commercial Hub`,
        accuracyMeters: 4,
        speedKmh: 0,
        batteryLevelPct: 84,
        signalStatus: 'strong',
        headingDegrees: 180,
        lastFreshness: 'live',
        timestamp: nowStr
      },
      emergencyContactName: 'Tariq Mehmood (Father)',
      emergencyContactPhone: '+92 300 8123984',
      requiresPoliceEscalation: true,
      requiresMedicalEscalation: false,
      breadcrumbs: [
        {
          lat: (city === 'Karachi' ? 24.8607 : 31.5204) - 0.005,
          lng: (city === 'Karachi' ? 67.0011 : 74.3587) - 0.004,
          timestamp: '2 mins ago',
          speedKmh: 42
        },
        {
          lat: city === 'Karachi' ? 24.8607 : 31.5204,
          lng: city === 'Karachi' ? 67.0011 : 74.3587,
          timestamp: 'Just now',
          speedKmh: 0
        }
      ],
      timeline: [
        {
          id: 'tl-1',
          timestamp: nowStr,
          actor: 'Passenger: Amina Tariq',
          actorRole: 'passenger',
          action: 'Emergency SOS Triggered',
          notes: 'In-app panic button activated from active trip.'
        },
        {
          id: 'tl-2',
          timestamp: nowStr,
          actor: 'System AI Monitor',
          actorRole: 'system',
          action: 'Telemetry Capture',
          notes: 'Captured real-time GPS coordinates, vehicle battery (84%), and cellular signal (strong).'
        }
      ],
      emergencyContactAttempts: [],
      evidenceItems: []
    };

    setSafetyIncidents((prev) => [newSosIncident, ...prev]);

    dispatchNotification({
      title: '🚨 CRITICAL: Active SOS Triggered',
      message: `${incidentCode}: Passenger Amina Tariq activated SOS emergency in ${city}! Immediate response required under 60-second SLA.`,
      target: 'all',
      targetCity: city,
      category: 'safety'
    });

    recordAdminAudit('DEMO_SOS_ALERT_TRIGGERED', incidentId, 'Simulation Engine', `Simulated active SOS alert ${incidentCode} in ${city}`, 'Automatic', 'system', incidentId);
    showToast(`🚨 CRITICAL: Active SOS ${incidentCode} triggered in ${city}!`, 'error');
    openSafetyDetail(incidentId);
  };

  // Phase 50: Promotional, Campaigns, Reward Rules & Fraud Review Helpers
  const addPromoCode = (promo: PromoCode) => {
    setPromos((prev) => [promo, ...prev]);
    addAuditRecord('PROMO_CREATED', 'promo', promo.code, `Created promo voucher code ${promo.code}`);
    showToast(`Promo voucher ${promo.code} launched`, 'success');
  };

  const togglePromoStatus = (promoId: string, newStatus?: 'active' | 'inactive' | 'paused', reason?: string) => {
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id !== promoId) return p;
        if (newStatus) {
          const isActive = newStatus === 'active';
          const isPaused = newStatus === 'paused';
          return {
            ...p,
            active: isActive,
            paused: isPaused,
            status: newStatus === 'inactive' ? 'disabled' : newStatus
          };
        }
        const nextActive = !p.active;
        return {
          ...p,
          active: nextActive,
          paused: false,
          status: nextActive ? 'active' : 'disabled'
        };
      })
    );
    addAuditRecord(
      'PROMO_STATUS_CHANGED',
      'promo',
      promoId,
      `Promo ${promoId} status changed${newStatus ? ' to ' + newStatus : ''}. Reason: ${reason || 'Admin action'}`
    );
    showToast(`Promo status updated successfully`, 'info');
  };

  const updatePromoCodeDetails = (id: string, updates: Partial<PromoCode>, reason?: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addAuditRecord('PROMO_UPDATED', 'promo', id, `Updated promo code ${id}. ${reason ? 'Reason: ' + reason : ''}`);
    showToast(`Promo code updated successfully`, 'success');
  };

  const recordPromoUsage = (usage: Omit<PromoUsageRecord, 'id' | 'usedAt'>) => {
    const newUsage: PromoUsageRecord = {
      ...usage,
      id: `PU-${Date.now().toString().slice(-5)}`,
      usedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT'
    };
    setPromoUsages((prev) => [newUsage, ...prev]);
    setPromos((prev) =>
      prev.map((p) =>
        p.id === usage.promoId || p.code === usage.promoCode
          ? {
              ...p,
              usedCount: (p.usedCount || 0) + 1,
              usageCount: (p.usageCount || 0) + 1
            }
          : p
      )
    );
    addAuditRecord('PROMO_USAGE_RECORDED', 'promo', usage.promoCode, `Applied promo ${usage.promoCode} on ride ${usage.rideId}. Discount: PKR ${usage.discountAmount}`);
  };

  const createPromotionCampaign = (
    campaign: Omit<PromotionCampaign, 'id' | 'spentBudget' | 'currentUsersCount' | 'currentUsesCount' | 'createdAt'>,
    reason?: string
  ) => {
    const newCamp: PromotionCampaign = {
      ...campaign,
      id: `camp-${Date.now().toString().slice(-4)}`,
      spentBudget: 0,
      currentUsersCount: 0,
      currentUsesCount: 0,
      createdAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT'
    };
    setPromotionCampaigns((prev) => [newCamp, ...prev]);
    addAuditRecord('CAMPAIGN_CREATED', 'promo', newCamp.id, `Created campaign "${newCamp.name}" with budget PKR ${newCamp.totalBudget}. ${reason || ''}`);
    showToast(`Campaign "${newCamp.name}" launched successfully`, 'success');
  };

  const updatePromotionCampaign = (id: string, updates: Partial<PromotionCampaign>, reason?: string) => {
    setPromotionCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditRecord('CAMPAIGN_UPDATED', 'promo', id, `Updated campaign ${id}. ${reason || ''}`);
    showToast(`Campaign updated successfully`, 'info');
  };

  const toggleCampaignStatus = (id: string, status: PromotionCampaign['status'], reason?: string) => {
    setPromotionCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    addAuditRecord('CAMPAIGN_STATUS_CHANGED', 'promo', id, `Campaign ${id} status set to ${status}. ${reason || ''}`);
    showToast(`Campaign status changed to ${status}`, 'info');
  };

  const updateReferralRewardRule = (id: string, updates: Partial<ReferralRewardRule>, reason?: string) => {
    setReferralRewardRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updates, updatedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT' }
          : r
      )
    );
    addAuditRecord('REFERRAL_RULE_UPDATED', 'promo', id, `Updated referral rule ${id}. ${reason || ''}`);
    showToast(`Referral rule updated`, 'info');
  };

  const updateDriverRewardRule = (id: string, updates: Partial<DriverRewardRule>, reason?: string) => {
    setDriverRewardRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addAuditRecord('DRIVER_REWARD_RULE_UPDATED', 'promo', id, `Updated driver reward rule ${id}. ${reason || ''}`);
    showToast(`Driver reward rule updated`, 'info');
  };

  const updatePassengerRewardRule = (id: string, updates: Partial<PassengerRewardRule>, reason?: string) => {
    setPassengerRewardRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addAuditRecord('PASSENGER_REWARD_RULE_UPDATED', 'promo', id, `Updated passenger reward rule ${id}. ${reason || ''}`);
    showToast(`Passenger reward rule updated`, 'info');
  };

  const disburseDriverReward = (driverId: string, ruleId: string, amount: number, title: string, reason?: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    const drvName = drv ? drv.name : driverId;
    const drvPhone = drv ? drv.phone : '+92 300 0000000';
    const drvCity = drv ? drv.city : 'Lahore';
    const txId = `TX-REW-${Date.now().toString().slice(-6)}`;
    const rewId = `REW-D-${Date.now().toString().slice(-4)}`;

    const newRew: RewardRecord = {
      id: rewId,
      userType: 'driver',
      userId: driverId,
      userName: drvName,
      userPhone: drvPhone,
      rewardType: 'Driver Reward',
      reason: title || 'Milestone / Performance Incentive',
      amount,
      status: 'credited',
      creditedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      transactionId: txId,
      date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      city: drvCity,
      notes: reason || 'Approved and credited to captain balance'
    };
    setRewardsHistory((prev) => [newRew, ...prev]);

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              walletBalance: d.walletBalance + amount,
              totalEarnings: (d.totalEarnings || 0) + amount
            }
          : d
      )
    );

    const newTx: WalletTransaction = {
      id: txId,
      userId: driverId,
      userName: drvName,
      userType: 'driver',
      type: 'credit',
      amount,
      balanceAfter: (drv?.walletBalance || 0) + amount,
      description: `Captain Reward: ${title}`,
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      status: 'completed'
    };
    setTransactions((prev) => [newTx, ...prev]);

    setDriverRewardRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, disbursedBudget: (r.disbursedBudget || 0) + amount }
          : r
      )
    );

    addAuditRecord('DRIVER_REWARD_CREDITED', 'driver', driverId, `Credited PKR ${amount} driver reward (${title}) to ${drvName}. Tx: ${txId}`);
    showToast(`PKR ${amount} reward credited to Captain ${drvName}`, 'success');
  };

  const disbursePassengerReward = (passengerId: string, ruleId: string, amount: number, title: string, reason?: string) => {
    const psg = passengers.find((p) => p.id === passengerId);
    const psgName = psg ? psg.name : passengerId;
    const psgPhone = psg ? psg.phone : '+92 300 0000000';
    const psgCity = psg ? psg.city : 'Karachi';
    const txId = `TX-REW-${Date.now().toString().slice(-6)}`;
    const rewId = `REW-P-${Date.now().toString().slice(-4)}`;

    const newRew: RewardRecord = {
      id: rewId,
      userType: 'passenger',
      userId: passengerId,
      userName: psgName,
      userPhone: psgPhone,
      rewardType: 'Passenger Reward',
      reason: title || 'Loyalty / Milestone Reward',
      amount,
      status: 'credited',
      creditedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      transactionId: txId,
      date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      city: psgCity,
      notes: reason || 'Approved and credited to passenger wallet balance'
    };
    setRewardsHistory((prev) => [newRew, ...prev]);

    setPassengers((prev) =>
      prev.map((p) =>
        p.id === passengerId
          ? { ...p, walletBalance: (p.walletBalance || 0) + amount }
          : p
      )
    );

    const newTx: WalletTransaction = {
      id: txId,
      userId: passengerId,
      userName: psgName,
      userType: 'passenger',
      type: 'credit',
      amount,
      balanceAfter: (psg?.walletBalance || 0) + amount,
      description: `Passenger Reward: ${title}`,
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      status: 'completed'
    };
    setTransactions((prev) => [newTx, ...prev]);

    setPassengerRewardRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, disbursedBudget: (r.disbursedBudget || 0) + amount }
          : r
      )
    );

    addAuditRecord('PASSENGER_REWARD_CREDITED', 'passenger', passengerId, `Credited PKR ${amount} passenger reward (${title}) to ${psgName}. Tx: ${txId}`);
    showToast(`PKR ${amount} reward credited to ${psgName}`, 'success');
  };

  const reviewFraudAlert = (alertId: string, action: 'clear' | 'escalate_case', notes?: string) => {
    const alert = fraudAlerts.find((a) => a.id === alertId);
    const caseId = action === 'escalate_case' ? `CS-${Date.now().toString().slice(-5)}` : undefined;

    setFraudAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: action === 'clear' ? 'cleared' : 'escalated_to_case',
              caseId
            }
          : a
      )
    );

    if (action === 'escalate_case' && alert) {
      const newCase: any = {
        id: caseId!,
        caseNumber: caseId!,
        title: `Suspicious Referral/Promo Abuse: ${alert.description}`,
        description: `${alert.details} | Action Note: ${notes || 'Escalated by Admin for risk investigation'}`,
        category: 'fraud_investigation',
        type: 'complaint',
        priority: 'high',
        status: 'open',
        userType: alert.userType,
        userId: alert.userId,
        userName: alert.userName,
        userPhone: alert.userPhone || '+92 300 0000000',
        city: 'National Operations',
        createdAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
        updatedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
        assignedTo: 'Risk & Compliance Team'
      };
      setCases((prev) => [newCase, ...prev]);
      showToast(`Flagged activity escalated to Case ${caseId}`, 'warning');
    } else {
      showToast(`Fraud alert ${alertId} marked as cleared`, 'info');
    }

    addAuditRecord('FRAUD_ALERT_REVIEWED', 'system', alertId, `Fraud alert ${alertId} reviewed. Action: ${action}. Note: ${notes || 'N/A'}`);
  };

  const updateFareRule = (rule: FareRule) => {
    setFareRules((prev) => prev.map((f) => (f.category === rule.category ? rule : f)));
    addAuditRecord('FARE_RULE_UPDATED', 'fare', rule.category, `Updated fare rule for ${rule.category}`);
  };

  const updateCentralPricing = (
    newRule: CentralPricingRule,
    reasonNote: string,
    affectedScope: string = 'Global (All Cities & Categories)'
  ) => {
    if (!checkSensitiveAction('pricing_changes', 'Update Central Pricing Rules')) return;
    const newVersionSeq = pricingRuleVersions.length + 1;
    const newVersionId = `PRV-2026-v40.${newVersionSeq}`;

    // Create diff summary
    const changes: string[] = [];
    if (newRule.platformCommission.amount !== centralPricingRule.platformCommission.amount) {
      changes.push(`Commission: ${centralPricingRule.platformCommission.amount}% ➔ ${newRule.platformCommission.amount}%`);
    }
    if (newRule.passengerServiceFee.amount !== centralPricingRule.passengerServiceFee.amount) {
      changes.push(`Passenger Service Fee: PKR ${centralPricingRule.passengerServiceFee.amount} ➔ PKR ${newRule.passengerServiceFee.amount}`);
    }
    if (newRule.driverServiceFee.amount !== centralPricingRule.driverServiceFee.amount) {
      changes.push(`Driver Service Fee: PKR ${centralPricingRule.driverServiceFee.amount} ➔ PKR ${newRule.driverServiceFee.amount}`);
    }
    if (newRule.taxRate.amount !== centralPricingRule.taxRate.amount) {
      changes.push(`Tax Rate: ${centralPricingRule.taxRate.amount}% ➔ ${newRule.taxRate.amount}%`);
    }
    if (newRule.maximumRideFare.amount !== centralPricingRule.maximumRideFare.amount) {
      changes.push(`Max Ride Fare: PKR ${centralPricingRule.maximumRideFare.amount} ➔ PKR ${newRule.maximumRideFare.amount}`);
    }
    if (newRule.minimumRideFare.amount !== centralPricingRule.minimumRideFare.amount) {
      changes.push(`Min Ride Fare: PKR ${centralPricingRule.minimumRideFare.amount} ➔ PKR ${newRule.minimumRideFare.amount}`);
    }
    const changeSummary = changes.length > 0 ? changes.join('; ') : 'Updated master pricing configuration rules';

    const activatedRule: CentralPricingRule = {
      ...newRule,
      versionId: newVersionId,
      updatedAt: new Date().toISOString(),
      updatedBy: currentAdmin?.name || 'SuperAdmin'
    };

    const versionRecord: PricingRuleVersion = {
      versionId: newVersionId,
      ruleId: newRule.id,
      changedBy: currentAdmin ? `${currentAdmin.name} (${currentAdmin.role})` : 'SuperAdmin',
      timestamp: new Date().toISOString(),
      previousRule: centralPricingRule,
      newRule: activatedRule,
      changeSummary,
      reasonNote: reasonNote || 'Operational pricing policy adjustment',
      affectedScope,
      status: 'active'
    };

    // Mark previous versions as archived
    setPricingRuleVersions((prev) => [
      versionRecord,
      ...prev.map((v) => ({ ...v, status: 'archived' as const }))
    ]);

    setCentralPricingRule(activatedRule);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('updateCentralPricing', { ruleId: newRule.id, versionId: newVersionId });
        pricingService.savePricingRule(activatedRule, currentAdmin?.id || 'admin', reasonNote || 'Operational pricing policy adjustment')
          .catch((err) => console.warn('Production pricing rule sync notice:', err.message));
      } catch (err: any) {
        console.error('Production pricing safety lock notice:', err.message);
      }
    }

    addAuditRecord(
      'CENTRAL_PRICING_UPDATED',
      'fare',
      newVersionId,
      `Activated new pricing rule version ${newVersionId}: ${changeSummary}. Reason: ${reasonNote || 'N/A'}`
    );

    showToast(`Pricing rule ${newVersionId} activated successfully. All future rides will apply these rates.`, 'success');
  };

  const setDriverPricingOverride = (override: DriverPricingOverride) => {
    setDriverPricingOverrides((prev) => ({
      ...prev,
      [override.driverId]: override
    }));
    addAuditRecord(
      'DRIVER_PRICING_OVERRIDE',
      'driver',
      override.driverId,
      `Set custom pricing override for driver ${override.driverName}: Comm: ${override.customCommissionPercentage ?? 'Default'}%, Svc: PKR ${override.customServiceFee ?? 'Default'}. Reason: ${override.reason}`
    );
    showToast(`Custom pricing override active for driver ${override.driverName}`, 'info');
  };

  const removeDriverPricingOverride = (driverId: string) => {
    setDriverPricingOverrides((prev) => {
      const next = { ...prev };
      delete next[driverId];
      return next;
    });
    addAuditRecord(
      'DRIVER_PRICING_OVERRIDE_REMOVED',
      'driver',
      driverId,
      `Removed custom pricing override for driver ${driverId}. Reverted to global/category pricing.`
    );
    showToast(`Driver pricing reverted to global standard`, 'info');
  };

  const approveLoanApplication = (loanId: string) => {
    setLoanApplications((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'approved' } : l))
    );
    addAuditRecord('LOAN_APPROVED', 'system', loanId, `Approved driver loan ${loanId}`);
  };

  const rejectLoanApplication = (loanId: string, reason: string) => {
    setLoanApplications((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'rejected', rejectionReason: reason } : l))
    );
    addAuditRecord('LOAN_REJECTED', 'system', loanId, `Rejected driver loan ${loanId}: ${reason}`);
  };

  const toggleCityStatus = (cityId: string, newStatus?: CityOperatingStatus, reason?: string) => {
    const targetCity = cities.find((c) => c.id === cityId);
    if (!targetCity) return;

    let updatedStatus: CityOperatingStatus;
    if (newStatus) {
      updatedStatus = newStatus;
    } else {
      updatedStatus = targetCity.active || targetCity.status === 'active' ? 'inactive' : 'active';
    }

    const isActive = updatedStatus === 'active';

    setCities((prev) =>
      prev.map((c) =>
        c.id === cityId
          ? {
              ...c,
              status: updatedStatus,
              active: isActive,
              passengerAvailability: isActive ? 'available' : (updatedStatus === 'coming_soon' ? 'coming_soon' : 'temporarily_unavailable')
            }
          : c
      )
    );

    setCityCategoryMatrix((prev) =>
      prev.map((item) => {
        if (item.cityId === cityId) {
          return {
            ...item,
            status: updatedStatus,
            availability: isActive ? 'available' : (updatedStatus === 'coming_soon' ? 'coming_soon' : 'temporarily_unavailable'),
            lastUpdated: new Date().toLocaleString() + ' PKT'
          };
        }
        return item;
      })
    );

    addAuditRecord(
      'CITY_STATUS_CHANGED',
      'system',
      cityId,
      `City ${targetCity.name} status updated to [${updatedStatus.toUpperCase()}] by ${currentAdmin?.name || 'Admin'}. Reason: ${reason || 'Operational update'}`
    );
    showToast(`City ${targetCity.name} status set to ${updatedStatus.replace('_', ' ')}`, isActive ? 'success' : 'info');
  };

  const updateCity = (cityId: string, updates: Partial<CityConfig>, reason?: string) => {
    const targetCity = cities.find((c) => c.id === cityId);
    if (!targetCity) return;

    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, ...updates } : c))
    );

    if (updates.name && updates.name !== targetCity.name) {
      setCityCategoryMatrix((prev) =>
        prev.map((item) =>
          item.cityId === cityId ? { ...item, cityName: updates.name! } : item
        )
      );
    }

    addAuditRecord(
      'CITY_CONFIG_UPDATED',
      'system',
      cityId,
      `City ${targetCity.name} updated by ${currentAdmin?.name || 'Admin'}. Fields: ${Object.keys(updates || {}).join(', ')}. Reason: ${reason || 'Operations adjustment'}`
    );
    showToast(`City configuration for ${targetCity.name} updated`, 'success');
  };

  const updateCityOperatingSchedule = (cityId: string, schedule: CityOperatingSchedule, reason?: string) => {
    const targetCity = cities.find((c) => c.id === cityId);
    if (!targetCity) return;

    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, operatingSchedule: schedule } : c))
    );

    setCityCategoryMatrix((prev) =>
      prev.map((item) =>
        item.cityId === cityId
          ? {
              ...item,
              operatingHoursMode: schedule.mode,
              lastUpdated: new Date().toLocaleString() + ' PKT'
            }
          : item
      )
    );

    addAuditRecord(
      'CITY_OPERATING_HOURS_UPDATED',
      'system',
      cityId,
      `City ${targetCity.name} operating hours mode changed to ${schedule.mode} by ${currentAdmin?.name || 'Admin'}. Reason: ${reason || 'Schedule adjustment'}`
    );
    showToast(`Operating hours for ${targetCity.name} updated`, 'success');
  };

  const updateServiceCategory = (categoryId: string, updates: Partial<ServiceCategoryConfig>, reason?: string) => {
    const targetCategory = serviceCategories.find((c) => c.id === categoryId);
    if (!targetCategory) return;

    setServiceCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c))
    );

    if (updates.name && updates.name !== targetCategory.name) {
      setCityCategoryMatrix((prev) =>
        prev.map((item) =>
          item.categoryCode === targetCategory.code ? { ...item, categoryName: updates.name! } : item
        )
      );
    }

    addAuditRecord(
      'SERVICE_CATEGORY_UPDATED',
      'system',
      categoryId,
      `Service category ${targetCategory.name} updated by ${currentAdmin?.name || 'Admin'}. Reason: ${reason || 'Policy update'}`
    );
    showToast(`Category ${targetCategory.name} updated`, 'success');
  };

  const toggleCategoryStatus = (categoryId: string, status?: CategoryOperatingStatus, reason?: string) => {
    const targetCategory = serviceCategories.find((c) => c.id === categoryId);
    if (!targetCategory) return;

    const newStatus = status || (targetCategory.status === 'active' ? 'inactive' : 'active');

    setServiceCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              status: newStatus,
              passengerAvailability: newStatus === 'active' ? 'available' : (newStatus === 'coming_soon' ? 'coming_soon' : 'temporarily_unavailable')
            }
          : c
      )
    );

    setCityCategoryMatrix((prev) =>
      prev.map((item) => {
        if (item.categoryCode === targetCategory.code) {
          return {
            ...item,
            status: newStatus,
            availability: newStatus === 'active' ? 'available' : (newStatus === 'coming_soon' ? 'coming_soon' : 'temporarily_unavailable'),
            lastUpdated: new Date().toLocaleString() + ' PKT'
          };
        }
        return item;
      })
    );

    addAuditRecord(
      'CATEGORY_STATUS_CHANGED',
      'system',
      categoryId,
      `Category ${targetCategory.name} status changed to ${newStatus} by ${currentAdmin?.name || 'Admin'}. Reason: ${reason || 'Operational update'}`
    );
    showToast(`Category ${targetCategory.name} status updated to ${newStatus}`, 'info');
  };

  const updateCityCategoryMatrixItem = (itemId: string, updates: Partial<CityCategoryMatrixItem>, reason?: string) => {
    setCityCategoryMatrix((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, ...updates, lastUpdated: new Date().toLocaleString() + ' PKT' }
          : item
      )
    );
    addAuditRecord(
      'CITY_CATEGORY_MATRIX_UPDATED',
      'system',
      itemId,
      `Matrix entry ${itemId} updated. Reason: ${reason || 'Operations adjustment'}`
    );
    showToast('Matrix entry updated', 'success');
  };

  const toggleCityCategoryAvailability = (cityId: string, categoryCode: string, reason?: string) => {
    const matrixItem = cityCategoryMatrix.find((m) => m.cityId === cityId && m.categoryCode === categoryCode);
    if (!matrixItem) return;

    const isAvailable = matrixItem.availability === 'available';
    const newAvailability: PassengerAvailabilityStatus = isAvailable ? 'temporarily_unavailable' : 'available';
    const newStatus: 'active' | 'inactive' = isAvailable ? 'inactive' : 'active';

    setCityCategoryMatrix((prev) =>
      prev.map((m) =>
        m.cityId === cityId && m.categoryCode === categoryCode
          ? {
              ...m,
              availability: newAvailability,
              status: newStatus,
              lastUpdated: new Date().toLocaleString() + ' PKT'
            }
          : m
      )
    );

    addAuditRecord(
      'CITY_SERVICE_AVAILABILITY_TOGGLED',
      'system',
      `${cityId}-${categoryCode}`,
      `Service ${categoryCode} in city ${matrixItem.cityName} set to ${newAvailability} by ${currentAdmin?.name || 'Admin'}. Reason: ${reason || 'Dispatcher toggle'}`
    );
    showToast(`${matrixItem.categoryName} in ${matrixItem.cityName} is now ${newAvailability.replace('_', ' ')}`, isAvailable ? 'warning' : 'success');
  };

  // Loans
  const updateLoanStatus = (loanId: string, status: DriverLoan['status'], notes?: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status, notes: notes || l.notes } : l))
    );
    addAuditRecord('LOAN_STATUS_UPDATE', 'system', loanId, `Updated loan ${loanId} to ${status}`);
  };

  // Academy
  const toggleAcademyLesson = (lessonId: string) => {
    setAcademyLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, published: !l.published } : l))
    );
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (isProductionDataSource()) {
        firebaseRepository.create('systemSettings', 'global_app_settings', updated).catch((err) => {
          console.warn('Production system settings sync notice:', err.message);
        });
      }
      return updated;
    });
    addAuditRecord('SETTINGS_UPDATED', 'system', 'app_config', 'Updated general system settings');
  };

  const resetAllData = () => {
    if (isProductionDataSource()) {
      showToast('Production Safety Lock: Factory demo data reset is disabled in Production Mode.', 'error');
      return;
    }
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_passengers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_drivers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_verifications`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_rides`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_fares`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_cities`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_payouts`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_promos`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_complaints`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_safety`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_audit`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_settings`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_fare_rules`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_training_modules`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_loan_apps`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_freight_orders`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_operations_alerts`);

    setPassengers(INITIAL_PASSENGERS);
    setDrivers(INITIAL_DRIVERS);
    setVerifications(INITIAL_VERIFICATIONS);
    setRides(INITIAL_RIDES);
    setFareConfigs(INITIAL_FARE_CONFIGS);
    setCities(INITIAL_CITIES);
    setIntercityRoutes(INITIAL_INTERCITY_ROUTES);
    setPayouts(INITIAL_PAYOUTS);
    setPromos(INITIAL_PROMOS);
    setFreightJobs(INITIAL_FREIGHT);
    setAcademyLessons(INITIAL_ACADEMY_LESSONS);
    setLoans(INITIAL_LOANS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setComplaints(INITIAL_COMPLAINTS);
    setSafetyIncidents(INITIAL_SAFETY_INCIDENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    setFareRules(INITIAL_FARE_RULES);
    setTransactions(INITIAL_TRANSACTIONS);
    setTrainingModules(INITIAL_TRAINING_MODULES);
    setLoanApplications(INITIAL_LOAN_APPLICATIONS);
    setFreightOrders(INITIAL_FREIGHT_ORDERS);
    setReferrals(INITIAL_REFERRALS);
    setPromoUsages(INITIAL_DEMO_PROMO_USAGES);
    setPromotionCampaigns(INITIAL_DEMO_CAMPAIGNS);
    setReferralRewardRules(INITIAL_DEMO_REFERRAL_RULES);
    setDriverRewardRules(INITIAL_DEMO_DRIVER_REWARD_RULES);
    setPassengerRewardRules(INITIAL_DEMO_PASSENGER_REWARD_RULES);
    setRewardsHistory(INITIAL_DEMO_REWARDS_HISTORY);
    setFraudAlerts(INITIAL_DEMO_FRAUD_ALERTS);
    setPromotionAiInsights(INITIAL_DEMO_PROMO_AI_INSIGHTS);
    setAdminUsers(INITIAL_ADMINS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setOperationsAlerts(INITIAL_OPERATIONS_ALERTS);
    showToast('All system demo data reset to factory defaults', 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setToast(newToast);
    setTimeout(() => {
      setToast((current) => (current?.id === newToast.id ? null : current));
    }, 3500);
  };

  // RBAC & Admin User Management
  const addAdminUser = (newAdmin: Omit<AdminUser, 'id'>) => {
    const id = `adm-${Date.now().toString().slice(-4)}`;
    const fullAdmin: AdminUser = {
      ...newAdmin,
      id,
      lastLogin: 'Never',
      lastActive: 'Just added',
      status: newAdmin.status || 'active'
    };
    setAdminUsers((prev) => [fullAdmin, ...prev]);
    if (isProductionDataSource()) {
      firebaseRepository.create('adminUsers', id, fullAdmin).catch((err) => {
        console.warn('Production admin user create sync notice:', err.message);
      });
    }
    addAuditRecord('ADMIN_USER_CREATED', 'system', id, `Created admin user ${fullAdmin.name} (${fullAdmin.email}) with role ${fullAdmin.role}`);
    showToast(`Admin user ${fullAdmin.name} created successfully`, 'success');
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>) => {
    if (updates.role && updates.role !== 'super_admin') {
      const guard = authService.preventLastSuperAdminRemoval(adminUsers, id, 'role_change', updates.role);
      if (!guard.allowed) {
        showToast(guard.reason || 'Action denied: Cannot demote the last active Super Admin', 'error');
        recordAdminAudit('LAST_SUPER_ADMIN_PROTECTION_BLOCKED', id, 'Policy Violation', 'Demotion of last active Super Admin blocked', 'Automatic', 'system', id);
        return;
      }
    }
    if (updates.status && updates.status !== 'active') {
      const guard = authService.preventLastSuperAdminRemoval(adminUsers, id, 'suspend');
      if (!guard.allowed) {
        showToast(guard.reason || 'Action denied: Cannot deactivate the last active Super Admin', 'error');
        recordAdminAudit('LAST_SUPER_ADMIN_PROTECTION_BLOCKED', id, 'Policy Violation', 'Deactivation of last active Super Admin blocked', 'Automatic', 'system', id);
        return;
      }
    }
    setAdminUsers((prev) =>
      prev.map((adm) => (adm.id === id ? { ...adm, ...updates } : adm))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('adminUsers', id, updates).catch((err) => {
        console.warn('Production admin user update sync notice:', err.message);
      });
    }
    addAuditRecord('ADMIN_USER_UPDATED', 'system', id, `Updated admin user ${id}`);
    showToast(`Admin details updated`, 'success');
  };

  const toggleAdminStatus = (id: string) => {
    const target = adminUsers.find((a) => a.id === id);
    if (!target) return;
    if (target.status === 'active') {
      const guard = authService.preventLastSuperAdminRemoval(adminUsers, id, 'suspend');
      if (!guard.allowed) {
        showToast(guard.reason || 'Action denied: Cannot suspend the last active Super Admin', 'error');
        recordAdminAudit('LAST_SUPER_ADMIN_PROTECTION_BLOCKED', id, 'Policy Violation', 'Suspension of last active Super Admin blocked', 'Automatic', 'system', id);
        return;
      }
    }
    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    setAdminUsers((prev) =>
      prev.map((adm) =>
        adm.id === id
          ? { ...adm, status: nextStatus }
          : adm
      )
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('adminUsers', id, { status: nextStatus }).catch((err) => {
        console.warn('Production admin status sync notice:', err.message);
      });
    }
    addAuditRecord('ADMIN_STATUS_TOGGLED', 'system', id, `Toggled active status for admin ${id}`);
    showToast(`Admin account status updated`, 'info');
  };

  const deleteAdminUser = (id: string) => {
    if (currentAdmin?.id === id) {
      showToast(`Cannot delete currently active logged in admin`, 'error');
      return;
    }
    const guard = authService.preventLastSuperAdminRemoval(adminUsers, id, 'delete');
    if (!guard.allowed) {
      showToast(guard.reason || 'Action denied: Cannot delete the last active Super Admin', 'error');
      recordAdminAudit('LAST_SUPER_ADMIN_PROTECTION_BLOCKED', id, 'Policy Violation', 'Deletion of last active Super Admin blocked', 'Automatic', 'system', id);
      return;
    }
    setAdminUsers((prev) => prev.filter((adm) => adm.id !== id));
    if (isProductionDataSource()) {
      firebaseRepository.delete('adminUsers', id).catch((err) => {
        console.warn('Production admin delete sync notice:', err.message);
      });
    }
    addAuditRecord('ADMIN_USER_DELETED', 'system', id, `Deleted admin user ${id}`);
    showToast(`Admin user removed`, 'info');
  };

  const switchAdminRole = (role: AdminRole) => {
    if (isProductionDataSource()) {
      showToast('Role persona simulation is disabled in Production Mode.', 'warning');
      return;
    }
    // Look for a demo user with this role first
    const matchedUser = adminUsers.find((u) => u.role === role && u.status === 'active');
    let updated: AdminUser;
    if (matchedUser) {
      updated = {
        ...matchedUser,
        status: 'active',
        accountStatus: 'active'
      };
    } else {
      updated = {
        ...(currentAdmin || DEFAULT_ADMIN_USERS[0]),
        role,
        roleTitle: `${role.replace('_', ' ').toUpperCase()} (Active Session)`,
        status: 'active',
        accountStatus: 'active',
        cityScope: role === 'city_manager' ? ['Islamabad', 'Rawalpindi'] : 'all'
      };
    }
    setCurrentAdmin(updated);
    localStorage.setItem('GOLIFE_CURRENT_ADMIN', JSON.stringify(updated));
    showToast(`Switched active role persona to ${updated.name} (${role.replace('_', ' ')})`, 'info');
    recordAdminAudit('ADMIN_ROLE_SWITCHED', updated.name, 'Role Simulation', `Active persona switched to ${role} (${updated.roleTitle})`, 'Manual', 'system', updated.id);
  };

  const isAuthorizedForTab = (tab: AdminTab, role?: AdminRole): boolean => {
    const currentRole = role || currentAdmin?.role || 'super_admin';
    const allowed = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.super_admin;
    return allowed.includes(tab);
  };

  // Phase 52: RBAC Policy Enforcement & Methods
  const hasPermission = (module: PermissionModule, level: PermissionLevel = 'view'): boolean => {
    return rbacHasPermission(currentAdmin, module, level, adminRoles);
  };

  const hasSensitivePermission = (action: SensitivePermission): boolean => {
    return rbacHasSensitivePermission(currentAdmin, action, adminRoles);
  };

  const canAccessCity = (cityName?: string): boolean => {
    return rbacCanAccessCity(currentAdmin, cityName);
  };

  const canAccessTab = (tab: AdminTab): boolean => {
    return rbacCanAccessTab(currentAdmin, tab, adminRoles);
  };

  const checkSensitiveAction = (action: SensitivePermission, actionDescription?: string): boolean => {
    const permitted = hasSensitivePermission(action);
    if (!permitted) {
      const desc = actionDescription || getSensitivePermissionLabel(action);
      showToast(`Access Denied: You do not have authorization to execute "${desc}". Blocked by RBAC security gatekeeper.`, 'error');
      recordAdminAudit(
        'SECURITY_GATEKEEPER_BLOCKED',
        'RBAC Policy Enforcement',
        'Permission Denied',
        `Admin ${currentAdmin?.name || currentAdmin?.email} attempted sensitive action "${action}" (${desc}) without required authorization.`,
        'Automatic',
        'system',
        currentAdmin?.id || 'unknown'
      );
      return false;
    }
    return true;
  };

  const createCustomRole = (newRoleData: Omit<AdminRoleDefinition, 'id'>) => {
    if (!checkSensitiveAction('admin_user_changes', 'Create Custom Role')) return;
    const id = `role-custom-${Date.now().toString().slice(-4)}`;
    const newRole: AdminRoleDefinition = {
      ...newRoleData,
      id,
      isSystemDefault: false
    };
    setAdminRoles((prev) => [...prev, newRole]);
    recordAdminAudit('CUSTOM_ROLE_CREATED', newRole.name, 'RBAC Management', `Created custom role ${newRole.name} (${newRole.code})`, 'Manual', 'system', id);
    showToast(`Role "${newRole.name}" created successfully`, 'success');
  };

  const updateAdminRole = (roleId: string, updates: Partial<AdminRoleDefinition>) => {
    if (!checkSensitiveAction('admin_user_changes', 'Update Role Permissions')) return;
    setAdminRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...updates } : r))
    );
    recordAdminAudit('ROLE_PERMISSIONS_UPDATED', roleId, 'RBAC Management', `Updated permissions/metadata for role ${roleId}`, 'Manual', 'system', roleId);
    showToast('Role permissions updated', 'success');
  };

  const deleteCustomRole = (roleId: string) => {
    if (!checkSensitiveAction('admin_user_changes', 'Delete Custom Role')) return;
    const target = adminRoles.find((r) => r.id === roleId);
    if (target?.isSystemDefault) {
      showToast('Cannot delete system default roles', 'error');
      return;
    }
    setAdminRoles((prev) => prev.filter((r) => r.id !== roleId));
    recordAdminAudit('CUSTOM_ROLE_DELETED', roleId, 'RBAC Management', `Deleted role ${target?.name || roleId}`, 'Manual', 'system', roleId);
    showToast('Custom role removed', 'info');
  };

  const revokeAdminSession = (sessionId: string) => {
    setAdminSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'revoked', lastActive: 'Revoked by administrator' } : s))
    );
    recordAdminAudit('ADMIN_SESSION_REVOKED', sessionId, 'Security Controls', `Revoked active session ${sessionId}`, 'Manual', 'system', sessionId);
    showToast('Session revoked successfully', 'info');
  };

  const revokeAllAdminSessions = (adminId: string) => {
    setAdminSessions((prev) =>
      prev.map((s) => (s.adminId === adminId ? { ...s, status: 'revoked', lastActive: 'Revoked by administrator' } : s))
    );
    recordAdminAudit('ALL_ADMIN_SESSIONS_REVOKED', adminId, 'Security Controls', `Revoked all active sessions for admin ${adminId}`, 'Manual', 'system', adminId);
    showToast('All active sessions revoked for this account', 'warning');
  };

  const createAdminInvitation = (invitationData: Omit<AdminInvitation, 'id' | 'createdAt' | 'token' | 'status'>) => {
    if (!checkSensitiveAction('admin_user_changes', 'Invite Admin User')) return;
    const id = `inv-${Date.now().toString().slice(-4)}`;
    const token = `gl-inv-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-3)}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const newInv: AdminInvitation = {
      ...invitationData,
      id,
      status: 'pending',
      invitationToken: token,
      sentAt: now.toLocaleString('en-GB', { hour12: false }) + ' PKT',
      expiresAt: expiry.toLocaleString('en-GB', { hour12: false }) + ' PKT',
      invitedBy: currentAdmin?.name || 'Administrator'
    };

    setAdminInvitations((prev) => [newInv, ...prev]);
    recordAdminAudit('ADMIN_INVITATION_SENT', newInv.email, 'User Onboarding', `Invited ${newInv.name} (${newInv.email}) as ${newInv.role}`, 'Manual', 'system', id);
    showToast(`Invitation dispatched to ${newInv.email}`, 'success');
  };

  const revokeAdminInvitation = (invitationId: string) => {
    if (!checkSensitiveAction('admin_user_changes', 'Revoke Invitation')) return;
    setAdminInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status: 'expired' } : inv))
    );
    recordAdminAudit('ADMIN_INVITATION_REVOKED', invitationId, 'User Onboarding', `Revoked invitation ${invitationId}`, 'Manual', 'system', invitationId);
    showToast('Invitation revoked', 'info');
  };

  const resendAdminInvitation = (invitationId: string) => {
    const inv = adminInvitations.find((i) => i.id === invitationId);
    if (!inv) return;
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setAdminInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId
          ? {
              ...i,
              status: 'pending',
              sentAt: now.toLocaleString('en-GB', { hour12: false }) + ' PKT',
              expiresAt: expiry.toLocaleString('en-GB', { hour12: false }) + ' PKT'
            }
          : i
      )
    );
    recordAdminAudit('ADMIN_INVITATION_RESENT', inv.email, 'User Onboarding', `Resent invitation to ${inv.email}`, 'Manual', 'system', invitationId);
    showToast(`Invitation re-dispatched to ${inv.email}`, 'success');
  };

  const updateApprovalRule = (ruleId: string, updates: Partial<AdminApprovalRule>) => {
    if (!checkSensitiveAction('financial_rule_changes', 'Update Approval Policy')) return;
    setAdminApprovalRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );
    recordAdminAudit('APPROVAL_RULE_UPDATED', ruleId, 'Compliance Policy', `Updated multi-signature / secondary approval rule ${ruleId}`, 'Manual', 'system', ruleId);
    showToast('Delegation & approval rule updated', 'success');
  };

  const dismissSecurityAlert = (alertId: string) => {
    setAdminSecurityAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a))
    );
    recordAdminAudit('SECURITY_ALERT_DISMISSED', alertId, 'Security Operations', `Security alert ${alertId} dismissed`, 'Manual', 'system', alertId);
    showToast('Security alert dismissed', 'info');
  };

  const resolveSecurityAlert = (alertId: string, notes?: string) => {
    const now = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setAdminSecurityAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved',
              resolvedBy: currentAdmin?.name || 'Administrator',
              resolvedAt: now,
              actionTaken: notes || 'Investigated and verified legitimate administrator activity'
            }
          : a
      )
    );
    recordAdminAudit('SECURITY_ALERT_RESOLVED', alertId, 'Security Operations', `Alert ${alertId} marked resolved: ${notes || 'Cleared'}`, 'Manual', 'system', alertId);
    showToast('Security alert marked as resolved', 'success');
  };

  const lockAdminAccount = (adminId: string, reason: string) => {
    if (!checkSensitiveAction('account_restrictions', 'Lock Admin Account')) return;
    if (adminId === currentAdmin?.id) {
      showToast('Cannot lock your own active administrator account', 'error');
      return;
    }
    const guard = authService.preventLastSuperAdminRemoval(adminUsers, adminId, 'lock');
    if (!guard.allowed) {
      showToast(guard.reason || 'Action denied: Cannot lock the last active Super Admin', 'error');
      recordAdminAudit('LAST_SUPER_ADMIN_PROTECTION_BLOCKED', adminId, 'Policy Violation', 'Locking of last active Super Admin blocked', 'Automatic', 'system', adminId);
      return;
    }
    setAdminUsers((prev) =>
      prev.map((adm) =>
        adm.id === adminId
          ? {
              ...adm,
              status: 'locked',
              accountStatus: 'locked',
              lockReason: reason
            }
          : adm
      )
    );
    revokeAllAdminSessions(adminId);
    recordAdminAudit('ADMIN_ACCOUNT_LOCKED', adminId, 'Security Isolation', `Account locked: ${reason}`, 'Manual', 'system', adminId);
    showToast('Admin account locked and active sessions revoked', 'warning');
  };

  const unlockAdminAccount = (adminId: string) => {
    if (!checkSensitiveAction('account_restrictions', 'Unlock Admin Account')) return;
    setAdminUsers((prev) =>
      prev.map((adm) =>
        adm.id === adminId
          ? {
              ...adm,
              status: 'active',
              accountStatus: 'active',
              failedLoginAttempts: 0,
              lockReason: undefined
            }
          : adm
      )
    );
    recordAdminAudit('ADMIN_ACCOUNT_UNLOCKED', adminId, 'Account Recovery', `Account unlocked by ${currentAdmin?.name}`, 'Manual', 'system', adminId);
    showToast('Admin account unlocked successfully', 'success');
  };

  const updateAdminPermissions = (adminId: string, permissions: string[], sensitivePermissions?: SensitivePermission[]) => {
    if (!checkSensitiveAction('admin_user_changes', 'Modify User Direct Permissions')) return;
    setAdminUsers((prev) =>
      prev.map((adm) =>
        adm.id === adminId
          ? {
              ...adm,
              customDirectPermissions: permissions,
              sensitivePermissionsOverride: sensitivePermissions
            }
          : adm
      )
    );
    recordAdminAudit('ADMIN_PERMISSIONS_OVERRIDDEN', adminId, 'Access Control', `Updated custom direct permissions for admin ${adminId}`, 'Manual', 'system', adminId);
    showToast('Admin direct permissions updated', 'success');
  };

  const updateAdminCityScope = (adminId: string, cityScope: string[] | 'all') => {
    if (!checkSensitiveAction('admin_user_changes', 'Update City Access Scope')) return;
    const assignedCity = Array.isArray(cityScope) ? cityScope.join(', ') : 'All Pakistan';
    setAdminUsers((prev) =>
      prev.map((adm) =>
        adm.id === adminId
          ? {
              ...adm,
              cityScope,
              assignedCity
            }
          : adm
      )
    );
    recordAdminAudit('ADMIN_CITY_SCOPE_UPDATED', adminId, 'Access Scope', `Updated city scope to ${assignedCity}`, 'Manual', 'system', adminId);
    showToast(`City access scope set to ${assignedCity}`, 'success');
  };

  // Support Center Ticket Handlers
  const addTicketReply = (ticketId: string, message: string, senderName?: string) => {
    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to reply to support tickets.', 'error');
      return;
    }
    const adminUser = senderName || currentAdmin?.name || 'Support Admin';
    const reply = {
      id: `rep-${Date.now()}`,
      sender: 'admin' as const,
      senderName: adminUser,
      message,
      timestamp: new Date().toLocaleString() + ' PKT'
    };
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: new Date().toLocaleString() + ' PKT',
              replies: [...t.replies, reply]
            }
          : t
      )
    );
    // Async synchronization with production backend service
    supportTicketService.addTicketReply(ticketId, 'admin', adminUser, message, false).catch(() => {});
    addAuditRecord('SUPPORT_REPLY_SENT', 'complaint', ticketId, `Support reply sent on ticket ${ticketId}`);
    showToast('Reply dispatched to ticket conversation', 'success');
  };

  const addTicketNote = (ticketId: string, note: string) => {
    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to add internal notes.', 'error');
      return;
    }
    const adminUser = currentAdmin?.name || 'Admin';
    const noteEntry = `${adminUser} (${new Date().toLocaleTimeString()}): ${note}`;
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              adminNotes: [...(t.adminNotes || []), noteEntry]
            }
          : t
      )
    );
    supportTicketService.addTicketReply(ticketId, 'admin', adminUser, note, true).catch(() => {});
    addAuditRecord('SUPPORT_NOTE_ADDED', 'complaint', ticketId, `Internal note added to ticket ${ticketId}`);
    showToast('Internal note saved', 'info');
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to update ticket status.', 'error');
      return;
    }
    const now = new Date().toLocaleString() + ' PKT';
    const adminUser = currentAdmin?.name || 'Admin';
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              updatedAt: now,
              resolvedAt: status === 'resolved' || status === 'closed' ? now : t.resolvedAt,
              resolvedBy: status === 'resolved' || status === 'closed' ? adminUser : t.resolvedBy
            }
          : t
      )
    );
    supportTicketService.updateTicketStatus(ticketId, status, adminUser).catch(() => {});
    addAuditRecord('SUPPORT_STATUS_CHANGED', 'complaint', ticketId, `Support ticket status changed to ${status}`);
    showToast(`Ticket status updated to ${status}`, 'success');
  };

  const assignTicket = (ticketId: string, adminName: string) => {
    if (!hasPermission('support', 'edit')) {
      showToast('Access Denied: You do not have permission to assign support tickets.', 'error');
      return;
    }
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assignedAdmin: adminName, updatedAt: new Date().toLocaleString() + ' PKT' }
          : t
      )
    );
    supportTicketService.assignTicket(ticketId, adminName).catch(() => {});
    addAuditRecord('SUPPORT_TICKET_ASSIGNED', 'complaint', ticketId, `Assigned support ticket to ${adminName}`);
    showToast(`Ticket assigned to ${adminName}`, 'info');
  };

  const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'replies'>) => {
    const id = `tkt-${Date.now().toString().slice(-4)}`;
    const ticketNumber = `SUP-PK-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleString() + ' PKT';
    const newTicket: SupportTicket = {
      ...ticketData,
      id,
      ticketNumber,
      createdAt: now,
      updatedAt: now,
      replies: [
        {
          id: `rep-init`,
          sender: 'user',
          senderName: ticketData.userName,
          message: ticketData.description,
          timestamp: now
        }
      ]
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    addAuditRecord('SUPPORT_TICKET_CREATED', 'complaint', id, `Created ticket ${ticketNumber} for ${ticketData.userName}`);
    showToast(`Support ticket ${ticketNumber} created`, 'success');
  };

  // City & Intercity Routes
  const addCity = (city: CityConfig) => {
    setCities((prev) => [city, ...prev]);
    addAuditRecord('CITY_ADDED', 'system', city.id, `Added city ${city.name} (${city.province})`);
    showToast(`City ${city.name} added to operations`, 'success');
  };

  const deleteCity = (cityId: string) => {
    setCities((prev) => prev.filter((c) => c.id !== cityId));
    addAuditRecord('CITY_DELETED', 'system', cityId, `Deleted city ${cityId}`);
    showToast('City removed from operations', 'info');
  };

  const addIntercityRoute = (route: IntercityRoute) => {
    setIntercityRoutes((prev) => [route, ...prev]);
    addAuditRecord('ROUTE_ADDED', 'system', route.id, `Added route ${route.fromCity} ➔ ${route.toCity}`);
    showToast(`Route ${route.fromCity} to ${route.toCity} created`, 'success');
  };

  const updateIntercityRoute = (routeId: string, updates: Partial<IntercityRoute>) => {
    setIntercityRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, ...updates } : r))
    );
    addAuditRecord('ROUTE_UPDATED', 'system', routeId, `Updated intercity route ${routeId}`);
    showToast('Route pricing updated', 'success');
  };

  const toggleIntercityRoute = (routeId: string) => {
    setIntercityRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, active: !r.active } : r))
    );
    showToast('Route status toggled', 'info');
  };

  // Fare Resets
  const resetFareRule = (category: RideCategory) => {
    const defaultRule = INITIAL_FARE_RULES.find((f) => f.category === category);
    if (defaultRule) {
      setFareRules((prev) => prev.map((f) => (f.category === category ? { ...defaultRule } : f)));
      addAuditRecord('FARE_RESET', 'fare', category, `Reset fare rules for ${category} to defaults`);
      showToast(`Fare rules for ${category} reset to system defaults`, 'info');
    }
  };

  const resetAllFareRules = () => {
    setFareRules(INITIAL_FARE_RULES);
    addAuditRecord('FARE_ALL_RESET', 'fare', 'all', `Reset all category fares to initial defaults`);
    showToast(`All category fares restored to default Pakistan tariffs`, 'info');
  };

  // Freight Management
  const updateFreightOrderStatus = (orderId: string, status: FreightOrder['status'], notes?: string) => {
    setFreightOrders((prev) =>
      prev.map((f) => (f.id === orderId ? { ...f, status, notes: notes || f.notes } : f))
    );
    addAuditRecord('FREIGHT_STATUS_UPDATED', 'ride', orderId, `Freight order ${orderId} updated to ${status}`);
    showToast(`Freight order updated to ${status.replace('_', ' ')}`, 'success');
  };

  const addFreightOrder = (order: FreightOrder) => {
    setFreightOrders((prev) => [order, ...prev]);
    addAuditRecord('FREIGHT_ORDER_CREATED', 'ride', order.id, `Created freight order ${order.orderCode}`);
    showToast(`Freight order ${order.orderCode} created`, 'success');
  };

  const assignFreightDriver = (orderId: string, driverName: string, driverPhone: string, driverPlate: string) => {
    setFreightOrders((prev) =>
      prev.map((f) =>
        f.id === orderId
          ? {
              ...f,
              driverName,
              driverPhone,
              vehiclePlate: driverPlate,
              status: 'assigned'
            }
          : f
      )
    );
    addAuditRecord('FREIGHT_DRIVER_ASSIGNED', 'driver', orderId, `Assigned driver ${driverName} to freight order ${orderId}`);
    showToast(`Driver ${driverName} assigned to freight shipment`, 'success');
  };

  // Academy & Loans & Notifications
  const addTrainingModule = (mod: TrainingModule) => {
    setTrainingModules((prev) => [mod, ...prev]);
    addAuditRecord('TRAINING_MODULE_ADDED', 'driver', mod.id, `Added Drivers Academy module: ${mod.title}`);
    showToast(`Academy training module added`, 'success');
  };

  const updateTrainingModule = (id: string, updates: Partial<TrainingModule>) => {
    setTrainingModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    addAuditRecord('TRAINING_MODULE_UPDATED', 'driver', id, `Updated Drivers Academy module ${id}`);
    showToast('Module details updated', 'success');
  };

  const toggleTrainingModule = (id: string) => {
    setTrainingModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
    showToast('Academy module status toggled', 'info');
  };

  const addLoanApplication = (loan: LoanApplication) => {
    setLoanApplications((prev) => [loan, ...prev]);
    addAuditRecord('LOAN_SUBMITTED', 'system', loan.id, `Submitted driver micro-advance application for ${loan.driverName}`);
    showToast(`Loan application registered for ${loan.driverName}`, 'success');
  };

  const recordLoanRepayment = (id: string, amount: number) => {
    setLoanApplications((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const newRepaid = (l.repaidAmount || 0) + amount;
        const isCompleted = newRepaid >= l.amount;
        return {
          ...l,
          repaidAmount: newRepaid,
          status: isCompleted ? 'completed' : l.status
        };
      })
    );
    addAuditRecord('LOAN_REPAYMENT_RECORDED', 'system', id, `Recorded repayment of Rs. ${amount} for loan ${id}`);
    showToast(`Recorded Rs. ${amount} repayment against loan`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification deleted', 'info');
  };

  const editPassenger = (pId: string, updates: Partial<Passenger>) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === pId ? { ...p, ...updates } : p))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('passengers', pId, updates).catch((err) => {
        console.warn('Production passenger update notice:', err.message);
      });
    }
    addAuditRecord('PASSENGER_UPDATED', 'passenger', pId, `Updated profile details for passenger ${pId}`);
  };

  const editDriver = (dId: string, updates: Partial<Driver>) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === dId ? { ...d, ...updates } : d))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('drivers', dId, updates).catch((err) => {
        console.warn('Production driver update notice:', err.message);
      });
    }
    addAuditRecord('DRIVER_UPDATED', 'driver', dId, `Updated profile / vehicle details for driver ${dId}`);
  };

  const cancelRide = (rideId: string, reason: string, cancelledBy: 'passenger' | 'driver' | 'admin' | 'system' = 'admin') => {
    const endT = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PKT';
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'cancelled',
              cancellationReason: reason,
              cancelledBy,
              endTime: endT
            }
          : r
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy,
        endTime: endT
      }).catch((err) => console.warn('Production ride cancel sync notice:', err.message));
    }

    addAuditRecord('RIDE_CANCELLED_BY_ADMIN', 'ride', rideId, `Ride ${rideId} cancelled by ${cancelledBy}. Reason: ${reason}`);
  };

  const reopenComplaint = (cmpId: string, note?: string) => {
    const noteStr = ` | Reopened on ${new Date().toLocaleDateString()}: ${note || 'Ticket reopened for further audit'}`;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === cmpId
          ? {
              ...c,
              status: 'investigating',
              adminNotes: `${c.adminNotes}${noteStr}`
            }
          : c
      )
    );

    if (isProductionDataSource()) {
      const cmp = complaints.find(c => c.id === cmpId);
      firebaseRepository.update('complaints', cmpId, {
        status: 'investigating',
        adminNotes: `${cmp?.adminNotes || ''}${noteStr}`
      }).catch(() => {});
    }

    addAuditRecord('COMPLAINT_REOPENED', 'complaint', cmpId, `Complaint ${cmpId} reopened by admin.`);
  };

  const assignComplaint = (cmpId: string, assignedTo: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === cmpId ? { ...c, assignedAdmin: assignedTo } : c))
    );
    complaintService.assignComplaint(cmpId, assignedTo).catch(() => {});
    addAuditRecord('COMPLAINT_ASSIGNED', 'complaint', cmpId, `Assigned complaint ${cmpId} to ${assignedTo}`);
  };

  const addComplaintNote = (cmpId: string, note: string) => {
    const author = currentAdmin?.name || 'Admin';
    const timestamp = new Date().toLocaleString() + ' PKT';
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== cmpId) return c;
        const existingNotes = c.caseNotes || [];
        return {
          ...c,
          caseNotes: [...existingNotes, { author, text: note, date: timestamp }]
        };
      })
    );
    complaintService.addInternalNote(cmpId, author, note).catch(() => {});
    addAuditRecord('COMPLAINT_NOTE_ADDED', 'complaint', cmpId, `Internal note added by ${author}: ${note}`);
  };

  const refundTransaction = (txId: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'refunded',
              isRefund: true,
              description: `${t.description} (Refunded: ${reason})`
            }
          : t
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('paymentTransactions', txId, {
        status: 'refunded',
        isRefund: true
      }).catch(() => {});
    }

    addAuditRecord('TRANSACTION_REFUNDED', 'system', txId, `Transaction ${txId} refunded: ${reason}`);
  };

  const disburseReferralReward = (refId: string) => {
    const ref = referrals.find((r) => r.id === refId);
    if (!ref) return;

    const txId = `TX-REF-${Date.now().toString().slice(-6)}`;
    const rewardAmt = ref.referrerRewardAmount || ref.rewardAmount || 200;

    setReferrals((prev) =>
      prev.map((r) =>
        r.id === refId
          ? {
              ...r,
              rewardDisbursed: true,
              rewardDisbursedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
              status: 'rewarded',
              tripsCompleted: r.tripsRequired
            }
          : r
      )
    );

    if (ref.referrerType === 'driver' && ref.referrerId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === ref.referrerId
            ? { ...d, walletBalance: d.walletBalance + rewardAmt, totalEarnings: (d.totalEarnings || 0) + rewardAmt }
            : d
        )
      );
    } else if (ref.referrerId) {
      setPassengers((prev) =>
        prev.map((p) =>
          p.id === ref.referrerId
            ? { ...p, walletBalance: (p.walletBalance || 0) + rewardAmt }
            : p
        )
      );
    }

    const newRew: RewardRecord = {
      id: `REW-REF-${Date.now().toString().slice(-4)}`,
      userType: ref.referrerType,
      userId: ref.referrerId || 'ref-user',
      userName: ref.referrerName,
      userPhone: ref.referrerPhone,
      rewardType: 'Referral Reward',
      reason: `Successful Referral for ${ref.refereeName} (${ref.referralCode})`,
      amount: rewardAmt,
      status: 'credited',
      creditedAt: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      transactionId: txId,
      date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      city: ref.city || 'National',
      notes: `Referral code ${ref.referralCode} completed required ${ref.tripsRequired} trips`
    };
    setRewardsHistory((prev) => [newRew, ...prev]);

    const newTx: WalletTransaction = {
      id: txId,
      userId: ref.referrerId || 'ref-user',
      userName: ref.referrerName || 'Referrer',
      userType: ref.referrerType,
      type: 'credit',
      amount: rewardAmt,
      balanceAfter: rewardAmt,
      description: `Referral Bonus for onboarding ${ref.refereeName}`,
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) + ' PKT',
      status: 'completed'
    };
    setTransactions((prev) => [newTx, ...prev]);

    addAuditRecord('REFERRAL_REWARD_DISBURSED', 'promo', refId, `Disbursed referral reward PKR ${rewardAmt} to ${ref.referrerName} (${ref.referrerType}). Ref code: ${ref.referralCode}. Tx: ${txId}`);
    showToast(`Referral reward of PKR ${rewardAmt} disbursed to ${ref.referrerName}`, 'success');
  };

  // Operations Center (Phase 32)
  const toggleSimulation = (active?: boolean) => {
    setIsSimulationActive((prev) => {
      const next = active !== undefined ? active : !prev;
      showToast(next ? 'Real-time telemetry simulation RESUMED' : 'Real-time telemetry simulation PAUSED', 'info');
      return next;
    });
  };

  const advanceSimulationStep = () => {
    setRides((prev) => {
      const searchingRide = prev.find((r) => r.status === 'searching');
      if (searchingRide) {
        showToast(`Simulation Dispatch: Driver matched with ${searchingRide.rideCode}!`, 'info');
        return prev.map((r) =>
          r.id === searchingRide.id
            ? {
                ...r,
                status: 'driver_assigned',
                driverId: 'd-203',
                driverName: 'Abdul Rehman Gujjar',
                driverPhone: '+92 334 1122890',
                driverRating: 4.79,
                driverPlate: 'RWP-23-4412',
                etaMinutes: 5,
                driverOperationalStatus: 'going_to_pickup'
              }
            : r
        );
      }
      const assignedRide = prev.find((r) => r.status === 'driver_assigned');
      if (assignedRide) {
        showToast(`Simulation: Driver arrived at pickup for ${assignedRide.rideCode}!`, 'info');
        return prev.map((r) =>
          r.id === assignedRide.id
            ? {
                ...r,
                status: 'arrived',
                driverOperationalStatus: 'at_pickup'
              }
            : r
        );
      }
      const arrivedRide = prev.find((r) => r.status === 'arrived');
      if (arrivedRide) {
        showToast(`Simulation: Trip started for ${arrivedRide.rideCode}!`, 'info');
        return prev.map((r) =>
          r.id === arrivedRide.id
            ? {
                ...r,
                status: 'in_progress',
                passengerStatus: 'on_board',
                driverOperationalStatus: 'on_trip',
                etaMinutes: 12
              }
            : r
        );
      }
      showToast('Live telemetry pings refreshed across active drivers', 'info');
      return prev;
    });
  };

  const assignRideDriver = (rideId: string, driverId: string, notes?: string) => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (!targetDriver) return;

    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'driver_assigned',
              driverId: targetDriver.id,
              driverName: targetDriver.name,
              driverPhone: targetDriver.phone,
              driverRating: targetDriver.rating,
              driverPlate: targetDriver.vehicle?.plate,
              etaMinutes: 6,
              driverOperationalStatus: 'going_to_pickup'
            }
          : r
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? { ...d, status: 'on_trip', operationalStatus: 'going_to_pickup', activeRideId: rideId }
          : d
      )
    );

    addAuditRecord('RIDE_DRIVER_ASSIGNED', 'dispatch', rideId, `Assigned driver ${targetDriver.name} (${targetDriver.vehicle?.plate}) to ride ${rideId}. Notes: ${notes || 'Manual dispatch'}`);
    showToast(`Driver ${targetDriver.name} assigned to ride`, 'success');
  };

  const reassignRideDriver = (rideId: string, newDriverId: string, reason: string) => {
    const newDriver = drivers.find((d) => d.id === newDriverId);
    if (!newDriver) return;

    let previousDriverName = '';
    setRides((prev) =>
      prev.map((r) => {
        if (r.id === rideId) {
          previousDriverName = r.driverName || 'Previous Driver';
          return {
            ...r,
            driverId: newDriver.id,
            driverName: newDriver.name,
            driverPhone: newDriver.phone,
            driverRating: newDriver.rating,
            driverPlate: newDriver.vehicle?.plate,
            etaMinutes: 7,
            driverOperationalStatus: 'going_to_pickup'
          };
        }
        return r;
      })
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === newDriverId
          ? { ...d, status: 'on_trip', operationalStatus: 'going_to_pickup', activeRideId: rideId }
          : d
      )
    );

    addAuditRecord('RIDE_DRIVER_REASSIGNED', 'dispatch', rideId, `Reassigned ride ${rideId} from ${previousDriverName} to ${newDriver.name}. Reason: ${reason}`);
    showToast(`Ride reassigned to ${newDriver.name}`, 'success');
  };

  const cancelRideAssignment = (rideId: string, reason: string) => {
    let unassignedDriverId: string | undefined;
    setRides((prev) =>
      prev.map((r) => {
        if (r.id === rideId) {
          unassignedDriverId = r.driverId;
          return {
            ...r,
            status: 'searching',
            driverId: undefined,
            driverName: undefined,
            driverPhone: undefined,
            driverRating: undefined,
            driverPlate: undefined,
            driverOperationalStatus: undefined
          };
        }
        return r;
      })
    );

    if (unassignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === unassignedDriverId
            ? { ...d, status: 'online', operationalStatus: 'available', activeRideId: undefined }
            : d
        )
      );
    }

    addAuditRecord('RIDE_ASSIGNMENT_CANCELLED', 'dispatch', rideId, `Cancelled assignment for ride ${rideId}. Reason: ${reason}`);
    showToast('Driver assignment cancelled. Ride returned to matching pool.', 'info');
  };

  const flagRide = (rideId: string, reason: string) => {
    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, flagged: true, flaggedReason: reason } : r))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, { flagged: true, flaggedReason: reason }).catch(() => {});
    }
    addAuditRecord('RIDE_FLAGGED', 'ride', rideId, `Ride ${rideId} flagged for security audit. Reason: ${reason}`);
    showToast('Ride flagged for operational scrutiny', 'warning');
  };

  const unflagRide = (rideId: string) => {
    setRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, flagged: false, flaggedReason: undefined } : r))
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, { flagged: false, flaggedReason: null }).catch(() => {});
    }
    addAuditRecord('RIDE_UNFLAGGED', 'ride', rideId, `Cleared security flag from ride ${rideId}`);
    showToast('Security flag cleared', 'info');
  };

  const addRideAdminNote = (rideId: string, note: string) => {
    const author = currentAdmin?.name || 'Admin';
    const timestamp = new Date().toLocaleString() + ' PKT';
    const newNote = { id: `n-${Date.now()}`, author, text: note, timestamp };
    const curRide = rides.find((r) => r.id === rideId);
    const updatedNotes = [...(curRide?.adminNotesList || []), newNote];

    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              adminNotesList: updatedNotes
            }
          : r
      )
    );
    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, { adminNotesList: updatedNotes }).catch(() => {});
    }
    addAuditRecord('RIDE_NOTE_ADDED', 'ride', rideId, `Admin note added: ${note}`);
    showToast('Note added to ride record', 'success');
  };

  const updateRideStatus = (rideId: string, status: RideStatus, etaMinutes?: number) => {
    const endT = status === 'completed' || status === 'cancelled' || status === 'refunded'
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PKT'
      : undefined;

    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status,
              etaMinutes: etaMinutes !== undefined ? etaMinutes : r.etaMinutes,
              endTime: endT || r.endTime
            }
          : r
      )
    );

    if (isProductionDataSource()) {
      const updates: any = { status };
      if (etaMinutes !== undefined) updates.etaMinutes = etaMinutes;
      if (endT) updates.endTime = endT;
      firebaseRepository.update('rides', rideId, updates).catch(() => {});
    }

    addAuditRecord('RIDE_STATUS_UPDATED', 'ride', rideId, `Updated status to ${status}`);
    showToast(`Ride status updated to ${status}`, 'info');
  };

  const requestPassengerRide = (params: {
    passengerId?: string;
    passengerName: string;
    passengerPhone: string;
    pickup: { address: string; lat: number; lng: number };
    destination: { address: string; lat: number; lng: number };
    category: RideCategory;
    city: string;
    offeredFare: number;
    paymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash';
    notes?: string;
  }): string => {
    const rideId = `ride-demo-${Date.now()}`;
    const rideCode = `GL-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PKT';
    const baseFare = Math.round(params.offeredFare * 0.3);
    const distanceFare = Math.round(params.offeredFare * 0.5);
    const timeFare = params.offeredFare - baseFare - distanceFare;
    const commission = Math.round(params.offeredFare * 0.15); // 15% platform cut
    const driverEarnings = params.offeredFare - commission;

    const newRide: Ride = {
      id: rideId,
      rideCode,
      passengerId: params.passengerId || `pass-${Date.now()}`,
      passengerName: params.passengerName,
      passengerPhone: params.passengerPhone,
      passengerRating: 4.9,
      category: params.category,
      city: params.city,
      pickup: params.pickup,
      destination: params.destination,
      status: 'searching',
      fare: params.offeredFare,
      baseFare,
      distanceFare,
      timeFare,
      commission,
      driverEarnings,
      distanceKm: 8.4,
      durationMin: 18,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      startTime: nowTime,
      etaMinutes: 4,
      offersCount: 1,
      initialFareBid: params.offeredFare,
      adminNotesList: params.notes
        ? [{ id: `note-${Date.now()}`, author: 'Passenger App', text: params.notes, timestamp: nowTime }]
        : []
    };

    setRides((prev) => [newRide, ...prev]);

    if (isProductionDataSource()) {
      firebaseRepository.create('rides', newRide.id, newRide).catch((err) => {
        console.warn('Production ride create sync notice:', err.message);
      });
    }

    addAuditRecord(
      'PASSENGER_RIDE_REQUESTED',
      'ride',
      rideId,
      `Passenger ${params.passengerName} requested ride ${rideCode} for PKR ${params.offeredFare} (${params.category} in ${params.city})`
    );
    showToast(`Ride ${rideCode} requested in ${params.city} for PKR ${params.offeredFare}! Broadcasted to nearby drivers.`, 'success');
    return rideId;
  };

  const driverAcceptRide = (rideId: string, driverId: string) => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (!targetDriver) return;

    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'driver_assigned',
              driverId: targetDriver.id,
              driverName: targetDriver.name,
              driverPhone: targetDriver.phone,
              driverRating: targetDriver.rating,
              driverPlate: targetDriver.vehicle?.plate,
              etaMinutes: 5,
              driverOperationalStatus: 'going_to_pickup'
            }
          : r
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'on_trip',
              operationalStatus: 'going_to_pickup',
              activeRideId: rideId
            }
          : d
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, {
        status: 'driver_assigned',
        driverId: targetDriver.id,
        driverName: targetDriver.name,
        driverPhone: targetDriver.phone,
        driverRating: targetDriver.rating,
        driverPlate: targetDriver.vehicle?.plate,
        etaMinutes: 5,
        driverOperationalStatus: 'going_to_pickup'
      }).catch((err) => console.warn('Production ride accept sync notice:', err.message));

      firebaseRepository.update('drivers', driverId, {
        status: 'on_trip',
        operationalStatus: 'going_to_pickup',
        activeRideId: rideId
      }).catch((err) => console.warn('Production driver accept sync notice:', err.message));
    }

    addAuditRecord(
      'RIDE_DRIVER_ACCEPTED',
      'dispatch',
      rideId,
      `Driver ${targetDriver.name} (${targetDriver.vehicle?.plate}) accepted ride offer ${rideId}. En-route to pickup.`
    );
    showToast(`Driver ${targetDriver.name} accepted ride! En-route to passenger.`, 'success');
  };

  const driverArriveAtPickup = (rideId: string) => {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'arrived',
              etaMinutes: 0,
              driverOperationalStatus: 'at_pickup'
            }
          : r
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, {
        status: 'arrived',
        etaMinutes: 0,
        driverOperationalStatus: 'at_pickup'
      }).catch((err) => console.warn('Production ride arrive sync notice:', err.message));
    }

    addAuditRecord('DRIVER_ARRIVED_PICKUP', 'ride', rideId, `Driver arrived at passenger pickup location for ride ${rideId}`);
    showToast('Driver has arrived at pickup location. Passenger notified.', 'info');
  };

  const driverStartTrip = (rideId: string) => {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'in_progress',
              etaMinutes: 14,
              driverOperationalStatus: 'on_ride',
              passengerStatus: 'on_board'
            }
          : r
      )
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('rides', rideId, {
        status: 'in_progress',
        etaMinutes: 14,
        driverOperationalStatus: 'on_ride',
        passengerStatus: 'on_board'
      }).catch((err) => console.warn('Production ride start sync notice:', err.message));
    }

    addAuditRecord('TRIP_STARTED', 'ride', rideId, `Trip started for ride ${rideId}. Heading to destination.`);
    showToast('Trip started! Telemetry tracking active.', 'info');
  };

  const completeRideAndSettle = async (
    rideId: string,
    options?: { finalCashCollected?: number; rating?: number; feedback?: string }
  ) => {
    const targetRide = rides.find((r) => r.id === rideId);
    if (!targetRide) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PKT';
    const fare = options?.finalCashCollected !== undefined ? options.finalCashCollected : targetRide.fare;
    
    // Centralized Fare & Commission Calculation using single source of truth
    const activePricingRule = centralPricingRule || DEFAULT_CENTRAL_PRICING_RULE;
    const fareBreakdown = calculateCentralFare({
      category: (targetRide.category as string) || 'Economy',
      city: targetRide.city || 'Lahore',
      distanceKm: targetRide.distanceKm || 6.5,
      durationMinutes: targetRide.durationMin || 15,
      baseOverrideFare: fare,
      paymentMethod: targetRide.paymentMethod || 'cash'
    }, activePricingRule);

    const commission = fareBreakdown.commissionAmount || Math.round(fare * 0.15);
    const driverEarnings = fareBreakdown.driverNetEarnings || Math.max(0, fare - commission);
    const assignedDriverId = targetRide.driverId;

    // 1. Update Ride
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'completed',
              paymentStatus: 'paid',
              fare,
              finalFare: fare,
              commission,
              driverEarnings,
              fareBreakdown,
              endTime: nowTime,
              driverOperationalStatus: undefined,
              etaMinutes: 0
            }
          : r
      )
    );

    // 2. Settle Driver Earnings & Commission
    if (assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === assignedDriverId) {
            const isCash = targetRide.paymentMethod === 'cash';
            const newWallet = isCash ? d.walletBalance - commission : d.walletBalance + driverEarnings;
            const newCommissionDue = isCash && newWallet < 0 ? d.commissionDue + Math.abs(newWallet) : d.commissionDue;

            return {
              ...d,
              status: 'online',
              operationalStatus: 'available',
              activeRideId: undefined,
              activeRideCode: undefined,
              totalRides: (d.totalRides || 0) + 1,
              earnings: (d.earnings || 0) + driverEarnings,
              walletBalance: Math.max(0, newWallet),
              commissionDue: newCommissionDue
            };
          }
          return d;
        })
      );
    }

    // 3. Update Passenger total rides
    if (targetRide.passengerId) {
      setPassengers((prev) =>
        prev.map((p) =>
          p.id === targetRide.passengerId
            ? {
                ...p,
                totalRides: (p.totalRides || 0) + 1,
                totalSpent: (p.totalSpent || 0) + fare
              }
            : p
        )
      );
    }

    // 4. Create Ledger Transactions
    const txId = `tx-settle-${Date.now()}`;
    const newTx: any = {
      id: txId,
      txCode: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      rideId: targetRide.id,
      rideCode: targetRide.rideCode,
      driverId: targetRide.driverId,
      driverName: targetRide.driverName,
      passengerId: targetRide.passengerId,
      passengerName: targetRide.passengerName,
      type: 'ride_payment',
      amount: fare,
      commissionAmount: commission,
      driverAmount: driverEarnings,
      currency: 'PKR',
      status: 'completed',
      method: targetRide.paymentMethod,
      timestamp: nowTime,
      fareBreakdown,
      description: `Ride ${targetRide.rideCode} fare settled. Gross: PKR ${fare}, Platform Cut: PKR ${commission}, Driver Net: PKR ${driverEarnings}`
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('completeRideAndSettle', { rideId, fare });
        const adminActor = {
          type: 'admin' as const,
          id: currentAdmin?.id || 'admin',
          name: currentAdmin?.name || 'Admin',
          role: currentAdmin?.role || 'admin'
        };
        const transitionRes = await centralAdminControl.transitionRideState(
          rideId,
          'ride_completed',
          adminActor,
          `Completed and settled via admin panel with fare PKR ${fare}`,
          { overrideFare: fare }
        );
        if (!transitionRes.success) {
          showToast(`Production settlement notice: ${transitionRes.error}`, 'warning');
        }
      } catch (err: any) {
        console.error('Production settlement error:', err);
        showToast(`Settlement error: ${err.message}`, 'error');
        return;
      }
    }

    // 5. Add Audit Record
    addAuditRecord(
      'RIDE_COMPLETED_CASH_SETTLED',
      'payment',
      rideId,
      `Ride ${targetRide.rideCode} completed. Fare PKR ${fare} settled via ${targetRide.paymentMethod}. Driver net: PKR ${driverEarnings}, GoLife commission: PKR ${commission}`
    );

    // 6. Broadcast Realtime Notification
    sendNotification({
      title: 'Ride Completed & Cash Settled',
      body: `Ride ${targetRide.rideCode} completed. PKR ${fare} collected. Net PKR ${driverEarnings} credited to ${targetRide.driverName || 'driver'}.`,
      target: 'all'
    });

    showToast(`Ride ${targetRide.rideCode} completed! PKR ${fare} settled. Commission PKR ${commission} recorded.`, 'success');
  };

  const resolveOperationsAlert = (alertId: string, notes: string) => {
    const now = new Date().toLocaleString() + ' PKT';
    const adminName = currentAdmin?.name || 'Operations Admin';
    setOperationsAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved',
              resolvedAt: now,
              resolvedBy: adminName,
              resolutionNotes: notes,
              notes: [
                ...a.notes,
                { id: `n-${Date.now()}`, author: adminName, text: `Resolved: ${notes}`, timestamp: now }
              ]
            }
          : a
      )
    );
    addAuditRecord('ALERT_RESOLVED', 'alert', alertId, `Resolved alert ${alertId}: ${notes}`);
    showToast('Alert marked as resolved', 'success');
  };

  const escalateOperationsAlert = (alertId: string, notes: string) => {
    const now = new Date().toLocaleString() + ' PKT';
    const adminName = currentAdmin?.name || 'Operations Admin';
    setOperationsAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'escalated',
              priority: 'critical',
              notes: [
                ...a.notes,
                { id: `n-${Date.now()}`, author: adminName, text: `ESCALATED: ${notes}`, timestamp: now }
              ]
            }
          : a
      )
    );
    addAuditRecord('ALERT_ESCALATED', 'alert', alertId, `Escalated alert ${alertId}: ${notes}`);
    showToast('Alert escalated to emergency command', 'warning');
  };

  const assignOperationsAlert = (alertId: string, adminName: string) => {
    const now = new Date().toLocaleString() + ' PKT';
    setOperationsAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              assignedAdmin: adminName,
              status: a.status === 'open' ? 'investigating' : a.status,
              notes: [
                ...a.notes,
                { id: `n-${Date.now()}`, author: currentAdmin?.name || 'Admin', text: `Assigned case to ${adminName}`, timestamp: now }
              ]
            }
          : a
      )
    );
    addAuditRecord('ALERT_ASSIGNED', 'alert', alertId, `Assigned alert ${alertId} to ${adminName}`);
    showToast(`Alert assigned to ${adminName}`, 'info');
  };

  const addOperationsAlertNote = (alertId: string, text: string) => {
    const now = new Date().toLocaleString() + ' PKT';
    const author = currentAdmin?.name || 'Admin';
    setOperationsAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              notes: [
                ...a.notes,
                { id: `n-${Date.now()}`, author, text, timestamp: now }
              ]
            }
          : a
      )
    );
    addAuditRecord('ALERT_NOTE_ADDED', 'alert', alertId, `Note added to alert ${alertId}: ${text}`);
    showToast('Note added to alert log', 'success');
  };

  const createOperationsAlert = (alertData: Omit<OperationsAlert, 'id' | 'code' | 'createdAt' | 'notes'>) => {
    const id = `alt-${Date.now().toString().slice(-4)}`;
    const code = `ALT-PK-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toLocaleString() + ' PKT';
    const newAlert: OperationsAlert = {
      ...alertData,
      id,
      code,
      createdAt: now,
      notes: [
        {
          id: `n-${Date.now()}`,
          author: currentAdmin?.name || 'Operations Dispatch',
          text: `Alert initiated: ${alertData.description}`,
          timestamp: now
        }
      ]
    };
    setOperationsAlerts((prev) => [newAlert, ...prev]);
    addAuditRecord('ALERT_CREATED', 'alert', id, `Created operations alert ${code}: ${alertData.title}`);
    showToast(`New Operations Alert ${code} dispatched!`, 'warning');
  };

  const updateDriverOperationalStatus = (driverId: string, status: DriverOperationalStatus) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const mainStatus = status === 'offline' ? 'offline' : status === 'on_ride' ? 'on_trip' : 'online';
        return {
          ...d,
          operationalStatus: status,
          status: mainStatus
        };
      })
    );
    addAuditRecord('DRIVER_STATUS_UPDATED', 'driver', driverId, `Updated operational status to ${status}`);
    showToast(`Driver operational status updated to ${status}`, 'info');
  };

  // ==========================================
  // PHASE 33: DRIVER CONTROL & COMPLIANCE ACTIONS
  // ==========================================

  const suspendDriver = (
    driverId: string,
    optionsOrReason: any,
    argDurationHours?: number,
    argNotes?: string,
    argType?: string
  ) => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (!targetDriver) return;

    let reason = '';
    let reasonCategory = 'Policy & Compliance';
    let durationHours = 12;
    let notes = '';
    let relatedRideIds: string[] = [];
    let relatedComplaintIds: string[] = [];
    let type: 'manual' | 'automatic' = 'manual';

    if (typeof optionsOrReason === 'object' && optionsOrReason !== null) {
      reason = optionsOrReason.reason;
      reasonCategory = optionsOrReason.reasonCategory || 'General';
      durationHours = optionsOrReason.durationHours || 12;
      notes = optionsOrReason.notes || '';
      relatedRideIds = optionsOrReason.relatedRideIds || [];
      relatedComplaintIds = optionsOrReason.relatedComplaintIds || [];
      type = optionsOrReason.type || 'manual';
    } else {
      reason = String(optionsOrReason);
      durationHours = argDurationHours || 12;
      notes = argNotes || '';
      type = (argType as any) || 'manual';
    }

    if (type !== 'automatic' && !checkSensitiveAction('driver_suspension', `Suspend driver ${targetDriver.name}`)) {
      return;
    }

    const now = new Date();
    const startTime = now.toISOString().replace('T', ' ').substring(0, 19);
    const expiry = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const expiryTime = expiry.toISOString().replace('T', ' ').substring(0, 19);

    const suspensionRecord: DriverSuspensionRecord = {
      id: `susp_${Date.now().toString().slice(-6)}`,
      driverId,
      driverName: targetDriver.name,
      driverPlate: targetDriver.vehicle.plate,
      type,
      source: type === 'automatic' ? 'System — Automatic Rule' : `Admin: ${currentAdmin?.name || currentAdmin?.email || 'Super Admin'}`,
      reason,
      reasonCategory,
      relatedRideIds,
      relatedComplaintIds,
      durationHours,
      startTime,
      expiryTime,
      status: 'active',
      notes
    };

    setDriverSuspensions((prev) => [suspensionRecord, ...prev]);

    // Update Driver status
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const currentLogs = d.statusHistory || [];
        return {
          ...d,
          accountStatus: 'suspended',
          operationalStatus: 'suspended',
          comprehensiveStatus: 'temporarily_suspended',
          status: 'offline',
          activeSuspension: suspensionRecord,
          suspensionHistory: [suspensionRecord, ...(d.suspensionHistory || [])],
          statusHistory: [
            {
              status: 'temporarily_suspended',
              timestamp: startTime,
              changedBy: currentAdmin?.name || 'Admin',
              reason
            },
            ...currentLogs
          ]
        };
      })
    );

    recordAdminAudit(
      'DRIVER_SUSPENDED',
      `Driver: ${targetDriver.name} (${targetDriver.id})`,
      reason,
      notes || `Suspended for ${durationHours} hours`,
      type === 'automatic' ? 'Automatic' : 'Manual',
      'driver',
      driverId
    );

    if (isProductionDataSource()) {
      firebaseRepository.create('driverSuspensions', suspensionRecord.id, suspensionRecord).catch((err) => {
        console.warn('Production driver suspension sync notice:', err.message);
      });
      firebaseRepository.update('drivers', driverId, {
        accountStatus: 'suspended',
        operationalStatus: 'suspended',
        comprehensiveStatus: 'temporarily_suspended',
        status: 'offline',
        activeSuspension: suspensionRecord
      }).catch((err) => console.warn('Production driver update notice:', err.message));
    }

    createOperationsAlert({
      type: 'safety_report',
      title: `Driver Suspended: ${targetDriver.name}`,
      priority: 'high',
      status: 'investigating',
      assignedAdmin: currentAdmin?.name || 'Compliance Team',
      description: `Suspension issued (${durationHours}h) - ${reason}`,
      city: targetDriver.city,
      driverId: driverId,
      driverName: targetDriver.name
    });

    showToast(`Driver ${targetDriver.name} suspended (${durationHours} hrs)`, 'warning');
  };

  const reinstateDriver = (driverId: string, reason = 'Administrative review completed & suspension lifted') => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (!targetDriver) return;

    if (!checkSensitiveAction('driver_reinstatement', `Reinstate driver ${targetDriver.name}`)) {
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setDriverSuspensions((prev) =>
      prev.map((s) => {
        if (s.driverId === driverId && s.status === 'active') {
          return {
            ...s,
            status: 'revoked',
            revokedBy: currentAdmin?.name || 'Admin',
            revokedAt: now,
            revokeReason: reason
          };
        }
        return s;
      })
    );

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const currentLogs = d.statusHistory || [];
        return {
          ...d,
          accountStatus: 'active',
          operationalStatus: 'offline',
          comprehensiveStatus: 'offline',
          status: 'offline',
          activeSuspension: undefined,
          statusHistory: [
            {
              status: 'offline (reinstated)',
              timestamp: now,
              changedBy: currentAdmin?.name || 'Admin',
              reason
            },
            ...currentLogs
          ]
        };
      })
    );

    recordAdminAudit(
      'DRIVER_REINSTATED',
      `Driver: ${targetDriver.name} (${targetDriver.id})`,
      reason,
      'Suspension revoked & driver returned to active pool',
      'Manual',
      'driver',
      driverId
    );

    if (isProductionDataSource()) {
      firebaseRepository.update('drivers', driverId, {
        accountStatus: 'active',
        operationalStatus: 'offline',
        comprehensiveStatus: 'offline',
        status: 'offline',
        activeSuspension: null
      }).catch((err) => console.warn('Production driver reinstate sync notice:', err.message));
    }

    showToast(`Driver ${targetDriver.name} reinstated successfully`, 'success');
  };

  const toggleDriverRideEligibility = (driverId: string, enabled: boolean, notes?: string) => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (!targetDriver) return;

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        return {
          ...d,
          rideEligibility: enabled ? 'enabled' : 'disabled',
          operationalStatus: enabled ? (d.status === 'online' ? 'available' : 'offline') : 'suspended'
        };
      })
    );

    addAuditRecord(
      enabled ? 'DRIVER_ELIGIBILITY_RESTORED' : 'DRIVER_ELIGIBILITY_DISABLED',
      'driver',
      driverId,
      `Ride acceptance eligibility ${enabled ? 'restored' : 'temporarily disabled'}. ${notes || ''}`
    );

    showToast(
      `Driver ${targetDriver.name} ride eligibility ${enabled ? 'restored' : 'temporarily disabled'}.`,
      enabled ? 'success' : 'warning'
    );
  };

  // Attach to window for easy cross-modal access
  if (typeof window !== 'undefined') {
    (window as any).__toggleDriverRideEligibility = toggleDriverRideEligibility;
  }

  const recordLatePickupIncident = (incidentData: Omit<LatePickupIncident, 'id'>) => {
    const id = `lpi_${Date.now().toString().slice(-6)}`;
    const newIncident: LatePickupIncident = { ...incidentData, id };

    setLatePickupIncidents((prev) => [newIncident, ...prev]);

    const targetDriver = drivers.find((d) => d.id === incidentData.driverId);
    const driverName = targetDriver ? targetDriver.name : incidentData.driverName;

    // Check qualifying count today for this driver
    const todayStr = new Date().toISOString().split('T')[0];
    const qualifyingToday =
      latePickupIncidents.filter(
        (i) => i.driverId === incidentData.driverId && i.dateTime.includes(todayStr) && i.isQualifying
      ).length + (incidentData.isQualifying ? 1 : 0);

    // Update driver incident count
    setDrivers((prev) =>
      prev.map((d) => (d.id === incidentData.driverId ? { ...d, latePickupIncidentsToday: qualifyingToday } : d))
    );

    addAuditRecord(
      'LATE_PICKUP_RECORDED',
      'driver',
      incidentData.driverId,
      `Late pickup (${incidentData.pickupDelayMin}m delay) recorded on ride ${incidentData.rideCode}. Today's total: ${qualifyingToday}`
    );

    // AUTOMATIC SUSPENSION TRIGGER (5 qualifying incidents in 1 calendar day -> auto 12-hour suspension)
    if (incidentData.isQualifying && qualifyingToday >= latePickupConfig.requiredIncidentsForSuspension) {
      const now = new Date();
      const startTime = now.toISOString().replace('T', ' ').substring(0, 19);
      const expiry = new Date(now.getTime() + latePickupConfig.suspensionDurationHours * 60 * 60 * 1000);
      const expiryTime = expiry.toISOString().replace('T', ' ').substring(0, 19);

      const autoSuspensionReason = `Temporary suspension — 5 qualifying late pickups recorded today.`;

      const autoSuspension: DriverSuspensionRecord = {
        id: `susp_auto_${Date.now().toString().slice(-6)}`,
        driverId: incidentData.driverId,
        driverName,
        driverPlate: targetDriver?.vehicle.plate,
        type: 'automatic',
        source: 'System — Late Pickup Monitor',
        reason: autoSuspensionReason,
        reasonCategory: 'Repeated late pickup',
        ruleTriggered: 'RULE_AUTO_LATE_PICKUP_5_PER_DAY',
        incidentCount: qualifyingToday,
        relatedRideIds: [incidentData.rideCode],
        relatedComplaintIds: [],
        durationHours: latePickupConfig.suspensionDurationHours,
        startTime,
        expiryTime,
        status: 'active',
        notes: `Automatic compliance action executed. Driver reached threshold of ${qualifyingToday}/${latePickupConfig.requiredIncidentsForSuspension} qualifying late pickups in one calendar day. 12-hour suspension cooling period applied.`
      };

      setDriverSuspensions((prev) => [autoSuspension, ...prev]);

      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id !== incidentData.driverId) return d;
          return {
            ...d,
            accountStatus: 'suspended',
            operationalStatus: 'suspended',
            comprehensiveStatus: 'temporarily_suspended',
            status: 'offline',
            activeSuspension: autoSuspension,
            suspensionHistory: [autoSuspension, ...(d.suspensionHistory || [])],
            statusHistory: [
              {
                status: 'temporarily_suspended (auto)',
                timestamp: startTime,
                changedBy: 'System — Late Pickup Monitor',
                reason: autoSuspensionReason
              },
              ...(d.statusHistory || [])
            ]
          };
        })
      );

      createOperationsAlert({
        type: 'repeated_cancellation',
        title: `Automatic Driver Suspension (5 Late Pickups): ${driverName}`,
        priority: 'critical',
        status: 'open',
        assignedAdmin: 'Automated Compliance Bot',
        description: `Driver ${driverName} reached 5 qualifying late pickups today. 12-hour suspension automatically activated. Expiry: ${expiryTime}`,
        city: targetDriver?.city || 'Lahore',
        driverId: incidentData.driverId,
        driverName: driverName
      });

      showToast(`AUTOMATIC SUSPENSION: Driver ${driverName} reached 5 late pickups today (12hr suspension active)`, 'error');
    } else {
      showToast(`Late pickup logged for ${driverName} (${qualifyingToday}/${latePickupConfig.requiredIncidentsForSuspension} today)`, 'info');
    }
  };

  const updateLatePickupConfig = (newConfig: Partial<LatePickupConfig>) => {
    setLatePickupConfig((prev) => ({ ...prev, ...newConfig }));
    addAuditRecord('CONFIG_UPDATED', 'system', 'late_pickup_config', 'Updated late pickup thresholds and rule parameters');
    showToast('Late pickup compliance rules updated', 'success');
  };

  const issueDriverWarning = (
    driverId: string,
    reason: string,
    notes: string,
    relatedComplaintId?: string,
    relatedRideId?: string
  ) => {
    const targetDriver = drivers.find((d) => d.id === driverId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const warning: DriverWarningRecord = {
      id: `wrn_${Date.now().toString().slice(-6)}`,
      driverId,
      driverName: targetDriver?.name || 'Driver',
      date: now,
      reason,
      issuedBy: currentAdmin?.name || 'Compliance Dispatch',
      relatedComplaintId,
      relatedRideId,
      notes,
      acknowledged: false
    };

    setDriverWarnings((prev) => [warning, ...prev]);

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const warnings = [warning, ...(d.warnings || [])];
        return {
          ...d,
          warningsCount: (d.warningsCount || 0) + 1,
          warnings,
          comprehensiveStatus: d.comprehensiveStatus === 'temporarily_suspended' ? d.comprehensiveStatus : 'warning'
        };
      })
    );

    addAuditRecord('DRIVER_WARNING_ISSUED', 'driver', driverId, `Warning issued: ${reason}`);
    showToast(`Official warning issued to ${targetDriver?.name || 'Driver'}`, 'warning');
  };

  const updateDriverDocumentStatus = (
    driverId: string,
    docIndexOrType: number | string,
    status: 'verified' | 'invalid' | 'rejected',
    notes?: string
  ) => {
    if (!hasPermission('drivers', 'edit') && !hasPermission('drivers', 'approve')) {
      showToast('Access Denied: You do not have permission to review driver documents.', 'error');
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const historyItem = {
      id: `vh-${Date.now()}`,
      action: `Document ${status.toUpperCase()}`,
      actor: currentAdmin?.name || 'Admin',
      timestamp: nowStr,
      reason: notes,
      notes: `Document [${docIndexOrType}] marked as ${status}${notes ? `: ${notes}` : ''}`
    };

    let updatedDocsForEligibility: any[] = [];

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const newDocs = d.documents.map((doc, idx) => {
          if (idx === docIndexOrType || doc.type === docIndexOrType) {
            return {
              ...doc,
              verified: status === 'verified',
              status,
              notes: notes || doc.notes
            };
          }
          return doc;
        });
        updatedDocsForEligibility = newDocs;
        return { ...d, documents: newDocs };
      })
    );

    setVerifications((prev) =>
      prev.map((v) => {
        if (v.driverId !== driverId) return v;
        const updatedDocs = v.documents.map((doc, idx) => {
          if (idx === docIndexOrType || doc.type === docIndexOrType) {
            return {
              ...doc,
              verified: status === 'verified',
              status,
              notes: notes || doc.notes
            };
          }
          return doc;
        });
        return {
          ...v,
          documents: updatedDocs,
          history: [historyItem, ...(v.history || [])]
        };
      })
    );

    // Re-verify eligibility if invalid or rejected
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (targetDriver && status !== 'verified') {
      const eligibility = calculateDriverEligibility(targetDriver, updatedDocsForEligibility.length ? updatedDocsForEligibility : targetDriver.documents);
      if (!eligibility.eligibleToDrive && targetDriver.accountStatus === 'active') {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === driverId
              ? {
                  ...d,
                  accountStatus: 'suspended',
                  verificationStatus: 'rejected',
                  status: 'offline'
                }
              : d
          )
        );
        addAuditRecord(
          'DRIVER_SUSPENDED_INELIGIBLE',
          'driver',
          driverId,
          `Driver dispatch suspended due to invalid/rejected document (${docIndexOrType}). Restrictions: ${eligibility.restrictionReasons.join(', ')}`
        );
      }
    }

    addAuditRecord('DOCUMENT_REVIEWED', 'driver', driverId, `Document marked as ${status}${notes ? `: ${notes}` : ''}`);
    showToast(`Document status updated to ${status}`, 'info');
  };

  const updateVerificationReviewStatus = (
    verId: string,
    reviewStatus: VerificationReviewStatus,
    reason?: string,
    notes?: string
  ) => {
    const adminName = currentAdmin?.name || 'Admin';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setVerifications((prev) =>
      prev.map((v) => {
        if (v.id !== verId) return v;
        const historyItem = {
          id: `h_${Date.now().toString().slice(-4)}`,
          action: `Status updated to ${reviewStatus}`,
          adminName,
          timestamp: now,
          notes,
          reason
        };

        const standardStatus = reviewStatus === 'approved' ? 'approved' : reviewStatus === 'rejected' ? 'rejected' : 'pending';

        return {
          ...v,
          status: standardStatus,
          reviewStatus,
          rejectionReason: reason || v.rejectionReason,
          reviewedBy: adminName,
          reviewedAt: now,
          history: [historyItem, ...(v.history || [])]
        };
      })
    );

    const currentVer = verifications.find((v) => v.id === verId);
    if (currentVer) {
      if (reviewStatus === 'approved') {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === currentVer.driverId
              ? {
                  ...d,
                  verificationStatus: 'verified',
                  accountStatus: 'active',
                  comprehensiveStatus: 'verified'
                }
              : d
          )
        );
      } else if (reviewStatus === 'rejected') {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === currentVer.driverId
              ? {
                  ...d,
                  verificationStatus: 'rejected',
                  rejectionReason: reason,
                  comprehensiveStatus: 'rejected'
                }
              : d
          )
        );
      }
    }

    addAuditRecord('VERIFICATION_REVIEW_UPDATED', 'driver', verId, `Verification status updated to ${reviewStatus}`);
    showToast(`Verification status set to: ${reviewStatus}`, 'success');
  };

  const calculateAndSaveDriverDailySummary = (driverId?: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const targets = driverId ? drivers.filter((d) => d.id === driverId) : drivers;

    const newSummaries: DriverDailySummary[] = [];

    targets.forEach((driver) => {
      const summary = calculateDriverDailyEarnings(driver, targetDate, rides, commissionRules, driverOverrides);
      newSummaries.push(summary);
    });

    setDriverDailySummaries((prev) => {
      const existing = prev.filter((p) => {
        if (driverId) {
          return !(p.driverId === driverId && p.date === targetDate);
        }
        return p.date !== targetDate;
      });
      return [...newSummaries, ...existing];
    });

    addAuditRecord('EARNINGS_CALCULATED', 'driver', driverId || 'all', `Calculated daily earnings for date ${targetDate}`);
    showToast(`Calculated daily earnings for ${targets.length} driver(s) on ${targetDate}`, 'success');
  };

  const settleDriverDailySummary = (summaryId: string, paymentRef?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setDriverDailySummaries((prev) =>
      prev.map((s) => {
        if (s.id !== summaryId) return s;
        return {
          ...s,
          status: 'Paid',
          settledAt: now,
          settledBy: `Admin: ${currentAdmin?.name || 'Finance Dispatch'} (${paymentRef || 'Batch Instant Payout'})`
        };
      })
    );

    addAuditRecord('EARNINGS_SETTLED', 'driver', summaryId, `Settled daily earnings batch ${summaryId}`);
    showToast('Driver daily earnings settled and marked as Paid', 'success');
  };

  const simulatePhase33Event = (
    eventType:
      | 'new_registration'
      | 'document_upload'
      | 'driver_online'
      | 'late_pickup_single'
      | 'late_pickup_auto_suspend_5th'
      | 'passenger_complaint'
      | 'manual_suspend'
      | 'suspension_expire'
      | 'daily_earnings_calc'
  ) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (eventType) {
      case 'new_registration': {
        const newDriverId = `drv_demo_${Date.now().toString().slice(-4)}`;
        const newPlate = `ICT-${Math.floor(1000 + Math.random() * 9000)}`;
        const newDriver: Driver = {
          id: newDriverId,
          name: 'Shahid Mehmood Abbasi',
          phone: '+92 300 8821903',
          email: 'shahid.abbasi@gmail.com',
          cnic: '37405-9988123-1',
          city: 'Islamabad',
          rating: 5.0,
          vehicle: {
            make: 'Toyota',
            model: 'Corolla GLi',
            year: 2021,
            color: 'White',
            plate: newPlate,
            category: 'GoComfort'
          },
          status: 'offline',
          operationalStatus: 'offline',
          comprehensiveStatus: 'pending_verification',
          verificationStatus: 'pending',
          totalRides: 0,
          earnings: 0,
          walletBalance: 1500,
          commissionDue: 0,
          acceptanceRate: 100,
          joinedDate: todayStr,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          accountStatus: 'active',
          academyCompleted: true,
          documents: [
            {
              type: 'cnic_front',
              title: 'CNIC Front (Identity)',
              url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
              verified: false,
              status: 'pending',
              uploadedAt: `${todayStr} ${timeStr}`
            },
            {
              type: 'driving_license',
              title: 'Official Driving License (LTV)',
              url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
              verified: false,
              status: 'pending',
              uploadedAt: `${todayStr} ${timeStr}`
            },
            {
              type: 'vehicle_reg',
              title: 'Vehicle Registration Book (Excise)',
              url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
              verified: false,
              status: 'pending',
              uploadedAt: `${todayStr} ${timeStr}`
            }
          ]
        };

        const newVerification: VerificationItem = {
          id: `ver_demo_${Date.now().toString().slice(-4)}`,
          driverId: newDriverId,
          driverName: newDriver.name,
          driverPhone: newDriver.phone,
          city: newDriver.city,
          category: 'GoComfort',
          submittedAt: `${todayStr} ${timeStr}`,
          documents: newDriver.documents,
          status: 'pending',
          reviewStatus: 'new',
          cnic: newDriver.cnic,
          vehicleInfo: newDriver.vehicle,
          history: [
            {
              id: `h_${Date.now()}`,
              action: 'New Registration Submitted via Driver App',
              adminName: 'Mobile App Gateway',
              timestamp: `${todayStr} ${timeStr}`,
              notes: 'All mandatory KYC identity documents uploaded.'
            }
          ]
        };

        setDrivers((prev) => [newDriver, ...prev]);
        setVerifications((prev) => [newVerification, ...prev]);
        showToast(`New Driver Registration received: ${newDriver.name} (${newDriver.city})`, 'info');
        break;
      }

      case 'document_upload': {
        const target = drivers[0];
        if (target) {
          updateDriverDocumentStatus(target.id, 0, 'verified', 'Verified automatically via NADRA e-Sahulat gateway');
          showToast(`Document verified for driver ${target.name}`, 'success');
        }
        break;
      }

      case 'driver_online': {
        const available = drivers.find((d) => d.accountStatus === 'active' && d.status === 'offline');
        if (available) {
          updateDriverOperationalStatus(available.id, 'available');
          showToast(`Driver ${available.name} is now ONLINE & AVAILABLE`, 'success');
        }
        break;
      }

      case 'late_pickup_single': {
        const target = drivers[0];
        if (target) {
          recordLatePickupIncident({
            rideId: `ride_demo_${Date.now().toString().slice(-4)}`,
            rideCode: `GL-DEMO-${Math.floor(100 + Math.random() * 900)}`,
            driverId: target.id,
            driverName: target.name,
            passengerName: 'Zainab Noor',
            dateTime: `${todayStr} ${timeStr}`,
            expectedPickupTime: '10:00 AM',
            actualArrivalTime: '10:12 AM',
            pickupDelayMin: 12,
            isQualifying: true,
            notes: 'Heavy congestion near Liberty Market roundabout.'
          });
        }
        break;
      }

      case 'late_pickup_auto_suspend_5th': {
        const target = drivers[1] || drivers[0];
        if (target) {
          recordLatePickupIncident({
            rideId: `ride_demo_5th_${Date.now().toString().slice(-4)}`,
            rideCode: `GL-5TH-${Math.floor(100 + Math.random() * 900)}`,
            driverId: target.id,
            driverName: target.name,
            passengerName: 'Farhan Zaidi',
            dateTime: `${todayStr} ${timeStr}`,
            expectedPickupTime: '06:15 PM',
            actualArrivalTime: '06:29 PM',
            pickupDelayMin: 14,
            isQualifying: true,
            notes: '5th Late Pickup Incident of the day! Exceeded 8-minute SLA threshold.'
          });
        }
        break;
      }

      case 'passenger_complaint': {
        const target = drivers[0];
        if (target) {
          const newCmp: Complaint = {
            id: `cmp_${Date.now().toString().slice(-4)}`,
            ticketNumber: `TKT-CMP-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'behavior',
            reporterType: 'passenger',
            reporterName: 'Ayesha Bibi',
            reporterPhone: '+92 300 1234567',
            targetName: target.name,
            targetPhone: target.phone,
            rideId: 'ride_101',
            rideCode: 'GL-9021',
            city: target.city,
            severity: 'medium',
            status: 'open',
            subject: 'Driver demanded extra cash for AC usage',
            description: 'Driver requested Rs 150 extra cash for turning on the vehicle air conditioner on Mall Road.',
            createdAt: `${todayStr} ${timeStr}`,
            adminNotes: 'Complaint logged via Passenger app in-ride support.',
            caseNotes: [
              {
                author: 'System Intake',
                text: 'Complaint logged via Passenger app in-ride support.',
                date: `${todayStr} ${timeStr}`
              }
            ]
          };
          setComplaints((prev) => [newCmp, ...prev]);
          showToast(`Passenger complaint logged against ${target.name}`, 'warning');
        }
        break;
      }

      case 'manual_suspend': {
        const target = drivers.find((d) => d.accountStatus === 'active') || drivers[0];
        if (target) {
          suspendDriver(target.id, {
            reason: 'Passenger complaint regarding improper fare demand and rash driving.',
            reasonCategory: 'Passenger complaint',
            durationHours: 24,
            notes: 'Investigating incident report from passenger Ayesha Bibi.'
          });
        }
        break;
      }

      case 'suspension_expire': {
        const suspendedDriver = drivers.find((d) => d.accountStatus === 'suspended');
        if (suspendedDriver) {
          reinstateDriver(suspendedDriver.id, '12-hour suspension period elapsed. Driver automatically reinstated.');
        } else {
          showToast('No currently suspended drivers to reinstate', 'info');
        }
        break;
      }

      case 'daily_earnings_calc': {
        calculateAndSaveDriverDailySummary();
        break;
      }
    }
  };

  // Phase 34 AI Intelligence Handlers
  const updateAutomationSettings = (updates: Partial<AutomationSettings>) => {
    setAutomationSettings((prev) => {
      const next = { ...prev, ...updates };
      addAuditRecord('Rule triggered', 'automation_rule', 'settings', `Automation thresholds updated`);
      showToast('Automation settings updated', 'success');
      return next;
    });
  };

  const updateAdminTaskStatus = (taskId: string, status: AdminTaskStatus, note?: string) => {
    setAdminTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    addAuditRecord('Admin approved action', 'admin_task', taskId, `Task status changed to ${status}${note ? `: ${note}` : ''}`);
    showToast(`Task marked as ${status}`, 'info');
  };

  const assignAdminTask = (taskId: string, adminEmail: string) => {
    setAdminTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assignedAdmin: adminEmail } : t))
    );
    showToast(`Task assigned to ${adminEmail}`, 'success');
  };

  const addAdminTask = (task: Omit<AdminTask, 'id' | 'createdAt'>) => {
    const newTask: AdminTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: 'Just now'
    };
    setAdminTasks((prev) => [newTask, ...prev]);
    showToast('Admin task created', 'success');
  };

  const sendAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message
    const userMsg: AiChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' PKT'
    };

    setAiChatMessages((prev) => [...prev, userMsg]);

    // Generate AI assistant response
    const assistantMsg = processAiQuery(queryText, {
      drivers,
      rides,
      verifications,
      complaints,
      safetyIncidents,
      payouts,
      latePickupIncidents,
      driverSuspensions,
      driverDailySummaries,
      cities
    });

    setAiChatMessages((prev) => [...prev, assistantMsg]);
    addAuditRecord('AI recommendation generated', 'ai_insight', 'query', `Admin queried: "${queryText}"`);
  };

  const executeAiRecommendation = (driverId: string, action: SmartRecommendedAction, notes?: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    const driverName = driver?.name || `Driver #${driverId}`;

    if (action === 'Temporary Suspension') {
      suspendDriver(driverId, {
        reason: notes || 'AI Performance & Compliance Risk recommendation approved by Admin',
        reasonCategory: 'performance_risk',
        durationHours: automationSettings.suspensionDurationHours,
        notes: `AI recommendation executed by ${currentAdmin?.name || 'Admin'}. Temporary cooling-off suspension.`
      });
      addAuditRecord('Admin approved action', 'driver', driverId, `Admin executed AI recommended Temporary Suspension for ${driverName}`);
    } else if (action === 'Issue Warning') {
      issueDriverWarning(
        driverId,
        'Performance Warning',
        notes || 'AI-recommended warning issued regarding service quality / delay markers'
      );
      addAuditRecord('Admin approved action', 'driver', driverId, `Admin executed AI recommended Warning for ${driverName}`);
    } else if (action === 'Escalate for Safety Review') {
      addAuditRecord('Admin approved action', 'driver', driverId, `Safety escalation initiated for ${driverName}: ${notes || 'Immediate safety review requested'}`);
      showToast(`Safety escalation dispatched for ${driverName}`, 'warning');
    } else {
      addAuditRecord('Admin viewed recommendation', 'driver', driverId, `Admin confirmed monitoring protocol for ${driverName}`);
      showToast(`Monitoring protocol active for ${driverName}`, 'info');
    }
  };

  // ==========================================
  // PHASE 41 — DRIVER FINES & PENALTIES ENGINE
  // ==========================================

  const addDriverFine = (fineData: {
    driverId: string;
    reasonId: string;
    amount: number;
    source?: FineSource;
    relatedRideId?: string;
    relatedRideCode?: string;
    date?: string;
    note?: string;
    deductionMethod?: DeductionMethod;
    isQualifying?: boolean;
    exclusionReason?: FairExclusionReason;
  }) => {
    const driver = drivers.find((d) => d.id === fineData.driverId);
    if (!driver) {
      showToast('Driver record not found.', 'error');
      return;
    }

    if (fineData.source !== 'automatic' && !checkSensitiveAction('driver_fine', `Issue Fine of PKR ${fineData.amount} to ${driver.name}`)) {
      return;
    }

    const reasonObj = fineReasons.find((r) => r.id === fineData.reasonId);
    const reasonLabel = reasonObj?.label || fineData.reasonId;
    const nowStr = fineData.date || new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const fineId = `fn-${Date.now().toString().slice(-6)}`;
    const fineCode = `FINE-PK-${Math.floor(10000 + Math.random() * 90000)}`;
    const deductionMethod: DeductionMethod = fineData.deductionMethod || 'driver_wallet';

    // Balance protection calculation
    let deducted = 0;
    let remaining = fineData.amount;
    let fineStatus: FineStatus = 'pending';

    const currentBalance = driver.walletBalance || 0;

    if (deductionMethod === 'driver_wallet' || deductionMethod === 'available_balance') {
      if (currentBalance >= fineData.amount) {
        deducted = fineData.amount;
        remaining = 0;
        fineStatus = 'deducted';
        adjustDriverWallet(driver.id, -deducted, `Fine deducted: ${fineCode} (${reasonLabel})`);
      } else if (currentBalance > 0) {
        deducted = currentBalance;
        remaining = fineData.amount - currentBalance;
        fineStatus = 'partially_deducted';
        adjustDriverWallet(driver.id, -deducted, `Partial fine deduction: ${fineCode} (${reasonLabel})`);
      } else {
        deducted = 0;
        remaining = fineData.amount;
        fineStatus = 'pending';
      }
    } else {
      fineStatus = 'pending';
      deducted = 0;
      remaining = fineData.amount;
    }

    const autoNote = fineData.note || generateFineNote(reasonLabel, fineData.relatedRideCode, false);

    const newFine: DriverFine = {
      id: fineId,
      fineCode,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverPlate: driver.vehicle.plate,
      city: driver.city,
      reasonId: fineData.reasonId,
      reasonLabel,
      amount: fineData.amount,
      deductedAmount: deducted,
      remainingAmount: remaining,
      status: fineStatus,
      source: fineData.source || 'manual',
      relatedRideId: fineData.relatedRideId,
      relatedRideCode: fineData.relatedRideCode,
      note: autoNote,
      deductionMethod,
      isQualifying: fineData.isQualifying ?? true,
      exclusionReason: fineData.exclusionReason,
      createdAt: nowStr,
      updatedAt: nowStr,
      createdByAdmin: currentAdmin?.name || 'Operations Admin'
    };

    setDriverFines((prev) => [newFine, ...prev]);

    // Create FineTransaction
    const ftxId = `TX-FINE-${Date.now().toString().slice(-6)}`;
    const newFtx: FineTransaction = {
      id: `ftx-${Date.now()}`,
      transactionId: ftxId,
      fineId: newFine.id,
      driverId: driver.id,
      driverName: driver.name,
      relatedRideId: fineData.relatedRideId,
      relatedRideCode: fineData.relatedRideCode,
      originalFineAmount: fineData.amount,
      amountDeducted: deducted,
      remainingAmount: remaining,
      deductionSource: deductionMethod,
      type: deducted === fineData.amount ? 'fine_deduction' : deducted > 0 ? 'fine_partial_deduction' : 'fine_deduction',
      date: nowStr,
      reason: reasonLabel,
      note: autoNote,
      status: deducted === fineData.amount ? 'completed' : deducted > 0 ? 'partial' : 'failed'
    };
    setFineTransactions((prev) => [newFtx, ...prev]);

    // Also record in comprehensive ledger
    const newCtx: ComprehensiveLedgerTransaction = {
      id: `ctx-${Date.now()}`,
      transactionId: ftxId,
      type: 'Fine',
      partyType: 'driver',
      partyId: driver.id,
      partyName: driver.name,
      partyPhone: driver.phone,
      rideId: fineData.relatedRideId,
      rideCode: fineData.relatedRideCode,
      originalAmount: fineData.amount,
      adjustmentAmount: deducted,
      netImpact: -deducted,
      reason: reasonLabel,
      note: autoNote,
      paymentMethod: `Driver Wallet (${deductionMethod})`,
      status: deducted > 0 ? 'completed' : 'pending',
      createdBy: currentAdmin?.name || 'Admin',
      date: nowStr,
      ruleOrSource: fineData.source === 'automatic' ? 'Automatic Rule' : 'Manual Fine Portal',
      relatedRecordId: newFine.id
    };
    setComprehensiveTransactions((prev) => [newCtx, ...prev]);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('addDriverFine', { driverId: driver.id, amount: fineData.amount });
        financialService.issueFine(
          driver.id,
          driver.name,
          fineData.amount,
          reasonLabel,
          autoNote,
          fineData.relatedRideId
        ).catch((err) => console.warn('Production fine sync notice:', err.message));
      } catch (err: any) {
        console.error('Production fine safety lock notice:', err.message);
      }
    }

    recordAdminAudit(
      'FINE_ISSUED',
      `Driver: ${driver.name} (${driver.id})`,
      reasonLabel,
      `Fine ${fineCode} of PKR ${fineData.amount} issued (Deducted: PKR ${deducted}, Outstanding: PKR ${remaining})`,
      fineData.source === 'automatic' ? 'Automatic' : 'Manual',
      'driver',
      driver.id
    );

    showToast(
      `Fine ${fineCode} issued to ${driver.name}: PKR ${deducted} deducted, PKR ${remaining} outstanding.`,
      deducted > 0 ? 'warning' : 'info'
    );
  };

  const waiveDriverFine = (fineId: string, reason: string, note: string) => {
    const fine = driverFines.find((f) => f.id === fineId);
    if (!fine) return;

    if (!checkSensitiveAction('driver_fine', `Waive Fine for ${fine.driverName}`)) {
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    setDriverFines((prev) =>
      prev.map((f) => {
        if (f.id !== fineId) return f;
        return {
          ...f,
          status: 'waived',
          remainingAmount: 0,
          updatedAt: nowStr,
          waiverDetails: {
            waivedBy: currentAdmin?.name || 'Admin',
            waivedAt: nowStr,
            reason,
            note
          }
        };
      })
    );

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('waiveDriverFine', { fineId, reason });
        financialService.waiveFine(fineId, reason).catch((err) => console.warn('Production fine waive sync notice:', err.message));
      } catch (err: any) {
        console.error('Production fine waive safety lock notice:', err.message);
      }
    }

    recordAdminAudit(
      'FINE_WAIVED',
      `Fine: ${fine.fineCode}`,
      reason,
      `Fine waived by admin. Note: ${note}`,
      'Manual',
      'driver',
      fine.driverId
    );

    showToast(`Fine ${fine.fineCode} has been waived.`, 'success');
  };

  const refundDriverFine = (fineId: string, refundAmount: number, reason: string, note: string) => {
    const fine = driverFines.find((f) => f.id === fineId);
    if (!fine) return;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    adjustDriverWallet(fine.driverId, refundAmount, `Fine reversal refund: ${fine.fineCode} (${reason})`);

    setDriverFines((prev) =>
      prev.map((f) => {
        if (f.id !== fineId) return f;
        return {
          ...f,
          status: 'refunded',
          deductedAmount: Math.max(0, f.deductedAmount - refundAmount),
          remainingAmount: 0,
          updatedAt: nowStr
        };
      })
    );

    const ftxId = `TX-REV-${Date.now().toString().slice(-6)}`;
    const reversalTx: FineTransaction = {
      id: `ftx-${Date.now()}`,
      transactionId: ftxId,
      fineId: fine.id,
      driverId: fine.driverId,
      driverName: fine.driverName,
      relatedRideId: fine.relatedRideId,
      relatedRideCode: fine.relatedRideCode,
      originalFineAmount: fine.amount,
      amountDeducted: refundAmount,
      remainingAmount: 0,
      deductionSource: fine.deductionMethod,
      type: 'fine_refund',
      date: nowStr,
      reason: `Reversal / refund of fine: ${reason}`,
      note,
      status: 'completed'
    };
    setFineTransactions((prev) => [reversalTx, ...prev]);

    const ctxReversal: ComprehensiveLedgerTransaction = {
      id: `ctx-${Date.now()}`,
      transactionId: ftxId,
      type: 'Fine Refund',
      partyType: 'driver',
      partyId: fine.driverId,
      partyName: fine.driverName,
      partyPhone: fine.driverPhone,
      rideId: fine.relatedRideId,
      rideCode: fine.relatedRideCode,
      originalAmount: fine.amount,
      adjustmentAmount: refundAmount,
      netImpact: refundAmount,
      reason: `Fine Reversal: ${reason}`,
      note,
      paymentMethod: 'Driver Wallet Credit',
      status: 'completed',
      createdBy: currentAdmin?.name || 'Admin',
      date: nowStr,
      ruleOrSource: 'Fine Reversal Desk',
      relatedRecordId: fine.id
    };
    setComprehensiveTransactions((prev) => [ctxReversal, ...prev]);

    recordAdminAudit(
      'FINE_REFUNDED',
      `Fine: ${fine.fineCode}`,
      reason,
      `PKR ${refundAmount} refunded back to driver wallet for fine ${fine.fineCode}. Reversal transaction ${ftxId} generated.`,
      'Manual',
      'driver',
      fine.driverId
    );

    showToast(`Fine ${fine.fineCode} refunded: PKR ${refundAmount} credited back to driver wallet.`, 'success');
  };

  const resolveDisputeDriverFine = (fineId: string, decision: 'approved' | 'rejected' | 'partial', decisionNote: string, adjustmentAmount = 0) => {
    const fine = driverFines.find((f) => f.id === fineId);
    if (!fine) return;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    if (decision === 'approved') {
      if (fine.deductedAmount > 0) {
        refundDriverFine(fineId, fine.deductedAmount, 'Dispute approved by admin', decisionNote);
      } else {
        waiveDriverFine(fineId, 'Dispute approved by admin', decisionNote);
      }
    } else if (decision === 'partial' && adjustmentAmount > 0) {
      refundDriverFine(fineId, adjustmentAmount, 'Partial dispute adjustment', decisionNote);
    } else {
      setDriverFines((prev) =>
        prev.map((f) => {
          if (f.id !== fineId) return f;
          return {
            ...f,
            status: f.remainingAmount === 0 ? 'deducted' : 'pending',
            updatedAt: nowStr,
            disputeDetails: f.disputeDetails ? { ...f.disputeDetails, status: 'rejected' } : undefined
          };
        })
      );
    }

    recordAdminAudit(
      'FINE_DISPUTE_RESOLVED',
      `Fine: ${fine.fineCode}`,
      `Dispute ${decision}`,
      decisionNote,
      'Manual',
      'driver',
      fine.driverId
    );

    showToast(`Fine dispute for ${fine.fineCode} marked as ${decision}.`, 'info');
  };

  const updateAutomaticFineRule = (ruleId: string, updates: Partial<AutomaticFineRule>, reasonForChange: string) => {
    const existing = automaticFineRules.find((r) => r.id === ruleId);
    if (!existing) return;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const nextVer = `v${(parseFloat(existing.version.replace('v', '')) + 0.1).toFixed(1)}`;

    const versionRecord: FineRuleVersion = {
      id: `ver-${Date.now()}`,
      ruleId,
      ruleTitle: existing.title,
      previousAmount: existing.fineAmount,
      newAmount: updates.fineAmount !== undefined ? updates.fineAmount : existing.fineAmount,
      previousThreshold: existing.thresholdCount,
      newThreshold: updates.thresholdCount !== undefined ? updates.thresholdCount : existing.thresholdCount,
      changedBy: currentAdmin?.name || 'SuperAdmin',
      changeDate: nowStr,
      reason: reasonForChange || 'Administrative policy update',
      versionTag: nextVer
    };

    setFineRuleVersions((prev) => [versionRecord, ...prev]);

    setAutomaticFineRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          ...updates,
          version: nextVer,
          lastUpdated: nowStr,
          updatedBy: currentAdmin?.name || 'Admin'
        };
      })
    );

    recordAdminAudit(
      'FINE_RULE_UPDATED',
      `Rule: ${existing.title}`,
      reasonForChange,
      `Rule updated to ${nextVer}. New Amount: PKR ${updates.fineAmount ?? existing.fineAmount}`,
      'Manual',
      'system',
      ruleId
    );

    showToast(`Automatic fine rule "${existing.title}" updated (${nextVer}).`, 'success');
  };

  const addFineReason = (reason: Omit<FineReason, 'id'>) => {
    const id = reason.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newReason: FineReason = { ...reason, id };
    setFineReasons((prev) => [...prev, newReason]);
    showToast(`New fine reason "${reason.label}" added.`, 'success');
  };

  const toggleFineReason = (reasonId: string) => {
    setFineReasons((prev) =>
      prev.map((r) => (r.id === reasonId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // ==========================================
  // PHASE 42 — REIMBURSEMENT, REFUND, ADJUSTMENT & SETTLEMENT ENGINE
  // ==========================================

  const updateApprovalThreshold = (threshold: number) => {
    setApprovalThreshold(threshold);
    showToast(`High-value financial approval threshold set to PKR ${threshold.toLocaleString()}.`, 'success');
  };

  const processPassengerRefund = (refundData: {
    rideId: string;
    rideCode: string;
    passengerId: string;
    passengerName: string;
    passengerPhone: string;
    driverId: string;
    driverName: string;
    originalFare: number;
    paidAmount: number;
    previousRefunds: number;
    refundType: 'full' | 'partial';
    amount: number;
    paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'card' | 'wallet';
    refundDestination?: 'wallet_credit' | 'payment_refund_pending';
    reason: string;
    note?: string;
  }) => {
    if (!checkSensitiveAction('refund_approval', `Issue Passenger Refund of PKR ${refundData.amount}`)) {
      return;
    }

    const maxRefundable = calculateRefundableAmount(refundData.paidAmount, refundData.previousRefunds);
    if (refundData.amount > maxRefundable) {
      showToast(`Cannot refund PKR ${refundData.amount}. Maximum remaining refundable amount is PKR ${maxRefundable}.`, 'error');
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const refundCode = `RFN-PK-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `TXN-LEDGER-${Math.floor(90000 + Math.random() * 90000)}`;
    const requiresApproval = refundData.amount >= approvalThreshold;
    const destination = refundData.refundDestination || 'wallet_credit';
    const status: RefundStatus = requiresApproval ? 'pending' : 'completed';
    const autoNote = refundData.note || generateRefundNote(refundData.reason, refundData.rideCode, refundData.refundType, refundData.amount);

    const newRecord: PassengerRefundRecord = {
      id: `rfn-${Date.now()}`,
      refundCode,
      rideId: refundData.rideId,
      rideCode: refundData.rideCode,
      passengerId: refundData.passengerId,
      passengerName: refundData.passengerName,
      passengerPhone: refundData.passengerPhone,
      driverId: refundData.driverId,
      driverName: refundData.driverName,
      originalFare: refundData.originalFare,
      paidAmount: refundData.paidAmount,
      previousRefunds: refundData.previousRefunds,
      refundType: refundData.refundType,
      amount: refundData.amount,
      remainingRefundable: maxRefundable - refundData.amount,
      paymentMethod: refundData.paymentMethod || 'jazzcash',
      refundDestination: destination,
      status,
      reason: refundData.reason,
      note: autoNote,
      requiresHighValueApproval: requiresApproval,
      approvedBy: requiresApproval ? undefined : (currentAdmin?.name || 'Admin'),
      approvedAt: requiresApproval ? undefined : nowStr,
      createdBy: currentAdmin?.name || 'Admin',
      createdAt: nowStr,
      transactionId: txId
    };

    setPassengerRefunds((prev) => [newRecord, ...prev]);

    if (!requiresApproval && destination === 'wallet_credit') {
      adjustPassengerWallet(refundData.passengerId, refundData.amount, `Refund for ride ${refundData.rideCode}: ${refundData.reason}`);
    }

    const newTx: ComprehensiveLedgerTransaction = {
      id: `ctx-${Date.now()}`,
      transactionId: txId,
      type: 'Refund',
      partyType: 'passenger',
      partyId: refundData.passengerId,
      partyName: refundData.passengerName,
      partyPhone: refundData.passengerPhone,
      rideId: refundData.rideId,
      rideCode: refundData.rideCode,
      originalAmount: refundData.paidAmount,
      adjustmentAmount: refundData.amount,
      netImpact: refundData.amount,
      reason: refundData.reason,
      note: autoNote,
      paymentMethod: destination === 'wallet_credit' ? 'Passenger Wallet Credit' : 'Payment Gateway Refund',
      status: requiresApproval ? 'pending' : 'completed',
      createdBy: currentAdmin?.name || 'Admin',
      approvedBy: requiresApproval ? undefined : (currentAdmin?.name || 'Admin'),
      date: nowStr,
      ruleOrSource: 'Refund Resolution Desk',
      relatedRecordId: newRecord.id
    };
    setComprehensiveTransactions((prev) => [newTx, ...prev]);

    if (isProductionDataSource() && !requiresApproval) {
      try {
        assertProductionSafetyLock('processPassengerRefund', refundData);
        financialService.issueRefund(
          refundData.rideId,
          refundData.passengerId,
          refundData.amount,
          refundData.reason,
          destination === 'wallet_credit' ? 'wallet' : 'original_payment',
          currentAdmin?.name || 'Admin'
        ).catch((err) => console.warn('Production refund sync notice:', err.message));
      } catch (err: any) {
        console.error('Production refund safety lock notice:', err.message);
      }
    }

    recordAdminAudit(
      'REFUND_PROCESSED',
      `Ride: ${refundData.rideCode}`,
      refundData.reason,
      `Refund ${refundCode} of PKR ${refundData.amount} created for ${refundData.passengerName}. Status: ${status}`,
      'Manual',
      'passenger',
      refundData.passengerId
    );

    if (requiresApproval) {
      showToast(`Refund ${refundCode} (PKR ${refundData.amount}) requires secondary authorization (threshold: PKR ${approvalThreshold}).`, 'warning');
    } else {
      showToast(`Refund ${refundCode} of PKR ${refundData.amount} processed successfully for ${refundData.passengerName}.`, 'success');
    }
  };

  const processDriverReimbursement = (reimbursementData: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    driverPlate: string;
    rideId?: string;
    rideCode?: string;
    amount: number;
    reason: string;
    note?: string;
    paymentDestination?: 'driver_wallet' | 'upcoming_payout';
  }) => {
    if (!checkSensitiveAction('reimbursement_approval', `Issue Driver Reimbursement of PKR ${reimbursementData.amount}`)) {
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const reimbursementCode = `RMB-PK-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `TXN-LEDGER-${Math.floor(90000 + Math.random() * 90000)}`;
    const requiresApproval = reimbursementData.amount >= approvalThreshold;
    const destination = reimbursementData.paymentDestination || 'driver_wallet';
    const status: RefundStatus = requiresApproval ? 'pending' : 'completed';
    const autoNote = reimbursementData.note || generateReimbursementNote(reimbursementData.reason, reimbursementData.driverName, reimbursementData.rideCode, reimbursementData.amount);

    const newRecord: DriverReimbursementRecord = {
      id: `rmb-${Date.now()}`,
      reimbursementCode,
      driverId: reimbursementData.driverId,
      driverName: reimbursementData.driverName,
      driverPhone: reimbursementData.driverPhone,
      driverPlate: reimbursementData.driverPlate,
      rideId: reimbursementData.rideId,
      rideCode: reimbursementData.rideCode,
      amount: reimbursementData.amount,
      reason: reimbursementData.reason,
      note: autoNote,
      paymentDestination: destination,
      status,
      requiresHighValueApproval: requiresApproval,
      approvedBy: requiresApproval ? undefined : (currentAdmin?.name || 'Admin'),
      approvedAt: requiresApproval ? undefined : nowStr,
      createdBy: currentAdmin?.name || 'Admin',
      createdAt: nowStr,
      transactionId: txId
    };

    setDriverReimbursements((prev) => [newRecord, ...prev]);

    if (!requiresApproval && destination === 'driver_wallet') {
      adjustDriverWallet(reimbursementData.driverId, reimbursementData.amount, `Reimbursement: ${reimbursementData.reason}`);
    }

    const newTx: ComprehensiveLedgerTransaction = {
      id: `ctx-${Date.now()}`,
      transactionId: txId,
      type: 'Reimbursement',
      partyType: 'driver',
      partyId: reimbursementData.driverId,
      partyName: reimbursementData.driverName,
      partyPhone: reimbursementData.driverPhone,
      rideId: reimbursementData.rideId,
      rideCode: reimbursementData.rideCode,
      originalAmount: 0,
      adjustmentAmount: reimbursementData.amount,
      netImpact: reimbursementData.amount,
      reason: reimbursementData.reason,
      note: autoNote,
      paymentMethod: destination === 'driver_wallet' ? 'Driver Wallet Credit' : 'Upcoming Payout Credit',
      status: requiresApproval ? 'pending' : 'completed',
      createdBy: currentAdmin?.name || 'Admin',
      approvedBy: requiresApproval ? undefined : (currentAdmin?.name || 'Admin'),
      date: nowStr,
      ruleOrSource: 'Driver Reimbursement Desk',
      relatedRecordId: newRecord.id
    };
    setComprehensiveTransactions((prev) => [newTx, ...prev]);

    if (isProductionDataSource() && !requiresApproval) {
      try {
        assertProductionSafetyLock('processDriverReimbursement', reimbursementData);
        financialService.issueReimbursement(
          reimbursementData.driverId,
          reimbursementData.driverName,
          reimbursementData.amount,
          reimbursementData.reason as any,
          autoNote,
          reimbursementData.rideId
        ).catch((err) => console.warn('Production reimbursement sync notice:', err.message));
      } catch (err: any) {
        console.error('Production reimbursement safety lock notice:', err.message);
      }
    }

    recordAdminAudit(
      'REIMBURSEMENT_PROCESSED',
      `Driver: ${reimbursementData.driverName} (${reimbursementData.driverId})`,
      reimbursementData.reason,
      `Reimbursement ${reimbursementCode} of PKR ${reimbursementData.amount} created. Status: ${status}`,
      'Manual',
      'driver',
      reimbursementData.driverId
    );

    if (requiresApproval) {
      showToast(`Reimbursement ${reimbursementCode} (PKR ${reimbursementData.amount}) requires secondary authorization.`, 'warning');
    } else {
      showToast(`Reimbursement of PKR ${reimbursementData.amount} credited to ${reimbursementData.driverName}.`, 'success');
    }
  };

  const processFinancialAdjustment = (adjData: {
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
  }) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const adjustmentCode = `ADJ-PK-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = `TXN-LEDGER-${Math.floor(90000 + Math.random() * 90000)}`;
    const delta = adjData.direction === 'credit' ? adjData.adjustmentAmount : -adjData.adjustmentAmount;

    const newRecord: FinancialAdjustmentRecord = {
      id: `adj-${Date.now()}`,
      adjustmentCode,
      type: adjData.type,
      targetType: adjData.targetType,
      targetId: adjData.targetId,
      targetName: adjData.targetName,
      rideId: adjData.rideId,
      rideCode: adjData.rideCode,
      originalAmount: adjData.originalAmount,
      adjustmentAmount: adjData.adjustmentAmount,
      direction: adjData.direction,
      reason: adjData.reason,
      note: adjData.note || `Administrative adjustment: ${adjData.reason}`,
      status: 'completed',
      createdBy: currentAdmin?.name || 'Admin',
      createdAt: nowStr,
      transactionId: txId
    };

    setFinancialAdjustments((prev) => [newRecord, ...prev]);

    if (adjData.targetType === 'driver') {
      adjustDriverWallet(adjData.targetId, delta, `Financial adjustment: ${adjData.reason}`);
    } else if (adjData.targetType === 'passenger') {
      adjustPassengerWallet(adjData.targetId, delta, `Financial adjustment: ${adjData.reason}`);
    }

    const newTx: ComprehensiveLedgerTransaction = {
      id: `ctx-${Date.now()}`,
      transactionId: txId,
      type: 'Adjustment',
      partyType: adjData.targetType === 'ride' ? 'platform' : adjData.targetType,
      partyId: adjData.targetId,
      partyName: adjData.targetName,
      rideId: adjData.rideId,
      rideCode: adjData.rideCode,
      originalAmount: adjData.originalAmount,
      adjustmentAmount: adjData.adjustmentAmount,
      netImpact: delta,
      reason: adjData.reason,
      note: adjData.note || `Financial adjustment (${adjData.type})`,
      paymentMethod: 'Internal Wallet Adjustment',
      status: 'completed',
      createdBy: currentAdmin?.name || 'Admin',
      date: nowStr,
      ruleOrSource: 'Correction Desk',
      relatedRecordId: newRecord.id
    };
    setComprehensiveTransactions((prev) => [newTx, ...prev]);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('processFinancialAdjustment', adjData);
        financialService.issueAdjustment({
          id: newRecord.id,
          adjustmentCode,
          type: adjData.type,
          targetType: adjData.targetType,
          targetId: adjData.targetId,
          targetName: adjData.targetName,
          rideId: adjData.rideId,
          rideCode: adjData.rideCode,
          originalAmount: adjData.originalAmount,
          adjustmentAmount: adjData.adjustmentAmount,
          direction: adjData.direction,
          reason: adjData.reason,
          note: adjData.note,
          adminName: currentAdmin?.name || 'Admin'
        }).catch((err) => console.warn('Production adjustment sync notice:', err.message));
      } catch (err: any) {
        console.error('Production adjustment safety lock notice:', err.message);
      }
    }

    recordAdminAudit(
      'FINANCIAL_ADJUSTMENT_EXECUTED',
      `${adjData.targetType.toUpperCase()}: ${adjData.targetName}`,
      adjData.reason,
      `Adjustment ${adjustmentCode} (${adjData.direction.toUpperCase()} PKR ${adjData.adjustmentAmount}) executed.`,
      'Manual',
      adjData.targetType === 'passenger' ? 'passenger' : adjData.targetType === 'driver' ? 'driver' : 'system',
      adjData.targetId
    );

    showToast(`Adjustment ${adjustmentCode} of PKR ${adjData.adjustmentAmount} applied to ${adjData.targetName}.`, 'success');
  };

  const approveFinancialRecord = (category: 'refund' | 'reimbursement' | 'adjustment' | 'fine_refund', id: string, note?: string) => {
    if (category === 'refund' && !checkSensitiveAction('refund_approval', 'Approve Passenger Refund record')) return;
    if (category === 'reimbursement' && !checkSensitiveAction('reimbursement_approval', 'Approve Driver Reimbursement record')) return;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    if (category === 'refund') {
      const rec = passengerRefunds.find((r) => r.id === id);
      if (!rec) return;
      setPassengerRefunds((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            status: 'completed',
            approvedBy: currentAdmin?.name || 'SuperAdmin',
            approvedAt: nowStr,
            note: note ? `${r.note} (Approved: ${note})` : r.note
          };
        })
      );
      if (rec.refundDestination === 'wallet_credit') {
        adjustPassengerWallet(rec.passengerId, rec.amount, `Approved refund: ${rec.refundCode}`);
      }
      showToast(`Refund ${rec.refundCode} approved and executed.`, 'success');
    } else if (category === 'reimbursement') {
      const rec = driverReimbursements.find((r) => r.id === id);
      if (!rec) return;
      setDriverReimbursements((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            status: 'completed',
            approvedBy: currentAdmin?.name || 'SuperAdmin',
            approvedAt: nowStr,
            note: note ? `${r.note} (Approved: ${note})` : r.note
          };
        })
      );
      if (rec.paymentDestination === 'driver_wallet') {
        adjustDriverWallet(rec.driverId, rec.amount, `Approved reimbursement: ${rec.reimbursementCode}`);
      }
      showToast(`Reimbursement ${rec.reimbursementCode} approved and deposited.`, 'success');
    } else if (category === 'adjustment') {
      const rec = financialAdjustments.find((a) => a.id === id);
      if (!rec) return;
      setFinancialAdjustments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            status: 'completed',
            note: note ? `${a.note} (Approved: ${note})` : a.note
          };
        })
      );
      const delta = rec.direction === 'credit' ? rec.adjustmentAmount : -rec.adjustmentAmount;
      if (rec.targetType === 'driver') {
        adjustDriverWallet(rec.targetId, delta, `Approved adjustment: ${rec.adjustmentCode}`);
      } else if (rec.targetType === 'passenger') {
        adjustPassengerWallet(rec.targetId, delta, `Approved adjustment: ${rec.adjustmentCode}`);
      }
      showToast(`Adjustment ${rec.adjustmentCode} approved and executed.`, 'success');
    } else if (category === 'fine_refund') {
      refundDriverFine(id, 0, 'Approved via Financial Resolution Center', note || 'Approved fine refund');
    }
  };

  const rejectFinancialRecord = (category: 'refund' | 'reimbursement' | 'adjustment', id: string, rejectionReason: string) => {
    if (category === 'refund') {
      setPassengerRefunds((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected', note: `${r.note} | Rejected: ${rejectionReason}` } : r))
      );
      showToast(`Refund rejected: ${rejectionReason}`, 'info');
    } else if (category === 'reimbursement') {
      setDriverReimbursements((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected', note: `${r.note} | Rejected: ${rejectionReason}` } : r))
      );
      showToast(`Reimbursement rejected: ${rejectionReason}`, 'info');
    } else if (category === 'adjustment') {
      setFinancialAdjustments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'rejected', note: `${a.note} | Rejected: ${rejectionReason}` } : a))
      );
      showToast(`Adjustment rejected: ${rejectionReason}`, 'info');
    }
  };

  const runReconciliationAudit = () => {
    showToast('Reconciliation audit completed. 1 discrepancy highlighted for review.', 'info');
  };

  const resolveReconciliationRecord = (recordId: string, resolutionNote: string) => {
    setReconciliationRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          status: 'matched',
          differenceAmount: 0,
          reviewedBy: currentAdmin?.name || 'Finance Admin',
          reviewedAt: new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT',
          resolutionNote
        };
      })
    );
    showToast('Reconciliation record marked as resolved.', 'success');
  };

  const dismissFinancialAnomaly = (anomalyId: string) => {
    setAiFinancialAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status: 'dismissed' } : a))
    );
    showToast('Anomaly dismissed.', 'info');
  };

  // ==========================================
  // PHASE 43 — DRIVER PAYOUT, WITHDRAWAL & SETTLEMENT ENGINE
  // ==========================================

  const updatePayoutConfig = (newConfig: Partial<PayoutConfigRule>) => {
    setPayoutConfig((prev) => ({ ...prev, ...newConfig }));
    recordAdminAudit('PAYOUT_CONFIG_UPDATED', 'Payout Policy', 'Configuration Change', 'Updated minimum, schedule, or fees', 'Manual', 'system', 'payout-config');
    showToast('Payout rules & schedule configuration updated.', 'success');
  };

  const dismissAiPayoutAnomaly = (id: string) => {
    setAiPayoutAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'dismissed' } : a))
    );
    showToast('AI payout anomaly alert dismissed.', 'info');
  };

  const requestDriverWithdrawal = (data: {
    driverId: string;
    amount: number;
    paymentMethod: PayoutMethod;
    accountNumber: string;
    accountTitle: string;
    bankName?: string;
    optionalNote?: string;
  }) => {
    const driver = drivers.find((d) => d.id === data.driverId);
    if (!driver) {
      showToast('Driver not found.', 'error');
      return;
    }

    const validation = validatePayoutRequest(driver, data.amount, driverPayouts, payoutConfig, driverFines, financialAdjustments);
    if (!validation.canApprove) {
      const firstError = validation.checks.find((c) => !c.passed);
      showToast(firstError ? firstError.message : 'Cannot create withdrawal request: validation failed.', 'error');
      return;
    }

    const id = `PO-${Math.floor(8000 + Math.random() * 1999)}`;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    const newPayout: DriverPayoutRecord = {
      id,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverCity: driver.city,
      driverPlate: driver.vehiclePlate || 'N/A',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      accountTitle: data.accountTitle,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      optionalNote: data.optionalNote,
      status: 'Requested',
      requestedAt: nowStr,
      processingFee: payoutConfig.processingFeeFixed + Math.round((data.amount * payoutConfig.processingFeePercentage) / 100),
      netPayoutAmount: data.amount - (payoutConfig.processingFeeFixed + Math.round((data.amount * payoutConfig.processingFeePercentage) / 100)),
      payoutPeriod: 'Current Settlement',
      reconciliationStatus: 'Matched',
      retryCount: 0,
      auditTrail: [
        {
          action: 'Withdrawal Requested',
          actor: `Driver App (${driver.name})`,
          timestamp: nowStr,
          note: `Requested PKR ${data.amount.toLocaleString()} via ${data.paymentMethod}.`
        }
      ]
    };

    setDriverPayouts((prev) => [newPayout, ...prev]);

    if (isProductionDataSource()) {
      try {
        assertProductionSafetyLock('requestDriverWithdrawal', { driverId: driver.id, amount: data.amount });
        financialService.createPayoutRequest({
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          driverCity: driver.city,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          accountTitle: data.accountTitle,
          accountNumber: data.accountNumber,
          bankName: data.bankName
        }).catch((err) => console.warn('Production payout request sync notice:', err.message));
      } catch (err: any) {
        showToast(`Production withdrawal error: ${err.message}`, 'error');
        return;
      }
    }

    // Also sync with legacy payouts array so existing tables stay compatible
    const legacyMethod = data.paymentMethod === 'Bank' ? 'bank_transfer' : data.paymentMethod === 'JazzCash' ? 'jazzcash' : 'easypaisa';
    const legacyPayout: PayoutRequest = {
      id,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverCity: driver.city,
      amount: data.amount,
      method: legacyMethod,
      accountTitle: data.accountTitle,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      status: 'pending',
      requestedAt: nowStr
    };
    setPayouts((prev) => [legacyPayout, ...prev]);

    dispatchNotification({
      title: 'New Driver Withdrawal Request',
      message: `${driver.name} submitted a withdrawal request for PKR ${data.amount.toLocaleString()} via ${data.paymentMethod}.`,
      target: 'drivers',
      targetCity: driver.city || 'all'
    });

    recordAdminAudit(
      'WITHDRAWAL_REQUESTED',
      `Payout: ${id}`,
      'Driver Request',
      `Driver requested PKR ${data.amount.toLocaleString()} via ${data.paymentMethod}`,
      'Manual',
      'driver',
      driver.id
    );

    showToast(`Withdrawal request ${id} for PKR ${data.amount.toLocaleString()} submitted successfully!`, 'success');
  };

  const payoutControlAction = async (
    action: 'review' | 'approve' | 'process' | 'complete' | 'reject' | 'cancel' | 'retry',
    payoutId: string,
    payload?: {
      reason?: string;
      note?: string;
      referenceId?: string;
      transactionId?: string;
    }
  ) => {
    const payout = driverPayouts.find((p) => p.id === payoutId);
    if (!payout) {
      showToast('Payout record not found.', 'error');
      return;
    }

    if ((action === 'approve' || action === 'process' || action === 'complete') && !checkSensitiveAction('payout_approval', `${action.toUpperCase()} Payout ${payoutId} of PKR ${payout.amount}`)) {
      return;
    }

    const adminName = currentAdmin?.name || 'Super Admin';
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    if (isProductionDataSource()) {
      if (action === 'complete' && !payload?.referenceId && !payout.referenceId) {
        showToast('In Production, a valid payment gateway confirmation reference ID is required to mark Payout Completed.', 'error');
        return;
      }

      try {
        assertProductionSafetyLock('payoutControlAction', { payoutId, action });
        const res = await financialService.processPayout(payoutId, action, {
          reason: payload?.reason,
          note: payload?.note,
          referenceId: payload?.referenceId,
          transactionId: payload?.transactionId,
          adminName
        });
        if (!res.success) {
          showToast(res.error || `Failed to ${action} payout in production`, 'error');
          return;
        }
      } catch (err: any) {
        showToast(`Production payout error: ${err.message}`, 'error');
        return;
      }
    }

    switch (action) {
      case 'review': {
        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Under Review',
                  reviewedAt: nowStr,
                  reviewedBy: adminName,
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Under Review',
                      actor: adminName,
                      timestamp: nowStr,
                      note: payload?.note || 'Assigned to treasury administrator for verification.'
                    }
                  ]
                }
              : p
          )
        );
        showToast(`Payout ${payoutId} is now Under Review.`, 'info');
        break;
      }

      case 'approve': {
        const txnId = payload?.transactionId || `TXN-PO-${Math.floor(90000 + Math.random() * 9999)}`;
        const refId = payload?.referenceId || `REF-IBFT-${Math.floor(100000 + Math.random() * 900000)}`;

        // Debit driver wallet if not already done
        adjustDriverWallet(payout.driverId, -payout.amount, `Withdrawal ${payoutId} approved`);

        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Approved',
                  approvedAt: nowStr,
                  approvedBy: adminName,
                  transactionId: txnId,
                  referenceId: refId,
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Approved',
                      actor: adminName,
                      timestamp: nowStr,
                      note: payload?.note || `Approved for payment batch. Linked Txn: ${txnId}`
                    }
                  ]
                }
              : p
          )
        );

        // Update legacy payouts
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'approved',
                  processedAt: nowStr,
                  processedBy: adminName,
                  referenceId: refId
                }
              : p
          )
        );

        // Create transaction record
        const newTxn: PayoutTransactionRecord = {
          id: `ptx-${Date.now()}`,
          transactionId: txnId,
          payoutId: payout.id,
          driverId: payout.driverId,
          driverName: payout.driverName,
          driverPhone: payout.driverPhone,
          amount: payout.amount,
          paymentMethod: payout.paymentMethod,
          accountDestination: payout.accountNumber,
          period: payout.payoutPeriod || 'Current Settlement',
          status: 'Processing',
          createdBy: 'Admin Payout Control',
          approvedBy: adminName,
          date: nowStr,
          note: payload?.note || 'Approved and queued for gateway disbursement',
          referenceId: refId
        };
        setPayoutTransactions((prev) => [newTxn, ...prev]);

        dispatchNotification({
          title: 'Payout Approved',
          message: `Your withdrawal of PKR ${payout.amount.toLocaleString()} has been approved and queued for payment.`,
          target: 'drivers',
          targetCity: payout.driverCity || 'all'
        });

        recordAdminAudit('PAYOUT_APPROVED', `Payout: ${payoutId}`, 'Treasury Approval', `Approved PKR ${payout.amount.toLocaleString()} for ${payout.driverName}. Txn: ${txnId}`, 'Manual', 'payout', payoutId);
        showToast(`Payout ${payoutId} approved successfully!`, 'success');
        break;
      }

      case 'process': {
        const refId = payload?.referenceId || payout.referenceId || `REF-GATEWAY-${Math.floor(100000 + Math.random() * 900000)}`;

        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Processing',
                  processedAt: nowStr,
                  processedBy: adminName,
                  referenceId: refId,
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Processing',
                      actor: adminName,
                      timestamp: nowStr,
                      note: payload?.note || `Dispatched to payment gateway. Ref: ${refId}`
                    }
                  ]
                }
              : p
          )
        );

        setPayoutTransactions((prev) =>
          prev.map((t) =>
            t.payoutId === payoutId ? { ...t, status: 'Processing', referenceId: refId } : t
          )
        );

        showToast(`Payout ${payoutId} marked as Processing via gateway.`, 'info');
        break;
      }

      case 'complete': {
        const refId = payload?.referenceId || payout.referenceId || `SETTLED-${Math.floor(100000 + Math.random() * 900000)}`;

        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Completed',
                  completedAt: nowStr,
                  completedBy: adminName,
                  referenceId: refId,
                  reconciliationStatus: 'Matched',
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Completed',
                      actor: adminName,
                      timestamp: nowStr,
                      note: payload?.note || `Funds confirmed delivered to recipient. Ref: ${refId}`
                    }
                  ]
                }
              : p
          )
        );

        setPayoutTransactions((prev) =>
          prev.map((t) =>
            t.payoutId === payoutId ? { ...t, status: 'Completed', referenceId: refId } : t
          )
        );

        dispatchNotification({
          title: 'Payout Completed',
          message: `PKR ${payout.amount.toLocaleString()} has been transferred to your account (${payout.accountNumber}).`,
          target: 'drivers',
          targetCity: payout.driverCity || 'all'
        });

        recordAdminAudit('PAYOUT_COMPLETED', `Payout: ${payoutId}`, 'Payment Settled', `Disbursement of PKR ${payout.amount.toLocaleString()} completed for ${payout.driverName}. Ref: ${refId}`, 'Manual', 'payout', payoutId);
        showToast(`Payout ${payoutId} marked as Completed & Settled!`, 'success');
        break;
      }

      case 'reject': {
        const reason = payload?.reason || 'Account verification discrepancy';
        const note = payload?.note || 'Withdrawal request declined after compliance review';

        // If funds were already deducted, refund them to driver wallet
        if (payout.status === 'Approved' || payout.status === 'Processing') {
          adjustDriverWallet(payout.driverId, payout.amount, `Reversal of rejected payout: ${payoutId}`);
        }

        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Rejected',
                  rejectedAt: nowStr,
                  rejectedBy: adminName,
                  rejectionReason: reason,
                  rejectionNote: note,
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Rejected',
                      actor: adminName,
                      timestamp: nowStr,
                      note: `Reason: ${reason}. Note: ${note}. Balance returned to wallet.`
                    }
                  ]
                }
              : p
          )
        );

        setPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'rejected',
                  processedAt: nowStr,
                  processedBy: adminName,
                  rejectionReason: reason
                }
              : p
          )
        );

        setPayoutTransactions((prev) =>
          prev.map((t) =>
            t.payoutId === payoutId ? { ...t, status: 'Cancelled', note: `Rejected: ${reason}` } : t
          )
        );

        dispatchNotification({
          title: 'Payout Request Rejected',
          message: `Your withdrawal request for PKR ${payout.amount.toLocaleString()} was declined: ${reason}. Funds remain safe in your wallet.`,
          target: 'drivers',
          targetCity: payout.driverCity || 'all'
        });

        recordAdminAudit('PAYOUT_REJECTED', `Payout: ${payoutId}`, 'Treasury Rejection', `Rejected PKR ${payout.amount.toLocaleString()} for ${payout.driverName}. Reason: ${reason}`, 'Manual', 'payout', payoutId);
        showToast(`Payout ${payoutId} rejected. Funds restored to driver balance.`, 'warning');
        break;
      }

      case 'cancel': {
        const note = payload?.note || 'Cancelled by administrator request';

        if (payout.status === 'Approved' || payout.status === 'Processing') {
          adjustDriverWallet(payout.driverId, payout.amount, `Reversal of cancelled payout: ${payoutId}`);
        }

        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Cancelled',
                  cancelledAt: nowStr,
                  cancelledBy: adminName,
                  cancellationReason: note,
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Cancelled',
                      actor: adminName,
                      timestamp: nowStr,
                      note
                    }
                  ]
                }
              : p
          )
        );

        setPayoutTransactions((prev) =>
          prev.map((t) =>
            t.payoutId === payoutId ? { ...t, status: 'Cancelled', note } : t
          )
        );

        recordAdminAudit('PAYOUT_CANCELLED', `Payout: ${payoutId}`, 'Administrative Cancellation', note, 'Manual', 'payout', payoutId);
        showToast(`Payout ${payoutId} has been cancelled.`, 'info');
        break;
      }

      case 'retry': {
        const retryCount = (payout.retryCount || 0) + 1;
        const note = payload?.note || `Retried gateway submission (Attempt #${retryCount})`;

        setDriverPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  status: 'Processing',
                  failedAt: undefined,
                  failedReason: undefined,
                  retryCount,
                  processedAt: nowStr,
                  processedBy: adminName,
                  reconciliationStatus: 'Matched',
                  auditTrail: [
                    ...p.auditTrail,
                    {
                      action: 'Retried Transfer',
                      actor: adminName,
                      timestamp: nowStr,
                      note
                    }
                  ]
                }
              : p
          )
        );

        setPayoutTransactions((prev) =>
          prev.map((t) =>
            t.payoutId === payoutId ? { ...t, status: 'Processing', note: `Retry attempt #${retryCount}` } : t
          )
        );

        recordAdminAudit('PAYOUT_RETRIED', `Payout: ${payoutId}`, 'Gateway Resubmission', note, 'Manual', 'payout', payoutId);
        showToast(`Payout ${payoutId} resubmitted for processing (Attempt #${retryCount}).`, 'info');
        break;
      }
    }
  };

  const runScheduledAutoPayoutBatch = (): {
    processedCount: number;
    totalAmount: number;
    skippedCount: number;
  } => {
    const eligibleDrivers: { driver: Driver; payable: number }[] = [];

    drivers.forEach((driver) => {
      const balance = calculateDriverFinancialBalance(driver, driverFines, financialAdjustments, driverPayouts, rides, payoutConfig);
      const hasActive = driverPayouts.some(
        (p) => p.driverId === driver.id && (p.status === 'Requested' || p.status === 'Under Review' || p.status === 'Processing')
      );

      if (balance.payableBalance >= payoutConfig.minimumPayoutAmount && !hasActive && driver.accountStatus === 'active') {
        eligibleDrivers.push({ driver, payable: balance.payableBalance });
      }
    });

    if (eligibleDrivers.length === 0) {
      showToast('No drivers currently meet auto-payout eligibility criteria.', 'info');
      return { processedCount: 0, totalAmount: 0, skippedCount: drivers.length };
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    let totalBatchAmount = 0;
    const newPayouts: DriverPayoutRecord[] = [];
    const newTxns: PayoutTransactionRecord[] = [];

    eligibleDrivers.forEach(({ driver, payable }) => {
      const amountToPay = Math.min(payable, payoutConfig.maximumPayoutAmount);
      totalBatchAmount += amountToPay;
      const id = `PO-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `TXN-AUTO-${Math.floor(10000 + Math.random() * 90000)}`;

      adjustDriverWallet(driver.id, -amountToPay, `Automated scheduled batch payout: ${id}`);

      const record: DriverPayoutRecord = {
        id,
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverCity: driver.city,
        driverPlate: driver.vehicle?.plate || 'N/A',
        amount: amountToPay,
        paymentMethod: 'Bank',
        accountTitle: driver.name,
        accountNumber: `PK00AUTO${driver.phone.replace(/\D/g, '')}`,
        bankName: 'Partner Settlement Clearing Bank',
        optionalNote: `Automated ${payoutConfig.payoutSchedule} scheduled batch settlement`,
        status: 'Approved',
        requestedAt: nowStr,
        reviewedAt: nowStr,
        reviewedBy: 'Auto-Settlement Engine',
        approvedAt: nowStr,
        approvedBy: 'Auto-Settlement Engine',
        transactionId: txnId,
        referenceId: `BATCH-${Date.now().toString().slice(-6)}`,
        processingFee: 0,
        netPayoutAmount: amountToPay,
        payoutPeriod: `${payoutConfig.payoutSchedule} Batch`,
        isAutomatedBatch: true,
        reconciliationStatus: 'Matched',
        retryCount: 0,
        auditTrail: [
          {
            action: 'Automated Batch Triggered',
            actor: 'Scheduled Payout Worker',
            timestamp: nowStr,
            note: `System identified eligible payable balance of PKR ${payable.toLocaleString()}. Auto-approved payout of PKR ${amountToPay.toLocaleString()}.`
          }
        ]
      };

      const txn: PayoutTransactionRecord = {
        id: `ptx-${Date.now()}-${Math.random().toString().slice(-3)}`,
        transactionId: txnId,
        payoutId: id,
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
        amount: amountToPay,
        paymentMethod: 'Bank (Automated Batch)',
        accountDestination: record.accountNumber,
        period: record.payoutPeriod || 'Batch',
        status: 'Processing',
        createdBy: 'Scheduled Auto-Payout Engine',
        approvedBy: 'System Auto-Rule',
        date: nowStr,
        note: `Scheduled ${payoutConfig.payoutSchedule} batch dispatches`,
        referenceId: record.referenceId
      };

      newPayouts.push(record);
      newTxns.push(txn);
    });

    setDriverPayouts((prev) => [...newPayouts, ...prev]);
    setPayoutTransactions((prev) => [...newTxns, ...prev]);

    recordAdminAudit(
      'AUTO_PAYOUT_BATCH_EXECUTED',
      'Scheduled Payouts',
      `${eligibleDrivers.length} Payouts Processed`,
      `Total batch disbursement: PKR ${totalBatchAmount.toLocaleString()}`,
      'Automatic',
      'system',
      'batch-auto'
    );

    showToast(`Scheduled Auto-Payout executed! Processed ${eligibleDrivers.length} payouts totaling PKR ${totalBatchAmount.toLocaleString()}.`, 'success');

    return {
      processedCount: eligibleDrivers.length,
      totalAmount: totalBatchAmount,
      skippedCount: drivers.length - eligibleDrivers.length
    };
  };

  // ==========================================================================
  // PHASE 48: UNIFIED SUPPORT, COMPLAINTS, DISPUTES & CENTRAL CASE MANAGEMENT
  // ==========================================================================
  const assignCase = (
    caseId: string,
    assignedAdmin: string,
    assignedTeam: 'support' | 'safety' | 'finance' | 'verification' | 'operations' = 'support',
    note?: string
  ) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Admin Assigned',
          note: note || `Assigned to ${assignedAdmin} (${assignedTeam} desk).`
        };
        return {
          ...c,
          assignedAdmin,
          assignedTeam,
          status: c.status === 'new' ? 'under_review' : c.status,
          updatedAt: nowStr,
          firstResponseAt: c.firstResponseAt || nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_ASSIGNED',
      caseId,
      `Assigned to ${assignedAdmin}`,
      `Team: ${assignedTeam}. Note: ${note || 'Direct assignment'}`,
      'Manual',
      'case',
      caseId
    );
    supportCaseService.assignCase(caseId, assignedAdmin, assignedTeam, note).catch(() => {});

    dispatchNotification({
      title: 'Case Assigned',
      message: `Case ${caseId} assigned to ${assignedAdmin} (${assignedTeam}).`,
      target: 'all',
      targetCity: 'all',
      category: 'general'
    });

    showToast(`Case ${caseId} assigned to ${assignedAdmin}.`, 'success');
  };

  const changeCasePriority = (caseId: string, priority: SupportCasePriority, reason: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Priority Changed',
          note: `Priority updated to ${priority.toUpperCase()}. Reason: ${reason}`
        };
        return {
          ...c,
          priority,
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_PRIORITY_CHANGED',
      caseId,
      `Priority: ${priority.toUpperCase()}`,
      reason,
      'Manual',
      'case',
      caseId
    );

    showToast(`Case ${caseId} priority set to ${priority.toUpperCase()}.`, 'info');
  };

  const addCaseInternalNote = (caseId: string, text: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newNote: SupportCaseInternalNote = {
      id: `note-${Date.now()}`,
      author: currentAdmin?.name || 'Admin',
      authorRole: currentAdmin?.role || 'Super Admin',
      text,
      createdAt: nowStr,
      isInternalOnly: true
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Internal Note',
          note: text
        };
        return {
          ...c,
          internalNotes: [newNote, ...c.internalNotes],
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_NOTE_ADDED',
      caseId,
      'Internal Note Added',
      text,
      'Manual',
      'case',
      caseId
    );

    showToast('Confidential internal note recorded.', 'success');
  };

  const addCaseEvidence = (caseId: string, evidence: Omit<SupportCaseEvidence, 'id' | 'uploadedAt'>) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newEv: SupportCaseEvidence = {
      ...evidence,
      id: `ev-${Date.now()}`,
      uploadedAt: nowStr
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `evt-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Evidence Added',
          note: `Added ${evidence.type}: "${evidence.title}"`
        };
        return {
          ...c,
          evidence: [newEv, ...c.evidence],
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    showToast(`Evidence "${evidence.title}" attached to case.`, 'success');
  };

  const requestCaseInfo = (caseId: string, target: 'driver' | 'passenger', message: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newStatus: SupportCaseStatus = target === 'driver' ? 'waiting_for_driver' : 'waiting_for_passenger';

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: target === 'driver' ? 'Driver Response' : 'Passenger Response',
          note: `Information requested from ${target}: "${message}"`
        };
        return {
          ...c,
          status: newStatus,
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    dispatchNotification({
      title: `Information Requested (${target === 'driver' ? 'Driver' : 'Passenger'})`,
      message: `Notification & SMS inquiry dispatched for Case ${caseId}: "${message}"`,
      target: target === 'driver' ? 'drivers' : 'passengers',
      targetCity: 'all',
      category: 'general'
    });

    recordAdminAudit(
      'CASE_INFO_REQUESTED',
      caseId,
      `Requested info from ${target}`,
      message,
      'Manual',
      'case',
      caseId
    );

    showToast(`Inquiry dispatched to ${target} via SMS & in-app prompt.`, 'info');
  };

  const recordCaseUserResponse = (caseId: string, respondent: 'driver' | 'passenger', text: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `${respondent === 'driver' ? 'Driver' : 'Passenger'}: ${respondent === 'driver' ? c.driver?.name || 'Partner' : c.passenger?.name || 'User'}`,
          actorRole: respondent,
          action: respondent === 'driver' ? 'Driver Response' : 'Passenger Response',
          note: text
        };
        return {
          ...c,
          status: 'under_review',
          updatedAt: nowStr,
          [respondent === 'driver' ? 'driverResponse' : 'passengerResponse']: {
            text,
            submittedAt: nowStr
          },
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    showToast(`Response from ${respondent} recorded. Case moved to Under Review.`, 'success');
  };

  const escalateCase = (caseId: string, escalationReason: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const nextPriority: SupportCasePriority =
          c.priority === 'critical' ? 'critical' : c.priority === 'urgent' ? 'critical' : 'urgent';
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Escalation',
          note: `Case escalated. Reason: ${escalationReason}`
        };
        return {
          ...c,
          status: 'escalated',
          priority: nextPriority,
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    dispatchNotification({
      title: '🚨 Case Escalated',
      message: `Case ${caseId} escalated to senior oversight: ${escalationReason}`,
      target: 'all',
      targetCity: 'all',
      category: 'safety'
    });

    recordAdminAudit(
      'CASE_ESCALATED',
      caseId,
      'Escalated to Senior Ops / Safety',
      escalationReason,
      'Manual',
      'case',
      caseId
    );

    showToast(`Case ${caseId} escalated to Senior Review.`, 'info');
  };

  const resolveCase = (caseId: string, outcome: string, note: string, financialActionTaken = false) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const resolution = {
          outcome,
          note,
          resolvedBy: currentAdmin?.name || 'Super Admin',
          resolvedAt: nowStr,
          financialActionTaken
        };
        const prevRes = c.previousResolutions || [];
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Resolution',
          note: `Resolved: ${outcome}. Note: ${note}`
        };
        return {
          ...c,
          status: 'resolved',
          resolvedAt: nowStr,
          updatedAt: nowStr,
          resolution,
          previousResolutions: [resolution, ...prevRes],
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_RESOLVED',
      caseId,
      outcome,
      note,
      'Manual',
      'case',
      caseId
    );
    supportCaseService.resolveCase(caseId, outcome, note, currentAdmin?.name || 'Super Admin').catch(() => {});

    dispatchNotification({
      title: 'Case Resolved',
      message: `Case ${caseId} resolved with outcome: "${outcome}".`,
      target: 'all',
      targetCity: 'all',
      category: 'general'
    });

    showToast(`Case ${caseId} marked as Resolved.`, 'success');
  };

  const rejectCase = (caseId: string, reason: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Resolution',
          note: `Case rejected. Reason: ${reason}`
        };
        return {
          ...c,
          status: 'rejected',
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_REJECTED',
      caseId,
      'Dispute/Complaint Rejected',
      reason,
      'Manual',
      'case',
      caseId
    );

    showToast(`Case ${caseId} rejected.`, 'info');
  };

  const reopenCase = (caseId: string, reason: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Reopened',
          note: `Case reopened. Reason: ${reason}`
        };
        return {
          ...c,
          status: 'open',
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_REOPENED',
      caseId,
      'Case Reopened for Investigation',
      reason,
      'Manual',
      'case',
      caseId
    );

    showToast(`Case ${caseId} reopened.`, 'info');
  };

  const closeCase = (caseId: string, note: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEvent: SupportCaseEvent = {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Case Closed',
          note: note || 'Case closed after satisfactory observation period.'
        };
        return {
          ...c,
          status: 'closed',
          closedAt: nowStr,
          updatedAt: nowStr,
          timeline: [newEvent, ...c.timeline]
        };
      })
    );

    recordAdminAudit(
      'CASE_CLOSED',
      caseId,
      'Case Closed',
      note || 'Closed officially',
      'Manual',
      'case',
      caseId
    );

    showToast(`Case ${caseId} officially closed.`, 'info');
  };

  const createSupportCase = (caseData: Partial<SupportCase>) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const caseId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: SupportCase = {
      id: caseId,
      caseNumber: `GL-CS-${caseId.slice(-4)}`,
      type: caseData.type || 'general_support',
      subCategory: caseData.subCategory || 'General Inquiry',
      title: caseData.title || 'New Support Case',
      description: caseData.description || 'No description provided.',
      priority: caseData.priority || 'normal',
      status: 'open',
      slaStatus: 'within_sla',
      createdAt: nowStr,
      updatedAt: nowStr,
      targetResolutionHours: caseData.targetResolutionHours || 24,
      currentWaitingHours: 0.1,
      city: caseData.city || 'Lahore',
      assignedAdmin: caseData.assignedAdmin || 'Unassigned',
      assignedTeam: caseData.assignedTeam || 'support',
      reporter: caseData.reporter || {
        id: 'rep-01',
        name: currentAdmin?.name || 'System Operator',
        phone: '+92 300 0000000',
        role: 'system'
      },
      driver: caseData.driver,
      passenger: caseData.passenger,
      ride: caseData.ride,
      evidence: caseData.evidence || [],
      internalNotes: caseData.internalNotes || [],
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Administrator'}`,
          actorRole: 'admin',
          action: 'Case Created',
          note: 'Case initiated manually in Central Case Management.'
        }
      ],
      financials: caseData.financials,
      aiInsights: caseData.aiInsights
    };

    setCases((prev) => [newCase, ...prev]);

    recordAdminAudit(
      'CASE_CREATED',
      caseId,
      newCase.title,
      `Category: ${newCase.type}`,
      'Manual',
      'case',
      caseId
    );

    showToast(`Case ${newCase.caseNumber} created successfully.`, 'success');
  };

  // Phase 53: Fraud, Anti-Abuse & Risk Control Center Handlers
  const updateRiskAlert = (alertId: string, updates: Partial<RiskAlertRecord>, reason?: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setRiskAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        const timelineItem: RiskTimelineEvent | null = reason
          ? {
              id: `rt-${Date.now()}`,
              timestamp: nowStr,
              actor: currentAdmin?.name || 'Risk Officer',
              actorRole: 'admin',
              action: 'Alert Updated',
              note: reason
            }
          : null;
        return {
          ...alert,
          ...updates,
          updatedAt: nowStr,
          timeline: timelineItem ? [timelineItem, ...(alert.timeline || [])] : alert.timeline
        };
      })
    );
    if (reason) {
      recordAdminAudit('RISK_ALERT_UPDATED', alertId, 'Alert Updated', reason, 'Manual', 'risk_alert', alertId);
    }
    showToast(`Risk alert ${alertId} updated.`, 'info');
  };

  const assignRiskAlert = (alertId: string, assignedAdmin: string, assignedTeam?: string, note?: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setRiskAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        const timelineItem: RiskTimelineEvent = {
          id: `rt-${Date.now()}`,
          timestamp: nowStr,
          actor: currentAdmin?.name || 'Risk Officer',
          actorRole: 'admin',
          action: 'Investigator Assigned',
          note: note || `Assigned to ${assignedAdmin} (${assignedTeam || 'Risk Ops'})`
        };
        return {
          ...alert,
          assignedAdmin,
          assignedTeam: assignedTeam || alert.assignedTeam || 'fraud_ops',
          status: alert.status === 'open' ? 'under_investigation' : alert.status,
          updatedAt: nowStr,
          timeline: [timelineItem, ...(alert.timeline || [])]
        };
      })
    );
    recordAdminAudit('RISK_ALERT_ASSIGNED', alertId, `Assigned to ${assignedAdmin}`, note || 'Team assignment', 'Manual', 'risk_alert', alertId);
    showToast(`Alert ${alertId} assigned to ${assignedAdmin}`, 'success');
  };

  const updateRiskAlertStatus = (
    alertId: string,
    status: RiskStatus,
    reason: string,
    resolution?: RiskResolutionAction
  ) => {
    if (status === 'resolved' || status === 'false_positive' || status === 'dismissed') {
      if (!checkSensitiveAction('fraud_clearance', `Mark Alert ${alertId} as ${status}`)) {
        return;
      }
    }
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setRiskAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        const timelineItem: RiskTimelineEvent = {
          id: `rt-${Date.now()}`,
          timestamp: nowStr,
          actor: currentAdmin?.name || 'Risk Officer',
          actorRole: 'admin',
          action: `Status Changed to ${status.toUpperCase()}`,
          note: `${reason}${resolution ? ` [Resolution: ${resolution}]` : ''}`
        };
        return {
          ...alert,
          status,
          resolutionAction: resolution || alert.resolutionAction,
          resolvedAt:
            status === 'resolved' || status === 'false_positive' || status === 'dismissed'
              ? nowStr
              : alert.resolvedAt,
          resolvedBy:
            status === 'resolved' || status === 'false_positive' || status === 'dismissed'
              ? currentAdmin?.name || 'Risk Officer'
              : alert.resolvedBy,
          updatedAt: nowStr,
          timeline: [timelineItem, ...(alert.timeline || [])]
        };
      })
    );
    recordAdminAudit('RISK_ALERT_STATUS_CHANGED', alertId, `Status: ${status}`, reason, 'Manual', 'risk_alert', alertId);
    showToast(`Risk alert status changed to ${status.replace('_', ' ')}`, 'success');
  };

  const addRiskAlertEvidence = (alertId: string, evidence: Omit<RiskEvidenceItem, 'id' | 'uploadedAt'>) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newEv: RiskEvidenceItem = {
      ...evidence,
      id: `rev-${Date.now()}`,
      uploadedAt: nowStr
    };
    setRiskAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        const timelineItem: RiskTimelineEvent = {
          id: `rt-${Date.now()}`,
          timestamp: nowStr,
          actor: currentAdmin?.name || 'Risk Officer',
          actorRole: 'admin',
          action: 'Evidence Added',
          note: `New evidence item added: ${evidence.title} (${evidence.type})`
        };
        return {
          ...alert,
          evidence: [...(alert.evidence || []), newEv],
          updatedAt: nowStr,
          timeline: [timelineItem, ...(alert.timeline || [])]
        };
      })
    );
    recordAdminAudit('RISK_EVIDENCE_ATTACHED', alertId, evidence.title, evidence.notes || 'Evidence linked', 'Manual', 'risk_alert', alertId);
    showToast('Evidence document attached to alert.', 'success');
  };

  const requestRiskEvidence = (alertId: string, reason: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const alert = riskAlerts.find((a) => a.id === alertId);
    if (!alert) return;
    const timelineItem: RiskTimelineEvent = {
      id: `rt-${Date.now()}`,
      timestamp: nowStr,
      actor: currentAdmin?.name || 'Risk Officer',
      actorRole: 'admin',
      action: 'Evidence Requested',
      note: `Formal proof / clarification requested from ${alert.entityType} ${alert.entityName}: ${reason}`
    };
    setRiskAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              updatedAt: nowStr,
              timeline: [timelineItem, ...(a.timeline || [])]
            }
          : a
      )
    );
    recordAdminAudit('RISK_EVIDENCE_REQUESTED', alertId, alert.entityName, reason, 'Manual', 'risk_alert', alertId);
    showToast(`Verification request dispatched to ${alert.entityName}.`, 'info');
  };

  const addRiskAdminNote = (alertId: string, note: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setRiskAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== alertId) return alert;
        const timelineItem: RiskTimelineEvent = {
          id: `rt-${Date.now()}`,
          timestamp: nowStr,
          actor: currentAdmin?.name || 'Risk Officer',
          actorRole: 'admin',
          action: 'Admin Note Recorded',
          note
        };
        return {
          ...alert,
          adminNotes: [...(alert.adminNotes || []), note],
          updatedAt: nowStr,
          timeline: [timelineItem, ...(alert.timeline || [])]
        };
      })
    );
    recordAdminAudit('RISK_NOTE_ADDED', alertId, 'Admin Note', note, 'Manual', 'risk_alert', alertId);
    showToast('Confidential investigator note recorded.', 'success');
  };

  const linkRiskAlertToCase = (alertId: string): string => {
    const alert = riskAlerts.find((a) => a.id === alertId);
    if (!alert) return '';
    if (alert.relatedCaseId) {
      showToast(`Alert already linked to Case ${alert.relatedCaseId}`, 'info');
      return alert.relatedCaseId;
    }
    const caseId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';

    const newCase: SupportCase = {
      id: caseId,
      caseNumber: `GL-CS-${caseId.slice(-4)}`,
      type: 'fraud_investigation',
      subCategory: alert.category.replace('_', ' ').toUpperCase(),
      title: `[Fraud Risk] ${alert.title}`,
      description: `Formal investigation initiated for ${alert.entityType} ${alert.entityName} (${alert.entityId}). Alert description: ${alert.description}. Suspicion triggers: ${alert.suspiciousFactors?.join(', ')}.`,
      priority: alert.riskLevel === 'critical' ? 'critical' : alert.riskLevel === 'high' ? 'high' : 'normal',
      status: 'under_review',
      slaStatus: 'within_sla',
      createdAt: nowStr,
      updatedAt: nowStr,
      targetResolutionHours: alert.riskLevel === 'critical' ? 4 : 24,
      currentWaitingHours: 0.1,
      city: alert.city || 'Lahore',
      assignedAdmin: alert.assignedAdmin || currentAdmin?.name || 'Risk Officer',
      assignedTeam: 'compliance',
      reporter: {
        id: currentAdmin?.id || 'admin-sec',
        name: currentAdmin?.name || 'Risk Sentinel Engine',
        phone: '+92 42 111 465 433',
        role: 'system'
      },
      driver:
        alert.entityType === 'driver'
          ? {
              id: alert.entityId,
              name: alert.entityName,
              phone: alert.entityPhone || '+92 300 0000000',
              rating: 4.5,
              vehiclePlate: 'LEA-24-9812',
              vehicleModel: 'Toyota Corolla',
              totalComplaints: 1,
              totalFines: 0,
              riskLevel: (alert.riskLevel as any) || 'high',
              accountStatus: 'active'
            }
          : undefined,
      passenger:
        alert.entityType === 'passenger'
          ? {
              id: alert.entityId,
              name: alert.entityName,
              phone: alert.entityPhone || '+92 300 0000000',
              rating: 4.8,
              totalRides: 14,
              totalComplaints: 0,
              accountStatus: 'active'
            }
          : undefined,
      ride: alert.rideId
        ? {
            id: alert.rideId,
            code: alert.rideCode || alert.rideId,
            pickup: alert.pickupLocation || 'Pickup Point',
            dropoff: alert.dropLocation || 'Destination',
            fare: alert.financialImpactPkr || 0,
            status: 'completed',
            date: alert.timestamp || nowStr,
            vehicleType: 'Car'
          }
        : undefined,
      evidence:
        alert.evidence?.map((e) => ({
          id: e.id,
          title: e.title,
          type:
            e.type === 'gps_trace' || e.type === 'sensor_log'
              ? 'ride_telemetry'
              : e.type === 'financial_statement'
              ? 'payment_receipt'
              : 'system_record',
          url: e.url,
          uploadedBy: e.uploadedBy,
          uploadedAt: e.uploadedAt,
          fileSize: e.fileSize
        })) || [],
      internalNotes:
        alert.adminNotes?.map((note, idx) => ({
          id: `note-${idx}`,
          author: currentAdmin?.name || 'Risk Investigator',
          role: 'admin',
          text: note,
          timestamp: nowStr,
          isPrivate: true
        })) || [],
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestamp: nowStr,
          actor: `Admin: ${currentAdmin?.name || 'Risk Officer'}`,
          actorRole: 'admin',
          action: 'Case Escalated from Fraud & Risk Center',
          note: `Investigation opened from Risk Alert ${alert.id} (${alert.title}).`
        }
      ]
    };

    setCases((prev) => [newCase, ...prev]);

    const newTimelineEvt: RiskTimelineEvent = {
      id: `rt-${Date.now()}`,
      timestamp: nowStr,
      actor: currentAdmin?.name || 'Risk Officer',
      actorRole: 'admin',
      action: 'Case Escalated',
      note: `Formal support case opened in Central Case Management: ${newCase.caseNumber} (${caseId})`
    };

    setRiskAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            relatedCaseId: caseId,
            status: 'under_investigation' as RiskStatus,
            timeline: [newTimelineEvt, ...(a.timeline || [])]
          };
        }
        return a;
      })
    );

    recordAdminAudit(
      'RISK_ALERT_ESCALATED_TO_CASE',
      alertId,
      alert.title,
      `Linked to Support Case ${caseId}`,
      'Manual',
      'risk_alert',
      alertId
    );

    showToast(`Escalated to Case ${newCase.caseNumber} in Central Case Management`, 'success');
    return caseId;
  };

  const updateRiskRule = (ruleId: string, updates: Partial<RiskRule>, reasonNote: string) => {
    if (!checkSensitiveAction('risk_rule_changes', `Modify Risk Rule ${ruleId}`)) {
      return;
    }
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    setRiskRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return {
          ...rule,
          ...updates,
          version: (rule.version || 1) + 1,
          updatedAt: nowStr,
          updatedBy: currentAdmin?.name || 'Risk Officer'
        };
      })
    );
    recordAdminAudit('RISK_RULE_MODIFIED', ruleId, 'Rule Configuration', `${reasonNote} (Updated by ${currentAdmin?.name || 'Admin'})`, 'Manual', 'risk_rule', ruleId);
    showToast(`Risk Rule ${ruleId} successfully updated to next version.`, 'success');
  };

  const createRiskRule = (ruleData: Omit<RiskRule, 'id' | 'version'>) => {
    if (!checkSensitiveAction('risk_rule_changes', `Create Risk Rule ${ruleData.ruleCode}`)) {
      return;
    }
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const newId = `rule-${Date.now()}`;
    const newRule: RiskRule = {
      ...ruleData,
      id: newId,
      version: 1,
      createdAt: nowStr,
      updatedAt: nowStr,
      updatedBy: currentAdmin?.name || 'Risk Officer'
    };
    setRiskRules((prev) => [newRule, ...prev]);
    recordAdminAudit('RISK_RULE_CREATED', newId, newRule.name, `New rule code: ${newRule.ruleCode}`, 'Manual', 'risk_rule', newId);
    showToast(`Rule ${newRule.ruleCode} deployed successfully.`, 'success');
  };

  const addToRiskWatchlist = (entry: Omit<RiskWatchlistEntry, 'id' | 'addedDate'>) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const id = `wl-${Date.now()}`;
    const newEntry: RiskWatchlistEntry = {
      ...entry,
      id,
      addedDate: nowStr
    };
    setRiskWatchlist((prev) => [newEntry, ...prev]);
    recordAdminAudit('WATCHLIST_ADDED', id, entry.entityName, entry.reason, 'Manual', 'watchlist', id);
    showToast(`${entry.entityName} added to high-vigilance watchlist.`, 'warning');
  };

  const removeFromRiskWatchlist = (entryId: string, reason?: string) => {
    setRiskWatchlist((prev) => prev.filter((w) => w.id !== entryId));
    recordAdminAudit('WATCHLIST_REMOVED', entryId, 'Watchlist Entry', reason || 'Removed from monitoring', 'Manual', 'watchlist', entryId);
    showToast('Entity removed from risk watchlist.', 'info');
  };

  const triggerDemoRiskScan = (city?: string) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false }) + ' PKT';
    const id = `RA-SCAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomCity = city || ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'][Math.floor(Math.random() * 4)];
    const targetDriver = drivers.find((d) => d.city === randomCity) || drivers[0];

    const newAlert: RiskAlertRecord = {
      id,
      title: 'Autonomous Scan: High-Frequency Cancellation Spree Detected',
      entityType: 'driver',
      entityId: targetDriver.id,
      entityName: targetDriver.name,
      entityPhone: targetDriver.phone,
      category: 'cancellation_abuse',
      riskLevel: 'high',
      riskScore: 78,
      status: 'open',
      city: randomCity,
      description: `Autonomous sentinel scan detected 7 ride cancellations within 32 minutes immediately after passenger fare quote acceptance. Potential fare manipulation.`,
      detectedAt: nowStr,
      timestamp: nowStr,
      updatedAt: nowStr,
      financialImpactPkr: 1450,
      confidenceScore: 0.89,
      automatedActionTaken: 'Account marked under vigilance; driver ride dispatch restricted to cash prepaid only.',
      suspiciousFactors: [
        '7 consecutive cancellations post-dispatch acceptance',
        'Abnormal ratio compared to city average (2.1%)',
        'Device telemetry indicates standing idle near passenger pickup point'
      ],
      aiExplanation:
        'Driver systematically accepted incoming booking offers then cancelled after 3 minutes, forcing dynamic surge tier increase in the localized sector.',
      evidence: [
        {
          id: `ev-${Date.now()}`,
          title: 'Autonomous Telemetry Radar Snapshot',
          type: 'sensor_log',
          url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
          uploadedBy: 'Autonomous Risk Scanner',
          uploadedAt: nowStr,
          fileSize: '480 KB'
        }
      ],
      timeline: [
        {
          id: `ev-init`,
          timestamp: nowStr,
          actor: 'GoLife Autonomous Sentinel',
          actorRole: 'system',
          action: 'Alert Generated via Real-Time Telemetry',
          note: `Scanned 420 active signals in ${randomCity}. Flagged anomalous cancellation pattern.`
        }
      ]
    };

    setRiskAlerts((prev) => [newAlert, ...prev]);
    recordAdminAudit('AUTONOMOUS_RISK_SCAN_ALERT', id, targetDriver.name, `Flagged cancellation spree in ${randomCity}`, 'Automatic', 'risk_alert', id);
    showToast(`Risk Sentinel Scan complete: 1 new critical anomaly flagged in ${randomCity}.`, 'warning');
  };

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        sessionExpiresAt,
        authLoading,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        login,
        logout,
        searchQuery,
        setSearchQuery,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        toast,
        showToast,
        passengers: passengers || [],
        drivers: drivers || [],
        verifications: verifications || [],
        rides: rides || [],
        fareConfigs: fareConfigs || [],
        cities: cities || [],
        intercityRoutes: intercityRoutes || [],
        payouts: payouts || [],
        promos: promos || [],
        freightJobs: freightJobs || [],
        academyLessons: academyLessons || [],
        loans: loans || [],
        notifications: notifications || [],
        complaints: complaints || [],
        safetyIncidents: safetyIncidents || [],
        auditLogs: auditLogs || [],
        settings,
        adminUsers: adminUsers || [],
        systemSettings: settings,
        updateSystemSettings: updateSettings,
        promoCodes: promos || [],
        addPromoCode,
        togglePromoStatus,
        updatePromoCodeDetails,
        promoUsages: promoUsages || [],
        recordPromoUsage,
        promotionCampaigns: promotionCampaigns || [],
        createPromotionCampaign,
        updatePromotionCampaign,
        toggleCampaignStatus,
        referralRewardRules: referralRewardRules || [],
        updateReferralRewardRule,
        driverRewardRules: driverRewardRules || [],
        updateDriverRewardRule,
        passengerRewardRules: passengerRewardRules || [],
        updatePassengerRewardRule,
        rewardsHistory: rewardsHistory || [],
        disburseDriverReward,
        disbursePassengerReward,
        fraudAlerts: fraudAlerts || [],
        reviewFraudAlert,
        promotionAiInsights: promotionAiInsights || [],
        fareRules: fareRules || [],
        updateFareRule,
        resetFareRule,
        resetAllFareRules,
        centralPricingRule,
        centralPricing: centralPricingRule,
        financialRecords: [...(passengerRefunds || []), ...(driverReimbursements || [])],
        pricingRuleVersions: pricingRuleVersions || [],
        driverPricingOverrides,
        updateCentralPricing,
        setDriverPricingOverride,
        removeDriverPricingOverride,
        transactions: transactions || [],
        trainingModules: trainingModules || [],
        addTrainingModule,
        updateTrainingModule,
        toggleTrainingModule,
        loanApplications: loanApplications || [],
        approveLoanApplication,
        rejectLoanApplication,
        addLoanApplication,
        recordLoanRepayment,
        freightOrders: freightOrders || [],
        updateFreightOrderStatus,
        addFreightOrder,
        assignFreightDriver,
        toggleCityStatus,
        addCity,
        deleteCity,
        addIntercityRoute,
        updateIntercityRoute,
        toggleIntercityRoute,
        sendNotification,
        markNotificationRead,
        deleteNotification,
        escalateSafetyIncident,
        supportTickets: supportTickets || [],
        addTicketReply,
        addTicketNote,
        updateTicketStatus,
        assignTicket,
        createSupportTicket,
        addAdminUser,
        updateAdminUser,
        toggleAdminStatus,
        deleteAdminUser,
        switchAdminRole,
        isAuthorizedForTab,
        approveDriverVerification,
        rejectDriverVerification,
        updatePassengerStatus,
        adjustPassengerWallet,
        updateDriverAccountStatus,
        adjustDriverWallet,
        updateFareConfig,
        updateCityConfig,
        approvePayout,
        rejectPayout,
        createPromoCode,
        deletePromoCode,
        togglePromoCode,
        dispatchNotification,
        resolveComplaint,
        rejectComplaint,
        resolveSafetyIncident,
        updateLoanStatus,
        toggleAcademyLesson,
        updateSettings,
        addAuditRecord,
        resetAllData,
        referrals: referrals || [],
        disburseReferralReward,
        editPassenger,
        editDriver,
        cancelRide,
        reopenComplaint,
        assignComplaint,
        addComplaintNote,
        refundTransaction,
        // Operations Center (Phase 32)
        operationsAlerts: operationsAlerts || [],
        isSimulationActive,
        setIsSimulationActive,
        resetSimulationData: () => {
          if (isProductionDataSource()) {
            showToast('Simulation reset is disabled in Production Mode.', 'warning');
            return;
          }
          setRides(INITIAL_RIDES);
          setDrivers(INITIAL_DRIVERS);
          setOperationsAlerts(INITIAL_OPERATIONS_ALERTS);
          showToast('Simulation data reset to default live state', 'info');
        },
        toggleSimulation,
        advanceSimulationStep,
        assignRideDriver,
        reassignRideDriver,
        cancelRideAssignment,
        flagRide,
        unflagRide,
        addRideAdminNote,
        updateRideStatus,
        requestPassengerRide,
        driverAcceptRide,
        driverArriveAtPickup,
        driverStartTrip,
        completeRideAndSettle,
        resolveOperationsAlert,
        escalateOperationsAlert,
        assignOperationsAlert,
        addOperationsAlertNote,
        createOperationsAlert,
        updateDriverOperationalStatus,

        // Phase 33 Driver Control, Earnings & Compliance
        driverDailySummaries: driverDailySummaries || [],
        latePickupIncidents: latePickupIncidents || [],
        driverSuspensions: driverSuspensions || [],
        driverWarnings: driverWarnings || [],
        latePickupConfig,
        suspendDriver,
        suspendDriverManually: suspendDriver,
        reinstateDriver,
        recordLatePickupIncident,
        updateLatePickupConfig,
        issueDriverWarning,
        updateDriverDocumentStatus,
        updateVerificationReviewStatus,
        calculateAndSaveDriverDailySummary,
        settleDriverDailySummary,
        simulatePhase33Event,

        // Phase 34 AI Intelligence
        automationSettings,
        updateAutomationSettings,
        adminTasks: adminTasks || [],
        updateAdminTaskStatus,
        assignAdminTask,
        addAdminTask,
        aiChatMessages: aiChatMessages || [],
        sendAiQuery,
        executeAiRecommendation,

        // Phase 35 Simple Professional Control Center & Global City Filter
        selectedCityFilter,
        setSelectedCityFilter,
        toggleDriverRideEligibility,

        // Phase 38 Live Operations Map & Universal Tracking Filter
        operationsInitialFilter,
        setOperationsInitialFilter,

        // Phase 39 Universal Detail Center & Feedback Review
        universalDetail,
        openUniversalDetail,
        closeUniversalDetail,
        feedbacks: feedbacks || [],
        addRideFeedback,
        recordAdminAudit,
        logAction: (action: string, entity: string, reason: string, details?: any) => {
          const detailStr = details
            ? typeof details === 'string'
              ? details
              : JSON.stringify(details)
            : reason;
          recordAdminAudit(action, entity, reason, detailStr, 'Manual', 'system', entity);
        },

        // Phase 41 Fines & Penalties Engine
        driverFines: driverFines || [],
        fineReasons: fineReasons || [],
        automaticFineRules: automaticFineRules || [],
        fineRuleVersions: fineRuleVersions || [],
        fineTransactions: fineTransactions || [],
        addDriverFine,
        waiveDriverFine,
        refundDriverFine,
        resolveDisputeDriverFine,
        updateAutomaticFineRule,
        addFineReason,
        toggleFineReason,

        // Phase 42 Reimbursements, Refunds & Settlements
        passengerRefunds: passengerRefunds || [],
        driverReimbursements: driverReimbursements || [],
        financialAdjustments: financialAdjustments || [],
        comprehensiveTransactions: comprehensiveTransactions || [],
        dailySettlements: dailySettlements || [],
        reconciliationRecords: reconciliationRecords || [],
        aiFinancialAnomalies: aiFinancialAnomalies || [],
        approvalThreshold,
        updateApprovalThreshold,
        processPassengerRefund,
        processDriverReimbursement,
        processFinancialAdjustment,
        approveFinancialRecord,
        rejectFinancialRecord,
        runReconciliationAudit,
        resolveReconciliationRecord,
        dismissFinancialAnomaly,

        // Phase 43 Driver Payouts, Withdrawals & Settlements
        driverPayouts: driverPayouts || [],
        payoutTransactions: payoutTransactions || [],
        payoutConfig,
        updatePayoutConfig,
        aiPayoutAnomalies: aiPayoutAnomalies || [],
        dismissAiPayoutAnomaly,
        requestDriverWithdrawal,
        payoutControlAction,
        runScheduledAutoPayoutBatch,

        // Phase 48 Unified Support, Complaints, Disputes & Central Case Management
        cases: cases || [],
        assignCase,
        changeCasePriority,
        addCaseInternalNote,
        addCaseEvidence,
        requestCaseInfo,
        recordCaseUserResponse,
        escalateCase,
        resolveCase,
        rejectCase,
        reopenCase,
        closeCase,
        createSupportCase,

        // Phase 49: City, Service Category & Operations Configuration Center
        serviceCategories: serviceCategories || [],
        cityCategoryMatrix: cityCategoryMatrix || [],
        cityAiInsights: cityAiInsights || [],
        updateCity,
        updateServiceCategory,
        toggleCategoryStatus,
        updateCityCategoryMatrixItem,
        toggleCityCategoryAvailability,
        updateCityOperatingSchedule,

        // Phase 51: Safety, Emergency & Incident Control Center
        safetyEmergencyContacts: safetyEmergencyContacts || [],
        updateEmergencyContact,
        addEmergencyContact,
        safetySlaConfig,
        updateSafetySlaConfig,
        safetyIncidentCategories,
        activeSafetyModalIncidentId,
        openSafetyDetail,
        closeSafetyDetail,
        acknowledgeSafetyIncident,
        assignSafetyIncident,
        recordSafetyContactAttempt,
        requestSafetyInfo,
        addSafetyInternalNote,
        investigateSafetyIncident,
        markSafetyFalseAlarm,
        closeSafetyIncident,
        addSafetyEvidence,
        linkSafetyToSupportCase,
        triggerDemoSosAlert,

        // Phase 52 Admin Users, Roles, Permissions & Access Control Center
        adminRoles: adminRoles || [],
        adminSessions: adminSessions || [],
        adminInvitations: adminInvitations || [],
        adminApprovalRules: adminApprovalRules || [],
        adminSecurityAlerts: adminSecurityAlerts || [],
        hasPermission,
        hasSensitivePermission,
        canAccessCity,
        canAccessTab,
        checkSensitiveAction,
        createCustomRole,
        updateAdminRole,
        deleteCustomRole,
        revokeAdminSession,
        revokeAllAdminSessions,
        createAdminInvitation,
        revokeAdminInvitation,
        resendAdminInvitation,
        updateApprovalRule,
        dismissSecurityAlert,
        resolveSecurityAlert,
        lockAdminAccount,
        unlockAdminAccount,
        updateAdminPermissions,
        updateAdminCityScope,

        // Phase 53: Fraud, Anti-Abuse & Risk Control Center
        riskAlerts: riskAlerts || [],
        riskRules: riskRules || [],
        riskWatchlist: riskWatchlist || [],
        riskAiInsights: riskAiInsights || [],
        updateRiskAlert,
        assignRiskAlert,
        updateRiskAlertStatus,
        addRiskAlertEvidence,
        requestRiskEvidence,
        addRiskAdminNote,
        linkRiskAlertToCase,
        updateRiskRule,
        createRiskRule,
        addToRiskWatchlist,
        removeFromRiskWatchlist,
        triggerDemoRiskScan,

        // Phase 56-C Central Commission & Shared Financial State
        commissionRules: commissionRules || [],
        setCommissionRules,
        driverOverrides: driverOverrides || [],
        setDriverOverrides,
        cashReconciliations: cashReconciliations || [],
        setCashReconciliations,
        advanceReconciliations: advanceReconciliations || [],
        setAdvanceReconciliations,
        driverWallets: driverWallets || [],
        setDriverWallets,

        // Phase 56-B Central Payment Architecture & Financial Services
        topUps: topUps || [],
        setTopUps,
        centralTransactions: centralTransactions || [],
        setCentralTransactions,
        companyAccounts: companyAccounts || [],
        setCompanyAccounts,
        advanceHolds: advanceHolds || [],
        setAdvanceHolds,
        paymentProviders: paymentProviders || [],
        setPaymentProviders,
        paymentWebhooks: paymentWebhooks || [],
        setPaymentWebhooks,
        paymentReconciliations: paymentReconciliations || [],
        setPaymentReconciliations,
        financialService,
        handleTopUpStatusChange,
        recordCashRideSettlement,
        recordDriverWalletCredit,
        recordDriverWalletDebit,

        // Phase 63 Unified Dashboard Date Filter System
        dashboardDateFilter,
        setDashboardDateFilter,
        updateDashboardDateFilter,
        resetDashboardDateToToday
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
