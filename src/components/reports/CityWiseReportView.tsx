import React from 'react';
import { CityWiseReportItem } from '../../types/reports';
import { formatPKR } from '../../utils/i18n';
import {
  MapPin,
  Car,
  CheckCircle2,
  XCircle,
  Radio,
  Users,
  DollarSign,
  Percent,
  AlertTriangle,
  RotateCcw,
  Wallet,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface CityWiseReportViewProps {
  cityReports: CityWiseReportItem[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onInspectCityRides?: (city: string) => void;
  onInspectCityDrivers?: (city: string) => void;
}

export const CityWiseReportView: React.FC<CityWiseReportViewProps> = ({
  cityReports,
  selectedCity,
  onSelectCity,
  onInspectCityRides,
  onInspectCityDrivers
}) => {
  // Find current city report or use the first/aggregate
  const currentCityData = cityReports.find(
    (c) => c.city.toLowerCase() === selectedCity.toLowerCase()
  ) || cityReports[0] || {
    city: 'All Cities',
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    activeRides: 0,
    passengers: 0,
    drivers: 0,
    revenue: 0,
    commission: 0,
    fines: 0,
    refunds: 0,
    payouts: 0,
    averageFare: 0,
    completionRate: 0,
    safetyIncidents: 0
  };

  const totalNationalRevenue = cityReports.reduce((s, c) => s + c.revenue, 0);

  return (
    <div className="space-y-4">
      {/* Spotlight for the selected city */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500/40 text-slate-950 flex items-center justify-center font-black text-base shadow-xs shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-950">
                  {currentCityData.city} Operational Profile
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                  {Math.round((currentCityData.revenue / (totalNationalRevenue || 1)) * 100)}% National Share
                </span>
              </div>
              <p className="text-xs text-slate-500">
                11-point regional audit for rides, passengers, drivers, and financial settlement
              </p>
            </div>
          </div>

          {/* City switcher pill buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {cityReports.map((c) => (
              <button
                key={c.city}
                onClick={() => onSelectCity(c.city)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  selectedCity.toLowerCase() === c.city.toLowerCase()
                    ? 'bg-amber-400 text-slate-950 font-black shadow-2xs border border-amber-500/40'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                {c.city}
              </button>
            ))}
          </div>
        </div>

        {/* 11 Required City Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Rides</span>
            <span className="text-base font-black text-slate-950 font-mono mt-0.5 block">
              {currentCityData.totalRides.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">{currentCityData.completionRate}% completion</span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Completed Rides</span>
            <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
              {currentCityData.completedRides.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600">Avg {formatPKR(currentCityData.averageFare)}</span>
          </div>

          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/70">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Cancelled Rides</span>
            <span className="text-base font-black text-rose-600 font-mono mt-0.5 block">
              {currentCityData.cancelledRides.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-500">{Math.round((currentCityData.cancelledRides / (currentCityData.totalRides || 1)) * 100)}% cancel rate</span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
            <span className="text-[10px] font-bold text-amber-900 uppercase block">Active Rides</span>
            <span className="text-base font-black text-amber-600 font-mono mt-0.5 block">
              {currentCityData.activeRides.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-700">On road right now</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Passengers</span>
            <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
              {currentCityData.passengers.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Active user accounts</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Fleet Drivers</span>
            <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
              {currentCityData.drivers.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Registered in city</span>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
            <span className="text-[10px] font-bold text-amber-300 uppercase block">Gross Revenue</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">
              {formatPKR(currentCityData.revenue)}
            </span>
            <span className="text-[10px] text-slate-400">Total fare collected</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Commission (15%)</span>
            <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
              {formatPKR(currentCityData.commission)}
            </span>
            <span className="text-[10px] text-slate-500">Platform take</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Fines Charged</span>
            <span className="text-base font-black text-orange-600 font-mono mt-0.5 block">
              {formatPKR(currentCityData.fines)}
            </span>
            <span className="text-[10px] text-slate-500">Compliance penalties</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Refunds</span>
            <span className="text-base font-black text-amber-700 font-mono mt-0.5 block">
              {formatPKR(currentCityData.refunds)}
            </span>
            <span className="text-[10px] text-slate-500">Passenger credit</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Payouts Disbursed</span>
            <span className="text-base font-black text-teal-700 font-mono mt-0.5 block">
              {formatPKR(currentCityData.payouts)}
            </span>
            <span className="text-[10px] text-slate-500">Disbursed via bank / mobile wallets</span>
          </div>
        </div>

        {/* Action jump shortcuts */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onInspectCityRides && onInspectCityRides(currentCityData.city)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>View {currentCityData.city} Rides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onInspectCityDrivers && onInspectCityDrivers(currentCityData.city)}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-2xs border border-amber-500/40"
          >
            <span>View {currentCityData.city} Drivers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comparative City Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              National City Comparison Matrix
            </h4>
            <p className="text-[11px] text-slate-500">Direct operational benchmarking across Pakistan</p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
            {cityReports.length} Cities Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">City</th>
                <th className="py-2.5 px-3 text-right">Rides</th>
                <th className="py-2.5 px-3 text-right">Completed</th>
                <th className="py-2.5 px-3 text-right">Cancelled</th>
                <th className="py-2.5 px-3 text-right">Active</th>
                <th className="py-2.5 px-3 text-right">Drivers</th>
                <th className="py-2.5 px-3 text-right">Revenue (PKR)</th>
                <th className="py-2.5 px-3 text-right">Commission</th>
                <th className="py-2.5 px-3 text-right">Fines</th>
                <th className="py-2.5 px-3 text-right">Refunds</th>
                <th className="py-2.5 px-3 text-right">Payouts</th>
                <th className="py-2.5 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cityReports.map((c) => {
                const isSelected = selectedCity.toLowerCase() === c.city.toLowerCase();
                return (
                  <tr
                    key={c.city}
                    className={`transition hover:bg-slate-50/80 cursor-pointer ${
                      isSelected ? 'bg-amber-50/40 font-semibold' : ''
                    }`}
                    onClick={() => onSelectCity(c.city)}
                  >
                    <td className="py-2.5 px-3.5 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      <strong className="text-slate-950">{c.city}</strong>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.totalRides.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{c.completedRides.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600">{c.cancelledRides.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700">{c.activeRides}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{c.drivers}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">{formatPKR(c.revenue)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{formatPKR(c.commission)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-orange-600">{formatPKR(c.fines)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700">{formatPKR(c.refunds)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-teal-700">{formatPKR(c.payouts)}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCity(c.city);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
