import React, { useState } from 'react';
import {
  BusinessRulesConfig,
  ConfigurationOverride
} from '../../types';
import {
  Clock,
  Car,
  Users,
  ShieldAlert,
  CreditCard,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  Percent
} from 'lucide-react';

interface BusinessRulesSectionProps {
  rules: BusinessRulesConfig;
  overrides: ConfigurationOverride[];
  onUpdateRules: (updated: BusinessRulesConfig, reason: string) => void;
  canEditRules: boolean;
  onJumpToOverrides: (ruleKey?: string) => void;
}

export const BusinessRulesSection: React.FC<BusinessRulesSectionProps> = ({
  rules,
  overrides = [],
  onUpdateRules,
  canEditRules,
  onJumpToOverrides
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rides' | 'driver' | 'passenger' | 'safety' | 'payments' | 'commission'>('rides');
  const [formData, setFormData] = useState<BusinessRulesConfig>({
    ...rules,
    commission: {
      defaultCommissionPct: 15,
      punjabPraTaxPct: 16,
      sindhSrbTaxPct: 13,
      kpKpraTaxPct: 15,
      islamabadIctTaxPct: 16,
      balochistanBraTaxPct: 15,
      fbrWhtTaxPct: 5,
      driverReferralBonusPkr: 500,
      passengerReferralBonusPkr: 200,
      ...(rules.commission || {})
    }
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleFieldChange = (group: keyof BusinessRulesConfig, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] as any),
        [field]: value
      }
    }));
  };

  const executeSave = () => {
    onUpdateRules(formData, changeReason || 'Business rules configuration updated');
    setShowConfirmModal(false);
    setChangeReason('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  // Helper to check if a rule key has active overrides
  const getActiveOverrideCount = (ruleKey: string) => {
    return (overrides || []).filter((o) => o.status === 'active' && o.ruleKey === ruleKey).length;
  };

  return (
    <div className="space-y-6">
      {/* Save Notification */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Business rules saved and applied to live matching & dispatch pipeline.</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
            Policy Engine Synced
          </span>
        </div>
      )}

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('rides')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'rides'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Rides & Dispatch Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('driver')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'driver'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Driver Eligibility & Conduct</span>
        </button>

        <button
          onClick={() => setActiveSubTab('passenger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'passenger'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Passenger Standards</span>
        </button>

        <button
          onClick={() => setActiveSubTab('safety')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'safety'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Safety & SOS Thresholds</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'payments'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payments & Limits</span>
        </button>

        <button
          onClick={() => setActiveSubTab('commission')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'commission'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Commission & Taxes</span>
        </button>
      </div>

      {/* Rules Editor Form */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
        {/* ============================================================
            1. RIDES & DISPATCH RULES
           ============================================================ */}
        {activeSubTab === 'rides' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Rides, Dispatch & Bidding Rules</h3>
                <p className="text-xs text-slate-500">
                  Controls broadcast search radiuses, offer lifespans, and cancellation grace windows.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                10 Operational Knobs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Max Driver Search Radius */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Max Driver Search Radius</label>
                  {getActiveOverrideCount('maxDriverSearchRadiusKm') > 0 && (
                    <button
                      type="button"
                      onClick={() => onJumpToOverrides('maxDriverSearchRadiusKm')}
                      className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{getActiveOverrideCount('maxDriverSearchRadiusKm')} Overrides</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="30"
                    disabled={!canEditRules}
                    value={formData.rides.maxDriverSearchRadiusKm}
                    onChange={(e) => handleFieldChange('rides', 'maxDriverSearchRadiusKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">km</span>
                </div>
                <p className="text-[11px] text-slate-500">Initial radar radius to find nearest available drivers.</p>
              </div>

              {/* Max Ride Request Distance */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Max Ride Request Distance</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="5"
                    max="200"
                    disabled={!canEditRules}
                    value={formData.rides.maxRideRequestDistanceKm}
                    onChange={(e) => handleFieldChange('rides', 'maxRideRequestDistanceKm', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">km</span>
                </div>
                <p className="text-[11px] text-slate-500">Upper cap for standard intra-city on-demand bookings.</p>
              </div>

              {/* Ride Request Expiry */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Ride Request Broadcast Lifespan</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="30"
                    max="300"
                    disabled={!canEditRules}
                    value={formData.rides.rideRequestExpirySec}
                    onChange={(e) => handleFieldChange('rides', 'rideRequestExpirySec', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">seconds</span>
                </div>
                <p className="text-[11px] text-slate-500">Time request remains live on driver radar before expiring.</p>
              </div>

              {/* Driver Offer Expiry */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Driver Offer / Bid Lifespan</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="15"
                    max="60"
                    disabled={!canEditRules}
                    value={formData.rides.driverOfferExpirySec}
                    onChange={(e) => handleFieldChange('rides', 'driverOfferExpirySec', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">seconds</span>
                </div>
                <p className="text-[11px] text-slate-500">Time a captain has to accept or propose counter-fare.</p>
              </div>

              {/* Driver Arrival Free Wait Minutes */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Driver Arrival Free Wait Window</label>
                  {getActiveOverrideCount('driverArrivalFreeWaitMins') > 0 && (
                    <button
                      type="button"
                      onClick={() => onJumpToOverrides('driverArrivalFreeWaitMins')}
                      className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{getActiveOverrideCount('driverArrivalFreeWaitMins')} Overrides</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="2"
                    max="15"
                    disabled={!canEditRules}
                    value={formData.rides.driverArrivalFreeWaitMins}
                    onChange={(e) => handleFieldChange('rides', 'driverArrivalFreeWaitMins', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">minutes</span>
                </div>
                <p className="text-[11px] text-slate-500">Grace period captain waits at pickup before paid waiting begins.</p>
              </div>

              {/* Free Cancellation Window */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Free Cancellation Window</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="10"
                    disabled={!canEditRules}
                    value={formData.rides.cancellationWindowFreeMins}
                    onChange={(e) => handleFieldChange('rides', 'cancellationWindowFreeMins', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">minutes</span>
                </div>
                <p className="text-[11px] text-slate-500">Rider can cancel without penalty within this timeframe of driver assignment.</p>
              </div>

              {/* Passenger Cancellation Fee */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Passenger Cancellation Fee</label>
                  {getActiveOverrideCount('passengerCancellationFeePkr') > 0 && (
                    <button
                      type="button"
                      onClick={() => onJumpToOverrides('passengerCancellationFeePkr')}
                      className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{getActiveOverrideCount('passengerCancellationFeePkr')} Overrides</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    max="500"
                    disabled={!canEditRules}
                    value={formData.rides.passengerCancellationFeePkr}
                    onChange={(e) => handleFieldChange('rides', 'passengerCancellationFeePkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Penalty charged if rider cancels after the free grace window.</p>
              </div>

              {/* Ride Completion Proof Requirement */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Trip Completion Verification</label>
                <select
                  disabled={!canEditRules}
                  value={formData.rides.rideCompletionRequirement}
                  onChange={(e) => handleFieldChange('rides', 'rideCompletionRequirement', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                >
                  <option value="otp_and_proximity">OTP Code + GPS Destination Proximity</option>
                  <option value="proximity_only">GPS Destination Proximity Only</option>
                  <option value="otp_only">OTP Code Confirmation Only</option>
                </select>
                <p className="text-[11px] text-slate-500">Prevents fraudulent remote trip completion by drivers.</p>
              </div>

              {/* Night PIN Requirement */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Mandatory Ride Start PIN</label>
                <select
                  disabled={!canEditRules}
                  value={formData.rides.pinRequirement}
                  onChange={(e) => handleFieldChange('rides', 'pinRequirement', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                >
                  <option value="always">Always Mandatory (4-Digit PIN)</option>
                  <option value="night_only">Night Hours Only (8:00 PM – 6:00 AM)</option>
                  <option value="optional">Optional / Rider Preference</option>
                </select>
                <p className="text-[11px] text-slate-500">Ensures correct passenger boards vehicle before trip starts.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            2. DRIVER POLICIES
           ============================================================ */}
        {activeSubTab === 'driver' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Driver Eligibility, KYC & Quality Floors</h3>
                <p className="text-xs text-slate-500">
                  NADRA CNIC requirements, minimum rating floors, and active ride caps.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Fleet Quality Controls
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Minimum Rating Threshold */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Minimum Rating Floor</label>
                  {getActiveOverrideCount('minDriverRatingThreshold') > 0 && (
                    <button
                      type="button"
                      onClick={() => onJumpToOverrides('minDriverRatingThreshold')}
                      className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{getActiveOverrideCount('minDriverRatingThreshold')} Overrides</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="3.5"
                    max="4.9"
                    disabled={!canEditRules}
                    value={formData.driver.minDriverRatingThreshold}
                    onChange={(e) => handleFieldChange('driver', 'minDriverRatingThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">Stars</span>
                </div>
                <p className="text-[11px] text-slate-500">Captains falling below this threshold trigger retraining warning.</p>
              </div>

              {/* Minimum Wallet Balance for Cash Trips */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Min Wallet Balance for Cash Trips</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    max="1000"
                    disabled={!canEditRules}
                    value={formData.driver.minWalletBalancePkr}
                    onChange={(e) => handleFieldChange('driver', 'minWalletBalancePkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Required wallet credit to accept cash trips (covers GoLife commission).</p>
              </div>

              {/* Inactivity Threshold */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Inactivity Re-verification Cap</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="7"
                    max="90"
                    disabled={!canEditRules}
                    value={formData.driver.driverInactivityThresholdDays}
                    onChange={(e) => handleFieldChange('driver', 'driverInactivityThresholdDays', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">Days</span>
                </div>
                <p className="text-[11px] text-slate-500">Dormant captains beyond this period must take selfie verification.</p>
              </div>

              {/* Late Pickup Warning Threshold */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Late Pickup Warning Threshold</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="3"
                    max="20"
                    disabled={!canEditRules}
                    value={formData.driver.latePickupWarningThresholdMins}
                    onChange={(e) => handleFieldChange('driver', 'latePickupWarningThresholdMins', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">Minutes</span>
                </div>
                <p className="text-[11px] text-slate-500">Arrivals beyond ETA by this window trigger delayed pickup alert.</p>
              </div>

              {/* KYC Checkboxes */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 md:col-span-2 space-y-2">
                <label className="font-bold text-slate-800 block">Mandatory Verification Gates</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      disabled={!canEditRules}
                      checked={formData.driver.requireApprovedCnic}
                      onChange={(e) => handleFieldChange('driver', 'requireApprovedCnic', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Approved NADRA CNIC</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      disabled={!canEditRules}
                      checked={formData.driver.requireApprovedLicense}
                      onChange={(e) => handleFieldChange('driver', 'requireApprovedLicense', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Valid Driving License</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      disabled={!canEditRules}
                      checked={formData.driver.requireVehicleInspection}
                      onChange={(e) => handleFieldChange('driver', 'requireVehicleInspection', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Vehicle Inspection & Photos</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            3. PASSENGER POLICIES
           ============================================================ */}
        {activeSubTab === 'passenger' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Passenger Standards & Debt Controls</h3>
                <p className="text-xs text-slate-500">
                  Protection against chronic no-shows, unpaid cash debts, and abusive ride cancellations.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Abuse Prevention
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Max Outstanding Debt */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Max Outstanding Debt Limit</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    max="2000"
                    disabled={!canEditRules}
                    value={formData.passenger.passengerMaxOutstandingDebtPkr}
                    onChange={(e) => handleFieldChange('passenger', 'passengerMaxOutstandingDebtPkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Riders exceeding this debt must settle balance before next booking.</p>
              </div>

              {/* Consecutive Cancellations Lock */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Consecutive Cancellations Cooldown</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="2"
                    max="10"
                    disabled={!canEditRules}
                    value={formData.passenger.consecutiveCancellationsLockCount}
                    onChange={(e) => handleFieldChange('passenger', 'consecutiveCancellationsLockCount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">Trips</span>
                </div>
                <p className="text-[11px] text-slate-500">Successive cancellations within 1 hour trigger 30-minute booking freeze.</p>
              </div>

              {/* Passenger No-Show Fee */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Passenger No-Show Fee</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="25"
                    min="50"
                    max="500"
                    disabled={!canEditRules}
                    value={formData.passenger.passengerNoShowFeePkr}
                    onChange={(e) => handleFieldChange('passenger', 'passengerNoShowFeePkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Assessed when driver arrives, waits full free period, and passenger fails to show.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            4. SAFETY & SOS THRESHOLDS
           ============================================================ */}
        {activeSubTab === 'safety' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Safety, SOS Panic & Telematics Standards</h3>
                <p className="text-xs text-slate-500">
                  Critical SLA timeouts for incident response, emergency contact dispatch, and telemetry heartbeats.
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                SLA Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* SOS Police Escalation Timeout */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                <label className="font-bold text-rose-950">SOS Auto-Escalation to Police 15</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10"
                    min="30"
                    max="180"
                    disabled={!canEditRules}
                    value={formData.safety.sosPoliceEscalationTimeoutSec}
                    onChange={(e) => handleFieldChange('safety', 'sosPoliceEscalationTimeoutSec', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-rose-300 bg-white font-bold text-rose-950"
                  />
                  <span className="text-rose-700 font-bold shrink-0">seconds</span>
                </div>
                <p className="text-[11px] text-rose-800">If incident is unacknowledged by desk, auto-bridges to Police 15.</p>
              </div>

              {/* High Speed Warning Threshold */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Urban High-Speed Alert Trigger</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="5"
                    min="60"
                    max="130"
                    disabled={!canEditRules}
                    value={formData.safety.highSpeedWarningThresholdKmH}
                    onChange={(e) => handleFieldChange('safety', 'highSpeedWarningThresholdKmH', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">km/h</span>
                </div>
                <p className="text-[11px] text-slate-500">Triggers in-cab audio speed warning chime to captain.</p>
              </div>

              {/* Telemetry Ping Frequency */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">GPS Telematics Ping Frequency</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="10"
                    disabled={!canEditRules}
                    value={formData.safety.telemetryPingFrequencySeconds}
                    onChange={(e) => handleFieldChange('safety', 'telemetryPingFrequencySeconds', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">seconds</span>
                </div>
                <p className="text-[11px] text-slate-500">Live coordinates transmission interval during active trips.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            5. PAYMENTS & WALLET LIMITS
           ============================================================ */}
        {activeSubTab === 'payments' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Payments, Wallet Balances & Withdrawal Caps</h3>
                <p className="text-xs text-slate-500">
                  Transaction safety boundaries, driver payout limits, and negative credit tolerances.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                SBP Aligned
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Min Driver Withdrawal Limit */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Min Driver Payout Request</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    max="5000"
                    disabled={!canEditRules}
                    value={formData.payments.minDriverWithdrawalPkr}
                    onChange={(e) => handleFieldChange('payments', 'minDriverWithdrawalPkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Minimum accumulated earnings to trigger withdrawal to JazzCash/Easypaisa.</p>
              </div>

              {/* Max Driver Daily Withdrawal */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Max Driver Daily Payout Cap</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    max="100000"
                    disabled={!canEditRules}
                    value={formData.payments.maxDriverWithdrawalPerDayPkr}
                    onChange={(e) => handleFieldChange('payments', 'maxDriverWithdrawalPerDayPkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Daily limit; amounts above require supervisor approval under sensitive rules.</p>
              </div>

              {/* Max Negative Wallet Limit */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Negative Wallet Credit Tolerance</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="50"
                    min="-2000"
                    max="0"
                    disabled={!canEditRules}
                    value={formData.payments.maxNegativeWalletLimitPkr}
                    onChange={(e) => handleFieldChange('payments', 'maxNegativeWalletLimitPkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Maximum negative commission debt permitted before captain is required to top-up.</p>
              </div>

              {/* Gateway Timeout */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Payment Gateway Response Timeout</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="10"
                    min="30"
                    max="300"
                    disabled={!canEditRules}
                    value={formData.payments.gatewayTimeoutSeconds}
                    onChange={(e) => handleFieldChange('payments', 'gatewayTimeoutSeconds', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">Seconds</span>
                </div>
                <p className="text-[11px] text-slate-500">Window for JazzCash USSD prompt or card 3DS verification before fallback.</p>
              </div>

              {/* Failed Payment Action */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Gateway Failure Fallback Strategy</label>
                <select
                  disabled={!canEditRules}
                  value={formData.payments.failedPaymentAction}
                  onChange={(e) => handleFieldChange('payments', 'failedPaymentAction', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                >
                  <option value="downgrade_to_cash_debt">Convert to Cash Debt on Passenger Account</option>
                  <option value="retry_gateway_once">Auto-retry Gateway Once, then Cash Debt</option>
                  <option value="block_driver_settlement">Hold Driver Settlement Pending Manual Audit</option>
                </select>
                <p className="text-[11px] text-slate-500">Determines system behavior if online transaction fails at trip destination.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            6. PLATFORM COMMISSION & PROVINCIAL TAX POLICIES
           ============================================================ */}
        {activeSubTab === 'commission' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Platform Commission & Provincial Tax Policies</h3>
                <p className="text-xs text-slate-500">
                  Manage standard commission deductions, provincial sales taxes (PRA, SRB, KPRA, BRA), and FBR withholding.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                FBR & PRA Aligned
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Standard Platform Commission */}
              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Standard Platform Commission</label>
                  {getActiveOverrideCount('defaultCommissionPct') > 0 && (
                    <button
                      type="button"
                      onClick={() => onJumpToOverrides('defaultCommissionPct')}
                      className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wide bg-amber-200 text-amber-950 border border-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{getActiveOverrideCount('defaultCommissionPct')} Overrides</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="40"
                    disabled={!canEditRules}
                    value={formData.commission?.defaultCommissionPct ?? 15}
                    onChange={(e) => handleFieldChange('commission', 'defaultCommissionPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-bold text-slate-900"
                  />
                  <span className="text-amber-800 font-bold shrink-0">%</span>
                </div>
                <p className="text-[11px] text-slate-500">Default commission deducted from cash & digital rides nationwide.</p>
              </div>

              {/* Punjab PRA Sales Tax */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Punjab Revenue Authority (PRA)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    disabled={!canEditRules}
                    value={formData.commission?.punjabPraTaxPct ?? 16}
                    onChange={(e) => handleFieldChange('commission', 'punjabPraTaxPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">%</span>
                </div>
                <p className="text-[11px] text-slate-500">Service sales tax on rides in Lahore, Rawalpindi, Faisalabad, Multan.</p>
              </div>

              {/* Sindh SRB Sales Tax */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Sindh Revenue Board (SRB)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    disabled={!canEditRules}
                    value={formData.commission?.sindhSrbTaxPct ?? 13}
                    onChange={(e) => handleFieldChange('commission', 'sindhSrbTaxPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">%</span>
                </div>
                <p className="text-[11px] text-slate-500">Service sales tax for Karachi, Hyderabad, and Sukkur operations.</p>
              </div>

              {/* KP KPRA Sales Tax */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Khyber Pakhtunkhwa (KPRA)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    disabled={!canEditRules}
                    value={formData.commission?.kpKpraTaxPct ?? 15}
                    onChange={(e) => handleFieldChange('commission', 'kpKpraTaxPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">%</span>
                </div>
                <p className="text-[11px] text-slate-500">Service tax applicable in Peshawar, Abbottabad, and Mardan.</p>
              </div>

              {/* Islamabad ICT Sales Tax */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Islamabad Capital Territory (ICT)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    disabled={!canEditRules}
                    value={formData.commission?.islamabadIctTaxPct ?? 16}
                    onChange={(e) => handleFieldChange('commission', 'islamabadIctTaxPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">%</span>
                </div>
                <p className="text-[11px] text-slate-500">ICT tax for Islamabad Federal Zone rides.</p>
              </div>

              {/* FBR Withholding Tax */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">FBR Withholding Tax (WHT)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    disabled={!canEditRules}
                    value={formData.commission?.fbrWhtTaxPct ?? 5}
                    onChange={(e) => handleFieldChange('commission', 'fbrWhtTaxPct', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold shrink-0">%</span>
                </div>
                <p className="text-[11px] text-slate-500">Federal withholding tax deducted on non-filer payout requests.</p>
              </div>

              {/* Driver Referral Reward */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Driver Referral Incentive</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    max="5000"
                    disabled={!canEditRules}
                    value={formData.commission?.driverReferralBonusPkr ?? 500}
                    onChange={(e) => handleFieldChange('commission', 'driverReferralBonusPkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Credited to captain's wallet upon referred driver completing 10 rides.</p>
              </div>

              {/* Passenger Referral Voucher */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="font-bold text-slate-800">Passenger Referral Credit</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0">PKR</span>
                  <input
                    type="number"
                    step="25"
                    min="0"
                    max="1000"
                    disabled={!canEditRules}
                    value={formData.commission?.passengerReferralBonusPkr ?? 200}
                    onChange={(e) => handleFieldChange('commission', 'passengerReferralBonusPkr', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Promotional wallet credit after friend finishes their first completed trip.</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Last policy update: <span className="font-bold text-slate-800">{rules.lastUpdated}</span> by <span className="font-bold text-slate-800">{rules.updatedBy}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(rules)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Stored Values</span>
            </button>

            <button
              type="button"
              disabled={!canEditRules}
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Commit Policy Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <span className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Commit Business Rules Update</h4>
                <p className="text-xs text-slate-500">Platform-wide Operational Impact</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              These rules directly govern dispatch radiuses, driver penalties, passenger debts, and emergency protocols. Changes will take effect immediately on incoming trip requests.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Audit Justification <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adjusted free wait time and search radius for peak traffic season"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={!changeReason.trim()}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs disabled:opacity-50"
              >
                Authorize & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
