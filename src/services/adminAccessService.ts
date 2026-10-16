import {
  AdminRole,
  AdminUser,
  AdminTab,
  AdminAccountStatus,
  PermissionModule,
  PermissionLevel,
  SensitivePermission,
  AdminRoleDefinition,
  AdminSession,
  AdminInvitation,
  AdminApprovalRule,
  AdminSecurityAlert
} from '../types';

// ==========================================
// ALL 24 PLATFORM MODULES
// ==========================================
export const ALL_PERMISSION_MODULES: { id: PermissionModule; label: string; category: string }[] = [
  { id: 'dashboard', label: 'Command Dashboard', category: 'Executive' },
  { id: 'live_operations', label: 'Live Operations & Fleet Radar', category: 'Operations' },
  { id: 'rides', label: 'Ride Bookings & Dispatch', category: 'Operations' },
  { id: 'drivers', label: 'Driver Directory & Fleet', category: 'Fleet' },
  { id: 'driver_control', label: 'Driver Control & Suspension', category: 'Fleet' },
  { id: 'driver_performance', label: 'Performance & Risk Scoring', category: 'Fleet' },
  { id: 'verification', label: 'CNIC & Document Verification', category: 'Fleet' },
  { id: 'passengers', label: 'Passenger Directory', category: 'Users' },
  { id: 'cities', label: 'Cities & Regional Operations', category: 'Operations' },
  { id: 'service_categories', label: 'Service Categories & Matrix', category: 'Operations' },
  { id: 'pricing', label: 'Tariffs, Pricing & Fuel Surge', category: 'Finance' },
  { id: 'fines', label: 'Fines, Violations & Deductions', category: 'Finance' },
  { id: 'refunds', label: 'Passenger Refunds', category: 'Finance' },
  { id: 'reimbursements', label: 'Driver Reimbursements', category: 'Finance' },
  { id: 'payouts', label: 'Driver Payouts & Banking', category: 'Finance' },
  { id: 'reports', label: 'Reports & Analytics', category: 'Intelligence' },
  { id: 'promotions', label: 'Promotions, Referrals & Rewards', category: 'Marketing' },
  { id: 'notifications', label: 'Push Notifications & SMS Dispatch', category: 'Communications' },
  { id: 'support', label: 'Central Support & Cases', category: 'Support' },
  { id: 'complaints', label: 'Complaints & Disputes', category: 'Support' },
  { id: 'safety', label: 'Safety & SOS Emergency Center', category: 'Safety' },
  { id: 'fraud_risk', label: 'Fraud, Anti-Abuse & Risk Control Center', category: 'Security' },
  { id: 'admin_users', label: 'Admin Users & Access Control', category: 'Governance' },
  { id: 'settings', label: 'System Configuration', category: 'Governance' },
  { id: 'audit_logs', label: 'Immutable Audit Trail', category: 'Governance' }
];

export const ALL_PERMISSION_LEVELS: { id: PermissionLevel; label: string; desc: string }[] = [
  { id: 'view', label: 'View', desc: 'Read-only access to inspect records and cards' },
  { id: 'create', label: 'Create', desc: 'Create new entities, records, tickets, or configs' },
  { id: 'edit', label: 'Edit', desc: 'Modify existing operational parameters and profiles' },
  { id: 'approve', label: 'Approve', desc: 'Authorize verifications, payouts, and adjustments' },
  { id: 'reject', label: 'Reject', desc: 'Decline requests, payouts, or document reviews' },
  { id: 'execute', label: 'Execute', desc: 'Run batches, dispatches, live interventions' },
  { id: 'export', label: 'Export', desc: 'Download CSV, Excel, and analytical telemetry' },
  { id: 'manage', label: 'Manage', desc: 'Full administrative lifecycle ownership' }
];

export const ALL_SENSITIVE_PERMISSIONS: { id: SensitivePermission; label: string; desc: string; dangerLevel: 'high' | 'critical' }[] = [
  { id: 'driver_suspension', label: 'Driver Suspension', desc: 'Manually suspend or block driver accounts from online dispatch', dangerLevel: 'critical' },
  { id: 'driver_reinstatement', label: 'Driver Reinstatement', desc: 'Lift disciplinary suspensions and restore driving eligibility', dangerLevel: 'high' },
  { id: 'driver_fine', label: 'Driver Fine Issuance', desc: 'Apply penal wallet deductions and non-negotiable fines', dangerLevel: 'high' },
  { id: 'refund_approval', label: 'Passenger Refund Approval', desc: 'Authorize direct debit reversals or wallet credits to passengers', dangerLevel: 'high' },
  { id: 'reimbursement_approval', label: 'Driver Reimbursement', desc: 'Authorize toll, fuel or damage compensation to driver accounts', dangerLevel: 'high' },
  { id: 'payout_approval', label: 'Driver Payout Approval', desc: 'Authorize banking/JazzCash/EasyPaisa cash withdrawals', dangerLevel: 'critical' },
  { id: 'pricing_changes', label: 'Tariff & Pricing Overrides', desc: 'Modify base fares, kilometer rates, or fuel surge multipliers', dangerLevel: 'critical' },
  { id: 'financial_rule_changes', label: 'Financial Rules & Thresholds', desc: 'Edit automated deduction rules, commission % and limits', dangerLevel: 'critical' },
  { id: 'risk_rule_changes', label: 'Risk Rules & Thresholds', desc: 'Modify autonomous fraud detection rules and threshold levels', dangerLevel: 'critical' },
  { id: 'fraud_clearance', label: 'Risk Alert Dismissal / Clearance', desc: 'Authorize clearing critical fraud alerts or marking false positive', dangerLevel: 'high' },
  { id: 'admin_user_changes', label: 'Admin User Governance', desc: 'Invite, edit, suspend, lock, or modify admin permissions', dangerLevel: 'critical' },
  { id: 'safety_escalation', label: 'Safety & SOS Escalation', desc: 'Trigger high-priority emergency workflows and command dispatch', dangerLevel: 'critical' },
  { id: 'account_restrictions', label: 'Lock & Security Restrictions', desc: 'Impose security blocks, password resets or session revoking', dangerLevel: 'high' }
];

// ==========================================
// SYSTEM DEFAULT ROLES WITH COMPLETE MATRICES
// ==========================================
export const DEFAULT_SYSTEM_ROLES: AdminRoleDefinition[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    code: 'super_admin',
    description: 'Unrestricted enterprise authority across all system modules, configurations, financial controls, and admin user management.',
    isSystemDefault: true,
    colorBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    modulePermissions: {
      dashboard: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      live_operations: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      rides: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      drivers: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      driver_control: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      driver_performance: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      verification: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      passengers: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      cities: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      service_categories: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      pricing: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      fines: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      refunds: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      reimbursements: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      payouts: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      reports: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      promotions: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      notifications: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      support: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      complaints: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      safety: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      fraud_risk: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      admin_users: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      settings: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      audit_logs: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage']
    },
    sensitivePermissions: [
      'driver_suspension',
      'driver_reinstatement',
      'driver_fine',
      'refund_approval',
      'reimbursement_approval',
      'payout_approval',
      'pricing_changes',
      'financial_rule_changes',
      'risk_rule_changes',
      'fraud_clearance',
      'admin_user_changes',
      'safety_escalation',
      'account_restrictions'
    ]
  },
  {
    id: 'role-operations-admin',
    name: 'Operations Admin',
    code: 'operations_admin',
    description: 'Fleet command, live telemetry, ride dispatching, driver operational monitoring, city status controls and incident dispatching.',
    isSystemDefault: true,
    colorBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    modulePermissions: {
      dashboard: ['view', 'export'],
      live_operations: ['view', 'edit', 'execute', 'export', 'manage'],
      rides: ['view', 'create', 'edit', 'execute', 'export'],
      drivers: ['view', 'edit', 'export'],
      driver_control: ['view', 'create', 'edit', 'execute'],
      driver_performance: ['view', 'export'],
      verification: ['view', 'approve', 'reject'],
      cities: ['view', 'edit', 'manage'],
      service_categories: ['view', 'edit'],
      safety: ['view', 'create', 'edit', 'execute'],
      notifications: ['view', 'create', 'execute'],
      audit_logs: ['view']
    },
    sensitivePermissions: [
      'driver_suspension',
      'driver_reinstatement',
      'safety_escalation'
    ]
  },
  {
    id: 'role-finance-admin',
    name: 'Finance Admin',
    code: 'finance_admin',
    description: 'Driver settlements, payouts approval, wallet adjustments, pricing matrices, fines, refunds and financial reporting.',
    isSystemDefault: true,
    colorBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    modulePermissions: {
      dashboard: ['view', 'export'],
      pricing: ['view', 'edit', 'manage'],
      fines: ['view', 'create', 'approve', 'reject', 'manage'],
      refunds: ['view', 'create', 'approve', 'reject', 'manage'],
      reimbursements: ['view', 'create', 'approve', 'reject', 'manage'],
      payouts: ['view', 'approve', 'reject', 'execute', 'export', 'manage'],
      reports: ['view', 'export'],
      promotions: ['view', 'create', 'edit'],
      audit_logs: ['view']
    },
    sensitivePermissions: [
      'driver_fine',
      'refund_approval',
      'reimbursement_approval',
      'payout_approval',
      'pricing_changes',
      'financial_rule_changes'
    ]
  },
  {
    id: 'role-support-admin',
    name: 'Support Admin',
    code: 'support_admin',
    description: 'Customer success, dispute resolution, lost & found, complaint handling, driver conduct investigations and passenger support.',
    isSystemDefault: true,
    colorBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    modulePermissions: {
      dashboard: ['view'],
      support: ['view', 'create', 'edit', 'approve', 'reject', 'manage'],
      complaints: ['view', 'create', 'edit', 'approve', 'reject', 'manage'],
      passengers: ['view', 'edit', 'export'],
      drivers: ['view'],
      rides: ['view'],
      safety: ['view', 'create', 'edit'],
      notifications: ['view', 'create'],
      audit_logs: ['view']
    },
    sensitivePermissions: [
      'refund_approval',
      'safety_escalation'
    ]
  },
  {
    id: 'role-safety-admin',
    name: 'Safety Admin',
    code: 'safety_admin',
    description: 'SOS panic handling, real-time telemetry route deviations, emergency contact coordination, collision checks and high-severity incidents.',
    isSystemDefault: true,
    colorBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    modulePermissions: {
      dashboard: ['view'],
      safety: ['view', 'create', 'edit', 'approve', 'reject', 'execute', 'export', 'manage'],
      live_operations: ['view', 'execute'],
      rides: ['view'],
      drivers: ['view', 'edit'],
      driver_control: ['view', 'create', 'execute'],
      complaints: ['view', 'edit'],
      support: ['view', 'edit'],
      notifications: ['view', 'create', 'execute'],
      audit_logs: ['view']
    },
    sensitivePermissions: [
      'safety_escalation',
      'driver_suspension',
      'account_restrictions'
    ]
  },
  {
    id: 'role-verification-admin',
    name: 'Verification Admin',
    code: 'verification_admin',
    description: 'Driver onboarding, NADRA CNIC verification, driving license authenticity, criminal background checks and vehicle inspections.',
    isSystemDefault: true,
    colorBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    modulePermissions: {
      dashboard: ['view'],
      verification: ['view', 'create', 'edit', 'approve', 'reject', 'manage'],
      drivers: ['view', 'edit'],
      driver_performance: ['view'],
      reports: ['view'],
      audit_logs: ['view']
    },
    sensitivePermissions: [
      'account_restrictions'
    ]
  },
  {
    id: 'role-reports-admin',
    name: 'Reports Admin',
    code: 'reports_admin',
    description: 'Analytics, platform operational intelligence, rider growth metrics, financial reconciliations and export generation.',
    isSystemDefault: true,
    colorBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    modulePermissions: {
      dashboard: ['view', 'export'],
      reports: ['view', 'create', 'export', 'manage'],
      rides: ['view', 'export'],
      drivers: ['view', 'export'],
      passengers: ['view', 'export'],
      payouts: ['view', 'export'],
      pricing: ['view', 'export'],
      audit_logs: ['view', 'export']
    },
    sensitivePermissions: []
  },
  {
    id: 'role-city-manager',
    name: 'City Manager',
    code: 'city_manager',
    description: 'Scoped regional operations commander for a dedicated city (e.g. Lahore, Karachi, Islamabad/Rawalpindi). Manages local fleet and rides.',
    isSystemDefault: true,
    colorBadge: 'bg-teal-50 text-teal-700 border-teal-200',
    modulePermissions: {
      dashboard: ['view'],
      live_operations: ['view', 'edit', 'execute'],
      rides: ['view', 'edit', 'execute'],
      drivers: ['view', 'edit'],
      driver_control: ['view', 'execute'],
      cities: ['view', 'edit'],
      service_categories: ['view', 'edit'],
      complaints: ['view', 'edit'],
      reports: ['view', 'export'],
      safety: ['view', 'edit'],
      audit_logs: ['view']
    },
    sensitivePermissions: [
      'driver_suspension',
      'driver_fine'
    ]
  },
  {
    id: 'role-read-only-admin',
    name: 'Read-Only Admin',
    code: 'read_only_admin',
    description: 'Auditing, inspection, and regulatory oversight. Complete read access across authorized modules with zero modification or execution rights.',
    isSystemDefault: true,
    colorBadge: 'bg-slate-100 text-slate-700 border-slate-300',
    modulePermissions: {
      dashboard: ['view'],
      live_operations: ['view'],
      rides: ['view', 'export'],
      drivers: ['view', 'export'],
      driver_performance: ['view'],
      passengers: ['view', 'export'],
      verification: ['view'],
      cities: ['view'],
      service_categories: ['view'],
      pricing: ['view'],
      fines: ['view'],
      refunds: ['view'],
      reimbursements: ['view'],
      payouts: ['view'],
      reports: ['view', 'export'],
      promotions: ['view'],
      notifications: ['view'],
      support: ['view'],
      complaints: ['view'],
      safety: ['view'],
      audit_logs: ['view']
    },
    sensitivePermissions: []
  }
];

// ==========================================
// REALISTIC INITIAL ADMIN USERS
// ==========================================
export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-01',
    name: 'Muhammad Tariq Khan',
    email: 'admin@golife.pk',
    role: 'super_admin',
    roleTitle: 'Super Admin (Unrestricted System Access)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 17:45 PKT',
    lastActive: 'Active now',
    phone: '+92 300 8401923',
    department: 'Executive Management',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    twoFactorEnabled: true,
    createdAt: '2025-01-10',
    permissions: ['all']
  },
  {
    id: 'adm-02',
    name: 'Ayesha Siddiqui',
    email: 'operations@golife.pk',
    role: 'operations_admin',
    roleTitle: 'Operations Admin (Rides, Fleet & Cities)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 18:02 PKT',
    lastActive: '4m ago',
    phone: '+92 321 4591028',
    department: 'Central Dispatch Operations',
    status: 'active',
    cityScope: ['Lahore', 'Karachi'],
    assignedCity: 'Lahore, Karachi',
    twoFactorEnabled: true,
    createdAt: '2025-02-15'
  },
  {
    id: 'adm-03',
    name: 'Fatima Zahra',
    email: 'support@golife.pk',
    role: 'support_admin',
    roleTitle: 'Support Admin (Customer Success & Trust)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 17:15 PKT',
    lastActive: '12m ago',
    phone: '+92 333 4567890',
    department: 'Customer Care & Complaints',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    twoFactorEnabled: true,
    createdAt: '2025-03-01'
  },
  {
    id: 'adm-04',
    name: 'Farhan Zaidi',
    email: 'finance@golife.pk',
    role: 'finance_admin',
    roleTitle: 'Finance Admin (Treasury & Settlements)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 17:10 PKT',
    lastActive: '20m ago',
    phone: '+92 301 9876543',
    department: 'Treasury & Settlements',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    twoFactorEnabled: true,
    createdAt: '2025-02-20'
  },
  {
    id: 'adm-05',
    name: 'Capt. (R) Kamran Malik',
    email: 'safety@golife.pk',
    role: 'safety_admin',
    roleTitle: 'Safety Admin (Emergency Command & SOS)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 16:40 PKT',
    lastActive: '45m ago',
    phone: '+92 300 5554433',
    department: 'Emergency & Passenger Safety',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    twoFactorEnabled: true,
    createdAt: '2025-04-12'
  },
  {
    id: 'adm-06',
    name: 'Major (R) Bilal Hassan',
    email: 'verification@golife.pk',
    role: 'verification_admin',
    roleTitle: 'Verification Admin (Driver CNIC & NADRA)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 16:30 PKT',
    lastActive: '1h ago',
    phone: '+92 305 7778899',
    department: 'Onboarding & Driver Verification',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    twoFactorEnabled: false,
    createdAt: '2025-03-10'
  },
  {
    id: 'adm-07',
    name: 'Dr. Asim Jamil',
    email: 'analytics@golife.pk',
    role: 'reports_admin',
    roleTitle: 'Reports Admin (Business Intelligence)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-10 11:20 PKT',
    lastActive: '4 days ago',
    phone: '+92 322 8889900',
    department: 'Strategy & Data Intelligence',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    twoFactorEnabled: true,
    createdAt: '2025-05-01'
  },
  {
    id: 'adm-08',
    name: 'Engr. Usman Qureshi',
    email: 'islamabad.ops@golife.pk',
    role: 'city_manager',
    roleTitle: 'City Manager (Islamabad & Rawalpindi)',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 15:55 PKT',
    lastActive: '2h ago',
    phone: '+92 333 5188290',
    department: 'Twin Cities Regional Operations',
    status: 'active',
    cityScope: ['Islamabad', 'Rawalpindi'],
    assignedCity: 'Islamabad, Rawalpindi',
    twoFactorEnabled: true,
    createdAt: '2025-06-15'
  },
  {
    id: 'adm-09',
    name: 'Saira Bano',
    email: 'compliance.audit@golife.pk',
    role: 'read_only_admin',
    roleTitle: 'Read-Only Admin (External Compliance Auditor)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-14 14:10 PKT',
    lastActive: '3h ago',
    phone: '+92 345 6789012',
    department: 'Regulatory Compliance & Audit',
    status: 'active',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    isReadOnly: true,
    twoFactorEnabled: true,
    createdAt: '2025-07-20'
  },
  {
    id: 'adm-10',
    name: 'Hamza Rafique',
    email: 'suspended.user@golife.pk',
    role: 'operations_admin',
    roleTitle: 'Operations Dispatcher (Suspended)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-02 09:12 PKT',
    lastActive: '12 days ago',
    phone: '+92 300 4433221',
    department: 'Lahore Operations',
    status: 'suspended',
    cityScope: ['Lahore'],
    assignedCity: 'Lahore',
    suspensionReason: 'Pending internal review: Multiple unauthorized manual ride reassignments outside standard dispatch operating procedures.',
    twoFactorEnabled: false,
    createdAt: '2025-04-10'
  },
  {
    id: 'adm-11',
    name: 'Daniyal Sheikh',
    email: 'locked.user@golife.pk',
    role: 'finance_admin',
    roleTitle: 'Finance Officer (Account Locked)',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-09-13 22:45 PKT',
    lastActive: '18h ago',
    phone: '+92 321 1122334',
    department: 'Treasury & Settlements',
    status: 'locked',
    cityScope: ['Karachi'],
    assignedCity: 'Karachi',
    failedLoginAttempts: 5,
    lockReason: 'Account automatically secured: Exceeded 5 consecutive failed password attempts within 10 minutes from unrecognized IP address.',
    twoFactorEnabled: true,
    createdAt: '2025-05-18'
  }
];

// ==========================================
// INITIAL DEMO INVITATIONS
// ==========================================
export const DEFAULT_ADMIN_INVITATIONS: AdminInvitation[] = [
  {
    id: 'inv-01',
    name: 'Naeem Akhtar',
    email: 'naeem.ops@golife.pk',
    phone: '+92 345 8899112',
    role: 'operations_admin',
    roleTitle: 'Operations Admin (Faisalabad Hub)',
    department: 'Regional Dispatch & Fleet',
    cityScope: ['Faisalabad'],
    assignedCity: 'Faisalabad',
    permissionsSummary: 'Live Ops, Fleet Radar, Driver Management & Local Dispatch for Faisalabad',
    status: 'pending',
    sentAt: '2026-09-12 11:30 PKT',
    expiresAt: '2026-09-19 11:30 PKT',
    invitedBy: 'Muhammad Tariq Khan (Super Admin)',
    invitationToken: 'gl-inv-9921-fsd-40'
  },
  {
    id: 'inv-02',
    name: 'Dr. Mariam Alvi',
    email: 'dr.mariam@golife.pk',
    phone: '+92 300 2233445',
    role: 'safety_admin',
    roleTitle: 'Safety & Emergency Officer',
    department: 'Safety Command Center',
    cityScope: 'all',
    assignedCity: 'All Pakistan',
    permissionsSummary: 'SOS Emergency Response, Route Deviation Audits & Police Helplines',
    status: 'accepted',
    sentAt: '2026-09-08 09:00 PKT',
    expiresAt: '2026-09-15 09:00 PKT',
    invitedBy: 'Muhammad Tariq Khan (Super Admin)',
    invitationToken: 'gl-inv-8812-sft-09'
  },
  {
    id: 'inv-03',
    name: 'Zeeshan Merchant',
    email: 'zeeshan.finance@golife.pk',
    phone: '+92 321 6677889',
    role: 'finance_admin',
    roleTitle: 'Treasury Analyst',
    department: 'Treasury & Settlements',
    cityScope: ['Karachi'],
    assignedCity: 'Karachi',
    permissionsSummary: 'Payout Batch Verification & Bank Settlement Reconciliation',
    status: 'expired',
    sentAt: '2026-08-20 14:00 PKT',
    expiresAt: '2026-08-27 14:00 PKT',
    invitedBy: 'Farhan Zaidi (Finance Admin)',
    invitationToken: 'gl-inv-7701-fin-82'
  }
];

// ==========================================
// INITIAL ACTIVE SESSIONS
// ==========================================
export const DEFAULT_ADMIN_SESSIONS: AdminSession[] = [
  {
    id: 'sess-01',
    adminId: 'adm-01',
    adminName: 'Muhammad Tariq Khan',
    adminEmail: 'admin@golife.pk',
    device: 'Apple MacBook Pro 16" (M3 Max)',
    browser: 'Chrome 128.0',
    os: 'macOS Sonoma',
    ipAddress: '182.185.190.12 (Nayatel Corporate)',
    location: 'GoLife HQ, Lahore, Pakistan',
    loginTime: '2026-09-14 09:15 PKT',
    lastActivityTime: 'Just now',
    status: 'active',
    isCurrentSession: true
  },
  {
    id: 'sess-02',
    adminId: 'adm-01',
    adminName: 'Muhammad Tariq Khan',
    adminEmail: 'admin@golife.pk',
    device: 'Apple iPhone 16 Pro',
    browser: 'Mobile Safari 18.1',
    os: 'iOS 18',
    ipAddress: '39.40.112.55 (Jazz 5G LTE)',
    location: 'Lahore, Pakistan',
    loginTime: '2026-09-14 12:40 PKT',
    lastActivityTime: '25m ago',
    status: 'active',
    isCurrentSession: false
  },
  {
    id: 'sess-03',
    adminId: 'adm-02',
    adminName: 'Ayesha Siddiqui',
    adminEmail: 'operations@golife.pk',
    device: 'Dell Latitude 7440',
    browser: 'Edge 128.0',
    os: 'Windows 11 Pro',
    ipAddress: '110.38.12.84 (StormFiber Business)',
    location: 'Dispatch Center, Karachi, Pakistan',
    loginTime: '2026-09-14 10:00 PKT',
    lastActivityTime: '4m ago',
    status: 'active',
    isCurrentSession: false
  },
  {
    id: 'sess-04',
    adminId: 'adm-04',
    adminName: 'Farhan Zaidi',
    adminEmail: 'finance@golife.pk',
    device: 'Lenovo ThinkPad T14s',
    browser: 'Firefox 130.0',
    os: 'Ubuntu Linux 24.04 LTS',
    ipAddress: '119.160.118.24 (PTCL Flash Fiber)',
    location: 'Treasury Office, Islamabad, Pakistan',
    loginTime: '2026-09-14 08:30 PKT',
    lastActivityTime: '20m ago',
    status: 'active',
    isCurrentSession: false
  },
  {
    id: 'sess-05',
    adminId: 'adm-08',
    adminName: 'Engr. Usman Qureshi',
    adminEmail: 'islamabad.ops@golife.pk',
    device: 'HP EliteBook 840 G10',
    browser: 'Chrome 128.0',
    os: 'Windows 11 Pro',
    ipAddress: '202.141.240.10 (Nayatel Twin Cities)',
    location: 'Blue Area Command, Islamabad, Pakistan',
    loginTime: '2026-09-14 13:10 PKT',
    lastActivityTime: '2h ago',
    status: 'active',
    isCurrentSession: false
  }
];

// ==========================================
// SENSITIVE ACTION APPROVAL RULES
// ==========================================
export const DEFAULT_APPROVAL_RULES: AdminApprovalRule[] = [
  {
    id: 'appr-01',
    actionType: 'payout_approval',
    title: 'High-Value Driver Payout Dual Sign-off',
    description: 'Any driver wallet payout withdrawal exceeding PKR 50,000 requires secondary approval from Super Admin or Head of Treasury before banking gateway release.',
    requiresTwoPersonApproval: true,
    thresholdAmount: 50000,
    authorizedRoles: ['super_admin', 'finance_admin'],
    enabled: true
  },
  {
    id: 'appr-02',
    actionType: 'driver_suspension',
    title: 'Permanent Fleet Suspension Sign-off',
    description: 'Permanent driver deactivations or indefinite bans require two-person verification to prevent accidental fleet exclusion.',
    requiresTwoPersonApproval: true,
    thresholdAmount: 0,
    authorizedRoles: ['super_admin', 'operations_admin', 'safety_admin'],
    enabled: true
  },
  {
    id: 'appr-03',
    actionType: 'pricing_changes',
    title: 'City Tariff & Fuel Surge Adjustment',
    description: 'Any modification to base tariffs, per-km rates, or rush-hour multipliers requires dual sign-off from Finance and Operations.',
    requiresTwoPersonApproval: true,
    thresholdAmount: 0,
    authorizedRoles: ['super_admin', 'finance_admin'],
    enabled: true
  },
  {
    id: 'appr-04',
    actionType: 'refund_approval',
    title: 'High-Value Passenger Refund Dual Sign-off',
    description: 'Passenger dispute refunds exceeding PKR 5,000 require dual sign-off from Customer Support Lead and Finance.',
    requiresTwoPersonApproval: true,
    thresholdAmount: 5000,
    authorizedRoles: ['super_admin', 'finance_admin', 'support_admin'],
    enabled: true
  }
];

// ==========================================
// SECURITY ATTENTION & AI WARNINGS
// ==========================================
export const DEFAULT_SECURITY_ALERTS: AdminSecurityAlert[] = [
  {
    id: 'sec-01',
    adminId: 'adm-01',
    adminName: 'Muhammad Tariq Khan',
    type: 'excessive_privileges',
    severity: 'medium',
    title: 'Review Root Privileges on Executive Accounts',
    description: '1 account holds unrestricted Super Admin rights across all financial and fleet infrastructure. Verify multi-factor authentication enforcement.',
    suggestedAction: 'Enforce hardware security keys (FIDO2/WebAuthn) for Super Admin and rotate access keys every 90 days.',
    timestamp: '2026-09-14 08:00 PKT',
    status: 'open'
  },
  {
    id: 'sec-02',
    adminId: 'adm-11',
    adminName: 'Daniyal Sheikh',
    type: 'failed_logins',
    severity: 'high',
    title: 'Account Locked Due to Repeated Failed Password Attempts',
    description: 'Account locked following 5 failed password attempts within 8 minutes originating from IP 39.40.112.55 (Karachi).',
    suggestedAction: 'Contact administrator via verified phone to confirm identity before issuing password reset link.',
    timestamp: '2026-09-13 22:45 PKT',
    status: 'open'
  },
  {
    id: 'sec-03',
    adminId: 'adm-10',
    adminName: 'Hamza Rafique',
    type: 'unusual_sensitive_action',
    severity: 'critical',
    title: 'Suspended Account Still Has Active OAuth Tokens',
    description: 'Admin Hamza Rafique is suspended but had an active browser cookie from an earlier login. Force session revocation is advised.',
    suggestedAction: 'Trigger "Force Logout All Sessions" immediately to invalidate existing tokens at the token boundary.',
    timestamp: '2026-09-14 09:30 PKT',
    status: 'open'
  },
  {
    id: 'sec-04',
    adminId: 'inv-03',
    adminName: 'Zeeshan Merchant',
    type: 'expired_invitation',
    severity: 'low',
    title: 'Expired Admin Invitation Pending Garbage Collection',
    description: 'Invitation for Zeeshan Merchant (Finance Admin) expired 18 days ago without being claimed or accepted.',
    suggestedAction: 'Purge expired invitation token to prevent unauthorized late acceptance.',
    timestamp: '2026-09-14 06:00 PKT',
    status: 'open'
  }
];

// ==========================================
// HELPER & PERMISSION CHECKING UTILITIES
// ==========================================

export const isReadOnlyAdmin = (admin: AdminUser | null): boolean => {
  if (!admin) return true;
  if (admin.isReadOnly === true) return true;
  if (admin.role === 'read_only_admin') return true;
  return false;
};

export const hasPermission = (
  admin: AdminUser | null,
  module: PermissionModule,
  level: PermissionLevel = 'view',
  roleDefinitions: AdminRoleDefinition[] = DEFAULT_SYSTEM_ROLES
): boolean => {
  if (!admin) return false;
  if (admin.status === 'suspended' || admin.status === 'locked' || admin.status === 'inactive') {
    return false;
  }
  if (admin.role === 'super_admin') {
    return true;
  }
  if (admin.isReadOnly && level !== 'view' && level !== 'export') {
    return false;
  }

  // Check explicit admin user permission overrides
  if (admin.permissions && admin.permissions.includes('all')) {
    return true;
  }
  if (admin.permissions && admin.permissions.includes(`${module}:${level}`)) {
    return true;
  }
  if (admin.permissions && admin.permissions.includes(`${module}:manage`)) {
    return true;
  }

  // Look up role definition
  const roleDef = roleDefinitions.find((r) => r.code === admin.role);
  if (!roleDef) return false;

  const levels = roleDef.modulePermissions[module];
  if (!levels) return false;

  if (levels.includes(level) || levels.includes('manage')) {
    return true;
  }

  return false;
};

export const hasSensitivePermission = (
  admin: AdminUser | null,
  action: SensitivePermission,
  roleDefinitions: AdminRoleDefinition[] = DEFAULT_SYSTEM_ROLES
): boolean => {
  if (!admin) return false;
  if (admin.status === 'suspended' || admin.status === 'locked' || admin.status === 'inactive') {
    return false;
  }
  if (admin.role === 'super_admin') {
    return true;
  }
  if (admin.isReadOnly) {
    return false;
  }

  if (admin.customSensitivePermissions && admin.customSensitivePermissions.includes(action)) {
    return true;
  }

  const roleDef = roleDefinitions.find((r) => r.code === admin.role);
  if (!roleDef) return false;

  return roleDef.sensitivePermissions.includes(action);
};

export const canAccessCity = (admin: AdminUser | null, cityName?: string): boolean => {
  if (!admin) return false;
  if (!cityName || cityName.toLowerCase() === 'all') return true;
  if (admin.role === 'super_admin') return true;

  if (!admin.cityScope || admin.cityScope === 'all') {
    return true;
  }

  if (Array.isArray(admin.cityScope)) {
    return admin.cityScope.some((c) => c.toLowerCase() === cityName.toLowerCase());
  }

  if (admin.assignedCity) {
    if (admin.assignedCity.toLowerCase().includes('all')) return true;
    return admin.assignedCity.toLowerCase().includes(cityName.toLowerCase());
  }

  return true;
};

export const getRoleBadge = (role: AdminRole | string): { label: string; color: string; bg: string } => {
  switch (role) {
    case 'super_admin':
      return { label: 'Super Admin', color: 'text-rose-700 border-rose-300', bg: 'bg-rose-50' };
    case 'operations_admin':
    case 'ops_dispatcher':
    case 'dispatcher':
      return { label: 'Operations Admin', color: 'text-blue-700 border-blue-300', bg: 'bg-blue-50' };
    case 'finance_admin':
    case 'financial_auditor':
    case 'finance_officer':
      return { label: 'Finance Admin', color: 'text-emerald-700 border-emerald-300', bg: 'bg-emerald-50' };
    case 'support_admin':
    case 'support_agent':
      return { label: 'Support Admin', color: 'text-amber-800 border-amber-300', bg: 'bg-amber-50' };
    case 'safety_admin':
    case 'safety_officer':
      return { label: 'Safety Admin', color: 'text-red-700 border-red-300', bg: 'bg-red-50' };
    case 'verification_admin':
      return { label: 'Verification Admin', color: 'text-purple-700 border-purple-300', bg: 'bg-purple-50' };
    case 'reports_admin':
      return { label: 'Reports Admin', color: 'text-indigo-700 border-indigo-300', bg: 'bg-indigo-50' };
    case 'city_manager':
      return { label: 'City Manager', color: 'text-teal-700 border-teal-300', bg: 'bg-teal-50' };
    case 'read_only_admin':
      return { label: 'Read-Only Admin', color: 'text-slate-700 border-slate-300', bg: 'bg-slate-100' };
    default:
      return { label: String(role).replace('_', ' ').toUpperCase(), color: 'text-slate-700 border-slate-300', bg: 'bg-slate-50' };
  }
};

export const getStatusBadge = (status?: AdminAccountStatus | string): { label: string; color: string; bg: string; dot: string } => {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'text-emerald-700 border-emerald-300', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
    case 'inactive':
      return { label: 'Inactive', color: 'text-slate-600 border-slate-300', bg: 'bg-slate-100', dot: 'bg-slate-400' };
    case 'suspended':
      return { label: 'Suspended', color: 'text-rose-700 border-rose-300', bg: 'bg-rose-50', dot: 'bg-rose-500' };
    case 'locked':
      return { label: 'Locked', color: 'text-amber-800 border-amber-300', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    case 'pending_invitation':
      return { label: 'Pending Invite', color: 'text-indigo-700 border-indigo-300', bg: 'bg-indigo-50', dot: 'bg-indigo-500' };
    default:
      return { label: 'Active', color: 'text-emerald-700 border-emerald-300', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
  }
};

export const getSensitivePermissionLabel = (permission: SensitivePermission): string => {
  const match = ALL_SENSITIVE_PERMISSIONS.find((p) => p.id === permission);
  return match ? match.label : permission.replace('_', ' ').toUpperCase();
};

export const ADMIN_TAB_TO_MODULE: Record<AdminTab, PermissionModule> = {
  dashboard: 'dashboard',
  passengers: 'passengers',
  drivers: 'drivers',
  driver_earnings: 'payouts',
  verification: 'verification',
  academy: 'drivers',
  loans: 'payouts',
  live_rides: 'live_operations',
  rides: 'rides',
  freight: 'rides',
  fares: 'pricing',
  wallets: 'payouts',
  promos: 'promotions',
  safety: 'safety',
  safety_emergency: 'safety',
  complaints: 'complaints',
  support: 'support',
  notifications: 'notifications',
  cities: 'cities',
  reports: 'reports',
  settings: 'settings',
  audit: 'audit_logs',
  audit_logs: 'audit_logs',
  admins: 'admin_users',
  ai_assistant: 'dashboard',
  fraud_risk: 'fraud_risk'
};

export const canAccessTab = (
  admin: AdminUser | null,
  tab: AdminTab,
  roleDefinitions: AdminRoleDefinition[] = DEFAULT_SYSTEM_ROLES
): boolean => {
  if (!admin) return false;
  if (admin.status === 'suspended' || admin.status === 'locked' || admin.status === 'inactive') {
    return false;
  }
  if (admin.role === 'super_admin') {
    return true;
  }
  const module = ADMIN_TAB_TO_MODULE[tab] || 'dashboard';
  return hasPermission(admin, module, 'view', roleDefinitions);
};
