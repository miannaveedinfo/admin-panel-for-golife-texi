import React, { useState } from 'react';
import { DriverWiseReportItem } from '../../types/reports';
import { formatPKR } from '../../utils/i18n';
import {
  Users,
  Search,
  Star,
  Clock,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Wallet,
  ShieldAlert,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface DriverWiseReportViewProps {
  driverReports: DriverWiseReportItem[];
  onOpenDriverDetail: (driverId: string) => void;
}

export const DriverWiseReportView: React.FC<DriverWiseReportViewProps> = ({
  driverReports = [],
  onOpenDriverDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [sortBy, setSortBy] = useState<keyof DriverWiseReportItem>('completedRides');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const safeDriverReports = driverReports || [];

  // Filter & Search
  const filtered = safeDriverReports.filter((d) => {
    const matchesQuery =
      d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.driverPhone.includes(searchQuery) ||
      d.driverPlate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = cityFilter === 'All' || d.city.toLowerCase() === cityFilter.toLowerCase();

    return matchesQuery && matchesCity;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    }
    return 0;
  });

  const handleSort = (field: keyof DriverWiseReportItem) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const cities = ['All', ...Array.from(new Set(driverReports.map((d) => d.city)))];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs space-y-0">
      {/* Header & Controls */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
              Comprehensive Driver-Wise Operational &amp; Financial Ledger
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
              15 Verified Fields
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time balance formula: Gross − Commission − Fines − Fees + Reimbursements + Adjustments − Payouts = Current Balance
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver / phone / plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                City: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 15-Field Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider select-none">
            <tr>
              <th className="py-2.5 px-3">Driver Profile</th>
              <th
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('totalRides')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </div>
              </th>
              <th
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('completedRides')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Completed</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                </div>
              </th>
              <th
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('cancelledRides')}
              >
                <span>Cancelled</span>
              </th>
              <th
                className="py-2.5 px-2.5 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('grossEarnings')}
              >
                <span>Gross (PKR)</span>
              </th>
              <th className="py-2.5 px-2 text-right">Comm (15%)</th>
              <th
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('fines')}
              >
                <span>Fines</span>
              </th>
              <th className="py-2.5 px-2 text-right">Refunds</th>
              <th className="py-2.5 px-2 text-right">Reimb.</th>
              <th
                className="py-2.5 px-2 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('payouts')}
              >
                <span>Payouts</span>
              </th>
              <th className="py-2.5 px-2 text-center">Rating</th>
              <th className="py-2.5 px-2 text-center">Late (Pick/Drop)</th>
              <th className="py-2.5 px-2 text-center">Complaints</th>
              <th className="py-2.5 px-2 text-center">Suspensions</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-950"
                onClick={() => handleSort('currentBalance')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Balance</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-amber-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((d) => (
              <tr
                key={d.driverId}
                onClick={() => onOpenDriverDetail(d.driverId)}
                className="hover:bg-amber-50/30 transition cursor-pointer group"
              >
                {/* 1. Driver Profile (ID, Name, Phone, Vehicle Plate, City) */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-[11px] text-slate-700 shrink-0">
                      {d.avatar ? (
                        <img src={d.avatar} alt={d.driverName} className="w-full h-full object-cover" />
                      ) : (
                        d.driverName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-950 group-hover:text-amber-700 transition">
                          {d.driverName}
                        </strong>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                          {d.city}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {d.driverPhone} • {d.driverPlate} ({d.category})
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Total Rides */}
                <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-900">
                  {d.totalRides}
                </td>

                {/* 3. Completed Rides */}
                <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700">
                  {d.completedRides}
                </td>

                {/* 4. Cancelled Rides */}
                <td className="py-2.5 px-2 text-right font-mono text-rose-600">
                  {d.cancelledRides}
                </td>

                {/* 5. Gross Earnings */}
                <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-950">
                  {formatPKR(d.grossEarnings)}
                </td>

                {/* 6. Commission */}
                <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                  {formatPKR(d.commission)}
                </td>

                {/* 7. Fines */}
                <td className="py-2.5 px-2 text-right font-mono">
                  {d.fines > 0 ? (
                    <span className="text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-200">
                      {formatPKR(d.fines)}
                    </span>
                  ) : (
                    <span className="text-slate-400">Rs. 0</span>
                  )}
                </td>

                {/* 8. Refunds */}
                <td className="py-2.5 px-2 text-right font-mono text-amber-700">
                  {d.refunds > 0 ? formatPKR(d.refunds) : '-'}
                </td>

                {/* 9. Reimbursements */}
                <td className="py-2.5 px-2 text-right font-mono text-teal-700">
                  {d.reimbursements > 0 ? formatPKR(d.reimbursements) : '-'}
                </td>

                {/* 10. Payouts */}
                <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">
                  {formatPKR(d.payouts)}
                </td>

                {/* 11. Ratings */}
                <td className="py-2.5 px-2 text-center">
                  <div className="inline-flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{d.ratings.toFixed(1)}</span>
                  </div>
                </td>

                {/* 12. Late Pickups & Dropoffs */}
                <td className="py-2.5 px-2 text-center font-mono">
                  {d.latePickups > 0 ? (
                    <span className="text-rose-700 font-bold">
                      {d.latePickups} / {d.lateDropoffs}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">0 / 0</span>
                  )}
                </td>

                {/* 13. Complaints */}
                <td className="py-2.5 px-2 text-center font-mono">
                  {d.complaints > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {d.complaints}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>

                {/* 14. Suspensions */}
                <td className="py-2.5 px-2 text-center">
                  {d.suspensions > 0 || d.accountStatus === 'suspended' ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
                      {d.accountStatus === 'suspended' ? 'Suspended' : `${d.suspensions} Prior`}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                      Clear
                    </span>
                  )}
                </td>

                {/* 15. Current Balance */}
                <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {formatPKR(d.currentBalance)}
                  </span>
                </td>

                {/* Action button: Opens Driver Detail Center */}
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDriverDetail(d.driverId);
                    }}
                    className="px-2.5 py-1 text-[10px] font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer inline-flex items-center gap-1 shadow-2xs border border-amber-500/40"
                    title="Open Driver Detail Center"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Driver Footer summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Showing <strong>{sorted.length}</strong> drivers in reporting scope
        </div>
        <div className="flex items-center gap-3">
          <span>Click any row to open full live telemetry, financial ledger, and driver controls</span>
        </div>
      </div>
    </div>
  );
};
