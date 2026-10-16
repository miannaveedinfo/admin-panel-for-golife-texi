import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { OperationsAlert, OperationsAlertPriority, OperationsAlertStatus, OperationsAlertType } from '../../types';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Ban,
  CreditCard,
  MessageSquare,
  Activity,
  CheckCircle,
  UserCheck,
  ChevronDown,
  X,
  Send,
  FileText,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';

interface LiveAlertsCenterProps {
  selectedCity?: string;
  onSelectRide?: (rideId: string) => void;
}

export const LiveAlertsCenter: React.FC<LiveAlertsCenterProps> = ({ selectedCity = 'All', onSelectRide }) => {
  const {
    operationsAlerts,
    adminUsers,
    resolveOperationsAlert,
    escalateOperationsAlert,
    assignOperationsAlert,
    addOperationsAlertNote
  } = useAdmin();

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Alert for Details / Action Drawer
  const [selectedAlert, setSelectedAlert] = useState<OperationsAlert | null>(null);

  // Modals inside component
  const [resolveModalAlert, setResolveModalAlert] = useState<OperationsAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [escalateModalAlert, setEscalateModalAlert] = useState<OperationsAlert | null>(null);
  const [escalationReason, setEscalationReason] = useState('');

  const [newNoteText, setNewNoteText] = useState('');

  // Filter alerts
  const filteredAlerts = (operationsAlerts || []).filter((alert) => {
    // City
    const normSelectedCity = (selectedCity || 'All').toLowerCase();
    const alertCity = (alert.city || '').toLowerCase();
    if (normSelectedCity !== 'all' && alertCity !== normSelectedCity) {
      return false;
    }
    // Priority
    if (priorityFilter !== 'all' && alert.priority !== priorityFilter) {
      return false;
    }
    // Status
    if (statusFilter !== 'all' && alert.status !== statusFilter) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = alert.code.toLowerCase().includes(q);
      const matchTitle = alert.title.toLowerCase().includes(q);
      const matchDesc = alert.description.toLowerCase().includes(q);
      const matchAdmin = (alert.assignedAdmin || '').toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDesc && !matchAdmin) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: OperationsAlertPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
            MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: OperationsAlertStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Open
          </span>
        );
      case 'investigating':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Investigating
          </span>
        );
      case 'escalated':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 font-mono">
            ESCALATED
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
    }
  };

  const getTypeIcon = (type: OperationsAlertType) => {
    switch (type) {
      case 'emergency_request':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'safety_report':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'long_waiting_time':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'driver_offline_on_ride':
        return <Ban className="w-4 h-4 text-amber-600" />;
      case 'payment_failure':
        return <CreditCard className="w-4 h-4 text-orange-500" />;
      case 'ride_dispute':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      case 'repeated_cancellation':
        return <Ban className="w-4 h-4 text-slate-500" />;
      case 'suspicious_activity':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleConfirmResolve = () => {
    if (!resolveModalAlert) return;
    resolveOperationsAlert(resolveModalAlert.id, resolutionNotes || 'Investigated and resolved by Operations Officer');
    setResolveModalAlert(null);
    setResolutionNotes('');
    if (selectedAlert?.id === resolveModalAlert.id) {
      setSelectedAlert(null);
    }
  };

  const handleConfirmEscalate = () => {
    if (!escalateModalAlert) return;
    escalateOperationsAlert(escalateModalAlert.id, escalationReason || 'Escalated to Emergency Command Unit');
    setEscalateModalAlert(null);
    setEscalationReason('');
  };

  const handleAddNoteToAlert = () => {
    if (!selectedAlert || !newNoteText.trim()) return;
    addOperationsAlertNote(selectedAlert.id, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Live Operations Incident Radar ({filteredAlerts.length} Active Alerts)</span>
          </h2>
          <p className="text-xs text-[#6B7280]">
            Emergency panic beacons, long wait delays, route deviations, and payment escalations
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Only</option>
            <option value="investigating">Investigating</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alert / admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Alerts List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.priority === 'critical';
          const isResolved = alert.status === 'resolved';

          return (
            <div
              key={alert.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition relative ${
                isCritical && !isResolved
                  ? 'border-rose-300 bg-rose-50/30'
                  : 'border-[#E5E7EB] hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {getTypeIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#111827]">{alert.code}</span>
                      {getPriorityBadge(alert.priority)}
                      {getStatusBadge(alert.status)}
                    </div>
                    <div className="text-xs font-bold text-[#111827] mt-1">{alert.title}</div>
                    <div className="text-[11px] text-[#6B7280]">{alert.titleUrdu}</div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#6B7280]">
                  <div>{alert.city}</div>
                  <div>{alert.createdAt}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#4B5563] leading-relaxed bg-slate-50 p-2 rounded-xl border border-[#E5E7EB]">
                {alert.description}
              </p>

              {/* Associated Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280]">
                <div>
                  Assigned:{' '}
                  <strong className="text-[#111827]">
                    {alert.assignedAdmin || 'Unassigned (Broadcasted)'}
                  </strong>
                </div>
                {alert.rideId && onSelectRide && (
                  <button
                    onClick={() => onSelectRide(alert.rideId!)}
                    className="text-[#0F766E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Ride #{alert.rideCode} <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Assign Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#6B7280]">Assign:</span>
                  <select
                    value={alert.assignedAdmin || ''}
                    onChange={(e) => assignOperationsAlert(alert.id, e.target.value)}
                    className="px-2 py-1 text-[11px] rounded-lg bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="">Choose Admin</option>
                    {adminUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Notes ({alert.notes.length})</span>
                  </button>

                  {!isResolved && (
                    <>
                      <button
                        onClick={() => setEscalateModalAlert(alert)}
                        className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] cursor-pointer"
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => setResolveModalAlert(alert)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-[#111827]">No active operations alerts for this filter</div>
            <p className="text-xs text-[#6B7280]">All incident tickets have been addressed or resolved.</p>
          </div>
        )}
      </div>

      {/* Slide-out / Modal for Detailed Notes */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  <span>Case Timeline & Notes: {selectedAlert.code}</span>
                </h3>
                <p className="text-xs text-[#6B7280]">{selectedAlert.title}</p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing notes */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {selectedAlert.notes.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                    <strong className="text-[#111827]">{n.author}</strong>
                    <span>{n.timestamp}</span>
                  </div>
                  <div className="text-[#111827]">{n.text}</div>
                </div>
              ))}
            </div>

            {/* Add note */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Append case notes or call summary..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0F766E] text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={handleAddNoteToAlert}
                  disabled={!newNoteText.trim()}
                  className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#0d645e] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Post Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Resolve Alert #{resolveModalAlert.code}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Confirm resolution of {resolveModalAlert.title}. Provide resolution commentary for record integrity.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#111827]">Resolution Summary:</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Passenger verified safe via phone, driver resumed trip after clearing vehicle obstruction..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                onClick={() => setResolveModalAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {escalateModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Escalate Alert #{escalateModalAlert.code}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Escalating marks this as Critical priority, notifies Emergency Response Leads, and triggers high-alert protocols.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#111827]">Escalation Reason:</label>
              <textarea
                rows={3}
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Detail why standard resolution was insufficient (e.g. Police 15 coordination required)..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
              <button
                onClick={() => setEscalateModalAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEscalate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs cursor-pointer"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
