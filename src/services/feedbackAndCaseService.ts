import { RideFeedback, Complaint, AuditLog } from '../types';

export const INITIAL_FEEDBACKS: RideFeedback[] = [
  {
    id: 'fb-101',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    passengerId: 'p-101',
    passengerName: 'Zainab Fatima',
    passengerRating: 5,
    driverRating: 5,
    passengerFeedback: 'Very polite driver, car was spotless and AC was freezing. Arrived right on time.',
    driverFeedback: 'Respectful and courteous passenger. Ready at gate.',
    category: 'Vehicle',
    date: '2026-09-12 18:30 PKT',
    tags: ['Clean Car', 'Chilled AC', 'Punctual'],
    severity: 'normal'
  },
  {
    id: 'fb-102',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    driverId: 'd-202',
    driverName: 'Khurram Shehzad',
    passengerId: 'p-102',
    passengerName: 'Hamza Shabbir',
    passengerRating: 2,
    driverRating: 4,
    passengerFeedback: 'Driver took wrong route on Shahrah-e-Faisal and demanded extra cash for toll flyover.',
    driverFeedback: 'Passenger was upset about rush hour traffic delay.',
    category: 'Driving',
    date: '2026-09-12 18:25 PKT',
    tags: ['Route Issue', 'Cash Argument'],
    severity: 'warning'
  },
  {
    id: 'fb-103',
    rideId: 'r-403',
    rideCode: 'GL-PK-89104',
    driverId: 'd-203',
    driverName: 'Zubair Shah',
    passengerId: 'p-103',
    passengerName: 'Ayesha Siddiqui',
    passengerRating: 4,
    driverRating: 5,
    passengerFeedback: 'Bike ride was quick, gave me a clean helmet. Slight wobble in heavy traffic.',
    driverFeedback: 'Easy pickup and quick dropoff.',
    category: 'Safety',
    date: '2026-09-12 18:15 PKT',
    tags: ['Helmet Provided', 'Fast Commute'],
    severity: 'normal'
  },
  {
    id: 'fb-104',
    rideId: 'r-404',
    rideCode: 'GL-PK-89105',
    driverId: 'd-204',
    driverName: 'Tariq Mehmood',
    passengerId: 'p-104',
    passengerName: 'Dr. Usman Farooq',
    passengerRating: 1,
    driverRating: 3,
    passengerFeedback: 'Late pickup by 14 minutes. Driver kept saying "coming in 2 mins" while stopped at tea stall.',
    driverFeedback: 'Tyre puncture delayed pickup near Saddar.',
    category: 'Pickup timing',
    date: '2026-09-12 17:55 PKT',
    tags: ['Heavy Delay', 'Communication Failure'],
    severity: 'critical'
  },
  {
    id: 'fb-105',
    rideId: 'r-405',
    rideCode: 'GL-PK-89085',
    driverId: 'd-205',
    driverName: 'Bashir Ahmed Khan',
    passengerId: 'p-105',
    passengerName: 'Rizwan Sheikh',
    passengerRating: 5,
    driverRating: 1,
    passengerFeedback: 'Smooth cargo shifting of electronics boxes.',
    driverFeedback: 'Passenger screamed and threatened me during pickup waiting.',
    category: 'Behavior',
    date: '2026-09-12 14:15 PKT',
    tags: ['Abusive Passenger', 'Resolved by Ops'],
    severity: 'critical'
  },
  {
    id: 'fb-106',
    rideId: 'r-406',
    rideCode: 'GL-PK-89090',
    driverId: 'd-204',
    driverName: 'Tariq Mehmood',
    passengerId: 'p-101',
    passengerName: 'Zainab Fatima',
    passengerRating: 2,
    driverRating: 4,
    passengerFeedback: 'Driver was constantly talking on phone on speaker during the ride.',
    driverFeedback: 'Family emergency call handled on handsfree.',
    category: 'Communication',
    date: '2026-09-11 16:40 PKT',
    tags: ['Phone Usage', 'Distracted Driving'],
    severity: 'warning'
  },
  {
    id: 'fb-107',
    rideId: 'r-407',
    rideCode: 'GL-PK-89078',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    passengerId: 'p-103',
    passengerName: 'Ayesha Siddiqui',
    passengerRating: 5,
    driverRating: 5,
    passengerFeedback: 'Very safe driving in heavy rain on Lahore Canal Road. Highly recommended.',
    driverFeedback: 'Great passenger.',
    category: 'Driving',
    date: '2026-09-10 19:10 PKT',
    tags: ['Safe Driving', 'Courteous'],
    severity: 'normal'
  }
];

export interface SmartComplaintPattern {
  totalCount: number;
  recentCount7Days: number;
  repeatedCategory: string;
  categoryBreakdown: Record<string, number>;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  trend: 'escalating' | 'stable' | 'improving';
  requiresAction: boolean;
  actionReason: string;
  summaryText: string;
  recentComplaints: Complaint[];
}

export function calculateSmartComplaintPattern(
  entityType: 'driver' | 'passenger',
  entityId: string,
  allComplaints: Complaint[]
): SmartComplaintPattern {
  const matching = allComplaints.filter((c) => {
    if (entityType === 'driver') {
      return (
        c.targetId === entityId ||
        c.targetName?.toLowerCase().includes(entityId.toLowerCase()) ||
        (c.reporterType === 'passenger' && (c as any).driverId === entityId)
      );
    } else {
      return (
        c.reporterId === entityId ||
        c.reporterName?.toLowerCase().includes(entityId.toLowerCase()) ||
        c.targetId === entityId
      );
    }
  });

  const now = new Date('2026-09-13T00:00:00Z').getTime();
  const recentComplaints = matching.filter((c) => {
    const created = new Date(c.createdAt || '').getTime();
    if (isNaN(created)) return true; // default include in demo
    return now - created <= 7 * 24 * 60 * 60 * 1000;
  });

  const categoryCount: Record<string, number> = {};
  let criticalCount = 0;
  let highCount = 0;

  matching.forEach((c) => {
    const cat = c.category || c.type || 'general';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    if (c.severity === 'critical') criticalCount++;
    if (c.severity === 'high') highCount++;
  });

  let maxCategory = 'None';
  let maxCategoryCount = 0;
  Object.entries(categoryCount).forEach(([cat, count]) => {
    if (count > maxCategoryCount) {
      maxCategory = cat;
      maxCategoryCount = count;
    }
  });

  // Calculate severity level
  let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (criticalCount > 0 || matching.length >= 3) {
    severity = 'Critical';
  } else if (highCount > 0 || matching.length >= 2) {
    severity = 'High';
  } else if (matching.length === 1) {
    severity = 'Medium';
  }

  // Trend
  const trend: 'escalating' | 'stable' | 'improving' =
    recentComplaints.length >= 2 ? 'escalating' : matching.length > 0 ? 'stable' : 'improving';

  // Requires Action determination
  const requiresAction = matching.length >= 2 || criticalCount > 0;
  const formattedCategory = maxCategory.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const summaryText =
    matching.length > 0
      ? `${matching.length} complaint${matching.length > 1 ? 's' : ''} (${recentComplaints.length} in last 7 days) • Top Category: ${formattedCategory} • Risk: ${severity}`
      : 'No recorded complaints in system.';

  const actionReason = requiresAction
    ? `${matching.length} complaints on file with repeated issues in ${formattedCategory}. Operator review recommended.`
    : 'No urgent compliance intervention required.';

  return {
    totalCount: matching.length,
    recentCount7Days: recentComplaints.length,
    repeatedCategory: formattedCategory,
    categoryBreakdown: categoryCount,
    severity,
    trend,
    requiresAction,
    actionReason,
    summaryText,
    recentComplaints: matching
  };
}
