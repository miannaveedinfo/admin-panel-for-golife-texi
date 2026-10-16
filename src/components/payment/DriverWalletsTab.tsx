import React, { useState } from 'react';
import {
  DriverWallet,
  CentralPaymentTransaction,
  WalletLedgerEntry
} from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import { useAdmin } from '../../context/AdminContext';
import { adjustDriverWalletWithAudit } from '../../services/centralPaymentService';
import {
  Wallet,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  MinusCircle,
  ShieldCheck,
  AlertTriangle,
  History,
  X,
  FileText,
  UserCheck,
  Coins,
  CheckCircle2,
  Lock,
  Calendar,
  Smartphone,
  Check,
  Receipt,
  User
} from 'lucide-react';

interface DriverWalletsTabProps {
  wallets: DriverWallet[];
  transactions: CentralPaymentTransaction[];
  onAddBalance: (
    driverId: string,
    amount: number,
    type: 'topup_credit' | 'wallet_adjustment' | 'fine_deduction',
    description: string
  ) => void;
}

export const DriverWalletsTab: React.FC<DriverWalletsTabProps> = ({
  wallets,
  transactions,
  onAddBalance
}) => {
  const { currentAdmin, showToast, logAction } = useAdmin();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');

  // Point 1: Selected Driver for Full Wallet Overview
  const [selectedDriver, setSelectedDriver] = useState<DriverWallet | null>(wallets[0] || null);

  // Drawer / Modals
  const [selectedWalletForLedger, setSelectedWalletForLedger] = useState<DriverWallet | null>(null);

  // Point 6: Manual Adjustment State
  const [adjustModalDriver, setAdjustModalDriver] = useState<DriverWallet | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('1000');
  const [adjustReason, setAdjustReason] = useState('Promotional Incentive Credit');
  const [adjustReference, setAdjustReference] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false);
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Calculations
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalPending = wallets.reduce((acc, w) => acc + w.pendingBalance, 0);
  const totalPayable = wallets.reduce((acc, w) => acc + w.payableBalance, 0);
  const totalOutstandingDeductions = wallets.reduce((acc, w) => acc + w.outstandingDeductions, 0);

  // Filtered wallets by Name, ID, Phone, Status
  const filteredWallets = wallets.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      w.driverName.toLowerCase().includes(q) ||
      w.driverId.toLowerCase().includes(q) ||
      w.driverPhone.includes(q) ||
      w.driverPlate.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

    let matchesBalance = true;
    if (balanceFilter === 'positive') matchesBalance = w.balance > 0;
    else if (balanceFilter === 'negative') matchesBalance = w.balance < 0;
    else if (balanceFilter === 'dues') matchesBalance = w.outstandingDeductions > 0;

    return matchesSearch && matchesStatus && matchesBalance;
  });

  // Selected driver transactions & last transaction helper
  const getDriverTransactions = (driverId: string) => {
    return transactions.filter((t) => t.userId === driverId);
  };

  const getDriverLastTransaction = (driverId: string) => {
    const dTx = getDriverTransactions(driverId);
    return dTx.length > 0 ? dTx[0] : null;
  };

  const driverLedger = selectedWalletForLedger
    ? getDriverTransactions(selectedWalletForLedger.driverId)
    : [];

  // Initiate adjustment modal
  const handleOpenAdjustModal = (driver: DriverWallet, defaultType: 'credit' | 'debit' = 'credit') => {
    setAdjustModalDriver(driver);
    setAdjustType(defaultType);
    setAdjustAmount('1000');
    setAdjustReason(defaultType === 'credit' ? 'Promotional Incentive Credit' : 'Violation Fine Debit');
    setAdjustReference(`REF-${Date.now().toString().slice(-6)}`);
    setCustomNote('');
    setShowAdminConfirmModal(false);
  };

  // Step 1: Open Confirmation Dialog
  const handleInitiateConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid adjustment amount above 0 PKR', 'error');
      return;
    }
    setShowAdminConfirmModal(true);
  };

  // Step 2: Finalize Adjustment with Admin Confirmation & Full Audit Log
  const handleFinalConfirmAdjustment = () => {
    if (!adjustModalDriver) return;
    const amt = Number(adjustAmount);
    const fullReason = customNote ? `${adjustReason}: ${customNote}` : adjustReason;
    const ref = adjustReference || `ADJ-${Date.now()}`;
    const adminActor = currentAdmin?.name || 'Super Admin';
    const adminId = currentAdmin?.id || 'admin-01';

    try {
      const res = adjustDriverWalletWithAudit({
        currentWallets: wallets,
        currentTransactions: transactions,
        driverId: adjustModalDriver.driverId,
        adjustmentType: adjustType,
        amount: amt,
        reason: fullReason,
        reference: ref,
        adminId,
        adminName: adminActor,
        confirmedByAdmin: true
      });

      // Update parent context
      onAddBalance(
        adjustModalDriver.driverId,
        amt,
        adjustType === 'credit' ? 'wallet_adjustment' : 'fine_deduction',
        `${fullReason} [Ref: ${ref}]`
      );

      // Log in central admin audit system
      logAction(
        'DRIVER_WALLET_MANUAL_ADJUSTMENT',
        `wallets/${adjustModalDriver.driverId}`,
        `Admin ${adjustType} adjustment of PKR ${amt} applied.`,
        res.auditLog
      );

      showToast(
        `Wallet ${adjustType === 'credit' ? 'credited' : 'debited'} with PKR ${amt.toLocaleString()} successfully. Audit log recorded.`,
        'success'
      );

      // Refresh selected driver preview if matches
      if (selectedDriver?.driverId === adjustModalDriver.driverId) {
        const updated = res.updatedWallets.find((w) => w.driverId === adjustModalDriver.driverId);
        if (updated) setSelectedDriver(updated);
      }

      setShowAdminConfirmModal(false);
      setAdjustModalDriver(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust driver wallet', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Wallet Balance
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {formatPKR(totalBalance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {wallets.length} registered driver wallets
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available / Payable Balance
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {formatPKR(totalPayable)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Eligible for cashout (after Rs 500 reserve)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Amount
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-2">
            {formatPKR(totalPending)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting provider gateway clearing</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Outstanding Dues / Fines
            </span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono mt-2">
            {formatPKR(totalOutstandingDeductions)}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Unpaid platform commission or negative balances</p>
        </div>
      </div>

      {/* Point 1: SELECTED DRIVER DETAIL INSPECTOR */}
      {selectedDriver && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-400/10 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                {selectedDriver.driverName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {selectedDriver.driverName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                    ID: {selectedDriver.driverId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedDriver.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedDriver.status === 'restricted'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {selectedDriver.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-3 mt-1">
                  <span>Phone: {selectedDriver.driverPhone}</span>
                  <span>•</span>
                  <span>Vehicle: {selectedDriver.driverPlate} ({selectedDriver.driverCity})</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenAdjustModal(selectedDriver, 'credit')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Adjust Wallet</span>
              </button>

              <button
                onClick={() => setSelectedWalletForLedger(selectedDriver)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>View Full Ledger</span>
              </button>
            </div>
          </div>

          {/* 6 Core Financial Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Current Wallet Balance
              </span>
              <div className="text-base font-black font-mono text-amber-400 mt-1">
                {formatPKR(selectedDriver.balance)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Available Balance
              </span>
              <div className="text-base font-black font-mono text-emerald-400 mt-1">
                {formatPKR(selectedDriver.payableBalance)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Pending Amount
              </span>
              <div className="text-base font-black font-mono text-blue-400 mt-1">
                {formatPKR(selectedDriver.pendingBalance)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Total Top Ups
              </span>
              <div className="text-base font-black font-mono text-white mt-1">
                {formatPKR(selectedDriver.totalTopUps)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Total Fees Deducted
              </span>
              <div className="text-base font-black font-mono text-rose-300 mt-1">
                {formatPKR(selectedDriver.totalFees || Math.round(selectedDriver.totalTopUps * 0.01))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Last Transaction
              </span>
              {(() => {
                const lastTx = getDriverLastTransaction(selectedDriver.driverId);
                return lastTx ? (
                  <div className="mt-1">
                    <div className="font-mono font-bold text-white text-[11px] truncate">
                      {lastTx.walletEffect > 0 ? '+' : ''}{formatPKR(lastTx.walletEffect || lastTx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {lastTx.timestamp.split(' ')[0]}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 mt-1">No transactions</div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Control, Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search driver by Name, ID, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="frozen">Frozen</option>
            </select>

            {/* Balance Filter */}
            <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Balances</option>
              <option value="positive">Positive Balance</option>
              <option value="negative">Negative Balance</option>
              <option value="dues">Has Outstanding Dues</option>
            </select>
          </div>
        </div>

        {/* Drivers Wallet Management Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Driver Profile</th>
                <th className="py-3 px-4">Phone / City</th>
                <th className="py-3 px-4 text-right">Current Balance</th>
                <th className="py-3 px-4 text-right">Available Balance</th>
                <th className="py-3 px-4 text-right">Pending Amount</th>
                <th className="py-3 px-4 text-right">Total Top Ups</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredWallets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No driver wallets found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredWallets.map((w) => {
                  const isSelected = selectedDriver?.driverId === w.driverId;

                  return (
                    <tr
                      key={w.driverId}
                      onClick={() => setSelectedDriver(w)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-amber-50/70 border-l-4 border-l-amber-500 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                            {w.driverName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {w.driverName}
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                {w.driverId}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{w.driverPlate}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700">{w.driverPhone}</div>
                        <div className="text-[10px] text-slate-500">{w.driverCity}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-black font-mono text-sm ${
                            w.balance < 0 ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {formatPKR(w.balance)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                        {formatPKR(w.payableBalance)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-blue-600 font-bold">
                        {w.pendingBalance > 0 ? formatPKR(w.pendingBalance) : '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700 font-semibold">
                        {formatPKR(w.totalTopUps)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'restricted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAdjustModal(w, 'credit')}
                            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Adjust wallet balance"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Adjust</span>
                          </button>

                          <button
                            onClick={() => setSelectedWalletForLedger(w)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="View full immutable transaction ledger"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Ledger</span>
                          </button>
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

      {/* Point 6: DRIVER WALLET MANUAL ADJUSTMENT MODAL */}
      {adjustModalDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-amber-400 border-b border-amber-500/30 flex items-center justify-between text-slate-950">
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-slate-950" />
                  Driver Wallet Manual Adjustment
                </h3>
                <p className="text-[11px] text-slate-900/80 mt-0.5">
                  Authorized financial mutation with strict admin confirmation &amp; audit logging
                </p>
              </div>
              <button
                onClick={() => setAdjustModalDriver(null)}
                className="p-1 rounded-lg hover:bg-black/10 text-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateConfirm} className="p-5 space-y-4">
              {/* Target Driver Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{adjustModalDriver.driverName}</div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    ID: {adjustModalDriver.driverId} • {adjustModalDriver.driverPhone}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Balance</span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {formatPKR(adjustModalDriver.balance)}
                  </span>
                </div>
              </div>

              {/* Adjustment Type: Credit vs Debit */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      adjustType === 'credit'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjType"
                      checked={adjustType === 'credit'}
                      onChange={() => {
                        setAdjustType('credit');
                        setAdjustReason('Promotional Incentive Credit');
                      }}
                      className="text-emerald-600 focus:ring-emerald-400"
                    />
                    <div className="flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <span>Credit (Add Funds)</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      adjustType === 'debit'
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjType"
                      checked={adjustType === 'debit'}
                      onChange={() => {
                        setAdjustType('debit');
                        setAdjustReason('Violation Fine Debit');
                      }}
                      className="text-rose-600 focus:ring-rose-400"
                    />
                    <div className="flex items-center gap-1.5">
                      <MinusCircle className="w-4 h-4 text-rose-600" />
                      <span>Debit (Deduct Funds)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Amount & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={adjustReference}
                    onChange={(e) => setAdjustReference(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. ADJ-991283"
                    required
                  />
                </div>
              </div>

              {/* Reason Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason Category</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {adjustType === 'credit' ? (
                    <>
                      <option value="Promotional Incentive Credit">Promotional Incentive Credit</option>
                      <option value="Admin Top-Up Correction">Admin Top-Up Correction</option>
                      <option value="Toll Tax / Route Reimbursement">Toll Tax / Route Reimbursement</option>
                      <option value="Passenger Cancellation Compensation">Passenger Cancellation Compensation</option>
                      <option value="Dispute Resolution Credit">Dispute Resolution Credit</option>
                    </>
                  ) : (
                    <>
                      <option value="Violation Fine Debit">Violation Fine Debit</option>
                      <option value="Excess Commission Recovery">Excess Commission Recovery</option>
                      <option value="Customer Dispute Reversal">Customer Dispute Reversal</option>
                      <option value="Policy Violation Penalty">Policy Violation Penalty</option>
                      <option value="Administrative Deduction">Administrative Deduction</option>
                    </>
                  )}
                </select>
              </div>

              {/* Custom Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Justification Notes</label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Enter detailed justification note for permanent audit trail..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Calculation Preview */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 block">Balance Projection</span>
                  <span className="text-[10px] text-amber-700">
                    Rs {adjustModalDriver.balance} {adjustType === 'credit' ? '+' : '-'} Rs {adjustAmount || 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-800 uppercase font-bold block">Closing Balance</span>
                  <span className="font-mono font-black text-sm text-slate-950">
                    {formatPKR(
                      adjustType === 'credit'
                        ? adjustModalDriver.balance + (Number(adjustAmount) || 0)
                        : Math.max(0, adjustModalDriver.balance - (Number(adjustAmount) || 0))
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalDriver(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer shadow-xs"
                >
                  Proceed to Confirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Point 6: ADMIN CONFIRMATION DIALOG */}
      {showAdminConfirmModal && adjustModalDriver && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Admin Financial Authorization</h3>
              </div>
              <button
                onClick={() => setShowAdminConfirmModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                <p className="font-bold">
                  Confirm {adjustType.toUpperCase()} of {formatPKR(Number(adjustAmount))}?
                </p>
                <p className="text-[11px] text-amber-800">
                  Target Driver: <strong>{adjustModalDriver.driverName}</strong> ({adjustModalDriver.driverId})
                </p>
                <p className="text-[11px] text-amber-800">
                  Reference: <strong>{adjustReference}</strong>
                </p>
              </div>

              <div className="space-y-2 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Balance Before:</span>
                  <span className="font-mono font-bold">{formatPKR(adjustModalDriver.balance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Adjustment Amount:</span>
                  <span
                    className={`font-mono font-bold ${
                      adjustType === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {adjustType === 'credit' ? '+' : '-'}{formatPKR(Number(adjustAmount))}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-slate-900">
                  <span>Balance After:</span>
                  <span className="font-mono">
                    {formatPKR(
                      adjustType === 'credit'
                        ? adjustModalDriver.balance + Number(adjustAmount)
                        : Math.max(0, adjustModalDriver.balance - Number(adjustAmount))
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[10px] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Admin confirmation is permanently signed in the immutable audit log with admin ID, timestamp, and device metadata.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirmAdjustment}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer shadow-xs"
                >
                  Confirm &amp; Apply Balance Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Point 10: IMMUTABLE WALLET LEDGER DRAWER */}
      {selectedWalletForLedger && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-amber-300">
                  <History className="w-4 h-4 text-amber-400" />
                  Driver Immutable Wallet Ledger
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {selectedWalletForLedger.driverName} ({selectedWalletForLedger.driverId}) •{' '}
                  {selectedWalletForLedger.driverCity}
                </p>
              </div>
              <button
                onClick={() => setSelectedWalletForLedger(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balances Summary Banner */}
            <div className="p-4 bg-amber-400 border-b border-amber-500/30 grid grid-cols-3 gap-2 text-center text-slate-950">
              <div className="p-2 rounded-xl bg-white/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                  Current Balance
                </div>
                <div className="text-base font-black font-mono mt-0.5">
                  {formatPKR(selectedWalletForLedger.balance)}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                  Available Balance
                </div>
                <div className="text-base font-black font-mono mt-0.5">
                  {formatPKR(selectedWalletForLedger.payableBalance)}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                  Total Top Ups
                </div>
                <div className="text-base font-black font-mono mt-0.5">
                  {formatPKR(selectedWalletForLedger.totalTopUps)}
                </div>
              </div>
            </div>

            {/* Ledger List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Transaction History ({driverLedger.length})</span>
                <span className="text-[10px] font-mono text-slate-400">Append-only ledger</span>
              </div>

              {driverLedger.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No previous transactions recorded in ledger for this driver.
                </div>
              ) : (
                driverLedger.map((tx) => {
                  const isCredit = tx.walletEffect > 0;
                  const isDebit = tx.walletEffect < 0;
                  const opening = tx.balanceBefore !== undefined ? tx.balanceBefore : tx.balanceAfter - tx.walletEffect;
                  const fee = tx.fee || 0;
                  const net = tx.walletEffect || tx.amount;

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-amber-300 transition text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-700'
                                : isDebit
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 capitalize">
                              {tx.transactionType.replace(/_/g, ' ')}
                            </span>
                            <span className="ml-1.5 text-[10px] font-mono text-slate-500">
                              Ref: {tx.referenceId}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-mono font-black text-sm ${
                              isCredit
                                ? 'text-emerald-700'
                                : isDebit
                                ? 'text-rose-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {isCredit ? '+' : ''}
                            {isDebit ? '-' : ''}
                            {formatPKR(Math.abs(tx.walletEffect || tx.amount))}
                          </span>
                        </div>
                      </div>

                      {/* Point 10: Immutable Ledger Breakdown Formula */}
                      <div className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono">
                        <div>
                          <span className="text-slate-400 block uppercase">Opening:</span>
                          <span className="font-bold text-slate-700">{formatPKR(opening)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase">Gross:</span>
                          <span className="font-bold text-slate-700">{formatPKR(tx.amount)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase">Fee:</span>
                          <span className="font-bold text-rose-600">-{formatPKR(fee)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase">Closing:</span>
                          <span className="font-bold text-slate-900">{formatPKR(tx.balanceAfter)}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px]">{tx.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>{tx.timestamp}</span>
                        <span>UUID: {tx.id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-500" />
                Ledger entries are tamper-evident and immutable
              </span>
              <button
                onClick={() => setSelectedWalletForLedger(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
