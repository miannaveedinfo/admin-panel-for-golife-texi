import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { operationsService } from '../../services/operationsService';
import { isProductionDataSource } from '../../config/dataSourceMode';
import {
  Activity,
  Radio,
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  Users,
  Car,
  CheckCircle,
  Clock,
  Ban,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { OperationsAlertType } from '../../types';

interface OperationsKPIBarProps {
  selectedCity: string;
}

export const OperationsKPIBar: React.FC<OperationsKPIBarProps> = ({ selectedCity }) => {
  const {
    rides,
    drivers,
    operationsAlerts,
    isSimulationActive,
    toggleSimulation,
    advanceSimulationStep,
    createOperationsAlert
  } = useAdmin();

  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);

  // Filter for metrics
  const cityRides = selectedCity === 'All' ? rides : rides.filter((r) => r.city.toLowerCase() === selectedCity.toLowerCase());
  const cityDrivers = selectedCity === 'All' ? drivers : drivers.filter((d) => d.city.toLowerCase() === selectedCity.toLowerCase());
  const cityAlerts = selectedCity === 'All' ? operationsAlerts : operationsAlerts.filter((a) => a.city.toLowerCase() === selectedCity.toLowerCase());

  const stats = operationsService.calculateStats(cityRides, cityDrivers, cityAlerts);

  const triggerTestAlert = (type: OperationsAlertType, title: string, titleUrdu: string, priority: 'critical' | 'high' | 'medium') => {
    createOperationsAlert({
      type,
      title,
      titleUrdu,
      priority,
      status: 'open',
      city: selectedCity === 'All' ? 'Lahore' : selectedCity,
      description: `Simulated live event in ${selectedCity === 'All' ? 'Lahore' : selectedCity}: ${title}`,
      location: {
        lat: 31.5204,
        lng: 74.3587,
        address: `${selectedCity === 'All' ? 'Lahore' : selectedCity} Central Command Sector`
      },
      assignedAdmin: 'Unassigned'
    });
    setIsAlertMenuOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Simulation Controls & Top Status Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-[#E5E7EB]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSimulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-bold text-[#111827]">
              {isSimulationActive ? 'Real-Time Feed: STREAMING' : 'Real-Time Feed: PAUSED'}
            </span>
            <span className="text-[11px] font-mono text-[#6B7280]">
              {isSimulationActive ? '4.5s cadence' : 'Frozen'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Radio className="w-3.5 h-3.5 text-[#0F766E] animate-pulse" />
            <span>Telemetry Dispatch Radar</span>
          </div>
        </div>

        {/* Action Controls: Pause/Resume, Step (Demo only) vs Live Production Telemetry (Production) */}
        <div className="flex flex-wrap items-center gap-2">
          {isProductionDataSource() ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Production Dispatch • Simulation Disabled</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => toggleSimulation()}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  isSimulationActive
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {isSimulationActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Sim</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Sim</span>
                  </>
                )}
              </button>

              <button
                onClick={advanceSimulationStep}
                title="Advance simulated vehicle positions and ride stages by 1 step"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#111827] border border-[#E5E7EB] flex items-center gap-1.5 transition cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Step Forward</span>
              </button>
            </>
          )}

          {/* Trigger Alert Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAlertMenuOpen(!isAlertMenuOpen)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Simulate Alert</span>
              <ChevronDown className="w-3.5 h-3.5 text-rose-600" />
            </button>

            {isAlertMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 p-2 space-y-1 text-xs">
                <div className="px-2 py-1 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                  Trigger Test Incident
                </div>
                <button
                  onClick={() =>
                    triggerTestAlert(
                      'emergency_request',
                      'Emergency SOS Beacon Triggered',
                      'ایمرجنسی ایس او ایس ایکٹیو',
                      'critical'
                    )
                  }
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>SOS Panic Button (Critical)</span>
                </button>
                <button
                  onClick={() =>
                    triggerTestAlert(
                      'driver_offline_on_ride',
                      'Driver Lost Telemetry Signal on Trip',
                      'سفر میں ڈرائیور کا سگنل غائب',
                      'high'
                    )
                  }
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-amber-800 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Ban className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Driver Offline During Trip</span>
                </button>
                <button
                  onClick={() =>
                    triggerTestAlert(
                      'long_waiting_time',
                      'Long Waiting Time in Central Sector',
                      'انتظار کا طویل دورانیہ',
                      'medium'
                    )
                  }
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-sky-800 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Long Wait / Zero Matches</span>
                </button>
                <button
                  onClick={() =>
                    triggerTestAlert(
                      'suspicious_activity',
                      'Vehicle Stationary on Expressway (>12 min)',
                      'گاڑی ہائی وے پر ساکت کھڑی ہے',
                      'high'
                    )
                  }
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 text-purple-800 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Suspicious Stop / Diversion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 9 Live Operations KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
        {/* 1. Live Active Rides */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Active Rides</span>
            <Car className="w-3.5 h-3.5 text-[#0F766E]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#0F766E] mt-1">{stats.activeRides}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Assigned & In-Trip</div>
        </div>

        {/* 2. Searching/Matching */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Searching</span>
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">{stats.searchingRides}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Awaiting Match</div>
        </div>

        {/* 3. Available Drivers */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Available</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{stats.driversAvailable}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Ready for dispatch</div>
        </div>

        {/* 4. Drivers On Ride */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>On Ride</span>
            <Activity className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-600 mt-1">{stats.driversOnRide}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Passenger on board</div>
        </div>

        {/* 5. Online Fleet Total */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Online Total</span>
            <Users className="w-3.5 h-3.5 text-[#111827]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#111827] mt-1">{stats.driversOnline}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Logged into app</div>
        </div>

        {/* 6. Offline Drivers */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Offline</span>
            <Ban className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-600 mt-1">{stats.driversOffline}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Not available</div>
        </div>

        {/* 7. Pending Requests */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Pending Bids</span>
            <Radio className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-600 mt-1">{stats.pendingRequests}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">Driver responses</div>
        </div>

        {/* 8. Cancelled Today */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#6B7280] flex items-center justify-between">
            <span>Cancelled</span>
            <Ban className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">{stats.cancelledRidesToday}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">All reasons</div>
        </div>

        {/* 9. Emergency Alerts */}
        <div className="bg-white border border-rose-200 rounded-xl p-3 shadow-xs bg-rose-50/40">
          <div className="text-[11px] font-semibold text-rose-800 flex items-center justify-between">
            <span>Emergencies</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">{stats.emergencyAlerts}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Require Action</div>
        </div>
      </div>
    </div>
  );
};
