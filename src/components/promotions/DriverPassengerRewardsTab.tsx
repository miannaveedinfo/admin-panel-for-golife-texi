import React, { useState } from 'react';
import { DriverRewardRule, PassengerRewardRule, RewardRecord } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  Award,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Star,
  Zap,
  Plus,
  Edit2,
  Gift
} from 'lucide-react';

export const DriverPassengerRewardsTab: React.FC = () => {
  const {
    driverRewardRules,
    passengerRewardRules,
    rewardsHistory,
    drivers,
    passengers,
    disburseDriverReward,
    disbursePassengerReward
  } = useAdmin();

  const [activeSegment, setActiveSegment] = useState<'drivers' | 'passengers' | 'history'>('drivers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Manual Disbursal Modal
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [targetType, setTargetType] = useState<'driver' | 'passenger'>('driver');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [customAmount, setCustomAmount] = useState('1500');
  const [customReason, setCustomReason] = useState('Milestone Target Reached');

  const handleOpenDisburseModal = (type: 'driver' | 'passenger', ruleId?: string, defaultAmt?: number) => {
    setTargetType(type);
    setSelectedRuleId(ruleId || '');
    if (type === 'driver') {
      setSelectedUserId(drivers[0]?.id || '');
    } else {
      setSelectedUserId(passengers[0]?.id || '');
    }
    if (defaultAmt) {
      setCustomAmount(String(defaultAmt));
    }
    setShowDisburseModal(true);
  };

  const handleExecuteDisbursal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    if (targetType === 'driver') {
      disburseDriverReward(
        selectedUserId,
        selectedRuleId || 'custom-drv-reward',
        Number(customAmount),
        customReason,
        'Admin manual disbursal'
      );
    } else {
      disbursePassengerReward(
        selectedUserId,
        selectedRuleId || 'custom-pax-reward',
        Number(customAmount),
        customReason,
        'Admin manual disbursal'
      );
    }

    setShowDisburseModal(false);
  };

  // Metrics
  const totalDriverRewardsPaid = rewardsHistory
    .filter((r) => r.userType === 'driver')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPassengerRewardsPaid = rewardsHistory
    .filter((r) => r.userType === 'passenger')
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredHistory = rewardsHistory.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUserType = filterUserType === 'All' || r.userType === filterUserType;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;

    return matchesSearch && matchesUserType && matchesStatus;
  });

  return (
    <div id="section-driver-passenger-rewards" className="space-y-5">
      {/* Header & Segment Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Driver & Passenger Rewards Center
          </h2>
          <p className="text-xs text-[#6B7280]">
            Milestone bonuses, performance criteria, direct wallet credits, and financial ledger tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="seg-btn-drivers"
              onClick={() => setActiveSegment('drivers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSegment === 'drivers'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Captain Programs ({driverRewardRules.length})
            </button>
            <button
              id="seg-btn-passengers"
              onClick={() => setActiveSegment('passengers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSegment === 'passengers'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Rider Programs ({passengerRewardRules.length})
            </button>
            <button
              id="seg-btn-history"
              onClick={() => setActiveSegment('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSegment === 'history'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Reward Ledger ({rewardsHistory.length})
            </button>
          </div>

          <button
            id="btn-manual-disburse-open"
            onClick={() => handleOpenDisburseModal('driver')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Credit Reward
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Total Driver Bonuses Paid
          </div>
          <div className="text-xl font-extrabold text-[#111827] font-mono mt-1">
            {formatPKR(totalDriverRewardsPaid)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Credited directly to captain wallets</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Total Passenger Rewards Paid
          </div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatPKR(totalPassengerRewardsPaid)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Disbursed to rider wallet balances</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Active Reward Programs
          </div>
          <div className="text-xl font-extrabold text-blue-700 font-mono mt-1">
            {driverRewardRules.filter((r) => r.active).length +
              passengerRewardRules.filter((r) => r.active).length}{' '}
            Programs
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Active across all operating cities</div>
        </div>
      </div>

      {/* Segment 1: Driver Reward Programs */}
      {activeSegment === 'drivers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-sm font-bold text-[#111827]">
              Captain Milestone & Performance Programs (Section 10)
            </h3>
            <p className="text-xs text-[#6B7280]">
              Incentivize completion rates, peak hour availability, safety ratings, and weekly ride volume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driverRewardRules.map((rule) => {
              const spent = rule.disbursedBudget || 0;
              const cap = rule.budgetCap || 500000;
              const percent = Math.min(Math.round((spent / cap) * 100), 100);

              return (
                <div
                  key={rule.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#4B5563]">
                        {rule.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {formatPKR(rule.rewardAmount)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#111827]">{rule.title}</h4>
                    <p className="text-xs text-[#6B7280]">{rule.description}</p>

                    {/* Criteria Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      {rule.targetMilestoneRides && (
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Milestone Ride Target:</span>
                          <span className="font-bold text-[#111827]">
                            {rule.targetMilestoneRides} completed trips
                          </span>
                        </div>
                      )}
                      {rule.minCompletionRate && (
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Min Completion Rate:</span>
                          <span className="font-bold text-[#111827]">
                            {rule.minCompletionRate}%
                          </span>
                        </div>
                      )}
                      {rule.minRating && (
                        <div className="flex justify-between text-[#4B5563]">
                          <span>Min Passenger Rating:</span>
                          <span className="font-bold text-[#111827]">
                            {rule.minRating.toFixed(2)} ★
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#4B5563]">
                        <span>City Scope:</span>
                        <span className="font-bold text-[#111827]">{rule.city}</span>
                      </div>
                    </div>

                    {/* Budget progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#6B7280]">
                        <span>Disbursed: {formatPKR(spent)}</span>
                        <span>Pool: {formatPKR(cap)} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-[#9CA3AF]">
                      Valid: {rule.startDate} to {rule.endDate}
                    </span>
                    <button
                      onClick={() => handleOpenDisburseModal('driver', rule.id, rule.rewardAmount)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Credit to Captain
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Segment 2: Passenger Reward Programs */}
      {activeSegment === 'passengers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-sm font-bold text-[#111827]">
              Passenger Loyalty & Milestone Incentive Programs (Section 11)
            </h3>
            <p className="text-xs text-[#6B7280]">
              First ride cashback, rider retention milestones, VIP loyalty tiers, and automated wallet credits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {passengerRewardRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#4B5563]">
                      {rule.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {formatPKR(rule.rewardAmount)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#111827] mt-2.5">{rule.title}</h4>
                  <p className="text-xs text-[#6B7280] mt-1">{rule.description}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    {rule.milestoneRides && (
                      <div className="flex justify-between text-[#4B5563]">
                        <span>Required Rides:</span>
                        <span className="font-bold text-[#111827]">{rule.milestoneRides} rides</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#4B5563]">
                      <span>Disbursal Type:</span>
                      <span className="font-bold text-[#111827]">GoLife Wallet Credit</span>
                    </div>
                    <div className="flex justify-between text-[#4B5563]">
                      <span>City:</span>
                      <span className="font-bold text-[#111827]">{rule.city}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDisburseModal('passenger', rule.id, rule.rewardAmount)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Disburse to Rider Wallet
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segment 3: Reward History Ledger (Section 12) */}
      {activeSegment === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user, reason, tx..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="All">All User Types</option>
                <option value="driver">Drivers Only</option>
                <option value="passenger">Passengers Only</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Statuses</option>
                <option value="credited">Credited</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <span className="text-xs text-[#6B7280]">
              Showing {filteredHistory.length} ledger entries
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#4B5563] font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="p-3.5">Reward ID & Date</th>
                    <th className="p-3.5">Recipient User</th>
                    <th className="p-3.5">Type & Program</th>
                    <th className="p-3.5">Amount (PKR)</th>
                    <th className="p-3.5">Wallet Tx Reference</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#111827]">{item.id}</span>
                        <div className="text-[11px] text-[#6B7280]">{item.date}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#111827]">{item.userName}</div>
                        <div className="text-[11px] text-[#6B7280]">{item.userPhone}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-[#4B5563]">
                          {item.userType}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-[#374151]">{item.reason}</div>
                        <div className="text-[11px] text-[#6B7280]">{item.rewardType}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-extrabold text-emerald-600 text-sm">
                          + {formatPKR(item.amount)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-[#4B5563] bg-slate-100 px-2 py-0.5 rounded">
                          {item.transactionId || 'TX-AUTOMATED'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Disbursal Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-[#111827]">
                  Credit Financial Reward to Wallet
                </h3>
              </div>
              <button
                onClick={() => setShowDisburseModal(false)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteDisbursal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">Recipient Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('driver');
                      setSelectedUserId(drivers[0]?.id || '');
                    }}
                    className={`py-2 rounded-lg font-bold border transition ${
                      targetType === 'driver'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-[#4B5563] border-slate-200'
                    }`}
                  >
                    Captain (Driver)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('passenger');
                      setSelectedUserId(passengers[0]?.id || '');
                    }}
                    className={`py-2 rounded-lg font-bold border transition ${
                      targetType === 'passenger'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-[#4B5563] border-slate-200'
                    }`}
                  >
                    Passenger (Rider)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Select {targetType === 'driver' ? 'Captain' : 'Passenger'}
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827]"
                >
                  {targetType === 'driver'
                    ? drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone}) — Bal: {formatPKR(d.walletBalance)}
                        </option>
                      ))
                    : passengers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone}) — Bal: {formatPKR(p.walletBalance || 0)}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Reward Amount (PKR)*
                </label>
                <input
                  type="number"
                  min="50"
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] font-mono text-[#111827]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Reason / Campaign Program
                </label>
                <input
                  type="text"
                  required
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#4B5563]">
                <strong>Ledger Notice:</strong> This action creates an immediate credit transaction in the user’s wallet, updates their persistent balance, records an immutable audit log, and registers the entry in the GoLife central ledger.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Confirm & Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
