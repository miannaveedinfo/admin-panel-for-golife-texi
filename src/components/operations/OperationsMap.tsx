import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Ride, Driver, OperationsAlert } from '../../types';
import {
  Compass,
  MapPin,
  Navigation,
  Car,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  Phone,
  Clock,
  Gauge,
  X,
  AlertTriangle,
  Send
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';

interface OperationsMapProps {
  selectedCity: string;
  selectedRideId: string | null;
  onSelectRide: (rideId: string) => void;
  onOpenDispatch: (ride: Ride) => void;
  onTrackAlert: (alert: OperationsAlert) => void;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  selectedCity,
  selectedRideId,
  onSelectRide,
  onOpenDispatch,
  onTrackAlert
}) => {
  const { rides, drivers, operationsAlerts, isSimulationActive } = useAdmin();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [activeTabLayer, setActiveTabLayer] = useState<'all' | 'rides' | 'drivers' | 'alerts'>('all');

  // Filter items by city
  const cityRides = selectedCity === 'All'
    ? rides
    : rides.filter((r) => r.city.toLowerCase() === selectedCity.toLowerCase());

  const activeRides = cityRides.filter(
    (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'searching'
  );

  const currentRide = activeRides.find((r) => r.id === selectedRideId) || activeRides[0];

  const cityDrivers = selectedCity === 'All'
    ? drivers
    : drivers.filter((d) => d.city.toLowerCase() === selectedCity.toLowerCase());

  const cityAlerts = selectedCity === 'All'
    ? operationsAlerts
    : operationsAlerts.filter((a) => a.city.toLowerCase() === selectedCity.toLowerCase());

  const criticalAlerts = cityAlerts.filter(
    (a) => a.status !== 'resolved' && (a.priority === 'critical' || a.priority === 'high')
  );

  // Synthesize realistic map coordinate projections (percentages 10% - 90%)
  const getRideCoordinates = (ride: Ride) => {
    // Hash ride ID to create stable distinct visually balanced positions
    const hash = (str: string) => (str || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const h = hash(ride.id);
    const pickupX = 18 + (h % 30);
    const pickupY = 65 - ((h * 3) % 35);
    const destX = 65 + ((h * 2) % 25);
    const destY = 20 + ((h * 4) % 30);

    // Current car location interpolated along route
    const progress = ride.status === 'in_progress' ? 0.55 : ride.status === 'arrived' ? 0.15 : 0.05;
    const carX = pickupX + (destX - pickupX) * progress;
    const carY = pickupY + (destY - pickupY) * progress;

    return { pickupX, pickupY, destX, destY, carX, carY };
  };

  const getDriverCoordinates = (driver: Driver, index: number) => {
    const fixedPositions = [
      { x: 28, y: 38 },
      { x: 50, y: 55 },
      { x: 72, y: 44 },
      { x: 38, y: 76 },
      { x: 62, y: 24 },
      { x: 82, y: 68 },
      { x: 18, y: 50 },
      { x: 45, y: 22 }
    ];
    return fixedPositions[index % fixedPositions.length];
  };

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[560px] relative">
      {/* Top Map Header & Layer Selector */}
      <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Compass
            className={`w-4 h-4 text-[#0F766E] ${isSimulationActive ? 'animate-spin' : ''}`}
            style={{ animationDuration: '10s' }}
          />
          <span className="font-bold text-[#111827]">
            Tactical Operations Map • {selectedCity} Fleet Radar
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
            GPS Live • Telemetry Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer Filter Tabs */}
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setActiveTabLayer('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                activeTabLayer === 'all' ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              All Entities
            </button>
            <button
              onClick={() => setActiveTabLayer('rides')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                activeTabLayer === 'rides' ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Rides ({activeRides.length})
            </button>
            <button
              onClick={() => setActiveTabLayer('drivers')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                activeTabLayer === 'drivers' ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Drivers ({cityDrivers.length})
            </button>
            <button
              onClick={() => setActiveTabLayer('alerts')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                activeTabLayer === 'alerts' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Alerts ({criticalAlerts.length})
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 1.75))}
              title="Zoom In"
              className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-1 font-bold text-[#111827]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              title="Zoom Out"
              className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Stage */}
      <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease-out'
          }}
          className="relative w-full h-full min-h-[500px]"
        >
          {/* Stylized Modern Pakistani City Vector Topology */}
          <svg className="absolute inset-0 w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="radarGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1E293B" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#0F172A" />
            <rect width="100%" height="100%" fill="url(#radarGrid)" />

            {/* Simulated River / Canal (e.g. Lahore Canal or Karachi Port) */}
            <path
              d="M 0 320 Q 300 280 600 360 T 1200 300"
              fill="none"
              stroke="#0369A1"
              strokeWidth="18"
              opacity="0.35"
            />

            {/* Major Highways (Grand Trunk Road / Ring Road / Shahrah-e-Faisal) */}
            <path
              d="M 50 480 Q 350 200 700 320 T 1150 180"
              fill="none"
              stroke="#334155"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 50 480 Q 350 200 700 320 T 1150 180"
              fill="none"
              stroke="#0D9488"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              className={isSimulationActive ? 'animate-pulse' : ''}
            />

            {/* Arterial Ring Expressways */}
            <circle cx="50%" cy="50%" r="220" fill="none" stroke="#1E293B" strokeWidth="10" strokeDasharray="14 10" />
            <circle cx="50%" cy="50%" r="140" fill="none" stroke="#1E293B" strokeWidth="6" />

            {/* Cross Links */}
            <line x1="20%" y1="10%" x2="80%" y2="90%" stroke="#1E293B" strokeWidth="6" />
            <line x1="80%" y1="15%" x2="20%" y2="85%" stroke="#1E293B" strokeWidth="6" />
          </svg>

          {/* Active Trip Route Polylines */}
          {(activeTabLayer === 'all' || activeTabLayer === 'rides') &&
            activeRides.map((ride) => {
              const { pickupX, pickupY, destX, destY, carX, carY } = getRideCoordinates(ride);
              const isSelected = ride.id === selectedRideId;

              return (
                <div key={`route-${ride.id}`}>
                  {/* SVG Route Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <path
                      d={`M ${pickupX}% ${pickupY}% Q ${(pickupX + destX) / 2 + 5}% ${
                        (pickupY + destY) / 2 - 10
                      }% ${destX}% ${destY}%`}
                      fill="none"
                      stroke={isSelected ? '#14B8A6' : '#475569'}
                      strokeWidth={isSelected ? '3.5' : '2'}
                      strokeDasharray={isSelected ? '6 4' : '4 4'}
                      opacity={isSelected ? 1 : 0.65}
                    />
                  </svg>

                  {/* Pickup Marker */}
                  <div
                    style={{ left: `${pickupX}%`, top: `${pickupY}%` }}
                    onClick={() => onSelectRide(ride.id)}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                        isSelected
                          ? 'bg-sky-500 text-white ring-4 ring-sky-400/40'
                          : 'bg-slate-700 text-sky-400 border border-slate-500'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-[10px] text-sky-300 font-bold whitespace-nowrap shadow-md">
                        P: {ride.pickup?.address ? ride.pickup.address.split(',')[0] : 'Pickup'}
                      </div>
                    )}
                  </div>

                  {/* Destination Marker */}
                  <div
                    style={{ left: `${destX}%`, top: `${destY}%` }}
                    onClick={() => onSelectRide(ride.id)}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                        isSelected
                          ? 'bg-amber-500 text-white ring-4 ring-amber-400/40'
                          : 'bg-slate-700 text-amber-400 border border-slate-500'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-[10px] text-amber-300 font-bold whitespace-nowrap shadow-md">
                        D: {ride.destination?.address ? ride.destination.address.split(',')[0] : 'Destination'}
                      </div>
                    )}
                  </div>

                  {/* Moving Vehicle Marker along route */}
                  <div
                    style={{ left: `${carX}%`, top: `${carY}%` }}
                    onClick={() => onSelectRide(ride.id)}
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-1000"
                  >
                    <div className="relative">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-transform group-hover:scale-125 ${
                          isSelected
                            ? 'bg-[#0F766E] text-white border-teal-300 shadow-teal-500/50 scale-110'
                            : 'bg-slate-800 text-teal-400 border-slate-600'
                        }`}
                      >
                        <Car className="w-4 h-4" />
                      </div>
                      {isSimulationActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0F766E] text-white text-[10px] font-mono font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                        <span>{ride.driverPlate || ride.rideCode}</span>
                        <span>•</span>
                        <span>{ride.etaMinutes ?? 8}m ETA</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Idle / Available Fleet Drivers */}
          {(activeTabLayer === 'all' || activeTabLayer === 'drivers') &&
            cityDrivers.map((driver, idx) => {
              const pos = getDriverCoordinates(driver, idx);
              const isAvailable = driver.status === 'online' && driver.operationalStatus !== 'on_ride';
              const isOnTrip = driver.status === 'on_trip' || driver.operationalStatus === 'on_ride';
              const isOffline = driver.status === 'offline';

              return (
                <div
                  key={`driver-${driver.id}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => setSelectedDriverId(driver.id)}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-md border transition-transform group-hover:scale-130 ${
                      isAvailable
                        ? 'bg-emerald-600 text-white border-emerald-300'
                        : isOnTrip
                        ? 'bg-teal-600 text-white border-teal-300'
                        : 'bg-slate-700 text-slate-400 border-slate-600'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}

          {/* Emergency / Critical Safety Incident Beacons */}
          {(activeTabLayer === 'all' || activeTabLayer === 'alerts') &&
            criticalAlerts.map((alert, idx) => {
              const alertX = 35 + ((idx * 27) % 55);
              const alertY = 25 + ((idx * 31) % 55);

              return (
                <div
                  key={`alert-${alert.id}`}
                  style={{ left: `${alertX}%`, top: `${alertY}%` }}
                  onClick={() => onTrackAlert(alert)}
                  className="absolute z-40 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-rose-600/30 animate-ping absolute" />
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl border-2 border-rose-300 animate-bounce">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-rose-950/95 border border-rose-600 text-rose-200 text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl">
                    🚨 {alert.type.toUpperCase()}: {alert.code}
                  </div>
                </div>
              );
            })}

          {/* Floating Driver Card Details Popup */}
          {selectedDriver && (
            <div className="absolute top-4 right-4 z-50 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl text-white text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-600/30 border border-teal-500 text-teal-300 flex items-center justify-center font-bold">
                    {selectedDriver.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white leading-tight">{selectedDriver.name}</div>
                    <div className="text-[10px] text-slate-400">{selectedDriver.vehicle.category} • {selectedDriver.city}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDriverId(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">Status</div>
                  <span className="font-bold text-emerald-400 capitalize">
                    {selectedDriver.operationalStatus || selectedDriver.status}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                  <div className="text-slate-400 text-[10px]">Vehicle Plate</div>
                  <span className="font-mono font-bold text-teal-300">
                    {selectedDriver.vehicle.plate}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-slate-300 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono">{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rating:</span>
                  <span className="text-amber-400 font-bold">{selectedDriver.rating} ★</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Telemetry Ping:</span>
                  <span className="text-emerald-400 text-[10px]">{selectedDriver.lastPingTime || 'Live'}</span>
                </div>
              </div>

              {currentRide && (
                <button
                  onClick={() => {
                    onOpenDispatch(currentRide);
                    setSelectedDriverId(null);
                  }}
                  className="w-full py-1.5 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign to Current Ride</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Map Telemetry HUD bottom bar */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-200 flex items-center gap-2 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Telematics: Simulated Urban Flow ({selectedCity})</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-teal-400 font-mono font-bold shadow-lg flex items-center gap-3">
            <span>Tracking {activeRides.length} Trips</span>
            <span className="text-slate-500">|</span>
            <span>{cityDrivers.length} Fleet Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
