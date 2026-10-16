import React, { useState, useMemo } from 'react';
import {
  DriverWallet,
  CentralPaymentTransaction,
  TopUpRequest
} from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Percent,
  Coins,
  Calendar,
  Filter
} from 'lucide-react';

interface WalletSummaryCardsProps {
  wallets: DriverWallet[];
  transactions: CentralPaymentTransaction[];
  topUps: TopUpRequest[];
}

export type DateFilterRange = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export const WalletSummaryCards: React.FC<WalletSummaryCardsProps> = ({
  wallets,
  transactions,
  topUps
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterRange>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Date Filtering Logic
  const filteredData = useMemo(() => {
    // Current simulated date reference: 2026-09-14 or current day
    const now = new Date();
    const todayStr = '2026-09-14'; // Baseline anchor for demo data, or use ISO date

    return {
      transactions: transactions.filter((t) => {
        if (dateFilter === 'today') return t.timestamp.includes('2026-09-14') || t.timestamp.includes(todayStr);
        if (dateFilter === 'yesterday') return t.timestamp.includes('2026-09-13');
        if (dateFilter === 'this_week') return t.timestamp.includes('2026-09-');
        if (dateFilter === 'this_month') return t.timestamp.includes('2026-09') || t.timestamp.includes('2026-10');
        return true;
      }),
      topUps: topUps.filter((req) => {
        const d = req.requestedAt || req.createdAt || '';
        if (dateFilter === 'today') return d.includes('2026-09-14') || d.includes(todayStr);
        if (dateFilter === 'yesterday') return d.includes('2026-09-13');
        if (dateFilter === 'this_week') return d.includes('2026-09-');
        if (dateFilter === 'this_month') return d.includes('2026-09') || d.includes('2026-10');
        return true;
      })
    };
  }, [dateFilter, transactions, topUps]);

  // Point 17: 7 Summary Calculations
  // 1. Total Wallet Balance
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  // 2. Today's Top Ups (volume)
  const todaysTopUpsVolume = filteredData.topUps
    .filter((r) => r.status === 'Completed' || r.status === 'SUCCESS' || r.status === 'Approved')
    .reduce((sum, r) => sum + r.amount, 0);

  // 3. Pending Payments
  const pendingPaymentsCount = filteredData.topUps.filter(
    (r) => r.status === 'Pending' || r.status === 'PENDING' || r.status === 'Under Review' || r.status === 'Processing'
  ).length;
  const pendingPaymentsAmount = filteredData.topUps
    .filter((r) => r.status === 'Pending' || r.status === 'PENDING' || r.status === 'Under Review' || r.status === 'Processing')
    .reduce((sum, r) => sum + r.amount, 0);

  // 4. Successful Payments
  const successfulPaymentsCount = filteredData.topUps.filter(
    (r) => r.status === 'Completed' || r.status === 'SUCCESS' || r.status === 'Approved'
  ).length;

  // 5. Failed Payments
  const failedPaymentsCount = filteredData.topUps.filter(
    (r) => r.status === 'Failed' || r.status === 'FAILED' || r.status === 'Rejected' || r.status === 'DECLINED'
  ).length;

  // 6. Total Fees (Deducted cutting)
  const totalFees = filteredData.topUps
    .filter((r) => r.status === 'Completed' || r.status === 'SUCCESS' || r.status === 'Approved')
    .reduce((sum, r) => {
      const fee = r.fee ?? (r.paymentMethod === 'bank' ? 20 : Math.round(r.amount * 0.01));
      return sum + fee;
    }, 0);

  // 7. Total Wallet Credits (Net amount credited to wallets)
  const totalWalletCredits = filteredData.topUps
    .filter((r) => r.status === 'Completed' || r.status === 'SUCCESS' || r.status === 'Approved')
    .reduce((sum, r) => {
      const fee = r.fee ?? (r.paymentMethod === 'bank' ? 20 : Math.round(r.amount * 0.01));
      const net = r.netCredit ?? Math.max(0, r.amount - fee);
      return sum + net;
    }, 0);

  return (
    <div className="space-y-4">
      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-800">Financial Summary Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['today', 'yesterday', 'this_week', 'this_month', 'custom'] as DateFilterRange[]).map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1 rounded-xl font-bold transition capitalize cursor-pointer ${
                dateFilter === f
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-1 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Point 17: 7 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
        {/* 1. Total Wallet Balance */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Wallet Balance</span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-900 mt-2">
            {formatPKR(totalWalletBalance)}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">In fleet circulation</span>
        </div>

        {/* 2. Today's Top Ups */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Top-Up Volume</span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-900 mt-2">
            {formatPKR(todaysTopUpsVolume)}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">{filteredData.topUps.length} requests</span>
        </div>

        {/* 3. Pending Payments */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Payments</span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-amber-600 mt-2">
            {pendingPaymentsCount}
          </div>
          <span className="text-[9px] text-amber-700 mt-1 block">Worth {formatPKR(pendingPaymentsAmount)}</span>
        </div>

        {/* 4. Successful Payments */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] uppercase font-bold tracking-wider">Successful Payments</span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-emerald-700 mt-2">
            {successfulPaymentsCount}
          </div>
          <span className="text-[9px] text-emerald-600 mt-1 block">Verified &amp; settled</span>
        </div>

        {/* 5. Failed Payments */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[10px] uppercase font-bold tracking-wider">Failed / Declined</span>
            <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-rose-600 mt-2">
            {failedPaymentsCount}
          </div>
          <span className="text-[9px] text-rose-500 mt-1 block">Zero wallet balance added</span>
        </div>

        {/* 6. Total Fees */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Fees</span>
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-rose-600 mt-2">
            {formatPKR(totalFees)}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Platform fee cuts</span>
        </div>

        {/* 7. Total Wallet Credits */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-xs flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Wallet Credits</span>
            <span className="p-1 rounded-lg bg-amber-400 text-slate-950">
              <Coins className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-amber-400 mt-2">
            {formatPKR(totalWalletCredits)}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">Net credited to drivers</span>
        </div>
      </div>
    </div>
  );
};
