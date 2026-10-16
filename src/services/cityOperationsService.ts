import {
  CityConfig,
  CityOperatingStatus,
  PassengerAvailabilityStatus,
  ServiceCategoryConfig,
  ServiceCategoryCode,
  CityCategoryMatrixItem,
  CityOperationsStatistics,
  CityOperationsAiInsight,
  Driver,
  Ride,
  Passenger,
  DriverFine,
  PassengerRefundRecord,
  DriverPayoutRecord,
  SupportCase,
  IntercityRoute
} from '../types';

export const INITIAL_PAKISTAN_CITIES: CityConfig[] = [
  {
    id: 'city-lhe',
    name: 'Lahore',
    nameUrdu: 'لاہور',
    province: 'Punjab',
    country: 'Pakistan',
    cityCode: 'LHE',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight', 'GoVan', 'GoSUV'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight', 'GoVan', 'GoSUV'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.4,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 12,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Punjab Standard)',
    taxChargeRef: 'PRA-PUNJAB-16PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 38,
    liveDriversCount: 168,
    intercityEnabled: true,
    centerCoordinates: { lat: 31.5204, lng: 74.3587 },
    centerCoords: { lat: 31.5204, lng: 74.3587 }
  },
  {
    id: 'city-khi',
    name: 'Karachi',
    nameUrdu: 'کراچی',
    province: 'Sindh',
    country: 'Pakistan',
    cityCode: 'KHI',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight', 'GoVan', 'GoSUV'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight', 'GoVan', 'GoSUV'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.3,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 14,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Sindh Standard)',
    taxChargeRef: 'SRB-SINDH-13PCT',
    baseSurge: 1.05,
    baseFareAdjustment: 20,
    geofenceRadiusKm: 46,
    liveDriversCount: 142,
    intercityEnabled: true,
    centerCoordinates: { lat: 24.8607, lng: 67.0011 },
    centerCoords: { lat: 24.8607, lng: 67.0011 }
  },
  {
    id: 'city-isb',
    name: 'Islamabad',
    nameUrdu: 'اسلام آباد',
    province: 'Federal Capital',
    country: 'Pakistan',
    cityCode: 'ISB',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoMini', 'GoRide', 'GoComfort', 'GoVan', 'GoSUV'],
    allowedCategories: ['GoMoto', 'GoMini', 'GoRide', 'GoComfort', 'GoVan', 'GoSUV'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.6,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 10,
      minDriverAge: 22,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Federal Premium)',
    taxChargeRef: 'ICT-FED-15PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 30,
    geofenceRadiusKm: 32,
    liveDriversCount: 78,
    intercityEnabled: true,
    centerCoordinates: { lat: 33.6844, lng: 73.0479 },
    centerCoords: { lat: 33.6844, lng: 73.0479 }
  },
  {
    id: 'city-rwp',
    name: 'Rawalpindi',
    nameUrdu: 'راولپنڈی',
    province: 'Punjab',
    country: 'Pakistan',
    cityCode: 'RWP',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.3,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 13,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Twin Cities Regional)',
    taxChargeRef: 'PRA-PUNJAB-16PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 10,
    geofenceRadiusKm: 28,
    liveDriversCount: 84,
    intercityEnabled: true,
    centerCoordinates: { lat: 33.5651, lng: 73.0169 },
    centerCoords: { lat: 33.5651, lng: 73.0169 }
  },
  {
    id: 'city-pew',
    name: 'Peshawar',
    nameUrdu: 'پشاور',
    province: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
    cityCode: 'PEW',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: 'specific_hours',
      standardOpenTime: '05:30',
      standardCloseTime: '23:30',
      weekdayHours: { open: '05:30', close: '23:30' },
      weekendHours: { open: '06:00', close: '00:30' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoFreight'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoFreight'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.3,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 14,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (KP Regional)',
    taxChargeRef: 'KPRA-KP-15PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 26,
    liveDriversCount: 46,
    intercityEnabled: true,
    centerCoordinates: { lat: 34.0151, lng: 71.5249 },
    centerCoords: { lat: 34.0151, lng: 71.5249 }
  },
  {
    id: 'city-mux',
    name: 'Multan',
    nameUrdu: 'ملتان',
    province: 'Punjab',
    country: 'Pakistan',
    cityCode: 'MUX',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.2,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      vehicleInspectionMandatory: false,
      maxVehicleAgeYears: 15,
      minDriverAge: 20,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (South Punjab Regional)',
    taxChargeRef: 'PRA-PUNJAB-16PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 24,
    liveDriversCount: 38,
    intercityEnabled: true,
    centerCoordinates: { lat: 30.1575, lng: 71.5249 },
    centerCoords: { lat: 30.1575, lng: 71.5249 }
  },
  {
    id: 'city-fsd',
    name: 'Faisalabad',
    nameUrdu: 'فیصل آباد',
    province: 'Punjab',
    country: 'Pakistan',
    cityCode: 'FSD',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoFreight'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoFreight'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.3,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 13,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Industrial Belt Tariff)',
    taxChargeRef: 'PRA-PUNJAB-16PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 28,
    liveDriversCount: 52,
    intercityEnabled: true,
    centerCoordinates: { lat: 31.4504, lng: 73.1350 },
    centerCoords: { lat: 31.4504, lng: 73.1350 }
  },
  {
    id: 'city-qta',
    name: 'Quetta',
    nameUrdu: 'کوئٹہ',
    province: 'Balochistan',
    country: 'Pakistan',
    cityCode: 'QTA',
    status: 'coming_soon',
    active: false,
    operatingSchedule: {
      mode: 'temporary_closure',
      closureReason: 'Phase 2 expansion: Regional depot & inspection yard under setup'
    },
    supportedCategories: ['GoMoto', 'GoRide'],
    allowedCategories: ['GoMoto', 'GoRide'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.2,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 14,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'coming_soon',
    pricingRuleRef: 'PRV-2026-v40.1 (Balochistan Proposed)',
    taxChargeRef: 'BRA-BALOCHISTAN-15PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 22,
    liveDriversCount: 0,
    intercityEnabled: false,
    centerCoordinates: { lat: 30.1798, lng: 66.9750 },
    centerCoords: { lat: 30.1798, lng: 66.9750 }
  },
  {
    id: 'city-skt',
    name: 'Sialkot',
    nameUrdu: 'سیالکوٹ',
    province: 'Punjab',
    country: 'Pakistan',
    cityCode: 'SKT',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoFreight'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoFreight'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.3,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      vehicleInspectionMandatory: true,
      maxVehicleAgeYears: 12,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Punjab Standard)',
    taxChargeRef: 'PRA-PUNJAB-16PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 10,
    geofenceRadiusKm: 20,
    liveDriversCount: 26,
    intercityEnabled: true,
    centerCoordinates: { lat: 32.4945, lng: 74.5229 },
    centerCoords: { lat: 32.4945, lng: 74.5229 }
  },
  {
    id: 'city-guj',
    name: 'Gujranwala',
    nameUrdu: 'گوجرانوالہ',
    province: 'Punjab',
    country: 'Pakistan',
    cityCode: 'GUJ',
    status: 'temporarily_suspended',
    active: false,
    operatingSchedule: {
      mode: 'holiday_maintenance',
      maintenanceNote: 'Municipal road remodeling along GT Road - services paused until inspection'
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.2,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      vehicleInspectionMandatory: false,
      maxVehicleAgeYears: 14,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'temporarily_unavailable',
    pricingRuleRef: 'PRV-2026-v40.1 (Punjab Standard)',
    taxChargeRef: 'PRA-PUNJAB-16PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 22,
    liveDriversCount: 0,
    intercityEnabled: false,
    centerCoordinates: { lat: 32.1877, lng: 74.1945 },
    centerCoords: { lat: 32.1877, lng: 74.1945 }
  },
  {
    id: 'city-hyd',
    name: 'Hyderabad',
    nameUrdu: 'حیدرآباد',
    province: 'Sindh',
    country: 'Pakistan',
    cityCode: 'HYD',
    status: 'active',
    active: true,
    operatingSchedule: {
      mode: '24_7',
      standardOpenTime: '00:00',
      standardCloseTime: '23:59',
      weekdayHours: { open: '00:00', close: '23:59' },
      weekendHours: { open: '00:00', close: '23:59' }
    },
    supportedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    allowedCategories: ['GoMoto', 'GoAuto', 'GoMini', 'GoRide'],
    currency: 'PKR',
    timezone: 'Asia/Karachi (PKT, UTC+5)',
    driverRequirements: {
      minRating: 4.2,
      requiredDocs: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      vehicleInspectionMandatory: false,
      maxVehicleAgeYears: 14,
      minDriverAge: 21,
      policeVerificationMandatory: true
    },
    passengerAvailability: 'available',
    pricingRuleRef: 'PRV-2026-v40.1 (Sindh Standard)',
    taxChargeRef: 'SRB-SINDH-13PCT',
    baseSurge: 1.0,
    baseFareAdjustment: 0,
    geofenceRadiusKm: 20,
    liveDriversCount: 22,
    intercityEnabled: true,
    centerCoordinates: { lat: 25.3960, lng: 68.3578 },
    centerCoords: { lat: 25.3960, lng: 68.3578 }
  }
];

export const INITIAL_SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  {
    id: 'cat-moto',
    code: 'bike',
    name: 'Bike',
    displayName: 'GoMoto (Bike Ride)',
    displayNameUrdu: 'گو موٹو (بائیک سواری)',
    rideCategoryKey: 'GoMoto',
    description: 'Quickest, most affordable single rider transport across Pakistani traffic.',
    status: 'active',
    iconName: 'Bike',
    vehicleRequirements: {
      allowedVehicleTypes: ['Motorcycle', 'Scooter'],
      minYear: 2012,
      minSeatingCapacity: 1,
      maxSeatingCapacity: 1,
      allowedFuelTypes: ['Petrol', 'Electric'],
      acMandatory: false,
      inspectionMandatory: false,
      allowedMakesModels: ['Honda CD70', 'Honda CG125', 'Yamaha YBR', 'Suzuki GD110', 'Crown', 'United']
    },
    driverEligibility: {
      minRating: 4.2,
      minCompletedRides: 0,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      minExperienceMonths: 3,
      criminalRecordClearanceRequired: false,
      minDriverAge: 19
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GOMOTO',
    taxReference: 'STANDARD_TRANSIT_TAX',
    displayOrder: 1
  },
  {
    id: 'cat-auto',
    code: 'rickshaw',
    name: 'Rickshaw',
    displayName: 'GoAuto (3-Wheel Rickshaw)',
    displayNameUrdu: 'گو آٹو (رکشہ)',
    rideCategoryKey: 'GoAuto',
    description: 'Standard Pakistani 4-stroke CNG/Petrol rickshaw for 1-3 passengers with luggage.',
    status: 'active',
    iconName: 'Navigation',
    vehicleRequirements: {
      allowedVehicleTypes: ['Auto Rickshaw', 'Electric 3-Wheeler'],
      minYear: 2014,
      minSeatingCapacity: 1,
      maxSeatingCapacity: 3,
      allowedFuelTypes: ['CNG', 'Petrol', 'LPG', 'Electric'],
      acMandatory: false,
      inspectionMandatory: false,
      allowedMakesModels: ['Sazgar 4-Stroke', 'Qingqi', 'Tezraftaar', 'New Asia']
    },
    driverEligibility: {
      minRating: 4.2,
      minCompletedRides: 0,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg'],
      minExperienceMonths: 6,
      criminalRecordClearanceRequired: false,
      minDriverAge: 20
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GOAUTO',
    taxReference: 'STANDARD_TRANSIT_TAX',
    displayOrder: 2
  },
  {
    id: 'cat-mini',
    code: 'economy',
    name: 'Economy',
    displayName: 'GoMini (AC Economy Hatchback)',
    displayNameUrdu: 'گو منی (اکانومی ہیچ بیک)',
    rideCategoryKey: 'GoMini',
    description: 'Suzuki Alto, WagonR, Mira 660cc-1000cc with full air conditioning for up to 4 riders.',
    status: 'active',
    iconName: 'Car',
    vehicleRequirements: {
      allowedVehicleTypes: ['Hatchback 660cc-1000cc'],
      minYear: 2015,
      minSeatingCapacity: 1,
      maxSeatingCapacity: 4,
      allowedFuelTypes: ['Petrol', 'CNG', 'Hybrid'],
      acMandatory: true,
      inspectionMandatory: true,
      allowedMakesModels: ['Suzuki Alto', 'Suzuki WagonR', 'Daihatsu Mira', 'Toyota Passo', 'Suzuki Cultus']
    },
    driverEligibility: {
      minRating: 4.4,
      minCompletedRides: 5,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      minExperienceMonths: 12,
      criminalRecordClearanceRequired: true,
      minDriverAge: 21
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GOMINI',
    taxReference: 'STANDARD_TRANSIT_TAX',
    displayOrder: 3
  },
  {
    id: 'cat-ride',
    code: 'standard',
    name: 'Standard',
    displayName: 'GoRide (AC Sedan / Prime)',
    displayNameUrdu: 'گو رائیڈ (سٹینڈرڈ سیڈان)',
    rideCategoryKey: 'GoRide',
    description: 'Toyota Corolla, Yaris, Honda City, Alsvin spacious sedans for business and family trips.',
    status: 'active',
    iconName: 'CarFront',
    vehicleRequirements: {
      allowedVehicleTypes: ['Sedan 1300cc-1500cc'],
      minYear: 2016,
      minSeatingCapacity: 1,
      maxSeatingCapacity: 4,
      allowedFuelTypes: ['Petrol', 'Hybrid'],
      acMandatory: true,
      inspectionMandatory: true,
      allowedMakesModels: ['Toyota Corolla GLi/Altis', 'Toyota Yaris', 'Honda City', 'Changan Alsvin', 'Hyundai Elantra']
    },
    driverEligibility: {
      minRating: 4.5,
      minCompletedRides: 10,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      minExperienceMonths: 18,
      criminalRecordClearanceRequired: true,
      minDriverAge: 22
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GORIDE',
    taxReference: 'STANDARD_TRANSIT_TAX',
    displayOrder: 4
  },
  {
    id: 'cat-comfort',
    code: 'premium',
    name: 'Premium',
    displayName: 'GoComfort (Executive Sedan / SUV)',
    displayNameUrdu: 'گو کمفرٹ (ایگزیکٹو لگژری)',
    rideCategoryKey: 'GoComfort',
    description: 'Honda Civic, Toyota Grande, Sportage, Tucson executive rides with elite top-tier captains.',
    status: 'active',
    iconName: 'Sparkles',
    vehicleRequirements: {
      allowedVehicleTypes: ['Executive Sedan', 'Crossover SUV'],
      minYear: 2019,
      minSeatingCapacity: 1,
      maxSeatingCapacity: 4,
      allowedFuelTypes: ['Petrol', 'Hybrid', 'Electric'],
      acMandatory: true,
      inspectionMandatory: true,
      allowedMakesModels: ['Honda Civic Oriel/RS', 'Toyota Grande', 'KIA Sportage', 'Hyundai Tucson', 'MG HS', 'Haval H6']
    },
    driverEligibility: {
      minRating: 4.75,
      minCompletedRides: 50,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert', 'vehicle_insurance'],
      minExperienceMonths: 24,
      criminalRecordClearanceRequired: true,
      minDriverAge: 24
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GOCOMFORT',
    taxReference: 'PREMIUM_LUXURY_TAX',
    displayOrder: 5
  },
  {
    id: 'cat-van',
    code: 'van',
    name: 'Van',
    displayName: 'GoVan (Passenger Van)',
    displayNameUrdu: 'گو وین (مسافر وین)',
    rideCategoryKey: 'GoVan',
    description: 'Toyota Hiace, Suzuki APV, Every for group travel, family events and airport delegations.',
    status: 'active',
    iconName: 'Bus',
    vehicleRequirements: {
      allowedVehicleTypes: ['Mini Van', 'Passenger Van'],
      minYear: 2015,
      minSeatingCapacity: 6,
      maxSeatingCapacity: 14,
      allowedFuelTypes: ['Petrol', 'Diesel', 'CNG'],
      acMandatory: true,
      inspectionMandatory: true,
      allowedMakesModels: ['Toyota Hiace Grand Cabin', 'Suzuki APV', 'Suzuki Every', 'FAW X-PV']
    },
    driverEligibility: {
      minRating: 4.5,
      minCompletedRides: 20,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      minExperienceMonths: 24,
      criminalRecordClearanceRequired: true,
      minDriverAge: 25
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GOVAN',
    taxReference: 'STANDARD_TRANSIT_TAX',
    displayOrder: 6
  },
  {
    id: 'cat-suv',
    code: 'suv',
    name: 'SUV',
    displayName: 'GoSUV (7-Seater Luxury SUV)',
    displayNameUrdu: 'گو ایس یو وی (7 سیٹر لگژری)',
    rideCategoryKey: 'GoSUV',
    description: 'Toyota Fortuner, Hilux Revo, Land Cruiser luxury 4x4 vehicles for high-profile journeys.',
    status: 'active',
    iconName: 'Shield',
    vehicleRequirements: {
      allowedVehicleTypes: ['4x4 SUV', 'Full-size SUV'],
      minYear: 2018,
      minSeatingCapacity: 5,
      maxSeatingCapacity: 7,
      allowedFuelTypes: ['Diesel', 'Petrol'],
      acMandatory: true,
      inspectionMandatory: true,
      allowedMakesModels: ['Toyota Fortuner Legender/Sigma', 'Toyota Hilux Revo Rocco', 'Toyota Prado', 'Changan Oshan X7']
    },
    driverEligibility: {
      minRating: 4.8,
      minCompletedRides: 40,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert', 'vehicle_insurance'],
      minExperienceMonths: 36,
      criminalRecordClearanceRequired: true,
      minDriverAge: 25
    },
    passengerAvailability: 'available',
    pricingReference: 'FARE_RULE_GOSUV',
    taxReference: 'PREMIUM_LUXURY_TAX',
    displayOrder: 7
  },
  {
    id: 'cat-intercity',
    code: 'intercity',
    name: 'City to City',
    displayName: 'GoIntercity (City to City Travel)',
    displayNameUrdu: 'گو انٹرسٹی (شہر سے شہر سفر)',
    rideCategoryKey: 'GoIntercity',
    description: 'Scheduled highway travel with verified intercity captains, fixed tariffs and zero surge.',
    status: 'active',
    iconName: 'Map',
    vehicleRequirements: {
      allowedVehicleTypes: ['Sedan', 'SUV', 'Van'],
      minYear: 2017,
      minSeatingCapacity: 3,
      maxSeatingCapacity: 7,
      allowedFuelTypes: ['Petrol', 'Hybrid', 'Diesel'],
      acMandatory: true,
      inspectionMandatory: true,
      allowedMakesModels: ['Toyota Corolla', 'Toyota Yaris', 'Honda Civic', 'Toyota Fortuner', 'Toyota Hiace']
    },
    driverEligibility: {
      minRating: 4.7,
      minCompletedRides: 30,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert', 'vehicle_insurance'],
      minExperienceMonths: 24,
      criminalRecordClearanceRequired: true,
      minDriverAge: 23
    },
    passengerAvailability: 'available',
    pricingReference: 'INTERCITY_DISTANCE_MATRIX',
    taxReference: 'NHA_HIGHWAY_TAX',
    displayOrder: 8
  },
  {
    id: 'cat-freight',
    code: 'freight',
    name: 'Freight',
    displayName: 'GoFreight (Cargo & Haulage)',
    displayNameUrdu: 'گو فریٹ (کارگو اور مال برداری)',
    rideCategoryKey: 'GoFreight',
    description: 'Commercial shifting, intra-city courier deliveries and heavy freight with digital Bilty.',
    status: 'active',
    iconName: 'Truck',
    vehicleRequirements: {
      allowedVehicleTypes: ['Mini Truck', 'Commercial Pickup', 'Medium Hauler', 'Container Truck'],
      minYear: 2012,
      minSeatingCapacity: 1,
      maxSeatingCapacity: 2,
      allowedFuelTypes: ['Diesel', 'Petrol', 'CNG'],
      acMandatory: false,
      inspectionMandatory: true,
      allowedMakesModels: ['Suzuki Ravi', 'Hyundai Shehzore', 'FAW Carrier', 'Isuzu D-Max', 'Mazda Titan', 'Hino 300']
    },
    driverEligibility: {
      minRating: 4.4,
      minCompletedRides: 10,
      requiredDocuments: ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'],
      minExperienceMonths: 24,
      criminalRecordClearanceRequired: true,
      minDriverAge: 23
    },
    passengerAvailability: 'available',
    pricingReference: 'FREIGHT_WEIGHT_TARIFF',
    taxReference: 'CARRIAGE_OF_GOODS_ACT',
    displayOrder: 9
  }
];

// Generate Initial City x Category Matrix
export function generateInitialCityCategoryMatrix(
  cities: CityConfig[] = INITIAL_PAKISTAN_CITIES,
  categories: ServiceCategoryConfig[] = INITIAL_SERVICE_CATEGORIES
): CityCategoryMatrixItem[] {
  const matrix: CityCategoryMatrixItem[] = [];

  cities.forEach((city) => {
    categories.forEach((cat) => {
      // Logic for status based on city status and category support
      let status: 'active' | 'inactive' | 'coming_soon' | 'temporarily_suspended' = 'active';
      let availability: PassengerAvailabilityStatus = 'available';

      if (city.status === 'coming_soon') {
        status = 'coming_soon';
        availability = 'coming_soon';
      } else if (city.status === 'temporarily_suspended') {
        status = 'temporarily_suspended';
        availability = 'temporarily_unavailable';
      } else if (city.status === 'inactive') {
        status = 'inactive';
        availability = 'temporarily_unavailable';
      } else {
        // City is active, check if category is supported
        const isSupported = city.supportedCategories?.includes(cat.rideCategoryKey);
        if (!isSupported) {
          status = 'inactive';
          availability = 'temporarily_unavailable';
        } else if (cat.status === 'coming_soon') {
          status = 'coming_soon';
          availability = 'coming_soon';
        } else if (cat.status === 'inactive') {
          status = 'inactive';
          availability = 'temporarily_unavailable';
        }
      }

      // Specific city quirks
      if (city.id === 'city-isb' && cat.code === 'rickshaw') {
        // Islamabad strictly disallows auto-rickshaws on capital highways
        status = 'inactive';
        availability = 'temporarily_unavailable';
      }

      matrix.push({
        id: `mat-${city.id}-${cat.code}`,
        cityId: city.id,
        cityName: city.name,
        categoryCode: cat.code,
        categoryName: cat.name,
        status,
        availability,
        operatingHoursMode: city.operatingSchedule?.mode || '24_7',
        surgeMultiplier: city.baseSurge || 1.0,
        fareAdjustment: city.baseFareAdjustment || 0,
        notes: status === 'inactive' && city.id === 'city-isb' && cat.code === 'rickshaw'
          ? 'Rickshaws prohibited under Islamabad Capital Territory Transport Authority Regulations'
          : undefined,
        lastUpdated: '2026-09-13 14:00 PKT'
      });
    });
  });

  return matrix;
}

export function calculateCityOperationsStats(
  city: CityConfig,
  drivers: Driver[] = [],
  rides: Ride[] = [],
  passengers: Passenger[] = [],
  fines: DriverFine[] = [],
  refunds: PassengerRefundRecord[] = [],
  payouts: DriverPayoutRecord[] = [],
  cases: SupportCase[] = []
): CityOperationsStatistics {
  const cityDrivers = drivers.filter(
    (d) => d.city?.toLowerCase() === city.name.toLowerCase()
  );
  const onlineDrivers = cityDrivers.filter(
    (d) => d.status === 'online' || d.status === 'on_trip' || (d as any).operationalStatus === 'online' || (d as any).operationalStatus === 'finding_ride'
  );

  const cityPassengers = passengers.filter(
    (p) => p.city?.toLowerCase() === city.name.toLowerCase()
  );

  const cityRides = rides.filter(
    (r) => r.city?.toLowerCase() === city.name.toLowerCase()
  );
  const activeRides = cityRides.filter(
    (r) => r.status === 'searching' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'in_progress'
  );
  const completedRides = cityRides.filter((r) => r.status === 'completed');
  const cancelledRides = cityRides.filter((r) => r.status === 'cancelled');

  const grossRevenue = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);
  const commission = completedRides.reduce((sum, r) => sum + (r.commission || Math.round((r.fare || 0) * 0.15)), 0);

  // Driver IDs in this city for cross references
  const cityDriverIds = new Set(cityDrivers.map((d) => d.id));
  const cityFines = fines.filter((f) => cityDriverIds.has(f.driverId));
  const totalFinesAmount = cityFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Refunds in this city
  const cityRideIds = new Set(cityRides.map((r) => r.id));
  const cityRefunds = refunds.filter((rf) => cityRideIds.has(rf.rideId));
  const totalRefundsAmount = cityRefunds.reduce((sum, rf) => sum + (rf.amount || (rf as any).refundAmount || 0), 0);

  // Payouts
  const cityPayouts = payouts.filter((po) => cityDriverIds.has(po.driverId));
  const totalPayoutsAmount = cityPayouts.reduce((sum, po) => sum + (po.amount || 0), 0);

  // Complaints & cases
  const cityCases = cases.filter(
    (c) => (c as any).city?.toLowerCase() === city.name.toLowerCase() || ((c as any).rideId && cityRideIds.has((c as any).rideId))
  );

  // Average Rating
  const validRatings = cityDrivers.filter((d) => d.rating > 0).map((d) => d.rating);
  const avgRating = validRatings.length > 0
    ? Number((validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(2))
    : 4.8;

  return {
    cityId: city.id,
    cityName: city.name,
    totalDrivers: cityDrivers.length,
    onlineDrivers: onlineDrivers.length,
    totalPassengers: cityPassengers.length,
    activeRides: activeRides.length,
    completedRides: completedRides.length,
    cancelledRides: cancelledRides.length,
    revenue: grossRevenue,
    commission,
    fines: totalFinesAmount,
    refunds: totalRefundsAmount,
    payouts: totalPayoutsAmount,
    complaints: cityCases.length,
    averageRating: avgRating
  };
}

export interface OverallOperationsStats {
  totalCities: number;
  activeCities: number;
  activeCitiesPercentage: number;
  totalCategories: number;
  activeCategories: number;
  categoriesWithPassVisibility: number;
  totalRegisteredDrivers: number;
  totalOnlineDrivers: number;
  totalActiveRides: number;
  totalCompletedTripsToday: number;
  systemAverageEta: number;
}

export function calculateOverallOperationsStats(
  cities: CityConfig[] = [],
  serviceCategories: ServiceCategoryConfig[] = [],
  cityCategoryMatrix: CityCategoryMatrixItem[] = []
): OverallOperationsStats {
  const safeCities = cities || [];
  const safeCategories = serviceCategories || [];
  const safeMatrix = cityCategoryMatrix || [];

  const activeCities = safeCities.filter((c) => c.status === 'active' || (c.active && c.status !== 'coming_soon' && c.status !== 'temporarily_suspended')).length;
  const activeCategories = safeCategories.filter((cat) => cat.status === 'active').length;
  const passVisCategories = safeCategories.filter((cat) => cat.passengerVisibility).length;

  const totalRegisteredDrivers = safeCities.reduce((sum, c) => sum + (c.liveStats?.totalDrivers || 0), 0);
  const totalOnlineDrivers = safeCities.reduce((sum, c) => sum + (c.liveStats?.onlineDrivers || 0), 0);
  const totalActiveRides = safeCities.reduce((sum, c) => sum + (c.liveStats?.activeRides || 0), 0);
  const totalCompletedTripsToday = safeCities.reduce((sum, c) => sum + (c.liveStats?.completedTripsToday || 0), 0);

  const activeCitiesWithEta = safeCities.filter((c) => (c.liveStats?.averageEtaMinutes || 0) > 0);
  const avgEta = activeCitiesWithEta.length > 0
    ? (activeCitiesWithEta.reduce((sum, c) => sum + (c.liveStats?.averageEtaMinutes || 0), 0) / activeCitiesWithEta.length).toFixed(1)
    : '4.8';

  return {
    totalCities: safeCities.length,
    activeCities,
    activeCitiesPercentage: safeCities.length > 0 ? Math.round((activeCities / safeCities.length) * 100) : 0,
    totalCategories: safeCategories.length,
    activeCategories,
    categoriesWithPassVisibility: passVisCategories,
    totalRegisteredDrivers: totalRegisteredDrivers || 1284,
    totalOnlineDrivers: totalOnlineDrivers || 342,
    totalActiveRides: totalActiveRides || 48,
    totalCompletedTripsToday: totalCompletedTripsToday || 3820,
    systemAverageEta: Number(avgEta)
  };
}

export const INITIAL_CITY_AI_INSIGHTS: CityOperationsAiInsight[] = [
  {
    id: 'ai-ins-1',
    title: 'High Bike & Rickshaw Demand Surge in Karachi',
    city: 'Karachi',
    category: 'Bike / Rickshaw',
    type: 'demand_surge',
    severity: 'high',
    observation: 'Evening commute between Saddar and Clifton shows 2.4x ride request volume with 38% unfulfilled ride searches.',
    recommendation: 'Recommend deploying automated incentive bonus (+Rs. 60/trip) to attract 35+ GoMoto & GoAuto captains during 17:00-21:00 PKT.',
    timestamp: '2026-09-13 14:15 PKT'
  },
  {
    id: 'ai-ins-2',
    title: 'Peshawar Late Evening Supply Deficit',
    city: 'Peshawar',
    category: 'Economy / Standard',
    type: 'supply_deficit',
    severity: 'medium',
    observation: 'Operating hours currently restrict late dispatches after 23:30 PKT, causing high passenger bounce rate near Hayatabad.',
    recommendation: 'Consider extending operating hours to 01:00 PKT on Friday & Saturday nights to capture airport arrivals and dining traffic.',
    timestamp: '2026-09-13 13:40 PKT'
  },
  {
    id: 'ai-ins-3',
    title: 'Lahore to Islamabad Intercity Corridor Utilization',
    city: 'Lahore',
    category: 'City to City',
    type: 'expansion',
    severity: 'info',
    observation: 'Intercity route M2 Motorway booking frequency up +42% week-on-week; 68% of passengers request GoComfort sedans.',
    recommendation: 'Enable pre-scheduled booking window up to 48 hours in advance for Lahore ➔ Islamabad corporate corridors.',
    timestamp: '2026-09-13 12:20 PKT'
  },
  {
    id: 'ai-ins-4',
    title: 'Quetta Market Readiness & Depot Inspection',
    city: 'Quetta',
    category: 'All Categories',
    type: 'expansion',
    severity: 'info',
    observation: 'Over 820 passenger waitlist registrations recorded in Quetta Cantt and Zarghun Road with zero active supply.',
    recommendation: 'Complete remaining vehicle inspection yard verification to transition Quetta status from "Coming Soon" to "Active" by Q4 2026.',
    timestamp: '2026-09-13 11:05 PKT'
  },
  {
    id: 'ai-ins-5',
    title: 'Gujranwala GT Road Remodeling Recovery Alert',
    city: 'Gujranwala',
    category: 'All Categories',
    type: 'operating_hours',
    severity: 'medium',
    observation: 'Municipal civil works on Flyover 3 have completed 85% clearance. Surrounding traffic flow is stabilizing.',
    recommendation: 'Schedule safety audit to lift temporary suspension and restore GoMini and GoMoto services within 72 hours.',
    timestamp: '2026-09-13 09:30 PKT'
  }
];
