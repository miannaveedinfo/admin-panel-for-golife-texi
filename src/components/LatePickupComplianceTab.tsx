import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { LatePickupIncident, DriverSuspensionRecord } from '../types';
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Settings,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  User,
  Info
} from 'lucide-react';

export const LatePickupComplianceTab: React.FC = () => {
  const {
    latePickupIncidents = [],
    driverSuspensions = [],
    latePickupConfig,
    updateLatePickupConfig,
    reinstateDriver,
    simulatePhase33Event,
    showToast,
    drivers = []
  } = useAdmin();

  const safeLatePickups = latePickupIncidents || [];
  const safeDrivers = drivers || [];
  const safeSuspensions = driverSuspensions || [];

  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'suspensions' | 'config'>('incidents');
  const [driverSearch, setDriverSearch] = useState('');
  const [qualifyingOnly, setQualifyingOnly] = useState(false);

  // Editable config state
  const [configIncidents, setConfigIncidents] = useState(latePickupConfig?.requiredIncidentsForSuspension ?? 3);
  const [configThreshold, setConfigThreshold] = useState(latePickupConfig?.thresholdDelayMinutes ?? 10);
  const [configDuration, setConfigDuration] = useState(latePickupConfig?.suspensionDurationHours ?? 12);
  const [excludePassenger, setExcludePassenger] = useState(latePickupConfig?.excludePassengerDelays ?? true);
  const [excludeTraffic, setExcludeTraffic] = useState(latePickupConfig?.excludeTrafficSevere ?? false);

  // Filtered incidents
  const filteredIncidents = safeLatePickups.filter((inc) => {
    const matchesSearch =
      inc.driverName.toLowerCase().includes(driverSearch.toLowerCase()) ||
      inc.rideCode.toLowerCase().includes(driverSearch.toLowerCase()) ||
      inc.driverId.toLowerCase().includes(driverSearch.toLowerCase());
    const matchesQualifying = qualifyingOnly ? inc.isQualifying : true;
    return matchesSearch && matchesQualifying;
  });

  // Find any driver nearing or exceeding the suspension threshold dynamically
  const driversAtRisk = React.useMemo(() => {
    const counts: Record<string, { driver: any; count: number }> = {};
    safeLatePickups.filter((i) => i.isQualifying).forEach((i) => {
      const d = safeDrivers.find((drv) => drv.id === i.driverId);
      if (d) {
        if (!counts[d.id]) counts[d.id] = { driver: d, count: 0 };
        counts[d.id].count += 1;
      }
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [safeLatePickups, safeDrivers]);

  const topAtRisk = driversAtRisk[0];
  const isTopSuspended = topAtRisk?.driver?.accountStatus === 'suspended';

  // Handle Save Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateLatePickupConfig({
      requiredIncidentsForSuspension: Number(configIncidents),
      thresholdDelayMinutes: Number(configThreshold),
      suspensionDurationHours: Number(configDuration),
      excludePassengerDelays: excludePassenger,
      excludeTrafficSevere: excludeTraffic
    });
    showToast('Late pickup compliance rules updated successfully.', 'success');
  };

  return (
    <div className="space-y-5 text-[#111827]">
      {/* Compliance Engine Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#0F766E] text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-teal-950">
                Automated Late Pickup SLA & Suspension Policy
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900">
                Active Policy: {configIncidents} Incidents / {configDuration}h Suspension
              </span>
            </div>
            {topAtRisk && topAtRisk.count >= 2 ? (
              <p className="text-xs text-amber-900 mt-0.5">
                Compliance Watch: <strong className="text-amber-950">{topAtRisk.driver.name}</strong> currently has{' '}
                <strong className="text-rose-700 font-mono text-sm">{topAtRisk.count}/{configIncidents}</strong> qualifying late pickups recorded today.
                {isTopSuspended ? (
                  <span className="ml-2 font-bold text-rose-700">
                    [ACCOUNT CURRENTLY TEMPORARILY SUSPENDED]
                  </span>
                ) : (
                  <span className="ml-2 text-slate-700">
                    Automatic suspension will trigger if threshold is reached.
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-teal-900/80 mt-0.5">
                All registered drivers are currently meeting pickup SLA thresholds. Zero automated suspensions active in this period.
              </p>
            )}
          </div>
        </div>

        {topAtRisk && isTopSuspended && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => reinstateDriver(topAtRisk.driver.id, `Admin reinstated driver ${topAtRisk.driver.name} after compliance review`)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#10B981] hover:bg-[#059669] text-white transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reinstate {topAtRisk.driver.name}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'incidents'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:bg-slate-100 border border-[#E5E7EB]'
            }`}
          >
            Recorded Late Pickups ({safeLatePickups.length})
          </button>

          <button
            onClick={() => setActiveSubTab('suspensions')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'suspensions'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:bg-slate-100 border border-[#E5E7EB]'
            }`}
          >
            Suspension History ({safeSuspensions.length})
          </button>

          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'config'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:bg-slate-100 border border-[#E5E7EB]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Compliance Threshold Config</span>
          </button>
        </div>

        {activeSubTab === 'incidents' && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[#6B7280] cursor-pointer">
              <input
                type="checkbox"
                checked={qualifyingOnly}
                onChange={(e) => setQualifyingOnly(e.target.checked)}
                className="rounded text-[#0F766E]"
              />
              <span>Qualifying Only</span>
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Search driver or ride code..."
                className="pl-8 pr-3 py-1 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* View 1: Recorded Late Pickup Incidents */}
      {activeSubTab === 'incidents' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Ride ID / Time</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Expected vs Actual</th>
                  <th className="py-3 px-4">Delay (Mins)</th>
                  <th className="py-3 px-4">Qualifying Status</th>
                  <th className="py-3 px-4">Audit Notes & Circumstances</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#111827]">{inc.rideCode}</div>
                      <div className="text-[10px] text-[#6B7280]">{inc.dateTime}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{inc.driverName}</div>
                      <div className="text-[10px] text-[#6B7280] font-mono">{inc.driverId}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#111827]">
                      {inc.passengerName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#6B7280]">
                        Expected: <span className="font-mono font-semibold text-[#111827]">{inc.expectedPickupTime}</span>
                      </div>
                      <div className="text-[#6B7280]">
                        Arrived: <span className="font-mono font-bold text-rose-600">{inc.actualArrivalTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sm text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg inline-block">
                        +{inc.pickupDelayMin} min
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {inc.isQualifying ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <CheckCircle2 className="w-3 h-3" />
                          QUALIFYING INCIDENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#6B7280] border border-[#E5E7EB]">
                          <XCircle className="w-3 h-3" />
                          EXCLUDED (No Fault)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] max-w-xs">
                      {inc.isQualifying ? (
                        <span>{inc.notes || 'Unexplained driver arrival delay.'}</span>
                      ) : (
                        <span className="text-amber-800 italic">
                          {inc.exclusionReason || inc.notes}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredIncidents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      No late pickup incidents recorded matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Suspension History Table */}
      {activeSubTab === 'suspensions' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#111827] uppercase tracking-wider">
                Driver Suspension & Automatic Compliance Log
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                {driverSuspensions.length} Total Records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Type & Source</th>
                  <th className="py-3 px-4">Exact Reason / Rule</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Start & Expiry Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {driverSuspensions.map((susp) => (
                  <tr key={susp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{susp.driverName}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">
                        {susp.driverPlate || susp.driverId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          susp.type === 'automatic'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-purple-100 text-purple-800 border border-purple-300'
                        }`}
                      >
                        {susp.type === 'automatic' ? 'AUTOMATIC SYSTEM' : 'MANUAL ADMIN'}
                      </span>
                      <div className="text-[10px] text-[#6B7280] mt-0.5 truncate max-w-[140px]">
                        {susp.source}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-[#111827]">{susp.reason}</div>
                      {susp.ruleTriggered && (
                        <div className="text-[10px] font-mono text-[#0F766E] mt-0.5">
                          Rule: {susp.ruleTriggered} {susp.incidentCount ? `(${susp.incidentCount}/5 incidents)` : ''}
                        </div>
                      )}
                      <div className="text-[10px] text-[#6B7280] mt-0.5">{susp.notes}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                      {susp.durationHours} Hours
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-[#6B7280]">
                      <div>Start: <span className="text-[#111827]">{susp.startTime}</span></div>
                      <div>Expiry: <span className="text-rose-700 font-bold">{susp.expiryTime}</span></div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          susp.status === 'active'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : susp.status === 'expired'
                            ? 'bg-slate-100 text-[#6B7280]'
                            : 'bg-emerald-100 text-[#10B981]'
                        }`}
                      >
                        {susp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {susp.status === 'active' ? (
                        <button
                          onClick={() => reinstateDriver(susp.driverId, 'Admin manual revocation of suspension')}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#10B981] transition cursor-pointer"
                        >
                          Revoke / Reinstate
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] italic">
                          {susp.status === 'expired' ? 'Served' : 'Revoked'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Config Threshold Settings */}
      {activeSubTab === 'config' && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs max-w-2xl space-y-5 text-[#111827]"
        >
          <div>
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#0F766E]" />
              Late Pickup Compliance Rules Configuration
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Set automated criteria for tracking pickup latency and applying automatic suspensions across Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Required Incidents for Suspension
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={configIncidents}
                onChange={(e) => setConfigIncidents(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] font-mono"
              />
              <span className="text-[10px] text-[#6B7280]">Default: 5 qualifying late pickups per calendar day</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Threshold Delay (Minutes)
              </label>
              <input
                type="number"
                min="3"
                max="60"
                required
                value={configThreshold}
                onChange={(e) => setConfigThreshold(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] font-mono"
              />
              <span className="text-[10px] text-[#6B7280]">Default: 8 minutes beyond expected ETA</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Suspension Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                required
                value={configDuration}
                onChange={(e) => setConfigDuration(Number(e.target.value))}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] font-mono"
              />
              <span className="text-[10px] text-[#6B7280]">Default: 12 hours cooling-off period</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Excluded Circumstances (Do not penalize driver)
            </h4>

            <label className="flex items-start gap-2.5 text-xs text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={excludePassenger}
                onChange={(e) => setExcludePassenger(e.target.checked)}
                className="rounded text-[#0F766E] mt-0.5"
              />
              <div>
                <span className="font-semibold">Exclude Passenger-Caused Delays</span>
                <p className="text-[10px] text-[#6B7280]">
                  When passenger requested driver wait at gate or delayed departure verified via chat/call log.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={excludeTraffic}
                onChange={(e) => setExcludeTraffic(e.target.checked)}
                className="rounded text-[#0F766E] mt-0.5"
              />
              <div>
                <span className="font-semibold">Exclude Severe Traffic & Route Closures</span>
                <p className="text-[10px] text-[#6B7280]">
                  Documented VIP movement or severe flooding detected by GoLife GIS telemetry.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white shadow-xs"
            >
              Save Configuration Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
