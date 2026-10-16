import React, { useState } from 'react';
import {
  SensitiveApprovalRule,
  ApprovalRequirementType,
  AdminRole
} from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  Info,
  Edit2,
  Save,
  RotateCcw
} from 'lucide-react';

interface ApprovalRulesSectionProps {
  rules: SensitiveApprovalRule[];
  onUpdateRule: (ruleId: string, updates: Partial<SensitiveApprovalRule>, reason: string) => void;
  canManageApprovals: boolean;
}

export const ApprovalRulesSection: React.FC<ApprovalRulesSectionProps> = ({
  rules = [],
  onUpdateRule,
  canManageApprovals
}) => {
  const safeRules = rules || [];
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SensitiveApprovalRule>>({});
  const [changeReason, setChangeReason] = useState('');
  const [confirmModalRule, setConfirmModalRule] = useState<SensitiveApprovalRule | null>(null);

  const handleStartEdit = (rule: SensitiveApprovalRule) => {
    setEditingRuleId(rule.id);
    setEditFormData({
      approvalType: rule.approvalType,
      thresholdAmountPkr: rule.thresholdAmountPkr,
      autoApproveBelowThreshold: rule.autoApproveBelowThreshold,
      requiredRole: rule.requiredRole,
      enabled: rule.enabled
    });
  };

  const handleSaveEdit = (rule: SensitiveApprovalRule) => {
    setConfirmModalRule(rule);
  };

  const executeSave = () => {
    if (!confirmModalRule) return;
    onUpdateRule(confirmModalRule.id, editFormData, changeReason || 'Approval policy requirement updated');
    setConfirmModalRule(null);
    setEditingRuleId(null);
    setEditFormData({});
    setChangeReason('');
  };

  const getCategoryBadge = (category: SensitiveApprovalRule['category']) => {
    switch (category) {
      case 'financial':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">Financial</span>;
      case 'driver':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">Driver Compliance</span>;
      case 'pricing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">Tariff & Taxes</span>;
      case 'safety':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">Safety & 15</span>;
      case 'system':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">System Master</span>;
    }
  };

  const getWorkflowBadge = (type: ApprovalRequirementType) => {
    switch (type) {
      case 'two_level_maker_checker':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            2-Level Maker-Checker
          </span>
        );
      case 'super_admin_only':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200">
            <Lock className="w-2.5 h-2.5 text-rose-600" />
            Super Admin Strict
          </span>
        );
      case 'role_based':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            <UserCheck className="w-2.5 h-2.5 text-blue-600" />
            Role Authority
          </span>
        );
      case 'single_approval':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">
            Single Officer Approval
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">
              Approval & Sensitive Action Workflows
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Define maker-checker dual authorization, threshold amounts, and role gates for high-risk operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="p-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            {safeRules.filter((r) => r.approvalType === 'two_level_maker_checker').length} Maker-Checker Workflows
          </span>
          <span className="p-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {safeRules.filter((r) => r.approvalType === 'super_admin_only').length} Super Admin Only
          </span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Sensitive Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Approval Model</th>
                <th className="py-3 px-4">Role Required</th>
                <th className="py-3 px-4">Threshold Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => {
                const isEditing = editingRuleId === rule.id;

                return (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                    {/* Action Title & Code */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="font-bold text-slate-900">{rule.actionTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rule.actionCode}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{rule.description}</p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(rule.category)}
                    </td>

                    {/* Approval Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editFormData.approvalType}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              approvalType: e.target.value as ApprovalRequirementType
                            }))
                          }
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                        >
                          <option value="single_approval">Single Officer Approval</option>
                          <option value="two_level_maker_checker">2-Level Maker-Checker</option>
                          <option value="role_based">Role-Based Required</option>
                          <option value="super_admin_only">Super Admin Strict</option>
                        </select>
                      ) : (
                        getWorkflowBadge(rule.approvalType)
                      )}
                    </td>

                    {/* Role Required */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editFormData.requiredRole || ''}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              requiredRole: (e.target.value || undefined) as AdminRole
                            }))
                          }
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                        >
                          <option value="">Any Authorized</option>
                          <option value="super_admin">Super Admin</option>
                          <option value="operations_admin">Operations Lead</option>
                          <option value="finance_admin">Finance Officer</option>
                          <option value="safety_admin">Safety Officer</option>
                          <option value="support_admin">Support Lead</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          {rule.requiredRole ? rule.requiredRole.replace('_', ' ') : 'Role Permitted'}
                        </span>
                      )}
                    </td>

                    {/* Threshold Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {rule.thresholdAmountPkr !== undefined ? (
                        isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">Rs.</span>
                            <input
                              type="number"
                              step="500"
                              value={editFormData.thresholdAmountPkr || 0}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  thresholdAmountPkr: parseInt(e.target.value) || 0
                                }))
                              }
                              className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="font-extrabold text-slate-900">
                              Rs. {rule.thresholdAmountPkr.toLocaleString()}
                            </span>
                            {rule.autoApproveBelowThreshold && (
                              <div className="text-[10px] text-emerald-700 font-bold">Auto below threshold</div>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400 italic">Not applicable</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {rule.enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active Gate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Bypassed
                        </span>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingRuleId(null)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(rule)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-xs cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canManageApprovals}
                          onClick={() => handleStartEdit(rule)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1 ml-auto disabled:opacity-50"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Configure</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Update Approval Gate</h4>
                <p className="text-xs text-slate-500">{confirmModalRule.actionTitle}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Modifying sensitive approval rules affects operational safety, financial dual-authorization, and compliance audit standards.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Authority for Policy Change <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lowered passenger refund threshold for festival season"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalRule(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={!changeReason.trim()}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs disabled:opacity-50"
              >
                Confirm Gate Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
