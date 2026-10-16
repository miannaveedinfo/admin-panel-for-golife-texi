import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminRole } from '../../types';
import {
  Mail,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  Trash2,
  MapPin,
  Shield,
  UserPlus,
  AlertCircle
} from 'lucide-react';

export const InvitationsTab: React.FC = () => {
  const {
    adminInvitations,
    adminRoles,
    createAdminInvitation,
    revokeAdminInvitation,
    resendAdminInvitation,
    showToast
  } = useAdmin();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'operations_admin' as AdminRole,
    department: 'Operations',
    cityScope: ['Lahore'] as string[],
    notes: ''
  });

  const availableCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan'];

  const handleCityToggle = (city: string) => {
    if (inviteForm.cityScope.includes(city)) {
      setInviteForm({
        ...inviteForm,
        cityScope: inviteForm.cityScope.filter((c) => c !== city)
      });
    } else {
      setInviteForm({
        ...inviteForm,
        cityScope: [...inviteForm.cityScope, city]
      });
    }
  };

  const handleSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      showToast('Please provide invitee full name and official email', 'error');
      return;
    }

    createAdminInvitation({
      email: inviteForm.email.trim().toLowerCase(),
      name: inviteForm.name.trim(),
      phone: inviteForm.phone.trim(),
      role: inviteForm.role,
      roleTitle: adminRoles.find((r) => r.code === inviteForm.role)?.name || 'Operations Dispatcher',
      department: inviteForm.department,
      cityScope: inviteForm.cityScope.length === 0 ? ['all'] : inviteForm.cityScope,
      notes: inviteForm.notes
    });

    setShowInviteModal(false);
    setInviteForm({
      name: '',
      email: '',
      phone: '',
      role: 'operations_admin',
      department: 'Operations',
      cityScope: ['Lahore'],
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending (Active Link)
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Call to Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900">
                Staff Onboarding & Secure Invitations
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Invite dispatchers, regional managers, and verification officers to join the GoLife Taxi console with pre-assigned RBAC roles and city scopes.
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Send New Invitation
            </button>
          </div>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Issued Invitations ({adminInvitations.length})
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                <th className="py-2.5 px-3">Invitee</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">City Scope</th>
                <th className="py-2.5 px-3">Invited By</th>
                <th className="py-2.5 px-3">Sent / Expires</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {adminInvitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Mail className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    <p className="font-bold text-slate-600">No active or historical invitations</p>
                  </td>
                </tr>
              ) : (
                adminInvitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    {/* Invitee info */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{inv.name}</div>
                      <div className="text-[10px] text-slate-400">{inv.email}</div>
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {inv.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* City scope */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-slate-700 text-xs">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {inv.cityScope.includes('all') ? 'All Pakistan' : inv.cityScope.join(', ')}
                        </span>
                      </div>
                    </td>

                    {/* Invited By */}
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] font-medium">
                      {inv.invitedByName}
                    </td>

                    {/* Timestamps */}
                    <td className="py-2.5 px-3">
                      <div className="text-[11px] text-slate-700">{inv.invitedAt}</div>
                      <div className="text-[10px] text-slate-400">Exp: {inv.expiresAt}</div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">{getStatusBadge(inv.status)}</td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {inv.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(
                                  `https://admin.golife.pk/join?token=${inv.token}`
                                );
                                showToast('Invitation link copied to clipboard', 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                              title="Copy invite URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => resendAdminInvitation(inv.id)}
                              className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition cursor-pointer"
                              title="Resend invitation link"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => revokeAdminInvitation(inv.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="Revoke invitation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Send Administrator Invitation</h3>
                  <p className="text-[11px] text-slate-500">
                    A secure 72-hour onboarding link will be sent to the official email.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitInvite} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Farooq"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@golife.pk"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value as AdminRole })
                    }
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Operations Control"
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City Jurisdiction</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setInviteForm({ ...inviteForm, cityScope: ['all'] })}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      inviteForm.cityScope.includes('all')
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    All Pakistan (National)
                  </button>

                  {availableCities.map((city) => {
                    const isSelected = inviteForm.cityScope.includes(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCityToggle(city)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected && !inviteForm.cityScope.includes('all')
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Issue Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
