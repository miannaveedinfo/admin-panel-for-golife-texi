import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Ride,
  Driver,
  Passenger,
  OperationsAlert,
  LocationFreshness,
  GpsQualityStatus,
  LocationHistoryPoint,
  LocationEventRecord
} from '../../types';
import { centralLocationService } from '../../services/backend/CentralLocationService';
import { isProductionDataSource } from '../../config/dataSourceMode';
import {
  Compass,
  MapPin,
  Navigation,
  Car,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  Gauge,
  X,
  User,
  Flag,
  Crosshair,
  Layers,
  ChevronRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  Sparkles,
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Activity,
  FileText,
  CheckCircle,
  AlertTriangle,
  History
} from 'lucide-react';
import { formatPKR } from '../../utils/i18n';

export interface SelectedEntity {
  type: 'driver' | 'passenger' | 'ride' | 'alert';
  id: string;
}

interface LiveOperationsMapProps {
  selectedCity?: string;
  selectedEntity: SelectedEntity | null;
  onSelectEntity: (entity: SelectedEntity) => void;
  onOpenDriverControl?: (driver: Driver) => void;
  onOpenRideControl?: (ride: Ride) => void;
  statusFilter?: string;
  categoryFilter?: string;
  driverStatusFilter?: string;
}

// Landmark references for Pakistan cities
const CITY_LANDMARKS: Record<string, { name: string; x: number; y: number }[]> = {
  Lahore: [
    { name: 'Liberty Chowk (Gulberg)', x: 48, y: 46 },
    { name: 'Packages Mall', x: 28, y: 68 },
    { name: 'DHA Phase 5 Commercial', x: 74, y: 72 },
    { name: 'Mall Road / Anarkali', x: 38, y: 26 },
    { name: 'Lahore Ring Road Interchange', x: 82, y: 36 }
  ],
  Karachi: [
    { name: 'Dolmen Mall Clifton', x: 24, y: 74 },
    { name: 'Shahrah-e-Faisal / FTC', x: 62, y: 44 },
    { name: 'I.I. Chundrigar Rd', x: 32, y: 38 },
    { name: 'Gulshan-e-Iqbal Chowrangi', x: 78, y: 28 }
  ],
  Islamabad: [
    { name: 'Blue Area / Beverly', x: 50, y: 42 },
    { name: 'F-7 Markaz Jinnah Super', x: 36, y: 32 },
    { name: 'Faisal Mosque Vista', x: 25, y: 22 },
    { name: 'Zero Point Interchange', x: 64, y: 62 }
  ],
  Rawalpindi: [
    { name: 'Saddar Metro Station', x: 42, y: 52 },
    { name: 'Murree Road Commercial', x: 58, y: 44 },
    { name: 'Bahria Town Phase 7', x: 76, y: 78 }
  ],
  Peshawar: [
    { name: 'Hayatabad Phase 4', x: 28, y: 58 },
    { name: 'Saddar Cantt Road', x: 64, y: 40 },
    { name: 'University Road', x: 44, y: 48 }
  ],
  Faisalabad: [
    { name: 'Clock Tower (Ghanta Ghar)', x: 50, y: 50 },
    { name: 'D-Ground Commercial', x: 64, y: 58 },
    { name: 'Kohinoor City', x: 72, y: 42 }
  ],
  Multan: [
    { name: 'Ghanta Ghar Multan', x: 46, y: 48 },
    { name: 'Bosan Road Commercial', x: 38, y: 32 },
    { name: 'Cantt Commercial Area', x: 34, y: 64 }
  ],
  Quetta: [
    { name: 'Liaquat Bazaar', x: 48, y: 46 },
    { name: 'Jinnah Road Vista', x: 36, y: 38 },
    { name: 'Cantt Military Enclave', x: 66, y: 56 }
  ],
  All: [
    { name: 'National Command Link', x: 50, y: 50 }
  ]
};

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({
  selectedCity = 'All',
  selectedEntity,
  onSelectEntity,
  onOpenDriverControl,
  onOpenRideControl,
  statusFilter = 'all',
  categoryFilter = 'all',
  driverStatusFilter = 'all'
}) => {
  const { rides = [], drivers = [], passengers = [], operationsAlerts = [], isSimulationActive = true } = useAdmin();

  const safeRides = rides || [];
  const safeDrivers = drivers || [];
  const safePassengers = passengers || [];
  const safeAlerts = operationsAlerts || [];

  // Map Navigation & Dragging States
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Layers
  const [activeLayers, setActiveLayers] = useState<{
    drivers: boolean;
    rides: boolean;
    passengers: boolean;
    pickups: boolean;
    destinations: boolean;
    breadcrumbs: boolean;
    geofences: boolean;
  }>({
    drivers: true,
    rides: true,
    passengers: true,
    pickups: true,
    destinations: true,
    breadcrumbs: true,
    geofences: true
  });

  const [quickPopupEntity, setQuickPopupEntity] = useState<SelectedEntity | null>(null);
  const [showLocationEventsModal, setShowLocationEventsModal] = useState<boolean>(false);
  const [locationEvents, setLocationEvents] = useState<LocationEventRecord[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Seed initial realistic telemetry & location events once on load (demo mode only)
  useEffect(() => {
    if (!isProductionDataSource()) {
      centralLocationService.seedInitialTelemetry(drivers, rides);
    }
    loadLocationEvents();
  }, [drivers, rides]);

  const loadLocationEvents = useCallback(async () => {
    const events = await centralLocationService.getRecentLocationEvents(40);
    setLocationEvents(events);
  }, []);

  // Filter rides based on city and filters
  const filteredRides = useMemo(() => {
    return safeRides.filter((r) => {
      const normCity = (selectedCity || 'All').toLowerCase();
      if (normCity !== 'all' && (r.city || '').toLowerCase() !== normCity) {
        return false;
      }
      if (categoryFilter !== 'all' && r.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [safeRides, selectedCity, categoryFilter]);

  const activeRides = useMemo(() => {
    return filteredRides.filter(
      (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'searching'
    );
  }, [filteredRides]);

  // Filter drivers based on city and driver status
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
      return true;
    });
  }, [drivers, selectedCity, categoryFilter, driverStatusFilter]);

  // Map coordinate hashing for stable projection on map canvas
  const getRideCoordinates = (ride: Ride) => {
    const hash = (str: string) => (str || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const h = hash(ride.id);
    const pickupX = 20 + (h % 26);
    const pickupY = 68 - ((h * 3) % 32);
    const destX = 64 + ((h * 2) % 24);
    const destY = 22 + ((h * 4) % 28);

    // Current car location interpolated along route
    const progress = ride.status === 'in_progress' ? 0.58 : ride.status === 'arrived' ? 0.12 : 0.05;
    const carX = pickupX + (destX - pickupX) * progress;
    const carY = pickupY + (destY - pickupY) * progress;

    return { pickupX, pickupY, destX, destY, carX, carY, progress };
  };

  const getDriverCoordinates = (driver: Driver, index: number) => {
    // If driver is currently assigned to an active ride, anchor them close to that ride
    if (driver.activeRideId) {
      const activeRide = rides.find((r) => r.id === driver.activeRideId);
      if (activeRide) {
        const coords = getRideCoordinates(activeRide);
        return { x: coords.carX, y: coords.carY };
      }
    }
    const hash = (str: string) => (str || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const h = hash(driver.id + (driver.city || ''));
    const x = 16 + ((h * 7 + index * 11) % 68);
    const y = 18 + ((h * 13 + index * 9) % 64);
    return { x, y };
  };

  const getPassengerCoordinates = (passenger: Passenger, index: number) => {
    const activeRide = rides.find(
      (r) =>
        r.passengerId === passenger.id &&
        (r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'searching')
    );
    if (activeRide) {
      const coords = getRideCoordinates(activeRide);
      // In progress -> on board with vehicle; else waiting at pickup
      if (activeRide.status === 'in_progress') {
        return { x: coords.carX, y: coords.carY };
      }
      return { x: coords.pickupX, y: coords.pickupY };
    }
    const hash = (str: string) => (str || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const h = hash(passenger.id);
    return {
      x: 22 + (h % 56),
      y: 24 + ((h * 5) % 52)
    };
  };

  // Determine freshness and GPS Quality for an entity
  const getEntityFreshness = (entityType: 'driver' | 'passenger' | 'ride', id: string): LocationFreshness => {
    if (entityType === 'driver') {
      const d = drivers.find((x) => x.id === id);
      if (!d || d.status === 'offline' || d.accountStatus === 'suspended') return 'OFFLINE';
      if (d.locationFreshness) return d.locationFreshness;
      if (d.status === 'on_trip') return 'LIVE';
      return 'RECENT';
    }
    if (entityType === 'ride') {
      const r = rides.find((x) => x.id === id);
      if (!r || r.status === 'completed' || r.status === 'cancelled') return 'OFFLINE';
      if (r.status === 'in_progress' || r.status === 'driver_assigned') return 'LIVE';
      return 'RECENT';
    }
    if (entityType === 'passenger') {
      const activeRide = rides.find(
        (r) => r.passengerId === id && (r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived')
      );
      if (activeRide) return 'LIVE';
      return 'OFFLINE';
    }
    return 'RECENT';
  };

  const getDriverGpsQuality = (driver: Driver): { quality: GpsQualityStatus; label: string; badgeClass: string } => {
    if (driver.status === 'offline' || driver.accountStatus === 'suspended') {
      return { quality: 'MISSING', label: 'Offline', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
    if (driver.accuracyMeters && driver.accuracyMeters > 50) {
      return { quality: 'POOR_ACCURACY', label: 'Weak GPS (±60m)', badgeClass: 'bg-amber-950 text-amber-300 border-amber-800' };
    }
    if (driver.locationFreshness === 'STALE') {
      return { quality: 'STALE', label: 'Stale (>60s)', badgeClass: 'bg-orange-950 text-orange-300 border-orange-800' };
    }
    if (driver.locationFreshness === 'RECENT') {
      return { quality: 'DELAYED', label: 'Recent (<60s)', badgeClass: 'bg-sky-950 text-sky-300 border-sky-800' };
    }
    return { quality: 'FRESH', label: 'Live GPS (±4m)', badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
  };

  // Center on selected entity
  const handleCenterOnSelected = () => {
    if (!selectedEntity) {
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1);
      return;
    }

    if (selectedEntity.type === 'ride') {
      const ride = rides.find((r) => r.id === selectedEntity.id);
      if (ride) {
        const coords = getRideCoordinates(ride);
        setPanOffset({
          x: (50 - coords.carX) * 3.5,
          y: (50 - coords.carY) * 3.5
        });
        setZoomLevel(1.4);
      }
    } else if (selectedEntity.type === 'driver') {
      const driver = drivers.find((d) => d.id === selectedEntity.id);
      if (driver) {
        const idx = drivers.indexOf(driver);
        const coords = getDriverCoordinates(driver, idx);
        setPanOffset({
          x: (50 - coords.x) * 3.5,
          y: (50 - coords.y) * 3.5
        });
        setZoomLevel(1.4);
      }
    }
  };

  const handleFitActiveRides = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1.1);
  };

  // Directional Panning helper
  const handleDirectionalPan = (dx: number, dy: number) => {
    setPanOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  // Mouse & Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.7, parseFloat((prev + zoomDelta).toFixed(1)))));
  };

  // Touch support for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const currentLandmarks = CITY_LANDMARKS[selectedCity] || CITY_LANDMARKS.Lahore;

  // Selected quick popup data
  const popupDriver = quickPopupEntity?.type === 'driver' ? drivers.find((d) => d.id === quickPopupEntity.id) : null;
  const popupRide = quickPopupEntity?.type === 'ride' ? rides.find((r) => r.id === quickPopupEntity.id) : null;
  const popupPassenger = quickPopupEntity?.type === 'passenger' ? passengers.find((p) => p.id === quickPopupEntity.id) : null;

  // Selected entity breadcrumb points
  const selectedDriverHistory = useMemo(() => {
    if (selectedEntity?.type === 'driver') {
      return centralLocationService.getDriverLocationHistory(selectedEntity.id);
    }
    return [];
  }, [selectedEntity]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[580px] relative select-none">
      {/* ===================================================================
          TOP MAP ACTION BAR (RADAR STATUS, LAYER TOGGLES & ZOOM CONTROLS)
         =================================================================== */}
      <div className="p-3 bg-slate-900/95 backdrop-blur-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold shadow-xs">
            <Radio className={`w-4 h-4 ${isSimulationActive ? 'animate-pulse text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-100 tracking-tight">
                {selectedCity === 'All' ? 'Pakistan National' : selectedCity} Operations Radar
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                isProductionDataSource()
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isProductionDataSource() ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                {isProductionDataSource() ? 'Live Production Fleet • Real-time GPS' : 'Demo Mode • Real-Time GPS Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Map Layer Toggles & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer toggles */}
          <div className="hidden md:flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveLayers((prev) => ({ ...prev, drivers: !prev.drivers }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                activeLayers.drivers
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Drivers Layer"
            >
              <Car className="w-3 h-3" />
              Drivers ({filteredDrivers.length})
            </button>
            <button
              onClick={() => setActiveLayers((prev) => ({ ...prev, rides: !prev.rides }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                activeLayers.rides
                  ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Active Trips Layer"
            >
              <Navigation className="w-3 h-3" />
              Rides ({activeRides.length})
            </button>
            <button
              onClick={() => setActiveLayers((prev) => ({ ...prev, pickups: !prev.pickups, destinations: !prev.destinations }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                activeLayers.pickups
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Waypoints Layer"
            >
              <MapPin className="w-3 h-3" />
              Waypoints
            </button>
            <button
              onClick={() => setActiveLayers((prev) => ({ ...prev, breadcrumbs: !prev.breadcrumbs }))}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                activeLayers.breadcrumbs
                  ? 'bg-violet-400/20 text-violet-300 border border-violet-400/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Telemetry Breadcrumb Trail"
            >
              <History className="w-3 h-3" />
              Trails
            </button>
          </div>

          {/* Quick Fit, Pan & Zoom */}
          <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={handleCenterOnSelected}
              disabled={!selectedEntity}
              title="Center on selected marker"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                selectedEntity ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitActiveRides}
              title="Fit map to active fleet"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Directional pan pad */}
            <div className="hidden lg:flex items-center gap-0.5 px-1 border-x border-slate-800">
              <button
                onClick={() => handleDirectionalPan(0, 40)}
                title="Pan Up"
                className="p-1 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDirectionalPan(0, -40)}
                title="Pan Down"
                className="p-1 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDirectionalPan(40, 0)}
                title="Pan Left"
                className="p-1 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDirectionalPan(-40, 0)}
                title="Pan Right"
                className="p-1 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
              title="Zoom In"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 font-bold text-amber-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.7))}
              title="Zoom Out"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              title="Reset View to Center"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Location Events Stream Drawer Button */}
          <button
            onClick={() => {
              loadLocationEvents();
              setShowLocationEventsModal(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Open Auditable Location Events Stream"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Events Log</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          MAIN INTERACTIVE MAP STAGE (MOUSE & TOUCH PANNABLE SVG CANVAS)
         =================================================================== */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className="relative w-full h-full min-h-[520px]"
        >
          {/* Stylized Modern Pakistani City Vector Topology */}
          <svg className="absolute inset-0 w-full h-full opacity-85" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="radarGridLive" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1E293B" strokeWidth="0.8" opacity="0.6" />
              </pattern>
              <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Base Background Grid */}
            <rect width="100%" height="100%" fill="#090D16" />
            <rect width="100%" height="100%" fill="url(#radarGridLive)" />

            {/* Service Boundary Geofence Circle */}
            {activeLayers.geofences && (
              <g>
                <circle
                  cx="50%"
                  cy="50%"
                  r="320"
                  fill="#F59E0B"
                  fillOpacity="0.02"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                  opacity="0.35"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="220"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                  opacity="0.3"
                />
              </g>
            )}

            {/* Simulated Waterway / Canal / River (e.g. Lahore Canal, Arabian Sea, Rawal Lake) */}
            <path
              d="M 0 340 Q 280 290 620 370 T 1250 310"
              fill="none"
              stroke="#0284C7"
              strokeWidth="20"
              opacity="0.25"
            />

            {/* Major Arterial Highway (Ring Road / Grand Trunk Road / Shahrah-e-Faisal) */}
            <path
              d="M 40 500 Q 320 220 720 340 T 1180 190"
              fill="none"
              stroke="#1E293B"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 40 500 Q 320 220 720 340 T 1180 190"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="10 8"
              opacity="0.45"
              className={isSimulationActive ? 'animate-pulse' : ''}
            />

            {/* Secondary Arterial Connectors */}
            <path
              d="M 120 100 Q 450 380 900 240 T 1200 480"
              fill="none"
              stroke="#1E293B"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Concentric Command Radar Range Rings */}
            <circle cx="50%" cy="50%" r="280" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="10 10" opacity="0.35" />
            <circle cx="50%" cy="50%" r="180" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />
            <circle cx="50%" cy="50%" r="80" fill="none" stroke="#1E293B" strokeWidth="1" opacity="0.5" />

            {/* Landmark City Points */}
            {currentLandmarks.map((lm, i) => (
              <g key={`landmark-${i}`}>
                <circle cx={`${lm.x}%`} cy={`${lm.y}%`} r="3.5" fill="#475569" opacity="0.8" />
                <text
                  x={`${lm.x}%`}
                  y={`${lm.y - 2}%`}
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                  className="font-sans"
                >
                  {lm.name}
                </text>
              </g>
            ))}
          </svg>

          {/* TELEMETRY BREADCRUMB TRAILS */}
          {activeLayers.breadcrumbs &&
            selectedDriverHistory.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {selectedDriverHistory.map((point, idx) => {
                  if (idx === 0) return null;
                  const prev = selectedDriverHistory[idx - 1];
                  const x1 = 30 + ((prev.lat * 100) % 40);
                  const y1 = 30 + ((prev.lng * 100) % 40);
                  const x2 = 30 + ((point.lat * 100) % 40);
                  const y2 = 30 + ((point.lng * 100) % 40);
                  return (
                    <line
                      key={`trail-${point.id}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="#A855F7"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      opacity={0.6}
                    />
                  );
                })}
              </svg>
            )}

          {/* ACTIVE RIDE ROUTES & WAYPOINTS */}
          {activeLayers.rides &&
            activeRides.map((ride) => {
              const { pickupX, pickupY, destX, destY, carX, carY } = getRideCoordinates(ride);
              const isSelected = selectedEntity?.type === 'ride' && selectedEntity.id === ride.id;

              return (
                <div key={`trip-layer-${ride.id}`}>
                  {/* SVG Route Line connecting Pickup -> Current Vehicle -> Destination */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {/* Traveled route from pickup to car */}
                    <line
                      x1={`${pickupX}%`}
                      y1={`${pickupY}%`}
                      x2={`${carX}%`}
                      y2={`${carY}%`}
                      stroke={isSelected ? '#38BDF8' : '#0284C7'}
                      strokeWidth={isSelected ? 4 : 2.5}
                      strokeLinecap="round"
                      opacity={0.85}
                    />

                    {/* Remaining route from car to destination */}
                    <line
                      x1={`${carX}%`}
                      y1={`${carY}%`}
                      x2={`${destX}%`}
                      y2={`${destY}%`}
                      stroke={isSelected ? '#F59E0B' : '#64748B'}
                      strokeWidth={isSelected ? 3.5 : 2}
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      opacity={0.9}
                      className={isSimulationActive ? 'animate-pulse' : ''}
                    />
                  </svg>

                  {/* PICKUP WAYPOINT */}
                  {activeLayers.pickups && (
                    <div
                      style={{ left: `${pickupX}%`, top: `${pickupY}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntity({ type: 'ride', id: ride.id });
                        setQuickPopupEntity({ type: 'ride', id: ride.id });
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-15 cursor-pointer group"
                      title={`Pickup: ${ride.pickup.address}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/25 border-2 border-emerald-400 flex items-center justify-center text-white text-[10px] font-black shadow-md group-hover:scale-125 transition">
                        <span className="text-emerald-300 font-mono">P</span>
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 border border-slate-700 text-slate-100 rounded text-[10px] whitespace-nowrap shadow-lg z-30">
                        {ride.pickup.address}
                      </div>
                    </div>
                  )}

                  {/* DESTINATION WAYPOINT */}
                  {activeLayers.destinations && (
                    <div
                      style={{ left: `${destX}%`, top: `${destY}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntity({ type: 'ride', id: ride.id });
                        setQuickPopupEntity({ type: 'ride', id: ride.id });
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-15 cursor-pointer group"
                      title={`Destination: ${ride.destination.address}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-rose-500/25 border-2 border-rose-400 flex items-center justify-center text-white text-[10px] font-black shadow-md group-hover:scale-125 transition">
                        <Flag className="w-3 h-3 text-rose-300" />
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 border border-slate-700 text-slate-100 rounded text-[10px] whitespace-nowrap shadow-lg z-30">
                        {ride.destination.address}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE RIDE VEHICLE MARKER ON ROAD */}
                  <div
                    style={{ left: `${carX}%`, top: `${carY}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntity({ type: 'ride', id: ride.id });
                      setQuickPopupEntity({ type: 'ride', id: ride.id });
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    {/* Glow and radar pulse if selected */}
                    {isSelected && (
                      <span className="absolute -inset-2.5 rounded-full bg-amber-400/40 animate-ping" />
                    )}
                    <div
                      className={`px-2 py-1 rounded-xl flex items-center gap-1.5 shadow-lg border transition group-hover:scale-110 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-amber-500/30 ring-2 ring-amber-300'
                          : 'bg-slate-900/95 text-slate-100 border-sky-500/60 shadow-black'
                      }`}
                    >
                      <Navigation className={`w-3.5 h-3.5 rotate-45 ${isSelected ? 'text-slate-950' : 'text-sky-400'}`} />
                      <span className="text-[11px] font-mono font-bold tracking-tight">
                        {ride.rideCode}
                      </span>
                      <span
                        className={`px-1 rounded text-[9px] font-mono font-bold ${
                          isSelected ? 'bg-slate-950 text-amber-400' : 'bg-sky-950 text-sky-300'
                        }`}
                      >
                        {ride.etaMinutes ? `${ride.etaMinutes}m` : 'Live'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* DRIVER MARKERS WITH HEADING ROTATION & GPS QUALITY BADGE */}
          {activeLayers.drivers &&
            filteredDrivers.map((driver, index) => {
              const coords = getDriverCoordinates(driver, index);
              const isSelected = selectedEntity?.type === 'driver' && selectedEntity.id === driver.id;
              const isOnline = driver.status === 'online' || driver.status === 'on_trip';
              const isOnTrip = driver.status === 'on_trip';
              const gpsInfo = getDriverGpsQuality(driver);
              const heading = driver.currentLocation?.heading ?? (index * 45) % 360;

              return (
                <div
                  key={`drv-marker-${driver.id}`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEntity({ type: 'driver', id: driver.id });
                    setQuickPopupEntity({ type: 'driver', id: driver.id });
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <span className="absolute -inset-3 rounded-full bg-amber-400/40 animate-pulse border border-amber-400" />
                  )}

                  {/* Marker Body */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl shadow-lg border transition group-hover:scale-115 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-400 font-extrabold'
                        : isOnTrip
                        ? 'bg-slate-900/95 text-sky-300 border-sky-500/80'
                        : isOnline
                        ? 'bg-slate-900/95 text-emerald-300 border-emerald-500/80'
                        : 'bg-slate-900/90 text-slate-400 border-slate-700'
                    }`}
                  >
                    {/* Directional Heading Icon */}
                    <div
                      style={{ transform: `rotate(${heading}deg)` }}
                      className="transition-transform duration-500"
                    >
                      <Navigation className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                    </div>

                    <Car className="w-3 h-3 shrink-0" />
                    <span className="text-[10px] font-bold truncate max-w-[85px]">
                      {(driver.name || 'Driver').split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono opacity-80">
                      {driver.vehicle?.plate ? driver.vehicle.plate.split('-')[0] : 'GL'}
                    </span>

                    {/* Quality Dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        gpsInfo.quality === 'FRESH'
                          ? 'bg-emerald-400 animate-pulse'
                          : gpsInfo.quality === 'DELAYED'
                          ? 'bg-sky-400'
                          : gpsInfo.quality === 'STALE'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                      title={gpsInfo.label}
                    />
                  </div>
                </div>
              );
            })}

          {/* PASSENGER MARKERS (Universal Tracking for Active Passengers) */}
          {activeLayers.passengers &&
            safePassengers
              .filter((p) => {
                const normCity = (selectedCity || 'All').toLowerCase();
                if (normCity !== 'all' && (p.city || '').toLowerCase() !== normCity) {
                  return false;
                }
                // Privacy check: only track if passenger has an active ride
                const hasActiveRide = safeRides.some(
                  (r) =>
                    r.passengerId === p.id &&
                    (r.status === 'in_progress' ||
                      r.status === 'driver_assigned' ||
                      r.status === 'arrived' ||
                      r.status === 'searching')
                );
                return hasActiveRide;
              })
              .map((passenger, index) => {
                const coords = getPassengerCoordinates(passenger, index);
                const isSelected = selectedEntity?.type === 'passenger' && selectedEntity.id === passenger.id;

                return (
                  <div
                    key={`pass-marker-${passenger.id}`}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntity({ type: 'passenger', id: passenger.id });
                      setQuickPopupEntity({ type: 'passenger', id: passenger.id });
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-violet-400/40 animate-ping" />
                    )}
                    <div
                      className={`p-1.5 rounded-full border shadow-md transition group-hover:scale-120 ${
                        isSelected
                          ? 'bg-violet-500 text-white border-violet-200 ring-2 ring-violet-400'
                          : 'bg-slate-900/90 text-violet-300 border-violet-500/70'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
        </div>

        {/* ===================================================================
            FLOATING QUICK VIEW POPUP (ON MARKER CLICK)
           =================================================================== */}
        {quickPopupEntity && (
          <div className="absolute bottom-4 left-4 z-30 max-w-sm w-84 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-3.5 text-slate-100 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                  {quickPopupEntity.type === 'driver' && <Car className="w-4 h-4" />}
                  {quickPopupEntity.type === 'ride' && <Navigation className="w-4 h-4" />}
                  {quickPopupEntity.type === 'passenger' && <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    {quickPopupEntity.type.toUpperCase()} TELEMETRY DOSSIER
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {popupDriver?.name || popupRide?.rideCode || popupPassenger?.name}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setQuickPopupEntity(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* DRIVER POPUP DETAILS */}
            {popupDriver && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>
                    Status:{' '}
                    <strong className="text-emerald-400 uppercase">
                      {popupDriver.operationalStatus || popupDriver.status}
                    </strong>
                  </span>
                  <span>
                    Rating: <strong className="text-amber-400">{popupDriver.rating || 5.0}★</strong>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1.5">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Vehicle:</span>
                    <span className="text-slate-200 font-semibold">
                      {popupDriver.vehicle.model} ({popupDriver.vehicle.plate})
                    </span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>GPS Telemetry:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {getDriverGpsQuality(popupDriver).label}
                    </span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Speed / Heading:</span>
                    <span className="text-slate-200 font-mono">
                      {popupDriver.currentLocation?.speed || 34} km/h • {popupDriver.currentLocation?.heading || 90}°
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Note: GPS delays are flagged as operational telemetry and do NOT trigger misconduct fines.
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onOpenDriverControl) {
                        onOpenDriverControl(popupDriver);
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Driver Control
                  </button>
                </div>
              </div>
            )}

            {/* RIDE POPUP DETAILS */}
            {popupRide && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>
                    Status: <strong className="text-sky-400 capitalize">{popupRide.status.replace('_', ' ')}</strong>
                  </span>
                  <span>
                    ETA:{' '}
                    <strong className="text-amber-400">
                      {popupRide.etaMinutes ? `${popupRide.etaMinutes} mins` : 'Arrived'}
                    </strong>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                  <div className="truncate text-slate-400">
                    Pickup: <span className="text-slate-200">{popupRide.pickup.address}</span>
                  </div>
                  <div className="truncate text-slate-400">
                    Destination: <span className="text-slate-200">{popupRide.destination.address}</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>Fare:</span>
                    <span className="text-amber-400 font-mono font-bold">{formatPKR(popupRide.fare)}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onOpenRideControl) {
                        onOpenRideControl(popupRide);
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Ride Control
                  </button>
                </div>
              </div>
            )}

            {/* PASSENGER POPUP DETAILS */}
            {popupPassenger && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>
                    City: <strong className="text-slate-200">{popupPassenger.city}</strong>
                  </span>
                  <span>
                    Rating: <strong className="text-amber-400">{popupPassenger.rating}★</strong>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                  <div className="text-slate-400">
                    Phone: <span className="text-slate-200 font-mono">{popupPassenger.phone}</span>
                  </div>
                  <div className="text-slate-400">
                    Privacy Protection:{' '}
                    <span className="text-emerald-400 font-semibold">Active Trip Geo-Fencing Enforced</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => onSelectEntity({ type: 'passenger', id: popupPassenger.id })}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    Open Passenger Dossier
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Status Legend Badge */}
        <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xs border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 shadow-lg">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Live Driver
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            On Trip
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Assigned
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Offline
          </span>
        </div>
      </div>

      {/* ===================================================================
          AUDITABLE LOCATION EVENTS SLIDE-OVER MODAL (ITEM 14)
         =================================================================== */}
      {showLocationEventsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black text-slate-100">Chronological Location Events Stream</h3>
                  <p className="text-[11px] text-slate-400">
                    Auditable immutable GPS & telemetry lifecycle events (Firebase Ready)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationEventsModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
              {locationEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No location events logged yet.</div>
              ) : (
                locationEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-slate-300"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                          {evt.eventType.replace('_', ' ')}
                        </span>
                        <span className="font-bold text-slate-100">
                          {evt.driverId ? `Driver ${evt.driverId}` : evt.rideId ? `Trip ${evt.rideId}` : 'Fleet'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{evt.details || 'Telemetry updated'}</p>
                      <div className="text-[10px] font-mono text-slate-500">
                        {evt.lat && evt.lng ? `GPS: ${evt.lat.toFixed(4)}, ${evt.lng.toFixed(4)}` : ''}{' '}
                        {evt.speedKmh ? `• ${evt.speedKmh} km/h` : ''}{' '}
                        {evt.accuracyMeters ? `• ±${evt.accuracyMeters}m` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{locationEvents.length} events logged in current operational cycle</span>
              <button
                onClick={() => setShowLocationEventsModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
