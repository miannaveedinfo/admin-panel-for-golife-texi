import {
  Driver,
  Ride,
  DriverDailySummary,
  DriverSuspensionRecord,
  DriverWarningRecord,
  LatePickupIncident,
  LatePickupConfig,
  EarningsDateFilter,
  DriverEarningsRideDetail
} from '../types';
import { calculateCommissionForRide } from './commissionService';
import { CommissionRule, DriverCommissionOverride } from '../types/commissionAndRevenue';

export const PREDEFINED_SUSPENSION_REASONS_MAP: Record<string, string> = {
  '5 late pickups': 'Driver temporarily suspended due to 5 qualifying late pickup incidents recorded today.',
  'Repeated late pickup': 'Driver temporarily suspended due to recurring delayed passenger pickups exceeding standard threshold.',
  'Passenger complaint': 'Driver temporarily suspended for passenger complaint pending operations review.',
  'Multiple complaints': 'Driver temporarily suspended following multiple verified passenger complaints regarding service quality.',
  'Unsafe driving': 'Driver temporarily suspended immediately due to reported reckless driving or traffic safety hazard.',
  'Harassment/abusive behavior': 'Urgent safety suspension: Passenger reported abusive behavior or verbal harassment.',
  'Fraud/suspicious activity': 'Account suspended for suspicious GPS manipulation, ghost rides, or fare fraud.',
  'Invalid documents': 'Suspended pending re-verification: Submitted CNIC or Driving License failed document audit.',
  'Vehicle safety issue': 'Vehicle suspended for critical mechanical failure, broken A/C, or unsafe road condition.',
  'Repeated cancellation': 'Driver suspended for excessive post-acceptance ride cancellations impacting reliability.',
  'Driver no-show': 'Suspended after confirmed report of driver failing to arrive at designated pickup point.',
  'Payment violation': 'Account suspended for cash overcharging, fare dispute, or offline fare collection.',
  'Policy violation': 'Driver suspended for violation of GoLife Pakistan driver code of conduct and service terms.',
  'Safety investigation': 'Temporary cooling-off suspension active during ongoing safety incident investigation.',
  'Verification issue': 'Account temporarily paused pending mandatory biometrics or document update.',
  'Other': 'Administrative suspension issued per operations desk review.'
};

export const PREDEFINED_SUSPENSION_REASONS = Object.keys(PREDEFINED_SUSPENSION_REASONS_MAP);

export const MANUAL_SUSPENSION_REASONS = PREDEFINED_SUSPENSION_REASONS;

export const FAIR_LATE_EXCLUSION_REASONS = [
  'Passenger requested delay',
  'Passenger changed pickup',
  'Passenger unavailable',
  'Road closure',
  'Severe traffic/event',
  'Technical issue',
  'Ride cancelled before pickup',
  'Other approved exception'
] as const;

export interface PickupDelayCalculation {
  expectedTime: string;
  actualArrival: string;
  delayMinutes: number;
  status: 'On Time' | 'Slightly Late' | 'Late' | 'Critical Delay';
  isQualifyingLate: boolean;
  exclusionReason?: string;
}

export function calculatePickupDelay(
  expectedTimeStr: string,
  actualArrivalStr: string,
  exclusionReason?: string
): PickupDelayCalculation {
  // Parse times (format: "HH:MM" or "YYYY-MM-DD HH:MM")
  const parseToMinutes = (str: string): number => {
    if (!str) return 0;
    const parts = str.includes(' ') ? str.split(' ')[1].split(':') : str.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const expMinutes = parseToMinutes(expectedTimeStr);
  const actMinutes = parseToMinutes(actualArrivalStr);
  const diff = actMinutes - expMinutes;
  const delayMinutes = Math.max(0, diff);

  let status: 'On Time' | 'Slightly Late' | 'Late' | 'Critical Delay' = 'On Time';
  if (delayMinutes <= 1) {
    status = 'On Time';
  } else if (delayMinutes <= 5) {
    status = 'Slightly Late';
  } else if (delayMinutes <= 15) {
    status = 'Late';
  } else {
    status = 'Critical Delay';
  }

  // A delay is qualifying if delay >= 6 minutes and there is NO approved exclusion
  const isQualifyingLate = !exclusionReason && delayMinutes >= 6;

  return {
    expectedTime: expectedTimeStr,
    actualArrival: actualArrivalStr,
    delayMinutes,
    status,
    isQualifyingLate,
    exclusionReason
  };
}

export const SUSPENSION_DURATIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '6 Hours', hours: 6 },
  { label: '12 Hours (Standard Auto)', hours: 12 },
  { label: '24 Hours (1 Day)', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days (1 Week)', hours: 168 },
  { label: 'Permanent / Indefinite', hours: 87600 } // ~10 years
] as const;

export const DEFAULT_LATE_PICKUP_CONFIG: LatePickupConfig = {
  requiredIncidentsForSuspension: 5,
  thresholdDelayMinutes: 8,
  suspensionDurationHours: 12,
  excludePassengerDelays: true,
  excludeTrafficSevere: true
};

// Helper to get formatted dates
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Initial Driver Daily Summaries with realistic data across Pakistani cities
export const INITIAL_DRIVER_DAILY_SUMMARIES: DriverDailySummary[] = [
  // Today's entries
  {
    id: 'dds_today_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: getTodayStr(),
    totalRides: 8,
    completedRides: 7,
    cancelledRides: 1,
    grossEarnings: 6850,
    commission: 1028,
    netEarnings: 5822,
    cash: 4200,
    onlinePayments: 2650,
    adjustments: 0,
    finalPayable: 1622, // Net - Cash collected in hand = remaining due from/to driver
    status: 'Calculated',
    calculatedAt: `${getTodayStr()} 19:00:00`,
    rides: [
      {
        rideId: 'ride_101',
        rideCode: 'GL-9021',
        time: '09:15 AM',
        pickupAddress: 'DHA Phase 5, Lahore',
        destinationAddress: 'Gulberg III, Main Market',
        fare: 950,
        commission: 142,
        driverEarned: 808,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      },
      {
        rideId: 'ride_102',
        rideCode: 'GL-9034',
        time: '11:30 AM',
        pickupAddress: 'Model Town Block C',
        destinationAddress: 'Packages Mall, Walton Road',
        fare: 820,
        commission: 123,
        driverEarned: 697,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 4
      },
      {
        rideId: 'ride_103',
        rideCode: 'GL-9048',
        time: '01:45 PM',
        pickupAddress: 'Mall Road, Anarkali',
        destinationAddress: 'Johar Town G1 Market',
        fare: 1250,
        commission: 188,
        driverEarned: 1062,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      },
      {
        rideId: 'ride_104',
        rideCode: 'GL-9060',
        time: '03:10 PM',
        pickupAddress: 'Allama Iqbal Airport',
        destinationAddress: 'Cantt Cavalry Ground',
        fare: 1100,
        commission: 165,
        driverEarned: 935,
        paymentMethod: 'easypaisa',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 3
      },
      {
        rideId: 'ride_105',
        rideCode: 'GL-9075',
        time: '04:40 PM',
        pickupAddress: 'Wapda Town Roundabout',
        destinationAddress: 'Bahria Town Sector C',
        fare: 1450,
        commission: 218,
        driverEarned: 1232,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 0
      },
      {
        rideId: 'ride_106',
        rideCode: 'GL-9088',
        time: '06:05 PM',
        pickupAddress: 'Gulberg MM Alam Road',
        destinationAddress: 'Shadman Market',
        fare: 650,
        commission: 98,
        driverEarned: 552,
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 5
      },
      {
        rideId: 'ride_107',
        rideCode: 'GL-9099',
        time: '07:20 PM',
        pickupAddress: 'Garden Town',
        destinationAddress: 'Ferozepur Road Ichhra',
        fare: 630,
        commission: 94,
        driverEarned: 536,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 3
      }
    ]
  },
  {
    id: 'dds_today_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: getTodayStr(),
    totalRides: 10,
    completedRides: 9,
    cancelledRides: 1,
    grossEarnings: 9400,
    commission: 1410,
    netEarnings: 7990,
    cash: 5800,
    onlinePayments: 3600,
    adjustments: 200, // fuel incentive
    finalPayable: 2390,
    status: 'Pending',
    calculatedAt: `${getTodayStr()} 19:15:00`,
    rides: [
      {
        rideId: 'ride_201',
        rideCode: 'GL-KHI-8101',
        time: '08:30 AM',
        pickupAddress: 'Clifton Block 4, Marine Drive',
        destinationAddress: 'I.I. Chundrigar Road, Habib Bank Plaza',
        fare: 1250,
        commission: 188,
        driverEarned: 1062,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      },
      {
        rideId: 'ride_202',
        rideCode: 'GL-KHI-8102',
        time: '10:15 AM',
        pickupAddress: 'Saddar Empress Market',
        destinationAddress: 'Gulshan-e-Iqbal Block 13-D',
        fare: 980,
        commission: 147,
        driverEarned: 833,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 3
      },
      {
        rideId: 'ride_203',
        rideCode: 'GL-KHI-8103',
        time: '11:45 AM',
        pickupAddress: 'Bahadurabad Chowrangi',
        destinationAddress: 'Jinnah International Airport, Terminal 1',
        fare: 1450,
        commission: 218,
        driverEarned: 1232,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      },
      {
        rideId: 'ride_204',
        rideCode: 'GL-KHI-8104',
        time: '01:30 PM',
        pickupAddress: 'Shahrah-e-Faisal, FTC',
        destinationAddress: 'DHA Phase 6, Khayaban-e-Shahbaz',
        fare: 1100,
        commission: 165,
        driverEarned: 935,
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 0
      },
      {
        rideId: 'ride_205',
        rideCode: 'GL-KHI-8105',
        time: '03:10 PM',
        pickupAddress: 'North Nazimabad Block H',
        destinationAddress: 'Tariq Road PECHS',
        fare: 1050,
        commission: 157,
        driverEarned: 893,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 4
      },
      {
        rideId: 'ride_206',
        rideCode: 'GL-KHI-8106',
        time: '04:45 PM',
        pickupAddress: 'Dolmen Mall Clifton',
        destinationAddress: 'Sindhi Muslim Housing Society',
        fare: 890,
        commission: 133,
        driverEarned: 757,
        paymentMethod: 'easypaisa',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      },
      {
        rideId: 'ride_207',
        rideCode: 'GL-KHI-8107',
        time: '06:20 PM',
        pickupAddress: 'Karachi University Road',
        destinationAddress: 'Nipa Chowrangi Gulshan',
        fare: 680,
        commission: 102,
        driverEarned: 578,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      },
      {
        rideId: 'ride_208',
        rideCode: 'GL-KHI-8108',
        time: '07:50 PM',
        pickupAddress: 'LuckyOne Mall, Federal B Area',
        destinationAddress: 'Rashid Minhas Road',
        fare: 920,
        commission: 138,
        driverEarned: 782,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 0
      },
      {
        rideId: 'ride_209',
        rideCode: 'GL-KHI-8109',
        time: '09:10 PM',
        pickupAddress: 'Sea View Beach Avenue',
        destinationAddress: 'Boat Basin Clifton',
        fare: 1080,
        commission: 162,
        driverEarned: 918,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      }
    ]
  },
  {
    id: 'dds_today_03',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPlate: 'ISB-7721',
    city: 'Islamabad',
    date: getTodayStr(),
    totalRides: 6,
    completedRides: 4,
    cancelledRides: 2,
    grossEarnings: 4200,
    commission: 630,
    netEarnings: 3570,
    cash: 2500,
    onlinePayments: 1700,
    adjustments: -500, // fine deduction
    finalPayable: 570,
    status: 'Calculated',
    calculatedAt: `${getTodayStr()} 18:45:00`,
    rides: [
      {
        rideId: 'ride_301',
        rideCode: 'GL-ISB-7011',
        time: '09:00 AM',
        pickupAddress: 'F-10 Markaz, Islamabad',
        destinationAddress: 'Blue Area, Jinnah Avenue',
        fare: 1100,
        commission: 165,
        driverEarned: 935,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      },
      {
        rideId: 'ride_302',
        rideCode: 'GL-ISB-7012',
        time: '11:20 AM',
        pickupAddress: 'Centaurus Mall, F-8/4',
        destinationAddress: 'G-11 Markaz',
        fare: 850,
        commission: 128,
        driverEarned: 722,
        paymentMethod: 'easypaisa',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      },
      {
        rideId: 'ride_303',
        rideCode: 'GL-ISB-7013',
        time: '02:15 PM',
        pickupAddress: 'F-6 Super Market',
        destinationAddress: 'Islamabad Club, Murree Road',
        fare: 950,
        commission: 142,
        driverEarned: 808,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 0
      },
      {
        rideId: 'ride_304',
        rideCode: 'GL-ISB-7014',
        time: '05:40 PM',
        pickupAddress: 'I-8 Markaz',
        destinationAddress: 'Rawal Lake View Park',
        fare: 1300,
        commission: 195,
        driverEarned: 1105,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 3
      }
    ]
  },
  {
    id: 'dds_today_04',
    driverId: 'drv_04',
    driverName: 'Kamran Ali Shah',
    driverPlate: 'RWP-1190',
    city: 'Rawalpindi',
    date: getTodayStr(),
    totalRides: 9,
    completedRides: 9,
    cancelledRides: 0,
    grossEarnings: 8100,
    commission: 1215,
    netEarnings: 6885,
    cash: 4500,
    onlinePayments: 3600,
    adjustments: 0,
    finalPayable: 2385,
    status: 'Paid',
    calculatedAt: `${getTodayStr()} 18:30:00`,
    settledAt: `${getTodayStr()} 19:00:00`,
    settledBy: 'Finance Auto-Batch',
    rides: [
      {
        rideId: 'ride_401',
        rideCode: 'GL-RWP-6011',
        time: '08:15 AM',
        pickupAddress: 'Saddar Cantt Station, Rawalpindi',
        destinationAddress: 'Murree Road, Chandni Chowk',
        fare: 750,
        commission: 112,
        driverEarned: 638,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      },
      {
        rideId: 'ride_402',
        rideCode: 'GL-RWP-6012',
        time: '09:40 AM',
        pickupAddress: 'Commercial Market Satellite Town',
        destinationAddress: 'Faizabad Interchange',
        fare: 820,
        commission: 123,
        driverEarned: 697,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      },
      {
        rideId: 'ride_403',
        rideCode: 'GL-RWP-6013',
        time: '11:10 AM',
        pickupAddress: 'Bahria Town Phase 4 Civic Center',
        destinationAddress: 'DHA Phase 2 Gate 1',
        fare: 1150,
        commission: 172,
        driverEarned: 978,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 3
      },
      {
        rideId: 'ride_404',
        rideCode: 'GL-RWP-6014',
        time: '01:00 PM',
        pickupAddress: 'Raja Bazaar, City Saddar',
        destinationAddress: 'Westridge 1 Peshwar Road',
        fare: 680,
        commission: 102,
        driverEarned: 578,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 0
      },
      {
        rideId: 'ride_405',
        rideCode: 'GL-RWP-6015',
        time: '02:40 PM',
        pickupAddress: 'Chaklala Scheme 3',
        destinationAddress: 'Ayub National Park Jhelum Road',
        fare: 920,
        commission: 138,
        driverEarned: 782,
        paymentMethod: 'easypaisa',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 2
      },
      {
        rideId: 'ride_406',
        rideCode: 'GL-RWP-6016',
        time: '04:15 PM',
        pickupAddress: 'Rawalpindi Medical University',
        destinationAddress: 'Holy Family Hospital',
        fare: 640,
        commission: 96,
        driverEarned: 544,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      },
      {
        rideId: 'ride_407',
        rideCode: 'GL-RWP-6017',
        time: '05:50 PM',
        pickupAddress: 'Bahria Town Phase 7',
        destinationAddress: 'Gulrez Housing Society',
        fare: 1250,
        commission: 188,
        driverEarned: 1062,
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 4
      },
      {
        rideId: 'ride_408',
        rideCode: 'GL-RWP-6018',
        time: '07:20 PM',
        pickupAddress: 'Peshawar Road Koh-e-Noor Mills',
        destinationAddress: 'Golra Metro Station',
        fare: 940,
        commission: 141,
        driverEarned: 799,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 0
      },
      {
        rideId: 'ride_409',
        rideCode: 'GL-RWP-6019',
        time: '08:45 PM',
        pickupAddress: 'Tench Bhata Cantt',
        destinationAddress: 'Lalkurti Commercial',
        fare: 950,
        commission: 143,
        driverEarned: 807,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        status: 'completed',
        delayMin: 1
      }
    ]
  },
  // Yesterday's entries
  {
    id: 'dds_yest_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: getPastDateStr(1),
    totalRides: 11,
    completedRides: 11,
    cancelledRides: 0,
    grossEarnings: 10450,
    commission: 1568,
    netEarnings: 8882,
    cash: 6200,
    onlinePayments: 4250,
    adjustments: 0,
    finalPayable: 2682,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(1)} 23:59:00`,
    settledAt: `${getTodayStr()} 08:30:00`,
    settledBy: 'Finance Batch #902'
  },
  {
    id: 'dds_yest_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: getPastDateStr(1),
    totalRides: 8,
    completedRides: 8,
    cancelledRides: 0,
    grossEarnings: 7600,
    commission: 1140,
    netEarnings: 6460,
    cash: 4100,
    onlinePayments: 3500,
    adjustments: 0,
    finalPayable: 2360,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(1)} 23:59:00`,
    settledAt: `${getTodayStr()} 08:30:00`,
    settledBy: 'Finance Batch #902'
  },
  // Day before yesterday
  {
    id: 'dds_dbyest_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: getPastDateStr(2),
    totalRides: 9,
    completedRides: 8,
    cancelledRides: 1,
    grossEarnings: 8200,
    commission: 1230,
    netEarnings: 6970,
    cash: 5000,
    onlinePayments: 3200,
    adjustments: 0,
    finalPayable: 1970,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(2)} 23:59:00`,
    settledAt: `${getPastDateStr(1)} 09:00:00`,
    settledBy: 'Finance Batch #898'
  },
  {
    id: 'dds_dbyest_02',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPlate: 'ISB-8190',
    city: 'Islamabad',
    date: getPastDateStr(2),
    totalRides: 7,
    completedRides: 7,
    cancelledRides: 0,
    grossEarnings: 5900,
    commission: 885,
    netEarnings: 5015,
    cash: 3400,
    onlinePayments: 2500,
    adjustments: 0,
    finalPayable: 1615,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(2)} 23:59:00`,
    settledAt: `${getPastDateStr(1)} 09:00:00`,
    settledBy: 'Finance Batch #898'
  },
  {
    id: 'dds_past_05',
    driverId: 'drv_05',
    driverName: 'Bilal Qureshi',
    driverPlate: 'LHE-5501',
    city: 'Lahore',
    date: getPastDateStr(3),
    totalRides: 5,
    completedRides: 5,
    cancelledRides: 0,
    grossEarnings: 4500,
    commission: 675,
    netEarnings: 3825,
    cash: 3000,
    onlinePayments: 1500,
    adjustments: 0,
    finalPayable: 825,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(3)} 23:59:00`
  },
  {
    id: 'dds_past_06',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: getPastDateStr(3),
    totalRides: 6,
    completedRides: 6,
    cancelledRides: 0,
    grossEarnings: 5800,
    commission: 870,
    netEarnings: 4930,
    cash: 3800,
    onlinePayments: 2000,
    adjustments: 0,
    finalPayable: 1130,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(3)} 23:59:00`
  },
  // 7 Days Ago
  {
    id: 'dds_week_01',
    driverId: 'drv_06',
    driverName: 'Hamza Farooq',
    driverPlate: 'RWP-1192',
    city: 'Rawalpindi',
    date: getPastDateStr(7),
    totalRides: 8,
    completedRides: 8,
    cancelledRides: 0,
    grossEarnings: 6400,
    commission: 960,
    netEarnings: 5440,
    cash: 4200,
    onlinePayments: 2200,
    adjustments: 0,
    finalPayable: 1240,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(7)} 23:59:00`
  },
  {
    id: 'dds_week_02',
    driverId: 'drv_07',
    driverName: 'Rana Tanveer',
    driverPlate: 'FSD-4821',
    city: 'Faisalabad',
    date: getPastDateStr(7),
    totalRides: 6,
    completedRides: 6,
    cancelledRides: 0,
    grossEarnings: 4900,
    commission: 735,
    netEarnings: 4165,
    cash: 3100,
    onlinePayments: 1800,
    adjustments: 0,
    finalPayable: 1065,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(7)} 23:59:00`
  },
  // 14 Days Ago
  {
    id: 'dds_past_14d',
    driverId: 'drv_08',
    driverName: 'Malik Asif',
    driverPlate: 'MUL-9021',
    city: 'Multan',
    date: getPastDateStr(14),
    totalRides: 5,
    completedRides: 5,
    cancelledRides: 0,
    grossEarnings: 3800,
    commission: 570,
    netEarnings: 3230,
    cash: 2500,
    onlinePayments: 1300,
    adjustments: 0,
    finalPayable: 730,
    status: 'Paid',
    calculatedAt: `${getPastDateStr(14)} 23:59:00`
  },
  // Previous Month (2026-08-15)
  {
    id: 'dds_prev_m_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: '2026-08-15',
    totalRides: 12,
    completedRides: 12,
    cancelledRides: 0,
    grossEarnings: 11200,
    commission: 1680,
    netEarnings: 9520,
    cash: 7200,
    onlinePayments: 4000,
    adjustments: 0,
    finalPayable: 2320,
    status: 'Paid',
    calculatedAt: '2026-08-15 23:59:00'
  },
  {
    id: 'dds_prev_m_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: '2026-08-15',
    totalRides: 9,
    completedRides: 9,
    cancelledRides: 0,
    grossEarnings: 8400,
    commission: 1260,
    netEarnings: 7140,
    cash: 5100,
    onlinePayments: 3300,
    adjustments: 0,
    finalPayable: 2040,
    status: 'Paid',
    calculatedAt: '2026-08-15 23:59:00'
  },
  // Two Months Ago (2026-07-20)
  {
    id: 'dds_prev_m2_01',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPlate: 'ISB-8190',
    city: 'Islamabad',
    date: '2026-07-20',
    totalRides: 8,
    completedRides: 8,
    cancelledRides: 0,
    grossEarnings: 6700,
    commission: 1005,
    netEarnings: 5695,
    cash: 4200,
    onlinePayments: 2500,
    adjustments: 0,
    finalPayable: 1495,
    status: 'Paid',
    calculatedAt: '2026-07-20 23:59:00'
  },
  // Specific Historical Archive: 19 September 2026 (Phase 64 Benchmark Date)
  {
    id: 'dds_20260919_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: '2026-09-19',
    totalRides: 9,
    completedRides: 9,
    cancelledRides: 0,
    grossEarnings: 9200,
    commission: 1380,
    netEarnings: 7820,
    cash: 5800,
    onlinePayments: 3400,
    adjustments: 0,
    finalPayable: 2020,
    status: 'Paid',
    calculatedAt: '2026-09-19 23:59:00',
    rides: [
      { rideId: 'r-20260919-01', rideCode: 'GL-PK-91901', time: '08:30', fare: 850, distanceKm: 9.2, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Gulberg III, Main Market, Lahore', destinationAddress: 'DHA Phase 6, Sector A, Lahore' },
      { rideId: 'r-20260919-02', rideCode: 'GL-PK-91902', time: '10:15', fare: 1100, distanceKm: 12.5, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Allama Iqbal Town, Lahore', destinationAddress: 'Johar Town, Expo Centre, Lahore' },
      { rideId: 'r-20260919-03', rideCode: 'GL-PK-91903', time: '12:00', fare: 950, distanceKm: 10.1, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Mall Road, Anarkali, Lahore', destinationAddress: 'Model Town C Block, Lahore' },
      { rideId: 'r-20260919-04', rideCode: 'GL-PK-91904', time: '14:20', fare: 1250, distanceKm: 14.0, status: 'completed', paymentMethod: 'jazzcash', paymentStatus: 'paid', pickupAddress: 'Packages Mall, Walton, Lahore', destinationAddress: 'Bahria Town Sector C, Lahore' },
      { rideId: 'r-20260919-05', rideCode: 'GL-PK-91905', time: '16:00', fare: 980, distanceKm: 10.8, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Cavalry Ground, Lahore', destinationAddress: 'Shadman Market, Lahore' },
      { rideId: 'r-20260919-06', rideCode: 'GL-PK-91906', time: '17:45', fare: 1050, distanceKm: 11.4, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'WAPDA Town, Lahore', destinationAddress: 'Gulberg MM Alam Road, Lahore' },
      { rideId: 'r-20260919-07', rideCode: 'GL-PK-91907', time: '19:10', fare: 880, distanceKm: 8.9, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Garden Town, Lahore', destinationAddress: 'DHA Phase 3 Y Block, Lahore' },
      { rideId: 'r-20260919-08', rideCode: 'GL-PK-91908', time: '20:40', fare: 1120, distanceKm: 12.0, status: 'completed', paymentMethod: 'easypaisa', paymentStatus: 'paid', pickupAddress: 'Gulberg Liberty Market, Lahore', destinationAddress: 'Valencia Town, Lahore' },
      { rideId: 'r-20260919-09', rideCode: 'GL-PK-91909', time: '22:15', fare: 1020, distanceKm: 11.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'DHA Phase 5 Commercial, Lahore', destinationAddress: 'Cantt Saddar, Lahore' }
    ]
  },
  {
    id: 'dds_20260919_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: '2026-09-19',
    totalRides: 8,
    completedRides: 7,
    cancelledRides: 1,
    grossEarnings: 7800,
    commission: 1170,
    netEarnings: 6630,
    cash: 4900,
    onlinePayments: 2900,
    adjustments: 0,
    finalPayable: 1730,
    status: 'Paid',
    calculatedAt: '2026-09-19 23:59:00',
    rides: [
      { rideId: 'r-20260919-10', rideCode: 'GL-PK-91910', time: '09:00', fare: 1150, distanceKm: 13.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Clifton Block 2, Karachi', destinationAddress: 'I.I. Chundrigar Road, Karachi' },
      { rideId: 'r-20260919-11', rideCode: 'GL-PK-91911', time: '11:10', fare: 950, distanceKm: 10.2, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Saddar Bohri Bazaar, Karachi', destinationAddress: 'Gulshan-e-Iqbal Block 13D, Karachi' },
      { rideId: 'r-20260919-12', rideCode: 'GL-PK-91912', time: '13:00', fare: 1300, distanceKm: 16.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Gulshan Chowrangi, Karachi', destinationAddress: 'Jinnah International Airport, Karachi' },
      { rideId: 'r-20260919-13', rideCode: 'GL-PK-91913', time: '15:20', fare: 1080, distanceKm: 12.0, status: 'completed', paymentMethod: 'jazzcash', paymentStatus: 'paid', pickupAddress: 'Malir Cantt Gate 2, Karachi', destinationAddress: 'Bahadurabad Char Minar, Karachi' },
      { rideId: 'r-20260919-14', rideCode: 'GL-PK-91914', time: '17:30', fare: 1220, distanceKm: 14.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'PECHS Block 6, Karachi', destinationAddress: 'DHA Phase 6 Khayaban-e-Ittehad, Karachi' },
      { rideId: 'r-20260919-15', rideCode: 'GL-PK-91915', time: '19:40', fare: 1100, distanceKm: 12.8, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'DHA Phase 5 Zamzama, Karachi', destinationAddress: 'North Nazimabad Block B, Karachi' },
      { rideId: 'r-20260919-16', rideCode: 'GL-PK-91916', time: '21:30', fare: 1000, distanceKm: 11.0, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'North Nazimabad 5-Star Chowrangi, Karachi', destinationAddress: 'Gulberg Water Pump, Karachi' },
      { rideId: 'r-20260919-17', rideCode: 'GL-PK-91917', time: '22:45', fare: 0, distanceKm: 0, status: 'cancelled', paymentMethod: 'cash', paymentStatus: 'cancelled', pickupAddress: 'FB Area Block 14, Karachi', destinationAddress: 'Saddar Regal Chowk, Karachi' }
    ]
  },
  {
    id: 'dds_20260919_03',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    driverPlate: 'ISB-8190',
    city: 'Islamabad',
    date: '2026-09-19',
    totalRides: 6,
    completedRides: 6,
    cancelledRides: 0,
    grossEarnings: 6400,
    commission: 960,
    netEarnings: 5440,
    cash: 4100,
    onlinePayments: 2300,
    adjustments: 0,
    finalPayable: 1340,
    status: 'Paid',
    calculatedAt: '2026-09-19 23:59:00',
    rides: [
      { rideId: 'r-20260919-18', rideCode: 'GL-PK-91918', time: '09:30', fare: 1050, distanceKm: 11.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Sector F-6 Super Market, Islamabad', destinationAddress: 'Sector G-11 Markaz, Islamabad' },
      { rideId: 'r-20260919-19', rideCode: 'GL-PK-91919', time: '11:45', fare: 950, distanceKm: 10.0, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Blue Area Jinnah Avenue, Islamabad', destinationAddress: 'Sector I-8 Markaz, Islamabad' },
      { rideId: 'r-20260919-20', rideCode: 'GL-PK-91920', time: '14:00', fare: 1350, distanceKm: 15.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Sector F-10 Markaz, Islamabad', destinationAddress: 'Rawalpindi Saddar Metro Station, Rawalpindi' },
      { rideId: 'r-20260919-21', rideCode: 'GL-PK-91921', time: '16:30', fare: 1100, distanceKm: 12.0, status: 'completed', paymentMethod: 'easypaisa', paymentStatus: 'paid', pickupAddress: 'Murree Road Chandni Chowk, Rawalpindi', destinationAddress: 'Sector H-9 Higher Education Commission, Islamabad' },
      { rideId: 'r-20260919-22', rideCode: 'GL-PK-91922', time: '18:50', fare: 980, distanceKm: 10.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Sector F-7 Jinnah Super, Islamabad', destinationAddress: 'Centaurus Mall, Islamabad' },
      { rideId: 'r-20260919-23', rideCode: 'GL-PK-91923', time: '21:00', fare: 970, distanceKm: 10.2, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Centaurus Mall, Islamabad', destinationAddress: 'Sector E-11 Multi Gardens, Islamabad' }
    ]
  },
  {
    id: 'dds_20260919_04',
    driverId: 'drv_04',
    driverName: 'Rashid Minhas',
    driverPlate: 'RWP-3312',
    city: 'Rawalpindi',
    date: '2026-09-19',
    totalRides: 5,
    completedRides: 5,
    cancelledRides: 0,
    grossEarnings: 4950,
    commission: 742.5,
    netEarnings: 4207.5,
    cash: 3200,
    onlinePayments: 1750,
    adjustments: 0,
    finalPayable: 1007.5,
    status: 'Paid',
    calculatedAt: '2026-09-19 23:59:00',
    rides: [
      { rideId: 'r-20260919-24', rideCode: 'GL-PK-91924', time: '10:00', fare: 950, distanceKm: 9.8, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Bahria Town Phase 4, Rawalpindi', destinationAddress: 'Saddar Bank Road, Rawalpindi' },
      { rideId: 'r-20260919-25', rideCode: 'GL-PK-91925', time: '12:30', fare: 1100, distanceKm: 12.0, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Westridge 1, Rawalpindi', destinationAddress: 'Chaklala Scheme 3, Rawalpindi' },
      { rideId: 'r-20260919-26', rideCode: 'GL-PK-91926', time: '15:10', fare: 880, distanceKm: 8.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Commercial Market Satellite Town, Rawalpindi', destinationAddress: 'Faizabad Bus Interchange, Rawalpindi' },
      { rideId: 'r-20260919-27', rideCode: 'GL-PK-91927', time: '17:40', fare: 1020, distanceKm: 11.2, status: 'completed', paymentMethod: 'jazzcash', paymentStatus: 'paid', pickupAddress: 'Murree Road Rehmanabad, Rawalpindi', destinationAddress: 'DHA Phase 2 Gate 1, Rawalpindi' },
      { rideId: 'r-20260919-28', rideCode: 'GL-PK-91928', time: '20:15', fare: 1000, distanceKm: 10.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'DHA Phase 2 Central Park, Rawalpindi', destinationAddress: 'Bahria Town Phase 7, Rawalpindi' }
    ]
  },
  // Specific Historical Archive: 20 September 2026
  {
    id: 'dds_20260920_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: '2026-09-20',
    totalRides: 7,
    completedRides: 7,
    cancelledRides: 0,
    grossEarnings: 7100,
    commission: 1065,
    netEarnings: 6035,
    cash: 4500,
    onlinePayments: 2600,
    adjustments: 0,
    finalPayable: 1535,
    status: 'Paid',
    calculatedAt: '2026-09-20 23:59:00',
    rides: [
      { rideId: 'r-20260920-01', rideCode: 'GL-PK-92001', time: '09:00', fare: 950, distanceKm: 10.2, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Johar Town G1 Market, Lahore', destinationAddress: 'Gulberg Main Boulevard, Lahore' },
      { rideId: 'r-20260920-02', rideCode: 'GL-PK-92002', time: '11:15', fare: 1050, distanceKm: 11.5, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Gulberg Liberty, Lahore', destinationAddress: 'DHA Phase 4 Sector CCA, Lahore' },
      { rideId: 'r-20260920-03', rideCode: 'GL-PK-92003', time: '13:30', fare: 1150, distanceKm: 13.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'DHA Phase 4, Lahore', destinationAddress: 'Allama Iqbal Airport Terminal, Lahore' },
      { rideId: 'r-20260920-04', rideCode: 'GL-PK-92004', time: '15:45', fare: 980, distanceKm: 10.8, status: 'completed', paymentMethod: 'jazzcash', paymentStatus: 'paid', pickupAddress: 'Airport Road, Lahore', destinationAddress: 'Cantt Mall of Lahore, Lahore' },
      { rideId: 'r-20260920-05', rideCode: 'GL-PK-92005', time: '17:30', fare: 1020, distanceKm: 11.2, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Shadman Market, Lahore', destinationAddress: 'Wapda Town Roundabout, Lahore' },
      { rideId: 'r-20260920-06', rideCode: 'GL-PK-92006', time: '19:15', fare: 950, distanceKm: 10.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Model Town C Block, Lahore', destinationAddress: 'Gulberg MM Alam Road, Lahore' },
      { rideId: 'r-20260920-07', rideCode: 'GL-PK-92007', time: '21:00', fare: 1000, distanceKm: 10.5, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Gulberg MM Alam, Lahore', destinationAddress: 'Johar Town Expo Centre, Lahore' }
    ]
  },
  {
    id: 'dds_20260920_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: '2026-09-20',
    totalRides: 10,
    completedRides: 9,
    cancelledRides: 1,
    grossEarnings: 10500,
    commission: 1575,
    netEarnings: 8925,
    cash: 6700,
    onlinePayments: 3800,
    adjustments: 0,
    finalPayable: 2225,
    status: 'Paid',
    calculatedAt: '2026-09-20 23:59:00',
    rides: [
      { rideId: 'r-20260920-08', rideCode: 'GL-PK-92008', time: '08:45', fare: 1150, distanceKm: 13.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Clifton Block 4, Karachi', destinationAddress: 'Saddar Zainab Market, Karachi' },
      { rideId: 'r-20260920-09', rideCode: 'GL-PK-92009', time: '10:30', fare: 1200, distanceKm: 14.2, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Saddar Empress Market, Karachi', destinationAddress: 'Gulshan Block 10, Karachi' },
      { rideId: 'r-20260920-10', rideCode: 'GL-PK-92010', time: '12:15', fare: 1050, distanceKm: 11.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Gulshan Chowrangi, Karachi', destinationAddress: 'North Nazimabad Block H, Karachi' },
      { rideId: 'r-20260920-11', rideCode: 'GL-PK-92011', time: '14:00', fare: 1300, distanceKm: 15.5, status: 'completed', paymentMethod: 'jazzcash', paymentStatus: 'paid', pickupAddress: 'North Nazimabad, Karachi', destinationAddress: 'Jinnah Terminal Airport, Karachi' },
      { rideId: 'r-20260920-12', rideCode: 'GL-PK-92012', time: '16:00', fare: 1100, distanceKm: 12.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Airport Terminal 1, Karachi', destinationAddress: 'PECHS Shahrah-e-Faisal, Karachi' },
      { rideId: 'r-20260920-13', rideCode: 'GL-PK-92013', time: '17:45', fare: 1250, distanceKm: 14.8, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Shahrah-e-Faisal FTC, Karachi', destinationAddress: 'DHA Phase 6 Sea View, Karachi' },
      { rideId: 'r-20260920-14', rideCode: 'GL-PK-92014', time: '19:30', fare: 1080, distanceKm: 12.0, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'DHA Phase 6 Bukhari Commercial, Karachi', destinationAddress: 'Bahadurabad, Karachi' },
      { rideId: 'r-20260920-15', rideCode: 'GL-PK-92015', time: '21:00', fare: 1220, distanceKm: 14.0, status: 'completed', paymentMethod: 'easypaisa', paymentStatus: 'paid', pickupAddress: 'Tariq Road PECHS, Karachi', destinationAddress: 'Malir Cantt Checkpost 5, Karachi' },
      { rideId: 'r-20260920-16', rideCode: 'GL-PK-92016', time: '22:30', fare: 1150, distanceKm: 13.0, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Malir Cantt, Karachi', destinationAddress: 'Gulshan Maskan Chowrangi, Karachi' },
      { rideId: 'r-20260920-17', rideCode: 'GL-PK-92017', time: '23:40', fare: 0, distanceKm: 0, status: 'cancelled', paymentMethod: 'cash', paymentStatus: 'cancelled', pickupAddress: 'Gulshan Maskan, Karachi', destinationAddress: 'Saddar Karachi, Karachi' }
    ]
  },
  {
    id: 'dds_20260920_03',
    driverId: 'drv_05',
    driverName: 'Bilal Qureshi',
    driverPlate: 'LHE-5501',
    city: 'Lahore',
    date: '2026-09-20',
    totalRides: 6,
    completedRides: 6,
    cancelledRides: 0,
    grossEarnings: 5600,
    commission: 840,
    netEarnings: 4760,
    cash: 3600,
    onlinePayments: 2000,
    adjustments: 0,
    finalPayable: 1160,
    status: 'Paid',
    calculatedAt: '2026-09-20 23:59:00',
    rides: [
      { rideId: 'r-20260920-18', rideCode: 'GL-PK-92018', time: '09:15', fare: 900, distanceKm: 9.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Ferozepur Road Ichhra, Lahore', destinationAddress: 'Liberty Market Gulberg, Lahore' },
      { rideId: 'r-20260920-19', rideCode: 'GL-PK-92019', time: '11:30', fare: 950, distanceKm: 10.2, status: 'completed', paymentMethod: 'wallet', paymentStatus: 'paid', pickupAddress: 'Gulberg Main Boulevard, Lahore', destinationAddress: 'DHA Phase 1 H Block, Lahore' },
      { rideId: 'r-20260920-20', rideCode: 'GL-PK-92020', time: '13:45', fare: 1050, distanceKm: 11.8, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'DHA Phase 1, Lahore', destinationAddress: 'Allama Iqbal Town Chenab Block, Lahore' },
      { rideId: 'r-20260920-21', rideCode: 'GL-PK-92021', time: '16:00', fare: 880, distanceKm: 9.0, status: 'completed', paymentMethod: 'jazzcash', paymentStatus: 'paid', pickupAddress: 'Wahdat Road, Lahore', destinationAddress: 'Johar Town Doctors Hospital, Lahore' },
      { rideId: 'r-20260920-22', rideCode: 'GL-PK-92022', time: '18:15', fare: 920, distanceKm: 9.8, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Johar Town, Lahore', destinationAddress: 'Model Town Link Road, Lahore' },
      { rideId: 'r-20260920-23', rideCode: 'GL-PK-92023', time: '20:30', fare: 900, distanceKm: 9.5, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid', pickupAddress: 'Model Town Link Road, Lahore', destinationAddress: 'Cantt RA Bazaar, Lahore' }
    ]
  },
  // Previous Year (2025-09-18 - exactly 1 year ago)
  {
    id: 'dds_prev_y_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: '2025-09-18',
    totalRides: 7,
    completedRides: 7,
    cancelledRides: 0,
    grossEarnings: 5600,
    commission: 840,
    netEarnings: 4760,
    cash: 3600,
    onlinePayments: 2000,
    adjustments: 0,
    finalPayable: 1160,
    status: 'Paid',
    calculatedAt: '2025-09-18 23:59:00'
  },
  {
    id: 'dds_prev_y_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: '2025-09-18',
    totalRides: 8,
    completedRides: 8,
    cancelledRides: 0,
    grossEarnings: 6800,
    commission: 1020,
    netEarnings: 5780,
    cash: 4300,
    onlinePayments: 2500,
    adjustments: 0,
    finalPayable: 1480,
    status: 'Paid',
    calculatedAt: '2025-09-18 23:59:00'
  },
  // Previous Year (2025-11-20)
  {
    id: 'dds_prev_y_03',
    driverId: 'drv_05',
    driverName: 'Bilal Qureshi',
    driverPlate: 'LHE-5501',
    city: 'Lahore',
    date: '2025-11-20',
    totalRides: 6,
    completedRides: 6,
    cancelledRides: 0,
    grossEarnings: 4900,
    commission: 735,
    netEarnings: 4165,
    cash: 3200,
    onlinePayments: 1700,
    adjustments: 0,
    finalPayable: 965,
    status: 'Paid',
    calculatedAt: '2025-11-20 23:59:00'
  },
  // Two Years Ago (2024-12-10)
  {
    id: 'dds_prev_y2_01',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    driverPlate: 'LEA-9214',
    city: 'Lahore',
    date: '2024-12-10',
    totalRides: 8,
    completedRides: 8,
    cancelledRides: 0,
    grossEarnings: 6800,
    commission: 1020,
    netEarnings: 5780,
    cash: 4500,
    onlinePayments: 2300,
    adjustments: 0,
    finalPayable: 1280,
    status: 'Paid',
    calculatedAt: '2024-12-10 23:59:00'
  },
  {
    id: 'dds_prev_y2_02',
    driverId: 'drv_02',
    driverName: 'Zubair Ahmed Qureshi',
    driverPlate: 'KHI-4019',
    city: 'Karachi',
    date: '2024-12-10',
    totalRides: 7,
    completedRides: 7,
    cancelledRides: 0,
    grossEarnings: 6100,
    commission: 915,
    netEarnings: 5185,
    cash: 4000,
    onlinePayments: 2100,
    adjustments: 0,
    finalPayable: 1185,
    status: 'Paid',
    calculatedAt: '2024-12-10 23:59:00'
  }
];

// Initial Late Pickup Incidents (with Tariq Mehmood having 4 today so the 5th triggers suspension!)
export const INITIAL_LATE_PICKUP_INCIDENTS: LatePickupIncident[] = [
  {
    id: 'lpi_01',
    rideId: 'ride_tariq_01',
    rideCode: 'GL-8812',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Ayesha Bibi',
    dateTime: `${getTodayStr()} 08:45 AM`,
    expectedPickupTime: '08:50 AM',
    actualArrivalTime: '09:02 AM',
    pickupDelayMin: 12,
    isQualifying: true,
    notes: 'Driver took an unannounced detour while heading to F-10 pickup.'
  },
  {
    id: 'lpi_02',
    rideId: 'ride_tariq_02',
    rideCode: 'GL-8840',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Hamza Farooq',
    dateTime: `${getTodayStr()} 11:10 AM`,
    expectedPickupTime: '11:18 AM',
    actualArrivalTime: '11:29 AM',
    pickupDelayMin: 11,
    isQualifying: true,
    notes: 'Driver stopped at fueling station without informing passenger.'
  },
  {
    id: 'lpi_03',
    rideId: 'ride_tariq_03',
    rideCode: 'GL-8871',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Usman Tariq',
    dateTime: `${getTodayStr()} 02:30 PM`,
    expectedPickupTime: '02:37 PM',
    actualArrivalTime: '02:51 PM',
    pickupDelayMin: 14,
    isQualifying: true,
    notes: 'Repeated slow response on Blue Area corridor.'
  },
  {
    id: 'lpi_04',
    rideId: 'ride_tariq_04',
    rideCode: 'GL-8902',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Sana Malik',
    dateTime: `${getTodayStr()} 04:55 PM`,
    expectedPickupTime: '05:01 PM',
    actualArrivalTime: '05:15 PM',
    pickupDelayMin: 14,
    isQualifying: true,
    notes: 'Passenger called dispatch reporting 14 min arrival delay in G-9.'
  },
  // An excluded case (e.g. severe road block / passenger requested delay)
  {
    id: 'lpi_excluded_01',
    rideId: 'ride_tariq_ex',
    rideCode: 'GL-8790',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    passengerName: 'Zainab Qazi',
    dateTime: `${getTodayStr()} 07:15 AM`,
    expectedPickupTime: '07:22 AM',
    actualArrivalTime: '07:38 AM',
    pickupDelayMin: 16,
    isQualifying: false,
    exclusionReason: 'Passenger requested driver wait at gate while gathering luggage',
    notes: 'Verified via passenger chat logs; not counted against driver.'
  },
  // Incidents for other drivers
  {
    id: 'lpi_05',
    rideId: 'ride_usman_01',
    rideCode: 'GL-9011',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    passengerName: 'Dr. Faisal Rehan',
    dateTime: `${getTodayStr()} 08:20 AM`,
    expectedPickupTime: '08:26 AM',
    actualArrivalTime: '08:36 AM',
    pickupDelayMin: 10,
    isQualifying: true,
    notes: 'Congestion on Canal Bank Road near Campus bridge.'
  }
];

// Initial Suspensions History
export const INITIAL_DRIVER_SUSPENSIONS: DriverSuspensionRecord[] = [
  {
    id: 'susp_hist_01',
    driverId: 'drv_05',
    driverName: 'Bilal Qureshi',
    driverPlate: 'LHE-5501',
    type: 'automatic',
    source: 'System — Late Pickup Monitor',
    reason: 'Temporary suspension — 5 qualifying late pickups recorded today.',
    reasonCategory: 'Repeated late pickup',
    ruleTriggered: 'RULE_AUTO_LATE_PICKUP_5_PER_DAY',
    incidentCount: 5,
    relatedRideIds: ['GL-7801', 'GL-7815', 'GL-7830', 'GL-7860', 'GL-7890'],
    relatedComplaintIds: [],
    durationHours: 12,
    startTime: `${getPastDateStr(4)} 18:30:00`,
    expiryTime: `${getPastDateStr(4)} 06:30:00`,
    status: 'expired',
    notes: 'Automatic 12-hour cooling period served. Driver account reinstated automatically after expiry.'
  },
  {
    id: 'susp_hist_02',
    driverId: 'drv_07',
    driverName: 'Rashid Minhas',
    driverPlate: 'PEW-3301',
    type: 'manual',
    source: 'Admin: superadmin@golife.pk',
    reason: 'Multiple passenger complaints regarding rude behavior and air conditioner refusal.',
    reasonCategory: 'Passenger complaint',
    relatedRideIds: ['GL-7102', 'GL-7155'],
    relatedComplaintIds: ['cmp_04'],
    durationHours: 24,
    startTime: `${getPastDateStr(2)} 14:00:00`,
    expiryTime: `${getPastDateStr(1)} 14:00:00`,
    status: 'expired',
    notes: 'Driver acknowledged policy and completed behavioral counseling module in GoLife Academy.'
  }
];

// Initial Driver Warnings
export const INITIAL_DRIVER_WARNINGS: DriverWarningRecord[] = [
  {
    id: 'wrn_01',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood',
    date: `${getTodayStr()} 05:20 PM`,
    reason: 'High pickup latency threshold reached (4/5 incidents today). Immediate warning issued.',
    issuedBy: 'System Auto-Guardian',
    relatedRideId: 'GL-8902',
    notes: 'Driver notified via push notification that a 5th late pickup will trigger automatic 12-hour suspension.',
    acknowledged: true
  },
  {
    id: 'wrn_02',
    driverId: 'drv_01',
    driverName: 'Muhammad Usman Khan',
    date: `${getPastDateStr(5)} 11:30 AM`,
    reason: 'Off-route driving without passenger agreement.',
    issuedBy: 'Admin: support@golife.pk',
    relatedComplaintId: 'cmp_02',
    notes: 'Passenger reported unexpected route to avoid ring road toll.',
    acknowledged: true
  }
];

// Calculation helper for driver daily earnings using Central Commission Engine
export function calculateDriverDailyEarnings(
  driver: Driver,
  date: string,
  rides: Ride[] = [],
  rules?: CommissionRule[],
  overrides?: DriverCommissionOverride[]
): DriverDailySummary {
  // Filter rides completed on this date for this driver
  const driverRides = (rides || []).filter((r) => {
    if (r.driverId !== driver.id) return false;
    const rideDate = r.startTime ? r.startTime.split(' ')[0] : '';
    // Support matching both YYYY-MM-DD or partial match
    return rideDate === date || r.startTime?.includes(date);
  });

  const completedRides = driverRides.filter((r) => r.status === 'completed');
  const cancelledRides = driverRides.filter((r) => r.status === 'cancelled');

  let gross = 0;
  let commission = 0;
  let net = 0;
  let cash = 0;
  let online = 0;

  const rideDetails: DriverEarningsRideDetail[] = driverRides.map((r) => {
    const isCompleted = r.status === 'completed';
    const fare = isCompleted ? (r.fare || 0) : 0;
    let comm = 0;
    if (isCompleted) {
      if (r.commission !== undefined && r.commission > 0) {
        comm = r.commission;
      } else {
        const commCalc = calculateCommissionForRide({
          rideId: r.id,
          rideCode: r.rideCode || `RIDE-${r.id}`,
          driverId: driver.id,
          driverName: driver.name,
          passengerId: r.passengerId || 'p_demo',
          passengerName: r.passengerName || 'Passenger',
          city: driver.city,
          serviceCategory: r.category || 'ride',
          distanceKm: r.distanceKm || 6.0,
          grossFare: fare,
          rules: rules || [],
          overrides: overrides || []
        });
        comm = commCalc.baseCommissionPKR;
      }
    }
    const earned = fare - comm;

    gross += fare;
    commission += comm;
    net += earned;

    if (isCompleted) {
      if (r.paymentMethod === 'cash') {
        cash += fare;
      } else {
        online += fare;
      }
    }

    return {
      rideId: r.id,
      rideCode: r.rideCode,
      time: r.startTime,
      pickupAddress: r.pickup.address,
      destinationAddress: r.destination.address,
      fare,
      commission: comm,
      driverEarned: earned,
      paymentMethod: r.paymentMethod,
      paymentStatus: r.paymentStatus,
      status: r.status,
      delayMin: r.durationElapsedMin ? Math.max(0, r.durationElapsedMin - r.durationMin) : 0
    };
  });

  // If driver had no rides directly recorded today in mock data, provide default baseline
  if (driverRides.length === 0) {
    gross = Math.round(driver.earnings * 0.08);
    const commCalc = calculateCommissionForRide({
      rideId: `sim_${driver.id}`,
      rideCode: 'SIM-RIDE',
      driverId: driver.id,
      driverName: driver.name,
      passengerId: 'p_sim',
      passengerName: 'Passenger',
      city: driver.city,
      serviceCategory: 'ride',
      distanceKm: 8.0,
      grossFare: gross,
      rules: rules || [],
      overrides: overrides || []
    });
    commission = commCalc.baseCommissionPKR || Math.round(gross * 0.12);
    net = gross - commission;
    cash = Math.round(gross * 0.6);
    online = gross - cash;
  }

  const adjustments = 0;
  const finalPayable = net - cash; // If negative, driver collected more cash than earned net -> owes commission; if positive -> platform pays driver

  return {
    id: `dds_${driver.id}_${date.replace(/-/g, '')}`,
    driverId: driver.id,
    driverName: driver.name,
    driverPlate: driver.vehicle.plate,
    city: driver.city,
    date,
    totalRides: driverRides.length || Math.floor(driver.totalRides * 0.05),
    completedRides: completedRides.length || Math.floor(driver.totalRides * 0.045),
    cancelledRides: cancelledRides.length,
    grossEarnings: gross,
    commission,
    netEarnings: net,
    cash,
    onlinePayments: online,
    adjustments,
    finalPayable,
    status: 'Calculated',
    calculatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    rides: rideDetails
  };
}

// Date Range Filter Helper
export function filterSummariesByDateRange(
  summaries: DriverDailySummary[] = [],
  filter: EarningsDateFilter,
  customStart?: string,
  customEnd?: string
): DriverDailySummary[] {
  const todayStr = getTodayStr();
  const yestStr = getPastDateStr(1);
  const dbYestStr = getPastDateStr(2);
  const sevenDaysAgo = getPastDateStr(7);
  const thirtyDaysAgo = getPastDateStr(30);

  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYearMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = String(now.getFullYear());
  const prevYear = String(now.getFullYear() - 1);

  return (summaries || []).filter((s) => {
    if (!s.date) return false;
    switch (filter) {
      case 'today':
        return s.date === todayStr;
      case 'yesterday':
        return s.date === yestStr;
      case 'day_before_yesterday':
        return s.date === dbYestStr;
      case 'last_7_days':
        return s.date >= sevenDaysAgo && s.date <= todayStr;
      case 'last_30_days':
        return s.date >= thirtyDaysAgo && s.date <= todayStr;
      case 'this_month':
        return s.date.startsWith(currentYearMonth);
      case 'previous_month':
        return s.date.startsWith(prevYearMonth);
      case 'this_year':
        return s.date.startsWith(currentYear);
      case 'previous_year':
        return s.date.startsWith(prevYear);
      case 'custom':
        if (customStart && customEnd) {
          return s.date >= customStart && s.date <= customEnd;
        }
        return true;
      default:
        return true;
    }
  });
}
