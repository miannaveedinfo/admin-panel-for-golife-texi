import {
  SupportCase,
  SupportCaseType,
  SupportCasePriority,
  SupportCaseStatus,
  SupportCaseSLAStatus,
  SupportCaseEvent,
  SupportCaseEvidence,
  SupportCaseInternalNote
} from '../types';

export const INITIAL_DEMO_CASES: SupportCase[] = [
  // 1. Passenger Fare Dispute (Lahore Canal Road peak surge discrepancy)
  {
    id: 'CASE-2026-8901',
    caseNumber: 'GL-CS-8901',
    type: 'fare_dispute',
    subCategory: 'Overcharged Surge & Route Deviation',
    title: 'Peak surge multiplier applied during unannounced off-peak window on Canal Road',
    description: 'Passenger booked a GoRide Sedan from Thokar Niaz Baig to Mall Road. Fare estimate was PKR 650. Final receipt billed PKR 1,120 citing 1.8x dynamic surge and 15 mins driver waiting, but passenger was waiting on the kerb and trip had no traffic stop.',
    priority: 'normal',
    status: 'open',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 14:15 PKT',
    updatedAt: '2026-09-13 15:40 PKT',
    firstResponseAt: '2026-09-13 14:45 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 3.5,
    city: 'Lahore',
    assignedAdmin: 'Kashif Mehmood',
    assignedTeam: 'finance',
    reporter: {
      id: 'p-101',
      name: 'Zainab Fatima',
      phone: '+92 300 1234567',
      role: 'passenger',
      rating: 4.9,
      totalTrips: 64
    },
    driver: {
      id: 'd-201',
      name: 'Muhammad Asif Rasheed',
      phone: '+92 301 9876543',
      rating: 4.82,
      vehiclePlate: 'LEA-4892',
      vehicleModel: 'Toyota Corolla 2022 (White)',
      totalComplaints: 2,
      totalFines: 1,
      riskLevel: 'low',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-101',
      name: 'Zainab Fatima',
      phone: '+92 300 1234567',
      rating: 4.9,
      totalRides: 64,
      totalComplaints: 1,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-401',
      code: 'GL-PK-89102',
      pickup: 'Canal View Society, Gate 2, Thokar, Lahore',
      dropoff: 'Avari Hotel, Mall Road, Lahore',
      fare: 1120,
      date: '2026-09-13 13:30 PKT',
      vehicleType: 'GoRide Sedan',
      status: 'completed'
    },
    location: {
      lat: 31.4789,
      lng: 74.2654,
      address: 'Canal Bank Road, near Punjab University New Campus'
    },
    evidence: [
      {
        id: 'ev-101',
        title: 'Trip Telemetry GPS Trail',
        type: 'ride_telemetry',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'System Engine',
        uploadedAt: '2026-09-13 14:15 PKT',
        notes: 'GPS route matches optimal route without unnecessary detour.'
      },
      {
        id: 'ev-102',
        title: 'Passenger Digital Receipt',
        type: 'payment_receipt',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Zainab Fatima',
        uploadedAt: '2026-09-13 14:18 PKT',
        notes: 'Receipt highlights PKR 380 surge premium charge.'
      }
    ],
    internalNotes: [
      {
        id: 'note-101',
        author: 'Kashif Mehmood',
        authorRole: 'Finance Desk',
        text: 'Checked Central Pricing Rule Version 3.4. Surge multiplier was triggered accidentally by 5-minute rain sensor anomaly. Eligible for partial refund of PKR 320 to passenger wallet.',
        createdAt: '2026-09-13 15:30 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-t1',
        timestamp: '2026-09-13 14:15 PKT',
        actor: 'Passenger: Zainab Fatima',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Fare dispute filed via GoLife Passenger App with digital receipt.'
      },
      {
        id: 'ev-t2',
        timestamp: '2026-09-13 14:45 PKT',
        actor: 'Admin: Kashif Mehmood',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Case assigned to Finance & Tariff dispute desk.'
      },
      {
        id: 'ev-t3',
        timestamp: '2026-09-13 15:30 PKT',
        actor: 'Admin: Kashif Mehmood',
        actorRole: 'admin',
        action: 'Internal Note',
        note: 'Calculated tariff discrepancy. Surge adjustment ready for one-click settlement.'
      }
    ],
    financials: {
      originalFare: 1120,
      finalFare: 1120,
      pricingRuleVersion: 'v3.4.2-LHR',
      distanceKm: 14.8,
      durationMin: 32,
      waitingTimeMin: 6,
      baseFare: 220,
      distanceCharge: 370,
      timeCharge: 150,
      serviceCharges: 380, // surge discrepancy
      taxAmount: 65,
      commissionAmount: 180,
      discountAmount: 0,
      paymentStatus: 'paid_wallet',
      paymentMethod: 'GoLife Wallet',
      transactionId: 'TX-9021-PK',
      refundAmount: 320,
      refundStatus: 'pending_approval'
    },
    aiInsights: {
      summary: 'Passenger was charged a 1.8x dynamic surge due to transient sensor glitch during off-peak hour on Canal Road.',
      recommendedCategory: 'fare_dispute',
      recommendedPriority: 'normal',
      duplicateRisk: false,
      similarCasesCount: 3,
      suggestedResolution: 'Approve PKR 320 passenger wallet refund and mark surge as false weather alert.'
    }
  },

  // 2. Driver Complaint (Passenger refused cash payment in Karachi Clifton)
  {
    id: 'CASE-2026-8902',
    caseNumber: 'GL-CS-8902',
    type: 'driver_complaint',
    subCategory: 'Cash Non-Payment & Abusive Behavior',
    title: 'Passenger refused cash payment of PKR 580 upon dropoff at Clifton Block 2',
    description: 'Driver completed the ride from Karachi Airport Terminal 1 to Clifton Block 2. Passenger claimed their online banking app transfer was sent, but no funds arrived in driver JazzCash or GoLife wallet. Passenger then walked into a gated residential complex without paying.',
    priority: 'high',
    status: 'under_review',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 11:20 PKT',
    updatedAt: '2026-09-13 13:00 PKT',
    firstResponseAt: '2026-09-13 11:50 PKT',
    targetResolutionHours: 12,
    currentWaitingHours: 6.2,
    city: 'Karachi',
    assignedAdmin: 'Rashid Minhas',
    assignedTeam: 'support',
    reporter: {
      id: 'd-202',
      name: 'Khurram Shehzad',
      phone: '+92 321 4455667',
      role: 'driver',
      rating: 4.88,
      totalTrips: 1290
    },
    driver: {
      id: 'd-202',
      name: 'Khurram Shehzad',
      phone: '+92 321 4455667',
      rating: 4.88,
      vehiclePlate: 'KHI-9031',
      vehicleModel: 'Honda City 2021 (Silver)',
      totalComplaints: 0,
      totalFines: 0,
      riskLevel: 'low',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-102',
      name: 'Hamza Shabbir',
      phone: '+92 333 5566778',
      rating: 3.8,
      totalRides: 14,
      totalComplaints: 3,
      accountStatus: 'warning'
    },
    ride: {
      id: 'r-402',
      code: 'GL-PK-89103',
      pickup: 'Jinnah International Airport, Arrivals Gate 3',
      dropoff: 'Park Towers, Clifton Block 2, Karachi',
      fare: 580,
      date: '2026-09-13 10:45 PKT',
      vehicleType: 'GoRide Sedan',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-201',
        title: 'Driver Dashcam Audio & Video',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Khurram Shehzad',
        uploadedAt: '2026-09-13 11:25 PKT',
        notes: 'Recording confirms passenger exited vehicle without paying cash or showing transaction confirmation.'
      }
    ],
    internalNotes: [
      {
        id: 'note-201',
        author: 'Rashid Minhas',
        authorRole: 'Support Officer',
        text: 'Passenger Hamza Shabbir has 2 previous non-payment reports on file. Contacted passenger phone (+92 333 5566778); no answer yet. If unpaid within 4 hours, auto-debit passenger profile and credit driver reimbursement.',
        createdAt: '2026-09-13 12:40 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-2t1',
        timestamp: '2026-09-13 11:20 PKT',
        actor: 'Driver: Khurram Shehzad',
        actorRole: 'driver',
        action: 'Case Created',
        note: 'Driver filed emergency non-payment complaint with attached dashcam footage.'
      },
      {
        id: 'ev-2t2',
        timestamp: '2026-09-13 11:50 PKT',
        actor: 'Admin: Rashid Minhas',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Support team initiated formal inquiry.'
      },
      {
        id: 'ev-2t3',
        timestamp: '2026-09-13 12:15 PKT',
        actor: 'Admin: Rashid Minhas',
        actorRole: 'admin',
        action: 'Driver Response',
        note: 'Information request sent to passenger via Notification Center SMS & Push.'
      }
    ],
    financials: {
      originalFare: 580,
      finalFare: 580,
      paymentStatus: 'unpaid_cash',
      paymentMethod: 'Cash',
      commissionAmount: 87
    },
    aiInsights: {
      summary: 'Passenger exited at Clifton without paying PKR 580 cash. Driver provided dashcam audio verifying non-payment.',
      recommendedCategory: 'driver_complaint',
      recommendedPriority: 'high',
      duplicateRisk: false,
      similarCasesCount: 5,
      suggestedResolution: 'Issue automated outstanding balance fee to passenger account and reimburse PKR 580 to driver wallet.'
    }
  },

  // 3. Payment Dispute (Easypaisa transaction timed out but debited)
  {
    id: 'CASE-2026-8903',
    caseNumber: 'GL-CS-8903',
    type: 'payment_dispute',
    subCategory: 'Gateway Timeout & Double Charge',
    title: 'Easypaisa wallet debited PKR 430 twice during gateway API timeout',
    description: 'During payment settlement for Islamabad ride GL-PK-89104, Easypaisa gateway timed out on first attempt. Passenger retried with JazzCash. Both accounts were debited, resulting in a PKR 430 duplicate charge.',
    priority: 'high',
    status: 'open',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 09:30 PKT',
    updatedAt: '2026-09-13 10:15 PKT',
    firstResponseAt: '2026-09-13 09:55 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 8.1,
    city: 'Islamabad',
    assignedAdmin: 'Farhan Zaidi',
    assignedTeam: 'finance',
    reporter: {
      id: 'p-103',
      name: 'Ayesha Siddiqui',
      phone: '+92 334 7788990',
      role: 'passenger',
      rating: 5.0,
      totalTrips: 112
    },
    driver: {
      id: 'd-203',
      name: 'Zubair Shah',
      phone: '+92 312 8899001',
      rating: 4.91,
      vehiclePlate: 'ICT-5512',
      vehicleModel: 'Honda CG 125 Bike (Black)',
      totalComplaints: 0,
      totalFines: 0,
      riskLevel: 'low',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-103',
      name: 'Ayesha Siddiqui',
      phone: '+92 334 7788990',
      rating: 5.0,
      totalRides: 112,
      totalComplaints: 0,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-403',
      code: 'GL-PK-89104',
      pickup: 'F-7 Markaz, Jinnah Super, Islamabad',
      dropoff: 'Centaurus Mall, Jinnah Avenue, Islamabad',
      fare: 430,
      date: '2026-09-13 09:00 PKT',
      vehicleType: 'GoRide Bike',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-301',
        title: 'Easypaisa Bank SMS Confirmation',
        type: 'payment_receipt',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Ayesha Siddiqui',
        uploadedAt: '2026-09-13 09:32 PKT',
        notes: 'TRX ID: EP-98218402 debited PKR 430 at 09:08:12 PKT.'
      },
      {
        id: 'ev-302',
        title: 'JazzCash SMS Confirmation',
        type: 'payment_receipt',
        url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Ayesha Siddiqui',
        uploadedAt: '2026-09-13 09:33 PKT',
        notes: 'TRX ID: JC-77192019 debited PKR 430 at 09:09:44 PKT.'
      }
    ],
    internalNotes: [
      {
        id: 'note-301',
        author: 'Farhan Zaidi',
        authorRole: 'Finance Auditor',
        text: 'Verified with Bank Gateway reconciliation log. TRX EP-98218402 captured successfully but webhook timed out. Ready to trigger automatic reversal of PKR 430 via Refund Engine.',
        createdAt: '2026-09-13 10:10 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-3t1',
        timestamp: '2026-09-13 09:30 PKT',
        actor: 'Passenger: Ayesha Siddiqui',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Double debit complaint submitted with bank SMS transaction IDs.'
      },
      {
        id: 'ev-3t2',
        timestamp: '2026-09-13 09:55 PKT',
        actor: 'Admin: Farhan Zaidi',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Assigned to Payment Reconciliation Team.'
      }
    ],
    financials: {
      originalFare: 430,
      finalFare: 430,
      paymentStatus: 'double_debited',
      paymentMethod: 'Easypaisa + JazzCash',
      transactionId: 'TX-EP-98218402',
      refundAmount: 430,
      refundStatus: 'pending_approval'
    },
    aiInsights: {
      summary: 'Payment gateway timeout caused passenger to be charged twice on two different mobile wallets for the same ride.',
      recommendedCategory: 'payment_dispute',
      recommendedPriority: 'high',
      duplicateRisk: false,
      similarCasesCount: 8,
      suggestedResolution: 'Refund duplicate PKR 430 to passenger wallet or original Easypaisa account.'
    }
  },

  // 4. Fine Dispute (Driver fine for late pickup disputed due to road blockage on Islamabad Expressway)
  {
    id: 'CASE-2026-8904',
    caseNumber: 'GL-CS-8904',
    type: 'fine_dispute',
    subCategory: 'Late Pickup Fine Contested',
    title: 'Driver disputes PKR 500 late pickup fine due to official VIP protocol road closure',
    description: 'Driver Tariq Mehmood was automatically assessed a PKR 500 late pickup fine on ride GL-PK-89105. Driver was delayed 14 minutes due to an unannounced Islamabad Expressway VIP movement barricade. Driver has submitted traffic police traffic advisory notice.',
    priority: 'normal',
    status: 'under_review',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 08:40 PKT',
    updatedAt: '2026-09-13 10:30 PKT',
    firstResponseAt: '2026-09-13 09:10 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 9.0,
    city: 'Rawalpindi',
    assignedAdmin: 'Imran Bashir',
    assignedTeam: 'operations',
    reporter: {
      id: 'd-204',
      name: 'Tariq Mehmood',
      phone: '+92 302 3344556',
      role: 'driver',
      rating: 4.79,
      totalTrips: 840
    },
    driver: {
      id: 'd-204',
      name: 'Tariq Mehmood',
      phone: '+92 302 3344556',
      rating: 4.79,
      vehiclePlate: 'RIL-8821',
      vehicleModel: 'Suzuki WagonR 2020 (White)',
      totalComplaints: 3,
      totalFines: 2,
      riskLevel: 'medium',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-104',
      name: 'Dr. Usman Farooq',
      phone: '+92 300 4455667',
      rating: 4.6,
      totalRides: 48,
      totalComplaints: 2,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-404',
      code: 'GL-PK-89105',
      pickup: 'Saddar Metro Station, Murree Road, Rawalpindi',
      dropoff: 'PIMS Hospital, G-8/3, Islamabad',
      fare: 620,
      date: '2026-09-12 17:40 PKT',
      vehicleType: 'GoRide Mini',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-401',
        title: 'ICT Traffic Police Official Advisory',
        type: 'document',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Tariq Mehmood',
        uploadedAt: '2026-09-13 08:45 PKT',
        notes: 'Official Twitter notice confirming Faizabad interchange diversion for foreign dignitary movement.'
      }
    ],
    internalNotes: [
      {
        id: 'note-401',
        author: 'Imran Bashir',
        authorRole: 'Compliance Officer',
        text: 'Checked Islamabad Traffic Advisory for Sep 12, 17:30 PKT. Confirmed Faizabad bridge diversion. This qualifies under Fair Late Exclusion Reason: "Severe traffic/event". Driver eligible for 100% fine waiver and removal from late count.',
        createdAt: '2026-09-13 10:20 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-4t1',
        timestamp: '2026-09-13 08:40 PKT',
        actor: 'Driver: Tariq Mehmood',
        actorRole: 'driver',
        action: 'Case Created',
        note: 'Dispute submitted contesting Fine ID FINE-PK-302.'
      },
      {
        id: 'ev-4t2',
        timestamp: '2026-09-13 09:10 PKT',
        actor: 'Admin: Imran Bashir',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Assigned to Driver Compliance & Fine review team.'
      }
    ],
    financials: {
      originalFare: 620,
      finalFare: 620,
      relatedFineId: 'FINE-PK-302',
      fineAmount: 500,
      fineReason: 'Late pickup exceeded 10 mins threshold',
      fineDeductionStatus: 'deducted_from_wallet'
    },
    aiInsights: {
      summary: 'Driver proved delay was due to verified police diversion at Faizabad interchange, qualifying under fair exclusion policy.',
      recommendedCategory: 'fine_dispute',
      recommendedPriority: 'normal',
      duplicateRisk: false,
      similarCasesCount: 4,
      suggestedResolution: 'Waive PKR 500 fine and refund to driver wallet via Fine Penalty Engine.'
    }
  },

  // 5. Safety Complaint (SOS triggered / reckless driving on Ring Road) - CRITICAL
  {
    id: 'CASE-2026-8905',
    caseNumber: 'GL-CS-8905',
    type: 'safety_report',
    subCategory: 'Reckless Driving & SOS Emergency Trigger',
    title: 'In-app SOS triggered: Driver driving 130 km/h in wrong lane with passenger shouting to stop',
    description: 'Passenger pressed SOS emergency alert button while travelling on Lahore Southern Bypass / Ring Road. Live telemetry registered 128 km/h in a 80 km/h zone with erratic lane changes. Passenger was distressed on recorded line.',
    priority: 'critical',
    status: 'escalated',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 16:20 PKT',
    updatedAt: '2026-09-13 16:45 PKT',
    firstResponseAt: '2026-09-13 16:22 PKT',
    targetResolutionHours: 2,
    currentWaitingHours: 1.2,
    city: 'Lahore',
    assignedAdmin: 'Col. (R) Tariq Niazi',
    assignedTeam: 'safety',
    safetyIndicator: true,
    safetyCategory: 'unsafe_driving',
    reporter: {
      id: 'p-105',
      name: 'Maryam Nawaz',
      phone: '+92 300 8899776',
      role: 'passenger',
      rating: 4.95,
      totalTrips: 29
    },
    driver: {
      id: 'd-205',
      name: 'Bashir Ahmed Khan',
      phone: '+92 333 1122334',
      rating: 4.12,
      vehiclePlate: 'LHE-7712',
      vehicleModel: 'Toyota Yaris 2023 (Grey)',
      totalComplaints: 5,
      totalFines: 3,
      riskLevel: 'critical',
      accountStatus: 'suspended'
    },
    passenger: {
      id: 'p-105',
      name: 'Maryam Nawaz',
      phone: '+92 300 8899776',
      rating: 4.95,
      totalRides: 29,
      totalComplaints: 1,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-405',
      code: 'GL-PK-89085',
      pickup: 'DHA Phase 5, Sector C, Lahore',
      dropoff: 'Allama Iqbal International Airport, Lahore',
      fare: 890,
      date: '2026-09-13 16:15 PKT',
      vehicleType: 'GoRide Sedan',
      status: 'cancelled'
    },
    location: {
      lat: 31.5022,
      lng: 74.4011,
      address: 'Ring Road interchange, near DHA Phase 6 entry, Lahore'
    },
    evidence: [
      {
        id: 'ev-501',
        title: 'Live Telemetry Speed Curve (128 km/h)',
        type: 'ride_telemetry',
        url: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Safety Telemetry Daemon',
        uploadedAt: '2026-09-13 16:21 PKT',
        notes: 'Speed breach alert recorded 128 km/h for 4.2 continuous minutes.'
      },
      {
        id: 'ev-502',
        title: 'Audio Dispatch Recording of SOS Call',
        type: 'system_record',
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'GoLife SafeCity Bridge',
        uploadedAt: '2026-09-13 16:23 PKT',
        notes: 'Passenger audibly begging driver to slow down; driver arguing.'
      }
    ],
    internalNotes: [
      {
        id: 'note-501',
        author: 'Col. (R) Tariq Niazi',
        authorRole: 'Head of Safety',
        text: 'Driver immediate temporary suspension enacted via Driver Control. Emergency patrol car dispatched; passenger safely evacuated at DHA Phase 6 toll plaza. Rescue 15 & Punjab Highway Patrol alerted. Full safety hearing scheduled.',
        createdAt: '2026-09-13 16:30 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-5t1',
        timestamp: '2026-09-13 16:20 PKT',
        actor: 'Passenger: Maryam Nawaz',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'SOS triggered in-app during active ride.'
      },
      {
        id: 'ev-5t2',
        timestamp: '2026-09-13 16:22 PKT',
        actor: 'System: GoLife Safety Core',
        actorRole: 'system',
        action: 'Escalation',
        note: 'Auto-escalated to Level-1 Critical Safety Desk.'
      },
      {
        id: 'ev-5t3',
        timestamp: '2026-09-13 16:25 PKT',
        actor: 'Admin: Col. (R) Tariq Niazi',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Safety emergency intervention lead took charge.'
      },
      {
        id: 'ev-5t4',
        timestamp: '2026-09-13 16:35 PKT',
        actor: 'Admin: Col. (R) Tariq Niazi',
        actorRole: 'admin',
        action: 'Internal Note',
        note: 'Driver suspended from dispatching platform pending disciplinary hearing.'
      }
    ],
    financials: {
      originalFare: 890,
      finalFare: 0,
      paymentStatus: 'cancelled_safety',
      refundAmount: 890,
      refundStatus: 'completed'
    },
    aiInsights: {
      summary: 'Critical safety incident with verified extreme overspeeding (128 km/h) and distress SOS. Driver has prior speed complaints.',
      recommendedCategory: 'safety_report',
      recommendedPriority: 'critical',
      duplicateRisk: false,
      similarCasesCount: 2,
      suggestedResolution: 'Maintain driver suspension, refer to traffic safety academy, full refund to passenger.'
    }
  },

  // 6. Refund Case (AC not working in premium sedan, partial refund requested)
  {
    id: 'CASE-2026-8906',
    caseNumber: 'GL-CS-8906',
    type: 'refund_request',
    subCategory: 'Comfort & Amenity Failure (No AC in 42°C)',
    title: 'Passenger requested 40% refund: GoRide AC Sedan had broken compressor in 42°C heat',
    description: 'Passenger booked an AC Sedan for an intercity transfer from Peshawar to Islamabad. Driver refused to turn on AC, claiming gas was empty and car overheats. Passenger paid premium tariff of PKR 3,800.',
    priority: 'normal',
    status: 'open',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 12:00 PKT',
    updatedAt: '2026-09-13 14:10 PKT',
    firstResponseAt: '2026-09-13 12:40 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 5.8,
    city: 'Peshawar',
    assignedAdmin: 'Sheraz Khattak',
    assignedTeam: 'support',
    reporter: {
      id: 'p-106',
      name: 'Naveed Ur Rehman',
      phone: '+92 345 8899112',
      role: 'passenger',
      rating: 4.88,
      totalTrips: 37
    },
    driver: {
      id: 'd-206',
      name: 'Gulzar Khan',
      phone: '+92 313 7788990',
      rating: 4.45,
      vehiclePlate: 'PEW-4410',
      vehicleModel: 'Toyota Corolla GLi (White)',
      totalComplaints: 4,
      totalFines: 1,
      riskLevel: 'medium',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-106',
      name: 'Naveed Ur Rehman',
      phone: '+92 345 8899112',
      rating: 4.88,
      totalRides: 37,
      totalComplaints: 1,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-406',
      code: 'GL-PK-89090',
      pickup: 'Hayatabad Phase 3, Peshawar',
      dropoff: 'G-11 Markaz, Islamabad',
      fare: 3800,
      date: '2026-09-13 08:30 PKT',
      vehicleType: 'GoRide Intercity Sedan',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-601',
        title: 'Dashboard Thermometer Photo',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1542314831-c6a4d27e6995?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Naveed Ur Rehman',
        uploadedAt: '2026-09-13 12:05 PKT',
        notes: 'Photo shows cabin temp at 41°C with windows rolled down.'
      }
    ],
    internalNotes: [
      {
        id: 'note-601',
        author: 'Sheraz Khattak',
        authorRole: 'Support Agent',
        text: 'Contacted driver Gulzar Khan. Driver admitted AC compressor belt snapped near Attock. Passenger paid Sedan premium tariff over non-AC fare difference of PKR 950. Recommending PKR 1,000 wallet refund.',
        createdAt: '2026-09-13 13:50 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-6t1',
        timestamp: '2026-09-13 12:00 PKT',
        actor: 'Passenger: Naveed Ur Rehman',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Refund request logged with photo evidence of cabin temperature.'
      },
      {
        id: 'ev-6t2',
        timestamp: '2026-09-13 12:40 PKT',
        actor: 'Admin: Sheraz Khattak',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Support team initiated driver call.'
      },
      {
        id: 'ev-6t3',
        timestamp: '2026-09-13 13:45 PKT',
        actor: 'Driver: Gulzar Khan',
        actorRole: 'driver',
        action: 'Driver Response',
        note: 'Driver confirmed AC was non-functional during highway segment.'
      }
    ],
    financials: {
      originalFare: 3800,
      finalFare: 3800,
      paymentStatus: 'paid_cash',
      paymentMethod: 'Cash',
      refundAmount: 1000,
      refundStatus: 'pending_approval'
    },
    aiInsights: {
      summary: 'Driver acknowledged AC failure on premium intercity booking in peak summer. Cabin temp reached 41°C.',
      recommendedCategory: 'refund_request',
      recommendedPriority: 'normal',
      duplicateRisk: false,
      similarCasesCount: 12,
      suggestedResolution: 'Approve PKR 1,000 comfort penalty refund to passenger and require vehicle AC inspection.'
    }
  },

  // 7. Lost & Found Case (Laptop bag left in Suzuki Alto back seat)
  {
    id: 'CASE-2026-8907',
    caseNumber: 'GL-CS-8907',
    type: 'lost_found',
    subCategory: 'Valuable Electronics (Lenovo ThinkPad)',
    title: 'Lost Item: Navy blue laptop bag containing work computer left in rear seat',
    description: 'Passenger left a Lenovo ThinkPad X1 Carbon with corporate documents in Suzuki Alto after dropoff at Faisalabad Clock Tower. Ride ended 45 minutes ago. Passenger has urgent deadline.',
    priority: 'high',
    status: 'waiting_for_driver',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 15:10 PKT',
    updatedAt: '2026-09-13 15:35 PKT',
    firstResponseAt: '2026-09-13 15:20 PKT',
    targetResolutionHours: 6,
    currentWaitingHours: 2.1,
    city: 'Faisalabad',
    assignedAdmin: 'Mian Saqib',
    assignedTeam: 'support',
    reporter: {
      id: 'p-107',
      name: 'Bilal Ahmed',
      phone: '+92 305 7778899',
      role: 'passenger',
      rating: 4.9,
      totalTrips: 52
    },
    driver: {
      id: 'd-207',
      name: 'Rashid Ali',
      phone: '+92 345 6667788',
      rating: 4.87,
      vehiclePlate: 'FSD-2918',
      vehicleModel: 'Suzuki Alto VXR 2021 (Silver)',
      totalComplaints: 0,
      totalFines: 0,
      riskLevel: 'low',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-107',
      name: 'Bilal Ahmed',
      phone: '+92 305 7778899',
      rating: 4.9,
      totalRides: 52,
      totalComplaints: 0,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-407',
      code: 'GL-PK-89078',
      pickup: 'D-Ground, People’s Colony, Faisalabad',
      dropoff: 'Clock Tower Bazar, Katchery Road, Faisalabad',
      fare: 310,
      date: '2026-09-13 14:30 PKT',
      vehicleType: 'GoRide Mini',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-701',
        title: 'Passenger Laptop Serial & Photo',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Bilal Ahmed',
        uploadedAt: '2026-09-13 15:15 PKT',
        notes: 'Lenovo ThinkPad X1 with corporate ID badge inside sleeve.'
      }
    ],
    internalNotes: [
      {
        id: 'note-701',
        author: 'Mian Saqib',
        authorRole: 'Support Lead',
        text: 'Automated notification and SMS sent to driver Rashid Ali. Driver confirmed via in-app reply that bag is safely in vehicle trunk. Driver is currently on a trip and will hand over at GoLife Faisalabad Hub (Chenab Club Road) by 17:00 PKT.',
        createdAt: '2026-09-13 15:35 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-7t1',
        timestamp: '2026-09-13 15:10 PKT',
        actor: 'Passenger: Bilal Ahmed',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Lost item ticket logged via App Help Desk.'
      },
      {
        id: 'ev-7t2',
        timestamp: '2026-09-13 15:20 PKT',
        actor: 'Admin: Mian Saqib',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Assigned to Lost & Found Custody Desk.'
      },
      {
        id: 'ev-7t3',
        timestamp: '2026-09-13 15:30 PKT',
        actor: 'Driver: Rashid Ali',
        actorRole: 'driver',
        action: 'Driver Response',
        note: 'Driver confirmed item is safe in car trunk. Coordinating hub dropoff.'
      }
    ],
    driverResponse: {
      text: 'Bhai jaan bag mere paas car ki back seat par mehfooz hai. Main abi 1 ride kar raha hoon, 5 baje GoLife Chenab Club hub par deliver kar doonga.',
      submittedAt: '2026-09-13 15:30 PKT'
    },
    aiInsights: {
      summary: 'Driver has secured the laptop bag and committed to dropoff at Faisalabad hub by 17:00 PKT today.',
      recommendedCategory: 'lost_found',
      recommendedPriority: 'high',
      duplicateRisk: false,
      similarCasesCount: 19,
      suggestedResolution: 'Track hub receipt, verify passenger identity with CNIC, and close upon handover.'
    }
  },

  // 8. Open Case (Driver behavior / phone usage while driving)
  {
    id: 'CASE-2026-8908',
    caseNumber: 'GL-CS-8908',
    type: 'driver_behavior',
    subCategory: 'Distracted Driving / Speaker Phone',
    title: 'Driver was continuously taking video calls on speaker without handsfree',
    description: 'During a 45-minute ride on Multan Bosan Road, driver placed a smartphone on speedometer cluster and conducted continuous loud video calls, drifting across lanes twice.',
    priority: 'normal',
    status: 'open',
    slaStatus: 'within_sla',
    createdAt: '2026-09-13 13:00 PKT',
    updatedAt: '2026-09-13 14:00 PKT',
    firstResponseAt: '2026-09-13 13:40 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 4.8,
    city: 'Multan',
    assignedAdmin: 'Zahid Bokhari',
    assignedTeam: 'support',
    reporter: {
      id: 'p-108',
      name: 'Dr. Samina Khan',
      phone: '+92 300 9988776',
      role: 'passenger',
      rating: 4.98,
      totalTrips: 84
    },
    driver: {
      id: 'd-208',
      name: 'Shahid Qureshi',
      phone: '+92 322 1122445',
      rating: 4.65,
      vehiclePlate: 'MN-6612',
      vehicleModel: 'Cultus Euro II (White)',
      totalComplaints: 2,
      totalFines: 0,
      riskLevel: 'low',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-108',
      name: 'Dr. Samina Khan',
      phone: '+92 300 9988776',
      rating: 4.98,
      totalRides: 84,
      totalComplaints: 0,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-408',
      code: 'GL-PK-89065',
      pickup: 'Gulgasht Colony, Gol Bagh, Multan',
      dropoff: 'Nishtar Hospital Emergency Gate, Multan',
      fare: 390,
      date: '2026-09-13 12:15 PKT',
      vehicleType: 'GoRide Mini',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-801',
        title: 'Passenger Short Video Clip',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Dr. Samina Khan',
        uploadedAt: '2026-09-13 13:05 PKT',
        notes: '15-second video clearly shows phone mounted on steering wheel playing video call.'
      }
    ],
    internalNotes: [
      {
        id: 'note-801',
        author: 'Zahid Bokhari',
        authorRole: 'Support Specialist',
        text: 'Driver had a previous warning on Aug 28 for phone usage. Issuing mandatory safe driving refresher course and warning fine via Driver Control.',
        createdAt: '2026-09-13 13:55 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-8t1',
        timestamp: '2026-09-13 13:00 PKT',
        actor: 'Passenger: Dr. Samina Khan',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Behavior complaint submitted with video attachment.'
      },
      {
        id: 'ev-8t2',
        timestamp: '2026-09-13 13:40 PKT',
        actor: 'Admin: Zahid Bokhari',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Assigned to Driver Quality & Discipline team.'
      }
    ],
    financials: {
      originalFare: 390,
      finalFare: 390,
      paymentStatus: 'paid_wallet'
    },
    aiInsights: {
      summary: 'Distracted driving confirmed via video evidence. This is driver second phone violation in 3 weeks.',
      recommendedCategory: 'driver_behavior',
      recommendedPriority: 'normal',
      duplicateRisk: false,
      similarCasesCount: 8,
      suggestedResolution: 'Issue formal second warning, assign Driver Academy safety module, and follow up in 48 hours.'
    }
  },

  // 9. Escalated Case (Harassment allegation escalated to Senior Safety Committee) - URGENT
  {
    id: 'CASE-2026-8909',
    caseNumber: 'GL-CS-8909',
    type: 'safety_report',
    subCategory: 'Verbal Harassment & Intimidation',
    title: 'Driver made inappropriate personal remarks and refused to unlock doors at dropoff',
    description: 'Passenger reported that driver repeatedly asked personal questions regarding marital status and phone number, and delayed unlocking doors at dropoff in Sialkot Cantt until passenger threatened to scream.',
    priority: 'urgent',
    status: 'escalated',
    slaStatus: 'near_sla',
    createdAt: '2026-09-13 07:15 PKT',
    updatedAt: '2026-09-13 11:30 PKT',
    firstResponseAt: '2026-09-13 07:25 PKT',
    targetResolutionHours: 8,
    currentWaitingHours: 10.5,
    city: 'Sialkot',
    assignedAdmin: 'Ayesha Raza',
    assignedTeam: 'safety',
    safetyIndicator: true,
    safetyCategory: 'harassment',
    reporter: {
      id: 'p-109',
      name: 'Mahnoor Tariq',
      phone: '+92 331 4455889',
      role: 'passenger',
      rating: 5.0,
      totalTrips: 18
    },
    driver: {
      id: 'd-209',
      name: 'Waqas Munir',
      phone: '+92 300 2233445',
      rating: 4.21,
      vehiclePlate: 'SKT-9920',
      vehicleModel: 'Suzuki WagonR (Grey)',
      totalComplaints: 4,
      totalFines: 2,
      riskLevel: 'critical',
      accountStatus: 'suspended'
    },
    passenger: {
      id: 'p-109',
      name: 'Mahnoor Tariq',
      phone: '+92 331 4455889',
      rating: 5.0,
      totalRides: 18,
      totalComplaints: 0,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-409',
      code: 'GL-PK-89050',
      pickup: 'Sialkot Chamber of Commerce, Paris Road, Sialkot',
      dropoff: 'Cantt Officers Colony, Sialkot',
      fare: 450,
      date: '2026-09-12 21:30 PKT',
      vehicleType: 'GoRide Mini',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-901',
        title: 'Passenger Written Statement',
        type: 'document',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Mahnoor Tariq',
        uploadedAt: '2026-09-13 07:18 PKT',
        notes: 'Detailed typed statement with exact time stamps and location references.'
      }
    ],
    internalNotes: [
      {
        id: 'note-901',
        author: 'Ayesha Raza',
        authorRole: 'Senior Safety Officer',
        text: 'Driver immediately suspended across all city fleets. Senior Safety Committee convened at 14:00. Passenger reached by senior female safety representative offering full legal and psychological support. Case pending final disciplinary deactivation decision.',
        createdAt: '2026-09-13 08:30 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-9t1',
        timestamp: '2026-09-13 07:15 PKT',
        actor: 'Passenger: Mahnoor Tariq',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Harassment complaint submitted via GoLife Trust & Safety emergency pipeline.'
      },
      {
        id: 'ev-9t2',
        timestamp: '2026-09-13 07:25 PKT',
        actor: 'Admin: Ayesha Raza',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Assigned to Female Trust & Safety Lead.'
      },
      {
        id: 'ev-9t3',
        timestamp: '2026-09-13 08:00 PKT',
        actor: 'Admin: Ayesha Raza',
        actorRole: 'admin',
        action: 'Escalation',
        note: 'Escalated to Chief Operating Officer & Legal Counsel.'
      }
    ],
    financials: {
      originalFare: 450,
      finalFare: 0,
      refundAmount: 450,
      refundStatus: 'completed'
    },
    aiInsights: {
      summary: 'Zero-tolerance harassment allegation with locking of doors. Driver account is already suspended.',
      recommendedCategory: 'safety_report',
      recommendedPriority: 'urgent',
      duplicateRisk: false,
      similarCasesCount: 1,
      suggestedResolution: 'Complete committee review and execute permanent driver block in Driver Control.'
    }
  },

  // 10. Resolved Case (Route deviation fare refunded to wallet)
  {
    id: 'CASE-2026-8910',
    caseNumber: 'GL-CS-8910',
    type: 'ride_dispute',
    subCategory: 'Intentional Route Deviation',
    title: 'Driver took 8 km detour adding PKR 340 to fare without passenger consent',
    description: 'Passenger booked a direct ride from Gulberg III to DHA Phase 3, Lahore. Instead of taking Main Boulevard, driver looped via Walton Road to run personal errand, inflating fare by PKR 340.',
    priority: 'low',
    status: 'resolved',
    slaStatus: 'within_sla',
    createdAt: '2026-09-12 15:30 PKT',
    updatedAt: '2026-09-12 18:20 PKT',
    firstResponseAt: '2026-09-12 16:00 PKT',
    resolvedAt: '2026-09-12 18:20 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 0,
    city: 'Lahore',
    assignedAdmin: 'Zain Ul Abideen',
    assignedTeam: 'support',
    reporter: {
      id: 'p-110',
      name: 'Ali Raza',
      phone: '+92 300 5544332',
      role: 'passenger',
      rating: 4.7,
      totalTrips: 45
    },
    driver: {
      id: 'd-210',
      name: 'Mohsin Javed',
      phone: '+92 321 7788991',
      rating: 4.75,
      vehiclePlate: 'LEE-5091',
      vehicleModel: 'Toyota Vitz (Blue)',
      totalComplaints: 2,
      totalFines: 1,
      riskLevel: 'low',
      accountStatus: 'active'
    },
    passenger: {
      id: 'p-110',
      name: 'Ali Raza',
      phone: '+92 300 5544332',
      rating: 4.7,
      totalRides: 45,
      totalComplaints: 1,
      accountStatus: 'active'
    },
    ride: {
      id: 'r-410',
      code: 'GL-PK-89022',
      pickup: 'MM Alam Road, Gulberg III, Lahore',
      dropoff: 'Y-Block Market, DHA Phase 3, Lahore',
      fare: 860,
      date: '2026-09-12 14:40 PKT',
      vehicleType: 'GoRide Sedan',
      status: 'completed'
    },
    evidence: [
      {
        id: 'ev-1001',
        title: 'Route Comparison Telemetry Map',
        type: 'ride_telemetry',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Automated Telemetry Audit',
        uploadedAt: '2026-09-12 15:35 PKT',
        notes: 'GPS deviation confirmed: 7.9 extra km with 14 min stop at Walton Road.'
      }
    ],
    internalNotes: [
      {
        id: 'note-1001',
        author: 'Zain Ul Abideen',
        authorRole: 'Support Executive',
        text: 'Detour verified. PKR 340 credited directly to passenger GoLife wallet. Driver issued formal counseling notice regarding route compliance.',
        createdAt: '2026-09-12 18:15 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-10t1',
        timestamp: '2026-09-12 15:30 PKT',
        actor: 'Passenger: Ali Raza',
        actorRole: 'passenger',
        action: 'Case Created',
        note: 'Ride detour complaint submitted.'
      },
      {
        id: 'ev-10t2',
        timestamp: '2026-09-12 16:00 PKT',
        actor: 'Admin: Zain Ul Abideen',
        actorRole: 'admin',
        action: 'Admin Assigned',
        note: 'Assigned to General Dispute Desk.'
      },
      {
        id: 'ev-10t3',
        timestamp: '2026-09-12 18:15 PKT',
        actor: 'Admin: Zain Ul Abideen',
        actorRole: 'admin',
        action: 'Financial Action',
        note: 'PKR 340 refund credited to passenger wallet balance.'
      },
      {
        id: 'ev-10t4',
        timestamp: '2026-09-12 18:20 PKT',
        actor: 'Admin: Zain Ul Abideen',
        actorRole: 'admin',
        action: 'Resolution',
        note: 'Case resolved with passenger agreement.'
      }
    ],
    financials: {
      originalFare: 860,
      finalFare: 520,
      refundAmount: 340,
      refundStatus: 'completed'
    },
    resolution: {
      outcome: 'Resolved - Full Detour Refund Issued',
      note: 'Excess PKR 340 refunded to passenger wallet. Driver given compliance warning.',
      resolvedBy: 'Zain Ul Abideen',
      resolvedAt: '2026-09-12 18:20 PKT',
      financialActionTaken: true
    },
    aiInsights: {
      summary: 'Route deviation verified by GPS telemetry. Full detour amount was refunded to passenger wallet.',
      recommendedCategory: 'ride_dispute',
      recommendedPriority: 'low',
      duplicateRisk: false,
      similarCasesCount: 14,
      suggestedResolution: 'Closed satisfactorily.'
    }
  },

  // 11. SLA-Breached Case (Pending verification document discrepancy)
  {
    id: 'CASE-2026-8911',
    caseNumber: 'GL-CS-8911',
    type: 'general_support',
    subCategory: 'Driver Verification Document Rejection Appeal',
    title: 'Driver partner verification stalled for 36 hours due to NADRA CNIC mismatch',
    description: 'Driver candidate uploaded CNIC and driving license. NADRA API returned secondary address mismatch. Driver submitted verified Nadra family certificate and visited Lahore office, but case has remained unassigned for over 36 hours.',
    priority: 'high',
    status: 'open',
    slaStatus: 'sla_breached',
    createdAt: '2026-09-12 02:00 PKT',
    updatedAt: '2026-09-13 14:00 PKT',
    targetResolutionHours: 24,
    currentWaitingHours: 36.8,
    city: 'Lahore',
    assignedAdmin: 'Unassigned',
    assignedTeam: 'verification',
    reporter: {
      id: 'd-211',
      name: 'Tanveer Hussain',
      phone: '+92 301 2233889',
      role: 'driver',
      rating: 5.0,
      totalTrips: 0
    },
    driver: {
      id: 'd-211',
      name: 'Tanveer Hussain',
      phone: '+92 301 2233889',
      rating: 5.0,
      vehiclePlate: 'LEA-1922',
      vehicleModel: 'Honda Pridor (Red)',
      totalComplaints: 0,
      totalFines: 0,
      riskLevel: 'low',
      accountStatus: 'pending'
    },
    evidence: [
      {
        id: 'ev-1101',
        title: 'NADRA Smart CNIC Scan Front & Back',
        type: 'document',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        uploadedBy: 'Tanveer Hussain',
        uploadedAt: '2026-09-12 02:05 PKT',
        notes: 'High-res scan with holographic seal clearly visible.'
      }
    ],
    internalNotes: [
      {
        id: 'note-1101',
        author: 'System SLA Monitor',
        authorRole: 'SLA Engine',
        text: 'CRITICAL ALERT: Target SLA was 24 hours. Current waiting time is 36.8 hours. Flagged as SLA Breached. Immediate assignment required.',
        createdAt: '2026-09-13 02:00 PKT',
        isInternalOnly: true
      }
    ],
    timeline: [
      {
        id: 'ev-11t1',
        timestamp: '2026-09-12 02:00 PKT',
        actor: 'Driver: Tanveer Hussain',
        actorRole: 'driver',
        action: 'Case Created',
        note: 'Verification appeal lodged via Driver Partner Portal.'
      },
      {
        id: 'ev-11t2',
        timestamp: '2026-09-13 02:00 PKT',
        actor: 'System: SLA Monitor',
        actorRole: 'system',
        action: 'Escalation',
        note: 'SLA Breached (36+ hours elapsed without resolution).'
      }
    ],
    aiInsights: {
      summary: 'Verification appeal has breached 24-hour turnaround window. Documents appear authentic and match NADRA digital watermark.',
      recommendedCategory: 'general_support',
      recommendedPriority: 'high',
      duplicateRisk: false,
      similarCasesCount: 6,
      suggestedResolution: 'Assign immediately to Senior Verification Officer to finalize document approval.'
    }
  }
];

export function getCaseTypeBadge(type: any) {
  let label = 'General Support';
  let bg = 'bg-slate-100 text-slate-800 border-slate-300';
  let isSafety = false;

  switch (type) {
    case 'safety_report':
    case 'safety_emergency':
      label = 'Safety & Emergency';
      bg = 'bg-rose-100 text-rose-800 border-rose-300';
      isSafety = true;
      break;
    case 'driver_complaint':
    case 'driver_conduct':
      label = 'Driver Conduct';
      bg = 'bg-amber-100 text-amber-900 border-amber-300';
      break;
    case 'passenger_complaint':
    case 'passenger_conduct':
      label = 'Passenger Conduct';
      bg = 'bg-blue-100 text-blue-900 border-blue-300';
      break;
    case 'fare_dispute':
      label = 'Fare Dispute';
      bg = 'bg-purple-100 text-purple-900 border-purple-300';
      break;
    case 'cancellation_dispute':
      label = 'Cancellation Dispute';
      bg = 'bg-orange-100 text-orange-900 border-orange-300';
      break;
    case 'payment_dispute':
    case 'payment_refund':
      label = 'Payment & Refund';
      bg = 'bg-indigo-100 text-indigo-900 border-indigo-300';
      break;
    case 'fine_dispute':
      label = 'Fine Dispute';
      bg = 'bg-orange-100 text-orange-900 border-orange-300';
      break;
    case 'refund_request':
      label = 'Refund Request';
      bg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      break;
    case 'lost_found':
      label = 'Lost & Found';
      bg = 'bg-teal-100 text-teal-900 border-teal-300';
      break;
    case 'vehicle_condition':
      label = 'Vehicle Condition';
      bg = 'bg-yellow-100 text-yellow-900 border-yellow-300';
      break;
    case 'route_gps_issue':
      label = 'Route / GPS Issue';
      bg = 'bg-cyan-100 text-cyan-900 border-cyan-300';
      break;
    case 'account_document':
      label = 'Account / Document';
      bg = 'bg-sky-100 text-sky-900 border-sky-300';
      break;
    case 'general_support':
    default:
      label = 'General Support';
      bg = 'bg-slate-100 text-slate-800 border-slate-300';
      break;
  }

  return { label, bg, className: bg, isSafety };
}

export function getCasePriorityBadge(priority: any) {
  let label = 'Normal';
  let bg = 'bg-slate-100 text-slate-800 border border-slate-200';

  switch (priority) {
    case 'critical':
      label = 'Critical';
      bg = 'bg-rose-600 text-white font-black animate-pulse';
      break;
    case 'urgent':
      label = 'Urgent';
      bg = 'bg-orange-500 text-white font-bold';
      break;
    case 'high':
      label = 'High';
      bg = 'bg-amber-400 text-slate-950 font-bold';
      break;
    case 'normal':
      label = 'Normal';
      bg = 'bg-slate-100 text-slate-800 border border-slate-200';
      break;
    case 'low':
    default:
      label = 'Low';
      bg = 'bg-slate-50 text-slate-600 border border-slate-200';
      break;
  }

  return { label, bg, className: bg };
}

export function getCaseStatusBadge(status: any) {
  let label = 'Closed';
  let bg = 'bg-slate-100 text-slate-500 border-slate-200';

  switch (status) {
    case 'new':
      label = 'New';
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'open':
      label = 'Open';
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'under_review':
      label = 'Under Review';
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'waiting_for_driver':
      label = 'Waiting for Driver';
      bg = 'bg-orange-50 text-orange-800 border-orange-200';
      break;
    case 'waiting_for_passenger':
      label = 'Waiting for Passenger';
      bg = 'bg-sky-50 text-sky-800 border-sky-200';
      break;
    case 'escalated':
      label = 'Escalated';
      bg = 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      break;
    case 'resolved':
      label = 'Resolved';
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      break;
    case 'rejected':
      label = 'Rejected';
      bg = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'closed':
    default:
      label = 'Closed';
      bg = 'bg-slate-100 text-slate-500 border-slate-200';
      break;
  }

  return { label, bg, className: bg };
}

export function getCaseSLABadge(slaStatus: any) {
  let label = 'Within SLA';
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  switch (slaStatus) {
    case 'within_sla':
      label = 'Within SLA';
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'near_sla':
      label = 'Near SLA Warning';
      bg = 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse';
      break;
    case 'sla_breached':
      label = 'SLA Breached';
      bg = 'bg-rose-600 text-white font-black';
      break;
  }

  return { label, bg, className: bg };
}

export const getSlaBadge = getCaseSLABadge;

