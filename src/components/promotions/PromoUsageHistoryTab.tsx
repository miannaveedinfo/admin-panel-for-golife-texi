import React, { useState } from 'react';
import { PromoUsageRecord } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { formatPKR } from '../../utils/i18n';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  MapPin,
  Car,
  FileText
} from 'lucide-react';

export const PromoUsageHistoryTab: React.FC = () => {
  const { promoUsages } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const totalRedemptions = promoUsages.length;
  const totalDiscounts = promoUsages.reduce((sum, u) => sum + u.discountAmount, 0);
  const avgDiscount = totalRedemptions > 0 ? Math.round(totalDiscounts / totalRedemptions) : 0;
  const totalGrossFare = promoUsages.reduce((sum, u) => sum + u.grossFare, 0);

  const filteredUsages = promoUsages.filter((u) => {
    const matchesSearch =
      u.promoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rideId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = filterCity === 'All' || u.city === filterCity;
    const matchesCategory = filterCategory === 'All' || u.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;

    return matchesSearch && matchesCity && matchesCategory && matchesStatus;
  });

  return (
    <div id="section-promo-usage-history" className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Promo Voucher Redemption & Ride History (Section 6)
          </h2>
          <p className="text-xs text-[#6B7280]">
            Complete audit trail of every promo code redeemed against live rides with fare breakdowns
          </p>
        </div>

        <div className="text-xs text-[#6B7280] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Real-time synchronization with Central Ride & Pricing Engine
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Total Vouchers Redeemed
          </div>
          <div className="text-lg font-extrabold text-[#111827] font-mono mt-1">
            {totalRedemptions}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Across all completed rides</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Total Discount Funded
          </div>
          <div className="text-lg font-extrabold text-amber-700 font-mono mt-1">
            {formatPKR(totalDiscounts)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Platform growth subsidy</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Average Discount / Trip
          </div>
          <div className="text-lg font-extrabold text-emerald-700 font-mono mt-1">
            {formatPKR(avgDiscount)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Mean passenger savings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            Gross Ride Volume
          </div>
          <div className="text-lg font-extrabold text-blue-700 font-mono mt-1">
            {formatPKR(totalGrossFare)}
          </div>
          <div className="text-[11px] text-[#6B7280] mt-0.5">Driven by promo coupons</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E7EB]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="input-search-usage"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, rider, driver, ride ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            id="select-usage-city"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Cities</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Multan">Multan</option>
          </select>

          <select
            id="select-usage-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            <option value="GoMini">GoMini</option>
            <option value="GoRide">GoRide</option>
            <option value="GoComfort">GoComfort</option>
            <option value="GoAuto">GoAuto</option>
            <option value="GoMoto">GoMoto</option>
          </select>

          <select
            id="select-usage-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="applied">Applied (Completed)</option>
            <option value="reverted">Reverted / Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        <span className="text-xs text-[#6B7280]">
          Showing {filteredUsages.length} of {promoUsages.length} redemptions
        </span>
      </div>

      {/* Usage Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[#4B5563] font-bold border-b border-[#E5E7EB]">
              <tr>
                <th className="p-3.5">Promo Code</th>
                <th className="p-3.5">Ride ID & Date</th>
                <th className="p-3.5">Passenger (Rider)</th>
                <th className="p-3.5">Captain (Driver)</th>
                <th className="p-3.5">City & Category</th>
                <th className="p-3.5">Gross Fare</th>
                <th className="p-3.5">Discount</th>
                <th className="p-3.5">Final Fare</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredUsages.map((usage) => (
                <tr key={usage.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <span className="font-mono font-extrabold text-amber-900 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {usage.promoCode}
                    </span>
                    <div className="text-[10px] text-[#6B7280] mt-0.5">{usage.id}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-[#111827]">{usage.rideId}</div>
                    <div className="text-[11px] text-[#6B7280]">{usage.date}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-[#111827]">{usage.passengerName}</div>
                    <div className="text-[11px] text-[#6B7280]">{usage.passengerPhone}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-[#111827]">{usage.driverName}</div>
                    <div className="text-[11px] text-[#6B7280]">{usage.driverPhone}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-[#374151]">{usage.city}</div>
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#4B5563]">
                      {usage.category}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono text-slate-700">
                      {formatPKR(usage.grossFare)}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono font-bold text-emerald-600">
                      - {formatPKR(usage.discountAmount)}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono font-extrabold text-[#111827]">
                      {formatPKR(usage.finalFare)}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        usage.status === 'applied'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {usage.status === 'applied' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      )}
                      {usage.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
