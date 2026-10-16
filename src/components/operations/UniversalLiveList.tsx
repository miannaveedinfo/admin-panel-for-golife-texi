import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Ride, Driver, Passenger, OperationsAlert, LocationFreshness } from '../../types';
import { SelectedEntity } from './LiveOperationsMap';
import {
  Search,
  Car,
  Users,
  Navigation,
  AlertTriangle,
  Radio,
  Clock,
  MapPin,
  CheckCircle,
  Phone,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';

interface UniversalLiveListProps {
  selectedCity?: string;
  selectedEntity: SelectedEntity | null;
  onSelectEntity: (entity: SelectedEntity) => void;
  activeTabFilter?: 'all' | 'drivers' | 'rides' | 'passengers' | 'alerts';
  onTabChange?: (tab: 'all' | 'drivers' | 'rides' | 'passengers' | 'alerts') => void;
  statusFilter?: string;
  categoryFilter?: string;
  driverStatusFilter?: string;
}

export const UniversalLiveList: React.FC<UniversalLiveListProps> = ({
  selectedCity = 'All',
  selectedEntity,
  onSelectEntity,
  activeTabFilter = 'all',
  onTabChange,
  statusFilter = 'all',
  categoryFilter = 'all',
  driverStatusFilter = 'all'
}) => {
  const {
    rides = [],
    drivers = [],
    passengers = [],
    operationsAlerts = [],
    isSimulationActive = true
  } = useAdmin();

  const safeRides = rides || [];
  const safeDrivers = drivers || [];
  const safePassengers = passengers || [];
  const safeAlerts = operationsAlerts || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [internalTab, setInternalTab] = useState<'all' | 'drivers' | 'rides' | 'passengers' | 'alerts'>('all');

  const currentTab = onTabChange ? activeTabFilter : internalTab;
  const setTab = (t: 'all' | 'drivers' | 'rides' | 'passengers' | 'alerts') => {
    if (onTabChange) {
      onTabChange(t);
    } else {
      setInternalTab(t);
    }
  };

  // Helper to determine accurate location freshness
  const getFreshness = (
    type: 'driver' | 'passenger' | 'ride',
    item: Driver | Passenger | Ride
  ): { status: LocationFreshness; label: string; dotColor: string } => {
    if (type === 'driver') {
      const d = item as Driver;
      if (d.status === 'offline' || d.accountStatus === 'suspended') {
        return { status: 'OFFLINE', label: 'Offline', dotColor: 'bg-slate-400' };
      }
      if (d.status === 'on_trip' || d.operationalStatus === 'going_to_pickup' || d.operationalStatus === 'at_pickup') {
        return { status: 'LIVE', label: 'Live GPS', dotColor: 'bg-emerald-500 animate-pulse' };
      }
      if (d.status === 'online') {
        return { status: 'RECENT', label: 'Recent (<30s)', dotColor: 'bg-amber-400' };
      }
      return { status: 'STALE', label: 'Stale (>60s)', dotColor: 'bg-orange-500' };
    }

    if (type === 'ride') {
      const r = item as Ride;
      if (r.status === 'in_progress') {
        return { status: 'LIVE', label: 'Live Route', dotColor: 'bg-emerald-500 animate-pulse' };
      }
      if (r.status === 'driver_assigned' || r.status === 'arrived') {
        return { status: 'LIVE', label: 'Live Dispatch', dotColor: 'bg-sky-500 animate-pulse' };
      }
      if (r.status === 'searching') {
        return { status: 'RECENT', label: 'Matching Pool', dotColor: 'bg-amber-400' };
      }
      return { status: 'OFFLINE', label: 'Ended', dotColor: 'bg-slate-400' };
    }

    if (type === 'passenger') {
      const p = item as Passenger;
      const hasActiveRide = rides.some(
        (r) => r.passengerId === p.id && (r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived')
      );
      if (hasActiveRide) {
        return { status: 'LIVE', label: 'Active Trip', dotColor: 'bg-violet-500 animate-pulse' };
      }
      return { status: 'OFFLINE', label: 'Offline', dotColor: 'bg-slate-300' };
    }

    return { status: 'RECENT', label: 'Recent', dotColor: 'bg-amber-400' };
  };

  // Filter Drivers
  const filteredDrivers = useMemo(() => {
    return safeDrivers.filter((d) => {
      const normCity = (selectedCity || 'All').toLowerCase();
      if (normCity !== 'all' && (d.city || '').toLowerCase() !== normCity) {
        return false;
      }
      if (categoryFilter !== 'all' && d.vehicle.category !== categoryFilter) {
        return false;
      }
      if (driverStatusFilter !== 'all') {
        const op = d.operationalStatus || (d.status === 'on_trip' ? 'on_ride' : d.status);
        if (driverStatusFilter === 'online' && d.status !== 'online' && d.status !== 'on_trip') return false;
        if (driverStatusFilter === 'available' && op !== 'available') return false;
        if (driverStatusFilter === 'on_ride' && op !== 'on_ride') return false;
        if (driverStatusFilter === 'offline' && d.status !== 'offline') return false;
      }
      if (statusFilter !== 'all') {
        const f = getFreshness('driver', d).status.toLowerCase();
        if (f !== statusFilter.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.vehicle.plate.toLowerCase().includes(q) ||
          d.vehicle.model.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [safeDrivers, selectedCity, categoryFilter, driverStatusFilter, statusFilter, searchQuery]);

  // Filter Rides
  const filteredRides = useMemo(() => {
    return safeRides.filter((r) => {
      const normCity = (selectedCity || 'All').toLowerCase();
      if (normCity !== 'all' && (r.city || '').toLowerCase() !== normCity) {
        return false;
      }
      if (categoryFilter !== 'all' && r.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const f = getFreshness('ride', r).status.toLowerCase();
        if (f !== statusFilter.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.rideCode.toLowerCase().includes(q) ||
          r.passengerName.toLowerCase().includes(q) ||
          r.passengerPhone.includes(q) ||
          (r.driverName && r.driverName.toLowerCase().includes(q)) ||
          (r.driverPlate && r.driverPlate.toLowerCase().includes(q)) ||
          r.pickup.address.toLowerCase().includes(q) ||
          r.destination.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [safeRides, selectedCity, categoryFilter, statusFilter, searchQuery]);

  // Active Rides Only
  const activeRides = useMemo(() => {
    return filteredRides.filter(
      (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'searching'
    );
  }, [filteredRides]);

  // Filter Passengers
  const filteredPassengers = useMemo(() => {
    return safePassengers.filter((p) => {
      const normCity = (selectedCity || 'All').toLowerCase();
      if (normCity !== 'all' && (p.city || '').toLowerCase() !== normCity) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q);
      }
      return true;
    });
  }, [safePassengers, selectedCity, searchQuery]);

  // Filter Alerts
  const filteredAlerts = useMemo(() => {
    return safeAlerts.filter((a) => {
      const normCity = (selectedCity || 'All').toLowerCase();
      if (normCity !== 'all' && (a.city || '').toLowerCase() !== normCity) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.code.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [safeAlerts, selectedCity, searchQuery]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-full overflow-hidden shadow-xs">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver, plate, passenger, ride ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setTab('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab('drivers')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'drivers'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Drivers
            <span className={`text-[10px] px-1 rounded-full font-mono font-bold ${
              currentTab === 'drivers' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredDrivers.length}
            </span>
          </button>
          <button
            onClick={() => setTab('rides')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'rides'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Rides
            <span className={`text-[10px] px-1 rounded-full font-mono font-bold ${
              currentTab === 'rides' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {activeRides.length}
            </span>
          </button>
          <button
            onClick={() => setTab('passengers')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'passengers'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Passengers
            <span className={`text-[10px] px-1 rounded-full font-mono font-bold ${
              currentTab === 'passengers' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredPassengers.length}
            </span>
          </button>
          <button
            onClick={() => setTab('alerts')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'alerts'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Alerts
            <span className={`text-[10px] px-1 rounded-full font-mono font-bold ${
              currentTab === 'alerts' ? 'bg-white/30 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {filteredAlerts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Entity Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {/* TAB: ALL OR DRIVERS */}
        {(currentTab === 'all' || currentTab === 'drivers') && (
          <div>
            {currentTab === 'all' && (
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Fleet Drivers ({filteredDrivers.length})</span>
                <Car className="w-3 h-3" />
              </div>
            )}
            {filteredDrivers.map((driver) => {
              const isSelected = selectedEntity?.type === 'driver' && selectedEntity.id === driver.id;
              const freshness = getFreshness('driver', driver);
              const activeRide = rides.find((r) => r.id === driver.activeRideId);

              return (
                <div
                  key={`drv-card-${driver.id}`}
                  onClick={() => onSelectEntity({ type: 'driver', id: driver.id })}
                  className={`p-3 transition cursor-pointer flex items-start justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-amber-50/80 border-l-4 border-amber-500 shadow-2xs'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border border-white ${freshness.dotColor}`} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {driver.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700">
                          {driver.vehicle.plate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="truncate">{driver.vehicle.model}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{driver.city}</span>
                      </div>

                      {activeRide ? (
                        <div className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/60 inline-flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5 text-sky-600" />
                          Trip: {activeRide.rideCode} ({activeRide.etaMinutes ?? 5}m ETA)
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold uppercase tracking-tight text-slate-500">
                          Status: <span className={driver.status === 'online' ? 'text-emerald-600' : 'text-slate-600'}>{driver.operationalStatus || driver.status}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      freshness.status === 'LIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : freshness.status === 'RECENT'
                        ? 'bg-amber-100 text-amber-800'
                        : freshness.status === 'STALE'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {freshness.status}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-amber-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: ALL OR RIDES */}
        {(currentTab === 'all' || currentTab === 'rides') && (
          <div>
            {currentTab === 'all' && (
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Active Rides ({activeRides.length})</span>
                <Navigation className="w-3 h-3" />
              </div>
            )}
            {activeRides.map((ride) => {
              const isSelected = selectedEntity?.type === 'ride' && selectedEntity.id === ride.id;
              const freshness = getFreshness('ride', ride);

              return (
                <div
                  key={`ride-card-${ride.id}`}
                  onClick={() => onSelectEntity({ type: 'ride', id: ride.id })}
                  className={`p-3 transition cursor-pointer flex items-start justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-sky-50/80 border-l-4 border-sky-500 shadow-2xs'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 border border-sky-200">
                      <Navigation className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {ride.rideCode}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {ride.category}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 truncate">
                        Pass: <strong className="text-slate-900">{ride.passengerName}</strong> • {ride.city}
                      </div>

                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{ride.destination.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                    <span className="text-xs font-black font-mono text-slate-950">
                      {formatPKR(ride.fare)}
                    </span>
                    <span className="text-[10px] text-sky-700 font-bold">
                      {ride.etaMinutes ? `${ride.etaMinutes}m ETA` : 'Arrived'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: PASSENGERS */}
        {(currentTab === 'all' || currentTab === 'passengers') && (
          <div>
            {currentTab === 'all' && (
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Passengers ({filteredPassengers.length})</span>
                <Users className="w-3 h-3" />
              </div>
            )}
            {filteredPassengers.map((passenger) => {
              const isSelected = selectedEntity?.type === 'passenger' && selectedEntity.id === passenger.id;
              const freshness = getFreshness('passenger', passenger);
              const activeRide = rides.find(
                (r) => r.passengerId === passenger.id && (r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived')
              );

              return (
                <div
                  key={`pass-card-${passenger.id}`}
                  onClick={() => onSelectEntity({ type: 'passenger', id: passenger.id })}
                  className={`p-3 transition cursor-pointer flex items-start justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-violet-50/80 border-l-4 border-violet-500 shadow-2xs'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={passenger.avatar}
                        alt={passenger.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border border-white ${freshness.dotColor}`} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {passenger.name}
                        </span>
                        <span className="text-[10px] text-amber-500 font-bold">
                          {passenger.rating}★
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {passenger.phone} • <span className="font-semibold text-slate-700">{passenger.city}</span>
                      </div>

                      {activeRide ? (
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.2 rounded border border-violet-200/60 inline-block">
                          On Active Trip #{activeRide.rideCode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {passenger.totalRides} completed trips
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {freshness.label}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-violet-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: ALERTS */}
        {currentTab === 'alerts' && (
          <div>
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-600">All Operations Clear</p>
                <p className="text-[11px]">No active telemetry alerts in {selectedCity}</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedEntity?.type === 'alert' && selectedEntity.id === alert.id;

                return (
                  <div
                    key={`alert-card-${alert.id}`}
                    onClick={() => onSelectEntity({ type: 'alert', id: alert.id })}
                    className={`p-3 transition cursor-pointer flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-rose-50/90 border-l-4 border-rose-500 shadow-2xs'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-rose-200">
                        <AlertTriangle className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {alert.title}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            alert.priority === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {alert.priority}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 line-clamp-2">
                          {alert.description}
                        </div>

                        <div className="text-[10px] text-slate-400">
                          {alert.city} • {alert.code}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-rose-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
