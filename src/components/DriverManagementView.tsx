import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Driver, RideCategory } from '../types';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { formatPKR } from '../utils/i18n';
import { canAdminViewPII, maskPhoneNumber, maskCNIC } from '../utils/privacyUtils';
import { DriverEarningsView } from './DriverEarningsView';
import { DriverLiveTrackingTab } from './DriverLiveTrackingTab';
import { LatePickupComplianceTab } from './LatePickupComplianceTab';
import { DriverProfileDrawer } from './DriverProfileDrawer';
import { DriverFinesPenaltiesTab } from './fines/DriverFinesPenaltiesTab';
import { DriverPerformanceCenter } from './performance/DriverPerformanceCenter';
import {
  Car,
  Search,
  Filter,
  Star,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  PlusCircle,
  FileText,
  Percent,
  CheckCircle2,
  Lock,
  Download,
  UserCheck,
  Radio,
  Zap,
  Banknote,
  RotateCcw,
  AlertOctagon,
  Award
} from 'lucide-react';

export const DriverManagementView: React.FC = () => {
  const {
    currentAdmin,
    drivers = [],
    rides = [],
    latePickupIncidents = [],
    driverFines = [],
    updateDriverAccountStatus,
    adjustDriverWallet,
    simulatePhase33Event,
    reinstateDriver,
    searchQuery: globalSearch,
    setActiveTab,
    openUniversalDetail
  } = useAdmin();

  const isAuthorizedForPII = useMemo(() => canAdminViewPII(currentAdmin), [currentAdmin]);

  // Top Section Subtabs
  const [activeDriverTab, setActiveDriverTab] = useState<'fleet' | 'performance' | 'earnings' | 'tracking' | 'compliance' | 'fines'>('fleet');

  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const effectiveSearch = localSearch || globalSearch;

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        d.phone.includes(effectiveSearch) ||
        d.cnic.includes(effectiveSearch) ||
        d.vehicle.plate.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        d.city.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        d.id.toLowerCase().includes(effectiveSearch.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || d.vehicle.category === categoryFilter;
      const matchesCity = cityFilter === 'All' || d.city.toLowerCase() === cityFilter.toLowerCase();
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'online' && (d.status === 'online' || d.status === 'on_trip')) ||
        (statusFilter === 'offline' && d.status === 'offline') ||
        (statusFilter === 'suspended' && d.accountStatus === 'suspended') ||
        (statusFilter === 'pending' && d.verificationStatus === 'pending');

      return matchesSearch && matchesCategory && matchesCity && matchesStatus;
    });
  }, [drivers, effectiveSearch, categoryFilter, cityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDrivers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, safeCurrentPage, pageSize]);

  // Export Driver List to CSV
  const handleExportCSV = () => {
    const headers = [
      'Driver ID',
      'Name',
      'Phone',
      'CNIC',
      'City',
      'Category',
      'Vehicle Make',
      'Plate',
      'Rating',
      'Total Rides',
      'Earnings PKR',
      'Wallet PKR',
      'Commission Due PKR',
      'Verification Status',
      'Account Status'
    ];

    const rows = filteredDrivers.map((d) => [
      d.id,
      `"${d.name}"`,
      `"${maskPhoneNumber(d.phone, isAuthorizedForPII)}"`,
      `"${maskCNIC(d.cnic, isAuthorizedForPII)}"`,
      d.city,
      d.vehicle.category,
      `"${d.vehicle.make} ${d.vehicle.model}"`,
      `"${d.vehicle.plate}"`,
      d.rating.toFixed(2),
      d.totalRides,
      d.earnings,
      d.walletBalance,
      d.commissionDue,
      d.verificationStatus,
      d.accountStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `golife_drivers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 text-[#111827]">
      {/* Header & Demo Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Car className="w-5 h-5 text-[#0F766E]" />
              Driver Operations & Compliance Control Center
            </h1>
            <p className="text-xs text-[#6B7280]">
              Monitor registered fleet, earnings settlements, live GPS telemetry, and automatic compliance across Pakistan
            </p>
          </div>
        </div>

        {/* Export and Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Export Driver Roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Export Fleet CSV</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Subtabs (Fleet, Earnings, Tracking, Compliance) */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-3 py-2 rounded-2xl shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveDriverTab('fleet')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeDriverTab === 'fleet'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet Directory & Profiles ({drivers.length})</span>
          </button>

          <button
            id="tab-btn-driver-performance"
            onClick={() => setActiveDriverTab('performance')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeDriverTab === 'performance'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Performance &amp; Risk Center (Phase 45)</span>
          </button>

          <button
            onClick={() => setActiveDriverTab('earnings')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeDriverTab === 'earnings'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Earnings & Daily Settlements</span>
          </button>

          <button
            onClick={() => setActiveDriverTab('tracking')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeDriverTab === 'tracking'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Driver Tracking (Radar)</span>
          </button>

          <button
            onClick={() => setActiveDriverTab('compliance')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeDriverTab === 'compliance'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Late Pickup & Compliance Rules</span>
          </button>

          <button
            id="tab-btn-fines-penalties"
            onClick={() => setActiveDriverTab('fines')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeDriverTab === 'fines'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-slate-950" />
            <span>Fines &amp; Penalties</span>
            {driverFines.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                {driverFines.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] hover:bg-slate-100 transition shadow-xs cursor-pointer ml-2 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-amber-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* RENDER CONTENT BASED ON SUBTAB */}

      {/* 1. FLEET DIRECTORY */}
      {activeDriverTab === 'fleet' && (
        <div className="space-y-4">
          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="All">All Categories</option>
                <option value="GoMoto">GoMoto (Bike)</option>
                <option value="GoAuto">GoAuto (Rickshaw)</option>
                <option value="GoMini">GoMini (Economy)</option>
                <option value="GoRide">GoRide (Sedan)</option>
                <option value="GoComfort">GoComfort (Executive)</option>
                <option value="GoFreight">GoFreight (Cargo)</option>
              </select>

              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="All">All Pakistani Cities</option>
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
                <option value="All">All Statuses</option>
                <option value="online">Online / Available</option>
                <option value="offline">Offline</option>
                <option value="pending">Pending Verification</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search driver, plate, CNIC..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-52 shadow-xs"
              />
            </div>
          </div>

          {/* Drivers Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Driver & Vehicle</th>
                    <th className="py-3 px-4">Plate & City</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Online Status</th>
                    <th className="py-3 px-4">Rating & Trips</th>
                    <th className="py-3 px-4">Total Earnings</th>
                    <th className="py-3 px-4">Wallet Balance</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {paginatedDrivers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={d.avatar}
                            alt={d.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]"
                          />
                          <div>
                            <div className="font-bold text-[#111827] flex items-center gap-1.5">
                              {d.name}
                              {d.verificationStatus === 'verified' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                              )}
                            </div>
                            <div className="text-[10px] text-[#6B7280]">
                              {d.vehicle.make} {d.vehicle.model} ({d.vehicle.year})
                            </div>
                            <div className="text-[10px] font-mono text-[#6B7280] flex items-center gap-1">
                              {maskPhoneNumber(d.phone, isAuthorizedForPII)}
                              {!isAuthorizedForPII && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#111827] bg-slate-100 px-2 py-0.5 rounded border border-[#E5E7EB] inline-block text-[11px]">
                          {d.vehicle.plate}
                        </div>
                        <div className="text-[10px] text-[#6B7280] mt-0.5">{d.city}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                          {d.vehicle.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'on_trip'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : d.status === 'online'
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-slate-100 text-[#6B7280]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              d.status === 'on_trip'
                                ? 'bg-purple-600 animate-ping'
                                : d.status === 'online'
                                ? 'bg-[#10B981] animate-pulse'
                                : 'bg-slate-400'
                            }`}
                          />
                          {d.status === 'on_trip' ? 'ON TRIP' : d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-bold text-[#F59E0B]">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                          <span>{d.rating > 0 ? d.rating.toFixed(2) : 'New'}</span>
                        </div>
                        <div className="text-[10px] text-[#6B7280]">{d.totalRides} rides</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                        {formatPKR(d.earnings)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0F766E]">
                        {formatPKR(d.walletBalance)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            d.accountStatus === 'suspended'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                          }`}
                        >
                          {d.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDriver(d)}
                            className="px-3 py-1.5 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer flex items-center gap-1 shadow-xs border border-amber-500/30"
                          >
                            <span>Driver Control</span>
                          </button>
                          <button
                            onClick={() => openUniversalDetail('driver', d.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                            title="Open in Universal Operational Drawer"
                          >
                            <span>Audit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDrivers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#6B7280]">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Car className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-700">No drivers match search or filter criteria</p>
                          <button
                            onClick={() => {
                              setLocalSearch('');
                              setCategoryFilter('All');
                              setCityFilter('All');
                              setStatusFilter('All');
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredDrivers.length > 0 && (
              <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <strong className="text-slate-900">{(safeCurrentPage - 1) * pageSize + 1}</strong> to{' '}
                    <strong className="text-slate-900">{Math.min(safeCurrentPage * pageSize, filteredDrivers.length)}</strong> of{' '}
                    <strong className="text-slate-900">{filteredDrivers.length}</strong> registered drivers
                  </span>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-slate-900 text-xs"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-slate-700"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <span className="px-3 py-1 text-slate-700 font-semibold">
                    Page {safeCurrentPage} of {totalPages}
                  </span>
                  <button
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-slate-700"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DRIVER PERFORMANCE, SAFETY & RISK CENTER (PHASE 45) */}
      {activeDriverTab === 'performance' && <DriverPerformanceCenter />}

      {/* 3. DRIVER EARNINGS & DAILY SETTLEMENTS */}
      {activeDriverTab === 'earnings' && <DriverEarningsView />}

      {/* 3. LIVE DRIVER TRACKING (RADAR MAP) */}
      {activeDriverTab === 'tracking' && (
        <DriverLiveTrackingTab onOpenDriverProfile={(d) => setSelectedDriver(d)} />
      )}

      {/* 4. LATE PICKUP & COMPLIANCE RULES */}
      {activeDriverTab === 'compliance' && <LatePickupComplianceTab />}

      {/* 5. FINES & PENALTIES DESK */}
      {activeDriverTab === 'fines' && <DriverFinesPenaltiesTab />}

      {/* 14-TAB DRIVER PROFILE CONTROL CENTER */}
      {selectedDriver && (
        <DriverProfileDrawer
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
};
