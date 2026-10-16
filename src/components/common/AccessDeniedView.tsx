import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminTab, PermissionModule } from '../../types';
import {
  ADMIN_TAB_TO_MODULE,
  getRoleBadge
} from '../../services/adminAccessService';
import {
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Send,
  CheckCircle2,
  Lock,
  User,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AccessDeniedViewProps {
  attemptedTab?: AdminTab;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedTab }) => {
  const { currentAdmin, activeTab, setActiveTab, showToast, addAuditRecord } = useAdmin();
  const [requestSent, setRequestSent] = useState(false);
  const [justification, setJustification] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const tab = attemptedTab || activeTab;
  const targetModule: PermissionModule = ADMIN_TAB_TO_MODULE[tab] || 'dashboard';
  const roleBadge = getRoleBadge(currentAdmin?.role || 'read_only_admin');

  const getRequiredPrivilege = (m: PermissionModule): string => {
    switch (m) {
      case 'admin_users':
        return 'Super Admin Exclusive';
      case 'settings':
        return 'Super Admin (System Architecture)';
      case 'pricing':
        return 'Finance Admin or Super Admin (Tariff Control)';
      case 'payouts':
        return 'Finance Admin or Super Admin (Treasury & Payouts)';
      case 'verification':
        return 'Verification Admin or Operations Admin';
      case 'fraud_risk':
        return 'Safety Admin, Finance Admin or Super Admin';
      default:
        return 'Authorized Administrator Role';
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      showToast('Please provide an operational reason for the permission escalation.', 'warning');
      return;
    }

    addAuditRecord(
      'PERMISSION_ELEVATION_REQUESTED',
      'system',
      currentAdmin?.id || 'unknown',
      `Admin ${currentAdmin?.name} (${currentAdmin?.email}, Role: ${currentAdmin?.role}) requested access to module [${targetModule}]. Justification: ${justification}`
    );

    setRequestSent(true);
    showToast('Permission escalation request submitted to Super Admin ledger.', 'success');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header with warning icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-4 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 mb-2">
            HTTP 403 • Authorization Gatekeeper
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrative Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Your current assigned credentials do not hold permission to access the{' '}
            <span className="font-bold text-slate-900 uppercase">[{targetModule.replace('_', ' ')}]</span> control center.
          </p>
        </div>

        {/* Current Identity & Privilege Diagnostics Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Active Session Profile</span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {currentAdmin?.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-500 text-[11px]">Logged in as: </span>
                <span className="font-bold text-slate-900">{currentAdmin?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 text-[11px]">Active Role: </span>
                <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${roleBadge.bg} ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-500 text-[11px]">Department: </span>
                <span className="font-medium text-slate-700">{currentAdmin?.department || 'Operations'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 text-[11px]">Required Level: </span>
                <span className="font-bold text-rose-700">{getRequiredPrivilege(targetModule)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Request Box */}
        {requestSent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-6 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <div className="font-bold">Privilege Escalation Dispatched</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Your request has been logged in the audit ledger and transmitted to the Super Admin team for review.
              </div>
            </div>
          </div>
        ) : showRequestForm ? (
          <form onSubmit={handleSendRequest} className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-3">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Request Temporary Role Escalation
            </div>
            <div>
              <label className="block text-[11px] font-medium text-amber-900 mb-1">
                Operational Business Justification
              </label>
              <textarea
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="State ride ID, driver case, or regulatory reason why you require access to this module..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Request
              </button>
            </div>
          </form>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>

          {!requestSent && !showRequestForm && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              Request Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
