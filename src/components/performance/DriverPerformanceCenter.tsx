import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Car,
  Star,
  CheckCircle2,
  XCircle,
  History,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  FileText,
  DollarSign,
  UserCheck,
  HelpCircle,
  ArrowUpDown,
  Sparkles,
  MapPin,
  RefreshCw,
  Phone,
  BarChart3,
  Sliders
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  Driver,
  PerformancePeriodFilter,
  DriverPerformanceAggregate,
  DriverLateDropoffIncident,
  DriverCancellationRecord,
  DriverRiskLevel,
  PerformanceLevel
} from '../../types';
import {
  calculateDetailedPerformanceScore,
  evaluateDriverRiskProfile,
  buildDriverPerformanceTimeline,
  calculateCityPerformanceSummaries,
  INITIAL_DEMO_LATE_DROPOFFS,
  INITIAL_DEMO_CANCELLATIONS,
  FAIR_LATE_DROPOFF_EXCLUSIONS,
  FAIR_LATE_PICKUP_EXCLUSIONS
} from '../../services/driverPerformanceService';
import { PerformanceScoreBreakdownModal } from './PerformanceScoreBreakdownModal';
import { DriverPerformanceTimelineModal } from './DriverPerformanceTimelineModal';
import { DriverControlModal } from '../DriverControlModal';
import { DriverProfileDrawer } from '../DriverProfileDrawer';

export const DriverPerformanceCenter: React.FC = () => {
  const {
    drivers = [],
    rides = [],
    complaints = [],
    safetyIncidents = [],
    latePickupIncidents = [],
    driverSuspensions = [],
    driverWarnings = [],
    driverFines: contextDriverFines = [],
    dataSource,
    selectedCityFilter,
    setSelectedCityFilter,
    showToast
  } = useAdmin();

  // Period Filter State
  const [periodFilter, setPeriodFilter] = useState<PerformancePeriodFilter>('last_30_days');
  const [selectedSubTab, setSelectedSubTab] = useState<
    'overview' | 'late_monitor' | 'cancellations_complaints' | 'risk_indicators' | 'city_benchmarks' | 'trends' | 'coaching'
  >('overview');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'rides' | 'late' | 'cancellations'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Late Dropoffs & Cancellations State (isolated by dataSource)
  const [lateDropoffs, setLateDropoffs] = useState<DriverLateDropoffIncident[]>(() =>
    dataSource === 'PRODUCTION' ? [] : INITIAL_DEMO_LATE_DROPOFFS
  );
  const [cancellations, setCancellations] = useState<DriverCancellationRecord[]>(() =>
    dataSource === 'PRODUCTION' ? [] : INITIAL_DEMO_CANCELLATIONS
  );

  React.useEffect(() => {
    setLateDropoffs(dataSource === 'PRODUCTION' ? [] : INITIAL_DEMO_LATE_DROPOFFS);
    setCancellations(dataSource === 'PRODUCTION' ? [] : INITIAL_DEMO_CANCELLATIONS);
  }, [dataSource]);

  // Late Monitor specific filters
  const [lateMonitorFilter, setLateMonitorFilter] = useState<'all' | 'qualifying' | 'excluded'>('all');

  // Selected Driver for Modals / Control
  const [selectedDriverForBreakdown, setSelectedDriverForBreakdown] = useState<DriverPerformanceAggregate | null>(null);
  const [selectedDriverForTimeline, setSelectedDriverForTimeline] = useState<DriverPerformanceAggregate | null>(null);
  const [selectedDriverForControl, setSelectedDriverForControl] = useState<Driver | null>(null);
  const [controlInitialTab, setControlInitialTab] = useState<'actions' | 'suspension' | 'reinstatement' | 'warning' | 'fine' | 'history'>('actions');
  const [selectedDriverForProfile, setSelectedDriverForProfile] = useState<Driver | null>(null);

  // Derive driver fines list from context driverFines
  const driverFines = useMemo(() => {
    return (contextDriverFines || []).map((f) => ({
      id: f.id,
      driverId: f.driverId,
      driverName: f.driverName,
      amount: f.amount,
      code: f.fineCode || f.id,
      reason: f.reasonLabel || f.note || 'Policy violation',
      status: (f.status === 'paid' || f.status === 'deducted' ? 'deducted' : f.status === 'waived' ? 'waived' : 'pending') as 'deducted' | 'pending' | 'waived',
      issuedAt: f.createdAt,
      rideId: f.rideId || 'N/A'
    }));
  }, [contextDriverFines]);

  // Compute Aggregates for All Drivers
  const driverAggregates: DriverPerformanceAggregate[] = useMemo(() => {
    return drivers.map((driver) => {
      const driverRides = rides.filter((r) => r.driverId === driver.id);
      const totalRides = Math.max(1, driverRides.length > 0 ? driverRides.length : driver.totalRides || 0);
      const completedRides = driverRides.filter((r) => r.status === 'completed').length;
      const cancelledRides = driverRides.filter((r) => r.status === 'cancelled').length;

      const completionRate = totalRides > 0 ? Math.round((completedRides / totalRides) * 100) : 95;
      const cancellationRate = totalRides > 0 ? Math.round((cancelledRides / totalRides) * 100) : 4;

      const driverLatePickups = latePickupIncidents.filter((lp) => lp.driverId === driver.id && lp.isQualifying);
      const driverLateDropoffs = lateDropoffs.filter((ld) => ld.driverId === driver.id && ld.isQualifyingViolation);

      const driverComplaintsList = complaints.filter(
        (c) =>
          c.targetName?.toLowerCase() === driver.name.toLowerCase() ||
          c.targetPhone === driver.phone ||
          (driver.vehicle?.plate && c.description?.toLowerCase().includes(driver.vehicle.plate.toLowerCase()))
      );

      const driverSafetyList = safetyIncidents.filter(
        (s) =>
          s.driverName?.toLowerCase() === driver.name.toLowerCase() ||
          (driver.vehicle?.plate && s.vehiclePlate?.toLowerCase().includes(driver.vehicle.plate.toLowerCase()))
      );

      const driverFinesList = driverFines.filter((f) => f.driverId === driver.id);
      const finesTotalAmount = driverFinesList.reduce((acc, f) => acc + f.amount, 0);

      // Detailed score calculation
      const scoreResult = calculateDetailedPerformanceScore(
        driver,
        rides,
        complaints,
        safetyIncidents,
        latePickupIncidents,
        lateDropoffs,
        cancellations,
        driverFines
      );

      // Risk Evaluation
      const riskProfile = evaluateDriverRiskProfile(
        driver,
        scoreResult.overallScore,
        driverLatePickups.length,
        driverLateDropoffs.length,
        driverComplaintsList.length,
        cancellations.filter((c) => c.driverId === driver.id).length,
        driverSafetyList.length,
        driverFinesList.length
      );

      return {
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverEmail: driver.email,
        driverAvatar: driver.avatar,
        vehicle: driver.vehicle,
        city: driver.city,
        status: driver.status,
        operationalStatus: driver.operationalStatus,
        verificationStatus: driver.verificationStatus,
        accountStatus: driver.accountStatus,
        currentRideCode: driver.activeRideCode,
        currentRideId: driver.activeRideId,
        rating: driver.rating || 4.8,
        totalRides,
        completedRides,
        cancelledRides,
        acceptanceRate: driver.acceptanceRate || 92,
        completionRate,
        cancellationRate,
        latePickupCount: driverLatePickups.length,
        lateDropoffCount: driverLateDropoffs.length,
        complaintsCount: driverComplaintsList.length,
        safetyIncidentsCount: driverSafetyList.length,
        finesCount: driverFinesList.length,
        finesTotalAmount,
        activeSuspension: driver.activeSuspension,
        earningsPKR: driver.earnings || 125000,
        walletBalancePKR: driver.walletBalance || 2500,
        performanceScore: scoreResult.overallScore,
        performanceLevel: scoreResult.performanceLevel,
        trend: scoreResult.trend,
        riskLevel: riskProfile.riskLevel,
        riskReasons: riskProfile.riskReasons,
        coachingRecommendations: riskProfile.coachingRecommendations,
        factors: scoreResult.factors
      };
    });
  }, [drivers, rides, complaints, safetyIncidents, latePickupIncidents, lateDropoffs, cancellations, driverFines]);

  // Filtered Driver Aggregates
  const filteredAggregates = useMemo(() => {
    return driverAggregates
      .filter((agg) => {
        // Global City Filter
        if (selectedCityFilter !== 'All' && agg.city.toLowerCase() !== selectedCityFilter.toLowerCase()) {
          return false;
        }
        // Risk Filter
        if (riskFilter !== 'all' && agg.riskLevel.toLowerCase() !== riskFilter.toLowerCase()) {
          return false;
        }
        // Status Filter
        if (statusFilter === 'suspended' && agg.accountStatus !== 'suspended') {
          return false;
        } else if (statusFilter === 'online' && agg.status !== 'online') {
          return false;
        } else if (statusFilter === 'verified' && agg.verificationStatus !== 'verified') {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            agg.driverName.toLowerCase().includes(q) ||
            agg.driverId.toLowerCase().includes(q) ||
            agg.driverPhone.includes(q) ||
            agg.vehicle.plate.toLowerCase().includes(q) ||
            agg.city.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'score') diff = a.performanceScore - b.performanceScore;
        else if (sortBy === 'rating') diff = a.rating - b.rating;
        else if (sortBy === 'rides') diff = a.totalRides - b.totalRides;
        else if (sortBy === 'late') diff = a.latePickupCount - b.latePickupCount;
        else if (sortBy === 'cancellations') diff = a.cancellationRate - b.cancellationRate;

        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [driverAggregates, selectedCityFilter, riskFilter, statusFilter, searchQuery, sortBy, sortOrder]);

  // City Summaries
  const citySummaries = useMemo(() => {
    return calculateCityPerformanceSummaries(drivers, driverAggregates);
  }, [drivers, driverAggregates]);

  // Top KPIs
  const kpiStats = useMemo(() => {
    const total = driverAggregates.length || 1;
    const avgScore = Math.round(driverAggregates.reduce((acc, d) => acc + d.performanceScore, 0) / total);
    const criticalRiskCount = driverAggregates.filter((d) => d.riskLevel === 'Critical').length;
    const highRiskCount = driverAggregates.filter((d) => d.riskLevel === 'High').length;
    const suspendedCount = driverAggregates.filter((d) => d.accountStatus === 'suspended').length;
    const totalLatePickups = driverAggregates.reduce((acc, d) => acc + d.latePickupCount, 0);
    const avgCancelRate = (driverAggregates.reduce((acc, d) => acc + d.cancellationRate, 0) / total).toFixed(1);
    const totalComplaints = driverAggregates.reduce((acc, d) => acc + d.complaintsCount, 0);
    const totalSafety = driverAggregates.reduce((acc, d) => acc + d.safetyIncidentsCount, 0);

    return {
      avgScore,
      atRiskCount: criticalRiskCount + highRiskCount,
      criticalRiskCount,
      highRiskCount,
      suspendedCount,
      totalLatePickups,
      avgCancelRate,
      totalComplaints,
      totalSafety
    };
  }, [driverAggregates]);

  // Toggle Late Dropoff Exclusion Reason
  const handleToggleDropoffExclusion = (incidentId: string, exclusionReason?: string) => {
    setLateDropoffs((prev) =>
      prev.map((ld) => {
        if (ld.id !== incidentId) return ld;
        const newQualifying = !ld.isQualifyingViolation;
        return {
          ...ld,
          isQualifyingViolation: newQualifying,
          exclusionReason: newQualifying ? undefined : (exclusionReason || 'Passenger requested detour')
        };
      })
    );
    showToast('Drop-off delay exclusion updated', 'success');
  };

  const openDriverControl = (driverId: string, initialTab: any = 'actions') => {
    const target = drivers.find((d) => d.id === driverId);
    if (target) {
      setSelectedDriverForControl(target);
      setControlInitialTab(initialTab);
    }
  };

  const openDriverProfile = (driverId: string) => {
    const target = drivers.find((d) => d.id === driverId);
    if (target) {
      setSelectedDriverForProfile(target);
    }
  };

  const openDriverTimeline = (aggregate: DriverPerformanceAggregate) => {
    setSelectedDriverForTimeline(aggregate);
  };

  const openScoreBreakdown = (aggregate: DriverPerformanceAggregate) => {
    setSelectedDriverForBreakdown(aggregate);
  };

  return (
    <div className="space-y-6">
      
      {/* ===================================================
          1. HEADER & GLOBAL PERIOD / CITY CONTROL STRIP
         =================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Driver Performance, Safety & Risk Center
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
                  PHASE 45
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-factor score tracking (0-100), punctuality monitoring, safety risk indicators & coaching
              </p>
            </div>
          </div>
        </div>

        {/* Period Filter & Benchmark City Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'last_7_days', label: '7 Days' },
                { id: 'last_30_days', label: '30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'previous_month', label: 'Prev Month' },
                { id: 'yearly', label: 'Yearly' }
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  periodFilter === p.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-400">City:</span>
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              aria-label="City Filter"
              className="bg-transparent focus:outline-none font-extrabold text-slate-900 cursor-pointer"
            >
              <option value="All">All Pakistan</option>
              <option value="Karachi">Karachi</option>
              <option value="Lahore">Lahore</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Multan">Multan</option>
              <option value="Quetta">Quetta</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================================================
          2. TOP 5 KPI SUMMARY CARDS
         =================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Card 1: Fleet Score */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Avg Fleet Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{kpiStats.avgScore}</span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 ml-auto flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Good
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Multi-factor 10 criteria evaluation</p>
        </div>

        {/* Card 2: Risk Drivers */}
        <div
          onClick={() => {
            setRiskFilter(riskFilter === 'critical' ? 'all' : 'critical');
            setSelectedSubTab('risk_indicators');
          }}
          className={`p-4 rounded-2xl border shadow-xs transition cursor-pointer ${
            riskFilter === 'critical'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700">At-Risk Drivers</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-600">{kpiStats.atRiskCount}</span>
            <span className="text-xs text-rose-700 font-semibold">
              ({kpiStats.criticalRiskCount} Critical)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{kpiStats.suspendedCount} actively suspended</p>
        </div>

        {/* Card 3: Late Pickups */}
        <div
          onClick={() => setSelectedSubTab('late_monitor')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Late Pickups</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{kpiStats.totalLatePickups}</span>
            <span className="text-xs text-slate-500 font-bold">qualifying</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Excludes road blocks & VIP protocol</p>
        </div>

        {/* Card 4: Cancellations */}
        <div
          onClick={() => setSelectedSubTab('cancellations_complaints')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Cancellation Rate</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{kpiStats.avgCancelRate}%</span>
            <span className="text-xs text-slate-400 font-bold">fleet avg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Post-acceptance driver cancels</p>
        </div>

        {/* Card 5: Complaints & Safety */}
        <div
          onClick={() => setSelectedSubTab('cancellations_complaints')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Complaints / SOS</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {kpiStats.totalComplaints}
            </span>
            <span className="text-xs text-slate-500">/ {kpiStats.totalSafety} SOS</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Customer service investigations</p>
        </div>

      </div>

      {/* ===================================================
          3. SUB-TABS NAVIGATION BAR
         =================================================== */}
      <div className="border-b border-slate-200 bg-white rounded-2xl px-3 flex items-center gap-1 overflow-x-auto shadow-2xs">
        {[
          { id: 'overview', label: 'Driver Performance Table', icon: Award, count: filteredAggregates.length },
          { id: 'late_monitor', label: 'Late Pickup & Drop-off Monitor', icon: Clock, count: latePickupIncidents.length + lateDropoffs.length },
          { id: 'cancellations_complaints', label: 'Cancellations & Complaints', icon: AlertTriangle, count: cancellations.length + complaints.length },
          { id: 'risk_indicators', label: 'Safety Risk Indicators', icon: ShieldAlert, count: kpiStats.atRiskCount },
          { id: 'city_benchmarks', label: 'City Benchmarks', icon: MapPin, count: citySummaries.length },
          { id: 'trends', label: 'Performance Trends', icon: BarChart3 },
          { id: 'coaching', label: 'AI Insights & Coaching', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedSubTab(tab.id as any)}
              className={`py-3.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'border-amber-500 text-slate-950 bg-amber-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================
          4. SUBTAB 1: UNIFIED DRIVER PERFORMANCE TABLE
         =================================================== */}
      {selectedSubTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Table Filters Strip */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by driver name, ID, plate, or phone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              {/* Risk Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Risk:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  aria-label="Risk Filter"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Status Filter"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online / Active</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="verified">KYC Verified Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort Order"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="score">Score (0-100)</option>
                  <option value="rating">Rating</option>
                  <option value="rides">Total Rides</option>
                  <option value="late">Late Pickups</option>
                  <option value="cancellations">Cancellation Rate</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="p-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                  title="Toggle Asc/Desc"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Unified Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Driver & Vehicle</th>
                    <th className="py-3 px-3">City & Status</th>
                    <th className="py-3 px-3">Score & Level</th>
                    <th className="py-3 px-3">Risk Level</th>
                    <th className="py-3 px-3 text-center">Rating</th>
                    <th className="py-3 px-3 text-center">Rides / Comp %</th>
                    <th className="py-3 px-3 text-center">Cancel %</th>
                    <th className="py-3 px-3 text-center">Late (P / D)</th>
                    <th className="py-3 px-3 text-center">Complaints</th>
                    <th className="py-3 px-3 text-center">Fines</th>
                    <th className="py-3 px-3 text-right">Wallet / Earnings</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredAggregates.map((driver) => {
                    const isSuspended = driver.accountStatus === 'suspended';

                    return (
                      <tr
                        key={driver.driverId}
                        className={`hover:bg-slate-50/80 transition ${
                          isSuspended ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* Driver & Vehicle */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => openDriverProfile(driver.driverId)}
                              className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                            >
                              {driver.driverName[0]}
                            </div>
                            <div>
                              <button
                                onClick={() => openDriverProfile(driver.driverId)}
                                className="font-extrabold text-slate-950 hover:text-amber-600 transition text-left block cursor-pointer"
                              >
                                {driver.driverName}
                              </button>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                                <span className="font-bold text-slate-700">{driver.driverId}</span>
                                <span>•</span>
                                <span>{driver.vehicle.plate}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {driver.vehicle.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* City & Status */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{driver.city}</div>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span
                              className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                                isSuspended
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : driver.status === 'online'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : driver.status === 'on_trip'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isSuspended ? 'SUSPENDED' : driver.status}
                            </span>
                            {driver.verificationStatus === 'verified' && (
                              <span className="text-[10px] text-emerald-700 font-bold" title="KYC Approved">
                                ✓ KYC
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score & Level */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => openScoreBreakdown(driver)}
                            className="flex items-center gap-2 text-left cursor-pointer group"
                            title="Click for full 10-factor score breakdown"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-mono font-black flex items-center justify-center text-xs shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                              {driver.performanceScore}
                            </div>
                            <div>
                              <div className="text-[11px] font-bold text-slate-900 group-hover:text-amber-600">
                                {driver.performanceLevel}
                              </div>
                              <div className="flex items-center gap-0.5 text-[10px]">
                                {driver.trend === 'improving' ? (
                                  <span className="text-emerald-600 font-bold flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-0.5" /> +Trend
                                  </span>
                                ) : driver.trend === 'declining' ? (
                                  <span className="text-rose-600 font-bold flex items-center">
                                    <TrendingDown className="w-3 h-3 mr-0.5" /> -Declining
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Stable</span>
                                )}
                              </div>
                            </div>
                          </button>
                        </td>

                        {/* Risk Level */}
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider block text-center ${
                              driver.riskLevel === 'Critical'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : driver.riskLevel === 'High'
                                ? 'bg-orange-500 text-white'
                                : driver.riskLevel === 'Medium'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                            title={driver.riskReasons.join(' • ')}
                          >
                            {driver.riskLevel}
                          </span>
                          <span className="text-[10px] text-slate-500 block text-center truncate max-w-[110px] mt-0.5" title={driver.riskReasons[0]}>
                            {driver.riskReasons[0]}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-slate-900">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{driver.rating ? driver.rating.toFixed(2) : '4.80'}</span>
                          </div>
                        </td>

                        {/* Total Rides & Completion % */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-bold text-slate-900">{driver.totalRides}</div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            {driver.completionRate}% comp
                          </div>
                        </td>

                        {/* Cancellation Rate */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold ${
                              driver.cancellationRate > 15
                                ? 'text-rose-600 font-black'
                                : driver.cancellationRate > 8
                                ? 'text-amber-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {driver.cancellationRate}%
                          </span>
                        </td>

                        {/* Late Pickups & Dropoffs */}
                        <td className="py-3 px-3 text-center font-mono">
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className={`px-1.5 py-0.2 rounded font-black text-[11px] ${
                                driver.latePickupCount >= 4
                                  ? 'bg-rose-100 text-rose-800'
                                  : driver.latePickupCount > 0
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'text-slate-400'
                              }`}
                              title={`${driver.latePickupCount} qualifying late pickups`}
                            >
                              P:{driver.latePickupCount}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold text-[11px] ${
                                driver.lateDropoffCount > 0
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'text-slate-400'
                              }`}
                              title={`${driver.lateDropoffCount} late drop-offs`}
                            >
                              D:{driver.lateDropoffCount}
                            </span>
                          </div>
                        </td>

                        {/* Complaints */}
                        <td className="py-3 px-3 text-center">
                          {driver.complaintsCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[11px]">
                              {driver.complaintsCount}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">0</span>
                          )}
                        </td>

                        {/* Fines */}
                        <td className="py-3 px-3 text-center">
                          {driver.finesCount > 0 ? (
                            <div>
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                                {driver.finesCount}
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Rs. {driver.finesTotalAmount}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Wallet / Earnings */}
                        <td className="py-3 px-3 text-right font-mono">
                          <div className="font-bold text-slate-900 text-[11px]">
                            Rs. {driver.walletBalancePKR.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Earned: {Math.round(driver.earningsPKR / 1000)}k
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openDriverTimeline(driver)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="View Full Chronological Timeline"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openScoreBreakdown(driver)}
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition cursor-pointer"
                              title="Score Breakdown (10 Factors)"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDriverControl(driver.driverId, isSuspended ? 'reinstatement' : 'actions')}
                              className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Open Driver Control Panel"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>Control</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>Showing {filteredAggregates.length} of {drivers.length} registered drivers in fleet</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Risk
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Medium
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> High
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-600" /> Critical
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================
          5. SUBTAB 2: LATE PICKUP & LATE DROPOFF MONITOR
         =================================================== */}
      {selectedSubTab === 'late_monitor' && (
        <div className="space-y-4">
          
          {/* Explanation Banner with Fair Exclusion Rule */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  GoLife Fair Late Arrival Compliance Engine
                </h3>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  Only <strong>unjustified driver delays</strong> trigger penalty points or automatic suspension. Delays caused by passenger changes, verifiable severe bottlenecks, or official road blockades are granted <strong>Fair Exclusion</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-200 shrink-0 text-xs">
              <button
                onClick={() => setLateMonitorFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  lateMonitorFilter === 'all' ? 'bg-amber-400 text-slate-950 font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Delays ({latePickupIncidents.length + lateDropoffs.length})
              </button>
              <button
                onClick={() => setLateMonitorFilter('qualifying')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  lateMonitorFilter === 'qualifying' ? 'bg-amber-400 text-slate-950 font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Qualifying Violations
              </button>
              <button
                onClick={() => setLateMonitorFilter('excluded')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  lateMonitorFilter === 'excluded' ? 'bg-amber-400 text-slate-950 font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fair Excluded
              </button>
            </div>
          </div>

          {/* Combined Late Arrivals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Column 1: Late Pickups */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Late Pickup Delays ({latePickupIncidents.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Arrival at Pickup Pin</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {latePickupIncidents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No late pickup incidents recorded</div>
                ) : (
                  latePickupIncidents
                    .filter((lp) => {
                      if (lateMonitorFilter === 'qualifying') return lp.isQualifying;
                      if (lateMonitorFilter === 'excluded') return !lp.isQualifying;
                      return true;
                    })
                    .map((lp) => (
                      <div key={lp.id} className="p-4 hover:bg-slate-50/80 transition">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900">{lp.driverName}</span>
                              <span className="font-mono text-[11px] text-slate-500">{lp.rideCode}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Passenger: <strong className="text-slate-700">{lp.passengerName}</strong>
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-rose-600 text-xs">
                              +{lp.pickupDelayMin} min delay
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{lp.dateTime}</div>
                          </div>
                        </div>

                        {/* Status Badge & Exclusion */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                          {lp.isQualifying ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                              Qualifying Violation
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Excluded: {lp.exclusionReason || 'Passenger delay'}
                            </span>
                          )}

                          <button
                            onClick={() => openDriverControl(lp.driverId, 'actions')}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                          >
                            Inspect Driver
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Column 2: Late Drop-offs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Late Drop-off Delays ({lateDropoffs.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Route Deviation & Detours</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {lateDropoffs
                  .filter((ld) => {
                    if (lateMonitorFilter === 'qualifying') return ld.isQualifyingViolation;
                    if (lateMonitorFilter === 'excluded') return !ld.isQualifyingViolation;
                    return true;
                  })
                  .map((ld) => (
                    <div key={ld.id} className="p-4 hover:bg-slate-50/80 transition">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{ld.driverName}</span>
                            <span className="font-mono text-[11px] text-slate-500">{ld.rideCode}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {ld.city}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Route: {ld.routeInfo}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-orange-600 text-xs">
                            +{ld.delayMinutes} min delay
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Exp: {ld.expectedArrivalTime} • Act: {ld.actualArrivalTime}
                          </div>
                        </div>
                      </div>

                      {ld.adminNotes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                          <strong>Note:</strong> {ld.adminNotes}
                        </p>
                      )}

                      {/* Status & Toggle Exclusion */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                        {ld.isQualifyingViolation ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                            Qualifying Violation
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Fair Excluded: {ld.exclusionReason}
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleDropoffExclusion(ld.id)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition cursor-pointer"
                          >
                            {ld.isQualifyingViolation ? 'Mark Fair Excluded' : 'Revoke Exclusion'}
                          </button>
                          <button
                            onClick={() => openDriverControl(ld.driverId, 'actions')}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                          >
                            Control
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          6. SUBTAB 3: CANCELLATIONS & COMPLAINTS MONITOR
         =================================================== */}
      {selectedSubTab === 'cancellations_complaints' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Cancellations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Driver-Initiated Cancellations ({cancellations.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Post-Acceptance Drops</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {cancellations.map((cn) => (
                  <div key={cn.id} className="p-4 hover:bg-slate-50/80 transition">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{cn.driverName}</span>
                          <span className="font-mono text-[11px] text-slate-500">{cn.rideCode}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {cn.city}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Passenger: <strong>{cn.passengerName}</strong>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            cn.isPolicyViolation
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cn.isPolicyViolation ? 'Policy Violation' : 'Excused Reason'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cn.dateTime}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 mt-2">
                      <span className="font-bold text-slate-900">Reason:</span> {cn.cancellationReason}
                      {cn.adminNotes && (
                        <div className="mt-1 text-[11px] text-slate-500 border-t border-slate-200 pt-1">
                          <strong>Admin Note:</strong> {cn.adminNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        Fine Status: {cn.fineApplied ? <strong className="text-rose-600">Fine Levied</strong> : 'No Fine'}
                      </span>
                      <button
                        onClick={() => openDriverControl(cn.driverId, 'fine')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                      >
                        Manage Fine / Control
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Passenger Complaints ({complaints.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Customer Service Desk</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {complaints.map((cmp) => (
                  <div key={cmp.id} className="p-4 hover:bg-slate-50/80 transition">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{cmp.subject}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600">
                            {cmp.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Target: <strong className="text-slate-800">{cmp.targetName}</strong> • Complainant:{' '}
                          {cmp.userName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            cmp.status === 'open'
                              ? 'bg-rose-100 text-rose-800'
                              : cmp.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {cmp.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cmp.createdAt}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                      {cmp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          7. SUBTAB 4: SAFETY RISK INDICATORS & ROOT CAUSES
         =================================================== */}
      {selectedSubTab === 'risk_indicators' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverAggregates
              .filter((d) => d.riskLevel === 'Critical' || d.riskLevel === 'High' || d.riskLevel === 'Medium')
              .sort((a, b) => {
                const priority: Record<DriverRiskLevel, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
                return priority[b.riskLevel] - priority[a.riskLevel];
              })
              .map((driver) => {
                const isCrit = driver.riskLevel === 'Critical';
                const isHigh = driver.riskLevel === 'High';

                return (
                  <div
                    key={driver.driverId}
                    className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition ${
                      isCrit
                        ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                        : isHigh
                        ? 'bg-orange-50/40 border-orange-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => openDriverProfile(driver.driverId)}
                            className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm cursor-pointer shadow-2xs shrink-0"
                          >
                            {driver.driverName[0]}
                          </div>
                          <div>
                            <h3
                              onClick={() => openDriverProfile(driver.driverId)}
                              className="font-extrabold text-sm text-slate-950 hover:text-amber-600 cursor-pointer"
                            >
                              {driver.driverName}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {driver.driverId} • {driver.city} • {driver.vehicle.plate}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            isCrit
                              ? 'bg-rose-600 text-white'
                              : isHigh
                              ? 'bg-orange-500 text-white'
                              : 'bg-amber-400 text-slate-950'
                          }`}
                        >
                          {driver.riskLevel} Risk
                        </span>
                      </div>

                      {/* Score Strip */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs mb-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Score</span>
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {driver.performanceScore} / 100
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Rating</span>
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {driver.rating ? driver.rating.toFixed(2) : '4.80'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Late / Drops</span>
                          <span className="font-mono font-bold text-slate-900">
                            P:{driver.latePickupCount} D:{driver.lateDropoffCount}
                          </span>
                        </div>
                      </div>

                      {/* Transparent "WHY" Explanations */}
                      <div className="space-y-1.5 mb-4">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                          Root Cause / Risk Drivers:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {driver.riskReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold shrink-0">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openDriverTimeline(driver)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" /> Timeline
                      </button>

                      <button
                        onClick={() => openDriverControl(driver.driverId, driver.accountStatus === 'suspended' ? 'reinstatement' : 'suspension')}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Control Driver
                      </button>
                    </div>

                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ===================================================
          8. SUBTAB 5: CITY PERFORMANCE BENCHMARKS
         =================================================== */}
      {selectedSubTab === 'city_benchmarks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Pakistan Regional Fleet Performance Benchmarks
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparative performance benchmarks across 8 operational metropolitan territories
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-3 text-center">Active Drivers</th>
                    <th className="py-3 px-3 text-center">Avg Rating</th>
                    <th className="py-3 px-3 text-center">Benchmark Score</th>
                    <th className="py-3 px-3 text-center">Late Pickup %</th>
                    <th className="py-3 px-3 text-center">Late Dropoff %</th>
                    <th className="py-3 px-3 text-center">Cancel Rate</th>
                    <th className="py-3 px-3 text-center">Complaint %</th>
                    <th className="py-3 px-3 text-center">SOS Alerts</th>
                    <th className="py-3 px-3 text-center">Suspended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {citySummaries.map((c) => (
                    <tr key={c.city} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.city}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-900">{c.driverCount}</span>
                        <span className="text-[10px] text-emerald-600 block">({c.onlineDrivers} on road)</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {c.avgRating}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded-md ${
                            c.avgPerformanceScore >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.avgPerformanceScore >= 70
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.avgPerformanceScore} / 100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{c.latePickupRate}%</td>
                      <td className="py-3 px-3 text-center font-mono">{c.lateDropoffRate}%</td>
                      <td className="py-3 px-3 text-center font-mono">{c.cancellationRate}%</td>
                      <td className="py-3 px-3 text-center font-mono">{c.complaintRate}%</td>
                      <td className="py-3 px-3 text-center">
                        {c.safetyIncidents > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                            {c.safetyIncidents}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {c.suspensionsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px]">
                            {c.suspensionsCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          9. SUBTAB 6: PERFORMANCE TRENDS & FLEET ANALYTICS
         =================================================== */}
      {selectedSubTab === 'trends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Metric Chart 1: Average Fleet Score Trend */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Score Stability & Quality Trend (Last 7 Days)
                  </h3>
                  <p className="text-xs text-slate-500">Fleet composite score benchmark</p>
                </div>
                <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  +3.2% vs Prev Week
                </span>
              </div>

              {/* Visual Bars */}
              <div className="h-40 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
                {[
                  { day: 'Mon', val: 81 },
                  { day: 'Tue', val: 83 },
                  { day: 'Wed', val: 82 },
                  { day: 'Thu', val: 84 },
                  { day: 'Fri', val: 86 },
                  { day: 'Sat', val: 85 },
                  { day: 'Sun', val: 88 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-slate-700">{item.val}</span>
                    <div
                      className="w-full bg-amber-400 hover:bg-amber-500 transition rounded-t-md"
                      style={{ height: `${(item.val / 100) * 100}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metric Chart 2: Punctuality & Cancellation Drops */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Late Pickup Incidence vs Dispatch Volume
                  </h3>
                  <p className="text-xs text-slate-500">Qualifying arrival delays</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  Goal: &lt; 4.0%
                </span>
              </div>

              {/* Visual Bars */}
              <div className="h-40 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
                {[
                  { day: 'Mon', val: 5.4 },
                  { day: 'Tue', val: 4.8 },
                  { day: 'Wed', val: 4.2 },
                  { day: 'Thu', val: 3.9 },
                  { day: 'Fri', val: 4.5 },
                  { day: 'Sat', val: 3.8 },
                  { day: 'Sun', val: 3.2 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-rose-600">{item.val}%</span>
                    <div
                      className="w-full bg-rose-400 hover:bg-rose-500 transition rounded-t-md"
                      style={{ height: `${(item.val / 8) * 100}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          10. SUBTAB 7: AI INSIGHTS & DRIVER COACHING
         =================================================== */}
      {selectedSubTab === 'coaching' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  AI-Powered Driver Performance Coaching Engine
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  GoLife AI analyzes multi-trip telemetry, customer ratings, cancellation spikes, and pickup delay clusters to generate actionable human coaching suggestions for fleet supervisors without automated silent penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Coaching Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driverAggregates
              .filter((d) => d.coachingRecommendations && d.coachingRecommendations.length > 0)
              .map((driver) => (
                <div key={driver.driverId} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                        {driver.driverName[0]}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-950">{driver.driverName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {driver.driverId} • {driver.city} • Score: {driver.performanceScore}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openDriverControl(driver.driverId, 'warning')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      Issue Advice
                    </button>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Targeted Coaching Interventions:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {driver.coachingRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ===================================================
          11. MODALS & CONNECTED DRAWERS
         =================================================== */}

      {/* Score Breakdown Modal */}
      {selectedDriverForBreakdown && (
        <PerformanceScoreBreakdownModal
          driver={selectedDriverForBreakdown}
          onClose={() => setSelectedDriverForBreakdown(null)}
          onOpenControl={() => {
            const d = selectedDriverForBreakdown;
            setSelectedDriverForBreakdown(null);
            openDriverControl(d.driverId, 'actions');
          }}
        />
      )}

      {/* Full Chronological Timeline Modal */}
      {selectedDriverForTimeline && (
        <DriverPerformanceTimelineModal
          driverId={selectedDriverForTimeline.driverId}
          driverName={selectedDriverForTimeline.driverName}
          events={buildDriverPerformanceTimeline(
            selectedDriverForTimeline.driverId,
            rides,
            complaints,
            safetyIncidents,
            latePickupIncidents,
            lateDropoffs,
            cancellations,
            driverFines,
            driverSuspensions
          )}
          onClose={() => setSelectedDriverForTimeline(null)}
          onOpenControl={() => {
            const d = selectedDriverForTimeline;
            setSelectedDriverForTimeline(null);
            openDriverControl(d.driverId, 'actions');
          }}
        />
      )}

      {/* Driver Control Modal (Central System) */}
      {selectedDriverForControl && (
        <DriverControlModal
          driver={selectedDriverForControl}
          onClose={() => setSelectedDriverForControl(null)}
          initialTab={controlInitialTab}
        />
      )}

      {/* Driver Profile Drawer */}
      {selectedDriverForProfile && (
        <DriverProfileDrawer
          driver={selectedDriverForProfile}
          onClose={() => setSelectedDriverForProfile(null)}
        />
      )}

    </div>
  );
};
