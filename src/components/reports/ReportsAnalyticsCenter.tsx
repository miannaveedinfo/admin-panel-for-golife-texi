import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  ReportDateFilter,
  ReportDateRange,
  MainReportMetrics
} from '../../types/reports';
import {
  calculateMainReportMetrics,
  calculateCityWiseReport,
  calculateDriverWiseReport,
  generateAnalyticsTrends,
  generateReportAiInsights,
  getHistoricalRuleSnapshots
} from '../../services/reportsAnalyticsService';
import { getTodayStr, getPastDateStr } from '../../utils/dateUtils';
import { MainMetricsGrid } from './MainMetricsGrid';
import { CompactTrendChart } from './CompactTrendChart';
import { CityWiseReportView } from './CityWiseReportView';
import { DriverWiseReportView } from './DriverWiseReportView';
import { FinancialReconciliationView } from './FinancialReconciliationView';
import { HistoricalProtectionView } from './HistoricalProtectionView';
import { AiInsightsSection } from './AiInsightsSection';
import { ReportExportModal } from './ReportExportModal';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Car,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { AdminTab } from '../../types';

interface ReportsAnalyticsCenterProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export const ReportsAnalyticsCenter: React.FC<ReportsAnalyticsCenterProps> = ({
  onNavigateTab
}) => {
  const {
    rides = [],
    drivers = [],
    passengers = [],
    driverFines = [],
    passengerRefunds = [],
    driverReimbursements = [],
    financialAdjustments = [],
    driverPayouts = [],
    driverDailySummaries = [],
    commissionRules = [],
    driverOverrides = [],
    latePickupIncidents = [],
    driverSuspensions = [],
    complaints = [],
    openUniversalDetail,
    selectedCityFilter,
    setSelectedCityFilter,
    showToast
  } = useAdmin();

  // Primary Date Filter
  const [timeframe, setTimeframe] = useState<ReportDateFilter>('weekly');
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<string>(getTodayStr());
  const [customRange, setCustomRange] = useState<ReportDateRange>(() => ({
    startDate: getPastDateStr(7),
    endDate: getTodayStr()
  }));

  // Selected city
  const [selectedCity, setSelectedCity] = useState<string>(
    selectedCityFilter && selectedCityFilter !== 'All' ? selectedCityFilter : 'Lahore'
  );

  // Active view tab within Reports
  const [activeReportTab, setActiveReportTab] = useState<
    'overview' | 'city' | 'driver' | 'financial' | 'historical'
  >('overview');

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Synchronize city filter
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (setSelectedCityFilter) {
      setSelectedCityFilter(city);
    }
  };

  // 1. Calculate Main 20 Metrics
  const mainMetrics = useMemo(() => {
    return calculateMainReportMetrics(
      rides,
      drivers,
      passengers,
      driverFines,
      passengerRefunds,
      driverReimbursements,
      financialAdjustments,
      driverPayouts,
      timeframe,
      selectedCity,
      driverDailySummaries,
      commissionRules,
      driverOverrides,
      customRange,
      selectedSpecificDate
    );
  }, [
    rides,
    drivers,
    passengers,
    driverFines,
    passengerRefunds,
    driverReimbursements,
    financialAdjustments,
    driverPayouts,
    timeframe,
    selectedCity,
    driverDailySummaries,
    commissionRules,
    driverOverrides,
    customRange,
    selectedSpecificDate
  ]);

  // 2. City-wise Report
  const cityReports = useMemo(() => {
    return calculateCityWiseReport(
      rides,
      drivers,
      passengers,
      driverFines,
      passengerRefunds,
      driverPayouts,
      timeframe,
      customRange,
      selectedSpecificDate
    );
  }, [rides, drivers, passengers, driverFines, passengerRefunds, driverPayouts, timeframe, customRange, selectedSpecificDate]);

  // 3. Driver-wise Report (15 fields)
  const driverReports = useMemo(() => {
    return calculateDriverWiseReport(
      drivers,
      rides,
      driverFines,
      passengerRefunds,
      driverReimbursements,
      driverPayouts,
      latePickupIncidents,
      driverSuspensions,
      complaints,
      timeframe,
      selectedCity === 'All' ? 'All' : selectedCity,
      customRange,
      selectedSpecificDate
    );
  }, [
    drivers,
    rides,
    driverFines,
    passengerRefunds,
    driverReimbursements,
    driverPayouts,
    latePickupIncidents,
    driverSuspensions,
    complaints,
    timeframe,
    selectedCity,
    customRange,
    selectedSpecificDate
  ]);

  // 4. Analytics Trend Data (8 series)
  const trendData = useMemo(() => {
    return generateAnalyticsTrends(
      timeframe,
      rides,
      driverFines,
      passengerRefunds,
      driverPayouts,
      customRange
    );
  }, [timeframe, rides, driverFines, passengerRefunds, driverPayouts, customRange]);

  // 5. AI Insights
  const aiInsights = useMemo(() => {
    return generateReportAiInsights(mainMetrics, cityReports, driverReports);
  }, [mainMetrics, cityReports, driverReports]);

  // 6. Historical Protection Records
  const historicalRecords = useMemo(() => {
    return getHistoricalRuleSnapshots(rides);
  }, [rides]);

  // Clickable metric handler
  const handleMetricClick = (key: keyof MainReportMetrics) => {
    switch (key) {
      case 'totalDrivers':
      case 'onlineDrivers':
      case 'newDrivers':
        if (onNavigateTab) onNavigateTab('drivers');
        break;
      case 'totalPassengers':
      case 'newPassengers':
        if (onNavigateTab) onNavigateTab('passengers');
        break;
      case 'totalRides':
      case 'completedRides':
      case 'activeRides':
        if (onNavigateTab) onNavigateTab('rides');
        break;
      case 'cancelledRides':
        if (onNavigateTab) onNavigateTab('rides');
        showToast('Filtering to Cancelled Rides for audit', 'info');
        break;
      case 'fines':
      case 'refunds':
      case 'reimbursements':
      case 'adjustments':
      case 'payouts':
        if (onNavigateTab) onNavigateTab('wallets');
        break;
      case 'grossRevenue':
      case 'driverEarnings':
      case 'platformCommission':
      case 'serviceCharges':
      case 'taxes':
      case 'netPlatformRevenue':
        setActiveReportTab('financial');
        break;
      default:
        break;
    }
  };

  const handleOpenDriverDetail = (driverId: string) => {
    openUniversalDetail('driver', driverId);
  };

  const handleOpenRideDetail = (rideId: string) => {
    openUniversalDetail('ride', rideId);
  };

  const handleInspectCityRides = (cityName: string) => {
    handleCityChange(cityName);
    if (onNavigateTab) onNavigateTab('rides');
  };

  const handleInspectCityDrivers = (cityName: string) => {
    handleCityChange(cityName);
    if (onNavigateTab) onNavigateTab('drivers');
  };

  const allCitiesList = ['All', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];

  return (
    <div className="space-y-4">
      {/* TOP CONTROL BAR: Date Filters, City Dropdown, One Export Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0 border border-amber-500/40">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-950 tracking-tight">
                  Reports &amp; Analytics Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">
                  Phase 44 • 2027 Standard
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Real-time Audited</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Single unified workflow for operational volume, driver accountability, and immutable financial reconciliation
              </p>
            </div>
          </div>

          {/* Action Toolbar: City Selector + Date Filters + Export Action */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* City Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl border border-slate-200 px-2.5 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="bg-transparent font-bold text-slate-800 cursor-pointer focus:outline-hidden text-xs"
              >
                {allCitiesList.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Pakistan Cities' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters: Daily, Weekly, Monthly, Yearly, Custom */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                    timeframe === tf
                      ? 'bg-amber-400 text-slate-950 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* ONE TASK = ONE MAIN OPTION: Export Report Action */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-2xs border border-slate-800 shrink-0"
              title="Export Report (CSV, Excel, PDF)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Daily / Exact Date Picker bar (when timeframe === 'daily') */}
        {timeframe === 'daily' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="font-bold">Exact Date Selection:</span>
              <span className="font-mono text-slate-500 font-medium">({selectedSpecificDate})</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const today = getTodayStr();
                  setSelectedSpecificDate(today);
                  showToast(`Selected Today (${today})`, 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedSpecificDate === getTodayStr()
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const yest = getPastDateStr(1);
                  setSelectedSpecificDate(yest);
                  showToast(`Selected Yesterday (${yest})`, 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedSpecificDate === getPastDateStr(1)
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Yesterday
              </button>
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-[11px] text-slate-500 font-medium">Choose Date:</span>
                <input
                  type="date"
                  value={selectedSpecificDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedSpecificDate(e.target.value);
                      showToast(`Report updated to exact date: ${e.target.value}`, 'success');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Date Range Picker bar (when timeframe === 'custom') */}
        {timeframe === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="font-bold">Custom Date Range:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={customRange.startDate}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={customRange.endDate}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => showToast('Applied custom reporting date range', 'success')}
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-500 transition cursor-pointer border border-amber-500/40"
              >
                Apply Range
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs within Reports Center */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
            { id: 'city', label: 'City-Wise Breakdown', icon: MapPin },
            { id: 'driver', label: 'Driver Ledger (15 Fields)', icon: Users },
            { id: 'financial', label: 'Financial Reconciliation', icon: Wallet },
            { id: 'historical', label: 'Historical Rule Protection', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-2xs border border-amber-500/40'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEWPORT BODY BASED ON ACTIVE SUB-TAB */}
      {activeReportTab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main 20 Metrics Grid */}
          <MainMetricsGrid metrics={mainMetrics} onMetricClick={handleMetricClick} />

          {/* Compact 8-Stream Trend Chart */}
          <CompactTrendChart data={trendData} />

          {/* Contextual AI Insights (Advisory only) */}
          <AiInsightsSection
            insights={aiInsights}
            onNavigateTab={onNavigateTab}
            onOpenDriverDetail={handleOpenDriverDetail}
          />
        </div>
      )}

      {activeReportTab === 'city' && (
        <div className="animate-fade-in">
          <CityWiseReportView
            cityReports={cityReports}
            selectedCity={selectedCity}
            onSelectCity={handleCityChange}
            onInspectCityRides={handleInspectCityRides}
            onInspectCityDrivers={handleInspectCityDrivers}
          />
        </div>
      )}

      {activeReportTab === 'driver' && (
        <div className="animate-fade-in">
          <DriverWiseReportView
            driverReports={driverReports}
            onOpenDriverDetail={handleOpenDriverDetail}
          />
        </div>
      )}

      {activeReportTab === 'financial' && (
        <div className="animate-fade-in">
          <FinancialReconciliationView
            metrics={mainMetrics}
            onNavigateTab={onNavigateTab || (() => {})}
          />
        </div>
      )}

      {activeReportTab === 'historical' && (
        <div className="animate-fade-in">
          <HistoricalProtectionView
            records={historicalRecords}
            onOpenRideDetail={handleOpenRideDetail}
            onOpenDriverDetail={handleOpenDriverDetail}
          />
        </div>
      )}

      {/* Export Report Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        metrics={mainMetrics}
        cityReports={cityReports}
        driverReports={driverReports}
        timeframe={timeframe}
        selectedCity={selectedCity}
      />
    </div>
  );
};
