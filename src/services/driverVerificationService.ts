import {
  Driver,
  DriverDocument,
  DriverDocumentVersion,
  VerificationItem,
  VerificationDocumentRequirement,
  VerificationEligibilitySummary,
  VerificationRejectReasonOption,
  VerificationPriorityTag,
  RideCategory
} from '../types';

// ==========================================
// STANDARD DOCUMENT REQUIREMENTS CHECKLIST
// ==========================================
export const STANDARD_DOCUMENT_REQUIREMENTS: VerificationDocumentRequirement[] = [
  {
    type: 'cnic_front',
    title: 'CNIC Front (Identity Document)',
    titleUrdu: 'شناختی کارڈ (سامنے کا رخ)',
    description: 'Original Pakistani National Identity Card (Smart CNIC) front side with clear photo and 13-digit number.',
    mandatory: true,
    requiresExpiry: true
  },
  {
    type: 'cnic_back',
    title: 'CNIC Back (Address & Family ID)',
    titleUrdu: 'شناختی کارڈ (پیچھے کا رخ)',
    description: 'Back side of Smart CNIC displaying permanent and temporary address.',
    mandatory: true,
    requiresExpiry: false
  },
  {
    type: 'driving_license',
    title: 'Driving License (Provincial)',
    titleUrdu: 'ڈرائیونگ لائسنس',
    description: 'Valid, unexpired Motor Car / LTV / Motorcycle license issued by Punjab, Sindh, KP, or Islamabad Traffic Police.',
    mandatory: true,
    requiresExpiry: true
  },
  {
    type: 'vehicle_reg',
    title: 'Vehicle Registration (Excise Smart Card)',
    titleUrdu: 'گاڑی کی رجسٹریشن (سمارٹ کارڈ)',
    description: 'Excise & Taxation registration document or computerized smart card with matching engine/chassis number.',
    mandatory: true,
    requiresExpiry: false
  },
  {
    type: 'vehicle_insurance',
    title: 'Vehicle Insurance Certificate',
    titleUrdu: 'گاڑی کی انشورنس',
    description: 'Third-party or comprehensive automotive insurance policy with active validity.',
    mandatory: false,
    requiresExpiry: true
  },
  {
    type: 'vehicle_inspection',
    title: 'Vehicle Fitness & A/C Certificate',
    titleUrdu: 'گاڑی کی فٹنس اور اے سی چیک',
    description: 'Certified inspection confirming tire health, working air conditioning, and safety belts.',
    mandatory: false,
    requiresExpiry: true,
    appliesToCategories: ['GoMini', 'GoRide', 'GoComfort']
  },
  {
    type: 'profile_photo',
    title: 'Driver Live Portrait (Profile Photo)',
    titleUrdu: 'ڈرائیور کی تصویر',
    description: 'Front-facing portrait without sunglasses or face masks on neutral background.',
    mandatory: true,
    requiresExpiry: false
  },
  {
    type: 'police_cert',
    title: 'Police Character Clearance Certificate',
    titleUrdu: 'پولیس کلیئرنس سرٹیفکیٹ',
    description: 'Punjab/Sindh/KP Police Khidmat Markaz Character Clearance verifying no criminal background.',
    mandatory: true,
    requiresExpiry: true
  },
  {
    type: 'vehicle_photos',
    title: 'Vehicle Photos (Front, Rear, Interior)',
    titleUrdu: 'گاڑی کی تصاویر (سامنے، پیچھے، اندر)',
    description: 'Four distinct photographs showing front plate, rear plate, clean back seats, and dashboard.',
    mandatory: true,
    requiresExpiry: false
  }
];

// ==========================================
// PREDEFINED REJECTION REASONS & OFFICIAL TEXT
// ==========================================
export const PREDEFINED_REJECTION_REASONS: VerificationRejectReasonOption[] = [
  {
    code: 'invalid_doc',
    label: 'Invalid or Forged Document',
    defaultExplanation: 'The submitted document does not match official NADRA / Excise verification records and cannot be verified.'
  },
  {
    code: 'expired_doc',
    label: 'Expired Driving License or Insurance',
    defaultExplanation: 'Your driving license or vehicle insurance has expired. Please obtain a valid renewal receipt or renewed card and resubmit.'
  },
  {
    code: 'unclear_doc',
    label: 'Unclear, Blurry or Cropped Photo',
    defaultExplanation: 'The uploaded image is blurry, cropped, or flashlight glare obscures the CNIC number and expiry date. Please take a clear photo in daylight.'
  },
  {
    code: 'info_mismatch',
    label: 'Identity / Vehicle Information Mismatch',
    defaultExplanation: 'The name, CNIC number, or vehicle number plate on the submitted document does not match the driver profile details.'
  },
  {
    code: 'vehicle_issue',
    label: 'Vehicle Ineligible for Selected Category',
    defaultExplanation: 'The vehicle model year or engine displacement does not meet the minimum safety requirements for the selected ride category.'
  },
  {
    code: 'license_issue',
    label: 'License Class Incompatible',
    defaultExplanation: 'Your driving license class is restricted to motorcycle and is not authorized to drive 4-wheel passenger vehicles.'
  },
  {
    code: 'police_issue',
    label: 'Police Clearance Unverified',
    defaultExplanation: 'Police character certificate lacks the official Khidmat Markaz QR code or stamped verification reference.'
  },
  {
    code: 'missing_info',
    label: 'Missing Critical Information',
    defaultExplanation: 'Mandatory information such as document issuance authority or backside barcode is missing from the submission.'
  },
  {
    code: 'other',
    label: 'Administrative Compliance Rejection',
    defaultExplanation: 'Application declined in accordance with GoLife Pakistan Transport regulatory terms and conditions.'
  }
];

export const MANDATORY_DOCUMENT_REQUIREMENTS = STANDARD_DOCUMENT_REQUIREMENTS;

export interface RejectionCategoryCatalog {
  category: string;
  reasons: string[];
}

export const REJECTION_REASONS_CATALOG: RejectionCategoryCatalog[] = [
  {
    category: 'Image Quality',
    reasons: [
      'CNIC photo is blurry or out of focus. Please re-take in good lighting.',
      'Camera flashlight glare obscures document number or expiry date.',
      'Document borders/corners are cropped or partially cut off.',
      'Photo is too dark or low resolution to verify security features.'
    ]
  },
  {
    category: 'Document Validity',
    reasons: [
      'Driving License has expired. Please submit official renewal receipt or new card.',
      'Vehicle Insurance certificate has expired or policy number is invalid.',
      'Document appears altered, damaged, or tampered with.',
      'Document number does not match official excise/NADRA format.'
    ]
  },
  {
    category: 'Identity & Matching',
    reasons: [
      'Name on CNIC does not match the driver profile registration name.',
      'Father name or identity number mismatch between CNIC and Driving License.',
      'Profile portrait photo does not match the photo on the CNIC card.'
    ]
  },
  {
    category: 'Vehicle Class & Fitness',
    reasons: [
      'Driving license class is restricted to Motorcycle and invalid for Car service.',
      'Vehicle registration book engine/chassis number does not match vehicle inspection.',
      'Vehicle model year does not qualify for selected service category.'
    ]
  },
  {
    category: 'Regulatory & Police Clearance',
    reasons: [
      'Police Character Clearance Certificate from Khidmat Markaz is missing.',
      'Police clearance verification seal/QR code could not be confirmed.',
      'Route permit or fitness certificate missing for commercial freight category.'
    ]
  }
];

// ==========================================
// DOCUMENT EXPIRY STATUS CALCULATOR
// ==========================================
export const DEFAULT_EXPIRY_WARNING_DAYS = 30;

export interface DocumentExpiryResult {
  status: 'valid' | 'expiring_soon' | 'expired' | 'missing' | 'resubmission_required';
  daysRemaining: number;
  label: string;
}

export function getDocumentExpiryStatus(
  expiresAt?: string,
  warningDaysThreshold: number = DEFAULT_EXPIRY_WARNING_DAYS,
  docStatus?: 'verified' | 'invalid' | 'rejected' | 'pending' | 'resubmission_required' | 'missing'
): DocumentExpiryResult {
  if (docStatus === 'missing') {
    return { status: 'missing', daysRemaining: 0, label: 'Document Missing' };
  }
  if (docStatus === 'resubmission_required') {
    return { status: 'resubmission_required', daysRemaining: 0, label: 'Resubmission Required' };
  }
  if (!expiresAt) {
    return { status: 'valid', daysRemaining: 9999, label: 'No Expiry' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expiresAt);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: 'expired',
      daysRemaining,
      label: `Expired ${Math.abs(daysRemaining)} days ago`
    };
  } else if (daysRemaining <= warningDaysThreshold) {
    return {
      status: 'expiring_soon',
      daysRemaining,
      label: `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
    };
  } else {
    return {
      status: 'valid',
      daysRemaining,
      label: `Valid until ${expiresAt}`
    };
  }
}

export const calculateDocumentExpiryStatus = getDocumentExpiryStatus;

export type DriverEligibilityResult = VerificationEligibilitySummary & {
  isEligible: boolean;
  reasons: string[];
};

// ==========================================
// DRIVER ACCOUNT ELIGIBILITY CALCULATOR
// ==========================================
export function calculateDriverEligibility(
  driver: Driver,
  documents: DriverDocument[] = driver.documents || [],
  category: RideCategory = driver.vehicle?.category || 'GoMini'
): DriverEligibilityResult {
  const cnicFront = documents.find((d) => d.type === 'cnic_front');
  const cnicBack = documents.find((d) => d.type === 'cnic_back');
  const license = documents.find((d) => d.type === 'driving_license');
  const vehicleReg = documents.find((d) => d.type === 'vehicle_reg');
  const insurance = documents.find((d) => d.type === 'vehicle_insurance');
  const police = documents.find((d) => d.type === 'police_cert');

  const identityVerified = Boolean(cnicFront?.verified && cnicBack?.verified);
  const licenseVerified = Boolean(license?.verified && getDocumentExpiryStatus(license?.expiresAt).status !== 'expired');
  const vehicleVerified = Boolean(vehicleReg?.verified);
  const insuranceVerified = insurance ? Boolean(insurance.verified && getDocumentExpiryStatus(insurance?.expiresAt).status !== 'expired') : true;

  const restrictionReasons: string[] = [];

  if (!identityVerified) {
    restrictionReasons.push('CNIC front and back verification incomplete or unapproved');
  }

  if (!licenseVerified) {
    if (license && getDocumentExpiryStatus(license.expiresAt).status === 'expired') {
      restrictionReasons.push('Driving License has expired and cannot be used on duty');
    } else {
      restrictionReasons.push('Official Driving License unverified');
    }
  }

  if (!vehicleVerified) {
    restrictionReasons.push('Vehicle registration smart card unverified by Excise desk');
  }

  if (police && !police.verified) {
    restrictionReasons.push('Police Khidmat Markaz character clearance pending verification');
  }

  if (driver.accountStatus === 'suspended') {
    restrictionReasons.push('Driver account is currently under administrative suspension');
  }

  // Completeness check against mandatory requirements
  const mandatoryTypes: DriverDocument['type'][] = ['cnic_front', 'cnic_back', 'driving_license', 'vehicle_reg', 'police_cert'];
  const hasAllMandatory = mandatoryTypes.every((type) => documents.some((d) => d.type === type));

  const hasAnyExpired = documents.some((d) => {
    if (!d.expiresAt) return false;
    return getDocumentExpiryStatus(d.expiresAt).status === 'expired';
  });

  const eligibleToDrive =
    identityVerified &&
    licenseVerified &&
    vehicleVerified &&
    insuranceVerified &&
    hasAllMandatory &&
    !hasAnyExpired &&
    driver.accountStatus !== 'suspended';

  if (!eligibleToDrive && restrictionReasons.length === 0) {
    if (!hasAllMandatory) restrictionReasons.push('Mandatory regulatory documents are missing');
    if (hasAnyExpired) restrictionReasons.push('One or more required documents have expired');
  }

  return {
    identityVerified,
    licenseVerified,
    vehicleVerified,
    insuranceVerified,
    requiredDocumentsComplete: hasAllMandatory,
    allRequiredDocumentsValid: !hasAnyExpired,
    eligibleToDrive,
    restrictionReasons,
    isEligible: eligibleToDrive,
    reasons: restrictionReasons
  };
}

// ==========================================
// PRIORITY TAGS FOR VERIFICATION QUEUE
// ==========================================
export function getVerificationPriorityTags(
  item: VerificationItem,
  driver?: Driver
): VerificationPriorityTag[] {
  const tags: VerificationPriorityTag[] = [];

  if (item.status === 'pending') {
    tags.push('new_verification');
  }

  if (item.hasExpiredDocs) {
    tags.push('expired');
  } else {
    const hasExpiring = (item.documents || []).some((d) => {
      if (!d.expiresAt) return false;
      const { status } = getDocumentExpiryStatus(d.expiresAt);
      return status === 'expiring_soon';
    });
    if (hasExpiring) {
      tags.push('expiring_soon');
    }
  }

  const mandatoryCount = 5;
  if ((item.documents || []).length < mandatoryCount) {
    tags.push('missing_docs');
  }

  const rejectionsCount = (item.history || []).filter((h) => h.action.toLowerCase().includes('reject')).length;
  if (rejectionsCount >= 2) {
    tags.push('repeated_rejection');
  }

  if (driver?.accountStatus === 'suspended') {
    tags.push('safety_flag');
  }

  return tags;
}

// ==========================================
// INITIAL RICH DEMO VERIFICATION ITEMS (PHASE 46)
// ==========================================
export const INITIAL_DEMO_ENRICHED_VERIFICATIONS: VerificationItem[] = [
  {
    id: 'ver-301',
    driverId: 'd-206',
    driverName: 'Kamran Akram',
    driverPhone: '+92 301 5566778',
    city: 'Karachi',
    category: 'GoComfort',
    submittedAt: '2026-09-10 14:20 PKT',
    cnic: '42201-9988771-3',
    registrationDate: '2026-09-10',
    vehicleInfo: {
      make: 'Honda',
      model: 'City 1.5 Aspire',
      year: 2023,
      color: 'Urban Titanium',
      plate: 'KHI-23-4512',
      category: 'GoComfort'
    },
    status: 'pending',
    reviewStatus: 'new',
    hasExpiredDocs: false,
    documents: [
      {
        id: 'doc-301-1',
        type: 'cnic_front',
        title: 'Smart CNIC Front',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'pending',
        uploadedAt: '2026-09-10 14:20 PKT',
        expiresAt: '2032-05-14',
        documentNumber: '42201-9988771-3',
        version: 1
      },
      {
        id: 'doc-301-2',
        type: 'cnic_back',
        title: 'Smart CNIC Back',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'pending',
        uploadedAt: '2026-09-10 14:20 PKT',
        version: 1
      },
      {
        id: 'doc-301-3',
        type: 'driving_license',
        title: 'Sindh Motor Car Driving License',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'pending',
        uploadedAt: '2026-09-10 14:21 PKT',
        expiresAt: '2028-12-30',
        documentNumber: 'SDL-2023-88192',
        version: 1
      },
      {
        id: 'doc-301-4',
        type: 'vehicle_reg',
        title: 'Excise Vehicle Smart Card',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'pending',
        uploadedAt: '2026-09-10 14:22 PKT',
        documentNumber: 'KHI-23-4512',
        version: 1
      },
      {
        id: 'doc-301-5',
        type: 'police_cert',
        title: 'Sindh Police Clearance Certificate',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'pending',
        uploadedAt: '2026-09-10 14:23 PKT',
        expiresAt: '2027-09-10',
        version: 1
      }
    ],
    history: [
      {
        id: 'h-101',
        action: 'Application Submitted by Driver',
        adminName: 'System / In-App',
        timestamp: '2026-09-10 14:20 PKT',
        notes: 'Initial registration with 5 uploaded KYC documents.'
      }
    ]
  },
  {
    id: 'ver-302',
    driverId: 'd-207',
    driverName: 'Imran Shahid',
    driverPhone: '+92 333 4455667',
    city: 'Lahore',
    category: 'GoRide',
    submittedAt: '2026-09-11 09:15 PKT',
    cnic: '35202-1122334-5',
    registrationDate: '2026-09-11',
    vehicleInfo: {
      make: 'Suzuki',
      model: 'WagonR VXL',
      year: 2021,
      color: 'Solid White',
      plate: 'LEB-21-3991',
      category: 'GoRide'
    },
    status: 'pending',
    reviewStatus: 'under_review',
    hasExpiredDocs: true,
    documents: [
      {
        id: 'doc-302-1',
        type: 'cnic_front',
        title: 'Smart CNIC Front',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2026-09-11 09:15 PKT',
        expiresAt: '2030-10-18',
        version: 1
      },
      {
        id: 'doc-302-2',
        type: 'cnic_back',
        title: 'Smart CNIC Back',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2026-09-11 09:15 PKT',
        version: 1
      },
      {
        id: 'doc-302-3',
        type: 'driving_license',
        title: 'Punjab Driving License (EXPIRED)',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'invalid',
        uploadedAt: '2026-09-11 09:16 PKT',
        expiresAt: '2026-08-01',
        notes: 'Expired 42 days ago. Renewal ticket requested from driver.',
        version: 1
      },
      {
        id: 'doc-302-4',
        type: 'vehicle_reg',
        title: 'Excise Smart Card',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2026-09-11 09:17 PKT',
        version: 1
      }
    ],
    history: [
      {
        id: 'h-102',
        action: 'Application Submitted',
        adminName: 'System / In-App',
        timestamp: '2026-09-11 09:15 PKT'
      },
      {
        id: 'h-103',
        action: 'Flagged for Expired License',
        adminName: 'Farhan Zaidi (Ops Dispatch)',
        timestamp: '2026-09-11 11:30 PKT',
        notes: 'Driving license expired on 2026-08-01. Requested renewal challan.'
      }
    ]
  },
  {
    id: 'ver-303',
    driverId: 'd-202',
    driverName: 'Khurram Shehzad',
    driverPhone: '+92 321 9918204',
    city: 'Karachi',
    category: 'GoRide',
    submittedAt: '2023-11-05 10:00 PKT',
    cnic: '42101-5519283-7',
    registrationDate: '2023-11-10',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Corolla GLi',
      year: 2021,
      color: 'Super White',
      plate: 'KHI-21-9941',
      category: 'GoRide'
    },
    status: 'approved',
    reviewStatus: 'approved',
    reviewedBy: 'Super Admin',
    reviewedAt: '2023-11-10 16:30 PKT',
    hasExpiredDocs: false,
    documents: [
      {
        id: 'doc-303-1',
        type: 'cnic_front',
        title: 'Smart CNIC Front',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2023-11-05',
        expiresAt: '2031-10-14',
        version: 1
      },
      {
        id: 'doc-303-2',
        type: 'driving_license',
        title: 'Sindh Driving License',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2023-11-06',
        expiresAt: '2028-09-20',
        version: 1
      },
      {
        id: 'doc-303-3',
        type: 'vehicle_reg',
        title: 'Excise Smart Card',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2023-11-06',
        version: 1
      }
    ],
    history: [
      {
        id: 'h-104',
        action: 'Account Fully Approved & Verified',
        adminName: 'Super Admin',
        timestamp: '2023-11-10 16:30 PKT',
        notes: 'Passed all KYC and background checks.'
      }
    ]
  },
  {
    id: 'ver-304',
    driverId: 'd-211',
    driverName: 'Naveed Aslam (Demo: Rejected Driver)',
    driverPhone: '+92 345 1122334',
    city: 'Rawalpindi',
    category: 'GoAuto',
    submittedAt: '2026-09-08 17:00 PKT',
    cnic: '37405-1122998-1',
    registrationDate: '2026-09-08',
    vehicleInfo: {
      make: 'Sazgar',
      model: '4-Stroke Auto Rickshaw',
      year: 2018,
      color: 'Yellow',
      plate: 'RWP-18-5521',
      category: 'GoAuto'
    },
    status: 'rejected',
    reviewStatus: 'rejected',
    rejectionReason: 'The submitted document does not match official NADRA records (CNIC number mismatch).',
    reviewedBy: 'Compliance Desk (Major Bilal)',
    reviewedAt: '2026-09-09 10:15 PKT',
    hasExpiredDocs: false,
    documents: [
      {
        id: 'doc-304-1',
        type: 'cnic_front',
        title: 'CNIC Front',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'rejected',
        uploadedAt: '2026-09-08',
        rejectionReason: 'Digit mismatch in 13-digit identity string',
        version: 1
      }
    ],
    history: [
      {
        id: 'h-105',
        action: 'Application Rejected',
        adminName: 'Compliance Desk (Major Bilal)',
        timestamp: '2026-09-09 10:15 PKT',
        reason: 'Digit mismatch in 13-digit identity string',
        notes: 'Driver warned against forged identity submissions.'
      }
    ]
  },
  {
    id: 'ver-305',
    driverId: 'd-212',
    driverName: 'Sajid Bhatti (Demo: More Info Required)',
    driverPhone: '+92 300 4433221',
    city: 'Lahore',
    category: 'GoRide',
    submittedAt: '2026-09-12 12:00 PKT',
    cnic: '35201-9988443-5',
    registrationDate: '2026-09-12',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Yaris ATIV',
      year: 2022,
      color: 'Attitude Black',
      plate: 'LEB-22-1199',
      category: 'GoRide'
    },
    status: 'pending',
    reviewStatus: 'more_info_required',
    rejectionReason: 'Vehicle photos are missing clear rear number plate and interior back-seat upholstery view.',
    reviewedBy: 'Farhan Zaidi',
    reviewedAt: '2026-09-12 13:45 PKT',
    hasExpiredDocs: false,
    documents: [
      {
        id: 'doc-305-1',
        type: 'cnic_front',
        title: 'Smart CNIC Front',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2026-09-12',
        version: 1
      },
      {
        id: 'doc-305-2',
        type: 'vehicle_photos',
        title: 'Vehicle Photos',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
        verified: false,
        status: 'more_info_required',
        uploadedAt: '2026-09-12',
        notes: 'Need 4 photos including rear plate & clean rear seats.',
        version: 1
      }
    ],
    history: [
      {
        id: 'h-106',
        action: 'More Information Requested',
        adminName: 'Farhan Zaidi',
        timestamp: '2026-09-12 13:45 PKT',
        notes: 'Driver notified via push notification and SMS to re-upload vehicle photos.'
      }
    ]
  },
  {
    id: 'ver-306',
    driverId: 'd-213',
    driverName: 'Farhan Akhtar (Demo: Expiring License in 12d)',
    driverPhone: '+92 313 7788990',
    city: 'Islamabad',
    category: 'GoMini',
    submittedAt: '2024-05-10 11:00 PKT',
    cnic: '37405-3322119-7',
    registrationDate: '2024-05-15',
    vehicleInfo: {
      make: 'Suzuki',
      model: 'Cultus VXL',
      year: 2021,
      color: 'Pearl White',
      plate: 'ICT-21-7788',
      category: 'GoMini'
    },
    status: 'approved',
    reviewStatus: 'approved',
    hasExpiredDocs: false,
    documents: [
      {
        id: 'doc-306-1',
        type: 'driving_license',
        title: 'ICT Driving License',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2024-05-10',
        expiresAt: '2026-09-25', // 12 days from now!
        version: 1
      }
    ],
    history: [
      {
        id: 'h-107',
        action: 'Automated 15-Day Expiry Warning Dispatched',
        adminName: 'Automated System Monitor',
        timestamp: '2026-09-10 09:00 PKT',
        notes: 'Sent automated renewal reminder SMS and in-app banner.'
      }
    ]
  },
  {
    id: 'ver-307',
    driverId: 'drv_03',
    driverName: 'Tariq Mehmood (Demo: Multi-Version Document)',
    driverPhone: '+92 312 9944112',
    city: 'Islamabad',
    category: 'GoMini',
    submittedAt: '2024-09-01 10:00 PKT',
    cnic: '37405-8910243-7',
    registrationDate: '2024-09-01',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Vitz 1.0L',
      year: 2019,
      color: 'Silver Metallic',
      plate: 'ICT-19-4412',
      category: 'GoMini'
    },
    status: 'approved',
    reviewStatus: 'suspended',
    hasExpiredDocs: false,
    documents: [
      {
        id: 'doc-307-1',
        type: 'driving_license',
        title: 'ICT Driving License',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        verified: true,
        status: 'verified',
        uploadedAt: '2024-09-05',
        expiresAt: '2027-11-20',
        version: 2,
        versions: [
          {
            version: 1,
            url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2024-09-01 10:00 PKT',
            reviewedAt: '2024-09-02 11:30 PKT',
            reviewedBy: 'Farhan Zaidi',
            status: 'rejected',
            rejectionReason: 'Glare obscured license number'
          },
          {
            version: 2,
            url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2024-09-05 14:15 PKT',
            reviewedAt: '2024-09-05 16:00 PKT',
            reviewedBy: 'Farhan Zaidi',
            status: 'verified',
            notes: 'Clear scan approved'
          }
        ]
      }
    ],
    history: [
      {
        id: 'h-108',
        action: 'Version 1 Rejected (Glare)',
        adminName: 'Farhan Zaidi',
        timestamp: '2024-09-02 11:30 PKT'
      },
      {
        id: 'h-109',
        action: 'Version 2 Approved',
        adminName: 'Farhan Zaidi',
        timestamp: '2024-09-05 16:00 PKT'
      }
    ]
  }
];
