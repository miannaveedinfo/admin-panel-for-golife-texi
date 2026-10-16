import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  SupportCase,
  SupportCaseCategory,
  SupportCasePriority,
  SupportCaseStatus,
  SupportCaseEvidence
} from '../types';
import {
  getCaseTypeBadge,
  getCasePriorityBadge,
  getCaseStatusBadge,
  getSlaBadge
} from '../services/caseManagementService';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  Car,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  Send,
  FileText,
  DollarSign,
  Ban,
  UserX,
  History,
  Lock,
  Radio,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  UploadCloud,
  FileCheck,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const CaseManagementView: React.FC = () => {
  const {
    cases,
    assignCase,
    changeCasePriority,
    addCaseInternalNote,
    addCaseEvidence,
    requestCaseInfo,
    recordCaseUserResponse,
    escalateCase,
    resolveCase,
    rejectCase,
    reopenCase,
    closeCase,
    createSupportCase,
    currentAdmin,
    drivers,
    passengers,
    rides,
    suspendDriver,
    issueDriverWarning,
    addDriverFine,
    processPassengerRefund,
    adjustPassengerWallet,
    adjustDriverWallet,
    showToast,
    openUniversalDetail
  } = useAdmin();

  // Selected Case
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'critical' | 'fare' | 'driver' | 'passenger' | 'waiting' | 'resolved'
  >('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Interactive Action Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedAdminInput, setAssignedAdminInput] = useState('Sarah Tariq');
  const [assignedTeamInput, setAssignedTeamInput] = useState<'support' | 'safety' | 'finance' | 'verification' | 'operations'>('support');
  const [assignNoteInput, setAssignNoteInput] = useState('');

  const [showInternalNoteModal, setShowInternalNoteModal] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState('');

  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [infoTarget, setInfoTarget] = useState<'driver' | 'passenger'>('driver');
  const [infoPromptText, setInfoPromptText] = useState('');

  const [showSimulateResponseModal, setShowSimulateResponseModal] = useState(false);
  const [simulateRespondent, setSimulateRespondent] = useState<'driver' | 'passenger'>('driver');
  const [simulateResponseText, setSimulateResponseText] = useState('');

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('350');
  const [refundReason, setRefundReason] = useState('Disputed ride route discrepancy & toll overcharge reimbursement');

  const [showFineModal, setShowFineModal] = useState(false);
  const [fineAmount, setFineAmount] = useState('1000');
  const [fineReason, setFineReason] = useState('Unauthorized fare negotiation & route deviation');

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionOutcome, setResolutionOutcome] = useState('Partial refund approved & driver conduct warning issued');
  const [resolutionNote, setResolutionNote] = useState('Investigation confirmed discrepancy. Fare adjusted per platform policy.');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('GPS route logs and payment receipts confirm ride was billed accurately.');

  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('High-severity safety allegation requiring executive ops & legal oversight.');

  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState<{
    title: string;
    type: SupportCaseCategory;
    subCategory: string;
    description: string;
    priority: SupportCasePriority;
    city: string;
    driverName: string;
    passengerName: string;
    rideId: string;
  }>({
    title: '',
    type: 'fare_dispute',
    subCategory: 'Overcharge / Toll Discrepancy',
    description: '',
    priority: 'normal',
    city: 'Lahore',
    driverName: '',
    passengerName: '',
    rideId: ''
  });

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = cases.length;
    const critical = cases.filter((c) => c.priority === 'critical' || c.type === 'safety_emergency').length;
    const openDisputes = cases.filter((c) => c.status === 'open' || c.status === 'under_review').length;
    const waiting = cases.filter((c) => c.status === 'waiting_for_driver' || c.status === 'waiting_for_passenger').length;
    const resolved = cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
    return { total, critical, openDisputes, waiting, resolved };
  }, [cases]);

  // Filtered list of cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = c.id.toLowerCase().includes(query) || c.caseNumber.toLowerCase().includes(query);
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesPassenger = c.passenger?.name.toLowerCase().includes(query) || c.passenger?.phone.includes(query);
        const matchesDriver = c.driver?.name.toLowerCase().includes(query) || c.driver?.phone.includes(query);
        const matchesRide = c.ride?.id.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesPassenger && !matchesDriver && !matchesRide) {
          return false;
        }
      }

      // Quick Tabs
      if (activeTabFilter === 'critical') {
        if (c.priority !== 'critical' && c.type !== 'safety_emergency') return false;
      } else if (activeTabFilter === 'fare') {
        if (c.type !== 'fare_dispute' && c.type !== 'payment_refund') return false;
      } else if (activeTabFilter === 'driver') {
        if (c.type !== 'driver_conduct' && c.type !== 'vehicle_condition') return false;
      } else if (activeTabFilter === 'passenger') {
        if (c.type !== 'passenger_conduct') return false;
      } else if (activeTabFilter === 'waiting') {
        if (c.status !== 'waiting_for_driver' && c.status !== 'waiting_for_passenger') return false;
      } else if (activeTabFilter === 'resolved') {
        if (c.status !== 'resolved' && c.status !== 'closed') return false;
      }

      // Secondary filters
      if (categoryFilter !== 'all' && c.type !== categoryFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (cityFilter !== 'all' && c.city !== cityFilter) return false;

      return true;
    });
  }, [cases, searchQuery, activeTabFilter, categoryFilter, priorityFilter, statusFilter, cityFilter]);

  // Handle Quick AI Recommendation Apply
  const applyAiRecommendation = () => {
    if (!activeCase?.aiInsights) return;
    const { recommendedAction, refundRecommendation, fineRecommendation } = activeCase.aiInsights;

    if (refundRecommendation && refundRecommendation > 0) {
      setRefundAmount(refundRecommendation.toString());
      setShowRefundModal(true);
    } else if (fineRecommendation && fineRecommendation > 0) {
      setFineAmount(fineRecommendation.toString());
      setShowFineModal(true);
    } else {
      setResolutionOutcome(recommendedAction);
      setShowResolveModal(true);
    }
  };

  return (
    <div id="central-case-management-root" className="space-y-6">
      {/* 1. Header & Operational Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackToDashboardButton />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500/40 flex items-center justify-center text-slate-950 font-black shadow-xs">
                <ShieldAlert className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <span>Support, Complaints & Case Management Center</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-extrabold border border-amber-300">
                    Phase 48 Unified
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Single central workspace unifying safety emergencies, fare disputes, driver/passenger conduct, lost & found, and support tickets.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="new-support-case-btn"
              type="button"
              onClick={() => setShowCreateCaseModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs border border-amber-500/40"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500">Total Cases</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{metrics.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
            <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Critical / Safety
            </div>
            <div className="text-xl font-black text-rose-800 mt-0.5">{metrics.critical}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80">
            <div className="text-[11px] font-bold text-amber-800">Under Review / Open</div>
            <div className="text-xl font-black text-amber-900 mt-0.5">{metrics.openDisputes}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80">
            <div className="text-[11px] font-bold text-indigo-700">Waiting Response</div>
            <div className="text-xl font-black text-indigo-900 mt-0.5">{metrics.waiting}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-emerald-700">Resolved / Closed</div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">{metrics.resolved}</div>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout: Case List (Left) + Details Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: FILTERS, SEARCH & CASE QUEUE (5 Columns)
           ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case #, ride, driver, passenger, phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTabFilter('all')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeTabFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({cases.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('critical')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  activeTabFilter === 'critical'
                    ? 'bg-rose-600 text-white font-black shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                Safety ({metrics.critical})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('fare')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeTabFilter === 'fare'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Fare Disputes
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('driver')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeTabFilter === 'driver'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('passenger')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeTabFilter === 'passenger'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Passenger
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('waiting')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeTabFilter === 'waiting'
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Waiting ({metrics.waiting})
              </button>
              <button
                type="button"
                onClick={() => setActiveTabFilter('resolved')}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeTabFilter === 'resolved'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resolved
              </button>
            </div>

            {/* Dropdown filters row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-[11px] p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="safety_emergency">Safety & Emergency</option>
                <option value="fare_dispute">Fare Dispute</option>
                <option value="cancellation_dispute">Cancellation Dispute</option>
                <option value="driver_conduct">Driver Conduct</option>
                <option value="passenger_conduct">Passenger Conduct</option>
                <option value="lost_found">Lost & Found</option>
                <option value="vehicle_condition">Vehicle Condition</option>
                <option value="route_gps_issue">Route / GPS Issue</option>
                <option value="payment_refund">Payment / Refund</option>
                <option value="account_document">Account / Document</option>
                <option value="general_support">General Support</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-[11px] p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-[11px] p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>
          </div>

          {/* Case Items List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === activeCase?.id;
              const isCritical = c.priority === 'critical' || c.type === 'safety_emergency';
              const typeBadge = getCaseTypeBadge(c.type);
              const priorityBadge = getCasePriorityBadge(c.priority);
              const statusBadge = getCaseStatusBadge(c.status);
              const slaBadge = getSlaBadge(c.slaStatus);

              return (
                <div
                  key={c.id}
                  id={`case-card-${c.id}`}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-400 shadow-sm ring-1 ring-amber-400/40'
                      : isCritical
                      ? 'bg-white border-rose-300 hover:border-rose-400 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-black text-slate-900">
                        {c.caseNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${typeBadge.className}`}>
                        {typeBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${priorityBadge.className}`}>
                        {priorityBadge.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                    {c.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                      <span className="font-medium text-slate-400">{c.city}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold ${slaBadge.className}`}>
                        {c.currentWaitingHours}h waiting
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 truncate max-w-[90px]">{c.assignedAdmin}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">No matching cases found</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or search queries.</div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: COMPLETE CASE DETAILS WORKSPACE (7 Columns)
           ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {activeCase ? (
            <div className="space-y-4">
              {/* EMERGENCY HIGH-VISIBILITY BANNER (FOR SAFETY & CRITICAL) */}
              {(activeCase.type === 'safety_emergency' || activeCase.priority === 'critical') && (
                <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>CRITICAL SAFETY & EMERGENCY PROTOCOL ACTIVE</span>
                      </div>
                      <div className="text-xs text-rose-100 font-medium mt-0.5">
                        Immediate passenger security, police alert & driver intervention required.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCase.driver) {
                          suspendDriver(activeCase.driver.id, 'Emergency safety investigation suspension', 7, 'critical', true);
                          showToast(`Driver ${activeCase.driver.name} temporarily suspended.`, 'info');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-rose-700 text-xs font-black hover:bg-rose-50 transition cursor-pointer shadow-xs"
                    >
                      Suspend Driver
                    </button>
                    <a
                      href="tel:15"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-black hover:bg-slate-900 transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Rescue 15</span>
                    </a>
                  </div>
                </div>
              )}

              {/* A. CASE HEADER & METRICS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">{activeCase.caseNumber}</span>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${getCaseTypeBadge(activeCase.type).className}`}>
                        {getCaseTypeBadge(activeCase.type).label}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${getCasePriorityBadge(activeCase.priority).className}`}>
                        {getCasePriorityBadge(activeCase.priority).label}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getCaseStatusBadge(activeCase.status).className}`}>
                        {getCaseStatusBadge(activeCase.status).label}
                      </span>
                    </div>

                    <h2 className="text-sm font-black text-slate-950 mt-1.5">{activeCase.title}</h2>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Sub-Category: <strong className="text-slate-700">{activeCase.subCategory}</strong></span>
                      <span>•</span>
                      <span>City: <strong className="text-slate-700">{activeCase.city}</strong></span>
                      <span>•</span>
                      <span>Created: <strong className="text-slate-700">{activeCase.createdAt}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 text-xs font-bold transition cursor-pointer border border-slate-200 flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>Assigned: {activeCase.assignedAdmin}</span>
                    </button>
                  </div>
                </div>

                {/* SLA Timer Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>SLA Target: <strong>{activeCase.targetResolutionHours} hours</strong></span>
                    <span>•</span>
                    <span className={getSlaBadge(activeCase.slaStatus).className}>
                      {activeCase.currentWaitingHours} hrs elapsed ({getSlaBadge(activeCase.slaStatus).label})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Team:</span>
                    <span className="font-extrabold uppercase text-slate-700 px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">
                      {activeCase.assignedTeam} Desk
                    </span>
                  </div>
                </div>
              </div>

              {/* B. PARTIES INVOLVED (PASSENGER & DRIVER) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>Parties Involved & Fast Contact</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Passenger Card */}
                  {activeCase.passenger ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-950 font-black flex items-center justify-center text-xs">
                            P
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">{activeCase.passenger.name}</div>
                            <div className="text-[10px] text-slate-500">Passenger</div>
                          </div>
                        </div>
                        <div className="text-right text-[10px]">
                          <div className="font-bold text-amber-700">★ {activeCase.passenger.rating || '4.9'}</div>
                          <div className="text-slate-400">{activeCase.passenger.totalRides || 24} rides</div>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                        <span>{activeCase.passenger.phone}</span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center gap-1.5">
                        <a
                          href={`tel:${activeCase.passenger.phone}`}
                          className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 text-[10px] font-bold text-slate-800 text-center flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${activeCase.passenger.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold text-emerald-800 text-center flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setInfoTarget('passenger');
                            setShowRequestInfoModal(true);
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 text-center cursor-pointer"
                        >
                          SMS Prompt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 flex items-center justify-center">
                      No passenger associated
                    </div>
                  )}

                  {/* Driver Card */}
                  {activeCase.driver ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-black flex items-center justify-center text-xs">
                            D
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">{activeCase.driver.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {activeCase.driver.vehicle || 'Suzuki Alto • LEB-4819'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-[10px]">
                          <div className="font-bold text-amber-700">★ {activeCase.driver.rating || '4.8'}</div>
                          <div className="text-slate-400">{activeCase.driver.totalRides || 342} trips</div>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                        <span>{activeCase.driver.phone}</span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center gap-1.5">
                        <a
                          href={`tel:${activeCase.driver.phone}`}
                          className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 text-[10px] font-bold text-slate-800 text-center flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${activeCase.driver.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold text-emerald-800 text-center flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setInfoTarget('driver');
                            setShowRequestInfoModal(true);
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 text-center cursor-pointer"
                        >
                          SMS Prompt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 flex items-center justify-center">
                      No driver associated
                    </div>
                  )}
                </div>
              </div>

              {/* C. ASSOCIATED RIDE DETAILS */}
              {activeCase.ride && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                      <span>Associated Ride Dossier</span>
                    </h3>
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {activeCase.ride.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-slate-400">Total Fare:</div>
                      <div className="font-black text-slate-900">PKR {activeCase.ride.fare}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Driver Share:</div>
                      <div className="font-bold text-slate-700">PKR {activeCase.ride.driverEarnings}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Commission:</div>
                      <div className="font-bold text-slate-700">PKR {activeCase.ride.commission}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Payment Method:</div>
                      <div className="font-bold text-slate-700">{activeCase.ride.paymentMethod}</div>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[11px] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <span className="text-slate-500 shrink-0">Pickup:</span>
                      <span className="font-medium text-slate-800">{activeCase.ride.pickup}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <span className="text-slate-500 shrink-0">Dropoff:</span>
                      <span className="font-medium text-slate-800">{activeCase.ride.dropoff}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* D. CASE DESCRIPTION, EVIDENCE & AI CO-PILOT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description & Evidence */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Complaint Text & Evidence</span>
                  </h3>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                    "{activeCase.description}"
                  </div>

                  {/* Evidence list */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                      <span>Attached Evidence ({activeCase.evidence.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const title = prompt('Enter evidence title:');
                          if (title) {
                            addCaseEvidence(activeCase.id, {
                              type: 'document',
                              title,
                              url: '#',
                              description: 'Manual evidence uploaded by admin.'
                            });
                          }
                        }}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Evidence</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {activeCase.evidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold uppercase text-slate-600">
                              {ev.type}
                            </span>
                            <span className="font-semibold text-slate-800">{ev.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{(ev.uploadedAt || '').split(' ')[0] || 'N/A'}</span>
                        </div>
                      ))}

                      {activeCase.evidence.length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                          No uploaded photos or documents yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Case Co-Pilot Panel */}
                <div className="bg-linear-to-br from-amber-50/50 to-amber-100/30 rounded-2xl border border-amber-200/80 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>AI Case Co-Pilot (Advisory Only)</span>
                    </h3>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-950 border border-amber-300">
                      Policy v48
                    </span>
                  </div>

                  {activeCase.aiInsights ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                        <div className="text-[10px] font-bold text-slate-500">Summary:</div>
                        <div className="text-slate-800 font-medium mt-0.5">
                          {activeCase.aiInsights.summary}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                        <div className="text-[10px] font-bold text-slate-500">Policy Recommendation:</div>
                        <div className="text-amber-950 font-bold mt-0.5">
                          {activeCase.aiInsights.recommendedAction}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-white/80 border border-amber-200">
                          <div className="text-slate-400">Risk Assessment:</div>
                          <div className="font-extrabold text-slate-800">
                            {activeCase.aiInsights.riskAssessment}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/80 border border-amber-200">
                          <div className="text-slate-400">Repeat Offender:</div>
                          <div className="font-extrabold text-slate-800">
                            {activeCase.aiInsights.repeatOffenderProbability}%
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-300 text-[11px]">
                        <div className="font-bold text-amber-950">Recommended Financial Outcome:</div>
                        <div className="text-amber-900 mt-0.5">
                          {activeCase.aiInsights.refundRecommendation
                            ? `Passenger Refund: PKR ${activeCase.aiInsights.refundRecommendation}`
                            : activeCase.aiInsights.fineRecommendation
                            ? `Driver Fine: PKR ${activeCase.aiInsights.fineRecommendation}`
                            : 'No direct financial adjustment advised.'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={applyAiRecommendation}
                        className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pre-fill Action from AI Recommendation</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      AI analysis not generated for this case.
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 italic">
                    * AI provides recommendations only. All financial & disciplinary actions require human admin confirmation.
                  </div>
                </div>
              </div>

              {/* E. ACTION CENTER (ADMIN CONTROL) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>Action Center (Authorized Admin Control)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Executor: <strong>{currentAdmin?.name || 'Administrator'}</strong>
                  </span>
                </div>

                {/* Primary Action Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(true)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Issue Refund</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFineModal(true)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-800 hover:text-rose-900 text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Ban className="w-4 h-4 text-rose-600" />
                    <span>Issue Driver Fine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeCase.driver) {
                        suspendDriver(activeCase.driver.id, 'Disciplinary action from case investigation', 3, 'moderate', true);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-800 hover:text-amber-950 text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <UserX className="w-4 h-4 text-amber-600" />
                    <span>Suspend Driver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeCase.driver) {
                        issueDriverWarning(activeCase.driver.id, 'Investigation warning issued regarding conduct / route rules', 'medium');
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Issue Warning</span>
                  </button>
                </div>

                {/* Secondary Actions Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setInfoTarget('driver');
                      setShowRequestInfoModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Inquire Driver
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInfoTarget('passenger');
                      setShowRequestInfoModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Inquire Passenger
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSimulateResponseModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Simulate User Response</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInternalNoteModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add Internal Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    Escalate Case
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition cursor-pointer"
                    >
                      Reject Case
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowResolveModal(true)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* F. INTERNAL NOTES & TIMELINE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Confidential Internal Notes */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Internal Notes ({activeCase.internalNotes.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowInternalNoteModal(true)}
                      className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Note</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeCase.internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-bold text-slate-700">{note.author} ({note.authorRole})</span>
                          <span>{(note.createdAt || '').split(' ')[0] || 'N/A'}</span>
                        </div>
                        <p className="text-slate-800">{note.text}</p>
                      </div>
                    ))}

                    {activeCase.internalNotes.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                        No private admin notes recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Chronological Investigation Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Investigation Timeline</span>
                  </h3>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {activeCase.timeline.map((ev, idx) => (
                      <div key={ev.id || idx} className="flex items-start gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-900">{ev.action}</span>
                            <span className="text-slate-400">{(ev.timestamp || '').split(' ')[0] || 'N/A'}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{ev.note}</div>
                          <div className="text-[9px] text-slate-400">{ev.actor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select a case from the queue to view details.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODALS FOR ACTIONS
         ======================================================== */}

      {/* 1. Assign Admin Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">Assign Case to Administrator / Desk</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Assignee Name</label>
                <input
                  type="text"
                  value={assignedAdminInput}
                  onChange={(e) => setAssignedAdminInput(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Department / Team</label>
                <select
                  value={assignedTeamInput}
                  onChange={(e) => setAssignedTeamInput(e.target.value as any)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                >
                  <option value="support">Customer Support</option>
                  <option value="safety">Safety & Incident Response</option>
                  <option value="finance">Finance & Settlements</option>
                  <option value="verification">Driver Verification</option>
                  <option value="operations">Fleet Operations</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Assignment Note</label>
                <textarea
                  value={assignNoteInput}
                  onChange={(e) => setAssignNoteInput(e.target.value)}
                  placeholder="Instructions for the assigned team member..."
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-20 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  assignCase(activeCase.id, assignedAdminInput, assignedTeamInput, assignNoteInput);
                  setShowAssignModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Internal Note Modal */}
      {showInternalNoteModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Add Confidential Internal Admin Note</span>
            </h3>

            <div>
              <textarea
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="Enter private investigation notes, evidence audit remarks, or policy directives (invisible to users)..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 h-28 resize-none text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInternalNoteModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (internalNoteText.trim()) {
                    addCaseInternalNote(activeCase.id, internalNoteText);
                    setInternalNoteText('');
                    setShowInternalNoteModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Save Private Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Request Information Modal */}
      {showRequestInfoModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Request Information from {infoTarget === 'driver' ? 'Driver' : 'Passenger'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Recipient Phone</label>
                <input
                  type="text"
                  readOnly
                  value={infoTarget === 'driver' ? activeCase.driver?.phone : activeCase.passenger?.phone}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Inquiry Message / In-App Prompt</label>
                <textarea
                  value={infoPromptText}
                  onChange={(e) => setInfoPromptText(e.target.value)}
                  placeholder="e.g. Please clarify your dropoff location and submit parking receipt photo..."
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-24 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRequestInfoModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  requestCaseInfo(activeCase.id, infoTarget, infoPromptText || 'Clarification required.');
                  setShowRequestInfoModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
              >
                Dispatch Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Simulate User Response Modal */}
      {showSimulateResponseModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900">Simulate Response from User</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Responding Party</label>
                <select
                  value={simulateRespondent}
                  onChange={(e) => setSimulateRespondent(e.target.value as any)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                >
                  <option value="driver">Driver: {activeCase.driver?.name || 'Driver'}</option>
                  <option value="passenger">Passenger: {activeCase.passenger?.name || 'Passenger'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Response Text</label>
                <textarea
                  value={simulateResponseText}
                  onChange={(e) => setSimulateResponseText(e.target.value)}
                  placeholder="I have provided the toll slip and took the alternate route due to construction..."
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-24 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSimulateResponseModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (simulateResponseText.trim()) {
                    recordCaseUserResponse(activeCase.id, simulateRespondent, simulateResponseText);
                    setSimulateResponseText('');
                    setShowSimulateResponseModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Record Response
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Issue Refund Modal (Phase 42 Financial Integration) */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Issue Passenger Refund (Phase 42 Integration)</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Passenger</label>
                <input
                  type="text"
                  readOnly
                  value={`${activeCase.passenger?.name || 'Passenger'} (${activeCase.passenger?.phone || ''})`}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Refund Amount (PKR)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Reason & Audit Justification</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-20 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = parseFloat(refundAmount) || 0;
                  if (activeCase.passenger && num > 0) {
                    processPassengerRefund({
                      passengerId: activeCase.passenger.id,
                      passengerName: activeCase.passenger.name,
                      passengerPhone: activeCase.passenger.phone,
                      rideId: activeCase.ride?.id,
                      rideCode: activeCase.ride?.id ? `RD-${activeCase.ride.id.slice(-4)}` : 'N/A',
                      originalFare: num,
                      paidAmount: num,
                      previousRefunds: 0,
                      refundType: 'partial',
                      amount: num,
                      paymentMethod: 'wallet',
                      refundDestination: 'wallet_credit',
                      reason: refundReason,
                      note: `Refund for Case ${activeCase.caseNumber}: ${refundReason}`
                    });
                    addCaseInternalNote(activeCase.id, `Passenger refund of PKR ${num} processed via Financial Ledger.`);
                    setShowRefundModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Disburse Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Issue Driver Fine Modal (Phase 41 Integration) */}
      {showFineModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Issue Driver Fine / Penalty (Phase 41 Integration)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Driver</label>
                <input
                  type="text"
                  readOnly
                  value={`${activeCase.driver?.name || 'Driver'} (${activeCase.driver?.phone || ''})`}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Fine Amount (PKR)</label>
                <input
                  type="number"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Fine Violation Reason</label>
                <textarea
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-20 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFineModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = parseFloat(fineAmount) || 0;
                  if (activeCase.driver && num > 0) {
                    addDriverFine({
                      driverId: activeCase.driver.id,
                      amount: num,
                      reasonId: 'route_deviation',
                      relatedRideId: activeCase.ride?.id,
                      relatedRideCode: activeCase.ride?.id ? `RD-${activeCase.ride.id.slice(-4)}` : undefined,
                      note: `Fine for Case ${activeCase.caseNumber}: ${fineReason}`,
                      source: 'manual_admin',
                      deductionMethod: 'driver_wallet'
                    });
                    addCaseInternalNote(activeCase.id, `Driver fine of PKR ${num} issued and ledger deduction recorded.`);
                    setShowFineModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Impose Fine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Resolve Case Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark Case as Resolved</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Resolution Outcome Summary</label>
                <input
                  type="text"
                  value={resolutionOutcome}
                  onChange={(e) => setResolutionOutcome(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Detailed Investigation & Resolution Notes</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-24 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resolveCase(activeCase.id, resolutionOutcome, resolutionNote, true);
                  setShowResolveModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Reject Case Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Case / Dispute</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700">Rejection Justification</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-24 resize-none text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectCase(activeCase.id, rejectReason);
                  setShowRejectModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Escalate Case Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Escalate Case to Senior Oversight / Legal</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700">Escalation Reason</label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-24 resize-none text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  escalateCase(activeCase.id, escalateReason);
                  setShowEscalateModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Create New Case Modal */}
      {showCreateCaseModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-slate-900">Initiate New Central Support Case</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Case Title</label>
                <input
                  type="text"
                  placeholder="e.g. Passenger overcharged for Ring Road toll"
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, title: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newCaseForm.type}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, type: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="safety_emergency">Safety & Emergency</option>
                    <option value="fare_dispute">Fare Dispute</option>
                    <option value="cancellation_dispute">Cancellation Dispute</option>
                    <option value="driver_conduct">Driver Conduct</option>
                    <option value="passenger_conduct">Passenger Conduct</option>
                    <option value="lost_found">Lost & Found</option>
                    <option value="vehicle_condition">Vehicle Condition</option>
                    <option value="route_gps_issue">Route / GPS Issue</option>
                    <option value="payment_refund">Payment / Refund</option>
                    <option value="account_document">Account / Document</option>
                    <option value="general_support">General Support</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={newCaseForm.priority}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, priority: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="critical">Critical (Immediate)</option>
                    <option value="urgent">Urgent</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Sub-Category</label>
                <input
                  type="text"
                  value={newCaseForm.subCategory}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, subCategory: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700">City</label>
                  <select
                    value={newCaseForm.city}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, city: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Ride ID (optional)</label>
                  <input
                    type="text"
                    placeholder="RIDE-XXXX"
                    value={newCaseForm.rideId}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, rideId: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Passenger Name</label>
                  <input
                    type="text"
                    placeholder="Passenger name"
                    value={newCaseForm.passengerName}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, passengerName: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Description & Incident Details</label>
                <textarea
                  value={newCaseForm.description}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, description: e.target.value })}
                  placeholder="Provide complete facts of the case..."
                  className="w-full mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 h-20 resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateCaseModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newCaseForm.title.trim()) {
                    createSupportCase({
                      title: newCaseForm.title,
                      type: newCaseForm.type,
                      subCategory: newCaseForm.subCategory,
                      priority: newCaseForm.priority,
                      city: newCaseForm.city,
                      description: newCaseForm.description,
                      passenger: newCaseForm.passengerName ? {
                        id: 'p-custom',
                        name: newCaseForm.passengerName,
                        phone: '+92 300 1234567',
                        rating: 4.9,
                        totalRides: 12
                      } : undefined,
                      ride: newCaseForm.rideId ? {
                        id: newCaseForm.rideId,
                        pickup: 'Gulberg III, Lahore',
                        dropoff: 'DHA Phase 5, Lahore',
                        fare: 650,
                        driverEarnings: 550,
                        commission: 100,
                        status: 'completed',
                        paymentMethod: 'Cash',
                        completedAt: 'Today'
                      } : undefined
                    });
                    setShowCreateCaseModal(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
