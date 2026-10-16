import {
  Driver,
  Ride,
  Complaint,
  SafetyIncident,
  LatePickupIncident,
  DriverSuspensionRecord,
  DriverFine,
  PerformancePeriodFilter,
  DriverLateDropoffIncident,
  DriverCancellationRecord,
  DriverPerformanceTimelineEvent,
  CityPerformanceSummary,
  DriverPerformanceAggregate,
  PerformanceLevel,
  DriverRiskLevel
} from '../types';

// ==========================================
// FAIR EXCLUSION REASONS FOR LATE ARRIVALS
// ==========================================
export const FAIR_LATE_DROPOFF_EXCLUSIONS = [
  'Passenger requested detour',
  'Severe weather / rain',
  'Road blockade / VIP movement',
  'Vehicle puncture / breakdown',
  'Technical map issue',
  'Unusual traffic bottleneck verified by telemetry',
  'Other approved exception'
] as const;

export const FAIR_LATE_PICKUP_EXCLUSIONS = [
  'Passenger requested delay',
  'Passenger changed pickup location',
  'Passenger unavailable at gate',
  'Road closure / construction',
  'Severe traffic / public event',
  'GPS / platform technical issue',
  'Ride cancelled before pickup',
  'Other approved exception'
] as const;

// ==========================================
// INITIAL DEMO LATE DROPOFF INCIDENTS
// ==========================================
export const INITIAL_DEMO_LATE_DROPOFFS: DriverLateDropoffIncident[] = [
  {
    id: 'ld-101',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    passengerName: 'Zainab Fatima',
    city: 'Lahore',
    dateTime: '2026-09-12 18:24 PKT',
    expectedArrivalTime: '18:18 PKT',
    actualArrivalTime: '18:24 PKT',
    delayMinutes: 6,
    routeInfo: 'Walton Road to DHA Phase 5 (Packages Mall route)',
    isQualifyingViolation: false,
    exclusionReason: 'Passenger requested detour',
    adminNotes: 'Passenger asked to stop by bank ATM on Walton Road for cash withdrawal.'
  },
  {
    id: 'ld-102',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    driverId: 'd-202',
    driverName: 'Khurram Shehzad',
    passengerName: 'Hamza Shabbir',
    city: 'Karachi',
    dateTime: '2026-09-12 18:36 PKT',
    expectedArrivalTime: '18:25 PKT',
    actualArrivalTime: '18:36 PKT',
    delayMinutes: 11,
    routeInfo: 'Dolmen Mall Clifton to Shahrah-e-Faisal',
    isQualifyingViolation: false,
    exclusionReason: 'Road blockade / VIP movement',
    adminNotes: 'Shahrah-e-Faisal flyover temporarily closed for official protocol.'
  },
  {
    id: 'ld-103',
    rideId: 'r-408',
    rideCode: 'GL-PK-89077',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Kashif Mehmood',
    city: 'Islamabad',
    dateTime: '2026-09-12 11:45 PKT',
    expectedArrivalTime: '11:20 PKT',
    actualArrivalTime: '11:45 PKT',
    delayMinutes: 25,
    routeInfo: 'F-10 Markaz to Blue Area Beverly Centre',
    isQualifyingViolation: true,
    adminNotes: 'Driver stopped without passenger consent for personal errand. Unjustified delay.'
  },
  {
    id: 'ld-104',
    rideId: 'r-409',
    rideCode: 'GL-PK-89065',
    driverId: 'd-204',
    driverName: 'Nawazish Ali',
    passengerName: 'Rizwan Sheikh',
    city: 'Lahore',
    dateTime: '2026-09-11 15:30 PKT',
    expectedArrivalTime: '15:12 PKT',
    actualArrivalTime: '15:30 PKT',
    delayMinutes: 18,
    routeInfo: 'Railway Station to Anarkali Bazar',
    isQualifyingViolation: true,
    adminNotes: 'Driver took significantly extended unrecommended route without valid traffic justification.'
  }
];

// ==========================================
// INITIAL DEMO CANCELLATION RECORDS
// ==========================================
export const INITIAL_DEMO_CANCELLATIONS: DriverCancellationRecord[] = [
  {
    id: 'cn-201',
    rideId: 'r-405',
    rideCode: 'GL-PK-89085',
    driverId: 'd-204',
    driverName: 'Nawazish Ali',
    passengerName: 'Rizwan Sheikh',
    city: 'Lahore',
    dateTime: '2026-09-12 14:05 PKT',
    cancellationReason: 'Passenger refused to come to agreed pickup gate',
    isPolicyViolation: false,
    fineApplied: false,
    adminNotes: 'Driver arrived at pin location; passenger refused to walk 15 meters to parking gate.'
  },
  {
    id: 'cn-202',
    rideId: 'r-410',
    rideCode: 'GL-PK-89044',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Saba Karim',
    city: 'Rawalpindi',
    dateTime: '2026-09-12 09:12 PKT',
    cancellationReason: 'Driver demanded extra cash off-app before departure',
    isPolicyViolation: true,
    fineApplied: true,
    fineId: 'fine-001',
    adminNotes: 'Confirmed violation. Fine of Rs. 300 issued via central fine policy rule.'
  },
  {
    id: 'cn-203',
    rideId: 'r-411',
    rideCode: 'GL-PK-89031',
    driverId: 'd-210',
    driverName: 'Waqas Ahmed (Demo: High Cancellations)',
    passengerName: 'Bilal Khan',
    city: 'Karachi',
    dateTime: '2026-09-11 19:40 PKT',
    cancellationReason: 'Driver asked passenger to cancel ride to avoid commission',
    isPolicyViolation: true,
    fineApplied: false,
    adminNotes: 'Under review by operations dispatch.'
  }
];

// ==========================================
// DEMO DRIVERS EXPANSION FOR PHASE 45
// ==========================================
export const DEMO_PERFORMANCE_DRIVERS: Driver[] = [
  {
    id: 'drv_03',
    name: 'Tariq Mehmood (Demo: Suspended / Late Pickups)',
    phone: '+92 312 9944112',
    email: 'tariq.mehmood@golife.pk',
    cnic: '37405-8910243-7',
    city: 'Islamabad',
    rating: 4.12,
    vehicle: {
      make: 'Toyota',
      model: 'Vitz 1.0L',
      year: 2019,
      color: 'Silver Metallic',
      plate: 'ICT-19-4412',
      category: 'GoMini'
    },
    status: 'offline',
    verificationStatus: 'verified',
    totalRides: 420,
    earnings: 198000,
    walletBalance: -850,
    commissionDue: 450,
    acceptanceRate: 74,
    joinedDate: '2024-09-01',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    documents: [
      { type: 'cnic_front', title: 'CNIC Front', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', verified: true, uploadedAt: '2024-09-01' },
      { type: 'driving_license', title: 'Islamabad License', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', verified: true, uploadedAt: '2024-09-01' }
    ],
    accountStatus: 'suspended',
    academyCompleted: true,
    latePickupCount: 5,
    latePickupIncidentsToday: 5,
    complaintsCount: 3,
    warningsCount: 2
  },
  {
    id: 'd-208',
    name: 'Rashid Minhas (Demo: Repeated Late Pickups)',
    phone: '+92 305 6677889',
    email: 'rashid.minhas@gmail.com',
    cnic: '35201-4455667-1',
    city: 'Lahore',
    rating: 4.38,
    vehicle: {
      make: 'Suzuki',
      model: 'WagonR VXR',
      year: 2021,
      color: 'Graphite Grey',
      plate: 'LEB-21-6677',
      category: 'GoMini'
    },
    status: 'online',
    verificationStatus: 'verified',
    totalRides: 610,
    earnings: 320000,
    walletBalance: 4200,
    commissionDue: 900,
    acceptanceRate: 86,
    joinedDate: '2024-04-12',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    documents: [],
    accountStatus: 'active',
    academyCompleted: true,
    latePickupCount: 4,
    latePickupIncidentsToday: 2,
    complaintsCount: 1
  },
  {
    id: 'd-209',
    name: 'Zulfiqar Babar (Demo: Repeated Complaints)',
    phone: '+92 322 8877112',
    email: 'zulfiqar.babar@yahoo.com',
    cnic: '42101-7788990-3',
    city: 'Karachi',
    rating: 4.21,
    vehicle: {
      make: 'Honda',
      model: 'Civic Oriel',
      year: 2020,
      color: 'Crystal Black',
      plate: 'KHI-20-8812',
      category: 'GoComfort'
    },
    status: 'online',
    verificationStatus: 'verified',
    totalRides: 780,
    earnings: 590000,
    walletBalance: 12500,
    commissionDue: 1800,
    acceptanceRate: 82,
    joinedDate: '2023-12-05',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    documents: [],
    accountStatus: 'active',
    academyCompleted: true,
    complaintsCount: 4,
    warningsCount: 1
  },
  {
    id: 'd-210',
    name: 'Waqas Ahmed (Demo: High Cancellations)',
    phone: '+92 331 5544332',
    email: 'waqas.ahmed88@gmail.com',
    cnic: '37405-2233445-9',
    city: 'Rawalpindi',
    rating: 4.45,
    vehicle: {
      make: 'Honda',
      model: 'CG-125 Self',
      year: 2023,
      color: 'Red & Chrome',
      plate: 'RWP-23-9901',
      category: 'GoMoto'
    },
    status: 'online',
    verificationStatus: 'verified',
    totalRides: 920,
    earnings: 280000,
    walletBalance: 5100,
    commissionDue: 600,
    acceptanceRate: 68,
    joinedDate: '2024-02-18',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    documents: [],
    accountStatus: 'active',
    academyCompleted: false,
    complaintsCount: 2
  }
];

// ==========================================
// TRANSPARENT DRIVER PERFORMANCE SCORE (0 - 100)
// ==========================================
export function calculateDetailedPerformanceScore(
  driver: Driver,
  rides: Ride[],
  complaints: Complaint[],
  safetyIncidents: SafetyIncident[],
  latePickups: LatePickupIncident[],
  lateDropoffs: DriverLateDropoffIncident[],
  cancellations: DriverCancellationRecord[],
  fines: DriverFine[]
): {
  overallScore: number;
  performanceLevel: PerformanceLevel;
  trend: 'improving' | 'stable' | 'declining';
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
} {
  const driverRides = (rides || []).filter((r) => r.driverId === driver.id);
  const totalRidesCount = Math.max(1, driverRides.length > 0 ? driverRides.length : driver.totalRides || 1);
  const completedRidesCount = driverRides.filter((r) => r.status === 'completed').length;
  const completionRatio = driverRides.length > 0 ? completedRidesCount / totalRidesCount : 0.95;

  // 1. Ride Completion (15% weight)
  const rideCompletion = Math.round(Math.max(10, Math.min(100, completionRatio * 100)));

  // 2. Acceptance Behavior (10% weight)
  const acceptanceBehavior = driver.accountStatus === 'suspended' ? 30 : Math.round(driver.acceptanceRate || 92);

  // 3. Cancellation Behavior (15% weight)
  const driverCancellations = (cancellations || []).filter((c) => c.driverId === driver.id);
  const policyViolatingCancellations = driverCancellations.filter((c) => c.isPolicyViolation).length;
  const cancelDeduction = policyViolatingCancellations * 18 + (driverCancellations.length - policyViolatingCancellations) * 5;
  const cancellationBehavior = Math.max(10, Math.min(100, 100 - cancelDeduction));

  // 4. Pickup Punctuality (15% weight)
  const driverLatePickups = (latePickups || []).filter((l) => l.driverId === driver.id && l.isQualifying);
  const pickupPunctuality = Math.max(10, Math.min(100, 100 - driverLatePickups.length * 16));

  // 5. Dropoff Punctuality (10% weight)
  const driverLateDropoffs = (lateDropoffs || []).filter((d) => d.driverId === driver.id && d.isQualifyingViolation);
  const dropoffPunctuality = Math.max(10, Math.min(100, 100 - driverLateDropoffs.length * 15));

  // 6. Passenger Ratings (15% weight)
  const rawRating = driver.rating > 0 ? driver.rating : 4.8;
  const passengerRatings = Math.round(Math.min(100, Math.max(10, (rawRating / 5.0) * 100)));

  // 7. Complaints (10% weight)
  const driverComplaints = (complaints || []).filter(
    (c) =>
      c.targetName?.toLowerCase() === driver.name.toLowerCase() ||
      c.targetPhone === driver.phone ||
      c.description?.toLowerCase().includes(driver.name.toLowerCase())
  );
  const complaintsScore = Math.max(10, Math.min(100, 100 - driverComplaints.length * 20));

  // 8. Safety Incidents (5% weight)
  const driverSafety = (safetyIncidents || []).filter(
    (s) =>
      s.driverName?.toLowerCase() === driver.name.toLowerCase() ||
      (driver.vehicle?.plate && s.vehiclePlate?.toLowerCase().includes(driver.vehicle.plate.toLowerCase()))
  );
  const safetyIncidentScore = Math.max(10, Math.min(100, 100 - driverSafety.length * 40));

  // 9. Verification Status (5% weight)
  let verificationStatus = 100;
  if (driver.verificationStatus !== 'verified') verificationStatus -= 40;
  if (driver.accountStatus === 'suspended') verificationStatus -= 50;
  verificationStatus = Math.max(10, Math.min(100, verificationStatus));

  // 10. Policy Violations & Fines (5% weight)
  const driverFines = (fines || []).filter((f) => f.driverId === driver.id);
  const policyViolations = Math.max(10, Math.min(100, 100 - driverFines.length * 25));

  // Multi-Factor Weighted Sum (Total = 100%)
  const weightedSum =
    rideCompletion * 0.15 +
    acceptanceBehavior * 0.1 +
    cancellationBehavior * 0.15 +
    pickupPunctuality * 0.15 +
    dropoffPunctuality * 0.1 +
    passengerRatings * 0.15 +
    complaintsScore * 0.1 +
    safetyIncidentScore * 0.05 +
    verificationStatus * 0.05 +
    policyViolations * 0.05;

  const overallScore = Math.round(Math.max(10, Math.min(100, weightedSum)));

  let performanceLevel: PerformanceLevel = 'Good';
  if (overallScore >= 90) performanceLevel = 'Excellent';
  else if (overallScore >= 75) performanceLevel = 'Good';
  else if (overallScore >= 60) performanceLevel = 'Needs Improvement';
  else if (overallScore >= 45) performanceLevel = 'At Risk';
  else performanceLevel = 'Critical';

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (driver.accountStatus === 'suspended' || driverLatePickups.length >= 3 || driverComplaints.length >= 2) {
    trend = 'declining';
  } else if (overallScore >= 88) {
    trend = 'improving';
  }

  return {
    overallScore,
    performanceLevel,
    trend,
    factors: {
      rideCompletion,
      acceptanceBehavior,
      cancellationBehavior,
      pickupPunctuality,
      dropoffPunctuality,
      passengerRatings,
      complaints: complaintsScore,
      safetyIncidents: safetyIncidentScore,
      verificationStatus,
      policyViolations
    }
  };
}

// ==========================================
// SAFETY RISK EVALUATOR WITH CLEAR "WHY" REASONS
// ==========================================
export function evaluateDriverRiskProfile(
  driver: Driver,
  score: number,
  latePickupsCount: number,
  lateDropoffsCount: number,
  complaintsCount: number,
  cancellationsCount: number,
  safetyIncidentsCount: number,
  finesCount: number
): {
  riskLevel: DriverRiskLevel;
  riskReasons: string[];
  coachingRecommendations: string[];
} {
  const reasons: string[] = [];
  const coaching: string[] = [];

  if (driver.accountStatus === 'suspended') {
    reasons.push('Driver account is actively suspended by operations compliance');
    coaching.push('Resolve outstanding compliance items before requesting account reinstatement');
  }

  if (latePickupsCount >= 4) {
    reasons.push(`${latePickupsCount} qualifying late pickup delays recorded`);
    coaching.push('Advise pre-starting GPS routing 5 minutes earlier to prevent pickup tardiness');
  }

  if (lateDropoffsCount >= 2) {
    reasons.push(`${lateDropoffsCount} unjustified late drop-off delays recorded`);
    coaching.push('Reinforce adherence to GoLife suggested navigation route without personal pauses');
  }

  if (complaintsCount >= 3) {
    reasons.push(`${complaintsCount} passenger service complaints logged on file`);
    coaching.push('Enroll in Drivers Academy Customer Service & Urdu Etiquette refresher module');
  }

  if (safetyIncidentsCount >= 1) {
    reasons.push(`${safetyIncidentsCount} safety SOS or emergency alerts linked to vehicle`);
    coaching.push('Undergo telematics driving inspection and verify mobile mount stability');
  }

  if (driver.rating > 0 && driver.rating < 4.4) {
    reasons.push(`Passenger rating (${driver.rating.toFixed(2)}) is below 4.4 platform quality threshold`);
    coaching.push('Check vehicle cleanliness, A/C effectiveness, and polite passenger greetings');
  }

  if (cancellationsCount >= 3 || (driver.acceptanceRate && driver.acceptanceRate < 75)) {
    reasons.push(`Excessive post-acceptance cancellations (${cancellationsCount}) impacting reliability`);
    coaching.push('Accept only rides within comfortable driving radius to minimize cancellation spikes');
  }

  if (finesCount >= 2) {
    reasons.push(`${finesCount} punitive fines levied against driver wallet`);
    coaching.push('Review GoLife Driver Code of Conduct to avoid further deductions');
  }

  if (driver.verificationStatus !== 'verified') {
    reasons.push('Driver KYC documentation incomplete or requires admin re-verification');
    coaching.push('Submit legible official Pakistani CNIC and active Driving License');
  }

  // Determine Risk Level
  let riskLevel: DriverRiskLevel = 'Low';
  if (reasons.length === 0) {
    reasons.push('Consistently meets platform reliability, safety, and punctuality standards');
    coaching.push('Continue excellent road manners and maintain 5-star service standard');
  } else if (reasons.length === 1 && score >= 75) {
    riskLevel = 'Medium';
  } else if (reasons.length >= 3 || score < 50 || driver.accountStatus === 'suspended') {
    riskLevel = 'Critical';
  } else {
    riskLevel = 'High';
  }

  return {
    riskLevel,
    riskReasons: reasons.length > 0 ? reasons : ['Clean compliance history with no outstanding infractions'],
    coachingRecommendations: coaching.length > 0 ? coaching : ['Maintain active high-quality service']
  };
}

// ==========================================
// CHRONOLOGICAL PERFORMANCE TIMELINE GENERATOR
// ==========================================
export function buildDriverPerformanceTimeline(
  driverId: string,
  rides: Ride[],
  complaints: Complaint[],
  safetyIncidents: SafetyIncident[],
  latePickups: LatePickupIncident[],
  lateDropoffs: DriverLateDropoffIncident[],
  cancellations: DriverCancellationRecord[],
  fines: DriverFine[],
  suspensions: DriverSuspensionRecord[]
): DriverPerformanceTimelineEvent[] {
  const events: DriverPerformanceTimelineEvent[] = [];

  // 1. Rides
  const dRides = (rides || []).filter((r) => r.driverId === driverId);
  dRides.forEach((r) => {
    if (r.status === 'completed') {
      events.push({
        id: `ev-ride-${r.id}`,
        timestamp: r.endTime || r.startTime || '2026-09-12 18:00 PKT',
        driverId,
        driverName: r.driverName || 'Driver',
        eventType: 'ride_completed',
        severity: 'success',
        title: `Ride Completed: ${r.rideCode}`,
        description: `Fare Rs. ${r.fare} | Earned Rs. ${r.driverEarnings || Math.round(r.fare * 0.85)} | ${r.category} in ${r.city}`,
        relatedRideId: r.id
      });
    }
  });

  // 2. Late Pickups
  const dLatePickups = (latePickups || []).filter((l) => l.driverId === driverId);
  dLatePickups.forEach((l) => {
    events.push({
      id: `ev-lp-${l.id}`,
      timestamp: l.dateTime,
      driverId,
      driverName: l.driverName,
      eventType: 'late_pickup',
      severity: l.isQualifying ? 'danger' : 'warning',
      title: `Pickup Delay: ${l.pickupDelayMin} mins (${l.rideCode})`,
      description: l.isQualifying
        ? `Qualifying Violation: Arrived at ${l.actualArrivalTime} (Expected: ${l.expectedPickupTime})`
        : `Fair Exclusion Applied: ${l.exclusionReason || 'Non-violating delay'}`,
      relatedRideId: l.rideId
    });
  });

  // 3. Late Dropoffs
  const dLateDropoffs = (lateDropoffs || []).filter((d) => d.driverId === driverId);
  dLateDropoffs.forEach((ld) => {
    events.push({
      id: `ev-ld-${ld.id}`,
      timestamp: ld.dateTime,
      driverId,
      driverName: ld.driverName,
      eventType: 'late_dropoff',
      severity: ld.isQualifyingViolation ? 'danger' : 'info',
      title: `Drop-off Delay: ${ld.delayMinutes} mins (${ld.rideCode})`,
      description: ld.isQualifyingViolation
        ? `Unjustified Route Delay: Expected ${ld.expectedArrivalTime}, Arrived ${ld.actualArrivalTime}`
        : `Excluded Delay: ${ld.exclusionReason || 'Approved traffic detour'}`,
      relatedRideId: ld.rideId
    });
  });

  // 4. Cancellations
  const dCancellations = (cancellations || []).filter((c) => c.driverId === driverId);
  dCancellations.forEach((cn) => {
    events.push({
      id: `ev-cn-${cn.id}`,
      timestamp: cn.dateTime,
      driverId,
      driverName: cn.driverName,
      eventType: 'cancellation',
      severity: cn.isPolicyViolation ? 'danger' : 'warning',
      title: `Ride Cancelled by Driver (${cn.rideCode})`,
      description: `Reason: ${cn.cancellationReason} ${cn.fineApplied ? '• Fine levied' : ''}`,
      relatedRideId: cn.rideId
    });
  });

  // 5. Complaints
  const dComplaints = (complaints || []).filter(
    (c) =>
      c.targetName?.toLowerCase().includes('tariq') ||
      c.rideId && dRides.some((r) => r.id === c.rideId)
  );
  dComplaints.forEach((cmp) => {
    events.push({
      id: `ev-cmp-${cmp.id}`,
      timestamp: cmp.createdAt,
      driverId,
      driverName: cmp.targetName || 'Driver',
      eventType: 'complaint',
      severity: 'danger',
      title: `Passenger Complaint: ${cmp.subject}`,
      description: cmp.description,
      relatedCaseId: cmp.id,
      relatedRideId: cmp.rideId
    });
  });

  // 6. Fines
  const dFines = (fines || []).filter((f) => f.driverId === driverId);
  dFines.forEach((fn) => {
    events.push({
      id: `ev-fine-${fn.id}`,
      timestamp: fn.createdAt,
      driverId,
      driverName: fn.driverName,
      eventType: 'fine',
      severity: 'danger',
      title: `Fine Levied: Rs. ${fn.amount} (${fn.fineCode || fn.id})`,
      description: `Reason: ${fn.reasonLabel} | Status: ${fn.status.toUpperCase()}`,
      relatedCaseId: fn.id,
      relatedRideId: fn.relatedRideId
    });
  });

  // 7. Suspensions
  const dSuspensions = (suspensions || []).filter((s) => s.driverId === driverId);
  dSuspensions.forEach((sp) => {
    events.push({
      id: `ev-susp-${sp.id}`,
      timestamp: sp.startTime,
      driverId,
      driverName: sp.driverName,
      eventType: 'suspension',
      severity: 'danger',
      title: `Account Suspended (${sp.durationHours}h)`,
      description: `Reason: ${sp.reason} | Source: ${sp.source}`,
      meta: { expiry: sp.expiryTime, status: sp.status }
    });
    if (sp.status === 'revoked') {
      events.push({
        id: `ev-reinst-${sp.id}`,
        timestamp: sp.revokedAt || sp.startTime,
        driverId,
        driverName: sp.driverName,
        eventType: 'reinstatement',
        severity: 'success',
        title: 'Driver Account Reinstated',
        description: `Reinstated by: ${sp.revokedBy || 'Admin'}. Reason: ${sp.revokeReason || 'Administrative approval'}`
      });
    }
  });

  // Sort descending by timestamp
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ==========================================
// CITY PERFORMANCE BENCHMARK CALCULATOR
// ==========================================
export function calculateCityPerformanceSummaries(
  drivers: Driver[],
  aggregates: DriverPerformanceAggregate[]
): CityPerformanceSummary[] {
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Faisalabad', 'Multan', 'Quetta'];
  const safeAggregates = aggregates || [];
  
  return cities.map((cityName) => {
    const cityDrivers = safeAggregates.filter((a) => (a.city || '').toLowerCase() === cityName.toLowerCase());
    const count = cityDrivers.length || 1; // avoid / 0
    const online = cityDrivers.filter((d) => d.status === 'online' || d.status === 'on_trip').length;

    const avgRating = cityDrivers.reduce((acc, d) => acc + (d.rating || 4.5), 0) / count;
    const avgScore = cityDrivers.reduce((acc, d) => acc + d.performanceScore, 0) / count;
    const avgLatePickup = cityDrivers.reduce((acc, d) => acc + d.latePickupCount, 0) / count;
    const avgLateDropoff = cityDrivers.reduce((acc, d) => acc + d.lateDropoffCount, 0) / count;
    const avgCancel = cityDrivers.reduce((acc, d) => acc + d.cancellationRate, 0) / count;
    const avgComplaint = cityDrivers.reduce((acc, d) => acc + d.complaintsCount, 0) / count;
    const safety = cityDrivers.reduce((acc, d) => acc + d.safetyIncidentsCount, 0);
    const fines = cityDrivers.reduce((acc, d) => acc + d.finesCount, 0);
    const suspensions = cityDrivers.reduce((acc, d) => acc + (d.accountStatus === 'suspended' ? 1 : 0), 0);

    return {
      city: cityName,
      driverCount: cityDrivers.length,
      onlineDrivers: online,
      avgRating: Number(avgRating.toFixed(2)),
      avgPerformanceScore: Math.round(avgScore),
      latePickupRate: Number((avgLatePickup * 2.4).toFixed(1)),
      lateDropoffRate: Number((avgLateDropoff * 1.8).toFixed(1)),
      cancellationRate: Number(avgCancel.toFixed(1)),
      complaintRate: Number((avgComplaint * 1.2).toFixed(1)),
      safetyIncidents: safety,
      finesCount: fines,
      suspensionsCount: suspensions
    };
  });
}
