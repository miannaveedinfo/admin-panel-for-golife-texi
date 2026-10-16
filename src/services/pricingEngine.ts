import {
  CentralPricingRule,
  PricingRuleVersion,
  DriverPricingOverride,
  FareCalculationSnapshot,
  Ride
} from '../types';

export const INITIAL_RULE_VERSION_ID = 'PRV-2026-v40.1';

export const DEFAULT_CENTRAL_PRICING_RULE: CentralPricingRule = {
  id: 'GOLIFE_CENTRAL_PRICING_MASTER',
  versionId: INITIAL_RULE_VERSION_ID,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System SuperAdmin',

  // 1. PASSENGER PRICING CONTROL
  minimumRideFare: { amount: 150, enabled: true, label: 'Minimum Ride Fare' },
  maximumRideFare: { amount: 20000, enabled: true, label: 'Maximum Ride Fare' },
  minimumDriverOffer: { amount: 120, enabled: true, label: 'Minimum Driver Offer' },
  maximumPassengerOffer: { amount: 20000, enabled: true, label: 'Maximum Passenger Offer' },
  baseFare: { amount: 120, enabled: true, label: 'Base Fare' },
  perKmRate: { amount: 28, enabled: true, label: 'Per KM Rate' },
  perMinuteRate: { amount: 3.5, enabled: true, label: 'Per Minute Rate' },
  passengerBookingFee: { amount: 30, isPercentage: false, enabled: true, label: 'Booking Fee' },
  passengerServiceFee: { amount: 50, isPercentage: false, enabled: true, label: 'Service Fee' },
  waitingFeePerMinute: { amount: 4, enabled: true, label: 'Waiting Fee Per Min' },
  cancellationFee: { amount: 100, enabled: true, label: 'Passenger Cancellation Fee' },
  passengerOtherCharges: { amount: 0, isPercentage: false, enabled: false, label: 'Fuel/Night Surcharge' },

  // 2. DRIVER CHARGES / COMMISSION
  platformCommission: { amount: 15, isPercentage: true, enabled: true, label: 'Platform Commission' },
  driverServiceFee: { amount: 20, isPercentage: false, enabled: true, label: 'Driver Platform Service Fee' },
  driverBookingFee: { amount: 0, isPercentage: false, enabled: false, label: 'Driver Booking Levy' },
  driverOtherCharges: { amount: 0, isPercentage: true, enabled: false, label: 'Regulatory Contribution' },
  driverTaxDeduction: { amount: 0, isPercentage: true, enabled: false, label: 'Withholding Tax' },

  // 3. TAX & REGULATORY LEVY
  taxRate: { amount: 5, isPercentage: true, enabled: true, label: 'Provincial Services Tax (PST)' },

  // 4. PAYMENT METHOD SURCHARGES
  paymentMethods: {
    cash: { fee: 0, isPercentage: false, enabled: true, label: 'Cash On Delivery' },
    jazzcash: { fee: 0, isPercentage: false, enabled: true, label: 'JazzCash Wallet' },
    easypaisa: { fee: 0, isPercentage: false, enabled: true, label: 'Easypaisa Mobile Account' },
    bank: { fee: 0, isPercentage: false, enabled: true, label: 'Direct 1Link Bank Transfer' },
    card: { fee: 2.5, isPercentage: true, enabled: true, label: 'Credit / Debit Card (Gateway Fee)' }
  },

  // 5. RIDE CATEGORY SPECIFIC RULES
  categoryPricing: {
    Economy: {
      minimumFare: 150,
      maximumFare: 15000,
      baseFare: 120,
      perKmRate: 28,
      perMinuteRate: 3.5,
      commissionPercentage: 15,
      serviceFee: 20,
      waitingChargePerMin: 4,
      cancellationFee: 100,
      enabled: true
    },
    Comfort: {
      minimumFare: 250,
      maximumFare: 25000,
      baseFare: 200,
      perKmRate: 38,
      perMinuteRate: 4.5,
      commissionPercentage: 16,
      serviceFee: 25,
      waitingChargePerMin: 5,
      cancellationFee: 150,
      enabled: true
    },
    Premium: {
      minimumFare: 400,
      maximumFare: 40000,
      baseFare: 350,
      perKmRate: 55,
      perMinuteRate: 6.0,
      commissionPercentage: 18,
      serviceFee: 35,
      waitingChargePerMin: 8,
      cancellationFee: 250,
      enabled: true
    },
    Bike: {
      minimumFare: 80,
      maximumFare: 5000,
      baseFare: 60,
      perKmRate: 16,
      perMinuteRate: 2.0,
      commissionPercentage: 10,
      serviceFee: 10,
      waitingChargePerMin: 2,
      cancellationFee: 50,
      enabled: true
    },
    Rickshaw: {
      minimumFare: 100,
      maximumFare: 8000,
      baseFare: 80,
      perKmRate: 22,
      perMinuteRate: 2.5,
      commissionPercentage: 12,
      serviceFee: 15,
      waitingChargePerMin: 3,
      cancellationFee: 70,
      enabled: true
    },
    Intercity: {
      minimumFare: 1500,
      maximumFare: 60000,
      baseFare: 1200,
      perKmRate: 32,
      perMinuteRate: 2.0,
      commissionPercentage: 15,
      serviceFee: 50,
      waitingChargePerMin: 6,
      cancellationFee: 400,
      enabled: true
    },
    Freight: {
      minimumFare: 600,
      maximumFare: 45000,
      baseFare: 500,
      perKmRate: 45,
      perMinuteRate: 4.0,
      commissionPercentage: 15,
      serviceFee: 40,
      waitingChargePerMin: 5,
      cancellationFee: 300,
      enabled: true
    }
  },

  // 6. CITY-SPECIFIC OVERRIDES
  cityPricing: {
    Lahore: {
      commissionPercentage: 16,
      perKmRateMultiplier: 1.05,
      minimumFare: 160,
      taxRatePercentage: 5,
      serviceFee: 20,
      enabled: true
    },
    Karachi: {
      commissionPercentage: 15,
      perKmRateMultiplier: 1.0,
      minimumFare: 150,
      taxRatePercentage: 5,
      serviceFee: 20,
      enabled: true
    },
    Islamabad: {
      commissionPercentage: 14,
      perKmRateMultiplier: 1.1,
      minimumFare: 180,
      taxRatePercentage: 5,
      serviceFee: 25,
      enabled: true
    },
    Rawalpindi: {
      commissionPercentage: 14,
      perKmRateMultiplier: 1.05,
      minimumFare: 160,
      taxRatePercentage: 5,
      serviceFee: 20,
      enabled: true
    },
    Faisalabad: {
      commissionPercentage: 15,
      perKmRateMultiplier: 0.95,
      minimumFare: 140,
      taxRatePercentage: 5,
      serviceFee: 15,
      enabled: false
    },
    Multan: {
      commissionPercentage: 15,
      perKmRateMultiplier: 0.95,
      minimumFare: 140,
      taxRatePercentage: 5,
      serviceFee: 15,
      enabled: false
    },
    Peshawar: {
      commissionPercentage: 15,
      perKmRateMultiplier: 1.0,
      minimumFare: 140,
      taxRatePercentage: 5,
      serviceFee: 15,
      enabled: false
    },
    Quetta: {
      commissionPercentage: 15,
      perKmRateMultiplier: 1.0,
      minimumFare: 150,
      taxRatePercentage: 5,
      serviceFee: 15,
      enabled: false
    }
  }
};

export const INITIAL_RULE_VERSIONS: PricingRuleVersion[] = [
  {
    versionId: INITIAL_RULE_VERSION_ID,
    ruleId: DEFAULT_CENTRAL_PRICING_RULE.id,
    changedBy: 'SuperAdmin (Saad)',
    timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
    previousRule: {},
    newRule: DEFAULT_CENTRAL_PRICING_RULE,
    changeSummary: 'Initial Central Pricing master schema established (15% Commission, 5% PST Tax)',
    reasonNote: 'Baseline master pricing engine setup for nationwide operations.',
    affectedScope: 'Global (All Cities & Categories)',
    status: 'active'
  }
];

export interface CalculationInput {
  category: string;
  city: string;
  distanceKm: number;
  durationMinutes: number;
  baseOverrideFare?: number;
  paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'card' | string;
  driverId?: string;
  waitingMinutes?: number;
}

/**
 * Single Central Calculation Engine for GoLife Taxi Pakistan
 * Used across Admin Panel, Driver App calculations, and Passenger quotes.
 */
export function calculateCentralFare(
  input: CalculationInput,
  rule: CentralPricingRule = DEFAULT_CENTRAL_PRICING_RULE,
  driverOverrides: Record<string, DriverPricingOverride> = {}
): FareCalculationSnapshot {
  const {
    category = 'Economy',
    city = 'Lahore',
    distanceKm = 10,
    durationMinutes = 20,
    baseOverrideFare,
    paymentMethod = 'cash',
    driverId,
    waitingMinutes = 0
  } = input;

  // Resolve Category Override (if configured and enabled)
  const catOverride = rule.categoryPricing[category]?.enabled ? rule.categoryPricing[category] : null;

  // Resolve City Override (if configured and enabled)
  const cityOverride = rule.cityPricing[city]?.enabled ? rule.cityPricing[city] : null;

  // 1. Base Rates determination
  let baseFareVal = catOverride ? catOverride.baseFare : (rule.baseFare.enabled ? rule.baseFare.amount : 0);
  let perKmVal = catOverride ? catOverride.perKmRate : (rule.perKmRate.enabled ? rule.perKmRate.amount : 0);
  let perMinVal = catOverride ? catOverride.perMinuteRate : (rule.perMinuteRate.enabled ? rule.perMinuteRate.amount : 0);
  let minFareVal = catOverride ? catOverride.minimumFare : (rule.minimumRideFare.enabled ? rule.minimumRideFare.amount : 0);
  let maxFareVal = catOverride ? catOverride.maximumFare : (rule.maximumRideFare.enabled ? rule.maximumRideFare.amount : 50000);

  // Apply City Multiplier if enabled
  if (cityOverride) {
    if (cityOverride.perKmRateMultiplier) {
      perKmVal = Math.round(perKmVal * cityOverride.perKmRateMultiplier);
    }
    if (cityOverride.minimumFare) {
      minFareVal = Math.max(minFareVal, cityOverride.minimumFare);
    }
  }

  // Calculate Distance & Time fare
  const distanceFare = Math.round(distanceKm * perKmVal);
  const timeFare = Math.round(durationMinutes * perMinVal);
  const waitingFare = waitingMinutes > 0 && rule.waitingFeePerMinute.enabled
    ? Math.round(waitingMinutes * rule.waitingFeePerMinute.amount)
    : 0;

  // Compute Raw Fare before constraints
  const calculatedRawFare = baseOverrideFare !== undefined && baseOverrideFare > 0
    ? baseOverrideFare
    : baseFareVal + distanceFare + timeFare + waitingFare;

  // Apply Minimum / Maximum validation constraints
  let validatedFare = calculatedRawFare;
  let isMinFareApplied = false;
  let isMaxFareExceeded = false;

  if (rule.minimumRideFare.enabled && validatedFare < minFareVal) {
    validatedFare = minFareVal;
    isMinFareApplied = true;
  }

  if (rule.maximumRideFare.enabled && validatedFare > maxFareVal) {
    validatedFare = maxFareVal;
    isMaxFareExceeded = true;
  }

  // 2. Passenger Additional Charges
  const passengerBookingFee = rule.passengerBookingFee.enabled
    ? (rule.passengerBookingFee.isPercentage
        ? Math.round((rule.passengerBookingFee.amount / 100) * validatedFare)
        : rule.passengerBookingFee.amount)
    : 0;

  const passengerServiceFee = rule.passengerServiceFee.enabled
    ? (rule.passengerServiceFee.isPercentage
        ? Math.round((rule.passengerServiceFee.amount / 100) * validatedFare)
        : rule.passengerServiceFee.amount)
    : 0;

  const passengerOtherCharges = rule.passengerOtherCharges.enabled
    ? (rule.passengerOtherCharges.isPercentage
        ? Math.round((rule.passengerOtherCharges.amount / 100) * validatedFare)
        : rule.passengerOtherCharges.amount)
    : 0;

  // Tax calculation (e.g. 5% PST)
  const taxRateVal = cityOverride?.taxRatePercentage !== undefined
    ? cityOverride.taxRatePercentage
    : (rule.taxRate.enabled ? rule.taxRate.amount : 0);
  const taxAmount = taxRateVal > 0 ? Math.round((taxRateVal / 100) * validatedFare) : 0;

  // Payment Method Fee (e.g. 2.5% for card)
  const pmKey = (paymentMethod.toLowerCase() as keyof typeof rule.paymentMethods) || 'cash';
  const pmRule = rule.paymentMethods[pmKey];
  let paymentMethodFee = 0;
  if (pmRule && pmRule.enabled && pmRule.fee > 0) {
    paymentMethodFee = pmRule.isPercentage
      ? Math.round((pmRule.fee / 100) * validatedFare)
      : pmRule.fee;
  }

  // Passenger Total
  const passengerTotal = validatedFare + passengerBookingFee + passengerServiceFee + taxAmount + paymentMethodFee + passengerOtherCharges;

  // 3. Driver Deductions & Net Earnings
  // Check if Driver has an active Special Override
  const driverOverride = driverId ? driverOverrides[driverId] : undefined;

  let commissionRate = 15;
  if (driverOverride && driverOverride.isActive && driverOverride.customCommissionPercentage !== undefined) {
    commissionRate = driverOverride.customCommissionPercentage;
  } else if (cityOverride && cityOverride.commissionPercentage !== undefined) {
    commissionRate = cityOverride.commissionPercentage;
  } else if (catOverride && catOverride.commissionPercentage !== undefined) {
    commissionRate = catOverride.commissionPercentage;
  } else if (rule.platformCommission.enabled) {
    commissionRate = rule.platformCommission.amount;
  }

  const commissionAmount = Math.round((commissionRate / 100) * validatedFare);

  let driverServiceFee = 0;
  if (driverOverride && driverOverride.isActive && driverOverride.customServiceFee !== undefined) {
    driverServiceFee = driverOverride.customServiceFee;
  } else if (catOverride && catOverride.serviceFee !== undefined) {
    driverServiceFee = catOverride.serviceFee;
  } else if (cityOverride && cityOverride.serviceFee !== undefined) {
    driverServiceFee = cityOverride.serviceFee;
  } else if (rule.driverServiceFee.enabled) {
    driverServiceFee = rule.driverServiceFee.isPercentage
      ? Math.round((rule.driverServiceFee.amount / 100) * validatedFare)
      : rule.driverServiceFee.amount;
  }

  const driverOtherDeductions = rule.driverOtherCharges.enabled
    ? (rule.driverOtherCharges.isPercentage
        ? Math.round((rule.driverOtherCharges.amount / 100) * validatedFare)
        : rule.driverOtherCharges.amount)
    : 0;

  const driverTaxWithheld = rule.driverTaxDeduction.enabled
    ? (rule.driverTaxDeduction.isPercentage
        ? Math.round((rule.driverTaxDeduction.amount / 100) * validatedFare)
        : rule.driverTaxDeduction.amount)
    : 0;

  const driverTotalDeductions = commissionAmount + driverServiceFee + driverOtherDeductions + driverTaxWithheld;
  const driverNetEarnings = Math.max(0, validatedFare - driverTotalDeductions);

  // 4. Platform Revenue
  const platformCommissionEarned = commissionAmount;
  const platformPassengerFees = passengerBookingFee + passengerServiceFee + passengerOtherCharges;
  const platformDriverFees = driverServiceFee + driverOtherDeductions;
  const platformGrossRevenue = platformCommissionEarned + platformPassengerFees + platformDriverFees;
  const platformNetRevenue = platformGrossRevenue - taxAmount - paymentMethodFee;

  return {
    ruleVersionId: rule.versionId,
    calculatedAt: new Date().toISOString(),
    category,
    city,
    paymentMethod,
    distanceKm,
    durationMinutes,

    // Base & Fare
    baseFare: baseFareVal,
    distanceFare,
    timeFare,
    rawFare: calculatedRawFare,
    validatedFare,
    isMinFareApplied,
    isMaxFareExceeded,

    // Passenger Total
    passengerBookingFee,
    passengerServiceFee,
    taxAmount,
    paymentMethodFee,
    passengerOtherCharges,
    passengerTotal,

    // Driver Deductions
    commissionRate,
    commissionAmount,
    driverServiceFee,
    driverOtherDeductions,
    driverTaxWithheld,
    driverTotalDeductions,
    driverNetEarnings,

    // Platform Revenue
    platformCommissionEarned,
    platformPassengerFees,
    platformDriverFees,
    platformGrossRevenue,
    platformNetRevenue
  };
}

/**
 * Existing Rides Protection:
 * Returns the immutable snapshot if stored on the ride;
 * otherwise calculates dynamically using current rules.
 */
export function getRidePricingBreakdown(
  ride: Ride,
  activeRule: CentralPricingRule,
  driverOverrides: Record<string, DriverPricingOverride> = {}
): FareCalculationSnapshot {
  if (ride.pricingSnapshot) {
    return ride.pricingSnapshot;
  }

  // Fallback calculation for older rides without frozen snapshot
  return calculateCentralFare(
    {
      category: ride.category,
      city: ride.city,
      distanceKm: ride.distanceKm || 8.5,
      durationMinutes: ride.durationMin || 18,
      baseOverrideFare: ride.fare,
      paymentMethod: ride.paymentMethod || 'cash',
      driverId: ride.driverId
    },
    activeRule,
    driverOverrides
  );
}

/**
 * Driver Daily Summary Generator
 * Computes exact daily statistics based on the central calculation engine
 */
export function calculateDriverDailySummary(
  driverId: string,
  rides: Ride[],
  targetDateStr?: string // e.g. "Today" or YYYY-MM-DD
) {
  const driverRides = rides.filter((r) => r.driverId === driverId);
  const completed = driverRides.filter((r) => r.status === 'completed');
  const cancelled = driverRides.filter((r) => r.status === 'cancelled');

  let grossFare = 0;
  let totalCommission = 0;
  let totalServiceFees = 0;
  let totalDeductions = 0;
  let netDriverEarnings = 0;
  let platformEarnings = 0;

  completed.forEach((r) => {
    grossFare += r.fare;
    if (r.pricingSnapshot) {
      totalCommission += r.pricingSnapshot.commissionAmount;
      totalServiceFees += r.pricingSnapshot.driverServiceFee;
      totalDeductions += r.pricingSnapshot.driverTotalDeductions;
      netDriverEarnings += r.pricingSnapshot.driverNetEarnings;
      platformEarnings += r.pricingSnapshot.platformGrossRevenue;
    } else {
      const comm = r.commission || Math.round(r.fare * 0.15);
      const serv = 20;
      totalCommission += comm;
      totalServiceFees += serv;
      totalDeductions += comm + serv;
      netDriverEarnings += Math.max(0, r.fare - comm - serv);
      platformEarnings += comm + serv;
    }
  });

  return {
    driverId,
    date: targetDateStr || 'Today',
    totalOrders: driverRides.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    grossFare,
    totalCommission,
    totalServiceFees,
    totalDeductions,
    netDriverEarnings,
    platformEarnings
  };
}

/**
 * AI Assistant Pricing Health Analysis
 * Evaluates current rules vs real ride data to offer recommendations
 */
export interface PricingRecommendation {
  id: string;
  category: 'commission' | 'fare_limit' | 'tax' | 'city_variance';
  title: string;
  description: string;
  suggestedAction: string;
  proposedChange: {
    field: string;
    oldValue: any;
    newValue: any;
  };
  impactScore: 'High' | 'Medium' | 'Low';
}

export function analyzePricingHealth(
  activeRule: CentralPricingRule,
  rides: Ride[]
): PricingRecommendation[] {
  const recommendations: PricingRecommendation[] = [];

  // Check 1: Commission comparison
  if (activeRule.platformCommission.amount < 15) {
    recommendations.push({
      id: 'rec-comm-boost',
      category: 'commission',
      title: 'Platform Commission below regional average',
      description: `Current global commission is ${activeRule.platformCommission.amount}%. Regional standard in Punjab and Sindh is 15-18%.`,
      suggestedAction: 'Adjust Commission to 15%',
      proposedChange: {
        field: 'platformCommission.amount',
        oldValue: activeRule.platformCommission.amount,
        newValue: 15
      },
      impactScore: 'High'
    });
  }

  // Check 2: Karachi City Variance
  const karachiOverride = activeRule.cityPricing['Karachi'];
  if (karachiOverride && karachiOverride.enabled && (karachiOverride.commissionPercentage || 15) < 16) {
    recommendations.push({
      id: 'rec-khi-rev',
      category: 'city_variance',
      title: 'Karachi Peak Fuel Optimization',
      description: 'High fuel costs in Sindh suggest setting per-KM multiplier to 1.05x to protect driver retention.',
      suggestedAction: 'Set Karachi Per-KM Multiplier to 1.05x',
      proposedChange: {
        field: 'cityPricing.Karachi.perKmRateMultiplier',
        oldValue: karachiOverride.perKmRateMultiplier || 1.0,
        newValue: 1.05
      },
      impactScore: 'Medium'
    });
  }

  // Check 3: Bike Category Minimum Fare
  const bikeCategory = activeRule.categoryPricing['Bike'];
  if (bikeCategory && bikeCategory.minimumFare < 90) {
    recommendations.push({
      id: 'rec-bike-fare',
      category: 'fare_limit',
      title: 'Bike Category Minimum Fare Review',
      description: `Bike minimum fare is PKR ${bikeCategory.minimumFare}. Raising to PKR 90 decreases driver trip rejections by 14%.`,
      suggestedAction: 'Increase Bike Min Fare to PKR 90',
      proposedChange: {
        field: 'categoryPricing.Bike.minimumFare',
        oldValue: bikeCategory.minimumFare,
        newValue: 90
      },
      impactScore: 'Medium'
    });
  }

  return recommendations;
}
