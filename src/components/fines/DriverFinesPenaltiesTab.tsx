import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  DriverFine,
  FineStatus,
  FineSource,
  DeductionMethod,
  FairExclusionReason,
  AutomaticFineRule
} from '../../types';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import {
  AlertOctagon,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Clock,
  Car,
  Banknote,
  Sliders,
  Smartphone,
  Eye,
  FileText,
  AlertTriangle,
  History,
  Check,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

interface DriverFinesPenaltiesTabProps {
  preselectedDriverId?: string;
  onSelectDriver?: (driverId: string) => void;
}

export const DriverFinesPenaltiesTab: React.FC<DriverFinesPenaltiesTabProps> = ({
  preselectedDriverId,
  onSelectDriver
}) => {
  const {
    driverFines,
    fineReasons,
    automaticFineRules,
    fineRuleVersions,
    fineTransactions,
    drivers,
    rides,
    currentAdmin,
    addDriverFine,
    waiveDriverFine,
    refundDriverFine,
    resolveDisputeDriverFine,
    updateAutomaticFineRule,
    toggleFineReason,
    openUniversalDetail,
    showToast
  } = useAdmin();

  // Navigation within Fines system
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'rules' | 'transactions' | 'app_preview'>('directory');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [selectedDriverIdFilter, setSelectedDriverIdFilter] = useState<string>(preselectedDriverId || 'all');

  // Modal States
  const [showAddFineModal, setShowAddFineModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<DriverFine | null>(null);

  // Quick Action Modals
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [waiveReason, setWaiveReason] = useState('First-time offender courtesy waiver');
  const [waiveNote, setWaiveNote] = useState('');

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState('System telemetry error / unjustified deduction');
  const [refundNote, setRefundNote] = useState('');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeDecision, setDisputeDecision] = useState<'approved' | 'rejected' | 'partial'>('approved');
  const [disputeAdjustmentAmount, setDisputeAdjustmentAmount] = useState<string>('');
  const [disputeNote, setDisputeNote] = useState('Verified proof of road closure and heavy security barricades.');

  // Add Fine Form State
  const [formDriverId, setFormDriverId] = useState<string>(preselectedDriverId || (drivers[0]?.id || ''));
  const [formReasonId, setFormReasonId] = useState<string>(fineReasons[0]?.id || 'late_pickup_excessive');
  const [formAmount, setFormAmount] = useState<string>('500');
  const [formSource, setFormSource] = useState<FineSource>('manual');
  const [formRelatedRideId, setFormRelatedRideId] = useState<string>('');
  const [formDeductionMethod, setFormDeductionMethod] = useState<DeductionMethod>('driver_wallet');
  const [formExclusionReason, setFormExclusionReason] = useState<string>('none');
  const [formNote, setFormNote] = useState<string>('');

  // Selected driver for Add Fine calculations
  const formSelectedDriver = useMemo(() => {
    return drivers.find((d) => d.id === formDriverId) || drivers[0];
  }, [drivers, formDriverId]);

  // Edit Rule State
  const [editingRule, setEditingRule] = useState<AutomaticFineRule | null>(null);
  const [ruleAmountInput, setRuleAmountInput] = useState<string>('');
  const [ruleThresholdInput, setRuleThresholdInput] = useState<string>('');
  const [ruleGraceInput, setRuleGraceInput] = useState<string>('');
  const [ruleReasonForChange, setRuleReasonForChange] = useState<string>('Quarterly compliance policy revision');

  // Filtered Fines
  const filteredFines = useMemo(() => {
    return driverFines.filter((fine) => {
      if (selectedDriverIdFilter !== 'all' && fine.driverId !== selectedDriverIdFilter) return false;
      if (statusFilter !== 'all' && fine.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && fine.source !== sourceFilter) return false;
      if (cityFilter !== 'all' && fine.city !== cityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = fine.fineCode.toLowerCase().includes(q);
        const matchesDriver = fine.driverName.toLowerCase().includes(q) || fine.driverPhone.includes(q) || fine.driverPlate.toLowerCase().includes(q);
        const matchesReason = fine.reasonLabel.toLowerCase().includes(q);
        const matchesRide = fine.relatedRideCode?.toLowerCase().includes(q);
        return matchesCode || matchesDriver || matchesReason || matchesRide;
      }

      return true;
    });
  }, [driverFines, selectedDriverIdFilter, statusFilter, sourceFilter, cityFilter, searchQuery]);

  // Metrics
  const totalFinesCount = driverFines.length;
  const totalAmountFined = driverFines.reduce((sum, f) => sum + f.amount, 0);
  const totalAmountDeducted = driverFines.reduce((sum, f) => sum + f.deductedAmount, 0);
  const totalAmountOutstanding = driverFines.reduce((sum, f) => sum + f.remainingAmount, 0);
  const disputedCount = driverFines.filter((f) => f.status === 'disputed').length;

  // Handle opening Review modal
  const handleOpenReview = (fine: DriverFine) => {
    setSelectedFine(fine);
    setShowReviewModal(true);
  };

  // Open Waive
  const handleOpenWaive = (fine: DriverFine) => {
    setSelectedFine(fine);
    setWaiveReason('First-time courtesy waiver');
    setWaiveNote(`Administrative waiver issued for ${fine.fineCode}`);
    setShowWaiveModal(true);
  };

  // Open Refund
  const handleOpenRefund = (fine: DriverFine) => {
    setSelectedFine(fine);
    setRefundAmount(fine.deductedAmount.toString());
    setRefundReason('Erroneous automatic trigger / telematics dispute resolved');
    setRefundNote(`Reversal of PKR ${fine.deductedAmount} for fine ${fine.fineCode}`);
    setShowRefundModal(true);
  };

  // Open Dispute Resolution
  const handleOpenDispute = (fine: DriverFine) => {
    setSelectedFine(fine);
    setDisputeDecision('approved');
    setDisputeAdjustmentAmount((fine.deductedAmount / 2).toString());
    setDisputeNote('Proof verified: Passenger confirmed extreme traffic gridlock.');
    setShowDisputeModal(true);
  };

  // Handle Add Fine Submit
  const handleConfirmAddFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDriverId) {
      showToast('Please select a driver.', 'error');
      return;
    }

    const amt = Number(formAmount);
    if (!amt || amt <= 0) {
      showToast('Fine amount must be greater than 0.', 'error');
      return;
    }

    // Check if valid exclusion applies
    if (formExclusionReason !== 'none') {
      showToast(`Fine waived immediately due to fair exclusion: ${formExclusionReason.replace(/_/g, ' ')}`, 'info');
    }

    const matchedRide = rides.find((r) => r.id === formRelatedRideId);

    addDriverFine({
      driverId: formDriverId,
      reasonId: formReasonId,
      amount: amt,
      source: formSource,
      relatedRideId: formRelatedRideId || undefined,
      relatedRideCode: matchedRide?.rideCode || undefined,
      note: formNote.trim() || undefined,
      deductionMethod: formDeductionMethod,
      isQualifying: formExclusionReason === 'none',
      exclusionReason: formExclusionReason !== 'none' ? (formExclusionReason as FairExclusionReason) : undefined
    });

    setShowAddFineModal(false);
    // Reset form
    setFormAmount('500');
    setFormNote('');
    setFormExclusionReason('none');
  };

  // Handle Reason Change in Add Fine Form
  const handleReasonSelect = (reasonId: string) => {
    setFormReasonId(reasonId);
    const matched = fineReasons.find((r) => r.id === reasonId);
    if (matched) {
      setFormAmount(matched.defaultAmount.toString());
      setFormNote(`Penalty issued for ${matched.label}. Standard GoLife compliance code.`);
    }
  };

  return (
    <div id="driver-fines-penalties-system" className="space-y-6 text-[#111827]">
      {/* 1. Header Bar with Unified ADD FINE Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                Driver Fines, Penalties & Deduction Desk
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300/60">
                  Centralized Control
                </span>
              </h1>
              <p className="text-xs text-[#6B7280]">
                Single operational center for manual fines, automated triggers, balance protection, and dispute resolutions
              </p>
            </div>
          </div>
        </div>

        {/* Unified "ADD FINE" Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-open-add-fine-modal"
            onClick={() => setShowAddFineModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer border border-amber-500/40"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>ADD FINE</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Total Fines Issued</span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalFinesCount}</div>
          <span className="text-[11px] font-bold text-[#0F766E]">PKR {totalAmountFined.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Deducted from Wallets</span>
          <div className="text-xl font-black text-emerald-700 mt-1">PKR {totalAmountDeducted.toLocaleString()}</div>
          <span className="text-[11px] text-[#6B7280]">Real-time balance debited</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Outstanding Penalties</span>
          <div className="text-xl font-black text-rose-600 mt-1">PKR {totalAmountOutstanding.toLocaleString()}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Protected from negative balance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Disputed by Drivers</span>
          <div className="text-xl font-black text-amber-600 mt-1">{disputedCount}</div>
          <span className="text-[11px] text-[#6B7280]">Pending fair review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Active Automatic Rules</span>
          <div className="text-xl font-black text-indigo-700 mt-1">
            {automaticFineRules.filter((r) => r.enabled).length} / {automaticFineRules.length}
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold">Telematics & delay engine</span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-3 py-2 rounded-2xl shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Fines Directory & Queue ({driverFines.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'rules'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Automatic Fine Rules Engine ({automaticFineRules.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'transactions'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Deductions & Reversals Ledger ({fineTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('app_preview')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'app_preview'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Driver App Transparency Preview</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB 1: FINES DIRECTORY & DISPUTED QUEUE */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Fine ID, Driver Name, Phone, Plate, Ride..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="deducted">Deducted (Full)</option>
                <option value="partially_deducted">Partially Deducted</option>
                <option value="pending">Pending (Outstanding)</option>
                <option value="disputed">Disputed by Driver</option>
                <option value="waived">Waived</option>
                <option value="refunded">Refunded / Reversed</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Sources (Manual & Auto)</option>
                <option value="manual">Manual Admin Fine</option>
                <option value="automatic">Automatic Rule Trigger</option>
              </select>

              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
              </select>
            </div>

            <div className="text-xs text-[#6B7280] font-semibold">
              Showing <span className="font-bold text-slate-900">{filteredFines.length}</span> records
            </div>
          </div>

          {/* Fines Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Fine Code & Date</th>
                    <th className="py-3 px-4">Driver Profile</th>
                    <th className="py-3 px-4">Reason & Violation</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Amount & Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredFines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                        <AlertOctagon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No fines or penalties matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFines.map((fine) => {
                      const isDisputed = fine.status === 'disputed';
                      const isPending = fine.status === 'pending';
                      const isPartial = fine.status === 'partially_deducted';
                      const isDeducted = fine.status === 'deducted';
                      const isWaived = fine.status === 'waived';
                      const isRefunded = fine.status === 'refunded';

                      return (
                        <tr key={fine.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{fine.fineCode}</span>
                              {fine.relatedRideCode && (
                                <button
                                  onClick={() => fine.relatedRideId && openUniversalDetail('ride', fine.relatedRideId)}
                                  className="text-[10px] text-[#0F766E] font-semibold hover:underline flex items-center gap-0.5"
                                  title="View related ride"
                                >
                                  ({fine.relatedRideCode})
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6B7280]">{fine.createdAt}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{fine.driverName}</div>
                            <div className="text-[11px] text-[#6B7280]">
                              {fine.driverPlate} • {fine.city}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 truncate" title={fine.reasonLabel}>
                              {fine.reasonLabel}
                            </div>
                            <div className="text-[11px] text-[#6B7280] truncate" title={fine.note}>
                              {fine.note}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {fine.source === 'automatic' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                ⚡ Automatic Rule
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                👤 Manual Fine
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-950">PKR {fine.amount.toLocaleString()}</div>
                            <div className="text-[10px] font-medium text-[#6B7280]">
                              Deducted: <span className="font-bold text-emerald-700">PKR {fine.deductedAmount}</span>
                              {fine.remainingAmount > 0 && (
                                <span className="text-rose-600 font-bold ml-1.5">
                                  (O/S: PKR {fine.remainingAmount})
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isDisputed && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Disputed
                              </span>
                            )}
                            {isDeducted && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Deducted
                              </span>
                            )}
                            {isPartial && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> Partial (Protected)
                              </span>
                            )}
                            {isPending && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" /> Outstanding
                              </span>
                            )}
                            {isWaived && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
                                <Check className="w-3 h-3" /> Waived
                              </span>
                            )}
                            {isRefunded && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 w-fit">
                                <RotateCcw className="w-3 h-3" /> Refunded / Reversed
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Central REVIEW FINE button */}
                              <button
                                onClick={() => handleOpenReview(fine)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 border border-amber-300 text-slate-950 hover:bg-amber-100 transition shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-600" />
                                <span>REVIEW FINE</span>
                              </button>

                              {/* Dispute resolution button if disputed */}
                              {isDisputed && (
                                <button
                                  onClick={() => handleOpenDispute(fine)}
                                  className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-500 transition shadow-2xs cursor-pointer"
                                  title="Resolve Driver Dispute"
                                >
                                  Resolve Dispute
                                </button>
                              )}

                              {/* Quick Waive */}
                              {fine.status !== 'waived' && fine.status !== 'refunded' && (
                                <button
                                  onClick={() => handleOpenWaive(fine)}
                                  className="p-1 text-[#6B7280] hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                                  title="Waive Fine"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}

                              {/* Quick Refund / Reverse */}
                              {fine.deductedAmount > 0 && fine.status !== 'refunded' && (
                                <button
                                  onClick={() => handleOpenRefund(fine)}
                                  className="p-1 text-[#6B7280] hover:text-purple-600 rounded-lg hover:bg-slate-100 transition"
                                  title="Refund / Reverse Deducted Amount"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 2: AUTOMATIC FINE RULES ENGINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  Automatic Fine Rules & Telematics Detection Engine
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Automated penalty triggers apply uniformly across all Pakistan operations with fair delay exclusion shields
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                Rule Engine Status: <span className="font-bold text-emerald-700">Active</span>
              </div>
            </div>

            {/* Rule Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {automaticFineRules.map((rule) => {
                return (
                  <div
                    key={rule.id}
                    className={`p-4.5 rounded-2xl border transition-all ${
                      rule.enabled
                        ? 'bg-white border-[#E5E7EB] shadow-xs hover:border-amber-400'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {rule.ruleKey} • {rule.version}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">{rule.title}</h3>
                      </div>
                      <button
                        onClick={() => updateAutomaticFineRule(rule.id, { enabled: !rule.enabled }, `Toggled status to ${!rule.enabled}`)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                          rule.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-[#6B7280] min-h-[36px]">{rule.description}</p>

                    {/* Telematics & Threshold Metrics */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#6B7280]">Fine Amt</span>
                        <div className="text-xs font-black text-slate-900">PKR {rule.fineAmount}</div>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#6B7280]">Threshold</span>
                        <div className="text-xs font-black text-slate-900">{rule.thresholdCount}x</div>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#6B7280]">Grace Mins</span>
                        <div className="text-xs font-black text-slate-900">{rule.graceMinutes} m</div>
                      </div>
                    </div>

                    {/* Exclusions Supported */}
                    <div className="text-[11px] text-[#6B7280] mb-3">
                      <span className="font-bold text-slate-700">Fair Exclusions: </span>
                      {rule.supportedExclusions.slice(0, 2).map((e) => e.replace(/_/g, ' ')).join(', ')}
                      {rule.supportedExclusions.length > 2 && ' +more'}
                    </div>

                    {/* Edit Rule Action */}
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleAmountInput(rule.fineAmount.toString());
                        setRuleThresholdInput(rule.thresholdCount.toString());
                        setRuleGraceInput(rule.graceMinutes.toString());
                        setRuleReasonForChange('Policy threshold adjustment');
                      }}
                      className="w-full py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-slate-950 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      Configure Rule Parameters
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rule Version History */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-600" />
              Automatic Rule Audit & Version Logs
            </h3>
            {fineRuleVersions.length === 0 ? (
              <div className="text-xs text-[#6B7280] py-4">
                No custom version changes logged yet. Current rules are operating under factory baseline v1.0.
              </div>
            ) : (
              <div className="space-y-2">
                {fineRuleVersions.map((v) => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{v.ruleTitle}</span>
                      <span className="ml-2 text-amber-700 font-semibold">{v.versionTag}</span>
                      <div className="text-[#6B7280] text-[11px]">
                        Amount changed: PKR {v.previousAmount} → PKR {v.newAmount} • Reason: {v.reason}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-[#6B7280]">
                      <div>{v.changedBy}</div>
                      <div>{v.changeDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 3: DEDUCTIONS & REVERSALS LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Fine Deduction & Reversal Ledger
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Every wallet debit, partial balance protection hold, and refund credit is tracked immutably
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Total Transactions: <span className="font-bold">{fineTransactions.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Tx ID & Date</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Source / Channel</th>
                    <th className="py-3 px-4">Original Fine</th>
                    <th className="py-3 px-4">Deducted / Refunded</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {fineTransactions.map((tx) => {
                    const isReversal = tx.type === 'fine_refund';
                    const isPartial = tx.type === 'fine_partial_deduction';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{tx.transactionId}</div>
                          <div className="text-[11px] text-[#6B7280]">{tx.date}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{tx.driverName}</td>
                        <td className="py-3 px-4">
                          {isReversal ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Fine Reversal / Refund
                            </span>
                          ) : isPartial ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Partial Deduction
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Full Deduction
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#6B7280] capitalize">
                          {tx.deductionSource.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">PKR {tx.originalFineAmount}</td>
                        <td className="py-3 px-4 font-black">
                          {isReversal ? (
                            <span className="text-emerald-700">+PKR {tx.amountDeducted} (Credit)</span>
                          ) : (
                            <span className="text-rose-600">-PKR {tx.amountDeducted} (Debit)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {tx.remainingAmount > 0 ? (
                            <span className="text-rose-600">PKR {tx.remainingAmount}</span>
                          ) : (
                            <span className="text-emerald-700">PKR 0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {tx.status.toUpperCase()}
                          </span>
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

      {/* ========================================================================= */}
      {/* 7. TAB 4: DRIVER APP TRANSPARENCY PREVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'app_preview' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                Driver Mobile App Interface Simulation
              </h2>
              <p className="text-xs text-[#6B7280]">
                Shows how GoLife Taxi drivers view penalties, reason transparency, and access the dispute button in their app
              </p>
            </div>

            {/* Mobile Device Mockup Frame */}
            <div className="w-full bg-slate-950 rounded-[40px] p-4 shadow-2xl border-4 border-slate-800 relative">
              {/* Notch */}
              <div className="w-32 h-5 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>

              {/* App Screen */}
              <div className="bg-[#F8FAFC] rounded-[28px] overflow-hidden text-[#111827] min-h-[500px] flex flex-col">
                {/* Driver App Header */}
                <div className="bg-slate-900 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-400">GoLife Partner</div>
                    <div className="text-[10px] text-slate-400">Lahore Hub</div>
                  </div>
                  <div className="text-base font-black mt-2">Fines & Penalties</div>
                  <p className="text-[10px] text-slate-400">Transparency and Dispute Resolution Desk</p>
                </div>

                {/* Driver Balance Card */}
                <div className="p-3.5 m-3 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-[#6B7280]">Available Wallet Balance</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">PKR 3,450</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    ✓ Protected against negative balances
                  </div>
                </div>

                {/* Sample Fine Item */}
                <div className="px-3 flex-1 space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Deducted Penalty
                      </span>
                      <span className="text-xs font-black text-rose-700">- PKR 500</span>
                    </div>

                    <div className="font-bold text-xs text-slate-900">
                      Excessive Late Pickup (&gt; 15 mins)
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Ride: RIDE-PK-77412 • Gulberg to DHA Phase 5
                    </div>
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Driver delayed 18 mins beyond pickup ETA without passenger notification.
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-[#6B7280]">Yesterday, 04:15 PM</span>
                      <button
                        onClick={() => showToast('Dispute form opened in Driver App with camera evidence upload.', 'info')}
                        className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold text-[10px] hover:bg-amber-500 cursor-pointer"
                      >
                        Dispute Penalty
                      </button>
                    </div>
                  </div>

                  {/* Sample Waived Fine */}
                  <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Penalty Waived
                      </span>
                      <span className="text-xs font-bold text-emerald-700">PKR 0</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-1">
                      Route Deviation / Checkpoint Delay
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-1">
                      ✓ Fair exclusion applied: Security checkpoint gridlock confirmed by Admin.
                    </div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="p-3 text-center text-[10px] text-[#6B7280] border-t border-[#E5E7EB] bg-white">
                  Questions? Call GoLife 24/7 Driver Support Helpline: 042-111-GOLIFE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: ADD FINE (UNIFIED MANUAL & AUTOMATIC SIMULATION) */}
      {/* ========================================================================= */}
      {showAddFineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Issue Driver Fine / Penalty</h3>
                  <p className="text-[11px] text-slate-400">Single unified control for all compliance penalties</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddFineModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmAddFine} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* 1. Driver Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Target Driver <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formDriverId}
                  onChange={(e) => setFormDriverId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                  required
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.vehicle.plate} • {d.phone}) — Wallet: PKR {d.walletBalance}
                    </option>
                  ))}
                </select>

                {/* Driver Balance Info Box */}
                {formSelectedDriver && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#6B7280]">Current Wallet Balance:</span>
                      <span className="font-black text-slate-900 ml-1.5">PKR {formSelectedDriver.walletBalance}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {formSelectedDriver.accountStatus.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Reason Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Fine Reason & Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formReasonId}
                  onChange={(e) => handleReasonSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                  required
                >
                  {fineReasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.category.toUpperCase()}] {r.label} (Default: PKR {r.defaultAmount})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Amount & Source */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Fine Amount (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    min="50"
                    step="50"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Source Trigger</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as FineSource)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                  >
                    <option value="manual">Manual Fine (Admin)</option>
                    <option value="automatic">Automatic Rule Simulation</option>
                  </select>
                </div>
              </div>

              {/* 4. Related Ride (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Related Ride (Optional)</label>
                <select
                  value={formRelatedRideId}
                  onChange={(e) => setFormRelatedRideId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                >
                  <option value="">No specific ride linked</option>
                  {rides.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.rideCode} • {r.pickupLocation.name.slice(0, 20)}... → {r.dropoffLocation.name.slice(0, 20)}... (PKR {r.fare})
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Fair Violation Exclusion Checker */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Fair Violation Exclusion Check</span>
                </div>
                <p className="text-[11px] text-[#6B7280] mb-2">
                  Verify if delay or cancellation was caused by factors beyond driver control
                </p>
                <select
                  value={formExclusionReason}
                  onChange={(e) => setFormExclusionReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                >
                  <option value="none">No Valid Exclusion (Proceed with Fine)</option>
                  <option value="traffic_gridlock">Traffic Jam / Extreme Gridlock</option>
                  <option value="customer_delayed_driver">Customer Delayed Driver at Pickup</option>
                  <option value="customer_requested_wait">Customer Requested Driver to Wait</option>
                  <option value="road_closure_vip">Road Closure / VIP Movement Checkpoint</option>
                  <option value="app_glitch_gps_error">App Telematics Glitch / GPS Error</option>
                  <option value="emergency_breakdown">Vehicle Mechanical Emergency</option>
                </select>
                {formExclusionReason !== 'none' && (
                  <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    Exclusion identified: Fine will be registered as exempted/waived with no wallet deduction.
                  </div>
                )}
              </div>

              {/* 6. Deduction Method & Balance Protection Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Deduction Channel</label>
                <select
                  value={formDeductionMethod}
                  onChange={(e) => setFormDeductionMethod(e.target.value as DeductionMethod)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                >
                  <option value="driver_wallet">Driver Wallet Balance (Instant)</option>
                  <option value="available_balance">Available Balance Only (Non-negative Protection)</option>
                  <option value="driver_earnings">Upcoming Ride Earnings Payout</option>
                  <option value="pending_earnings">Hold from Pending Weekly Settlements</option>
                </select>

                {/* Balance Protection Calculation Box */}
                {formSelectedDriver && Number(formAmount) > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900">Balance Protection Transparency:</span>
                    <div className="text-[11px] text-slate-700 mt-1">
                      {formSelectedDriver.walletBalance >= Number(formAmount) ? (
                        <span className="text-emerald-700 font-semibold">
                          Driver has sufficient balance (PKR {formSelectedDriver.walletBalance}). Full amount of PKR {formAmount} will be deducted immediately.
                        </span>
                      ) : formSelectedDriver.walletBalance > 0 ? (
                        <span className="text-amber-800 font-semibold">
                          Driver balance is PKR {formSelectedDriver.walletBalance}. Exactly PKR {formSelectedDriver.walletBalance} will be deducted, and the remaining PKR {Number(formAmount) - formSelectedDriver.walletBalance} will be tracked as an Outstanding Penalty to prevent negative balance.
                        </span>
                      ) : (
                        <span className="text-rose-700 font-semibold">
                          Driver has 0 or negative balance. The entire PKR {formAmount} will be held as Outstanding Fine against upcoming ride earnings.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Compliant Administrative Note */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Compliant Admin Note</label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                  placeholder="Auto-generated note will be created if left blank..."
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddFineModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition shadow-xs cursor-pointer border border-amber-500/40"
                >
                  Confirm &amp; Issue Fine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: REVIEW FINE (DEEP DOSSIER & ACTIONS) */}
      {/* ========================================================================= */}
      {showReviewModal && selectedFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Fine Review Dossier</div>
                <h3 className="font-bold text-sm">{selectedFine.fineCode}</h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Content */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Top Summary Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800">Penalty Amount</span>
                  <div className="text-xl font-black text-slate-900">PKR {selectedFine.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-[#6B7280]">
                    Status: <span className="font-bold text-slate-900 capitalize">{selectedFine.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-emerald-700 font-bold">Deducted: PKR {selectedFine.deductedAmount}</div>
                  <div className="text-rose-600 font-bold">Remaining: PKR {selectedFine.remainingAmount}</div>
                  <div className="text-[10px] text-[#6B7280]">Source: {selectedFine.source.toUpperCase()}</div>
                </div>
              </div>

              {/* Driver & Ride Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-[#6B7280]">Driver Profile</span>
                  <div className="font-bold text-sm text-slate-900 mt-1">{selectedFine.driverName}</div>
                  <div className="text-[#6B7280] text-[11px] mt-0.5">
                    Phone: {selectedFine.driverPhone} • Plate: {selectedFine.driverPlate}
                  </div>
                  <div className="text-[#6B7280] text-[11px]">City: {selectedFine.city}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-[#6B7280]">Violation Category</span>
                  <div className="font-bold text-sm text-slate-900 mt-1">{selectedFine.reasonLabel}</div>
                  <div className="text-[#6B7280] text-[11px] mt-0.5">
                    Ride Code: {selectedFine.relatedRideCode || 'N/A (General Fleet Violation)'}
                  </div>
                  <div className="text-[#6B7280] text-[11px]">Logged by: {selectedFine.createdByAdmin}</div>
                </div>
              </div>

              {/* Administrative Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-[#6B7280]">Administrative Note</span>
                <p className="text-slate-800 text-xs mt-1 leading-relaxed">{selectedFine.note}</p>
              </div>

              {/* Dispute Box if Disputed */}
              {selectedFine.disputeDetails && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-slate-900">Driver Dispute Statement</span>
                  </div>
                  <p className="text-slate-800 text-xs italic">
                    "{selectedFine.disputeDetails.driverExplanation}"
                  </p>
                  <div className="text-[11px] text-[#6B7280] mt-2">
                    Filed on: {selectedFine.disputeDetails.disputedAt} • Status: {selectedFine.disputeDetails.status.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Action Buttons in Review */}
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  {selectedFine.status !== 'waived' && selectedFine.status !== 'refunded' && (
                    <button
                      onClick={() => {
                        setShowReviewModal(false);
                        handleOpenWaive(selectedFine);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold hover:bg-blue-100 transition cursor-pointer"
                    >
                      Waive Fine
                    </button>
                  )}

                  {selectedFine.deductedAmount > 0 && selectedFine.status !== 'refunded' && (
                    <button
                      onClick={() => {
                        setShowReviewModal(false);
                        handleOpenRefund(selectedFine);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-bold hover:bg-purple-100 transition cursor-pointer"
                    >
                      Refund / Reverse Deducted Amount
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: WAIVE FINE */}
      {/* ========================================================================= */}
      {showWaiveModal && selectedFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Waive Fine: {selectedFine.fineCode}</h3>
            <p className="text-xs text-[#6B7280]">
              Waiving removes all remaining outstanding liability for {selectedFine.driverName}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Waiver Justification</label>
              <select
                value={waiveReason}
                onChange={(e) => setWaiveReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
              >
                <option value="First-time offender courtesy waiver">First-time offender courtesy waiver</option>
                <option value="Verified emergency / medical delay">Verified emergency / medical delay</option>
                <option value="Passenger confirmed false alarm">Passenger confirmed false alarm</option>
                <option value="Executive management discretion">Executive management discretion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Administrative Note</label>
              <textarea
                value={waiveNote}
                onChange={(e) => setWaiveNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                placeholder="Details of waiver..."
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowWaiveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  waiveDriverFine(selectedFine.id, waiveReason, waiveNote);
                  setShowWaiveModal(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Confirm Waiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. MODAL: REFUND / REVERSE FINE */}
      {/* ========================================================================= */}
      {showRefundModal && selectedFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Refund / Reverse Fine: {selectedFine.fineCode}</h3>
            <p className="text-xs text-[#6B7280]">
              Credit deducted funds back to {selectedFine.driverName}'s wallet and log a reversal transaction.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Refund Amount (PKR)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedFine.deductedAmount}
                min="1"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none"
              />
              <span className="text-[10px] text-[#6B7280]">Max refundable: PKR {selectedFine.deductedAmount}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Reversal Reason</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Admin Audit Note</label>
              <textarea
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amt = Number(refundAmount);
                  if (amt > 0) {
                    refundDriverFine(selectedFine.id, amt, refundReason, refundNote);
                    setShowRefundModal(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              >
                Execute Reversal &amp; Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. MODAL: RESOLVE DISPUTE */}
      {/* ========================================================================= */}
      {showDisputeModal && selectedFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Resolve Dispute: {selectedFine.fineCode}</h3>
            <p className="text-xs text-[#6B7280]">
              Driver {selectedFine.driverName} disputed this penalty stating extenuating circumstances.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Administrative Decision</label>
              <select
                value={disputeDecision}
                onChange={(e) => setDisputeDecision(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
              >
                <option value="approved">Approve Dispute (Waive Liability &amp; Refund)</option>
                <option value="partial">Partial Adjustment (Refund 50% / Partial Amount)</option>
                <option value="rejected">Reject Dispute (Uphold Fine)</option>
              </select>
            </div>

            {disputeDecision === 'partial' && (
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Partial Refund Amount (PKR)</label>
                <input
                  type="number"
                  value={disputeAdjustmentAmount}
                  onChange={(e) => setDisputeAdjustmentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Decision Justification Note</label>
              <textarea
                value={disputeNote}
                onChange={(e) => setDisputeNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolveDisputeDriverFine(
                    selectedFine.id,
                    disputeDecision,
                    disputeNote,
                    Number(disputeAdjustmentAmount) || 0
                  );
                  setShowDisputeModal(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 cursor-pointer"
              >
                Record Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. MODAL: EDIT AUTOMATIC RULE */}
      {/* ========================================================================= */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Configure Rule: {editingRule.title}</h3>
            <p className="text-xs text-[#6B7280]">
              Updates will create a new rule version and apply to subsequent ride telematics events.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Fine Amount (PKR)</label>
                <input
                  type="number"
                  value={ruleAmountInput}
                  onChange={(e) => setRuleAmountInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Threshold (Count)</label>
                <input
                  type="number"
                  value={ruleThresholdInput}
                  onChange={(e) => setRuleThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Grace Window (Minutes)</label>
              <input
                type="number"
                value={ruleGraceInput}
                onChange={(e) => setRuleGraceInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Reason for Policy Update</label>
              <input
                type="text"
                value={ruleReasonForChange}
                onChange={(e) => setRuleReasonForChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                placeholder="e.g. Adjusted due to Ramadan traffic congestion"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateAutomaticFineRule(
                    editingRule.id,
                    {
                      fineAmount: Number(ruleAmountInput) || editingRule.fineAmount,
                      thresholdCount: Number(ruleThresholdInput) || editingRule.thresholdCount,
                      graceMinutes: Number(ruleGraceInput) || editingRule.graceMinutes
                    },
                    ruleReasonForChange
                  );
                  setEditingRule(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 cursor-pointer"
              >
                Save &amp; Increment Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
