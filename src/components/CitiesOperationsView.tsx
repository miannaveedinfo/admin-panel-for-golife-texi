import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  CityConfig,
  CityOperatingStatus,
  PassengerAvailabilityStatus,
  OperatingScheduleMode,
  CityOperatingSchedule,
  CityDriverRequirements,
  ServiceCategoryConfig,
  ServiceCategoryCode,
  CategoryOperatingStatus,
  CityCategoryMatrixItem,
  FreightOrder,
  RideCategory
} from '../types';
import { calculateOverallOperationsStats } from '../services/cityOperationsService';
import { formatPKR } from '../utils/i18n';
import {
  Building2,
  MapPin,
  Layers,
  Car,
  Bike,
  Truck,
  Sliders,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Edit3,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
  Calendar,
  DollarSign,
  Users,
  Check,
  X,
  ArrowRight,
  FileText,
  Printer,
  QrCode,
  Activity,
  Compass,
  TrendingUp,
  Zap,
  Award,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export const CitiesOperationsView: React.FC = () => {
  const {
    cities,
    serviceCategories,
    cityCategoryMatrix,
    cityAiInsights,
    freightOrders,
    intercityRoutes,
    selectedCityFilter,
    setSelectedCityFilter,
    toggleCityStatus,
    updateCity,
    addCity,
    updateServiceCategory,
    toggleCategoryStatus,
    updateCityCategoryMatrixItem,
    toggleCityCategoryAvailability,
    updateCityOperatingSchedule,
    updateFreightOrderStatus,
    assignFreightDriver,
    addIntercityRoute,
    toggleIntercityRoute,
    language,
    currentAdmin
  } = useAdmin();

  // Active subtab in Phase 49
  type OperationsSubTab = 'cities' | 'categories' | 'matrix' | 'schedules' | 'freight' | 'ai_insights';
  const [activeTab, setActiveTab] = useState<OperationsSubTab>('cities');

  // Search & Filters
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected City for Drawer/Modal Edit
  const [editingCity, setEditingCity] = useState<CityConfig | null>(null);
  const [cityEditReason, setCityEditReason] = useState('');

  // Selected Category for Drawer/Modal Edit
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryConfig | null>(null);
  const [categoryEditReason, setCategoryEditReason] = useState('');

  // Status Change Confirmation Modal
  const [statusModalCity, setStatusModalCity] = useState<CityConfig | null>(null);
  const [targetStatus, setTargetStatus] = useState<CityOperatingStatus>('active');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  // Add City Modal
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [newCityData, setNewCityData] = useState<Partial<CityConfig>>({
    name: '',
    nameUrdu: '',
    province: 'Punjab',
    cityCode: '',
    status: 'active',
    active: true,
    geofenceRadiusKm: 35,
    baseFareAdjustment: 0,
    baseSurgeFactor: 1.0,
    passengerAvailability: 'available',
    allowedCategories: ['GoMoto', 'GoRide', 'GoMini', 'GoAuto', 'GoComfort', 'GoFreight'],
    centerCoords: { lat: 31.5204, lng: 74.3587 }
  });

  // Waybill / Bilty Modal
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<FreightOrder | null>(null);

  // Matrix Filter
  const [matrixCityFilter, setMatrixCityFilter] = useState<string>('All');
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('All');

  // Stats calculation
  const stats = useMemo(() => {
    return calculateOverallOperationsStats(cities, serviceCategories, cityCategoryMatrix);
  }, [cities, serviceCategories, cityCategoryMatrix]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      // Global Navbar filter sync
      if (selectedCityFilter !== 'All' && c.name.toLowerCase() !== selectedCityFilter.toLowerCase()) {
        return false;
      }
      if (provinceFilter !== 'All' && c.province !== provinceFilter) {
        return false;
      }
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }
      if (citySearchQuery.trim()) {
        const query = citySearchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchUrdu = c.nameUrdu?.toLowerCase().includes(query);
        const matchCode = c.cityCode?.toLowerCase().includes(query);
        const matchProv = c.province.toLowerCase().includes(query);
        if (!matchName && !matchUrdu && !matchCode && !matchProv) return false;
      }
      return true;
    });
  }, [cities, selectedCityFilter, provinceFilter, statusFilter, citySearchQuery]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return serviceCategories.filter((cat) => {
      if (categorySearchQuery.trim()) {
        const query = categorySearchQuery.toLowerCase();
        return (
          cat.name.toLowerCase().includes(query) ||
          cat.code.toLowerCase().includes(query) ||
          cat.vehicleType.toLowerCase().includes(query) ||
          cat.nameUrdu?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [serviceCategories, categorySearchQuery]);

  // Filtered Matrix Items
  const filteredMatrix = useMemo(() => {
    return cityCategoryMatrix.filter((item) => {
      if (selectedCityFilter !== 'All' && item.cityName.toLowerCase() !== selectedCityFilter.toLowerCase()) {
        return false;
      }
      if (matrixCityFilter !== 'All' && item.cityName !== matrixCityFilter) {
        return false;
      }
      if (matrixCategoryFilter !== 'All' && item.categoryCode !== matrixCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [cityCategoryMatrix, selectedCityFilter, matrixCityFilter, matrixCategoryFilter]);

  // Handlers
  const handleSaveCityEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    updateCity(editingCity.id, editingCity, cityEditReason || 'Administrative operations update');
    setEditingCity(null);
    setCityEditReason('');
  };

  const handleConfirmStatusChange = () => {
    if (!statusModalCity) return;
    toggleCityStatus(statusModalCity.id, targetStatus, statusChangeReason || 'Status changed via Quick Action');
    setStatusModalCity(null);
    setStatusChangeReason('');
  };

  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateServiceCategory(editingCategory.id, editingCategory, categoryEditReason || 'Policy & specifications adjustment');
    setEditingCategory(null);
    setCategoryEditReason('');
  };

  const handleCreateNewCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityData.name) return;

    const cityId = `city-${newCityData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const fullCity: CityConfig = {
      id: cityId,
      name: newCityData.name,
      nameUrdu: newCityData.nameUrdu || newCityData.name,
      province: newCityData.province || 'Punjab',
      country: 'Pakistan',
      cityCode: newCityData.cityCode || newCityData.name.slice(0, 3).toUpperCase(),
      status: (newCityData.status as CityOperatingStatus) || 'active',
      active: newCityData.status === 'active',
      passengerAvailability: (newCityData.passengerAvailability as PassengerAvailabilityStatus) || 'available',
      operatingSchedule: {
        mode: '24_7',
        timezone: 'Asia/Karachi'
      },
      allowedCategories: (newCityData.allowedCategories as RideCategory[]) || ['GoMoto', 'GoRide', 'GoMini', 'GoAuto', 'GoComfort', 'GoFreight'],
      geofenceRadiusKm: Number(newCityData.geofenceRadiusKm) || 30,
      baseFareAdjustment: Number(newCityData.baseFareAdjustment) || 0,
      baseSurgeFactor: Number(newCityData.baseSurgeFactor) || 1.0,
      driverRequirements: {
        minRating: 4.2,
        minimumRating: 4.2,
        minimumVehicleYear: 2012,
        commercialLicenseRequired: true,
        mandatoryPoliceClearance: true,
        academyTrainingRequired: true
      },
      liveStats: {
        totalDrivers: 25,
        onlineDrivers: 10,
        activeRides: 2,
        averageEtaMinutes: 6.5,
        completedTripsToday: 0
      },
      centerCoords: newCityData.centerCoords || { lat: 31.5204, lng: 74.3587 }
    };

    addCity(fullCity);
    setShowAddCityModal(false);
    setNewCityData({
      name: '',
      nameUrdu: '',
      province: 'Punjab',
      cityCode: '',
      status: 'active',
      active: true,
      geofenceRadiusKm: 35,
      baseFareAdjustment: 0,
      baseSurgeFactor: 1.0,
      passengerAvailability: 'available',
      allowedCategories: ['GoMoto', 'GoRide', 'GoMini', 'GoAuto', 'GoComfort', 'GoFreight'],
      centerCoords: { lat: 31.5204, lng: 74.3587 }
    });
  };

  return (
    <div id="cities-operations-view-root" className="space-y-6 text-[#111827]">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                City, Service Category & Operations Configuration Center
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Phase 49 Core
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized multi-city dispatch configuration, fleet vehicle standards, operational hours & cross-category matrix
              </p>
            </div>
          </div>
        </div>

        {/* Global Filter Indicator & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCityFilter !== 'All' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Filtered by: <strong>{selectedCityFilter}</strong></span>
              <button
                type="button"
                onClick={() => setSelectedCityFilter('All')}
                className="ml-1 p-0.5 hover:bg-amber-200 rounded text-amber-800 transition cursor-pointer"
                title="Reset to All Pakistan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Viewing All Pakistan Operations</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAddCityModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New City</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            Active Hubs
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{stats.activeCities}</span>
            <span className="text-xs text-slate-400 font-medium">/ {stats.totalCities} Cities</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {stats.activeCitiesPercentage}% Operating
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Service Categories
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{stats.activeCategories}</span>
            <span className="text-xs text-slate-400 font-medium">/ {stats.totalCategories} Available</span>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
            {stats.categoriesWithPassVisibility} Live in App
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Registered Drivers
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{stats.totalRegisteredDrivers.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">Captains</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {stats.totalOnlineDrivers.toLocaleString()} Currently Online
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            Active Live Rides
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-600">{stats.totalActiveRides}</span>
            <span className="text-xs text-slate-400 font-medium">Trips</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {stats.totalCompletedTripsToday.toLocaleString()} Completed Today
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            System Avg ETA
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{stats.systemAverageEta}</span>
            <span className="text-xs text-slate-400 font-medium">Minutes</span>
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
            Target SLA: &lt; 5.0 mins
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Insights
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-indigo-700">{cityAiInsights.length}</span>
            <span className="text-xs text-slate-400 font-medium">Advisories</span>
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            {cityAiInsights.filter((a) => a.impactLevel === 'high').length} High Impact
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('cities')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'cities'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Cities & Operating Hubs</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'cities' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
          }`}>
            {cities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Service Categories</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'categories' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
          }`}>
            {serviceCategories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>City + Category Matrix</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'matrix' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
          }`}>
            {cityCategoryMatrix.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'schedules'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Operating Schedules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('freight')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'freight'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Intercity & Freight Hub</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'freight' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
          }`}>
            {freightOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_insights')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'ai_insights'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-700" />
          <span>AI Demand & Optimization</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
            {cityAiInsights.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CITIES & OPERATING HUBS */}
      {/* ========================================================================= */}
      {activeTab === 'cities' && (
        <div className="space-y-4">
          {/* Filter / Search Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  placeholder="Search city by name, Urdu, code (LHE, KHI), or province..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {citySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCitySearchQuery('')}
                  className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Province:</span>
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="All">All Provinces</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital</option>
                  <option value="Khyber Pakhtunkhwa">KPK</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="temporarily_suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCities.map((city) => {
              const isCityActive = city.status === 'active' || (city.active && city.status !== 'coming_soon' && city.status !== 'temporarily_suspended');
              const scheduleMode = city.operatingSchedule?.mode || '24_7';

              return (
                <div
                  key={city.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Name, Urdu, City Code & Status */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex flex-col items-center justify-center font-black">
                          <span className="text-xs leading-none">{city.cityCode || city.name.slice(0, 3).toUpperCase()}</span>
                          <span className="text-[9px] font-medium text-slate-500 mt-0.5">PK</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-bold text-slate-900 text-base leading-snug">{city.name}</h2>
                            {city.nameUrdu && (
                              <span className="text-xs text-slate-500 font-urdu">{city.nameUrdu}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {city.province}, Pakistan
                          </span>
                        </div>
                      </div>

                      {/* Status Badge + Change Action */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusModalCity(city);
                          setTargetStatus(isCityActive ? 'inactive' : 'active');
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                          city.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : city.status === 'coming_soon'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : city.status === 'temporarily_suspended'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle or change city operational status"
                      >
                        {city.status?.replace('_', ' ') || (city.active ? 'ACTIVE' : 'INACTIVE')}
                      </button>
                    </div>

                    {/* Operational Details */}
                    <div className="py-3 space-y-2 text-xs border-b border-slate-100">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Operating Hours:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {scheduleMode === '24_7' ? (
                            <span className="text-emerald-700 font-bold">24/7 Uninterrupted</span>
                          ) : scheduleMode === 'custom_hours' ? (
                            <span className="text-amber-700 font-bold">
                              {city.operatingSchedule?.weekdayHours?.startTime || '06:00'} - {city.operatingSchedule?.weekdayHours?.endTime || '23:30'} PKT
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold">Curfew / Paused</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Compass className="w-3.5 h-3.5 text-slate-400" />
                          Geofence Radius:
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {city.geofenceRadiusKm} KM
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1 text-slate-500">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          Base Fare Adj:
                        </span>
                        <span className="font-mono font-bold text-amber-700">
                          {city.baseFareAdjustment >= 0 ? `+${city.baseFareAdjustment}` : city.baseFareAdjustment} PKR
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          Passenger App:
                        </span>
                        <span className={`font-semibold text-[11px] ${
                          city.passengerAvailability === 'available'
                            ? 'text-emerald-700 font-bold'
                            : city.passengerAvailability === 'coming_soon'
                            ? 'text-blue-700 font-bold'
                            : 'text-rose-700 font-bold'
                        }`}>
                          {city.passengerAvailability?.replace('_', ' ').toUpperCase() || 'AVAILABLE'}
                        </span>
                      </div>
                    </div>

                    {/* Supported Categories Pills */}
                    <div className="py-2.5">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                        Permitted Fleet Categories ({city.allowedCategories?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(city.allowedCategories || []).map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Driver Requirements Summary */}
                    {city.driverRequirements && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 mb-2">
                        <div className="font-bold text-slate-800 text-[10px] uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          Driver City Requirements:
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span>Min Vehicle Year: <strong>{city.driverRequirements.minimumVehicleYear || 2012}</strong></span>
                          <span>Min Rating: <strong>{city.driverRequirements.minimumRating || 4.2} ★</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                            <Check className="w-3 h-3" /> Police Clearance
                          </span>
                          <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                            <Check className="w-3 h-3" /> Commercial License
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Live Captains & Action Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Captains: <strong className="text-slate-900">{city.liveStats?.onlineDrivers ?? 0} online</strong> / {city.liveStats?.totalDrivers ?? 0}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCityFilter(city.name)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        title="Focus global dashboard on this city"
                      >
                        Focus
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCity({ ...city });
                          setCityEditReason('');
                        }}
                        className="px-3 py-1 text-[11px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No cities matching the criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query, province filter, or status filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICE CATEGORIES */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Search category code, name, vehicle type, or Urdu..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredCategories.length} Categories
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => {
              const isLive = cat.status === 'active';

              return (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center font-bold">
                          {cat.code === 'GoMoto' ? (
                            <Bike className="w-5 h-5" />
                          ) : cat.code === 'GoFreight' ? (
                            <Truck className="w-5 h-5" />
                          ) : (
                            <Car className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-bold text-slate-900 text-base">{cat.name}</h2>
                            {cat.nameUrdu && (
                              <span className="text-xs text-slate-500 font-urdu">{cat.nameUrdu}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono font-bold">
                            Code: {cat.code}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCategoryStatus(cat.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                          cat.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : cat.status === 'coming_soon'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle category operating status"
                      >
                        {cat.status.replace('_', ' ')}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 py-2.5 border-b border-slate-100">
                      {cat.description}
                    </p>

                    {/* Vehicle Specifications */}
                    <div className="py-2.5 space-y-1.5 text-xs border-b border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Vehicle Standard:
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Type:</span>
                        <strong className="text-slate-900">{cat.vehicleType}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Min Year:</span>
                        <strong className="text-slate-900">{cat.vehicleRequirements?.minModelYear || 2010}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Air Conditioning:</span>
                        <strong className={cat.vehicleRequirements?.airConditioningRequired ? 'text-emerald-700' : 'text-slate-500'}>
                          {cat.vehicleRequirements?.airConditioningRequired ? 'Mandatory' : 'Optional / N/A'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Capacity:</span>
                        <strong className="text-slate-900">
                          {cat.vehicleRequirements?.passengerSeats || 1} Pax • {cat.vehicleRequirements?.luggageCapacityBags || 0} Bags
                        </strong>
                      </div>
                    </div>

                    {/* Pricing & Driver Eligibility */}
                    <div className="py-2.5 space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Commercial & Compliance:
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Platform Commission:</span>
                        <strong className="font-mono text-amber-700">{cat.baseCommissionPercentage}%</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Booking Service Fee:</span>
                        <strong className="font-mono text-slate-900">PKR {cat.baseServiceFee}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Min Driver Rating:</span>
                        <strong className="text-slate-900">{cat.driverEligibility?.minimumRating} ★</strong>
                      </div>
                    </div>
                  </div>

                  {/* Footer Toggles */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      {cat.passengerVisibility ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Eye className="w-3.5 h-3.5" /> App Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <EyeOff className="w-3.5 h-3.5" /> Hidden
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory({ ...cat });
                        setCategoryEditReason('');
                      }}
                      className="px-3 py-1 text-[11px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Rules
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CITY + CATEGORY MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Matrix Filter Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                Cross-City Service Availability Matrix
              </h2>
              <p className="text-[11px] text-slate-500">
                Directly toggle availability, custom fare delta, and surge caps for every city-category pairing
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                <span>Filter City:</span>
                <select
                  value={matrixCityFilter}
                  onChange={(e) => setMatrixCityFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="All">All Cities</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
                <span>Category:</span>
                <select
                  value={matrixCategoryFilter}
                  onChange={(e) => setMatrixCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="All">All Categories</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.code}>{cat.name} ({cat.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-black">
                  <tr>
                    <th className="py-3 px-4">City Hub</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status & Passenger App</th>
                    <th className="py-3 px-4">Operating Hours Mode</th>
                    <th className="py-3 px-4">Fare Adjustment</th>
                    <th className="py-3 px-4">Max Surge Cap</th>
                    <th className="py-3 px-4">Active Fleet</th>
                    <th className="py-3 px-4 text-right">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrix.map((item) => {
                    const isAvail = item.availability === 'available';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                              {item.cityName.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{item.cityName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.categoryName}</div>
                          <span className="font-mono text-[10px] text-slate-400">{item.categoryCode}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.availability === 'available'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.availability === 'coming_soon'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.availability.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 font-semibold">
                          {item.operatingHoursMode === '24_7' ? (
                            <span className="text-emerald-700 font-bold">24/7 All Hours</span>
                          ) : (
                            <span className="text-amber-700 font-bold">Custom Window</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900">
                            {item.customBaseFareAdjustment >= 0 ? `+${item.customBaseFareAdjustment}` : item.customBaseFareAdjustment} PKR
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-amber-700">
                            {item.customSurgeMultiplier.toFixed(1)}x
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-700 font-bold">
                            {item.activeDriversCount || 0}
                          </span>
                          <span className="text-slate-400 text-[10px] ml-1">Captains</span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleCityCategoryAvailability(item.cityId, item.categoryCode)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                              isAvail
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isAvail ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredMatrix.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Sliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold">No matrix pairings found for selected filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OPERATING SCHEDULES & CURFEWS */}
      {/* ========================================================================= */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              City Operating Hours, Shifts & Curfew Windows
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Control when passenger ride dispatching is enabled per metropolitan area. Protect drivers during night curfews or extreme weather alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => {
              const schedule = city.operatingSchedule || { mode: '24_7', timezone: 'Asia/Karachi' };

              return (
                <div
                  key={city.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{city.name}</h3>
                        <span className="text-[11px] text-slate-500">{city.province}</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        schedule.mode === '24_7'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : schedule.mode === 'custom_hours'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {schedule.mode.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="py-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Schedule Mode:</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateCityOperatingSchedule(city.id, {
                                ...schedule,
                                mode: '24_7'
                              }, 'Set to 24/7 continuous operations');
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              schedule.mode === '24_7'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            24/7
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateCityOperatingSchedule(city.id, {
                                ...schedule,
                                mode: 'custom_hours',
                                weekdayHours: schedule.weekdayHours || { startTime: '06:00', endTime: '23:30' }
                              }, 'Set to custom operating shift window');
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              schedule.mode === 'custom_hours'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Custom
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateCityOperatingSchedule(city.id, {
                                ...schedule,
                                mode: 'curfew_paused'
                              }, 'Emergency curfew pause triggered');
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                              schedule.mode === 'curfew_paused'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Curfew
                          </button>
                        </div>
                      </div>

                      {schedule.mode === 'custom_hours' && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-2">
                          <div className="font-bold text-amber-900 text-[11px]">Shift Timing Windows:</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Start Time</span>
                              <input
                                type="time"
                                value={schedule.weekdayHours?.startTime || '06:00'}
                                onChange={(e) => {
                                  updateCityOperatingSchedule(city.id, {
                                    ...schedule,
                                    weekdayHours: {
                                      startTime: e.target.value,
                                      endTime: schedule.weekdayHours?.endTime || '23:30'
                                    }
                                  }, 'Updated weekday start time');
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">End Time</span>
                              <input
                                type="time"
                                value={schedule.weekdayHours?.endTime || '23:30'}
                                onChange={(e) => {
                                  updateCityOperatingSchedule(city.id, {
                                    ...schedule,
                                    weekdayHours: {
                                      startTime: schedule.weekdayHours?.startTime || '06:00',
                                      endTime: e.target.value
                                    }
                                  }, 'Updated weekday end time');
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Timezone: <strong>Asia/Karachi (PKT)</strong>
                          </div>
                        </div>
                      )}

                      {schedule.mode === 'curfew_paused' && (
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-[11px]">Operations Curfew Active</strong>
                            Passengers cannot book rides in {city.name}. All active drivers are notified to return to safe zones.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Status: {city.status.toUpperCase()}</span>
                    <span className="text-slate-700 font-semibold">{city.name} Command Center</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTERCITY ROUTES & FREIGHT HUB */}
      {/* ========================================================================= */}
      {activeTab === 'freight' && (
        <div className="space-y-6">
          {/* Freight Fleet Specs Info Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: 'Small: Suzuki Ravi / Bolan', payload: 'Up to 800 KG', rate: 'Rs. 45/km', laborAddon: 'Rs. 500' },
              { type: 'Medium: Hyundai Shehzore', payload: '1.5 – 2.5 Tons', rate: 'Rs. 75/km', laborAddon: 'Rs. 900' },
              { type: 'Large: Mazda / Isuzu', payload: '3.5 – 5.0 Tons', rate: 'Rs. 115/km', laborAddon: 'Rs. 1,500' },
              { type: 'Heavy: 20-40ft Container', payload: '10 – 30 Tons', rate: 'Rs. 220/km', laborAddon: 'Rs. 3,000' }
            ].map((f) => (
              <div key={f.type} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-2xs">
                <div className="font-bold text-amber-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {f.type}
                </div>
                <div className="text-slate-900 text-[11px] font-semibold mt-1">Payload: {f.payload}</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Base Tariff: {f.rate}</div>
                <div className="text-amber-800 text-[10px] mt-0.5 font-medium">Porter Addon: {f.laborAddon}</div>
              </div>
            ))}
          </div>

          {/* Intercity Routes Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-600" />
                  Active Intercity Corridors ({intercityRoutes.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fixed point-to-point intercity routes across Pakistan Motorways (M-2, M-3, M-5, M-9)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {intercityRoutes.map((route) => (
                <div key={route.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{route.fromCity}</span>
                      <ArrowRight className="w-3 h-3 text-amber-600" />
                      <span>{route.toCity}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {route.distanceKm} KM • Tolls: PKR {route.tollCharges}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-700">
                      PKR {route.fixedFare.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleIntercityRoute(route.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        route.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {route.active ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Freight Orders Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900">Active Freight Dispatches & Waybills</span>
                <p className="text-[11px] text-slate-500">Commercial cargo tracking, heavy fleet consignment and digital Bilty</p>
              </div>
              <span className="text-xs text-amber-700 font-bold">Carriage of Goods Act Compliant</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Order / Bilty Code</th>
                    <th className="py-3 px-4">Vehicle Category</th>
                    <th className="py-3 px-4">Shipper / Consignee</th>
                    <th className="py-3 px-4">Cargo Description</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Route Path</th>
                    <th className="py-3 px-4">Fare (PKR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Waybill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {freightOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.orderCode}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {order.vehicleType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-800">{order.cargoDescription}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{order.weightKg} KG</td>
                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-slate-800">{order.pickupLocation}</div>
                        <div className="text-slate-500">➔ {order.dropLocation}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatPKR(order.fare)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'in_transit'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedWaybillOrder(order)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <FileText className="w-3 h-3" />
                          Bilty
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AI DEMAND & OPTIMIZATION ADVISORIES */}
      {/* ========================================================================= */}
      {activeTab === 'ai_insights' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Operational Demand & Capacity Advisory
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Non-destructive machine learning recommendations for fleet allocation, supply bottlenecks, and curfew management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityAiInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{insight.title}</div>
                        <span className="text-[10px] text-slate-400">Target: {insight.cityName} {insight.categoryCode ? `• ${insight.categoryCode}` : ''}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      insight.impactLevel === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : insight.impactLevel === 'medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {insight.impactLevel} Impact
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 py-3 border-b border-slate-100 leading-relaxed">
                    {insight.description}
                  </p>

                  <div className="py-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 my-2 text-xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Recommended Action:
                    </div>
                    <div className="font-semibold text-slate-800">
                      {insight.recommendedAction}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Confidence: <strong>{(insight.confidenceScore * 100).toFixed(0)}%</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      // Navigate to corresponding tab or focus city
                      setSelectedCityFilter(insight.cityName);
                      setActiveTab('matrix');
                    }}
                    className="px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect In Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CITY CONFIGURATION */}
      {/* ========================================================================= */}
      {editingCity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Configure {editingCity.name}</h3>
                  <span className="text-xs text-slate-500">Unified Operations Territory & Dispatch Policy</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCity(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCityEdit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingCity.name}
                    onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Name (Urdu)</label>
                  <input
                    type="text"
                    value={editingCity.nameUrdu || ''}
                    onChange={(e) => setEditingCity({ ...editingCity, nameUrdu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-urdu"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province / Territory</label>
                  <select
                    value={editingCity.province}
                    onChange={(e) => setEditingCity({ ...editingCity, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Code (3-letter)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editingCity.cityCode || ''}
                    onChange={(e) => setEditingCity({ ...editingCity, cityCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operating Status</label>
                  <select
                    value={editingCity.status}
                    onChange={(e) => setEditingCity({
                      ...editingCity,
                      status: e.target.value as CityOperatingStatus,
                      active: e.target.value === 'active'
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="active">Active (Full Operations)</option>
                    <option value="coming_soon">Coming Soon (Preview Only)</option>
                    <option value="temporarily_suspended">Temporarily Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passenger App Availability</label>
                  <select
                    value={editingCity.passengerAvailability}
                    onChange={(e) => setEditingCity({
                      ...editingCity,
                      passengerAvailability: e.target.value as PassengerAvailabilityStatus
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="available">Available for Bookings</option>
                    <option value="coming_soon">Coming Soon Screen</option>
                    <option value="temporarily_unavailable">Temporarily Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Geofence Radius (KM)</label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={editingCity.geofenceRadiusKm}
                    onChange={(e) => setEditingCity({ ...editingCity, geofenceRadiusKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Fare Adjustment (PKR)</label>
                  <input
                    type="number"
                    value={editingCity.baseFareAdjustment}
                    onChange={(e) => setEditingCity({ ...editingCity, baseFareAdjustment: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Driver Requirements Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-xs">Driver Compliance & Fleet Eligibility for {editingCity.name}:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Min Vehicle Model Year</label>
                    <input
                      type="number"
                      value={editingCity.driverRequirements?.minimumVehicleYear || 2012}
                      onChange={(e) => setEditingCity({
                        ...editingCity,
                        driverRequirements: {
                          ...editingCity.driverRequirements,
                          minimumRating: editingCity.driverRequirements?.minimumRating || 4.2,
                          minimumVehicleYear: Number(e.target.value),
                          commercialLicenseRequired: editingCity.driverRequirements?.commercialLicenseRequired ?? true,
                          mandatoryPoliceClearance: editingCity.driverRequirements?.mandatoryPoliceClearance ?? true,
                          academyTrainingRequired: editingCity.driverRequirements?.academyTrainingRequired ?? true
                        }
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">Minimum Rating (★)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="3.0"
                      max="5.0"
                      value={editingCity.driverRequirements?.minimumRating || 4.2}
                      onChange={(e) => setEditingCity({
                        ...editingCity,
                        driverRequirements: {
                          ...editingCity.driverRequirements,
                          minimumRating: Number(e.target.value),
                          minimumVehicleYear: editingCity.driverRequirements?.minimumVehicleYear || 2012,
                          commercialLicenseRequired: editingCity.driverRequirements?.commercialLicenseRequired ?? true,
                          mandatoryPoliceClearance: editingCity.driverRequirements?.mandatoryPoliceClearance ?? true,
                          academyTrainingRequired: editingCity.driverRequirements?.academyTrainingRequired ?? true
                        }
                      })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Reason for Audit Log */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Administrative Reason / Justification (Logged to Audit Trail) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Provincial fare tariff revision, expansion into suburban geofence"
                  value={cityEditReason}
                  onChange={(e) => setCityEditReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCity(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SERVICE CATEGORY */}
      {/* ========================================================================= */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-700">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Edit {editingCategory.name}</h3>
                  <span className="text-xs text-slate-500">Vehicle Standards, Passenger Visibility & Commission</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryEdit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name in Urdu</label>
                  <input
                    type="text"
                    value={editingCategory.nameUrdu || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, nameUrdu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-urdu"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Status</label>
                  <select
                    value={editingCategory.status}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      status: e.target.value as CategoryOperatingStatus
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Platform Commission (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={editingCategory.baseCommissionPercentage}
                    onChange={(e) => setEditingCategory({ ...editingCategory, baseCommissionPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Fee (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCategory.baseServiceFee}
                    onChange={(e) => setEditingCategory({ ...editingCategory, baseServiceFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Vehicle Year</label>
                  <input
                    type="number"
                    value={editingCategory.vehicleRequirements?.minModelYear || 2010}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      vehicleRequirements: {
                        ...editingCategory.vehicleRequirements,
                        minModelYear: Number(e.target.value),
                        airConditioningRequired: editingCategory.vehicleRequirements?.airConditioningRequired ?? false,
                        passengerSeats: editingCategory.vehicleRequirements?.passengerSeats || 4,
                        luggageCapacityBags: editingCategory.vehicleRequirements?.luggageCapacityBags || 1,
                        allowedFuelTypes: editingCategory.vehicleRequirements?.allowedFuelTypes || ['Petrol']
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 py-2 border-y border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.passengerVisibility}
                    onChange={(e) => setEditingCategory({ ...editingCategory, passengerVisibility: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800">Show in Passenger Mobile App</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.bookingEnabled}
                    onChange={(e) => setEditingCategory({ ...editingCategory, bookingEnabled: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800">Booking Dispatch Enabled</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.vehicleRequirements?.airConditioningRequired ?? false}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      vehicleRequirements: {
                        ...editingCategory.vehicleRequirements,
                        minModelYear: editingCategory.vehicleRequirements?.minModelYear || 2010,
                        airConditioningRequired: e.target.checked,
                        passengerSeats: editingCategory.vehicleRequirements?.passengerSeats || 4,
                        luggageCapacityBags: editingCategory.vehicleRequirements?.luggageCapacityBags || 1,
                        allowedFuelTypes: editingCategory.vehicleRequirements?.allowedFuelTypes || ['Petrol']
                      }
                    })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-800">Mandatory Air Conditioning</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Reason for Modification (Audit Log) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revised passenger luggage limits and adjusted platform service fee"
                  value={categoryEditReason}
                  onChange={(e) => setCategoryEditReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK CITY STATUS TOGGLE WITH AUDIT REASON */}
      {/* ========================================================================= */}
      {statusModalCity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Update Status for {statusModalCity.name}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Changing this operational status affects driver dispatching and passenger app visibility. Historical records will not be altered.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Operational Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as CityOperatingStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="active">Active (Full Operations)</option>
                  <option value="coming_soon">Coming Soon (Upcoming City)</option>
                  <option value="temporarily_suspended">Temporarily Suspended (Emergency/Weather)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Reason for Status Change <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="Explain why this status change is being implemented..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalCity(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW OPERATIONAL CITY */}
      {/* ========================================================================= */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Add New Operational City</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCity} className="space-y-3 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bahawalpur"
                    value={newCityData.name}
                    onChange={(e) => setNewCityData({ ...newCityData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Name (Urdu)</label>
                  <input
                    type="text"
                    placeholder="بہاولپور"
                    value={newCityData.nameUrdu || ''}
                    onChange={(e) => setNewCityData({ ...newCityData, nameUrdu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-urdu"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province</label>
                  <select
                    value={newCityData.province}
                    onChange={(e) => setNewCityData({ ...newCityData, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. BWP"
                    value={newCityData.cityCode || ''}
                    onChange={(e) => setNewCityData({ ...newCityData, cityCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Geofence Radius (KM)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newCityData.geofenceRadiusKm}
                    onChange={(e) => setNewCityData({ ...newCityData, geofenceRadiusKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Fare Adj (PKR)</label>
                  <input
                    type="number"
                    value={newCityData.baseFareAdjustment}
                    onChange={(e) => setNewCityData({ ...newCityData, baseFareAdjustment: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs"
                >
                  Create City Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIGITAL WAYBILL / BILTY FOR FREIGHT */}
      {/* ========================================================================= */}
      {selectedWaybillOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Digital Waybill / Bilty</h3>
                  <span className="text-xs font-mono text-slate-500">Document #{selectedWaybillOrder.orderCode}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWaybillOrder(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Shipper / Consignor</span>
                  <div className="font-bold text-slate-900">{selectedWaybillOrder.customerName}</div>
                  <div className="font-mono text-slate-500 text-[11px]">{selectedWaybillOrder.customerPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Assigned Truck</span>
                  <div className="font-bold text-amber-700">{selectedWaybillOrder.vehicleType}</div>
                  <div className="text-[11px] text-slate-600">Status: {selectedWaybillOrder.status.toUpperCase()}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Origin (Pickup)</span>
                  <div className="text-slate-800 text-[11px]">{selectedWaybillOrder.pickupLocation}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Destination (Consignee)</span>
                  <div className="text-slate-800 text-[11px]">{selectedWaybillOrder.dropLocation}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Cargo Manifest</span>
                  <div className="font-bold text-slate-900">{selectedWaybillOrder.cargoDescription}</div>
                  <div className="text-[11px] text-slate-500">Gross Weight: {selectedWaybillOrder.weightKg} KG</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Total Bilty Charge</span>
                  <div className="text-base font-extrabold text-amber-700 font-mono">
                    {formatPKR(selectedWaybillOrder.fare)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Certified under Pakistani Carriage of Goods Act & National Highway Authority Regulations.</span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedWaybillOrder(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl"
              >
                Close Bilty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
