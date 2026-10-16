import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  getUnifiedCommissionRecords,
  calculateCommissionDetailMetrics,
  CommissionRideDetailRecord,
  UnifiedTimeframePeriod
} from '../../services/commissionService';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import { DashboardCalendarPicker } from '../common/DashboardCalendarPicker';
import { formatDateDisplay, getTodayStr, isDateToday, parseDateToYYYYMMDD } from '../../utils/dateUtils';
import {
  X,
  ArrowLeft,
  Download,
  Search,
  RefreshCw,
  Percent,
  Car,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  User,
  FileText,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface CommissionDetailCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTimeframe?: UnifiedTimeframePeriod;
  initialDate?: string;
  initialYear?: number;
  initialMonth?: number | 'all';
  initialCity?: string;
}

export const CommissionDetailCenterModal: React.FC<CommissionDetailCenterModalProps> = ({
  isOpen,
  onClose,
  initialTimeframe,
  initialDate,
  initialYear,
  initialMonth,
  initialCity = 'All'
}) => {
  const {
    rides,
    driverDailySummaries,
    commissionRules,
    driverOverrides,
    drivers,
    passengers,
    setActiveTab,
    dashboardDateFilter,
    updateDashboardDateFilter
  } = useAdmin();

  // Filters State synced with Unified Date Filter
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<CommissionRideDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Synchronize when modal opens or initial props change
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

  // Handle ESC key to close detail or modal, and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRecord) {
          setSelectedRecord(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedRecord, onClose]);

  // Driver options for filter
  const driverOptions = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    (drivers || []).forEach((d) => {
      if (d && d.id && !seen.has(d.id)) {
        seen.add(d.id);
        list.push({ id: d.id, name: d.name || `Driver ${d.id}` });
      }
    });
    return list;
  }, [drivers]);

  // Query records via Central Commission Engine
  const commissionRecords = useMemo(() => {
    try {
      return getUnifiedCommissionRecords({
        rides,
        driverDailySummaries,
        rules: commissionRules,
        overrides: driverOverrides,
        timeframe,
        selectedDate,
        selectedYear,
        selectedMonth,
        selectedCity,
        selectedCategory,
        selectedDriverId,
        statusFilter,
        searchQuery
      });
    } catch (err: any) {
      setErrorState(err?.message || 'Failed to calculate commission from central rules.');
      return [];
    }
  }, [
    rides,
    driverDailySummaries,
    commissionRules,
    driverOverrides,
    timeframe,
    selectedDate,
    selectedYear,
    selectedMonth,
    selectedCity,
    selectedCategory,
    selectedDriverId,
    statusFilter,
    searchQuery
  ]);

  // Calculate 8 top KPI summary metrics from exact calculated records
  const metrics = useMemo(() => {
    return calculateCommissionDetailMetrics(commissionRecords, timeframe);
  }, [commissionRecords, timeframe]);

  const handleManualRefresh = () => {
    setIsLoading(true);
    setErrorState(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    if (commissionRecords.length === 0) {
      alert('No commission records to export for the selected filter.');
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
      'Commission Rule',
      'Commission Rate',
      'Commission (PKR)',
      'Driver Net Earnings (PKR)',
      'Platform Revenue (PKR)',
      'Status'
    ];

    const rows = commissionRecords.map((r) => [
      `"${r.rideCode || r.rideId}"`,
      `"${r.dateTime}"`,
      `"${r.city}"`,
      `"${r.driverName}"`,
      `"${r.driverPlate || 'N/A'}"`,
      `"${r.passengerName}"`,
      `"${r.serviceCategory}"`,
      r.distanceKm,
      r.grossFarePKR,
      `"${r.ruleAppliedName}"`,
      `"${r.ruleType === 'flat' ? `Rs ${r.ruleRate}` : `${r.ruleRate}%`}"`,
      r.finalCommissionPKR,
      r.driverNetEarningsPKR,
      r.platformNetRevenuePKR,
      `"${r.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `golife_commission_report_${timeframe}_${selectedCity.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setSelectedCity('All');
    setSelectedCategory('all');
    setSelectedDriverId('all');
    setStatusFilter('all');
    setSearchQuery('');
    setErrorState(null);
  };

  const hasActiveFilters =
    selectedCity !== 'All' ||
    selectedCategory !== 'all' ||
    selectedDriverId !== 'all' ||
    statusFilter !== 'all' ||
    searchQuery.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn">
      {/* Main Commission Detail Center Card */}
      <div className="relative bg-slate-50 w-full max-w-7xl h-full max-h-[96vh] sm:max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
        
        {/* ============================================================
            1. COMPACT HEADER SECTION
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
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>Commission Detail Center</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  Demo Mode Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Real-time central commission calculations & financial audit log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
              aria-label="Close Commission Detail Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ============================================================
            2. SINGLE UNIFIED VERTICAL SCROLL CONTAINER
           ============================================================ */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          
          {/* A. COMPACT STICKY FILTER BAR */}
          <div className="sticky top-0 z-10 px-3.5 sm:px-5 py-2.5 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
              
              {/* Filter controls row */}
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

                {/* 2. City */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="All">All</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                  </select>
                </div>

                {/* 3. Category */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="all">All</option>
                    <option value="ride">GoRide</option>
                    <option value="mini">GoMini</option>
                    <option value="comfort">GoComfort</option>
                    <option value="auto">GoAuto</option>
                    <option value="bike">GoBike</option>
                  </select>
                </div>

                {/* 4. Driver */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">Driver:</span>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs max-w-[110px] sm:max-w-[140px] truncate"
                  >
                    <option value="all">All Drivers</option>
                    {driverOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Status */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-600 text-[11px]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer text-xs"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="reconciled">Reconciled</option>
                  </select>
                </div>

                {/* 6. Refresh Button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg border border-slate-300 transition shadow-2xs cursor-pointer text-xs"
                  title="Recalculate Central Commission Engine"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-amber-700 hover:text-amber-800 font-bold underline px-1 text-xs cursor-pointer transition"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* 7. Search Input */}
              <div className="relative w-full sm:w-56 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search ID, Driver, Passenger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* B. SUMMARY CARDS (EXACT 8 EXECUTIVE KPI CARDS) */}
          <section className="px-3.5 sm:px-5 pt-3.5 pb-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              
              {/* 1. Today's / Selected Period Commission */}
              <div className="p-3 rounded-xl bg-amber-500 text-slate-950 border border-amber-400 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 truncate">
                  {metrics.timeframeLabel}
                </span>
                <div className="text-base sm:text-lg font-black tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.todayCommission)}
                </div>
                <span className="text-[9px] font-bold text-amber-900 truncate">
                  Central Engine Total
                </span>
              </div>

              {/* 2. Total Commission */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Total Commission</span>
                <div className="text-base sm:text-lg font-black text-amber-700 tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.totalCommission)}
                </div>
                <span className="text-[9px] text-slate-400 truncate">Filtered Net Total</span>
              </div>

              {/* 3. Gross Revenue */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Gross Revenue</span>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.grossRideRevenue)}
                </div>
                <span className="text-[9px] text-slate-400 truncate">Customer Gross Fares</span>
              </div>

              {/* 4. Commissionable Revenue */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Commissionable Rev.</span>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.commissionableRevenue)}
                </div>
                <span className="text-[9px] text-slate-400 truncate">Fee-eligible Fares</span>
              </div>

              {/* 5. Completed Rides */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Completed Rides</span>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono my-1 truncate">
                  {metrics.totalCompletedRides}
                </div>
                <span className="text-[9px] text-slate-400 truncate">
                  {metrics.commissionableRides} commissionable
                </span>
              </div>

              {/* 6. Average Commission */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Avg. Commission</span>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.averageCommission)}
                </div>
                <span className="text-[9px] text-slate-400 truncate">Per completed trip</span>
              </div>

              {/* 7. Driver Earnings */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Driver Earnings</span>
                <div className="text-base sm:text-lg font-black text-emerald-700 tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.totalDriverEarnings)}
                </div>
                <span className="text-[9px] text-slate-400 truncate">Gross - Commission</span>
              </div>

              {/* 8. Platform Revenue */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 truncate">Platform Revenue</span>
                <div className="text-base sm:text-lg font-black text-amber-700 tracking-tight font-mono my-1 truncate">
                  {formatPKR(metrics.platformRevenue)}
                </div>
                <span className="text-[9px] text-slate-400 truncate">Comm + Tech Fee</span>
              </div>

            </div>
          </section>

          {/* C. TRANSACTION LIST & DETAILS SECTION */}
          <section className="px-3.5 sm:px-5 py-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              
              {/* Section Header */}
              <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Commission Transactions ({commissionRecords.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click any transaction to inspect calculation audit
                </span>
              </div>

              {/* States Handling */}
              {errorState ? (
                <div className="p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="text-sm font-black text-rose-900">Calculation Error</div>
                  <p className="text-xs text-rose-600 mt-1 max-w-sm">
                    {errorState}
                  </p>
                  <button
                    onClick={() => {
                      setErrorState(null);
                      handleClearFilters();
                    }}
                    className="mt-3.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Retry Calculation
                  </button>
                </div>
              ) : isLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <RefreshCw className="w-7 h-7 text-amber-500 animate-spin mb-2.5" />
                  <div className="text-xs font-bold text-slate-700">Calculating commission records...</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Applying Central Commission Rule Engine</div>
                </div>
              ) : commissionRecords.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono">Rs. 0</div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    No commission records for {formatDateDisplay(selectedDate)}.
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                    No completed trips or commission deductions were recorded for this selected timeframe and filters.
                  </p>
                  <div className="flex items-center gap-2 mt-3.5 flex-wrap justify-center">
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
                        className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Jump to Today
                      </button>
                    )}
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                      >
                        Clear Filters & Show All
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* DESKTOP / TABLET VIEW: CLEAN RESPONSIVE TABLE WITH INTERNAL HORIZONTAL SCROLL ONLY */}
                  <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider whitespace-nowrap">
                          <th className="py-2.5 px-3">Ride ID</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Driver</th>
                          <th className="py-2.5 px-3">City</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Distance</th>
                          <th className="py-2.5 px-3 text-right">Gross Fare</th>
                          <th className="py-2.5 px-3">Commission Rule</th>
                          <th className="py-2.5 px-3 text-right">Commission</th>
                          <th className="py-2.5 px-3 text-right">Driver Net</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {commissionRecords.map((record) => (
                          <tr
                            key={record.id}
                            onClick={() => setSelectedRecord(record)}
                            className="hover:bg-amber-50/60 cursor-pointer transition group"
                          >
                            {/* Ride ID */}
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 group-hover:text-amber-700 whitespace-nowrap">
                              {record.rideCode || record.rideId}
                            </td>

                            {/* Date */}
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                              {record.dateTime}
                            </td>

                            {/* Driver */}
                            <td className="py-2.5 px-3 text-slate-900 font-semibold whitespace-nowrap">
                              <div>{record.driverName}</div>
                              {record.driverPlate && (
                                <div className="text-[10px] text-slate-400 font-mono">{record.driverPlate}</div>
                              )}
                            </td>

                            {/* City */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-medium">
                                {record.city}
                              </span>
                            </td>

                            {/* Category */}
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                              {record.serviceCategory}
                            </td>

                            {/* Distance */}
                            <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                              {record.distanceKm} km
                            </td>

                            {/* Gross Fare */}
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              {formatPKR(record.grossFarePKR)}
                            </td>

                            {/* Commission Rule */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-800 font-medium truncate max-w-[130px]" title={record.ruleAppliedName}>
                                  {record.ruleAppliedName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] font-mono shrink-0">
                                  {record.ruleType === 'flat' ? `Rs ${record.ruleRate}` : `${record.ruleRate}%`}
                                </span>
                              </div>
                            </td>

                            {/* Commission */}
                            <td className="py-2.5 px-3 text-right font-mono font-black text-amber-700 whitespace-nowrap">
                              {formatPKR(record.finalCommissionPKR)}
                            </td>

                            {/* Driver Net */}
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                              {formatPKR(record.driverNetEarningsPKR)}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
                                  {record.status}
                                </span>
                                {record.isDriverOverride && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                    Override
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action */}
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRecord(record);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] text-slate-700 transition cursor-pointer"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE VIEW: COMPACT RESPONSIVE LIST ROWS (NO AWKWARD TABLE SQUEEZE) */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {commissionRecords.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="p-3 hover:bg-amber-50/50 cursor-pointer transition active:bg-amber-100/50"
                      >
                        {/* Top Line: ID, Date, Status */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 text-xs">
                              {record.rideCode || record.rideId}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 capitalize">
                              {record.status}
                            </span>
                            {record.isDriverOverride && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Override
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{record.dateTime}</span>
                        </div>

                        {/* Middle Line: Driver, City, Category */}
                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                          <div className="text-slate-800 font-semibold truncate max-w-[190px]">
                            {record.driverName} {record.driverPlate ? `• ${record.driverPlate}` : ''}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {record.city}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] border border-amber-200 font-medium">
                              {record.serviceCategory}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Stats Grid */}
                        <div className="mt-2 grid grid-cols-3 gap-2 bg-slate-50/80 p-2 rounded-lg text-center border border-slate-100">
                          <div>
                            <span className="block text-[10px] text-slate-500">Gross Fare</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {formatPKR(record.grossFarePKR)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-amber-800 font-bold">Commission</span>
                            <span className="font-mono font-black text-amber-700 text-xs">
                              {formatPKR(record.finalCommissionPKR)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-emerald-800 font-bold">Driver Net</span>
                            <span className="font-mono font-bold text-emerald-700 text-xs">
                              {formatPKR(record.driverNetEarningsPKR)}
                            </span>
                          </div>
                        </div>

                        {/* Footer details row */}
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[220px]">
                            Rule: {record.ruleAppliedName} ({record.ruleType === 'flat' ? `Rs ${record.ruleRate}` : `${record.ruleRate}%`})
                          </span>
                          <span className="text-amber-700 font-bold flex items-center gap-0.5 shrink-0">
                            View Audit <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </section>

        </div>

        {/* ============================================================
            3. COMMISSION TRANSACTION DETAIL DRAWER / MODAL
           ============================================================ */}
        {selectedRecord && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
            <div className="relative bg-white w-full max-w-lg md:max-w-xl max-h-[90vh] sm:max-h-[86vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              
              {/* Drawer Header */}
              <div className="shrink-0 px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                      <span>Commission Audit:</span>
                      <span className="font-mono text-amber-400">{selectedRecord.rideCode || selectedRecord.rideId}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Central Commission Engine • Verification Audit
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  aria-label="Close detail"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Drawer Body with dedicated internal scroll */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 text-xs">
                
                {/* Financial Split Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Gross Fare</span>
                    <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-0.5">
                      {formatPKR(selectedRecord.grossFarePKR)}
                    </div>
                    <span className="text-[9px] text-slate-400">Base + Distance</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 block">Commission</span>
                    <div className="text-sm sm:text-base font-black text-amber-700 font-mono mt-0.5">
                      {formatPKR(selectedRecord.finalCommissionPKR)}
                    </div>
                    <span className="text-[9px] text-amber-900">
                      {selectedRecord.ruleType === 'flat' ? `Flat Rs ${selectedRecord.ruleRate}` : `${selectedRecord.ruleRate}% Rule`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 block">Driver Net</span>
                    <div className="text-sm sm:text-base font-black text-emerald-700 font-mono mt-0.5">
                      {formatPKR(selectedRecord.driverNetEarningsPKR)}
                    </div>
                    <span className="text-[9px] text-emerald-700">Gross - Comm</span>
                  </div>
                </div>

                {/* Engine Audit Log */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                    Engine Calculation & Audit Information
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Rule Applied:</span>
                      <span className="font-bold text-slate-900 text-xs">{selectedRecord.ruleAppliedName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Rule Version:</span>
                      <span className="font-bold text-slate-900 text-xs">v{selectedRecord.ruleVersion}.0</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Rule Rate & Type:</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedRecord.ruleType === 'flat' ? `Flat Rs ${selectedRecord.ruleRate}` : `${selectedRecord.ruleRate}%`} ({selectedRecord.ruleType})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Driver Override:</span>
                      <span className={`font-bold text-xs ${selectedRecord.isDriverOverride ? 'text-purple-700' : 'text-slate-700'}`}>
                        {selectedRecord.isDriverOverride ? 'Yes (Special Override)' : 'No (Default Rule)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Platform Tech Fee:</span>
                      <span className="font-bold text-slate-900 text-xs">Rs 20</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Platform Net Revenue:</span>
                      <span className="font-black text-amber-700 text-xs">
                        {formatPKR(selectedRecord.platformNetRevenuePKR)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Distance & Duration:</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {selectedRecord.distanceKm} km • {selectedRecord.durationMin || 20} min
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Calculation Timestamp:</span>
                      <span className="font-bold text-slate-900 text-xs">{selectedRecord.dateTime}</span>
                    </div>
                  </div>
                </div>

                {/* Driver & Passenger Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Driver Information */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1 text-[11px]">
                      <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Driver Information</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{selectedRecord.driverName}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      Plate: <span className="font-mono font-semibold text-slate-800">{selectedRecord.driverPlate || 'REG-4012'}</span>
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Phone: <span className="font-mono text-slate-700">{selectedRecord.driverPhone || '+92 300 1234567'}</span>
                    </div>
                    <div className="text-slate-400 text-[9px] mt-1 font-mono">
                      ID: {selectedRecord.driverId}
                    </div>
                  </div>

                  {/* Passenger Information */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1 text-[11px]">
                      <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Passenger Information</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{selectedRecord.passengerName}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      Method: <span className="font-semibold text-slate-800 capitalize">{selectedRecord.paymentMethod}</span>
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Status: <span className="font-semibold text-emerald-700 capitalize">{selectedRecord.paymentStatus}</span>
                    </div>
                    <div className="text-slate-400 text-[9px] mt-1 font-mono">
                      ID: {selectedRecord.passengerId}
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Trip Route ({selectedRecord.city})</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <span className="text-slate-800 font-medium">Pickup: {selectedRecord.pickupAddress || 'Pickup Point'}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <span className="text-slate-800 font-medium">Drop-off: {selectedRecord.destinationAddress || 'Drop-off Point'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="shrink-0 px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified by GoLife Central Commission Engine</span>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  Close Detail
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

