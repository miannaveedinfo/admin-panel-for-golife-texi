import React, { useState } from 'react';
import { AdvanceBookingHold } from '../../types/paymentArchitecture';
import { formatPKR } from '../../utils/i18n';
import {
  ShieldCheck,
  Calendar,
  Lock,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  RefreshCcw,
  Search,
  Filter,
  Car,
  AlertCircle
} from 'lucide-react';

interface AdvanceBookingEscrowTabProps {
  advanceHolds: AdvanceBookingHold[];
  onReleaseEscrow?: (holdId: string) => void;
  onRefundEscrow?: (holdId: string) => void;
}

export const AdvanceBookingEscrowTab: React.FC<AdvanceBookingEscrowTabProps> = ({
  advanceHolds,
  onReleaseEscrow,
  onRefundEscrow
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const filtered = advanceHolds.filter((hold) => {
    const matchesSearch =
      hold.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hold.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hold.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hold.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || hold.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalHeld = advanceHolds
    .filter((h) => h.escrowStatus === 'held_in_escrow')
    .reduce((sum, h) => sum + h.advanceAmount, 0);

  return (
    <div className="space-y-6">
      {/* Architecture Readiness Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0">
            <Lock className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Advance Booking Escrow Architecture (Easypaisa &amp; JazzCash Backend-Ready)
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Advance booking deposits are securely held in platform escrow until scheduled trip completion or cancellation. Mobile payment integration hooks are prepared without impacting cash-only regular rides.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-amber-300 text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Escrow Funds Held</div>
          <div className="text-xl font-black font-mono text-slate-950">{formatPKR(totalHeld)}</div>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search booking code, passenger, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Methods</option>
              <option value="easypaisa">Easypaisa Advance</option>
              <option value="jazzcash">JazzCash Advance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Passenger / Route</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4">Method &amp; Ref</th>
                <th className="py-3 px-4 text-right">Advance Amount</th>
                <th className="py-3 px-4 text-center">Escrow Status</th>
                <th className="py-3 px-4 text-right">Escrow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No advance booking holds currently active in escrow.
                  </td>
                </tr>
              ) : (
                filtered.map((hold) => (
                  <tr key={hold.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {hold.bookingCode}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{hold.passengerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                        {hold.pickupAddress} → {hold.dropAddress}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {hold.scheduledTime}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            hold.paymentMethod === 'easypaisa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {hold.paymentMethod}
                        </span>
                        <span className="font-mono text-slate-700 font-bold text-[11px]">
                          {hold.referenceId}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-sm text-slate-900">
                      {formatPKR(hold.advanceAmount)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          hold.escrowStatus === 'held_in_escrow'
                            ? 'bg-amber-100 text-amber-800'
                            : hold.escrowStatus === 'released_to_driver'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {hold.escrowStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {hold.escrowStatus === 'held_in_escrow' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {onReleaseEscrow && (
                            <button
                              onClick={() => onReleaseEscrow(hold.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer"
                              title="Release escrow funds to driver on ride completion"
                            >
                              Release
                            </button>
                          )}
                          {onRefundEscrow && (
                            <button
                              onClick={() => onRefundEscrow(hold.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                              title="Refund escrow back to passenger upon cancellation"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
