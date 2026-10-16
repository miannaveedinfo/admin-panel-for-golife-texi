import React, { useState } from 'react';
import { HistoricalRuleRecord } from '../../types/reports';
import { formatPKR } from '../../utils/i18n';
import {
  Lock,
  ShieldCheck,
  Search,
  CheckCircle2,
  FileCode2,
  AlertOctagon,
  Clock,
  User,
  Car,
  ExternalLink
} from 'lucide-react';

interface HistoricalProtectionViewProps {
  records: HistoricalRuleRecord[];
  onOpenRideDetail?: (rideId: string) => void;
  onOpenDriverDetail?: (driverId: string) => void;
}

export const HistoricalProtectionView: React.FC<HistoricalProtectionViewProps> = ({
  records = [],
  onOpenRideDetail,
  onOpenDriverDetail
}) => {
  const [search, setSearch] = useState('');
  const safeRecords = records || [];
  const [selectedRecord, setSelectedRecord] = useState<HistoricalRuleRecord | null>(safeRecords[0] || null);

  const filtered = safeRecords.filter(
    (r) =>
      r.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      r.rideCode.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      r.pricingRuleVersion.toLowerCase().includes(search.toLowerCase()) ||
      r.fineRuleVersion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Protection Policy Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
                  Immutable Historical Rule &amp; Snapshot Audit Ledger
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Rule Freeze Enforced</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Completed transactions are permanently bound to the active pricing and fine rule versions at the moment of completion.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search TXN / Rule / Ride..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 w-48 sm:w-64"
            />
          </div>
        </div>

        {/* 4 Guarantee badges */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-black text-slate-500 block">Rule Version Immutability</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">No Retroactive Recalculations</span>
            <span className="text-[10px] text-slate-500">New tariffs never alter closed rides</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-black text-slate-500 block">Fine Tariff Locking</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">Original Fine Matrix Preserved</span>
            <span className="text-[10px] text-slate-500">Fixed penalty rules sealed per incident</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-black text-slate-500 block">Ledger Verification</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">Cryptographic Timestamp</span>
            <span className="text-[10px] text-slate-500">Every fare breakdown hashed &amp; signed</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-black text-slate-500 block">Audit Proofing</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">FBR / PRA Tax Compliance</span>
            <span className="text-[10px] text-slate-500">Meets regulatory tax audit standards</span>
          </div>
        </div>
      </div>

      {/* Snapshot Ledger Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Preserved Transaction Records ({filtered.length})
            </span>
            <span className="text-[11px] text-slate-500">Click a record to inspect sealed audit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-2.5">Ride Code</th>
                  <th className="py-2.5 px-2.5">Pricing Rule</th>
                  <th className="py-2.5 px-2.5">Fine Rule</th>
                  <th className="py-2.5 px-3 text-right">Applied Fare</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const isSelected = selectedRecord?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecord(r)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        isSelected ? 'bg-amber-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-950">{r.transactionId}</div>
                        <div className="text-[10px] text-slate-400">{r.timestamp}</div>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-700">
                        {r.rideCode}
                        <div className="text-[10px] text-slate-400">{r.city}</div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {r.pricingRuleVersion}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          {r.fineRuleVersion}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                        {formatPKR(r.grossFare)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>LOCKED</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Inspector Detail Card */}
        {selectedRecord && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 block">
                  Audited Snapshot Record
                </span>
                <h4 className="text-base font-black text-slate-950 font-mono">
                  {selectedRecord.transactionId}
                </h4>
              </div>
              <span className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>

            {/* Preserved Entity identifiers */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Ride ID:</span>
                <button
                  onClick={() => onOpenRideDetail && onOpenRideDetail(selectedRecord.rideId)}
                  className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectedRecord.rideCode}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Driver ID:</span>
                <button
                  onClick={() => onOpenDriverDetail && onOpenDriverDetail(selectedRecord.driverId)}
                  className="font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectedRecord.driverName} ({selectedRecord.driverId})</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Passenger ID:</span>
                <span className="font-bold text-slate-800">
                  {selectedRecord.passengerName} ({selectedRecord.passengerId})
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Pricing Rule Version:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {selectedRecord.pricingRuleVersion}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Fine Rule Version:</span>
                <span className="font-mono font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                  {selectedRecord.fineRuleVersion}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Timestamp:</span>
                <span className="font-mono text-slate-700">{selectedRecord.timestamp}</span>
              </div>
            </div>

            {/* Preserved applied parameters */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 block">
                Applied Calculation Breakdown
              </span>
              <div className="flex justify-between">
                <span className="text-slate-600">Base Fare:</span>
                <span className="font-mono font-bold">{formatPKR(selectedRecord.baseFare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Per Km Rate:</span>
                <span className="font-mono font-bold">{formatPKR(selectedRecord.perKmRate)}/km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Platform Commission (15%):</span>
                <span className="font-mono font-bold text-emerald-700">{formatPKR(selectedRecord.commissionAmount)}</span>
              </div>
              {selectedRecord.fineAmount ? (
                <div className="flex justify-between text-orange-700 font-bold">
                  <span>Applied Fine:</span>
                  <span className="font-mono">{formatPKR(selectedRecord.fineAmount)}</span>
                </div>
              ) : null}
            </div>

            {/* Audit log text */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-950 space-y-1">
              <strong className="font-black block uppercase text-[9px] text-amber-800">
                Audit Trail &amp; Verification Note:
              </strong>
              <p className="leading-relaxed">{selectedRecord.auditInformation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
