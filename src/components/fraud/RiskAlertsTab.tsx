import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  RiskAlertRecord,
  RiskLevel,
  RiskCategory,
  RiskStatus,
  RiskResolutionAction
} from '../../types';
import { formatPKR } from '../../utils/i18n';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  Clock,
  User,
  Car,
  MapPin,
  Eye,
  Plus,
  Send,
  MessageSquare,
  Shield,
  DollarSign,
  Activity,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

interface RiskAlertsTabProps {
  initialCategory?: string;
}

export const RiskAlertsTab: React.FC<RiskAlertsTabProps> = ({ initialCategory }) => {
  const {
    riskAlerts,
    currentAdmin,
    updateRiskAlert,
    assignRiskAlert,
    updateRiskAlertStatus,
    addRiskAlertEvidence,
    requestRiskEvidence,
    addRiskAdminNote,
    linkRiskAlertToCase,
    addToRiskWatchlist,
    openUniversalDetail,
    hasSensitivePermission,
    showToast
  } = useAdmin();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'critical' | 'open' | 'high_loss'>('all');

  // Active Alert in Investigation Modal
  const [selectedAlert, setSelectedAlert] = useState<RiskAlertRecord | null>(null);

  // Modal sub-actions state
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState<'gps_trace' | 'device_telemetry' | 'sensor_log' | 'screenshot' | 'financial_statement'>('gps_trace');
  const [resolutionAction, setResolutionAction] = useState<RiskResolutionAction>('warning_issued');
  const [resolutionReason, setResolutionReason] = useState('');

  const categoryLabels: Record<string, string> = {
    gps_spoofing: 'GPS Spoofing & Telemetry',
    ghost_rides: 'Ghost & Phantom Rides',
    promo_abuse: 'Voucher & Referral Abuse',
    fare_manipulation: 'Fare & Toll Padding',
    cancellation_abuse: 'Surge Cancellation Spree',
    driver_passenger_collusion: 'Driver-Passenger Collusion',
    account_takeover: 'Account Takeover / SIM Swap',
    document_fraud: 'Forged Identity / Fake CNIC',
    route_tampering: 'Detour & Route Tampering',
    fake_surge_creation: 'Artificial Surge Clusters'
  };

  // Filter application
  const filteredAlerts = riskAlerts.filter((alert) => {
    // Search text
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = alert.id.toLowerCase().includes(q);
      const matchTitle = alert.title.toLowerCase().includes(q);
      const matchEntity = alert.entityName.toLowerCase().includes(q);
      const matchCity = alert.city?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchEntity && !matchCity) return false;
    }

    // Quick filter
    if (quickFilter === 'critical' && alert.riskLevel !== 'critical') return false;
    if (quickFilter === 'open' && alert.status !== 'open' && alert.status !== 'under_investigation') return false;
    if (quickFilter === 'high_loss' && (!alert.financialImpactPkr || alert.financialImpactPkr < 5000)) return false;

    // Specific dropdown filters
    if (levelFilter !== 'all' && alert.riskLevel !== levelFilter) return false;
    if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (cityFilter !== 'all' && alert.city !== cityFilter) return false;

    return true;
  });

  const handleOpenAlert = (alert: RiskAlertRecord) => {
    setSelectedAlert(alert);
    setInvestigatorNote('');
    setResolutionReason('');
  };

  const handleAddNote = () => {
    if (!selectedAlert || !investigatorNote.trim()) return;
    addRiskAdminNote(selectedAlert.id, investigatorNote.trim());
    setInvestigatorNote('');
    // refresh local pointer
    const updated = riskAlerts.find((a) => a.id === selectedAlert.id);
    if (updated) setSelectedAlert(updated);
  };

  const handleAssign = () => {
    if (!selectedAlert || !assigneeName.trim()) return;
    assignRiskAlert(selectedAlert.id, assigneeName.trim(), 'fraud_ops', 'Reassigned via Investigation Console');
    setAssigneeName('');
    const updated = riskAlerts.find((a) => a.id === selectedAlert.id);
    if (updated) setSelectedAlert(updated);
  };

  const handleAttachEvidence = () => {
    if (!selectedAlert || !evidenceTitle.trim()) return;
    addRiskAlertEvidence(selectedAlert.id, {
      title: evidenceTitle.trim(),
      type: evidenceType,
      url: evidenceUrl.trim() || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
      uploadedBy: currentAdmin?.name || 'Risk Officer',
      fileSize: '650 KB'
    });
    setEvidenceTitle('');
    setEvidenceUrl('');
    const updated = riskAlerts.find((a) => a.id === selectedAlert.id);
    if (updated) setSelectedAlert(updated);
  };

  const handleAddEntityToWatchlist = () => {
    if (!selectedAlert) return;
    addToRiskWatchlist({
      entityType: selectedAlert.entityType,
      entityId: selectedAlert.entityId,
      entityName: selectedAlert.entityName,
      entityPhone: selectedAlert.entityPhone,
      city: selectedAlert.city,
      riskLevel: selectedAlert.riskLevel,
      reason: `Flagged in ${selectedAlert.title} (${selectedAlert.id})`,
      addedBy: currentAdmin?.name || 'Risk Officer',
      status: 'active',
      autoActions: ['require_otp', 'restrict_payout']
    });
  };

  const handleEscalateCase = () => {
    if (!selectedAlert) return;
    const caseId = linkRiskAlertToCase(selectedAlert.id);
    if (caseId) {
      const updated = riskAlerts.find((a) => a.id === selectedAlert.id);
      if (updated) setSelectedAlert(updated);
    }
  };

  const handleStatusChange = (newStatus: RiskStatus) => {
    if (!selectedAlert) return;
    const reason = resolutionReason.trim() || `Marked as ${newStatus} by investigator ${currentAdmin?.name || 'Admin'}`;
    updateRiskAlertStatus(selectedAlert.id, newStatus, reason, resolutionAction);
    const updated = riskAlerts.find((a) => a.id === selectedAlert.id);
    if (updated) setSelectedAlert(updated);
  };

  return (
    <div id="risk-alerts-container" className="space-y-5 text-[#111827]">
      {/* 1. Header Filter & Quick Action Strip */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Risk Incidents & Anomaly Investigation Queue
            </h3>
            <p className="text-xs text-slate-500">
              Live feed of telemetric, financial, and behavioral alerts flagged across the Pakistan fleet
            </p>
          </div>

          {/* Quick Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 flex-wrap">
            <button
              id="filter-all"
              type="button"
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                quickFilter === 'all'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All Alerts ({riskAlerts.length})
            </button>
            <button
              id="filter-critical"
              type="button"
              onClick={() => setQuickFilter('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                quickFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Critical
            </button>
            <button
              id="filter-open"
              type="button"
              onClick={() => setQuickFilter('open')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                quickFilter === 'open'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Open / Investigating
            </button>
            <button
              id="filter-high-loss"
              type="button"
              onClick={() => setQuickFilter('high_loss')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                quickFilter === 'high_loss'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              Impact &gt; 5k PKR
            </button>
          </div>
        </div>

        {/* Search and Granular Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-risk-alerts"
              type="text"
              placeholder="Search alert ID, captain, rider, or anomaly description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div>
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Threat Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Lifecycle Statuses</option>
              <option value="open">Open (Unassigned)</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="action_taken">Action Taken</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <select
              id="filter-city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Hubs (National)</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Faisalabad">Faisalabad</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Incidents Table / Cards List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Risk Incidents Match Current Filters</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Autonomous Sentinel reports clear airspace for this search criteria. Adjust filters or run a live scan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Severity & Score</th>
                  <th className="py-3 px-4">Alert ID & Anomaly</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Financial Impact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.map((alert) => {
                  const isCritical = alert.riskLevel === 'critical';
                  const isHigh = alert.riskLevel === 'high';
                  return (
                    <tr
                      key={alert.id}
                      onClick={() => handleOpenAlert(alert)}
                      className="hover:bg-amber-50/20 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : isHigh
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {alert.riskLevel}
                          </span>
                          <span className="font-mono font-black text-slate-700 text-xs">
                            {alert.riskScore}/100
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="font-mono text-[10px] font-bold text-slate-400">
                            {alert.id}
                          </div>
                          <div className="font-bold text-slate-900 group-hover:text-amber-700 transition line-clamp-1">
                            {alert.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {alert.timestamp}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              alert.entityType === 'driver'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {alert.entityType === 'driver' ? (
                              <Car className="w-3.5 h-3.5" />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {alert.entityName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {alert.entityId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {categoryLabels[alert.category] || alert.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {alert.city}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {alert.financialImpactPkr ? (
                          <span className="font-mono font-black text-rose-700">
                            {formatPKR(alert.financialImpactPkr)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            alert.status === 'open'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : alert.status === 'under_investigation'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : alert.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {alert.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAlert(alert);
                          }}
                          className="px-3 py-1.5 bg-slate-100 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Examine
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Deep Investigation Drawer / Modal */}
      {selectedAlert && (
        <div
          id="investigation-modal-backdrop"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div
            id="investigation-modal-container"
            className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                    selectedAlert.riskLevel === 'critical'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {selectedAlert.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedAlert.riskLevel} Severity
                    </span>
                    {selectedAlert.relatedCaseId && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        Case: {selectedAlert.relatedCaseId}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedAlert.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two-Column Forensic Breakdown */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Top Details Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Entity Involved</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    {selectedAlert.entityName}
                    <button
                      type="button"
                      onClick={() => openUniversalDetail(selectedAlert.entityType, selectedAlert.entityId)}
                      title="Open Profile"
                      className="text-amber-600 hover:text-amber-700 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {selectedAlert.entityType.toUpperCase()} • {selectedAlert.entityId}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Location & Time</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedAlert.city}</div>
                  <div className="text-[10px] text-slate-500">{selectedAlert.timestamp}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Capital Exposure</span>
                  <div className="font-black text-rose-700 font-mono text-sm mt-0.5">
                    {selectedAlert.financialImpactPkr ? formatPKR(selectedAlert.financialImpactPkr) : 'PKR 0'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Confidence: {Math.round((selectedAlert.confidenceScore || 0.85) * 100)}%
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Lifecycle Status</span>
                  <div className="mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                      {selectedAlert.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Assigned: {selectedAlert.assignedAdmin || 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Diagnosis & Automated Sentinel Reasoning */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Autonomous Diagnostic Findings
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedAlert.description}
                  </p>
                  {selectedAlert.aiExplanation && (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-slate-700 space-y-1">
                      <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        Neural Anomaly Explanation
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {selectedAlert.aiExplanation}
                      </p>
                    </div>
                  )}

                  {selectedAlert.suspiciousFactors && selectedAlert.suspiciousFactors.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">
                        Corroborating Telemetry Vectors:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[11px]">
                        {selectedAlert.suspiciousFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence & Telemetry Files */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Forensic Evidence & Artifacts ({selectedAlert.evidence?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Specify verification proof requested from user:');
                      if (reason) requestRiskEvidence(selectedAlert.id, reason);
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    + Request Proof from Entity
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAlert.evidence?.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{ev.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {ev.type} • {ev.fileSize || '300 KB'}
                          </div>
                        </div>
                      </div>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-lg transition"
                      >
                        Inspect
                      </a>
                    </div>
                  ))}
                </div>

                {/* Quick Add Evidence Input */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Attach artifact title (e.g., GPS Trace CSV)..."
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400"
                  />
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="gps_trace">GPS Trace</option>
                    <option value="sensor_log">Sensor Log</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="device_telemetry">Device Fingerprint</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAttachEvidence}
                    disabled={!evidenceTitle.trim()}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    Attach Evidence
                  </button>
                </div>
              </div>

              {/* Timeline & Confidential Investigator Notes */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Investigation Audit Trail & Activity
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  {selectedAlert.timeline?.map((item) => (
                    <div key={item.id} className="text-xs border-l-2 border-amber-400 pl-3 py-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.action}</span>
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">{item.note}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">By: {item.actor}</div>
                    </div>
                  ))}
                </div>

                {/* Add Investigator Note */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter confidential investigator finding or observation..."
                    value={investigatorNote}
                    onChange={(e) => setInvestigatorNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!investigatorNote.trim()}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    Record Note
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer: Action Lifecycle Bar */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Escalate to Central Case Management */}
                <button
                  type="button"
                  onClick={handleEscalateCase}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {selectedAlert.relatedCaseId ? 'Linked to Case' : 'Escalate to Support Case'}
                </button>

                {/* 2. Add to Watchlist */}
                <button
                  type="button"
                  onClick={handleAddEntityToWatchlist}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Add to Watchlist
                </button>

                {/* 3. Open Universal Detail (Driver or Passenger) */}
                <button
                  type="button"
                  onClick={() => openUniversalDetail(selectedAlert.entityType, selectedAlert.entityId)}
                  className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Full Profile
                </button>
              </div>

              {/* Resolution Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange('false_positive')}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  False Positive
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('resolved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
