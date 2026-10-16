import {
  PromoCode,
  PromoUsageRecord,
  PromotionCampaign,
  ReferralRecord,
  ReferralRewardRule,
  DriverRewardRule,
  PassengerRewardRule,
  RewardRecord,
  FraudDetectionAlert,
  PromotionAiInsight,
  PromotionsSummaryMetrics,
  RideCategory
} from '../types';

// =========================================================================
// 1. INITIAL DEMO PROMO CODES (PAKISTAN REGIONAL & NATIONAL)
// =========================================================================
export const INITIAL_DEMO_PROMOS: PromoCode[] = [
  {
    id: 'pr-601',
    code: 'GOLIFEAZADI',
    displayName: 'Azadi National Celebration 25%',
    description: 'Independence month special 25% discount on GoMini, GoRide & GoComfort across major cities',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscount: 200,
    minFare: 350,
    usageLimit: 5000,
    usagePerPassenger: 3,
    usageCount: 1840,
    usedCount: 1840,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    expiresAt: '2026-09-30',
    expiryDate: '2026-09-30',
    active: true,
    paused: false,
    status: 'active',
    applicableCity: 'All',
    applicableCities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
    applicableCategories: ['GoMini', 'GoRide', 'GoComfort'],
    targetAudience: 'all',
    paymentMethodEligibility: ['all', 'cash', 'jazzcash', 'easypaisa', 'card', 'wallet'],
    campaignId: 'camp-azadi-26',
    createdAt: '2026-08-01 10:00 PKT'
  },
  {
    id: 'pr-602',
    code: 'FIRSTPKR100',
    displayName: 'Welcome New Passenger Rs. 100 Off',
    description: 'Flat Rs. 100 off on first completed booking for new app users nationwide',
    discountType: 'fixed',
    discountValue: 100,
    maxDiscount: 100,
    minFare: 200,
    usageLimit: 10000,
    usagePerPassenger: 1,
    usageCount: 4210,
    usedCount: 4210,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    expiresAt: '2026-12-31',
    expiryDate: '2026-12-31',
    active: true,
    paused: false,
    status: 'active',
    applicableCity: 'All',
    applicableCities: ['All'],
    applicableCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    targetAudience: 'new_passengers',
    paymentMethodEligibility: ['all'],
    campaignId: 'camp-onboarding-26',
    createdAt: '2026-01-01 00:00 PKT'
  },
  {
    id: 'pr-603',
    code: 'GOMOTO50',
    displayName: 'GoMoto Rush Hours Saver',
    description: 'Flat Rs. 50 subsidy on bike rides in Lahore & Karachi during peak office hours (8AM-11AM & 5PM-8PM)',
    discountType: 'fixed',
    discountValue: 50,
    maxDiscount: 50,
    minFare: 120,
    usageLimit: 3000,
    usagePerPassenger: 5,
    usageCount: 920,
    usedCount: 920,
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    expiresAt: '2026-10-15',
    expiryDate: '2026-10-15',
    active: true,
    paused: false,
    status: 'active',
    applicableCity: 'Lahore',
    applicableCities: ['Lahore', 'Karachi'],
    applicableCategories: ['GoMoto'],
    targetAudience: 'all',
    paymentMethodEligibility: ['cash', 'easypaisa', 'jazzcash'],
    campaignId: 'camp-rush-moto',
    createdAt: '2026-09-01 08:30 PKT'
  },
  {
    id: 'pr-604',
    code: 'ISBEXEC30',
    displayName: 'Islamabad Corporate & Airport Prime 30%',
    description: '30% discount capped at Rs. 350 for GoComfort executive rides to/from Islamabad International Airport',
    discountType: 'percentage',
    discountValue: 30,
    maxDiscount: 350,
    minFare: 650,
    usageLimit: 2000,
    usagePerPassenger: 2,
    usageCount: 480,
    usedCount: 480,
    startDate: '2026-09-05',
    endDate: '2026-10-31',
    expiresAt: '2026-10-31',
    expiryDate: '2026-10-31',
    active: true,
    paused: false,
    status: 'active',
    applicableCity: 'Islamabad',
    applicableCities: ['Islamabad', 'Rawalpindi'],
    applicableCategories: ['GoComfort'],
    targetAudience: 'existing_passengers',
    paymentMethodEligibility: ['card', 'jazzcash', 'wallet'],
    campaignId: 'camp-isb-air',
    createdAt: '2026-09-05 14:00 PKT'
  },
  {
    id: 'pr-605',
    code: 'KHIWEEKEND',
    displayName: 'Karachi Seaview & Clifton Weekend 20%',
    description: 'Weekend leisure 20% off for families visiting Clifton, DHA, and Port Grand',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 180,
    minFare: 300,
    usageLimit: 4000,
    usagePerPassenger: 2,
    usageCount: 1250,
    usedCount: 1250,
    startDate: '2026-08-15',
    endDate: '2026-11-30',
    expiresAt: '2026-11-30',
    expiryDate: '2026-11-30',
    active: true,
    paused: false,
    status: 'active',
    applicableCity: 'Karachi',
    applicableCities: ['Karachi'],
    applicableCategories: ['GoMini', 'GoRide', 'GoComfort'],
    targetAudience: 'all',
    paymentMethodEligibility: ['all'],
    campaignId: 'camp-khi-expand',
    createdAt: '2026-08-15 11:20 PKT'
  },
  {
    id: 'pr-606',
    code: 'PSL2026SPECIAL',
    displayName: 'PSL Cricket Season Promo (Expired)',
    description: 'Flat Rs. 120 off stadium route rides during Pakistan Super League tournament',
    discountType: 'fixed',
    discountValue: 120,
    maxDiscount: 120,
    minFare: 300,
    usageLimit: 6000,
    usagePerPassenger: 4,
    usageCount: 5980,
    usedCount: 5980,
    startDate: '2026-02-10',
    endDate: '2026-03-25',
    expiresAt: '2026-03-25',
    expiryDate: '2026-03-25',
    active: false,
    paused: false,
    status: 'expired',
    applicableCity: 'All',
    applicableCities: ['Lahore', 'Karachi', 'Rawalpindi', 'Multan'],
    applicableCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    targetAudience: 'all',
    paymentMethodEligibility: ['all'],
    createdAt: '2026-02-05 12:00 PKT'
  }
];

// =========================================================================
// 2. INITIAL DEMO PROMOTIONAL CAMPAIGNS WITH BUDGET CONTROL
// =========================================================================
export const INITIAL_DEMO_CAMPAIGNS: PromotionCampaign[] = [
  {
    id: 'camp-azadi-26',
    name: 'Pakistan Independence Jashan-e-Azadi Blitz',
    description: 'Nationwide promotional sprint boosting ride volume across Lahore, Karachi & Twin Cities during August-September',
    campaignType: 'holiday_festival',
    audience: 'all_passengers',
    city: 'All Major Cities',
    serviceCategory: 'GoMini, GoRide, GoComfort',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    totalBudget: 1500000, // PKR 1.5 Million
    maxDiscountBudget: 1100000,
    maxRewardBudget: 400000,
    spentBudget: 624500,
    reservedBudget: 280000,
    maxUsers: 10000,
    currentUsersCount: 4210,
    maxUses: 15000,
    currentUsesCount: 6050,
    associatedPromoCodes: ['GOLIFEAZADI', 'FIRSTPKR100'],
    status: 'active',
    createdAt: '2026-07-28 15:30 PKT'
  },
  {
    id: 'camp-khi-expand',
    name: 'Karachi Coastal & Industrial Fleet Surge',
    description: 'City expansion campaign to acquire new riders in North Nazimabad, Gulshan, Korangi and SITE industrial corridor',
    campaignType: 'city_launch',
    audience: 'selected_city',
    city: 'Karachi',
    serviceCategory: 'GoMini, GoRide',
    startDate: '2026-08-15',
    endDate: '2026-11-30',
    totalBudget: 900000,
    maxDiscountBudget: 650000,
    maxRewardBudget: 250000,
    spentBudget: 345000,
    reservedBudget: 180000,
    maxUsers: 6000,
    currentUsersCount: 2310,
    maxUses: 9000,
    currentUsesCount: 3120,
    associatedPromoCodes: ['KHIWEEKEND'],
    status: 'active',
    createdAt: '2026-08-12 11:00 PKT'
  },
  {
    id: 'camp-rush-moto',
    name: 'Twin Cities & Lahore Moto Peak Micro-Subsidy',
    description: 'Encouraging solo commuters to switch to GoMoto during rush hours to reduce street congestion',
    campaignType: 'rush_hour',
    audience: 'all_passengers',
    city: 'Lahore & Rawalpindi',
    serviceCategory: 'GoMoto',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    totalBudget: 400000,
    maxDiscountBudget: 320000,
    maxRewardBudget: 80000,
    spentBudget: 112500,
    reservedBudget: 95000,
    maxUsers: 4000,
    currentUsersCount: 1480,
    maxUses: 5000,
    currentUsesCount: 1840,
    associatedPromoCodes: ['GOMOTO50'],
    status: 'active',
    createdAt: '2026-08-30 09:40 PKT'
  },
  {
    id: 'camp-driver-recruit',
    name: 'Q4 Driver Partner Captains Recruitment',
    description: 'Rewarding registered drivers for onboarding new verified drivers in Faisalabad and Multan',
    campaignType: 'driver_recruitment',
    audience: 'all_drivers',
    city: 'Faisalabad, Multan',
    serviceCategory: 'All Categories',
    startDate: '2026-09-15',
    endDate: '2026-12-15',
    totalBudget: 750000,
    maxDiscountBudget: 150000,
    maxRewardBudget: 600000,
    spentBudget: 85000,
    reservedBudget: 220000,
    maxUsers: 1500,
    currentUsersCount: 290,
    maxUses: 1500,
    currentUsesCount: 290,
    associatedPromoCodes: [],
    status: 'scheduled',
    createdAt: '2026-09-10 16:00 PKT'
  }
];

// =========================================================================
// 3. INITIAL DEMO REFERRAL REWARD RULES
// =========================================================================
export const INITIAL_DEMO_REFERRAL_RULES: ReferralRewardRule[] = [
  {
    id: 'rule-ref-p2p',
    programName: 'Passenger to Passenger Referral Program',
    programType: 'passenger_to_passenger',
    referrerRewardAmount: 200, // PKR 200 wallet credit
    refereeRewardAmount: 100, // PKR 100 first ride discount
    rewardType: 'fixed',
    qualificationRideCount: 3, // Friend must complete 3 rides
    minimumRideFare: 150, // Rides under Rs. 150 do not qualify
    qualificationPeriodDays: 30, // Within 30 days
    applicableCities: ['All'],
    applicableCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort'],
    maxRewardsPerUser: 10,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    createdAt: '2026-01-01 00:00 PKT',
    updatedAt: '2026-08-15 12:00 PKT'
  },
  {
    id: 'rule-ref-d2d',
    programName: 'Captain to Captain (Driver Referral)',
    programType: 'driver_to_driver',
    referrerRewardAmount: 1000, // PKR 1,000 for driver
    refereeRewardAmount: 500, // PKR 500 welcome bonus for referred driver
    rewardType: 'fixed',
    qualificationRideCount: 25, // New driver must finish 25 rides
    minimumRideFare: 120,
    qualificationPeriodDays: 21, // Within 21 days of document verification
    applicableCities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
    applicableCategories: ['GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight'],
    maxRewardsPerUser: 20,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    createdAt: '2026-01-01 00:00 PKT',
    updatedAt: '2026-09-01 10:00 PKT'
  },
  {
    id: 'rule-ref-cross',
    programName: 'Cross-User Referral (Passenger Refers Driver)',
    programType: 'cross_user',
    referrerRewardAmount: 300,
    refereeRewardAmount: 300,
    rewardType: 'fixed',
    qualificationRideCount: 15,
    minimumRideFare: 150,
    qualificationPeriodDays: 25,
    applicableCities: ['All'],
    applicableCategories: ['GoRide', 'GoMini', 'GoComfort'],
    maxRewardsPerUser: 5,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    active: true,
    createdAt: '2026-03-01 09:00 PKT',
    updatedAt: '2026-07-20 14:00 PKT'
  }
];

// =========================================================================
// 4. INITIAL DEMO REFERRALS (PAKISTANI NAMES, PHONES & COMPLETE LIFECYCLES)
// =========================================================================
export const INITIAL_DEMO_REFERRALS: ReferralRecord[] = [
  {
    id: 'REF-001',
    referrerType: 'passenger',
    referrerId: 'p-101',
    referrerName: 'Zainab Fatima',
    referrerPhone: '+92 300 8472911',
    refereeType: 'passenger',
    refereeId: 'p-109',
    refereeName: 'Sadia Malik',
    refereePhone: '+92 301 2345678',
    referralCode: 'ZAINAB50',
    rewardAmount: 200,
    referrerRewardAmount: 200,
    refereeRewardAmount: 100,
    status: 'rewarded',
    tripsCompleted: 3,
    tripsRequired: 3,
    qualificationPeriodDays: 30,
    minRideFare: 150,
    city: 'Lahore',
    date: '2026-09-10 14:20 PKT',
    rewardDisbursed: true,
    rewardDisbursedAt: '2026-09-10 16:30 PKT'
  },
  {
    id: 'REF-002',
    referrerType: 'driver',
    referrerId: 'd-201',
    referrerName: 'Muhammad Tariq',
    referrerPhone: '+92 321 9876543',
    refereeType: 'driver',
    refereeId: 'd-208',
    refereeName: 'Imran Ashraf',
    refereePhone: '+92 302 7654321',
    referralCode: 'TARIQDRV',
    rewardAmount: 1000,
    referrerRewardAmount: 1000,
    refereeRewardAmount: 500,
    status: 'rewarded',
    tripsCompleted: 25,
    tripsRequired: 25,
    qualificationPeriodDays: 21,
    minRideFare: 120,
    city: 'Karachi',
    date: '2026-09-08 11:00 PKT',
    rewardDisbursed: true,
    rewardDisbursedAt: '2026-09-08 14:15 PKT'
  },
  {
    id: 'REF-003',
    referrerType: 'passenger',
    referrerId: 'p-102',
    referrerName: 'Hamza Shabbir',
    referrerPhone: '+92 321 4591028',
    refereeType: 'passenger',
    refereeId: 'p-110',
    refereeName: 'Bilal Qureshi',
    refereePhone: '+92 333 9871234',
    referralCode: 'HAMZA99',
    rewardAmount: 200,
    referrerRewardAmount: 200,
    refereeRewardAmount: 100,
    status: 'pending_qualification',
    tripsCompleted: 2,
    tripsRequired: 3,
    qualificationPeriodDays: 30,
    minRideFare: 150,
    city: 'Islamabad',
    date: '2026-09-11 16:45 PKT',
    rewardDisbursed: false
  },
  {
    id: 'REF-004',
    referrerType: 'driver',
    referrerId: 'd-203',
    referrerName: 'Kamran Akmal',
    referrerPhone: '+92 301 9876543',
    refereeType: 'driver',
    refereeId: 'd-209',
    refereeName: 'Waleed Raza',
    refereePhone: '+92 345 1122334',
    referralCode: 'KAMRANRIDE',
    rewardAmount: 1000,
    referrerRewardAmount: 1000,
    refereeRewardAmount: 500,
    status: 'pending_qualification',
    tripsCompleted: 14,
    tripsRequired: 25,
    qualificationPeriodDays: 21,
    minRideFare: 120,
    city: 'Rawalpindi',
    date: '2026-09-12 09:30 PKT',
    rewardDisbursed: false
  },
  {
    id: 'REF-005',
    referrerType: 'passenger',
    referrerId: 'p-103',
    referrerName: 'Engr. Usman Qureshi',
    referrerPhone: '+92 333 5188290',
    refereeType: 'passenger',
    refereeId: 'p-111',
    refereeName: 'Shahbaz Sharif Jr.',
    refereePhone: '+92 300 1199228',
    referralCode: 'USMANQ',
    rewardAmount: 200,
    referrerRewardAmount: 200,
    refereeRewardAmount: 100,
    status: 'qualified',
    tripsCompleted: 3,
    tripsRequired: 3,
    qualificationPeriodDays: 30,
    minRideFare: 150,
    city: 'Lahore',
    date: '2026-09-12 11:10 PKT',
    rewardDisbursed: false
  },
  {
    id: 'REF-006',
    referrerType: 'passenger',
    referrerId: 'p-106',
    referrerName: 'Maha Javed',
    referrerPhone: '+92 301 7733221',
    refereeType: 'passenger',
    refereeId: 'p-112',
    refereeName: 'Nida Dar',
    refereePhone: '+92 322 8844991',
    referralCode: 'MAHA2026',
    rewardAmount: 200,
    referrerRewardAmount: 200,
    refereeRewardAmount: 100,
    status: 'registered',
    tripsCompleted: 0,
    tripsRequired: 3,
    qualificationPeriodDays: 30,
    minRideFare: 150,
    city: 'Lahore',
    date: '2026-09-13 10:15 PKT',
    rewardDisbursed: false
  },
  {
    id: 'REF-007',
    referrerType: 'passenger',
    referrerId: 'p-108',
    referrerName: 'Adnan Sami',
    referrerPhone: '+92 334 9911882',
    refereeType: 'passenger',
    refereeId: 'p-113',
    refereeName: 'Adnan Sami Dup',
    refereePhone: '+92 334 9911882',
    referralCode: 'ADNANREF',
    rewardAmount: 200,
    referrerRewardAmount: 200,
    refereeRewardAmount: 100,
    status: 'rejected',
    tripsCompleted: 3,
    tripsRequired: 3,
    qualificationPeriodDays: 30,
    minRideFare: 150,
    city: 'Karachi',
    date: '2026-09-11 18:20 PKT',
    rewardDisbursed: false,
    rejectionReason: 'Self-referral flagged: Referrer and referee share identical mobile phone and payment card',
    suspicionFlag: true,
    suspicionReason: 'Duplicate phone number match and rapid ride loop'
  }
];

// =========================================================================
// 5. INITIAL DEMO DRIVER REWARD RULES
// =========================================================================
export const INITIAL_DEMO_DRIVER_REWARD_RULES: DriverRewardRule[] = [
  {
    id: 'drv-rew-weekly-50',
    title: 'Weekly 50 Trips Milestone Bounty',
    type: 'ride_milestone',
    description: 'Complete 50 rides within a Monday-Sunday cycle to unlock PKR 2,500 direct wallet credit',
    rewardAmount: 2500,
    targetMilestoneRides: 50,
    minCompletionRate: 92,
    minRating: 4.75,
    maxCancellationRate: 5,
    city: 'All',
    serviceCategory: 'All',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    budgetCap: 500000,
    disbursedBudget: 185000
  },
  {
    id: 'drv-rew-perf-star',
    title: 'Elite Service Quality & Zero Complaints',
    type: 'performance_rating',
    description: 'Maintain minimum 4.90 rating across 30+ trips in a calendar month with zero passenger safety complaints',
    rewardAmount: 1800,
    minRating: 4.90,
    minCompletionRate: 95,
    city: 'All',
    serviceCategory: 'GoMini, GoRide, GoComfort',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    budgetCap: 300000,
    disbursedBudget: 114000
  },
  {
    id: 'drv-rew-new-starter',
    title: 'New Captain First 15 Rides Bonus',
    type: 'new_driver_incentive',
    description: 'Welcome reward for newly verified captains who complete their first 15 trips in 10 days',
    rewardAmount: 1500,
    targetMilestoneRides: 15,
    city: 'All',
    serviceCategory: 'All',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    budgetCap: 450000,
    disbursedBudget: 162000
  },
  {
    id: 'drv-rew-khi-launch',
    title: 'Karachi West & Korangi Peak Presence Bonus',
    type: 'city_launch_bonus',
    description: 'Log 6+ active online peak hours in industrial sectors of Karachi with at least 8 completed pickups',
    rewardAmount: 1200,
    targetMilestoneRides: 8,
    minCompletionRate: 90,
    city: 'Karachi',
    serviceCategory: 'GoMoto, GoAuto, GoMini',
    startDate: '2026-08-15',
    endDate: '2026-10-31',
    active: true,
    budgetCap: 200000,
    disbursedBudget: 68400
  }
];

// =========================================================================
// 6. INITIAL DEMO PASSENGER REWARD RULES
// =========================================================================
export const INITIAL_DEMO_PASSENGER_REWARD_RULES: PassengerRewardRule[] = [
  {
    id: 'pax-rew-first-ride',
    title: 'First Ride Completion Cashback',
    type: 'first_ride',
    description: 'Rs. 100 credited to wallet upon successful completion of maiden GoLife ride',
    rewardAmount: 100,
    requiredRideCount: 1,
    minSpentAmount: 150,
    city: 'All',
    active: true,
    expiryDays: 30,
    budgetCap: 250000,
    disbursedBudget: 89000
  },
  {
    id: 'pax-rew-milestone-10',
    title: '10th Ride Commuter Loyalty Reward',
    type: 'ride_milestone',
    description: 'Rs. 250 wallet credit automatically issued when a rider crosses 10 completed rides in a single month',
    rewardAmount: 250,
    requiredRideCount: 10,
    minSpentAmount: 2000,
    city: 'All',
    active: true,
    expiryDays: 60,
    budgetCap: 350000,
    disbursedBudget: 142500
  },
  {
    id: 'pax-rew-eid-festivity',
    title: 'Eid & Holiday Community Loyalty Cash',
    type: 'loyalty',
    description: 'Special seasonal cashback reward for active passengers taking intercity or family trips',
    rewardAmount: 300,
    requiredRideCount: 4,
    minSpentAmount: 1200,
    city: 'All',
    active: true,
    expiryDays: 45,
    budgetCap: 300000,
    disbursedBudget: 112000
  }
];

// =========================================================================
// 7. INITIAL REWARDS HISTORY LEDGER (DRIVERS & PASSENGERS)
// =========================================================================
export const INITIAL_DEMO_REWARDS_HISTORY: RewardRecord[] = [
  {
    id: 'REW-9801',
    userType: 'driver',
    userId: 'd-201',
    userName: 'Muhammad Asif Rasheed',
    userPhone: '+92 302 4491823',
    rewardType: 'Weekly 50 Trips Milestone',
    reason: 'Completed 54 trips in Week 36 with 96% completion rate',
    amount: 2500,
    relatedCampaignId: 'camp-azadi-26',
    status: 'credited',
    creditedAt: '2026-09-08 09:15 PKT',
    transactionId: 'TXN-90211',
    date: '2026-09-08 09:15 PKT',
    city: 'Lahore'
  },
  {
    id: 'REW-9802',
    userType: 'driver',
    userId: 'd-202',
    userName: 'Khurram Shehzad',
    userPhone: '+92 321 9918204',
    rewardType: 'Elite Quality & 4.92 Rating',
    reason: 'Monthly 5-star performance rating across 42 trips in Karachi',
    amount: 1800,
    status: 'credited',
    creditedAt: '2026-09-07 16:40 PKT',
    transactionId: 'TXN-90204',
    date: '2026-09-07 16:40 PKT',
    city: 'Karachi'
  },
  {
    id: 'REW-9803',
    userType: 'passenger',
    userId: 'p-101',
    userName: 'Zainab Fatima',
    userPhone: '+92 300 8472911',
    rewardType: 'Referral Reward',
    reason: 'Friend Sadia Malik completed 3 qualifying rides',
    amount: 200,
    relatedRideId: 'r-401',
    status: 'credited',
    creditedAt: '2026-09-10 16:30 PKT',
    transactionId: 'TXN-90215',
    date: '2026-09-10 16:30 PKT',
    city: 'Lahore'
  },
  {
    id: 'REW-9804',
    userType: 'driver',
    userId: 'd-203',
    userName: 'Abdul Rehman Gujjar',
    userPhone: '+92 334 1122890',
    rewardType: 'New Captain First 15 Rides',
    reason: 'Successfully completed initial 15 trips in Rawalpindi/Islamabad within 8 days',
    amount: 1500,
    status: 'credited',
    creditedAt: '2026-09-11 12:00 PKT',
    transactionId: 'TXN-90217',
    date: '2026-09-11 12:00 PKT',
    city: 'Rawalpindi'
  },
  {
    id: 'REW-9805',
    userType: 'passenger',
    userId: 'p-106',
    userName: 'Maha Javed',
    userPhone: '+92 301 7733221',
    rewardType: '10th Ride Commuter Loyalty',
    reason: 'Reached 10 completed rides milestone in Lahore during September',
    amount: 250,
    relatedRideId: 'r-404',
    status: 'credited',
    creditedAt: '2026-09-12 18:00 PKT',
    transactionId: 'TXN-90220',
    date: '2026-09-12 18:00 PKT',
    city: 'Lahore'
  },
  {
    id: 'REW-9806',
    userType: 'passenger',
    userId: 'p-103',
    userName: 'Engr. Usman Qureshi',
    userPhone: '+92 333 5188290',
    rewardType: 'Referral Reward',
    reason: 'Referred passenger Shahbaz Sharif Jr. qualified',
    amount: 200,
    status: 'approved',
    date: '2026-09-12 11:15 PKT',
    city: 'Lahore'
  }
];

// =========================================================================
// 8. INITIAL DEMO PROMO USAGE RECORDS (AUDITABLE HISTORICAL RIDES)
// =========================================================================
export const INITIAL_DEMO_PROMO_USAGES: PromoUsageRecord[] = [
  {
    id: 'pusg-101',
    promoCode: 'GOLIFEAZADI',
    promoId: 'pr-601',
    passengerId: 'p-101',
    passengerName: 'Zainab Fatima',
    passengerPhone: '+92 300 8472911',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    rideId: 'r-401',
    rideCode: 'GL-PK-89091',
    originalFare: 480,
    discountAmount: 120, // 25% of 480
    finalFare: 360,
    city: 'Lahore',
    serviceCategory: 'GoMini',
    usedAt: '2026-09-12 14:10 PKT',
    status: 'applied',
    ruleVersionApplied: 'PRV-2026-v40.1'
  },
  {
    id: 'pusg-102',
    promoCode: 'FIRSTPKR100',
    promoId: 'pr-602',
    passengerId: 'p-106',
    passengerName: 'Maha Javed',
    passengerPhone: '+92 301 7733221',
    driverId: 'd-201',
    driverName: 'Muhammad Asif Rasheed',
    rideId: 'r-404',
    rideCode: 'GL-PK-89092',
    originalFare: 750,
    discountAmount: 100,
    finalFare: 650,
    city: 'Lahore',
    serviceCategory: 'GoMini',
    usedAt: '2026-09-12 16:30 PKT',
    status: 'applied',
    ruleVersionApplied: 'PRV-2026-v40.1'
  },
  {
    id: 'pusg-103',
    promoCode: 'GOMOTO50',
    promoId: 'pr-603',
    passengerId: 'p-103',
    passengerName: 'Engr. Usman Qureshi',
    passengerPhone: '+92 333 5188290',
    driverId: 'd-203',
    driverName: 'Abdul Rehman Gujjar',
    rideId: 'r-403',
    rideCode: 'GL-PK-89098',
    originalFare: 340,
    discountAmount: 50,
    finalFare: 290,
    city: 'Rawalpindi',
    serviceCategory: 'GoMoto',
    usedAt: '2026-09-12 16:45 PKT',
    status: 'applied',
    ruleVersionApplied: 'PRV-2026-v40.1'
  },
  {
    id: 'pusg-104',
    promoCode: 'KHIWEEKEND',
    promoId: 'pr-605',
    passengerId: 'p-102',
    passengerName: 'Hamza Shabbir',
    passengerPhone: '+92 321 4591028',
    driverId: 'd-202',
    driverName: 'Khurram Shehzad',
    rideId: 'r-402',
    rideCode: 'GL-PK-89094',
    originalFare: 920,
    discountAmount: 180, // 20% capped at 180
    finalFare: 740,
    city: 'Karachi',
    serviceCategory: 'GoRide',
    usedAt: '2026-09-12 18:08 PKT',
    status: 'applied',
    ruleVersionApplied: 'PRV-2026-v40.1'
  },
  {
    id: 'pusg-105',
    promoCode: 'GOLIFEAZADI',
    promoId: 'pr-601',
    passengerId: 'p-104',
    passengerName: 'Sanaullah Khan',
    passengerPhone: '+92 345 8899001',
    rideId: 'r-405',
    rideCode: 'GL-PK-89082',
    originalFare: 280,
    discountAmount: 0,
    finalFare: 280,
    city: 'Multan',
    serviceCategory: 'GoAuto',
    usedAt: '2026-09-11 13:20 PKT',
    status: 'failed',
    failureReason: 'Minimum fare requirement of PKR 350 not satisfied (ride fare: PKR 280)',
    ruleVersionApplied: 'PRV-2026-v40.1'
  },
  {
    id: 'pusg-106',
    promoCode: 'ISBEXEC30',
    promoId: 'pr-604',
    passengerId: 'p-105',
    passengerName: 'Dr. Ayesha Malik',
    passengerPhone: '+92 333 4455667',
    driverId: 'd-204',
    driverName: 'Nawazish Ali',
    rideId: 'r-406',
    rideCode: 'GL-PK-89079',
    originalFare: 1400,
    discountAmount: 350, // Capped at 350
    finalFare: 1050,
    city: 'Islamabad',
    serviceCategory: 'GoComfort',
    usedAt: '2026-09-10 19:40 PKT',
    status: 'applied',
    ruleVersionApplied: 'PRV-2026-v40.1'
  }
];

// =========================================================================
// 9. INITIAL DEMO FRAUD DETECTION ALERTS
// =========================================================================
export const INITIAL_DEMO_FRAUD_ALERTS: FraudDetectionAlert[] = [
  {
    id: 'frd-801',
    type: 'self_referral',
    severity: 'high',
    userId: 'p-108',
    userName: 'Adnan Sami',
    userType: 'passenger',
    userPhone: '+92 334 9911882',
    description: 'Matching phone number and device identifier across referrer and referee accounts',
    details: 'Referrer Adnan Sami invited account p-113 with the exact same phone number +92 334 9911882 from IMEI #3598120019281. Reward was blocked.',
    status: 'pending_review',
    detectedAt: '2026-09-11 18:22 PKT'
  },
  {
    id: 'frd-802',
    type: 'velocity_anomaly',
    severity: 'medium',
    userId: 'p-114',
    userName: 'Taimoor Shah',
    userType: 'passenger',
    userPhone: '+92 300 5544332',
    description: 'Suspicious promo redemption rate: 6 promo attempts within 14 minutes across multiple mock pickup points',
    details: 'Multiple rapid ride requests cancelled immediately after promo GOLIFEAZADI applied. Suspected automated scripting or testing.',
    status: 'pending_review',
    detectedAt: '2026-09-12 15:40 PKT'
  },
  {
    id: 'frd-803',
    type: 'duplicate_reward_claim',
    severity: 'low',
    userId: 'd-205',
    userName: 'Bashir Ahmed Khan',
    userType: 'driver',
    userPhone: '+92 313 7788990',
    description: 'Duplicate claim for First 15 Rides bonus submitted twice via offline support query',
    details: 'Driver claimed First 15 Rides welcome reward after already having received bonus under ID REW-9742 last month.',
    status: 'investigated',
    detectedAt: '2026-09-10 11:30 PKT'
  }
];

// =========================================================================
// 10. INITIAL AI ADVISORY INSIGHTS
// =========================================================================
export const INITIAL_DEMO_PROMO_AI_INSIGHTS: PromotionAiInsight[] = [
  {
    id: 'ai-ins-01',
    type: 'campaign_suggestion',
    title: 'Lahore University Semester Rush Surge',
    summary: 'Rides departing from LUMS, FAST, and UMT campuses peak between 3:00 PM and 6:30 PM with a 42% surge. Suggest launching a targeted "LHR-STUDENT20" promo for GoMoto and GoMini.',
    confidenceScore: 94,
    suggestedActionLabel: 'Draft Campus Campaign',
    metricImpact: '+18% Projected Weekly Rides in Gulberg & DHA',
    severity: 'info'
  },
  {
    id: 'ai-ins-02',
    type: 'abuse_warning',
    title: 'Referral Anomaly Cluster Detected in Rawalpindi',
    summary: 'Detected 5 new referral registrations created with sequential SIM numbers originating from Saddar area within 3 hours. Review fraud queue before disbursing captain incentives.',
    confidenceScore: 88,
    suggestedActionLabel: 'Inspect Fraud Queue',
    metricImpact: 'Protects PKR 5,000 Potential Fraud Disbursal',
    severity: 'warning'
  },
  {
    id: 'ai-ins-03',
    type: 'budget_pacing',
    title: 'Azadi Campaign Budget Utilization Normal (41.6%)',
    summary: 'Campaign "Jashan-e-Azadi" has utilized PKR 624,500 of its PKR 1.5M budget with 17 days remaining. Current burn rate is sustainable and pacing on target.',
    confidenceScore: 96,
    suggestedActionLabel: 'View Budget Breakdown',
    metricImpact: 'Budget On-Track (PKR 875,500 Remaining)',
    severity: 'success'
  },
  {
    id: 'ai-ins-04',
    type: 'performance_highlight',
    title: 'Karachi Weekend Leisure Promo Conversion High',
    summary: 'Promo code KHIWEEKEND generated 1,250 rides with an average fare of PKR 780. Return on promotional spend is 4.3x gross merchandise value.',
    confidenceScore: 92,
    suggestedActionLabel: 'Extend Promo to Hyderabad',
    metricImpact: '4.3x Revenue Multiple',
    severity: 'info'
  }
];

// =========================================================================
// 11. HELPER FUNCTIONS: DISCOUNT CALCULATION & VALIDATION
// =========================================================================

export interface PromoValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
  originalFare: number;
  discountAmount: number;
  finalFare: number;
  promoCode?: PromoCode;
}

export function validateAndCalculatePromoDiscount(
  promo: PromoCode,
  input: {
    fare: number;
    city: string;
    category: RideCategory | string;
    passengerId: string;
    isNewPassenger?: boolean;
    paymentMethod?: string;
  }
): PromoValidationResult {
  const { fare, city, category, isNewPassenger = false, paymentMethod = 'cash' } = input;

  // 1. Check active & paused status
  if (!promo.active || promo.status === 'disabled' || promo.paused) {
    return {
      valid: false,
      errorCode: 'PROMO_INACTIVE',
      errorMessage: `Promo code ${promo.code} is currently paused or inactive.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 2. Check expiry date
  const nowStr = new Date().toISOString().split('T')[0];
  const expiry = promo.expiresAt || promo.expiryDate;
  if (expiry && expiry < nowStr) {
    return {
      valid: false,
      errorCode: 'PROMO_EXPIRED',
      errorMessage: `Promo code ${promo.code} expired on ${expiry}.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 3. Check start date
  if (promo.startDate && promo.startDate > nowStr) {
    return {
      valid: false,
      errorCode: 'PROMO_NOT_STARTED',
      errorMessage: `Promo code ${promo.code} will become active on ${promo.startDate}.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 4. Check city eligibility
  const allowedCities = promo.applicableCities || (promo.applicableCity ? [promo.applicableCity] : ['All']);
  if (!allowedCities.includes('All') && !allowedCities.includes(city)) {
    return {
      valid: false,
      errorCode: 'CITY_NOT_ELIGIBLE',
      errorMessage: `Promo ${promo.code} is not valid in ${city}. Valid in: ${allowedCities.join(', ')}.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 5. Check category eligibility
  if (
    promo.applicableCategories &&
    promo.applicableCategories.length > 0 &&
    !promo.applicableCategories.includes(category as RideCategory)
  ) {
    return {
      valid: false,
      errorCode: 'CATEGORY_NOT_ELIGIBLE',
      errorMessage: `Promo ${promo.code} is only valid for: ${promo.applicableCategories.join(', ')}.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 6. Check target audience
  if (promo.targetAudience === 'new_passengers' && !isNewPassenger) {
    return {
      valid: false,
      errorCode: 'AUDIENCE_RESTRICTION',
      errorMessage: `Promo code ${promo.code} is exclusively for new passengers on their first booking.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 7. Check payment method
  if (promo.paymentMethodEligibility && !promo.paymentMethodEligibility.includes('all')) {
    if (!promo.paymentMethodEligibility.includes(paymentMethod.toLowerCase())) {
      return {
        valid: false,
        errorCode: 'PAYMENT_METHOD_RESTRICTED',
        errorMessage: `Promo ${promo.code} requires payment via: ${promo.paymentMethodEligibility.join(', ')}.`,
        originalFare: fare,
        discountAmount: 0,
        finalFare: fare
      };
    }
  }

  // 8. Check minimum ride fare
  if (promo.minFare && fare < promo.minFare) {
    return {
      valid: false,
      errorCode: 'MIN_FARE_NOT_MET',
      errorMessage: `Minimum fare of PKR ${promo.minFare} required to apply this coupon (Current fare: PKR ${fare}).`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 9. Check global usage limit
  const currentUsed = promo.usedCount ?? promo.usageCount ?? 0;
  if (promo.usageLimit && currentUsed >= promo.usageLimit) {
    return {
      valid: false,
      errorCode: 'USAGE_LIMIT_EXCEEDED',
      errorMessage: `Promo code ${promo.code} has reached its maximum allowed redemption limit.`,
      originalFare: fare,
      discountAmount: 0,
      finalFare: fare
    };
  }

  // 10. Calculate discount with strict negative fare protection
  let discount = 0;
  if (promo.discountType === 'percentage') {
    const rawDiscount = Math.round((promo.discountValue / 100) * fare);
    discount = promo.maxDiscount ? Math.min(rawDiscount, promo.maxDiscount) : rawDiscount;
  } else {
    // Fixed or flat
    discount = promo.discountValue;
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  }

  // SAFETY DIRECTIVE: Promo discounts must NEVER create negative fares.
  // Final fare cannot fall below 0. Platform minimum floor is preserved.
  if (discount >= fare) {
    discount = Math.max(0, fare - 50); // Leave a nominal floor or zero
  }

  const finalFare = Math.max(0, fare - discount);

  return {
    valid: true,
    originalFare: fare,
    discountAmount: discount,
    finalFare,
    promoCode: promo
  };
}

// =========================================================================
// 12. SUMMARY METRICS CALCULATION
// =========================================================================
export function calculatePromotionsSummaryMetrics(
  promos: PromoCode[],
  campaigns: PromotionCampaign[],
  referrals: ReferralRecord[],
  rewards: RewardRecord[],
  usages: PromoUsageRecord[],
  alerts: FraudDetectionAlert[]
): PromotionsSummaryMetrics {
  const totalPromosActive = promos.filter((p) => p.status === 'active' || p.active).length;
  const totalUsageCount = usages.length;
  const totalDiscountDisbursedPKR = usages.reduce((sum, u) => sum + (u.discountAmount || 0), 0);

  const totalReferralsCount = referrals.length;
  const qualifiedReferralsCount = referrals.filter(
    (r) => r.status === 'qualified' || r.status === 'rewarded' || r.status === 'completed'
  ).length;

  const referralRewardsDisbursedPKR = referrals
    .filter((r) => r.rewardDisbursed)
    .reduce((sum, r) => sum + (r.rewardAmount || r.referrerRewardAmount || 0), 0);

  const driverRewardsDisbursedPKR = rewards
    .filter((r) => r.userType === 'driver' && (r.status === 'credited' || r.status === 'approved'))
    .reduce((sum, r) => sum + r.amount, 0);

  const passengerRewardsDisbursedPKR = rewards
    .filter((r) => r.userType === 'passenger' && (r.status === 'credited' || r.status === 'approved'))
    .reduce((sum, r) => sum + r.amount, 0);

  const totalCampaignBudgetPKR = campaigns.reduce((sum, c) => sum + (c.totalBudget || 0), 0);
  const totalBudgetSpentPKR = campaigns.reduce((sum, c) => sum + (c.spentBudget || 0), 0);

  const flaggedFraudAlertsCount = alerts.filter((a) => a.status === 'pending_review').length;

  return {
    totalPromosActive,
    totalUsageCount,
    totalDiscountDisbursedPKR,
    totalReferralsCount,
    qualifiedReferralsCount,
    referralRewardsDisbursedPKR,
    driverRewardsDisbursedPKR,
    passengerRewardsDisbursedPKR,
    totalCampaignBudgetPKR,
    totalBudgetSpentPKR,
    flaggedFraudAlertsCount
  };
}
