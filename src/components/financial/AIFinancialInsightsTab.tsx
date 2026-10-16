import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Info,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AIFinancialInsight } from '../../types/commissionAndRevenue';
import { INITIAL_AI_INSIGHTS } from '../../services/commissionService';

interface AIFinancialInsightsTabProps {
  insights?: AIFinancialInsight[];
  onApplySuggestion?: (insight: AIFinancialInsight) => void;
}

export const AIFinancialInsightsTab: React.FC<AIFinancialInsightsTabProps> = ({
  insights = INITIAL_AI_INSIGHTS,
  onApplySuggestion
}) => {
  return (
    <div className="space-y-6">
      {/* Strict Non-Action Rule Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs border border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                STRICT POLICY COMPLIANCE
              </span>
              <span className="text-xs text-slate-400">Audit &amp; Intelligence Protocol</span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              AI Financial Intelligence &amp; Anomaly Detection
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              <strong className="text-amber-300">Absolute Safeguard:</strong> The AI system operates exclusively as a read-only analytical advisor. AI can <strong className="text-white">NEVER</strong> automatically approve, refund, deduct, or transfer money. Every financial transaction, tariff change, and reconciliation requires explicit human administrator authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  ins.severity === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : ins.severity === 'medium'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {ins.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400">{ins.timestamp}</span>
              </div>

              <h4 className="text-sm font-black text-slate-900 mb-1.5">{ins.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{ins.summary}</p>

              {ins.impactPKR && (
                <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-xs text-amber-950 font-bold mb-3 flex items-center justify-between">
                  <span>Estimated Monthly Revenue Impact:</span>
                  <span className="text-sm font-black text-emerald-700">+Rs {ins.impactPKR.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 mb-2">
                <strong className="text-slate-800">Recommendation:</strong> {ins.recommendedAction}
              </div>
              <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Requires Admin Review &amp; Approval in Tariff Rules</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFinancialInsightsTab;
