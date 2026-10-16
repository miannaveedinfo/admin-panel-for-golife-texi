import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  SafetyIncident,
  SafetyPriority,
  SafetyEventStatus
} from '../../types';
import {
  getSafetyPriorityBadge,
  getSafetyStatusBadge,
  getFreshnessBadge,
  calculateSafetySlaStatus,
  getSafetySlaBadge
} from '../../services/safetyEmergencyService';
import { SafetyIncidentDetailModal } from './SafetyIncidentDetailModal';
import { SafetyEmergencyDirectoryTab } from './SafetyEmergencyDirectoryTab';
import { SafetySlaConfigTab } from './SafetySlaConfigTab';
import { SafetyAnalyticsTab } from './SafetyAnalyticsTab';
import {
  ShieldAlert,
  Radio,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  User,
  ExternalLink,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Flame,
  Volume2,
  VolumeX,
  Plus,
  Building2,
  Sliders,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';

export const SafetyEmergencyCenterView: React.FC = () => {
  const {
    safetyIncidents,
    safetySlaConfig,
    activeSafetyModalIncidentId,
    openSafetyDetail,
    closeSafetyDetail,
    acknowledgeSafetyIncident,
    triggerDemoSosAlert,
    setOperationsInitialFilter,
    setActiveTab,
    showToast
  } = useAdmin();

  // Tab navigation
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'directory' | 'sla' | 'analytics'>('incidents');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'active_sos' | 'critical' | 'investigating' | 'false_alarm' | 'resolved'>('all');

  // Audio siren mute toggle for UI
  const [isSirenMuted, setIsSirenMuted] = useState(false);

  // Demo simulator dropdown
  const [simulationCity, setSimulationCity] = useState('Lahore');
  const [simulationType, setSimulationType] = useState<'sos_trigger' | 'crash_detection' | 'route_deviation' | 'harassment'>('sos_trigger');

  // Safe list of safety incidents
  const safeIncidents = safetyIncidents || [];

  // Check for active emergencies
  const activeEmergencies = useMemo(() => {
    return safeIncidents.filter(
      (inc) =>
        (inc.type === 'sos_trigger' || inc.isEmergencySos || inc.priority === 'critical') &&
        inc.status !== 'resolved' &&
        inc.status !== 'false_alarm' &&
        inc.status !== 'closed'
    );
  }, [safeIncidents]);

  // Key metrics
  const totalIncidents = safeIncidents.length;
  const activeSosCount = safeIncidents.filter(
    (i) => (i.type === 'sos_trigger' || i.isEmergencySos) && i.status !== 'resolved' && i.status !== 'false_alarm' && i.status !== 'closed'
  ).length;
  const criticalCount = safeIncidents.filter((i) => i.priority === 'critical').length;
  const investigatingCount = safeIncidents.filter(
    (i) => i.status === 'under_investigation' || i.status === 'assigned' || i.status === 'acknowledged'
  ).length;
  const falseAlarmCount = safeIncidents.filter((i) => i.status === 'false_alarm' || i.isFalseAlarm).length;
  const resolvedCount = safeIncidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return safeIncidents.filter((inc) => {
      // City filter
      if (cityFilter !== 'all' && inc.city.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }

      // Quick filter
      if (quickFilter === 'active_sos') {
        const isSos = inc.type === 'sos_trigger' || inc.isEmergencySos;
        const isActive = inc.status !== 'resolved' && inc.status !== 'false_alarm' && inc.status !== 'closed';
        if (!isSos || !isActive) return false;
      } else if (quickFilter === 'critical') {
        if (inc.priority !== 'critical') return false;
      } else if (quickFilter === 'investigating') {
        if (inc.status !== 'under_investigation' && inc.status !== 'assigned' && inc.status !== 'acknowledged') return false;
      } else if (quickFilter === 'false_alarm') {
        if (inc.status !== 'false_alarm' && !inc.isFalseAlarm) return false;
      } else if (quickFilter === 'resolved') {
        if (inc.status !== 'resolved' && inc.status !== 'closed') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = inc.incidentCode.toLowerCase().includes(q);
        const matchRide = inc.rideCode.toLowerCase().includes(q);
        const matchPassenger = inc.reporterName.toLowerCase().includes(q) || (inc.reporterPhone && inc.reporterPhone.includes(q));
        const matchDriver = inc.driverName.toLowerCase().includes(q) || (inc.driverPhone && inc.driverPhone.includes(q));
        const matchPlate = inc.vehiclePlate.toLowerCase().includes(q);
        const matchAddress = inc.location?.address?.toLowerCase().includes(q);
        if (!matchCode && !matchRide && !matchPassenger && !matchDriver && !matchPlate && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [safetyIncidents, cityFilter, quickFilter, searchQuery]);

  const handleTriggerSimulation = () => {
    const newId = triggerDemoSosAlert(
      simulationCity,
      simulationType as any,
      simulationType === 'sos_trigger' ? 'critical' : 'urgent'
    );
    showToast(`Simulated live ${simulationType.toUpperCase()} incident triggered in ${simulationCity}`, 'info');
    openSafetyDetail(newId);
  };

  const handleOpenLiveMapForRide = (inc: SafetyIncident) => {
    setOperationsInitialFilter({
      tab: 'rides',
      city: inc.city,
      selectedEntityType: 'ride',
      selectedEntityId: inc.rideId
    });
    setActiveTab('live_rides');
  };

  const cities = ['all', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta'];

  return (
    <div id="safety-emergency-center-view" className="space-y-5 pb-10">
      {/* 1. TOP LIVE EMERGENCY SIREN BANNER (Visible if active emergency exists) */}
      {activeEmergencies.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border-2 border-rose-500 shadow-xl relative overflow-hidden animate-in fade-in">
          {/* Background Pulse Glow */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-rose-600/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                    Live SOS Panic Alert
                  </span>
                  <span className="text-xs text-rose-300 font-semibold">
                    {activeEmergencies.length} active emergency event{activeEmergencies.length > 1 ? 's' : ''} in progress
                  </span>
                </div>

                <div className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2 flex-wrap">
                  <span>{activeEmergencies[0].incidentCode}</span>
                  <span className="text-rose-300 font-normal">•</span>
                  <span className="text-amber-300">{activeEmergencies[0].city}</span>
                  <span className="text-rose-300 font-normal">•</span>
                  <span className="text-sm font-semibold text-slate-200">
                    Ride #{activeEmergencies[0].rideCode} ({activeEmergencies[0].reporterName})
                  </span>
                </div>

                <p className="text-xs text-rose-200 mt-1 max-w-2xl leading-relaxed">
                  {activeEmergencies[0].notes || 'Active SOS alert triggered. Operator acknowledgement and emergency outreach protocol initiated.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setIsSirenMuted(!isSirenMuted)}
                className="p-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white rounded-lg text-xs font-semibold transition border border-rose-700/50 flex items-center gap-1.5"
                title={isSirenMuted ? 'Unmute Audio Siren' : 'Mute Audio Siren'}
              >
                {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                <span className="text-[11px]">{isSirenMuted ? 'Muted' : 'Siren On'}</span>
              </button>

              {activeEmergencies[0].status === 'active' && (
                <button
                  onClick={() => acknowledgeSafetyIncident(activeEmergencies[0].id, 'Urgent operator acknowledgment via alert banner')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledge</span>
                </button>
              )}

              <button
                onClick={() => openSafetyDetail(activeEmergencies[0].id)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-rose-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>Open Incident Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMMAND HEADER & DEMO SIMULATION WIDGET */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Safety, Emergency & Incident Control Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized real-time command, live telemetry tracking, Rescue 1122 dispatch, and safety SLA enforcement.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode SOS Simulator */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 pr-1">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Demo Radar:</span>
          </div>

          <select
            value={simulationCity}
            onChange={(e) => setSimulationCity(e.target.value)}
            className="text-xs bg-white border border-amber-300 rounded-lg px-2 py-1 font-medium text-slate-800"
          >
            <option value="Lahore">Lahore (Gulberg)</option>
            <option value="Karachi">Karachi (Clifton)</option>
            <option value="Islamabad">Islamabad (Blue Area)</option>
            <option value="Rawalpindi">Rawalpindi</option>
          </select>

          <select
            value={simulationType}
            onChange={(e: any) => setSimulationType(e.target.value)}
            className="text-xs bg-white border border-amber-300 rounded-lg px-2 py-1 font-medium text-slate-800"
          >
            <option value="sos_trigger">SOS In-Ride Panic</option>
            <option value="crash_detection">G-Force Crash Detection</option>
            <option value="route_deviation">Critical Route Deviation</option>
            <option value="harassment">Conduct / Harassment</option>
          </select>

          <button
            onClick={handleTriggerSimulation}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1"
          >
            <span>Simulate Alert</span>
          </button>
        </div>
      </div>

      {/* 3. METRIC CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Incidents</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalIncidents}</div>
          <span className="text-[10px] text-slate-400 font-medium">Recorded in session</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 uppercase block">Active SOS Panics</span>
            {activeSosCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{activeSosCount}</div>
          <span className="text-[10px] text-rose-500 font-medium">Requires immediate response</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase block">Critical Priority</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{criticalCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Senior officer oversight</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Under Review</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{investigatingCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Assigned & active</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">False Alarms</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{falseAlarmCount}</div>
          <span className="text-[10px] text-purple-600 font-medium">Telemetry preserved</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Resolved Safely</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Closed protocol</span>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4 overflow-x-auto pb-px">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'incidents'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Active Incidents & Live Emergency Radar</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
              {filteredIncidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'directory'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Emergency Services Directory & Hotlines</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sla')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'sla'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Response SLA & Classification Rules</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Safety Intelligence & Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 5. TAB CONTENTS */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by incident code, ride code, passenger, driver, or vehicle plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">City:</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-800"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Operating Cities' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* QUICK FILTER CHIPS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'all', label: 'All Incidents', count: totalIncidents },
              { key: 'active_sos', label: 'Active SOS Panics', count: activeSosCount, alert: activeSosCount > 0 },
              { key: 'critical', label: 'Critical Severity', count: criticalCount },
              { key: 'investigating', label: 'Under Review', count: investigatingCount },
              { key: 'false_alarm', label: 'False Alarms', count: falseAlarmCount },
              { key: 'resolved', label: 'Resolved', count: resolvedCount }
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => setQuickFilter(chip.key as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  quickFilter === chip.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    quickFilter === chip.key
                      ? 'bg-slate-800 text-amber-400'
                      : chip.alert
                      ? 'bg-rose-100 text-rose-700 font-bold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            ))}
          </div>

          {/* INCIDENTS TABLE / CARDS */}
          {filteredIncidents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No safety incidents found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active or recorded incidents match your selected search or city filter.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Incident Code & Type</th>
                      <th className="py-3 px-3">City & Time</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">SLA Health</th>
                      <th className="py-3 px-3">Involved Parties</th>
                      <th className="py-3 px-3">Telemetry / Location</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredIncidents.map((inc) => {
                      const priorityBadge = getSafetyPriorityBadge(inc.priority || 'urgent');
                      const statusBadge = getSafetyStatusBadge(inc.status);
                      const freshnessBadge = getFreshnessBadge(inc.location?.freshness || 'LIVE');
                      const slaStatus = calculateSafetySlaStatus(inc, safetySlaConfig);
                      const sla = getSafetySlaBadge(slaStatus);
                      const isSos = inc.type === 'sos_trigger' || inc.isEmergencySos;

                      return (
                        <tr
                          key={inc.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isSos && inc.status === 'active' ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          {/* Incident Code & Type */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  inc.priority === 'critical'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {inc.incidentCode}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {inc.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* City & Time */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{inc.city}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {inc.triggeredAt}
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityBadge.color}`}>
                              {priorityBadge.label}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </td>

                          {/* SLA Timer */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sla.badgeColor}`}>
                              ⏱️ {sla.label}
                            </span>
                          </td>

                          {/* Involved Parties */}
                          <td className="py-3 px-3">
                            <div className="text-slate-900 font-medium">
                              Passenger: <strong className="font-semibold">{inc.reporterName}</strong>
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              Driver: {inc.driverName} ({inc.vehiclePlate})
                            </div>
                          </td>

                          {/* Telemetry / Location */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${freshnessBadge.color}`}>
                                {freshnessBadge.label}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {inc.location?.speedKmh !== undefined ? `${inc.location.speedKmh} km/h` : '0 km/h'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-1 max-w-[180px]">
                              {inc.location?.address || 'Corridor telemetry'}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenLiveMapForRide(inc)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                title="Open Ride on Live Fleet Radar"
                              >
                                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                              </button>

                              <button
                                onClick={() => openSafetyDetail(inc.id)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'directory' && <SafetyEmergencyDirectoryTab />}
      {activeSubTab === 'sla' && <SafetySlaConfigTab />}
      {activeSubTab === 'analytics' && <SafetyAnalyticsTab />}

      {/* 6. DETAIL MODAL (Opens when an incident is selected) */}
      {activeSafetyModalIncidentId && (
        <SafetyIncidentDetailModal
          incidentId={activeSafetyModalIncidentId}
          onClose={closeSafetyDetail}
        />
      )}
    </div>
  );
};
