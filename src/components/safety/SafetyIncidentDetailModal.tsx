import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  SafetyIncident,
  SafetyPriority,
  SafetyEventStatus,
  SafetyResponseTimelineEvent,
  SafetyEvidenceItem
} from '../../types';
import {
  getSafetyPriorityBadge,
  getSafetyStatusBadge,
  getFreshnessBadge,
  calculateSafetySlaStatus,
  getSafetySlaBadge,
  generateAiSafetySummary
} from '../../services/safetyEmergencyService';
import { BackToDashboardButton } from '../common/BackToDashboardButton';
import {
  ShieldAlert,
  X,
  Phone,
  Radio,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Car,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ExternalLink,
  Ban,
  FileText,
  Upload,
  AlertCircle,
  Share2,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Battery,
  Wifi,
  Shield,
  PhoneCall,
  UserCheck,
  Building2
} from 'lucide-react';

interface SafetyIncidentDetailModalProps {
  incidentId: string | null;
  onClose: () => void;
}

export const SafetyIncidentDetailModal: React.FC<SafetyIncidentDetailModalProps> = ({
  incidentId,
  onClose
}) => {
  const {
    safetyIncidents,
    safetySlaConfig,
    acknowledgeSafetyIncident,
    assignSafetyIncident,
    recordSafetyContactAttempt,
    requestSafetyInfo,
    addSafetyInternalNote,
    investigateSafetyIncident,
    escalateSafetyIncident,
    resolveSafetyIncident,
    markSafetyFalseAlarm,
    closeSafetyIncident,
    addSafetyEvidence,
    linkSafetyToSupportCase,
    suspendDriver,
    openUniversalDetail,
    setOperationsInitialFilter,
    setActiveTab,
    currentAdmin,
    showToast
  } = useAdmin();

  const incident = safetyIncidents.find((s) => s.id === incidentId);

  // Audio simulated playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Modals & Action sub-states
  const [activeAction, setActiveAction] = useState<
    | null
    | 'assign'
    | 'contact'
    | 'prompt_user'
    | 'add_note'
    | 'escalate'
    | 'false_alarm'
    | 'resolve'
    | 'suspend_driver'
    | 'add_evidence'
  >(null);

  // Form States
  const [assigneeName, setAssigneeName] = useState(currentAdmin?.name || 'Farooq Khan (Ops Level 2)');
  const [assignedTeam, setAssignedTeam] = useState('Emergency Ops Command');
  const [assignNotes, setAssignNotes] = useState('Taking immediate command of this safety incident.');

  const [contactType, setContactType] = useState<'driver' | 'passenger' | 'emergency_contact' | 'local_emergency_service'>('passenger');
  const [contactChannel, setContactChannel] = useState<'phone_call' | 'in_app_voip' | 'sms' | 'push_notice'>('phone_call');
  const [contactStatus, setContactStatus] = useState<'connected' | 'unanswered' | 'busy' | 'left_message'>('connected');
  const [contactNotes, setContactNotes] = useState('Passenger stated driver was taking erratic turns. Reassured passenger that route is monitored.');

  const [promptTarget, setPromptTarget] = useState<'driver' | 'passenger'>('passenger');
  const [promptMessage, setPromptMessage] = useState('GoLife Safety Team: Please confirm if you are safe. If this was an accidental trigger, reply YES.');

  const [internalNoteText, setInternalNoteText] = useState('');

  const [escalateTo, setEscalateTo] = useState('Punjab Safe City Authority (PSCA)');
  const [escalateReason, setEscalateReason] = useState('Active SOS with no passenger voice response after 2 attempts. Initiating ground dispatch and CCTV lookup.');

  const [falseAlarmReason, setFalseAlarmReason] = useState<'accidental_tap' | 'duplicate' | 'test_alert' | 'cancelled_by_user'>('accidental_tap');
  const [falseAlarmNotes, setFalseAlarmNotes] = useState('Passenger accidentally triggered SOS button when handling phone in cradle. Confirmed safe over voice call.');

  const [resolveOutcome, setResolveOutcome] = useState('Passenger Confirmed Safe');
  const [resolveNotes, setResolveNotes] = useState('Incident verified. Passenger safely arrived at destination. Driver advised on smoother route navigation.');

  const [suspendReason, setSuspendReason] = useState('Safety protocol violation during critical incident');
  const [suspendDurationHours, setSuspendDurationHours] = useState(24);
  const [suspendNotes, setSuspendNotes] = useState('Temporary investigative suspension pending complete ride telemetry analysis.');

  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'image' | 'document' | 'ride_telemetry' | 'audio_recording'>('ride_telemetry');
  const [newEvidenceNotes, setNewEvidenceNotes] = useState('');

  // Audio timer simulation
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  if (!incident) {
    return null;
  }

  const priorityBadge = getSafetyPriorityBadge(incident.priority || 'urgent');
  const statusBadge = getSafetyStatusBadge(incident.status);
  const freshnessBadge = getFreshnessBadge(incident.location?.freshness || 'LIVE');
  const slaRaw = calculateSafetySlaStatus(incident, safetySlaConfig);
  const slaStatus = getSafetySlaBadge(slaRaw);
  const aiAssistance = generateAiSafetySummary(incident);

  const handleAcknowledge = () => {
    acknowledgeSafetyIncident(incident.id, 'Operator acknowledged active safety alert');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignSafetyIncident(incident.id, assigneeName, assignedTeam, assignNotes);
    setActiveAction(null);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordSafetyContactAttempt(incident.id, {
      contactType,
      channel: contactChannel,
      status: contactStatus,
      notes: contactNotes
    });
    setActiveAction(null);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestSafetyInfo(incident.id, promptTarget, promptMessage);
    setActiveAction(null);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    addSafetyInternalNote(incident.id, internalNoteText.trim());
    setInternalNoteText('');
    setActiveAction(null);
  };

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    escalateSafetyIncident(incident.id, escalateReason, escalateTo);
    setActiveAction(null);
  };

  const handleFalseAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markSafetyFalseAlarm(incident.id, falseAlarmReason, falseAlarmNotes);
    setActiveAction(null);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resolveSafetyIncident(incident.id, resolveNotes, resolveOutcome);
    setActiveAction(null);
  };

  const handleSuspendDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incident.driverId) {
      suspendDriver(incident.driverId, suspendReason, suspendDurationHours, suspendNotes);
      addSafetyInternalNote(
        incident.id,
        `Driver ${incident.driverName} placed under ${suspendDurationHours}h investigative suspension. Reason: ${suspendReason}`
      );
      showToast(`Driver ${incident.driverName} suspended for ${suspendDurationHours}h`, 'warning');
    }
    setActiveAction(null);
  };

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceTitle.trim()) return;
    addSafetyEvidence(incident.id, {
      title: newEvidenceTitle,
      type: newEvidenceType,
      url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80',
      uploadedBy: currentAdmin?.name || 'Safety Controller',
      notes: newEvidenceNotes
    });
    setNewEvidenceTitle('');
    setNewEvidenceNotes('');
    setActiveAction(null);
  };

  const handleOpenLiveMap = () => {
    setOperationsInitialFilter({
      tab: 'rides',
      city: incident.city,
      selectedEntityType: 'ride',
      selectedEntityId: incident.rideId
    });
    setActiveTab('live_rides');
    onClose();
  };

  const handleOpenCase = () => {
    const caseId = linkSafetyToSupportCase(incident.id);
    setActiveTab('support');
    onClose();
  };

  return (
    <div
      id="safety-incident-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BackToDashboardButton
              variant="dark"
              onClick={() => {
                onClose();
                setActiveTab('dashboard');
              }}
            />
            <div
              className={`p-2 rounded-xl flex items-center justify-center ${
                incident.priority === 'critical'
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold tracking-tight">
                  {incident.incidentCode}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadge.color}`}>
                  {priorityBadge.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${slaStatus.badgeColor}`}>
                  ⏱️ {slaStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                City: <strong className="text-slate-200">{incident.city}</strong> • Triggered at{' '}
                {incident.triggeredAt} • Associated Ride: #{incident.rideCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenLiveMap}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
              title="Track on Live Operations Fleet Radar"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Live Fleet Radar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
          {/* CRITICAL ACTIONS BAR */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Control Protocol:
              </span>
              {incident.status === 'active' && (
                <button
                  id="safety-btn-acknowledge"
                  onClick={handleAcknowledge}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledge Alert</span>
                </button>
              )}
              <button
                id="safety-btn-assign"
                onClick={() => setActiveAction('assign')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-4 h-4 text-slate-600" />
                <span>{incident.assignedAdmin ? `Assigned: ${incident.assignedAdmin}` : 'Assign Officer'}</span>
              </button>
              <button
                id="safety-btn-contact"
                onClick={() => setActiveAction('contact')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Log Contact</span>
              </button>
              <button
                id="safety-btn-prompt"
                onClick={() => setActiveAction('prompt_user')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-4 h-4" />
                <span>Safety SMS Prompt</span>
              </button>
              <button
                id="safety-btn-note"
                onClick={() => setActiveAction('add_note')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Internal Note</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="safety-btn-escalate"
                onClick={() => setActiveAction('escalate')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Escalate to Authority</span>
              </button>
              <button
                id="safety-btn-case-link"
                onClick={handleOpenCase}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span>{incident.caseId ? `View Case (${incident.caseId})` : 'Link to Support Case'}</span>
              </button>
              <button
                id="safety-btn-false-alarm"
                onClick={() => setActiveAction('false_alarm')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition"
              >
                <span>False Alarm</span>
              </button>
              {incident.status !== 'resolved' && (
                <button
                  id="safety-btn-resolve"
                  onClick={() => setActiveAction('resolve')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolve Incident</span>
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE INLINE ACTION PANELS */}
          {activeAction === 'assign' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>Assign Safety Officer & Ops Team</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-blue-500 hover:text-blue-800 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handleAssignSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-950 mb-1">Safety Controller Name</label>
                    <input
                      type="text"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-950 mb-1">Assigned Division</label>
                    <input
                      type="text"
                      value={assignedTeam}
                      onChange={(e) => setAssignedTeam(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-blue-950 mb-1">Assignment Directive / Notes</label>
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'contact' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-amber-700" />
                  <span>Log Emergency Outreach & Contact Attempt</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-amber-600 hover:text-amber-900 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">Contact Target</label>
                    <select
                      value={contactType}
                      onChange={(e: any) => setContactType(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg"
                    >
                      <option value="passenger">Passenger ({incident.reporterName})</option>
                      <option value="driver">Driver ({incident.driverName})</option>
                      <option value="emergency_contact">
                        Emergency Contact ({incident.emergencyContactName || 'Family Kin'})
                      </option>
                      <option value="local_emergency_service">Emergency Service (Rescue 1122 / Police 15)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">Communication Channel</label>
                    <select
                      value={contactChannel}
                      onChange={(e: any) => setContactChannel(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg"
                    >
                      <option value="phone_call">Direct Cellular Call</option>
                      <option value="in_app_voip">In-App Voice Channel</option>
                      <option value="sms">SMS Text Alert</option>
                      <option value="push_notice">High-Priority Push Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">Call / Outreach Outcome</label>
                    <select
                      value={contactStatus}
                      onChange={(e: any) => setContactStatus(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg"
                    >
                      <option value="connected">Connected & Conversed</option>
                      <option value="unanswered">Unanswered / Ringing</option>
                      <option value="busy">Busy Line</option>
                      <option value="left_message">Left Urgent Message / SMS</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">Call Log Summary & Transcript</label>
                  <textarea
                    rows={2}
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition"
                  >
                    Save Contact Attempt
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'prompt_user' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-purple-700" />
                  <span>Send In-App Safety SMS & Banner Prompt</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-purple-600 hover:text-purple-900 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handlePromptSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950 mb-1">Target Recipient</label>
                    <select
                      value={promptTarget}
                      onChange={(e: any) => setPromptTarget(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-purple-300 rounded-lg"
                    >
                      <option value="passenger">Passenger ({incident.reporterName})</option>
                      <option value="driver">Driver ({incident.driverName})</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-purple-950 mb-1">Prompt Message Text</label>
                    <input
                      type="text"
                      value={promptMessage}
                      onChange={(e) => setPromptMessage(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-purple-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition"
                  >
                    Send Safety Inquiry
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'add_note' && (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>Record Internal Confidential Operator Note</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-slate-500 hover:text-slate-800 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handleAddNoteSubmit} className="space-y-3">
                <textarea
                  rows={2}
                  placeholder="Record observations, telemetry verification details, or coordination notes..."
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
                  >
                    Save Internal Note
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'escalate' && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Escalate to Law Enforcement / Emergency Authority</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-rose-500 hover:text-rose-800 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handleEscalateSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-rose-950 mb-1">Escalation Recipient Agency</label>
                  <select
                    value={escalateTo}
                    onChange={(e) => setEscalateTo(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-lg font-medium"
                  >
                    <option value="Punjab Safe City Authority (PSCA)">Punjab Safe City Authority (PSCA / CCTV Operations)</option>
                    <option value="Rescue 1122 Medical Dispatch">Rescue 1122 Emergency Medical Services</option>
                    <option value="Punjab Police 15 Emergency Response">Punjab Police 15 Emergency Ground Patrol</option>
                    <option value="National Highways & Motorway Police 130">National Highways & Motorway Police (130)</option>
                    <option value="Executive Safety & Legal Oversight">GoLife Executive Safety & Legal Council</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-950 mb-1">Escalation Justification & Transmitted Coordinates</label>
                  <textarea
                    rows={2}
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
                  >
                    Confirm Authority Escalation
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'false_alarm' && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Classify as False Alarm (Preserving Full Telemetry & Audit Log)</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-amber-500 hover:text-amber-800 text-xs">
                  Cancel
                </button>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Classifying as a false alarm retains all GPS coordinates, call logs, and sensor data for compliance audits.
              </p>
              <form onSubmit={handleFalseAlarmSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">False Alarm Classification Reason</label>
                  <select
                    value={falseAlarmReason}
                    onChange={(e: any) => setFalseAlarmReason(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg"
                  >
                    <option value="accidental_tap">Accidental Button Press / Phone Misplacement</option>
                    <option value="cancelled_by_user">User Cancelled Alert via Pin Confirmation</option>
                    <option value="test_alert">System / Training Test Alert</option>
                    <option value="duplicate">Duplicate Panic Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-950 mb-1">Resolution Summary Note</label>
                  <textarea
                    rows={2}
                    value={falseAlarmNotes}
                    onChange={(e) => setFalseAlarmNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
                  >
                    Confirm False Alarm Classification
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'resolve' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Resolve Safety Incident</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-emerald-500 hover:text-emerald-800 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handleResolveSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-950 mb-1">Resolution Outcome</label>
                  <select
                    value={resolveOutcome}
                    onChange={(e) => setResolveOutcome(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-emerald-300 rounded-lg"
                  >
                    <option value="Passenger Confirmed Safe">Passenger Confirmed Safe at Destination</option>
                    <option value="Authority Handover Complete">Authority Handover Complete (Rescue/PSCA)</option>
                    <option value="Dispute Amicably Settled">Dispute Amicably Settled by Dispatcher</option>
                    <option value="Driver Replacement Dispatched">Driver Replacement Dispatched</option>
                    <option value="Standard Protocol Completion">Standard Protocol Verification Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-950 mb-1">Final Operational Summary Note</label>
                  <textarea
                    rows={2}
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-emerald-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
                  >
                    Complete Incident Resolution
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'suspend_driver' && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-700" />
                  <span>Manual Driver Investigative Suspension (Explicit Confirmation)</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-rose-500 hover:text-rose-800 text-xs">
                  Cancel
                </button>
              </div>
              <p className="text-xs text-rose-800 mb-3 font-medium">
                Mandate: Safety Center never suspends a driver silently. An explicit reason and duration must be stated and logged to the driver profile.
              </p>
              <form onSubmit={handleSuspendDriverSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-950 mb-1">Suspension Reason</label>
                    <input
                      type="text"
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-950 mb-1">Duration (Hours)</label>
                    <select
                      value={suspendDurationHours}
                      onChange={(e) => setSuspendDurationHours(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-lg"
                    >
                      <option value={12}>12 Hours (Investigative)</option>
                      <option value={24}>24 Hours (Standard)</option>
                      <option value={48}>48 Hours (Detailed Review)</option>
                      <option value={168}>7 Days (Severe Infraction)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-950 mb-1">Internal Log Notes</label>
                  <input
                    type="text"
                    value={suspendNotes}
                    onChange={(e) => setSuspendNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
                  >
                    Confirm Driver Suspension
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeAction === 'add_evidence' && (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-slate-700" />
                  <span>Attach Supporting Evidence / Telemetry Log</span>
                </h4>
                <button onClick={() => setActiveAction(null)} className="text-slate-500 hover:text-slate-800 text-xs">
                  Cancel
                </button>
              </div>
              <form onSubmit={handleAddEvidenceSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Evidence Title</label>
                    <input
                      type="text"
                      placeholder="e.g., PSCA Intersection Camera Screenshot"
                      value={newEvidenceTitle}
                      onChange={(e) => setNewEvidenceTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Artifact Type</label>
                    <select
                      value={newEvidenceType}
                      onChange={(e: any) => setNewEvidenceType(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="ride_telemetry">GPS Telemetry Stream Dump</option>
                      <option value="image">CCTV / Dashcam / Photo Still</option>
                      <option value="audio_recording">Audio Dispatch Call Recording</option>
                      <option value="document">Official Police/Medical FIR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes & Context</label>
                  <input
                    type="text"
                    placeholder="Provide context on how this evidence was obtained..."
                    value={newEvidenceNotes}
                    onChange={(e) => setNewEvidenceNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
                  >
                    Attach Artifact
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MAIN 2-COLUMN OPERATIONAL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT COLUMN: LIVE TELEMETRY & INVOLVED PARTIES (2 COLS WIDE) */}
            <div className="lg:col-span-2 space-y-5">
              {/* LIVE LOCATION & TELEMETRY RADAR CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Live Telemetry & GPS Tracking Radar
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${freshnessBadge.color}`}>
                      {freshnessBadge.label}
                    </span>
                    <button
                      onClick={handleOpenLiveMap}
                      className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Fleet Radar</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Telemetry Sensor Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Speed</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-sm font-bold text-slate-800">
                        {incident.location?.speedKmh !== undefined ? `${incident.location.speedKmh} km/h` : '0 km/h (Stationary)'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Phone Battery</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-800">
                        {incident.location?.batteryLevelPct !== undefined ? `${incident.location.batteryLevelPct}%` : '85%'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">GPS Accuracy</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-sm font-bold text-slate-800">
                        ±{incident.location?.accuracyMeters || 5} meters
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Cellular Link</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-800">
                        {incident.location?.signalStatus ? incident.location.signalStatus.toUpperCase() : '4G LTE (STRONG)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map Display & Breadcrumb Trail */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-16/9 flex flex-col justify-end p-4">
                  {/* Stylized dark map grid background */}
                  <div
                    className="absolute inset-0 opacity-40 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at center, rgba(15, 118, 110, 0.4) 0%, rgba(15, 23, 42, 0.95) 75%)'
                    }}
                  />
                  {/* Grid Lines Overlay */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                      backgroundSize: '36px 36px'
                    }}
                  />

                  {/* Vehicle Radar Pulse */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-rose-500/30 animate-ping" />
                      <div className="absolute -inset-8 rounded-full bg-rose-500/10 animate-pulse" />
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
                        <Car className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md border border-rose-500/50 shadow-md">
                      {incident.vehiclePlate}
                    </span>
                  </div>

                  {/* Overlay Location Details */}
                  <div className="relative z-10 bg-slate-900/85 backdrop-blur-xs border border-slate-700/80 rounded-lg p-3 text-white max-w-lg">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Current Reported Coordinates: {incident.location?.lat.toFixed(5)}, {incident.location?.lng.toFixed(5)}</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {incident.location?.address || 'Main Boulevard Commercial Zone, Central Corridor'}
                    </p>
                  </div>
                </div>

                {/* Historical Breadcrumb Points */}
                {incident.breadcrumbs && incident.breadcrumbs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Recent Telemetry Ping Trail:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      {incident.breadcrumbs.map((bc, idx) => (
                        <div
                          key={`bc_${bc.timestamp || idx}_${idx}`}
                          className="bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0 flex items-center gap-2"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold">{bc.timestamp}</span>
                          <span className="text-slate-400">•</span>
                          <span>{bc.speedKmh !== undefined ? `${bc.speedKmh} km/h` : 'Stationary'}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-mono text-[11px]">{bc.lat.toFixed(4)}, {bc.lng.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* INVOLVED PARTIES CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-700" />
                  <span>Involved Parties & Vehicle Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Passenger Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                        Passenger (Reporter)
                      </span>
                      {incident.passengerId && (
                        <button
                          onClick={() => openUniversalDetail('passenger', incident.passengerId!)}
                          className="text-xs text-purple-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{incident.reporterName}</div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{incident.reporterPhone}</span>
                    </div>

                    {/* Emergency Kin Info */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs">
                      <span className="text-slate-400 font-medium block text-[11px]">Next-of-Kin Emergency Contact:</span>
                      <span className="font-semibold text-slate-800">
                        {incident.emergencyContactName || 'Family Relative (Registered)'}
                      </span>
                      <div className="font-mono text-slate-600 mt-0.5">
                        {incident.emergencyContactPhone || '+92 300 1234567'}
                      </div>
                    </div>
                  </div>

                  {/* Driver Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                        Assigned Driver
                      </span>
                      {incident.driverId && (
                        <button
                          onClick={() => openUniversalDetail('driver', incident.driverId!)}
                          className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{incident.driverName}</div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{incident.driverPhone || '+92 302 4491823'}</span>
                    </div>

                    {/* Vehicle Plate & Model */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs">
                      <span className="text-slate-400 font-medium block text-[11px]">Vehicle Information:</span>
                      <span className="font-semibold text-slate-800">{incident.vehiclePlate}</span>
                      <span className="text-slate-500 block text-[11px]">
                        {incident.vehicleModel || 'White Sedan / Compact Fleet'}
                      </span>
                    </div>

                    {/* Driver Action Control */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center gap-2">
                      <button
                        onClick={() => setActiveAction('suspend_driver')}
                        className="text-[11px] text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Manual Investigative Suspension</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE & OUTREACH LOGS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    <span>Chronological Incident Timeline & Audit Trail</span>
                  </h3>
                  <button
                    onClick={() => setActiveAction('add_note')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + Add Event
                  </button>
                </div>

                <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {(incident.timeline || []).map((tl, idx) => (
                    <div key={tl.id || `tl_${tl.action}_${tl.timestamp}_${idx}`} className="flex items-start gap-3 relative pl-1">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                        •
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="font-semibold text-slate-800">{tl.action}</span>
                          <span className="text-[11px]">{tl.timestamp}</span>
                        </div>
                        <p className="text-slate-700">{tl.notes || tl.note}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">Actor: {tl.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI INTELLIGENCE, EVIDENCE & CONTACT LOGS (1 COL WIDE) */}
            <div className="space-y-5">
              {/* AI SAFETY INTELLIGENCE CARD */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-300/80 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>AI Safety Intelligence</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    Risk Score: {aiAssistance.riskScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                  {aiAssistance.summary}
                </p>

                <div className="bg-white/80 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                    Operational Recommendation:
                  </span>
                  <p className="text-slate-800 font-medium">
                    {aiAssistance.recommendedNextSteps[0] || 'Standard investigative follow-up recommended.'}
                  </p>
                </div>

                {aiAssistance.recommendedNextSteps && aiAssistance.recommendedNextSteps.length > 1 && (
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Recommended Next Steps:</span>
                    {aiAssistance.recommendedNextSteps.slice(1).map((step, i) => (
                      <div key={`step_${i}_${step.slice(0, 20)}`} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 italic bg-amber-50/60 p-2 rounded-md border border-amber-200/50">
                  Notice: AI provides advisory recommendations only. Human administrator authorization is strictly required for all suspensions, fines, or closures.
                </div>
              </div>

              {/* EMERGENCY AUDIO SIMULATION PLAYER */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>In-Cabin Audio Recording Clip</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">00:45 • AAC HD</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Simulated secure telemetry audio buffer triggered at SOS button activation.
                </p>

                <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shrink-0 shadow-xs"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    {/* Simulated Waveform Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>{Math.round((audioProgress / 100) * 45)}s</span>
                      <span>00:45</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUPPORTING EVIDENCE & ATTACHMENTS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-slate-700" />
                    <span>Attached Evidence ({incident.evidenceItems?.length || 0})</span>
                  </span>
                  <button
                    onClick={() => setActiveAction('add_evidence')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + Upload
                  </button>
                </div>

                <div className="space-y-2">
                  {(incident.evidenceItems || []).length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No external artifacts attached yet.
                    </div>
                  ) : (
                    (incident.evidenceItems || []).map((ev, idx) => (
                      <div
                        key={ev.id || `ev_${ev.title}_${idx}`}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{ev.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {ev.type.replace('_', ' ').toUpperCase()} • {ev.uploadedAt}
                          </div>
                        </div>
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* EMERGENCY OUTREACH HISTORY */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Outreach Log ({incident.emergencyContactAttempts?.length || 0})</span>
                  </span>
                  <button
                    onClick={() => setActiveAction('contact')}
                    className="text-xs text-emerald-600 hover:underline font-semibold"
                  >
                    + Log Call
                  </button>
                </div>

                <div className="space-y-2">
                  {(incident.emergencyContactAttempts || []).length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No outreach calls logged yet.
                    </div>
                  ) : (
                    (incident.emergencyContactAttempts || []).map((att, idx) => (
                      <div
                        key={`att_${att.contactType}_${att.timestamp || ''}_${idx}`}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 uppercase text-[10px]">
                            {att.contactType.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              att.status === 'connected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{att.notes}</p>
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>{att.timestamp}</span>
                          <span>By: {att.conductedBy || 'Operator'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Emergency Incident Identifier: <code className="font-mono font-bold text-slate-800">{incident.id}</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
