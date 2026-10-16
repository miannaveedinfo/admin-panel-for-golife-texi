import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  DriverPayoutRecord,
  PayoutTransactionRecord,
  SettlementPeriodFilter,
  DriverFinancialBalance,
  DriverPeriodSettlementSummary,
  AiPayoutAnomaly
} from '../../types';
import {
  calculateDriverFinancialBalance,
  calculateDriverPeriodSettlement,
  calculatePlatformRevenue,
  validatePayoutRequest
} from '../../services/payoutSettlementService';
import { DEFAULT_CENTRAL_PRICING_RULE } from '../../services/pricingEngine';
import { formatPKR } from '../../utils/i18n';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Smartphone,
  Check,
  X,
  PlusCircle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Play,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const PayoutsSettlementsView: React.FC = () => {
  const {
    driverPayouts,
    payoutTransactions,
    payoutConfig,
    updatePayoutConfig,
    aiPayoutAnomalies,
    dismissAiPayoutAnomaly,
    requestDriverWithdrawal,
    payoutControlAction,
    runScheduledAutoPayoutBatch,
    drivers,
    fines,
    financialAdjustments,
    rides,
    passengerRefunds,
    driverReimbursements,
    centralPricingRule,
    currentAdmin,
    showToast,
    openUniversalDetail
  } = useAdmin();

  const centralPricing = (useAdmin() as any).centralPricing || centralPricingRule || DEFAULT_CENTRAL_PRICING_RULE;

  // Internal Tabs
  const [activeTab, setActiveTab] = useState<
    'requests' | 'settlements' | 'balances' | 'transactions' | 'ai_watchdog' | 'settings'
  >('requests');

  // Search & Filters for Requests
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Settlement Period Filter (Single Unified System: Daily, Weekly, Monthly, Yearly)
  const [settlementPeriod, setSettlementPeriod] = useState<SettlementPeriodFilter>('Daily');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [settlementCity, setSettlementCity] = useState('all');

  // Driver Balances Search
  const [balanceSearch, setBalanceSearch] = useState('');

  // Transaction Ledger Filter
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>('all');

  // Modals
  const [showNewWithdrawalModal, setShowNewWithdrawalModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<DriverPayoutRecord | null>(null);

  // Action Confirmation Modals (Approve, Process, Complete, Reject, Cancel)
  const [activeAction, setActiveAction] = useState<'approve' | 'process' | 'complete' | 'reject' | 'cancel' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionRefId, setActionRefId] = useState('');
  const [actionRejectReason, setActionRejectReason] = useState('Account title mismatch with CNIC records');

  // Automated Batch Modal
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Statement View Modal
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedSettlementDriver, setSelectedSettlementDriver] = useState<DriverPeriodSettlementSummary | null>(null);

  // Form State for New Withdrawal
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('5000');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank' | 'SadaPay' | 'NayaPay'>('JazzCash');
  const [accountTitle, setAccountTitle] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Habib Bank Limited (HBL)');
  const [optionalNote, setOptionalNote] = useState<string>('Manual withdrawal requested via Admin Settlement Desk');

  // Computed Financial Balances for All Drivers
  const driverBalances: DriverFinancialBalance[] = useMemo(() => {
    return drivers.map((d) =>
      calculateDriverFinancialBalance(d, fines, financialAdjustments, driverPayouts, rides, payoutConfig)
    );
  }, [drivers, fines, financialAdjustments, driverPayouts, rides, payoutConfig]);

  // Active Selected Driver for New Withdrawal
  const currentSelectedDriver = useMemo(() => {
    return drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  }, [drivers, selectedDriverId]);

  const currentSelectedBalance = useMemo(() => {
    if (!currentSelectedDriver) return null;
    return calculateDriverFinancialBalance(
      currentSelectedDriver,
      fines,
      financialAdjustments,
      driverPayouts,
      rides,
      payoutConfig
    );
  }, [currentSelectedDriver, fines, financialAdjustments, driverPayouts, rides, payoutConfig]);

  // When selectedDriverId changes, pre-fill account title and phone
  const handleDriverSelect = (driverId: string) => {
    setSelectedDriverId(driverId);
    const d = drivers.find((x) => x.id === driverId);
    if (d) {
      setAccountTitle(d.name);
      setAccountNumber(d.phone);
    }
  };

  // Filtered Payout Requests
  const filteredPayouts = useMemo(() => {
    return driverPayouts.filter((p) => {
      const matchSearch =
        !requestSearch ||
        p.driverName.toLowerCase().includes(requestSearch.toLowerCase()) ||
        p.driverPhone.includes(requestSearch) ||
        p.id.toLowerCase().includes(requestSearch.toLowerCase()) ||
        (p.referenceId && p.referenceId.toLowerCase().includes(requestSearch.toLowerCase())) ||
        p.accountNumber.includes(requestSearch);

      const matchStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
      const matchMethod = methodFilter === 'all' || p.paymentMethod.toLowerCase() === methodFilter.toLowerCase();
      const matchCity = cityFilter === 'all' || p.driverCity.toLowerCase() === cityFilter.toLowerCase();

      return matchSearch && matchStatus && matchMethod && matchCity;
    });
  }, [driverPayouts, requestSearch, statusFilter, methodFilter, cityFilter]);

  // Financial Metrics
  const totalCompletedPayouts = driverPayouts
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRequests = driverPayouts.filter((p) => p.status === 'Pending');
  const totalPendingAmount = pendingRequests.reduce((sum, p) => sum + p.amount, 0);

  const processingRequests = driverPayouts.filter((p) => p.status === 'Processing' || p.status === 'Approved');
  const totalProcessingAmount = processingRequests.reduce((sum, p) => sum + p.amount, 0);

  // Settlement Summaries across Drivers for selected period
  const settlementSummaries: DriverPeriodSettlementSummary[] = useMemo(() => {
    return drivers.map((driver) =>
      calculateDriverPeriodSettlement(
        driver,
        settlementPeriod,
        rides,
        fines,
        passengerRefunds,
        driverReimbursements,
        financialAdjustments,
        driverPayouts,
        centralPricing
      )
    );
  }, [
    drivers,
    settlementPeriod,
    rides,
    fines,
    passengerRefunds,
    driverReimbursements,
    financialAdjustments,
    driverPayouts,
    centralPricing
  ]);

  const filteredSettlements = useMemo(() => {
    return settlementSummaries.filter((s) => {
      const matchSearch =
        !settlementSearch ||
        s.driverName.toLowerCase().includes(settlementSearch.toLowerCase()) ||
        s.driverPhone.includes(settlementSearch) ||
        s.driverPlate.toLowerCase().includes(settlementSearch.toLowerCase());
      const matchCity = settlementCity === 'all' || s.city.toLowerCase() === settlementCity.toLowerCase();
      return matchSearch && matchCity;
    });
  }, [settlementSummaries, settlementSearch, settlementCity]);

  // Platform Revenue Summary for Settlement Period
  const platformRevenue = useMemo(() => {
    return calculatePlatformRevenue(
      settlementPeriod,
      rides,
      centralPricing,
      passengerRefunds,
      driverReimbursements
    );
  }, [settlementPeriod, rides, centralPricing, passengerRefunds, driverReimbursements]);

  // Handlers
  const handleOpenActionModal = (
    payout: DriverPayoutRecord,
    action: 'approve' | 'process' | 'complete' | 'reject' | 'cancel'
  ) => {
    setSelectedPayout(payout);
    setActiveAction(action);
    setActionNote('');
    if (action === 'process' || action === 'complete') {
      setActionRefId(payout.referenceId || `REF-${payout.paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleExecuteAction = () => {
    if (!selectedPayout || !activeAction) return;

    payoutControlAction(selectedPayout.id, activeAction, {
      referenceId: actionRefId,
      note: actionNote,
      reason: actionRejectReason
    });

    setActiveAction(null);
    setSelectedPayout(null);
    setShowReviewModal(false);
  };

  const handleSubmitNewWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedDriver || !currentSelectedBalance) return;

    const amt = Number(withdrawalAmount);
    const validation = validatePayoutRequest(currentSelectedDriver, amt, driverPayouts, payoutConfig, fines, financialAdjustments);

    if (!validation.isValid) {
      const errorMsg = validation.checks.find((c) => !c.passed)?.message || 'Invalid payout request';
      showToast(errorMsg, 'error');
      return;
    }

    requestDriverWithdrawal({
      driverId: currentSelectedDriver.id,
      amount: amt,
      paymentMethod: withdrawalMethod,
      accountTitle: accountTitle || currentSelectedDriver.name,
      accountNumber: accountNumber || currentSelectedDriver.phone,
      bankName: withdrawalMethod === 'Bank' ? bankName : undefined,
      optionalNote
    });

    setShowNewWithdrawalModal(false);
  };

  // CSV Export for Settlements
  const handleExportSettlementCSV = () => {
    const headers = [
      'Driver Name',
      'Phone',
      'Plate',
      'City',
      'Period',
      'Total Rides',
      'Gross (PKR)',
      'Commission (PKR)',
      'Service Charges (PKR)',
      'Fines (PKR)',
      'Refunds (PKR)',
      'Reimbursements (PKR)',
      'Net Earnings (PKR)',
      'Paid Out (PKR)',
      'Closing Balance (PKR)',
      'Reconciliation'
    ];

    const rows = filteredSettlements.map((s) => [
      `"${s.driverName}"`,
      `"${s.driverPhone}"`,
      `"${s.driverPlate}"`,
      `"${s.city}"`,
      `"${s.periodLabel}"`,
      s.totalRides,
      s.grossEarnings,
      s.commission,
      s.serviceCharges,
      s.fines,
      s.refunds,
      s.reimbursements,
      s.netEarnings,
      s.payoutsAmount,
      s.closingBalance,
      `"${s.reconciliationStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GoLife_Settlement_${settlementPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Settlement ${settlementPeriod} CSV exported successfully`, 'success');
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Top Banner & Control Deck Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-5 rounded-2xl shadow-sm border border-amber-300 text-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BackToDashboardButton />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black text-amber-300">
                Phase 43 Treasury Engine
              </span>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                Verified Multi-Period Settlement Desk
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 mt-1">
              Driver Payout, Withdrawal &amp; Settlement Control
            </h2>
            <p className="text-xs font-semibold text-slate-800 mt-0.5 max-w-2xl">
              Single central authority managing driver payouts, on-demand withdrawal requests, daily/weekly/monthly/yearly settlements, and automated banking disbursements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-run-auto-payout-batch"
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            Run Auto-Payout Batch
          </button>

          <button
            id="btn-request-driver-withdrawal"
            onClick={() => {
              if (drivers[0]) {
                handleDriverSelect(drivers[0].id);
              }
              setShowNewWithdrawalModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-slate-950 border border-amber-600/30 text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            New Withdrawal Request
          </button>
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Requests</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                {pendingRequests.length} in queue
              </span>
            </div>
            <div className="text-2xl font-black text-slate-950 font-mono mt-1">
              {formatPKR(totalPendingAmount)}
            </div>
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Awaiting Admin review &amp; approval
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>In Processing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                {processingRequests.length} approved
              </span>
            </div>
            <div className="text-2xl font-black text-blue-700 font-mono mt-1">
              {formatPKR(totalProcessingAmount)}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            Disbursing through 1LINK &amp; Telco gateways
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Total Disbursed (Settled)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                {driverPayouts.filter((p) => p.status === 'Completed').length} records
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
              {formatPKR(totalCompletedPayouts)}
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Reconciled with central treasury ledger
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Payout Schedule</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 uppercase">
                {payoutConfig.payoutSchedule}
              </span>
            </div>
            <div className="text-lg font-black text-white font-mono mt-1">
              Min: {formatPKR(payoutConfig.minimumPayoutAmount)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Auto-Approve &lt; {formatPKR(payoutConfig.autoApprovalThreshold)}</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-amber-400 hover:text-amber-300 font-bold text-[11px] underline cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Phase 43 Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="subtab-payout-requests"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'requests'
              ? 'bg-slate-950 text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Withdrawal Requests &amp; Payout Queue</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          id="subtab-settlements-unified"
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'settlements'
              ? 'bg-slate-950 text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Settlements (Daily / Weekly / Monthly / Yearly)</span>
        </button>

        <button
          id="subtab-driver-balances"
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'balances'
              ? 'bg-slate-950 text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Driver Payable Balances</span>
        </button>

        <button
          id="subtab-payout-transactions"
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'transactions'
              ? 'bg-slate-950 text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Disbursement Transaction Ledger</span>
        </button>

        <button
          id="subtab-ai-payout-watchdog"
          onClick={() => setActiveTab('ai_watchdog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'ai_watchdog'
              ? 'bg-slate-950 text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Payout Watchdog</span>
          {aiPayoutAnomalies.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
              {aiPayoutAnomalies.length}
            </span>
          )}
        </button>

        <button
          id="subtab-payout-settings"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'settings'
              ? 'bg-slate-950 text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Payout Policies &amp; Rules</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WITHDRAWAL REQUESTS & PAYOUT QUEUE               */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by driver name, phone, payout ID, reference ID..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-800"
                >
                  <option value="all">All Statuses ({driverPayouts.length})</option>
                  <option value="Pending">Pending ({pendingRequests.length})</option>
                  <option value="Approved">Approved</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Method:</span>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-800"
                >
                  <option value="all">All Gateways</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="SadaPay">SadaPay</option>
                  <option value="NayaPay">NayaPay</option>
                </select>
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>City:</span>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-800"
                >
                  <option value="all">All Pakistan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900">{filteredPayouts.length}</span> of {driverPayouts.length} records
            </div>
          </div>

          {/* Payout Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                    <th className="py-3 px-4">Payout ID / Date</th>
                    <th className="py-3 px-4">Driver Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method &amp; Account</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No payout or withdrawal requests match the active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => {
                      const isPending = p.status === 'Pending';
                      const isApproved = p.status === 'Approved';
                      const isProcessing = p.status === 'Processing';
                      const isCompleted = p.status === 'Completed';

                      let badgeClass = 'bg-slate-100 text-slate-700';
                      if (p.status === 'Pending') badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300';
                      else if (p.status === 'Approved') badgeClass = 'bg-sky-100 text-sky-900 border border-sky-300';
                      else if (p.status === 'Processing') badgeClass = 'bg-blue-100 text-blue-900 border border-blue-300';
                      else if (p.status === 'Completed') badgeClass = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
                      else if (p.status === 'Rejected' || p.status === 'Failed') badgeClass = 'bg-rose-100 text-rose-900 border border-rose-300';

                      return (
                        <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">{p.id}</div>
                            <div className="text-[11px] text-slate-500">{p.requestedAt}</div>
                            {p.payoutPeriod && (
                              <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                                Period: {p.payoutPeriod}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => openUniversalDetail('driver', p.driverId)}
                              className="font-bold text-slate-900 hover:text-amber-600 text-left flex items-center gap-1 cursor-pointer"
                            >
                              <span>{p.driverName}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {p.driverPhone} • {p.driverCity}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Plate: {p.driverPlate}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono font-black text-sm text-slate-900">
                              {formatPKR(p.amount)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Fee: {formatPKR(p.feeDeducted || 0)}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              {p.paymentMethod === 'Bank' ? (
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span>{p.paymentMethod}</span>
                              {p.bankName && <span className="text-[10px] text-slate-500">({p.bankName})</span>}
                            </div>
                            <div className="text-[11px] text-slate-700 font-mono mt-0.5">
                              {p.accountTitle}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              A/C: {p.accountNumber}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${badgeClass}`}>
                              {p.status}
                            </span>
                            {p.rejectionReason && (
                              <div className="text-[10px] text-rose-700 mt-1 max-w-[150px] truncate" title={p.rejectionReason}>
                                Reason: {p.rejectionReason}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            {p.referenceId ? (
                              <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                                {p.referenceId}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Review Button */}
                              <button
                                onClick={() => {
                                  setSelectedPayout(p);
                                  setShowReviewModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Review complete audit trail and driver standing"
                              >
                                <Eye className="w-3 h-3" />
                                Review
                              </button>

                              {/* Lifecycle Action Buttons */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleOpenActionModal(p, 'approve')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    title="Approve withdrawal and deduct from driver wallet"
                                  >
                                    <Check className="w-3 h-3" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenActionModal(p, 'reject')}
                                    className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    title="Reject withdrawal and refund to wallet"
                                  >
                                    <X className="w-3 h-3" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <button
                                  onClick={() => handleOpenActionModal(p, 'process')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                  title="Dispatch to 1LINK/Telco Gateway"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Process
                                </button>
                              )}

                              {isProcessing && (
                                <button
                                  onClick={() => handleOpenActionModal(p, 'complete')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                  title="Confirm funds deposited in driver bank/wallet"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Complete
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

      {/* ======================================================== */}
      {/* TAB 2: UNIFIED SETTLEMENTS (DAILY/WEEKLY/MONTHLY/YEARLY) */}
      {/* ======================================================== */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          {/* Settlement Control Bar with Unified Period Switcher */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-amber-500" />
                Settlement Period:
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as SettlementPeriodFilter[]).map((period) => (
                  <button
                    key={period}
                    id={`btn-settlement-period-${period.toLowerCase()}`}
                    onClick={() => setSettlementPeriod(period)}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                      settlementPeriod === period
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {period} Settlement
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportSettlementCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Export {settlementPeriod} Statement (CSV)
              </button>
            </div>
          </div>

          {/* Platform Revenue & Commission Overview for Selected Period */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Central Platform Revenue Breakdown — {settlementPeriod} Period
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reconciled across ride fares, platform commissions, passenger service charges, driver fees, and system refunds
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {platformRevenue.period}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Rides</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{platformRevenue.totalRides}</div>
                <div className="text-[10px] text-slate-400">Completed trips</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Gross Ride Value</div>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {formatPKR(platformRevenue.grossRideValue)}
                </div>
                <div className="text-[10px] text-slate-400">Customer billings</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Platform Cut</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {formatPKR(platformRevenue.platformCommission)}
                </div>
                <div className="text-[10px] text-emerald-400/80">
                  {centralPricing.platformCommission?.amount || 17}% commission
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Service Fees</div>
                <div className="text-lg font-black text-sky-400 font-mono mt-0.5">
                  {formatPKR(platformRevenue.passengerServiceCharges + platformRevenue.driverServiceCharges)}
                </div>
                <div className="text-[10px] text-slate-400">Passenger + Driver fees</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-400">Refunds &amp; Fines</div>
                <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                  -{formatPKR(platformRevenue.refundsTotal)}
                </div>
                <div className="text-[10px] text-rose-400/80">Reversals deducted</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30">
                <div className="text-[10px] uppercase font-black text-amber-300">Net Platform Revenue</div>
                <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                  {formatPKR(platformRevenue.netPlatformRevenue)}
                </div>
                <div className="text-[10px] text-amber-300/80">Retained treasury</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar for Drivers */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter driver name, phone, plate in settlement..."
                  value={settlementSearch}
                  onChange={(e) => setSettlementSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>City:</span>
                <select
                  value={settlementCity}
                  onChange={(e) => setSettlementCity(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-800"
                >
                  <option value="all">All Pakistan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {filteredSettlements.length} drivers reconciled for <span className="text-amber-700 font-black">{settlementPeriod}</span>
            </div>
          </div>

          {/* Driver Settlement Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                    <th className="py-3 px-4">Driver Profile</th>
                    <th className="py-3 px-4">Rides</th>
                    <th className="py-3 px-4">Gross Earnings</th>
                    <th className="py-3 px-4">Commission &amp; Fees</th>
                    <th className="py-3 px-4">Fines / Adjustments</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Settled (Paid)</th>
                    <th className="py-3 px-4">Closing Balance</th>
                    <th className="py-3 px-4">Audit Status</th>
                    <th className="py-3 px-4 text-right">Statement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSettlements.map((s) => (
                    <tr key={s.driverId} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.driverName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.driverPhone} • {s.city}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Plate: {s.driverPlate}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {s.totalRides}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatPKR(s.grossEarnings)}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-rose-700">
                        <div>-{formatPKR(s.commission)} (comm)</div>
                        <div className="text-slate-500">-{formatPKR(s.serviceCharges)} (fees)</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        {s.fines > 0 && <div className="text-rose-600">-{formatPKR(s.fines)} fine</div>}
                        {s.reimbursements > 0 && <div className="text-emerald-600">+{formatPKR(s.reimbursements)} rmb</div>}
                        {s.fines === 0 && s.reimbursements === 0 && <span className="text-slate-400">—</span>}
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {formatPKR(s.netEarnings)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {formatPKR(s.payoutsAmount)}
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {formatPKR(s.closingBalance)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            s.reconciliationStatus === 'Matched'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          {s.reconciliationStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSettlementDriver(s);
                            setShowStatementModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-slate-600" />
                          Statement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DRIVER PAYABLE BALANCES & ON-DEMAND WITHDRAWAL    */}
      {/* ======================================================== */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search driver by name, phone or vehicle plate..."
                value={balanceSearch}
                onChange={(e) => setBalanceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>

            <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-time wallet balance validation with automatic fine deduction guards</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverBalances
              .filter(
                (b) =>
                  !balanceSearch ||
                  b.driverName.toLowerCase().includes(balanceSearch.toLowerCase()) ||
                  b.driverPhone.includes(balanceSearch) ||
                  b.driverPlate.toLowerCase().includes(balanceSearch.toLowerCase())
              )
              .map((b) => (
                <div
                  key={b.driverId}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <button
                          onClick={() => openUniversalDetail('driver', b.driverId)}
                          className="font-black text-slate-900 hover:text-amber-600 text-sm flex items-center gap-1 cursor-pointer"
                        >
                          <span>{b.driverName}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {b.driverPhone} • {b.city}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Plate: {b.driverPlate}</div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.nextEligiblePayout.eligible
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.nextEligiblePayout.eligible ? 'Eligible' : 'Below Min'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Total Wallet Balance:</span>
                        <span className="font-mono font-bold text-slate-900">{formatPKR(b.availableBalance)}</span>
                      </div>

                      {b.outstandingFines > 0 && (
                        <div className="flex items-center justify-between text-rose-600 font-semibold">
                          <span>Unpaid Fines Hold:</span>
                          <span className="font-mono">-{formatPKR(b.outstandingFines)}</span>
                        </div>
                      )}

                      {b.pendingDeductions > 0 && (
                        <div className="flex items-center justify-between text-rose-600">
                          <span>Pending Adjustments:</span>
                          <span className="font-mono">-{formatPKR(b.pendingDeductions)}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-black">
                        <span className="text-slate-900">Net Payable Balance:</span>
                        <span className="font-mono text-base text-amber-700">{formatPKR(b.payableBalance)}</span>
                      </div>
                    </div>

                    {b.lastPayout && (
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Last Payout: </span>
                        <span className="font-mono font-bold text-slate-900">{formatPKR(b.lastPayout.amount)}</span> on{' '}
                        <span>{b.lastPayout.date.slice(0, 10)}</span> ({b.lastPayout.method})
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Threshold: {formatPKR(payoutConfig.minimumPayoutAmount)}
                    </span>

                    <button
                      onClick={() => {
                        handleDriverSelect(b.driverId);
                        setWithdrawalAmount(Math.min(b.payableBalance, 10000).toString());
                        setShowNewWithdrawalModal(true);
                      }}
                      disabled={b.payableBalance <= 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        b.payableBalance > 0
                          ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Initiate Payout
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DISBURSEMENT TRANSACTION LEDGER                  */}
      {/* ======================================================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transaction ID, driver, reference ID..."
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Status:</span>
                <select
                  value={transactionStatusFilter}
                  onChange={(e) => setTransactionStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold text-slate-800"
                >
                  <option value="all">All Disbursals</option>
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {payoutTransactions.length} Total Treasury Transactions
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                    <th className="py-3 px-4">Txn ID / Date</th>
                    <th className="py-3 px-4">Driver Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Gateway &amp; Account</th>
                    <th className="py-3 px-4">Settlement Period</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Gateway Reference</th>
                    <th className="py-3 px-4 text-right">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {payoutTransactions
                    .filter((t) => {
                      const matchSearch =
                        !transactionSearch ||
                        t.id.toLowerCase().includes(transactionSearch.toLowerCase()) ||
                        t.driverName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
                        (t.referenceId && t.referenceId.toLowerCase().includes(transactionSearch.toLowerCase()));
                      const matchStatus =
                        transactionStatusFilter === 'all' ||
                        t.status.toLowerCase() === transactionStatusFilter.toLowerCase();
                      return matchSearch && matchStatus;
                    })
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-black text-slate-900">{t.id}</div>
                          <div className="text-[11px] text-slate-500">{t.date}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{t.driverName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{t.driverId}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-black text-slate-900">
                          {formatPKR(t.amount)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{t.paymentMethod}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{t.accountNumber}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {t.period}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              t.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-900'
                                : t.status === 'Processing'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          {t.referenceId ? (
                            <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                              {t.referenceId}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-slate-800">{t.approvedBy || t.createdBy}</div>
                          <div className="text-[10px] text-slate-400">{t.note}</div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AI RISK & PAYOUT ANOMALY WATCHDOG                 */}
      {/* ======================================================== */}
      {activeTab === 'ai_watchdog' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-purple-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  AI Financial Guardian Engine
                </span>
              </div>
              <h3 className="text-lg font-black mt-1">Autonomous Payout Risk &amp; Duplicate Protection</h3>
              <p className="text-xs text-purple-200 mt-0.5 max-w-2xl">
                Monitors pending requests, rapid repeated withdrawals, negative wallet threats, and uncollected driver fines before payment disbursement.
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-amber-400 font-mono">{aiPayoutAnomalies.length}</div>
              <div className="text-[11px] text-purple-200">Active Risk Flags</div>
            </div>
          </div>

          {aiPayoutAnomalies.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-black text-slate-900">All Payouts Verified Safe</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No duplicate requests, rapid repeated payouts, or negative wallet hazards detected by the AI watchdog.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiPayoutAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    anomaly.severity === 'Critical'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : anomaly.severity === 'High'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-sky-50/80 border-sky-200 text-sky-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          anomaly.severity === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : anomaly.severity === 'High'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-sky-600 text-white'
                        }`}
                      >
                        {anomaly.severity} Risk
                      </span>
                      <span className="font-bold text-xs">{anomaly.anomalyType}</span>
                      <span className="text-[11px] text-slate-500 font-mono">• Detected {anomaly.detectedAt}</span>
                    </div>

                    <p className="text-xs font-semibold">{anomaly.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-mono mt-1">
                      <span>Driver: <strong>{anomaly.driverName}</strong> ({anomaly.driverId})</span>
                      {anomaly.relatedPayoutId && (
                        <span>• Payout ID: <strong>{anomaly.relatedPayoutId}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const targetPayout = driverPayouts.find((p) => p.id === anomaly.relatedPayoutId);
                        if (targetPayout) {
                          setSelectedPayout(targetPayout);
                          setShowReviewModal(true);
                        } else {
                          openUniversalDetail('driver', anomaly.driverId);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1 hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Investigate
                    </button>

                    <button
                      onClick={() => dismissAiPayoutAnomaly(anomaly.id)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                    >
                      Dismiss Risk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: PAYOUT POLICIES & SETTINGS                       */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Treasury Payout Policies &amp; Thresholds
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure payout minimums, automated batch intervals, and single-admin approval limits for GoLife Pakistan.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Automated Settlement Schedule
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Daily', 'Weekly', 'On Demand'] as const).map((schedule) => (
                    <button
                      key={schedule}
                      onClick={() => updatePayoutConfig({ payoutSchedule: schedule })}
                      className={`py-2 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${
                        payoutConfig.payoutSchedule === schedule
                          ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {schedule}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Withdrawal Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={payoutConfig.minimumPayoutAmount}
                    onChange={(e) => updatePayoutConfig({ minimumPayoutAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Requests below this threshold will be blocked automatically.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Single Payout Cap (PKR)
                  </label>
                  <input
                    type="number"
                    value={payoutConfig.maximumPayoutAmount}
                    onChange={(e) => updatePayoutConfig({ maximumPayoutAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Higher amounts require senior dual-sign verification.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Auto-Approval Threshold (PKR)
                  </label>
                  <input
                    type="number"
                    value={payoutConfig.autoApprovalThreshold}
                    onChange={(e) => updatePayoutConfig({ autoApprovalThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Payouts under this amount can be auto-approved during scheduled batches.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Automated Batch Hour (24h PKT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={payoutConfig.scheduledBatchHour}
                    onChange={(e) => updatePayoutConfig({ scheduledBatchHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Hour when daily/weekly cron executes settlement.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  Changes apply immediately across all GoLife settlement queues.
                </span>
                <button
                  onClick={() => showToast('Payout configurations saved successfully', 'success')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black shadow-xs cursor-pointer"
                >
                  Save Policy Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NEW DRIVER WITHDRAWAL REQUEST                    */}
      {/* ======================================================== */}
      {showNewWithdrawalModal && currentSelectedDriver && currentSelectedBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-950" />
                <h3 className="font-black text-sm">Initiate Driver Withdrawal Request</h3>
              </div>
              <button
                onClick={() => setShowNewWithdrawalModal(false)}
                className="p-1 rounded-lg hover:bg-amber-500 text-slate-950 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewWithdrawal} className="p-5 space-y-4 text-xs">
              {/* Select Driver */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleDriverSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-slate-50"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone}) • Balance: {formatPKR(d.walletBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver Financial Summary Card */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-slate-800">
                <div className="flex justify-between font-bold">
                  <span>Available Wallet:</span>
                  <span className="font-mono text-slate-950">{formatPKR(currentSelectedBalance.availableBalance)}</span>
                </div>
                {currentSelectedBalance.outstandingFines > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Unpaid Fines Hold:</span>
                    <span className="font-mono">-{formatPKR(currentSelectedBalance.outstandingFines)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-amber-900 pt-1 border-t border-amber-200">
                  <span>Maximum Net Payable:</span>
                  <span className="font-mono text-sm">{formatPKR(currentSelectedBalance.payableBalance)}</span>
                </div>
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min={payoutConfig.minimumPayoutAmount}
                    max={currentSelectedBalance.payableBalance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-950"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Min: {formatPKR(payoutConfig.minimumPayoutAmount)}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disbursement Gateway</label>
                  <select
                    value={withdrawalMethod}
                    onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="SadaPay">SadaPay</option>
                    <option value="NayaPay">NayaPay</option>
                  </select>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Title</label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    required
                    placeholder="Must match CNIC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account / Mobile Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    placeholder="e.g. 03001234567 or IBAN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-semibold"
                  />
                </div>
              </div>

              {withdrawalMethod === 'Bank' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Habib Bank Limited, Meezan Bank, etc."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Reference Note</label>
                <input
                  type="text"
                  value={optionalNote}
                  onChange={(e) => setOptionalNote(e.target.value)}
                  placeholder="Reason or authorization reference"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewWithdrawalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={Number(withdrawalAmount) > currentSelectedBalance.payableBalance || Number(withdrawalAmount) < payoutConfig.minimumPayoutAmount}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black transition cursor-pointer disabled:bg-slate-300 disabled:text-slate-500"
                >
                  Submit Withdrawal Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PAYOUT REVIEW & AUDIT TIMELINE                   */}
      {/* ======================================================== */}
      {showReviewModal && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm">Payout Review: {selectedPayout.id}</h3>
                  <p className="text-[11px] text-slate-400">Driver: {selectedPayout.driverName} ({selectedPayout.driverPhone})</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500">Requested Amount:</span>
                  <div className="font-mono font-black text-base text-slate-950">{formatPKR(selectedPayout.amount)}</div>
                </div>
                <div>
                  <span className="text-slate-500">Method &amp; Account:</span>
                  <div className="font-bold text-slate-900">{selectedPayout.paymentMethod}</div>
                  <div className="font-mono text-slate-600">{selectedPayout.accountTitle} ({selectedPayout.accountNumber})</div>
                </div>
                <div>
                  <span className="text-slate-500">Requested At:</span>
                  <div className="font-mono font-semibold text-slate-800">{selectedPayout.requestedAt}</div>
                </div>
                <div>
                  <span className="text-slate-500">Current Status:</span>
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      {selectedPayout.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference ID and Notes */}
              {selectedPayout.referenceId && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                  <span className="font-bold">Gateway Reference: </span>
                  <span className="font-mono font-bold">{selectedPayout.referenceId}</span>
                </div>
              )}

              {selectedPayout.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                  <span className="font-bold">Rejection Note: </span>
                  <span>{selectedPayout.rejectionReason}</span>
                </div>
              )}

              {/* Audit Timeline */}
              <div>
                <h4 className="font-black text-slate-900 mb-2">Audit History &amp; Approval Timeline</h4>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  {selectedPayout.timeline.map((step) => (
                    <div key={step.id} className="relative pb-2">
                      <div className="absolute -left-[19px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{step.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold">By: {step.performedBy}</div>
                      {step.note && <div className="text-[11px] text-slate-500 italic mt-0.5">{step.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 transition cursor-pointer text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedPayout.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleOpenActionModal(selectedPayout, 'approve')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
                    >
                      Approve Payout
                    </button>
                    <button
                      onClick={() => handleOpenActionModal(selectedPayout, 'reject')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer"
                    >
                      Reject Payout
                    </button>
                  </>
                )}

                {selectedPayout.status === 'Approved' && (
                  <button
                    onClick={() => handleOpenActionModal(selectedPayout, 'process')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    Mark Processing
                  </button>
                )}

                {selectedPayout.status === 'Processing' && (
                  <button
                    onClick={() => handleOpenActionModal(selectedPayout, 'complete')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition cursor-pointer"
                  >
                    Mark Completed &amp; Settled
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ACTION CONFIRMATION (APPROVE/PROCESS/COMPLETE/REJECT) */}
      {/* ======================================================== */}
      {activeAction && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className={`p-4 text-white flex items-center justify-between ${
              activeAction === 'approve' || activeAction === 'complete'
                ? 'bg-emerald-700'
                : activeAction === 'reject' || activeAction === 'cancel'
                ? 'bg-rose-700'
                : 'bg-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase">
                  Confirm Payout {activeAction}
                </h3>
              </div>
              <button
                onClick={() => setActiveAction(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-semibold">Driver: {selectedPayout.driverName}</div>
                <div className="text-slate-950 font-black text-base font-mono">{formatPKR(selectedPayout.amount)}</div>
                <div className="text-slate-600 font-mono mt-0.5">{selectedPayout.paymentMethod} • {selectedPayout.accountNumber}</div>
              </div>

              {(activeAction === 'process' || activeAction === 'complete' || activeAction === 'approve') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gateway / 1LINK Reference ID
                  </label>
                  <input
                    type="text"
                    value={actionRefId}
                    onChange={(e) => setActionRefId(e.target.value)}
                    placeholder="e.g. TXN-PK-981245 or REF-JAZZ-12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              {activeAction === 'reject' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rejection Reason
                  </label>
                  <select
                    value={actionRejectReason}
                    onChange={(e) => setActionRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-slate-50 mb-2"
                  >
                    <option value="Account title mismatch with CNIC records">Account title mismatch with CNIC records</option>
                    <option value="Unpaid driver fines exceed threshold">Unpaid driver fines exceed threshold</option>
                    <option value="Suspicious multiple rapid withdrawal attempt">Suspicious multiple rapid withdrawal attempt</option>
                    <option value="Bank account frozen or invalid title">Bank account frozen or invalid title</option>
                    <option value="Driver account under compliance review">Driver account under compliance review</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Audit Note / Verification Remarks
                </label>
                <textarea
                  rows={2}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Optional note recorded in transaction ledger"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleExecuteAction}
                  className={`px-4 py-2 rounded-xl text-white font-black transition cursor-pointer ${
                    activeAction === 'approve' || activeAction === 'complete'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : activeAction === 'reject' || activeAction === 'cancel'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  Confirm {activeAction}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RUN SCHEDULED AUTO-PAYOUT BATCH                  */}
      {/* ======================================================== */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-black text-sm">Run Scheduled Auto-Payout Batch</h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                This triggers the automated batch payout routine for all registered drivers with payable balances meeting the minimum threshold of <strong>{formatPKR(payoutConfig.minimumPayoutAmount)}</strong>.
              </p>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-slate-800">
                <div className="flex justify-between">
                  <span>Eligible Drivers:</span>
                  <span className="font-black text-slate-950">
                    {driverBalances.filter((b) => b.nextEligiblePayout.eligible).length} drivers
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Schedule Type:</span>
                  <span className="font-bold text-amber-900">{payoutConfig.payoutSchedule} Batch</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Approval Cap:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPKR(payoutConfig.autoApprovalThreshold)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                Automatic fine holds will be deducted prior to disbursement to prevent negative balances.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    runScheduledAutoPayoutBatch();
                    setShowBatchModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer shadow-sm"
                >
                  Execute Batch Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DRIVER SETTLEMENT STATEMENT VIEW                  */}
      {/* ======================================================== */}
      {showStatementModal && selectedSettlementDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">
                  {selectedSettlementDriver.periodLabel} Settlement Statement
                </h3>
              </div>
              <button
                onClick={() => setShowStatementModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-black text-base text-slate-950">{selectedSettlementDriver.driverName}</h4>
                  <p className="text-slate-500 font-mono">{selectedSettlementDriver.driverPhone} • {selectedSettlementDriver.city}</p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Statement Period</div>
                  <div className="font-black text-amber-600">{selectedSettlementDriver.periodLabel}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Completed Rides</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSettlementDriver.totalRides}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Gross Fare Earnings</span>
                  <span className="font-mono font-bold text-slate-900">{formatPKR(selectedSettlementDriver.grossEarnings)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                  <span>Platform Commission ({centralPricing?.platformCommission?.amount || 17}%)</span>
                  <span className="font-mono">-{formatPKR(selectedSettlementDriver.commission)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                  <span>Service Charges</span>
                  <span className="font-mono">-{formatPKR(selectedSettlementDriver.serviceCharges)}</span>
                </div>
                {selectedSettlementDriver.fines > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                    <span>Deducted Fines &amp; Penalties</span>
                    <span className="font-mono">-{formatPKR(selectedSettlementDriver.fines)}</span>
                  </div>
                )}
                {selectedSettlementDriver.reimbursements > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span>Approved Reimbursements</span>
                    <span className="font-mono">+{formatPKR(selectedSettlementDriver.reimbursements)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b-2 border-slate-200 font-black text-sm">
                  <span>Net Calculated Earnings</span>
                  <span className="font-mono text-slate-950">{formatPKR(selectedSettlementDriver.netEarnings)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-semibold">
                  <span>Disbursed Payouts in Period</span>
                  <span className="font-mono">{formatPKR(selectedSettlementDriver.payoutsAmount)}</span>
                </div>
                <div className="flex justify-between py-2 font-black text-amber-900 text-sm">
                  <span>Current Closing Wallet Balance</span>
                  <span className="font-mono">{formatPKR(selectedSettlementDriver.closingBalance)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ledger status: <strong>{selectedSettlementDriver.reconciliationStatus}</strong>. All fares matched against central trip dispatch records.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setShowStatementModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs transition cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
