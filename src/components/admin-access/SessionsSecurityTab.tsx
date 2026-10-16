import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminSession, AdminSecurityAlert } from '../../types';
import {
  ShieldAlert,
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Clock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export const SessionsSecurityTab: React.FC = () => {
  const {
    adminSessions,
    adminSecurityAlerts,
    currentAdmin,
    revokeAdminSession,
    revokeAllAdminSessions,
    dismissSecurityAlert,
    resolveSecurityAlert,
    lockAdminAccount,
    showToast
  } = useAdmin();

  const [sessionSearch, setSessionSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');

  const filteredSessions = adminSessions.filter((s) => {
    const q = sessionSearch.toLowerCase();
    return (
      s.adminName.toLowerCase().includes(q) ||
      s.adminEmail.toLowerCase().includes(q) ||
      s.ipAddress.includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.device.toLowerCase().includes(q)
    );
  });

  const filteredAlerts = adminSecurityAlerts.filter((a) => {
    if (alertFilter === 'all') return true;
    return a.status === alertFilter;
  });

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-4 h-4 text-slate-500" />;
    }
    return <Laptop className="w-4 h-4 text-slate-500" />;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>;
      case 'high':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Policies Overview Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">Active Security Posture & Session Governance</h3>
            </div>
            <p className="text-xs text-slate-500">
              Real-time monitoring of all authenticated console sessions and automated anomaly detection across Pakistan dispatch centers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentAdmin) {
                  revokeAllAdminSessions(currentAdmin.id);
                  showToast('Terminated all other active sessions for your account', 'info');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              Sign Out Other Devices
            </button>
          </div>
        </div>
      </div>

      {/* Security Alerts & Anomalies */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Security Alerts & Anomalies ({filteredAlerts.length})
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">All Alerts</option>
              <option value="open">Open Only</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs font-bold text-slate-600">No active security anomalies detected</p>
            <p className="text-[11px] text-slate-400">All session signatures and tokens match trusted profiles.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.status === 'resolved'
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs font-black text-slate-900">{alert.title}</span>
                    <span className="text-[10px] text-slate-400">({alert.timestamp})</span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl">{alert.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Admin: <strong className="text-slate-700">{alert.adminName}</strong></span>
                    <span>IP: <code className="text-slate-600">{alert.ipAddress}</code></span>
                    <span>City: {alert.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status !== 'resolved' ? (
                    <>
                      <button
                        onClick={() => resolveSecurityAlert(alert.id, 'Verified benign or action authorized')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                      <button
                        onClick={() => dismissSecurityAlert(alert.id)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => {
                          lockAdminAccount(alert.adminId, `Locked due to security incident: ${alert.title}`);
                          resolveSecurityAlert(alert.id, 'Account locked for investigation');
                        }}
                        className="p-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        title="Lock this administrator immediately"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Live Administrator Sessions ({filteredSessions.length})
            </h4>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search session by name, IP, city..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                <th className="py-2.5 px-3">Administrator</th>
                <th className="py-2.5 px-3">Device & Browser</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Geo Location</th>
                <th className="py-2.5 px-3">Login Time</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSessions.map((session) => {
                const isCurrentSession = session.isCurrent;

                return (
                  <tr
                    key={session.id}
                    className={`hover:bg-amber-50/20 transition ${
                      isCurrentSession ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Admin name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {session.adminName}
                        {isCurrentSession && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 font-black text-[9px] border border-amber-300">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{session.adminEmail}</div>
                    </td>

                    {/* Device */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {getDeviceIcon(session.device)}
                        <span className="font-medium text-[11px] truncate max-w-[180px]">
                          {session.device}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{session.userAgent}</div>
                    </td>

                    {/* IP */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {session.ipAddress}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-slate-700 text-xs font-medium">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        {session.location}
                      </div>
                    </td>

                    {/* Login Time */}
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{session.loginTime}</td>

                    {/* Last Active */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {session.lastActive}
                      </span>
                    </td>

                    {/* Revoke */}
                    <td className="py-2.5 px-3 text-right">
                      {isCurrentSession ? (
                        <span className="text-[10px] font-bold text-slate-400">Current</span>
                      ) : (
                        <button
                          onClick={() => {
                            revokeAdminSession(session.id);
                            showToast(`Revoked session for ${session.adminName}`, 'info');
                          }}
                          className="px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
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
