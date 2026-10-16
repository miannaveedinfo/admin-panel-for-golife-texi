/**
 * GoLife Taxi Pakistan - Data Privacy & PII Protection Utilities
 *
 * Implements role-based PII protection and masking conforming to Phase 22 security requirements:
 * "Do not expose private information to administrators without the required permission."
 */

import { AdminUser } from '../types';

/**
 * Determines whether the active admin has explicit permission to inspect full unmasked PII
 * (Super Admin, Safety Admin handling emergency SOS, or Customer Support Lead handling disputes).
 */
export const canAdminViewPII = (admin: AdminUser | null): boolean => {
  if (!admin) return false;
  if (admin.status === 'suspended' || admin.status === 'locked' || admin.status === 'inactive') {
    return false;
  }
  if (admin.isReadOnly) {
    return false;
  }
  if (admin.role === 'super_admin' || admin.role === 'safety_admin' || admin.role === 'support_admin') {
    return true;
  }
  if (admin.permissions && (admin.permissions.includes('all') || admin.permissions.includes('pii:view'))) {
    return true;
  }
  return false;
};

/**
 * Masks Pakistani contact phone number for non-privileged viewers
 * Example: "+92 300 8401923" -> "+92 300 •••• 923"
 */
export const maskPhoneNumber = (phone: string | undefined | null, isAuthorized: boolean): string => {
  if (!phone) return 'N/A';
  if (isAuthorized) return phone;

  const trimmed = phone.trim();
  if (trimmed.length < 8) return '••••••••';
  const prefix = trimmed.slice(0, 7);
  const suffix = trimmed.slice(-3);
  return `${prefix} •••• ${suffix}`;
};

/**
 * Masks Pakistani National Identity Card (NADRA CNIC) for non-privileged viewers
 * Example: "35201-8492019-3" -> "35201-•••••••-3"
 */
export const maskCNIC = (cnic: string | undefined | null, isAuthorized: boolean): string => {
  if (!cnic) return 'N/A';
  if (isAuthorized) return cnic;

  const parts = cnic.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-•••••••-${parts[2]}`;
  }
  if (cnic.length >= 10) {
    return `${cnic.slice(0, 5)}••••••${cnic.slice(-2)}`;
  }
  return '•••••••••••••';
};

/**
 * Masks Email address for non-privileged viewers
 * Example: "ahmed.raza@example.pk" -> "a••••a@example.pk"
 */
export const maskEmail = (email: string | undefined | null, isAuthorized: boolean): string => {
  if (!email) return 'N/A';
  if (isAuthorized) return email;

  const [user, domain] = email.split('@');
  if (!domain || user.length <= 2) {
    return `•••@${domain || 'email.pk'}`;
  }
  const first = user[0];
  const last = user[user.length - 1];
  return `${first}••••${last}@${domain}`;
};
