import React from 'react';
import { ReportAiInsight } from '../../types/reports';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Info,
  Building,
  Coins,
  Scale,
  Car
} from 'lucide-react';
import { AdminTab } from '../../types';

interface AiInsightsSectionProps {
  insights: ReportAiInsight[];
  onNavigateTab?: (tab: AdminTab) => void;
  onOpenDriverDetail?: (driverId: string) => void;
}

export const AiInsightsSection: React.FC<AiInsightsSectionProps> = ({
  insights,
  onNavigateTab,
  onOpenDriverDetail
}) => {
  const getCategoryIcon = (cat: ReportAiInsight['category']) => {
    switch (cat) {
      case 'revenue':
        return TrendingUp;
      case 'cancellation':
        return Car;
      case 'fines':
        return AlertTriangle;
      case 'payouts':
        return Coins;
      case 'city':
        return Building;
      case 'abnormality':
        return Scale;
      default:
        return Sparkles;
    }
  };

  const getImpactBadge = (impact: ReportAiInsight['impact']) => {
    switch (impact) {
      case 'positive':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Opportunity / Growth'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          label: 'Requires Attention'
        };
      case 'critical':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Action Advised'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Neutral Observation'
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header with Safety Mandate Guard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                Contextual AI Diagnostic &amp; Operational Insights
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-amber-300 border border-slate-800">
                Supervisor V4.2
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Heuristic machine learning telemetry monitoring 7 core platform dimensions
            </p>
          </div>
        </div>

        {/* AI Strict Guard Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 text-[11px] font-bold text-amber-950 flex items-center gap-1.5 shrink-0">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Strict Guard: AI is Advisory Only (No Autonomous Modifying Actions)</span>
        </div>
      </div>

      {/* Grid of 6-7 Contextual Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const badge = getImpactBadge(item.impact);

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-400/80 transition shadow-2xs flex flex-col justify-between space-y-3"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                      <Icon className="w-3.5 h-3.5 text-amber-600" />
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                      {item.category}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <h4 className="text-xs font-black text-slate-950 leading-snug">
                  {item.title}
                </h4>

                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  {item.observation}
                </p>
              </div>

              {/* Recommendation Box */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-2">
                <div>
                  <strong className="text-[10px] uppercase font-black text-amber-800 block">
                    AI Recommendation:
                  </strong>
                  <p className="text-slate-700 leading-relaxed mt-0.5">
                    {item.recommendation}
                  </p>
                </div>

                {/* Contextual Action Button (Human in the loop) */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-end">
                  {item.relatedEntityId && onOpenDriverDetail ? (
                    <button
                      onClick={() => onOpenDriverDetail(item.relatedEntityId!)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition flex items-center gap-1 cursor-pointer border border-amber-500/40"
                    >
                      <span>Review Driver ({item.relatedEntityName || 'Profile'})</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ) : item.targetTab && onNavigateTab ? (
                    <button
                      onClick={() => onNavigateTab(item.targetTab!)}
                      className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review in {item.targetTab.toUpperCase()}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
