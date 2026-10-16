import React, { useState } from 'react';
import {
  ConfigurationConflict,
  AiSettingRecommendation
} from '../../types';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  Wrench,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface ConflictsAndAiSectionProps {
  conflicts: ConfigurationConflict[];
  recommendations: AiSettingRecommendation[];
  onApplyRecommendation: (rec: AiSettingRecommendation, reason: string) => void;
  onDismissRecommendation: (recId: string) => void;
  onJumpToTab: (tab: any, subFilter?: string) => void;
  canApplyChanges: boolean;
}

export const ConflictsAndAiSection: React.FC<ConflictsAndAiSectionProps> = ({
  conflicts = [],
  recommendations = [],
  onApplyRecommendation,
  onDismissRecommendation,
  onJumpToTab,
  canApplyChanges
}) => {
  const [selectedRecForReview, setSelectedRecForReview] = useState<AiSettingRecommendation | null>(null);
  const [reviewReason, setReviewReason] = useState('');

  const activeRecs = (recommendations || []).filter((r) => r.status === 'pending');

  const getSeverityBadge = (severity: ConfigurationConflict['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Critical Conflict
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            High Severity
          </span>
        );
      case 'warning':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
            Warning
          </span>
        );
    }
  };

  const handleExecuteApply = () => {
    if (!selectedRecForReview) return;
    onApplyRecommendation(selectedRecForReview, reviewReason || `Applied AI advisory: ${selectedRecForReview.suggestedChange}`);
    setSelectedRecForReview(null);
    setReviewReason('');
  };

  return (
    <div className="space-y-6">
      {/* ============================================================
          1. RULE CONFLICT DETECTOR
         ============================================================ */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl border ${
              conflicts.length > 0
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              {conflicts.length > 0 ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Automated Configuration Conflict Engine
              </h3>
              <p className="text-xs text-slate-500">
                Continuous background validation across overrides, business rules, and feature dependencies.
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
            conflicts.length > 0
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {conflicts.length === 0
              ? 'Zero Contradictions'
              : `${conflicts.length} Contradiction${conflicts.length > 1 ? 's' : ''} Detected`}
          </span>
        </div>

        {/* Conflicts List */}
        {conflicts.length > 0 ? (
          <div className="space-y-3">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(c.severity)}
                    <h4 className="font-extrabold text-xs text-rose-950">{c.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Affects: {c.affectedRules.join(' ↔ ')}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {c.description}
                </p>

                {/* Suggested Resolution Box */}
                <div className="p-3 rounded-lg bg-white border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900">Suggested Resolution: </span>
                      <span className="text-slate-600">{c.suggestedResolution}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToTab('business_rules')}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-2xs flex items-center gap-1"
                  >
                    <span>Resolve in Rules</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-600 space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
            <p className="font-bold text-xs text-slate-900">All System Rules & Feature Toggles Are Harmonious</p>
            <p className="text-[11px] text-slate-500">
              No circular overrides, missing prerequisites, or timing contradictions detected.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
          2. AI CONFIGURATION RECOMMENDATIONS
         ============================================================ */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-900 border border-purple-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                AI Platform Optimization Advisory
              </h3>
              <p className="text-xs text-slate-500">
                Telemetry insights and operational recommendations. Super Admin explicit confirmation required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-900 border border-purple-200">
              Human-in-the-Loop Safe
            </span>
          </div>
        </div>

        {/* Warning Policy Note */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Mandate:</strong> The AI engine will never unilaterally change pricing, commissions, ratings, or feature states. All suggestions require Super Admin review and authorization.
          </span>
        </div>

        {/* Recommendations Cards */}
        {activeRecs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecs.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-950">{rec.suggestedChange}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {rec.cityName ? `${rec.cityName} City` : 'Global Fleet'}
                        {rec.serviceCategory ? ` • ${rec.serviceCategory}` : ''}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-950 border border-purple-200 shrink-0">
                      {Math.round(rec.confidenceScore * 100)}% Confidence
                    </span>
                  </div>

                  {/* Impact Reason */}
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {rec.impactRationale}
                  </p>

                  {/* Diff Value */}
                  <div className="flex items-center gap-2 text-xs py-1">
                    <span className="text-[11px] text-slate-400 font-bold">Adjustment:</span>
                    <div className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold line-through text-[11px]">
                      {String(rec.currentValue)}
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-black text-[11px]">
                      {String(rec.suggestedValue)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onDismissRecommendation(rec.id)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    disabled={!canApplyChanges}
                    onClick={() => setSelectedRecForReview(rec)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Review & Authorize</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-600 space-y-1">
            <Sparkles className="w-6 h-6 mx-auto text-purple-600 mb-1" />
            <p className="font-bold text-xs text-slate-900">No Pending AI Optimizations</p>
            <p className="text-[11px] text-slate-500">
              The telemetry engine is continuously monitoring fleet matching efficiency, wait times, and completion rates.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal for AI Recommendation */}
      {selectedRecForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <span className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Review & Apply AI Recommendation</h4>
                <p className="text-xs text-slate-500">{selectedRecForReview.suggestedChange}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">Machine Learning Rationale:</div>
              <p className="text-slate-600 leading-relaxed">
                {selectedRecForReview.impactRationale}
              </p>
              <div className="flex items-center gap-2 pt-1 font-bold">
                <span>Value Transformation:</span>
                <span className="text-rose-700">{String(selectedRecForReview.currentValue)}</span>
                <span>➔</span>
                <span className="text-emerald-700">{String(selectedRecForReview.suggestedValue)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Approval Note / Justification <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Approved AI advisory to decrease GoMoto search radius for Lahore"
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecForReview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteApply}
                disabled={!reviewReason.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs disabled:opacity-50"
              >
                Authorize & Commit Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
