import React, { useState } from 'react';
import { ReferralRecord, ReferralRewardRule } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Plus,
  Edit2,
  Calendar,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const ReferralProgramTab: React.FC = () => {
  const {
    referrals,
    disburseReferralReward,
    referralRewardRules,
    updateReferralRewardRule
  } = useAdmin();

  const [activeSubView, setActiveSubView] = useState<'records' | 'rules'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCity, setFilterCity] = useState('All');

  // Rule edit modal state
  const [editingRule, setEditingRule] = useState<ReferralRewardRule | null>(null);
  const [ruleReferrerReward, setRuleReferrerReward] = useState('200');
  const [ruleRefereeReward, setRuleRefereeReward] = useState('100');
  const [ruleTripsRequired, setRuleTripsRequired] = useState('3');
  const [ruleMinRideFare, setRuleMinRideFare] = useState('150');
  const [rulePeriodDays, setRulePeriodDays] = useState('30');

  const handleOpenEditRule = (rule: ReferralRewardRule) => {
    setEditingRule(rule);
    setRuleReferrerReward(String(rule.referrerRewardAmount));
    setRuleRefereeReward(String(rule.refereeRewardAmount));
    setRuleTripsRequired(String(rule.qualificationRideCount));
    setRuleMinRideFare(String(rule.minRideFare));
    setRulePeriodDays(String(rule.qualificationPeriodDays));
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    updateReferralRewardRule(
      editingRule.id,
      {
        referrerRewardAmount: Number(ruleReferrerReward),
        refereeRewardAmount: Number(ruleRefereeReward),
        qualificationRideCount: Number(ruleTripsRequired),
        minRideFare: Number(ruleMinRideFare),
        qualificationPeriodDays: Number(rulePeriodDays)
      },
      'Admin updated referral qualification terms'
    );
    setEditingRule(null);
  };

  // Metrics
  const totalReferrals = referrals.length;
  const qualifiedCount = referrals.filter(
    (r) => r.status === 'qualified' || r.status === 'rewarded' || r.status === 'completed'
  ).length;
  const rewardedCount = referrals.filter((r) => r.rewardDisbursed || r.status === 'rewarded').length;
  const totalBonusPaidPKR = referrals
    .filter((r) => r.rewardDisbursed)
    .reduce((sum, r) => sum + (r.rewardAmount || r.referrerRewardAmount || 200), 0);
  const pendingCount = referrals.filter(
    (r) => r.status === 'pending_qualification' || r.status === 'reward_pending' || r.status === 'qualified'
  ).length;

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.refereeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referrerPhone.includes(searchTerm);

    const matchesType =
      filterType === 'All' ||
      (filterType === 'p2p' && r.referrerType === 'passenger' && (r.refereeType === 'passenger' || !r.refereeType)) ||
      (filterType === 'd2d' && r.referrerType === 'driver' && r.refereeType === 'driver') ||
      (filterType === 'cross' && r.referrerType !== r.refereeType && r.refereeType);

    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesCity = filterCity === 'All' || r.city === filterCity;

    return matchesSearch && matchesType && matchesStatus && matchesCity;
  });

  return (
    <div id="section-referral-program" className="space-y-5">
      {/* Top Banner & Subview Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Referral Program & Lifecycle Control
          </h2>
          <p className="text-xs text-[#6B7280]">
            Monitor passenger-to-passenger, driver-to-driver, qualification progress, and instant reward disbursal
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            id="tab-subview-referrals"
            onClick={() => setActiveSubView('records')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubView === 'records'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Referral Records ({referrals.length})
          </button>
          <button
            id="tab-subview-rules"
            onClick={() => setActiveSubView('rules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubView === 'rules'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Reward Rules & Qualifications ({referralRewardRules.length})
          </button>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Total Invites Tracked
          </div>
          <div className="text-lg font-extrabold text-[#111827] font-mono mt-1">
            {totalReferrals}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Across passenger & driver networks</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Qualified Referrals
          </div>
          <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1">
            {qualifiedCount} ({Math.round((qualifiedCount / (totalReferrals || 1)) * 100)}%)
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Completed milestone trips</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Rewards Disbursed
          </div>
          <div className="text-lg font-extrabold text-amber-700 font-mono mt-1">
            {formatPKR(totalBonusPaidPKR)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">{rewardedCount} paid transactions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            In Qualification / Pending
          </div>
          <div className="text-lg font-extrabold text-blue-700 font-mono mt-1">
            {pendingCount}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Trips currently in progress</div>
        </div>
      </div>

      {activeSubView === 'records' && (
        <>
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  id="input-search-referrals"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search referrer, referee, code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                id="select-referral-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Referral Types</option>
                <option value="p2p">Passenger → Passenger</option>
                <option value="d2d">Captain → Captain</option>
                <option value="cross">Cross-User Program</option>
              </select>

              <select
                id="select-referral-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Statuses</option>
                <option value="qualified">Qualified (Ready)</option>
                <option value="reward_pending">Reward Pending</option>
                <option value="rewarded">Rewarded (Completed)</option>
                <option value="pending_qualification">Trips in Progress</option>
                <option value="registered">Registered (0 trips)</option>
                <option value="rejected">Rejected / Flagged</option>
              </select>

              <select
                id="select-referral-city"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>

            <span className="text-xs text-[#6B7280]">
              Showing {filteredReferrals.length} referrals
            </span>
          </div>

          {/* Referrals List Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#4B5563] font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="p-3.5">Referral Code & Date</th>
                    <th className="p-3.5">Referrer (Inviter)</th>
                    <th className="p-3.5">Referred User (Invited)</th>
                    <th className="p-3.5">Program Type & City</th>
                    <th className="p-3.5">Trips Progress</th>
                    <th className="p-3.5">Reward Value</th>
                    <th className="p-3.5">Status & Reason</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredReferrals.map((r) => {
                    const isQualified =
                      r.status === 'qualified' ||
                      (r.tripsCompleted >= r.tripsRequired && !r.rewardDisbursed && r.status !== 'rejected');
                    const isRewarded = r.rewardDisbursed || r.status === 'rewarded';
                    const tripPercent = Math.min(
                      Math.round((r.tripsCompleted / (r.tripsRequired || 1)) * 100),
                      100
                    );

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-amber-900 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {r.referralCode}
                          </span>
                          <div className="text-[11px] text-[#6B7280] mt-1">{r.date}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-[#111827]">{r.referrerName}</div>
                          <div className="text-[11px] text-[#6B7280]">{r.referrerPhone}</div>
                          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-[#4B5563]">
                            {r.referrerType}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-[#111827]">{r.refereeName}</div>
                          <div className="text-[11px] text-[#6B7280]">{r.refereePhone}</div>
                          <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-[#4B5563]">
                            {r.refereeType || 'passenger'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-[#374151]">
                            {r.referrerType === 'driver' && r.refereeType === 'driver'
                              ? 'Captain → Captain'
                              : r.referrerType === 'passenger' && (r.refereeType === 'passenger' || !r.refereeType)
                              ? 'Passenger → Passenger'
                              : 'Cross-User Referral'}
                          </div>
                          <div className="text-[11px] text-[#6B7280]">{r.city || 'All Cities'}</div>
                        </td>

                        <td className="p-3.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#374151] mb-1">
                            <span>
                              {r.tripsCompleted} / {r.tripsRequired} rides
                            </span>
                            <span className="text-[#6B7280]">{tripPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isRewarded
                                  ? 'bg-emerald-500'
                                  : isQualified
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${tripPercent}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-[#9CA3AF] mt-1">
                            Min fare: PKR {r.minRideFare || 150}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-mono font-bold text-[#111827]">
                            {formatPKR(r.referrerRewardAmount || r.rewardAmount || 200)}
                          </div>
                          {r.refereeRewardAmount && (
                            <div className="text-[10px] text-[#6B7280]">
                              Referee gets: {formatPKR(r.refereeRewardAmount)}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 max-w-[200px]">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isRewarded
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isQualified
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : r.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-[#6B7280] border border-slate-200'
                            }`}
                          >
                            {isRewarded ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : isQualified ? (
                              <Sparkles className="w-3 h-3 text-amber-600" />
                            ) : null}
                            {r.status.replace('_', ' ')}
                          </span>

                          {r.rejectionReason && (
                            <p className="text-[10px] text-rose-700 mt-1 line-clamp-2">
                              {r.rejectionReason}
                            </p>
                          )}
                          {r.suspicionFlag && !r.rejectionReason && (
                            <p className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Flagged for review
                            </p>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          {isQualified && !isRewarded && (
                            <button
                              id={`btn-disburse-ref-${r.id}`}
                              onClick={() => disburseReferralReward(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
                            >
                              Disburse PKR {r.referrerRewardAmount || r.rewardAmount || 200}
                            </button>
                          )}
                          {isRewarded && (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Credited
                            </span>
                          )}
                          {!isQualified && !isRewarded && r.status !== 'rejected' && (
                            <span className="text-[11px] text-[#9CA3AF]">Awaiting Trips</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Subview 2: Reward Rules Configuration */}
      {activeSubView === 'rules' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-sm font-bold text-[#111827]">
              Referral Program Qualification & Reward Matrix (Section 9)
            </h3>
            <p className="text-xs text-[#6B7280]">
              Define the mandatory trip completions, minimum ride fares, and bonus amounts for both inviter and invited user
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {referralRewardRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#4B5563]">
                      {rule.programType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {rule.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111827] mt-2">{rule.title}</h4>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-[#111827]">
                      <span>Inviter Reward:</span>
                      <span className="font-mono text-amber-900">
                        {formatPKR(rule.referrerRewardAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#4B5563]">
                      <span>Invited User Bonus:</span>
                      <span className="font-mono font-semibold">
                        {formatPKR(rule.refereeRewardAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#4B5563]">
                      <span>Trips Required:</span>
                      <span className="font-semibold">{rule.qualificationRideCount} rides</span>
                    </div>

                    <div className="flex justify-between text-[#4B5563]">
                      <span>Minimum Trip Fare:</span>
                      <span className="font-mono font-semibold">
                        {formatPKR(rule.minRideFare)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#4B5563]">
                      <span>Window Period:</span>
                      <span className="font-semibold">{rule.qualificationPeriodDays} days</span>
                    </div>

                    <div className="flex justify-between text-[#4B5563]">
                      <span>Applicable City:</span>
                      <span className="font-semibold">{rule.city}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditRule(rule)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Qualification Criteria
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div
          id="modal-edit-referral-rule"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Edit Referral Program Rule</h3>
                <p className="text-xs text-[#6B7280]">{editingRule.title}</p>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="p-1 text-[#6B7280] hover:text-[#111827]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Referrer Reward (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={ruleReferrerReward}
                  onChange={(e) => setRuleReferrerReward(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] font-mono text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Referred User Bonus (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={ruleRefereeReward}
                  onChange={(e) => setRuleRefereeReward(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] font-mono text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Qualification Completed Trips
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={ruleTripsRequired}
                  onChange={(e) => setRuleTripsRequired(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] font-mono text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Minimum Eligible Fare per Trip (PKR)
                </label>
                <input
                  type="number"
                  min="50"
                  required
                  value={ruleMinRideFare}
                  onChange={(e) => setRuleMinRideFare(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] font-mono text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Qualification Window (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={rulePeriodDays}
                  onChange={(e) => setRulePeriodDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] font-mono text-[#111827]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
