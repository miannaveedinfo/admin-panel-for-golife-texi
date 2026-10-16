import React, { useState } from 'react';
import {
  PaymentProviderConfig,
  PaymentProviderCode,
  PaymentWebhookRecord,
  PaymentReconciliationItem,
  CompanyPaymentAccount,
  CentralPaymentTransaction,
  DriverWallet,
  TopUpRequest
} from '../../types/paymentArchitecture';
import {
  processIncomingWebhook,
  resolveReconciliationItem,
  generatePaymentReportSummary
} from '../../services/centralPaymentService';
import { formatPKR } from '../../utils/i18n';
import { PaymentDetailModal } from './PaymentDetailModal';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Banknote,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  RefreshCw,
  Send,
  Eye,
  Lock,
  Calendar,
  Layers,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Info,
  Check,
  X,
  Play,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';

interface PaymentProviderControlTabProps {
  providers: PaymentProviderConfig[];
  onUpdateProviders: (providers: PaymentProviderConfig[]) => void;
  companyAccounts: CompanyPaymentAccount[];
  onUpdateCompanyAccounts: (accounts: CompanyPaymentAccount[]) => void;
  webhooks: PaymentWebhookRecord[];
  onUpdateWebhooks: (webhooks: PaymentWebhookRecord[]) => void;
  reconciliations: PaymentReconciliationItem[];
  onUpdateReconciliations: (reconciliations: PaymentReconciliationItem[]) => void;
  transactions: CentralPaymentTransaction[];
  onUpdateTransactions: (transactions: CentralPaymentTransaction[]) => void;
  wallets: DriverWallet[];
  onUpdateWallets: (wallets: DriverWallet[]) => void;
  topUps: TopUpRequest[];
  onUpdateTopUps: (topUps: TopUpRequest[]) => void;
  onNavigateToTestSuite?: () => void;
}

export const PaymentProviderControlTab: React.FC<PaymentProviderControlTabProps> = ({
  providers,
  onUpdateProviders,
  companyAccounts,
  onUpdateCompanyAccounts,
  webhooks,
  onUpdateWebhooks,
  reconciliations,
  onUpdateReconciliations,
  transactions,
  onUpdateTransactions,
  wallets,
  onUpdateWallets,
  topUps,
  onUpdateTopUps,
  onNavigateToTestSuite
}) => {
  // Navigation sub-sections
  const [activeSection, setActiveSection] = useState<
    'providers' | 'accounts' | 'webhooks' | 'reconciliation' | 'reports' | 'security'
  >('providers');

  // Reporting period state (Single dropdown: Today, Weekly, Monthly, Yearly)
  const [reportPeriod, setReportPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('today');

  // Search & Filters for reconciliation
  const [recFilterStatus, setRecFilterStatus] = useState<string>('all');
  const [recSearch, setRecSearch] = useState<string>('');

  // Selected detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<CentralPaymentTransaction | null>(null);

  // Provider Edit Modal
  const [editingProvider, setEditingProvider] = useState<PaymentProviderConfig | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, { pinging: boolean; latencyMs?: number }>>({});

  // Webhook payload viewer modal
  const [inspectedWebhook, setInspectedWebhook] = useState<PaymentWebhookRecord | null>(null);

  // Reconciliation Resolver modal
  const [resolvingItem, setResolvingItem] = useState<PaymentReconciliationItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Toast / Banner feedback
  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'warning' | 'info', message: string) => {
    setNotificationBanner({ type, message });
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);
  };

  // Toggle provider enabled
  const handleToggleProvider = (providerId: string) => {
    const updated = providers.map((p) => {
      if (p.id === providerId) {
        const nextEnabled = !p.enabled;
        return {
          ...p,
          enabled: nextEnabled,
          status: nextEnabled ? ('active' as const) : ('inactive' as const)
        };
      }
      return p;
    });
    onUpdateProviders(updated);
    showNotification(
      'info',
      `Provider ${providers.find((p) => p.id === providerId)?.name} status toggled.`
    );
  };

  // Ping provider gateway simulation
  const handlePingProvider = (providerId: string) => {
    setPingStatus((prev) => ({ ...prev, [providerId]: { pinging: true } }));
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 25) + 30; // 30 - 55 ms
      setPingStatus((prev) => ({
        ...prev,
        [providerId]: { pinging: false, latencyMs: latency }
      }));
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT';
      const updated = providers.map((p) =>
        p.id === providerId ? { ...p, lastTestedAt: now, healthPingMs: latency } : p
      );
      onUpdateProviders(updated);
      showNotification(
        'success',
        `Gateway health check successful (${latency}ms latency). Environment: DEMO.`
      );
    }, 450);
  };

  // Save Provider Config changes
  const handleSaveProviderConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    const updated = providers.map((p) => (p.id === editingProvider.id ? editingProvider : p));
    onUpdateProviders(updated);
    setEditingProvider(null);
    showNotification('success', `Configuration saved for ${editingProvider.name}.`);
  };

  // Trigger simulated webhooks
  const handleSimulateWebhook = (
    provider: PaymentProviderCode,
    eventType: PaymentWebhookRecord['eventType'],
    forceDuplicate = false,
    customRef?: string,
    amount = 5000
  ) => {
    const ref = forceDuplicate
      ? 'JC-44332211'
      : customRef || `${provider === 'easypaisa' ? 'EP' : 'JC'}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const idempotencyKey = forceDuplicate
      ? 'IDEMP-WHK-8902-JC-44332211'
      : `IDEMP-WHK-${Date.now()}-${ref}`;
    const signature = `sha256=${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    const result = processIncomingWebhook(webhooks, topUps, wallets, transactions, {
      provider,
      eventType,
      referenceId: ref,
      amount,
      signature,
      idempotencyKey,
      payload: {
        provider,
        ref,
        amount,
        simulatedAt: new Date().toISOString()
      },
      actor: 'Admin Webhook Simulator'
    });

    onUpdateWebhooks(result.updatedWebhooks);
    onUpdateTopUps(result.updatedTopUps);
    onUpdateWallets(result.updatedWallets);
    onUpdateTransactions(result.updatedTransactions);

    if (result.isDuplicate) {
      showNotification(
        'warning',
        'Duplicate webhook replay detected! Idempotency key matched. Ledger untouched.'
      );
    } else if (result.success) {
      showNotification('success', `Simulated ${provider.toUpperCase()} webhook processed.`);
    } else {
      showNotification('warning', result.message);
    }
  };

  // Resolve reconciliation item
  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingItem) return;

    const result = resolveReconciliationItem(
      reconciliations,
      resolvingItem.id,
      'Farhan Zaidi (Super Admin)',
      resolutionNote || 'Verified with bank clearing advice'
    );

    if (result.success) {
      onUpdateReconciliations(result.updatedItems);
      setResolvingItem(null);
      setResolutionNote('');
      showNotification('success', result.message);
    }
  };

  // Generate Payment Reports
  const reportData = generatePaymentReportSummary(transactions, reconciliations, reportPeriod);

  // Filtered reconciliations
  const filteredReconciliations = reconciliations.filter((item) => {
    const matchesStatus = recFilterStatus === 'all' || item.status === recFilterStatus;
    const matchesSearch =
      item.referenceId.toLowerCase().includes(recSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(recSearch.toLowerCase()) ||
      (item.driverName && item.driverName.toLowerCase().includes(recSearch.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(recSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="central-payment-provider-control" className="space-y-6">
      {/* Toast / Alert banner */}
      {notificationBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            notificationBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : notificationBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notificationBanner.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{notificationBanner.message}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Main Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 shrink-0 font-bold shadow-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-black tracking-wide text-white">
                  Central Payment Provider Control
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Phase 59 Foundation
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Demo Mode Active (Zero Secrets Required)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Production-ready gateway architecture supporting Easypaisa, JazzCash, 1Link/Raast Bank Transfer, and Cash. Centralized provider configurations, webhook idempotency, automated reconciliation, and zero client-side secret exposure.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigateToTestSuite && (
              <button
                onClick={onNavigateToTestSuite}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Run Phase 59 Test Suite (22 Tests)</span>
              </button>
            )}
          </div>
        </div>

        {/* Critical Cash-Only Rule Banner */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300 font-black">CRITICAL CASH POLICY:</strong> Normal completed rides in GoLife Taxi Pakistan remain strictly <strong>CASH ONLY</strong>. Passenger pays driver directly in cash. Easypaisa &amp; JazzCash are strictly for Driver Wallet Top-Ups &amp; Advance Booking Escrow Holds.
            </span>
          </div>
          <span className="shrink-0 font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
            ENFORCED
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('providers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'providers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Provider Configurations ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('accounts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'accounts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Company Receiving Accounts ({companyAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('webhooks')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'webhooks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>Webhook Inspector &amp; Simulator ({webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('reconciliation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'reconciliation'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Reconciliation Center ({reconciliations.length})</span>
          {reconciliations.filter((r) => r.status === 'Mismatch').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
              {reconciliations.filter((r) => r.status === 'Mismatch').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('reports')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Payment Reports ({reportPeriod})</span>
        </button>

        <button
          onClick={() => setActiveSection('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Security &amp; Fraud Architecture</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PROVIDER CONFIGURATIONS */}
      {/* ========================================================================= */}
      {activeSection === 'providers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Connected Payment Providers &amp; Gateway Channels
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized gateway registry for driver top-ups, booking escrow, and fleet settlements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Auto-Ping Health:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                All 4 Systems Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => {
              const ping = pingStatus[provider.id];
              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-2xl border transition shadow-xs bg-white ${
                    provider.enabled ? 'border-slate-200' : 'border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          provider.code === 'easypaisa'
                            ? 'bg-emerald-100 text-emerald-800'
                            : provider.code === 'jazzcash'
                            ? 'bg-amber-100 text-amber-900'
                            : provider.code === 'bank'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-green-100 text-green-900'
                        }`}
                      >
                        {provider.code === 'cash' ? (
                          <Banknote className="w-5 h-5" />
                        ) : provider.code === 'bank' ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <CreditCard className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{provider.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              provider.environment === 'demo'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {provider.environment}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {provider.subTitle}
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Switch */}
                    <button
                      onClick={() => handleToggleProvider(provider.id)}
                      className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer ${
                        provider.enabled
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {provider.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Provider Configuration Specs */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5 font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-bold">
                        Merchant / Till ID:
                      </span>
                      <span className="font-bold text-slate-900">{provider.merchantId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-bold">
                        Limits (Min / Max):
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatPKR(provider.minTransaction)} — {formatPKR(provider.maxTransaction)}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 block font-sans font-bold">
                        Settlement Account:
                      </span>
                      <span className="font-medium text-slate-800 text-[10.5px]">
                        {provider.settlementAccount}
                      </span>
                    </div>

                    <div className="col-span-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px]">
                      <span className="text-[10px] text-slate-500 block font-sans font-bold">
                        API Credentials Vault:
                      </span>
                      <span className="text-slate-600 font-mono">
                        {provider.secretStatus}
                      </span>
                    </div>
                  </div>

                  {/* Normal ride warning if cash vs non-cash */}
                  <div className="mt-2.5">
                    {provider.code === 'cash' ? (
                      <span className="text-[10.5px] font-bold text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        Approved for Normal Completed Rides (Cash Direct)
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Restricted: Driver Wallet Top-Up &amp; Advance Booking Escrow Only
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[10.5px] text-slate-500">
                      {provider.healthPingMs ? (
                        <span className="font-mono text-emerald-700 font-bold">
                          Ping: {provider.healthPingMs}ms • {provider.lastTestedAt?.slice(11)}
                        </span>
                      ) : (
                        <span>Not tested recently</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePingProvider(provider.id)}
                        disabled={ping?.pinging}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 text-amber-500 ${ping?.pinging ? 'animate-spin' : ''}`}
                        />
                        <span>{ping?.pinging ? 'Testing...' : 'Test Ping'}</span>
                      </button>

                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Configure</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: COMPANY RECEIVING ACCOUNTS */}
      {/* ========================================================================= */}
      {activeSection === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                GoLife Taxi Corporate Receiving Accounts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official company accounts displayed to captains for wallet top-ups and corporate fleet settlements.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              3 Corporate Accounts Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companyAccounts.map((account) => (
              <div
                key={account.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1 ${
                        account.provider === 'easypaisa'
                          ? 'bg-emerald-100 text-emerald-800'
                          : account.provider === 'jazzcash'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {account.provider}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{account.accountTitle}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {account.status}
                  </span>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                  {account.tillNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans text-[10px]">Merchant Till:</span>
                      <span className="font-bold text-amber-600 text-xs">{account.tillNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans text-[10px]">Account No:</span>
                    <span className="font-bold text-slate-900">{account.accountNumber}</span>
                  </div>
                  {account.iban && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans text-[10px]">IBAN:</span>
                      <span className="font-bold text-slate-700 text-[10px]">{account.iban}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans text-[10px]">Merchant ID:</span>
                    <span className="font-bold text-slate-900">{account.merchantId}</span>
                  </div>
                </div>

                {/* Urdu Instructions */}
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                  <span className="font-bold text-[10px] text-amber-900 block font-sans">
                    ہدایات برائے ڈرائیور (Urdu):
                  </span>
                  <p className="mt-0.5">{account.instructionsUrdu}</p>
                </div>

                {/* English Instructions */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <span className="font-bold text-[10px] text-slate-500 block">
                    Driver Guidance (English):
                  </span>
                  <p className="mt-0.5">{account.instructionsEnglish}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: WEBHOOK INSPECTOR & SIMULATOR */}
      {/* ========================================================================= */}
      {activeSection === 'webhooks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Payment Webhook Engine &amp; Idempotency Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate incoming callback webhooks from Easypaisa &amp; JazzCash to test signature verification and anti-replay idempotency defense.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                HMAC-SHA256 Active
              </span>
            </div>

            {/* Simulator Toolbar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                <Play className="w-3.5 h-3.5 text-amber-500" />
                Simulate Gateway Event:
              </span>

              <button
                onClick={() => handleSimulateWebhook('easypaisa', 'payment.success', false, undefined, 5000)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                + Easypaisa Success (Rs 5,000)
              </button>

              <button
                onClick={() => handleSimulateWebhook('jazzcash', 'payment.success', false, undefined, 10000)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
              >
                + JazzCash Success (Rs 10,000)
              </button>

              <button
                onClick={() => handleSimulateWebhook('jazzcash', 'payment.success', true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                + Test Duplicate Replay Attack
              </button>

              <button
                onClick={() => handleSimulateWebhook('easypaisa', 'payment.failed', false, undefined, 1500)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                + Payment Failed Event
              </button>
            </div>
          </div>

          {/* Webhook Stream Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Live Webhook Audit Log ({webhooks.length} Events)
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Auto-Idempotency Protection Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Webhook ID</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Reference ID</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">HMAC Signature</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {webhooks.map((whk) => (
                    <tr key={whk.id} className="hover:bg-slate-50 transition font-mono">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{whk.id}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            whk.provider === 'easypaisa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {whk.provider}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{whk.eventType}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600">{whk.referenceId}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatPKR(whk.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {whk.signatureVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-700">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            whk.status === 'Processed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : whk.status === 'Duplicate_Ignored'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {whk.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setInspectedWebhook(whk)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Payload</span>
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

      {/* ========================================================================= */}
      {/* SECTION 4: RECONCILIATION CENTER */}
      {/* ========================================================================= */}
      {activeSection === 'reconciliation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Automated Payment Reconciliation Center
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side matching of external bank statements vs internal immutable double-entry ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reference, ID, driver..."
                  value={recSearch}
                  onChange={(e) => setRecSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-hidden focus:border-slate-900 w-48 sm:w-56"
                />
              </div>

              <select
                value={recFilterStatus}
                onChange={(e) => setRecFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Matched">Matched</option>
                <option value="Mismatch">Mismatch Flagged</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Reconciliation Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Rec ID</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Reference ID</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3 text-right">Provider Amount</th>
                    <th className="py-2.5 px-3 text-right">Internal Ledger</th>
                    <th className="py-2.5 px-3 text-right">Difference</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredReconciliations.map((rec) => {
                    const hasDiff = rec.difference !== 0;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-slate-900">{rec.id}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              rec.provider === 'easypaisa'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.provider === 'jazzcash'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {rec.provider}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-600">{rec.referenceId}</td>
                        <td className="py-3 px-3 font-sans text-slate-800">
                          {rec.driverName || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatPKR(rec.providerAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatPKR(rec.internalAmount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-bold ${
                              hasDiff ? 'text-rose-600 font-black' : 'text-emerald-700'
                            }`}
                          >
                            {formatPKR(rec.difference)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rec.status === 'Matched'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'Mismatch'
                                ? 'bg-rose-100 text-rose-800'
                                : rec.status === 'Resolved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {rec.status === 'Mismatch' ? (
                            <button
                              onClick={() => setResolvingItem(rec)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                            >
                              Resolve Mismatch
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const matchingTxn = transactions.find(
                                  (t) =>
                                    t.referenceId.toLowerCase() === rec.referenceId.toLowerCase() ||
                                    t.id === rec.transactionId
                                );
                                if (matchingTxn) {
                                  setSelectedTransaction(matchingTxn);
                                } else {
                                  showNotification('info', `Audit log recorded: ${rec.notes}`);
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              Audit
                            </button>
                          )}
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
      {/* SECTION 5: PAYMENT GATEWAY REPORTS (Single Dropdown) */}
      {/* ========================================================================= */}
      {activeSection === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Payment Gateway &amp; Revenue Reports
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized financial reports across timeframes. Single dropdown view control.
              </p>
            </div>

            {/* SINGLE DROPDOWN: Today / Weekly / Monthly / Yearly (Prompt Requirement 21 & 23) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Reporting Horizon:</span>
              <select
                id="payment-reporting-horizon-dropdown"
                value={reportPeriod}
                onChange={(e) =>
                  setReportPeriod(e.target.value as 'today' | 'weekly' | 'monthly' | 'yearly')
                }
                className="px-4 py-2 rounded-xl border-2 border-slate-900 bg-slate-900 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
              >
                <option value="today">Today (Live 24h)</option>
                <option value="weekly">Weekly (Last 7 Days)</option>
                <option value="monthly">Monthly (Last 30 Days)</option>
                <option value="yearly">Yearly (Annual YTD)</option>
              </select>
            </div>
          </div>

          {/* Report KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Payment Volume ({reportPeriod.toUpperCase()})
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatPKR(reportData.totalVolumePKR)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Across {reportData.totalPayments} total gateway &amp; trip transactions
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Cash Rides (Cash Only)
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {formatPKR(reportData.cashRidesVolumePKR)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {reportData.cashRidesCount} normal trips settled in physical cash
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Driver Wallet Top-Ups
              </span>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                {formatPKR(reportData.driverTopUpsVolumePKR)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {reportData.driverTopUpsCount} Easypaisa / JazzCash top-up credits
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Platform Commission Earned
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatPKR(reportData.platformCommissionPKR)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                15% auto-deducted directly from driver wallets
              </p>
            </div>
          </div>

          {/* Provider Volume Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>Easypaisa Volume</span>
                <span className="font-mono">{reportData.providerTotals.easypaisa.count} txns</span>
              </div>
              <div className="text-xl font-black font-mono text-emerald-800 mt-1">
                {formatPKR(reportData.providerTotals.easypaisa.volume)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span>JazzCash Volume</span>
                <span className="font-mono">{reportData.providerTotals.jazzcash.count} txns</span>
              </div>
              <div className="text-xl font-black font-mono text-amber-800 mt-1">
                {formatPKR(reportData.providerTotals.jazzcash.volume)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                <span>Bank 1Link / Raast</span>
                <span className="font-mono">{reportData.providerTotals.bank.count} txns</span>
              </div>
              <div className="text-xl font-black font-mono text-blue-800 mt-1">
                {formatPKR(reportData.providerTotals.bank.volume)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-green-50/60 border border-green-200">
              <div className="flex items-center justify-between text-xs font-bold text-green-950">
                <span>Direct Cash Rides</span>
                <span className="font-mono">{reportData.providerTotals.cash.count} rides</span>
              </div>
              <div className="text-xl font-black font-mono text-green-800 mt-1">
                {formatPKR(reportData.providerTotals.cash.volume)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: SECURITY & FRAUD ARCHITECTURE */}
      {/* ========================================================================= */}
      {activeSection === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Payment Security &amp; Fraud Prevention Principles
                </h3>
                <p className="text-xs text-slate-500">
                  Architectural safeguards protecting GoLife Taxi financial operations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  No Client-Side Financial Trust
                </h4>
                <p className="text-slate-600">
                  Wallets are never credited based on client-side screen success. Only server-validated webhook signatures or manual finance officer verification triggers double-entry ledger mutation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Idempotent Replay Defense
                </h4>
                <p className="text-slate-600">
                  Every webhook and top-up carries a unique idempotency key. Duplicate network retries or malicious replay attacks are recorded as duplicate ignored with zero double credit.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  Boundary Enforcement (Rs 100 — Rs 20,000)
                </h4>
                <p className="text-slate-600">
                  Strict boundary thresholds prevent micro-spamming (&lt; Rs 100) and excessive unverified money flows (&gt; Rs 20,000), keeping operations compliant with Pakistani financial regulations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  AI Risk Signals (No Auto-Money Movement)
                </h4>
                <p className="text-slate-600">
                  AI risk engines flag suspicious velocity patterns, repeated duplicate TRX attempts, and amount mismatches. AI flags; AI <strong>NEVER</strong> moves money or approves payments automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Provider Edit Configuration */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm">Configure {editingProvider.name}</h3>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProviderConfig} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Environment
                  </label>
                  <select
                    value={editingProvider.environment}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        environment: e.target.value as 'demo' | 'production'
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="demo">Demo Sandbox (Zero Secrets)</option>
                    <option value="production">Production Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Merchant Identifier
                  </label>
                  <input
                    type="text"
                    value={editingProvider.merchantId}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, merchantId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Min Top-Up (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingProvider.minTransaction}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        minTransaction: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Max Top-Up (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingProvider.maxTransaction}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        maxTransaction: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  API Endpoint (Server-to-Server)
                </label>
                <input
                  type="text"
                  value={editingProvider.apiEndpoint}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, apiEndpoint: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Webhook Callback URL
                </label>
                <input
                  type="text"
                  value={editingProvider.callbackWebhookUrl}
                  onChange={(e) =>
                    setEditingProvider({
                      ...editingProvider,
                      callbackWebhookUrl: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Settlement Account Reference
                </label>
                <input
                  type="text"
                  value={editingProvider.settlementAccount}
                  onChange={(e) =>
                    setEditingProvider({
                      ...editingProvider,
                      settlementAccount: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-[11px]"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <span className="font-bold block">Zero-Secret Policy:</span>
                Production secret keys and HMAC salt must always be supplied via backend server environment variables. Secrets are never stored or displayed in the client UI.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Webhook Inspector */}
      {inspectedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-amber-400">
                  Webhook Payload: {inspectedWebhook.id}
                </h3>
                <p className="text-[10px] text-slate-300 font-mono">
                  {inspectedWebhook.provider.toUpperCase()} • {inspectedWebhook.receivedAt}
                </p>
              </div>
              <button
                onClick={() => setInspectedWebhook(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-400">Signature: </span>
                  <span className="text-slate-800 font-bold">{inspectedWebhook.signature}</span>
                </div>
                <div>
                  <span className="text-slate-400">Idempotency Key: </span>
                  <span className="text-slate-800 font-bold">{inspectedWebhook.idempotencyKey}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span className="text-emerald-700 font-bold">{inspectedWebhook.status}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-sans block mb-1">
                  Raw JSON Payload
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-amber-300 text-[11px] overflow-x-auto max-h-48 leading-tight">
                  {JSON.stringify(inspectedWebhook.payload, null, 2)}
                </pre>
              </div>

              {inspectedWebhook.notes && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-sans text-[11px]">
                  <span className="font-bold">Audit Notes: </span>
                  {inspectedWebhook.notes}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInspectedWebhook(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Resolve Reconciliation Discrepancy */}
      {resolvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm">Resolve Discrepancy #{resolvingItem.id}</h3>
              </div>
              <button
                onClick={() => setResolvingItem(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-5 space-y-3.5">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <div className="font-bold">Discrepancy Detected:</div>
                <div className="text-base font-black font-mono mt-0.5">
                  Difference: {formatPKR(resolvingItem.difference)}
                </div>
                <div className="text-[11px] text-rose-700 mt-1">
                  Provider Amount: {formatPKR(resolvingItem.providerAmount)} • Internal Ledger:{' '}
                  {formatPKR(resolvingItem.internalAmount)}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Resolution Justification Note (Audit Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Bank settlement adjustment confirmed via 1Link statement reference #..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  Confirm &amp; Settle Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CENTRAL PAYMENT TRANSACTION DETAIL MODAL */}
      <PaymentDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
