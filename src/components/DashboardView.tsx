import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { TRANSLATIONS, formatPKR } from '../utils/i18n';
import { Driver } from '../types';
import { calculateGlobalFinancials, getUnifiedCommissionRecords } from '../services/commissionService';
import { CommissionDetailCenterModal } from './financial/CommissionDetailCenterModal';
import { DriverEarningsDetailCenterModal } from './financial/DriverEarningsDetailCenterModal';
import { DriverControlModal } from './DriverControlModal';
import { DashboardCalendarPicker } from './common/DashboardCalendarPicker';
import {
  formatDateDisplay,
  formatDateRangeDisplay,
  getTodayStr,
  isDateToday,
  parseDateToYYYYMMDD,
  getDateRangeForTimeframe,
  addDaysToDateStr
} from '../utils/dateUtils';
import {
  Users,
  Car,
  UserCheck,
  Radio,
  AlertTriangle,
  Wallet,
  Clock,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  RotateCw,
  MapPin,
  CheckCircle2,
  Calendar,
  Activity,
  Sliders,
  DollarSign,
  Eye,
  RotateCcw
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    passengers = [],
    drivers = [],
    rides = [],
    verifications = [],
    payouts = [],
    complaints = [],
    safetyIncidents = [],
    latePickupIncidents = [],
    driverSuspensions = [],
    driverDailySummaries = [],
    driverFines = [],
    passengerRefunds = [],
    driverReimbursements = [],
    financialAdjustments = [],
    driverPayouts = [],
    commissionRules = [],
    driverOverrides = [],
    driverWallets = [],
    cities = [],
    selectedCityFilter = 'All',
    setSelectedCityFilter,
    openUniversalDetail,
    showToast,
    setActiveTab,
    setOperationsInitialFilter,
    language,
    dashboardDateFilter,
    updateDashboardDateFilter,
    resetDashboardDateToToday
  } = useAdmin();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const [selectedDriverForControl, setSelectedDriverForControl] = useState<Driver | null>(null);
  const [isCommissionDetailOpen, setIsCommissionDetailOpen] = useState(false);
  const [isEarningsDetailOpen, setIsEarningsDetailOpen] = useState(false);

  const t = TRANSLATIONS[language];

  const selectedDateStr = dashboardDateFilter.selectedDate;

  // Authoritative date range for current dashboard filter
  const { startDate: filterStartDate, endDate: filterEndDate } = useMemo(() => {
    return getDateRangeForTimeframe(
      dashboardDateFilter.mode,
      dashboardDateFilter.selectedDate,
      dashboardDateFilter.endDate,
      dashboardDateFilter.selectedYear,
      dashboardDateFilter.selectedMonth
    );
  }, [dashboardDateFilter]);

  const isViewingToday =
    dashboardDateFilter.mode === 'today' &&
    isDateToday(filterStartDate);

  // Handle single refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 450);
  };

  // City-filtered lists
  const filteredRides = useMemo(() => {
    return selectedCityFilter === 'All'
      ? (rides || [])
      : (rides || []).filter((r) => (r.city || '').toLowerCase() === selectedCityFilter.toLowerCase());
  }, [rides, selectedCityFilter]);

  const filteredDrivers = useMemo(() => {
    return selectedCityFilter === 'All'
      ? (drivers || [])
      : (drivers || []).filter((d) => (d.city || '').toLowerCase() === selectedCityFilter.toLowerCase());
  }, [drivers, selectedCityFilter]);

  const filteredWallets = useMemo(() => {
    return selectedCityFilter === 'All'
      ? (driverWallets || [])
      : (driverWallets || []).filter((w) => (w.driverCity || '').toLowerCase() === selectedCityFilter.toLowerCase());
  }, [driverWallets, selectedCityFilter]);

  // Central Authoritative Financial Engine Calculation
  const globalFinancials = useMemo(() => {
    return calculateGlobalFinancials({
      rides,
      rules: commissionRules,
      overrides: driverOverrides,
      driverDailySummaries,
      driverFines,
      passengerRefunds,
      driverReimbursements,
      financialAdjustments,
      driverPayouts,
      timeframe: dashboardDateFilter.mode,
      selectedDate: dashboardDateFilter.selectedDate,
      endDate: dashboardDateFilter.endDate,
      selectedCity: selectedCityFilter,
      selectedYear: dashboardDateFilter.selectedYear,
      selectedMonth: dashboardDateFilter.selectedMonth
    });
  }, [
    rides,
    commissionRules,
    driverOverrides,
    driverDailySummaries,
    driverFines,
    passengerRefunds,
    driverReimbursements,
    financialAdjustments,
    driverPayouts,
    dashboardDateFilter,
    selectedCityFilter
  ]);

  // Unified commission records query for accurate chart and transaction telemetry
  const unifiedRecords = useMemo(() => {
    return getUnifiedCommissionRecords({
      rides,
      driverDailySummaries,
      rules: commissionRules,
      overrides: driverOverrides,
      timeframe: dashboardDateFilter.mode,
      selectedDate: dashboardDateFilter.selectedDate,
      endDate: dashboardDateFilter.endDate,
      selectedCity: selectedCityFilter,
      selectedYear: dashboardDateFilter.selectedYear,
      selectedMonth: dashboardDateFilter.selectedMonth
    });
  }, [
    rides,
    driverDailySummaries,
    commissionRules,
    driverOverrides,
    dashboardDateFilter,
    selectedCityFilter
  ]);

  // Summaries matching selected date range and city
  const matchingDateSummaries = useMemo(() => {
    return (driverDailySummaries || []).filter((s) => {
      const cityMatches =
        !selectedCityFilter ||
        selectedCityFilter === 'All' ||
        (s.city || '').toLowerCase() === selectedCityFilter.toLowerCase();
      if (!cityMatches) return false;
      const sDate = parseDateToYYYYMMDD(s.date);
      if (!sDate) return false;
      return sDate >= filterStartDate && sDate <= filterEndDate;
    });
  }, [driverDailySummaries, selectedCityFilter, filterStartDate, filterEndDate]);

  // Rides matching selected date range and city
  const matchingDateRides = useMemo(() => {
    return (rides || []).filter((r) => {
      const cityMatches =
        !selectedCityFilter ||
        selectedCityFilter === 'All' ||
        (r.city || '').toLowerCase() === selectedCityFilter.toLowerCase();
      if (!cityMatches) return false;
      const rideDate = parseDateToYYYYMMDD(r.startTime || r.endTime || r.createdAt || (r as any).date || (r as any).pickupTime || '');
      if (!rideDate) return false;
      return rideDate >= filterStartDate && rideDate <= filterEndDate;
    });
  }, [rides, selectedCityFilter, filterStartDate, filterEndDate]);

  // Core KPI counts adapted to selected historical or today date
  const effectiveCompletedRides = globalFinancials.completedRidesCount;
  const effectiveActiveRides = isViewingToday
    ? filteredRides.filter((r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'searching').length
    : 0;

  const effectiveCancelledRides = isViewingToday
    ? filteredRides.filter((r) => {
        const d = parseDateToYYYYMMDD(r.startTime || r.createdAt || (r as any).date);
        return (!d || d === filterStartDate) && r.status === 'cancelled';
      }).length
    : matchingDateSummaries.reduce((sum, s) => sum + (s.cancelledRides || 0), 0) +
      matchingDateRides.filter((r) => r.status === 'cancelled').length;

  const effectiveTotalRides = isViewingToday
    ? effectiveCompletedRides + effectiveActiveRides + effectiveCancelledRides
    : Math.max(
        matchingDateSummaries.reduce((sum, s) => sum + (s.totalRides || s.completedRides || 0), 0),
        matchingDateRides.length,
        effectiveCompletedRides + effectiveCancelledRides
      );

  const effectiveOnlineDrivers = isViewingToday
    ? filteredDrivers.filter((d) => d.status === 'online' || d.status === 'on_trip').length
    : new Set(
        matchingDateSummaries
          .map((s) => s.driverId)
          .concat(matchingDateRides.map((r) => r.driverId).filter(Boolean) as string[])
      ).size;

  const effectivePendingVerifications = isViewingToday
    ? (verifications || []).filter((v) => v.status === 'pending').length
    : (verifications || []).filter((v) => {
        const d = parseDateToYYYYMMDD(v.createdAt);
        return d && d >= filterStartDate && d <= filterEndDate;
      }).length;

  const effectivePendingComplaints = isViewingToday
    ? (complaints || []).filter((c) => c.status === 'open').length
    : (complaints || []).filter((c) => {
        const d = parseDateToYYYYMMDD(c.createdAt);
        return d && d >= filterStartDate && d <= filterEndDate;
      }).length;

  const totalDriversCount = filteredDrivers.length;
  const period = dashboardDateFilter.mode;
  const totalRidesCount = effectiveTotalRides;
  const onlineDriversCount = effectiveOnlineDrivers;
  const activeRidesCount = effectiveActiveRides;
  const pendingComplaintsCount = effectivePendingComplaints;
  const pendingVerificationsCount = effectivePendingVerifications;

  const hasNoRecordsForDate =
    !isViewingToday &&
    effectiveTotalRides === 0 &&
    effectiveCompletedRides === 0 &&
    globalFinancials.grossFare === 0;

  const todayDriverEarningsTotal = globalFinancials.driverEarnings;
  const todayPlatformCommissionTotal = globalFinancials.platformCommission;
  const platformRevenueTotal = globalFinancials.platformRevenue;

  // Wallet balances from driverWallets state
  const totalWalletBalance = useMemo(() => {
    return filteredWallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  }, [filteredWallets]);

  const totalNegativeDues = useMemo(() => {
    return filteredWallets.reduce((sum, w) => sum + (w.outstandingDeductions || 0), 0);
  }, [filteredWallets]);

  const totalPayableBalance = useMemo(() => {
    return filteredWallets.reduce((sum, w) => sum + (w.payableBalance || 0), 0);
  }, [filteredWallets]);

  const pendingPayoutsCount = useMemo(() => {
    return (driverPayouts || payouts || []).filter((p) => p.status === 'pending').length;
  }, [driverPayouts, payouts]);

  // Display rides for Recent Rides table (live vs archive)
  const displayRides = useMemo(() => {
    if (isViewingToday) {
      return filteredRides.slice(0, 5);
    }
    if (matchingDateRides.length > 0) {
      return matchingDateRides.slice(0, 5);
    }
    if (matchingDateSummaries.length > 0) {
      return matchingDateSummaries.slice(0, 5).map((s, idx) => ({
        id: s.id,
        rideCode: `HIST-${s.date.replace(/-/g, '')}-${idx + 1}`,
        passengerName: 'Trip Passenger',
        driverName: s.driverName,
        category: 'GoRide',
        pickupLocation: { address: `${s.city} Central District` },
        dropoffLocation: { address: `${s.city} Commercial Zone` },
        fare: Math.round(s.grossEarnings / Math.max(1, s.completedRides)),
        status: 'completed' as const,
        date: s.date
      }));
    }
    return [];
  }, [isViewingToday, filteredRides, matchingDateRides, matchingDateSummaries]);

  // Operational attention items
  const attentionItems = useMemo(() => {
    const items: Array<{
      id: string;
      priority: 'Urgent' | 'High' | 'Medium';
      priorityColor: string;
      reason: string;
      related: string;
      actionLabel: string;
      onAction: () => void;
    }> = [];

    // Safety incidents
    (safetyIncidents || [])
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        items.push({
          id: `safety_${s.id}`,
          priority: 'Urgent',
          priorityColor: 'bg-rose-600 text-white',
          reason: `Safety Alert: ${s.title || 'Route divergence / SOS signal'}`,
          related: `Ride #${s.rideId || 'GL-9821'} • ${s.driverName || 'Fleet Driver'}`,
          actionLabel: 'Review Case',
          onAction: () => setActiveTab('safety')
        });
      });

    // Critical complaints
    (complaints || [])
      .filter((c) => c.status === 'open')
      .slice(0, 2)
      .forEach((c) => {
        items.push({
          id: `complaint_${c.id}`,
          priority: c.severity === 'critical' ? 'Urgent' : 'High',
          priorityColor: c.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800',
          reason: `Dispute: ${c.subject}`,
          related: `Passenger: ${c.reporterName} • ${c.city}`,
          actionLabel: 'Review Case',
          onAction: () => {
            if (openUniversalDetail) {
              openUniversalDetail('complaint', c.id);
            } else {
              setActiveTab('safety');
            }
          }
        });
      });

    // Drivers near suspension
    (drivers || [])
      .filter((d) => d.latePickupCount && d.latePickupCount >= 3 && d.accountStatus !== 'suspended')
      .slice(0, 1)
      .forEach((d) => {
        items.push({
          id: `late_thresh_${d.id}`,
          priority: 'High',
          priorityColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          reason: `${d.latePickupCount} late pickups today (Approaching 5-incident lockout)`,
          related: `${d.name} (${d.vehicle.plate}) • ${d.city}`,
          actionLabel: 'Inspect in Live Ops',
          onAction: () => {
            setOperationsInitialFilter({ tab: 'alerts', city: d.city, selectedEntityType: 'driver', selectedEntityId: d.id });
            setActiveTab('live_rides');
          }
        });
      });

    // Verifications pending
    if (pendingVerificationsCount > 0) {
      items.push({
        id: 'verif_alert',
        priority: 'Medium',
        priorityColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        reason: `${pendingVerificationsCount} driver registration documents pending verification`,
        related: 'Driver Onboarding Desk (CNIC & License)',
        actionLabel: 'Review Requests',
        onAction: () => setActiveTab('verification')
      });
    }

    // Pending Payouts awaiting approval
    if (pendingPayoutsCount > 0) {
      items.push({
        id: 'payouts_alert',
        priority: 'Medium',
        priorityColor: 'bg-blue-100 text-blue-900 border border-blue-300',
        reason: `${pendingPayoutsCount} driver withdrawal payout requests waiting disbursal`,
        related: 'Driver Wallet & Settlements',
        actionLabel: 'Disburse Payouts',
        onAction: () => setActiveTab('wallets')
      });
    }

    return items;
  }, [safetyIncidents, complaints, drivers, pendingVerificationsCount, pendingPayoutsCount, setActiveTab, setOperationsInitialFilter, openUniversalDetail]);

  // Dynamic Chart Data based on selected Period and REAL authoritative records
  const chartData = useMemo(() => {
    const periodMode = dashboardDateFilter.mode;

    if (periodMode === 'today' || periodMode === 'yesterday' || periodMode === 'custom_date') {
      const slots = [
        { label: '00-04', startHour: 0, endHour: 4 },
        { label: '04-08', startHour: 4, endHour: 8 },
        { label: '08-12', startHour: 8, endHour: 12 },
        { label: '12-16', startHour: 12, endHour: 16 },
        { label: '16-20', startHour: 16, endHour: 20 },
        { label: '20-24', startHour: 20, endHour: 24 }
      ];

      return slots.map((s) => {
        const slotRecords = unifiedRecords.filter((rec) => {
          let h = 0;
          const timeStr = rec.time || (rec.dateTime ? rec.dateTime.split(' ')[1] : '12:00');
          if (timeStr) {
            h = parseInt(timeStr.split(':')[0], 10) || 0;
          }
          return h >= s.startHour && h < s.endHour;
        });

        const rev = slotRecords.reduce((sum, r) => sum + r.grossFarePKR, 0);
        const comm = slotRecords.reduce((sum, r) => sum + r.finalCommissionPKR, 0);

        return {
          label: s.label,
          rides: slotRecords.length,
          rev,
          comm
        };
      });
    }

    if (periodMode === 'weekly' || periodMode === 'last_week') {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const days: { label: string; dateStr: string }[] = [];
      let cur = filterStartDate || getTodayStr();
      const endLimit = filterEndDate || cur;
      let count = 0;
      while (cur <= endLimit && count < 7) {
        const parts = cur.split('-');
        const y = parseInt(parts[0], 10) || 2026;
        const m = parseInt(parts[1], 10) || 1;
        const d = parseInt(parts[2], 10) || 1;
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        const dayIdx = (dateObj.getUTCDay() + 6) % 7; // Monday = 0
        days.push({ label: dayNames[dayIdx] || `D${count + 1}`, dateStr: cur });
        cur = addDaysToDateStr(cur, 1);
        count++;
      }

      return days.map((d) => {
        const dayRecords = unifiedRecords.filter((rec) => (rec.date || parseDateToYYYYMMDD(rec.dateTime)) === d.dateStr);
        const rev = dayRecords.reduce((sum, r) => sum + r.grossFarePKR, 0);
        const comm = dayRecords.reduce((sum, r) => sum + r.finalCommissionPKR, 0);
        return {
          label: d.label,
          rides: dayRecords.length,
          rev,
          comm
        };
      });
    }

    if (periodMode === 'monthly' || periodMode === 'last_month') {
      const weeks = [
        { label: 'Week 1', startDay: 1, endDay: 7 },
        { label: 'Week 2', startDay: 8, endDay: 14 },
        { label: 'Week 3', startDay: 15, endDay: 21 },
        { label: 'Week 4', startDay: 22, endDay: 31 }
      ];

      return weeks.map((w) => {
        const weekRecords = unifiedRecords.filter((rec) => {
          const recDateStr = rec.date || parseDateToYYYYMMDD(rec.dateTime) || '';
          const parts = recDateStr ? recDateStr.split('-') : [];
          const day = parts[2] ? parseInt(parts[2], 10) || 1 : 1;
          return day >= w.startDay && day <= w.endDay;
        });

        const rev = weekRecords.reduce((sum, r) => sum + r.grossFarePKR, 0);
        const comm = weekRecords.reduce((sum, r) => sum + r.finalCommissionPKR, 0);

        return {
          label: w.label,
          rides: weekRecords.length,
          rev,
          comm
        };
      });
    }

    if (periodMode === 'yearly' || periodMode === 'last_year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((mName, idx) => {
        const mStr = String(idx + 1).padStart(2, '0');
        const monthRecords = unifiedRecords.filter((rec) => {
          const recDateStr = rec.date || parseDateToYYYYMMDD(rec.dateTime) || '';
          return recDateStr.length >= 7 && recDateStr.slice(5, 7) === mStr;
        });
        const rev = monthRecords.reduce((sum, r) => sum + r.grossFarePKR, 0);
        const comm = monthRecords.reduce((sum, r) => sum + r.finalCommissionPKR, 0);

        return {
          label: mName,
          rides: monthRecords.length,
          rev,
          comm
        };
      });
    }

    // custom_range: Group by day if <= 7 days, or equal partitions across range
    const safeStart = filterStartDate || getTodayStr();
    const safeEnd = filterEndDate || safeStart;
    const parts1 = safeStart.split('-');
    const parts2 = safeEnd.split('-');
    const y1 = parseInt(parts1[0], 10) || 2026;
    const m1 = parseInt(parts1[1], 10) || 1;
    const d1 = parseInt(parts1[2], 10) || 1;
    const y2 = parseInt(parts2[0], 10) || 2026;
    const m2 = parseInt(parts2[1], 10) || 1;
    const d2 = parseInt(parts2[2], 10) || 1;
    const diffDays = Math.max(1, Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (86400000)) + 1);

    if (diffDays <= 7) {
      const days: { label: string; dateStr: string }[] = [];
      let cur = safeStart;
      while (cur <= safeEnd) {
        const parts = cur.split('-');
        days.push({ label: `${parts[2] || '01'}/${parts[1] || '01'}`, dateStr: cur });
        cur = addDaysToDateStr(cur, 1);
      }
      return days.map((d) => {
        const dayRecords = unifiedRecords.filter((rec) => (rec.date || parseDateToYYYYMMDD(rec.dateTime)) === d.dateStr);
        return {
          label: d.label,
          rides: dayRecords.length,
          rev: dayRecords.reduce((sum, r) => sum + r.grossFarePKR, 0),
          comm: dayRecords.reduce((sum, r) => sum + r.finalCommissionPKR, 0)
        };
      });
    } else {
      const step = Math.max(1, Math.floor(diffDays / 4));
      const intervals = [
        { label: 'Part 1', start: 0, end: step },
        { label: 'Part 2', start: step, end: step * 2 },
        { label: 'Part 3', start: step * 2, end: step * 3 },
        { label: 'Part 4', start: step * 3, end: diffDays }
      ];
      return intervals.map((inv) => {
        const startStr = addDaysToDateStr(filterStartDate, inv.start);
        const endStr = addDaysToDateStr(filterStartDate, Math.min(diffDays - 1, inv.end - 1));
        const intRecords = unifiedRecords.filter((rec) => rec.date >= startStr && rec.date <= endStr);
        return {
          label: `${startStr.slice(5)} - ${endStr.slice(5)}`,
          rides: intRecords.length,
          rev: intRecords.reduce((sum, r) => sum + r.grossFarePKR, 0),
          comm: intRecords.reduce((sum, r) => sum + r.finalCommissionPKR, 0)
        };
      });
    }
  }, [dashboardDateFilter.mode, filterStartDate, filterEndDate, unifiedRecords]);

  // Top Cities dynamically aggregated from active date scope
  const topCitiesData = useMemo(() => {
    const cityMap: Record<string, { rides: number; fleet: number }> = {};

    cities.forEach((c) => {
      cityMap[c.name] = { rides: 0, fleet: 0 };
    });

    ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'].forEach((cityName) => {
      if (!cityMap[cityName]) {
        cityMap[cityName] = { rides: 0, fleet: 0 };
      }
    });

    if (isViewingToday) {
      filteredRides.forEach((r) => {
        const cityKey = Object.keys(cityMap).find(
          (c) => c.toLowerCase() === (r.city || '').toLowerCase()
        ) || r.city;
        if (cityKey) {
          if (!cityMap[cityKey]) cityMap[cityKey] = { rides: 0, fleet: 0 };
          cityMap[cityKey].rides += 1;
        }
      });

      filteredDrivers.forEach((d) => {
        const cityKey = Object.keys(cityMap).find(
          (c) => c.toLowerCase() === (d.city || '').toLowerCase()
        ) || d.city;
        if (cityKey) {
          if (!cityMap[cityKey]) cityMap[cityKey] = { rides: 0, fleet: 0 };
          cityMap[cityKey].fleet += 1;
        }
      });
    } else {
      // Historical date aggregation
      matchingDateSummaries.forEach((s) => {
        const cityKey = Object.keys(cityMap).find(
          (c) => c.toLowerCase() === (s.city || '').toLowerCase()
        ) || s.city;
        if (cityKey) {
          if (!cityMap[cityKey]) cityMap[cityKey] = { rides: 0, fleet: 0 };
          cityMap[cityKey].rides += s.totalRides || s.completedRides || 0;
          cityMap[cityKey].fleet += 1;
        }
      });

      matchingDateRides.forEach((r) => {
        const cityKey = Object.keys(cityMap).find(
          (c) => c.toLowerCase() === (r.city || '').toLowerCase()
        ) || r.city;
        if (cityKey && !matchingDateSummaries.some((s) => (s.rides || []).some((sr) => sr.rideId === r.id))) {
          if (!cityMap[cityKey]) cityMap[cityKey] = { rides: 0, fleet: 0 };
          cityMap[cityKey].rides += 1;
        }
      });
    }

    const totalRidesAll = Math.max(1, Object.values(cityMap || {}).reduce((sum, d) => sum + d.rides, 0));

    return Object.entries(cityMap || {})
      .map(([name, data]) => ({
        name,
        rides: data.rides,
        fleet: data.fleet,
        sharePct: totalRidesAll > 0 ? Math.round((data.rides / totalRidesAll) * 100) : 0
      }))
      .sort((a, b) => b.rides - a.rides || b.fleet - a.fleet)
      .slice(0, 4);
  }, [cities, isViewingToday, filteredRides, filteredDrivers, matchingDateSummaries, matchingDateRides]);

  // Quick Action Tiles
  const quickActions = [
    {
      id: 'act_verif',
      label: 'Driver Requests',
      count: pendingVerificationsCount,
      icon: UserCheck,
      tab: 'verification' as const
    },
    {
      id: 'act_drivers',
      label: 'Fleet Drivers',
      count: totalDriversCount,
      icon: Car,
      tab: 'drivers' as const
    },
    {
      id: 'act_rides',
      label: 'Rides Dispatch',
      count: totalRidesCount,
      icon: Clock,
      tab: 'rides' as const
    },
    {
      id: 'act_complaints',
      label: 'Complaints Desk',
      count: pendingComplaintsCount,
      icon: ShieldAlert,
      tab: 'safety' as const
    },
    {
      id: 'act_payments',
      label: 'Wallet & Payouts',
      count: pendingPayoutsCount,
      icon: Wallet,
      tab: 'wallets' as const
    },
    {
      id: 'act_live',
      label: 'Live Operations',
      count: activeRidesCount,
      icon: Radio,
      tab: 'live_rides' as const
    }
  ];

  // Equal-size KPI Card definitions
  const kpiCards = [
    {
      id: 'kpi_rides',
      title: 'Total Rides',
      value: effectiveTotalRides.toLocaleString(),
      subtitle: isViewingToday
        ? `${effectiveCompletedRides} completed • ${effectiveActiveRides} live`
        : `${effectiveCompletedRides} completed • ${effectiveCancelledRides} cancelled • 0 live`,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      onClick: () => setActiveTab('rides')
    },
    {
      id: 'kpi_drivers',
      title: isViewingToday ? 'Online Drivers' : 'Operating Drivers',
      value: effectiveOnlineDrivers.toLocaleString(),
      subtitle: isViewingToday
        ? `${totalDriversCount} registered fleet`
        : `${effectiveOnlineDrivers} active in ${globalFinancials.periodLabel}`,
      hasPulse: isViewingToday,
      icon: Car,
      iconBg: 'bg-emerald-50 text-emerald-600',
      onClick: () => {
        setOperationsInitialFilter({ tab: 'drivers' });
        setActiveTab('live_rides');
      }
    },
    {
      id: 'kpi_requests',
      title: 'Pending Driver Requests',
      value: effectivePendingVerifications.toLocaleString(),
      subtitle: isViewingToday ? 'Awaiting KYC document review' : `Requests logged in ${globalFinancials.periodLabel}`,
      badge: effectivePendingVerifications > 0 ? `${effectivePendingVerifications} New` : undefined,
      icon: UserCheck,
      iconBg: 'bg-amber-50 text-amber-600',
      onClick: () => setActiveTab('verification')
    },
    {
      id: 'kpi_complaints',
      title: 'Pending Complaints',
      value: effectivePendingComplaints.toLocaleString(),
      subtitle: isViewingToday ? 'Customer support & safety desk' : `Complaints logged in ${globalFinancials.periodLabel}`,
      badge: effectivePendingComplaints > 0 ? `${effectivePendingComplaints} Open` : undefined,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      onClick: () => setActiveTab('safety')
    }
  ];

  return (
    <div className="space-y-4 text-slate-900 pb-10">
      {/* ============================================================
          5. DASHBOARD HEADER (COMPACT 2027 STYLE)
          - Title: Dashboard
          - Welcome to GoLife Taxi Admin Panel
          - Calendar Date Picker (Full professional date picker & presets)
          - One Refresh button
         ============================================================ */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-950 border border-amber-300">
              {selectedCityFilter === 'All' ? 'Pakistan Fleet' : `${selectedCityFilter} Region`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome to GoLife Taxi Admin Panel
          </p>
        </div>

        {/* Right Header Controls: Full Calendar Date Picker + Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Calendar Date Picker */}
          <DashboardCalendarPicker
            mode={dashboardDateFilter.mode}
            selectedDate={dashboardDateFilter.selectedDate}
            endDate={dashboardDateFilter.endDate}
            selectedYear={dashboardDateFilter.selectedYear}
            selectedMonth={dashboardDateFilter.selectedMonth}
            onChange={(newFilter) => {
              updateDashboardDateFilter(newFilter);
            }}
          />

          {/* Refresh Button */}
          <button
            id="dashboard-refresh-btn"
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-950 hover:border-amber-300 border border-slate-200 text-slate-800 transition cursor-pointer shadow-2xs shrink-0"
            title={`Last refreshed at ${lastRefreshed}`}
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Historical Date Notice / No-Records Banner */}
      {!isViewingToday && (
        hasNoRecordsForDate ? (
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  No records found for {globalFinancials.periodLabel}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  No completed rides, active fleet dispatches, or financial transactions were recorded for this selected timeframe.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetDashboardDateToToday}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return to Today
            </button>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5 text-slate-800 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wide shrink-0 shadow-2xs">
                <Calendar className="w-3 h-3" />
                Viewing: {globalFinancials.periodLabel}
              </span>
              <span className="truncate text-slate-600 hidden sm:inline">
                Historical records & financial statistics synchronized for {globalFinancials.periodLabel}.
              </span>
            </div>
            <button
              type="button"
              onClick={resetDashboardDateToToday}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50 text-slate-900 font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Back to Today</span>
            </button>
          </div>
        )
      )}

      {/* ============================================================
          6. EQUAL-SIZE COMPACT KPI CARDS (4 CARDS GRID)
          - Total Rides
          - Online Drivers
          - Pending Driver Requests
          - Pending Complaints
         ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 p-4 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group flex flex-col justify-between h-[115px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 truncate">
                  {card.title}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {card.hasPulse && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  {card.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      {card.badge}
                    </span>
                  )}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-950 font-mono tracking-tight leading-none">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-1 flex items-center justify-between">
                  <span>{card.subtitle}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          7. EQUAL-SIZE FINANCIAL CARDS (4 CARDS GRID)
          - Today's Earnings (Click → Driver Earnings Detail Center)
          - Today's Commission (Click → Commission Detail Center)
          - Total Wallet Balance (Click → Wallet & Payments)
          - Platform Revenue (Click → Financial Center)
          - All equal height (h-[175px]), identical padding & typography
         ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Today's Earnings Card */}
        <div
          id="dashboard-card-todays-earnings"
          onClick={() => setIsEarningsDetailOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsEarningsDetailOpen(true);
            }
          }}
          className="bg-white rounded-xl border-2 border-amber-300/80 hover:border-amber-500 hover:bg-amber-50/20 p-4 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group flex flex-col justify-between h-[175px] relative focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          title="Click to open Driver Earnings Detail Center"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-black text-slate-900 group-hover:text-amber-950 truncate flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isViewingToday ? "Today's Earnings" : globalFinancials.timeframeTitle}</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 group-hover:bg-amber-400 group-hover:text-slate-950 uppercase tracking-tight border border-amber-300 transition shadow-2xs shrink-0">
                Detail ↗
              </span>
            </div>

            <div className="text-2xl font-black text-slate-950 font-mono tracking-tight leading-none mt-1">
              {formatPKR(todayDriverEarningsTotal)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Completed Trips:</span>
              <span className="font-mono font-bold text-slate-800">{globalFinancials.completedRidesCount} trips</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Gross Ride Revenue:</span>
              <span className="font-mono font-bold text-slate-800">{formatPKR(globalFinancials.grossFare)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Platform Commission:</span>
              <span className="font-mono font-bold text-rose-600">-{formatPKR(globalFinancials.platformCommission)}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-black">
              <span className="text-slate-900">Net Driver Earnings:</span>
              <span className="font-mono text-amber-950">{formatPKR(todayDriverEarningsTotal)}</span>
            </div>
          </div>
        </div>

        {/* 2. Today's Commission Card */}
        <div
          id="dashboard-card-todays-commission"
          onClick={() => setIsCommissionDetailOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsCommissionDetailOpen(true);
            }
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 p-4 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group flex flex-col justify-between h-[175px] relative focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          title="Click to open Commission Detail Center"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-black text-slate-900 group-hover:text-amber-950 truncate flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isViewingToday ? "Today's Commission" : globalFinancials.commissionTitle}</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 group-hover:bg-amber-400 group-hover:text-slate-950 uppercase tracking-tight border border-amber-300 transition shadow-2xs shrink-0">
                Detail ↗
              </span>
            </div>

            <div className="text-2xl font-black text-slate-950 font-mono tracking-tight leading-none mt-1">
              {formatPKR(todayPlatformCommissionTotal)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Gross Ride Revenue:</span>
              <span className="font-mono font-bold text-slate-800">{formatPKR(globalFinancials.grossFare)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Driver Earnings:</span>
              <span className="font-mono font-bold text-slate-800">{formatPKR(globalFinancials.driverEarnings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Effective Rate:</span>
              <span className="font-mono font-bold text-slate-800">
                {globalFinancials.grossFare > 0
                  ? ((globalFinancials.platformCommission / globalFinancials.grossFare) * 100).toFixed(1)
                  : '18.0'}
                % avg
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-black">
              <span className="text-slate-900">Platform Commission:</span>
              <span className="font-mono text-amber-950">{formatPKR(todayPlatformCommissionTotal)}</span>
            </div>
          </div>
        </div>

        {/* 3. Total Wallet Balance Card */}
        <div
          id="dashboard-card-total-wallet"
          onClick={() => setActiveTab('wallets')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('wallets');
            }
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 p-4 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group flex flex-col justify-between h-[175px] relative focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          title="Click to open Wallet & Payments"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-black text-slate-900 group-hover:text-amber-950 truncate flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{isViewingToday ? 'Total Wallet Balance' : `Wallet Activity (${formatDateDisplay(selectedDateStr)})`}</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 uppercase tracking-tight border border-slate-300 transition shadow-2xs shrink-0">
                Wallets ➔
              </span>
            </div>

            <div className="text-2xl font-black text-slate-950 font-mono tracking-tight leading-none mt-1">
              {isViewingToday ? formatPKR(totalWalletBalance) : formatPKR(globalFinancials.payoutsTotal || 0)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[10px]">
            {isViewingToday ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Driver Wallets:</span>
                  <span className="font-mono font-bold text-slate-800">{filteredWallets.length} accounts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pending Payouts:</span>
                  <span className="font-mono font-bold text-amber-700">{pendingPayoutsCount} requests</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Negative Dues:</span>
                  <span className="font-mono font-bold text-rose-600">{formatPKR(totalNegativeDues)}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-black">
                  <span className="text-slate-900">Spendable Float:</span>
                  <span className="font-mono text-emerald-700">{formatPKR(totalPayableBalance)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Settled Payouts:</span>
                  <span className="font-mono font-bold text-slate-800">{formatPKR(globalFinancials.payoutsTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fines Deducted:</span>
                  <span className="font-mono font-bold text-rose-600">{formatPKR(globalFinancials.finesTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reimbursements:</span>
                  <span className="font-mono font-bold text-emerald-600">+{formatPKR(globalFinancials.reimbursementsTotal)}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-black">
                  <span className="text-slate-900">Net Settlements:</span>
                  <span className="font-mono text-amber-950">
                    {formatPKR(globalFinancials.payoutsTotal + globalFinancials.finesTotal - globalFinancials.reimbursementsTotal)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Platform Revenue Card */}
        <div
          id="dashboard-card-platform-revenue"
          onClick={() => setIsCommissionDetailOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsCommissionDetailOpen(true);
            }
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 p-4 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group flex flex-col justify-between h-[175px] relative focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          title="Click to open Revenue & Commission Analytics"
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-black text-slate-900 group-hover:text-amber-950 truncate flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Platform Revenue</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 uppercase tracking-tight border border-slate-300 transition shadow-2xs shrink-0">
                Analytics ➔
              </span>
            </div>

            <div className="text-2xl font-black text-slate-950 font-mono tracking-tight leading-none mt-1">
              {formatPKR(platformRevenueTotal)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Commission Cut:</span>
              <span className="font-mono font-bold text-slate-800">+{formatPKR(globalFinancials.platformCommission)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Levied Fines:</span>
              <span className="font-mono font-bold text-slate-800">+{formatPKR(globalFinancials.finesTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Passenger Refunds:</span>
              <span className="font-mono font-bold text-rose-600">-{formatPKR(globalFinancials.refundsTotal)}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-black">
              <span className="text-slate-900">Net Platform Margin:</span>
              <span className="font-mono text-amber-950">{formatPKR(platformRevenueTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          12. COMPACT MIDDLE SECTIONS:
          - Recent Rides
          - Earnings Overview
          - Quick Actions
         ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: Recent Rides & Earnings Overview (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Recent Rides Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Recent Rides
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {isViewingToday ? 'Live Dispatch Stream' : `Archive: ${formatDateDisplay(selectedDateStr)}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('rides')}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Rides</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    <th className="py-2 font-bold">Ride Code</th>
                    <th className="py-2 font-bold">Passenger / Driver</th>
                    <th className="py-2 font-bold hidden sm:table-cell">Route</th>
                    <th className="py-2 font-bold text-right">Fare</th>
                    <th className="py-2 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRides.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No ride records found for {globalFinancials.periodLabel}.
                      </td>
                    </tr>
                  ) : (
                    displayRides.map((r: any) => {
                    const statusColor =
                      r.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : r.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : r.status === 'driver_assigned' || r.status === 'searching'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300';

                    return (
                      <tr
                        key={r.id}
                        onClick={() => {
                          if (openUniversalDetail) {
                            openUniversalDetail('ride', r.id);
                          } else {
                            setActiveTab('rides');
                          }
                        }}
                        className="hover:bg-amber-50/40 transition cursor-pointer group"
                        title="Click to view full ride dossier"
                      >
                        <td className="py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {r.rideCode || `#${r.id.slice(-6)}`}
                        </td>
                        <td className="py-2.5">
                          <div className="font-bold text-slate-900 truncate max-w-[140px]">
                            {r.passengerName || 'Passenger'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {r.driverName || 'Finding Driver...'} • {r.category}
                          </div>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell text-slate-600">
                          <div className="truncate max-w-[200px] text-[11px]">
                            {r.pickupLocation?.address || 'Pickup Point'}
                          </div>
                          <div className="truncate max-w-[200px] text-[10px] text-slate-400">
                            → {r.dropoffLocation?.address || 'Dropoff Point'}
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-mono font-black text-slate-950 whitespace-nowrap">
                          {formatPKR(r.fare || 0)}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${statusColor}`}
                          >
                            {r.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 text-right pl-2 whitespace-nowrap">
                          <button
                            type="button"
                            title="Inspect ride"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openUniversalDetail) {
                                openUniversalDetail('ride', r.id);
                              } else {
                                setActiveTab('rides');
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-100 transition inline-flex items-center"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Earnings Overview Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>Earnings Overview & Fleet Volume</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gross customer bookings vs Net GoLife Platform cut across Pakistan
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold border border-amber-300">
                {globalFinancials.periodLabel}
              </span>
            </div>

            <div className="h-36 flex items-end justify-between gap-1 sm:gap-2.5 pt-4 pb-2 px-1 border-b border-slate-100">
              {chartData.map((d) => {
                const totalRevAcrossChart = chartData.reduce((sum, item) => sum + item.rev, 0);
                const maxRev = Math.max(...chartData.map((item) => item.rev), 1);
                const heightPct = totalRevAcrossChart === 0 ? 6 : (d.rev > 0 ? Math.min(100, Math.max(12, Math.round((d.rev / maxRev) * 100))) : 6);
                const commPct = d.rev > 0 ? Math.round((d.comm / d.rev) * 100) : 0;

                return (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-1 px-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20 font-mono">
                      <div className="font-bold text-amber-400">{d.label}</div>
                      <div>Gross: {formatPKR(d.rev)}</div>
                      <div>Comm: {formatPKR(d.comm)} ({commPct}%)</div>
                      <div className="text-slate-300">{d.rides} rides</div>
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 group-hover:brightness-110 cursor-pointer relative overflow-hidden flex flex-col justify-end ${
                        d.rev > 0 ? 'bg-gradient-to-t from-amber-500 to-amber-400' : 'bg-slate-200/80'
                      }`}
                    >
                      {/* Commission slice within bar */}
                      {d.comm > 0 && (
                        <div
                          style={{ height: `${commPct}%` }}
                          className="w-full bg-slate-900/40 rounded-t-xs"
                          title={`Commission: ${formatPKR(d.comm)}`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 group-hover:text-amber-600 truncate">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2.5">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span className="text-[11px] font-medium text-slate-700">Gross Ride Revenue</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-900/60" />
                  <span className="text-[11px] font-medium text-slate-700">Platform Commission</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-800">
                <span>Avg Fare: {formatPKR(globalFinancials.averageFarePerRide)}</span>
                <span>•</span>
                <span>Avg Comm: {formatPKR(globalFinancials.averageCommissionPerRide)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions + Attention Deck (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Quick Actions (6 Compact Buttons) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Quick Actions
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">One-click hubs</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.id}
                    id={`quick-action-${qa.id}`}
                    type="button"
                    onClick={() => setActiveTab(qa.tab)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition text-left cursor-pointer flex items-center justify-between gap-1.5 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-700 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-slate-950 truncate">
                        {qa.label}
                      </span>
                    </div>
                    {typeof qa.count === 'number' && qa.count > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-200 text-amber-950 shrink-0">
                        {qa.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attention Required Module */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Attention Required
                </h2>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 border border-amber-300">
                {attentionItems.length} Issues
              </span>
            </div>

            {attentionItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {attentionItems.map((item) => (
                  <div key={item.id} className="py-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider ${item.priorityColor}`}>
                          {item.priority}
                        </span>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.reason}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {item.related}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={item.onAction}
                      className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black shrink-0 transition cursor-pointer"
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">All clear! No urgent items.</p>
                <p className="text-[10px] text-slate-400">Fleet operations running smoothly.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          13. COMPACT LOWER SECTIONS:
          - Latest Complaints (Click row → UniversalDetail complaint)
          - Live Operations (Click → Live Rides Radar)
          - Top Cities (Dynamic from real demo data, click to filter)
          - System Status (Operational indicators & config jump)
         ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Latest Complaints */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Latest Complaints
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('safety')}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                View All ➔
              </button>
            </div>

            <div className="space-y-2">
              {(complaints || []).slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (openUniversalDetail) {
                      openUniversalDetail('complaint', c.id);
                    } else {
                      setActiveTab('safety');
                    }
                  }}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition cursor-pointer group"
                  title="Click to view complete complaint dossier"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-amber-950 truncate">
                      {c.reporterName || 'Passenger'}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                        c.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : c.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {c.severity || 'Medium'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {c.subject}
                  </div>
                </div>
              ))}
              {(!complaints || complaints.length === 0) && (
                <div className="py-4 text-center text-[11px] text-slate-400">
                  No open complaints.
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Open Tickets:</span>
            <span className="font-bold text-rose-600 font-mono">{pendingComplaintsCount} cases pending</span>
          </div>
        </div>

        {/* 2. Live Operations */}
        <div
          onClick={() => setActiveTab('live_rides')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-amber-400 transition"
        >
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Live Operations
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('live_rides');
                }}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                Open Radar ➔
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 text-[11px]">Active Trips on Road:</span>
                <span className="font-black font-mono text-emerald-700">{activeRidesCount} trips</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 text-[11px]">Online Drivers:</span>
                <span className="font-black font-mono text-slate-900">{onlineDriversCount} drivers</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 text-[11px]">In-Progress Transit:</span>
                <span className="font-black font-mono text-blue-700">
                  {filteredRides.filter((r) => r.status === 'in_progress').length} rides
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Fleet Radar:</span>
            <span className="font-bold text-emerald-700">Online (&lt;2s ping)</span>
          </div>
        </div>

        {/* 3. Top Cities */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Top Cities
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('cities')}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                Manage ➔
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {topCitiesData.map((c) => {
                const isSelected = selectedCityFilter.toLowerCase() === c.name.toLowerCase();
                return (
                  <div
                    key={c.name}
                    onClick={() => {
                      if (setSelectedCityFilter) {
                        setSelectedCityFilter(isSelected ? 'All' : c.name);
                        if (showToast) {
                          showToast(
                            isSelected ? 'Cleared city territory filter (showing All)' : `Filtered territory to ${c.name}`,
                            'info'
                          );
                        }
                      }
                    }}
                    className={`flex items-center justify-between py-1 px-2 rounded-md transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 font-bold border border-amber-300'
                        : 'hover:bg-slate-50'
                    }`}
                    title={`Click to filter dashboard to ${c.name}`}
                  >
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-slate-400">{c.fleet} cars</span>
                      <span className="font-bold text-amber-700">{c.sharePct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Territory Filter:</span>
            <span className="font-bold text-slate-800 font-mono">{selectedCityFilter}</span>
          </div>
        </div>

        {/* 4. System Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  System Status
                </h3>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                Normal
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Dispatch Server:</span>
                <span className="font-bold text-emerald-700 font-mono text-[10px]">99.98% Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">GPS Telemetry:</span>
                <span className="font-bold text-emerald-700 font-mono text-[10px]">Streaming (&lt;2s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Payment Engine:</span>
                <span className="font-bold text-emerald-700 font-mono text-[10px]">Raast / EasyPaisa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Environment:</span>
                <span className="font-bold text-amber-900 font-mono text-[10px]">Demo Mode Active</span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Platform Engine:</span>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="font-mono font-bold text-slate-800 hover:text-amber-700 cursor-pointer"
            >
              v61.0-PK ➔
            </button>
          </div>
        </div>
      </div>

      {/* Driver Control Modal Triggered from Dashboard */}
      {selectedDriverForControl && (
        <DriverControlModal
          driver={selectedDriverForControl}
          onClose={() => setSelectedDriverForControl(null)}
        />
      )}

      {/* Commission Detail Center Modal */}
      <CommissionDetailCenterModal
        isOpen={isCommissionDetailOpen}
        onClose={() => setIsCommissionDetailOpen(false)}
        initialTimeframe={dashboardDateFilter.mode}
        initialDate={dashboardDateFilter.selectedDate}
        initialYear={dashboardDateFilter.selectedYear}
        initialMonth={dashboardDateFilter.selectedMonth}
        initialCity={selectedCityFilter}
      />

      {/* Driver Earnings Detail Center Modal */}
      <DriverEarningsDetailCenterModal
        isOpen={isEarningsDetailOpen}
        onClose={() => setIsEarningsDetailOpen(false)}
        rides={rides}
        driverDailySummaries={driverDailySummaries}
        drivers={drivers}
        commissionRules={commissionRules}
        driverOverrides={driverOverrides}
        driverFines={driverFines}
        passengerRefunds={passengerRefunds}
        driverReimbursements={driverReimbursements}
        financialAdjustments={financialAdjustments}
        initialTimeframe={dashboardDateFilter.mode}
        initialDate={dashboardDateFilter.selectedDate}
        initialYear={dashboardDateFilter.selectedYear}
        initialMonth={dashboardDateFilter.selectedMonth}
        initialCity={selectedCityFilter}
      />
    </div>
  );
};
