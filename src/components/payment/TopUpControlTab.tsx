import React, { useState } from 'react';
import {
  TopUpRequest,
  TopUpStatus,
  TopUpMethod,
  DriverWallet,
  CentralPaymentTransaction,
  CompanyPaymentAccount
} from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import { isProductionDataSource } from '../../config/dataSourceMode';
import {
  MIN_TOPUP_AMOUNT,
  MAX_TOPUP_AMOUNT,
  validateTopUpAmount,
  validateReferenceId,
  checkDuplicateReference,
  simulateProviderVerification
} from '../../services/centralPaymentService';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Building2,
  PlusCircle,
  RotateCcw,
  X,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Layers,
  History,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface TopUpControlTabProps {
  topUps: TopUpRequest[];
  wallets: DriverWallet[];
  transactions: CentralPaymentTransaction[];
  companyAccounts: CompanyPaymentAccount[];
  adminActorName: string;
  onStatusChange: (
    requestId: string,
    newStatus: TopUpStatus,
    adminActor: string,
    note?: string,
    reason?: string
  ) => void;
  onSubmitNewTopUp: (newReq: TopUpRequest) => void;
}

export const TopUpControlTab: React.FC<TopUpControlTabProps> = ({
  topUps = [],
  wallets = [],
  transactions = [],
  companyAccounts = [],
  adminActorName = 'Admin',
  onStatusChange,
  onSubmitNewTopUp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Active Inspector / Drawer
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpRequest | null>(null);

  // Rejection Dialog State
  const [rejectingTopUp, setRejectingTopUp] = useState<TopUpRequest | null>(null);
  const [rejectReasonCategory, setRejectReasonCategory] = useState('Reference ID not found in bank statement');
  const [customRejectNote, setCustomRejectNote] = useState('');

  // Cancellation Dialog State
  const [cancellingTopUp, setCancellingTopUp] = useState<TopUpRequest | null>(null);
  const [cancelReason, setCancelReason] = useState('Driver requested cancellation');

  // Simulation Top-Up Form State (for testing & demo)
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simDriverId, setSimDriverId] = useState(wallets?.[0]?.driverId || 'drv-01');
  const [simAmount, setSimAmount] = useState('1500');
  const [simMethod, setSimMethod] = useState<TopUpMethod>('jazzcash');
  const [simReferenceId, setSimReferenceId] = useState('JC-' + Math.floor(10000000 + Math.random() * 90000000));
  const [simSenderPhone, setSimSenderPhone] = useState('03024491823');
  const [simSenderTitle, setSimSenderTitle] = useState('Muhammad Asif');
  const [simValidationNotice, setSimValidationNotice] = useState<string | null>(null);

  // Filter top-ups by Transaction ID, Driver ID, Phone, Provider Reference, Name
  const filteredTopUps = topUps.filter((req) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      req.driverName.toLowerCase().includes(q) ||
      req.referenceId.toLowerCase().includes(q) ||
      req.driverPhone.includes(q) ||
      req.id.toLowerCase().includes(q) ||
      (req.driverId && req.driverId.toLowerCase().includes(q));

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const s = req.status.toUpperCase();
      if (statusFilter === 'Pending') matchesStatus = s === 'PENDING';
      else if (statusFilter === 'Processing') matchesStatus = s === 'PROCESSING' || s === 'UNDER REVIEW';
      else if (statusFilter === 'Success') matchesStatus = s === 'SUCCESS' || s === 'APPROVED' || s === 'COMPLETED';
      else if (statusFilter === 'Failed') matchesStatus = s === 'FAILED';
      else if (statusFilter === 'Declined') matchesStatus = s === 'DECLINED' || s === 'REJECTED';
      else if (statusFilter === 'Refunded') matchesStatus = s === 'REFUNDED';
      else matchesStatus = req.status === statusFilter;
    }

    const matchesMethod = methodFilter === 'all' || req.paymentMethod === methodFilter;
    const matchesRisk = riskFilter === 'all' || (riskFilter === 'flagged' ? req.isSuspicious : !req.isSuspicious);

    return matchesSearch && matchesStatus && matchesMethod && matchesRisk;
  });

  // KPI calculations
  const pendingCount = topUps.filter((r) => r.status === 'Pending').length;
  const underReviewCount = topUps.filter((r) => r.status === 'Under Review').length;
  const approvedCount = topUps.filter((r) => r.status === 'Approved').length;
  const suspiciousCount = topUps.filter((r) => r.isSuspicious).length;

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimValidationNotice(null);

    const amt = Number(simAmount);
    // Amount validation
    const amtCheck = validateTopUpAmount(amt);
    if (!amtCheck.valid) {
      setSimValidationNotice(amtCheck.error || 'Invalid amount');
      return;
    }

    // Ref ID validation
    const refCheck = validateReferenceId(simReferenceId);
    if (!refCheck.valid) {
      setSimValidationNotice(refCheck.error || 'Invalid Reference ID');
      return;
    }

    // Duplicate reference check
    const dupCheck = checkDuplicateReference(simReferenceId, undefined, topUps, transactions);
    const isSuspicious = dupCheck.isDuplicate;
    const suspiciousReason = dupCheck.isDuplicate
      ? `Duplicate Reference detected: Previously matched with ${dupCheck.matchedItem}`
      : undefined;

    const driver = wallets.find((w) => w.driverId === simDriverId);
    const companyAcc = companyAccounts.find((c) => c.provider === simMethod) || companyAccounts[0];

    const newReq: TopUpRequest = {
      id: `TOP-${Math.floor(1000 + Math.random() * 9000)}`,
      driverId: simDriverId,
      driverName: driver?.driverName || 'Driver',
      driverPhone: driver?.driverPhone || simSenderPhone,
      driverPlate: driver?.driverPlate || 'LEB-22',
      driverCity: driver?.driverCity || 'Lahore',
      driverRating: 4.85,
      amount: amt,
      paymentMethod: simMethod,
      referenceId: simReferenceId.trim(),
      senderAccountNumber: simSenderPhone,
      senderAccountTitle: simSenderTitle,
      companyAccountId: companyAcc?.id || 'comp-01',
      companyAccountTitle: companyAcc?.accountTitle || 'GoLife Taxi Pakistan',
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT',
      status: 'Pending',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      proofNotes: 'Simulated top-up submission from driver mobile device.',
      isSuspicious,
      suspiciousReason,
      idempotencyKey: `IDEMP-${Date.now()}-${simReferenceId}`,
      providerVerificationStatus: isSuspicious ? 'manual_review_required' : 'pending',
      providerVerificationWindowMinutes: 5,
      auditTrail: [
        {
          action: 'Top-Up Request Initiated',
          actor: `Driver App (${driver?.driverName})`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT',
          note: `Driver submitted Rs ${amt} top-up via ${simMethod.toUpperCase()}`
        }
      ]
    };

    onSubmitNewTopUp(newReq);
    setShowSimulateModal(false);
    setSimReferenceId('JC-' + Math.floor(10000000 + Math.random() * 90000000));
  };

  const handleConfirmReject = () => {
    if (!rejectingTopUp) return;
    const finalReason = customRejectNote
      ? `${rejectReasonCategory}: ${customRejectNote}`
      : rejectReasonCategory;
    onStatusChange(rejectingTopUp.id, 'Rejected', adminActorName, 'Top-Up Rejected by Admin', finalReason);
    setRejectingTopUp(null);
    setCustomRejectNote('');
    if (selectedTopUp?.id === rejectingTopUp.id) {
      setSelectedTopUp(null);
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingTopUp) return;
    onStatusChange(cancellingTopUp.id, 'Cancelled', adminActorName, 'Cancelled by Admin', cancelReason);
    setCancellingTopUp(null);
    if (selectedTopUp?.id === cancellingTopUp.id) {
      setSelectedTopUp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">{pendingCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Awaiting first-line verification</div>
          </div>
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Under Review</div>
            <div className="text-2xl font-black text-blue-600 font-mono mt-1">{underReviewCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Statement matching in progress</div>
          </div>
          <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Layers className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved (Ready)</div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{approvedCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Verified; ready to complete</div>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk / Flagged</div>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">{suspiciousCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Duplicate / velocity warnings</div>
          </div>
          <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Operational Notice: Provider Verification Window */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-400 text-slate-950">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs font-bold text-amber-300">
              Automatic Provider Verification Architecture (Easypaisa / JazzCash)
            </span>
            <p className="text-[11px] text-slate-300">
              Configured ~5 min webhook &amp; polling verification window. In Demo Mode, transparent safe checks are executed without real secrets.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Simulate Driver Top-Up</span>
        </button>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search driver, TRX ID, phone, request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Statuses ({topUps.length})</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Declined">Declined</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Payment Methods</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">Easypaisa</option>
              <option value="bank">Bank Transfer</option>
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Risk Levels</option>
              <option value="clean">Normal / Clean</option>
              <option value="flagged">Flagged / Suspicious</option>
            </select>
          </div>
        </div>

        {/* Point 2: Top-Up Transaction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Fee</th>
                <th className="py-3 px-3 text-right">Wallet Credit</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Provider Reference</th>
                <th className="py-3 px-3">Company Account</th>
                <th className="py-3 px-3">Created At</th>
                <th className="py-3 px-3">Updated At</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTopUps.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No top-up transactions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTopUps.map((req) => {
                  const fee = req.fee ?? (req.paymentMethod === 'bank' ? 20 : Math.round(req.amount * 0.01));
                  const walletCredit = req.netCredit ?? Math.max(0, req.amount - fee);
                  const isSuccess = req.status === 'Completed' || req.status === 'SUCCESS' || req.status === 'Approved';

                  return (
                    <tr
                      key={req.id}
                      className={`transition hover:bg-amber-50/30 ${
                        req.isSuspicious ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Transaction ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        <span>{req.id}</span>
                        {req.isSuspicious && (
                          <span className="block text-[9px] text-rose-600 font-bold">⚠ Flagged</span>
                        )}
                      </td>

                      {/* Driver */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{req.driverName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {req.driverId} • {req.driverPhone}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            req.paymentMethod === 'easypaisa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.paymentMethod === 'jazzcash'
                              ? 'bg-red-100 text-red-800'
                              : req.paymentMethod === 'bank'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {req.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatPKR(req.amount)}
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-3 text-right font-mono text-rose-600 font-bold">
                        -{formatPKR(fee)}
                      </td>

                      {/* Wallet Credit */}
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                        +{formatPKR(walletCredit)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : req.status === 'Pending' || req.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : req.status === 'Processing' || req.status === 'PROCESSING' || req.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : req.status === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Provider Reference */}
                      <td className="py-3 px-3 font-mono text-slate-700">
                        <div className="font-bold">{req.referenceId}</div>
                        <div className="text-[10px] text-slate-400">
                          {req.senderAccountNumber ? `From: ${req.senderAccountNumber}` : ''}
                        </div>
                      </td>

                      {/* Company Account */}
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={req.companyAccountTitle}>
                        {req.companyAccountTitle || 'GoLife Corporate'}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {req.requestedAt || req.createdAt || '—'}
                      </td>

                      {/* Updated At */}
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {req.updatedAt || req.completedAt || req.requestedAt || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedTopUp(req)}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-xs ml-auto"
                          title="View transaction details and controls"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          THE ONE MAIN "TOP-UP CONTROL" DOSSIER / INSPECTOR MODAL
         ========================================================= */}
      {selectedTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-amber-400 border-b border-amber-500/30 flex items-center justify-between text-slate-950">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-slate-950 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    Top-Up Control Dossier #{selectedTopUp.id}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        selectedTopUp.status === 'Completed'
                          ? 'bg-emerald-600 text-white'
                          : selectedTopUp.status === 'Rejected'
                          ? 'bg-rose-700 text-white'
                          : 'bg-slate-900 text-amber-300'
                      }`}
                    >
                      {selectedTopUp.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-900/80">
                    Central verification and double-entry immutable ledger approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTopUp(null)}
                className="p-1.5 rounded-lg hover:bg-black/10 text-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* High Risk Banner if Suspicious */}
              {selectedTopUp.isSuspicious && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Fraud Risk Watchdog Warning:</span>
                    <p className="mt-0.5 text-[11px] text-rose-800">
                      {selectedTopUp.suspiciousReason || 'Potential duplicate reference ID or high velocity detected.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Top Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver Info Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                    Driver Information
                  </span>
                  <div className="text-sm font-black text-slate-900">{selectedTopUp.driverName}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Driver ID:</span>
                      <strong className="text-slate-900">{selectedTopUp.driverId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                      {selectedTopUp.driverPhone}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">City / Region:</span>
                      {selectedTopUp.driverCity}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vehicle Plate:</span>
                      {selectedTopUp.driverPlate}
                    </div>
                  </div>
                </div>

                {/* Point 3: Financial & Gateway Verification Details */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      Payment Breakdown
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        isProductionDataSource()
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {isProductionDataSource() ? 'PRODUCTION MODE' : 'DEMO MODE'}
                    </span>
                  </span>

                  {/* Financial Grid: Amount, Fee, Net Credit */}
                  {(() => {
                    const fee = selectedTopUp.fee ?? (selectedTopUp.paymentMethod === 'bank' ? 20 : Math.round(selectedTopUp.amount * 0.01));
                    const netCredit = selectedTopUp.netCredit ?? Math.max(0, selectedTopUp.amount - fee);

                    return (
                      <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-white border border-slate-200 text-center font-mono">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Gross Amount</span>
                          <span className="text-xs font-black text-slate-900">{formatPKR(selectedTopUp.amount)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-rose-500 uppercase font-bold block">Fee (Cutting)</span>
                          <span className="text-xs font-bold text-rose-600">-{formatPKR(fee)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-emerald-600 uppercase font-bold block">Net Wallet Credit</span>
                          <span className="text-xs font-black text-emerald-700">+{formatPKR(netCredit)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="text-[11px] space-y-1 font-mono text-slate-600">
                    <div>
                      <span className="text-slate-400 text-[10px]">Payment Method:</span>{' '}
                      <span className="font-bold uppercase text-slate-900">{selectedTopUp.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Provider Reference / TRX ID:</span>{' '}
                      <span className="font-bold text-slate-900">{selectedTopUp.referenceId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">GoLife Receiving Account:</span>{' '}
                      {selectedTopUp.companyAccountTitle}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Created Time:</span>{' '}
                      {selectedTopUp.requestedAt || selectedTopUp.createdAt || '—'}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Verification Time:</span>{' '}
                      {selectedTopUp.verificationTime || selectedTopUp.providerVerifiedAt || 'Awaiting Clearing Window'}
                    </div>
                    {(selectedTopUp.failedReason || selectedTopUp.rejectedReason) && (
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-sans font-medium">
                        <strong>Failure Reason:</strong> {selectedTopUp.failedReason || selectedTopUp.rejectedReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proof / Receipt Attachment */}
              {selectedTopUp.proofUrl && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                    Payment Receipt Slip / Screenshot
                  </span>
                  <div className="flex items-center gap-4">
                    <a
                      href={selectedTopUp.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block group relative overflow-hidden rounded-xl border border-slate-200 w-36 h-24 bg-slate-100 shrink-0"
                    >
                      <img
                        src={selectedTopUp.proofUrl}
                        alt="Payment Receipt"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </div>
                    </a>
                    <div className="text-[11px] text-slate-600">
                      <p className="font-medium">{selectedTopUp.proofNotes || 'No notes provided by driver.'}</p>
                      <p className="text-slate-400 text-[10px] mt-1 font-mono">
                        Idempotency Key: {selectedTopUp.idempotencyKey}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Verification Status & Simulation */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Provider Verification Engine (~5 Min Window)
                  </span>
                  <button
                    onClick={() => {
                      const sim = simulateProviderVerification(selectedTopUp);
                      onStatusChange(
                        selectedTopUp.id,
                        selectedTopUp.status,
                        'Provider Simulation Engine',
                        sim.note
                      );
                      setSelectedTopUp({
                        ...selectedTopUp,
                        providerVerificationStatus: sim.status,
                        providerVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' PKT'
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Check Provider Status
                  </button>
                </div>
                <div className="text-[11px] text-slate-700">
                  Status:{' '}
                  <span className="font-bold uppercase text-slate-900">
                    {selectedTopUp.providerVerificationStatus}
                  </span>{' '}
                  {selectedTopUp.providerVerifiedAt && (
                    <span className="text-slate-500 font-mono">
                      (Checked at {selectedTopUp.providerVerifiedAt})
                    </span>
                  )}
                </div>
              </div>

              {/* Audit History Timeline */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  Audit Trail &amp; History ({selectedTopUp.auditTrail.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedTopUp.auditTrail.map((audit, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-slate-900 font-bold">
                        <span>{audit.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{audit.timestamp}</span>
                      </div>
                      <div className="text-slate-600 text-[10px]">
                        Actor: <span className="font-bold">{audit.actor}</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">{audit.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ONE MAIN TOP-UP CONTROL ACTION FOOTER */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 font-mono">
                Admin Actor: <span className="font-bold text-slate-900">{adminActorName}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Review button */}
                {selectedTopUp.status === 'Pending' && (
                  <button
                    onClick={() => {
                      onStatusChange(
                        selectedTopUp.id,
                        'Under Review',
                        adminActorName,
                        'Moved to Under Review for verification'
                      );
                      setSelectedTopUp(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Mark Under Review
                  </button>
                )}

                {/* 2. Approve button */}
                {(selectedTopUp.status === 'Pending' || selectedTopUp.status === 'Under Review') && (
                  <button
                    onClick={() => {
                      onStatusChange(
                        selectedTopUp.id,
                        'Approved',
                        adminActorName,
                        'Approved by Admin after checking receipt'
                      );
                      setSelectedTopUp(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Approve Request
                  </button>
                )}

                {/* 3. Mark Processing */}
                {selectedTopUp.status === 'Approved' && (
                  <button
                    onClick={() => {
                      onStatusChange(
                        selectedTopUp.id,
                        'Processing',
                        adminActorName,
                        'Queued in payment settlement batch'
                      );
                      setSelectedTopUp(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Mark Processing
                  </button>
                )}

                {/* 4. Complete button (Credits Driver Wallet) */}
                {(selectedTopUp.status === 'Approved' ||
                  selectedTopUp.status === 'Processing' ||
                  selectedTopUp.status === 'Under Review' ||
                  selectedTopUp.status === 'Pending') && (
                  <button
                    onClick={() => {
                      onStatusChange(
                        selectedTopUp.id,
                        'Completed',
                        adminActorName,
                        `Top-Up Completed. Rs ${selectedTopUp.amount} credited to Driver Wallet ledger.`
                      );
                      setSelectedTopUp(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Complete &amp; Credit Wallet</span>
                  </button>
                )}

                {/* 5. Reject button */}
                {selectedTopUp.status !== 'Completed' &&
                  selectedTopUp.status !== 'Rejected' &&
                  selectedTopUp.status !== 'Cancelled' && (
                    <button
                      onClick={() => setRejectingTopUp(selectedTopUp)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Reject
                    </button>
                  )}

                {/* 6. Cancel button */}
                {selectedTopUp.status !== 'Completed' &&
                  selectedTopUp.status !== 'Cancelled' && (
                    <button
                      onClick={() => setCancellingTopUp(selectedTopUp)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                <button
                  onClick={() => setSelectedTopUp(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          REJECTION DIALOG
         ========================================================= */}
      {rejectingTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Reject Top-Up #{rejectingTopUp.id}
              </h3>
              <button
                onClick={() => setRejectingTopUp(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rejection</label>
                <select
                  value={rejectReasonCategory}
                  onChange={(e) => setRejectReasonCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Reference ID not found in bank statement">
                    Reference ID not found in bank statement
                  </option>
                  <option value="Amount paid does not match requested amount">
                    Amount paid does not match requested amount
                  </option>
                  <option value="Account title mismatch with registered driver">
                    Account title mismatch with registered driver
                  </option>
                  <option value="Duplicate or recycled transaction reference">
                    Duplicate or recycled transaction reference
                  </option>
                  <option value="Fraudulent or manipulated payment slip">
                    Fraudulent or manipulated payment slip
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Note / Explanation</label>
                <textarea
                  value={customRejectNote}
                  onChange={(e) => setCustomRejectNote(e.target.value)}
                  placeholder="Provide details to be displayed to the driver..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTopUp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black transition cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CANCELLATION DIALOG
         ========================================================= */}
      {cancellingTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-amber-400" /> Cancel Top-Up #{cancellingTopUp.id}
              </h3>
              <button
                onClick={() => setCancellingTopUp(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. Driver requested cancellation"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingTopUp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black transition cursor-pointer shadow-xs"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SIMULATE DRIVER TOP-UP MODAL (Testing and Demo)
         ========================================================= */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-amber-400 border-b border-amber-500/30 flex items-center justify-between text-slate-950">
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  Simulate Driver Wallet Top-Up Request
                </h3>
                <p className="text-[11px] text-slate-900/80">
                  Simulates driver submitting top-up from mobile app to Admin Control Panel
                </p>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1 rounded-lg hover:bg-black/10 text-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-5 space-y-4">
              {simValidationNotice && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{simValidationNotice}</span>
                </div>
              )}

              {/* Driver Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Driver</label>
                <select
                  value={simDriverId}
                  onChange={(e) => {
                    setSimDriverId(e.target.value);
                    const d = wallets.find((w) => w.driverId === e.target.value);
                    if (d) {
                      setSimSenderPhone(d.driverPhone.replace(/\s+/g, ''));
                      setSimSenderTitle(d.driverName);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {wallets.map((w) => (
                    <option key={w.driverId} value={w.driverId}>
                      {w.driverName} ({w.driverPhone} - {w.driverCity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Method & Amount Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={simMethod}
                    onChange={(e) => setSimMethod(e.target.value as TopUpMethod)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min={MIN_TOPUP_AMOUNT}
                    max={MAX_TOPUP_AMOUNT}
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="100 - 20,000"
                    required
                  />
                </div>
              </div>

              {/* Reference ID */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transaction / Reference ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simReferenceId}
                    onChange={(e) => setSimReferenceId(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. JC-88219401"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSimReferenceId(
                        (simMethod === 'jazzcash' ? 'JC-' : 'EP-') +
                          Math.floor(10000000 + Math.random() * 90000000)
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tip: To test fraud protection, paste an existing TRX ID like &quot;JC-88219401&quot;.
                </span>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender Mobile</label>
                  <input
                    type="text"
                    value={simSenderPhone}
                    onChange={(e) => setSimSenderPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender Account Title</label>
                  <input
                    type="text"
                    value={simSenderTitle}
                    onChange={(e) => setSimSenderTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer shadow-xs"
                >
                  Submit Top-Up Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
