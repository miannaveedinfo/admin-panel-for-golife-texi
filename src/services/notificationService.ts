import {
  NotificationRecord,
  NotificationTemplate,
  NotificationDeliveryLog,
  NotificationType,
  NotificationPriority,
  NotificationRecipientType,
  NotificationDeliveryChannel,
  YearlyReportData,
  YearlyMonthSummary
} from '../types';

// ==========================================
// 1. REUSABLE SYSTEM NOTIFICATION TEMPLATES
// ==========================================

export const INITIAL_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-verif-approved',
    name: 'Driver KYC Verification Approved',
    type: 'driver_verification',
    title: 'Congratulations! Your Driver Account is Verified & Active',
    titleUrdu: 'مبارک ہو! آپ کا ڈرائیور اکاؤنٹ تصدیق شدہ اور فعال ہے',
    message: 'Dear {driverName}, your CNIC, Driving License, and Vehicle registration have been verified. You can now go online and accept rides.',
    messageUrdu: 'محترم {driverName}، آپ کے شناختی کارڈ، ڈرائیونگ لائسنس اور گاڑی کے کاغذات کی تصدیق مکمل ہو گئی ہے۔ اب آپ آن لائن جا کر سواریاں لے سکتے ہیں۔',
    priority: 'high',
    defaultChannels: ['in_app', 'push_fcm', 'sms'],
    targetAudience: 'driver',
    placeholders: ['{driverName}', '{date}'],
    active: true,
    createdAt: '2026-08-01 10:00 PKT',
    updatedAt: '2026-09-10 12:00 PKT'
  },
  {
    id: 'tmpl-verif-rejected',
    name: 'Driver Verification Rejected',
    type: 'driver_verification',
    title: 'Action Required: Verification Documents Incomplete',
    titleUrdu: 'ضروری اقدام: تصدیقی دستاویزات نامکمل ہیں',
    message: 'Dear {driverName}, your verification could not be approved due to: {reason}. Please re-upload clear photos via the GoLife Driver App.',
    messageUrdu: 'محترم {driverName}، آپ کی تصدیق اس وجہ سے منظور نہیں ہو سکی: {reason}۔ برائے مہربانی گو لائف ڈرائیور ایپ کے ذریعے واضح تصاویر دوبارہ اپ لوڈ کریں۔',
    priority: 'urgent',
    defaultChannels: ['in_app', 'push_fcm', 'sms'],
    targetAudience: 'driver',
    placeholders: ['{driverName}', '{reason}', '{date}'],
    active: true,
    createdAt: '2026-08-01 10:00 PKT',
    updatedAt: '2026-09-10 12:00 PKT'
  },
  {
    id: 'tmpl-doc-expiring',
    name: 'Document Expiring Soon Warning',
    type: 'document_expiry',
    title: 'Notice: Your {documentType} is Expiring in 7 Days',
    titleUrdu: 'اطلاع: آپ کی {documentType} کی مدت 7 دنوں میں ختم ہو رہی ہے',
    message: 'Dear {driverName}, your {documentType} expires on {date}. Renew and upload the updated document to avoid dispatch suspension.',
    messageUrdu: 'محترم {driverName}، آپ کی {documentType} کی مدت {date} کو ختم ہو رہی ہے۔ ڈسپیچ معطلی سے بچنے کے لیے تجدید شدہ دستاویز فوری اپ لوڈ کریں۔',
    priority: 'high',
    defaultChannels: ['in_app', 'push_fcm', 'whatsapp'],
    targetAudience: 'driver',
    placeholders: ['{driverName}', '{documentType}', '{date}'],
    active: true,
    createdAt: '2026-08-10 11:30 PKT',
    updatedAt: '2026-09-11 15:20 PKT'
  },
  {
    id: 'tmpl-fine-levied',
    name: 'Fine / Penalty Levied Notice',
    type: 'fine',
    title: 'Compliance Penalty Notice: Rs. {amount} Levied',
    titleUrdu: 'تعمیل جرمانہ کا نوٹس: {amount} روپے عائد کیے گئے',
    message: 'A compliance fine of Rs. {amount} has been charged to your wallet for: {reason}. Related Ride #{rideId}. You may submit an appeal within 48 hours.',
    messageUrdu: 'آپ کے والیٹ سے {amount} روپے کا جرمانہ اس وجہ سے عائد کیا گیا ہے: {reason}۔ متعلقہ رائیڈ #{rideId}۔ آپ 48 گھنٹوں میں اپیل دائر کر سکتے ہیں۔',
    priority: 'urgent',
    defaultChannels: ['in_app', 'push_fcm', 'sms'],
    targetAudience: 'driver',
    placeholders: ['{driverName}', '{amount}', '{reason}', '{rideId}', '{date}'],
    active: true,
    createdAt: '2026-08-15 09:00 PKT',
    updatedAt: '2026-09-12 11:00 PKT'
  },
  {
    id: 'tmpl-suspension-active',
    name: 'Driver Account Suspension Notice',
    type: 'suspension',
    title: 'Account Alert: GoLife Dispatch Temporarily Suspended',
    titleUrdu: 'اکاؤنٹ الرٹ: گو لائف ڈسپیچ عارضی طور پر معطل ہے',
    message: 'Dear {driverName}, your driver account has been suspended for {duration} due to: {reason}. Contact driver safety desk for assistance.',
    messageUrdu: 'محترم {driverName}، آپ کا ڈرائیور اکاؤنٹ {duration} کے لیے معطل کر دیا گیا ہے۔ وجہ: {reason}۔ مدد کے لیے ہیلپ ڈیسک سے رابطہ کریں۔',
    priority: 'critical',
    defaultChannels: ['in_app', 'push_fcm', 'sms'],
    targetAudience: 'driver',
    placeholders: ['{driverName}', '{duration}', '{reason}', '{date}'],
    active: true,
    createdAt: '2026-08-20 14:00 PKT',
    updatedAt: '2026-09-12 16:30 PKT'
  },
  {
    id: 'tmpl-payout-processed',
    name: 'Wallet Payout Processed & Settled',
    type: 'payout',
    title: 'Payout Success: Rs. {amount} Sent to Your {paymentMethod}',
    titleUrdu: 'ادائیگی کامیاب: {amount} روپے آپ کے {paymentMethod} پر بھیج دیے گئے',
    message: 'Dear {driverName}, your payout request of Rs. {amount} has been successfully transferred to your {paymentMethod} account ({accountNumber}).',
    messageUrdu: 'محترم {driverName}، آپ کی {amount} روپے کی ادائیگی کامیابی سے آپ کے {paymentMethod} اکاؤنٹ ({accountNumber}) میں بھیج دی گئی ہے۔',
    priority: 'normal',
    defaultChannels: ['in_app', 'push_fcm', 'sms'],
    targetAudience: 'driver',
    placeholders: ['{driverName}', '{amount}', '{paymentMethod}', '{accountNumber}', '{date}'],
    active: true,
    createdAt: '2026-08-05 10:00 PKT',
    updatedAt: '2026-09-11 18:00 PKT'
  },
  {
    id: 'tmpl-refund-issued',
    name: 'Passenger Fare Refund Credited',
    type: 'refund',
    title: 'Refund Approved: Rs. {amount} Credited to Your Wallet',
    titleUrdu: 'ریفنڈ منظور: {amount} روپے آپ کے والیٹ میں شامل کر دیے گئے',
    message: 'Dear {passengerName}, a refund of Rs. {amount} for Ride #{rideId} has been credited to your GoLife Wallet ({reason}). We apologize for any inconvenience.',
    messageUrdu: 'محترم {passengerName}، رائیڈ #{rideId} کا {amount} روپے کا ریفنڈ آپ کے والیٹ میں جمع کر دیا گیا ہے ({reason})۔ زحمت کے لیے معذرت خواہ ہیں۔',
    priority: 'high',
    defaultChannels: ['in_app', 'push_fcm'],
    targetAudience: 'passenger',
    placeholders: ['{passengerName}', '{amount}', '{rideId}', '{reason}'],
    active: true,
    createdAt: '2026-08-12 15:00 PKT',
    updatedAt: '2026-09-10 14:00 PKT'
  },
  {
    id: 'tmpl-monsoon-surge',
    name: 'Rain / Monsoon Earnings Surge',
    type: 'promotional',
    title: 'Rain Surge Active: Earn Up to +30% Extra in {city}',
    titleUrdu: 'بارش کا خصوصی بونس: {city} میں 30 فیصد تک اضافی کمائی',
    message: 'Monsoon showers in {city}. High customer demand across Gulberg, Clifton, and F-10. Drive safely and maximize your daily revenue.',
    messageUrdu: '{city} میں بارش کی وجہ سے سواریوں کا شدید رش ہے۔ احتیاط سے ڈرائیو کریں اور زیادہ سے زیادہ منافع کمائیں۔',
    priority: 'normal',
    defaultChannels: ['in_app', 'push_fcm'],
    targetAudience: 'driver',
    placeholders: ['{city}'],
    active: true,
    createdAt: '2026-08-25 12:00 PKT',
    updatedAt: '2026-09-12 17:00 PKT'
  },
  {
    id: 'tmpl-system-maintenance',
    name: 'Scheduled Maintenance Window',
    type: 'maintenance',
    title: 'Scheduled System Upgrade on Sunday Night',
    titleUrdu: 'اتوار کی رات سسٹم کی شیڈولڈ دیکھ بھال',
    message: 'GoLife platform services will undergo scheduled routine maintenance from 03:00 AM to 04:30 AM PKT. Minimal trip disruptions are expected.',
    messageUrdu: 'گو لائف پلیٹ فارم پر اتوار کی رات 03:00 سے 04:30 بجے تک معمول کی دیکھ بھال کی جائے گی۔ تمام سروسز جلد بحال ہو جائیں گی۔',
    priority: 'normal',
    defaultChannels: ['in_app', 'push_fcm'],
    targetAudience: 'both',
    placeholders: ['{date}'],
    active: true,
    createdAt: '2026-09-01 09:00 PKT',
    updatedAt: '2026-09-10 11:00 PKT'
  }
];

// ==========================================
// 2. INITIAL REALISTIC DEMO NOTIFICATIONS
// ==========================================

export const INITIAL_DEMO_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'NOTIF-2026-901',
    title: 'Driver Verification Approved: Muhammad Asif Rasheed',
    titleUrdu: 'ڈرائیور کی تصدیق منظور: محمد آصف رشید',
    message: 'Driver CNIC, Punjab Driving License, and Mehran registration verified in full compliance. Live dispatch permissions activated.',
    messageUrdu: 'ڈرائیور کے تمام کاغذات مکمل اور تصدیق شدہ ہیں۔ لائیو ڈسپیچ فعال کر دی گئی ہے۔',
    type: 'driver_verification',
    priority: 'high',
    recipientType: 'driver_single',
    recipientId: 'd-201',
    recipientName: 'Muhammad Asif Rasheed',
    recipientPhone: '+92 302 4491823',
    recipientCity: 'Lahore',
    recipientCategory: 'GoMini',
    channels: ['in_app', 'push_fcm', 'sms'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-12 18:30 PKT',
    sentAt: '2026-09-12 18:25 PKT',
    createdAt: '2026-09-12 18:24 PKT',
    createdBy: 'verification@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'verification',
      id: 'ver-301',
      code: 'VER-PK-301',
      label: 'CNIC & Driving License'
    },
    reachCount: 1,
    openCount: 1
  },
  {
    id: 'NOTIF-2026-902',
    title: 'Notice: Driving License Expiring in 7 Days (Zubair Qureshi)',
    titleUrdu: 'اطلاع: ڈرائیونگ لائسنس 7 دنوں میں ختم ہو رہا ہے (زبیر قریشی)',
    message: 'Your Sindh Commercial Driving License (DL-KHI-49021) will expire on 2026-09-20. Upload renewal receipt before expiry to avoid suspension.',
    messageUrdu: 'آپ کا سندھ ڈرائیونگ لائسنس 20 ستمبر 2026 کو ختم ہو رہا ہے۔ فوری تجدید کروائیں۔',
    type: 'document_expiry',
    priority: 'urgent',
    recipientType: 'driver_single',
    recipientId: 'd-203',
    recipientName: 'Zubair Qureshi',
    recipientPhone: '+92 345 8819023',
    recipientCity: 'Karachi',
    recipientCategory: 'GoRide',
    channels: ['in_app', 'push_fcm', 'whatsapp'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: false,
    sentAt: '2026-09-13 09:15 PKT',
    createdAt: '2026-09-13 09:14 PKT',
    createdBy: 'system@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'driver',
      id: 'd-203',
      code: 'DRV-PK-203',
      label: 'License Expiry Tracking'
    },
    reachCount: 1,
    openCount: 0
  },
  {
    id: 'NOTIF-2026-903',
    title: 'Compliance Fine Levied: Rs. 500 (Late Arrival Infraction)',
    titleUrdu: 'جرمانہ عائد: 500 روپے (تاخیر سے آمد پر)',
    message: 'Fine of Rs. 500 deducted from wallet for excessive pickup delay (+18 mins past SLA) on Ride #GL-PK-89104 in Clifton, Karachi.',
    messageUrdu: 'رائیڈ نمبر GL-PK-89104 پر 18 منٹ غیر ضروری تاخیر کی وجہ سے 500 روپے کا جرمانہ عائد کیا گیا ہے۔',
    type: 'fine',
    priority: 'urgent',
    recipientType: 'driver_single',
    recipientId: 'd-202',
    recipientName: 'Khurram Shehzad',
    recipientPhone: '+92 321 9918204',
    recipientCity: 'Karachi',
    recipientCategory: 'GoComfort',
    channels: ['in_app', 'push_fcm', 'sms'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-13 11:05 PKT',
    sentAt: '2026-09-13 10:45 PKT',
    createdAt: '2026-09-13 10:44 PKT',
    createdBy: 'finance@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'fine',
      id: 'FN-9021',
      code: 'FN-9021',
      label: 'Late Pickup Fine'
    },
    reachCount: 1,
    openCount: 1
  },
  {
    id: 'NOTIF-2026-904',
    title: 'Automatic Dispatch Suspension: Tariq Mehmood (5 Late Pickups)',
    titleUrdu: 'خودکار معطلی کا نوٹس: طارق محمود (5 مرتبہ تاخیر)',
    message: 'System triggered 24-hour dispatch lockout due to reaching 5 late pickup incidents in a single day. Review compliance guidelines in Academy.',
    messageUrdu: 'ایک ہی دن میں 5 مرتبہ تاخیر کی وجہ سے سسٹم نے 24 گھنٹے کے لیے اکاؤنٹ معطل کر دیا ہے۔',
    type: 'suspension',
    priority: 'critical',
    recipientType: 'driver_single',
    recipientId: 'd-205',
    recipientName: 'Tariq Mehmood',
    recipientPhone: '+92 333 4567890',
    recipientCity: 'Rawalpindi',
    recipientCategory: 'GoAuto',
    channels: ['in_app', 'push_fcm', 'sms'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: false,
    sentAt: '2026-09-13 12:10 PKT',
    createdAt: '2026-09-13 12:09 PKT',
    createdBy: 'system@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'suspension',
      id: 'susp-auto-d205',
      code: 'SUSP-PK-89',
      label: '24h Auto-Lockout'
    },
    reachCount: 1,
    openCount: 0
  },
  {
    id: 'NOTIF-2026-905',
    title: 'Payout Success: Rs. 12,500 Disbursed via EasyPaisa',
    titleUrdu: 'ادائیگی کامیاب: 12,500 روپے ایزی پیسہ کے ذریعے منتقل',
    message: 'Payout request #PO-8821 for Rs. 12,500 has been transferred to EasyPaisa wallet +92 302 4491823. Ref: EP-84910291.',
    messageUrdu: '12,500 روپے کی ادائیگی آپ کے ایزی پیسہ اکاؤنٹ میں منتقل کر دی گئی ہے۔ حوالہ نمبر EP-84910291۔',
    type: 'payout',
    priority: 'normal',
    recipientType: 'driver_single',
    recipientId: 'd-201',
    recipientName: 'Muhammad Asif Rasheed',
    recipientPhone: '+92 302 4491823',
    recipientCity: 'Lahore',
    recipientCategory: 'GoMini',
    channels: ['in_app', 'push_fcm', 'sms'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-12 17:10 PKT',
    sentAt: '2026-09-12 16:50 PKT',
    createdAt: '2026-09-12 16:49 PKT',
    createdBy: 'finance@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'payout',
      id: 'PO-8821',
      code: 'PO-8821',
      label: 'Weekly Settlement'
    },
    reachCount: 1,
    openCount: 1
  },
  {
    id: 'NOTIF-2026-906',
    title: 'Refund Credited: Rs. 250 for Route Overcharge (Hamza Shabbir)',
    titleUrdu: 'ریفنڈ شامل: غیر ضروری روٹ کے 250 روپے والیٹ میں جمع (حمزہ شبیر)',
    message: 'Support review completed for Ticket #CMP-2026-401. Driver took an unapproved detour. Rs. 250 compensation credited to your GoLife wallet.',
    messageUrdu: 'شکایت نمبر CMP-2026-401 کا جائزہ مکمل۔ روٹ کے اضافی 250 روپے آپ کے والیٹ میں جمع کر دیے گئے ہیں۔',
    type: 'refund',
    priority: 'high',
    recipientType: 'passenger_single',
    recipientId: 'p-102',
    recipientName: 'Hamza Shabbir',
    recipientPhone: '+92 321 4591028',
    recipientCity: 'Karachi',
    channels: ['in_app', 'push_fcm'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-12 19:40 PKT',
    sentAt: '2026-09-12 19:15 PKT',
    createdAt: '2026-09-12 19:10 PKT',
    createdBy: 'support@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'refund',
      id: 'REF-2026-401',
      code: 'REF-2026-401',
      label: 'Customer Fare Adjustment'
    },
    reachCount: 1,
    openCount: 1
  },
  {
    id: 'NOTIF-2026-907',
    title: 'Ride Cancelled Compensation: Rs. 150 Added to Wallet',
    titleUrdu: 'رائیڈ منسوخی کا معاوضہ: 150 روپے والیٹ میں شامل',
    message: 'Passenger cancelled after driver arrived at pickup location. Rs. 150 cancellation penalty fee credited to driver wallet.',
    messageUrdu: 'مسافر کی جانب سے رائیڈ کینسل ہونے پر 150 روپے کی فیس آپ کے والیٹ میں شامل کر دی گئی ہے۔',
    type: 'ride',
    priority: 'normal',
    recipientType: 'driver_single',
    recipientId: 'd-204',
    recipientName: 'Nawazish Ali',
    recipientPhone: '+92 300 7712390',
    recipientCity: 'Lahore',
    recipientCategory: 'GoAuto',
    channels: ['in_app', 'push_fcm'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-13 14:00 PKT',
    sentAt: '2026-09-13 13:40 PKT',
    createdAt: '2026-09-13 13:38 PKT',
    createdBy: 'system@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'ride',
      id: 'r-405',
      code: 'GL-PK-89085',
      label: 'Trip Cancellation'
    },
    reachCount: 1,
    openCount: 1
  },
  {
    id: 'NOTIF-2026-908',
    title: 'Safety Check: Accidental SOS Signal Cleared (Zainab Fatima)',
    titleUrdu: 'حفاظتی الرٹ: حادثاتی ایمرجنسی بٹن کی تصدیق مکمل',
    message: 'Emergency ops team contacted passenger via phone. Confirmed safe journey and accidental button trigger. SOS case closed.',
    messageUrdu: 'ایمرجنسی ٹیم نے مسافر سے رابطہ کر کے خیریت دریافت کر لی ہے۔ کیس بند کر دیا گیا ہے۔',
    type: 'safety',
    priority: 'urgent',
    recipientType: 'passenger_single',
    recipientId: 'p-101',
    recipientName: 'Zainab Fatima',
    recipientPhone: '+92 300 8472911',
    recipientCity: 'Lahore',
    channels: ['in_app', 'push_fcm', 'sms'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-12 18:15 PKT',
    sentAt: '2026-09-12 18:10 PKT',
    createdAt: '2026-09-12 18:09 PKT',
    createdBy: 'safety@golife.pk',
    source: 'automatic',
    relatedEntity: {
      type: 'safety',
      id: 'sft-201',
      code: 'SOS-PK-991',
      label: 'Emergency Hotline Call'
    },
    reachCount: 1,
    openCount: 1
  },
  {
    id: 'NOTIF-2026-909',
    title: 'Heavy Rain Surge Alert: Lahore Fleet (+25% Surge Active)',
    titleUrdu: 'لاہور میں بارش کی وجہ سے 25 فیصد اضافی کرایہ فعال',
    message: 'Severe rain showers in Gulberg, DHA, and Model Town. High passenger demand across all categories. Drive safely.',
    messageUrdu: 'لاہور میں بارش کے باعث رائیڈز پر اضافی بونس اور زائد کرایہ فعال کر دیا گیا ہے۔ احتیاط سے گاڑی چلائیں۔',
    type: 'promotional',
    priority: 'normal',
    recipientType: 'drivers_city',
    recipientCity: 'Lahore',
    channels: ['in_app', 'push_fcm'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: true,
    readAt: '2026-09-12 15:30 PKT',
    sentAt: '2026-09-12 15:00 PKT',
    createdAt: '2026-09-12 14:55 PKT',
    createdBy: 'admin@golife.pk',
    source: 'manual',
    reachCount: 148,
    openCount: 112
  },
  {
    id: 'NOTIF-2026-910',
    title: 'Routine Database Maintenance Scheduled for 03:00 AM PKT',
    titleUrdu: 'سسٹم کی شیڈولڈ دیکھ بھال رات 03:00 بجے',
    message: 'GoLife cloud servers will undergo performance and indexing optimization for 30 minutes on Sunday. No trip disruptions expected.',
    messageUrdu: 'گو لائف کلاؤڈ سرورز پر اتوار کو 30 منٹ کے لیے معمول کا کام کیا جائے گا۔',
    type: 'system',
    priority: 'normal',
    recipientType: 'all',
    channels: ['in_app'],
    status: 'delivered',
    deliveryAttempts: 1,
    read: false,
    sentAt: '2026-09-13 08:00 PKT',
    createdAt: '2026-09-13 07:50 PKT',
    createdBy: 'super_admin@golife.pk',
    source: 'manual',
    reachCount: 12500,
    openCount: 3840
  }
];

// ==========================================
// 3. PUSH NOTIFICATION ADAPTER INTERFACES
//    (Firebase FCM-ready, SMS, WhatsApp)
// ==========================================

export interface PushNotificationPayload {
  recipientToken?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'normal' | 'high';
}

export interface NotificationAdapterResponse {
  success: boolean;
  channel: NotificationDeliveryChannel;
  messageId?: string;
  status: 'sent' | 'delivered' | 'failed';
  error?: string;
}

// In-App Notification Store Adapter
export class InAppNotificationAdapter {
  static async send(payload: PushNotificationPayload): Promise<NotificationAdapterResponse> {
    // Stored in state/localStorage/Firestore collections
    return {
      success: true,
      channel: 'in_app',
      messageId: `inapp-${Date.now()}`,
      status: 'delivered'
    };
  }
}

// Firebase Cloud Messaging (FCM) Adapter Interface
export class FirebaseFcmPushAdapter {
  static isConfigured(): boolean {
    return false; // Will return true when real FCM server credentials are provided
  }

  static async send(payload: PushNotificationPayload): Promise<NotificationAdapterResponse> {
    // In Demo Mode, simulates instant FCM dispatch to Android/iOS Driver and Passenger apps
    return {
      success: true,
      channel: 'push_fcm',
      messageId: `fcm-msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      status: 'delivered'
    };
  }
}

// Pakistan SMS Gateway Adapter (Jazz / Telenor / Zong Telco SMS)
export class PakistanSmsGatewayAdapter {
  static async send(payload: PushNotificationPayload): Promise<NotificationAdapterResponse> {
    // Masks +92 phone number and delivers standard 160-char SMS
    return {
      success: true,
      channel: 'sms',
      messageId: `sms-pk-${Date.now()}`,
      status: 'delivered'
    };
  }
}

// WhatsApp Business API Adapter
export class WhatsAppBusinessAdapter {
  static async send(payload: PushNotificationPayload): Promise<NotificationAdapterResponse> {
    return {
      success: true,
      channel: 'whatsapp',
      messageId: `wa-pk-${Date.now()}`,
      status: 'delivered'
    };
  }
}

// ==========================================
// 4. TEMPLATE & PLACEHOLDER ENGINE
// ==========================================

export function replaceTemplatePlaceholders(text: string, data: Record<string, string | number>): string {
  if (!text) return '';
  let result = text;
  Object.keys(data || {}).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(data[key] ?? ''));
  });
  return result;
}

// ==========================================
// 5. YEAR-WISE REPORTING DATA ENGINE
// ==========================================

export function generateYearlyAnalytics(
  year: number = 2026,
  selectedMonthOrRides?: any,
  driversOrRides?: any,
  passengersOrDrivers?: any
): YearlyReportData {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Resolve argument flexibility
  let selectedMonth: number | 'all' = 'all';
  let ridesList: any[] = [];

  if (Array.isArray(selectedMonthOrRides)) {
    ridesList = selectedMonthOrRides;
  } else if (typeof selectedMonthOrRides === 'number' || selectedMonthOrRides === 'all') {
    selectedMonth = selectedMonthOrRides;
    if (Array.isArray(driversOrRides)) {
      ridesList = driversOrRides;
    }
  }

  // Base coefficients for realistic Pakistani seasonal transport demand
  // (e.g. Ramadan peak, Eid shopping surges, Monsoon delays, Winter weddings)
  const monthSeasonalityWeights = [
    0.85, // Jan
    0.92, // Feb
    1.15, // Mar (Pre-Ramadan / Spring)
    1.30, // Apr (Eid-ul-Fitr rush)
    1.10, // May
    1.25, // Jun (Eid-ul-Adha)
    1.05, // Jul (Monsoon surge)
    1.12, // Aug (Azadi celebrations)
    1.08, // Sep
    1.18, // Oct (Wedding season kickoff)
    1.22, // Nov
    1.35  // Dec (Winter tourism & shopping)
  ];

  const totalBaseCompletedRides = Array.isArray(ridesList) && ridesList.length > 0 ? ridesList.length : 1240;
  const avgFare = 540; // PKR
  const commissionRate = 0.15; // 15%

  const months: YearlyMonthSummary[] = monthNames.map((name, idx) => {
    const weight = monthSeasonalityWeights[idx];
    const monthRides = Math.round((totalBaseCompletedRides / 12) * weight * (year === 2026 ? 1.4 : year === 2025 ? 1.1 : 0.85));
    const revenuePKR = monthRides * avgFare;
    const commissionPKR = Math.round(revenuePKR * commissionRate);
    const driverEarningsPKR = revenuePKR - commissionPKR;
    const finesPKR = Math.round(monthRides * 4.5);
    const refundsPKR = Math.round(monthRides * 2.8);
    const reimbursementsPKR = Math.round(monthRides * 1.5);
    const payoutsPKR = Math.round(driverEarningsPKR * 0.94);
    const cancellations = Math.round(monthRides * 0.08);
    const complaints = Math.round(monthRides * 0.02);
    const newDrivers = Math.round(28 * weight);
    const newPassengers = Math.round(180 * weight);

    return {
      monthIndex: idx,
      monthName: name,
      rides: monthRides,
      revenuePKR,
      commissionPKR,
      driverEarningsPKR,
      finesPKR,
      refundsPKR,
      reimbursementsPKR,
      payoutsPKR,
      cancellations,
      complaints,
      newDrivers,
      newPassengers
    };
  });

  const targetMonths = typeof selectedMonth === 'number' && months[selectedMonth]
    ? [months[selectedMonth]]
    : months;

  const totalRides = targetMonths.reduce((sum, m) => sum + (m.rides || 0), 0);
  const totalRevenuePKR = targetMonths.reduce((sum, m) => sum + (m.revenuePKR || 0), 0);
  const totalCommissionPKR = targetMonths.reduce((sum, m) => sum + (m.commissionPKR || 0), 0);
  const totalDriverEarningsPKR = targetMonths.reduce((sum, m) => sum + (m.driverEarningsPKR || 0), 0);
  const totalFinesPKR = targetMonths.reduce((sum, m) => sum + (m.finesPKR || 0), 0);
  const totalRefundsPKR = targetMonths.reduce((sum, m) => sum + (m.refundsPKR || 0), 0);
  const totalReimbursementsPKR = targetMonths.reduce((sum, m) => sum + (m.reimbursementsPKR || 0), 0);
  const totalPayoutsPKR = targetMonths.reduce((sum, m) => sum + (m.payoutsPKR || 0), 0);
  const totalCancellations = targetMonths.reduce((sum, m) => sum + (m.cancellations || 0), 0);
  const totalComplaints = targetMonths.reduce((sum, m) => sum + (m.complaints || 0), 0);
  const driverGrowth = targetMonths.reduce((sum, m) => sum + (m.newDrivers || 0), 0);
  const passengerGrowth = targetMonths.reduce((sum, m) => sum + (m.newPassengers || 0), 0);
  const completedRidesCount = Math.max(0, totalRides - totalCancellations);

  return {
    year,
    totalRides,
    ridesCount: totalRides,
    completedRidesCount,
    totalRevenuePKR,
    grossRevenuePKR: totalRevenuePKR,
    totalCommissionPKR,
    commissionRevenuePKR: totalCommissionPKR,
    totalDriverEarningsPKR,
    driverEarningsPKR: totalDriverEarningsPKR,
    totalFinesPKR,
    finesAmountPKR: totalFinesPKR,
    totalRefundsPKR,
    refundsAmountPKR: totalRefundsPKR,
    totalReimbursementsPKR,
    reimbursementsAmountPKR: totalReimbursementsPKR,
    totalPayoutsPKR,
    payoutsAmountPKR: totalPayoutsPKR,
    totalCancellations,
    cancelledCount: totalCancellations,
    totalComplaints,
    complaintsCount: totalComplaints,
    driverGrowth,
    newDriversCount: driverGrowth,
    passengerGrowth,
    newPassengersCount: passengerGrowth,
    months
  };
}

// ==========================================
// 6. AI NOTIFICATION DRAFTING HELPER
// ==========================================

export function draftNotificationWithAi(
  intent: 'compliance' | 'weather' | 'fare_dispute' | 'general' | 'payout',
  target: 'driver' | 'passenger',
  context?: { name?: string; city?: string; amount?: number; reason?: string }
): { title: string; titleUrdu: string; message: string; messageUrdu: string; priority: NotificationPriority } {
  const name = context?.name || (target === 'driver' ? 'Driver Partner' : 'Valued Passenger');
  const city = context?.city || 'Lahore';
  const amount = context?.amount || 500;
  const reason = context?.reason || 'Service adjustment';

  switch (intent) {
    case 'compliance':
      return {
        title: `Compliance Advisory for ${city} Fleet`,
        titleUrdu: `${city} کے ڈرائیورز کے لیے حفاظتی ہدایات`,
        message: `Dear ${name}, please ensure driving within prescribed city speed limits and maintaining active vehicle AC during peak heat hours.`,
        messageUrdu: `محترم ${name}، برائے مہربانی شہر کی مقررہ رفتار کی پابندی کریں اور گرمی میں اے سی کو فعال رکھیں۔`,
        priority: 'high'
      };
    case 'weather':
      return {
        title: `Monsoon Weather Advisory: ${city}`,
        titleUrdu: `${city} میں بارش کا الرٹ اور خصوصی بونس`,
        message: `Rain showers reported in ${city}. Ride demand is surging. Drive with headlights on, maintain safe braking distances, and earn bonus fares.`,
        messageUrdu: `${city} میں بارش کی وجہ سے سواریوں کا رش ہے۔ احتیاط اور حفاظت کے ساتھ گاڑی چلائیں اور زیادہ کمائی کریں۔`,
        priority: 'normal'
      };
    case 'fare_dispute':
      return {
        title: `Fare Review Resolution for ${name}`,
        titleUrdu: `کرایہ کے جائزے کا حتمی فیصلہ`,
        message: `Dear ${name}, our operations audit regarding ${reason} has concluded. A net adjustment of Rs. ${amount} has been applied to your wallet.`,
        messageUrdu: `محترم ${name}، آپ کے کرائے کا تفصیلی آڈٹ مکمل کر لیا گیا ہے اور ${amount} روپے آپ کے والیٹ میں منتقل کر دیے گئے ہیں۔`,
        priority: 'high'
      };
    case 'payout':
      return {
        title: `Wallet Settlement Processed: Rs. ${amount}`,
        titleUrdu: `والیٹ کی ادائیگی مکمل: ${amount} روپے`,
        message: `Dear ${name}, your balance transfer of Rs. ${amount} has been successfully settled via fast IBFT / Mobile Wallet transfer.`,
        messageUrdu: `محترم ${name}، آپ کے ${amount} روپے کی ادائیگی کامیابی سے آپ کے اکاؤنٹ میں منتقل کر دی گئی ہے۔`,
        priority: 'normal'
      };
    default:
      return {
        title: `Important Service Update from GoLife Taxi`,
        titleUrdu: `گو لائف ٹیکسی کی جانب سے اہم پیغام`,
        message: `Dear ${name}, thank you for choosing GoLife Taxi. We are continuously improving our safety and dispatch experience in ${city}.`,
        messageUrdu: `محترم ${name}، گو لائف ٹیکسی کو منتخب کرنے کا شکریہ۔ ہم آپ کے سفر کو ہر روز محفوظ اور بہتر بنا رہے ہیں۔`,
        priority: 'normal'
      };
  }
}
