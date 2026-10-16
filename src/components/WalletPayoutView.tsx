import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { PayoutRequest, WalletTransaction } from '../types';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  DriverWallet,
  TopUpRequest,
  CentralPaymentTransaction,
  CompanyPaymentAccount,
  AdvanceBookingHold,
  TopUpStatus,
  PaymentTransactionType,
  PaymentProviderConfig,
  PaymentWebhookRecord,
  PaymentReconciliationItem
} from '../types/paymentArchitecture';
import { formatPKR } from '../utils/i18n';
import { isProductionDataSource } from '../config/dataSourceMode';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  CreditCard,
  PlusCircle,
  MinusCircle,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Smartphone,
  Check,
  X,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  ShieldCheck,
  Calendar,
  Sliders,
  Coins,
  RefreshCw,
  FileCheck,
  Cpu,
  Layers,
  Lock,
  Receipt
} from 'lucide-react';
import { PricingAndChargesView } from './PricingAndChargesView';
import { RefundsReimbursementsView } from './financial/RefundsReimbursementsView';
import { PayoutsSettlementsView } from './financial/PayoutsSettlementsView';
import { DriverWalletsTab } from './payment/DriverWalletsTab';
import { TopUpControlTab } from './payment/TopUpControlTab';
import { PaymentTransactionCenterTab } from './payment/PaymentTransactionCenterTab';
import { CompanyPaymentAccountsTab } from './payment/CompanyPaymentAccountsTab';
import { AdvanceBookingEscrowTab } from './payment/AdvanceBookingEscrowTab';
import { PaymentTestSuiteTab } from './payment/PaymentTestSuiteTab';
import { PaymentProviderControlTab } from './payment/PaymentProviderControlTab';
import { WalletSummaryCards } from './payment/WalletSummaryCards';
import { PaymentFeeConfigTab } from './payment/PaymentFeeConfigTab';
import { WalletReportsTab } from './payment/WalletReportsTab';
import { CommissionControlTab } from './financial/CommissionControlTab';
import { PlatformRevenueTab } from './financial/PlatformRevenueTab';
import { CashReconciliationTab } from './financial/CashReconciliationTab';
import { AdvanceReconciliationTab } from './financial/AdvanceReconciliationTab';
import { DriverEarningsLedgerTab } from './financial/DriverEarningsLedgerTab';
import { AIFinancialInsightsTab } from './financial/AIFinancialInsightsTab';
import {
  CommissionRule,
  DriverCommissionOverride,
  CashRideReconciliationRecord,
  AdvancePaymentReconciliationRecord,
  FinancialActionPayload
} from '../types/commissionAndRevenue';
import {
  INITIAL_COMMISSION_RULES,
  INITIAL_DRIVER_OVERRIDES,
  INITIAL_CASH_RECONCILIATIONS,
  INITIAL_ADVANCE_RECONCILIATIONS,
  executeFinancialAction
} from '../services/commissionService';
import {
  Percent,
  TrendingUp,
  Banknote,
  DollarSign,
  Sparkles
} from 'lucide-react';

export const WalletPayoutView: React.FC = () => {
  const {
    payouts,
    driverPayouts,
    transactions,
    drivers,
    passengers,
    approvePayout,
    rejectPayout,
    adjustDriverWallet,
    adjustPassengerWallet,
    passengerRefunds,
    driverReimbursements,
    commissionRules,
    setCommissionRules,
    driverOverrides,
    setDriverOverrides,
    cashReconciliations,
    setCashReconciliations,
    advanceReconciliations,
    setAdvanceReconciliations,
    driverWallets,
    setDriverWallets,
    topUps,
    setTopUps,
    centralTransactions,
    setCentralTransactions,
    companyAccounts,
    setCompanyAccounts,
    advanceHolds,
    setAdvanceHolds,
    paymentProviders,
    setPaymentProviders,
    paymentWebhooks,
    setPaymentWebhooks,
    paymentReconciliations,
    setPaymentReconciliations,
    handleTopUpStatusChange,
    recordDriverWalletCredit,
    recordDriverWalletDebit,
    recordCashRideSettlement,
    currentAdmin,
    showToast
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<
    | 'provider_control'
    | 'commission_control'
    | 'platform_revenue'
    | 'cash_reconciliation'
    | 'advance_reconciliation'
    | 'driver_earnings_ledger'
    | 'ai_financial_insights'
    | 'topup_control'
    | 'driver_wallets'
    | 'transaction_center'
    | 'company_accounts'
    | 'fee_cutting'
    | 'wallet_reports'
    | 'advance_escrow'
    | 'test_suite'
    | 'payouts_settlements'
    | 'refunds_reimbursements'
    | 'pricing_charges'
    | 'payouts'
    | 'transactions'
    | 'settings'
  >('provider_control');

  const adminActorName = currentAdmin?.name ? `${currentAdmin.name} (Finance Controller)` : 'Admin Finance Officer (Finance Controller)';

  // Handlers for Phase 56-C Central Commission & Financial Control
  const handleSaveCommissionRule = (rule: CommissionRule) => {
    setCommissionRules((prev) => {
      const idx = prev.findIndex((r) => r.id === rule.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rule;
        return next;
      }
      return [rule, ...prev];
    });
  };

  const handleAddDriverOverride = (override: DriverCommissionOverride) => {
    setDriverOverrides((prev) => [override, ...prev]);
  };

  const handleReconcileCashRide = (id: string, reason: string, notes: string) => {
    const res = executeFinancialAction(
      {
        actionType: 'reconcile_cash_ride',
        targetId: id,
        amountPKR: 0,
        reason,
        notes,
        actorName: adminActorName,
        actorRole: 'Finance Controller'
      },
      {
        wallets: driverWallets,
        transactions: centralTransactions,
        reconciliations: cashReconciliations,
        advanceReconciliations: advanceReconciliations
      }
    );
    setCashReconciliations(res.updatedReconciliations);
  };

  const handleReconcileAdvance = (id: string, reason: string, notes: string) => {
    const res = executeFinancialAction(
      {
        actionType: 'reconcile_advance_booking',
        targetId: id,
        amountPKR: 0,
        reason,
        notes,
        actorName: adminActorName,
        actorRole: 'Finance Controller'
      },
      {
        wallets: driverWallets,
        transactions: centralTransactions,
        reconciliations: cashReconciliations,
        advanceReconciliations: advanceReconciliations
      }
    );
    setAdvanceReconciliations(res.updatedAdvanceReconciliations);
  };

  const handleAdjustWalletBalance = (driverId: string, amountPKR: number, reason: string, notes: string) => {
    adjustDriverWallet(driverId, amountPKR, notes || reason);
  };

  // Handler: Manual Balance Credit / Deduction (DriverWalletsTab)
  const handleAddWalletBalance = (
    driverId: string,
    amount: number,
    type: PaymentTransactionType,
    description: string
  ) => {
    if (type === 'fine_deduction' || type === 'commission_deduction') {
      recordDriverWalletDebit(driverId, amount, type, description, adminActorName);
    } else {
      recordDriverWalletCredit(driverId, amount, type, description, adminActorName);
    }
  };

  // Handler: Driver Simulated Top-Up Submission
  const handleSubmitNewTopUp = (newReq: TopUpRequest) => {
    setTopUps((prev) => [newReq, ...prev]);
  };

  // Handler: Company Payment Account Update
  const handleUpdateCompanyAccount = (updatedAccount: CompanyPaymentAccount) => {
    setCompanyAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
  };

  // Handler: Cash Ride Simulation
  const handleRecordCashRide = () => {
    if (isProductionDataSource()) {
      showToast('Cash ride simulation is disabled in Production Mode to protect live financial ledgers.', 'error');
      return;
    }
    const randomDriver = drivers[0] || {
      id: 'drv-01',
      name: 'Muhammad Asif',
      phone: '0302-4491823'
    };
    const fare = Math.floor(450 + Math.random() * 800);
    recordCashRideSettlement({
      rideId: `ride-cash-${Date.now()}`,
      rideCode: `RD-${Math.floor(1000 + Math.random() * 9000)}`,
      driverId: randomDriver.id,
      driverName: randomDriver.name,
      driverPhone: randomDriver.phone,
      fare,
      commissionRate: 12,
      adminActor: adminActorName
    });
  };

  // Handler: Escrow Release
  const handleReleaseEscrow = (holdId: string) => {
    const hold = advanceHolds.find((h) => h.id === holdId);
    if (!hold) return;

    setAdvanceHolds((prev) =>
      prev.map((h) => (h.id === holdId ? { ...h, escrowStatus: 'released_to_driver' } : h))
    );

    // Credit driver via central financial engine
    recordDriverWalletCredit(
      hold.driverId,
      hold.advanceAmount,
      'ride_earnings',
      `Advance booking escrow released for ${hold.bookingCode}`,
      adminActorName
    );
  };

  // Handler: Escrow Refund
  const handleRefundEscrow = (holdId: string) => {
    setAdvanceHolds((prev) =>
      prev.map((h) => (h.id === holdId ? { ...h, escrowStatus: 'refunded' } : h))
    );
  };
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  // Approve modal with Transaction ID
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [transactionIdInput, setTransactionIdInput] = useState('');

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Account Title mismatch with CNIC record.');
  const [customRejectNote, setCustomRejectNote] = useState('');

  // Manual Credit/Debit Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTargetType, setManualTargetType] = useState<'driver' | 'passenger'>('driver');
  const [manualTargetId, setManualTargetId] = useState(drivers[0]?.id || '');
  const [manualAmount, setManualAmount] = useState('1000');
  const [manualReason, setManualReason] = useState('Promotional Incentive Credit');

  // Payout Configuration Settings
  const [minPayoutThreshold, setMinPayoutThreshold] = useState(1000);
  const [payoutSchedule, setPayoutSchedule] = useState<'on_demand' | 'daily' | 'weekly'>('on_demand');
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const settledPayouts = payouts.filter((p) => p.status !== 'pending');

  const totalDriverWalletBalance = drivers.reduce((sum, d) => sum + d.walletBalance, 0);
  const totalPassengerWalletBalance = passengers.reduce((sum, p) => sum + p.walletBalance, 0);
  const totalPendingPayoutAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  const handleOpenApproveModal = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setTransactionIdInput(`TXN-${payout.method.toUpperCase().slice(0, 2)}-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    if (selectedPayout) {
      approvePayout(selectedPayout.id);
      setShowApproveModal(false);
      setSelectedPayout(null);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedPayout) {
      const finalReason = customRejectNote
        ? `${rejectReason} - ${customRejectNote}`
        : rejectReason;
      rejectPayout(selectedPayout.id, finalReason);
      setShowRejectModal(false);
      setSelectedPayout(null);
    }
  };

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(manualAmount);
    if (manualTargetType === 'driver') {
      adjustDriverWallet(manualTargetId, amt, manualReason);
    } else {
      adjustPassengerWallet(manualTargetId, amt, manualReason);
    }
    setShowManualModal(false);
  };

  const handleSavePayoutSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div>
            <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#0F766E]" />
              Wallet & Driver Payout Settlement Desk
            </h1>
            <p className="text-xs text-[#6B7280]">
              Process JazzCash, EasyPaisa & Bank withdrawals with real-time balance reconciliation
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Manual Credit / Debit (PKR)
        </button>
      </div>

      {/* Point 17: Central Wallet Financial Summary Cards with Date Filters */}
      <WalletSummaryCards
        wallets={driverWallets}
        transactions={centralTransactions}
        topUps={topUps}
      />

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Total Driver Wallets
          </div>
          <div className="text-xl font-extrabold text-[#0F766E] font-mono mt-1">
            {formatPKR(totalDriverWalletBalance)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Across {drivers.length} registered drivers</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            Total Passenger Wallets
          </div>
          <div className="text-xl font-extrabold text-sky-600 font-mono mt-1">
            {formatPKR(totalPassengerWalletBalance)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">In-app customer credits</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Payout Requests</span>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          </div>
          <div className="text-xl font-extrabold text-[#111827] font-mono mt-1">
            {formatPKR(totalPendingPayoutAmount)}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">{pendingPayouts.length} requests awaiting transfer</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 overflow-x-auto">
        {/* Phase 59 Central Payment Provider System & Gateway Control */}
        <button
          id="tab-btn-payment-provider-control"
          onClick={() => setActiveSubTab('provider_control')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'provider_control'
              ? 'bg-slate-900 text-amber-400 font-black shadow-xs ring-2 ring-amber-400/50'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
          <span>Payment Provider Control</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
            Phase 59
          </span>
        </button>

        {/* Phase 56-C Central Commission, Platform Revenue & Reconciliation Tabs */}
        <button
          id="tab-btn-commission-control"
          onClick={() => setActiveSubTab('commission_control')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'commission_control'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-slate-950" />
          <span>Commission Control</span>
        </button>

        <button
          id="tab-btn-platform-revenue"
          onClick={() => setActiveSubTab('platform_revenue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'platform_revenue'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-slate-950" />
          <span>Platform Revenue</span>
        </button>

        <button
          id="tab-btn-cash-reconciliation"
          onClick={() => setActiveSubTab('cash_reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'cash_reconciliation'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Banknote className="w-3.5 h-3.5 text-slate-950" />
          <span>Cash Reconciliation</span>
          {cashReconciliations.filter((r) => r.reconciliationStatus === 'Mismatch' || r.reconciliationStatus === 'Pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
              {cashReconciliations.filter((r) => r.reconciliationStatus === 'Mismatch' || r.reconciliationStatus === 'Pending').length}
            </span>
          )}
        </button>

        <button
          id="tab-btn-advance-reconciliation"
          onClick={() => setActiveSubTab('advance_reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'advance_reconciliation'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-950" />
          <span>Advance Escrow Audit</span>
        </button>

        <button
          id="tab-btn-driver-earnings-ledger"
          onClick={() => setActiveSubTab('driver_earnings_ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'driver_earnings_ledger'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-slate-950" />
          <span>Driver Earnings Ledger</span>
        </button>

        <button
          id="tab-btn-ai-financial-insights"
          onClick={() => setActiveSubTab('ai_financial_insights')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'ai_financial_insights'
              ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Financial Insights</span>
        </button>

        {/* Phase 56-B Tabs */}
        <button
          id="tab-btn-topup-control"
          onClick={() => setActiveSubTab('topup_control')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'topup_control'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-slate-950" />
          <span>Top-Up Control</span>
          {topUps.filter((r) => r.status === 'Pending' || r.status === 'Under Review').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-950 text-amber-300">
              {topUps.filter((r) => r.status === 'Pending' || r.status === 'Under Review').length}
            </span>
          )}
        </button>

        <button
          id="tab-btn-driver-wallets"
          onClick={() => setActiveSubTab('driver_wallets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'driver_wallets'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-slate-950" />
          <span>Driver Wallets ({driverWallets.length})</span>
        </button>

        <button
          id="tab-btn-transaction-center"
          onClick={() => setActiveSubTab('transaction_center')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'transaction_center'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-slate-950" />
          <span>Transaction Center ({centralTransactions.length})</span>
        </button>

        <button
          id="tab-btn-company-accounts"
          onClick={() => setActiveSubTab('company_accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'company_accounts'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-950" />
          <span>Company Accounts</span>
        </button>

        <button
          id="tab-btn-fee-cutting"
          onClick={() => setActiveSubTab('fee_cutting')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'fee_cutting'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-slate-950" />
          <span>Fee &amp; Cutting Management</span>
        </button>

        <button
          id="tab-btn-wallet-reports"
          onClick={() => setActiveSubTab('wallet_reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'wallet_reports'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-slate-950" />
          <span>Financial Reports</span>
        </button>

        <button
          id="tab-btn-advance-escrow"
          onClick={() => setActiveSubTab('advance_escrow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'advance_escrow'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-amber-50/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-slate-950" />
          <span>Advance Escrow</span>
        </button>

        <button
          id="tab-btn-test-suite"
          onClick={() => setActiveSubTab('test_suite')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'test_suite'
              ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Phase 56-B Test Suite</span>
        </button>

        {/* Existing Functional Tabs */}
        <button
          id="tab-btn-payouts-settlements"
          onClick={() => setActiveSubTab('payouts_settlements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'payouts_settlements'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-slate-400" />
          <span>Payouts &amp; Settlements</span>
          {driverPayouts.filter((p) => p.status === 'Pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
              {driverPayouts.filter((p) => p.status === 'Pending').length}
            </span>
          )}
        </button>

        <button
          id="tab-btn-refunds-reimbursements"
          onClick={() => setActiveSubTab('refunds_reimbursements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'refunds_reimbursements'
              ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Refunds &amp; Reimbursements</span>
          {(((passengerRefunds || []).filter((r) => r.status === 'pending_approval' || (r as any).status === 'Pending Approval').length) +
            ((driverReimbursements || []).filter((r) => r.status === 'pending_approval' || (r as any).status === 'Pending Approval').length)) > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
              {((passengerRefunds || []).filter((r) => r.status === 'pending_approval' || (r as any).status === 'Pending Approval').length) +
               ((driverReimbursements || []).filter((r) => r.status === 'pending_approval' || (r as any).status === 'Pending Approval').length)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('pricing_charges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'pricing_charges'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          Pricing &amp; Charges
        </button>

        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'payouts'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Withdrawal Requests ({pendingPayouts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'transactions'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Legacy Ledger ({transactions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'settings'
              ? 'bg-[#0F766E] text-white shadow-xs'
              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Payout Policy
        </button>
      </div>

      {/* PHASE 56-C: CENTRAL COMMISSION & PLATFORM REVENUE ENGINE */}
      {activeSubTab === 'commission_control' && (
        <CommissionControlTab
          rules={commissionRules}
          driverOverrides={driverOverrides}
          onSaveRule={handleSaveCommissionRule}
          onAddDriverOverride={handleAddDriverOverride}
          adminActorName={adminActorName}
        />
      )}

      {activeSubTab === 'platform_revenue' && (
        <PlatformRevenueTab
          reconciliations={cashReconciliations || []}
          advanceReconciliations={advanceReconciliations || []}
          transactions={centralTransactions || []}
          adminActorName={adminActorName}
          onExportReport={(period, fmt) => {
            showToast(`Exporting ${period} financial report as ${fmt.toUpperCase()}`, 'success');
          }}
        />
      )}

      {activeSubTab === 'cash_reconciliation' && (
        <CashReconciliationTab
          reconciliations={cashReconciliations}
          onReconcileRide={handleReconcileCashRide}
          adminActorName={adminActorName}
        />
      )}

      {activeSubTab === 'advance_reconciliation' && (
        <AdvanceReconciliationTab
          advanceRecords={advanceReconciliations}
          onReconcileAdvance={handleReconcileAdvance}
          adminActorName={adminActorName}
        />
      )}

      {activeSubTab === 'driver_earnings_ledger' && (
        <DriverEarningsLedgerTab
          wallets={driverWallets}
          reconciliations={cashReconciliations}
          transactions={centralTransactions}
          onAdjustWallet={handleAdjustWalletBalance}
          adminActorName={adminActorName}
        />
      )}

      {activeSubTab === 'ai_financial_insights' && (
        <AIFinancialInsightsTab />
      )}

      {/* PHASE 59 CENTRAL PAYMENT PROVIDER SYSTEM */}
      {activeSubTab === 'provider_control' && (
        <PaymentProviderControlTab
          providers={paymentProviders}
          onUpdateProviders={setPaymentProviders}
          companyAccounts={companyAccounts}
          onUpdateCompanyAccounts={setCompanyAccounts}
          webhooks={paymentWebhooks}
          onUpdateWebhooks={setPaymentWebhooks}
          reconciliations={paymentReconciliations}
          onUpdateReconciliations={setPaymentReconciliations}
          transactions={centralTransactions}
          onUpdateTransactions={setCentralTransactions}
          wallets={driverWallets}
          onUpdateWallets={setDriverWallets}
          topUps={topUps}
          onUpdateTopUps={setTopUps}
          onNavigateToTestSuite={() => setActiveSubTab('test_suite')}
        />
      )}

      {/* PHASE 56-B VIEWS */}
      {activeSubTab === 'topup_control' && (
        <TopUpControlTab
          topUps={topUps}
          wallets={driverWallets}
          transactions={centralTransactions}
          companyAccounts={companyAccounts}
          adminActorName={adminActorName}
          onStatusChange={handleTopUpStatusChange}
          onSubmitNewTopUp={handleSubmitNewTopUp}
        />
      )}

      {activeSubTab === 'driver_wallets' && (
        <DriverWalletsTab
          wallets={driverWallets}
          transactions={centralTransactions}
          onAddBalance={handleAddWalletBalance}
        />
      )}

      {activeSubTab === 'transaction_center' && (
        <PaymentTransactionCenterTab
          transactions={centralTransactions}
          onRecordCashRide={handleRecordCashRide}
        />
      )}

      {activeSubTab === 'company_accounts' && (
        <CompanyPaymentAccountsTab
          accounts={companyAccounts}
          onUpdateAccount={handleUpdateCompanyAccount}
        />
      )}

      {activeSubTab === 'advance_escrow' && (
        <AdvanceBookingEscrowTab
          advanceHolds={advanceHolds}
          onReleaseEscrow={handleReleaseEscrow}
          onRefundEscrow={handleRefundEscrow}
        />
      )}

      {activeSubTab === 'test_suite' && (
        <PaymentTestSuiteTab
          wallets={driverWallets}
          topUps={topUps}
          transactions={centralTransactions}
          providers={paymentProviders}
          webhooks={paymentWebhooks}
          reconciliations={paymentReconciliations}
        />
      )}

      {/* View: Payouts & Settlements Central Command (Phase 43) */}
      {activeSubTab === 'payouts_settlements' && <PayoutsSettlementsView />}

      {/* Main View: Central Pricing & Charges Control */}
      {activeSubTab === 'pricing_charges' && <PricingAndChargesView />}

      {/* View: Refunds & Reimbursements Resolution Engine */}
      {activeSubTab === 'refunds_reimbursements' && <RefundsReimbursementsView />}

      {/* View 1: Payout Requests */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          {/* Pending Requests Queue */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
              <span className="font-bold text-sm text-[#111827]">Pending Withdrawal Approvals</span>
              <span className="text-xs text-[#0F766E] font-semibold">
                Approval validates driver wallet balance & automatically debits ledger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Beneficiary Details</th>
                    <th className="py-3 px-4">Requested Amount</th>
                    <th className="py-3 px-4">Driver Current Wallet</th>
                    <th className="py-3 px-4">Requested Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {pendingPayouts.map((p) => {
                    const driver = drivers.find((d) => d.id === p.driverId);
                    const hasSufficientBalance = (driver?.walletBalance || 0) >= p.amount;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#111827] text-sm">{p.driverName}</div>
                          <div className="text-[10px] text-[#6B7280]">ID: {p.driverId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.method === 'jazzcash'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : p.method === 'easypaisa'
                                ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {p.method === 'bank' ? (
                              <Building2 className="w-3 h-3" />
                            ) : (
                              <Smartphone className="w-3 h-3" />
                            )}
                            {p.method.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#111827]">{p.accountTitle}</div>
                          <div className="font-mono text-[#6B7280] text-[11px]">{p.accountNumber}</div>
                          {p.bankName && (
                            <div className="text-[10px] text-[#6B7280]">{p.bankName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#111827] text-sm">
                          {formatPKR(p.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className={`font-mono font-bold ${
                              hasSufficientBalance ? 'text-[#0F766E]' : 'text-rose-600'
                            }`}
                          >
                            {formatPKR(driver?.walletBalance || 0)}
                          </div>
                          {!hasSufficientBalance && (
                            <span className="text-[10px] text-rose-600 font-semibold">Insufficient Balance!</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#6B7280]">
                          {p.requestedAt}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPayout(p);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              disabled={!hasSufficientBalance}
                              onClick={() => handleOpenApproveModal(p)}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#064E3B] disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {pendingPayouts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#6B7280] text-xs">
                        No pending driver payout requests in the settlement queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settled History */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <span className="font-bold text-sm text-[#111827]">Settled Withdrawal History</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Method & Account</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Processed Date</th>
                    <th className="py-3 px-4">Transaction / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {settledPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-[#111827]">{p.driverName}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-[#111827]">{p.method}</span>
                        <div className="text-[10px] font-mono text-[#6B7280]">{p.accountNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#111827]">
                        {formatPKR(p.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'approved'
                              ? 'bg-emerald-50 text-[#10B981]'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#6B7280]">
                        {p.processedAt || 'Settled'}
                      </td>
                      <td className="py-3 px-4 text-[#6B7280] font-mono text-[11px]">
                        {p.transactionId || p.rejectionReason || 'Instant Bank Settlement'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Transaction Audit Ledger */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
            <span className="font-bold text-sm text-[#111827]">Master Wallet Transaction Audit Ledger</span>
            <span className="text-xs text-[#6B7280]">Complete historical double-entry record</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E5E7EB] uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Ref ID & Time</th>
                  <th className="py-3 px-4">Entity & Role</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Description / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#111827]">{txn.id}</div>
                      <div className="text-[10px] text-[#6B7280]">{txn.timestamp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#111827]">{txn.userName}</div>
                      <div className="text-[10px] uppercase font-semibold text-[#0F766E]">{txn.userRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          txn.type === 'credit'
                            ? 'bg-emerald-50 text-[#10B981]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {txn.type === 'credit' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 font-mono font-bold ${
                        txn.type === 'credit' ? 'text-[#10B981]' : 'text-rose-600'
                      }`}
                    >
                      {txn.type === 'credit' ? '+' : '-'} {formatPKR(txn.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#111827]">
                      {formatPKR(txn.balanceAfter)}
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">{txn.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Payout Policy & Schedule Settings */}
      {activeSubTab === 'settings' && (
        <form
          onSubmit={handleSavePayoutSettings}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6 max-w-2xl"
        >
          <div className="border-b border-[#E5E7EB] pb-3">
            <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#0F766E]" />
              Payout Threshold & Scheduling Policy
            </h2>
            <p className="text-xs text-[#6B7280]">
              Configure automated limits for JazzCash, EasyPaisa and IBAN settlements
            </p>
          </div>

          {settingsSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Payout policy parameters saved successfully!
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Minimum Driver Payout Threshold (PKR)
              </label>
              <input
                type="number"
                min="100"
                value={minPayoutThreshold}
                onChange={(e) => setMinPayoutThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-[#E5E7EB] font-mono text-sm"
              />
              <span className="text-[11px] text-[#6B7280]">
                Drivers cannot request withdrawals below this balance. Recommended: PKR 1,000.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Payout Processing Schedule Cadence
              </label>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { key: 'on_demand', label: 'On-Demand (Instant)' },
                  { key: 'daily', label: 'Daily Midnight Batch' },
                  { key: 'weekly', label: 'Weekly (Every Monday)' }
                ].map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => setPayoutSchedule(s.key as any)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      payoutSchedule === s.key
                        ? 'bg-[#0F766E]/10 border-[#0F766E] text-[#0F766E] font-bold'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E5E7EB] space-y-1">
              <div className="font-bold text-[#111827] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                Tax & Regulatory Compliance (FBR Pakistan)
              </div>
              <p className="text-[11px] text-[#6B7280]">
                All automated bank transfers above PKR 25,000 include CNIC-tied tax withholding receipts.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#064E3B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Save Payout Policy
            </button>
          </div>
        </form>
      )}

      {/* Approve Modal with Transaction ID */}
      {showApproveModal && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              Approve Payout: {selectedPayout.driverName}
            </h3>
            <p className="text-xs text-[#6B7280]">
              Disbursing <strong className="text-[#111827]">{formatPKR(selectedPayout.amount)}</strong> via{' '}
              <strong className="text-[#0F766E] uppercase">{selectedPayout.method}</strong> to account{' '}
              <span className="font-mono font-bold text-[#111827]">{selectedPayout.accountNumber}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Banking Transaction / Reference ID
              </label>
              <input
                type="text"
                required
                value={transactionIdInput}
                onChange={(e) => setTransactionIdInput(e.target.value)}
                className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
              />
              <span className="text-[10px] text-[#6B7280]">
                Enter bank slip / JazzCash TID for audit reconciliation
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-1.5 text-xs font-bold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-xl shadow-xs"
              >
                Confirm Payout Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Payout Request
            </h3>
            <p className="text-xs text-[#6B7280]">
              The requested amount of <strong className="text-[#111827]">{formatPKR(selectedPayout.amount)}</strong> will not be deducted.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#111827]">Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              >
                <option value="Account Title mismatch with CNIC record.">
                  Account Title mismatch with CNIC record
                </option>
                <option value="Invalid or incomplete IBAN / wallet number.">
                  Invalid or incomplete IBAN / wallet number
                </option>
                <option value="Account suspected of suspicious trip activity pending review.">
                  Account under safety review
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Additional Notes</label>
              <input
                type="text"
                value={customRejectNote}
                onChange={(e) => setCustomRejectNote(e.target.value)}
                placeholder="Optional explanation for driver..."
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Credit / Debit Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleManualAdjustment}
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl space-y-4 text-[#111827]"
          >
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#0F766E]" />
              Manual Wallet Adjustment (PKR)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Target Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setManualTargetType('driver');
                    setManualTargetId(drivers[0]?.id || '');
                  }}
                  className={`p-2 text-xs rounded-xl border font-bold cursor-pointer ${
                    manualTargetType === 'driver'
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  Driver Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualTargetType('passenger');
                    setManualTargetId(passengers[0]?.id || '');
                  }}
                  className={`p-2 text-xs rounded-xl border font-bold cursor-pointer ${
                    manualTargetType === 'passenger'
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  Passenger Account
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Select Beneficiary</label>
              <select
                value={manualTargetId}
                onChange={(e) => setManualTargetId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              >
                {manualTargetType === 'driver'
                  ? drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.vehicle.plate}) — Balance: {formatPKR(d.walletBalance)}
                      </option>
                    ))
                  : passengers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone}) — Balance: {formatPKR(p.walletBalance)}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Amount (PKR) — Use negative sign to debit
              </label>
              <input
                type="number"
                required
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="w-full p-2 text-sm font-mono rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Audit Ledger Note</label>
              <input
                type="text"
                required
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#0F766E] hover:bg-[#064E3B] text-white rounded-xl shadow-xs"
              >
                Commit Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
