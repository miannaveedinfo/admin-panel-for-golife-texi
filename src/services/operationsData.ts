import { OperationsAlert, Ride, RideTimelineStep } from '../types';

export const INITIAL_OPERATIONS_ALERTS: OperationsAlert[] = [
  {
    id: 'alt-101',
    code: 'ALT-PK-901',
    type: 'emergency_request',
    title: 'SOS Beacon Activated on Shahrah-e-Faisal',
    titleUrdu: 'شاہراہ فیصل پر ایمرجنسی ایس او ایس بٹن دبایا گیا',
    priority: 'critical',
    status: 'open',
    city: 'Karachi',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    driverId: 'd-202',
    driverName: 'Khurram Shehzad',
    passengerId: 'p-102',
    passengerName: 'Hamza Shabbir',
    vehiclePlate: 'KHI-21-9941 (Corolla GLi)',
    description: 'In-app SOS pressed by passenger. Real-time telemetry shows vehicle moving along Marine Drive towards FTC at 54 km/h.',
    location: {
      lat: 24.8315,
      lng: 67.0452,
      address: 'Shahrah-e-Faisal near FTC Flyover, Karachi'
    },
    assignedAdmin: 'Major (R) Bilal Tariq',
    createdAt: '2026-09-12 18:14 PKT',
    notes: [
      {
        id: 'n-1',
        author: 'Major (R) Bilal Tariq',
        text: 'Automated 15 Police liaison beacon dispatched. Dialing passenger and driver simultaneously.',
        timestamp: '2026-09-12 18:15 PKT'
      }
    ]
  },
  {
    id: 'alt-102',
    code: 'ALT-PK-902',
    type: 'safety_report',
    title: 'Passenger Safety Report: Route Deviation Alert',
    titleUrdu: 'مسافر کی رپورٹ: روٹ میں غیر معمولی تبدیلی',
    priority: 'high',
    status: 'investigating',
    city: 'Lahore',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    passengerId: 'p-101',
    passengerName: 'Zainab Fatima',
    vehiclePlate: 'LEB-22-8419 (Suzuki Alto)',
    description: 'Vehicle diverted away from Walton Road main route onto Bhatta Chowk bypass. GPS threshold triggered +800m offset.',
    location: {
      lat: 31.465,
      lng: 74.372,
      address: 'Walton Road Bypass link, Lahore'
    },
    assignedAdmin: 'Saad Rafiq',
    createdAt: '2026-09-12 18:11 PKT',
    notes: [
      {
        id: 'n-2',
        author: 'Saad Rafiq',
        text: 'Driver contacted. Driver explained Walton Road main artery had police barricade due to VVIP motorcade. Rejoining Ring Road in 2 mins.',
        timestamp: '2026-09-12 18:13 PKT'
      }
    ]
  },
  {
    id: 'alt-103',
    code: 'ALT-PK-903',
    type: 'long_waiting_time',
    title: 'Excessive Waiting Time: No Driver Match (>14 mins)',
    titleUrdu: 'ضرورت سے زیادہ انتظار: کوئی ڈرائیور نہ ملا (14 منٹ سے زائد)',
    priority: 'medium',
    status: 'open',
    city: 'Peshawar',
    rideId: 'r-406',
    rideCode: 'GL-PK-89104',
    passengerId: 'p-104',
    passengerName: 'Nadia Gul',
    description: 'Passenger in Hayatabad Phase 4 waiting for GoRide sedan. Initial bid Rs. 540 broadcasted to 6 drivers with 0 accepts.',
    location: {
      lat: 33.9872,
      lng: 71.4398,
      address: 'Hayatabad Phase 4, Peshawar'
    },
    assignedAdmin: 'Unassigned',
    createdAt: '2026-09-12 18:02 PKT',
    notes: [
      {
        id: 'n-3',
        author: 'System Auto-Monitor',
        text: 'Algorithm recommends manual admin dispatch or applying +15% regional incentive surge to attract nearby drivers.',
        timestamp: '2026-09-12 18:10 PKT'
      }
    ]
  },
  {
    id: 'alt-104',
    code: 'ALT-PK-904',
    type: 'driver_offline_on_ride',
    title: 'Driver Signal Lost During Active In-Progress Trip',
    titleUrdu: 'سفر کے دوران ڈرائیور کا انٹرنیٹ / لوکیشن سگنل منقطع',
    priority: 'high',
    status: 'investigating',
    city: 'Rawalpindi',
    rideId: 'r-403',
    rideCode: 'GL-PK-89098',
    driverId: 'd-203',
    driverName: 'Abdul Rehman Gujjar',
    vehiclePlate: 'RWP-23-4412 (Honda CD-70)',
    description: 'Driver GPS heartbeat stopped updating 6 minutes ago near Faizabad interchange. Passenger phone is reachable.',
    location: {
      lat: 33.654,
      lng: 73.085,
      address: 'Faizabad Interchange, Rawalpindi / Islamabad border'
    },
    assignedAdmin: 'Tariq Mehmood',
    createdAt: '2026-09-12 17:55 PKT',
    notes: [
      {
        id: 'n-4',
        author: 'Tariq Mehmood',
        text: 'Sent automated SMS ping to driver number. Network provider shows cell tower handover in progress.',
        timestamp: '2026-09-12 18:01 PKT'
      }
    ]
  },
  {
    id: 'alt-105',
    code: 'ALT-PK-905',
    type: 'repeated_cancellation',
    title: 'High Cancellation Spike by Driver (4 cancels in 1 hr)',
    titleUrdu: 'ڈرائیور کی جانب سے مسلسل 4 سواریاں منسوخ کی گئیں',
    priority: 'medium',
    status: 'open',
    city: 'Lahore',
    driverId: 'd-204',
    driverName: 'Nawazish Ali (GoAuto)',
    vehiclePlate: 'LER-23-1902',
    description: 'Driver Nawazish Ali accepted and subsequently cancelled 4 customer dispatch requests near Lahore Railway Station within 60 minutes.',
    location: {
      lat: 31.5768,
      lng: 74.3371,
      address: 'Lahore Railway Station, Empress Road'
    },
    createdAt: '2026-09-12 16:40 PKT',
    notes: []
  },
  {
    id: 'alt-106',
    code: 'ALT-PK-906',
    type: 'payment_failure',
    title: 'Digital Gateway Payment Timeout (JazzCash / EasyPaisa)',
    titleUrdu: 'ڈیجیٹل والٹ سے کرایہ کٹنے میں ناکامی (جاز کیش / ایزی پیسہ)',
    priority: 'low',
    status: 'resolved',
    city: 'Lahore',
    rideId: 'r-404',
    rideCode: 'GL-PK-89092',
    passengerId: 'p-106',
    passengerName: 'Maha Javed',
    description: 'API gateway returned 504 Gateway Timeout during auto-deduction of Rs. 750 for completed trip.',
    createdAt: '2026-09-12 15:40 PKT',
    resolvedAt: '2026-09-12 15:52 PKT',
    resolvedBy: 'finance@golife.pk',
    resolutionNotes: 'Customer switched to manual EasyPaisa QR code scan and payment settled successfully.',
    notes: []
  },
  {
    id: 'alt-107',
    code: 'ALT-PK-907',
    type: 'suspicious_activity',
    title: 'Vehicle Stationary on Motorway link for >15 mins',
    titleUrdu: 'موٹروے پر گاڑی 15 منٹ سے زائد دیر ساکت کھڑی ہے',
    priority: 'high',
    status: 'open',
    city: 'Lahore',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    description: 'Telemetry indicates 0 km/h velocity for 16 consecutive minutes with passenger onboard.',
    location: {
      lat: 31.472,
      lng: 74.385,
      address: 'Near Ring Road DHA Phase 5 Exit'
    },
    createdAt: '2026-09-12 18:16 PKT',
    notes: []
  }
];

export const generateRideTimeline = (ride: Ride): RideTimelineStep[] => {
  const isSearching = ride.status === 'searching';
  const isAssigned = ride.status === 'driver_assigned';
  const isArrived = ride.status === 'arrived';
  const isInProgress = ride.status === 'in_progress';
  const isCompleted = ride.status === 'completed';
  const isCancelled = ride.status === 'cancelled';
  const isDisputed = ride.status === 'disputed';

  const startTime = ride.startTime || '18:00 PKT';
  const startParts = (typeof startTime === 'string' ? startTime : '18:00 PKT').split(':');
  const baseMinutes = parseInt(startParts[1]?.slice(0, 2) || '00', 10);
  const formatStepTime = (offset: number) => {
    const mins = (baseMinutes + offset) % 60;
    const hour = (parseInt(startParts[0] || '18', 10) + Math.floor((baseMinutes + offset) / 60)) % 24;
    return `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} PKT`;
  };

  const pickupArea = ride.pickup?.address ? ride.pickup.address.split(',')[0] : 'Pickup Location';
  const destArea = ride.destination?.address ? ride.destination.address.split(',')[0] : 'Destination Location';

  return [
    {
      step: 1,
      key: 'request_created',
      title: 'Ride Request Created',
      titleUrdu: 'سواری کی درخواست موصول ہوئی',
      timestamp: formatStepTime(0),
      status: 'completed',
      detail: `Passenger ${ride.passengerName} requested ${ride.category} from ${pickupArea} to ${destArea}. Bid fare: Rs. ${ride.fare}.`
    },
    {
      step: 2,
      key: 'driver_matching',
      title: 'Nearby Driver Matching',
      titleUrdu: 'قریبی ڈرائیورز کی تلاش',
      timestamp: formatStepTime(1),
      status: isSearching ? 'in_progress' : 'completed',
      detail: isSearching
        ? `Broadcast sent to 8 nearby ${ride.category} drivers within 4.5km radius. Awaiting acceptance.`
        : `Algorithm matched nearby fleet drivers in sector.`
    },
    {
      step: 3,
      key: 'offer_received',
      title: 'Driver Bids & Offers Received',
      titleUrdu: 'ڈرائیور کی آفرز موصول ہوئیں',
      timestamp: isSearching ? undefined : formatStepTime(2),
      status: isSearching ? 'pending' : 'completed',
      detail: isSearching
        ? 'Awaiting driver responses...'
        : `Received offers from verified ${ride.category} drivers.`
    },
    {
      step: 4,
      key: 'driver_accepted',
      title: 'Driver Accepted & Dispatched',
      titleUrdu: 'ڈرائیور نے سواری قبول کر لی',
      timestamp: isSearching ? undefined : formatStepTime(3),
      status: isSearching ? 'pending' : isAssigned || isArrived || isInProgress || isCompleted || isCancelled ? 'completed' : 'pending',
      detail: ride.driverName
        ? `Driver ${ride.driverName} (${ride.driverPlate || 'Fleet Vehicle'}) confirmed assignment. Direct route locked.`
        : 'Pending assignment.'
    },
    {
      step: 5,
      key: 'going_to_pickup',
      title: 'Driver En Route to Pickup',
      titleUrdu: 'ڈرائیور پک اپ کی طرف روانہ',
      timestamp: isSearching ? undefined : formatStepTime(4),
      status: isSearching
        ? 'pending'
        : isAssigned
        ? 'in_progress'
        : isArrived || isInProgress || isCompleted
        ? 'completed'
        : isCancelled
        ? 'pending'
        : 'pending',
      detail: isAssigned
        ? `Driver is navigating to ${pickupArea}. Estimated arrival: 4 mins.`
        : 'Completed transit to pickup.'
    },
    {
      step: 6,
      key: 'driver_arrived',
      title: 'Driver Arrived at Pickup Location',
      titleUrdu: 'ڈرائیور پک اپ مقام پر پہنچ گیا',
      timestamp: isSearching || isAssigned ? undefined : formatStepTime(7),
      status: isArrived
        ? 'in_progress'
        : isInProgress || isCompleted
        ? 'completed'
        : 'pending',
      detail: isArrived
        ? 'Vehicle arrived at customer gate. 5-minute complimentary waiting timer running.'
        : isInProgress || isCompleted
        ? 'Passenger boarded at pickup point.'
        : 'Waiting for driver arrival.'
    },
    {
      step: 7,
      key: 'ride_started',
      title: 'Trip Started & In Transit',
      titleUrdu: 'سفر کا آغاز ہو گیا',
      timestamp: isInProgress || isCompleted ? formatStepTime(9) : undefined,
      status: isInProgress ? 'in_progress' : isCompleted ? 'completed' : 'pending',
      detail: isInProgress
        ? `OTP verified. Live digital meter active. Current speed: 42 km/h heading to ${destArea}.`
        : isCompleted
        ? 'Trip executed along primary route.'
        : 'Pending boarding verification.'
    },
    {
      step: 8,
      key: 'ride_completed',
      title: 'Trip Completed at Destination',
      titleUrdu: 'منزل پر پہنچ کر سفر مکمل',
      timestamp: isCompleted ? ride.endTime || formatStepTime(30) : undefined,
      status: isCompleted ? 'completed' : 'pending',
      detail: isCompleted
        ? `Passenger safely dropped off at ${destArea}. Total distance: ${ride.distanceKm} km.`
        : 'Trip currently in transit.'
    },
    {
      step: 9,
      key: 'payment_settled',
      title: 'Payment & Commission Settled',
      titleUrdu: 'کرایہ اور کمیشن کی ادائیگی',
      timestamp: isCompleted ? ride.endTime || formatStepTime(31) : undefined,
      status: isCompleted ? 'completed' : isCancelled ? 'pending' : 'pending',
      detail: isCompleted
        ? `Rs. ${ride.fare} received via ${ride.paymentMethod.toUpperCase()}. GoLife platform fee: Rs. ${ride.commission} (Net Driver: Rs. ${ride.driverEarnings}).`
        : `Payment method: ${ride.paymentMethod.toUpperCase()} (Status: ${ride.paymentStatus}).`
    },
    {
      step: 10,
      key: 'rating_feedback',
      title: 'Mutual Rating & Feedback Recorded',
      titleUrdu: 'مسافر اور ڈرائیور کی باہمی ریٹنگ',
      timestamp: isCompleted ? formatStepTime(33) : undefined,
      status: isCompleted ? 'completed' : 'pending',
      detail: isCompleted
        ? `Passenger rated driver 5.0 ★. Driver rated passenger 5.0 ★. Trip archived successfully.`
        : 'Awaiting trip completion for feedback.'
    }
  ];
};
