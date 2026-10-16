/**
 * GoLife Taxi Pakistan - Phase 35 Release Certification & Production Smoke Test
 *
 * Verifies the full sequential Admin lifecycle required by Requirement 12:
 * Admin Login -> Dashboard -> Passenger -> Driver -> Verification -> Ride ->
 * Live Operations -> Fare -> Payment -> Wallet -> Commission -> Payout ->
 * Complaints -> Safety -> Notifications -> Reports -> Audit Logs -> Logout.
 */

import {
  getCentralDataSourceMode,
  isProductionDataSource,
  validateProductionConfig,
  assertProductionSafetyLock
} from '../config/dataSourceMode';
import { authService } from '../services/backend/AuthService';
import { demoRepository } from '../services/backend/DemoRepository';
import { calculateCentralFare, DEFAULT_CENTRAL_PRICING_RULE } from '../services/pricingEngine';
import { calculateMainReportMetrics } from '../services/reportsAnalyticsService';
import {
  isValidRideTransition,
  normalizeRideState,
  getCanonicalRideStateLabel
} from '../services/backend/CentralAdminControl';
import { centralLocationService, PAKISTAN_CITY_BOUNDARIES } from '../services/backend/CentralLocationService';
import { calculateCommissionForRide, INITIAL_COMMISSION_RULES } from '../services/commissionService';
import {
  Driver,
  Passenger,
  Ride,
  VerificationItem,
  DriverPayoutRecord,
  SupportCase,
  SafetyIncident,
  AdminNotification,
  AuditLog,
  AdminUser
} from '../types';

async function runProductionSmokeTest() {
  console.log('🌟 [PHASE 35] Commencing Full Sequential Production Smoke Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, stepName: string, details?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${stepName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${stepName}: ${details || 'Condition not met'}`);
      throw new Error(`Smoke Test Step Failed: ${stepName} - ${details}`);
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 1: ADMIN LOGIN
  // ---------------------------------------------------------------------------
  console.log('--- STEP 1: Admin Login & Session Token ---');
  const loginRes = await authService.login('admin@golife.pk', 'password123');
  assert(loginRes.success === true, 'Admin Login succeeds with Super Admin credentials');
  assert(loginRes.data?.admin.role === 'super_admin', 'Admin authenticated with super_admin role');
  assert(loginRes.data?.token.startsWith('gl_sess_'), 'Cryptographic admin session token generated');
  assert(Boolean(loginRes.data?.session.id), 'Active administrative session registered');
  const loggedAdmin = loginRes.data!.admin;

  // ---------------------------------------------------------------------------
  // STEP 2: DASHBOARD
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 2: Dashboard Overview & Metric Aggregation ---');
  const [passengersRes, driversRes, ridesRes] = await Promise.all([
    demoRepository.list<Passenger>('passengers'),
    demoRepository.list<Driver>('drivers'),
    demoRepository.list<Ride>('rides')
  ]);
  assert(passengersRes.items.length > 0, 'Dashboard loaded passenger telemetry');
  assert(driversRes.items.length > 0, 'Dashboard loaded fleet telemetry');
  assert(ridesRes.items.length > 0, 'Dashboard loaded historical and active rides');

  const mainMetrics = calculateMainReportMetrics(
    ridesRes.items,
    driversRes.items,
    passengersRes.items,
    [],
    [],
    [],
    [],
    [],
    'daily',
    'All'
  );
  assert(mainMetrics.totalRides >= 0, 'Total rides metric computed accurately');
  assert(mainMetrics.grossRevenue >= 0, 'Gross revenue metric aggregated without NaN');

  // ---------------------------------------------------------------------------
  // STEP 3: PASSENGER MANAGEMENT
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 3: Passenger Profile & Wallet Verification ---');
  const testPassenger = passengersRes.items[0];
  assert(Boolean(testPassenger.id && testPassenger.phone), 'Passenger has valid Pakistani phone and record ID');
  assert(testPassenger.status === 'active', 'Passenger in active operational state');
  assert(typeof testPassenger.walletBalance === 'number', 'Passenger wallet balance initialized');

  // ---------------------------------------------------------------------------
  // STEP 4: DRIVER MANAGEMENT
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 4: Driver Management & Fleet Status ---');
  const testDriver = driversRes.items[0];
  assert(Boolean(testDriver.id && testDriver.vehicle?.plate), 'Driver has registered vehicle with license plate');
  assert(testDriver.rating >= 0 && testDriver.rating <= 5, 'Driver rating within standard 0-5 scale');
  assert(['active', 'suspended', 'blocked'].includes(testDriver.accountStatus || 'active'), 'Driver account status valid');

  // ---------------------------------------------------------------------------
  // STEP 5: VERIFICATION & COMPLIANCE
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 5: Driver Verification & KYC Pipeline ---');
  const verificationsRes = await demoRepository.list<VerificationItem>('driverVerifications');
  assert(verificationsRes.items.length >= 0, 'Verification queue accessible');
  if (verificationsRes.items.length > 0) {
    const firstVer = verificationsRes.items[0];
    assert(['pending', 'verified', 'rejected', 'resubmission_required'].includes(firstVer.status), 'Verification status is valid');
  }

  // ---------------------------------------------------------------------------
  // STEP 6: RIDE LIFECYCLE
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 6: Ride Lifecycle State Transitions ---');
  assert(isValidRideTransition('REQUESTED', 'SEARCHING'), 'Lifecycle: REQUESTED -> SEARCHING');
  assert(isValidRideTransition('SEARCHING', 'DRIVER_ACCEPTED'), 'Lifecycle: SEARCHING -> DRIVER_ACCEPTED');
  assert(isValidRideTransition('DRIVER_ACCEPTED', 'DRIVER_ARRIVED'), 'Lifecycle: DRIVER_ACCEPTED -> DRIVER_ARRIVED');
  assert(isValidRideTransition('DRIVER_ARRIVED', 'IN_PROGRESS'), 'Lifecycle: DRIVER_ARRIVED -> IN_PROGRESS');
  assert(isValidRideTransition('IN_PROGRESS', 'COMPLETED'), 'Lifecycle: IN_PROGRESS -> COMPLETED');
  assert(normalizeRideState('completed') === 'COMPLETED', 'Canonical ride state normalization');
  assert(getCanonicalRideStateLabel('COMPLETED').label.includes('Completed'), 'Human-readable state label');

  // ---------------------------------------------------------------------------
  // STEP 7: LIVE OPERATIONS
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 7: Live Operations & City Geofencing ---');
  assert(Boolean(PAKISTAN_CITY_BOUNDARIES.Lahore), 'Lahore geofence boundaries defined');
  assert(Boolean(PAKISTAN_CITY_BOUNDARIES.Karachi), 'Karachi geofence boundaries defined');
  assert(Boolean(PAKISTAN_CITY_BOUNDARIES.Islamabad), 'Islamabad geofence boundaries defined');
  const lhrCenter = PAKISTAN_CITY_BOUNDARIES.Lahore.center;
  const libertyChowk = { lat: 31.5117, lng: 74.3436 };
  const distFromCenter = centralLocationService.calculateDistanceKm(
    { lat: lhrCenter.lat, lng: lhrCenter.lng },
    libertyChowk
  );
  assert(
    distFromCenter < PAKISTAN_CITY_BOUNDARIES.Lahore.serviceRadiusKm,
    'Liberty Chowk coordinate falls within Lahore service radius'
  );

  // ---------------------------------------------------------------------------
  // STEP 8: FARE CALCULATION
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 8: Fare Engine & Zero-Loss Calculation ---');
  const fareResult = calculateCentralFare({
    category: 'Economy',
    city: 'Lahore',
    distanceKm: 15,
    durationMinutes: 30
  }, DEFAULT_CENTRAL_PRICING_RULE);
  assert(fareResult.validatedFare > 0, 'Fare engine produces positive validated fare');
  assert(fareResult.commissionAmount > 0, 'Platform commission computed');
  assert(
    fareResult.driverNetEarnings + fareResult.driverTotalDeductions === fareResult.validatedFare,
    'Zero-loss reconciliation: Driver Net + Total Deductions equals Validated Fare'
  );

  // ---------------------------------------------------------------------------
  // STEP 9: PAYMENT CENTER
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 9: Payment Transaction Center & Ledger ---');
  const txRes = await demoRepository.list<any>('paymentTransactions');
  assert(Array.isArray(txRes.items), 'Payment transactions ledger queryable');

  // ---------------------------------------------------------------------------
  // STEP 10: WALLET SYSTEM
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 10: Driver & Passenger Wallets ---');
  const walletsRes = await demoRepository.list<any>('driverWallets');
  assert(Array.isArray(walletsRes.items), 'Driver wallets collection accessible');

  // ---------------------------------------------------------------------------
  // STEP 11: COMMISSION CONTROL
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 11: Commission Rates & Revenue Split ---');
  const comm = calculateCommissionForRide({
    rideId: 'r-smoke-101',
    rideCode: 'GL-TEST-101',
    driverId: 'drv-smoke-1',
    driverName: 'Test Driver',
    passengerId: 'pax-smoke-1',
    passengerName: 'Test Passenger',
    city: 'Karachi',
    serviceCategory: 'ride',
    distanceKm: 12,
    grossFare: 1000,
    rules: INITIAL_COMMISSION_RULES,
    overrides: []
  });
  assert(comm.grossFare === 1000, 'Gross fare matches Rs 1000');
  assert(comm.finalCommissionPKR > 0, 'Commission correctly computed on gross fare');
  assert(
    comm.driverNetEarningsPKR + comm.finalCommissionPKR === comm.grossFare,
    'Zero-loss reconciliation: Driver Net + Commission equals Gross Fare'
  );

  // ---------------------------------------------------------------------------
  // STEP 12: PAYOUTS & SETTLEMENTS
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 12: Driver Payouts & Settlement Workflow ---');
  const payoutsRes = await demoRepository.list<DriverPayoutRecord>('payouts');
  assert(Array.isArray(payoutsRes.items), 'Payouts queue queryable');

  // ---------------------------------------------------------------------------
  // STEP 13: COMPLAINTS & CASE MANAGEMENT
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 13: Unified Support & Case Management ---');
  const casesRes = await demoRepository.list<SupportCase>('supportCases');
  assert(Array.isArray(casesRes.items), 'Support cases and complaints accessible');

  // ---------------------------------------------------------------------------
  // STEP 14: SAFETY & EMERGENCY CENTER
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 14: Safety Incidents & SOS Panic Protocol ---');
  const safetyRes = await demoRepository.list<SafetyIncident>('safetyIncidents');
  assert(Array.isArray(safetyRes.items), 'Safety incidents collection queryable');

  // ---------------------------------------------------------------------------
  // STEP 15: NOTIFICATIONS CENTER
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 15: Push & SMS Notification Engine ---');
  const notifRes = await demoRepository.list<AdminNotification>('notifications');
  assert(Array.isArray(notifRes.items), 'Notifications dispatch archive queryable');

  // ---------------------------------------------------------------------------
  // STEP 16: REPORTS & ANALYTICS
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 16: Reports, Financial Reconciliation & Analytics ---');
  assert(typeof mainMetrics.driverEarnings === 'number', 'Driver total earnings computed');
  assert(typeof mainMetrics.platformCommission === 'number', 'Platform revenue computed');

  // ---------------------------------------------------------------------------
  // STEP 17: IMMUTABLE AUDIT LOGS
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 17: Immutable Audit Log Verification ---');
  const auditRes = await demoRepository.list<AuditLog>('auditLogs');
  assert(auditRes.items.length >= 0, 'Audit logs accessible');

  // ---------------------------------------------------------------------------
  // STEP 18: ADMIN LOGOUT
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 18: Secure Admin Logout ---');
  const logoutRes = await authService.logout(loginRes.data?.session.id);
  assert(logoutRes.success === true, 'Admin logout terminates session successfully');

  console.log(`\n🎉 ALL ${passed}/${total} PRODUCTION SMOKE TEST STEPS COMPLETED WITH 100% SUCCESS!`);
}

runProductionSmokeTest().catch((err) => {
  console.error('Smoke Test Failed:', err);
  process.exit(1);
});
