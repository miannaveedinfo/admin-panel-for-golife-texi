import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  CentralPricingRule,
  CategoryPricingOverride,
  CityPricingOverride,
  DriverPricingOverride,
  PricingRuleVersion,
  PaymentMethodPricingRule
} from '../types';
import { formatPKR } from '../utils/i18n';
import {
  calculateCentralFare,
  analyzePricingHealth,
  PricingRecommendation,
  DEFAULT_CENTRAL_PRICING_RULE,
  calculateDriverDailySummary
} from '../services/pricingEngine';
import {
  Calculator,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  DollarSign,
  Percent,
  PlusCircle,
  Trash2,
  X,
  History,
  MapPin,
  Car,
  Check,
  Edit3,
  HelpCircle,
  FileText,
  ChevronRight,
  Info,
  Clock,
  Coins,
  CreditCard,
  User,
  ExternalLink
} from 'lucide-react';

export const PricingAndChargesView: React.FC = () => {
  const {
    currentAdmin,
    centralPricingRule,
    pricingRuleVersions,
    driverPricingOverrides,
    updateCentralPricing,
    setDriverPricingOverride,
    removeDriverPricingOverride,
    drivers,
    rides,
    showToast
  } = useAdmin();

  // Primary active tab
  const [activeTab, setActiveTab] = useState<
    'passenger' | 'driver' | 'passenger_charges' | 'categories' | 'cities' | 'calculator' | 'driver_overrides' | 'history' | 'revenue'
  >('passenger');

  // Draft rule state for editing
  const [draftRule, setDraftRule] = useState<CentralPricingRule>(() => {
    const base = centralPricingRule || DEFAULT_CENTRAL_PRICING_RULE;
    return JSON.parse(JSON.stringify(base));
  });

  // Sync draft rule if master rule changes externally
  React.useEffect(() => {
    if (centralPricingRule) {
      setDraftRule(JSON.parse(JSON.stringify(centralPricingRule)));
    }
  }, [centralPricingRule?.versionId]);

  // Track if there are pending modifications
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftRule) !== JSON.stringify(centralPricingRule);
  }, [draftRule, centralPricingRule]);

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [affectedScopeNote, setAffectedScopeNote] = useState('Global (All Cities & Categories)');

  // Selected Category & City in editors
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('Economy');
  const [selectedCityKey, setSelectedCityKey] = useState<string>('Lahore');

  // Interactive Test Calculator State
  const [calcCity, setCalcCity] = useState<string>('Lahore');
  const [calcCategory, setCalcCategory] = useState<string>('Economy');
  const [calcDistance, setCalcDistance] = useState<number>(12);
  const [calcDuration, setCalcDuration] = useState<number>(24);
  const [calcCustomFare, setCalcCustomFare] = useState<string>('');
  const [calcPaymentMethod, setCalcPaymentMethod] = useState<string>('cash');
  const [calcWaitingMin, setCalcWaitingMin] = useState<number>(0);
  const [calcSelectedDriverId, setCalcSelectedDriverId] = useState<string>('');

  // Add Driver Override Modal
  const [showAddOverrideModal, setShowAddOverrideModal] = useState(false);
  const [overrideDriverId, setOverrideDriverId] = useState(drivers[0]?.id || '');
  const [overrideCommission, setOverrideCommission] = useState('10');
  const [overrideServiceFee, setOverrideServiceFee] = useState('0');
  const [overrideReason, setOverrideReason] = useState('Top Tier Gold Driver Promotion');

  // AI Pricing Recommendations
  const aiRecommendations = useMemo(() => {
    return analyzePricingHealth(centralPricingRule, rides);
  }, [centralPricingRule, rides]);

  // Real-time calculation output based on draft or active rule
  const testCalculationResult = useMemo(() => {
    const customFareNum = calcCustomFare ? parseFloat(calcCustomFare) : undefined;
    return calculateCentralFare(
      {
        category: calcCategory,
        city: calcCity,
        distanceKm: calcDistance,
        durationMinutes: calcDuration,
        baseOverrideFare: customFareNum,
        paymentMethod: calcPaymentMethod,
        driverId: calcSelectedDriverId || undefined,
        waitingMinutes: calcWaitingMin
      },
      draftRule,
      driverPricingOverrides
    );
  }, [
    calcCity,
    calcCategory,
    calcDistance,
    calcDuration,
    calcCustomFare,
    calcPaymentMethod,
    calcSelectedDriverId,
    calcWaitingMin,
    draftRule,
    driverPricingOverrides
  ]);

  // Compute Platform Revenue summary from real rides
  const platformRevenueSummary = useMemo(() => {
    const completedRides = rides.filter((r) => r.status === 'completed');
    let totalGrossFare = 0;
    let totalCommission = 0;
    let totalPassengerFees = 0;
    let totalDriverFees = 0;
    let totalNetPlatformRevenue = 0;

    completedRides.forEach((r) => {
      totalGrossFare += r.fare;
      if (r.pricingSnapshot) {
        totalCommission += r.pricingSnapshot.commissionAmount;
        totalPassengerFees += r.pricingSnapshot.passengerBookingFee + r.pricingSnapshot.passengerServiceFee;
        totalDriverFees += r.pricingSnapshot.driverServiceFee;
        totalNetPlatformRevenue += r.pricingSnapshot.platformNetRevenue;
      } else {
        const comm = r.commission || Math.round(r.fare * 0.15);
        totalCommission += comm;
        totalPassengerFees += 50;
        totalDriverFees += 20;
        totalNetPlatformRevenue += comm + 70;
      }
    });

    return {
      completedCount: completedRides.length,
      totalGrossFare,
      totalCommission,
      totalPassengerFees,
      totalDriverFees,
      totalNetPlatformRevenue
    };
  }, [rides]);

  // Handle Save Trigger
  const handleInitiateSave = (scopeDescription?: string) => {
    if (scopeDescription) setAffectedScopeNote(scopeDescription);
    setChangeReason('');
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    if (!changeReason.trim()) {
      showToast('Please provide an operational justification or note for this pricing update.', 'warning');
      return;
    }
    updateCentralPricing(draftRule, changeReason, affectedScopeNote);
    setShowConfirmModal(false);
  };

  const handleDiscardChanges = () => {
    setDraftRule(JSON.parse(JSON.stringify(centralPricingRule)));
    showToast('Unsaved pricing edits discarded. Reverted to active rule.', 'info');
  };

  // Helper for toggling draft rule flags
  const updateDraftNumberField = (
    section: keyof CentralPricingRule,
    field: string,
    value: any
  ) => {
    setDraftRule((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Quick Apply AI Recommendation
  const handleApplyAiRecommendation = (rec: PricingRecommendation) => {
    const updated = JSON.parse(JSON.stringify(draftRule));
    if (rec.id === 'rec-comm-boost') {
      updated.platformCommission.amount = 15;
      setActiveTab('driver');
    } else if (rec.id === 'rec-khi-rev') {
      if (updated.cityPricing['Karachi']) {
        updated.cityPricing['Karachi'].perKmRateMultiplier = 1.05;
        updated.cityPricing['Karachi'].enabled = true;
      }
      setActiveTab('cities');
      setSelectedCityKey('Karachi');
    } else if (rec.id === 'rec-bike-fare') {
      if (updated.categoryPricing['Bike']) {
        updated.categoryPricing['Bike'].minimumFare = 90;
        updated.categoryPricing['Bike'].enabled = true;
      }
      setActiveTab('categories');
      setSelectedCategoryKey('Bike');
    }
    setDraftRule(updated);
    showToast(`Applied recommendation: ${rec.title}. Review changes and activate.`, 'info');
  };

  // Handle adding Driver Override
  const handleAddDriverOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const drv = drivers.find((d) => d.id === overrideDriverId);
    if (!drv) return;

    const overrideObj: DriverPricingOverride = {
      driverId: drv.id,
      driverName: drv.name,
      customCommissionPercentage: overrideCommission ? parseFloat(overrideCommission) : undefined,
      customServiceFee: overrideServiceFee ? parseFloat(overrideServiceFee) : undefined,
      reason: overrideReason || 'Special Driver Terms Agreement',
      assignedBy: currentAdmin?.name || 'SuperAdmin',
      assignedAt: new Date().toISOString(),
      isActive: true
    };

    setDriverPricingOverride(overrideObj);
    setShowAddOverrideModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Single Source of Truth Notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-400/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                Central Single Source of Truth
              </span>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                Rule Version: <strong className="text-white">{centralPricingRule.versionId}</strong>
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Nationwide
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              Pricing, Commission, Tax & Charges Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Configured master pricing rules are shared directly across the Passenger App, Driver App, and Admin Billing Engine. Historical rides remain protected with immutable snapshot records.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {hasUnsavedChanges && (
              <>
                <button
                  onClick={handleDiscardChanges}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Discard Edits
                </button>
                <button
                  onClick={() => handleInitiateSave('Pending Draft Edits')}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <SaveCheckIcon className="w-4 h-4" />
                  Save & Activate New Rule
                </button>
              </>
            )}

            {!hasUnsavedChanges && (
              <button
                onClick={() => setActiveTab('calculator')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                Open Live Fare Test Bench
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Global Commission
            </span>
            <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
              {centralPricingRule.platformCommission.amount}%
            </span>
            <span className="text-[10px] text-slate-400">Platform GoLife Cut</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Minimum Ride Fare
            </span>
            <span className="text-base font-extrabold text-amber-400 font-mono mt-0.5 block">
              {formatPKR(centralPricingRule.minimumRideFare.amount)}
            </span>
            <span className="text-[10px] text-slate-400">Hard booking floor</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Maximum Ride Fare
            </span>
            <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
              {formatPKR(centralPricingRule.maximumRideFare.amount)}
            </span>
            <span className="text-[10px] text-slate-400">Anti-fraud offer cap</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              PST Provincial Tax
            </span>
            <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
              {centralPricingRule.taxRate.amount}%
            </span>
            <span className="text-[10px] text-slate-400">Regulatory Tax Rate</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Service Fees (PKR)
            </span>
            <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
              Psgr: {centralPricingRule.passengerServiceFee.amount} / Drv: {centralPricingRule.driverServiceFee.amount}
            </span>
            <span className="text-[10px] text-slate-400">Flat operational fee</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Driver Overrides
            </span>
            <span className="text-base font-extrabold text-sky-400 font-mono mt-0.5 block">
              {Object.keys(driverPricingOverrides || {}).length} Active
            </span>
            <span className="text-[10px] text-slate-400">Custom exception rules</span>
          </div>
        </div>
      </div>

      {/* AI Assistant Pricing Recommendations Card */}
      {aiRecommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                AI Pricing Intelligence & Optimization Alerts
              </h4>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              {aiRecommendations.length} Recommendations Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between shadow-xs space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-800">
                      {rec.impactScore} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-normal">{rec.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700">{rec.suggestedAction}</span>
                  <button
                    onClick={() => handleApplyAiRecommendation(rec)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <span>REVIEW PRICING</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('passenger')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'passenger'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Passenger Pricing
        </button>

        <button
          onClick={() => setActiveTab('driver')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'driver'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          Driver Charges & Commission
        </button>

        <button
          onClick={() => setActiveTab('passenger_charges')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'passenger_charges'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Passenger Charges & Taxes
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Category Pricing
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'cities'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          City Pricing
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Calculation Test Bench
        </button>

        <button
          onClick={() => setActiveTab('driver_overrides')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'driver_overrides'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Driver Overrides ({Object.keys(driverPricingOverrides || {}).length})
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'revenue'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Platform Revenue
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Rule Versions ({pricingRuleVersions.length})
        </button>
      </div>

      {/* Unsaved Changes Floating Banner */}
      {hasUnsavedChanges && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>You have uncommitted pricing changes in the editor.</strong> These will not affect mobile apps or new rides until you click <strong>Save & Activate</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDiscardChanges}
              className="px-2.5 py-1 rounded-lg text-slate-700 bg-white border border-amber-300 hover:bg-slate-50 font-bold"
            >
              Discard
            </button>
            <button
              onClick={() => handleInitiateSave('Pending Rule Edits')}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              Save & Activate
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. PASSENGER PRICING TAB */}
      {/* ============================================================ */}
      {activeTab === 'passenger' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Passenger Fare & Offer Bounds</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controls minimum and maximum allowable bids, base fares, and distance/time metrics.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Currency: PKR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Minimum Ride Fare */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Minimum Ride Fare</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.minimumRideFare.enabled}
                      onChange={(e) => updateDraftNumberField('minimumRideFare', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Passenger cannot submit an offer below this minimum floor.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.minimumRideFare.amount}
                    disabled={!draftRule.minimumRideFare.enabled}
                    onChange={(e) => updateDraftNumberField('minimumRideFare', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Maximum Ride Fare */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Maximum Ride Fare</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.maximumRideFare.enabled}
                      onChange={(e) => updateDraftNumberField('maximumRideFare', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Hard cap preventing accidental booking entries or fraud.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.maximumRideFare.amount}
                    disabled={!draftRule.maximumRideFare.enabled}
                    onChange={(e) => updateDraftNumberField('maximumRideFare', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Base Fare */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Base Fare (Flag Drop)</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.baseFare.enabled}
                      onChange={(e) => updateDraftNumberField('baseFare', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Starting meter fee applied upon trip initiation.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.baseFare.amount}
                    disabled={!draftRule.baseFare.enabled}
                    onChange={(e) => updateDraftNumberField('baseFare', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Per KM Rate */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Per KM Distance Rate</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.perKmRate.enabled}
                      onChange={(e) => updateDraftNumberField('perKmRate', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Billed per odometer GPS kilometer traversed.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR/KM</span>
                  <input
                    type="number"
                    value={draftRule.perKmRate.amount}
                    disabled={!draftRule.perKmRate.enabled}
                    onChange={(e) => updateDraftNumberField('perKmRate', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Per Minute Rate */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Per Minute Time Rate</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.perMinuteRate.enabled}
                      onChange={(e) => updateDraftNumberField('perMinuteRate', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Duration charge accounting for congestion delays.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR/Min</span>
                  <input
                    type="number"
                    step="0.5"
                    value={draftRule.perMinuteRate.amount}
                    disabled={!draftRule.perMinuteRate.enabled}
                    onChange={(e) => updateDraftNumberField('perMinuteRate', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Waiting Fee */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Waiting Fee / Minute</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.waitingFeePerMinute.enabled}
                      onChange={(e) => updateDraftNumberField('waitingFeePerMinute', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Charge per min after free 3-minute pickup threshold.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR/Min</span>
                  <input
                    type="number"
                    value={draftRule.waitingFeePerMinute.amount}
                    disabled={!draftRule.waitingFeePerMinute.enabled}
                    onChange={(e) => updateDraftNumberField('waitingFeePerMinute', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Cancellation Fee */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Passenger Cancellation Fee</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.cancellationFee.enabled}
                      onChange={(e) => updateDraftNumberField('cancellationFee', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Deducted from passenger wallet on late cancellation.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.cancellationFee.amount}
                    disabled={!draftRule.cancellationFee.enabled}
                    onChange={(e) => updateDraftNumberField('cancellationFee', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => handleInitiateSave('Passenger Pricing Parameters')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
              >
                Apply & Save Passenger Rates
              </button>
            </div>
          </div>

          {/* Side Fast Preview */}
          <div className="space-y-4">
            <CalculationLiveCard result={testCalculationResult} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. DRIVER CHARGES & COMMISSION TAB */}
      {/* ============================================================ */}
      {activeTab === 'driver' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Driver Platform Deductions & Commissions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure platform take-rate %, fixed service fees, and regulatory deductions.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
                GoLife Revenue Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Platform Commission */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-amber-700" />
                    <label className="font-bold text-slate-900 text-sm">Platform Commission (%)</label>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.platformCommission.enabled}
                      onChange={(e) => updateDraftNumberField('platformCommission', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-600">
                  Calculated against the final ride fare for every completed trip unless a city, category, or driver exception is triggered.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="40"
                      value={draftRule.platformCommission.amount}
                      disabled={!draftRule.platformCommission.enabled}
                      onChange={(e) => updateDraftNumberField('platformCommission', 'amount', parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-2 text-base font-mono font-extrabold bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-slate-900 text-amber-950"
                    />
                    <span className="text-sm font-bold text-amber-900">% per ride</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Example: On a PKR 1,000 ride, platform collects <strong>PKR {Math.round(1000 * (draftRule.platformCommission.amount / 100))}</strong>.
                  </div>
                </div>
              </div>

              {/* Driver Platform Service Fee */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Driver Platform Service Fee</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.driverServiceFee.enabled}
                      onChange={(e) => updateDraftNumberField('driverServiceFee', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Flat operational charge per completed trip.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.driverServiceFee.amount}
                    disabled={!draftRule.driverServiceFee.enabled}
                    onChange={(e) => updateDraftNumberField('driverServiceFee', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Regulatory / Other Driver Charges */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Other Driver Charges (%)</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.driverOtherCharges.enabled}
                      onChange={(e) => updateDraftNumberField('driverOtherCharges', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Optional safety fund or union/regulatory levy.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">%</span>
                  <input
                    type="number"
                    value={draftRule.driverOtherCharges.amount}
                    disabled={!draftRule.driverOtherCharges.enabled}
                    onChange={(e) => updateDraftNumberField('driverOtherCharges', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Withholding Tax Deduction */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Driver Withholding Tax (%)</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.driverTaxDeduction.enabled}
                      onChange={(e) => updateDraftNumberField('driverTaxDeduction', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Direct FBR withholding tax from driver earnings if non-filer.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">%</span>
                  <input
                    type="number"
                    value={draftRule.driverTaxDeduction.amount}
                    disabled={!draftRule.driverTaxDeduction.enabled}
                    onChange={(e) => updateDraftNumberField('driverTaxDeduction', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => handleInitiateSave('Driver Commission & Platform Charges')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
              >
                Save Driver Fee Rules
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <CalculationLiveCard result={testCalculationResult} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PASSENGER CHARGES & TAXES TAB */}
      {/* ============================================================ */}
      {activeTab === 'passenger_charges' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Passenger Charges, Taxes & Payment Methods</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform booking fees, Provincial Services Tax (PRA/SRB), and gateway processing costs.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200">
                Customer Invoice Level
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Passenger Booking Fee */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Passenger Booking Fee</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.passengerBookingFee.enabled}
                      onChange={(e) => updateDraftNumberField('passengerBookingFee', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">App access and dispatch convenience charge.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.passengerBookingFee.amount}
                    disabled={!draftRule.passengerBookingFee.enabled}
                    onChange={(e) => updateDraftNumberField('passengerBookingFee', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Passenger Service Fee */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Passenger Platform Service Fee</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.passengerServiceFee.enabled}
                      onChange={(e) => updateDraftNumberField('passengerServiceFee', 'enabled', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Infrastructure and support services contribution.</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">PKR</span>
                  <input
                    type="number"
                    value={draftRule.passengerServiceFee.amount}
                    disabled={!draftRule.passengerServiceFee.enabled}
                    onChange={(e) => updateDraftNumberField('passengerServiceFee', 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Provincial Services Tax (PST) */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-emerald-700" />
                    <label className="font-bold text-slate-900 text-sm">
                      Provincial Services Tax Rate (PST) %
                    </label>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftRule.taxRate.enabled}
                      onChange={(e) => updateDraftNumberField('taxRate', 'enabled', e.target.checked)}
                      className="rounded text-emerald-500"
                    />
                    Enabled
                  </label>
                </div>
                <p className="text-[11px] text-slate-600">
                  Government sales tax on ride hailing services (Punjab Revenue Authority 5% or Sindh Revenue Board 13% with input adjustment).
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={draftRule.taxRate.amount}
                      disabled={!draftRule.taxRate.enabled}
                      onChange={(e) => updateDraftNumberField('taxRate', 'amount', parseFloat(e.target.value) || 0)}
                      className="w-28 px-3 py-2 text-base font-mono font-extrabold bg-white border border-emerald-300 rounded-xl focus:outline-none focus:border-slate-900 text-emerald-950"
                    />
                    <span className="text-sm font-bold text-emerald-900">% PST</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Calculated against the fare and added to the passenger invoice.
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Processing Fee Rules */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Payment Gateway Processing Rules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(Object.entries(draftRule?.paymentMethods || {}) as [string, PaymentMethodPricingRule][]).map(([pmKey, pmRule]) => (
                  <div key={pmKey} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 capitalize">{pmRule.label}</div>
                      <div className="text-[10px] text-slate-500">
                        {pmRule.enabled ? (pmRule.fee > 0 ? `${pmRule.fee}${pmRule.isPercentage ? '%' : ' PKR'} fee` : 'No additional fee') : 'Disabled'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={pmRule.fee}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setDraftRule((prev) => ({
                            ...prev,
                            paymentMethods: {
                              ...prev.paymentMethods,
                              [pmKey]: {
                                ...prev.paymentMethods[pmKey as keyof typeof prev.paymentMethods],
                                fee: val
                              }
                            }
                          }));
                        }}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-right"
                      />
                      <span className="text-[10px] font-bold text-slate-500">{pmRule.isPercentage ? '%' : 'Rs'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => handleInitiateSave('Passenger Charges, Tax & Payment Rules')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
              >
                Save Passenger Charges
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <CalculationLiveCard result={testCalculationResult} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. CATEGORY PRICING TAB */}
      {/* ============================================================ */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ride Category Rate Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each category specifies custom base fares, per-KM rates, minimum thresholds, and driver commissions.
              </p>
            </div>

            {/* Category Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Select Category:</span>
              <select
                value={selectedCategoryKey}
                onChange={(e) => setSelectedCategoryKey(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900"
              >
                {Object.keys(draftRule?.categoryPricing || {}).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {catKey}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of All Categories for Fast Comparison */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Base Fare</th>
                  <th className="py-2.5 px-3">Per KM</th>
                  <th className="py-2.5 px-3">Per Min</th>
                  <th className="py-2.5 px-3">Min Fare</th>
                  <th className="py-2.5 px-3">Max Fare</th>
                  <th className="py-2.5 px-3">Commission %</th>
                  <th className="py-2.5 px-3">Service Fee</th>
                  <th className="py-2.5 px-3 text-right">Quick Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.entries(draftRule?.categoryPricing || {}) as [string, CategoryPricingOverride][]).map(([catKey, catRule]) => {
                  const isSelected = selectedCategoryKey === catKey;
                  return (
                    <tr
                      key={catKey}
                      onClick={() => setSelectedCategoryKey(catKey)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isSelected ? 'bg-amber-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-500" />
                        {catKey}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            catRule.enabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {catRule.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">PKR {catRule.baseFare}</td>
                      <td className="py-2.5 px-3 font-mono">PKR {catRule.perKmRate}</td>
                      <td className="py-2.5 px-3 font-mono">PKR {catRule.perMinuteRate}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">PKR {catRule.minimumFare}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">PKR {catRule.maximumFare}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{catRule.commissionPercentage}%</td>
                      <td className="py-2.5 px-3 font-mono">PKR {catRule.serviceFee}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategoryKey(catKey);
                          }}
                          className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detailed Editor for Selected Category */}
          {draftRule.categoryPricing[selectedCategoryKey] && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  Editing Category Parameters: <strong>{selectedCategoryKey}</strong>
                </h3>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={draftRule.categoryPricing[selectedCategoryKey].enabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: {
                            ...prev.categoryPricing[selectedCategoryKey],
                            enabled: val
                          }
                        }
                      }));
                    }}
                    className="rounded text-amber-500"
                  />
                  Category Active
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Base Fare (PKR)</label>
                  <input
                    type="number"
                    value={draftRule.categoryPricing[selectedCategoryKey].baseFare}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], baseFare: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Per KM Rate (PKR)</label>
                  <input
                    type="number"
                    value={draftRule.categoryPricing[selectedCategoryKey].perKmRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], perKmRate: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Per Minute Rate (PKR)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={draftRule.categoryPricing[selectedCategoryKey].perMinuteRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], perMinuteRate: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Minimum Fare (PKR)</label>
                  <input
                    type="number"
                    value={draftRule.categoryPricing[selectedCategoryKey].minimumFare}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], minimumFare: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Maximum Fare Cap (PKR)</label>
                  <input
                    type="number"
                    value={draftRule.categoryPricing[selectedCategoryKey].maximumFare}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], maximumFare: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Platform Commission (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={draftRule.categoryPricing[selectedCategoryKey].commissionPercentage}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], commissionPercentage: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Driver Service Fee (PKR)</label>
                  <input
                    type="number"
                    value={draftRule.categoryPricing[selectedCategoryKey].serviceFee}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], serviceFee: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Waiting Fee / Min (PKR)</label>
                  <input
                    type="number"
                    value={draftRule.categoryPricing[selectedCategoryKey].waitingChargePerMin || 4}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDraftRule((prev) => ({
                        ...prev,
                        categoryPricing: {
                          ...prev.categoryPricing,
                          [selectedCategoryKey]: { ...prev.categoryPricing[selectedCategoryKey], waitingChargePerMin: val }
                        }
                      }));
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleInitiateSave(`Category: ${selectedCategoryKey} Rules`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                >
                  Save {selectedCategoryKey} Category Rates
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CITY-SPECIFIC PRICING TAB */}
      {/* ============================================================ */}
      {activeTab === 'cities' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">City-Specific Pricing Overrides</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cities without explicit overrides automatically inherit global rates (15% Commission, PKR 150 Min Fare).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Selected City:</span>
              <select
                value={selectedCityKey}
                onChange={(e) => setSelectedCityKey(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900"
              >
                {Object.keys(draftRule?.cityPricing || {}).map((cityKey) => (
                  <option key={cityKey} value={cityKey}>
                    {cityKey}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(draftRule?.cityPricing || {}) as [string, CityPricingOverride][]).map(([cityKey, cityRule]) => {
              const isSelected = selectedCityKey === cityKey;
              return (
                <div
                  key={cityKey}
                  onClick={() => setSelectedCityKey(cityKey)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-amber-50/40 shadow-xs'
                      : cityRule.enabled
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50 opacity-80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-600" />
                        {cityKey}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cityRule.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cityRule.enabled ? 'Custom Override' : 'Global Default'}
                      </span>
                    </div>

                    {cityRule.enabled ? (
                      <div className="space-y-1 text-xs font-mono">
                        <div className="text-slate-700">Commission: <strong>{cityRule.commissionPercentage}%</strong></div>
                        <div className="text-slate-700">Per-KM Multiplier: <strong>{cityRule.perKmRateMultiplier}x</strong></div>
                        <div className="text-slate-700">Min Fare: <strong>PKR {cityRule.minimumFare}</strong></div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Inheriting Global Rule (15% Comm, PKR 150 Min)
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {cityRule.enabled ? 'Override Active' : 'No Override'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCityKey(cityKey);
                      }}
                      className="text-amber-700 hover:text-amber-800 font-bold"
                    >
                      Configure →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected City Override Config Box */}
          {draftRule.cityPricing[selectedCityKey] && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  City Override Configuration: <strong>{selectedCityKey}</strong>
                </h3>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={draftRule.cityPricing[selectedCityKey].enabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setDraftRule((prev) => ({
                        ...prev,
                        cityPricing: {
                          ...prev.cityPricing,
                          [selectedCityKey]: {
                            ...prev.cityPricing[selectedCityKey],
                            enabled: val
                          }
                        }
                      }));
                    }}
                    className="rounded text-amber-500"
                  />
                  Enable Custom Override for {selectedCityKey}
                </label>
              </div>

              {draftRule.cityPricing[selectedCityKey].enabled ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Commission %</label>
                    <input
                      type="number"
                      step="0.5"
                      value={draftRule.cityPricing[selectedCityKey].commissionPercentage || 15}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDraftRule((prev) => ({
                          ...prev,
                          cityPricing: {
                            ...prev.cityPricing,
                            [selectedCityKey]: { ...prev.cityPricing[selectedCityKey], commissionPercentage: val }
                          }
                        }));
                      }}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Per-KM Multiplier (e.g. 1.05x)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={draftRule.cityPricing[selectedCityKey].perKmRateMultiplier || 1.0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.0;
                        setDraftRule((prev) => ({
                          ...prev,
                          cityPricing: {
                            ...prev.cityPricing,
                            [selectedCityKey]: { ...prev.cityPricing[selectedCityKey], perKmRateMultiplier: val }
                          }
                        }));
                      }}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Minimum Fare (PKR)</label>
                    <input
                      type="number"
                      value={draftRule.cityPricing[selectedCityKey].minimumFare || 150}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDraftRule((prev) => ({
                          ...prev,
                          cityPricing: {
                            ...prev.cityPricing,
                            [selectedCityKey]: { ...prev.cityPricing[selectedCityKey], minimumFare: val }
                          }
                        }));
                      }}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Service Fee (PKR)</label>
                    <input
                      type="number"
                      value={draftRule.cityPricing[selectedCityKey].serviceFee || 20}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDraftRule((prev) => ({
                          ...prev,
                          cityPricing: {
                            ...prev.cityPricing,
                            [selectedCityKey]: { ...prev.cityPricing[selectedCityKey], serviceFee: val }
                          }
                        }));
                      }}
                      className="w-full mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-100 text-slate-500 text-xs text-center">
                  Custom override is currently disabled. All rides in {selectedCityKey} follow national global rates.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleInitiateSave(`City: ${selectedCityKey} Override`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                >
                  Save {selectedCityKey} City Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. REAL-TIME CALCULATION TEST BENCH */}
      {/* ============================================================ */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  Live Fare & Settlement Calculation Simulator
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust parameters to simulate customer invoices, driver disbursements, and platform net revenue in real time.
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Demo Simulation Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* City Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <select
                  value={calcCity}
                  onChange={(e) => setCalcCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ride Category</label>
                <select
                  value={calcCategory}
                  onChange={(e) => setCalcCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  {Object.keys(draftRule?.categoryPricing || {}).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Distance (KM)</label>
                  <span className="font-mono font-extrabold text-slate-900">{calcDistance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Duration Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Trip Duration (Minutes)</label>
                  <span className="font-mono font-extrabold text-slate-900">{calcDuration} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={calcPaymentMethod}
                  onChange={(e) => setCalcPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="jazzcash">JazzCash Wallet</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="card">Credit / Debit Card (2.5% Gateway)</option>
                  <option value="bank">Direct Bank Transfer</option>
                </select>
              </div>

              {/* Base Fare Override / Bidded Fare */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Fixed Quote / Passenger Bid (PKR)</label>
                <input
                  type="number"
                  placeholder="Optional fixed bid (leave empty for auto)"
                  value={calcCustomFare}
                  onChange={(e) => setCalcCustomFare(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              {/* Driver Override Tester */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Test With Driver Specific Override (Optional)
                </label>
                <select
                  value={calcSelectedDriverId}
                  onChange={(e) => setCalcSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="">No Driver Exception (Standard Rule Engine)</option>
                  {(Object.values(driverPricingOverrides || {}) as DriverPricingOverride[]).map((ov) => (
                    <option key={ov.driverId} value={ov.driverId}>
                      {ov.driverName} ({ov.customCommissionPercentage ?? 'Std'}% Comm, Svc: Rs {ov.customServiceFee ?? 'Std'}) — {ov.reason}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Validation Callouts */}
            {testCalculationResult.isMinFareApplied && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Minimum Fare Enforced:</strong> The calculated meter fare was below the required floor of{' '}
                  <strong>PKR {testCalculationResult.validatedFare}</strong>.
                </span>
              </div>
            )}

            {testCalculationResult.isMaxFareExceeded && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>
                  <strong>Maximum Fare Cap Triggered:</strong> Offer exceeded the allowed ceiling of{' '}
                  <strong>PKR {testCalculationResult.validatedFare}</strong>.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <CalculationLiveCard result={testCalculationResult} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. DRIVER-SPECIFIC OVERRIDES TAB */}
      {/* ============================================================ */}
      {activeTab === 'driver_overrides' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Driver-Specific Controlled Exceptions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Default: All drivers follow global rules. Authorized administrators can provision special commission or service fee agreements.
              </p>
            </div>

            <button
              onClick={() => setShowAddOverrideModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Add Driver Override
            </button>
          </div>

          {Object.keys(driverPricingOverrides || {}).length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">No active driver-specific overrides.</p>
              <p className="text-[11px] text-slate-400">All registered drivers currently follow standard global / category pricing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Driver Name & ID</th>
                    <th className="py-3 px-4">Custom Commission</th>
                    <th className="py-3 px-4">Custom Service Fee</th>
                    <th className="py-3 px-4">Business Justification</th>
                    <th className="py-3 px-4">Granted By</th>
                    <th className="py-3 px-4">Rule Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Object.values(driverPricingOverrides || {}) as DriverPricingOverride[]).map((ov) => (
                    <tr key={ov.driverId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ov.driverName}</div>
                        <div className="text-[10px] font-mono text-slate-400">ID: {ov.driverId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">
                        {ov.customCommissionPercentage !== undefined ? `${ov.customCommissionPercentage}%` : 'Default'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ov.customServiceFee !== undefined ? `PKR ${ov.customServiceFee}` : 'Default'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{ov.reason}</td>
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        <div>{ov.assignedBy}</div>
                        <div className="text-[10px] text-slate-400">{new Date(ov.assignedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Custom Rule Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => removeDriverPricingOverride(ov.driverId)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition cursor-pointer"
                        >
                          Revert to Global
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. PLATFORM REVENUE & DAILY SETTLEMENT TAB */}
      {/* ============================================================ */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Platform Revenue & Financial Aggregation</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time revenue metrics calculated directly from immutable ride transaction snapshots.
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold">
                {platformRevenueSummary.completedCount} Completed Trips Audited
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gross Ride Value</span>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                  {formatPKR(platformRevenueSummary.totalGrossFare)}
                </div>
                <span className="text-[11px] text-slate-500">Cumulative passenger fares</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">Total Commission Earned</span>
                <div className="text-xl font-extrabold text-amber-950 font-mono mt-1">
                  {formatPKR(platformRevenueSummary.totalCommission)}
                </div>
                <span className="text-[11px] text-amber-700">Platform revenue share</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Service & Convenience Fees</span>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                  {formatPKR(platformRevenueSummary.totalPassengerFees + platformRevenueSummary.totalDriverFees)}
                </div>
                <span className="text-[11px] text-slate-500">Platform operations levy</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Net Platform Revenue</span>
                <div className="text-xl font-extrabold text-emerald-950 font-mono mt-1">
                  {formatPKR(platformRevenueSummary.totalNetPlatformRevenue)}
                </div>
                <span className="text-[11px] text-emerald-700">Retained platform cashflow</span>
              </div>
            </div>
          </div>

          {/* Driver Daily Settlement Foundation Preview */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Driver Daily Settlement Foundation (Today's Live Sample)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Trips (Comp/Total)</th>
                    <th className="py-2.5 px-3">Gross Fare</th>
                    <th className="py-2.5 px-3">Commission Cut</th>
                    <th className="py-2.5 px-3">Service Fees</th>
                    <th className="py-2.5 px-3 font-bold text-emerald-800">Net Driver Earning</th>
                    <th className="py-2.5 px-3 font-bold text-amber-800">Platform Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.slice(0, 5).map((drv) => {
                    const summary = calculateDriverDailySummary(drv.id, rides, 'Today');
                    return (
                      <tr key={drv.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{drv.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{summary.date}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {summary.completedOrders} / {summary.totalOrders}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{formatPKR(summary.grossFare)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{formatPKR(summary.totalCommission)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{formatPKR(summary.totalServiceFees)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {formatPKR(summary.netDriverEarnings)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                          {formatPKR(summary.platformEarnings)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. RULE VERSION HISTORY & AUDIT LOG TAB */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pricing Rule Version Audit Trail</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every rate revision creates an immutable historical version. Completed rides retain the rule active during their creation.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-bold">
              {pricingRuleVersions.length} Recorded Versions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Version ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Changed By</th>
                  <th className="py-3 px-4">Change Summary</th>
                  <th className="py-3 px-4">Reason / Operational Note</th>
                  <th className="py-3 px-4">Affected Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricingRuleVersions.map((v) => (
                  <tr key={v.versionId} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.versionId}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          v.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(v.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{v.changedBy}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{v.changeSummary}</td>
                    <td className="py-3 px-4 text-slate-600 italic">{v.reasonNote}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 font-bold">{v.affectedScope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SAVE & CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Confirm & Activate Pricing Rule
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  This action generates a new version and applies immediately to all future rides nationwide.
                </p>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950">
                <span className="font-bold block uppercase text-[10px] tracking-wider text-amber-800">
                  Target Scope
                </span>
                <p className="font-semibold">{affectedScopeNote}</p>
              </div>

              {/* Diff Summary */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Rate Changes Summary:</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commission:</span>
                    <span>
                      {centralPricingRule.platformCommission.amount}% ➔{' '}
                      <strong className="text-amber-700">{draftRule.platformCommission.amount}%</strong>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passenger Service Fee:</span>
                    <span>
                      PKR {centralPricingRule.passengerServiceFee.amount} ➔{' '}
                      <strong>PKR {draftRule.passengerServiceFee.amount}</strong>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver Service Fee:</span>
                    <span>
                      PKR {centralPricingRule.driverServiceFee.amount} ➔{' '}
                      <strong>PKR {draftRule.driverServiceFee.amount}</strong>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax Rate (PST):</span>
                    <span>
                      {centralPricingRule.taxRate.amount}% ➔{' '}
                      <strong className="text-emerald-700">{draftRule.taxRate.amount}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Mandatory Reason Note */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Mandatory Operational Justification / Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Provincial tax harmonization, fuel inflation adjustment, or holiday promo"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 leading-normal">
                <strong>Accounting Protection Notice:</strong> Existing completed rides will retain their previous calculation rule. Only new quotes and rides created after activation will employ this version.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md transition"
              >
                Save & Activate New Rule Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD DRIVER OVERRIDE MODAL */}
      {/* ============================================================ */}
      {showAddOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDriverOverride}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Provision Driver-Specific Pricing Override
              </h3>
              <button
                type="button"
                onClick={() => setShowAddOverrideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Driver</label>
                <select
                  value={overrideDriverId}
                  onChange={(e) => setOverrideDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.city} • {d.vehicle.make} {d.vehicle.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custom Commission %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={overrideCommission}
                    onChange={(e) => setOverrideCommission(e.target.value)}
                    placeholder="e.g. 10 (or 0 for VIP)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custom Service Fee (PKR)</label>
                  <input
                    type="number"
                    value={overrideServiceFee}
                    onChange={(e) => setOverrideServiceFee(e.target.value)}
                    placeholder="e.g. 0 or 15"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Administrative Reason / Justification</label>
                <input
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Fleet Partner Incentive Agreement"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddOverrideModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Save Override
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Sub-component: Live Calculation Preview Card
const CalculationLiveCard: React.FC<{ result: any }> = ({ result }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" />
          Live Calculation Preview
        </span>
        <span className="text-[10px] font-mono text-slate-400">{result.category} • {result.city}</span>
      </div>

      {/* Primary 3-Way Numbers */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <span className="text-[10px] text-slate-400 block font-bold">Passenger Pays</span>
          <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
            {formatPKR(result.passengerTotal)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
          <span className="text-[10px] text-emerald-400 block font-bold">Driver Receives</span>
          <span className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5 block">
            {formatPKR(result.driverNetEarnings)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-700/60">
          <span className="text-[10px] text-amber-400 block font-bold">Platform Net</span>
          <span className="text-sm font-extrabold text-amber-400 font-mono mt-0.5 block">
            {formatPKR(result.platformNetRevenue)}
          </span>
        </div>
      </div>

      {/* Detailed Math Breakdown */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-[11px]">
        <div className="flex justify-between text-slate-300">
          <span>Base / Metered Fare:</span>
          <span>{formatPKR(result.validatedFare)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>+ Passenger Booking Fee:</span>
          <span>{formatPKR(result.passengerBookingFee)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>+ Passenger Service Fee:</span>
          <span>{formatPKR(result.passengerServiceFee)}</span>
        </div>
        <div className="flex justify-between text-emerald-400">
          <span>+ Provincial Tax (PST):</span>
          <span>{formatPKR(result.taxAmount)}</span>
        </div>
        {result.paymentMethodFee > 0 && (
          <div className="flex justify-between text-amber-400">
            <span>+ Payment Gateway Fee:</span>
            <span>{formatPKR(result.paymentMethodFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
          <span>= Customer Total:</span>
          <span>{formatPKR(result.passengerTotal)}</span>
        </div>
      </div>

      {/* Driver Deductions Math */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-[11px]">
        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Driver Deduction Flow:</span>
        <div className="flex justify-between text-slate-300">
          <span>Metered Fare:</span>
          <span>{formatPKR(result.validatedFare)}</span>
        </div>
        <div className="flex justify-between text-rose-400">
          <span>- Platform Commission ({result.commissionRate}%):</span>
          <span>-{formatPKR(result.commissionAmount)}</span>
        </div>
        <div className="flex justify-between text-rose-400">
          <span>- Driver Service Fee:</span>
          <span>-{formatPKR(result.driverServiceFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
          <span>= Driver Net Take-home:</span>
          <span>{formatPKR(result.driverNetEarnings)}</span>
        </div>
      </div>
    </div>
  );
};

const SaveCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
