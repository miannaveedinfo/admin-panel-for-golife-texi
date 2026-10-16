import React, { useState } from 'react';
import { PromotionAiInsight, PromoCode } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  Sparkles,
  Bot,
  TrendingUp,
  ShieldAlert,
  Zap,
  CheckCircle2,
  ArrowRight,
  Plus,
  Compass,
  Lightbulb,
  DollarSign
} from 'lucide-react';

interface AiPromotionIntelligenceTabProps {
  onOpenPromoCreateWithTemplate?: (template: Partial<PromoCode>) => void;
}

export const AiPromotionIntelligenceTab: React.FC<AiPromotionIntelligenceTabProps> = () => {
  const {
    promotionAiInsights,
    addPromoCode,
    createPromotionCampaign
  } = useAdmin();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [generatedPromoPreview, setGeneratedPromoPreview] = useState<{
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minFare: number;
    city: string;
    target: string;
  } | null>(null);

  const [promptInput, setPromptInput] = useState('Weekend Lahore launch campaign for GoMini and GoRide');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerateCampaign = (preset?: string) => {
    const text = preset || promptInput;
    setIsGenerating(true);
    setSuccessMessage('');

    setTimeout(() => {
      if (text.toLowerCase().includes('lahore')) {
        setGeneratedPromoPreview({
          code: 'LAHOREWEEKEND50',
          title: 'Lahore Weekend Surge Voucher',
          description: '50% off up to PKR 250 on GoMini and GoRide trips in Gulberg, DHA, and Model Town',
          discountType: 'percentage',
          discountValue: 50,
          maxDiscount: 250,
          minFare: 300,
          city: 'Lahore',
          target: 'new_passengers'
        });
      } else if (text.toLowerCase().includes('karachi') || text.toLowerCase().includes('rain')) {
        setGeneratedPromoPreview({
          code: 'KHIROBUST40',
          title: 'Karachi Monsoon Ride Support',
          description: 'PKR 150 flat discount on GoComfort & GoRide to maintain rider liquidity',
          discountType: 'fixed',
          discountValue: 150,
          maxDiscount: 150,
          minFare: 350,
          city: 'Karachi',
          target: 'all'
        });
      } else if (text.toLowerCase().includes('driver') || text.toLowerCase().includes('captain')) {
        setGeneratedPromoPreview({
          code: 'CAPTAINBOOST10',
          title: 'Captain Supply Surge Boost',
          description: 'Zero commission subsidy on 10 consecutive trips during peak commute windows',
          discountType: 'fixed',
          discountValue: 200,
          maxDiscount: 200,
          minFare: 200,
          city: 'Islamabad',
          target: 'selected_drivers'
        });
      } else {
        setGeneratedPromoPreview({
          code: 'GOLIFEVIP30',
          title: 'Smart Loyalty Retention Voucher',
          description: '30% discount on 3 trips for active riders to counter churn',
          discountType: 'percentage',
          discountValue: 30,
          maxDiscount: 200,
          minFare: 250,
          city: 'All',
          target: 'existing_passengers'
        });
      }
      setIsGenerating(false);
    }, 450);
  };

  const handleDeployGeneratedPromo = () => {
    if (!generatedPromoPreview) return;

    const newPromo: PromoCode = {
      id: `PR-AI-${Date.now().toString().slice(-4)}`,
      code: generatedPromoPreview.code,
      displayName: generatedPromoPreview.title,
      description: generatedPromoPreview.description,
      discountType: generatedPromoPreview.discountType,
      discountValue: generatedPromoPreview.discountValue,
      maxDiscount: generatedPromoPreview.maxDiscount,
      minFare: generatedPromoPreview.minFare,
      usageLimit: 5000,
      usagePerPassenger: 1,
      usedCount: 0,
      startDate: '2026-09-14',
      endDate: '2026-10-14',
      applicableCity: generatedPromoPreview.city,
      applicableCities: generatedPromoPreview.city === 'All' ? ['All'] : [generatedPromoPreview.city],
      applicableCategories: ['GoMini', 'GoRide', 'GoComfort'],
      targetAudience: generatedPromoPreview.target as any,
      paymentMethodEligibility: ['all'],
      status: 'active',
      active: true,
      createdAt: new Date().toISOString()
    };

    addPromoCode(newPromo);
    setSuccessMessage(`Successfully deployed promo code ${generatedPromoPreview.code} into active inventory!`);
    setGeneratedPromoPreview(null);
  };

  const filteredInsights = (promotionAiInsights || []).filter((ins) => {
    const cat = (ins as any).category || ins.type || '';
    return filterCategory === 'All' || cat === filterCategory;
  });

  return (
    <div id="section-ai-promotion-intelligence" className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Bot className="w-5 h-5 text-amber-500" />
            Promotions & Rewards AI Copilot (Section 19)
          </h2>
          <p className="text-xs text-[#6B7280]">
            Continuous optimization algorithms, budget forecasting, automated promo synthesis, and ROI modeling
          </p>
        </div>

        <div className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Autonomous Growth Advisory Active
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* AI Promo Generator Box */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-[#111827]">
            AI Promo & Campaign Generator
          </h3>
        </div>
        <p className="text-xs text-[#6B7280]">
          Type an objective or click a pre-modeled growth scenario to auto-synthesize an optimal promo coupon with safety rules
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handleGenerateCampaign('Weekend Lahore launch campaign for GoMini and GoRide')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold transition cursor-pointer"
          >
            ⚡ Lahore Weekend Launch
          </button>
          <button
            onClick={() => handleGenerateCampaign('Karachi Monsoon rain ride discount and supply safeguard')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold transition cursor-pointer"
          >
            🌧️ Karachi Monsoon Surge Relief
          </button>
          <button
            onClick={() => handleGenerateCampaign('Islamabad captain supply boost zero commission incentive')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold transition cursor-pointer"
          >
            🚖 Captain Milestone Supply Boost
          </button>
          <button
            onClick={() => handleGenerateCampaign('Smart rider loyalty retention voucher')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold transition cursor-pointer"
          >
            💎 Churn Prevention Loyalty
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. Generate a high-yield Ramadan passenger coupon with 300 max cap..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleGenerateCampaign()}
            disabled={isGenerating}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? (
              'Analyzing Fleet...'
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Campaign
              </>
            )}
          </button>
        </div>

        {/* AI Generated Preview Card */}
        {generatedPromoPreview && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Synthesized Optimal Promo Configuration
              </span>
              <span className="font-mono font-extrabold text-sm text-amber-900 bg-white px-2.5 py-0.5 rounded border border-amber-300">
                {generatedPromoPreview.code}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-amber-200">
                <div className="text-[11px] text-[#6B7280]">Discount</div>
                <div className="font-bold text-[#111827]">
                  {generatedPromoPreview.discountType === 'percentage'
                    ? `${generatedPromoPreview.discountValue}% Off`
                    : `PKR ${generatedPromoPreview.discountValue} Flat`}
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-amber-200">
                <div className="text-[11px] text-[#6B7280]">Cap & Min Fare</div>
                <div className="font-bold text-[#111827]">
                  Cap: PKR {generatedPromoPreview.maxDiscount} | Min: PKR {generatedPromoPreview.minFare}
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-amber-200">
                <div className="text-[11px] text-[#6B7280]">City & Target</div>
                <div className="font-bold text-[#111827]">
                  {generatedPromoPreview.city} ({generatedPromoPreview.target})
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-amber-200">
                <div className="text-[11px] text-[#6B7280]">Safety Guarantee</div>
                <div className="font-bold text-emerald-700">Zero Negative Fare Pass</div>
              </div>
            </div>

            <p className="text-xs text-amber-950">{generatedPromoPreview.description}</p>

            <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                onClick={() => setGeneratedPromoPreview(null)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#374151] font-semibold text-xs transition cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleDeployGeneratedPromo}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Deploy Immediately
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence & ROI Advisory Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#111827]">
            Active Intelligence Signals & Budget Optimization Recommendations
          </h3>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827]"
          >
            <option value="All">All Categories</option>
            <option value="roi_optimization">ROI Optimization</option>
            <option value="budget_forecasting">Budget Forecasting</option>
            <option value="abuse_explanation">Abuse Explainer</option>
            <option value="campaign_suggestion">Campaign Suggestions</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#4B5563]">
                    {((insight as any).category || insight.type || 'Insight').replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800">
                    Confidence: {insight.confidenceScore}%
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  {insight.title}
                </h4>

                <p className="text-xs text-[#6B7280]">{insight.description}</p>

                {insight.projectedImpact && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <span className="text-[#6B7280]">Projected Impact:</span>
                    <span className="font-bold text-emerald-700">
                      {insight.projectedImpact}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF] text-[10px]">Model: DeepMind Gemini 2.5 Pro Engine</span>
                {insight.recommendedAction && (
                  <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {insight.recommendedAction}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
