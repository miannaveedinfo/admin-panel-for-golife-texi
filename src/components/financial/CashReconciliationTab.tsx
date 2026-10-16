import React, { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  FileCheck
} from 'lucide-react';
import {
  CashRideReconciliationRecord,
  ReconciliationStatus
} from '../../types/commissionAndRevenue';

interface CashReconciliationTabProps {
  reconciliations: CashRideReconciliationRecord[];
  onReconcileRide: (id: string, reason: string, notes: string) => void;
  adminActorName: string;
}

export const CashReconciliationTab: React.FC<CashReconciliationTabProps> = ({
  reconciliations = [],
  onReconcileRide,
  adminActorName
}) => {
  const safeReconciliations = reconciliations || [];
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<CashRideReconciliationRecord | null>(null);
  const [resolveReason, setResolveReason] = useState<string>('Audited physical cash matches app ledger');
  const [resolveNotes, setResolveNotes] = useState<string>('');

  const filtered = safeReconciliations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.reconciliationStatus === statusFilter;
    const matchesSearch =
      r.rideCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const matchedCount = safeReconciliations.filter((r) => r.reconciliationStatus === 'Matched').length;
  const pendingCount = safeReconciliations.filter((r) => r.reconciliationStatus === 'Pending').length;
  const mismatchCount = safeReconciliations.filter((r) => r.reconciliationStatus === 'Mismatch').length;
  const resolvedCount = safeReconciliations.filter((r) => r.reconciliationStatus === 'Resolved').length;

  const totalCashCollected = safeReconciliations.reduce((acc, r) => acc + r.passengerCashPaid, 0);
  const totalCommissionDeducted = safeReconciliations.reduce((acc, r) => acc + r.driverWalletDeduction, 0);

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    onReconcileRide(selectedRecord.id, resolveReason, resolveNotes);
    setSelectedRecord(null);
    setResolveNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
              100% CASH TRIPS AUDIT
            </span>
            <span className="text-xs text-slate-500">• Pakistan Cash Ride Policy</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">Cash Ride Reconciliation Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Normal rides in Pakistan are strictly Cash Only. Passenger pays 100% cash in hand to driver; GoLife platform commission is automatically debited from the driver's in-app digital wallet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            Total Cash Handled: <span className="text-slate-950 font-black">Rs {totalCashCollected.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
            Commission Debited: <span className="font-black">Rs {totalCommissionDeducted.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('Matched')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'Matched' ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-400' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 uppercase">
            <span>Matched</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{matchedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Wallet debited accurately</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Pending')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'Pending' ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 uppercase">
            <span>Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting ledger cycle close</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Mismatch')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'Mismatch' ? 'border-rose-500 bg-rose-50/70 ring-1 ring-rose-400' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 uppercase">
            <span>Mismatch</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{mismatchCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fare or deduction discrepancy</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === 'all' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold uppercase">
            <span className={statusFilter === 'all' ? 'text-amber-300' : 'text-slate-600'}>All Records</span>
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black mt-1">{reconciliations.length}</div>
          <div className={`text-[10px] mt-0.5 ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>Total audited rides</div>
        </button>
      </div>

      {/* Table of Reconciliations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ride code, driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Showing {filtered.length} of {reconciliations.length} cash trips
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                <th className="py-2.5 px-3">Ride Code &amp; Time</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Passenger &amp; City</th>
                <th className="py-2.5 px-3">Cash Paid by Pax</th>
                <th className="py-2.5 px-3">Driver Earnings</th>
                <th className="py-2.5 px-3">Commission Debit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-amber-50/30 transition">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900">{rec.rideCode}</div>
                    <div className="text-[10px] text-slate-400">{rec.completedAt}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{rec.driverName}</div>
                    <div className="text-[10px] text-slate-400">{rec.serviceCategory}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-800">{rec.passengerName}</div>
                    <div className="text-[10px] text-slate-400">{rec.city}</div>
                  </td>
                  <td className="py-3 px-3 font-black text-slate-900">
                    Rs {rec.passengerCashPaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    Rs {rec.driverEarningRecorded.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-black text-amber-800">
                    Rs {rec.driverWalletDeduction.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rec.reconciliationStatus === 'Matched'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.reconciliationStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : rec.reconciliationStatus === 'Resolved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rec.reconciliationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {rec.reconciliationStatus !== 'Matched' && rec.reconciliationStatus !== 'Resolved' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(rec)}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] transition cursor-pointer"
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(rec)}
                        className="px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100 font-bold text-[11px] transition cursor-pointer"
                      >
                        Audit Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Reconcile / Audit Record */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              Cash Ride Audit: {selectedRecord.rideCode}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Physical cash collection verification and driver wallet deduction audit.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Driver:</span>
                <span className="font-bold text-slate-900">{selectedRecord.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Passenger Cash Paid:</span>
                <span className="font-black text-slate-900">Rs {selectedRecord.passengerCashPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver Net Earnings:</span>
                <span className="font-bold text-emerald-700">Rs {selectedRecord.driverEarningRecorded.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Commission:</span>
                <span className="font-black text-amber-800">Rs {selectedRecord.platformCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wallet Deduction Ref:</span>
                <span className="font-mono text-[11px] text-slate-700">{selectedRecord.walletTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Audit Status:</span>
                <span className="font-bold">{selectedRecord.reconciliationStatus}</span>
              </div>
            </div>

            {selectedRecord.reconciliationStatus !== 'Matched' && selectedRecord.reconciliationStatus !== 'Resolved' ? (
              <form onSubmit={handleConfirmResolve} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Resolution Category</label>
                  <select
                    value={resolveReason}
                    onChange={(e) => setResolveReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="Audited physical cash matches app ledger">Audited physical cash matches app ledger</option>
                    <option value="Driver wallet debited manually with approved authorization">Driver wallet debited manually with approved authorization</option>
                    <option value="Toll or fare adjustment applied">Toll or fare adjustment applied</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Audit Notes</label>
                  <textarea
                    rows={2}
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Enter verification notes for immutable audit log..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm transition"
                  >
                    Mark as Reconciled
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashReconciliationTab;
