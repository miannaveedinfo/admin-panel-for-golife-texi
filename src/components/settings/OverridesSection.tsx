import React, { useState, useMemo } from 'react';
import {
  ConfigurationOverride,
  BusinessRulesConfig
} from '../../types';
import {
  GitFork,
  MapPin,
  Car,
  Layers,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowDown,
  Info
} from 'lucide-react';

interface OverridesSectionProps {
  overrides: ConfigurationOverride[];
  rules: BusinessRulesConfig;
  availableCities: string[];
  onAddOverride: (override: Omit<ConfigurationOverride, 'id' | 'effectiveDate' | 'updatedBy'>, reason: string) => void;
  onRemoveOverride: (overrideId: string, reason: string) => void;
  onToggleOverrideStatus: (overrideId: string) => void;
  canManageOverrides: boolean;
  initialRuleFilter?: string;
}

export const OverridesSection: React.FC<OverridesSectionProps> = ({
  overrides = [],
  rules,
  availableCities,
  onAddOverride,
  onRemoveOverride,
  onToggleOverrideStatus,
  canManageOverrides,
  initialRuleFilter
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialRuleFilter || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Override Form State
  const [newTargetScope, setNewTargetScope] = useState<'city' | 'category' | 'city_category'>('city');
  const [newCityName, setNewCityName] = useState('Lahore');
  const [newCategoryName, setNewCategoryName] = useState('GoMoto');
  const [newRuleGroup, setNewRuleGroup] = useState<ConfigurationOverride['ruleGroup']>('rides');
  const [newRuleKey, setNewRuleKey] = useState('maxDriverSearchRadiusKm');
  const [newOverrideValue, setNewOverrideValue] = useState<string>('6.5');
  const [newReason, setNewReason] = useState('');

  const categories = ['GoMoto', 'GoAuto', 'GoMini', 'GoRide', 'GoComfort', 'GoFreight', 'GoIntercity'];

  const ruleOptions = [
    { group: 'commission', key: 'defaultCommissionPct', label: 'Platform Commission Rate', unit: '%', defaultValue: rules.commission?.defaultCommissionPct ?? 15 },
    { group: 'rides', key: 'maxDriverSearchRadiusKm', label: 'Max Driver Search Radius', unit: 'km', defaultValue: rules.rides.maxDriverSearchRadiusKm },
    { group: 'rides', key: 'driverArrivalFreeWaitMins', label: 'Driver Arrival Free Wait Window', unit: 'minutes', defaultValue: rules.rides.driverArrivalFreeWaitMins },
    { group: 'rides', key: 'cancellationWindowFreeMins', label: 'Free Cancellation Window', unit: 'minutes', defaultValue: rules.rides.cancellationWindowFreeMins },
    { group: 'rides', key: 'passengerCancellationFeePkr', label: 'Passenger Cancellation Fee', unit: 'PKR', defaultValue: rules.rides.passengerCancellationFeePkr },
    { group: 'rides', key: 'rideRequestExpirySec', label: 'Ride Request Broadcast Lifespan', unit: 'seconds', defaultValue: rules.rides.rideRequestExpirySec },
    { group: 'driver', key: 'minDriverRatingThreshold', label: 'Minimum Driver Rating Floor', unit: 'stars', defaultValue: rules.driver.minDriverRatingThreshold },
    { group: 'driver', key: 'minWalletBalancePkr', label: 'Min Wallet Balance for Cash Trips', unit: 'PKR', defaultValue: rules.driver.minWalletBalancePkr },
    { group: 'driver', key: 'latePickupWarningThresholdMins', label: 'Late Pickup Warning Threshold', unit: 'minutes', defaultValue: rules.driver.latePickupWarningThresholdMins },
    { group: 'passenger', key: 'passengerMaxOutstandingDebtPkr', label: 'Passenger Max Debt Tolerance', unit: 'PKR', defaultValue: rules.passenger.passengerMaxOutstandingDebtPkr },
    { group: 'passenger', key: 'passengerNoShowFeePkr', label: 'Passenger No-Show Penalty', unit: 'PKR', defaultValue: rules.passenger.passengerNoShowFeePkr },
    { group: 'safety', key: 'highSpeedWarningThresholdKmH', label: 'Urban High-Speed Alert Trigger', unit: 'km/h', defaultValue: rules.safety.highSpeedWarningThresholdKmH },
    { group: 'safety', key: 'sosPoliceEscalationTimeoutSec', label: 'SOS Auto-Escalation to Police 15', unit: 'seconds', defaultValue: rules.safety.sosPoliceEscalationTimeoutSec },
    { group: 'payments', key: 'minDriverWithdrawalPkr', label: 'Min Driver Payout Request', unit: 'PKR', defaultValue: rules.payments.minDriverWithdrawalPkr },
    { group: 'payments', key: 'maxDriverWithdrawalPerDayPkr', label: 'Max Driver Daily Payout Cap', unit: 'PKR', defaultValue: rules.payments.maxDriverWithdrawalPerDayPkr },
    { group: 'payments', key: 'maxNegativeWalletLimitPkr', label: 'Negative Wallet Credit Tolerance', unit: 'PKR', defaultValue: rules.payments.maxNegativeWalletLimitPkr }
  ];

  const selectedRuleMeta = ruleOptions.find((r) => r.key === newRuleKey) || ruleOptions[0];

  const filteredOverrides = useMemo(() => {
    return (overrides || []).filter((ovr) => {
      if (selectedCity !== 'all' && ovr.cityName?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'all' && ovr.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchLabel = ovr.ruleLabel.toLowerCase().includes(query);
        const matchKey = ovr.ruleKey.toLowerCase().includes(query);
        const matchCity = ovr.cityName?.toLowerCase().includes(query);
        const matchCat = ovr.categoryName?.toLowerCase().includes(query);
        const matchReason = ovr.reason.toLowerCase().includes(query);
        if (!matchLabel && !matchKey && !matchCity && !matchCat && !matchReason) {
          return false;
        }
      }
      return true;
    });
  }, [overrides, selectedCity, selectedCategory, searchQuery]);

  const handleCreateOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;

    onAddOverride(
      {
        targetScope: newTargetScope,
        cityName: newTargetScope === 'category' ? undefined : newCityName,
        categoryName: newTargetScope === 'city' ? undefined : newCategoryName,
        ruleGroup: selectedRuleMeta.group as any,
        ruleKey: selectedRuleMeta.key,
        ruleLabel: selectedRuleMeta.label,
        inheritedValue: selectedRuleMeta.defaultValue,
        overrideValue: isNaN(Number(newOverrideValue)) ? newOverrideValue : Number(newOverrideValue),
        unit: selectedRuleMeta.unit,
        status: 'active',
        reason: newReason
      },
      newReason
    );

    setShowAddModal(false);
    setNewReason('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Inheritance Flow Visual Diagram Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <GitFork className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black tracking-tight">Configuration Inheritance Hierarchy</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Local adjustments gracefully override broad defaults. If a city or category override is removed, the parameter instantly cascades back to the inherited value.
            </p>
          </div>

          {/* Visual Step Tree */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <div>
                <div className="font-extrabold text-[11px] text-slate-200">Global Default</div>
                <div className="text-[9px] text-slate-400">Baseline Pakistan</div>
              </div>
            </div>

            <span className="text-amber-400 font-bold">➔</span>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <div className="font-extrabold text-[11px] text-amber-300">City Override</div>
                <div className="text-[9px] text-slate-400">e.g. Lahore / Karachi</div>
              </div>
            </div>

            <span className="text-amber-400 font-bold">➔</span>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div>
                <div className="font-extrabold text-[11px] text-emerald-300">Category Override</div>
                <div className="text-[9px] text-slate-400">e.g. GoMoto in Lahore</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* City Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            >
              <option value="all">All Operating Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
            >
              <option value="all">All Service Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search override rules, labels, reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400 w-52"
            />
          </div>
        </div>

        {/* Add Override Button */}
        <button
          type="button"
          disabled={!canManageOverrides}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Rule Override</span>
        </button>
      </div>

      {/* 3. Overrides Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Scope & Location</th>
                <th className="py-3 px-4">Governed Rule</th>
                <th className="py-3 px-4 text-center">Inherited Default</th>
                <th className="py-3 px-4 text-center">Override Value</th>
                <th className="py-3 px-4">Justification & Context</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOverrides.map((ovr) => {
                return (
                  <tr key={ovr.id} className="hover:bg-slate-50/70 transition">
                    {/* Scope & Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                          {ovr.targetScope === 'city' && <MapPin className="w-3.5 h-3.5" />}
                          {ovr.targetScope === 'category' && <Car className="w-3.5 h-3.5" />}
                          {ovr.targetScope === 'city_category' && <Layers className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900">
                            {ovr.targetScope === 'city' && `${ovr.cityName} City`}
                            {ovr.targetScope === 'category' && `${ovr.categoryName} Fleet`}
                            {ovr.targetScope === 'city_category' && `${ovr.cityName} • ${ovr.categoryName}`}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize font-medium">
                            {ovr.targetScope.replace('_', ' + ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Governed Rule */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ovr.ruleLabel}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ovr.ruleKey}</div>
                    </td>

                    {/* Inherited Default */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-medium text-slate-500">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {String(ovr.inheritedValue)} {ovr.unit}
                      </span>
                    </td>

                    {/* Override Value */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-black">
                        {String(ovr.overrideValue)} {ovr.unit}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {ovr.reason}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Effective: {ovr.effectiveDate} • By: {ovr.updatedBy}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={!canManageOverrides}
                        onClick={() => onToggleOverrideStatus(ovr.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          ovr.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${ovr.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{ovr.status === 'active' ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        disabled={!canManageOverrides}
                        onClick={() => onRemoveOverride(ovr.id, 'Admin removed override to restore default')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                        title="Revert to Inherited Default"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOverrides.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <Info className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                    <p className="font-semibold text-xs">No configuration overrides match current filters.</p>
                    <p className="text-[11px] text-slate-400">All rules in this selection inherit Global Platform Defaults.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Override Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-black text-slate-900 text-sm">Create New Configuration Override</h4>
                <p className="text-xs text-slate-500">
                  Select location scope, target parameter, and supply a justified override value.
                </p>
              </div>
              <GitFork className="w-5 h-5 text-amber-500" />
            </div>

            <form onSubmit={handleCreateOverride} className="space-y-4 text-xs">
              {/* Scope Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Override Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTargetScope('city')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      newTargetScope === 'city'
                        ? 'bg-amber-100 border-amber-400 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    City Specific
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTargetScope('category')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      newTargetScope === 'category'
                        ? 'bg-amber-100 border-amber-400 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Category Specific
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTargetScope('city_category')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      newTargetScope === 'city_category'
                        ? 'bg-amber-100 border-amber-400 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    City + Category
                  </button>
                </div>
              </div>

              {/* City and Category Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {newTargetScope !== 'category' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Select City</label>
                    <select
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {newTargetScope !== 'city' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Select Service Category</label>
                    <select
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Target Parameter */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Rule Parameter to Override</label>
                <select
                  value={newRuleKey}
                  onChange={(e) => {
                    setNewRuleKey(e.target.value);
                    const opt = ruleOptions.find((r) => r.key === e.target.value);
                    if (opt) {
                      setNewOverrideValue(String(opt.defaultValue));
                      setNewRuleGroup(opt.group as any);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                >
                  {ruleOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      [{opt.group.toUpperCase()}] {opt.label} (Default: {opt.defaultValue} {opt.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Override Value */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  New Override Value ({selectedRuleMeta.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newOverrideValue}
                    onChange={(e) => setNewOverrideValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/30 font-bold text-slate-900 text-sm"
                  />
                  <span className="text-slate-500 font-bold shrink-0">{selectedRuleMeta.unit}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Global default is currently: {selectedRuleMeta.defaultValue} {selectedRuleMeta.unit}
                </p>
              </div>

              {/* Justification */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Operational Justification / Context <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Higher traffic congestion along Shahrah-e-Faisal requires 2 extra minutes of free passenger wait"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newReason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs disabled:opacity-50"
                >
                  Save & Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
