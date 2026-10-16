import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Sliders,
  DollarSign,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { DriverWallet, CentralPaymentTransaction } from '../../types/paymentArchitecture';
import { CashRideReconciliationRecord } from '../../types/commissionAndRevenue';

interface DriverEarningsLedgerTabProps {
  wallets: DriverWallet[];
  reconciliations: CashRideReconciliationRecord[];
  transactions: CentralPaymentTransaction[];
  onAdjustWallet: (driverId: string, amountPKR: number, reason: string, notes: string) => void;
  adminActorName: string;
}

export const DriverEarningsLedgerTab: React.FC<DriverEarningsLedgerTabProps> = ({
  wallets = [],
  reconciliations = [],
  transactions = [],
  onAdjustWallet,
  adminActorName
}) => {
  const safeWallets = wallets || [];
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<DriverWallet | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustDirection, setAdjustDirection] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('Route Toll Reimbursement');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  const filteredWallets = safeWallets.filter((w) => {
    return (
      w.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.driverPhone.includes(searchTerm) ||
      w.driverId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalDriverBalances = safeWallets.reduce((acc, w) => acc + w.balance, 0);
  const totalOutstandingDues = safeWallets.reduce((acc, w) => acc + w.outstandingDeductions, 0);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;
    const finalAmount = adjustDirection === 'credit' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    onAdjustWallet(selectedWallet.driverId, finalAmount, adjustReason, adjustNotes);
    setSelectedWallet(null);
    setAdjustNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              DOUBLE-ENTRY DRIVER LEDGER
            </span>
            <span className="text-xs text-slate-500">• Unified Wallet &amp; Earnings</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">Driver Earnings &amp; Wallet Position</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every driver wallet maintains an immutable ledger of cash earnings, commission deductions, approved top-ups, fines, and payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            Total Driver Balances: <span className="font-black text-slate-950">Rs {totalDriverBalances.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900">
            Outstanding Dues: <span className="font-black">Rs {totalOutstandingDues.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Driver Wallets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            {filteredWallets.length} active driver wallets monitored
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Wallet Status</th>
                <th className="py-2.5 px-3">Current Balance</th>
                <th className="py-2.5 px-3">Payable Balance</th>
                <th className="py-2.5 px-3">Pending Top-Ups</th>
                <th className="py-2.5 px-3">Outstanding Dues</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredWallets.map((w) => (
                <tr key={w.driverId} className="hover:bg-amber-50/30 transition">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900">{w.driverName}</div>
                    <div className="text-[10px] text-slate-400">{w.driverPhone} • ID: {w.driverId}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      w.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.status === 'Low Balance'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-black text-slate-900 text-sm">
                    Rs {w.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    Rs {w.payableBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-amber-700">
                    Rs {w.pendingBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-700">
                    Rs {w.outstandingDeductions.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[11px] transition cursor-pointer"
                    >
                      Adjust Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adjust Driver Wallet */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              Adjust Wallet: {selectedWallet.driverName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All financial adjustments are recorded in the immutable audit ledger.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Balance:</span>
                <span className="font-black text-slate-900">Rs {selectedWallet.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payable Balance:</span>
                <span className="font-bold text-emerald-700">Rs {selectedWallet.payableBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Admin:</span>
                <span className="font-bold text-slate-700">{adminActorName}</span>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustDirection('credit')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    adjustDirection === 'credit'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-black'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Credit (+) Add Funds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustDirection('debit')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    adjustDirection === 'debit'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-black'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <MinusCircle className="w-4 h-4 text-rose-600" />
                  <span>Debit (-) Deduct Funds</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Adjustment Amount (PKR)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Structured Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Route Toll Reimbursement">Route Toll Reimbursement</option>
                  <option value="Passenger Cleaning Compensation">Passenger Cleaning Compensation</option>
                  <option value="Customer Cancellation Courtesy Credit">Customer Cancellation Courtesy Credit</option>
                  <option value="Manual Offline Top-Up Deposit">Manual Offline Top-Up Deposit</option>
                  <option value="Overcharge Correction Adjustment">Overcharge Correction Adjustment</option>
                  <option value="Administrative Fine Deduction">Administrative Fine Deduction</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mandatory Audit Note</label>
                <textarea
                  rows={2}
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Explain why this adjustment is being made..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedWallet(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm transition"
                >
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverEarningsLedgerTab;
