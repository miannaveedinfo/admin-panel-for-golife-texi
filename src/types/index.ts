export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'support_admin'
  | 'finance_admin'
  | 'verification_admin'
  | 'safety_admin'
  | 'reports_admin'
  | 'read_only_admin'
  | 'ops_dispatcher'
  | 'safety_officer'
  | 'financial_auditor'
  | 'city_manager'
  | 'dispatcher'
  | 'support_agent'
  | 'finance_officer'
  | string;

export type AdminAccountStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'locked'
  | 'pending_invitation';

export type PermissionModule =
  | 'dashboard'
  | 'drivers'
  | 'passengers'
  | 'rides'
  | 'live_operations'
  | 'driver_control'
  | 'driver_performance'
  | 'verification'
  | 'cities'
  | 'service_categories'
  | 'pricing'
  | 'fines'
  | 'refunds'
  | 'reimbursements'
  | 'payouts'
  | 'reports'
  | 'promotions'
  | 'notifications'
  | 'support'
  | 'complaints'
  | 'safety'
  | 'admin_users'
  | 'settings'
  | 'fraud_risk'
  | 'audit_logs';

export type PermissionLevel =
  | 'view'
  | 'create'
  | 'edit'
  | 'approve'
  | 'reject'
  | 'execute'
  | 'export'
  | 'manage';

export type SensitivePermission =
  | 'driver_suspension'
  | 'driver_reinstatement'
  | 'driver_fine'
  | 'refund_approval'
  | 'reimbursement_approval'
  | 'payout_approval'
  | 'pricing_changes'
  | 'financial_rule_changes'
  | 'risk_rule_changes'
  | 'fraud_clearance'
  | 'admin_user_changes'
  | 'safety_escalation'
  | 'account_restrictions';

export interface AdminRoleDefinition {
  id: string;
  name: string;
  code: AdminRole;
  description: string;
  isSystemDefault: boolean;
  modulePermissions: Partial<Record<PermissionModule, PermissionLevel[]>>;
  sensitivePermissions: SensitivePermission[];
  colorBadge: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSession {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActivityTime: string;
  status: 'active' | 'revoked' | 'expired';
  isCurrentSession: boolean;
  token?: string;
  expiresAt?: string;
}

export interface AdminInvitation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  roleTitle?: string;
  department: string;
  cityScope: 'all' | string[];
  assignedCity?: string;
  permissionsSummary: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  sentAt: string;
  expiresAt: string;
  invitedBy: string;
  invitationToken?: string;
}

export interface AdminApprovalRule {
  id: string;
  actionType: SensitivePermission;
  title: string;
  description: string;
  requiresTwoPersonApproval: boolean;
  thresholdAmount?: number;
  authorizedRoles: AdminRole[];
  enabled: boolean;
}

export interface AdminSecurityAlert {
  id: string;
  adminId?: string;
  adminName?: string;
  type:
    | 'excessive_privileges'
    | 'inactive_active_account'
    | 'expired_invitation'
    | 'failed_logins'
    | 'suspicious_session'
    | 'unusual_sensitive_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestedAction: string;
  timestamp: string;
  status: 'open' | 'investigated' | 'dismissed';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle?: string;
  avatar?: string;
  lastLogin?: string;
  lastActive?: string;
  permissions?: string[];
  status?: AdminAccountStatus | 'active' | 'inactive';
  phone?: string;
  department?: string;
  assignedCity?: string;
  cityScope?: 'all' | string[];
  isReadOnly?: boolean;
  failedLoginAttempts?: number;
  lockReason?: string;
  suspensionReason?: string;
  twoFactorEnabled?: boolean;
  customSensitivePermissions?: SensitivePermission[];
  createdAt?: string;
}

export type AdminTab =
  | 'dashboard'
  | 'passengers'
  | 'drivers'
  | 'driver_earnings'
  | 'verification'
  | 'academy'
  | 'loans'
  | 'live_rides'
  | 'rides'
  | 'freight'
  | 'fares'
  | 'wallets'
  | 'promos'
  | 'safety'
  | 'safety_emergency'
  | 'complaints'
  | 'support'
  | 'notifications'
  | 'cities'
  | 'reports'
  | 'settings'
  | 'audit'
  | 'audit_logs'
  | 'admins'
  | 'fraud_risk'
  | 'ai_assistant';

export type RideCategory =
  | 'GoMoto'
  | 'GoAuto'
  | 'GoMini'
  | 'GoRide'
  | 'GoComfort'
  | 'GoFreight'
  | 'GoVan'
  | 'GoSUV'
  | 'GoIntercity'
  | string;

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  rating: number;
  totalRides: number;
  walletBalance: number; // PKR
  status: 'active' | 'suspended' | 'pending';
  accountStatus?: 'active' | 'suspended' | 'blocked';
  statusNote?: string;
  rideBookingEnabled?: boolean;
  cashPaymentEnabled?: boolean;
  walletPaymentEnabled?: boolean;
  promoUsageEnabled?: boolean;
  riskStatus?: 'normal' | 'watchlist' | 'restricted';
  updatedAt?: string;
  joinedDate: string;
  avatar: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  totalSpent: number; // PKR
  complaintsCount: number;
  notes?: string;
}

export interface DriverVehicle {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  category: RideCategory;
}

export interface DriverDocumentVersion {
  version: number;
  url: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: 'pending' | 'verified' | 'rejected' | 'invalid' | 'expired';
  rejectionReason?: string;
  notes?: string;
}

export interface DriverDocument {
  id?: string;
  type:
    | 'cnic_front'
    | 'cnic_back'
    | 'driving_license'
    | 'vehicle_reg'
    | 'police_cert'
    | 'profile_photo'
    | 'vehicle_insurance'
    | 'vehicle_inspection'
    | 'vehicle_photos'
    | 'other';
  title: string;
  url: string;
  verified: boolean;
  status?: 'verified' | 'pending' | 'invalid' | 'rejected' | 'expired' | 'more_info_required';
  uploadedAt: string;
  expiresAt?: string;
  expiryStatus?: 'valid' | 'expiring_soon' | 'expired';
  rejectionReason?: string;
  notes?: string;
  version?: number;
  versions?: DriverDocumentVersion[];
  documentNumber?: string;
}

export type DriverComprehensiveStatus =
  | 'pending_verification'
  | 'verified'
  | 'online'
  | 'available'
  | 'on_ride'
  | 'offline'
  | 'warning'
  | 'temporarily_suspended'
  | 'permanently_suspended'
  | 'rejected';

export type DriverOperationalStatus =
  | 'online'
  | 'available'
  | 'finding_ride'
  | 'accepted'
  | 'going_to_pickup'
  | 'at_pickup'
  | 'on_ride'
  | 'offline'
  | 'suspended';

export interface DriverStatusLog {
  status: DriverComprehensiveStatus | string;
  timestamp: string;
  changedBy: string;
  reason?: string;
}

export type LocationFreshness = 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE';
export type GpsQualityStatus = 'FRESH' | 'DELAYED' | 'STALE' | 'MISSING' | 'POOR_ACCURACY';
export type PickupDelayStatus = 'On Time' | 'Slightly Late' | 'Late' | 'Critical Delay';

export interface LocationHistoryPoint {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  accuracyMeters: number;
  speedKmh: number;
  heading: number;
  rideId?: string;
  driverId?: string;
  quality: GpsQualityStatus;
}

export interface RouteProgressSnapshot {
  rideId: string;
  driverId: string;
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  currentLocation: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number }>;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  etaMinutes: number;
  progressPercent: number;
  phase: 'to_pickup' | 'to_destination' | 'arrived' | 'completed';
  updatedAt: string;
}

export interface PickupMonitoringRecord {
  rideId: string;
  driverId: string;
  driverName?: string;
  passengerId: string;
  passengerName?: string;
  expectedPickupTime: string;
  driverArrivalTime?: string;
  actualArrival?: string;
  distanceFromPickupMeters: number;
  lateMinutes: number;
  status: 'on_time' | 'minor_delay' | 'significant_delay' | 'waived';
  exclusionReason?: FairLateExclusionReason | string;
  qualifiesForViolation: boolean;
  fineLevied?: boolean;
}

export type LocationEventType =
  | 'driver_online'
  | 'driver_offline'
  | 'location_updated'
  | 'driver_arrived'
  | 'ride_started'
  | 'route_progress'
  | 'destination_reached'
  | 'location_stale'
  | 'gps_unavailable';

export interface LocationEventRecord {
  id: string;
  eventType: LocationEventType;
  driverId?: string;
  passengerId?: string;
  rideId?: string;
  lat?: number;
  lng?: number;
  speedKmh?: number;
  heading?: number;
  accuracyMeters?: number;
  details?: string;
  timestamp: string;
}

export interface CityMapBoundary {
  city: string;
  center: { lat: number; lng: number };
  zoom: number;
  serviceRadiusKm: number;
  landmarks: Array<{ name: string; lat: number; lng: number; x: number; y: number }>;
}

export interface OperationsInitialFilter {
  tab?: 'all' | 'drivers' | 'rides' | 'passengers' | 'alerts';
  selectedId?: string;
  entityType?: 'driver' | 'passenger' | 'ride' | 'alert';
  city?: string;
  selectedEntityType?: 'driver' | 'passenger' | 'ride' | 'alert';
  selectedEntityId?: string;
}
export type FairLateExclusionReason =
  | 'Passenger requested delay'
  | 'Passenger changed pickup'
  | 'Passenger unavailable'
  | 'Road closure'
  | 'Severe traffic/event'
  | 'Technical issue'
  | 'Ride cancelled before pickup'
  | 'Other approved exception';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnic: string;
  city: string;
  rating: number;
  vehicle: DriverVehicle;
  status: 'online' | 'offline' | 'on_trip';
  operationalStatus?: DriverOperationalStatus;
  comprehensiveStatus?: DriverComprehensiveStatus;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
  totalRides: number;
  earnings: number; // PKR total
  walletBalance: number; // PKR
  commissionDue: number; // PKR
  acceptanceRate: number; // %
  joinedDate: string;
  avatar: string;
  documents: DriverDocument[];
  accountStatus: 'active' | 'suspended' | 'blocked';
  academyCompleted: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    address?: string;
    speed?: number;
    batteryLevel?: number;
  };
  lastPingTime?: string;
  activeRideId?: string;
  activeRideCode?: string;
  // Phase 33 & 37 extensions
  statusHistory?: DriverStatusLog[];
  latePickupCount?: number;
  latePickupIncidentsToday?: number;
  latePickup7DaysCount?: number;
  latePickupMonthCount?: number;
  complaintsCount?: number;
  activeSuspension?: DriverSuspensionRecord;
  suspensionHistory?: DriverSuspensionRecord[];
  warningsCount?: number;
  warnings?: DriverWarningRecord[];
  // Phase 37 Live Location & Tracking
  locationPermission?: boolean;
  locationFreshness?: LocationFreshness;
  lastLocationUpdate?: string;
  movementStatus?: 'Moving' | 'Stationary' | 'In Traffic' | 'Idle';
  accuracyMeters?: number;
  connectionStatus?: 'Connected' | 'Unstable' | 'Disconnected';
}

export type RealtimeDriverStatus =
  | 'online'
  | 'offline'
  | 'searching'
  | 'available'
  | 'on_the_way_to_pickup'
  | 'arrived'
  | 'on_trip'
  | 'suspended'
  | 'restricted'
  | 'verification_pending';

export type RealtimeRideState =
  | 'requested'
  | 'searching_drivers'
  | 'driver_offer'
  | 'counter_offer'
  | 'driver_accepted'
  | 'passenger_accepted'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'ride_started'
  | 'ride_in_progress'
  | 'destination_reached'
  | 'ride_completed'
  | 'cancelled'
  | 'disputed';

export interface CentralTimelineActor {
  id: string;
  role: 'passenger' | 'driver' | 'admin' | 'system';
  name?: string;
  email?: string;
  ipAddress?: string;
}

export interface CentralTimelineRecord {
  id: string;
  eventType: string;
  actor: CentralTimelineActor;
  entityId: string;
  previousState?: string | null;
  newState: string;
  timestamp: string;
  reason?: string;
  relatedRideOrUser?: string;
  auditInfo?: {
    ipAddress?: string;
    userAgent?: string;
    ruleVersion?: string;
    idempotencyKey?: string;
    metadata?: Record<string, any>;
  };
}

export type CanonicalRideState =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'OFFER_RECEIVED'
  | 'DRIVER_SELECTED'
  | 'DRIVER_ACCEPTED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'READY_TO_START'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DISPUTED'
  | 'REFUNDED'
  | RealtimeRideState;

export type RideStatus =
  | 'searching'
  | 'driver_assigned'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'refunded'
  | RealtimeRideState
  | CanonicalRideState;

export interface RideAdminNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface RideTimelineStep {
  step: number;
  key: string;
  title: string;
  titleUrdu?: string;
  timestamp?: string;
  status: 'completed' | 'in_progress' | 'pending';
  detail?: string;
}

export interface Ride {
  id: string;
  rideCode: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating: number;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  driverPlate?: string;
  category: RideCategory;
  city: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  status: RideStatus;
  fare: number; // PKR
  finalFare?: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  commission: number; // PKR (GoLife Cut)
  driverEarnings: number; // PKR
  distanceKm: number;
  durationMin: number;
  paymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  startTime: string;
  endTime?: string;
  updatedAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'passenger' | 'driver' | 'admin' | 'system';
  disputeNote?: string;
  fareAdjustmentReason?: string;
  adjustedBy?: string;
  disputeResolution?: any;
  offersCount?: number;
  initialFareBid?: number;
  // Extended Operations Center fields
  flagged?: boolean;
  flaggedReason?: string;
  adminNotesList?: RideAdminNote[];
  etaMinutes?: number;
  durationElapsedMin?: number;
  passengerStatus?: 'waiting' | 'at_pickup' | 'on_board' | 'dropped_off';
  driverOperationalStatus?: 'assigned' | 'going_to_pickup' | 'at_pickup' | 'on_trip';
  timeline?: RideTimelineStep[];
  // Phase 37: Pickup Verification
  expectedPickupTime?: string;
  actualArrivalTime?: string;
  pickupDelayMinutes?: number;
  pickupDelayStatus?: PickupDelayStatus;
  isLatePickupQualifying?: boolean;
  lateExclusionReason?: FairLateExclusionReason | string;
  pricingSnapshot?: FareCalculationSnapshot;
  ruleVersionId?: string;
}

export interface VerificationItem {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  city: string;
  category: RideCategory;
  submittedAt: string;
  documents: DriverDocument[];
  status: 'pending' | 'approved' | 'rejected';
  reviewStatus?: VerificationReviewStatus; // 'new' | 'under_review' | 'documents_required' | 'approved' | 'rejected' | 'suspended'
  rejectionReason?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  hasExpiredDocs?: boolean;
  registrationDate?: string;
  cnic?: string;
  vehicleInfo?: DriverVehicle;
  history?: VerificationReviewHistoryItem[];
}

export interface FareCategoryConfig {
  category: RideCategory;
  title: string;
  baseFare: number; // PKR
  perKm: number; // PKR
  perMin: number; // PKR
  minFare: number; // PKR
  commissionPct: number; // %
  serviceFee: number; // PKR
  cancellationFee: number; // PKR
  description: string;
}

export type CityOperatingStatus = 'active' | 'inactive' | 'coming_soon' | 'temporarily_suspended';
export type PassengerAvailabilityStatus = 'available' | 'coming_soon' | 'temporarily_unavailable';

export type OperatingScheduleMode =
  | '24_7'
  | 'specific_hours'
  | 'variable_by_day'
  | 'temporary_closure'
  | 'holiday_maintenance'
  | 'custom_hours'
  | 'curfew_paused';

export interface CityOperatingSchedule {
  mode: OperatingScheduleMode;
  standardOpenTime?: string; // e.g. "06:00"
  standardCloseTime?: string; // e.g. "23:00"
  weekdayHours?: { open?: string; close?: string; startTime?: string; endTime?: string };
  weekendHours?: { open?: string; close?: string; startTime?: string; endTime?: string };
  closureReason?: string;
  reopenEstimate?: string;
  maintenanceNote?: string;
  timezone?: string;
}

export interface CityDriverRequirements {
  minRating: number;
  requiredDocs?: string[];
  vehicleInspectionMandatory?: boolean;
  maxVehicleAgeYears?: number;
  minDriverAge?: number;
  policeVerificationMandatory?: boolean;
  minimumRating?: number;
  minimumVehicleYear?: number;
  commercialLicenseRequired?: boolean;
  mandatoryPoliceClearance?: boolean;
  academyTrainingRequired?: boolean;
}

export interface CityConfig {
  id: string;
  name: string;
  nameUrdu?: string;
  province: string;
  country?: string; // e.g. 'Pakistan'
  cityCode?: string; // e.g. 'LHE', 'KHI', 'ISB', 'RWP', 'FSD', 'MUX', 'PEW', 'QTA'
  status?: CityOperatingStatus;
  active: boolean;
  operatingSchedule?: CityOperatingSchedule;
  supportedCategories?: RideCategory[];
  allowedCategories?: RideCategory[];
  currency?: string; // 'PKR'
  timezone?: string; // 'Asia/Karachi (PKT, UTC+5)'
  driverRequirements?: CityDriverRequirements;
  passengerAvailability?: PassengerAvailabilityStatus;
  pricingRuleRef?: string; // Links to central Pricing Rule
  taxChargeRef?: string; // Links to central Tax & Platform Charges
  baseSurge?: number;
  baseFareAdjustment?: number;
  geofenceRadiusKm?: number;
  liveDriversCount?: number;
  serviceAvailability?: '24_7' | 'day_only' | 'night_restricted' | 'peak_hours';
  intercityEnabled?: boolean;
  centerCoordinates?: {
    lat: number;
    lng: number;
  };
  centerCoords?: {
    lat: number;
    lng: number;
  };
  baseSurgeFactor?: number;
  liveStats?: {
    totalDrivers?: number;
    onlineDrivers?: number;
    activeRides?: number;
    averageEtaMinutes?: number;
    completedTripsToday?: number;
  };
}

export type ServiceCategoryCode =
  | 'economy'
  | 'standard'
  | 'premium'
  | 'bike'
  | 'rickshaw'
  | 'van'
  | 'suv'
  | 'intercity'
  | 'freight'
  | string;

export type CategoryOperatingStatus = 'active' | 'inactive' | 'coming_soon';

export interface VehicleRequirementRule {
  allowedVehicleTypes?: string[];
  minYear?: number;
  minModelYear?: number;
  minSeatingCapacity?: number;
  maxSeatingCapacity?: number;
  passengerSeats?: number;
  luggageCapacityBags?: number;
  allowedFuelTypes?: string[];
  acMandatory?: boolean;
  airConditioningRequired?: boolean;
  inspectionMandatory?: boolean;
  allowedMakesModels?: string[];
}

export interface DriverEligibilityRule {
  minRating: number;
  minimumRating?: number;
  minCompletedRides?: number;
  requiredDocuments: string[];
  minExperienceMonths?: number;
  criminalRecordClearanceRequired?: boolean;
  minDriverAge?: number;
}

export interface ServiceCategoryConfig {
  id: string;
  code: ServiceCategoryCode;
  name: string;
  nameUrdu?: string;
  displayName: string;
  displayNameUrdu?: string;
  rideCategoryKey: RideCategory;
  description: string;
  status: CategoryOperatingStatus;
  iconName: string;
  vehicleType?: string;
  vehicleRequirements: VehicleRequirementRule;
  driverEligibility: DriverEligibilityRule;
  passengerAvailability: PassengerAvailabilityStatus;
  passengerVisibility?: boolean;
  bookingEnabled?: boolean;
  baseCommissionPercentage?: number;
  baseServiceFee?: number;
  pricingReference: string;
  taxReference: string;
  displayOrder: number;
}

export interface CityCategoryMatrixItem {
  id: string;
  cityId: string;
  cityName: string;
  categoryCode: ServiceCategoryCode;
  categoryName: string;
  status: 'active' | 'inactive' | 'coming_soon' | 'temporarily_suspended';
  availability: PassengerAvailabilityStatus;
  operatingHoursMode?: OperatingScheduleMode;
  surgeMultiplier: number;
  fareAdjustment: number;
  notes?: string;
  lastUpdated: string;
}

export interface CityOperationsStatistics {
  cityId: string;
  cityName: string;
  totalDrivers: number;
  onlineDrivers: number;
  totalPassengers: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  revenue: number;
  commission: number;
  fines: number;
  refunds: number;
  payouts: number;
  complaints: number;
  averageRating: number;
}

export interface CityOperationsAiInsight {
  id: string;
  title: string;
  city: string;
  category?: string;
  type: 'demand_surge' | 'supply_deficit' | 'operating_hours' | 'underperforming' | 'expansion';
  severity: 'low' | 'medium' | 'high' | 'info';
  observation: string;
  recommendation: string;
  timestamp: string;
}

export interface IntercityRoute {
  id: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  estimatedHours: number;
  standardFare: number; // PKR
  tollTaxes?: number;
  active: boolean;
  categoryPricing?: {
    GoMini?: number;
    GoRide?: number;
    GoComfort?: number;
  };
}

export interface PayoutRequest {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverCity: string;
  amount: number; // PKR
  method: 'jazzcash' | 'easypaisa' | 'bank_transfer';
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  referenceId?: string;
  rejectionReason?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  displayName?: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'flat';
  discountValue: number; // % or PKR
  maxDiscount?: number; // PKR
  minFare: number; // PKR
  usageLimit: number;
  usagePerPassenger?: number;
  usageCount?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  expiresAt?: string;
  expiryDate?: string;
  active?: boolean;
  paused?: boolean;
  status?: 'active' | 'expired' | 'disabled' | 'paused' | 'scheduled';
  applicableCity?: string;
  applicableCities?: string[];
  applicableCategories: RideCategory[];
  targetAudience?: 'all' | 'new_passengers' | 'existing_passengers' | 'selected_drivers';
  paymentMethodEligibility?: string[];
  driverEligibilityRequirements?: {
    minRating?: number;
    minCompletedRides?: number;
  };
  campaignId?: string;
  createdAt?: string;
}

export interface FreightJob {
  id: string;
  code: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  city: string;
  cargoType: 'furniture' | 'electronics' | 'commercial_goods' | 'food_catering' | 'construction' | 'other';
  weightKg: number;
  vehicleType: 'suzuki_ravi' | 'shahzore' | 'mazda_titan' | 'shehzore_flatbed' | string;
  fare: number; // PKR
  status: 'pending_dispatch' | 'in_transit' | 'delivered' | 'cancelled';
  driverId?: string;
  driverName?: string;
  createdAt: string;
  notes?: string;
}

export interface FreightOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverRating?: number;
  vehicleType: string;
  cargoDescription: string;
  weightKg: number;
  pickupLocation: string;
  dropLocation: string;
  fare: number;
  commission?: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  city?: string;
  createdAt?: string;
  notes?: string;
  shipperCnic?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  titleUrdu?: string;
  durationMins: number;
  summary: string;
}

export interface TrainingModule {
  id: string;
  order: number;
  title: string;
  titleUrdu?: string;
  description: string;
  descriptionUrdu?: string;
  durationMins: number;
  passingScore: number;
  enrolledCount: number;
  completedCount?: number;
  isMandatory: boolean;
  active?: boolean;
  category?: string;
  lessons?: CourseLesson[];
}

export interface LoanApplication {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  driverCnic?: string;
  driverRating?: number;
  driverVehicle?: string;
  purpose: string;
  amount: number;
  dailyDeduction: number;
  driverScore: number;
  tenureDays: number;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'repaid';
  repaidAmount: number;
  appliedAt: string;
  rejectionReason?: string;
  adminNotes?: string;
  approvalDate?: string;
  repaymentHistory?: { date: string; amount: number; balance: number }[];
}

export interface FareRule {
  category: RideCategory;
  title?: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  waitingChargePerMin: number;
  cancellationFee: number;
  serviceFee?: number;
  commissionPercentage: number;
  surgeMultiplier: number;
  surgeEnabled: boolean;
  status?: 'active' | 'maintenance';
  description?: string;
  cityPricing?: Record<string, { baseFare?: number; perKmRate?: number; minimumFare?: number }>;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  userType: 'driver' | 'passenger';
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  timestamp: string;
  description: string;
  category?: string;
  status?: string;
  paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'card' | 'wallet';
  isRefund?: boolean;
}

export interface ReferralRecord {
  id: string;
  referrerType: 'passenger' | 'driver';
  referrerId?: string;
  referrerName: string;
  referrerPhone: string;
  refereeType?: 'passenger' | 'driver';
  refereeId?: string;
  refereeName: string;
  refereePhone: string;
  referralCode: string;
  rewardAmount: number;
  referrerRewardAmount?: number;
  refereeRewardAmount?: number;
  status:
    | 'invited'
    | 'registered'
    | 'pending_qualification'
    | 'qualified'
    | 'reward_pending'
    | 'rewarded'
    | 'completed'
    | 'pending'
    | 'trips_in_progress'
    | 'expired'
    | 'cancelled'
    | 'rejected';
  tripsCompleted: number;
  tripsRequired: number;
  qualificationPeriodDays?: number;
  minRideFare?: number;
  city?: string;
  date: string;
  rewardDisbursed: boolean;
  rewardDisbursedAt?: string;
  rejectionReason?: string;
  suspicionFlag?: boolean;
  suspicionReason?: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  titleUrdu: string;
  category: 'safety' | 'customer_service' | 'navigation' | 'hygiene' | 'policies';
  durationMinutes: number;
  published: boolean;
  summary: string;
  summaryUrdu: string;
  completionRate: number; // %
  mandatoryForVerification: boolean;
}

export interface DriverLoan {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  loanType: 'fuel_advance' | 'tyre_replacement' | 'maintenance' | 'emergency';
  title: string;
  amount: number; // PKR
  repaymentDays: number;
  dailyDeductionPct: number; // % of daily ride earnings
  repaidAmount: number; // PKR
  status: 'pending_review' | 'forwarded_to_partner' | 'disbursed' | 'rejected' | 'repaid';
  partnerProvider: 'Finja Microfinance' | 'Mobilink Microfinance Bank' | 'Direct Advance';
  appliedAt: string;
  notes?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  titleUrdu?: string;
  message: string;
  body?: string;
  messageUrdu?: string;
  target: 'all' | 'passengers' | 'drivers';
  targetAudience?: 'all' | 'passengers' | 'drivers' | 'city';
  targetCity: string; // 'all' or specific city
  sentAt: string;
  sentBy: string;
  reachCount: number;
  status: 'sent' | 'scheduled';
  read?: boolean;
  category?: 'promotion' | 'safety' | 'maintenance' | 'system' | 'general';
}

export interface SupportTicketReply {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userType: 'passenger' | 'driver';
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  category: 'fare' | 'driver_behavior' | 'safety' | 'lost_item' | 'app_issue' | 'payout' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedAdmin?: string;
  city?: string;
  rideId?: string;
  description: string;
  replies: SupportTicketReply[];
  adminNotes?: string[];
  resolvedAt?: string;
  resolvedBy?: string;
}

export type FeedbackCategory =
  | 'Driving'
  | 'Pickup timing'
  | 'Behavior'
  | 'Vehicle'
  | 'Communication'
  | 'Safety'
  | 'Other';

export interface RideFeedback {
  id: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  passengerRating: number; // 1 - 5 stars
  driverRating?: number; // 1 - 5 stars
  passengerFeedback?: string;
  driverFeedback?: string;
  category: FeedbackCategory;
  date: string;
  tags?: string[];
  severity?: 'normal' | 'warning' | 'critical';
  resolved?: boolean;
}

export type UniversalDetailType = 'driver' | 'passenger' | 'ride' | 'complaint' | 'payment';

export interface UniversalDetailState {
  type: UniversalDetailType;
  id: string;
  initialTab?: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  complaintCode?: string;
  type: 'passenger_complaint' | 'driver_complaint' | 'lost_item' | 'fare_dispute' | 'behavior';
  category?: string;
  reporterType: 'passenger' | 'driver';
  reporterName: string;
  reporterPhone: string;
  reporterId?: string;
  targetName?: string;
  targetPhone?: string;
  targetId?: string;
  rideId?: string;
  rideCode?: string;
  city: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'low' | 'medium' | 'high' | 'critical' | string;
  status: 'open' | 'investigating' | 'resolved' | 'rejected' | 'new' | 'under_review' | 'escalated';
  subject: string;
  description: string;
  createdAt: string;
  adminNotes: string;
  assignedAdmin?: string;
  caseNotes?: { author: string; text: string; date: string }[];
  resolvedAt?: string;
  resolvedBy?: string;
  refundAmount?: number;
}

export type SafetyPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type SafetyIncidentCategory =
  | 'accident'
  | 'unsafe_driving'
  | 'harassment'
  | 'threat'
  | 'theft'
  | 'vehicle_breakdown'
  | 'vehicle_safety_issue'
  | 'passenger_safety_issue'
  | 'driver_safety_issue'
  | 'medical_emergency'
  | 'route_issue'
  | 'suspicious_activity'
  | 'other'
  | string;

export type SafetyEventStatus =
  | 'active'
  | 'acknowledged'
  | 'assigned'
  | 'under_investigation'
  | 'escalated'
  | 'police_contacted'
  | 'resolved'
  | 'false_alarm'
  | 'closed';

export type SafetyLocationFreshness = 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE';

export type SafetyResponseStatus = 'within_target' | 'near_target' | 'target_breached';

export interface SafetyResponseTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  note?: string;
  notes?: string;
}

export interface SafetyEvidenceItem {
  id: string;
  title: string;
  type: 'image' | 'document' | 'ride_telemetry' | 'location_record' | 'dashcam' | 'audio_recording' | 'admin_note';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  notes?: string;
}

export interface SafetyLocationBreadcrumb {
  timestamp: string;
  lat: number;
  lng: number;
  address?: string;
  freshness?: SafetyLocationFreshness;
  speed?: number;
  speedKmh?: number;
  rideState?: string;
  eventTrigger?: string;
}

export interface SafetyEmergencyContactConfig {
  id: string;
  city: string;
  serviceName: string;
  name?: string;
  contactNumber: string;
  dialNumber?: string;
  serviceType: 'police' | 'ambulance' | 'traffic' | 'internal_dispatch' | 'women_helpline';
  active: boolean;
  notes: string;
}

export interface SafetyResponseSlaConfig {
  sosAcknowledgementSeconds: number;
  sosFirstResponseSeconds: number;
  sosResolutionMinutes: number;
  standardAcknowledgementMinutes: number;
  standardResolutionHours: number;
}

export interface SafetyIncident {
  id: string;
  incidentCode: string;
  rideId: string;
  rideCode: string;
  reportedBy: 'passenger' | 'driver' | 'system';
  reporterName: string;
  reporterPhone: string;
  passengerId?: string;
  driverId?: string;
  driverName: string;
  driverPhone?: string;
  vehiclePlate: string;
  vehicleModel?: string;
  city: string;
  type: 'sos_trigger' | 'route_deviation' | 'crash_detection' | 'harassment_alert' | SafetyIncidentCategory;
  category?: SafetyIncidentCategory;
  severity?: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  priority?: SafetyPriority;
  location: {
    lat: number;
    lng: number;
    address: string;
    freshness?: SafetyLocationFreshness;
    accuracyMeters?: number;
    speedKmh?: number;
    batteryLevelPct?: number;
    signalStatus?: 'strong' | 'weak' | 'offline' | string;
    headingDegrees?: number;
    lastFreshness?: SafetyLocationFreshness | string;
    timestamp?: string;
  };
  pickupLocation?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  destinationLocation?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  rideStatus?: RideStatus;
  status: SafetyEventStatus;
  triggeredAt: string;
  emergencyTime?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes: string;
  description?: string;
  escalationNote?: string;
  assignedAdmin?: string;
  assignedTeam?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  requiresPoliceEscalation?: boolean;
  requiresMedicalEscalation?: boolean;
  timeline?: SafetyResponseTimelineEvent[];
  breadcrumbs?: SafetyLocationBreadcrumb[];
  responseStatus?: SafetyResponseStatus;
  caseId?: string;
  isEmergencySos?: boolean;
  isFalseAlarm?: boolean;
  falseAlarmReason?: 'duplicate' | 'accidental_tap' | 'test_alert' | 'cancelled_by_user';
  responseTimeline?: SafetyResponseTimelineEvent[];
  evidence?: SafetyEvidenceItem[];
  evidenceItems?: SafetyEvidenceItem[];
  locationHistory?: SafetyLocationBreadcrumb[];
  driverLocation?: { lat: number; lng: number; freshness: SafetyLocationFreshness };
  passengerLocation?: { lat: number; lng: number; freshness: SafetyLocationFreshness };
  metrics?: {
    alertTime?: string;
    acknowledgedAt?: string;
    firstResponseAt?: string;
    escalatedAt?: string;
    resolvedAt?: string;
    closedAt?: string;
    acknowledgementDelaySeconds?: number;
    firstResponseDelaySeconds?: number;
    totalDurationMinutes?: number;
    slaStatus?: SafetyResponseStatus;
  };
  emergencyContactAttempts?: {
    contactType: 'driver' | 'passenger' | 'emergency_contact' | 'local_emergency_service';
    timestamp: string;
    adminName: string;
    channel: 'phone_call' | 'in_app_voip' | 'sms' | 'push_notice';
    status: 'connected' | 'unanswered' | 'busy' | 'left_message';
    notes: string;
  }[];
  aiAssistance?: {
    summary: string;
    recommendedPriority: SafetyPriority;
    recommendedCategory: SafetyIncidentCategory;
    recommendedNextSteps: string[];
    patternNotes?: string;
    duplicateOfId?: string;
    riskScore?: number;
  };
}

// ============================================================================
// PHASE 48: SUPPORT, COMPLAINTS, DISPUTES & CENTRAL CASE MANAGEMENT TYPES
// ============================================================================

export type SupportCaseType =
  | 'passenger_complaint'
  | 'driver_complaint'
  | 'ride_dispute'
  | 'payment_dispute'
  | 'fare_dispute'
  | 'refund_request'
  | 'fine_dispute'
  | 'safety_report'
  | 'driver_behavior'
  | 'passenger_behavior'
  | 'lost_found'
  | 'general_support'
  | 'fraud_investigation';

export type SupportCaseCategory = SupportCaseType;

export type SupportCaseStatus =
  | 'new'
  | 'open'
  | 'under_review'
  | 'waiting_for_driver'
  | 'waiting_for_passenger'
  | 'escalated'
  | 'resolved'
  | 'rejected'
  | 'closed';

export type SupportCasePriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'critical';

export type SupportCaseSLAStatus =
  | 'within_sla'
  | 'near_sla'
  | 'sla_breached';

export interface SupportCaseEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: 'admin' | 'driver' | 'passenger' | 'system' | string;
  action: string;
  note: string;
}

export interface SupportCaseEvidence {
  id: string;
  title: string;
  type: 'image' | 'document' | 'ride_telemetry' | 'payment_receipt' | 'system_record';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  notes?: string;
}

export interface SupportCaseInternalNote {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  createdAt: string;
  isInternalOnly: boolean;
}

export interface SupportCaseRelatedFinancials {
  originalFare?: number;
  finalFare?: number;
  pricingRuleVersion?: string;
  distanceKm?: number;
  durationMin?: number;
  waitingTimeMin?: number;
  baseFare?: number;
  distanceCharge?: number;
  timeCharge?: number;
  serviceCharges?: number;
  taxAmount?: number;
  commissionAmount?: number;
  discountAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  relatedFineId?: string;
  fineAmount?: number;
  fineReason?: string;
  fineDeductionStatus?: string;
  relatedRefundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  payoutId?: string;
  driverEarningsId?: string;
}

export interface SupportCase {
  id: string;
  caseNumber: string;
  type: SupportCaseType;
  subCategory?: string;
  title: string;
  description: string;
  priority: SupportCasePriority;
  status: SupportCaseStatus;
  slaStatus: SupportCaseSLAStatus;
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  targetResolutionHours: number;
  currentWaitingHours: number;
  city: string;
  assignedAdmin?: string;
  assignedTeam?: 'support' | 'safety' | 'finance' | 'verification' | 'operations' | 'compliance' | 'fraud_ops';
  reporter: {
    id: string;
    name: string;
    phone: string;
    role: 'passenger' | 'driver' | 'system';
    avatar?: string;
    rating?: number;
    totalTrips?: number;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehiclePlate: string;
    vehicleModel: string;
    totalComplaints: number;
    totalFines: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    accountStatus: string;
  };
  passenger?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    totalRides: number;
    totalComplaints: number;
    accountStatus: string;
  };
  ride?: {
    id: string;
    code: string;
    pickup: string;
    dropoff: string;
    fare: number;
    date: string;
    vehicleType: string;
    status: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  safetyIndicator?: boolean;
  safetyCategory?: 'unsafe_driving' | 'accident' | 'harassment' | 'threat' | 'vehicle_safety' | 'emergency' | 'other';
  evidence: SupportCaseEvidence[];
  internalNotes: SupportCaseInternalNote[];
  timeline: SupportCaseEvent[];
  financials?: SupportCaseRelatedFinancials;
  resolution?: {
    outcome: string;
    note: string;
    resolvedBy: string;
    resolvedAt: string;
    financialActionTaken?: boolean;
  };
  previousResolutions?: {
    outcome: string;
    note: string;
    resolvedBy: string;
    resolvedAt: string;
  }[];
  driverResponse?: {
    text: string;
    submittedAt: string;
  };
  passengerResponse?: {
    text: string;
    submittedAt: string;
  };
  aiInsights?: {
    summary: string;
    recommendedCategory: string;
    recommendedPriority: SupportCasePriority;
    duplicateRisk: boolean;
    similarCasesCount: number;
    suggestedResolution: string;
  };
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string;
  module?: string;
  targetType?: 'driver' | 'passenger' | 'ride' | 'fare' | 'payout' | 'verification' | 'complaint' | 'promo' | 'system' | 'city' | 'loan' | 'freight' | 'notification' | 'admin' | 'academy' | 'ticket' | 'alert' | 'dispatch' | 'ai_insight' | 'automation_rule' | 'admin_task' | 'payment' | 'case' | 'risk_alert' | 'risk_rule' | 'watchlist';
  targetId?: string;
  target?: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  status?: 'success' | 'warning' | 'flagged';
  entity?: string;
  reason?: string;
  note?: string;
  source?: 'Manual' | 'Automatic' | 'AI recommendation' | string;
}

export type OperationsAlertType =
  | 'safety'
  | 'late_pickup'
  | 'location_stale'
  | 'active_ride_problem'
  | 'payment_problem'
  | 'verification'
  | 'suspension'
  | 'safety_report'
  | 'emergency_request'
  | 'long_waiting_time'
  | 'driver_offline_on_ride'
  | 'payment_failure'
  | 'ride_dispute'
  | 'repeated_cancellation'
  | 'suspicious_activity';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'escalated';
export type OperationsAlertPriority = AlertPriority;
export type OperationsAlertStatus = AlertStatus;

export interface OperationsAlert {
  id: string;
  code: string;
  type: OperationsAlertType;
  title: string;
  titleUrdu?: string;
  priority: AlertPriority;
  status: AlertStatus;
  city: string;
  rideId?: string;
  rideCode?: string;
  driverId?: string;
  driverName?: string;
  passengerId?: string;
  passengerName?: string;
  vehiclePlate?: string;
  description: string;
  location?: { lat: number; lng: number; address: string };
  assignedAdmin?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  notes: { id: string; author: string; text: string; timestamp: string }[];
}

export interface AppSettings {
  appName: string;
  supportPhone: string;
  supportWhatsApp: string;
  supportEmail: string;
  currency: string;
  country: string;
  phoneCode: string;
  defaultCommissionPct: number;
  driverReferralBonus: number;
  passengerReferralBonus: number;
  maxActiveRidesPerDriver: number;
  enableUrduInterface: boolean;
  taxPercentage?: number;
  firebaseSync?: boolean;
  firebaseProjectId: string;
  firebaseConnected: boolean;
  firestoreCollections: string[];

  // Advanced operational controls
  searchRadiusKm?: number;
  rideTimeoutSecs?: number;
  driverAcceptTimeoutSecs?: number;
  smsGatewayProvider?: 'telenor' | 'jazz' | 'zong' | 'twillio_demo';
  pushNotificationsEnabled?: boolean;
  sosAlertSmsEnabled?: boolean;
  audioRecordingMandatory?: boolean;
  sosWebhookUrl?: string;
  speedLimitAlertKmH?: number;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  minAppVersion?: string;
  forceUpdateEnabled?: boolean;
}

// ==========================================
// PHASE 33 — DRIVER CONTROL & COMPLIANCE TYPES
// ==========================================

export type SuspensionSourceType = 'automatic_system' | 'manual_admin';

export interface DriverSuspensionRecord {
  id: string;
  driverId: string;
  driverName: string;
  driverPlate?: string;
  type: 'automatic' | 'manual';
  source: string; // e.g. "System — Late Pickup Monitor" or "Admin: superadmin@golife.pk"
  reason: string;
  reasonCategory: string;
  ruleTriggered?: string;
  incidentCount?: number;
  relatedRideIds: string[];
  relatedComplaintIds: string[];
  durationHours: number;
  startTime: string;
  expiryTime: string;
  status: 'active' | 'expired' | 'revoked';
  notes: string;
  revokedBy?: string;
  revokedAt?: string;
  revokeReason?: string;
}

export interface DriverWarningRecord {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  reason: string;
  issuedBy: string;
  relatedComplaintId?: string;
  relatedRideId?: string;
  notes: string;
  acknowledged: boolean;
}

export interface LatePickupIncident {
  id: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerName: string;
  dateTime: string;
  expectedPickupTime: string;
  actualArrivalTime: string;
  pickupDelayMin: number;
  isQualifying: boolean; // excludes passenger-caused delay, cancelled ride, tech failure
  exclusionReason?: string;
  notes?: string;
}

export interface LatePickupConfig {
  requiredIncidentsForSuspension: number; // default: 5
  thresholdDelayMinutes: number; // default: 8
  suspensionDurationHours: number; // default: 12
  excludePassengerDelays: boolean;
  excludeTrafficSevere: boolean;
}

export interface DriverEarningsRideDetail {
  rideId: string;
  rideCode: string;
  time: string;
  pickupAddress: string;
  destinationAddress: string;
  fare: number;
  commission?: number;
  driverEarned?: number;
  paymentMethod: 'cash' | 'wallet' | 'easypaisa' | 'jazzcash';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'cancelled';
  status: RideStatus;
  delayMin?: number;
  distanceKm?: number;
}

export interface DriverDailySummary {
  id: string;
  driverId: string;
  driverName: string;
  driverPlate?: string;
  city?: string;
  date: string; // YYYY-MM-DD
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  grossEarnings: number; // PKR
  commission: number; // PKR
  netEarnings: number; // PKR
  cash: number; // PKR
  onlinePayments: number; // PKR
  adjustments: number; // PKR
  finalPayable: number; // PKR
  status: 'Calculated' | 'Pending' | 'Paid' | 'Adjusted';
  calculatedAt: string;
  settledAt?: string;
  settledBy?: string;
  rides?: DriverEarningsRideDetail[];
}

export type EarningsDateFilter =
  | 'today'
  | 'yesterday'
  | 'day_before_yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'previous_month'
  | 'this_year'
  | 'previous_year'
  | 'custom';

export type VerificationReviewStatus =
  | 'new'
  | 'under_review'
  | 'documents_required'
  | 'more_info_required'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'suspended';

export interface VerificationReviewHistoryItem {
  id: string;
  action: string;
  adminName: string;
  timestamp: string;
  notes?: string;
  reason?: string;
}

// ==========================================
// PHASE 34: AI ADMIN ASSISTANT & INTELLIGENCE TYPES
// ==========================================

export type PerformanceLevel = 'Excellent' | 'Good' | 'Needs Improvement' | 'At Risk' | 'Critical';
export type DriverRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type SmartRecommendedAction =
  | 'Monitor'
  | 'Issue Warning'
  | 'Request Review'
  | 'Temporary Suspension'
  | 'Escalate for Safety Review';

export interface DriverPerformanceScore {
  driverId: string;
  driverName: string;
  driverPlate: string;
  city: string;
  overallScore: number; // 0-100
  performanceLevel: PerformanceLevel;
  trend: 'improving' | 'stable' | 'declining';
  previousScore: number;
  factors: {
    onTimePickup: number; // 0-100
    rideCompletion: number; // 0-100
    cancellationRate: number; // 0-100 (higher means lower cancellation)
    passengerRating: number; // 0-100
    passengerComplaints: number; // 0-100 (fewer complaints = higher score)
    safetyReports: number; // 0-100 (fewer reports = higher score)
    acceptanceBehavior: number; // 0-100
    accountCompliance: number; // 0-100
  };
  factorScores?: {
    onTimePickup: number;
    rideCompletion: number;
    cancellationRate: number;
    passengerRating: number;
    passengerComplaints: number;
    safetyReports: number;
    acceptanceBehavior: number;
    accountCompliance: number;
  };
  calculatedAt: string;
}

export interface DriverRiskProfile {
  driverId: string;
  driverName: string;
  driverPlate: string;
  city: string;
  riskLevel: DriverRiskLevel;
  flags: string[];
  recommendedAction: SmartRecommendedAction;
  recommendationType: 'AI Recommendation'; // clearly distinguished from Automatic Rule
  reasonDetails: string;
  primaryImprovementArea: string;
  lastEvaluated: string;
}

export type AdminTaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type AdminTaskCategory =
  | 'driver_verification'
  | 'document_review'
  | 'complaint_investigation'
  | 'safety_report'
  | 'late_pickup_check'
  | 'high_risk_review'
  | 'pending_payout'
  | 'dispute_review'
  | 'suspension_expiry'
  | 'other';

export type AdminTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Dismissed';

export interface AdminTask {
  id: string;
  title: string;
  description: string;
  priority: AdminTaskPriority;
  category: AdminTaskCategory;
  relatedId?: string;
  relatedType?: 'driver' | 'ride' | 'complaint' | 'verification' | 'payout';
  relatedName?: string;
  createdAt: string;
  status: AdminTaskStatus;
  assignedAdmin?: string;
  targetTab: AdminTab;
  actionLabel: string;
}

export interface ScoreWeightsConfig {
  onTimePickup: number; // default 15%
  rideCompletion: number; // default 15%
  cancellationRate: number; // default 15%
  passengerRating: number; // default 20%
  passengerComplaints: number; // default 15%
  safetyReports: number; // default 10%
  acceptanceBehavior: number; // default 5%
  accountCompliance: number; // default 5%
}

export interface AutomationSettings {
  latePickupThresholdMinutes: number; // default 10
  latePickupSuspensionCount: number; // default 5
  suspensionDurationHours: number; // default 12
  complaintEscalationThreshold: number; // default 2
  lowRatingWarningThreshold: number; // default 4.2
  cancellationWarningThreshold: number; // default 20 (%)
  scoreWeights: ScoreWeightsConfig;
  enableRuleBasedAutomation: boolean;
  enableAiRecommendations: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  queryIntent?: string;
  structuredData?: {
    title?: string;
    stats?: { label: string; value: string | number; badge?: string }[];
    records?: {
      id: string;
      title: string;
      subtitle: string;
      status?: string;
      badgeColor?: string;
      actionTab?: AdminTab;
      actionPayload?: any;
    }[];
    recommendations?: string[];
    actionButtons?: { label: string; tab: AdminTab; payload?: any }[];
  };
}

export interface DailyAiSummary {
  date: string;
  generatedAt: string;
  ridePerformance: {
    totalBookings: number;
    completed: number;
    cancelled: number;
    inProgress: number;
    grossFare: number;
    completionRate: number;
  };
  driverPerformance: {
    onlineCount: number;
    activeTrips: number;
    avgScore: number;
    criticalCount: number;
    atRiskCount: number;
  };
  passengerActivity: {
    activePassengers: number;
    newUsers: number;
  };
  earnings: {
    totalGross: number;
    driverNet: number;
    averageFare: number;
  };
  commission: {
    platformCommission: number;
    effectiveRate: number;
  };
  complaints: {
    totalOpen: number;
    repeatDrivers: number;
    topCategory: string;
  };
  safetyAlerts: {
    activeCount: number;
    escalatedCount: number;
  };
  verificationRequests: {
    pendingCount: number;
    urgentCount: number;
  };
  suspensions: {
    totalActive: number;
    autoSuspendedToday: number;
  };
  importantIssues: string[];
  priorityActions: {
    id: string;
    action: string;
    targetTab: AdminTab;
    urgency: 'Critical' | 'High' | 'Medium';
  }[];
}

export interface CityIntelligenceData {
  city: string;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeDrivers: number;
  onlineDrivers: number;
  cancellationRate: number; // percentage
  averageFare: number; // PKR
  revenue: number; // PKR
  commission: number; // PKR
  averageRating: number;
  complaintCount: number;
  demandStatus: 'High Demand' | 'Balanced' | 'Needs Drivers' | 'Low Activity';
}

export interface ComplaintIntelligenceCategory {
  category: string;
  count: number;
  percentage: number;
  pendingCount: number;
  repeatDriverCount: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  avgReviewPriority: number; // 0-100
}

// ==========================================
// PHASE 40: CENTRAL PRICING & CHARGES ENGINE
// ==========================================

export interface PricingNumberField {
  amount: number;
  enabled: boolean;
  isPercentage?: boolean;
  label?: string;
}

export interface CategoryPricingOverride {
  minimumFare: number;
  maximumFare: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  commissionPercentage: number;
  serviceFee: number;
  waitingChargePerMin?: number;
  cancellationFee?: number;
  enabled: boolean;
}

export interface CityPricingOverride {
  commissionPercentage?: number;
  baseFareMultiplier?: number;
  perKmRateMultiplier?: number;
  minimumFare?: number;
  taxRatePercentage?: number;
  serviceFee?: number;
  enabled: boolean;
}

export interface PaymentMethodPricingRule {
  fee: number;
  isPercentage: boolean;
  enabled: boolean;
  label: string;
}

export interface CentralPricingRule {
  id: string;
  versionId: string;
  updatedAt: string;
  updatedBy: string;
  
  // Passenger Pricing
  minimumRideFare: PricingNumberField;
  maximumRideFare: PricingNumberField;
  minimumDriverOffer: PricingNumberField;
  maximumPassengerOffer: PricingNumberField;
  baseFare: PricingNumberField;
  perKmRate: PricingNumberField;
  perMinuteRate: PricingNumberField;
  passengerBookingFee: PricingNumberField;
  passengerServiceFee: PricingNumberField;
  waitingFeePerMinute: PricingNumberField;
  cancellationFee: PricingNumberField;
  passengerOtherCharges: PricingNumberField;
  
  // Driver Charges
  platformCommission: PricingNumberField;
  driverServiceFee: PricingNumberField;
  driverBookingFee: PricingNumberField;
  driverOtherCharges: PricingNumberField;
  driverTaxDeduction: PricingNumberField;
  
  // Platform & Tax Charges
  taxRate: PricingNumberField;
  
  // Payment Methods
  paymentMethods: {
    cash: PaymentMethodPricingRule;
    jazzcash: PaymentMethodPricingRule;
    easypaisa: PaymentMethodPricingRule;
    bank: PaymentMethodPricingRule;
    card: PaymentMethodPricingRule;
  };
  
  // Category & City Overrides
  categoryPricing: Record<string, CategoryPricingOverride>;
  cityPricing: Record<string, CityPricingOverride>;
}

export interface PricingRuleVersion {
  versionId: string;
  ruleId: string;
  changedBy: string;
  timestamp: string;
  previousRule: Partial<CentralPricingRule>;
  newRule: Partial<CentralPricingRule>;
  changeSummary: string;
  reasonNote: string;
  affectedScope: string;
  status: 'active' | 'archived';
}

export interface DriverPricingOverride {
  driverId: string;
  driverName: string;
  customCommissionPercentage?: number;
  customServiceFee?: number;
  reason: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

export interface FareCalculationSnapshot {
  ruleVersionId: string;
  calculatedAt: string;
  category: string;
  city: string;
  paymentMethod: string;
  distanceKm: number;
  durationMinutes: number;
  
  // Base & Fare
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  rawFare: number;
  validatedFare: number;
  isMinFareApplied: boolean;
  isMaxFareExceeded: boolean;
  
  // Passenger Total Breakdown
  passengerBookingFee: number;
  passengerServiceFee: number;
  taxAmount: number;
  paymentMethodFee: number;
  passengerOtherCharges: number;
  passengerTotal: number;
  
  // Driver Deductions Breakdown
  commissionRate: number;
  commissionAmount: number;
  driverServiceFee: number;
  driverOtherDeductions: number;
  driverTaxWithheld: number;
  driverTotalDeductions: number;
  driverNetEarnings: number;
  
  // Platform Revenue
  platformCommissionEarned: number;
  platformPassengerFees: number;
  platformDriverFees: number;
  platformGrossRevenue: number;
  platformNetRevenue: number;
}

// ==========================================
// PHASE 41 — DRIVER FINE & PENALTY ENGINE TYPES
// ==========================================

export type FineStatus =
  | 'pending'
  | 'partially_deducted'
  | 'deducted'
  | 'paid'
  | 'waived'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export type FineSource = 'manual' | 'automatic';

export type DeductionMethod =
  | 'driver_wallet'
  | 'driver_earnings'
  | 'available_balance'
  | 'pending_earnings';

export type FairExclusionReason =
  | 'passenger_requested_delay'
  | 'passenger_unavailable'
  | 'pickup_changed'
  | 'destination_changed'
  | 'road_closure'
  | 'severe_traffic'
  | 'approved_emergency'
  | 'technical_issue'
  | 'other_approved_exception';

export interface FineReason {
  id: string;
  label: string;
  defaultAmount: number; // PKR
  category: 'timing' | 'cancellation' | 'behavior' | 'compliance' | 'safety' | 'other';
  enabled: boolean;
  noteTemplate: string;
}

export interface DriverFine {
  id: string;
  fineCode: string; // e.g. FINE-PK-89101
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  city: string;
  reasonId: string;
  reasonLabel: string;
  amount: number; // PKR
  deductedAmount: number; // PKR
  remainingAmount: number; // PKR (Outstanding)
  status: FineStatus;
  source: FineSource;
  ruleId?: string;
  ruleVersion?: string;
  relatedRideId?: string;
  relatedRideCode?: string;
  relatedRideDetails?: {
    passengerName: string;
    pickup: string;
    destination: string;
    expectedTime: string;
    actualTime: string;
    delayMinutes: number;
    fare: number;
  };
  note: string;
  deductionMethod: DeductionMethod;
  isQualifying: boolean;
  exclusionReason?: FairExclusionReason;
  createdAt: string;
  updatedAt: string;
  createdByAdmin: string;
  waiverDetails?: {
    waivedBy: string;
    waivedAt: string;
    reason: string;
    note: string;
  };
  refundDetails?: {
    refundedBy: string;
    refundedAt: string;
    amount: number;
    reason: string;
    note: string;
    transactionId: string;
  };
  disputeDetails?: {
    disputeId: string;
    status: 'pending' | 'approved' | 'rejected' | 'partial_adjusted';
    submittedAt: string;
    driverMessage: string;
    evidenceUrl?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    decisionNote?: string;
    adjustmentAmount?: number;
  };
}

export interface FineTransaction {
  id: string;
  transactionId: string; // e.g. FTX-89102
  fineId: string;
  driverId: string;
  driverName: string;
  relatedRideId?: string;
  relatedRideCode?: string;
  originalFineAmount: number;
  amountDeducted: number;
  remainingAmount: number;
  deductionSource: DeductionMethod;
  type: 'fine_deduction' | 'fine_refund' | 'fine_partial_deduction' | 'fine_waiver_reversal';
  date: string;
  reason: string;
  note: string;
  status: 'completed' | 'partial' | 'reversed' | 'failed';
}

export interface AutomaticFineRule {
  id: string;
  title: string;
  reasonId: string;
  reasonLabel: string;
  enabled: boolean;
  thresholdCount: number;
  thresholdMinutes?: number;
  timePeriod: '24h' | '7d' | '30d';
  fineAmount: number; // PKR
  maxFinePerPeriod: number; // PKR
  noteTemplate: string;
  version: string;
  exclusionsSupported: string[];
  lastUpdated: string;
  updatedBy: string;
}

export interface FineRuleVersion {
  id: string;
  ruleId: string;
  ruleTitle: string;
  previousAmount: number;
  newAmount: number;
  previousThreshold: number;
  newThreshold: number;
  changedBy: string;
  changeDate: string;
  reason: string;
  versionTag: string;
}

// ==========================================
// PHASE 42 — REIMBURSEMENT, REFUND, ADJUSTMENT & SETTLEMENT ENGINE
// ==========================================

export type RefundStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'partially_refunded'
  | 'rejected'
  | 'cancelled'
  | 'failed';

export type FinancialActionType =
  | 'refund'
  | 'reimburse'
  | 'adjust'
  | 'reverse'
  | 'review_transaction';

export type ResolutionCategory =
  | 'passenger_refund'
  | 'driver_reimbursement'
  | 'ride_adjustment'
  | 'payment_correction'
  | 'fine_refund'
  | 'overpayment_refund'
  | 'failed_payment_adjustment'
  | 'cancellation_refund';

export interface RefundReasonItem {
  id: string;
  label: string;
  category: 'refund' | 'reimbursement' | 'both';
  enabled: boolean;
  defaultNote: string;
}

export interface PassengerRefundRecord {
  id: string;
  refundCode: string; // e.g. RFN-PK-90101
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
  remainingRefundable: number;
  paymentMethod: 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'card' | 'wallet';
  refundDestination: 'wallet_credit' | 'payment_refund_pending';
  status: RefundStatus;
  reason: string;
  note: string;
  requiresHighValueApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  transactionId?: string;
}

export interface DriverReimbursementRecord {
  id: string;
  reimbursementCode: string; // e.g. RMB-PK-90201
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  rideId?: string;
  rideCode?: string;
  amount: number;
  reason: string;
  note: string;
  paymentDestination: 'driver_wallet' | 'upcoming_payout';
  status: RefundStatus;
  requiresHighValueApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  transactionId?: string;
}

export interface FinancialAdjustmentRecord {
  id: string;
  adjustmentCode: string; // e.g. ADJ-PK-90301
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
  note: string;
  status: RefundStatus;
  createdBy: string;
  createdAt: string;
  transactionId?: string;
}

export type LedgerTransactionType =
  | 'Ride Payment'
  | 'Refund'
  | 'Reimbursement'
  | 'Fine'
  | 'Fine Refund'
  | 'Commission'
  | 'Service Charge'
  | 'Adjustment'
  | 'Payout';

export interface ComprehensiveLedgerTransaction {
  id: string;
  transactionId: string; // e.g. TXN-LEDGER-90401
  type: LedgerTransactionType;
  partyType: 'driver' | 'passenger' | 'platform';
  partyId: string;
  partyName: string;
  partyPhone?: string;
  rideId?: string;
  rideCode?: string;
  originalAmount: number;
  adjustmentAmount: number;
  netImpact: number; // positive = credit to party, negative = debit
  reason: string;
  note: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'processing' | 'cancelled' | 'reversed' | 'failed';
  createdBy: string;
  approvedBy?: string;
  date: string;
  ruleOrSource: string;
  relatedRecordId?: string;
}

export interface DailySettlementRecord {
  id: string;
  driverId: string;
  driverName: string;
  driverPlate: string;
  city: string;
  date: string;
  openingBalance: number;
  grossRideEarnings: number;
  commission: number;
  serviceCharges: number;
  fines: number;
  refunds: number;
  reimbursements: number;
  otherAdjustments: number;
  netEarnings: number;
  credits: number;
  deductions: number;
  closingBalance: number;
  status: 'Pending' | 'Settled' | 'Partially Settled';
  settledAt?: string;
  settledBy?: string;
  payoutReference?: string;
}

export interface ReconciliationRecord {
  id: string;
  rideId: string;
  rideCode: string;
  date: string;
  driverName: string;
  passengerName: string;
  rideFareRecorded: number;
  paymentRecorded: number;
  driverLedgerRecorded: number;
  platformCommissionRecorded: number;
  refundsRecorded: number;
  finesRecorded: number;
  reimbursementsRecorded: number;
  differenceAmount: number;
  status: 'matched' | 'review_required';
  mismatchReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNote?: string;
}

export interface AiFinancialAnomaly {
  id: string;
  type: 'duplicate_transaction' | 'unusual_refund' | 'repeated_reimbursements' | 'large_adjustment' | 'earning_mismatch' | 'reconciliation_issue';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  relatedEntityId: string;
  relatedEntityName: string;
  suggestedAction: string;
  recommendedReview: boolean;
  flaggedAt: string;
  status: 'open' | 'reviewed' | 'dismissed';
}

// ===================================================
// PHASE 43 — DRIVER PAYOUT, WITHDRAWAL & SETTLEMENT
// ===================================================

export type PayoutStatus =
  | 'Requested'
  | 'Under Review'
  | 'Approved'
  | 'Processing'
  | 'Completed'
  | 'Rejected'
  | 'Failed'
  | 'Cancelled';

export type PayoutMethod = 'Bank' | 'JazzCash' | 'Easypaisa' | 'Other';

export interface PayoutValidationCheck {
  key: string;
  label: string;
  passed: boolean;
  message: string;
  severity: 'pass' | 'warning' | 'error';
}

export interface PayoutValidationResult {
  isValid: boolean;
  canApprove: boolean;
  checks: PayoutValidationCheck[];
  availableBalance: number;
  outstandingFines: number;
  pendingDeductions: number;
  payableBalance: number;
  requestedAmount: number;
  minPayoutAmount: number;
  maxPayoutLimit: number;
}

export interface DriverPayoutRecord {
  id: string; // e.g. PO-8821
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverCity: string;
  driverPlate?: string;
  amount: number;
  paymentMethod: PayoutMethod;
  accountTitle: string;
  accountNumber: string; // Account # or IBAN or Mobile Wallet Number
  bankName?: string;
  optionalNote?: string;
  status: PayoutStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  processedAt?: string;
  processedBy?: string;
  completedAt?: string;
  completedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectionNote?: string;
  failedAt?: string;
  failedReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  transactionId?: string; // Linked payout transaction ID (e.g. TXN-PO-94101)
  referenceId?: string; // External bank / gateway reference
  processingFee?: number;
  netPayoutAmount?: number;
  payoutPeriod?: string;
  isAutomatedBatch?: boolean;
  reconciliationStatus?: 'Matched' | 'Mismatch' | 'Review Required';
  reconciliationNote?: string;
  retryCount?: number;
  auditTrail: {
    action: string;
    actor: string;
    timestamp: string;
    note: string;
  }[];
}

export interface DriverFinancialBalance {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  city: string;
  availableBalance: number;
  pendingEarnings: number;
  payableBalance: number;
  outstandingFines: number;
  pendingDeductions: number;
  lastPayout?: {
    id: string;
    amount: number;
    date: string;
    status: PayoutStatus;
    method: PayoutMethod;
  };
  nextEligiblePayout: {
    eligible: boolean;
    payableAmount: number;
    statusText: string;
    reason?: string;
  };
}

export interface PayoutConfigRule {
  minimumPayoutAmount: number;
  maximumPayoutAmount: number;
  payoutSchedule: 'Manual' | 'Daily' | 'Weekly' | 'Monthly';
  automaticPayoutEnabled: boolean;
  allowedPaymentMethods: PayoutMethod[];
  processingFeeFixed: number;
  processingFeePercentage: number;
  supervisorApprovalThreshold: number;
}

export interface PayoutTransactionRecord {
  id: string;
  transactionId: string; // e.g. TXN-PO-94101
  payoutId: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  amount: number;
  paymentMethod: string;
  accountDestination: string;
  period: string;
  status: 'Completed' | 'Processing' | 'Failed' | 'Cancelled';
  createdBy: string;
  approvedBy?: string;
  date: string;
  note: string;
  referenceId?: string;
}

export type SettlementPeriodFilter =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Yearly'
  | 'Today'
  | 'Yesterday'
  | '7 Days'
  | 'This Month'
  | 'Previous Month'
  | 'Year'
  | 'Custom Range';

export interface DriverPeriodSettlementSummary {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  city: string;
  periodLabel: string;
  totalRides: number;
  grossEarnings: number;
  commission: number;
  serviceCharges: number;
  fines: number;
  refunds: number;
  reimbursements: number;
  adjustments: number;
  netEarnings: number;
  openingBalance: number;
  todayCredits: number;
  todayDeductions: number;
  closingBalance: number;
  payoutsAmount: number;
  remainingBalance: number;
  reconciliationStatus: 'Matched' | 'Mismatch' | 'Review Required';
  mismatchNote?: string;
}

export interface PlatformRevenueSummary {
  periodLabel: string;
  grossRideValue: number;
  platformCommission: number;
  passengerServiceCharges: number;
  driverServiceCharges: number;
  otherCharges: number;
  refundsTotal: number;
  reimbursementsTotal: number;
  paymentProcessingFees: number;
  netPlatformRevenue: number;
}

export interface AiPayoutAnomaly {
  id: string;
  type: 'unusual_payout' | 'repeated_failed' | 'large_balance' | 'unusual_earnings' | 'reconciliation_mismatch' | 'repeated_refund';
  driverId: string;
  driverName: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedAction: string;
  reviewRecommended: boolean;
  detectedAt: string;
  status: 'open' | 'reviewed' | 'resolved';
}

// ==========================================
// PHASE 45: DRIVER PERFORMANCE, SAFETY & RISK TYPES
// ==========================================

export type PerformancePeriodFilter =
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'previous_month'
  | 'yearly'
  | 'custom';

export interface DriverLateDropoffIncident {
  id: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerName: string;
  city: string;
  dateTime: string;
  expectedArrivalTime: string;
  actualArrivalTime: string;
  delayMinutes: number;
  routeInfo: string;
  isQualifyingViolation: boolean;
  exclusionReason?: string;
  adminNotes?: string;
}

export interface DriverCancellationRecord {
  id: string;
  rideId: string;
  rideCode: string;
  driverId: string;
  driverName: string;
  passengerName: string;
  city: string;
  dateTime: string;
  cancellationReason: string;
  isPolicyViolation: boolean;
  fineApplied: boolean;
  fineId?: string;
  adminNotes?: string;
}

export type PerformanceTimelineEventType =
  | 'ride_completed'
  | 'late_pickup'
  | 'late_dropoff'
  | 'cancellation'
  | 'complaint'
  | 'low_rating'
  | 'fine'
  | 'suspension'
  | 'reinstatement'
  | 'warning'
  | 'verification_change'
  | 'safety_incident'
  | 'payout';

export interface DriverPerformanceTimelineEvent {
  id: string;
  timestamp: string;
  driverId: string;
  driverName: string;
  eventType: PerformanceTimelineEventType;
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  relatedRideId?: string;
  relatedCaseId?: string;
  meta?: Record<string, any>;
}

export interface CityPerformanceSummary {
  city: string;
  driverCount: number;
  onlineDrivers: number;
  avgRating: number;
  avgPerformanceScore: number;
  latePickupRate: number; // percentage
  lateDropoffRate: number; // percentage
  cancellationRate: number; // percentage
  complaintRate: number; // percentage
  safetyIncidents: number;
  finesCount: number;
  suspensionsCount: number;
}

export interface DriverPerformanceAggregate {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverEmail?: string;
  driverAvatar?: string;
  vehicle: DriverVehicle;
  city: string;
  status: 'online' | 'offline' | 'on_trip';
  operationalStatus?: DriverOperationalStatus;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  accountStatus: 'active' | 'suspended' | 'blocked';
  currentRideCode?: string;
  currentRideId?: string;
  rating: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  acceptanceRate: number;
  completionRate: number;
  cancellationRate: number;
  latePickupCount: number;
  lateDropoffCount: number;
  complaintsCount: number;
  safetyIncidentsCount: number;
  finesCount: number;
  finesTotalAmount: number;
  activeSuspension?: DriverSuspensionRecord;
  earningsPKR: number;
  walletBalancePKR: number;
  performanceScore: number;
  performanceLevel: PerformanceLevel;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: DriverRiskLevel;
  riskReasons: string[];
  coachingRecommendations: string[];
  factors: {
    rideCompletion: number;
    acceptanceBehavior: number;
    cancellationBehavior: number;
    pickupPunctuality: number;
    dropoffPunctuality: number;
    passengerRatings: number;
    complaints: number;
    safetyIncidents: number;
    verificationStatus: number;
    policyViolations: number;
  };
}

// ==========================================
// PHASE 46: DRIVER VERIFICATION & DOCUMENT MANAGEMENT TYPES
// ==========================================

export type VerificationPriorityTag =
  | 'new_verification'
  | 'expiring_soon'
  | 'expired'
  | 'repeated_rejection'
  | 'missing_docs'
  | 'safety_flag';

export interface VerificationDocumentRequirement {
  type: DriverDocument['type'];
  title: string;
  titleUrdu?: string;
  description: string;
  mandatory: boolean;
  requiresExpiry: boolean;
  appliesToCities?: string[]; // Empty means all
  appliesToCategories?: RideCategory[]; // Empty means all
}

export interface VerificationEligibilitySummary {
  identityVerified: boolean;
  licenseVerified: boolean;
  vehicleVerified: boolean;
  insuranceVerified: boolean;
  requiredDocumentsComplete: boolean;
  allRequiredDocumentsValid: boolean;
  eligibleToDrive: boolean;
  restrictionReasons: string[];
}

export interface VerificationRejectReasonOption {
  code: string;
  label: string;
  defaultExplanation: string;
}

// ==========================================
// PHASE 47: ADMIN HEADER/UI CONSOLIDATION &
// NOTIFICATION & COMMUNICATION CENTER TYPES
// ==========================================

export type DateRangeOption =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'yearly'
  | 'custom';

export type NotificationType =
  | 'system'
  | 'ride'
  | 'payment'
  | 'driver_verification'
  | 'document_expiry'
  | 'fine'
  | 'suspension'
  | 'payout'
  | 'refund'
  | 'complaint'
  | 'safety'
  | 'promotional'
  | 'maintenance';

export type NotificationPriority = 'normal' | 'high' | 'urgent' | 'critical';

export type NotificationRecipientType =
  | 'all'
  | 'drivers'
  | 'passengers'
  | 'driver_single'
  | 'passenger_single'
  | 'drivers_city'
  | 'passengers_city'
  | 'driver_category'
  | 'passenger_group';

export type NotificationDeliveryChannel =
  | 'in_app'
  | 'push_fcm'
  | 'sms'
  | 'whatsapp'
  | 'email';

export type NotificationDeliveryStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface NotificationRelatedEntity {
  type: 'driver' | 'passenger' | 'ride' | 'fine' | 'suspension' | 'payout' | 'refund' | 'complaint' | 'safety' | 'verification';
  id: string;
  code?: string;
  label?: string;
}

export interface NotificationRecord {
  id: string; // e.g. NOTIF-2026-8812
  title: string;
  titleUrdu?: string;
  message: string;
  messageUrdu?: string;
  body?: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientType: NotificationRecipientType;
  target?: 'all' | 'passengers' | 'drivers';
  targetCity?: string;
  recipientCity?: string;
  sentBy?: string;
  recipientId?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientCategory?: RideCategory;
  recipientGroup?: string;
  channels: NotificationDeliveryChannel[];
  status: NotificationDeliveryStatus;
  deliveryAttempts?: number;
  failureReason?: string;
  read: boolean;
  readAt?: string;
  sentAt: string;
  scheduledFor?: string;
  createdAt: string;
  createdBy: string;
  source: 'manual' | 'automatic' | 'system' | 'ai_suggested';
  relatedEntity?: NotificationRelatedEntity;
  reachCount?: number;
  openCount?: number;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string; // e.g. TMPL-VERIF-APP
  name: string;
  type: NotificationType;
  title: string;
  titleUrdu: string;
  message: string;
  messageUrdu: string;
  priority: NotificationPriority;
  defaultChannels: NotificationDeliveryChannel[];
  targetAudience: 'driver' | 'passenger' | 'both';
  placeholders: string[]; // e.g. ['{driverName}', '{rideId}', '{amount}']
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  channel: NotificationDeliveryChannel;
  recipient: string;
  status: NotificationDeliveryStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
  responsePayload?: string;
}

export interface YearlyMonthSummary {
  monthIndex: number; // 0 to 11
  monthName: string; // e.g. 'January'
  rides: number;
  revenuePKR: number;
  commissionPKR: number;
  driverEarningsPKR: number;
  finesPKR: number;
  refundsPKR: number;
  reimbursementsPKR: number;
  payoutsPKR: number;
  cancellations: number;
  complaints: number;
  newDrivers: number;
  newPassengers: number;
}

export interface YearlyReportData {
  year: number;
  totalRides: number;
  ridesCount?: number;
  completedRidesCount?: number;
  totalRevenuePKR: number;
  grossRevenuePKR?: number;
  totalCommissionPKR: number;
  commissionRevenuePKR?: number;
  totalDriverEarningsPKR: number;
  driverEarningsPKR?: number;
  totalFinesPKR: number;
  finesAmountPKR?: number;
  totalRefundsPKR: number;
  refundsAmountPKR?: number;
  totalReimbursementsPKR: number;
  reimbursementsAmountPKR?: number;
  totalPayoutsPKR: number;
  payoutsAmountPKR?: number;
  totalCancellations: number;
  cancelledCount?: number;
  totalComplaints: number;
  complaintsCount?: number;
  driverGrowth: number;
  newDriversCount?: number;
  passengerGrowth: number;
  newPassengersCount?: number;
  months: YearlyMonthSummary[];
}

// =======================================================
// PHASE 50: PROMO CODES, REFERRALS & REWARDS CONTROL CENTER
// =======================================================

export interface PromoUsageRecord {
  id: string;
  promoCode: string;
  promoId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  driverName?: string;
  rideId: string;
  rideCode?: string;
  originalFare: number;
  discountAmount: number;
  finalFare: number;
  city: string;
  serviceCategory: RideCategory | string;
  usedAt: string;
  status: 'applied' | 'failed' | 'expired' | 'reversed' | 'cancelled';
  failureReason?: string;
  ruleVersionApplied?: string;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  description: string;
  campaignType:
    | 'holiday_festival'
    | 'city_launch'
    | 'rush_hour'
    | 'driver_recruitment'
    | 'passenger_reactivation'
    | 'seasonal';
  audience:
    | 'all_passengers'
    | 'new_passengers'
    | 'existing_passengers'
    | 'selected_city'
    | 'selected_category'
    | 'all_drivers'
    | 'new_drivers'
    | 'existing_drivers';
  city: string;
  serviceCategory: string;
  serviceCategories?: string[];
  targetAudience?: string;
  startDate: string;
  endDate: string;
  totalBudget: number; // PKR
  maxDiscountBudget: number; // PKR
  maxRewardBudget: number; // PKR
  spentBudget: number; // PKR
  reservedBudget: number; // PKR
  maxUsers: number;
  currentUsersCount: number;
  maxUses: number;
  currentUsesCount: number;
  associatedPromoCodes: string[];
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ReferralRewardRule {
  id: string;
  programName: string;
  title?: string;
  programType: 'passenger_to_passenger' | 'driver_to_driver' | 'cross_user';
  referrerRewardAmount: number; // PKR
  refereeRewardAmount: number; // PKR
  rewardType: 'fixed' | 'percentage';
  qualificationRideCount: number;
  minimumRideFare: number; // PKR
  minRideFare?: number; // PKR alias
  qualificationPeriodDays: number;
  applicableCities: string[];
  applicableCategories: string[];
  maxRewardsPerUser: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRewardRule {
  id: string;
  title: string;
  type:
    | 'ride_milestone'
    | 'completion_rate'
    | 'performance_rating'
    | 'new_driver_incentive'
    | 'city_launch_bonus'
    | 'referral_reward'
    | 'campaign_reward';
  description: string;
  rewardAmount: number; // PKR
  targetMilestoneRides?: number;
  minCompletionRate?: number; // % e.g. 95
  minRating?: number; // e.g. 4.85
  maxCancellationRate?: number; // % e.g. 4
  city: string;
  serviceCategory: string;
  startDate: string;
  endDate: string;
  active: boolean;
  budgetCap: number;
  disbursedBudget: number;
}

export interface PassengerRewardRule {
  id: string;
  title: string;
  type: 'first_ride' | 'ride_milestone' | 'referral_reward' | 'promotional' | 'loyalty';
  description: string;
  rewardAmount: number; // PKR
  requiredRideCount?: number;
  minSpentAmount?: number;
  city: string;
  active: boolean;
  expiryDays: number;
  budgetCap?: number;
  disbursedBudget?: number;
}

export interface RewardRecord {
  id: string;
  userType: 'passenger' | 'driver';
  userId: string;
  userName: string;
  userPhone: string;
  rewardType: string;
  reason: string;
  amount: number; // PKR
  relatedRideId?: string;
  relatedCampaignId?: string;
  status: 'pending_review' | 'approved' | 'credited' | 'reversed' | 'rejected';
  creditedAt?: string;
  transactionId?: string;
  date: string;
  city: string;
  notes?: string;
}

export interface FraudDetectionAlert {
  id: string;
  type:
    | 'self_referral'
    | 'duplicate_device'
    | 'repeated_promo_abuse'
    | 'velocity_anomaly'
    | 'duplicate_reward_claim';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  userType: 'passenger' | 'driver';
  userPhone?: string;
  description: string;
  details: string;
  status: 'pending_review' | 'investigated' | 'cleared' | 'escalated_to_case';
  detectedAt: string;
  caseId?: string;
}

export interface PromotionAiInsight {
  id: string;
  type: 'campaign_suggestion' | 'anomaly_detection' | 'abuse_warning' | 'budget_pacing' | 'performance_highlight';
  title: string;
  summary: string;
  confidenceScore: number;
  suggestedActionLabel?: string;
  actionPayload?: any;
  metricImpact?: string;
  severity?: 'info' | 'warning' | 'success' | 'danger';
}

export interface PromotionsSummaryMetrics {
  totalPromosActive: number;
  totalUsageCount: number;
  totalDiscountDisbursedPKR: number;
  totalReferralsCount: number;
  qualifiedReferralsCount: number;
  referralRewardsDisbursedPKR: number;
  driverRewardsDisbursedPKR: number;
  passengerRewardsDisbursedPKR: number;
  totalCampaignBudgetPKR: number;
  totalBudgetSpentPKR: number;
  flaggedFraudAlertsCount: number;
}

// =========================================================================
// PHASE 53: FRAUD, ANTI-ABUSE & RISK CONTROL CENTER TYPES
// =========================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory =
  | 'account_abuse'
  | 'promo_abuse'
  | 'ride_abuse'
  | 'payment_abuse'
  | 'driver_abuse'
  | 'payout_abuse'
  | 'safety_risk'
  | 'gps_spoofing'
  | 'ghost_rides'
  | 'fare_manipulation'
  | 'cancellation_abuse'
  | 'driver_passenger_collusion'
  | 'account_takeover'
  | 'document_fraud'
  | 'route_tampering'
  | 'fake_surge_creation';

export type RiskStatus =
  | 'new'
  | 'open'
  | 'under_review'
  | 'under_investigation'
  | 'confirmed'
  | 'action_taken'
  | 'false_positive'
  | 'resolved'
  | 'dismissed'
  | 'expired';

export type RiskResolutionAction =
  | 'penalized'
  | 'case_escalated'
  | 'warning_issued'
  | 'cleared_legitimate'
  | 'false_positive'
  | 'duplicate_dismissed'
  | 'expired';

export interface RiskEvidenceItem {
  id: string;
  title: string;
  type:
    | 'telemetry'
    | 'device_id'
    | 'device_telemetry'
    | 'payment_log'
    | 'gps_trace'
    | 'screenshot'
    | 'user_statement'
    | 'system_log'
    | 'sensor_log'
    | 'financial_statement';
  url?: string;
  notes?: string;
  uploadedAt?: string;
  uploadedBy: string;
  fileSize?: string;
  sensitive?: boolean;
}

export interface RiskTimelineEvent {
  id: string;
  actor: string;
  actorRole?: string;
  timestamp: string;
  action: string;
  note: string;
}

export interface RiskAlertRecord {
  id: string;
  ruleId?: string;
  ruleVersion?: string;
  category: RiskCategory;
  title: string;
  description?: string;
  reason?: string;
  detectedEvent?: string;
  riskLevel: RiskLevel;
  riskScore: number;
  scoreBreakdown?: {
    baseScore: number;
    velocityScore: number;
    financialImpactScore: number;
    repetitionScore: number;
    fairContextAdjustment: number;
    explanation: string;
  };
  entityType: 'driver' | 'passenger' | 'ride' | 'payment' | 'payout' | 'promo' | 'referral' | 'account' | string;
  entityId: string;
  entityName: string;
  entityPhone?: string;
  city: string;
  financialImpactPkr?: number;
  confidenceScore?: number;
  suspiciousFactors?: string[];
  aiExplanation?: string;
  timestamp?: string;
  serviceCategory?: string;
  relatedRideId?: string;
  relatedRideCode?: string;
  relatedTransactionId?: string;
  relatedPromoCode?: string;
  relatedReferralId?: string;
  relatedPayoutId?: string;
  relatedCaseId?: string;
  status: RiskStatus;
  assignedAdmin?: string;
  assignedTeam?: string;
  evidenceRequested?: boolean;
  evidenceRequestedAt?: string;
  evidenceReceived?: boolean;
  flagged?: boolean;
  flaggedReason?: string;
  evidence?: RiskEvidenceItem[];
  timeline?: RiskTimelineEvent[];
  adminNotes?: string[];
  currentResolution?: RiskResolutionAction;
  resolutionAction?: RiskResolutionAction;
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  detectedAt?: string;
  automatedActionTaken?: string;
  rideId?: string;
  rideCode?: string;
  pickupLocation?: string;
  dropLocation?: string;
  fairContextChecked?: boolean;
  fairContextNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface RiskRule {
  id: string;
  ruleCode?: string;
  version: string | number;
  name: string;
  category: RiskCategory;
  description: string;
  trigger?: string;
  threshold?: string;
  thresholdConditions?: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in';
    limit: number;
    unit: string;
  };
  actionOnTrigger?:
    | 'alert_only'
    | 'flag_for_review'
    | 'require_otp'
    | 'restrict_payout'
    | 'throttle_dispatch'
    | 'block_trip'
    | 'auto_lock';
  sensitivity?: 'low' | 'medium' | 'high' | 'extreme';
  isEnabled?: boolean;
  timesTriggered?: number;
  timePeriod?: string;
  riskLevel?: RiskLevel;
  status?: 'active' | 'inactive' | 'draft';
  actionRecommendation?: string;
  effectiveDate?: string;
  previousVersions?: Array<{
    version: string;
    modifiedAt: string;
    modifiedBy: string;
    description: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RiskWatchlistEntry {
  id: string;
  entityType: 'driver' | 'passenger' | 'ride' | 'payment_ref' | 'device' | 'ip_cluster';
  entityId: string;
  entityName: string;
  entityPhone?: string;
  city?: string;
  riskLevel?: RiskLevel;
  reason: string;
  riskCategory?: RiskCategory;
  addedBy: string;
  addedDate: string;
  status?: 'active' | 'cleared' | 'expired';
  reviewStatus?: 'active_monitoring' | 'escalated' | 'cleared' | 'expired';
  expiryDate?: string;
  monitorUntil?: string;
  notes?: string;
  autoActions?: string[];
}

export interface RiskAiInsight {
  id: string;
  type: 'pattern_detected' | 'duplicate_cluster' | 'fair_context_cleared' | 'payout_spike' | 'investigation_suggestion';
  title: string;
  summary: string;
  patternName?: string;
  explanation?: string;
  confidence?: number;
  confidenceScore?: number;
  suggestedAction: string;
  impact?: string;
  potentialImpactPKR?: number;
  category: RiskCategory;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface RiskSummaryMetrics {
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  financialAtRiskPKR: number;
  mitigatedLossesPKR: number;
  watchlistCount: number;
  activeRulesCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  newAlerts: number;
  underReview: number;
  confirmed: number;
  falsePositives: number;
  resolved: number;
  suspiciousDrivers: number;
  suspiciousPassengers: number;
  suspiciousPayments: number;
  promoReferralAbuse: number;
  payoutRisk: number;
  accountAbuse: number;
  totalWatchlist: number;
  avgResolutionTimeHours: number;
}

// ============================================================================
// PHASE 54 — SYSTEM SETTINGS, FEATURE CONTROLS & BUSINESS RULES CENTER TYPES
// ============================================================================

export type SystemMaintenanceScope =
  | 'all'
  | 'passenger_app'
  | 'driver_app'
  | 'admin_panel';

export interface SystemMaintenanceConfig {
  enabled: boolean;
  scope: SystemMaintenanceScope;
  message: string;
  messageUrdu: string;
  startSchedule?: string;
  endSchedule?: string;
  adminBypassAllowed: boolean;
  activatedBy?: string;
  activatedAt?: string;
}

export interface SystemSupportContactConfig {
  helplineUan: string;
  emergencyHelpline: string;
  whatsapp: string;
  email: string;
  safetyEmail: string;
  headOfficeAddress: string;
}

export interface SystemControlSettings {
  platformName: string;
  appName: string;
  tagline: string;
  taglineUrdu: string;
  supportContact: SystemSupportContactConfig;
  defaultCountry: string;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  defaultCountryCode: string;
  defaultLanguage: 'en' | 'ur';
  secondaryLanguage: 'en' | 'ur';
  timezone: string;
  dateTimeFormat: string;
  distanceUnit: 'km' | 'miles';
  currencyFormatting: string;
  operatingStatus: 'online' | 'degraded' | 'maintenance';
  mode: 'demo' | 'production';
  maintenance: SystemMaintenanceConfig;
  lastUpdated: string;
  updatedBy: string;
}

export type FeatureCategory =
  | 'core_mobility'
  | 'payments'
  | 'growth'
  | 'safety'
  | 'operations'
  | 'automation';

export interface FeatureControl {
  id: string;
  name: string;
  nameUrdu?: string;
  description: string;
  category: FeatureCategory;
  status: 'active' | 'inactive';
  availabilityScope: 'global' | 'cities' | 'categories';
  cityScope: string[]; // ['all'] or city names
  serviceCategoryScope: string[]; // ['all'] or category codes
  startDate: string;
  endDate?: string;
  adminNote: string;
  lastUpdated: string;
  updatedBy: string;
  dependencies?: string[];
}

export interface RideBusinessRules {
  maxRideRequestDistanceKm: number;
  maxDriverSearchRadiusKm: number;
  rideRequestExpirySec: number;
  driverOfferExpirySec: number;
  passengerOfferExpirySec: number;
  maxCounterOffers: number;
  driverArrivalFreeWaitMins: number;
  passengerWaitBeforeCancelFeeMins: number;
  rideCompletionRequirement: 'otp_and_proximity' | 'proximity_only' | 'otp_only';
  pinRequirement: 'always' | 'night_only' | 'optional';
  cancellationWindowFreeMins: number;
  passengerCancellationFeePkr: number;
}

export interface DriverBusinessRules {
  minDriverRatingThreshold: number;
  maxActiveRidesLimit: number;
  requireApprovedCnic: boolean;
  requireApprovedLicense: boolean;
  requireVehicleInspection: boolean;
  minWalletBalancePkr: number;
  requiredDocuments: string[];
  driverInactivityThresholdDays: number;
  latePickupWarningThresholdMins: number;
  lateDropoffReviewThresholdMins: number;
}

export interface PassengerBusinessRules {
  minPassengerRatingForCash: number;
  passengerMaxOutstandingDebtPkr: number;
  consecutiveCancellationsLockCount: number;
  passengerNoShowFeePkr: number;
  accountAutoLockOnAbuse: boolean;
}

export interface SafetyBusinessRules {
  sosPoliceEscalationTimeoutSec: number;
  criticalIncidentPriorityLevel: 'P1' | 'P2';
  autoShareLiveGpsWithEmergencyContacts: boolean;
  telemetryPingFrequencySeconds: number;
  highSpeedWarningThresholdKmH: number;
}

export interface PaymentBusinessRules {
  minRidePaymentPkr: number;
  maxRidePaymentPkr: number;
  minDriverWithdrawalPkr: number;
  maxDriverWithdrawalPerDayPkr: number;
  maxNegativeWalletLimitPkr: number;
  gatewayTimeoutSeconds: number;
  failedPaymentAction: 'downgrade_to_cash_debt' | 'block_driver_settlement' | 'retry_gateway_once';
}

export interface CommissionAndTaxBusinessRules {
  defaultCommissionPct: number;
  punjabPraTaxPct: number;
  sindhSrbTaxPct: number;
  kpKpraTaxPct: number;
  islamabadIctTaxPct: number;
  balochistanBraTaxPct: number;
  fbrWhtTaxPct: number;
  driverReferralBonusPkr: number;
  passengerReferralBonusPkr: number;
}

export interface BusinessRulesConfig {
  rides: RideBusinessRules;
  driver: DriverBusinessRules;
  passenger: PassengerBusinessRules;
  safety: SafetyBusinessRules;
  payments: PaymentBusinessRules;
  commission?: CommissionAndTaxBusinessRules;
  lastUpdated: string;
  updatedBy: string;
}

export type ApprovalActionCategory = 'driver' | 'financial' | 'pricing' | 'system' | 'safety';

export type ApprovalRequirementType =
  | 'single_approval'
  | 'two_level_maker_checker'
  | 'super_admin_only'
  | 'role_based';

export interface SensitiveApprovalRule {
  id: string;
  actionCode: string;
  actionTitle: string;
  category: ApprovalActionCategory;
  approvalType: ApprovalRequirementType;
  requiredRole?: AdminRole;
  thresholdAmountPkr?: number;
  autoApproveBelowThreshold?: boolean;
  enabled: boolean;
  description: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface ConfigurationOverride {
  id: string;
  targetScope: 'city' | 'category' | 'city_category';
  cityName?: string;
  categoryName?: string;
  ruleGroup: 'rides' | 'driver' | 'passenger' | 'safety' | 'payments' | 'commission';
  ruleKey: string;
  ruleLabel: string;
  inheritedValue: any;
  overrideValue: any;
  unit?: string;
  status: 'active' | 'inactive';
  reason: string;
  effectiveDate: string;
  updatedBy: string;
}

export interface RuleVersionRecord {
  id: string;
  ruleId: string;
  ruleTitle: string;
  ruleCategory: 'business_rule' | 'feature_control' | 'system_setting' | 'approval_rule' | 'override';
  version: string;
  previousValue: any;
  newValue: any;
  effectiveDate: string;
  expiryDate?: string;
  changedBy: string;
  changedByRole: string;
  reason: string;
  adminNote: string;
  approvalInfo?: {
    approvedBy: string;
    approvalType: string;
    approvedAt: string;
  };
  timestamp: string;
}

export interface ConfigurationConflict {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  category: 'dependency' | 'contradiction' | 'missing_config' | 'availability';
  affectedEntities: string[];
  suggestedFix: string;
  autoFixActionKey?: string;
  detectedAt: string;
}

export interface SettingsAiRecommendation {
  id: string;
  title: string;
  summary: string;
  impact: string;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  proposedChange: {
    targetType: string;
    targetId: string;
    currentValue: any;
    recommendedValue: any;
    rationale: string;
  };
  confidenceScore: number;
  status: 'pending' | 'accepted' | 'dismissed';
}

export type SystemSettingsCenterTab =
  | 'system'
  | 'features'
  | 'business_rules'
  | 'approvals'
  | 'overrides'
  | 'versions'
  | 'conflicts_ai'
  | 'payment_accounts';

export type AiSettingRecommendation = SettingsAiRecommendation;

export * from './paymentArchitecture';










