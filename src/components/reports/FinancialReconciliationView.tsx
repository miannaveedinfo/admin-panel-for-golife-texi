import React from 'react';
import { MainReportMetrics } from '../../types/reports';
import { formatPKR } from '../../utils/i18n';
import {
  DollarSign,
  ShieldCheck,
  Scale,
  Minus,
  Plus,
  Equal,
  ArrowRight,
  Landmark,
  Percent,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Wallet,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AdminTab } from '../../types';

interface FinancialReconciliationViewProps {
  metrics: MainReportMetrics;
  onNavigateTab: (tab: AdminTab) => void;
}

export const FinancialReconciliationView: React.FC<FinancialReconciliationViewProps> = ({
  metrics,
  onNavigateTab
}) => {
  return (
    <div className="space-y-4">
      {/* Equation 1: Platform Net Revenue Formula */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                1. Platform Net Revenue Calculation Engine
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited settlement reconciliation formula for GoLife platform retained earnings
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('fares')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer w-fit"
          >
            <span>Pricing &amp; Commission Rules</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        {/* Formula Flow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 items-center">
          {/* Gross */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Revenue</span>
            <span className="text-sm font-black text-slate-950 font-mono block mt-1">
              {formatPKR(metrics.grossRevenue)}
            </span>
            <span className="text-[9px] text-slate-400">Total ride fares</span>
          </div>

          {/* Minus Commission/Charges */}
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-800">
              <Minus className="w-3 h-3 text-rose-600" />
              <span>Driver Earnings</span>
            </div>
            <span className="text-sm font-black text-rose-700 font-mono block mt-1">
              {formatPKR(metrics.driverEarnings)}
            </span>
            <span className="text-[9px] text-rose-600">85% Driver payout share</span>
          </div>

          {/* Minus Refunds */}
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-800">
              <Minus className="w-3 h-3 text-rose-600" />
              <span>Refunds</span>
            </div>
            <span className="text-sm font-black text-rose-700 font-mono block mt-1">
              {formatPKR(metrics.refunds)}
            </span>
            <span className="text-[9px] text-rose-600">Passenger credit</span>
          </div>

          {/* Minus Reimbursements */}
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-800">
              <Minus className="w-3 h-3 text-rose-600" />
              <span>Reimbursements</span>
            </div>
            <span className="text-sm font-black text-rose-700 font-mono block mt-1">
              {formatPKR(metrics.reimbursements)}
            </span>
            <span className="text-[9px] text-rose-600">Driver toll compensation</span>
          </div>

          {/* Minus Adjustments */}
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-800">
              <Minus className="w-3 h-3 text-rose-600" />
              <span>Adjustments</span>
            </div>
            <span className="text-sm font-black text-rose-700 font-mono block mt-1">
              {formatPKR(metrics.adjustments)}
            </span>
            <span className="text-[9px] text-rose-600">Net corrections</span>
          </div>

          {/* Equals Net Platform Revenue */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1 text-[10px] uppercase font-black text-emerald-900">
              <Equal className="w-3 h-3 text-emerald-700" />
              <span>Net Platform Rev</span>
            </div>
            <span className="text-base font-black text-emerald-700 font-mono block mt-1">
              {formatPKR(metrics.netPlatformRevenue)}
            </span>
            <span className="text-[9px] font-bold text-emerald-800">Final Audited Take</span>
          </div>
        </div>

        {/* Platform Revenue line breakdown */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Commission Earned: <strong>{formatPKR(metrics.platformCommission)}</strong> + Service Fees: <strong>{formatPKR(metrics.serviceCharges)}</strong> + Fines: <strong>{formatPKR(metrics.fines)}</strong>
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Tax Accrual (PRA/SRB 5%): <strong>{formatPKR(metrics.taxes)}</strong>
          </div>
        </div>
      </div>

      {/* Equation 2: Driver Current Balance Formula */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                2. Driver Balance &amp; Payout Settlement Formula
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified driver wallet balance equation executed automatically per ride lifecycle
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('wallets')}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer w-fit shadow-2xs border border-amber-500/40"
          >
            <span>Open Wallets &amp; Payouts</span>
            <ArrowRight className="w-3 h-3 text-slate-950" />
          </button>
        </div>

        {/* Driver Formula Flow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 items-center text-xs">
          {/* Gross Earnings */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Fares</span>
            <span className="text-xs font-black text-slate-900 font-mono block mt-1">
              {formatPKR(metrics.grossRevenue)}
            </span>
            <span className="text-[9px] text-slate-400">Total collected</span>
          </div>

          {/* Minus Commission */}
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-rose-800">
              <Minus className="w-2.5 h-2.5 text-rose-600" />
              <span>Commission</span>
            </div>
            <span className="text-xs font-black text-rose-700 font-mono block mt-1">
              {formatPKR(metrics.platformCommission)}
            </span>
            <span className="text-[9px] text-rose-600">15% platform</span>
          </div>

          {/* Minus Fines */}
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-rose-800">
              <Minus className="w-2.5 h-2.5 text-rose-600" />
              <span>Fines</span>
            </div>
            <span className="text-xs font-black text-rose-700 font-mono block mt-1">
              {formatPKR(metrics.fines)}
            </span>
            <span className="text-[9px] text-rose-600">Infractions</span>
          </div>

          {/* Minus Other Deductions */}
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-rose-800">
              <Minus className="w-2.5 h-2.5 text-rose-600" />
              <span>Other Deductions</span>
            </div>
            <span className="text-xs font-black text-rose-700 font-mono block mt-1">
              {formatPKR(Math.round(metrics.completedRides * 15))}
            </span>
            <span className="text-[9px] text-rose-600">Insurance &amp; telecom</span>
          </div>

          {/* Plus Reimbursements */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-800">
              <Plus className="w-2.5 h-2.5 text-emerald-600" />
              <span>Reimb.</span>
            </div>
            <span className="text-xs font-black text-emerald-700 font-mono block mt-1">
              {formatPKR(metrics.reimbursements)}
            </span>
            <span className="text-[9px] text-emerald-600">Tolls approved</span>
          </div>

          {/* Plus Adjustments */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-800">
              <Plus className="w-2.5 h-2.5 text-emerald-600" />
              <span>Adjustments</span>
            </div>
            <span className="text-xs font-black text-emerald-700 font-mono block mt-1">
              {formatPKR(metrics.adjustments)}
            </span>
            <span className="text-[9px] text-emerald-600">Courtesy credits</span>
          </div>

          {/* Minus Payouts */}
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-amber-900">
              <Minus className="w-2.5 h-2.5 text-amber-600" />
              <span>Payouts</span>
            </div>
            <span className="text-xs font-black text-amber-800 font-mono block mt-1">
              {formatPKR(metrics.payouts)}
            </span>
            <span className="text-[9px] text-amber-700">JazzCash/EasyPaisa</span>
          </div>

          {/* Equals Current Driver Balance */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-2xs">
            <div className="flex items-center gap-1 text-[9px] uppercase font-black text-emerald-900">
              <Equal className="w-2.5 h-2.5 text-emerald-700" />
              <span>Driver Balances</span>
            </div>
            <span className="text-xs font-black text-emerald-700 font-mono block mt-1">
              {formatPKR(
                Math.max(
                  0,
                  metrics.driverEarnings -
                    metrics.fines -
                    Math.round(metrics.completedRides * 15) +
                    metrics.reimbursements +
                    metrics.adjustments -
                    metrics.payouts
                )
              )}
            </span>
            <span className="text-[9px] text-emerald-800 font-bold">Unwithdrawn Float</span>
          </div>
        </div>
      </div>
    </div>
  );
};
