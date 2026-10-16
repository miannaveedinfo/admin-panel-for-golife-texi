import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { PromoCodeManagementTab } from './promotions/PromoCodeManagementTab';
import { PromotionCampaignsTab } from './promotions/PromotionCampaignsTab';
import { ReferralProgramTab } from './promotions/ReferralProgramTab';
import { DriverPassengerRewardsTab } from './promotions/DriverPassengerRewardsTab';
import { PromoUsageHistoryTab } from './promotions/PromoUsageHistoryTab';
import { FraudAbuseProtectionTab } from './promotions/FraudAbuseProtectionTab';
import { AiPromotionIntelligenceTab } from './promotions/AiPromotionIntelligenceTab';
import { DiscountSafetySimulatorModal } from './promotions/DiscountSafetySimulatorModal';
import { calculatePromotionsSummaryMetrics } from '../services/promotionRewardsService';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { formatPKR } from '../utils/i18n';
import {
  Tag,
  Layers,
  Users,
  Award,
  History,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';

export type PromotionTabKey =
  | 'promos'
  | 'campaigns'
  | 'referrals'
  | 'rewards'
  | 'usage'
  | 'fraud'
  | 'ai';

export const PromoDiscountView: React.FC = () => {
  const {
    promoCodes,
    promotionCampaigns,
    referrals,
    rewardsHistory,
    promoUsages,
    fraudAlerts,
    riskAlerts,
    setActiveTab: setAdminTab
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<PromotionTabKey>('promos');
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [simulatorPromoCode, setSimulatorPromoCode] = useState<string | undefined>(undefined);

  // Overarching metrics from the central Phase 50 engine
  const metrics = calculatePromotionsSummaryMetrics(
    promoCodes,
    promotionCampaigns,
    referrals,
    rewardsHistory,
    promoUsages,
    fraudAlerts
  );

  const promoRiskAlertsCount = riskAlerts ? riskAlerts.filter((a) => a.category === 'promo_abuse' && a.status !== 'resolved' && a.status !== 'dismissed').length : 0;
  const pendingFraudCount = promoRiskAlertsCount;
  const pendingQualifiedReferrals = referrals.filter(
    (r) => r.status === 'qualified' && !r.rewardDisbursed
  ).length;

  const handleOpenSimulator = (code?: string) => {
    setSimulatorPromoCode(code);
    setShowSimulator(true);
  };

  return (
    <div id="view-promotions-rewards-center" className="space-y-6 text-[#111827]">
      {/* Master Control Center Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-start gap-3">
          <BackToDashboardButton />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 border border-amber-500/30">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-[#111827]">
                    Promotions, Referrals & Rewards Control Center
                  </h1>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    Phase 50
                  </span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Autonomous voucher engine, multi-tier referral tracking, captain milestones, and fraud-resistant ledger
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Negative Fare Safeguards: 100% Enforced</span>
          </div>

          <button
            id="btn-global-negative-fare-sim"
            onClick={() => handleOpenSimulator()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Fare Safety Simulator
          </button>
        </div>
      </div>

      {/* High-Level Executive KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Active Vouchers
          </div>
          <div className="text-base font-extrabold text-[#111827] font-mono mt-0.5">
            {metrics.totalPromosActive} Codes
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Validated & live</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Redemptions
          </div>
          <div className="text-base font-extrabold text-[#111827] font-mono mt-0.5">
            {metrics.totalUsageCount.toLocaleString()} Rides
          </div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Completed trips</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Discounts Funded
          </div>
          <div className="text-base font-extrabold text-amber-700 font-mono mt-0.5">
            {formatPKR(metrics.totalDiscountDisbursedPKR)}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Platform growth subsidy</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Referrals Qualified
          </div>
          <div className="text-base font-extrabold text-blue-700 font-mono mt-0.5">
            {metrics.qualifiedReferralsCount} / {metrics.totalReferralsCount}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">
            {pendingQualifiedReferrals > 0 ? `${pendingQualifiedReferrals} pending payout` : 'All cleared'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Rewards Disbursed
          </div>
          <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
            {formatPKR(
              metrics.referralRewardsDisbursedPKR +
                metrics.driverRewardsDisbursedPKR +
                metrics.passengerRewardsDisbursedPKR
            )}
          </div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Drivers & Passengers</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            Fraud Incidents
          </div>
          <div
            className={`text-base font-extrabold font-mono mt-0.5 ${
              pendingFraudCount > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {pendingFraudCount} Pending
          </div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Anti-abuse heuristics</div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          id="btn-tab-promos"
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'promos'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          Promo Codes ({promoCodes.length})
        </button>

        <button
          id="btn-tab-campaigns"
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Campaigns & Budgets ({promotionCampaigns.length})
        </button>

        <button
          id="btn-tab-referrals"
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'referrals'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Referral Program ({referrals.length})
          {pendingQualifiedReferrals > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          id="btn-tab-rewards"
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Driver & Rider Rewards
        </button>

        <button
          id="btn-tab-usage"
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'usage'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Redemption History ({promoUsages.length})
        </button>

        <button
          id="btn-tab-fraud"
          onClick={() => setActiveTab('fraud')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'fraud'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Fraud & Abuse Protection
          {pendingFraudCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingFraudCount}
            </span>
          )}
        </button>

        <button
          id="btn-tab-ai"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI Copilot
        </button>
      </div>

      {/* Main Tab Content */}
      <div id="promotions-active-tab-container">
        {activeTab === 'promos' && (
          <PromoCodeManagementTab onOpenSimulator={handleOpenSimulator} />
        )}

        {activeTab === 'campaigns' && <PromotionCampaignsTab />}

        {activeTab === 'referrals' && <ReferralProgramTab />}

        {activeTab === 'rewards' && <DriverPassengerRewardsTab />}

        {activeTab === 'usage' && <PromoUsageHistoryTab />}

        {activeTab === 'fraud' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Unified Central Fraud & Risk Control Center</h4>
                  <p className="text-xs text-slate-600">
                    Promo abuse and discount fraud alerts have been consolidated into Phase 53 Central Risk Sentinel with full investigation lifecycle, watchlist tracking, and automated rule engines.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('fraud_risk')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer shrink-0"
              >
                Open Fraud & Risk Center &rarr;
              </button>
            </div>
            <FraudAbuseProtectionTab />
          </div>
        )}

        {activeTab === 'ai' && <AiPromotionIntelligenceTab />}
      </div>

      {/* Negative Fare Safety & Pricing Protection Simulator Modal */}
      <DiscountSafetySimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        promoCodes={promoCodes}
        defaultPromoCode={simulatorPromoCode}
      />
    </div>
  );
};
