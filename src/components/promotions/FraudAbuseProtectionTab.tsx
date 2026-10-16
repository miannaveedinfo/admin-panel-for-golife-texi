import React, { useState } from 'react';
import { FraudDetectionAlert } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Ban,
  RotateCcw,
  Eye,
  Smartphone,
  CreditCard,
  MapPin,
  Clock,
  ShieldCheck,
  UserX
} from 'lucide-react';

export const FraudAbuseProtectionTab: React.FC = () => {
  const { fraudAlerts, reviewFraudAlert, clawbackReward } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState<FraudDetectionAlert | null>(null);
  const [adminResolutionNotes, setAdminResolutionNotes] = useState('');

  const pendingCount = (fraudAlerts || []).filter((a) => a.status === 'pending_review' || (a.status as string) === 'pending').length;
  const criticalCount = (fraudAlerts || []).filter((a) => a.severity === 'critical' || a.severity === 'high').length;
  const resolvedCount = (fraudAlerts || []).filter((a) => a.status === 'resolved_dismissed' || a.status === 'resolved_penalized' || (a.status as string) === 'resolved' || (a.status as string) === 'cleared').length;

  const filteredAlerts = (fraudAlerts || []).filter((a) => {
    const q = (searchTerm || '').toLowerCase();
    const entityId = (a.entityId || (a as any).userId || (a as any).entity || a.id || '').toLowerCase();
    const reason = (a.reason || (a as any).description || (a as any).type || '').toLowerCase();
    const userName = ((a as any).userName || '').toLowerCase();
    const signals = Array.isArray(a.riskSignals)
      ? a.riskSignals
      : (a as any).details
      ? [(a as any).details]
      : [];
    const signalsMatch = signals.some((s: string) => s.toLowerCase().includes(q));

    const matchesSearch = !q || entityId.includes(q) || reason.includes(q) || userName.includes(q) || signalsMatch;

    const matchesSeverity = filterSeverity === 'All' || a.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleResolve = (action: 'dismiss' | 'penalize' | 'block') => {
    if (!selectedAlert) return;

    if (action === 'dismiss') {
      reviewFraudAlert(
        selectedAlert.id,
        'dismiss',
        adminResolutionNotes || 'Verified legitimate user activity upon manual review.'
      );
    } else if (action === 'penalize') {
      reviewFraudAlert(
        selectedAlert.id,
        'penalize',
        adminResolutionNotes || 'Confirmed policy violation. Rewards revoked and flagged in risk registry.'
      );
      if (selectedAlert.rewardIdToRevoke) {
        clawbackReward(selectedAlert.rewardIdToRevoke, 'Fraud protection enforcement');
      }
    } else if (action === 'block') {
      reviewFraudAlert(
        selectedAlert.id,
        'block_user',
        adminResolutionNotes || 'Permanent promo abuse ban applied to device and phone identity.'
      );
      if (selectedAlert.rewardIdToRevoke) {
        clawbackReward(selectedAlert.rewardIdToRevoke, 'Fraudulent account blacklisted');
      }
    }

    setSelectedAlert(null);
    setAdminResolutionNotes('');
  };

  return (
    <div id="section-fraud-abuse-protection" className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Fraud Detection, Anti-Syndicate & Abuse Safeguards (Section 16 & 17)
          </h2>
          <p className="text-xs text-[#6B7280]">
            Autonomous heuristics detecting device clones, GPS collusion, fake ride rings, and duplicate referral loops
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {pendingCount} Flagged Incidents Requiring Action
          </span>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Pending Security Reviews
          </div>
          <div className="text-xl font-extrabold text-rose-700 font-mono mt-1">
            {pendingCount} Alerts
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">High-priority inspection needed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Critical Risk Syndicates
          </div>
          <div className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            {criticalCount} Critical
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Device finger-print matches</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Clawbacks & Blocked Abuse
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {resolvedCount} Resolved
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Prevented PKR 48,000+ budget leakage</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="input-search-fraud"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, device, reason..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            id="select-fraud-severity"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            id="select-fraud-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="resolved_penalized">Penalized / Clawed Back</option>
            <option value="resolved_dismissed">Dismissed (Legitimate)</option>
          </select>
        </div>

        <span className="text-xs text-[#6B7280]">
          Showing {filteredAlerts.length} security alerts
        </span>
      </div>

      {/* Fraud Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => {
          const isPending = alert.status === 'pending_review';

          return (
            <div
              key={alert.id}
              id={`fraud-card-${alert.id}`}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition ${
                isPending ? 'border-rose-200' : 'border-[#E5E7EB]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : alert.severity === 'high'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {alert.severity} severity
                    </span>
                    <span className="text-xs font-mono font-bold text-[#4B5563]">
                      Risk Score: {(alert as any).riskScore ?? (alert.severity === 'critical' ? 95 : alert.severity === 'high' ? 82 : 60)}/100
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPending
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : alert.status === 'resolved_penalized'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {(alert.status || 'pending').replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    {alert.reason || (alert as any).description || (alert as any).type || 'Security Alert'}
                  </h4>
                  <div className="text-xs text-[#6B7280] mt-1">
                    Target: <strong>{((alert as any).entityType || (alert as any).userType || 'User').toUpperCase()}</strong> ID: {alert.entityId || (alert as any).userId || alert.id}
                  </div>
                </div>

                {/* Risk Signals */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-semibold text-[#374151]">Detected Heuristic Signals:</div>
                  <ul className="space-y-1 text-[#4B5563]">
                    {(Array.isArray(alert.riskSignals) ? alert.riskSignals : [(alert as any).details || (alert as any).description || 'Suspicious behavioral anomaly']).map((sig, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>

                  {alert.financialExposurePKR && (
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] font-bold">
                      <span className="text-[#6B7280]">Financial Exposure:</span>
                      <span className="text-rose-700 font-mono">
                        {formatPKR(alert.financialExposurePKR)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#9CA3AF] flex items-center justify-between">
                  <span>Detected: {alert.detectedAt}</span>
                  {alert.actionTaken && <span>Action: {alert.actionTaken}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {isPending ? (
                  <>
                    <button
                      id={`btn-review-fraud-${alert.id}`}
                      onClick={() => setSelectedAlert(alert)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Investigate & Resolve
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-[#6B7280] italic">
                    Resolved by {alert.reviewedBy || 'Admin'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Investigation / Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-[#111827]">
                  Fraud Investigation & Resolution
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <div className="font-bold text-rose-900">{selectedAlert.reason}</div>
                <div className="text-rose-800">
                  Target Entity: {selectedAlert.entityType} ({selectedAlert.entityId})
                </div>
                <div className="text-rose-700 font-mono">
                  Risk Assessment Score: {selectedAlert.riskScore}/100
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Investigation Findings & Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminResolutionNotes}
                  onChange={(e) => setAdminResolutionNotes(e.target.value)}
                  placeholder="Record justification for resolution (stored permanently in Audit Logs)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827]"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-[#374151] uppercase tracking-wider">
                  Select Action to Enforce:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleResolve('dismiss')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#374151] font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px]">Dismiss (Legitimate)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolve('penalize')}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px]">Clawback & Revoke</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolve('block')}
                    className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center"
                  >
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span className="text-[11px]">Block & Blacklist</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs cursor-pointer"
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
