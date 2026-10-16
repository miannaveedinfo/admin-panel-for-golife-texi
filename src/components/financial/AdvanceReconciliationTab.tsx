import React, { useState } from 'react';
import {
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  AdvancePaymentReconciliationRecord,
  ReconciliationStatus
} from '../../types/commissionAndRevenue';

interface AdvanceReconciliationTabProps {
  advanceRecords: AdvancePaymentReconciliationRecord[];
  onReconcileAdvance: (id: string, reason: string, notes: string) => void;
  adminActorName: string;
}

export const AdvanceReconciliationTab: React.FC<AdvanceReconciliationTabProps> = ({
  advanceRecords = [],
  onReconcileAdvance,
  adminActorName
}) => {
  const safeRecords = advanceRecords || [];
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<AdvancePaymentReconciliationRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const filtered = safeRecords.filter((rec) => {
    const matchesStatus = statusFilter === 'all' || rec.reconciliationStatus === statusFilter;
    const matchesProvider = providerFilter === 'all' || rec.provider === providerFilter;
    const matchesSearch =
      rec.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.providerReferenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.driverName && rec.driverName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesProvider && matchesSearch;
  });

  const totalEscrowHeld = safeRecords
    .filter((r) => r.escrowStatus === 'held_in_escrow')
    .reduce((acc, r) => acc + r.totalAdvanceAmount, 0);

  const totalSettledToDrivers = safeRecords
    .filter((r) => r.escrowStatus === 'settled_to_driver')
    .reduce((acc, r) => acc + r.driverPayoutAmount, 0);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    onReconcileAdvance(selectedItem.id, 'Advance Escrow Matched', resolutionNote);
    setSelectedItem(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider">
              EASYPAISA &amp; JAZZCASH ESCROW
            </span>
            <span className="text-xs text-slate-500">• Intercity &amp; Airport Pre-Bookings</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">Advance Payment Reconciliation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-booked scheduled rides accept advance payments via Easypaisa or JazzCash. Funds are secured in GoLife corporate escrow and settled to driver wallets post-trip completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
            Escrow Held: <span className="font-black">Rs {totalEscrowHeld.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
            Settled to Drivers: <span className="font-black">Rs {totalSettledToDrivers.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by TRX ID, booking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Providers</option>
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="Matched">Matched</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                <th className="py-2.5 px-3">Booking Code &amp; Time</th>
                <th className="py-2.5 px-3">Passenger</th>
                <th className="py-2.5 px-3">Gateway &amp; Reference ID</th>
                <th className="py-2.5 px-3">Advance Fare (PKR)</th>
                <th className="py-2.5 px-3">Driver Assigned</th>
                <th className="py-2.5 px-3">Escrow Status</th>
                <th className="py-2.5 px-3">Reconciliation</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-amber-50/30 transition">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900">{rec.bookingCode}</div>
                    <div className="text-[10px] text-slate-400">{rec.timestamp}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{rec.passengerName}</div>
                    <div className="text-[10px] text-slate-400">{rec.passengerPhone} • {rec.city}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        rec.provider === 'easypaisa'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {rec.provider}
                      </span>
                      <span className="font-mono text-[11px] text-slate-800">{rec.providerReferenceId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-black text-slate-900">Rs {rec.totalAdvanceAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Fee: Rs {rec.providerFeePKR}</div>
                  </td>
                  <td className="py-3 px-3">
                    {rec.driverName ? (
                      <div className="font-bold text-slate-800">{rec.driverName}</div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rec.escrowStatus === 'settled_to_driver'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.escrowStatus === 'held_in_escrow'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}>
                      {rec.escrowStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rec.reconciliationStatus === 'Matched'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.reconciliationStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.reconciliationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(rec)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[11px] transition cursor-pointer"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Audit & Escrow Actions */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              Advance Escrow Audit: {selectedItem.bookingCode}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gateway settlement verification for {selectedItem.provider.toUpperCase()} transaction.
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Provider:</span>
                <span className="font-black uppercase text-slate-900">{selectedItem.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Provider Ref ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedItem.providerReferenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Advance Paid:</span>
                <span className="font-black text-slate-900">Rs {selectedItem.totalAdvanceAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver Payout Entitlement:</span>
                <span className="font-bold text-emerald-700">Rs {selectedItem.driverPayoutAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Status:</span>
                <span className="font-bold">{selectedItem.escrowStatus}</span>
              </div>
              {selectedItem.notes && (
                <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                  <strong>Notes:</strong> {selectedItem.notes}
                </div>
              )}
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reconciliation Notes</label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Enter audit statement for immutable record..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm transition"
                >
                  Confirm Reconciled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvanceReconciliationTab;
