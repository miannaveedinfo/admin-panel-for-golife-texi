import React, { useState } from 'react';
import { PromoCode, RideCategory } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Edit2,
  MapPin,
  Calendar,
  Percent,
  DollarSign,
  Users,
  ShieldCheck,
  AlertCircle,
  Eye,
  RotateCcw
} from 'lucide-react';

interface PromoCodeManagementTabProps {
  onOpenSimulator: (code?: string) => void;
}

export const PromoCodeManagementTab: React.FC<PromoCodeManagementTabProps> = ({
  onOpenSimulator
}) => {
  const { promoCodes, addPromoCode, togglePromoStatus, updatePromoCodeDetails } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [maxDiscount, setMaxDiscount] = useState('200');
  const [minFare, setMinFare] = useState('250');
  const [usageLimit, setUsageLimit] = useState('1000');
  const [usagePerPassenger, setUsagePerPassenger] = useState('1');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [applicableCity, setApplicableCity] = useState('All');
  const [applicableCategories, setApplicableCategories] = useState<RideCategory[]>([
    'GoMini',
    'GoRide',
    'GoComfort',
    'GoAuto',
    'GoMoto'
  ]);
  const [targetAudience, setTargetAudience] = useState<
    'all' | 'new_passengers' | 'existing_passengers' | 'selected_drivers'
  >('all');
  const [paymentEligibility, setPaymentEligibility] = useState<string>('all');
  const [minDriverRating, setMinDriverRating] = useState('4.70');
  const [minDriverTrips, setMinDriverTrips] = useState('25');

  // View Details Drawer
  const [selectedPromoForDetails, setSelectedPromoForDetails] = useState<PromoCode | null>(null);

  const resetForm = () => {
    setCode('');
    setDisplayName('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('20');
    setMaxDiscount('200');
    setMinFare('250');
    setUsageLimit('1000');
    setUsagePerPassenger('1');
    setStartDate('2026-09-01');
    setEndDate('2026-12-31');
    setApplicableCity('All');
    setApplicableCategories(['GoMini', 'GoRide', 'GoComfort', 'GoAuto', 'GoMoto']);
    setTargetAudience('all');
    setPaymentEligibility('all');
    setMinDriverRating('4.70');
    setMinDriverTrips('25');
    setEditingPromo(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDisplayName(promo.displayName || promo.code);
    setDescription(promo.description || '');
    setDiscountType(promo.discountType);
    setDiscountValue(String(promo.discountValue));
    setMaxDiscount(String(promo.maxDiscount || 200));
    setMinFare(String(promo.minFare || 250));
    setUsageLimit(String(promo.usageLimit || 1000));
    setUsagePerPassenger(String(promo.usagePerPassenger || 1));
    setStartDate(promo.startDate || '2026-09-01');
    setEndDate(promo.endDate || promo.expiryDate || promo.expiresAt || '2026-12-31');
    setApplicableCity(promo.applicableCity || 'All');
    setApplicableCategories(
      promo.applicableCategories && promo.applicableCategories.length > 0
        ? promo.applicableCategories
        : ['GoMini', 'GoRide', 'GoComfort', 'GoAuto', 'GoMoto']
    );
    setTargetAudience(promo.targetAudience || 'all');
    setPaymentEligibility(promo.paymentMethodEligibility?.[0] || 'all');
    setMinDriverRating(String(promo.driverEligibilityRequirements?.minRating || '4.70'));
    setMinDriverTrips(String(promo.driverEligibilityRequirements?.minCompletedRides || '25'));
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const promoPayload: PromoCode = {
      id: editingPromo ? editingPromo.id : `PR-${Date.now().toString().slice(-4)}`,
      code: code.trim().toUpperCase(),
      displayName: displayName.trim() || code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: Number(maxDiscount),
      minFare: Number(minFare),
      usageLimit: Number(usageLimit),
      usagePerPassenger: Number(usagePerPassenger),
      usedCount: editingPromo ? (editingPromo.usedCount ?? editingPromo.usageCount ?? 0) : 0,
      usageCount: editingPromo ? (editingPromo.usedCount ?? editingPromo.usageCount ?? 0) : 0,
      startDate,
      endDate,
      expiryDate: endDate,
      expiresAt: endDate,
      applicableCity,
      applicableCities: applicableCity === 'All' ? ['All'] : [applicableCity],
      applicableCategories,
      targetAudience,
      paymentMethodEligibility: paymentEligibility === 'all' ? ['all'] : [paymentEligibility],
      driverEligibilityRequirements: {
        minRating: Number(minDriverRating),
        minCompletedRides: Number(minDriverTrips)
      },
      status: editingPromo ? editingPromo.status || 'active' : 'active',
      active: editingPromo ? (editingPromo.status === 'active' || editingPromo.active) : true,
      paused: editingPromo ? editingPromo.status === 'paused' : false,
      createdAt: editingPromo ? editingPromo.createdAt : new Date().toISOString()
    };

    if (editingPromo) {
      updatePromoCodeDetails(editingPromo.id, promoPayload, 'Admin manual revision');
    } else {
      addPromoCode(promoPayload);
    }

    setShowModal(false);
    resetForm();
  };

  const toggleCategorySelection = (cat: RideCategory) => {
    if (applicableCategories.includes(cat)) {
      if (applicableCategories.length > 1) {
        setApplicableCategories(applicableCategories.filter((c) => c !== cat));
      }
    } else {
      setApplicableCategories([...applicableCategories, cat]);
    }
  };

  // Filtered List
  const filteredPromos = promoCodes.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.displayName && p.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity =
      filterCity === 'All' ||
      p.applicableCity === filterCity ||
      (p.applicableCities && p.applicableCities.includes(filterCity)) ||
      p.applicableCity === 'All';

    const currentStatus = p.status || (p.active ? 'active' : 'disabled');
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'active' && (currentStatus === 'active' || p.active)) ||
      (filterStatus === 'paused' && currentStatus === 'paused') ||
      (filterStatus === 'disabled' && (currentStatus === 'disabled' || !p.active));

    const matchesCategory =
      filterCategory === 'All' ||
      !p.applicableCategories ||
      p.applicableCategories.includes(filterCategory as RideCategory);

    return matchesSearch && matchesCity && matchesStatus && matchesCategory;
  });

  return (
    <div id="section-promo-code-management" className="space-y-5">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Promo Code Configuration & Control Engine
          </h2>
          <p className="text-xs text-[#6B7280]">
            Create, edit, activate, pause, and configure ride discount vouchers with built-in fare protection
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-open-safety-sim"
            onClick={() => onOpenSimulator()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Test Negative Fare Safety
          </button>

          <button
            id="btn-create-promo-modal"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Promo Voucher
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="input-search-promo"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code or name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            id="select-filter-city"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Multan">Multan</option>
            <option value="Faisalabad">Faisalabad</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Quetta">Quetta</option>
          </select>

          <select
            id="select-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused</option>
            <option value="disabled">Disabled / Inactive</option>
          </select>

          <select
            id="select-filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            <option value="GoMini">GoMini</option>
            <option value="GoRide">GoRide</option>
            <option value="GoComfort">GoComfort</option>
            <option value="GoAuto">GoAuto</option>
            <option value="GoMoto">GoMoto</option>
          </select>
        </div>

        <span className="text-xs text-[#6B7280] font-medium">
          Showing {filteredPromos.length} of {promoCodes.length} vouchers
        </span>
      </div>

      {/* Promo Code Cards Table/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPromos.map((p) => {
          const exp = p.endDate || p.expiryDate || p.expiresAt || '2026-12-31';
          const isExpired = new Date(exp) < new Date();
          const used = p.usedCount ?? p.usageCount ?? 0;
          const limit = p.usageLimit || 1000;
          const usagePercent = Math.min(Math.round((used / limit) * 100), 100);
          const currentStatus = p.status || (p.active ? 'active' : 'disabled');

          return (
            <div
              key={p.id}
              id={`promo-card-${p.code}`}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-[#111827] bg-amber-500/10 text-amber-900 border border-amber-500/20 px-2.5 py-1 rounded-lg tracking-wider">
                        {p.code}
                      </span>
                      {p.targetAudience === 'new_passengers' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          New Riders
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#374151] mt-1.5">
                      {p.displayName || p.code}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      currentStatus === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentStatus === 'paused'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-[#6B7280] border border-slate-200'
                    }`}
                  >
                    {currentStatus}
                  </span>
                </div>

                {p.description && (
                  <p className="text-[11px] text-[#6B7280] mt-1 line-clamp-2">{p.description}</p>
                )}

                {/* Offer Details */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#111827]">
                    <span>
                      {p.discountType === 'percentage'
                        ? `${p.discountValue}% Discount`
                        : `Flat ${formatPKR(p.discountValue)} Off`}
                    </span>
                    <span className="text-amber-800 text-[11px] font-mono">
                      Max: {formatPKR(p.maxDiscount || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>Min Fare Requirement:</span>
                    <span className="font-semibold text-[#374151] font-mono">
                      {formatPKR(p.minFare || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>City Scope:</span>
                    <span className="font-semibold text-[#374151]">
                      {p.applicableCity ||
                        (p.applicableCities && p.applicableCities.length > 0
                          ? p.applicableCities.join(', ')
                          : 'All Cities')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>Categories:</span>
                    <span className="font-semibold text-[#374151] truncate max-w-[140px]">
                      {p.applicableCategories?.join(', ') || 'All Vehicles'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>Per User Limit:</span>
                    <span className="font-semibold text-[#374151]">
                      {p.usagePerPassenger || 1} ride(s)
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Budget/Usage Limit */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-[#6B7280] font-medium">
                    <span>Usage: {used.toLocaleString()}</span>
                    <span>Limit: {limit.toLocaleString()} ({usagePercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        usagePercent >= 90
                          ? 'bg-rose-500'
                          : usagePercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-[10px] text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#9CA3AF]" />
                    Valid: {p.startDate || '2026-09-01'} to {exp}
                  </span>
                  {isExpired && (
                    <span className="text-rose-600 font-bold uppercase">Expired</span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {/* Status Toggle / Pause */}
                  {currentStatus === 'active' ? (
                    <button
                      id={`btn-pause-promo-${p.code}`}
                      onClick={() => togglePromoStatus(p.id, 'paused', 'Admin paused campaign')}
                      title="Pause Voucher"
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      id={`btn-activate-promo-${p.code}`}
                      onClick={() => togglePromoStatus(p.id, 'active', 'Admin activated campaign')}
                      title="Activate Voucher"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Activate
                    </button>
                  )}

                  {currentStatus !== 'disabled' && (
                    <button
                      id={`btn-disable-promo-${p.code}`}
                      onClick={() => togglePromoStatus(p.id, 'inactive', 'Admin disabled voucher')}
                      title="Disable / Deactivate"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`btn-test-sim-${p.code}`}
                    onClick={() => onOpenSimulator(p.code)}
                    title="Simulate Safe Ride Calculation"
                    className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition cursor-pointer text-xs flex items-center gap-1 font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Test
                  </button>

                  <button
                    id={`btn-edit-promo-${p.code}`}
                    onClick={() => handleOpenEditModal(p)}
                    title="Edit Promo Configuration"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#111827] hover:bg-slate-100 transition cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Promo Modal */}
      {showModal && (
        <div
          id="modal-promo-config"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">
                    {editingPromo ? `Edit Promo Voucher: ${editingPromo.code}` : 'Create New Promo Code'}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Configure discount rules, city applicability, safety caps, and user limits
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Code & Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Promo Code (Uppercase)*
                  </label>
                  <input
                    id="input-promo-code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LAHORE50, FREERIDE"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Display Title
                  </label>
                  <input
                    id="input-promo-title"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Lahore Launch Special"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#374151] mb-1">Description</label>
                <input
                  id="input-promo-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Terms and passenger explanation..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Row 2: Discount Type, Value, Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Discount Type</label>
                  <select
                    id="select-promo-discount-type"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Fixed Amount (PKR) Off</option>
                    <option value="flat">Flat Fare Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (PKR)'}*
                  </label>
                  <input
                    id="input-promo-discount-val"
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Maximum Discount Cap (PKR)*
                  </label>
                  <input
                    id="input-promo-max-discount"
                    type="number"
                    min="10"
                    required
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Minimum Fare & Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Minimum Ride Fare (PKR)*
                  </label>
                  <input
                    id="input-promo-min-fare"
                    type="number"
                    min="50"
                    required
                    value={minFare}
                    onChange={(e) => setMinFare(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Total Global Uses Limit*
                  </label>
                  <input
                    id="input-promo-usage-limit"
                    type="number"
                    min="1"
                    required
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Usage Per Passenger*
                  </label>
                  <input
                    id="input-promo-usage-per-pax"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={usagePerPassenger}
                    onChange={(e) => setUsagePerPassenger(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 4: Dates & City Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Start Date</label>
                  <input
                    id="input-promo-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">End Date</label>
                  <input
                    id="input-promo-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">City Eligibility</label>
                  <select
                    id="select-promo-city"
                    value={applicableCity}
                    onChange={(e) => setApplicableCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="All">All Pakistan Cities</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Multan">Multan</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Target Audience & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Target Audience
                  </label>
                  <select
                    id="select-promo-audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Passengers</option>
                    <option value="new_passengers">New Passengers Only (1st Booking)</option>
                    <option value="existing_passengers">Existing Passengers (Retention)</option>
                    <option value="selected_drivers">Selected Drivers (Partner Vouchers)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Payment Method Restriction
                  </label>
                  <select
                    id="select-promo-payment"
                    value={paymentEligibility}
                    onChange={(e) => setPaymentEligibility(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Any Payment Method (Cash, Wallet, Cards)</option>
                    <option value="wallet">GoLife Wallet Only</option>
                    <option value="easypaisa">EasyPaisa Only</option>
                    <option value="jazzcash">JazzCash Only</option>
                    <option value="card">Debit / Credit Cards Only</option>
                  </select>
                </div>
              </div>

              {/* Applicable Categories checkboxes */}
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">
                  Applicable Ride Service Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['GoMini', 'GoRide', 'GoComfort', 'GoAuto', 'GoMoto'] as RideCategory[]).map(
                    (cat) => {
                      const isSelected = applicableCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategorySelection(cat)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-slate-50 text-[#4B5563] border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Negative Fare Protection Guaranteed:</strong> GoLife engine ensures that
                  even if discounts exceed gross fares, the calculated passenger payment will never
                  be negative, and the captain's net settlement is protected via marketing subsidies.
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-promo"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  {editingPromo ? 'Save Changes' : 'Create & Launch Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
