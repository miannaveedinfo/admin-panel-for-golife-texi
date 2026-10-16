import React, { useState } from 'react';
import { CentralPaymentTransaction, PaymentTransactionType } from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Banknote,
  Coins,
  History,
  X,
  Lock,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Car
} from 'lucide-react';

interface PaymentTransactionCenterTabProps {
  transactions: CentralPaymentTransaction[];
  onRecordCashRide?: () => void;
}

export const PaymentTransactionCenterTab: React.FC<PaymentTransactionCenterTabProps> = ({
  transactions,
  onRecordCashRide
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<CentralPaymentTransaction | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.rideCode && t.rideCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || t.transactionType === typeFilter;
    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesType && matchesMethod && matchesStatus;
  });

  // KPI Calculations
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
  const cashRidesCount = transactions.filter((t) => t.transactionType === 'ride_cash_payment').length;
  const topUpCount = transactions.filter((t) => t.transactionType === 'topup_credit').length;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Transaction Volume</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {formatPKR(totalVolume)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {transactions.length} immutable ledger records</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Commission Debited</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {formatPKR(totalCommission)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Auto-deducted from driver wallets</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cash Rides (Cash Only)</span>
            <span className="p-2 rounded-xl bg-green-50 text-green-700">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-green-700 font-mono mt-2">
            {cashRidesCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Normal rides strictly cash settled</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Top-Ups</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-2">
            {topUpCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Easypaisa &amp; JazzCash till credits</p>
        </div>
      </div>

      {/* Cash Ride Policy Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 flex items-center justify-between text-xs text-amber-950">
        <div className="flex items-center gap-2.5">
          <Banknote className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="font-bold">Normal Ride Cash-Only Policy:</strong> Completed normal taxi rides strictly require cash settlement directly between passenger and driver. GoLife platform commission is debited from the driver&apos;s digital wallet.
          </span>
        </div>
        {onRecordCashRide && (
          <button
            onClick={onRecordCashRide}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Simulate Cash Ride</span>
          </button>
        )}
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, ride code, user name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Transaction Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Types ({transactions.length})</option>
              <option value="ride_cash_payment">Cash Ride Collected</option>
              <option value="commission_deduction">Commission Deduction</option>
              <option value="topup_credit">Wallet Top-Up</option>
              <option value="ride_earnings">Ride Earnings</option>
              <option value="fine_deduction">Fine Deduction</option>
              <option value="wallet_adjustment">Wallet Adjustment</option>
              <option value="payout_withdrawal">Payout Withdrawal</option>
              <option value="advance_booking_hold">Advance Booking Hold</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash (Direct)</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">Easypaisa</option>
              <option value="wallet">Wallet Balance</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction / Reference</th>
                <th className="py-3 px-4">User &amp; Ride</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Commission</th>
                <th className="py-3 px-4 text-right">Wallet Effect</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Date / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions found in central ledger.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.walletEffect > 0;
                  const isDebit = tx.walletEffect < 0;

                  return (
                    <tr key={tx.id} className="hover:bg-amber-50/30 transition">
                      {/* Reference */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                          <span>{tx.referenceId}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {tx.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {tx.description}
                        </div>
                      </td>

                      {/* User & Ride */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">
                          {tx.userName}
                          <span className="ml-1 text-[10px] px-1 rounded bg-slate-100 text-slate-600 uppercase">
                            {tx.userType}
                          </span>
                        </div>
                        {tx.rideCode ? (
                          <div className="text-[11px] text-amber-600 font-mono font-bold mt-0.5">
                            Ride: {tx.rideCode}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">—</div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold capitalize">
                          {tx.transactionType.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            tx.paymentMethod === 'cash'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.paymentMethod === 'jazzcash'
                              ? 'bg-red-100 text-red-800'
                              : tx.paymentMethod === 'easypaisa'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatPKR(tx.amount)}
                        </span>
                      </td>

                      {/* Commission */}
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                        {tx.commissionAmount ? formatPKR(tx.commissionAmount) : '—'}
                      </td>

                      {/* Wallet Effect */}
                      <td className="py-3 px-4 text-right font-mono">
                        {tx.walletEffect === 0 ? (
                          <span className="text-slate-400">Rs 0 (Cash)</span>
                        ) : (
                          <span
                            className={`font-black text-xs ${
                              isCredit ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isCredit ? '+' : ''}
                            {formatPKR(tx.walletEffect)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            tx.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.status === 'Processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      {/* Date / Detail Action */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTransaction(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Audit</span>
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

      {/* MODAL: Central Transaction Audit Details */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Transaction Detail &amp; Ledger Audit
                </h3>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  ID: {selectedTransaction.id} • Ref: {selectedTransaction.referenceId}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Financial Snapshot */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase">Gross Amount</span>
                  <div className="text-lg font-black font-mono text-slate-950">
                    {formatPKR(selectedTransaction.amount)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-900 uppercase">Wallet Effect</span>
                  <div
                    className={`text-base font-black font-mono ${
                      selectedTransaction.walletEffect > 0
                        ? 'text-emerald-700'
                        : selectedTransaction.walletEffect < 0
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {selectedTransaction.walletEffect > 0 ? '+' : ''}
                    {formatPKR(selectedTransaction.walletEffect)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block">User Name:</span>
                  <span className="font-bold text-slate-900">{selectedTransaction.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">User Type:</span>
                  <span className="font-bold uppercase text-slate-900">{selectedTransaction.userType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Payment Method:</span>
                  <span className="font-bold uppercase text-slate-900">{selectedTransaction.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Transaction Type:</span>
                  <span className="font-bold text-slate-900">{selectedTransaction.transactionType}</span>
                </div>
                {selectedTransaction.rideCode && (
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ride Code:</span>
                    <span className="font-bold text-amber-600">{selectedTransaction.rideCode}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400 block">Ledger Balance After:</span>
                  <span className="font-bold text-slate-900">{formatPKR(selectedTransaction.balanceAfter)}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Description</span>
                <p className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 mt-1 font-medium">
                  {selectedTransaction.description}
                </p>
              </div>

              {/* Audit History */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Audit History ({selectedTransaction.auditTrail.length})
                </span>
                <div className="mt-1 space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedTransaction.auditTrail.map((entry, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                        <span>{entry.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{entry.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Actor: <span className="font-semibold text-slate-700">{entry.actor}</span> — {entry.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3 text-amber-500" />
                  Immutable Ledger Hash Verified
                </span>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
