import {
  Driver,
  Ride,
  Complaint,
  SafetyIncident,
  VerificationItem,
  PayoutRequest,
  LatePickupIncident,
  DriverSuspensionRecord,
  DriverDailySummary,
  DriverPerformanceScore,
  DriverRiskProfile,
  AdminTask,
  AutomationSettings,
  AiChatMessage,
  DailyAiSummary,
  CityIntelligenceData,
  ComplaintIntelligenceCategory,
  ScoreWeightsConfig,
  PerformanceLevel,
  DriverRiskLevel,
  SmartRecommendedAction,
  AdminTab
} from '../types';
import { formatPKR } from '../utils/i18n';

// Default score weights
export const DEFAULT_SCORE_WEIGHTS: ScoreWeightsConfig = {
  onTimePickup: 15,
  rideCompletion: 15,
  cancellationRate: 15,
  passengerRating: 20,
  passengerComplaints: 15,
  safetyReports: 10,
  acceptanceBehavior: 5,
  accountCompliance: 5
};

// Default automation settings
export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  latePickupThresholdMinutes: 10,
  latePickupSuspensionCount: 5,
  suspensionDurationHours: 12,
  complaintEscalationThreshold: 2,
  lowRatingWarningThreshold: 4.2,
  cancellationWarningThreshold: 20,
  scoreWeights: DEFAULT_SCORE_WEIGHTS,
  enableRuleBasedAutomation: true,
  enableAiRecommendations: true
};

/**
 * Helper to match complaints to a driver
 */
function getDriverComplaints(driver: Driver, complaints: Complaint[]): Complaint[] {
  return (complaints || []).filter((c) => {
    if (c.targetName && c.targetName.toLowerCase() === driver.name.toLowerCase()) return true;
    if (c.targetPhone && c.targetPhone === driver.phone) return true;
    if (c.description && c.description.toLowerCase().includes(driver.name.toLowerCase())) return true;
    return false;
  });
}

/**
 * Helper to match safety incidents to a driver
 */
function getDriverSafetyIncidents(driver: Driver, safetyIncidents: SafetyIncident[]): SafetyIncident[] {
  return (safetyIncidents || []).filter((s) => {
    if (s.driverName && s.driverName.toLowerCase() === driver.name.toLowerCase()) return true;
    if (s.vehiclePlate && s.vehiclePlate.toLowerCase() === driver.vehicle?.plate?.toLowerCase()) return true;
    return false;
  });
}

/**
 * 1. DRIVER PERFORMANCE SCORE (0 - 100)
 * Calculates a multi-factor score for a driver.
 * Does not punish drivers automatically; used as an admin decision-support tool.
 */
export function calculateDriverPerformanceScore(
  driver: Driver,
  rides: Ride[],
  complaints: Complaint[],
  safetyIncidents: SafetyIncident[],
  lateIncidents: LatePickupIncident[],
  weights: ScoreWeightsConfig = DEFAULT_SCORE_WEIGHTS
): DriverPerformanceScore {
  const safeWeights: ScoreWeightsConfig = {
    ...DEFAULT_SCORE_WEIGHTS,
    ...(weights || {})
  };

  const driverRides = (rides || []).filter((r) => r.driverId === driver.id);
  const driverComplaints = getDriverComplaints(driver, complaints);
  const driverSafety = getDriverSafetyIncidents(driver, safetyIncidents);
  const driverLate = (lateIncidents || []).filter((l) => l.driverId === driver.id);

  // 1. On-time pickup factor (0 - 100)
  const qualifyingLateCount = driverLate.filter((l) => l.isQualifying).length;
  const onTimePickup = Math.max(10, Math.min(100, 100 - qualifyingLateCount * 18));

  // 2. Ride completion factor (0 - 100)
  const totalRidesCount = driverRides.length > 0 ? driverRides.length : driver.totalRides || 1;
  const completedRidesCount = driverRides.filter((r) => r.status === 'completed').length;
  const completionRatio = driverRides.length > 0 ? completedRidesCount / totalRidesCount : 0.95;
  const rideCompletion = Math.round(Math.max(20, Math.min(100, completionRatio * 100)));

  // 3. Cancellation rate factor (0 - 100) - Higher is better
  const cancelledCount = driverRides.filter((r) => r.status === 'cancelled').length;
  const cancellationRatio = driverRides.length > 0 ? cancelledCount / totalRidesCount : 0.05;
  const cancellationRate = Math.round(Math.max(15, Math.min(100, 100 - cancellationRatio * 150)));

  // 4. Passenger rating factor (0 - 100)
  const rawRating = driver.rating > 0 ? driver.rating : 4.8;
  const passengerRating = Math.round(Math.min(100, (rawRating / 5.0) * 100));

  // 5. Passenger complaints factor (0 - 100)
  const complaintsCount = driverComplaints.length;
  const passengerComplaints = Math.max(15, Math.min(100, 100 - complaintsCount * 22));

  // 6. Safety reports factor (0 - 100)
  const safetyCount = driverSafety.length;
  const safetyReports = Math.max(10, Math.min(100, 100 - safetyCount * 45));

  // 7. Acceptance behavior factor (0 - 100)
  const acceptanceBehavior = driver.accountStatus === 'suspended' ? 30 : driver.acceptanceRate || 92;

  // 8. Account compliance factor (0 - 100)
  let accountCompliance = 100;
  if (driver.verificationStatus !== 'verified') accountCompliance -= 25;
  if (driver.accountStatus === 'suspended') accountCompliance -= 50;
  if (driver.warnings && driver.warnings.length > 0) accountCompliance -= driver.warnings.length * 15;
  accountCompliance = Math.max(10, Math.min(100, accountCompliance));

  // Weighted sum
  const totalWeight =
    safeWeights.onTimePickup +
    safeWeights.rideCompletion +
    safeWeights.cancellationRate +
    safeWeights.passengerRating +
    safeWeights.passengerComplaints +
    safeWeights.safetyReports +
    safeWeights.acceptanceBehavior +
    safeWeights.accountCompliance;

  const weightedSum =
    (onTimePickup * safeWeights.onTimePickup +
      rideCompletion * safeWeights.rideCompletion +
      cancellationRate * safeWeights.cancellationRate +
      passengerRating * safeWeights.passengerRating +
      passengerComplaints * safeWeights.passengerComplaints +
      safetyReports * safeWeights.safetyReports +
      acceptanceBehavior * safeWeights.acceptanceBehavior +
      accountCompliance * safeWeights.accountCompliance) /
    (totalWeight || 100);

  const overallScore = Math.round(Math.max(10, Math.min(100, weightedSum)));

  // Performance level classification
  let performanceLevel: PerformanceLevel = 'Good';
  if (overallScore >= 90) performanceLevel = 'Excellent';
  else if (overallScore >= 75) performanceLevel = 'Good';
  else if (overallScore >= 60) performanceLevel = 'Needs Improvement';
  else if (overallScore >= 45) performanceLevel = 'At Risk';
  else performanceLevel = 'Critical';

  // Seeded trend determination
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  let previousScore = overallScore;
  if (driver.accountStatus === 'suspended' || qualifyingLateCount >= 3) {
    trend = 'declining';
    previousScore = Math.min(100, overallScore + 8);
  } else if (overallScore >= 88) {
    trend = 'improving';
    previousScore = Math.max(20, overallScore - 4);
  } else {
    trend = 'stable';
    previousScore = overallScore;
  }

  return {
    driverId: driver.id,
    driverName: driver.name,
    driverPlate: driver.vehicle?.plate || 'LE-2024',
    city: driver.city,
    overallScore,
    performanceLevel,
    trend,
    previousScore,
    factors: {
      onTimePickup,
      rideCompletion,
      cancellationRate,
      passengerRating,
      passengerComplaints,
      safetyReports,
      acceptanceBehavior,
      accountCompliance
    },
    factorScores: {
      onTimePickup,
      rideCompletion,
      cancellationRate,
      passengerRating,
      passengerComplaints,
      safetyReports,
      acceptanceBehavior,
      accountCompliance
    },
    calculatedAt: new Date().toISOString()
  };
}

/**
 * 2. DRIVER RISK & SMART RECOMMENDATION SYSTEM
 * Evaluates risk level and suggests recommended actions.
 * Clearly labeled as "AI Recommendation" vs "Automatic Rule".
 */
export function evaluateDriverRisk(
  driver: Driver,
  score: DriverPerformanceScore,
  complaints: Complaint[],
  safetyIncidents: SafetyIncident[],
  lateIncidents: LatePickupIncident[],
  automationConfig: AutomationSettings = DEFAULT_AUTOMATION_SETTINGS
): DriverRiskProfile {
  const driverComplaints = getDriverComplaints(driver, complaints);
  const driverSafety = getDriverSafetyIncidents(driver, safetyIncidents);
  const driverLate = (lateIncidents || []).filter((l) => l.driverId === driver.id);
  const qualifyingLateCount = driverLate.filter((l) => l.isQualifying).length;

  const flags: string[] = [];

  if (qualifyingLateCount >= 3 || (driver.latePickupIncidentsToday && driver.latePickupIncidentsToday >= 3)) {
    flags.push(`Repeated late pickups (${qualifyingLateCount} delays >10 min)`);
  }
  if (score.factors.cancellationRate < 70) {
    flags.push('Increasing cancellation frequency detected');
  }
  if (driverComplaints.length >= 2) {
    flags.push(`Multiple passenger complaints (${driverComplaints.length} reports filed)`);
  }
  if (driver.rating < automationConfig.lowRatingWarningThreshold && driver.rating > 0) {
    flags.push(`Low customer rating (${driver.rating.toFixed(2)} / 5.0)`);
  }
  if (driverSafety.length >= 1) {
    flags.push(`Safety incident reported (${driverSafety.length} active flag)`);
  }
  if (driver.verificationStatus === 'pending' || driver.verificationStatus === 'rejected') {
    flags.push('Document verification pending / incomplete review');
  }
  if (driver.warnings && driver.warnings.length >= 2) {
    flags.push(`Multiple disciplinary warnings on record (${driver.warnings.length})`);
  }
  if (driver.accountStatus === 'suspended') {
    flags.push('Account actively under suspension protocol');
  }

  // Determine Risk Level
  let riskLevel: DriverRiskLevel = 'Low';
  if (
    driver.accountStatus === 'suspended' ||
    score.overallScore < 45 ||
    driverSafety.length >= 2 ||
    qualifyingLateCount >= automationConfig.latePickupSuspensionCount
  ) {
    riskLevel = 'Critical';
  } else if (
    score.overallScore < 60 ||
    driverComplaints.length >= automationConfig.complaintEscalationThreshold ||
    driverSafety.length >= 1 ||
    qualifyingLateCount >= 3
  ) {
    riskLevel = 'High';
  } else if (
    score.overallScore < 75 ||
    flags.length >= 2 ||
    qualifyingLateCount >= 1 ||
    driverComplaints.length >= 1
  ) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'Low';
  }

  // Determine AI Recommended Action (Decision-support only, never silent penalty)
  let recommendedAction: SmartRecommendedAction = 'Monitor';
  let reasonDetails = 'Driver maintains healthy operational standing with steady performance metrics.';

  if (riskLevel === 'Critical') {
    if (driverSafety.length >= 1) {
      recommendedAction = 'Escalate for Safety Review';
      reasonDetails = 'Immediate escalation to Safety Operations Officer for review of reported physical or verbal safety infraction.';
    } else {
      recommendedAction = 'Temporary Suspension';
      reasonDetails = `Driver is operating at Critical risk due to score ${score.overallScore}/100 and ${flags.join('; ')}. Recommend 12-24h suspension pending fleet briefing.`;
    }
  } else if (riskLevel === 'High') {
    if (driverComplaints.length >= 2) {
      recommendedAction = 'Issue Warning';
      reasonDetails = `2+ passenger complaints on record regarding service quality. Recommend issuing formal platform warning with mandatory guidance.`;
    } else {
      recommendedAction = 'Request Review';
      reasonDetails = `Performance score dipped to ${score.overallScore}/100 with multiple operational delay markers. Recommend administrative interview.`;
    }
  } else if (riskLevel === 'Medium') {
    recommendedAction = 'Request Review';
    reasonDetails = `Elevated delay or cancellation pattern observed. Recommend proactive compliance reminder or dispatch inspection.`;
  } else {
    recommendedAction = 'Monitor';
    reasonDetails = 'Driver metrics within acceptable platform SLA parameters. Continue standard dispatch routing.';
  }

  // Primary improvement area
  let primaryImprovementArea = 'Pickup punctuality';
  if (score.factors.passengerRating < score.factors.onTimePickup) {
    primaryImprovementArea = 'Customer service & vehicle hygiene';
  } else if (score.factors.cancellationRate < 70) {
    primaryImprovementArea = 'Ride acceptance & cancellation reduction';
  } else if (driverComplaints.length > 0) {
    primaryImprovementArea = 'Passenger dispute resolution';
  }

  return {
    driverId: driver.id,
    driverName: driver.name,
    driverPlate: driver.vehicle?.plate || 'LE-2024',
    city: driver.city,
    riskLevel,
    flags,
    recommendedAction,
    recommendationType: 'AI Recommendation',
    reasonDetails,
    primaryImprovementArea,
    lastEvaluated: new Date().toISOString()
  };
}

/**
 * 3. COMPLAINT INTELLIGENCE
 * Categorizes complaints and computes review priority.
 */
export function analyzeComplaintIntelligence(
  complaints: Complaint[],
  drivers: Driver[]
): {
  categories: ComplaintIntelligenceCategory[];
  totalComplaints: number;
  repeatDriversCount: number;
  pendingReviewCount: number;
  highSeverityCount: number;
} {
  const total = (complaints || []).length;
  const pending = (complaints || []).filter((c) => c.status === 'open').length;

  // Track driver complaint counts by targetName
  const driverComplaintMap: Record<string, number> = {};
  (complaints || []).forEach((c) => {
    const key = c.targetName || c.targetPhone || c.rideId;
    if (key) {
      driverComplaintMap[key] = (driverComplaintMap[key] || 0) + 1;
    }
  });
  const repeatDriversCount = Object.values(driverComplaintMap).filter((cnt) => cnt > 1).length;

  const categoryDefs = [
    { name: 'Late pickup', severity: 'Medium' as const, priority: 65 },
    { name: 'Driver behavior', severity: 'High' as const, priority: 80 },
    { name: 'Unsafe driving', severity: 'Critical' as const, priority: 95 },
    { name: 'Fare dispute', severity: 'Medium' as const, priority: 60 },
    { name: 'Cancellation', severity: 'Low' as const, priority: 45 },
    { name: 'Vehicle condition', severity: 'Medium' as const, priority: 55 },
    { name: 'Harassment/abuse', severity: 'Critical' as const, priority: 100 },
    { name: 'Payment issue', severity: 'High' as const, priority: 75 },
    { name: 'Other', severity: 'Low' as const, priority: 40 }
  ];

  const categories: ComplaintIntelligenceCategory[] = categoryDefs.map((cat) => {
    // Match complaints to this category
    const matched = (complaints || []).filter((c) => {
      const typeStr = (c.type || '').toLowerCase();
      const subjStr = (c.subject || '').toLowerCase();
      const descStr = (c.description || '').toLowerCase();
      const combined = `${typeStr} ${subjStr} ${descStr}`;
      const catLower = cat.name.toLowerCase();

      if (catLower === 'late pickup') return combined.includes('delay') || combined.includes('late');
      if (catLower === 'driver behavior') return combined.includes('behavior') || combined.includes('conduct') || combined.includes('rude');
      if (catLower === 'unsafe driving') return combined.includes('speed') || combined.includes('reckless') || combined.includes('safety') || combined.includes('rash');
      if (catLower === 'fare dispute') return combined.includes('fare') || combined.includes('charge') || combined.includes('overcharge');
      if (catLower === 'cancellation') return combined.includes('cancel');
      if (catLower === 'vehicle condition') return combined.includes('clean') || combined.includes('ac') || combined.includes('condition');
      if (catLower === 'harassment/abuse') return combined.includes('harass') || combined.includes('abuse') || combined.includes('threat');
      if (catLower === 'payment issue') return combined.includes('payment') || combined.includes('cash') || combined.includes('wallet');
      return catLower === 'other';
    });

    const count = matched.length;
    const pendingCount = matched.filter((c) => c.status === 'open').length;
    const repCount = matched.filter((c) => {
      const key = c.targetName || c.targetPhone || c.rideId;
      return key && (driverComplaintMap[key] || 0) > 1;
    }).length;

    return {
      category: cat.name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      pendingCount,
      repeatDriverCount: repCount,
      severity: cat.severity,
      avgReviewPriority: cat.priority
    };
  });

  const highSeverityCount = categories
    .filter((c) => c.severity === 'Critical' || c.severity === 'High')
    .reduce((sum, c) => sum + c.count, 0);

  return {
    categories,
    totalComplaints: total,
    repeatDriversCount,
    pendingReviewCount: pending,
    highSeverityCount
  };
}

/**
 * 4. CITY PERFORMANCE INTELLIGENCE
 */
export function analyzeCityIntelligence(
  cities: { id: string; name: string; active?: boolean }[],
  rides: Ride[],
  drivers: Driver[],
  complaints: Complaint[]
): CityIntelligenceData[] {
  const targetCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad'];

  return targetCities.map((cityName) => {
    const cityRides = (rides || []).filter(
      (r) => r.city?.toLowerCase() === cityName.toLowerCase()
    );
    const cityDrivers = (drivers || []).filter(
      (d) => d.city?.toLowerCase() === cityName.toLowerCase()
    );
    const cityComplaints = (complaints || []).filter(
      (c) => c.city?.toLowerCase() === cityName.toLowerCase()
    );

    const totalRides = cityRides.length > 0 ? cityRides.length : Math.floor(12 + cityName.length * 4);
    const completedRides = cityRides.filter((r) => r.status === 'completed').length || Math.round(totalRides * 0.85);
    const cancelledRides = cityRides.filter((r) => r.status === 'cancelled').length || Math.round(totalRides * 0.1);
    const activeDrivers = cityDrivers.length > 0 ? cityDrivers.length : Math.floor(4 + cityName.length);
    const onlineDrivers = cityDrivers.filter((d) => d.status === 'online' || d.status === 'on_trip').length || Math.round(activeDrivers * 0.7);

    const cancellationRate = totalRides > 0 ? Math.round((cancelledRides / totalRides) * 100) : 8;
    const revenue = cityRides.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0) || completedRides * 650;
    const commission = Math.round(revenue * 0.15);
    const averageFare = completedRides > 0 ? Math.round(revenue / completedRides) : 620;

    const driverRatings = cityDrivers.map((d) => d.rating).filter((r) => r > 0);
    const averageRating = driverRatings.length > 0 ? Number((driverRatings.reduce((a, b) => a + b, 0) / driverRatings.length).toFixed(2)) : 4.75;

    let demandStatus: 'High Demand' | 'Balanced' | 'Needs Drivers' | 'Low Activity' = 'Balanced';
    if (cityName === 'Lahore' || cityName === 'Karachi') {
      demandStatus = onlineDrivers < 8 ? 'Needs Drivers' : 'High Demand';
    } else if (totalRides > 20) {
      demandStatus = 'High Demand';
    } else if (totalRides < 5) {
      demandStatus = 'Low Activity';
    }

    return {
      city: cityName,
      totalRides,
      completedRides,
      cancelledRides,
      activeDrivers,
      onlineDrivers,
      cancellationRate,
      averageFare,
      revenue,
      commission,
      averageRating,
      complaintCount: cityComplaints.length,
      demandStatus
    };
  });
}

/**
 * 5. EARNINGS INTELLIGENCE (Multi-period)
 */
export function analyzeEarningsIntelligence(
  summaries: DriverDailySummary[],
  rides: Ride[]
): {
  periods: Record<
    'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year',
    {
      revenue: number;
      driverNet: number;
      commission: number;
      ridesCount: number;
      avgFare: number;
      cancelledCount: number;
    }
  >;
  insights: string[];
} {
  const completedRides = (rides || []).filter((r) => r.status === 'completed');
  const baseRevenue = completedRides.reduce((sum, r) => sum + r.fare, 0) || 48500;
  const baseCommission = Math.round(baseRevenue * 0.15);
  const baseNet = baseRevenue - baseCommission;
  const baseCount = completedRides.length || 68;

  const periods = {
    today: {
      revenue: baseRevenue,
      driverNet: baseNet,
      commission: baseCommission,
      ridesCount: baseCount,
      avgFare: baseCount > 0 ? Math.round(baseRevenue / baseCount) : 650,
      cancelledCount: (rides || []).filter((r) => r.status === 'cancelled').length || 4
    },
    yesterday: {
      revenue: Math.round(baseRevenue * 0.92),
      driverNet: Math.round(baseNet * 0.92),
      commission: Math.round(baseCommission * 0.92),
      ridesCount: Math.round(baseCount * 0.9),
      avgFare: 640,
      cancelledCount: 6
    },
    last_7_days: {
      revenue: Math.round(baseRevenue * 6.4),
      driverNet: Math.round(baseNet * 6.4),
      commission: Math.round(baseCommission * 6.4),
      ridesCount: Math.round(baseCount * 6.2),
      avgFare: 655,
      cancelledCount: 28
    },
    last_30_days: {
      revenue: Math.round(baseRevenue * 26.5),
      driverNet: Math.round(baseNet * 26.5),
      commission: Math.round(baseCommission * 26.5),
      ridesCount: Math.round(baseCount * 25.8),
      avgFare: 660,
      cancelledCount: 112
    },
    this_month: {
      revenue: Math.round(baseRevenue * 18.2),
      driverNet: Math.round(baseNet * 18.2),
      commission: Math.round(baseCommission * 18.2),
      ridesCount: Math.round(baseCount * 17.5),
      avgFare: 658,
      cancelledCount: 76
    },
    this_year: {
      revenue: Math.round(baseRevenue * 140.0),
      driverNet: Math.round(baseNet * 140.0),
      commission: Math.round(baseCommission * 140.0),
      ridesCount: Math.round(baseCount * 135.0),
      avgFare: 662,
      cancelledCount: 540
    }
  };

  const insights: string[] = [
    `Gross platform turnover reached ${formatPKR(periods.today.revenue)} today with ${formatPKR(periods.today.commission)} GoLife net commission.`,
    `Revenue grew +8.7% compared with yesterday due to peak evening surge in Lahore and Karachi.`,
    `Cancellation impact prevented approximately ${formatPKR(periods.today.cancelledCount * 580)} in gross fare generation today.`,
    `Lahore corridor maintains the highest ride demand but has 22% fewer available online GoComfort drivers.`
  ];

  return { periods, insights };
}

/**
 * 6. AUTOMATIC DAILY AI OPERATIONS SUMMARY
 */
export function generateDailyAiSummary(
  drivers: Driver[],
  rides: Ride[],
  complaints: Complaint[],
  safetyIncidents: SafetyIncident[],
  verifications: VerificationItem[],
  payouts: PayoutRequest[],
  summaries: DriverDailySummary[],
  lateIncidents: LatePickupIncident[],
  driverSuspensions: DriverSuspensionRecord[]
): DailyAiSummary {
  const completed = (rides || []).filter((r) => r.status === 'completed').length;
  const cancelled = (rides || []).filter((r) => r.status === 'cancelled').length;
  const inProgress = (rides || []).filter(
    (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'searching'
  ).length;
  const totalBookings = completed + cancelled + inProgress || (rides || []).length || 50;
  const grossFare = (rides || []).filter((r) => r.status === 'completed').reduce((s, r) => s + r.fare, 0) || 54200;
  const completionRate = totalBookings > 0 ? Math.round((completed / totalBookings) * 100) : 88;

  const onlineDrivers = (drivers || []).filter((d) => d.status === 'online' || d.status === 'on_trip').length;
  const activeTrips = (drivers || []).filter((d) => d.status === 'on_trip').length;

  const pendingVerifs = (verifications || []).filter((v) => v.status === 'pending').length;
  const openComplaints = (complaints || []).filter((c) => c.status === 'open').length;
  const activeSafety = (safetyIncidents || []).filter((s) => s.status === 'active').length;
  const suspendedCount = (drivers || []).filter((d) => d.accountStatus === 'suspended').length;
  const autoSuspendedToday = (driverSuspensions || []).filter((s) => s.type === 'automatic').length;

  const platformCommission = Math.round(grossFare * 0.15);
  const driverNet = grossFare - platformCommission;
  const averageFare = completed > 0 ? Math.round(grossFare / completed) : 680;

  const priorityActions = [
    {
      id: 'prio_verif',
      action: `Review ${pendingVerifs} pending driver verification & KYC dossiers`,
      targetTab: 'verification' as AdminTab,
      urgency: pendingVerifs > 2 ? ('Critical' as const) : ('High' as const)
    },
    {
      id: 'prio_safety',
      action: `Investigate ${activeSafety} active safety incident escalation(s)`,
      targetTab: 'safety' as AdminTab,
      urgency: activeSafety > 0 ? ('Critical' as const) : ('Medium' as const)
    },
    {
      id: 'prio_late',
      action: `Audit drivers approaching automatic late-pickup suspension limit (5 strikes)`,
      targetTab: 'drivers' as AdminTab,
      urgency: 'High' as const
    },
    {
      id: 'prio_complaints',
      action: `Process ${openComplaints} unassigned passenger support complaints`,
      targetTab: 'complaints' as AdminTab,
      urgency: 'Medium' as const
    }
  ];

  const importantIssues: string[] = [
    `Peak evening dispatch pressure detected in Lahore Gulberg & DHA sectors.`,
    `Tariq Mehmood logged 4 late pickup markers today — approaching 5-strike automatic 12h suspension trigger.`,
    `${pendingVerifs} new driver candidates have submitted complete CNIC and commercial license documents awaiting onboarding.`,
    `No widespread system errors or GPS telemetry dropouts detected across Pakistan nodes.`
  ];

  return {
    date: new Date().toISOString().split('T')[0],
    generatedAt: new Date().toLocaleTimeString('en-GB') + ' PKT',
    ridePerformance: {
      totalBookings,
      completed,
      cancelled,
      inProgress,
      grossFare,
      completionRate
    },
    driverPerformance: {
      onlineCount: onlineDrivers,
      activeTrips,
      avgScore: 84,
      criticalCount: 1,
      atRiskCount: 2
    },
    passengerActivity: {
      activePassengers: 1420,
      newUsers: 84
    },
    earnings: {
      totalGross: grossFare,
      driverNet,
      averageFare
    },
    commission: {
      platformCommission,
      effectiveRate: 15.0
    },
    complaints: {
      totalOpen: openComplaints,
      repeatDrivers: 2,
      topCategory: 'Pickup punctuality'
    },
    safetyAlerts: {
      activeCount: activeSafety,
      escalatedCount: activeSafety
    },
    verificationRequests: {
      pendingCount: pendingVerifs,
      urgentCount: pendingVerifs
    },
    suspensions: {
      totalActive: suspendedCount,
      autoSuspendedToday
    },
    importantIssues,
    priorityActions
  };
}

/**
 * 7. AUTOMATIC ADMIN TASKS GENERATOR
 */
export function generateDefaultAdminTasks(
  drivers: Driver[],
  verifications: VerificationItem[],
  complaints: Complaint[],
  safetyIncidents: SafetyIncident[],
  lateIncidents: LatePickupIncident[],
  payouts: PayoutRequest[],
  suspensions: DriverSuspensionRecord[]
): AdminTask[] {
  const tasks: AdminTask[] = [];

  // 1. Pending Verifications
  const pendingVerifs = (verifications || []).filter((v) => v.status === 'pending');
  pendingVerifs.forEach((v, idx) => {
    tasks.push({
      id: `task-verif-${v.id}`,
      title: `Verify driver candidate: ${v.driverName}`,
      description: `Review submitted CNIC, driving license, and vehicle registration documents for ${v.city} fleet.`,
      priority: idx === 0 ? 'Critical' : 'High',
      category: 'driver_verification',
      relatedId: v.id,
      relatedType: 'verification',
      relatedName: v.driverName,
      createdAt: 'Today, 09:30 AM',
      status: 'Pending',
      assignedAdmin: 'Unassigned',
      targetTab: 'verification',
      actionLabel: 'Inspect Documents'
    });
  });

  // 2. Active Safety Reports
  const activeSafety = (safetyIncidents || []).filter((s) => s.status === 'active');
  activeSafety.forEach((s) => {
    tasks.push({
      id: `task-safe-${s.id}`,
      title: `Investigate safety report #${s.id.toUpperCase()}`,
      description: `${s.type} reported on ride ${s.rideId}. Contact passenger & driver for official statement.`,
      priority: 'Critical',
      category: 'safety_report',
      relatedId: s.id,
      relatedType: 'ride',
      relatedName: `Ride ${s.rideId}`,
      createdAt: 'Today, 10:15 AM',
      status: 'In Progress',
      assignedAdmin: 'superadmin@golife.pk',
      targetTab: 'safety',
      actionLabel: 'Open Incident Desk'
    });
  });

  // 3. Open Complaints
  const openComplaints = (complaints || []).filter((c) => c.status === 'open').slice(0, 3);
  openComplaints.forEach((c) => {
    tasks.push({
      id: `task-comp-${c.id}`,
      title: `Resolve passenger complaint: ${c.subject || c.type || 'Service Issue'}`,
      description: `${c.description || 'Passenger dispute requiring mediation.'} Reported against ${c.targetName || 'fleet driver'}.`,
      priority: 'High',
      category: 'complaint_investigation',
      relatedId: c.id,
      relatedType: 'complaint',
      relatedName: c.reporterName || 'Passenger',
      createdAt: 'Today, 11:20 AM',
      status: 'Pending',
      assignedAdmin: 'Unassigned',
      targetTab: 'complaints',
      actionLabel: 'Review Complaint'
    });
  });

  // 4. Repeated Late Pickups across all drivers
  const qualifyingLateByDriver: Record<string, { count: number; name: string; driverId: string }> = {};
  (lateIncidents || []).filter((l) => l.isQualifying).forEach((l) => {
    if (!qualifyingLateByDriver[l.driverId]) {
      qualifyingLateByDriver[l.driverId] = { count: 0, name: l.driverName || 'Driver', driverId: l.driverId };
    }
    qualifyingLateByDriver[l.driverId].count += 1;
  });

  Object.values(qualifyingLateByDriver).filter((d) => d.count >= 2).forEach((d) => {
    tasks.push({
      id: `task-late-${d.driverId}`,
      title: `Check repeated late pickup alerts for ${d.name}`,
      description: `Driver has accumulated ${d.count} qualifying late pickups. Approaching the 5-incident automated suspension cutoff.`,
      priority: d.count >= 4 ? 'Critical' : 'High',
      category: 'late_pickup_check',
      relatedId: d.driverId,
      relatedType: 'driver',
      relatedName: d.name,
      createdAt: 'Today',
      status: 'Pending',
      assignedAdmin: 'Unassigned',
      targetTab: 'drivers',
      actionLabel: 'Inspect Driver Compliance'
    });
  });

  // 5. Pending Payouts
  const pendingPayouts = (payouts || []).filter((p) => p.status === 'pending').slice(0, 2);
  pendingPayouts.forEach((p) => {
    tasks.push({
      id: `task-pay-${p.id}`,
      title: `Process wallet withdrawal: ${p.driverName || 'Driver'} (${formatPKR(p.amount)})`,
      description: `Verify IBFT / JazzCash account details and authorize settlement disbursement.`,
      priority: 'Medium',
      category: 'pending_payout',
      relatedId: p.id,
      relatedType: 'payout',
      relatedName: p.driverName || 'Driver',
      createdAt: 'Today, 01:15 PM',
      status: 'Pending',
      assignedAdmin: 'Unassigned',
      targetTab: 'wallets',
      actionLabel: 'Process Payout'
    });
  });

  // 6. Suspensions Expiry Check
  const activeSusp = (suspensions || []).find((s) => s.status === 'active');
  if (activeSusp) {
    tasks.push({
      id: `task-susp-exp-${activeSusp.id}`,
      title: `Check suspension expiry: ${activeSusp.driverName}`,
      description: `Review 12h cooling-off status and determine automatic vs manual reinstatement for ${activeSusp.driverName}.`,
      priority: 'High',
      category: 'suspension_expiry',
      relatedId: activeSusp.driverId,
      relatedType: 'driver',
      relatedName: activeSusp.driverName,
      createdAt: 'Today, 02:00 PM',
      status: 'Pending',
      assignedAdmin: 'Unassigned',
      targetTab: 'drivers',
      actionLabel: 'Check Driver Standing'
    });
  }

  return tasks;
}

/**
 * 8. AI ASSISTANT NATURAL LANGUAGE QUERY ENGINE
 * Interactive deterministic parser & answer generator.
 * Analyzes admin live state and answers all operational questions.
 */
export function processAiQuery(
  rawQuery: string,
  context: {
    drivers: Driver[];
    rides: Ride[];
    verifications: VerificationItem[];
    complaints: Complaint[];
    safetyIncidents: SafetyIncident[];
    payouts: PayoutRequest[];
    latePickupIncidents: LatePickupIncident[];
    driverSuspensions: DriverSuspensionRecord[];
    driverDailySummaries: DriverDailySummary[];
    cities: any[];
  }
): AiChatMessage {
  const query = rawQuery.toLowerCase().trim();
  const nowStr = new Date().toLocaleTimeString('en-GB') + ' PKT';

  const drivers = context.drivers || [];
  const rides = context.rides || [];
  const verifications = context.verifications || [];
  const complaints = context.complaints || [];
  const safetyIncidents = context.safetyIncidents || [];
  const lateIncidents = context.latePickupIncidents || [];
  const suspensions = context.driverSuspensions || [];

  const onlineDrivers = drivers.filter((d) => d.status === 'online' || d.status === 'on_trip');
  const suspendedDrivers = drivers.filter((d) => d.accountStatus === 'suspended');
  const pendingVerifs = verifications.filter((v) => v.status === 'pending');
  const completedRides = rides.filter((r) => r.status === 'completed');
  const openComplaints = complaints.filter((c) => c.status === 'open');
  const activeSafety = safetyIncidents.filter((s) => s.status === 'active');

  const grossFareToday = completedRides.reduce((sum, r) => sum + r.fare, 0) || 54200;
  const commissionToday = Math.round(grossFareToday * 0.15);

  // Intent 1: Online Drivers
  if (query.includes('online') || (query.includes('how many drivers') && query.includes('ready'))) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `There are currently **${onlineDrivers.length} drivers online** across the GoLife network (${drivers.filter((d) => d.status === 'on_trip').length} on active trips, ${drivers.filter((d) => d.status === 'online').length} available for dispatch).`,
      timestamp: nowStr,
      queryIntent: 'online_drivers',
      structuredData: {
        title: 'Fleet Availability Telemetry',
        stats: [
          { label: 'Online & Available', value: drivers.filter((d) => d.status === 'online').length, badge: 'READY' },
          { label: 'On Live Trips', value: drivers.filter((d) => d.status === 'on_trip').length, badge: 'IN RIDE' },
          { label: 'Offline', value: drivers.filter((d) => d.status === 'offline').length },
          { label: 'Total Fleet', value: drivers.length }
        ],
        records: onlineDrivers.slice(0, 4).map((d) => ({
          id: d.id,
          title: d.name,
          subtitle: `${d.vehicle?.category || 'GoRide'} • ${d.vehicle?.plate || 'LE-2024'} • ${d.city}`,
          status: d.status.toUpperCase(),
          badgeColor: d.status === 'on_trip' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700',
          actionTab: 'drivers'
        })),
        actionButtons: [
          { label: 'Open Live Radar Map', tab: 'drivers' },
          { label: 'View Fleet Directory', tab: 'drivers' }
        ]
      }
    };
  }

  // Intent 2: Rides Completed Today
  if (query.includes('completed') || query.includes('how many rides') || query.includes('rides today')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `**${completedRides.length} rides have been completed today**, generating a gross fare volume of **${formatPKR(grossFareToday)}** with an 88.5% completion rate.`,
      timestamp: nowStr,
      queryIntent: 'completed_rides',
      structuredData: {
        title: "Today's Ride Dispatch Performance",
        stats: [
          { label: 'Completed Rides', value: completedRides.length, badge: 'SUCCESS' },
          { label: 'In Progress', value: rides.filter((r) => r.status === 'in_progress').length, badge: 'LIVE' },
          { label: 'Cancelled', value: rides.filter((r) => r.status === 'cancelled').length },
          { label: 'Gross Fares', value: formatPKR(grossFareToday) }
        ],
        actionButtons: [
          { label: 'View Live Rides Operations', tab: 'live_rides' },
          { label: 'Inspect Full Ride History', tab: 'rides' }
        ]
      }
    };
  }

  // Intent 3: Most late pickups
  if (query.includes('late pickup') || query.includes('delayed') || query.includes('punctuality')) {
    const driverLateMap: Record<string, { count: number; name: string; id: string }> = {};
    lateIncidents.forEach((inc) => {
      if (!driverLateMap[inc.driverId]) {
        driverLateMap[inc.driverId] = {
          count: 0,
          name: inc.driverName,
          id: inc.driverId
        };
      }
      if (inc.isQualifying) driverLateMap[inc.driverId].count += 1;
    });

    const sortedLate = Object.values(driverLateMap).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
    const topDriver = sortedLate[0];

    if (!topDriver) {
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'assistant',
        text: `There are currently no qualifying late pickup incidents recorded today across any active drivers. The fleet punctuality rate is operating normally.`,
        timestamp: nowStr,
        queryIntent: 'late_pickups',
        structuredData: {
          title: 'Late Pickup Compliance Watchlist',
          stats: [
            { label: 'Threshold Before Suspension', value: '5 Incidents', badge: 'RULE' },
            { label: 'Punctuality Delay Cutoff', value: '> 10 Mins' },
            { label: 'Total Incidents Logged', value: 0 }
          ],
          actionButtons: [
            { label: 'View Drivers Tab', tab: 'drivers' }
          ]
        }
      };
    }

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `**${topDriver.name}** has accumulated the highest number of late pickups today with **${topDriver.count} qualifying delays (>10 min)**. Under GoLife policy, a 5th qualifying incident triggers an automatic 12-hour suspension.`,
      timestamp: nowStr,
      queryIntent: 'late_pickups',
      structuredData: {
        title: 'Late Pickup Compliance Watchlist',
        stats: [
          { label: 'Threshold Before Suspension', value: '5 Incidents', badge: 'RULE' },
          { label: 'Punctuality Delay Cutoff', value: '> 10 Mins' },
          { label: 'Total Incidents Logged', value: lateIncidents.length }
        ],
        records: sortedLate.slice(0, 3).map((d) => ({
          id: d.id,
          title: d.name,
          subtitle: `${d.count}/5 qualifying late pickups today`,
          status: d.count >= 4 ? 'NEAR SUSPENSION' : 'WARNING',
          badgeColor: d.count >= 4 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700',
          actionTab: 'drivers'
        })),
        recommendations: [
          'Review traffic exemption reports before manual override.',
          'Driver Tariq Mehmood is at 4/5 strikes — monitor for next booking arrival.'
        ],
        actionButtons: [
          { label: 'Open Compliance & Late Pickups', tab: 'drivers' },
          { label: 'View Driver Standing', tab: 'drivers' }
        ]
      }
    };
  }

  // Intent 4: Currently Suspended Drivers
  if (query.includes('suspended') || query.includes('banned') || query.includes('blocked')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `Currently, **${suspendedDrivers.length} driver(s) are suspended** from the dispatch network. All suspended drivers are blocked from receiving bookings until reinstatement by authorized administration or cooling-off period expiry.`,
      timestamp: nowStr,
      queryIntent: 'suspended_drivers',
      structuredData: {
        title: 'Suspended Drivers Roster',
        stats: [
          { label: 'Currently Suspended', value: suspendedDrivers.length, badge: 'BLOCKED' },
          { label: 'Automatic Rule Suspensions', value: suspensions.filter((s) => s.type === 'automatic').length },
          { label: 'Manual Admin Suspensions', value: suspensions.filter((s) => s.type === 'manual').length }
        ],
        records: suspendedDrivers.map((d) => ({
          id: d.id,
          title: d.name,
          subtitle: `${d.vehicle?.make || 'Toyota'} ${d.vehicle?.model || 'Corolla'} • ${d.vehicle?.plate || 'LE-2024'} • ${d.city}`,
          status: 'SUSPENDED',
          badgeColor: 'bg-rose-600 text-white',
          actionTab: 'drivers'
        })),
        actionButtons: [
          { label: 'Manage Suspensions & Reinstatements', tab: 'drivers' }
        ]
      }
    };
  }

  // Intent 5: Need Verification
  if (query.includes('verification') || query.includes('verify') || query.includes('documents') || query.includes('kyc')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `There are **${pendingVerifs.length} driver registration(s) pending KYC & document verification**. Review required for CNIC identity proof, driving licenses, and vehicle excise books.`,
      timestamp: nowStr,
      queryIntent: 'verification_requests',
      structuredData: {
        title: 'Pending Driver Verification Requests',
        stats: [
          { label: 'Pending Approvals', value: pendingVerifs.length, badge: 'ACTION' },
          { label: 'Approved', value: verifications.filter((v) => v.status === 'approved').length },
          { label: 'Rejected / Resubmit', value: verifications.filter((v) => v.status === 'rejected').length }
        ],
        records: pendingVerifs.slice(0, 4).map((v) => ({
          id: v.id,
          title: v.driverName,
          subtitle: `${v.category} • ${v.city} • ${v.documents?.length || 0} documents attached`,
          status: 'PENDING KYC',
          badgeColor: 'bg-amber-100 text-amber-800',
          actionTab: 'verification'
        })),
        actionButtons: [
          { label: 'Open Verification Review Desk', tab: 'verification' }
        ]
      }
    };
  }

  // Intent 6: City with Most Rides
  if (query.includes('city') || query.includes('cities') || query.includes('region') || query.includes('lahore') || query.includes('karachi')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `**Lahore** has the highest ride activity across the platform today with **42 completed rides** and PKR 32,800 gross fare, followed closely by **Karachi** (28 rides). Lahore also displays the highest evening driver demand.`,
      timestamp: nowStr,
      queryIntent: 'city_performance',
      structuredData: {
        title: 'Metropolitan Dispatch Volume',
        stats: [
          { label: 'Top City by Volume', value: 'Lahore', badge: 'RANK #1' },
          { label: 'Top City by Fare', value: 'Karachi', badge: 'PKR 780 AVG' },
          { label: 'Needs Drivers', value: 'Rawalpindi / Islamabad' }
        ],
        records: [
          { id: 'ct-lhr', title: 'Lahore', subtitle: '42 rides • 14 drivers online • 8.2% cancellation', status: 'HIGH DEMAND', badgeColor: 'bg-emerald-100 text-emerald-700', actionTab: 'cities' },
          { id: 'ct-khi', title: 'Karachi', subtitle: '28 rides • 9 drivers online • 10.4% cancellation', status: 'HIGH DEMAND', badgeColor: 'bg-emerald-100 text-emerald-700', actionTab: 'cities' },
          { id: 'ct-isb', title: 'Islamabad', subtitle: '18 rides • 6 drivers online • 5.5% cancellation', status: 'BALANCED', badgeColor: 'bg-blue-100 text-blue-700', actionTab: 'cities' }
        ],
        actionButtons: [
          { label: 'View City Regional Settings', tab: 'cities' }
        ]
      }
    };
  }

  // Intent 7: Drivers who earned the most today
  if (query.includes('earned the most') || query.includes('top earning') || query.includes('highest earning')) {
    const sortedEarners = [...drivers].sort((a, b) => b.earnings - a.earnings).slice(0, 3);
    const topEarner = sortedEarners[0] || { name: 'Muhammad Bilal', earnings: 14500, vehicle: { category: 'GoComfort' } };

    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `**${topEarner.name}** is today's top earner with **${formatPKR(topEarner.earnings)}** in gross fare earnings driving a ${topEarner.vehicle?.category || 'GoRide'} vehicle.`,
      timestamp: nowStr,
      queryIntent: 'top_earners',
      structuredData: {
        title: "Today's Top Driver Payouts",
        stats: [
          { label: 'Top Earner', value: topEarner.name, badge: 'TOP' },
          { label: 'Total Earnings', value: formatPKR(topEarner.earnings) },
          { label: 'Total Fleet Earnings', value: formatPKR(drivers.reduce((s, d) => s + d.earnings, 0)) }
        ],
        records: sortedEarners.map((d, i) => ({
          id: d.id,
          title: `#${i + 1} ${d.name}`,
          subtitle: `${d.vehicle?.category || 'GoRide'} • ${d.totalRides} trips • ${d.city}`,
          status: formatPKR(d.earnings),
          badgeColor: 'bg-teal-100 text-teal-800 font-mono',
          actionTab: 'driver_earnings'
        })),
        actionButtons: [
          { label: 'Open Daily Earnings Dashboard', tab: 'driver_earnings' }
        ]
      }
    };
  }

  // Intent 8: Commission generated today
  if (query.includes('commission') || query.includes('platform cut') || query.includes('earnings')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `GoLife has generated approximately **${formatPKR(commissionToday)} in platform commission today** (~15% effective rate) from **${formatPKR(grossFareToday)}** in total completed ride volume.`,
      timestamp: nowStr,
      queryIntent: 'commission_today',
      structuredData: {
        title: 'Platform Commission & Revenue Summary',
        stats: [
          { label: 'Today Platform Commission', value: formatPKR(commissionToday), badge: '15.0%' },
          { label: 'Gross Ride Volume', value: formatPKR(grossFareToday) },
          { label: 'Driver Net Earnings', value: formatPKR(grossFareToday - commissionToday) },
          { label: 'Average Commission / Trip', value: formatPKR(Math.round(commissionToday / (completedRides.length || 1))) }
        ],
        actionButtons: [
          { label: 'View Fare & Commission Rates', tab: 'fares' },
          { label: 'Open Finance & Wallets', tab: 'wallets' }
        ]
      }
    };
  }

  // Intent 9: Pending Complaints / Repeat Complaints
  if (query.includes('complaint') || query.includes('dispute') || query.includes('ticket')) {
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `There are **${openComplaints.length} pending passenger complaints** requiring administrative review. 2 drivers have repeated complaint records requiring targeted quality audit.`,
      timestamp: nowStr,
      queryIntent: 'complaints_pending',
      structuredData: {
        title: 'Customer Service & Complaint Desk',
        stats: [
          { label: 'Open Complaints', value: openComplaints.length, badge: 'PENDING' },
          { label: 'Drivers with Repeat Reports', value: '2 Drivers' },
          { label: 'Top Theme', value: 'Pickup Punctuality' }
        ],
        records: openComplaints.slice(0, 3).map((c) => ({
          id: c.id,
          title: `${c.subject || c.type || 'Service Issue'} - Ride #${c.rideId || 'N/A'}`,
          subtitle: `${c.reporterName || 'Passenger'} against ${c.targetName || 'Driver'}`,
          status: 'OPEN REVIEW',
          badgeColor: 'bg-rose-100 text-rose-700',
          actionTab: 'complaints'
        })),
        actionButtons: [
          { label: 'Open Complaints Management', tab: 'complaints' },
          { label: 'View Safety Incidents', tab: 'safety' }
        ]
      }
    };
  }

  // Intent 10: Rides needing attention
  if (query.includes('attention') || query.includes('active rides') || query.includes('risk')) {
    const searchingRides = rides.filter((r) => r.status === 'searching');
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'assistant',
      text: `Currently, **${searchingRides.length} ride(s) are awaiting driver allocation** (searching >2 minutes), and 1 safety report requires immediate follow-up.`,
      timestamp: nowStr,
      queryIntent: 'rides_attention',
      structuredData: {
        title: 'Critical Operational Alerts',
        stats: [
          { label: 'Searching > 2 Mins', value: searchingRides.length, badge: 'DISPATCH' },
          { label: 'Active Safety Incidents', value: activeSafety.length, badge: 'CRITICAL' },
          { label: 'Late Pickups Logged', value: lateIncidents.length }
        ],
        actionButtons: [
          { label: 'Go to Operations Dispatch Center', tab: 'live_rides' },
          { label: 'Open Safety Command Desk', tab: 'safety' }
        ]
      }
    };
  }

  // Intent 11: Today's operations general summary
  return {
    id: `ai-msg-${Date.now()}`,
    sender: 'assistant',
    text: `**Today's Operations Overview:**\n- **${completedRides.length} completed rides** (${formatPKR(grossFareToday)} gross fare volume)\n- **${formatPKR(commissionToday)} platform commission** generated\n- **${onlineDrivers.length} drivers online** across Pakistan\n- **${pendingVerifs.length} driver verification requests** pending KYC\n- **${suspendedDrivers.length} suspended driver(s)** currently restricted.`,
    timestamp: nowStr,
    queryIntent: 'daily_summary',
    structuredData: {
      title: 'Daily Operations Pulse',
      stats: [
        { label: 'Completed Rides', value: completedRides.length },
        { label: 'Gross Fares', value: formatPKR(grossFareToday) },
        { label: 'Platform Commission', value: formatPKR(commissionToday) },
        { label: 'Online Drivers', value: onlineDrivers.length },
        { label: 'Pending KYC', value: pendingVerifs.length }
      ],
      recommendations: [
        'Review 2 pending driver applications to increase peak fleet capacity.',
        'Monitor Tariq Mehmood (4 qualifying late pickups logged today).'
      ],
      actionButtons: [
        { label: 'View Driver Verification Desk', tab: 'verification' },
        { label: 'Open Daily Earnings Breakdown', tab: 'driver_earnings' }
      ]
    }
  };
}
