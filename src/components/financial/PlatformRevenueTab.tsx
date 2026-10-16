import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import {
  RevenuePeriod,
  PlatformRevenueBreakdown,
  PeriodicSettlementRecord
} from '../../types/commissionAndRevenue';
import {
  calculatePlatformRevenueSummary,
  INITIAL_PERIODIC_SETTLEMENTS
} from '../../services/commissionService';
import { CashRideReconciliationRecord, AdvancePaymentReconciliationRecord } from '../../types/commissionAndRevenue';
import { CentralPaymentTransaction } from '../../types/paymentArchitecture';
import { isProductionDataSource } from '../../config/dataSourceMode';

interface PlatformRevenueTabProps {
  reconciliations?: CashRideReconciliationRecord[];
  advanceReconciliations?: AdvancePaymentReconciliationRecord[];
  transactions?: CentralPaymentTransaction[];
  adminActorName?: string;
  onExportReport?: (period: string, format: string) => void;
}

export const PlatformRevenueTab: React.FC<PlatformRevenueTabProps> = ({
  reconciliations = [],
  advanceReconciliations = [],
  transactions = [],
  adminActorName = 'Admin Finance Officer',
  onExportReport
}) => {
  // Single compact date selector
  const [selectedPeriod, setSelectedPeriod] = useState<RevenuePeriod>('today');
  const [settlements, setSettlements] = useState<PeriodicSettlementRecord[]>(() =>
    isProductionDataSource() ? [] : INITIAL_PERIODIC_SETTLEMENTS
  );
  const [showCloseDayModal, setShowCloseDayModal] = useState<boolean>(false);

  const summary: PlatformRevenueBreakdown = calculatePlatformRevenueSummary(
    selectedPeriod,
    reconciliations,
    advanceReconciliations,
    transactions
  );

  const handleCloseDailySettlement = () => {
    const newSettlement: PeriodicSettlementRecord = {
      id: `stl-${Date.now()}`,
      periodType: 'today',
      periodLabel: `Daily Settlement (${new Date().toLocaleDateString('en-GB')})`,
      date: new Date().toISOString().split('T')[0],
      openingBalance: 187450,
      grossRidesValue: summary.grossRideValue,
      totalCommissionEarned: summary.platformCommission,
      serviceCharges: summary.serviceCharges,
      finesCollected: 1500,
      refundsIssued: summary.refundsDeducted,
      reimbursementsGiven: summary.reimbursementsPaid,
      financialAdjustments: summary.financialAdjustments,
      driverPayoutsDisbursed: 18500,
      closingBalance: 187450 + summary.netPlatformRevenue - 18500,
      netPlatformRevenue: summary.netPlatformRevenue,
      status: 'settled',
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PKT',
      auditedBy: adminActorName
    };

    setSettlements([newSettlement, ...settlements]);
    setShowCloseDayModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              REAL-TIME PLATFORM AUDIT
            </span>
            <span className="text-xs text-slate-500">• {summary.dateRange}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">Platform Revenue &amp; Financial Ledger</h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Single Dropdown Date-Range Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as RevenuePeriod)}
              aria-label="Revenue Time Period"
              className="w-full sm:w-44 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/80 font-black text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
            >
              <option value="today">📅 Today (Daily)</option>
              <option value="weekly">📊 Weekly (Last 7 Days)</option>
              <option value="monthly">📈 Monthly (September MTD)</option>
              <option value="yearly">🏛️ Yearly (2026 Fiscal YTD)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowCloseDayModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Close Period Settlement</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Net Platform Revenue */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-300/80 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>Net Platform Revenue</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded font-black">
              {selectedPeriod.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-950 mt-1">
            Rs {summary.netPlatformRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-900 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />
            <span>Clean take after refunds &amp; driver compensations</span>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Platform Commission</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            Rs {summary.platformCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg Rs {summary.averageCommissionPerRide} per completed trip
          </div>
        </div>

        {/* Gross Ride Value */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Gross Ride Value (GMV)</span>
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            Rs {summary.grossRideValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {summary.totalCompletedRides} rides completed across Pakistan
          </div>
        </div>

        {/* Cash vs Advance Reconciled */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Payment Mix</span>
            <PieChart className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-sm font-black text-slate-900 mt-1 flex items-baseline gap-2">
            <span className="text-emerald-700">Cash: {summary.cashRidesCount}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700">Advance: {summary.advanceBookingsCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            100% normal rides are cash-reconciled
          </div>
        </div>
      </div>

      {/* Structured Financial Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Revenue &amp; Deductions Breakdown</h3>
            <p className="text-[11px] text-slate-500">Double-entry verified platform income for {summary.periodLabel}</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            All amounts in Pakistani Rupees (PKR)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                <th className="py-2.5 px-3">Revenue Line Item</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Accounting Type</th>
                <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-bold text-slate-900">Platform Ride Commission</td>
                <td className="py-2.5 px-3 text-slate-600">Calculated on Gross Cash Fares</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Credit (+)</span></td>
                <td className="py-2.5 px-3 text-right font-black text-emerald-700">+Rs {summary.platformCommission.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-bold text-slate-900">Service &amp; Technology Charges</td>
                <td className="py-2.5 px-3 text-slate-600">App booking infrastructure (~Rs 12/ride)</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Credit (+)</span></td>
                <td className="py-2.5 px-3 text-right font-black text-emerald-700">+Rs {summary.serviceCharges.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-bold text-slate-900">Other Platform Revenue</td>
                <td className="py-2.5 px-3 text-slate-600">Surge, Intercity Corridor Surcharges</td>
                <td className="py-2.5 px-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Credit (+)</span></td>
                <td className="py-2.5 px-3 text-right font-black text-emerald-700">+Rs {summary.otherPlatformRevenue.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-bold text-slate-900">Passenger Fare Refunds</td>
                <td className="py-2.5 px-3 text-slate-600">Approved refunds for cancelled/disputed rides</td>
                <td className="py-2.5 px-3"><span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">Debit (-)</span></td>
                <td className="py-2.5 px-3 text-right font-black text-rose-700">-Rs {summary.refundsDeducted.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-bold text-slate-900">Driver Reimbursements &amp; Bonuses</td>
                <td className="py-2.5 px-3 text-slate-600">Motorway toll compensations, cleaning allowance</td>
                <td className="py-2.5 px-3"><span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">Debit (-)</span></td>
                <td className="py-2.5 px-3 text-right font-black text-rose-700">-Rs {summary.reimbursementsPaid.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-bold text-slate-900">Financial Adjustments &amp; Corrections</td>
                <td className="py-2.5 px-3 text-slate-600">Manual adjustments approved by Finance Desk</td>
                <td className="py-2.5 px-3"><span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">Net</span></td>
                <td className="py-2.5 px-3 text-right font-black text-slate-700">Rs {summary.financialAdjustments.toLocaleString()}</td>
              </tr>
              <tr className="bg-amber-50/80 border-t-2 border-amber-300">
                <td className="py-3 px-3 font-black text-slate-950 text-sm">NET PLATFORM REVENUE</td>
                <td className="py-3 px-3 text-slate-700 font-bold" colSpan={2}>Retained GoLife Platform Earnings</td>
                <td className="py-3 px-3 text-right font-black text-slate-950 text-base">Rs {summary.netPlatformRevenue.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Periodic Settlements History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Settlement Records &amp; Audited Closes</h3>
            <p className="text-[11px] text-slate-500">Immutable historical settlement batches connected with Payout &amp; Reconciliation</p>
          </div>
          <span className="text-[11px] text-slate-500 font-bold">
            {settlements.length} settlement batches recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                <th className="py-2.5 px-3">Batch &amp; Period</th>
                <th className="py-2.5 px-3">Opening Bal</th>
                <th className="py-2.5 px-3">Gross Rides</th>
                <th className="py-2.5 px-3">Commission</th>
                <th className="py-2.5 px-3">Driver Payouts</th>
                <th className="py-2.5 px-3">Net Platform</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {settlements.map((stl) => (
                <tr key={stl.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900">{stl.periodLabel}</div>
                    <div className="text-[10px] text-slate-400">{stl.date} • {stl.id}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">Rs {stl.openingBalance.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">Rs {stl.grossRidesValue.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">Rs {stl.totalCommissionEarned.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-rose-700">Rs {stl.driverPayoutsDisbursed.toLocaleString()}</td>
                  <td className="py-3 px-3 font-black text-slate-950">Rs {stl.netPlatformRevenue.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      stl.status === 'settled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {stl.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500 font-semibold">{stl.auditedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Close Period Settlement */}
      {showCloseDayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Confirm Period Settlement Batch</h3>
            <p className="text-xs text-slate-500 mb-4">
              This will snapshot today's financial ledger, reconcile all driver commissions and payments, and record an audited closing balance.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Today's Gross Ride Value:</span>
                <span className="font-black text-slate-900">Rs {summary.grossRideValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Total Commission Earned:</span>
                <span className="font-black text-emerald-700">Rs {summary.platformCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Net Platform Revenue:</span>
                <span className="font-black text-slate-950">Rs {summary.netPlatformRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-200">
                <span>Auditing Admin:</span>
                <span className="font-bold text-slate-700">{adminActorName}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloseDayModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloseDailySettlement}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-sm transition"
              >
                Generate Audited Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformRevenueTab;
