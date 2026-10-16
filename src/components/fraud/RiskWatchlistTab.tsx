import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { RiskWatchlistEntry } from '../../types';
import {
  Shield,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Car,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  X
} from 'lucide-react';

export const RiskWatchlistTab: React.FC = () => {
  const {
    riskWatchlist,
    addToRiskWatchlist,
    removeFromRiskWatchlist,
    openUniversalDetail,
    currentAdmin,
    showToast
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [newEntityType, setNewEntityType] = useState<'driver' | 'passenger'>('driver');
  const [newEntityId, setNewEntityId] = useState('');
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityPhone, setNewEntityPhone] = useState('');
  const [newCity, setNewCity] = useState('Lahore');
  const [newRiskLevel, setNewRiskLevel] = useState<'critical' | 'high' | 'medium'>('high');
  const [newReason, setNewReason] = useState('');
  const [monitorUntil, setMonitorUntil] = useState('2026-12-31');

  const filteredWatchlist = riskWatchlist.filter((w) => {
    if (filterType !== 'all' && w.entityType !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = w.entityName.toLowerCase().includes(q);
      const matchId = w.entityId.toLowerCase().includes(q);
      const matchReason = w.reason.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchReason) return false;
    }
    return true;
  });

  const handleAddEntry = () => {
    if (!newEntityName.trim() || !newEntityId.trim() || !newReason.trim()) {
      showToast('Please provide Entity Name, ID, and Watchlist Reason', 'error');
      return;
    }

    addToRiskWatchlist({
      entityType: newEntityType,
      entityId: newEntityId.trim(),
      entityName: newEntityName.trim(),
      entityPhone: newEntityPhone.trim() || '+92 300 0000000',
      city: newCity,
      riskLevel: newRiskLevel,
      reason: newReason.trim(),
      addedBy: currentAdmin?.name || 'Risk Officer',
      status: 'active',
      monitorUntil,
      autoActions: ['require_otp', 'restrict_payout']
    });

    setIsAddingNew(false);
    setNewEntityName('');
    setNewEntityId('');
    setNewReason('');
  };

  const handleRemove = (entry: RiskWatchlistEntry) => {
    const reason = prompt(`Reason for removing ${entry.entityName} from vigilance watchlist:`);
    if (reason !== null) {
      removeFromRiskWatchlist(entry.id, reason || 'Investigator clearance');
    }
  };

  return (
    <div id="risk-watchlist-container" className="space-y-5 text-[#111827]">
      {/* Top Controls Strip */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-slate-950">
              High-Vigilance Watchlist & Scrutiny Registry
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Designated entities subject to continuous telemetry radar, pre-dispatch verification, and payout holds
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Entity
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredWatchlist.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Watchlist Registry Empty</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No captains or riders currently have active watchlist restrictions under this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Threat Level</th>
                  <th className="py-3 px-4">Watchlist Reason</th>
                  <th className="py-3 px-4">Operating Hub</th>
                  <th className="py-3 px-4">Automated Restrictions</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4">Active Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWatchlist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            entry.entityType === 'driver'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {entry.entityType === 'driver' ? (
                            <Car className="w-3.5 h-3.5" />
                          ) : (
                            <User className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {entry.entityName}
                            <button
                              type="button"
                              onClick={() => openUniversalDetail(entry.entityType, entry.entityId)}
                              title="Open Profile"
                              className="text-slate-400 hover:text-amber-600 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {entry.entityType.toUpperCase()} • {entry.entityId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          entry.riskLevel === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {entry.riskLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-800 font-medium line-clamp-1">{entry.reason}</div>
                      <div className="text-[10px] text-slate-400">By: {entry.addedBy}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                      {entry.city || 'National'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 flex-wrap">
                        {entry.autoActions?.map((act, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700"
                          >
                            {act.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {entry.addedDate}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                      {entry.monitorUntil || 'Permanent'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleRemove(entry)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Entity Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Enroll Entity in High-Vigilance Watchlist</h3>
              </div>
              <button type="button" onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Entity Type</label>
                  <select
                    value={newEntityType}
                    onChange={(e) => setNewEntityType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="driver">Captain / Driver</option>
                    <option value="passenger">Rider / Passenger</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Entity ID</label>
                  <input
                    type="text"
                    placeholder="e.g. drv-101"
                    value={newEntityId}
                    onChange={(e) => setNewEntityId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tariq Mehmood"
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={newEntityPhone}
                    onChange={(e) => setNewEntityPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Operating Hub</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Risk Level</label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="critical">Critical (Immediate Throttle)</option>
                    <option value="high">High (Strict Scrutiny)</option>
                    <option value="medium">Medium (Vigilance Monitoring)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Watchlist Ground / Reason</label>
                <textarea
                  placeholder="Explain forensic trigger or investigation justification..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Monitor Until Date</label>
                <input
                  type="date"
                  value={monitorUntil}
                  onChange={(e) => setMonitorUntil(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEntry}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
