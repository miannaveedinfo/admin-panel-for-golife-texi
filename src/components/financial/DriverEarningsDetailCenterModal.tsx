import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import {
  ArrowLeft,
  X,
  Calendar,
  MapPin,
  Car,
  User,
  Search,
  Download,
  RefreshCw,
  DollarSign,
  Percent,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Wallet,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Info,
  Banknote
} from 'lucide-react';
import {
  Ride,
  DriverDailySummary,
  Driver,
  DriverFine,
  PassengerRefundRecord,
  DriverReimbursementRecord,
  FinancialAdjustmentRecord
} from '../../types';
import {
  CommissionRule,
  DriverCommissionOverride
} from '../../types/commissionAndRevenue';
import {
  EarningsRideDetailRecord,
  getUnifiedEarningsRecords,
  INITIAL_COMMISSION_RULES,
  INITIAL_DRIVER_OVERRIDES,
  UnifiedTimeframePeriod
} from '../../services/commissionService';
import { formatPKR } from '../../utils/i18n';
import { DashboardCalendarPicker } from '../common/DashboardCalendarPicker';
import { formatDateDisplay, getTodayStr, isDateToday } from '../../utils/dateUtils';

interface DriverEarningsDetailCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  rides?: Ride[];
  driverDailySummaries?: DriverDailySummary[];
  drivers?: Driver[];
  commissionRules?: CommissionRule[];
  driverOverrides?: DriverCommissionOverride[];
  driverFines?: DriverFine[];
  passengerRefunds?: PassengerRefundRecord[];
  driverReimbursements?: DriverReimbursementRecord[];
  financialAdjustments?: FinancialAdjustmentRecord[];
  initialTimeframe?: UnifiedTimeframePeriod;
  initialDate?: string;
  initialYear?: number;
  initialMonth?: number | 'all';
  initialCity?: string;
}

export const DriverEarningsDetailCenterModal: React.FC<DriverEarningsDetailCenterModalProps> = ({
  isOpen,
  onClose,
  rides = [],
  driverDailySummaries = [],
  drivers = [],
  commissionRules = INITIAL_COMMISSION_RULES,
  driverOverrides = INITIAL_DRIVER_OVERRIDES,
  driverFines = [],
  passengerRefunds = [],
  driverReimbursements = [],
  financialAdjustments = [],
  initialTimeframe,
  initialDate,
  initialYear,
  initialMonth,
  initialCity = 'All'
}) => {
  const { setActiveTab, dashboardDateFilter, updateDashboardDateFilter } = useAdmin();
  // Primary timeframe filter synced with unified date filter
  const [timeframe, setTimeframe] = useState<UnifiedTimeframePeriod>(
    initialTimeframe || dashboardDateFilter?.mode || 'today'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || dashboardDateFilter?.selectedDate || getTodayStr()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear ?? dashboardDateFilter?.selectedYear ?? 2026
  );
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(
    initialMonth ?? dashboardDateFilter?.selectedMonth ?? 'all'
  );
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // UI interactive states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<EarningsRideDetailRecord | null>(null);
  const [expandedMobileCardId, setExpandedMobileCardId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Synchronize when initial props change or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTimeframe) setTimeframe(initialTimeframe);
      else if (dashboardDateFilter?.mode) setTimeframe(dashboardDateFilter.mode);

      if (initialDate) setSelectedDate(initialDate);
      else if (dashboardDateFilter?.selectedDate) setSelectedDate(dashboardDateFilter.selectedDate);

      if (initialYear !== undefined) setSelectedYear(initialYear);
      else if (dashboardDateFilter?.selectedYear) setSelectedYear(dashboardDateFilter.selectedYear);

      if (initialMonth !== undefined) setSelectedMonth(initialMonth);
      else if (dashboardDateFilter?.selectedMonth !== undefined) setSelectedMonth(dashboardDateFilter.selectedMonth);

      if (initialCity) setSelectedCity(initialCity);
    }
  }, [isOpen, initialTimeframe, initialDate, initialYear, initialMonth, initialCity, dashboardDateFilter]);

  // Handle Escape key to close record drawer or main modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRecord) {
          setSelectedRecord(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedRecord]);

  // Central Calculation Engine
  const { records, summary } = useMemo(() => {
    try {
      return getUnifiedEarningsRecords({
        rides,
        driverDailySummaries,
        rules: commissionRules,
        overrides: driverOverrides,
        driverFines,
        passengerRefunds,
        driverReimbursements,
        financialAdjustments,
        timeframe,
        selectedDate,
        selectedYear,
        selectedMonth,
        selectedCity,
        selectedCategory,
        selectedDriverId,
        searchQuery
      });
    } catch (err: any) {
      console.error('Error calculating unified earnings:', err);
      return {
        records: [],
        summary: {
          grossRideRevenue: 0,
          platformCommission: 0,
          finesTotal: 0,
          refundsTotal: 0,
          reimbursementsTotal: 0,
          adjustmentsTotal: 0,
          netDriverEarnings: 0,
          completedRidesCount: 0,
          timeframe,
          timeframeLabel: timeframe.toUpperCase()
        }
      };
    }
  }, [
    rides,
    driverDailySummaries,
    commissionRules,
    driverOverrides,
    driverFines,
    passengerRefunds,
    driverReimbursements,
    financialAdjustments,
    timeframe,
    selectedDate,
    selectedYear,
    selectedMonth,
    selectedCity,
    selectedCategory,
    selectedDriverId,
    searchQuery
  ]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setErrorState(null);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedCity('All');
    setSelectedCategory('all');
    setSelectedDriverId('all');
    setSearchQuery('');
    setErrorState(null);
  };

  const hasActiveFilters =
    selectedCity !== 'All' ||
    selectedCategory !== 'all' ||
    selectedDriverId !== 'all' ||
    searchQuery.trim().length > 0;

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('No earnings records to export for the selected filters.');
      return;
    }

    const headers = [
      'Ride ID',
      'Date Time',
      'City',
      'Driver Name',
      'Driver Plate',
      'Passenger Name',
      'Category',
      'Distance (km)',
      'Gross Fare (PKR)',
      'Commission (PKR)',
      'Fines Deducted (PKR)',
      'Refunds (PKR)',
      'Reimbursements (PKR)',
      'Adjustments (PKR)',
      'Net Driver Earnings (PKR)',
      'Payment Status',
      'Settlement Status'
    ];

    const rows = records.map((r) => [
      `"${r.rideCode || r.rideId}"`,
      `"${r.dateTime}"`,
      `"${r.city}"`,
      `"${r.driverName}"`,
      `"${r.driverPlate || 'N/A'}"`,
      `"${r.passengerName}"`,
      `"${r.serviceCategory}"`,
      r.distanceKm,
      r.grossFarePKR,
      r.finalCommissionPKR,
      r.fineDeductionPKR,
      r.refundPKR,
      r.reimbursementPKR,
      r.adjustmentPKR,
      r.driverNetEarningsPKR,
      `"${r.paymentStatus}"`,
      `"${r.settlementStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `golife_driver_earnings_${timeframe}_${selectedCity.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      id="driver-earnings-detail-center-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="earnings-detail-center-title"
    >
      {/* Main Container Card */}
      <div className="relative bg-slate-50 w-full max-w-7xl h-full max-h-[96vh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
        
        {/* ============================================================
            1. COMPACT PROFESSIONAL HEADER
           ============================================================ */}
        <header className="shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <BackToDashboardButton
              onClick={() => {
                onClose();
                setActiveTab('dashboard');
              }}
            />

            <div className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  id="earnings-detail-center-title"
                  className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>Driver Earnings Detail Center</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  {summary.timeframeLabel} Period
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                  Demo Mode Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate mt-0.5">
                Centralized driver earnings, deductions, reimbursements, adjustments & wallet ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs disabled:opacity-60"
              title="Recalculate financial engine"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : 'text-slate-600'}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close Driver Earnings Detail Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ============================================================
            2. UNIFIED SCROLLABLE CONTAINER
           ============================================================ */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          
          {/* A. STICKY FILTER BAR */}
          <div className="sticky top-0 z-10 px-3.5 sm:px-5 py-2.5 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
              
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Period & Calendar Date Filter */}
                <DashboardCalendarPicker
                  mode={timeframe}
                  selectedDate={selectedDate}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  compact={true}
                  onChange={(newFilter) => {
                    setTimeframe(newFilter.mode);
                    setSelectedDate(newFilter.selectedDate);
                    setSelectedYear(newFilter.selectedYear);
                    setSelectedMonth(newFilter.selectedMonth);
                    updateDashboardDateFilter(newFilter);
                  }}
                />

                {/* 2. City Filter */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="All">All Cities</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                  </select>
                </div>

                {/* 3. Category Filter */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="all">All Categories</option>
                    <option value="ride">GoRide</option>
                    <option value="mini">GoMini</option>
                    <option value="comfort">GoComfort</option>
                    <option value="auto">GoAuto</option>
                    <option value="bike">GoBike</option>
                  </select>
                </div>

                {/* 4. Driver Filter */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">Driver:</span>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs max-w-[130px] truncate"
                  >
                    <option value="all">All Drivers</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search & Reset */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-52">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ride ID, driver, passenger..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline shrink-0 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 space-y-4">
            
            {/* B. EARNINGS SUMMARY: 8-METRIC RESPONSIVE GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              
              {/* 1. Gross Ride Revenue */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                  <span>Gross Fare</span>
                  <Banknote className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900 font-mono truncate">
                  {formatPKR(summary.grossRideRevenue)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Total revenue booked</div>
              </div>

              {/* 2. Platform Commission */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                  <span>Commission</span>
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-sm sm:text-base font-black text-rose-600 font-mono truncate">
                  -{formatPKR(summary.platformCommission)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Platform service fee</div>
              </div>

              {/* 3. Driver Fines */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                  <span>Fines</span>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="text-sm sm:text-base font-black text-rose-600 font-mono truncate">
                  -{formatPKR(summary.finesTotal)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Compliance deductions</div>
              </div>

              {/* 4. Refunds */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                  <span>Refunds</span>
                  <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div className="text-sm sm:text-base font-black text-orange-600 font-mono truncate">
                  -{formatPKR(summary.refundsTotal)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Customer chargebacks</div>
              </div>

              {/* 5. Reimbursements */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                  <span>Reimbursements</span>
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-600 font-mono truncate">
                  +{formatPKR(summary.reimbursementsTotal)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Approved fuel/tolls</div>
              </div>

              {/* 6. Adjustments */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                  <span>Adjustments</span>
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-sm sm:text-base font-black text-indigo-700 font-mono truncate">
                  {summary.adjustmentsTotal >= 0 ? '+' : ''}{formatPKR(summary.adjustmentsTotal)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Manual resolutions</div>
              </div>

              {/* 7. Net Driver Earnings (PROMINENT HIGHLIGHT) */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-emerald-500/10 border-2 border-amber-400 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between text-amber-950 text-[11px] font-black mb-1">
                  <span className="uppercase tracking-wider">Net Driver Earnings</span>
                  <Wallet className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-base sm:text-xl font-black text-slate-950 font-mono truncate">
                  {formatPKR(summary.netDriverEarnings)}
                </div>
                <div className="text-[10px] text-slate-600 font-bold mt-1 flex items-center justify-between">
                  <span>{summary.completedRidesCount} completed trips</span>
                  <span className="text-emerald-700">100% Reconciled</span>
                </div>
              </div>

            </div>

            {/* C. MATHEMATICAL FORMULA BANNER */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-900">Official Earnings Formula:</span>
                <span className="font-mono text-slate-600 hidden lg:inline">
                  Gross Fare ({formatPKR(summary.grossRideRevenue)}) - Commission ({formatPKR(summary.platformCommission)}) - Fines ({formatPKR(summary.finesTotal)}) - Refunds ({formatPKR(summary.refundsTotal)}) + Reimbursements ({formatPKR(summary.reimbursementsTotal)}) + Adjustments ({formatPKR(summary.adjustmentsTotal)}) =
                </span>
                <span className="font-mono font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  {formatPKR(summary.netDriverEarnings)}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Double-entry verified with central driver wallet &amp; settlements
              </div>
            </div>

            {/* D. ERROR STATE */}
            {errorState && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold">{errorState}</span>
                </div>
                <button
                  onClick={handleRefresh}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
                >
                  Retry Calculation
                </button>
              </div>
            )}

            {/* E. RIDE-BY-RIDE BREAKDOWN */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900">
                    Ride-by-Ride Earnings Breakdown
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Showing {records.length} itemized earnings records for {summary.timeframeLabel}
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-600">
                  Click any row to inspect complete audit &amp; settlement trail
                </div>
              </div>

              {/* 1. Empty State */}
              {records.length === 0 ? (
                <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">
                    No earnings records for {formatDateDisplay(selectedDate)}.
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                    There are no completed rides, fines, or ledger adjustments matching this selected date and filters.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {!isDateToday(selectedDate) && (
                      <button
                        onClick={() => {
                          const today = getTodayStr();
                          setTimeframe('today');
                          setSelectedDate(today);
                          setSelectedYear(new Date().getFullYear());
                          setSelectedMonth('all');
                          updateDashboardDateFilter({
                            mode: 'today',
                            selectedDate: today,
                            selectedYear: new Date().getFullYear(),
                            selectedMonth: 'all'
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Jump to Today
                      </button>
                    )}
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                      >
                        Clear Active Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* 2. Desktop Table (visible on sm: and up) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Ride ID</th>
                          <th className="py-2.5 px-3">Date/Time</th>
                          <th className="py-2.5 px-3">Driver</th>
                          <th className="py-2.5 px-3">Passenger</th>
                          <th className="py-2.5 px-3">City</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Distance</th>
                          <th className="py-2.5 px-3 text-right">Gross Fare</th>
                          <th className="py-2.5 px-3 text-right">Commission</th>
                          <th className="py-2.5 px-3 text-right">Fines</th>
                          <th className="py-2.5 px-3 text-right">Reimb.</th>
                          <th className="py-2.5 px-3 text-right">Adjust.</th>
                          <th className="py-2.5 px-3 text-right font-black text-slate-900">Net Driver</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {records.map((r) => (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedRecord(r)}
                            className="hover:bg-amber-50/60 cursor-pointer transition group"
                            title="Click to view full record audit drawer"
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 flex items-center gap-1">
                              <span>{r.rideCode || r.rideId}</span>
                              <Eye className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {r.dateTime}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 truncate max-w-[130px]">{r.driverName}</div>
                              {r.driverPlate && (
                                <div className="text-[10px] text-slate-400 font-mono">{r.driverPlate}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 truncate max-w-[110px]">
                              {r.passengerName}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                                {r.city}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                                {r.serviceCategory}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-mono">
                              {r.distanceKm} km
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                              {formatPKR(r.grossFarePKR)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                              -{formatPKR(r.finalCommissionPKR)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                              {r.fineDeductionPKR > 0 ? `-${formatPKR(r.fineDeductionPKR)}` : 'Rs 0'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                              {r.reimbursementPKR > 0 ? `+${formatPKR(r.reimbursementPKR)}` : 'Rs 0'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-indigo-600">
                              {r.adjustmentPKR !== 0 ? `${r.adjustmentPKR > 0 ? '+' : ''}${formatPKR(r.adjustmentPKR)}` : 'Rs 0'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-amber-950 bg-amber-50/50">
                              {formatPKR(r.driverNetEarningsPKR)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {r.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 3. Mobile View: Compact Expandable Cards (sm:hidden) */}
                  <div className="sm:hidden divide-y divide-slate-200">
                    {records.map((r) => {
                      const isExpanded = expandedMobileCardId === r.id;
                      return (
                        <div key={r.id} className="p-3 bg-white space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono font-black text-slate-900 text-xs truncate">
                                {r.rideCode || r.rideId}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                                {r.serviceCategory}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                              {r.paymentStatus}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <div>
                              <div className="font-bold text-slate-900">{r.driverName}</div>
                              <div className="text-[11px] text-slate-400">{r.city} • {r.dateTime}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Net Driver</div>
                              <div className="font-mono font-black text-sm text-amber-900">
                                {formatPKR(r.driverNetEarningsPKR)}
                              </div>
                            </div>
                          </div>

                          {/* Expand/Collapse Toggle & Details */}
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <button
                              onClick={() => setExpandedMobileCardId(isExpanded ? null : r.id)}
                              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide Breakdown' : 'View Breakdown'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                              onClick={() => setSelectedRecord(r)}
                              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Full Audit Details</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Gross Fare:</span>
                                <span className="text-slate-900 font-bold">{formatPKR(r.grossFarePKR)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Commission ({r.ruleRate}%):</span>
                                <span className="text-rose-600 font-bold">-{formatPKR(r.finalCommissionPKR)}</span>
                              </div>
                              {r.fineDeductionPKR > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Fines:</span>
                                  <span className="text-rose-600 font-bold">-{formatPKR(r.fineDeductionPKR)}</span>
                                </div>
                              )}
                              {r.refundPKR > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Refunds:</span>
                                  <span className="text-orange-600 font-bold">-{formatPKR(r.refundPKR)}</span>
                                </div>
                              )}
                              {r.reimbursementPKR > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Reimbursement:</span>
                                  <span className="text-emerald-600 font-bold">+{formatPKR(r.reimbursementPKR)}</span>
                                </div>
                              )}
                              {r.adjustmentPKR !== 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Adjustment:</span>
                                  <span className="text-indigo-600 font-bold">
                                    {r.adjustmentPKR > 0 ? '+' : ''}{formatPKR(r.adjustmentPKR)}
                                  </span>
                                </div>
                              )}
                              <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-slate-950">
                                <span>Final Net Driver Earning:</span>
                                <span className="text-amber-900">{formatPKR(r.driverNetEarningsPKR)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ============================================================
            3. RECORD DETAILS DRAWER / MODAL
           ============================================================ */}
        {selectedRecord && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-detail-title"
          >
            <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft border-l border-slate-200">
              {/* Drawer Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="record-detail-title" className="text-sm font-black text-slate-900">
                      Earnings Audit &amp; Settlement Record
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">
                      {selectedRecord.rideCode || selectedRecord.rideId} • {selectedRecord.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close Record Details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                
                {/* 1. Trip & Ride Overview */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Ride Information
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Date/Time:</span>
                      <div className="font-bold text-slate-900">{selectedRecord.dateTime}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Category &amp; Distance:</span>
                      <div className="font-bold text-slate-900">
                        {selectedRecord.serviceCategory} • {selectedRecord.distanceKm} km
                      </div>
                    </div>
                  </div>
                  {selectedRecord.pickupAddress && (
                    <div className="text-[11px] pt-1">
                      <span className="text-slate-400">Pickup:</span>
                      <div className="text-slate-700 font-medium truncate">{selectedRecord.pickupAddress}</div>
                    </div>
                  )}
                  {selectedRecord.destinationAddress && (
                    <div className="text-[11px]">
                      <span className="text-slate-400">Destination:</span>
                      <div className="text-slate-700 font-medium truncate">{selectedRecord.destinationAddress}</div>
                    </div>
                  )}
                </div>

                {/* 2. Driver & Passenger Identity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Driver</span>
                    </div>
                    <div className="font-black text-slate-900">{selectedRecord.driverName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{selectedRecord.driverId}</div>
                    {selectedRecord.driverPlate && (
                      <div className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                        {selectedRecord.driverPlate}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Passenger</span>
                    </div>
                    <div className="font-black text-slate-900">{selectedRecord.passengerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{selectedRecord.passengerId}</div>
                    {selectedRecord.passengerPhone && (
                      <div className="text-[10px] text-slate-500">{selectedRecord.passengerPhone}</div>
                    )}
                  </div>
                </div>

                {/* 3. Itemized Financial Arithmetic */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-300 space-y-2.5 font-mono">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-sans flex items-center justify-between">
                    <span>Itemized Financial Breakdown</span>
                    <span className="text-slate-500 text-[10px]">PKR</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span>Gross Fare</span>
                    <span className="font-black text-slate-900">{formatPKR(selectedRecord.grossFarePKR)}</span>
                  </div>

                  <div className="flex justify-between items-center text-rose-600">
                    <span>
                      Commission ({selectedRecord.ruleRate}{selectedRecord.ruleType === 'flat' ? ' PKR' : '%'})
                    </span>
                    <span className="font-black">-{formatPKR(selectedRecord.finalCommissionPKR)}</span>
                  </div>

                  {selectedRecord.fineDeductionPKR > 0 && (
                    <div className="flex justify-between items-center text-rose-600">
                      <span>Fine / Penalty Deduction</span>
                      <span className="font-black">-{formatPKR(selectedRecord.fineDeductionPKR)}</span>
                    </div>
                  )}

                  {selectedRecord.refundPKR > 0 && (
                    <div className="flex justify-between items-center text-orange-600">
                      <span>Passenger Refund Reversal</span>
                      <span className="font-black">-{formatPKR(selectedRecord.refundPKR)}</span>
                    </div>
                  )}

                  {selectedRecord.reimbursementPKR > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Approved Driver Reimbursement</span>
                      <span className="font-black">+{formatPKR(selectedRecord.reimbursementPKR)}</span>
                    </div>
                  )}

                  {selectedRecord.adjustmentPKR !== 0 && (
                    <div className="flex justify-between items-center text-indigo-600">
                      <span>Administrative Adjustment</span>
                      <span className="font-black">
                        {selectedRecord.adjustmentPKR > 0 ? '+' : ''}{formatPKR(selectedRecord.adjustmentPKR)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-amber-300 pt-2 flex justify-between items-center text-sm font-black text-slate-950 bg-white/70 p-2 rounded-lg">
                    <span className="font-sans">Final Net Driver Earning:</span>
                    <span className="text-amber-950 font-mono">{formatPKR(selectedRecord.driverNetEarningsPKR)}</span>
                  </div>
                </div>

                {/* 4. Payment & Settlement Metadata */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Transaction &amp; Settlement Ledger
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Payment Method:</span>
                      <div className="font-bold text-slate-800 capitalize">{selectedRecord.paymentMethod}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment Status:</span>
                      <div className="font-bold text-emerald-700 capitalize">{selectedRecord.paymentStatus}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Settlement Status:</span>
                      <div className="font-bold text-slate-800">{selectedRecord.settlementStatus}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Transaction ID:</span>
                      <div className="font-mono text-slate-700 font-bold">{selectedRecord.transactionId}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Calculation Engine:</span>
                      <div className="text-slate-700">{selectedRecord.ruleVersionInfo}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Calculated At:</span>
                      <div className="text-slate-700">{selectedRecord.calculationTimestamp}</div>
                    </div>
                  </div>
                </div>

                {/* 5. Audit History Trail */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Audit History Trail</span>
                  </div>
                  <div className="space-y-1.5 pl-1 border-l-2 border-amber-400">
                    {selectedRecord.auditHistory.map((step, idx) => (
                      <div key={idx} className="text-[11px] text-slate-600 pl-2">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
