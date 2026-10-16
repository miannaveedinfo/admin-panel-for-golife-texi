import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminApprovalRule } from '../../types';
import {
  CheckSquare,
  ShieldAlert,
  Sliders,
  DollarSign,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Info
} from 'lucide-react';

export const DualAuthorizationTab: React.FC = () => {
  const {
    adminApprovalRules,
    updateApprovalRule,
    currentAdmin,
    showToast
  } = useAdmin();

  const [editingRule, setEditingRule] = useState<AdminApprovalRule | null>(null);
  const [thresholdInput, setThresholdInput] = useState<number>(0);

  // Sample pending items in dual-approval queue
  const [pendingQueue, setPendingQueue] = useState([
    {
      id: 'queue-1',
      actionType: 'Driver Payout Approval',
      initiatedBy: 'Fahad Finance (Finance Admin)',
      initiatedAt: '10 mins ago',
      amountPKR: 42500,
      targetEntity: 'Driver: Muhammad Bilal (DRI-4921) - Bank Alfalah',
      requiredApprover: 'Super Admin or Head of Finance',
      status: 'pending'
    },
    {
      id: 'queue-2',
      actionType: 'Driver Permanent Suspension',
      initiatedBy: 'Zainab Qazi (Safety Lead)',
      initiatedAt: '28 mins ago',
      amountPKR: null,
      targetEntity: 'Driver: Tariq Mahmood (DRI-1082) - Repeated Harassment Flag',
      requiredApprover: 'Super Admin or Operations Director',
      status: 'pending'
    }
  ]);

  const handleOpenEdit = (rule: AdminApprovalRule) => {
    setEditingRule(rule);
    setThresholdInput(rule.thresholdAmount || 0);
  };

  const handleSaveRule = () => {
    if (!editingRule) return;
    updateApprovalRule(editingRule.id, {
      thresholdAmount: thresholdInput
    });
    setEditingRule(null);
    showToast(`Updated threshold rule for ${editingRule.title}`, 'success');
  };

  const handleApproveQueueItem = (id: string) => {
    setPendingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
    showToast('Co-signed and finalized dual-authorization workflow', 'success');
  };

  const handleRejectQueueItem = (id: string) => {
    setPendingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
    showToast('Rejected action proposal in dual-authorization queue', 'warning');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-black text-slate-900">
              Dual-Authorization & Maker-Checker Policies
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl">
            To prevent fraud and unauthorized balance drainage, high-impact financial and disciplinary actions require two separate authenticated administrators before final execution.
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminApprovalRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-slate-900">{rule.title}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateApprovalRule(rule.id, { requiresTwoPersonApproval: !rule.requiresTwoPersonApproval })
                  }
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                    rule.requiresTwoPersonApproval
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {rule.requiresTwoPersonApproval ? 'ENFORCED' : 'OPTIONAL'}
                </button>
              </div>

              <p className="text-xs text-slate-500">{rule.description}</p>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                {typeof rule.thresholdAmount === 'number' && rule.thresholdAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trigger Threshold:</span>
                    <span className="font-bold text-slate-900">
                      &gt; PKR {rule.thresholdAmount.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trigger Threshold:</span>
                    <span className="font-bold text-slate-900">All Instances (100%)</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Secondary Approvers:</span>
                  <span className="font-bold text-slate-700">
                    {rule.authorizedRoles?.map((r) => r.replace('_', ' ').toUpperCase()).join(', ') || 'Super Admin'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Self-Authorization:</span>
                  <span className="font-bold text-rose-600">STRICTLY FORBIDDEN</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => handleOpenEdit(rule)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Configure Threshold
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Pending Co-Authorization Requests ({pendingQueue.filter((q) => q.status === 'pending').length})
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          {pendingQueue.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                item.status === 'approved'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : item.status === 'rejected'
                  ? 'bg-rose-50/40 border-rose-200 opacity-60'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{item.actionType}</span>
                  {item.amountPKR && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      PKR {item.amountPKR.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">({item.initiatedAt})</span>
                </div>

                <p className="text-xs text-slate-700 font-medium">{item.targetEntity}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Initiated: <strong>{item.initiatedBy}</strong></span>
                  <span>Required Sign-off: <strong>{item.requiredApprover}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApproveQueueItem(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sign Off (Co-Approve)
                    </button>
                    <button
                      onClick={() => handleRejectQueueItem(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Proposal
                    </button>
                  </>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold ${
                      item.status === 'approved' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {item.status === 'approved' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Signed Off & Executed
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" /> Declined by Dual Gatekeeper
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Threshold Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Configure Threshold: {editingRule.title}
            </h3>
            <p className="text-xs text-slate-500">{editingRule.description}</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trigger Threshold (PKR)
              </label>
              <input
                type="number"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Any transaction equal to or exceeding this PKR sum will halt for co-signature.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs cursor-pointer"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
