import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminRole, AdminUser } from '../types';
import { formatPKR } from '../utils/i18n';
import { isFirebaseConfigured, getFirebaseInstance } from '../services/firebase/firebaseConfig';
import { FIRESTORE_COLLECTIONS } from '../services/firebase/collections';
import { DateRangeControl, DateRangeState } from './DateRangeControl';
import { generateYearlyAnalytics } from '../services/notificationService';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { ReportsAnalyticsCenter } from './reports/ReportsAnalyticsCenter';
import {
  BarChart3,
  Settings,
  Download,
  ShieldCheck,
  Database,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Globe,
  Radio,
  FileText,
  UserPlus,
  RefreshCw,
  Sliders,
  AlertCircle,
  Smartphone,
  PhoneCall,
  Mail,
  MessageSquare
} from 'lucide-react';

export const ReportsSettingsView: React.FC = () => {
  const {
    activeTab: globalTab,
    setActiveTab: setActiveTabGlobal,
    dataSource,
    adminUsers,
    currentAdmin,
    auditLogs,
    rides,
    drivers,
    passengers,
    systemSettings,
    updateSystemSettings
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'reports' | 'roles' | 'settings' | 'logs'>(() => {
    if (globalTab === 'settings') return 'settings';
    if (globalTab === 'audit_logs') return 'logs';
    return 'reports';
  });

  React.useEffect(() => {
    if (globalTab === 'settings') setActiveTab('settings');
    else if (globalTab === 'audit_logs') setActiveTab('logs');
    else if (globalTab === 'reports') setActiveTab('reports');
  }, [globalTab]);

  const [dateRangeState, setDateRangeState] = useState<DateRangeState>({
    range: 'this_week',
    selectedYear: 2026,
    selectedMonth: 'all'
  });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const yearlyAnalytics = useMemo(() => {
    return generateYearlyAnalytics(dateRangeState.selectedYear, dateRangeState.selectedMonth);
  }, [dateRangeState.selectedYear, dateRangeState.selectedMonth]);

  const multiplier = useMemo(() => {
    if (dataSource === 'PRODUCTION') return 1.0;
    switch (dateRangeState.range) {
      case 'today': return 0.18;
      case 'yesterday': return 0.16;
      case 'this_week': return 1.0;
      case 'last_week': return 0.95;
      case 'this_month': return 4.2;
      case 'last_month': return 4.0;
      case 'this_year': return 48.0;
      case 'last_year': return 44.0;
      case 'yearly': return dateRangeState.selectedMonth === 'all' ? 52.0 : 4.4;
      case 'custom': return 2.2;
      default: return 1.0;
    }
  }, [dateRangeState.range, dateRangeState.selectedMonth, dataSource]);

  // Settings form state
  const [appName, setAppName] = useState(systemSettings.appName || 'GoLife Taxi');
  const [supportPhone, setSupportPhone] = useState(systemSettings.supportPhone || '+92 42 111 465 433');
  const [supportEmail, setSupportEmail] = useState(systemSettings.supportEmail || 'support@golifetaxi.pk');
  const [supportWhatsApp, setSupportWhatsApp] = useState('+92 300 4654331');
  const [termsUrl, setTermsUrl] = useState('https://golifetaxi.pk/terms');
  const [privacyUrl, setPrivacyUrl] = useState('https://golifetaxi.pk/privacy');
  const [taxPercentage, setTaxPercentage] = useState((systemSettings.taxPercentage || 5).toString());
  const [firebaseSync, setFirebaseSync] = useState(systemSettings.firebaseSync ?? true);
  const [minAppVersion, setMinAppVersion] = useState('2.4.0');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('GoLife systems are undergoing routine scheduled maintenance. We will be back online shortly.');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Admin user modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('city_manager');
  const [localAdminUsers, setLocalAdminUsers] = useState<AdminUser[]>(adminUsers);

  // Financial aggregates
  const isYearly = dateRangeState.range === 'yearly';
  const totalRidesCount = isYearly ? (yearlyAnalytics?.ridesCount ?? yearlyAnalytics?.totalRides ?? 0) : Math.round(rides.length * multiplier);
  const completedRides = rides.filter((r) => r.status === 'completed');
  const totalGrossPKR = isYearly
    ? (yearlyAnalytics?.grossRevenuePKR ?? yearlyAnalytics?.totalRevenuePKR ?? 0)
    : Math.round(completedRides.reduce((acc, r) => acc + r.fare, 0) * multiplier);
  const totalCommissionPKR = isYearly
    ? (yearlyAnalytics?.commissionRevenuePKR ?? yearlyAnalytics?.totalCommissionPKR ?? 0)
    : Math.round(completedRides.reduce((acc, r) => acc + r.commission, 0) * multiplier);
  const totalDriverPayoutPKR = isYearly
    ? (yearlyAnalytics?.driverEarningsPKR ?? yearlyAnalytics?.totalDriverEarningsPKR ?? 0)
    : Math.round(completedRides.reduce((acc, r) => acc + r.driverEarnings, 0) * multiplier);
  const cancelledCount = isYearly
    ? (yearlyAnalytics?.cancelledCount ?? yearlyAnalytics?.totalCancellations ?? 0)
    : Math.round(rides.filter((r) => r.status === 'cancelled').length * multiplier);
  const totalDiscountsPKR = dataSource === 'PRODUCTION'
    ? completedRides.reduce((acc, r) => acc + ((r as any).discountAmount || 0), 0)
    : Math.round(18500 * (multiplier > 10 ? 12 : multiplier));
  const estimatedTaxPKR = Math.round(totalCommissionPKR * 0.05);

  // Export CSV generator
  const handleExportCSV = () => {
    const headers = 'RideCode,Passenger,Driver,Category,City,FarePKR,CommissionPKR,Status,PaymentMethod,Time\n';
    const rows = rides
      .map(
        (r) =>
          `"${r.rideCode}","${r.passengerName}","${r.driverName || 'N/A'}","${r.category}","${r.city}",${r.fare},${r.commission},"${r.status}","${r.paymentMethod}","${r.startTime}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GoLife_Operations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      appName,
      systemSettings,
      adminUsers: localAdminUsers,
      ridesCount: rides.length,
      driversCount: drivers.length,
      passengersCount: passengers.length
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GoLife_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      appName,
      supportPhone,
      supportEmail,
      taxPercentage: Number(taxPercentage),
      firebaseSync
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;

    const newAdmin: AdminUser = {
      id: `ADM-${Date.now().toString().slice(-4)}`,
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      permissions:
        newAdminRole === 'super_admin'
          ? ['all']
          : newAdminRole === 'finance_officer'
          ? ['wallets', 'payouts', 'reports']
          : ['rides', 'drivers', 'passengers'],
      lastActive: 'Just now'
    };

    setLocalAdminUsers([newAdmin, ...localAdminUsers]);
    setShowAddAdminModal(false);
    setNewAdminName('');
    setNewAdminEmail('');
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0F766E]" />
              Reports, Role Permissions & System Settings
            </h1>
            <p className="text-xs text-[#6B7280]">
              Operational audits, RBAC admin privileges, Excel/CSV exports and shared Firebase sync parameters
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Reports & Analytics
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Roles ({localAdminUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Trail ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            System Settings
          </button>
        </div>
      </div>

      {/* View 1: Reports & Analytics */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <ReportsAnalyticsCenter onNavigateTab={setActiveTabGlobal} />
          {/* Top Actions & Consolidated Date Range Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#6B7280]">Reporting Period:</span>
              <DateRangeControl
                value={dateRangeState}
                onChange={setDateRangeState}
                showMonthlyGridOnYearly={true}
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {downloadSuccess ? 'Downloaded CSV!' : 'Export Operations Report (.CSV)'}
            </button>
          </div>

          {/* Yearly Performance Matrix (if Yearly Selected) */}
          {isYearly && (
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-[#111827]">
                    {dateRangeState.selectedYear} Annual Executive Performance Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Consolidated nationwide metrics for financial audits, investor reporting & fleet operations
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Fiscal Year {dateRangeState.selectedYear}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Rides</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
                    {(yearlyAnalytics?.ridesCount ?? yearlyAnalytics?.totalRides ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {(yearlyAnalytics?.completedRidesCount ?? 0).toLocaleString()} Completed ({(yearlyAnalytics?.cancelledCount ?? yearlyAnalytics?.totalCancellations ?? 0).toLocaleString()} Cancelled)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Gross Revenue</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.grossRevenuePKR ?? yearlyAnalytics?.totalRevenuePKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Total customer fares</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Commission</span>
                  <div className="text-lg font-black text-amber-600 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.commissionRevenuePKR ?? yearlyAnalytics?.totalCommissionPKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Platform revenue (20%)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Driver Earnings</span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.driverEarningsPKR ?? yearlyAnalytics?.totalDriverEarningsPKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Net credited to drivers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Fines Levied</span>
                  <div className="text-lg font-black text-rose-600 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.finesAmountPKR ?? yearlyAnalytics?.totalFinesPKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Penalties for violations</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Refunds</span>
                  <div className="text-lg font-black text-teal-700 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.refundsAmountPKR ?? yearlyAnalytics?.totalRefundsPKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Returned to passenger wallets</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Reimbursements</span>
                  <div className="text-lg font-black text-indigo-700 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.reimbursementsAmountPKR ?? yearlyAnalytics?.totalReimbursementsPKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">Toll & driver reimbursements</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Yearly Payouts Settled</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
                    {formatPKR(yearlyAnalytics?.payoutsAmountPKR ?? yearlyAnalytics?.totalPayoutsPKR ?? 0)}
                  </div>
                  <span className="text-[10px] text-slate-400">1-click bank & Raast payouts</span>
                </div>
              </div>
            </div>
          )}

          {/* Financial Aggregates Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Gross Booking Volume</span>
              <div className="text-xl font-extrabold text-[#0F766E] font-mono mt-1">
                {formatPKR(totalGrossPKR)}
              </div>
              <span className="text-[11px] text-[#6B7280]">{completedRides.length} completed trips</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">GoLife Commission</span>
              <div className="text-xl font-extrabold text-[#10B981] font-mono mt-1">
                {formatPKR(totalCommissionPKR)}
              </div>
              <span className="text-[11px] text-[#6B7280]">Take rate approx 15%</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Driver Net Payout</span>
              <div className="text-xl font-extrabold text-[#111827] font-mono mt-1">
                {formatPKR(totalDriverPayoutPKR)}
              </div>
              <span className="text-[11px] text-[#6B7280]">Retained in driver wallets</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Promo Subsidies</span>
              <div className="text-xl font-extrabold text-[#F59E0B] font-mono mt-1">
                {formatPKR(totalDiscountsPKR)}
              </div>
              <span className="text-[11px] text-[#6B7280]">Vouchers redeemed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Provincial Sales Tax</span>
              <div className="text-xl font-extrabold text-[#6B7280] font-mono mt-1">
                {formatPKR(estimatedTaxPKR)}
              </div>
              <span className="text-[11px] text-[#6B7280]">PRA / SRB 5% rate</span>
            </div>
          </div>

          {/* City & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue by City */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Revenue & Ride Share by City (Pakistan)
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Lahore (Punjab)', share: 42, count: '1,420 rides', rev: 540000 },
                  { name: 'Karachi (Sindh)', share: 36, count: '1,180 rides', rev: 490000 },
                  { name: 'Islamabad Capital Territory', share: 14, count: '480 rides', rev: 210000 },
                  { name: 'Rawalpindi (Twin City)', share: 8, count: '310 rides', rev: 115000 }
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#111827] font-semibold">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#6B7280]">{item.count}</span>
                        <span className="text-[#0F766E] font-bold font-mono">{formatPKR(item.rev)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F766E] h-full rounded-full"
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Top Performers */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Driver Performance & Acceptance Rate (Top Performers)
              </h3>
              <div className="divide-y divide-[#E5E7EB]">
                {drivers.slice(0, 4).map((d) => (
                  <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#111827]">{d.name}</div>
                      <div className="text-[11px] text-[#6B7280]">
                        {d.city} • Plate: {d.vehicle.plate} • {d.totalRides} trips
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[#0F766E] font-bold">
                        {formatPKR(d.earnings)}
                      </div>
                      <div className="text-[10px] text-[#F59E0B] font-bold">
                        ⭐ {d.rating.toFixed(2)} (96% acceptance)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Admin Roles & Access Control (RBAC) */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#111827]">Authorized Administration Team</span>
                <p className="text-xs text-[#6B7280]">
                  Granular permission control across Super Admin, City Manager, Support Agent, Finance Officer, and Dispatcher
                </p>
              </div>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Admin User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Admin Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Assigned Privileges</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {localAdminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#111827]">{u.name}</div>
                        {currentAdmin?.id === u.id && (
                          <span className="text-[10px] text-[#0F766E] font-semibold">(Current Active Session)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#6B7280]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E] capitalize border border-[#0F766E]/20">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions.map((p) => (
                            <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-[#111827]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#6B7280] text-[11px]">{u.lastActive}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Role-Based Access Control (RBAC) Permissions Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl">
                <strong className="text-[#0F766E] block mb-1">Super Admin</strong>
                <p className="text-[#6B7280] text-[11px]">
                  Unrestricted access across all modules, rate settings, audit logs, and admin role assignments.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl">
                <strong className="text-[#0F766E] block mb-1">City Manager & Dispatcher</strong>
                <p className="text-[#6B7280] text-[11px]">
                  Authorized to manage live rides, dispatch, SOS alerts, and driver onboarding in assigned city.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl">
                <strong className="text-[#0F766E] block mb-1">Finance Officer</strong>
                <p className="text-[#6B7280] text-[11px]">
                  Oversees driver payout disbursements, 1-Bill/JazzCash balances, welfare micro-loans, and fare audits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Audit Trail Log */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <span className="font-bold text-sm text-[#111827]">Immutable Operational Audit Trail</span>
            <span className="text-xs text-[#6B7280]">Tracks all administrative interventions & approvals</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp (PKT)</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details / Parameters</th>
                  <th className="py-3 px-4">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-[#6B7280] text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#111827]">{log.adminEmail}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#111827]">{log.target}</td>
                    <td className="py-3 px-4 text-[#6B7280] max-w-sm truncate">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-[#6B7280] text-[11px]">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 4: System Parameters & Firebase Backend Sync */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 max-w-4xl"
        >
          <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">GoLife System Core Parameters</h2>
              <p className="text-xs text-[#6B7280]">
                Configure global taxes, contact helpline, app versioning, maintenance mode, and shared Firebase synchronization
              </p>
            </div>
            {settingsSaved && (
              <span className="text-[#10B981] text-xs font-bold animate-pulse">
                Settings saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#111827] font-semibold mb-1">Application Name & Brand</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">Standard Currency</label>
              <input
                type="text"
                disabled
                value="PKR (Pakistani Rupee / Rs.)"
                className="w-full p-2.5 rounded-xl bg-slate-100 text-[#6B7280] border border-[#E5E7EB] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">
                Customer Support Hotline (+92 format)
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">WhatsApp Helpdesk Number</label>
              <input
                type="text"
                value={supportWhatsApp}
                onChange={(e) => setSupportWhatsApp(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">Support Official Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">
                Provincial Sales Tax on Services (% e.g. PRA/SRB)
              </label>
              <input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">Terms of Service URL</label>
              <input
                type="text"
                value={termsUrl}
                onChange={(e) => setTermsUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-[#111827] font-semibold mb-1">Privacy Policy URL</label>
              <input
                type="text"
                value={privacyUrl}
                onChange={(e) => setPrivacyUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          {/* App Version Control & Maintenance Mode */}
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-4">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#0F766E]" />
              App Version Control & Remote Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#111827] font-semibold mb-1">Minimum Supported Version</label>
                <input
                  type="text"
                  value={minAppVersion}
                  onChange={(e) => setMinAppVersion(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827]"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5E7EB]">
                <div>
                  <div className="font-semibold text-[#111827]">Force Update Modal</div>
                  <div className="text-[10px] text-[#6B7280]">Require immediate Google Play / App Store update</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForceUpdate(!forceUpdate)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                    forceUpdate ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-[#6B7280]'
                  }`}
                >
                  {forceUpdate ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#111827]">Maintenance Mode</div>
                  <div className="text-[10px] text-[#6B7280]">Temporarily suspend bookings across passenger apps</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${
                    maintenanceMode ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-[#6B7280]'
                  }`}
                >
                  {maintenanceMode ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {maintenanceMode && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#111827] mb-1">
                    Announcement Banner for Users
                  </label>
                  <input
                    type="text"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 border border-[#E5E7EB] text-xs text-[#111827]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Shared Firebase Sync Box & Backup */}
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0F766E]" />
                <div>
                  <span className="text-xs font-bold text-[#111827] block">
                    Shared Firebase & Firestore Database Connection
                  </span>
                  <span className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    {isFirebaseConfigured() ? 'Connected to Live Firestore' : 'Active in Demo Mode (Zero Configuration Required)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isFirebaseConfigured() ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isFirebaseConfigured() ? 'LIVE PRODUCTION SYNC' : 'STANDALONE DEMO MODE'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B7280]">
              The Admin Panel is fully decoupled for instant testing and uses identical collection keys planned for the GoLife Passenger + Driver mobile app (<code className="text-[#0F766E] font-semibold">users, drivers, rides, wallets, payouts, complaints</code>). No blocking environment variables or API keys are required during testing.
            </p>

            <div className="p-2.5 rounded-lg bg-white border border-[#E5E7EB] text-[11px] space-y-1">
              <div className="text-[10px] font-bold text-[#111827] uppercase tracking-wider">Synchronized Schema Target:</div>
              <div className="flex flex-wrap gap-1">
                {Object.values(FIRESTORE_COLLECTIONS).slice(0, 10).map((col) => (
                  <span key={col} className="px-1.5 py-0.5 rounded bg-slate-100 text-[#475569] font-mono text-[10px]">
                    {col}
                  </span>
                ))}
                <span className="text-[10px] text-[#94A3B8] font-mono self-center">+{Object.values(FIRESTORE_COLLECTIONS).length - 10} more</span>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-100 text-[#111827] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {backupSuccess ? 'Backup Saved (.JSON)!' : 'Export Database JSON Backup'}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Save Platform Configuration
            </button>
          </div>
        </form>
      )}

      {/* Add Admin User Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAdmin}
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]"
          >
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#0F766E]" />
              Provision New Admin Officer
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#111827] font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Qureshi"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[#111827] font-semibold mb-1">Official Company Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. asad.qureshi@golifetaxi.pk"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[#111827] font-semibold mb-1">Assigned Department Role</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
                >
                  <option value="super_admin">Super Admin (All Privileges)</option>
                  <option value="city_manager">City Manager (City Operations)</option>
                  <option value="dispatcher">Dispatcher (Rides & Fleets)</option>
                  <option value="support_agent">Support Agent (Tickets & Complaints)</option>
                  <option value="finance_officer">Finance Officer (Wallets & Payouts)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-xl shadow-xs"
              >
                Authorize & Add Admin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
