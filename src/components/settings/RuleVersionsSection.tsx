import React, { useState, useMemo } from 'react';
import { RuleVersionRecord } from '../../types';
import {
  History,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Shield,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';

interface RuleVersionsSectionProps {
  versions: RuleVersionRecord[];
  onRollback: (version: RuleVersionRecord, reason: string) => void;
  canRollback: boolean;
}

export const RuleVersionsSection: React.FC<RuleVersionsSectionProps> = ({
  versions = [],
  onRollback,
  canRollback
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVersionForRollback, setSelectedVersionForRollback] = useState<RuleVersionRecord | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');

  const filteredVersions = useMemo(() => {
    return (versions || []).filter((v) => {
      if (selectedCategory !== 'all' && v.ruleCategory !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const ruleTitleStr = (v.ruleTitle || '').toLowerCase();
        const changedByStr = (v.changedBy || '').toLowerCase();
        const reasonStr = (v.reason || '').toLowerCase();
        if (!ruleTitleStr.includes(query) && !changedByStr.includes(query) && !reasonStr.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [versions, selectedCategory, searchQuery]);

  const handleExecuteRollback = () => {
    if (!selectedVersionForRollback) return;
    onRollback(selectedVersionForRollback, rollbackReason || 'Admin executed policy rollback to previous revision');
    setSelectedVersionForRollback(null);
    setRollbackReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">
              Configuration Version History & Audit Trail
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all system parameter modifications, dual-approvals, and previous values.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
          >
            <option value="all">All Change Domains</option>
            <option value="business_rule">Business Rules</option>
            <option value="feature_control">Feature Controls</option>
            <option value="system_setting">System Controls</option>
            <option value="approval_rule">Approval Rules</option>
            <option value="override">City & Category Overrides</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by rule, admin or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 w-52"
            />
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredVersions.map((ver) => {
          return (
            <div
              key={ver.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">{ver.ruleTitle}</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {ver.ruleCategory}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ver.version}</span>
                  {ver.adminNote?.toLowerCase().includes('rollback') && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                      Rollback Revision
                    </span>
                  )}
                </div>

                {/* Diff View */}
                <div className="flex items-center gap-2 text-xs py-1">
                  <div className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-semibold line-through">
                    {String(ver.previousValue)}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold">
                    {String(ver.newValue)}
                  </div>
                </div>

                {/* Change Reason */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {ver.reason}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1 text-slate-600 font-semibold">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{ver.changedBy}</span>
                    <span className="text-slate-400 font-normal">({ver.changedByRole})</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ver.timestamp}</span>
                  </div>
                  {ver.approvalInfo?.approvedBy && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Authorized by {ver.approvalInfo.approvedBy}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rollback Action */}
              <div className="shrink-0">
                <button
                  type="button"
                  disabled={!canRollback}
                  onClick={() => setSelectedVersionForRollback(ver)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Revert platform parameter back to previous value"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert to Prev ({String(ver.previousValue)})</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredVersions.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">
            <History className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-xs">No version audit records match your query.</p>
          </div>
        )}
      </div>

      {/* Rollback Confirmation Modal */}
      {selectedVersionForRollback && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <span className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <RotateCcw className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Rollback Configuration Revision</h4>
                <p className="text-xs text-slate-500">{selectedVersionForRollback.ruleName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will immediately reinstate the prior value: <span className="font-black text-slate-900 px-1.5 py-0.5 rounded bg-slate-100">{String(selectedVersionForRollback.previousValue)}</span>, superseding current value <span className="font-bold text-rose-700">{String(selectedVersionForRollback.newValue)}</span>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Rollback <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Unforeseen impact on driver trip acceptance"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVersionForRollback(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRollback}
                disabled={!rollbackReason.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs disabled:opacity-50"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
