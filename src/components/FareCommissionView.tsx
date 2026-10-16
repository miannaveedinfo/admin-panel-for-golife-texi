import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FareRule, RideCategory } from '../types';
import { formatPKR } from '../utils/i18n';
import {
  Percent,
  TrendingUp,
  Zap,
  Save,
  Calculator,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Moon,
  MapPin,
  History,
  ShieldCheck
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  category: string;
  timestamp: string;
  admin: string;
  changeSummary: string;
}

export const FareCommissionView: React.FC = () => {
  const { fareRules, updateFareRule } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState<RideCategory>('GoMini');
  const [currentRule, setCurrentRule] = useState<FareRule>(
    () => fareRules.find((f) => f.category === 'GoMini') || fareRules[0]
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Night charges state
  const [nightChargesEnabled, setNightChargesEnabled] = useState(true);
  const [nightPercentage, setNightPercentage] = useState(15);

  // Geo-zone surge selector
  const [selectedGeoZone, setSelectedGeoZone] = useState('All High-Demand Geo-Zones');

  // Change history log
  const [historyLogs, setHistoryLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      category: 'GoMini',
      timestamp: 'Today, 10:45 AM',
      admin: 'SuperAdmin (Saad)',
      changeSummary: 'Updated base fare to Rs. 140, adjusted commission to 15.0%'
    },
    {
      id: 'log-2',
      category: 'GoRide',
      timestamp: 'Yesterday, 06:12 PM',
      admin: 'SuperAdmin (Saad)',
      changeSummary: 'Enabled rain surge 1.3x during Gulberg storm'
    },
    {
      id: 'log-3',
      category: 'GoMoto',
      timestamp: 'Sep 10, 2026',
      admin: 'FleetAdmin',
      changeSummary: 'Reduced base fare to Rs. 70 for student campus routes'
    }
  ]);

  // Live calculator test playground states
  const [calcDistance, setCalcDistance] = useState<number>(8.5);
  const [calcDuration, setCalcDuration] = useState<number>(22);
  const [calcWaiting, setCalcWaiting] = useState<number>(5);

  const handleSelectCategory = (cat: RideCategory) => {
    setSelectedCategory(cat);
    const found = fareRules.find((f) => f.category === cat);
    if (found) {
      setCurrentRule(found);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFareRule(currentRule);
    setSaveSuccess(true);

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      category: selectedCategory,
      timestamp: 'Just now',
      admin: 'SuperAdmin (Saad)',
      changeSummary: `Tariff update: Base ${formatPKR(currentRule.baseFare)}, ${currentRule.perKmRate} PKR/km, Comm ${currentRule.commissionPercentage}%`
    };
    setHistoryLogs([newLog, ...historyLogs]);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Fare calculations
  const rawBase = currentRule.baseFare;
  const rawDist = calcDistance * currentRule.perKmRate;
  const rawTime = calcDuration * currentRule.perMinuteRate;
  const rawWait = calcWaiting * currentRule.waitingChargePerMin;
  const subTotalBeforeSurge = Math.max(rawBase + rawDist + rawTime + rawWait, currentRule.minimumFare);

  const surgeEffective = currentRule.surgeEnabled ? currentRule.surgeMultiplier : 1.0;
  const nightEffective = nightChargesEnabled ? 1 + nightPercentage / 100 : 1.0;
  const calculatedTotalFare = Math.round(subTotalBeforeSurge * surgeEffective * nightEffective);
  const calculatedCommission = Math.round((calculatedTotalFare * currentRule.commissionPercentage) / 100);
  const calculatedDriverPayout = calculatedTotalFare - calculatedCommission;

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#0F766E]" />
            Fare, Surge & Platform Commission Policy
          </h1>
          <p className="text-xs text-[#6B7280]">
            Define flagdrop, distance tariffs, waiting charges, dynamic surge factors and GoLife commission rates
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Fare policy saved & broadcast to passenger apps!</span>
          </div>
        )}
      </div>

      {/* Category Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight'] as RideCategory[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              {cat}
            </button>
          )
        )}
      </div>

      {/* Main Grid: Form Setup (Left) + Surge Controls & Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Setup */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6"
        >
          <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111827]">
              Standard Tariff Rules for: <span className="text-[#0F766E]">{selectedCategory}</span>
            </h2>
            <span className="text-xs text-[#6B7280]">All amounts in PKR (Rs.)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Base Fare */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Base Fare (Opening Flagdrop PKR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentRule.baseFare}
                onChange={(e) => setCurrentRule({ ...currentRule, baseFare: Number(e.target.value) })}
                className="w-full p-2.5 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">Initial meter starting charge</span>
            </div>

            {/* Per KM Rate */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Per KM Distance Rate (PKR/km)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentRule.perKmRate}
                onChange={(e) => setCurrentRule({ ...currentRule, perKmRate: Number(e.target.value) })}
                className="w-full p-2.5 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">Accrued per kilometer traveled</span>
            </div>

            {/* Per Minute Rate */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Per Minute Ride Time Rate (PKR/min)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentRule.perMinuteRate}
                onChange={(e) =>
                  setCurrentRule({ ...currentRule, perMinuteRate: Number(e.target.value) })
                }
                className="w-full p-2.5 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">Accrued during active transit</span>
            </div>

            {/* Minimum Fare */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Minimum Fare Cap (PKR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentRule.minimumFare}
                onChange={(e) =>
                  setCurrentRule({ ...currentRule, minimumFare: Number(e.target.value) })
                }
                className="w-full p-2.5 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">Floor price for short distance rides</span>
            </div>

            {/* Waiting Charges */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Waiting Charges (PKR per minute)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentRule.waitingChargePerMin}
                onChange={(e) =>
                  setCurrentRule({ ...currentRule, waitingChargePerMin: Number(e.target.value) })
                }
                className="w-full p-2.5 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">Applies after 3 minutes complimentary wait</span>
            </div>

            {/* Cancellation Fee */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Cancellation Fee (PKR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentRule.cancellationFee}
                onChange={(e) =>
                  setCurrentRule({ ...currentRule, cancellationFee: Number(e.target.value) })
                }
                className="w-full p-2.5 text-sm font-mono rounded-xl bg-slate-50 text-[#111827] border border-[#E5E7EB] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">Penalty charged to passenger wallet</span>
            </div>

            {/* Platform Commission */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-[#E5E7EB]">
              <label className="block text-xs font-bold text-[#0F766E] mb-1">
                GoLife Platform Commission Percentage (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={currentRule.commissionPercentage}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      commissionPercentage: Number(e.target.value)
                    })
                  }
                  className="w-full accent-[#0F766E] cursor-pointer"
                />
                <span className="font-mono font-bold text-lg text-[#0F766E] w-16 text-right">
                  {currentRule.commissionPercentage}%
                </span>
              </div>
              <span className="text-[10px] text-[#6B7280]">
                Driver retains {(100 - currentRule.commissionPercentage).toFixed(1)}% of total trip fare
              </span>
            </div>

            {/* Night Charges Configuration */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-[#111827]">
                    Night Hours Surcharge (11:00 PM – 05:00 AM)
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    Incentivizes night drivers to maintain high platform availability
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNightChargesEnabled(!nightChargesEnabled)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    nightChargesEnabled
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-[#6B7280]'
                  }`}
                >
                  {nightChargesEnabled ? `+${nightPercentage}% Enabled` : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save & Broadcast Fare Policy
            </button>
          </div>
        </form>

        {/* Right Col: Dynamic Surge Pricing Controls & Fare Simulator */}
        <div className="space-y-5">
          {/* Surge Engine Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Surge & Peak Multiplier
                </h3>
              </div>

              {/* Surge Toggle */}
              <button
                type="button"
                onClick={() =>
                  setCurrentRule({ ...currentRule, surgeEnabled: !currentRule.surgeEnabled })
                }
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  currentRule.surgeEnabled
                    ? 'bg-[#F59E0B] text-slate-900'
                    : 'bg-slate-100 text-[#6B7280]'
                }`}
              >
                {currentRule.surgeEnabled ? 'ACTIVE (SURGE ON)' : 'SURGE OFF'}
              </button>
            </div>

            {/* Geo-Zone Target */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Geo-Zone Hotspot Target
              </label>
              <select
                value={selectedGeoZone}
                onChange={(e) => setSelectedGeoZone(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              >
                <option value="All High-Demand Geo-Zones">All High-Demand Geo-Zones</option>
                <option value="Lahore: Gulberg, DHA & Airport">Lahore: Gulberg, DHA & Airport</option>
                <option value="Karachi: Clifton, Saddar & Bahria">Karachi: Clifton, Saddar & Bahria</option>
                <option value="Islamabad: Blue Area & F-6/F-7">Islamabad: Blue Area & F-6/F-7</option>
              </select>
            </div>

            {currentRule.surgeEnabled && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#111827] font-semibold">Surge Multiplier</span>
                    <span className="font-mono font-bold text-[#F59E0B] text-sm">
                      {currentRule.surgeMultiplier}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.1"
                    max="2.5"
                    step="0.1"
                    value={currentRule.surgeMultiplier}
                    onChange={(e) =>
                      setCurrentRule({ ...currentRule, surgeMultiplier: Number(e.target.value) })
                    }
                    className="w-full accent-[#F59E0B] cursor-pointer"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#F59E0B] mt-0.5" />
                  <span>
                    Rush hour schedules: 08:00–10:30 AM & 05:00–08:30 PM. Surge is automatically scaled by dispatch load.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Realistic Fare Simulator */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Live Fare Simulator
              </h3>
            </div>

            {/* Test input sliders */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[#111827]">
                  <span>Distance:</span>
                  <span className="font-mono font-bold text-[#0F766E]">{calcDistance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="0.5"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  className="w-full accent-[#0F766E] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#111827]">
                  <span>Duration:</span>
                  <span className="font-mono font-bold text-[#0F766E]">{calcDuration} mins</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="120"
                  step="1"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Number(e.target.value))}
                  className="w-full accent-[#0F766E] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#111827]">
                  <span>Waiting Time:</span>
                  <span className="font-mono font-bold text-[#0F766E]">{calcWaiting} mins</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={calcWaiting}
                  onChange={(e) => setCalcWaiting(Number(e.target.value))}
                  className="w-full accent-[#0F766E] cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation Formula Output in PKR */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B7280] text-[11px]">
                <span>Base + Distance + Time:</span>
                <span className="font-mono">{formatPKR(Math.round(rawBase + rawDist + rawTime + rawWait))}</span>
              </div>
              {currentRule.surgeEnabled && (
                <div className="flex justify-between text-[#F59E0B] text-[11px]">
                  <span>Surge Multiplier:</span>
                  <span className="font-mono">{currentRule.surgeMultiplier}x</span>
                </div>
              )}
              {nightChargesEnabled && (
                <div className="flex justify-between text-indigo-600 text-[11px]">
                  <span>Night Tariff Surcharge:</span>
                  <span className="font-mono">+{nightPercentage}%</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5E7EB] flex justify-between font-bold text-sm text-[#111827]">
                <span>Total Passenger Price:</span>
                <span className="font-mono text-[#0F766E]">{formatPKR(calculatedTotalFare)}</span>
              </div>
              <div className="pt-1 flex justify-between text-[#0F766E] text-[11px]">
                <span>Platform Commission ({currentRule.commissionPercentage}%):</span>
                <span className="font-mono font-bold">{formatPKR(calculatedCommission)}</span>
              </div>
              <div className="flex justify-between text-[#10B981] text-[11px]">
                <span>Driver Net Payout:</span>
                <span className="font-mono font-bold">{formatPKR(calculatedDriverPayout)}</span>
              </div>
            </div>
          </div>

          {/* Change History Audit Log */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#0F766E]" />
              Tariff Policy Audit History
            </h3>
            <div className="space-y-2 text-xs">
              {historyLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                    <span className="font-bold text-[#0F766E]">{log.category}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-[#111827]">{log.changeSummary}</div>
                  <div className="text-[9px] text-[#6B7280]">By {log.admin}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
