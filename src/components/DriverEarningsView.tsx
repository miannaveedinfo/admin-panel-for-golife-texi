import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { DriverDailySummary, EarningsDateFilter, Driver } from '../types';
import { formatPKR } from '../utils/i18n';
import { filterSummariesByDateRange } from '../services/driverComplianceService';
import {
  Banknote,
  Search,
  Filter,
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Wallet,
  CreditCard,
  ChevronRight,
  X,
  FileText,
  RefreshCw,
  Eye,
  AlertCircle,
  Car,
  ChevronDown
} from 'lucide-react';

export const DriverEarningsView: React.FC = () => {
  const {
    drivers,
    driverDailySummaries,
    calculateAndSaveDriverDailySummary,
    settleDriverDailySummary,
    showToast,
    setActiveTab
  } = useAdmin();

  // Filters
  const [selectedDateFilter, setSelectedDateFilter] = useState<EarningsDateFilter>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupByView, setGroupByView] = useState<'driver' | 'day' | 'week' | 'month' | 'year'>('driver');

  // Modal / Detail state
  const [selectedSummary, setSelectedSummary] = useState<DriverDailySummary | null>(null);
  const [settlementModalSummary, setSettlementModalSummary] = useState<DriverDailySummary | null>(null);
  const [paymentRef, setPaymentRef] = useState('JC-RAAST-' + Math.floor(100000 + Math.random() * 900000));
  const [isCalculating, setIsCalculating] = useState(false);

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    let result = filterSummariesByDateRange(
      driverDailySummaries,
      selectedDateFilter,
      customStartDate,
      customEndDate
    );

    if (cityFilter !== 'All') {
      result = result.filter((s) => s.city?.toLowerCase() === cityFilter.toLowerCase());
    }

    if (statusFilter !== 'All') {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.driverName.toLowerCase().includes(q) ||
          s.driverId.toLowerCase().includes(q) ||
          s.driverPlate?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [driverDailySummaries, selectedDateFilter, customStartDate, customEndDate, cityFilter, statusFilter, searchQuery]);

  // Aggregate Metrics for Current Filter
  const totals = useMemo(() => {
    return filteredSummaries.reduce(
      (acc, s) => {
        acc.totalOrders += s.totalRides || 0;
        acc.completedOrders += s.completedRides || 0;
        acc.cancelledOrders += s.cancelledRides || 0;
        acc.grossEarnings += s.grossEarnings || 0;
        acc.commission += s.commission || 0;
        acc.netEarnings += s.netEarnings || 0;
        acc.cash += s.cash || 0;
        acc.onlinePayments += s.onlinePayments || 0;
        acc.adjustments += s.adjustments || 0;
        acc.finalPayable += s.finalPayable || 0;
        return acc;
      },
      {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        grossEarnings: 0,
        commission: 0,
        netEarnings: 0,
        cash: 0,
        onlinePayments: 0,
        adjustments: 0,
        finalPayable: 0
      }
    );
  }, [filteredSummaries]);

  // Handle Run Daily Calculations
  const handleRunDailyCalculations = () => {
    setIsCalculating(true);
    setTimeout(() => {
      calculateAndSaveDriverDailySummary();
      setIsCalculating(false);
      showToast('Automated daily earnings & commission calculations completed for all active drivers.', 'success');
    }, 450);
  };

  // Handle Settle Payment
  const handleSettlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settlementModalSummary) {
      settleDriverDailySummary(settlementModalSummary.id, paymentRef);
      setSettlementModalSummary(null);
      if (selectedSummary?.id === settlementModalSummary.id) {
        setSelectedSummary({
          ...selectedSummary,
          status: 'Paid',
          settledAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          settledBy: 'Admin (Direct Settlement)'
        });
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Summary ID',
      'Date',
      'Driver ID',
      'Driver Name',
      'Plate',
      'City',
      'Total Orders',
      'Completed Orders',
      'Cancelled Orders',
      'Gross PKR',
      'Commission PKR',
      'Net Earnings PKR',
      'Cash Collected PKR',
      'Online Payments PKR',
      'Adjustments PKR',
      'Final Payable PKR',
      'Status',
      'Calculated At',
      'Settled By'
    ];

    const rows = filteredSummaries.map((s) => [
      s.id,
      s.date,
      s.driverId,
      `"${s.driverName}"`,
      `"${s.driverPlate || ''}"`,
      s.city || '',
      s.totalRides,
      s.completedRides,
      s.cancelledRides,
      s.grossEarnings,
      s.commission,
      s.netEarnings,
      s.cash,
      s.onlinePayments,
      s.adjustments,
      s.finalPayable,
      s.status,
      `"${s.calculatedAt}"`,
      `"${s.settledBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `golife_driver_earnings_${selectedDateFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Earnings report exported to CSV successfully.', 'info');
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111827]">
                Driver Earnings & Daily Payment Calculation
              </h1>
              <p className="text-xs text-[#6B7280]">
                Automated daily commission settlement, cash-in-hand reconciliation, and digital payouts across Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunDailyCalculations}
            disabled={isCalculating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Calculating...' : 'Run Auto Calculation'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector Pills */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F766E]" />
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Settlement Period Filter:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Group By:</span>
            {(['driver', 'day', 'week', 'month', 'year'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setGroupByView(view)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                  groupByView === view
                    ? 'bg-[#0F766E] text-white'
                    : 'bg-slate-100 text-[#6B7280] hover:bg-slate-200'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'day_before_yesterday', label: 'Day Before Yesterday' },
            { id: 'last_7_days', label: 'Last 7 Days' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'previous_month', label: 'Previous Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'previous_year', label: 'Previous Year' },
            { id: 'custom', label: 'Custom Range' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDateFilter(item.id as EarningsDateFilter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                selectedDateFilter === item.id
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-slate-100 text-[#111827] hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs */}
        {selectedDateFilter === 'custom' && (
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Start Date:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-slate-50 text-[#111827]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">End Date:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-slate-50 text-[#111827]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 10 Calculated KPI Summary Cards (Per User Specification Section 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Orders</div>
          <div className="text-xl font-extrabold text-[#111827] mt-1">{totals.totalOrders}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Dispatched rides</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Completed Orders</div>
          <div className="text-xl font-extrabold text-[#10B981] mt-1">{totals.completedOrders}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Successful drops</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Gross Earnings</div>
          <div className="text-xl font-extrabold text-[#111827] font-mono mt-1">{formatPKR(totals.grossEarnings)}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Total customer fares</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">GoLife Commission</div>
          <div className="text-xl font-extrabold text-[#0F766E] font-mono mt-1">{formatPKR(totals.commission)}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">~15% platform share</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Driver Net Earnings</div>
          <div className="text-xl font-extrabold text-[#10B981] font-mono mt-1">{formatPKR(totals.netEarnings)}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Gross minus commission</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Cash Collected</div>
          <div className="text-xl font-extrabold text-[#F59E0B] font-mono mt-1">{formatPKR(totals.cash)}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Physical cash in hand</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Online Earnings</div>
          <div className="text-xl font-extrabold text-[#0F766E] font-mono mt-1">{formatPKR(totals.onlinePayments)}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">JazzCash / EasyPaisa</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Cancelled Orders</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1">{totals.cancelledOrders}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Driver/Passenger aborts</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Refund / Adjustment</div>
          <div className="text-xl font-extrabold text-[#6B7280] font-mono mt-1">{formatPKR(totals.adjustments)}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Bonus / fines / toll</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0F766E]/10 to-[#10B981]/10 border border-[#0F766E]/30 shadow-xs">
          <div className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">Final Payable Amount</div>
          <div className="text-xl font-extrabold text-[#0F766E] font-mono mt-1">{formatPKR(totals.finalPayable)}</div>
          <div className="text-[10px] text-[#0F766E] font-semibold mt-0.5">Net due to settle</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="All">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Peshawar">Peshawar</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="All">All Calculation Statuses</option>
            <option value="Calculated">Calculated</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Adjusted">Adjusted</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver name, ID, plate..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-56 shadow-xs"
          />
        </div>
      </div>

      {/* Driver Daily Earnings Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[#111827] uppercase tracking-wider">
              Daily Earnings & Settlements Ledger
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0F766E]/10 text-[#0F766E]">
              {filteredSummaries.length} Records
            </span>
          </div>
          <span className="text-[11px] text-[#6B7280]">Currency: Pakistani Rupee (PKR)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Date & Driver</th>
                <th className="py-3 px-4">Plate / City</th>
                <th className="py-3 px-4">Orders (C/Tot)</th>
                <th className="py-3 px-4">Gross Fare</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Net Earned</th>
                <th className="py-3 px-4">Cash Hand</th>
                <th className="py-3 px-4">Online Pay</th>
                <th className="py-3 px-4">Final Payable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredSummaries.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#111827] flex items-center gap-1.5">
                      {s.driverName}
                    </div>
                    <div className="text-[10px] text-[#6B7280] font-mono">
                      {s.date} • {s.driverId}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-[#111827] bg-slate-100 px-1.5 py-0.5 rounded border border-[#E5E7EB] inline-block text-[10px]">
                      {s.driverPlate || 'LE-PKG'}
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5">{s.city || 'Pakistan'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#111827]">
                      {s.completedRides} <span className="text-[#6B7280] font-normal">/ {s.totalRides}</span>
                    </div>
                    {s.cancelledRides > 0 && (
                      <div className="text-[10px] text-rose-600">{s.cancelledRides} cancelled</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                    {formatPKR(s.grossEarnings)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                    {formatPKR(s.commission)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#10B981]">
                    {formatPKR(s.netEarnings)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#F59E0B] font-semibold">
                    {formatPKR(s.cash)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#0F766E]">
                    {formatPKR(s.onlinePayments)}
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-[#0F766E] text-xs">
                    {formatPKR(s.finalPayable)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Paid'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : s.status === 'Calculated'
                          ? 'bg-blue-50 text-blue-700'
                          : s.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSummary(s)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-[#111827] transition cursor-pointer flex items-center gap-1"
                        title="View Detailed Daily Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Breakdown</span>
                      </button>

                      {s.status !== 'Paid' && (
                        <button
                          onClick={() => setSettlementModalSummary(s)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#064E3B] text-white transition cursor-pointer"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSummaries.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-[#6B7280]">
                    No earnings records found for the selected date filter. Click &ldquo;Run Auto Calculation&rdquo; to generate summaries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Earnings Detailed Modal (Per User Specification Section 1) */}
      {selectedSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#111827]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    {selectedSummary.driverName}
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-100 text-[#0F766E] border border-[#E5E7EB]">
                      {selectedSummary.driverPlate}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedSummary.status === 'Paid'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedSummary.status}
                    </span>
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Driver ID: {selectedSummary.driverId} • Statement Date: {selectedSummary.date} • City: {selectedSummary.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSummary(null)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Key Totals Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Gross Fare</div>
                  <div className="text-base font-extrabold text-[#111827] font-mono mt-0.5">
                    {formatPKR(selectedSummary.grossEarnings)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Platform Commission (15%)</div>
                  <div className="text-base font-extrabold text-[#0F766E] font-mono mt-0.5">
                    {formatPKR(selectedSummary.commission)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Cash in Hand</div>
                  <div className="text-base font-extrabold text-[#F59E0B] font-mono mt-0.5">
                    {formatPKR(selectedSummary.cash)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0F766E]/10 border border-[#0F766E]/30">
                  <div className="text-[10px] text-[#0F766E] uppercase font-bold">Final Payable / Settle</div>
                  <div className="text-base font-extrabold text-[#0F766E] font-mono mt-0.5">
                    {formatPKR(selectedSummary.finalPayable)}
                  </div>
                </div>
              </div>

              {/* Ride by Ride Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Dispatched Rides Included in Statement ({selectedSummary.rides?.length || selectedSummary.totalRides})
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">
                    Total Completed: {selectedSummary.completedRides} | Cancelled: {selectedSummary.cancelledRides}
                  </span>
                </div>

                {selectedSummary.rides && selectedSummary.rides.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSummary.rides.map((r) => (
                      <div
                        key={r.rideId}
                        className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#111827] font-mono">{r.rideCode}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-[#111827] uppercase">
                              {r.paymentMethod}
                            </span>
                            <span className="text-[#6B7280] font-mono text-[11px]">{r.time}</span>
                            {r.delayMin && r.delayMin > 0 ? (
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                +{r.delayMin}m delay
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-[#6B7280] mt-1">
                            {r.pickupAddress} → {r.destinationAddress}
                          </div>
                        </div>

                        <div className="text-right sm:shrink-0 font-mono">
                          <div className="font-bold text-[#10B981]">
                            Driver: {formatPKR(r.driverEarned)}
                          </div>
                          <div className="text-[10px] text-[#6B7280]">
                            Fare: {formatPKR(r.fare)} (Comm: {formatPKR(r.commission)})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] text-center text-xs text-[#6B7280]">
                    Detailed ride telemetry archived. Total rides for this statement: {selectedSummary.totalRides} trips.
                  </div>
                )}
              </div>

              {/* Settlement Status & Audit Information */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-2 text-xs">
                <div className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">
                  Settlement & Audit Trail
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#6B7280]">
                  <div>
                    <span className="text-[#111827] font-semibold">Calculation Engine:</span> GoLife Automated Daily Settle Batch v33
                  </div>
                  <div>
                    <span className="text-[#111827] font-semibold">Calculated At:</span> {selectedSummary.calculatedAt}
                  </div>
                  <div>
                    <span className="text-[#111827] font-semibold">Settlement Status:</span>{' '}
                    <span className="font-bold text-[#111827]">{selectedSummary.status}</span>
                  </div>
                  {selectedSummary.settledAt && (
                    <div>
                      <span className="text-[#111827] font-semibold">Settled By / Date:</span>{' '}
                      {selectedSummary.settledBy} ({selectedSummary.settledAt})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <button
                onClick={() => setSelectedSummary(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] text-xs font-semibold transition cursor-pointer"
              >
                Close Statement
              </button>

              {selectedSummary.status !== 'Paid' && (
                <button
                  onClick={() => {
                    setSettlementModalSummary(selectedSummary);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Mark as Paid & Disburse
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settle Payment Dialog */}
      {settlementModalSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSettlePaymentSubmit}
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-2xl space-y-4 text-[#111827]"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">
                  Settle Driver Earnings
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {settlementModalSummary.driverName} • {settlementModalSummary.date}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Gross Fare:</span>
                <span className="font-mono font-bold text-[#111827]">{formatPKR(settlementModalSummary.grossEarnings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Platform Commission:</span>
                <span className="font-mono font-bold text-[#0F766E]">-{formatPKR(settlementModalSummary.commission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Cash in Hand Collected:</span>
                <span className="font-mono font-bold text-[#F59E0B]">-{formatPKR(settlementModalSummary.cash)}</span>
              </div>
              <div className="pt-1.5 border-t border-[#E5E7EB] flex justify-between font-bold">
                <span className="text-[#0F766E]">Final Disbursal Amount:</span>
                <span className="font-mono text-sm text-[#0F766E]">{formatPKR(settlementModalSummary.finalPayable)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Disbursement Gateway / Transaction Reference ID
              </label>
              <input
                type="text"
                required
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. JazzCash-Txn-89101 or Raast-PK-299"
                className="w-full p-2 text-xs font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlementModalSummary(null)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white"
              >
                Confirm Payout & Settle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
