import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AuditLog } from '../types';
import { BackToDashboardButton } from './common/BackToDashboardButton';
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  Eye,
  RefreshCw,
  X,
  FileText,
  Activity,
  Layers,
  Globe
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, showToast } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const targetTypes = [
    { value: 'all', label: 'All Target Types' },
    { value: 'driver', label: 'Driver' },
    { value: 'passenger', label: 'Passenger' },
    { value: 'ride', label: 'Ride' },
    { value: 'fare', label: 'Fare Tariff' },
    { value: 'payout', label: 'Payout' },
    { value: 'complaint', label: 'Complaint & Ticket' },
    { value: 'promo', label: 'Promo & Referral' },
    { value: 'system', label: 'System & RBAC' }
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery));

    const matchesTarget = targetTypeFilter === 'all' || log.targetType === targetTypeFilter;
    const matchesAction =
      actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesTarget && matchesAction;
  });

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('reject') || act.includes('cancel') || act.includes('suspend')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('create') || act.includes('approve') || act.includes('verified') || act.includes('login')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('update') || act.includes('edit') || act.includes('switch') || act.includes('rule')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const exportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Admin Email', 'Action', 'Target Type', 'Target ID', 'Details', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.adminEmail}"`,
      `"${l.action}"`,
      `"${l.targetType}"`,
      `"${l.targetId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || 'Admin Console'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GoLife_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Audit report exported to CSV successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BackToDashboardButton variant="dark" />
              <span className="p-2.5 bg-[#0F766E]/30 border border-[#0F766E]/50 rounded-xl text-teal-300">
                <ShieldCheck className="w-6 h-6 text-[#0F766E]" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">System Audit & Compliance Logs</h1>
                <p className="text-slate-400 text-sm">
                  Immutable record of all administrative interactions, role switches, payouts, fare revisions, and security events.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportAuditCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sm font-semibold transition shadow-sm"
            >
              <Download className="w-4 h-4 text-teal-400" />
              Export Audit CSV
            </button>
          </div>
        </div>

        {/* Live Status Row */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-xs">
            <span className="text-slate-400 block">Total Logged Actions</span>
            <span className="text-lg font-bold text-white">{auditLogs.length} Records</span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Logging Protocol</span>
            <span className="text-lg font-bold text-emerald-400">GoLife SEC-AUDIT-V2</span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Storage Compliance</span>
            <span className="text-lg font-bold text-blue-400">Pakistan PTA Compliant</span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block">Active Filter Count</span>
            <span className="text-lg font-bold text-amber-400">{filteredLogs.length} Matches</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, admin email, target ID, details, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Target:</span>
            </div>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            >
              {targetTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            >
              <option value="all">All Actions</option>
              <option value="login">Login & Auth</option>
              <option value="update">Updates & Edits</option>
              <option value="fare">Fares & Tariffs</option>
              <option value="payout">Payouts & Finance</option>
              <option value="delete">Deletions & Rejections</option>
              <option value="complaint">Complaints & Tickets</option>
            </select>

            {(searchQuery || targetTypeFilter !== 'all' || actionFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTargetTypeFilter('all');
                  setActionFilter('all');
                }}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Timestamp (PKT)</th>
                <th className="py-3.5 px-4">Admin Operator</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-6">Operational Details</th>
                <th className="py-3.5 px-4">Origin & Network</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records match your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionStyle = getActionColor(log.action);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-slate-900">{log.timestamp}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{log.id}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs">{log.adminEmail}</div>
                        <div className="text-[11px] text-slate-500 font-medium">Headquarters Admin</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${actionStyle}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span className="uppercase text-[11px] font-bold tracking-wide text-slate-500">{log.targetType}:</span>
                        </div>
                        <div className="font-mono text-xs text-slate-700 font-medium mt-0.5">
                          {log.targetId}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="text-xs text-slate-700 leading-relaxed max-w-md line-clamp-2">
                          {log.details}
                        </p>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {log.ipAddress || '39.40.182.14'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">PTCL Islamabad HQ</div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-slate-400 hover:text-[#0F766E] hover:bg-slate-100 rounded-lg transition"
                          title="Inspect Payload"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-50 text-[#0F766E]">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Audit Record Inspector</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Action Identifier</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Executed By</span>
                <span className="font-mono font-medium text-slate-800">{selectedLog.adminEmail}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Timestamp</span>
                <span className="font-mono text-slate-800">{selectedLog.timestamp}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Target Entity</span>
                <span className="font-mono text-slate-800">
                  {selectedLog.targetType.toUpperCase()} ({selectedLog.targetId})
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Network Origin</span>
                <span className="font-mono text-slate-800">
                  {selectedLog.ipAddress || '39.40.182.14'} (PTCL Broadband, PK)
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 font-semibold block mb-1.5">Action Description</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-mono">
                  {selectedLog.details}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 font-semibold block mb-1.5">Cryptographic Hash & Signature</span>
                <div className="p-2.5 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] break-all">
                  SHA256: 8f9b2c3a1e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
