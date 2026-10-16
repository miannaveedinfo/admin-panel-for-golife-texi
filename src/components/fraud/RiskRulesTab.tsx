import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { RiskRule, RiskCategory, RiskLevel } from '../../types';
import {
  Zap,
  Plus,
  Edit2,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Shield,
  Activity,
  Layers,
  X
} from 'lucide-react';

export const RiskRulesTab: React.FC = () => {
  const {
    riskRules,
    updateRiskRule,
    createRiskRule,
    hasSensitivePermission,
    currentAdmin,
    showToast
  } = useAdmin();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<RiskRule | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [ruleName, setRuleName] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [ruleCategory, setRuleCategory] = useState<RiskCategory>('gps_spoofing');
  const [description, setDescription] = useState('');
  const [thresholdMetric, setThresholdMetric] = useState('');
  const [thresholdLimit, setThresholdLimit] = useState(5);
  const [thresholdUnit, setThresholdUnit] = useState('');
  const [actionOnTrigger, setActionOnTrigger] = useState<RiskRule['actionOnTrigger']>('alert_only');
  const [sensitivity, setSensitivity] = useState<RiskRule['sensitivity']>('high');
  const [reasonForChange, setReasonForChange] = useState('');

  const categoryLabels: Record<string, string> = {
    gps_spoofing: 'GPS Spoofing & Telemetry',
    ghost_rides: 'Ghost & Phantom Rides',
    promo_abuse: 'Voucher & Referral Abuse',
    fare_manipulation: 'Fare & Toll Padding',
    cancellation_abuse: 'Surge Cancellation Spree',
    driver_passenger_collusion: 'Driver-Passenger Collusion',
    account_takeover: 'Account Takeover / SIM Swap',
    document_fraud: 'Forged Identity / Fake CNIC',
    route_tampering: 'Detour & Route Tampering',
    fake_surge_creation: 'Artificial Surge Clusters'
  };

  const filteredRules = riskRules.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleToggleRule = (rule: RiskRule) => {
    const nextState = !rule.isEnabled;
    updateRiskRule(
      rule.id,
      { isEnabled: nextState },
      `Autonomous defense rule ${rule.ruleCode} was ${nextState ? 'enabled' : 'disabled'} by ${currentAdmin?.name || 'Admin'}`
    );
  };

  const handleOpenEdit = (rule: RiskRule) => {
    setSelectedRuleForEdit(rule);
    setIsCreatingNew(false);
    setRuleName(rule.name);
    setRuleCode(rule.ruleCode || rule.id);
    setRuleCategory(rule.category);
    setDescription(rule.description);
    setThresholdMetric(rule.thresholdConditions?.metric || 'Threshold');
    setThresholdLimit(rule.thresholdConditions?.limit || 1);
    setThresholdUnit(rule.thresholdConditions?.unit || 'events');
    setActionOnTrigger(rule.actionOnTrigger || 'flag_for_review');
    setSensitivity(rule.sensitivity || 'high');
    setReasonForChange('');
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setSelectedRuleForEdit(null);
    setRuleName('');
    setRuleCode(`RR-CUST-${Math.floor(100 + Math.random() * 900)}`);
    setRuleCategory('gps_spoofing');
    setDescription('');
    setThresholdMetric('Velocity Anomaly');
    setThresholdLimit(150);
    setThresholdUnit('km/h');
    setActionOnTrigger('flag_for_review');
    setSensitivity('high');
    setReasonForChange('Initial deployment of autonomous defense policy');
  };

  const handleSaveRule = () => {
    if (!ruleName.trim() || !ruleCode.trim()) {
      showToast('Please provide a valid rule name and code', 'error');
      return;
    }

    if (isCreatingNew) {
      createRiskRule({
        name: ruleName.trim(),
        ruleCode: ruleCode.trim(),
        category: ruleCategory,
        description: description.trim() || `Automated Sentinel heuristic for ${categoryLabels[ruleCategory]}`,
        thresholdConditions: {
          metric: thresholdMetric.trim() || 'Threshold',
          operator: 'gt',
          limit: Number(thresholdLimit),
          unit: thresholdUnit.trim() || 'units'
        },
        actionOnTrigger,
        sensitivity,
        isEnabled: true,
        timesTriggered: 0
      });
      setIsCreatingNew(false);
    } else if (selectedRuleForEdit) {
      updateRiskRule(
        selectedRuleForEdit.id,
        {
          name: ruleName.trim(),
          category: ruleCategory,
          description: description.trim(),
          thresholdConditions: {
            ...selectedRuleForEdit.thresholdConditions,
            metric: thresholdMetric.trim(),
            limit: Number(thresholdLimit),
            unit: thresholdUnit.trim()
          },
          actionOnTrigger,
          sensitivity
        },
        reasonForChange.trim() || 'Updated detection rule parameters'
      );
      setSelectedRuleForEdit(null);
    }
  };

  return (
    <div id="risk-rules-container" className="space-y-5 text-[#111827]">
      {/* Top Header Strip */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-950">
              Autonomous Risk & Fraud Detection Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time heuristic algorithms, trip sensor barriers, and automatic throttling policies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Rule Domains ({riskRules.length})</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Detection Rule
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Code & Name</th>
                <th className="py-3 px-4">Threat Domain</th>
                <th className="py-3 px-4">Trigger Condition</th>
                <th className="py-3 px-4">Enforcement Action</th>
                <th className="py-3 px-4">Sensitivity</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Hits</th>
                <th className="py-3 px-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        rule.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.isEnabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono text-[10px] font-bold text-slate-400">
                      {rule.ruleCode || rule.id}
                    </div>
                    <div className="font-bold text-slate-900 line-clamp-1">{rule.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      {rule.description}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                      {categoryLabels[rule.category] || rule.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {rule.thresholdConditions
                        ? `${rule.thresholdConditions.metric} > ${rule.thresholdConditions.limit} ${rule.thresholdConditions.unit}`
                        : rule.threshold || rule.trigger || 'Threshold N/A'}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        rule.actionOnTrigger === 'auto_lock' || rule.actionOnTrigger === 'block_trip'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : rule.actionOnTrigger === 'restrict_payout'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {(rule.actionOnTrigger || rule.actionRecommendation || 'Flag for review').replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="capitalize font-semibold text-slate-700">
                      {rule.sensitivity || 'high'}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                    v{rule.version || 1}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                    {(rule.timesTriggered ?? (rule as any).triggerCount ?? 0).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rule)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      title="Edit Rule Configuration"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Rule Modal */}
      {(selectedRuleForEdit || isCreatingNew) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {isCreatingNew ? 'Deploy New Autonomous Defense Rule' : `Configure Rule ${selectedRuleForEdit?.ruleCode}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRuleForEdit(null);
                  setIsCreatingNew(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rule Code</label>
                  <input
                    type="text"
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Threat Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {Object.entries(categoryLabels).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rule Title</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Teleportation / High-Speed Jump Heuristic"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description / Operational Intent</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Threshold Barrier Conditions</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Metric Name</span>
                    <input
                      type="text"
                      value={thresholdMetric}
                      onChange={(e) => setThresholdMetric(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Limit Value</span>
                    <input
                      type="number"
                      value={thresholdLimit}
                      onChange={(e) => setThresholdLimit(Number(e.target.value))}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Unit</span>
                    <input
                      type="text"
                      value={thresholdUnit}
                      onChange={(e) => setThresholdUnit(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Action On Trigger</label>
                  <select
                    value={actionOnTrigger}
                    onChange={(e) => setActionOnTrigger(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="alert_only">Alert Sentinel Only</option>
                    <option value="flag_for_review">Flag for Officer Review</option>
                    <option value="require_otp">Enforce OTP Verification</option>
                    <option value="restrict_payout">Restrict Captain Payout</option>
                    <option value="throttle_dispatch">Throttle Ride Dispatch</option>
                    <option value="block_trip">Block Current Trip</option>
                    <option value="auto_lock">Auto-Lock Account</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sensitivity Level</label>
                  <select
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="low">Low (Fewer False Positives)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Strict Defense)</option>
                    <option value="extreme">Extreme (Zero Tolerance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Audit Justification Note (Mandatory for Compliance)
                </label>
                <input
                  type="text"
                  placeholder="Reason for modifying rule threshold or policy..."
                  value={reasonForChange}
                  onChange={(e) => setReasonForChange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRuleForEdit(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
              >
                {isCreatingNew ? 'Deploy Rule' : 'Save Version & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
