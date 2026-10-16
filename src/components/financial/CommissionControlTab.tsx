import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Sliders,
  Sparkles,
  ShieldCheck,
  UserCheck,
  FileText,
  Clock,
  MapPin,
  Car
} from 'lucide-react';
import {
  CommissionRule,
  DriverCommissionOverride,
  CommissionCalculationRecord,
  CommissionType,
  ServiceCategoryKey
} from '../../types/commissionAndRevenue';
import { calculateCommissionForRide } from '../../services/commissionService';
import { CommissionDetailCenterModal } from './CommissionDetailCenterModal';

interface CommissionControlTabProps {
  rules: CommissionRule[];
  overrides: DriverCommissionOverride[];
  onSaveRule: (rule: CommissionRule) => void;
  onAddOverride: (override: DriverCommissionOverride) => void;
  adminActorName: string;
}

export const CommissionControlTab: React.FC<CommissionControlTabProps> = ({
  rules = [],
  overrides = [],
  onSaveRule,
  onAddOverride,
  adminActorName
}) => {
  const safeRules = rules || [];
  const safeOverrides = overrides || [];

  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<'create_rule' | 'edit_rule' | 'add_override' | null>(null);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [isDetailCenterOpen, setIsDetailCenterOpen] = useState(false);

  // Simulator State
  const [simCity, setSimCity] = useState<string>('lahore');
  const [simCategory, setSimCategory] = useState<string>('ride');
  const [simDistance, setSimDistance] = useState<number>(14.5);
  const [simGrossFare, setSimGrossFare] = useState<number>(850);
  const [simDriverId, setSimDriverId] = useState<string>('drv-01');

  // Rule Form State
  const [ruleForm, setRuleForm] = useState<Partial<CommissionRule>>({
    name: '',
    cityId: 'all',
    cityName: 'All Operating Cities',
    serviceCategory: 'ride',
    serviceCategoryName: 'GoLife Ride',
    commissionType: 'percentage',
    rateValue: 12,
    minCommissionPKR: 25,
    maxCommissionPKR: 450,
    status: 'active',
    description: '',
    driverOverrideAllowed: true
  });

  // Override Form State
  const [overrideForm, setOverrideForm] = useState<Partial<DriverCommissionOverride>>({
    driverId: 'drv-01',
    driverName: 'Muhammad Tariq',
    driverPhone: '03001234567',
    driverPlate: 'LEA-24-9981',
    city: 'Lahore',
    overrideType: 'custom_rate',
    customRateValue: 8.0,
    commissionType: 'percentage',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-15',
    reason: 'Top Rated Driver of the Month Incentive',
    status: 'active'
  });

  // Filtered Rules
  const filteredRules = safeRules.filter((r) => {
    const matchesCity = selectedCityFilter === 'all' || r.cityId === selectedCityFilter || r.cityId === 'all';
    const matchesCategory = selectedCategoryFilter === 'all' || r.serviceCategory === selectedCategoryFilter || r.serviceCategory === 'all';
    return matchesCity && matchesCategory;
  });

  // Calculation Result in Real-Time Simulator
  const simResult: CommissionCalculationRecord = calculateCommissionForRide({
    rideId: 'sim-ride-01',
    rideCode: 'SIM-GL-01',
    driverId: simDriverId,
    driverName: simDriverId === 'drv-03' ? 'Kamran Akmal (0% Onboarding)' : simDriverId === 'drv-01' ? 'Muhammad Tariq (8% VIP)' : 'Standard Driver',
    passengerId: 'sim-pax-01',
    passengerName: 'Passenger Simulator',
    city: simCity,
    serviceCategory: simCategory,
    distanceKm: simDistance,
    grossFare: simGrossFare,
    rules,
    overrides
  });

  const handleOpenEdit = (rule: CommissionRule) => {
    setEditingRule(rule);
    setRuleForm({ ...rule });
    setActiveModal('edit_rule');
  };

  const handleSaveRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.name || !ruleForm.rateValue) return;

    const updated: CommissionRule = {
      id: editingRule ? editingRule.id : `comm-rule-${Date.now()}`,
      name: ruleForm.name || 'Custom Commission Rule',
      cityId: ruleForm.cityId || 'all',
      cityName: ruleForm.cityId === 'all' ? 'All Operating Cities' : ruleForm.cityId === 'lahore' ? 'Lahore' : ruleForm.cityId === 'karachi' ? 'Karachi' : 'Islamabad',
      serviceCategory: (ruleForm.serviceCategory as ServiceCategoryKey) || 'ride',
      serviceCategoryName: ruleForm.serviceCategory === 'bike' ? 'GoLife Bike' : ruleForm.serviceCategory === 'rickshaw' ? 'GoLife Rickshaw' : 'GoLife Ride',
      commissionType: (ruleForm.commissionType as CommissionType) || 'percentage',
      rateValue: Number(ruleForm.rateValue) || 12,
      minCommissionPKR: Number(ruleForm.minCommissionPKR) || 15,
      maxCommissionPKR: ruleForm.maxCommissionPKR ? Number(ruleForm.maxCommissionPKR) : undefined,
      status: ruleForm.status || 'active',
      version: editingRule ? editingRule.version + 1 : 1,
      description: ruleForm.description || 'Configured via GoLife Central Admin Commission Control.',
      driverOverrideAllowed: ruleForm.driverOverrideAllowed ?? true,
      effectiveFrom: new Date().toISOString().split('T')[0],
      createdAt: editingRule ? editingRule.createdAt : new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PKT',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PKT',
      updatedBy: adminActorName
    };

    onSaveRule(updated);
    setActiveModal(null);
    setEditingRule(null);
  };

  const handleSaveOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOverride: DriverCommissionOverride = {
      id: `ovr-${Date.now()}`,
      driverId: overrideForm.driverId || 'drv-01',
      driverName: overrideForm.driverName || 'Driver',
      driverPhone: overrideForm.driverPhone || '03001234567',
      driverPlate: overrideForm.driverPlate || 'LEA-24-0000',
      city: overrideForm.city || 'Lahore',
      overrideType: overrideForm.overrideType || 'custom_rate',
      customRateValue: Number(overrideForm.customRateValue) || 0,
      commissionType: overrideForm.commissionType || 'percentage',
      startDate: overrideForm.startDate || new Date().toISOString().split('T')[0],
      endDate: overrideForm.endDate || '2026-10-30',
      reason: overrideForm.reason || 'Admin Authorized Incentive',
      authorizedBy: adminActorName,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PKT'
    };

    onAddOverride(newOverride);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Commission Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-2xl p-5 text-slate-950 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              ONE TASK = ONE MAIN OPTION
            </span>
            <span className="text-xs font-bold text-slate-900">• GoLife Central Commission Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Central Commission &amp; Tariff Control
          </h2>
          <p className="text-xs text-slate-900 font-medium max-w-2xl mt-0.5">
            Configure GoLife Taxi platform commission rules across all Pakistani cities, service tiers, and per-driver overrides. Calculations apply automatically to fares, driver wallets, and platform revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDetailCenterOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Commission Detail Center</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingRule(null);
              setRuleForm({
                name: '',
                cityId: 'all',
                cityName: 'All Operating Cities',
                serviceCategory: 'ride',
                serviceCategoryName: 'GoLife Ride',
                commissionType: 'percentage',
                rateValue: 12,
                minCommissionPKR: 25,
                maxCommissionPKR: 450,
                status: 'active',
                description: '',
                driverOverrideAllowed: true
              });
              setActiveModal('create_rule');
            }}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Commission Rule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('add_override')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 border border-amber-300 shadow-sm cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-900" />
            <span>Driver Override</span>
          </button>
        </div>
      </div>

      {/* Real-Time Mathematical Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Unified Commission Calculation Simulator</h3>
              <p className="text-[11px] text-slate-500">Test exact wallet deductions and net earnings across cities, categories, and overrides</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            Matches Mobile App &amp; Backend Logic
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Simulator Inputs */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
              <select
                value={simCity}
                onChange={(e) => setSimCity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="lahore">Lahore</option>
                <option value="karachi">Karachi</option>
                <option value="islamabad">Islamabad &amp; Rawalpindi</option>
                <option value="faisalabad">Faisalabad</option>
                <option value="multan">Multan</option>
                <option value="peshawar">Peshawar</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
              <select
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="ride">GoLife Ride (AC Sedan)</option>
                <option value="bike">GoLife Bike (Motorcycle)</option>
                <option value="rickshaw">GoLife Auto Rickshaw</option>
                <option value="comfort">GoLife Comfort (Premium)</option>
                <option value="intercity">Intercity Long Distance</option>
                <option value="freight">Freight / Cargo Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Distance (Kilometers)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={simDistance}
                onChange={(e) => setSimDistance(Number(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Gross Cash Fare (PKR)</label>
              <input
                type="number"
                step="10"
                min="50"
                value={simGrossFare}
                onChange={(e) => setSimGrossFare(Number(e.target.value) || 50)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Profile (Test Overrides)</label>
              <select
                value={simDriverId}
                onChange={(e) => setSimDriverId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="drv-standard">Standard Driver (Subject to City/Category Tariff)</option>
                <option value="drv-01">Muhammad Tariq (Active 8% VIP Incentive)</option>
                <option value="drv-03">Kamran Akmal (Active 0% Onboarding Promo)</option>
              </select>
            </div>
          </div>

          {/* Simulator Live Calculation Output */}
          <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-extrabold text-slate-700">Matched Rule Applied:</span>
              <span className="font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                {simResult.ruleAppliedName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Passenger Cash Paid</div>
                <div className="text-base font-black text-slate-900 mt-0.5">Rs {simResult.grossFare.toLocaleString()}</div>
                <div className="text-[9px] text-emerald-600 font-bold">100% Cash in Hand</div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-300 bg-amber-50/50 text-center">
                <div className="text-[10px] font-bold text-amber-900 uppercase">GoLife Commission</div>
                <div className="text-base font-black text-amber-700 mt-0.5">Rs {simResult.baseCommissionPKR.toLocaleString()}</div>
                <div className="text-[9px] text-slate-500 font-bold">
                  {simResult.ruleType === 'percentage'
                    ? `${simResult.ruleRate}% gross`
                    : simResult.ruleType === 'per_km'
                    ? `Rs ${simResult.ruleRate}/km`
                    : `Flat Rs ${simResult.ruleRate}`}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Driver Net Earnings</div>
                <div className="text-base font-black text-emerald-700 mt-0.5">Rs {simResult.driverNetEarningsPKR.toLocaleString()}</div>
                <div className="text-[9px] text-slate-500 font-bold">Retained from Cash</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span>Driver Digital Wallet Ledger Effect:</span>
                <span className="font-black text-rose-600">-Rs {simResult.baseCommissionPKR.toLocaleString()} (Commission Debit)</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Revenue Ledger Effect:</span>
                <span className="font-black text-emerald-600">+Rs {simResult.baseCommissionPKR.toLocaleString()} (Net Commission)</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-100">
                <span>Normal Ride Settlement Policy:</span>
                <span>Strictly Cash Only. Commission debited from driver app balance.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Rule Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Active GoLife Commission Rules ({filteredRules.length})</h3>
            <p className="text-[11px] text-slate-500">Master tariff schedules configured for dispatch and fare settlement</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Cities</option>
              <option value="lahore">Lahore</option>
              <option value="karachi">Karachi</option>
              <option value="islamabad">Islamabad &amp; Rawalpindi</option>
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Categories</option>
              <option value="ride">GoLife Ride</option>
              <option value="bike">GoLife Bike</option>
              <option value="rickshaw">GoLife Rickshaw</option>
              <option value="comfort">GoLife Comfort</option>
              <option value="intercity">Intercity</option>
              <option value="freight">Freight</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">City Scope</th>
                <th className="py-2.5 px-3">Service Tier</th>
                <th className="py-2.5 px-3">Tariff Model</th>
                <th className="py-2.5 px-3">Rate / Amount</th>
                <th className="py-2.5 px-3">Floor / Ceiling</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900">{rule.name}</div>
                    <div className="text-[10px] text-slate-400">v{rule.version} • {rule.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {rule.cityName}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                      <Car className="w-3 h-3 text-slate-400" />
                      {rule.serviceCategoryName}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800">
                      {rule.commissionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-black text-amber-800 text-sm">
                    {rule.commissionType === 'percentage'
                      ? `${rule.rateValue}%`
                      : rule.commissionType === 'per_km'
                      ? `Rs ${rule.rateValue}/km`
                      : `Rs ${rule.rateValue} flat`}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-600 font-semibold">
                    <div>Min: Rs {rule.minCommissionPKR}</div>
                    {rule.maxCommissionPKR && <div className="text-slate-400 text-[10px]">Max: Rs {rule.maxCommissionPKR}</div>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rule.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rule)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Rule Configuration"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver-Specific Overrides Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Authorized Driver Overrides ({overrides.length})</h3>
            <p className="text-[11px] text-slate-500">Special approved commission concessions, onboarding promotions, and performance bonuses</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('add_override')}
            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Override</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {overrides.map((ovr) => (
            <div key={ovr.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-900">{ovr.driverName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                    {ovr.customRateValue}% Commission
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mb-2">
                  {ovr.driverPhone} • {ovr.city} • Plate: {ovr.driverPlate}
                </div>
                <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-900">Reason:</span> {ovr.reason}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200 flex justify-between">
                <span>Authorized by: <strong className="text-slate-700">{ovr.authorizedBy}</strong></span>
                <span>Active: {ovr.startDate} to {ovr.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create or Edit Rule */}
      {(activeModal === 'create_rule' || activeModal === 'edit_rule') && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              {activeModal === 'edit_rule' ? 'Edit Commission Rule' : 'Create New Commission Rule'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All rides completed under this rule will automatically calculate deductions and platform revenue.
            </p>

            <form onSubmit={handleSaveRuleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleForm.name || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Lahore Urban Auto Rickshaw Tariff"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City Scope</label>
                  <select
                    value={ruleForm.cityId || 'all'}
                    onChange={(e) => setRuleForm({ ...ruleForm, cityId: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="all">All Cities</option>
                    <option value="lahore">Lahore</option>
                    <option value="karachi">Karachi</option>
                    <option value="islamabad">Islamabad &amp; Rawalpindi</option>
                    <option value="faisalabad">Faisalabad</option>
                    <option value="multan">Multan</option>
                    <option value="peshawar">Peshawar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={ruleForm.serviceCategory || 'ride'}
                    onChange={(e) => setRuleForm({ ...ruleForm, serviceCategory: e.target.value as ServiceCategoryKey })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="ride">GoLife Ride</option>
                    <option value="bike">GoLife Bike</option>
                    <option value="rickshaw">GoLife Rickshaw</option>
                    <option value="comfort">GoLife Comfort</option>
                    <option value="intercity">Intercity</option>
                    <option value="freight">Freight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Commission Type</label>
                  <select
                    value={ruleForm.commissionType || 'percentage'}
                    onChange={(e) => setRuleForm({ ...ruleForm, commissionType: e.target.value as CommissionType })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="per_km">Per KM (Rs)</option>
                    <option value="fixed">Fixed Flat (Rs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rate Value</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={ruleForm.rateValue || ''}
                    onChange={(e) => setRuleForm({ ...ruleForm, rateValue: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Floor (Min PKR)</label>
                  <input
                    type="number"
                    value={ruleForm.minCommissionPKR || 15}
                    onChange={(e) => setRuleForm({ ...ruleForm, minCommissionPKR: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ceiling Cap (Max PKR - Optional)</label>
                <input
                  type="number"
                  value={ruleForm.maxCommissionPKR || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, maxCommissionPKR: Number(e.target.value) || undefined })}
                  placeholder="Leave empty for no maximum cap"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={ruleForm.description || ''}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm transition"
                >
                  Save Commission Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Driver Override */}
      {activeModal === 'add_override' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Grant Driver Commission Override</h3>
            <p className="text-xs text-slate-500 mb-4">
              Authorize a driver-specific custom commission rate (e.g. 0% onboarding promo, 8% performance incentive).
            </p>

            <form onSubmit={handleSaveOverrideSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Name &amp; ID</label>
                <input
                  type="text"
                  required
                  value={overrideForm.driverName || ''}
                  onChange={(e) => setOverrideForm({ ...overrideForm, driverName: e.target.value })}
                  placeholder="Driver Full Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Override Type</label>
                  <select
                    value={overrideForm.overrideType || 'custom_rate'}
                    onChange={(e) => setOverrideForm({ ...overrideForm, overrideType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="custom_rate">Custom Percentage Rate</option>
                    <option value="zero_commission">0% Zero Commission Promo</option>
                    <option value="fixed_daily">Fixed Daily Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rate Value (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={overrideForm.overrideType === 'zero_commission' ? 0 : overrideForm.customRateValue || 0}
                    disabled={overrideForm.overrideType === 'zero_commission'}
                    onChange={(e) => setOverrideForm({ ...overrideForm, customRateValue: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Approval Justification / Reason</label>
                <textarea
                  required
                  rows={2}
                  value={overrideForm.reason || ''}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="e.g. New onboarding 7-day incentive or high-acceptance award"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={overrideForm.startDate || ''}
                    onChange={(e) => setOverrideForm({ ...overrideForm, startDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={overrideForm.endDate || ''}
                    onChange={(e) => setOverrideForm({ ...overrideForm, endDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm transition"
                >
                  Grant Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commission Detail Center Modal */}
      <CommissionDetailCenterModal
        isOpen={isDetailCenterOpen}
        onClose={() => setIsDetailCenterOpen(false)}
        initialCity={selectedCityFilter === 'all' ? 'All' : selectedCityFilter}
      />
    </div>
  );
};

export default CommissionControlTab;
