import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Driver, DriverOperationalStatus, Ride } from '../../types';
import {
  Users,
  Car,
  CheckCircle,
  Clock,
  Navigation,
  MapPin,
  Ban,
  ShieldAlert,
  Search,
  ChevronDown,
  Eye,
  Radio,
  SlidersHorizontal,
  Phone
} from 'lucide-react';

interface DriverLiveStatusBoardProps {
  selectedCity: string;
  onViewDriver: (driver: Driver) => void;
  onSelectRide: (rideId: string) => void;
}

export const DriverLiveStatusBoard: React.FC<DriverLiveStatusBoardProps> = ({
  selectedCity,
  onViewDriver,
  onSelectRide
}) => {
  const { drivers, rides, updateDriverOperationalStatus } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [driverSearch, setDriverSearch] = useState<string>('');
  const [overrideMenuDriverId, setOverrideMenuDriverId] = useState<string | null>(null);

  // Filter drivers
  const filteredDrivers = drivers.filter((driver) => {
    // City
    if (selectedCity !== 'All' && driver.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    // Category
    if (categoryFilter !== 'all' && driver.vehicle.category !== categoryFilter) {
      return false;
    }
    // Operational status filter
    if (statusFilter !== 'all') {
      const op = driver.operationalStatus || (driver.status === 'on_trip' ? 'on_ride' : driver.status);
      if (statusFilter === 'available' && op !== 'available') return false;
      if (statusFilter === 'on_ride' && op !== 'on_ride') return false;
      if (statusFilter === 'going_to_pickup' && op !== 'going_to_pickup') return false;
      if (statusFilter === 'at_pickup' && op !== 'at_pickup') return false;
      if (statusFilter === 'finding_ride' && op !== 'finding_ride') return false;
      if (statusFilter === 'offline' && driver.status !== 'offline') return false;
      if (statusFilter === 'suspended' && driver.status !== 'suspended') return false;
    }
    // Search
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      const matchName = driver.name.toLowerCase().includes(q);
      const matchPhone = driver.phone.includes(q);
      const matchPlate = driver.vehicle.plate.toLowerCase().includes(q);
      const matchModel = driver.vehicle.model.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchPlate && !matchModel) return false;
    }
    return true;
  });

  const getStatusBadge = (driver: Driver) => {
    const op = driver.operationalStatus || (driver.status === 'on_trip' ? 'on_ride' : driver.status);
    switch (op) {
      case 'available':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available
          </span>
        );
      case 'going_to_pickup':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-sky-600 animate-pulse" />
            Going to Pickup
          </span>
        );
      case 'at_pickup':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-600" />
            At Pickup
          </span>
        );
      case 'on_ride':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
            <Car className="w-3 h-3 text-teal-600" />
            On Ride
          </span>
        );
      case 'finding_ride':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            Finding Ride
          </span>
        );
      case 'offline':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Offline
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <Ban className="w-3 h-3 text-rose-600" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {driver.status}
          </span>
        );
    }
  };

  const operationalTabs = [
    { key: 'all', label: 'All Fleet' },
    { key: 'available', label: 'Available' },
    { key: 'finding_ride', label: 'Finding' },
    { key: 'going_to_pickup', label: 'Going to Pickup' },
    { key: 'at_pickup', label: 'At Pickup' },
    { key: 'on_ride', label: 'On Ride' },
    { key: 'offline', label: 'Offline' },
    { key: 'suspended', label: 'Suspended' }
  ];

  return (
    <div className="space-y-4">
      {/* Board Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0F766E]" />
            <span>Driver Live Operational Board</span>
          </h2>
          <p className="text-xs text-[#6B7280]">
            Monitoring real-time telemetry, location pings, and active ride assignments across Pakistani sectors
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver / plate..."
              value={driverSearch}
              onChange={(e) => setDriverSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-48"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="all">All Vehicles</option>
            <option value="GoMoto">GoMoto</option>
            <option value="GoAuto">GoAuto</option>
            <option value="GoMini">GoMini</option>
            <option value="GoRide">GoRide</option>
            <option value="GoComfort">GoComfort</option>
            <option value="GoFreight">GoFreight</option>
          </select>
        </div>
      </div>

      {/* Operational Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {operationalTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Driver Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredDrivers.map((driver) => {
          // Find if driver has an active ride
          const activeRide = rides.find(
            (r) =>
              r.driverId === driver.id &&
              (r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'in_progress')
          );

          return (
            <div
              key={driver.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3 relative hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
                      <span>{driver.name}</span>
                      <span className="text-amber-500 text-xs font-bold">★ {driver.rating}</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="font-mono">{driver.phone}</span>
                      <span>•</span>
                      <span>{driver.city}</span>
                    </div>
                  </div>
                </div>

                {getStatusBadge(driver)}
              </div>

              {/* Vehicle & Telemetry Details */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs">
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-bold">VEHICLE</span>
                  <span className="font-bold text-[#111827]">
                    {driver.vehicle.model} ({driver.vehicle.category})
                  </span>
                  <div className="font-mono font-bold text-[#0F766E] text-[11px]">
                    {driver.vehicle.plate}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] block font-bold">TELEMETRY PING</span>
                  <span className="text-[#111827] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {driver.lastPingTime || '2s ago (Active)'}
                  </span>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">
                    Speed: {driver.status === 'on_trip' ? '38 km/h' : '0 km/h (Idle)'}
                  </div>
                </div>
              </div>

              {/* Active Ride Tag if on trip */}
              {activeRide ? (
                <div
                  onClick={() => onSelectRide(activeRide.id)}
                  className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-xs flex items-center justify-between cursor-pointer hover:bg-teal-100 transition"
                >
                  <div className="truncate">
                    <span className="font-bold text-teal-900 block text-[10px]">CURRENT ASSIGNMENT</span>
                    <span className="font-mono font-bold text-teal-800">{activeRide.rideCode}</span>
                    <span className="text-teal-700 text-[11px] ml-1.5 truncate">
                      → {activeRide.destination?.address ? activeRide.destination.address.split(',')[0] : 'Destination'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F766E] underline shrink-0">
                    Track
                  </span>
                </div>
              ) : (
                <div className="p-1.5 text-center text-[11px] text-[#6B7280] rounded-xl bg-slate-50/50">
                  No active ride assignment currently
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <button
                  onClick={() => onViewDriver(driver)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Full Profile</span>
                </button>

                {/* Status Override dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOverrideMenuDriverId(overrideMenuDriverId === driver.id ? null : driver.id)
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-[#111827] font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                    <span>Set Status</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {overrideMenuDriverId === driver.id && (
                    <div className="absolute right-0 bottom-8 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-30 p-1.5 space-y-1 text-xs">
                      <div className="px-2 py-1 text-[10px] font-bold text-[#6B7280] uppercase">
                        Admin Status Override
                      </div>
                      <button
                        onClick={() => {
                          updateDriverOperationalStatus(driver.id, 'available');
                          setOverrideMenuDriverId(null);
                        }}
                        className="w-full text-left px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold"
                      >
                        ✓ Mark Available
                      </button>
                      <button
                        onClick={() => {
                          updateDriverOperationalStatus(driver.id, 'offline');
                          setOverrideMenuDriverId(null);
                        }}
                        className="w-full text-left px-2 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
                      >
                        ✕ Mark Offline
                      </button>
                      <button
                        onClick={() => {
                          updateDriverOperationalStatus(driver.id, 'suspended');
                          setOverrideMenuDriverId(null);
                        }}
                        className="w-full text-left px-2 py-1 text-rose-700 hover:bg-rose-50 rounded-lg font-bold"
                      >
                        ⛔ Suspend Driver
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredDrivers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-[#111827]">No drivers match the chosen filter</div>
            <p className="text-xs text-[#6B7280]">Try clearing the search or choosing a different operational tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};
