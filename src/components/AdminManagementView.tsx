import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminRole, AdminUser } from '../types';
import { AdminUsersTab } from './admin-access/AdminUsersTab';
import { RolesMatrixTab } from './admin-access/RolesMatrixTab';
import { SessionsSecurityTab } from './admin-access/SessionsSecurityTab';
import { InvitationsTab } from './admin-access/InvitationsTab';
import { DualAuthorizationTab } from './admin-access/DualAuthorizationTab';
import { AdminCityScopeModal } from './admin-access/AdminCityScopeModal';
import { AdminPermissionsModal } from './admin-access/AdminPermissionsModal';
import { RoleEditorModal } from './admin-access/RoleEditorModal';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { isProductionDataSource } from '../config/dataSourceMode';
import {
  Shield,
  ShieldCheck,
  Users,
  KeyRound,
  Smartphone,
  Mail,
  CheckSquare,
  Sparkles,
  CheckCircle2,
  X,
  UserPlus,
  MapPin,
  Lock,
  Phone,
  Clock,
  Eye
} from 'lucide-react';

export const AdminManagementView: React.FC = () => {
  const {
    adminUsers,
    adminRoles,
    adminSessions,
    adminInvitations,
    adminApprovalRules,
    adminSecurityAlerts,
    currentAdmin,
    addAdminUser,
    updateAdminUser,
    switchAdminRole,
    setActiveTab,
    showToast
  } = useAdmin();

  // Navigation Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<
    'users' | 'matrix' | 'sessions' | 'invitations' | 'dual_auth'
  >('users');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [inspectAdmin, setInspectAdmin] = useState<AdminUser | null>(null);
  const [cityScopeAdmin, setCityScopeAdmin] = useState<AdminUser | null>(null);
  const [permissionsAdmin, setPermissionsAdmin] = useState<AdminUser | null>(null);

  // Add Admin form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'operations_admin' as AdminRole,
    roleTitle: 'Operations Dispatcher',
    department: 'Operations',
    phone: '+92 300 1234567',
    assignedCity: 'All Pakistan'
  });

  // Persona simulator list
  const personas: {
    role: AdminRole;
    label: string;
    description: string;
    city?: string;
  }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin',
      description: 'National scope, unrestricted financial and system permissions'
    },
    {
      role: 'operations_admin',
      label: 'Operations Dispatcher',
      description: 'Fleet management, live rides, drivers, passenger dispatch'
    },
    {
      role: 'safety_admin',
      label: 'Safety Commander',
      description: 'SOS triage, incident escalation, police coordination'
    },
    {
      role: 'finance_admin',
      label: 'Finance & Payouts Lead',
      description: 'Banking settlements, tariffs, refund approvals, driver ledger'
    },
    {
      role: 'support_admin',
      label: 'Support Specialist',
      description: 'Customer complaints, dispute tickets, passenger adjustments'
    },
    {
      role: 'verification_admin',
      label: 'KYC & CNIC Officer',
      description: 'NADRA identity, license verification, police clearance'
    },
    {
      role: 'auditor',
      label: 'Read-Only Auditor',
      description: 'View-only telemetry, financial logs, zero write access'
    }
  ];

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please provide admin full name and official email', 'error');
      return;
    }

    addAdminUser({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      roleTitle: formData.roleTitle,
      department: formData.department,
      phone: formData.phone,
      assignedCity: formData.assignedCity,
      status: 'active'
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      email: '',
      role: 'operations_admin',
      roleTitle: 'Operations Dispatcher',
      department: 'Operations',
      phone: '+92 300 1234567',
      assignedCity: 'All Pakistan'
    });
    showToast(`Created administrator account for ${formData.name}`, 'success');
  };

  const handleUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    updateAdminUser(editingAdmin.id, {
      name: editingAdmin.name,
      email: editingAdmin.email,
      role: editingAdmin.role,
      roleTitle: editingAdmin.roleTitle,
      department: editingAdmin.department,
      phone: editingAdmin.phone,
      assignedCity: editingAdmin.assignedCity
    });
    setEditingAdmin(null);
    showToast(`Updated administrator ${editingAdmin.name}`, 'success');
  };

  const activeSessionsCount = adminSessions.filter((s) => s.isActive).length;
  const openAlertsCount = adminSecurityAlerts.filter((a) => a.status === 'open').length;
  const pendingInvitesCount = adminInvitations.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Interactive Persona Simulator Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <BackToDashboardButton variant="dark" />
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black shadow-xs">
                  <Shield className="w-5 h-5" />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Phase 52 Access Control Center
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Admin Users, Roles & RBAC Governance
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Centralized identity governance, granular permission matrices across 24 platform modules, city jurisdiction scopes, and dual-authorization maker-checker rules.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              New Admin Account
            </button>
          </div>
        </div>

        {/* Real-time Persona Simulator Bar / Production Mode Security Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 relative z-10 space-y-2">
          {isProductionDataSource() ? (
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Production Role Governance:</span>
                <span className="text-slate-400">
                  Role simulation is disabled in Production Mode. Privileges are strictly governed by Firebase Auth & database RBAC.
                </span>
              </div>
              <span className="text-xs font-black text-amber-400 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20">
                {currentAdmin?.roleTitle || 'Super Administrator'}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">Interactive Role Simulator:</span>
                  <span className="text-slate-400 hidden sm:inline">
                    Click any role to test live UI permission restrictions and gatekeeper behavior:
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-400/90">
                  Active: {currentAdmin?.roleTitle || 'Super Administrator'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {personas.map((p) => {
                  const isCurrent = currentAdmin?.role === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => {
                        switchAdminRole(p.role);
                        showToast(`Simulating session as ${p.label} (${p.role})`, 'info');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs'
                          : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={p.description}
                    >
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admin Personnel</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'users'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {adminUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Roles & Permissions Matrix</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'matrix'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {adminRoles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sessions')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'sessions'
                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Sessions & Security Posture</span>
            <div className="flex items-center gap-1">
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeSubTab === 'sessions'
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {activeSessionsCount}
              </span>
              {openAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('invitations')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'invitations'
                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Invitations & Onboarding</span>
            {pendingInvitesCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeSubTab === 'invitations'
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {pendingInvitesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dual_auth')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'dual_auth'
                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Dual-Authorization & Rules</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'dual_auth'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {adminApprovalRules.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="transition-all duration-200">
        {activeSubTab === 'users' && (
          <AdminUsersTab
            onOpenAddModal={() => setShowAddModal(true)}
            onOpenPermissionsModal={(admin) => setPermissionsAdmin(admin)}
            onOpenCityScopeModal={(admin) => setCityScopeAdmin(admin)}
            onInspectAdmin={(admin) => setInspectAdmin(admin)}
          />
        )}

        {activeSubTab === 'matrix' && (
          <RolesMatrixTab onOpenCreateRoleModal={() => setShowCreateRoleModal(true)} />
        )}

        {activeSubTab === 'sessions' && <SessionsSecurityTab />}

        {activeSubTab === 'invitations' && <InvitationsTab />}

        {activeSubTab === 'dual_auth' && <DualAuthorizationTab />}
      </div>

      {/* ========================================================
          MODALS
         ======================================================== */}

      {/* City Scope Modal */}
      {cityScopeAdmin && (
        <AdminCityScopeModal
          admin={cityScopeAdmin}
          onClose={() => setCityScopeAdmin(null)}
        />
      )}

      {/* Custom Permissions Modal */}
      {permissionsAdmin && (
        <AdminPermissionsModal
          admin={permissionsAdmin}
          onClose={() => setPermissionsAdmin(null)}
        />
      )}

      {/* Create Custom Role Modal */}
      <RoleEditorModal
        isOpen={showCreateRoleModal}
        onClose={() => setShowCreateRoleModal(false)}
      />

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Create Administrator Account</h3>
                  <p className="text-[11px] text-slate-500">
                    Add new operational staff member directly with active credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Jameel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="tariq@golife.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const selected = e.target.value as AdminRole;
                      const roleMatch = adminRoles.find((r) => r.code === selected);
                      setFormData({
                        ...formData,
                        role: selected,
                        roleTitle: roleMatch?.name || 'Administrator'
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    {adminRoles.map((r) => (
                      <option key={r.id} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation Title</label>
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City Jurisdiction</label>
                <select
                  value={formData.assignedCity}
                  onChange={(e) => setFormData({ ...formData, assignedCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="All Pakistan">All Pakistan (National Scope)</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Admin Details Modal */}
      {inspectAdmin && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                  {inspectAdmin.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{inspectAdmin.name}</h3>
                  <p className="text-[11px] text-slate-500">{inspectAdmin.email}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectAdmin(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Admin User ID:</span>
                <span className="font-mono text-slate-800 font-bold">{inspectAdmin.id}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Role & Title:</span>
                <span className="font-bold text-slate-900">
                  {inspectAdmin.role.replace('_', ' ').toUpperCase()} ({inspectAdmin.roleTitle})
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Department:</span>
                <span className="font-bold text-slate-800">{inspectAdmin.department || 'Operations'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Territorial Jurisdiction:</span>
                <span className="font-bold text-slate-800">
                  {inspectAdmin.cityScope?.includes('all') || inspectAdmin.assignedCity === 'all'
                    ? 'All Pakistan (National)'
                    : inspectAdmin.cityScope?.join(', ') || inspectAdmin.assignedCity}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">2-Factor Authentication:</span>
                <span
                  className={`font-bold ${
                    inspectAdmin.twoFactorEnabled ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {inspectAdmin.twoFactorEnabled ? 'Active & Enforced' : 'Pending Enrollment'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Last Active Session:</span>
                <span className="font-bold text-slate-800">
                  {inspectAdmin.lastLogin || 'Recent'} ({inspectAdmin.lastLoginIp || '192.168.1.1'})
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Account Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                    inspectAdmin.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {inspectAdmin.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setInspectAdmin(null);
                  setActiveTab('audit_logs');
                }}
                className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
              >
                View Audit Trail
              </button>
              <button
                onClick={() => setInspectAdmin(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
