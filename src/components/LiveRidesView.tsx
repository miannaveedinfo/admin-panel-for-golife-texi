import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Ride, Driver, Passenger, OperationsAlert } from '../types';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import { LiveOperationsMap, SelectedEntity } from './operations/LiveOperationsMap';
import { UniversalLiveList } from './operations/UniversalLiveList';
import { LiveDetailDrawer } from './operations/LiveDetailDrawer';
import { DriverControlModal } from './DriverControlModal';
import { DispatchControlModal } from './operations/DispatchControlModal';
import { EndToEndFlowAuditModal } from './operations/EndToEndFlowAuditModal';
import { isProductionDataSource } from '../config/dataSourceMode';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  MapPin,
  Car,
  Filter,
  Layers,
  ChevronDown,
  Navigation,
  Sliders,
  CheckCircle,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export const LiveRidesView: React.FC = () => {
  const {
    rides = [],
    drivers = [],
    passengers = [],
    operationsAlerts = [],
    isSimulationActive = true,
    setIsSimulationActive,
    toggleSimulation,
    resetSimulationData,
    operationsInitialFilter,
    setOperationsInitialFilter
  } = useAdmin();

  // Selected city & filter dropdowns
  const [selectedCity, setSelectedCity] = useState<string>('Lahore');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [driverStatusFilter, setDriverStatusFilter] = useState<string>('all');

  // Active tab inside UniversalLiveList ('all' | 'drivers' | 'rides' | 'passengers' | 'alerts')
  const [activeListTab, setActiveListTab] = useState<'all' | 'drivers' | 'rides' | 'passengers' | 'alerts'>('all');

  // Currently selected entity on map and in drawer
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);

  // Responsive mobile view tab ('list' | 'map' | 'details')
  const [mobileView, setMobileView] = useState<'list' | 'map' | 'details'>('map');

  // Modal states
  const [driverForControl, setDriverForControl] = useState<Driver | null>(null);
  const [rideForControl, setRideForControl] = useState<Ride | null>(null);
  const [isE2EModalOpen, setIsE2EModalOpen] = useState<boolean>(false);

  // Sync operationsInitialFilter from AdminContext if navigated from Dashboard
  useEffect(() => {
    if (operationsInitialFilter) {
      if (operationsInitialFilter.tab) {
        setActiveListTab(operationsInitialFilter.tab);
      }
      if (operationsInitialFilter.city) {
        setSelectedCity(operationsInitialFilter.city);
      }
      if (operationsInitialFilter.selectedEntityId && operationsInitialFilter.selectedEntityType) {
        setSelectedEntity({
          type: operationsInitialFilter.selectedEntityType,
          id: operationsInitialFilter.selectedEntityId
        });
        setMobileView('details');
      }
      // Clear after applying
      setOperationsInitialFilter(null);
    }
  }, [operationsInitialFilter, setOperationsInitialFilter]);

  // Set initial default selected entity if none selected
  useEffect(() => {
    if (!selectedEntity) {
      const activeRide = rides.find(
        (r) => r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'arrived'
      );
      if (activeRide) {
        setSelectedEntity({ type: 'ride', id: activeRide.id });
      } else if (drivers.length > 0) {
        setSelectedEntity({ type: 'driver', id: drivers[0].id });
      }
    }
  }, [rides, drivers, selectedEntity]);

  const handleSelectEntity = (entity: SelectedEntity) => {
    setSelectedEntity(entity);
    if (window.innerWidth < 1024) {
      setMobileView('details');
    }
  };

  const handleCenterLocation = (type: 'driver' | 'ride' | 'passenger', id: string) => {
    setSelectedEntity({ type, id });
    setMobileView('map');
  };

  return (
    <div className="space-y-3.5 text-slate-900 pb-8">
      {/* ===================================================================
          TOP OPERATIONS COMMAND BAR (PAGE TITLE + TELEMETRY CONTROLS)
         =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500/40 text-slate-950 flex items-center justify-center font-black text-lg shadow-xs shrink-0">
            <Radio className={`w-5 h-5 ${isSimulationActive ? 'animate-pulse text-slate-950' : 'text-slate-700'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                Live Operations & Universal Tracking
              </h1>
              {isProductionDataSource() ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Production Mode • Live Telemetry Stream Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode • Location Simulation Active (Firebase Ready)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Single command center for live drivers, passenger rides, and fleet telemetry
            </p>
          </div>
        </div>

        {/* Telemetry Simulation Controllers / Production Live Status */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          {isProductionDataSource() ? (
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Cloud Dispatch Stream</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => {
                  if (typeof setIsSimulationActive === 'function') {
                    setIsSimulationActive(!isSimulationActive);
                  } else if (typeof toggleSimulation === 'function') {
                    toggleSimulation();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSimulationActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title={isSimulationActive ? 'Pause location updates' : 'Resume location updates'}
              >
                {isSimulationActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (typeof resetSimulationData === 'function') {
                    resetSimulationData();
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                title="Reset simulation points"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          )}

          {/* E2E Flow Audit & Simulator Button */}
          <button
            onClick={() => setIsE2EModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500/40 shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:scale-102"
            title="Open Passenger ↔ Driver ↔ Admin End-to-End Flow Audit & Simulator"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>E2E Flow Audit</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          GLOBAL DROPDOWN FILTERS (ONE COMPACT HORIZONTAL BAR)
         =================================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold uppercase">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer shadow-2xs"
            >
              <option value="All">All Pakistan Cities</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Multan">Multan</option>
            </select>
          </div>

          {/* Telemetry Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="live">LIVE (&lt;15s)</option>
              <option value="recent">RECENT (&lt;60s)</option>
              <option value="stale">STALE (&gt;60s)</option>
              <option value="offline">OFFLINE</option>
            </select>
          </div>

          {/* Ride Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories</option>
              <option value="GoMoto">GoMoto</option>
              <option value="GoAuto">GoAuto</option>
              <option value="GoMini">GoMini</option>
              <option value="GoRide">GoRide</option>
              <option value="GoComfort">GoComfort</option>
              <option value="GoFreight">GoFreight</option>
            </select>
          </div>

          {/* Driver Operational Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold uppercase">Driver:</span>
            <select
              value={driverStatusFilter}
              onChange={(e) => setDriverStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer shadow-2xs"
            >
              <option value="all">All Drivers</option>
              <option value="online">Online / Active</option>
              <option value="available">Available</option>
              <option value="on_ride">On Trip</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Layout Switcher (Visible only on < lg screens) */}
        <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileView('list')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobileView === 'list' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobileView === 'map' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            Radar Map
          </button>
          <button
            onClick={() => setMobileView('details')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobileView === 'details' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* ===================================================================
          THE UNIFIED 3-COLUMN COMMAND CENTER LAYOUT
         =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-[calc(100vh-230px)] min-h-[640px]">
        {/* COLUMN 1: LEFT LIVE ENTITY & ORDER LIST */}
        <div className={`lg:col-span-3 h-full ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}>
          <UniversalLiveList
            selectedCity={selectedCity}
            selectedEntity={selectedEntity}
            onSelectEntity={handleSelectEntity}
            activeTabFilter={activeListTab}
            onTabChange={(tab) => setActiveListTab(tab)}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            driverStatusFilter={driverStatusFilter}
          />
        </div>

        {/* COLUMN 2: CENTER / RIGHT INTERACTIVE LIVE MAP */}
        <div className={`lg:col-span-5 xl:col-span-5 h-full ${mobileView === 'map' ? 'block' : 'hidden lg:block'}`}>
          <LiveOperationsMap
            selectedCity={selectedCity}
            selectedEntity={selectedEntity}
            onSelectEntity={handleSelectEntity}
            onOpenDriverControl={(driver) => setDriverForControl(driver)}
            onOpenRideControl={(ride) => setRideForControl(ride)}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            driverStatusFilter={driverStatusFilter}
          />
        </div>

        {/* COLUMN 3: RIGHT DETAIL DRAWER (OR STANDBY DOSSIER) */}
        <div className={`lg:col-span-4 xl:col-span-4 h-full ${mobileView === 'details' ? 'block' : 'hidden lg:block'}`}>
          {selectedEntity ? (
            <LiveDetailDrawer
              selectedEntity={selectedEntity}
              onClose={() => setSelectedEntity(null)}
              onOpenDriverControl={(driver) => setDriverForControl(driver)}
              onOpenRideControl={(ride) => setRideForControl(ride)}
              onCenterLocation={handleCenterLocation}
              onSelectEntity={handleSelectEntity}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl h-full flex flex-col items-center justify-center p-6 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No Entity Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Click any driver, active ride, or passenger from the live radar map or list to inspect their real-time telemetry dossier.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Fleet Radar Active • {selectedCity}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          ONE ACTION MODALS: DRIVER CONTROL & RIDE CONTROL
         =================================================================== */}
      {driverForControl && (
        <DriverControlModal
          driver={driverForControl}
          onClose={() => setDriverForControl(null)}
        />
      )}

      {rideForControl && (
        <DispatchControlModal
          ride={rideForControl}
          onClose={() => setRideForControl(null)}
        />
      )}

      {/* End-to-End Flow Audit Modal */}
      <EndToEndFlowAuditModal
        isOpen={isE2EModalOpen}
        onClose={() => setIsE2EModalOpen(false)}
      />
    </div>
  );
};
