import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  PassengerRefundRecord,
  DriverReimbursementRecord,
  FinancialAdjustmentRecord,
  ComprehensiveLedgerTransaction,
  ReconciliationRecord,
  AiFinancialAnomaly,
  DailySettlementRecord,
  FinancialActionType
} from '../../types';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import {
  DollarSign,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileText,
  User,
  Car,
  Sparkles,
  Smartphone,
  Eye,
  Check,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Layers,
  HelpCircle,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const RefundsReimbursementsView: React.FC = () => {
  const {
    passengerRefunds,
    driverReimbursements,
    financialAdjustments,
    comprehensiveTransactions,
    dailySettlements,
    reconciliationRecords,
    aiFinancialAnomalies,
    approvalThreshold,
    updateApprovalThreshold,
    processPassengerRefund,
    processDriverReimbursement,
    processFinancialAdjustment,
    approveFinancialRecord,
    rejectFinancialRecord,
    runReconciliationAudit,
    resolveReconciliationRecord,
    dismissFinancialAnomaly,
    drivers,
    passengers,
    rides,
    currentAdmin,
    openUniversalDetail,
    showToast
  } = useAdmin();

  // Sub-Navigation within Refunds & Reimbursements
  const [activeSection, setActiveSection] = useState<
    'resolutions' | 'ledger' | 'reconciliation' | 'settlements' | 'ai_anomalies' | 'app_previews'
  >('resolutions');

  // Modals
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<FinancialActionType>('passenger_refund');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingApprovalRecord, setPendingApprovalRecord] = useState<{
    category: 'refund' | 'reimbursement' | 'adjustment' | 'fine_refund';
    id: string;
    code: string;
    amount: number;
    party: string;
    reason: string;
  } | null>(null);
  const [approvalNote, setApprovalNote] = useState('Authorized by Finance Department under GoLife SLA.');

  // Threshold Configuration Modal
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholdInput, setThresholdInput] = useState<string>(approvalThreshold.toString());

  // Form State for Financial Action Modal
  // Passenger Refund
  const [refundRideId, setRefundRideId] = useState<string>(rides[0]?.id || '');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<string>('850');
  const [refundReason, setRefundReason] = useState<string>('Driver demanded cash after online payment');
  const [refundDestination, setRefundDestination] = useState<'wallet_credit' | 'payment_refund_pending'>('wallet_credit');
  const [refundNote, setRefundNote] = useState<string>('');

  // Driver Reimbursement
  const [reimbDriverId, setReimbDriverId] = useState<string>(drivers[0]?.id || '');
  const [reimbRideId, setReimbRideId] = useState<string>('');
  const [reimbAmount, setReimbAmount] = useState<string>('400');
  const [reimbReason, setReimbReason] = useState<string>('Motorway M-2 Toll Tax Reimbursement');
  const [reimbDestination, setReimbDestination] = useState<'driver_wallet' | 'upcoming_payout'>('driver_wallet');
  const [reimbNote, setReimbNote] = useState<string>('');

  // Financial Adjustment
  const [adjType, setAdjType] = useState<
    'ride_adjustment' | 'payment_correction' | 'overpayment_refund' | 'failed_payment_adjustment'
  >('ride_adjustment');
  const [adjTargetType, setAdjTargetType] = useState<'passenger' | 'driver'>('driver');
  const [adjTargetId, setAdjTargetId] = useState<string>(drivers[0]?.id || '');
  const [adjDirection, setAdjDirection] = useState<'credit' | 'debit'>('credit');
  const [adjAmount, setAdjAmount] = useState<string>('300');
  const [adjReason, setAdjReason] = useState<string>('AC surcharge correction');
  const [adjRideId, setAdjRideId] = useState<string>('');
  const [adjNote, setAdjNote] = useState<string>('');

  // Ledger Filter States
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('all');
  const [ledgerPartyFilter, setLedgerPartyFilter] = useState<string>('all');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');

  // Selected ride for passenger refund calculation
  const selectedRefundRide = useMemo(() => {
    return rides.find((r) => r.id === refundRideId) || rides[0];
  }, [rides, refundRideId]);

  // Selected driver for reimbursement
  const selectedReimbDriver = useMemo(() => {
    return drivers.find((d) => d.id === reimbDriverId) || drivers[0];
  }, [drivers, reimbDriverId]);

  // Metrics
  const totalRefundsProcessed = passengerRefunds
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalReimbursementsProcessed = driverReimbursements
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingApprovalsCount =
    passengerRefunds.filter((r) => r.status === 'pending').length +
    driverReimbursements.filter((r) => r.status === 'pending').length;

  const discrepanciesCount = reconciliationRecords.filter((r) => r.status === 'discrepancy').length;
  const anomaliesCount = aiFinancialAnomalies.filter((a) => a.status === 'active').length;

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return comprehensiveTransactions.filter((tx) => {
      if (ledgerTypeFilter !== 'all' && tx.type !== ledgerTypeFilter) return false;
      if (ledgerPartyFilter !== 'all' && tx.partyType !== ledgerPartyFilter) return false;

      if (ledgerSearchQuery.trim()) {
        const q = ledgerSearchQuery.toLowerCase();
        const matchesId = tx.transactionId.toLowerCase().includes(q);
        const matchesParty = tx.partyName.toLowerCase().includes(q) || tx.partyPhone?.includes(q);
        const matchesRide = tx.rideCode?.toLowerCase().includes(q);
        const matchesReason = tx.reason.toLowerCase().includes(q);
        return matchesId || matchesParty || matchesRide || matchesReason;
      }
      return true;
    });
  }, [comprehensiveTransactions, ledgerTypeFilter, ledgerPartyFilter, ledgerSearchQuery]);

  // Handle Form Submit for Financial Action Modal
  const handleExecuteFinancialAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedActionType === 'passenger_refund') {
      if (!selectedRefundRide) {
        showToast('Please select a valid ride.', 'error');
        return;
      }
      const amt = Number(refundAmount);
      if (amt <= 0) {
        showToast('Refund amount must be greater than zero.', 'error');
        return;
      }

      // Check remaining refundable
      const maxRefundable = selectedRefundRide.fare; // Safety
      if (amt > maxRefundable) {
        showToast(`Cannot refund PKR ${amt}. Maximum remaining fare is PKR ${maxRefundable}.`, 'error');
        return;
      }

      processPassengerRefund({
        rideId: selectedRefundRide.id,
        rideCode: selectedRefundRide.rideCode,
        passengerId: selectedRefundRide.passenger.id,
        passengerName: selectedRefundRide.passenger.name,
        passengerPhone: selectedRefundRide.passenger.phone,
        driverId: selectedRefundRide.driver.id,
        driverName: selectedRefundRide.driver.name,
        originalFare: selectedRefundRide.fare,
        paidAmount: selectedRefundRide.fare,
        previousRefunds: 0,
        refundType,
        amount: amt,
        paymentMethod: selectedRefundRide.paymentMethod as any,
        refundDestination,
        reason: refundReason,
        note: refundNote.trim() || undefined
      });

      setShowActionModal(false);
    } else if (selectedActionType === 'driver_reimbursement') {
      if (!selectedReimbDriver) {
        showToast('Please select a driver.', 'error');
        return;
      }
      const amt = Number(reimbAmount);
      if (amt <= 0) {
        showToast('Reimbursement amount must be greater than zero.', 'error');
        return;
      }

      const linkedRide = rides.find((r) => r.id === reimbRideId);

      processDriverReimbursement({
        driverId: selectedReimbDriver.id,
        driverName: selectedReimbDriver.name,
        driverPhone: selectedReimbDriver.phone,
        driverPlate: selectedReimbDriver.vehicle.plate,
        rideId: reimbRideId || undefined,
        rideCode: linkedRide?.rideCode || undefined,
        amount: amt,
        reason: reimbReason,
        note: reimbNote.trim() || undefined,
        paymentDestination: reimbDestination
      });

      setShowActionModal(false);
    } else {
      // Adjustment
      const amt = Number(adjAmount);
      if (amt <= 0) {
        showToast('Adjustment amount must be greater than zero.', 'error');
        return;
      }

      const targetName =
        adjTargetType === 'driver'
          ? drivers.find((d) => d.id === adjTargetId)?.name || 'Driver'
          : passengers.find((p) => p.id === adjTargetId)?.name || 'Passenger';

      const linkedRide = rides.find((r) => r.id === adjRideId);

      processFinancialAdjustment({
        type: adjType,
        targetType: adjTargetType,
        targetId: adjTargetId,
        targetName,
        rideId: adjRideId || undefined,
        rideCode: linkedRide?.rideCode || undefined,
        originalAmount: amt,
        adjustmentAmount: amt,
        direction: adjDirection,
        reason: adjReason,
        note: adjNote.trim() || undefined
      });

      setShowActionModal(false);
    }
  };

  return (
    <div id="refunds-reimbursements-system" className="space-y-6 text-[#111827]">
      {/* 1. Header with Unified "FINANCIAL ACTION" button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center gap-3">
          <BackToDashboardButton />
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                Refunds, Reimbursements &amp; Settlements
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300/60">
                  Unified Resolution Desk
                </span>
              </h1>
              <p className="text-xs text-[#6B7280]">
                Single financial control area for passenger refunds, driver payouts, toll reimbursements, and ledger reconciliation
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowThresholdModal(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer border border-slate-200 flex items-center gap-1.5"
            title="Configure High-Value Approval Threshold"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>Threshold: PKR {approvalThreshold.toLocaleString()}</span>
          </button>

          {/* Unified "FINANCIAL ACTION" Primary Button */}
          <button
            id="btn-open-financial-action-modal"
            onClick={() => setShowActionModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer border border-amber-500/40"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>FINANCIAL ACTION</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Total Passenger Refunds</span>
          <div className="text-xl font-black text-emerald-700 mt-1">PKR {totalRefundsProcessed.toLocaleString()}</div>
          <span className="text-[11px] text-[#6B7280]">{passengerRefunds.length} recorded operations</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Driver Reimbursements</span>
          <div className="text-xl font-black text-blue-700 mt-1">PKR {totalReimbursementsProcessed.toLocaleString()}</div>
          <span className="text-[11px] text-[#6B7280]">Tolls, no-shows &amp; fuel</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Pending Authorization</span>
          <div className="text-xl font-black text-amber-600 mt-1">{pendingApprovalsCount}</div>
          <span className="text-[11px] text-amber-800 font-semibold">Exceeds PKR {approvalThreshold.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Audit Discrepancies</span>
          <div className="text-xl font-black text-rose-600 mt-1">{discrepanciesCount}</div>
          <span className="text-[11px] text-rose-700 font-semibold">Action required</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">AI Anomaly Flags</span>
          <div className="text-xl font-black text-indigo-700 mt-1">{anomaliesCount}</div>
          <span className="text-[11px] text-indigo-700 font-semibold">Continuous audit watch</span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-3 py-2 rounded-2xl shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSection('resolutions')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'resolutions'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Active Resolutions ({passengerRefunds.length + driverReimbursements.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('ledger')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'ledger'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Comprehensive Transaction Ledger ({comprehensiveTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('reconciliation')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'reconciliation'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Reconciliation Desk</span>
            {discrepanciesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSection('settlements')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'settlements'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Daily Settlement Foundation</span>
          </button>

          <button
            onClick={() => setActiveSection('ai_anomalies')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'ai_anomalies'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Assistant Audit ({aiFinancialAnomalies.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('app_previews')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'app_previews'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs border border-amber-500/30'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-amber-50/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile App Previews</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION 1: ACTIVE RESOLUTIONS (REFUNDS & REIMBURSEMENTS) */}
      {/* ========================================================================= */}
      {activeSection === 'resolutions' && (
        <div className="space-y-6">
          {/* Passenger Refunds Table */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  Passenger Refund Cases ({passengerRefunds.length})
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Direct wallet refunds and gateway reversals with non-over-refund safety guards
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Refund ID &amp; Date</th>
                    <th className="py-3 px-4">Passenger</th>
                    <th className="py-3 px-4">Ride &amp; Driver</th>
                    <th className="py-3 px-4">Type &amp; Amount</th>
                    <th className="py-3 px-4">Reason &amp; Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {passengerRefunds.map((r) => {
                    const isPending = r.status === 'pending';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.refundCode}</div>
                          <div className="text-[11px] text-[#6B7280]">{r.createdAt}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.passengerName}</div>
                          <div className="text-[11px] text-[#6B7280]">{r.passengerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => openUniversalDetail('ride', r.rideId)}
                            className="font-bold text-[#0F766E] hover:underline"
                          >
                            {r.rideCode}
                          </button>
                          <div className="text-[11px] text-[#6B7280]">Driver: {r.driverName}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-emerald-700">PKR {r.amount.toLocaleString()}</div>
                          <div className="text-[10px] text-[#6B7280] capitalize">
                            {r.refundType} (Original: PKR {r.paidAmount})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate" title={r.reason}>
                            {r.reason}
                          </div>
                          <div className="text-[10px] text-[#6B7280] capitalize">
                            Dest: {r.refundDestination.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isPending ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              Approval Required
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isPending ? (
                            <button
                              onClick={() => {
                                setPendingApprovalRecord({
                                  category: 'refund',
                                  id: r.id,
                                  code: r.refundCode,
                                  amount: r.amount,
                                  party: r.passengerName,
                                  reason: r.reason
                                });
                                setShowApprovalModal(true);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                            >
                              Authorize
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#6B7280] font-semibold">
                              ✓ Executed ({r.approvedBy})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Reimbursements Table */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Driver Reimbursements ({driverReimbursements.length})
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Toll taxes, passenger no-show compensations, parking, and administrative credits
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Reimbursement ID</th>
                    <th className="py-3 px-4">Driver Profile</th>
                    <th className="py-3 px-4">Linked Ride</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reason &amp; Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {driverReimbursements.map((rmb) => {
                    const isPending = rmb.status === 'pending';
                    return (
                      <tr key={rmb.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{rmb.reimbursementCode}</div>
                          <div className="text-[11px] text-[#6B7280]">{rmb.createdAt}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{rmb.driverName}</div>
                          <div className="text-[11px] text-[#6B7280]">
                            {rmb.driverPlate} • {rmb.driverPhone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {rmb.rideCode ? (
                            <span className="font-bold text-[#0F766E]">{rmb.rideCode}</span>
                          ) : (
                            <span className="text-[#6B7280]">General fleet</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-blue-700">PKR {rmb.amount.toLocaleString()}</div>
                          <div className="text-[10px] text-[#6B7280] capitalize">
                            Dest: {rmb.paymentDestination.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate" title={rmb.reason}>
                            {rmb.reason}
                          </div>
                          <div className="text-[11px] text-[#6B7280] truncate" title={rmb.note}>
                            {rmb.note}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isPending ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              Approval Required
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isPending ? (
                            <button
                              onClick={() => {
                                setPendingApprovalRecord({
                                  category: 'reimbursement',
                                  id: rmb.id,
                                  code: rmb.reimbursementCode,
                                  amount: rmb.amount,
                                  party: rmb.driverName,
                                  reason: rmb.reason
                                });
                                setShowApprovalModal(true);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                            >
                              Authorize
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#6B7280] font-semibold">
                              ✓ Credited ({rmb.approvedBy})
                            </span>
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
      {/* 5. SECTION 2: COMPREHENSIVE TRANSACTION LEDGER */}
      {/* ========================================================================= */}
      {activeSection === 'ledger' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ledgerSearchQuery}
                  onChange={(e) => setLedgerSearchQuery(e.target.value)}
                  placeholder="Search Tx ID, Ride Code, Driver, Passenger..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={ledgerTypeFilter}
                onChange={(e) => setLedgerTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All 9 Transaction Types</option>
                <option value="Ride Payment">Ride Payment</option>
                <option value="Refund">Refund</option>
                <option value="Reimbursement">Reimbursement</option>
                <option value="Fine">Fine</option>
                <option value="Fine Refund">Fine Refund</option>
                <option value="Commission">Commission</option>
                <option value="Service Charge">Service Charge</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Payout">Payout</option>
              </select>

              {/* Party Filter */}
              <select
                value={ledgerPartyFilter}
                onChange={(e) => setLedgerPartyFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Parties</option>
                <option value="driver">Driver</option>
                <option value="passenger">Passenger</option>
                <option value="platform">GoLife Platform</option>
              </select>
            </div>

            <div className="text-xs text-[#6B7280] font-semibold">
              Showing <span className="font-bold text-slate-900">{filteredLedger.length}</span> ledger entries
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Transaction ID &amp; Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Party &amp; Ride</th>
                    <th className="py-3 px-4">Original Amount</th>
                    <th className="py-3 px-4">Net Impact</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Reason / Rule</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredLedger.map((tx) => {
                    const isPositive = tx.netImpact >= 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{tx.transactionId}</div>
                          <div className="text-[11px] text-[#6B7280]">{tx.date}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.type === 'Ride Payment'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tx.type === 'Refund'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : tx.type === 'Reimbursement'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : tx.type === 'Fine'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 capitalize">
                            {tx.partyName} ({tx.partyType})
                          </div>
                          {tx.rideCode && (
                            <div className="text-[11px] text-[#0F766E] font-semibold">{tx.rideCode}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[#6B7280]">
                          PKR {tx.originalAmount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 font-black">
                          {isPositive ? (
                            <span className="text-emerald-700">+PKR {tx.netImpact.toLocaleString()}</span>
                          ) : (
                            <span className="text-rose-600">-PKR {Math.abs(tx.netImpact).toLocaleString()}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-[#6B7280]">{tx.paymentMethod}</td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate" title={tx.reason}>
                            {tx.reason}
                          </div>
                          <div className="text-[10px] text-[#6B7280]">{tx.ruleOrSource}</div>
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
      {/* 6. SECTION 3: RECONCILIATION DESK */}
      {/* ========================================================================= */}
      {activeSection === 'reconciliation' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                Financial Reconciliation &amp; Discrepancy Desk
              </h2>
              <p className="text-xs text-[#6B7280]">
                Continuous cross-check of Ride Record Fare, Recorded Payment, Driver Ledger, and GoLife 15% Platform Commission
              </p>
            </div>
            <button
              onClick={runReconciliationAudit}
              className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition cursor-pointer border border-amber-500/40 shadow-xs"
            >
              Run Audit Engine
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#6B7280] uppercase tracking-wider font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Ride Code &amp; Date</th>
                    <th className="py-3 px-4">Expected Ride Fare</th>
                    <th className="py-3 px-4">Payment Captured</th>
                    <th className="py-3 px-4">Driver Ledger Credit</th>
                    <th className="py-3 px-4">GoLife 15% Commission</th>
                    <th className="py-3 px-4">Discrepancy</th>
                    <th className="py-3 px-4">Status &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {reconciliationRecords.map((rec) => {
                    const isDiscrepancy = rec.status === 'discrepancy';
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{rec.rideCode}</div>
                          <div className="text-[10px] text-[#6B7280]">{rec.driverName}</div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          PKR {rec.rideRecordFare.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          PKR {rec.paymentRecorded.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-emerald-700">
                          PKR {rec.driverLedgerAmount.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-amber-700">
                          PKR {rec.commissionAmount.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          {isDiscrepancy ? (
                            <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              -PKR {rec.differenceAmount} Discrepancy
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold">Matched (PKR 0)</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isDiscrepancy ? (
                            <button
                              onClick={() => {
                                resolveReconciliationRecord(rec.id, 'Cash collected short corrected via wallet adjustment');
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                            >
                              Resolve Discrepancy
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                            </span>
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
      {/* 7. SECTION 4: DAILY SETTLEMENT FOUNDATION */}
      {/* ========================================================================= */}
      {activeSection === 'settlements' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Driver Daily Settlement Foundation
            </h2>
            <p className="text-xs text-[#6B7280]">
              Automated end-of-day balances accounting for gross ride earnings, 15% platform commissions, fines deducted, and approved reimbursements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailySettlements.map((s) => (
              <div key={s.id} className="p-5 rounded-3xl bg-white border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{s.driverName}</h3>
                    <div className="text-[11px] text-[#6B7280]">{s.date} • Settlement ID: {s.id}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s.status.toUpperCase()}
                  </span>
                </div>

                {/* Settlement Line Items */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Opening Balance:</span>
                    <span className="font-semibold text-slate-800">PKR {s.openingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>+ Gross Ride Earnings:</span>
                    <span className="font-bold">+PKR {s.rideEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>- GoLife Commission (15%):</span>
                    <span className="font-bold">-PKR {s.commissionDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>- Fine / Penalties Deducted:</span>
                    <span className="font-bold">-PKR {s.finesDeducted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>+ Approved Reimbursements:</span>
                    <span className="font-bold">+PKR {s.reimbursementsAdded.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6B7280]">Net Driver Payout</span>
                    <div className="text-base font-black text-slate-950">PKR {s.netPayout.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280]">Closing Balance</span>
                    <div className="text-base font-black text-emerald-700">PKR {s.closingBalance.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SECTION 5: AI FINANCIAL ASSISTANT */}
      {/* ========================================================================= */}
      {activeSection === 'ai_anomalies' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Financial Assistant &amp; Fraud Telematics Watchdog
            </h2>
            <p className="text-xs text-[#6B7280]">
              Automated pattern detection for duplicate refunds, abnormal toll submissions, and repeat driver fine disputes
            </p>
          </div>

          <div className="space-y-3">
            {aiFinancialAnomalies.map((anom) => (
              <div
                key={anom.id}
                className={`p-4 rounded-2xl border transition-all ${
                  anom.status === 'dismissed'
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-[#E5E7EB] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          anom.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : anom.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {anom.severity.toUpperCase()} SEVERITY
                      </span>
                      <span className="text-xs font-bold text-slate-900">{anom.title}</span>
                      <span className="text-[11px] text-[#6B7280]">• {anom.detectedAt}</span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{anom.description}</p>

                    <div className="mt-2 text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                      <span className="font-bold">AI Suggestion: </span>
                      {anom.suggestedAction}
                    </div>
                  </div>

                  {anom.status !== 'dismissed' && (
                    <button
                      onClick={() => dismissFinancialAnomaly(anom.id)}
                      className="px-3 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SECTION 6: APP PREVIEWS (PASSENGER & DRIVER TRANSPARENCY) */}
      {/* ========================================================================= */}
      {activeSection === 'app_previews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passenger App Preview */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Passenger Mobile App: Wallet &amp; Refund Status
            </h3>

            <div className="max-w-xs mx-auto bg-slate-950 p-3 rounded-[36px] shadow-xl border-4 border-slate-800">
              <div className="bg-[#F8FAFC] rounded-[24px] overflow-hidden p-3.5 space-y-3 min-h-[420px] text-xs">
                <div className="bg-slate-900 text-white p-3 rounded-2xl">
                  <div className="text-[10px] text-amber-400 font-bold">GoLife Wallet</div>
                  <div className="text-lg font-black mt-1">PKR 1,450</div>
                  <div className="text-[10px] text-slate-400">Available for instant rides</div>
                </div>

                <div className="font-bold text-xs text-slate-900">Recent Transactions</div>

                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-700">+ PKR 400</span>
                    <span className="text-[9px] text-[#6B7280]">Today, 02:40 PM</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900">Refund: Fare Adjustment</div>
                  <div className="text-[10px] text-[#6B7280]">
                    Ride RIDE-PK-77412 • Credited back to GoLife Wallet
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-rose-600">- PKR 850</span>
                    <span className="text-[9px] text-[#6B7280]">Yesterday</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900">Ride Payment: DHA to Gulberg</div>
                  <div className="text-[10px] text-[#6B7280]">Paid via JazzCash Wallet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver App Preview */}
          <div className="bg-white p-5 rounded-3xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Driver Mobile App: Weekly Settlement Breakdown
            </h3>

            <div className="max-w-xs mx-auto bg-slate-950 p-3 rounded-[36px] shadow-xl border-4 border-slate-800">
              <div className="bg-[#F8FAFC] rounded-[24px] overflow-hidden p-3.5 space-y-3 min-h-[420px] text-xs">
                <div className="bg-slate-900 text-white p-3 rounded-2xl">
                  <div className="text-[10px] text-amber-400 font-bold">Weekly Earnings Summary</div>
                  <div className="text-lg font-black mt-1">PKR 21,350</div>
                  <div className="text-[10px] text-emerald-400">Net payout ready for transfer</div>
                </div>

                <div className="font-bold text-xs text-slate-900">Itemized Adjustments</div>

                <div className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-blue-700">+ PKR 400</span>
                    <span className="text-[9px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">Reimbursement</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900">M-2 Motorway Toll Refund</div>
                  <div className="text-[10px] text-[#6B7280]">Approved by Admin Operations</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-rose-600">- PKR 500</span>
                    <span className="text-[9px] text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded">Penalty</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900">Excessive Late Pickup (&gt;15m)</div>
                  <div className="text-[10px] text-[#6B7280]">Deducted with balance protection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: UNIFIED FINANCIAL ACTION MODAL */}
      {/* ========================================================================= */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Execute Financial Resolution Action</h3>
                <p className="text-[11px] text-slate-400">
                  Single operational gateway for refunds, reimbursements, and corrections
                </p>
              </div>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Action Type Selector */}
            <div className="p-4 bg-slate-50 border-b border-[#E5E7EB] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedActionType('passenger_refund')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  selectedActionType === 'passenger_refund'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
                }`}
              >
                Passenger Refund
              </button>
              <button
                type="button"
                onClick={() => setSelectedActionType('driver_reimbursement')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  selectedActionType === 'driver_reimbursement'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
                }`}
              >
                Driver Reimbursement
              </button>
              <button
                type="button"
                onClick={() => setSelectedActionType('ride_adjustment')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  selectedActionType === 'ride_adjustment'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
                }`}
              >
                Ledger Adjustment
              </button>
            </div>

            {/* Dynamic Form Content */}
            <form onSubmit={handleExecuteFinancialAction} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* --- ACTION 1: PASSENGER REFUND --- */}
              {selectedActionType === 'passenger_refund' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Select Target Ride</label>
                    <select
                      value={refundRideId}
                      onChange={(e) => {
                        setRefundRideId(e.target.value);
                        const r = rides.find((rd) => rd.id === e.target.value);
                        if (r) setRefundAmount(r.fare.toString());
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                    >
                      {rides.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.rideCode} • {r.passenger.name} (Fare: PKR {r.fare}) • Driver: {r.driver.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Refund Scope</label>
                      <select
                        value={refundType}
                        onChange={(e) => {
                          const type = e.target.value as 'full' | 'partial';
                          setRefundType(type);
                          if (selectedRefundRide) {
                            setRefundAmount(
                              type === 'full'
                                ? selectedRefundRide.fare.toString()
                                : Math.round(selectedRefundRide.fare / 2).toString()
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                      >
                        <option value="full">Full Fare Refund</option>
                        <option value="partial">Partial Refund</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Amount (PKR)</label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none focus:border-amber-500"
                        max={selectedRefundRide?.fare || 10000}
                        min="1"
                        required
                      />
                      <span className="text-[10px] text-[#6B7280]">
                        Max allowable: PKR {selectedRefundRide?.fare || 0}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Reason Category</label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                    >
                      <option value="Driver demanded cash after online payment">Driver demanded cash after online payment</option>
                      <option value="Cancelled by driver after payment deduction">Cancelled by driver after payment deduction</option>
                      <option value="App telemetry charging error">App telemetry charging error</option>
                      <option value="Poor ride experience / Vehicle breakdown">Poor ride experience / Vehicle breakdown</option>
                      <option value="Incorrect route detour / excessive fare">Incorrect route detour / excessive fare</option>
                      <option value="Passenger cancelled within free 3-minute window">Passenger cancelled within free window</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Refund Channel</label>
                    <select
                      value={refundDestination}
                      onChange={(e) => setRefundDestination(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                    >
                      <option value="wallet_credit">Instant GoLife Passenger Wallet Credit</option>
                      <option value="payment_refund_pending">Original Payment Gateway Refund (Pending)</option>
                    </select>
                  </div>
                </>
              )}

              {/* --- ACTION 2: DRIVER REIMBURSEMENT --- */}
              {selectedActionType === 'driver_reimbursement' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Select Driver</label>
                    <select
                      value={reimbDriverId}
                      onChange={(e) => setReimbDriverId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                    >
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.vehicle.plate} • {d.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Amount (PKR)</label>
                      <input
                        type="number"
                        value={reimbAmount}
                        onChange={(e) => setReimbAmount(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none focus:border-amber-500"
                        min="50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Destination</label>
                      <select
                        value={reimbDestination}
                        onChange={(e) => setReimbDestination(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                      >
                        <option value="driver_wallet">Driver Wallet (Instant)</option>
                        <option value="upcoming_payout">Upcoming Weekly Settlement Payout</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Reimbursement Reason</label>
                    <select
                      value={reimbReason}
                      onChange={(e) => setReimbReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                    >
                      <option value="Motorway M-2 Toll Tax Reimbursement">Motorway M-2 Toll Tax Reimbursement</option>
                      <option value="Passenger No-Show Compensation">Passenger No-Show Compensation</option>
                      <option value="Erroneous fine reversal credit">Erroneous fine reversal credit</option>
                      <option value="Airport Parking / Terminal Entry Fee">Airport Parking / Terminal Entry Fee</option>
                      <option value="Emergency tire assistance compensation">Emergency tire assistance compensation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Link to Ride (Optional)</label>
                    <select
                      value={reimbRideId}
                      onChange={(e) => setReimbRideId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
                    >
                      <option value="">No specific ride linked</option>
                      {rides.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.rideCode} • {r.pickupLocation.name.slice(0, 15)}...
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* --- ACTION 3: LEDGER ADJUSTMENT --- */}
              {selectedActionType === 'ride_adjustment' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Adjustment Type</label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                      >
                        <option value="ride_adjustment">Ride Fare Adjustment</option>
                        <option value="payment_correction">Payment Correction</option>
                        <option value="overpayment_refund">Overpayment Correction</option>
                        <option value="failed_payment_adjustment">Failed Payment Adjustment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Target Party</label>
                      <select
                        value={adjTargetType}
                        onChange={(e) => {
                          const t = e.target.value as 'passenger' | 'driver';
                          setAdjTargetType(t);
                          setAdjTargetId(t === 'driver' ? drivers[0]?.id : passengers[0]?.id);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                      >
                        <option value="driver">Driver Account</option>
                        <option value="passenger">Passenger Account</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Account Target</label>
                    <select
                      value={adjTargetId}
                      onChange={(e) => setAdjTargetId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                    >
                      {adjTargetType === 'driver'
                        ? drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.vehicle.plate})
                            </option>
                          ))
                        : passengers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.phone})
                            </option>
                          ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Direction</label>
                      <select
                        value={adjDirection}
                        onChange={(e) => setAdjDirection(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                      >
                        <option value="credit">Credit (+) To User</option>
                        <option value="debit">Debit (-) From User</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">Amount (PKR)</label>
                      <input
                        type="number"
                        value={adjAmount}
                        onChange={(e) => setAdjAmount(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none"
                        min="10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Adjustment Reason</label>
                    <input
                      type="text"
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
                      placeholder="e.g. AC fee surcharge waiver"
                    />
                  </div>
                </>
              )}

              {/* Threshold Warning Banner */}
              {((selectedActionType === 'passenger_refund' && Number(refundAmount) >= approvalThreshold) ||
                (selectedActionType === 'driver_reimbursement' && Number(reimbAmount) >= approvalThreshold)) && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Amount meets or exceeds high-value threshold (PKR {approvalThreshold.toLocaleString()}). This transaction will be placed into the Pending Approvals queue.
                  </span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs cursor-pointer border border-amber-500/40"
                >
                  Execute Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. MODAL: HIGH-VALUE APPROVAL CONFIRMATION */}
      {/* ========================================================================= */}
      {showApprovalModal && pendingApprovalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Authorize High-Value Action</h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              Authorization required for transactions &gt;= PKR {approvalThreshold.toLocaleString()}.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div>
                <span className="text-[#6B7280]">Record ID:</span>{' '}
                <span className="font-bold text-slate-900">{pendingApprovalRecord.code}</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Party:</span>{' '}
                <span className="font-bold text-slate-900">{pendingApprovalRecord.party}</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Amount:</span>{' '}
                <span className="font-black text-slate-950">
                  PKR {pendingApprovalRecord.amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280]">Reason:</span>{' '}
                <span className="font-semibold text-slate-800">{pendingApprovalRecord.reason}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Authorization Note</label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => {
                  rejectFinancialRecord(
                    pendingApprovalRecord.category as any,
                    pendingApprovalRecord.id,
                    'Declined by executive authorization review'
                  );
                  setShowApprovalModal(false);
                }}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                Reject Record
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    approveFinancialRecord(
                      pendingApprovalRecord.category,
                      pendingApprovalRecord.id,
                      approvalNote
                    );
                    setShowApprovalModal(false);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                >
                  Approve &amp; Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. MODAL: CONFIGURE THRESHOLD */}
      {/* ========================================================================= */}
      {showThresholdModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Configure Approval Threshold</h3>
            <p className="text-xs text-[#6B7280]">
              Any refund or reimbursement equal to or higher than this PKR amount will automatically trigger secondary administrative approval.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Threshold Limit (PKR)</label>
              <input
                type="number"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                min="500"
                step="500"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowThresholdModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = Number(thresholdInput);
                  if (val > 0) {
                    updateApprovalThreshold(val);
                    setShowThresholdModal(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 cursor-pointer"
              >
                Save Threshold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
