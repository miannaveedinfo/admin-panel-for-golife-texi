import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser, AdminRole } from '../../types';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  MapPin,
  Clock,
  Phone,
  Mail,
  Eye,
  Edit2,
  Trash2,
  Smartphone,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Sliders,
  Sparkles
} from 'lucide-react';

interface AdminUsersTabProps {
  onOpenAddModal: () => void;
  onOpenPermissionsModal: (admin: AdminUser) => void;
  onOpenCityScopeModal: (admin: AdminUser) => void;
  onInspectAdmin: (admin: AdminUser) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  onOpenAddModal,
  onOpenPermissionsModal,
  onOpenCityScopeModal,
  onInspectAdmin
}) => {
  const {
    adminUsers,
    adminRoles,
    currentAdmin,
    adminSessions,
    lockAdminAccount,
    unlockAdminAccount,
    revokeAllAdminSessions,
    switchAdminRole,
    deleteAdminUser,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Compute metrics
  const totalCount = adminUsers.length;
  const activeCount = adminUsers.filter((u) => u.status === 'active').length;
  const twoFaCount = adminUsers.filter((u) => u.twoFactorEnabled).length;
  const lockedCount = adminUsers.filter((u) => u.status === 'locked' || u.status === 'suspended').length;
  const activeSessionsTotal = adminSessions.filter((s) => s.isActive).length;

  const filteredAdmins = adminUsers.filter((adm) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      adm.name.toLowerCase().includes(q) ||
      adm.email.toLowerCase().includes(q) ||
      (adm.department && adm.department.toLowerCase().includes(q)) ||
      (adm.phone && adm.phone.includes(q));

    const matchesRole = roleFilter === 'all' || adm.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || adm.status === statusFilter;
    const matchesCity =
      cityFilter === 'all' ||
      (adm.cityScope && adm.cityScope.includes(cityFilter)) ||
      adm.assignedCity?.toLowerCase().includes(cityFilter.toLowerCase());

    return matchesSearch && matchesRole && matchesStatus && matchesCity;
  });

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-black';
      case 'operations_admin':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
      case 'safety_admin':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'finance_admin':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'support_admin':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      case 'verification_admin':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
      case 'auditor':
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 font-bold';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'locked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Suspended
          </span>
        );
      case 'pending_invite':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" />
            Pending Invite
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Admins</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Staff & Dispatchers</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Now</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cleared accounts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Live Sessions</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Smartphone className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600">{activeSessionsTotal}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active tokens across PK</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">2FA Enforced</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">{twoFaCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {Math.round((twoFaCount / (totalCount || 1)) * 100)}% compliance
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Locked / Alert</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{lockedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Security interventions</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by admin name, email, department, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Add Administrator
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">All Roles</option>
            {adminRoles.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="suspended">Suspended</option>
            <option value="pending_invite">Pending Invite</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">All City Scopes</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Faisalabad">Faisalabad</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Multan">Multan</option>
          </select>

          {(roleFilter !== 'all' || statusFilter !== 'all' || cityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
                setCityFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-800 underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Admin Personnel Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black tracking-wider text-slate-500 uppercase">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-3">Role & Title</th>
                <th className="py-3 px-3">City Jurisdiction</th>
                <th className="py-3 px-3">Security & 2FA</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No administrators match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isCurrent = currentAdmin?.id === admin.id;
                  const adminSessionCount = adminSessions.filter(
                    (s) => s.adminId === admin.id && s.isActive
                  ).length;

                  return (
                    <tr
                      key={admin.id}
                      className={`hover:bg-amber-50/20 transition-colors ${
                        isCurrent ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            {adminSessionCount > 0 && (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
                                title="Active session running"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">
                                {admin.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-black text-[9px] border border-amber-300">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3" />
                                {admin.email}
                              </span>
                              {admin.phone && (
                                <span className="hidden sm:flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {admin.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${getRoleBadgeStyle(
                              admin.role
                            )}`}
                          >
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="text-[11px] text-slate-500 truncate font-medium">
                            {admin.roleTitle || admin.department || 'Operations'}
                          </div>
                        </div>
                      </td>

                      {/* City Scope */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {admin.assignedCity === 'all' ||
                            !admin.cityScope ||
                            admin.cityScope.length === 0 ||
                            admin.cityScope.includes('all') ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                All Pakistan (National)
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {admin.cityScope.slice(0, 2).map((city) => (
                                  <span
                                    key={city}
                                    className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200"
                                  >
                                    {city}
                                  </span>
                                ))}
                                {admin.cityScope.length > 2 && (
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    +{admin.cityScope.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Security & 2FA */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {admin.twoFactorEnabled ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                2FA Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                Pending 2FA
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {adminSessionCount} active {adminSessionCount === 1 ? 'session' : 'sessions'}
                          </div>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-3">
                        <div className="text-[11px] font-medium text-slate-700">
                          {admin.lastLogin || 'Just now'}
                        </div>
                        {admin.lastLoginIp && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {admin.lastLoginIp}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">{getStatusBadge(admin.status || 'active')}</td>

                      {/* Access Controls Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Switch Persona (Simulator) */}
                          <button
                            onClick={() => {
                              switchAdminRole(admin.role, admin.id);
                              showToast(`Switched active console view to ${admin.name} (${admin.role})`, 'info');
                            }}
                            title="Simulate / Switch to this persona"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100/60 rounded-lg transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Admin */}
                          <button
                            onClick={() => onInspectAdmin(admin)}
                            title="Inspect details & activity"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Permissions */}
                          <button
                            onClick={() => onOpenPermissionsModal(admin)}
                            title="Configure RBAC Permissions"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit City Scope */}
                          <button
                            onClick={() => onOpenCityScopeModal(admin)}
                            title="Assign City Scope"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock */}
                          {admin.status === 'locked' ? (
                            <button
                              onClick={() => unlockAdminAccount(admin.id)}
                              title="Unlock account"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => lockAdminAccount(admin.id, 'Administrative security lock')}
                              disabled={isCurrent}
                              title={isCurrent ? 'Cannot lock self' : 'Lock administrator account'}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Revoke Sessions */}
                          {adminSessionCount > 0 && (
                            <button
                              onClick={() => {
                                revokeAllAdminSessions(admin.id);
                                showToast(`Revoked all sessions for ${admin.name}`, 'warning');
                              }}
                              title="Force sign out all devices"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
