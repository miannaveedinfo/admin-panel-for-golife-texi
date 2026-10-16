import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Driver } from '../types';
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Car,
  Star,
  Clock,
  Phone,
  Radio,
  Eye,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface DriverLiveTrackingTabProps {
  onOpenDriverProfile: (driver: Driver) => void;
}

export const DriverLiveTrackingTab: React.FC<DriverLiveTrackingTabProps> = ({
  onOpenDriverProfile
}) => {
  const { drivers, rides, showToast } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'available' | 'on_ride' | 'offline' | 'suspended'>('all');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(drivers[0] || null);

  // Compute status for each driver
  const driversWithLiveStatus = drivers.map((d) => {
    const isSuspended = d.accountStatus === 'suspended';
    const activeRide = rides.find((r) => r.driverId === d.id && (r.status === 'accepted' || r.status === 'in_progress'));
    let liveCategory: 'suspended' | 'on_ride' | 'available' | 'offline' = 'offline';

    if (isSuspended) {
      liveCategory = 'suspended';
    } else if (activeRide) {
      liveCategory = 'on_ride';
    } else if (d.status === 'online') {
      liveCategory = 'available';
    } else {
      liveCategory = 'offline';
    }

    // Coordinates fallback if not set
    const lat = d.currentLocation?.lat || 31.5204 + (Math.sin(Number(d.id.replace(/\D/g, '')) || 1) * 0.05);
    const lng = d.currentLocation?.lng || 74.3587 + (Math.cos(Number(d.id.replace(/\D/g, '')) || 1) * 0.05);

    return {
      ...d,
      liveCategory,
      activeRide,
      mapLat: lat,
      mapLng: lng
    };
  });

  // Filter
  const filteredDrivers = driversWithLiveStatus.filter((d) => {
    if (cityFilter !== 'All' && d.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'online' && (d.liveCategory !== 'available' && d.liveCategory !== 'on_ride')) {
      return false;
    }
    if (statusFilter === 'available' && d.liveCategory !== 'available') {
      return false;
    }
    if (statusFilter === 'on_ride' && d.liveCategory !== 'on_ride') {
      return false;
    }
    if (statusFilter === 'offline' && d.liveCategory !== 'offline') {
      return false;
    }
    if (statusFilter === 'suspended' && d.liveCategory !== 'suspended') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.vehicle.plate.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countAvailable = driversWithLiveStatus.filter((d) => d.liveCategory === 'available').length;
  const countOnRide = driversWithLiveStatus.filter((d) => d.liveCategory === 'on_ride').length;
  const countOffline = driversWithLiveStatus.filter((d) => d.liveCategory === 'offline').length;
  const countSuspended = driversWithLiveStatus.filter((d) => d.liveCategory === 'suspended').length;

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Top Telemetry Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${driversWithLiveStatus.length})` },
            { id: 'available', label: `Available (${countAvailable})`, color: 'bg-emerald-50 text-[#10B981] border-emerald-300' },
            { id: 'on_ride', label: `On Active Ride (${countOnRide})`, color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
            { id: 'offline', label: `Offline (${countOffline})`, color: 'bg-slate-100 text-[#6B7280]' },
            { id: 'suspended', label: `Suspended (${countSuspended})`, color: 'bg-rose-50 text-rose-700 border-rose-300' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition border cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                  : item.color || 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* City Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
          >
            <option value="All">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Peshawar">Peshawar</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver, plate..."
              className="pl-8 pr-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] w-40"
            />
          </div>
        </div>
      </div>

      {/* Main Map & Driver Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 h-[560px] relative overflow-hidden flex flex-col shadow-inner">
          {/* Map Top Bar */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-center gap-2 shadow-lg">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>
                Live GPS Telemetry: <strong className="text-white">{filteredDrivers.length}</strong> drivers tracked
              </span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700">
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> On Trip
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Suspended
              </span>
            </div>
          </div>

          {/* Interactive Map Surface (Simulated Vector Map Canvas) */}
          <div className="relative w-full h-full bg-[#1e293b] flex items-center justify-center select-none overflow-hidden">
            {/* Grid Lines to simulate GIS map grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-slate-500" width="100%" height="100%">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>

            {/* Pakistan Major City Landmarks Visual Background */}
            <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col justify-between p-12 text-[10px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>ISLAMABAD / RAWALPINDI CORRIDOR</span>
                <span>PESHAWAR RING ROAD</span>
              </div>
              <div className="text-center text-xs tracking-widest text-slate-500">
                GOLIFE HIGH-PRECISION FLEET TELEMETRY
              </div>
              <div className="flex justify-between">
                <span>LAHORE CANAL / MALL ROAD</span>
                <span>KARACHI SHAHRAH-E-FAISAL</span>
              </div>
            </div>

            {/* Interactive Driver Markers */}
            <div className="absolute inset-0 p-8">
              {filteredDrivers.map((driver, index) => {
                // Generate deterministic position within canvas box
                const topPct = 15 + ((index * 29 + 17) % 68);
                const leftPct = 12 + ((index * 37 + 23) % 76);
                const isSelected = selectedDriver?.id === driver.id;

                let markerColor = 'bg-slate-500';
                let ringColor = 'border-slate-400';
                if (driver.liveCategory === 'available') {
                  markerColor = 'bg-emerald-500';
                  ringColor = 'border-emerald-400 shadow-emerald-500/50';
                } else if (driver.liveCategory === 'on_ride') {
                  markerColor = 'bg-indigo-500';
                  ringColor = 'border-indigo-400 shadow-indigo-500/50';
                } else if (driver.liveCategory === 'suspended') {
                  markerColor = 'bg-rose-600';
                  ringColor = 'border-rose-400 shadow-rose-500/50';
                }

                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    {/* Marker Pin */}
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full ${markerColor} text-white shadow-lg border-2 ${ringColor}`}
                    >
                      <Car className="w-4 h-4" />
                      {driver.liveCategory === 'available' && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping" />
                      )}
                    </div>

                    {/* Compact Label */}
                    <div className="mt-1 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap text-center border border-slate-700">
                      {(driver.name || 'Driver').split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Bottom Information Drawer */}
          {selectedDriver && (
            <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">
                  {selectedDriver.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{selectedDriver.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {selectedDriver.vehicle.plate}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-300">
                      {selectedDriver.city}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{selectedDriver.vehicle.make} {selectedDriver.vehicle.model} ({selectedDriver.vehicle.color})</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" /> {selectedDriver.rating}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300 font-mono">{selectedDriver.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDriverProfile(selectedDriver)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Control Center</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side List of Tracked Drivers */}
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111827]">
              Fleet Telemetry ({filteredDrivers.length})
            </h3>
            <span className="text-[10px] text-[#6B7280]">Real-time GPS Pings</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB] space-y-1 mt-2 pr-1">
            {filteredDrivers.map((d) => {
              const isSelected = selectedDriver?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDriver(d)}
                  className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-slate-100 border border-[#0F766E]/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-[#111827] flex items-center gap-1.5">
                      {d.name}
                      <span className="text-[10px] font-mono text-[#6B7280]">({d.vehicle.plate})</span>
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5">
                      {d.vehicle.make} {d.vehicle.model} • {d.city}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.liveCategory === 'available'
                          ? 'bg-emerald-50 text-[#10B981]'
                          : d.liveCategory === 'on_ride'
                          ? 'bg-indigo-50 text-indigo-700'
                          : d.liveCategory === 'suspended'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-[#6B7280]'
                      }`}
                    >
                      {d.liveCategory.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="text-[9px] text-[#6B7280] font-mono mt-0.5">
                      ★ {d.rating}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
