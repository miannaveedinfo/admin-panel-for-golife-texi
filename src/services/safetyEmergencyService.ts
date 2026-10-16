import {
  SafetyIncident,
  SafetyIncidentCategory,
  SafetyPriority,
  SafetyEventStatus,
  SafetyLocationFreshness,
  SafetyResponseStatus,
  SafetyEmergencyContactConfig,
  SafetyResponseSlaConfig,
  SafetyResponseTimelineEvent,
  SafetyEvidenceItem,
  SafetyLocationBreadcrumb
} from '../types';

export const INCIDENT_CATEGORIES_CONFIG = [
  { id: 'accident', label: 'Accident / Collision', labelUrdu: 'حادثہ / ٹکراؤ', icon: 'AlertTriangle', defaultPriority: 'high' as SafetyPriority },
  { id: 'unsafe_driving', label: 'Unsafe / Reckless Driving', labelUrdu: 'غیر محفوظ / تیز ڈرائیونگ', icon: 'Gauge', defaultPriority: 'normal' as SafetyPriority },
  { id: 'harassment', label: 'Harassment & Inappropriate Conduct', labelUrdu: 'ہراسانی / غیر مناسب رویہ', icon: 'UserX', defaultPriority: 'high' as SafetyPriority },
  { id: 'threat', label: 'Threat & Intimidation', labelUrdu: 'دھمکی / خوفزدہ کرنا', icon: 'ShieldAlert', defaultPriority: 'urgent' as SafetyPriority },
  { id: 'theft', label: 'Theft / Robbery Alert', labelUrdu: 'چوری / ڈکیتی کی کوشش', icon: 'AlertOctagon', defaultPriority: 'critical' as SafetyPriority },
  { id: 'vehicle_breakdown', label: 'Vehicle Breakdown & Mechanical Fault', labelUrdu: 'گاڑی کی خرابی', icon: 'Wrench', defaultPriority: 'low' as SafetyPriority },
  { id: 'vehicle_safety_issue', label: 'Vehicle Safety & Tire / Brake Hazard', labelUrdu: 'گاڑی کی خامی / ٹائر / بریک کا مسئلہ', icon: 'Car', defaultPriority: 'normal' as SafetyPriority },
  { id: 'passenger_safety_issue', label: 'Passenger Welfare / Safety Hazard', labelUrdu: 'مسافر کی حفاظت کا مسئلہ', icon: 'Users', defaultPriority: 'high' as SafetyPriority },
  { id: 'driver_safety_issue', label: 'Driver Safety / Physical Threat', labelUrdu: 'ڈرائیور کی حفاظت کا مسئلہ', icon: 'Shield', defaultPriority: 'urgent' as SafetyPriority },
  { id: 'medical_emergency', label: 'Medical Emergency on Trip', labelUrdu: 'طبی ایمرجنسی / بے ہوشی', icon: 'HeartPulse', defaultPriority: 'critical' as SafetyPriority },
  { id: 'route_issue', label: 'Severe Route Divergence / Detour', labelUrdu: 'راستے سے شدید انحراف', icon: 'Navigation', defaultPriority: 'normal' as SafetyPriority },
  { id: 'suspicious_activity', label: 'Suspicious Activity / Location Anomaly', labelUrdu: 'مشکوک سرگرمی', icon: 'Eye', defaultPriority: 'high' as SafetyPriority },
  { id: 'other', label: 'Other Safety Incident', labelUrdu: 'دیگر حفاظتی واقعہ', icon: 'FileText', defaultPriority: 'normal' as SafetyPriority }
];

export const DEFAULT_SAFETY_SLA_CONFIG: SafetyResponseSlaConfig = {
  sosAcknowledgementSeconds: 60, // 1 minute target for SOS
  sosFirstResponseSeconds: 180, // 3 minutes target for first contact
  sosResolutionMinutes: 45, // 45 minutes target for full resolution
  standardAcknowledgementMinutes: 10,
  standardResolutionHours: 12
};

export const DEFAULT_EMERGENCY_CONTACTS: SafetyEmergencyContactConfig[] = [
  {
    id: 'emg-lhe-01',
    city: 'Lahore',
    serviceName: 'Punjab Safe City Authority (PSCA 15)',
    contactNumber: '15',
    serviceType: 'police',
    active: true,
    notes: 'Direct feed integration with Qurban Lines Command & Control Center.'
  },
  {
    id: 'emg-lhe-02',
    city: 'Lahore',
    serviceName: 'Rescue 1122 Punjab Emergency',
    contactNumber: '1122',
    serviceType: 'ambulance',
    active: true,
    notes: 'Provincial ambulance & firefighting fleet dispatch.'
  },
  {
    id: 'emg-lhe-03',
    city: 'Lahore',
    serviceName: 'GoLife Rapid Dispatch Unit (Lahore Hub)',
    contactNumber: '+92 42 3891 0001',
    serviceType: 'internal_dispatch',
    active: true,
    notes: 'Patrol bike units stationed at Gulberg, DHA, and Model Town.'
  },
  {
    id: 'emg-khi-01',
    city: 'Karachi',
    serviceName: 'Sindh Police Madadgar 15',
    contactNumber: '15',
    serviceType: 'police',
    active: true,
    notes: 'Karachi central police dispatch.'
  },
  {
    id: 'emg-khi-02',
    city: 'Karachi',
    serviceName: 'Edhi Foundation Central Ambulance',
    contactNumber: '115',
    serviceType: 'ambulance',
    active: true,
    notes: 'Fleet covering Saddar, Clifton, Shahrah-e-Faisal and Gulshan.'
  },
  {
    id: 'emg-isb-01',
    city: 'Islamabad',
    serviceName: 'Islamabad Safe City Police Control 15',
    contactNumber: '15',
    serviceType: 'police',
    active: true,
    notes: 'Direct tie-in with Islamabad Capital Police cameras.'
  },
  {
    id: 'emg-rwp-01',
    city: 'Rawalpindi',
    serviceName: 'Rawalpindi Police Emergency 15',
    contactNumber: '15',
    serviceType: 'police',
    active: true,
    notes: 'Kachehri Chowk Central Operations Room.'
  },
  {
    id: 'emg-pew-01',
    city: 'Peshawar',
    serviceName: 'Khyber Pakhtunkhwa Police Emergency',
    contactNumber: '15',
    serviceType: 'police',
    active: true,
    notes: 'Peshawar city police control room.'
  }
];

export const DEMO_SAFETY_INCIDENTS: SafetyIncident[] = [
  {
    id: 'sft-sos-01',
    incidentCode: 'SOS-PK-987',
    rideId: 'r-402',
    rideCode: 'GL-PK-89103',
    reportedBy: 'passenger',
    reporterName: 'Hamza Shabbir',
    reporterPhone: '+92 321 4591028',
    passengerId: 'p-102',
    driverId: 'd-202',
    driverName: 'Khurram Shehzad',
    vehiclePlate: 'KHI-21-9941',
    vehicleModel: 'Toyota Corolla Altis (White)',
    city: 'Karachi',
    type: 'theft',
    category: 'theft',
    severity: 'critical',
    priority: 'critical',
    isEmergencySos: true,
    location: {
      lat: 24.8420,
      lng: 67.0450,
      address: 'Shahrah-e-Faisal near Baloch Colony Flyover, Karachi',
      freshness: 'LIVE'
    },
    pickupLocation: {
      address: 'Dolmen Mall, Clifton, Karachi',
      lat: 24.8130,
      lng: 67.0310
    },
    destinationLocation: {
      address: 'Jinnah International Airport Terminal 1, Karachi',
      lat: 24.9065,
      lng: 67.1608
    },
    rideStatus: 'in_progress',
    status: 'active',
    triggeredAt: '2026-09-13 19:42 PKT',
    emergencyTime: '2026-09-13 19:42 PKT',
    notes: 'Emergency SOS button triggered by passenger. Live telemetry indicates vehicle has deviated 1.4km into service road and stopped stationary for 90 seconds.',
    description: 'Passenger activated in-app SOS alarm during trip towards Airport. Repeated phone calls to passenger go straight to ringing without answer. Driver phone is active.',
    assignedAdmin: 'Sarah Tariq',
    assignedTeam: 'safety',
    responseStatus: 'within_target',
    caseId: 'case-sft-01',
    evidence: [
      {
        id: 'ev-01',
        title: 'Real-time GPS Divergence Telemetry',
        type: 'ride_telemetry',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
        uploadedBy: 'System Telemetry Engine',
        uploadedAt: '2026-09-13 19:42 PKT',
        fileSize: '1.2 MB',
        notes: 'Divergence from recommended Karsaz flyover corridor.'
      }
    ],
    responseTimeline: [
      {
        id: 'tl-1',
        timestamp: '2026-09-13 19:42 PKT',
        actor: 'Passenger (Hamza Shabbir)',
        actorRole: 'passenger',
        action: 'Event Created',
        note: 'Triggered in-app Red SOS button on ride #GL-PK-89103'
      },
      {
        id: 'tl-2',
        timestamp: '2026-09-13 19:42:15 PKT',
        actor: 'GoLife Safety Sentinel',
        actorRole: 'system',
        action: 'Alert Received',
        note: 'Alert routed to Sindh Safety Desk with Critical Priority flag'
      },
      {
        id: 'tl-3',
        timestamp: '2026-09-13 19:43 PKT',
        actor: 'Sarah Tariq',
        actorRole: 'admin',
        action: 'Admin Acknowledged',
        note: 'Acknowledged emergency alert. Reviewing live GPS location and vehicle status.'
      },
      {
        id: 'tl-4',
        timestamp: '2026-09-13 19:43:30 PKT',
        actor: 'Sarah Tariq',
        actorRole: 'admin',
        action: 'Assigned',
        note: 'Assigned to Karachi Rapid Response Team and contacted driver phone.'
      }
    ],
    metrics: {
      alertTime: '2026-09-13 19:42 PKT',
      acknowledgedAt: '2026-09-13 19:43 PKT',
      acknowledgementDelaySeconds: 45,
      firstResponseAt: '2026-09-13 19:43:30 PKT',
      firstResponseDelaySeconds: 90,
      slaStatus: 'within_target'
    },
    locationHistory: [
      {
        timestamp: '19:40:00',
        lat: 24.8380,
        lng: 67.0410,
        address: 'Shahrah-e-Faisal Main Corridor',
        freshness: 'LIVE',
        speed: 48,
        rideState: 'in_progress',
        eventTrigger: 'Normal GPS Ping'
      },
      {
        timestamp: '19:41:30',
        lat: 24.8405,
        lng: 67.0435,
        address: 'Shahrah-e-Faisal Exit onto Service Lane',
        freshness: 'LIVE',
        speed: 18,
        rideState: 'in_progress',
        eventTrigger: 'Unexpected Turn'
      },
      {
        timestamp: '19:42:00',
        lat: 24.8420,
        lng: 67.0450,
        address: 'Baloch Colony Service Road Underpass',
        freshness: 'LIVE',
        speed: 0,
        rideState: 'in_progress',
        eventTrigger: 'SOS Button Triggered'
      }
    ],
    driverLocation: { lat: 24.8420, lng: 67.0450, freshness: 'LIVE' },
    passengerLocation: { lat: 24.8421, lng: 67.0451, freshness: 'LIVE' },
    emergencyContactAttempts: [
      {
        contactType: 'passenger',
        timestamp: '19:43 PKT',
        adminName: 'Sarah Tariq',
        channel: 'phone_call',
        status: 'unanswered',
        notes: 'Ringing continuously, no voice response.'
      },
      {
        contactType: 'driver',
        timestamp: '19:44 PKT',
        adminName: 'Sarah Tariq',
        channel: 'in_app_voip',
        status: 'connected',
        notes: 'Driver answered; reports tyre puncture on service road, assisting passenger to arrange secondary car.'
      }
    ],
    aiAssistance: {
      summary: 'Passenger triggered SOS after vehicle entered unpaved service lane and halted. Driver confirms mechanical puncture. Passenger panic likely due to dark road.',
      recommendedPriority: 'critical',
      recommendedCategory: 'vehicle_breakdown',
      recommendedNextSteps: [
        'Place follow-up call to passenger to confirm physical safety and relieve anxiety.',
        'Dispatch nearby GoMini backup ride to transfer passenger to airport immediately.',
        'Keep case active until passenger boards replacement ride.'
      ],
      patternNotes: 'Driver Khurram has 0 previous safety violations across 1,420 trips.',
      riskScore: 68
    }
  },
  {
    id: 'sft-acc-02',
    incidentCode: 'SFT-PK-102',
    rideId: 'r-403',
    rideCode: 'GL-PK-89105',
    reportedBy: 'driver',
    reporterName: 'Usman Tariq',
    reporterPhone: '+92 333 5518290',
    driverId: 'd-203',
    driverName: 'Usman Tariq',
    passengerId: 'p-103',
    vehiclePlate: 'ICT-19-2041',
    vehicleModel: 'Honda City (Silver)',
    city: 'Islamabad',
    type: 'accident',
    category: 'accident',
    severity: 'high',
    priority: 'high',
    location: {
      lat: 33.6938,
      lng: 73.0169,
      address: 'F-10 Roundabout near Silver Oaks, Islamabad',
      freshness: 'RECENT'
    },
    pickupLocation: {
      address: 'E-11/2 Markaz, Islamabad',
      lat: 33.7020,
      lng: 72.9810
    },
    destinationLocation: {
      address: 'Blue Area Jinnah Avenue, Islamabad',
      lat: 33.7120,
      lng: 73.0650
    },
    rideStatus: 'disputed',
    status: 'under_investigation',
    triggeredAt: '2026-09-13 18:30 PKT',
    notes: 'Low-speed rear-end collision at traffic circle. Both parties safe, no injuries reported. Car rear bumper cracked.',
    description: 'Driver reported being hit from behind by a third-party motorcycle at low speed. Passenger received minor shock, ride ended safely.',
    assignedAdmin: 'Major Bilal (R)',
    assignedTeam: 'safety',
    responseStatus: 'within_target',
    caseId: 'case-sft-02',
    evidence: [
      {
        id: 'ev-02',
        title: 'Vehicle Bumper Scratch Photo',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
        uploadedBy: 'Driver App (Usman Tariq)',
        uploadedAt: '2026-09-13 18:34 PKT',
        fileSize: '2.4 MB',
        notes: 'Submitted via Driver Safety reporting portal.'
      }
    ],
    responseTimeline: [
      {
        id: 'tl-11',
        timestamp: '2026-09-13 18:30 PKT',
        actor: 'Driver (Usman Tariq)',
        actorRole: 'driver',
        action: 'Event Created',
        note: 'Reported road collision through Driver App safety tool'
      },
      {
        id: 'tl-12',
        timestamp: '2026-09-13 18:32 PKT',
        actor: 'Major Bilal (R)',
        actorRole: 'admin',
        action: 'Admin Acknowledged',
        note: 'Contacted driver and passenger. Confirmed 0 injuries.'
      },
      {
        id: 'tl-13',
        timestamp: '2026-09-13 18:40 PKT',
        actor: 'Major Bilal (R)',
        actorRole: 'admin',
        action: 'Investigation',
        note: 'Assigned insurance surveyor claim ticket #INS-PK-9812'
      }
    ],
    metrics: {
      alertTime: '2026-09-13 18:30 PKT',
      acknowledgedAt: '2026-09-13 18:32 PKT',
      acknowledgementDelaySeconds: 120,
      firstResponseAt: '2026-09-13 18:32 PKT',
      firstResponseDelaySeconds: 120,
      slaStatus: 'within_target'
    },
    aiAssistance: {
      summary: 'Non-injury fender bender at F-10 round-about. Passenger confirmed safe and unharmed. Damage limited to rear bumper cover.',
      recommendedPriority: 'high',
      recommendedCategory: 'accident',
      recommendedNextSteps: [
        'Verify passenger ride cancellation waiver so no fee is charged.',
        'Issue insurance claim voucher to driver.',
        'Close safety case upon surveyor receipt upload.'
      ],
      riskScore: 34
    }
  },
  {
    id: 'sft-uns-03',
    incidentCode: 'SFT-PK-103',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    reportedBy: 'passenger',
    reporterName: 'Zainab Fatima',
    reporterPhone: '+92 300 8472911',
    passengerId: 'p-101',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    vehiclePlate: 'LEB-22-8419',
    vehicleModel: 'Suzuki Alto VXR (Grey)',
    city: 'Lahore',
    type: 'unsafe_driving',
    category: 'unsafe_driving',
    severity: 'normal',
    priority: 'normal',
    location: {
      lat: 31.4650,
      lng: 74.3720,
      address: 'Ferozepur Road near Kalma Chowk underpass, Lahore',
      freshness: 'LIVE'
    },
    pickupLocation: {
      address: 'Model Town Block C, Lahore',
      lat: 31.4820,
      lng: 74.3210
    },
    destinationLocation: {
      address: 'DHA Phase 5 Sector CCA, Lahore',
      lat: 31.4580,
      lng: 74.4020
    },
    rideStatus: 'in_progress',
    status: 'under_investigation',
    triggeredAt: '2026-09-13 19:15 PKT',
    notes: 'Passenger reported repeated high-speed tailgating and overtaking rickshaws dangerously during light rain.',
    description: 'Passenger filed real-time safety complaint from in-ride menu: "Driver is driving very fast in rain and looking at smartphone notifications."',
    assignedAdmin: 'Kashif Mehmood',
    assignedTeam: 'safety',
    responseStatus: 'within_target',
    caseId: 'case-sft-03',
    responseTimeline: [
      {
        id: 'tl-21',
        timestamp: '2026-09-13 19:15 PKT',
        actor: 'Passenger (Zainab Fatima)',
        actorRole: 'passenger',
        action: 'Event Created',
        note: 'Submitted unsafe driving report during active trip'
      },
      {
        id: 'tl-22',
        timestamp: '2026-09-13 19:18 PKT',
        actor: 'Kashif Mehmood',
        actorRole: 'admin',
        action: 'Admin Acknowledged',
        note: 'Audited in-ride accelerometer and GPS speed readings (peak 82 km/h in 60 km/h rain zone).'
      },
      {
        id: 'tl-23',
        timestamp: '2026-09-13 19:20 PKT',
        actor: 'GoLife Safety Sentinel',
        actorRole: 'system',
        action: 'Contact Attempt',
        note: 'Dispatched automated speed warning audio nudge to Driver app speaker'
      }
    ],
    metrics: {
      alertTime: '2026-09-13 19:15 PKT',
      acknowledgedAt: '2026-09-13 19:18 PKT',
      acknowledgementDelaySeconds: 180,
      slaStatus: 'within_target'
    },
    aiAssistance: {
      summary: 'Passenger distressed by vehicle speed during wet asphalt conditions. Telemetry confirms 82 km/h peak speed.',
      recommendedPriority: 'normal',
      recommendedCategory: 'unsafe_driving',
      recommendedNextSteps: [
        'Send in-app speed alert to driver cockpit.',
        'Issue formal Driver Warning after trip completion.',
        'Check Driver Academy defensive driving module status.'
      ],
      riskScore: 45
    }
  },
  {
    id: 'sft-har-04',
    incidentCode: 'SFT-PK-104',
    rideId: 'r-405',
    rideCode: 'GL-PK-89085',
    reportedBy: 'passenger',
    reporterName: 'Amina Tariq',
    reporterPhone: '+92 345 8192039',
    passengerId: 'p-105',
    driverId: 'd-204',
    driverName: 'Nawazish Ali',
    vehiclePlate: 'LHE-20-4109',
    vehicleModel: 'Auto Rickshaw (GoAuto)',
    city: 'Lahore',
    type: 'harassment',
    category: 'harassment',
    severity: 'urgent',
    priority: 'urgent',
    location: {
      lat: 31.5204,
      lng: 74.3587,
      address: 'Mall Road near Charing Cross, Lahore',
      freshness: 'RECENT'
    },
    pickupLocation: {
      address: 'Lahore Railway Station',
      lat: 31.5780,
      lng: 74.3310
    },
    destinationLocation: {
      address: 'Shadman Market, Lahore',
      lat: 31.5340,
      lng: 74.3210
    },
    rideStatus: 'completed',
    status: 'escalated',
    triggeredAt: '2026-09-13 17:40 PKT',
    notes: 'Passenger reported driver insisted on asking personal marital status and made inappropriate comments during trip.',
    description: 'Female passenger reported severe discomfort due to repeated intrusive questions. Driver also hesitated to drop passenger at exact residential gate.',
    assignedAdmin: 'Farhan Zaidi',
    assignedTeam: 'safety',
    responseStatus: 'within_target',
    caseId: 'case-sft-04',
    responseTimeline: [
      {
        id: 'tl-31',
        timestamp: '2026-09-13 17:40 PKT',
        actor: 'Passenger (Amina Tariq)',
        actorRole: 'passenger',
        action: 'Event Created',
        note: 'Filed harassment complaint with high urgency flag'
      },
      {
        id: 'tl-32',
        timestamp: '2026-09-13 17:44 PKT',
        actor: 'Farhan Zaidi',
        actorRole: 'admin',
        action: 'Admin Acknowledged',
        note: 'Reviewing driver complaint history and previous passenger feedback.'
      },
      {
        id: 'tl-33',
        timestamp: '2026-09-13 17:50 PKT',
        actor: 'Farhan Zaidi',
        actorRole: 'admin',
        action: 'Escalated',
        note: 'Escalated to Head of Safety for Driver Control temporary suspension review.'
      }
    ],
    aiAssistance: {
      summary: 'Passenger reports intrusive personal questioning and inappropriate conduct by GoAuto driver. Second behavioral complaint against this driver in 30 days.',
      recommendedPriority: 'urgent',
      recommendedCategory: 'harassment',
      recommendedNextSteps: [
        'Recommend 48-hour temporary account suspension via Driver Control.',
        'Mandate Driver Academy Code of Conduct refresher before reinstatement.',
        'Provide courtesy wallet compensation to passenger.'
      ],
      patternNotes: 'Driver Nawazish Ali has 2 prior verbal conduct complaints on record.',
      riskScore: 78
    }
  },
  {
    id: 'sft-med-05',
    incidentCode: 'SFT-PK-105',
    rideId: 'r-406',
    rideCode: 'GL-PK-89110',
    reportedBy: 'driver',
    reporterName: 'Khurram Shehzad',
    reporterPhone: '+92 321 9918204',
    driverId: 'd-202',
    passengerId: 'p-106',
    driverName: 'Khurram Shehzad',
    vehiclePlate: 'KHI-21-9941',
    city: 'Karachi',
    type: 'medical_emergency',
    category: 'medical_emergency',
    severity: 'critical',
    priority: 'critical',
    location: {
      lat: 24.8210,
      lng: 67.0340,
      address: 'Khayaban-e-Shamsheer, DHA Phase 5 near South City Hospital, Karachi',
      freshness: 'RECENT'
    },
    pickupLocation: {
      address: 'Zamzama Commercial, Karachi',
      lat: 24.8280,
      lng: 67.0250
    },
    destinationLocation: {
      address: 'Sea View Road, Karachi',
      lat: 24.7950,
      lng: 67.0420
    },
    rideStatus: 'completed',
    status: 'resolved',
    triggeredAt: '2026-09-13 16:10 PKT',
    resolvedAt: '2026-09-13 16:45 PKT',
    notes: 'Passenger experienced acute breathing distress/asthma attack. Driver diverted directly to South City Hospital emergency ER with passenger consent.',
    description: 'Driver acted expeditiously and notified GoLife operations. Passenger received immediate medical attention. Hospitalization bill settled by family.',
    assignedAdmin: 'Sarah Tariq',
    assignedTeam: 'safety',
    responseStatus: 'within_target',
    caseId: 'case-sft-05',
    responseTimeline: [
      {
        id: 'tl-41',
        timestamp: '2026-09-13 16:10 PKT',
        actor: 'Driver (Khurram Shehzad)',
        actorRole: 'driver',
        action: 'Event Created',
        note: 'Reported passenger medical crisis and emergency route diversion'
      },
      {
        id: 'tl-42',
        timestamp: '2026-09-13 16:12 PKT',
        actor: 'Sarah Tariq',
        actorRole: 'admin',
        action: 'Admin Acknowledged',
        note: 'Alerted South City ER reception and tracked car until safe hospital dropoff.'
      },
      {
        id: 'tl-43',
        timestamp: '2026-09-13 16:45 PKT',
        actor: 'Sarah Tariq',
        actorRole: 'admin',
        action: 'Resolution',
        note: 'Passenger family confirmed condition stabilized. Commended driver conduct.'
      }
    ],
    aiAssistance: {
      summary: 'Medical crisis successfully handled by driver through rapid diversion to nearest hospital.',
      recommendedPriority: 'critical',
      recommendedCategory: 'medical_emergency',
      recommendedNextSteps: [
        'Credit driver with exemplary service reward badge.',
        'Close case with positive commendation note.'
      ],
      riskScore: 12
    }
  },
  {
    id: 'sft-fls-06',
    incidentCode: 'SOS-PK-991',
    rideId: 'r-401',
    rideCode: 'GL-PK-89102',
    reportedBy: 'passenger',
    reporterName: 'Zainab Fatima',
    reporterPhone: '+92 300 8472911',
    passengerId: 'p-101',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    vehiclePlate: 'LEB-22-8419',
    city: 'Lahore',
    type: 'sos_trigger',
    category: 'other',
    severity: 'low',
    priority: 'low',
    isEmergencySos: true,
    isFalseAlarm: true,
    falseAlarmReason: 'accidental_tap',
    location: {
      lat: 31.4650,
      lng: 74.3720,
      address: 'Near Walton Cantonment flyover, Lahore',
      freshness: 'OFFLINE'
    },
    pickupLocation: {
      address: 'Gulberg III, Lahore',
      lat: 31.5120,
      lng: 74.3410
    },
    destinationLocation: {
      address: 'Walton Road, Lahore',
      lat: 31.4650,
      lng: 74.3720
    },
    rideStatus: 'completed',
    status: 'false_alarm',
    triggeredAt: '2026-09-12 18:05 PKT',
    resolvedAt: '2026-09-12 18:09 PKT',
    notes: 'Passenger confirmed accidental in-app safety button tap while adjusting phone holder. All clear verified via emergency hotline.',
    description: 'SOS alert received. Immediate callback placed to passenger within 25 seconds. Passenger apologized for accidental button press while adjusting child in back seat.',
    assignedAdmin: 'Kashif Mehmood',
    assignedTeam: 'safety',
    responseStatus: 'within_target',
    responseTimeline: [
      {
        id: 'tl-51',
        timestamp: '2026-09-12 18:05 PKT',
        actor: 'Passenger (Zainab Fatima)',
        actorRole: 'passenger',
        action: 'Event Created',
        note: 'SOS triggered'
      },
      {
        id: 'tl-52',
        timestamp: '2026-09-12 18:05:25 PKT',
        actor: 'Kashif Mehmood',
        actorRole: 'admin',
        action: 'Admin Acknowledged',
        note: 'Hotline outbound call placed to passenger'
      },
      {
        id: 'tl-53',
        timestamp: '2026-09-12 18:09 PKT',
        actor: 'Kashif Mehmood',
        actorRole: 'admin',
        action: 'Resolution',
        note: 'Marked as Accidental Tap False Alarm. Original audit record preserved.'
      }
    ],
    aiAssistance: {
      summary: 'Accidental touch screen activation. Verified harmless false alarm.',
      recommendedPriority: 'low',
      recommendedCategory: 'other',
      recommendedNextSteps: ['No punitive action required.'],
      riskScore: 0
    }
  },
  {
    id: 'sft-brk-07',
    incidentCode: 'SFT-PK-107',
    rideId: 'r-407',
    rideCode: 'GL-PK-89112',
    reportedBy: 'driver',
    reporterName: 'Gulzar Ahmed',
    reporterPhone: '+92 312 9012345',
    driverId: 'd-205',
    passengerId: 'p-107',
    driverName: 'Gulzar Ahmed',
    vehiclePlate: 'PST-18-4012',
    vehicleModel: 'Suzuki Wagon R (White)',
    city: 'Peshawar',
    type: 'vehicle_breakdown',
    category: 'vehicle_breakdown',
    severity: 'normal',
    priority: 'normal',
    location: {
      lat: 34.0080,
      lng: 71.5320,
      address: 'University Road near Islamia College, Peshawar',
      freshness: 'RECENT'
    },
    pickupLocation: {
      address: 'Hayatabad Phase 3, Peshawar',
      lat: 33.9850,
      lng: 71.4320
    },
    destinationLocation: {
      address: 'Saddar Road, Peshawar Cantonment',
      lat: 34.0080,
      lng: 71.5320
    },
    rideStatus: 'completed',
    status: 'resolved',
    triggeredAt: '2026-09-13 14:20 PKT',
    resolvedAt: '2026-09-13 14:40 PKT',
    notes: 'Engine overheating on University Road. Driver pulled over into safe petrol station and requested passenger backup ride.',
    description: 'Driver coordinated with dispatch to transfer passenger smoothly without extra charge. Tow truck dispatched via GoLife partner garage.',
    assignedAdmin: 'Major Bilal (R)',
    assignedTeam: 'operations',
    responseStatus: 'within_target',
    caseId: 'case-sft-07',
    responseTimeline: [
      {
        id: 'tl-61',
        timestamp: '2026-09-13 14:20 PKT',
        actor: 'Driver (Gulzar Ahmed)',
        actorRole: 'driver',
        action: 'Event Created',
        note: 'Breakdown reported'
      },
      {
        id: 'tl-62',
        timestamp: '2026-09-13 14:40 PKT',
        actor: 'Major Bilal (R)',
        actorRole: 'admin',
        action: 'Resolution',
        note: 'Passenger safely transferred. Vehicle towed to workshop.'
      }
    ],
    aiAssistance: {
      summary: 'Vehicle mechanical breakdown resolved through smooth passenger transfer and fleet towing.',
      recommendedPriority: 'normal',
      recommendedCategory: 'vehicle_breakdown',
      recommendedNextSteps: ['Require mechanical clearance certificate before driver goes online.'],
      riskScore: 20
    }
  }
];

export function getSafetyPriorityBadge(priority?: SafetyPriority): {
  label: string;
  badgeClass: string;
  color: string;
  dotClass: string;
} {
  switch (priority) {
    case 'critical':
      return {
        label: 'CRITICAL',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse',
        color: 'bg-rose-100 text-rose-800 border-rose-300 font-black',
        dotClass: 'bg-rose-600'
      };
    case 'urgent':
      return {
        label: 'URGENT',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        dotClass: 'bg-amber-500'
      };
    case 'high':
      return {
        label: 'HIGH',
        badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
        color: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
        dotClass: 'bg-orange-500'
      };
    case 'normal':
      return {
        label: 'NORMAL',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 font-medium',
        color: 'bg-sky-100 text-sky-900 border-sky-300 font-medium',
        dotClass: 'bg-sky-500'
      };
    case 'low':
    default:
      return {
        label: 'LOW',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
        color: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
        dotClass: 'bg-slate-400'
      };
  }
}

export function getSafetyStatusBadge(status?: SafetyEventStatus): {
  label: string;
  badgeClass: string;
  color: string;
} {
  switch (status) {
    case 'active':
      return {
        label: 'ACTIVE ALARM',
        badgeClass: 'bg-rose-600 text-white font-black animate-pulse',
        color: 'bg-rose-600 text-white font-black animate-pulse'
      };
    case 'acknowledged':
      return {
        label: 'ACKNOWLEDGED',
        badgeClass: 'bg-amber-500 text-slate-950 font-bold',
        color: 'bg-amber-500 text-slate-950 font-bold'
      };
    case 'assigned':
      return {
        label: 'ASSIGNED',
        badgeClass: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
        color: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold'
      };
    case 'under_investigation':
      return {
        label: 'INVESTIGATING',
        badgeClass: 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold',
        color: 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold'
      };
    case 'escalated':
      return {
        label: 'ESCALATED',
        badgeClass: 'bg-rose-100 text-rose-900 border border-rose-300 font-black',
        color: 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
      };
    case 'police_contacted':
      return {
        label: 'AUTHORITIES NOTIFIED',
        badgeClass: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
        color: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
      };
    case 'resolved':
      return {
        label: 'RESOLVED',
        badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
        color: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
      };
    case 'false_alarm':
      return {
        label: 'FALSE ALARM',
        badgeClass: 'bg-slate-100 text-slate-700 border border-slate-300 font-medium',
        color: 'bg-slate-100 text-slate-700 border border-slate-300 font-medium'
      };
    case 'closed':
    default:
      return {
        label: 'CLOSED',
        badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
        color: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium'
      };
  }
}

export function getFreshnessBadge(freshness?: SafetyLocationFreshness): {
  label: string;
  colorClass: string;
  color: string;
  dotClass: string;
} {
  switch (freshness) {
    case 'LIVE':
      return {
        label: 'LIVE (<15s)',
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold',
        dotClass: 'bg-emerald-500 animate-pulse'
      };
    case 'RECENT':
      return {
        label: 'RECENT (<60s)',
        colorClass: 'text-sky-700 bg-sky-50 border-sky-200 font-bold',
        color: 'text-sky-700 bg-sky-50 border-sky-200 font-bold',
        dotClass: 'bg-sky-500'
      };
    case 'STALE':
      return {
        label: 'STALE (>60s)',
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200 font-medium',
        color: 'text-amber-700 bg-amber-50 border-amber-200 font-medium',
        dotClass: 'bg-amber-500'
      };
    case 'OFFLINE':
    default:
      return {
        label: 'OFFLINE',
        colorClass: 'text-slate-600 bg-slate-50 border-slate-200 font-medium',
        color: 'text-slate-600 bg-slate-50 border-slate-200 font-medium',
        dotClass: 'bg-slate-400'
      };
  }
}

export function getSafetySlaBadge(status: SafetyResponseStatus): {
  label: string;
  badgeColor: string;
} {
  switch (status) {
    case 'within_target':
      return { label: 'Under SLA Target', badgeColor: 'bg-emerald-100 text-emerald-800' };
    case 'near_target':
      return { label: 'Near Breach', badgeColor: 'bg-amber-100 text-amber-900 font-bold' };
    case 'target_breached':
    default:
      return { label: 'SLA Breached', badgeColor: 'bg-rose-100 text-rose-800 font-bold animate-pulse' };
  }
}

export function calculateSafetySlaStatus(
  incident: SafetyIncident,
  slaConfig: SafetyResponseSlaConfig = DEFAULT_SAFETY_SLA_CONFIG
): SafetyResponseStatus {
  if (incident.status === 'resolved' || incident.status === 'closed' || incident.status === 'false_alarm') {
    return 'within_target';
  }

  // If incident has acknowledgment delay
  const ackDelay = incident.metrics?.acknowledgementDelaySeconds || 0;
  const isEmergency = incident.isEmergencySos || incident.priority === 'critical';
  const targetAck = isEmergency ? slaConfig.sosAcknowledgementSeconds : (slaConfig.standardAcknowledgementMinutes * 60);

  if (ackDelay > targetAck * 1.5) {
    return 'target_breached';
  }
  if (ackDelay > targetAck) {
    return 'near_target';
  }
  return 'within_target';
}

export function generateAiSafetySummary(
  incident: SafetyIncident,
  allIncidents: SafetyIncident[] = []
): {
  summary: string;
  recommendedPriority: SafetyPriority;
  recommendedCategory: SafetyIncidentCategory;
  recommendedNextSteps: string[];
  patternNotes?: string;
  duplicateOfId?: string;
  riskScore: number;
} {
  // Check duplicate
  const duplicate = allIncidents.find(
    (i) => i.id !== incident.id && i.rideId === incident.rideId && i.status === 'active'
  );

  let priority: SafetyPriority = incident.priority || 'normal';
  let category: SafetyIncidentCategory = incident.category || incident.type || 'other';

  if (incident.isEmergencySos || incident.type === 'sos_trigger' || incident.type === 'theft') {
    priority = 'critical';
  } else if (incident.type === 'accident' || incident.type === 'harassment' || incident.type === 'threat') {
    priority = 'urgent';
  }

  const steps: string[] = [];
  if (priority === 'critical' || priority === 'urgent') {
    steps.push('Immediately initiate priority voice outreach to driver & passenger.');
    steps.push('Check nearby GoLife fleet vehicles for escort / backup assistance.');
    steps.push('If passenger confirms hostile threat, alert local Safe City Emergency 15.');
  } else {
    steps.push('Review ride GPS telemetry & passenger complaint description.');
    steps.push('Send in-app inquiry to both parties.');
    steps.push('Determine whether Driver Control action or warning is warranted.');
  }

  return {
    summary: incident.description || incident.notes || 'Safety incident logged during active operational period.',
    recommendedPriority: priority,
    recommendedCategory: category,
    recommendedNextSteps: steps,
    patternNotes: duplicate ? `Potential duplicate alert of incident #${duplicate.incidentCode}` : undefined,
    duplicateOfId: duplicate?.id,
    riskScore: priority === 'critical' ? 92 : priority === 'urgent' ? 76 : priority === 'high' ? 58 : 25
  };
}
