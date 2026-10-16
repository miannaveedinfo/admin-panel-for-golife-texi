import React, { useState } from 'react';
import { Driver } from '../types';
import { useAdmin } from '../context/AdminContext';
import {
  PREDEFINED_SUSPENSION_REASONS,
  PREDEFINED_SUSPENSION_REASONS_MAP,
  SUSPENSION_DURATIONS
} from '../services/driverComplianceService';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  Clock,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Radio,
  UserCheck,
  Send,
  AlertOctagon,
  Sparkles,
  Info,
  Sliders,
  History,
  Activity,
  Check,
  Eye,
  Plus,
  ArrowRight,
  Receipt,
  RotateCw
} from 'lucide-react';
import { formatPKR } from '../utils/i18n';
import { DriverFine, DeductionMethod } from '../types';

interface DriverControlModalProps {
  driver: Driver;
  initialTab?: 'actions' | 'automation' | 'history' | 'suspension' | 'warning' | 'reinstatement' | 'verification' | 'eligibility' | 'fines';
  onClose: () => void;
}

export const DriverControlModal: React.FC<DriverControlModalProps> = ({
  driver,
  initialTab = 'actions',
  onClose
}) => {
  const {
    suspendDriver,
    reinstateDriver,
    issueDriverWarning,
    updateDriverDocumentStatus,
    driverSuspensions = [],
    driverWarnings = [],
    driverFines = [],
    addDriverFine,
    waiveDriverFine,
    disputeDriverFine,
    auditLogs = [],
    showToast
  } = useAdmin();

  const isCurrentlySuspended = driver.accountStatus === 'suspended' || driver.status === 'suspended';

  // Determine main modal mode
  const initialMainMode = initialTab === 'automation'
    ? 'automation'
    : initialTab === 'history'
    ? 'history'
    : 'actions';

  const [mainMode, setMainMode] = useState<'actions' | 'automation' | 'history'>(initialMainMode);

  // Sub-action for Actions tab
  const getInitialAction = () => {
    if (initialTab === 'fines') return 'fines';
    if (initialTab === 'warning') return 'warning';
    if (initialTab === 'reinstatement') return 'reinstate';
    if (initialTab === 'verification') return 'verification';
    if (initialTab === 'eligibility') return 'eligibility';
    return isCurrentlySuspended ? 'reinstate' : 'suspend';
  };

  const [selectedAction, setSelectedAction] = useState<'suspend' | 'warning' | 'reinstate' | 'eligibility' | 'verification' | 'fines'>(getInitialAction());

  // -------------------------------------------------------------
  // FINES & PENALTIES STATE FOR THIS DRIVER
  // -------------------------------------------------------------
  const [showAddFineInline, setShowAddFineInline] = useState(false);
  const [selectedFineForReview, setSelectedFineForReview] = useState<DriverFine | null>(null);
  const [fineReason, setFineReason] = useState('Excessive Unjustified Cancellation');
  const [fineAmount, setFineAmount] = useState(500);
  const [fineNotes, setFineNotes] = useState('Manual penalty issued via Driver Control.');
  const [fineRelatedRide, setFineRelatedRide] = useState('');
  const [fineDeductionMethod, setFineDeductionMethod] = useState<DeductionMethod>('Immediate Wallet');

  // -------------------------------------------------------------
  // SUSPENSION FORM STATE
  // -------------------------------------------------------------
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_SUSPENSION_REASONS[0]);
  const [suspensionNotes, setSuspensionNotes] = useState<string>(
    PREDEFINED_SUSPENSION_REASONS_MAP[PREDEFINED_SUSPENSION_REASONS[0]] || ''
  );
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(12); // Standard 12 hours

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
    const autoNote = PREDEFINED_SUSPENSION_REASONS_MAP[reason] || `Driver suspended for ${reason}.`;
    setSuspensionNotes(autoNote);
  };

  const handleConfirmSuspension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      showToast('Please select a valid suspension reason.', 'error');
      return;
    }

    suspendDriver(
      driver.id,
      selectedReason,
      selectedDurationHours,
      suspensionNotes || PREDEFINED_SUSPENSION_REASONS_MAP[selectedReason],
      'manual'
    );
    showToast(`Driver ${driver.name} suspended for ${selectedDurationHours} hours.`, 'warning');
    onClose();
  };

  // -------------------------------------------------------------
  // WARNING FORM STATE
  // -------------------------------------------------------------
  const [warningReason, setWarningReason] = useState<string>('Late pickup delay exceeding acceptable threshold');
  const [warningNotes, setWarningNotes] = useState<string>('Administrative caution notice: Maintain on-time passenger pickup standards.');

  const handleConfirmWarning = (e: React.FormEvent) => {
    e.preventDefault();
    issueDriverWarning(driver.id, warningReason, warningNotes);
    showToast(`Warning notice issued to ${driver.name}.`, 'warning');
    onClose();
  };

  // -------------------------------------------------------------
  // REINSTATEMENT FORM STATE
  // -------------------------------------------------------------
  const [reinstateReason, setReinstateReason] = useState<string>('Administrative review completed & suspension lifted');

  const handleConfirmReinstatement = () => {
    reinstateDriver(driver.id, reinstateReason);
    showToast(`Driver ${driver.name} has been reinstated to active dispatch.`, 'success');
    onClose();
  };

  // -------------------------------------------------------------
  // RIDE ELIGIBILITY STATE
  // -------------------------------------------------------------
  const isEligible = (driver as any).rideEligibility !== 'disabled';
  const handleToggleEligibility = () => {
    showToast(`Ride eligibility ${isEligible ? 'temporarily paused' : 'restored'} for ${driver.name}.`, 'info');
    onClose();
  };

  // -------------------------------------------------------------
  // AUTOMATION RULES FOR THIS DRIVER
  // -------------------------------------------------------------
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'rule_late',
      name: 'Late Pickup Auto-Suspension',
      threshold: '5 incidents in 24 hours',
      duration: '12 Hours (Standard)',
      enabled: true,
      description: 'Pauses driver dispatch automatically when 5 qualified late pickups are recorded.'
    },
    {
      id: 'rule_rating',
      name: 'Low Rating Warning Threshold',
      threshold: 'Rating drops below 4.2',
      duration: 'Formal Caution Notice',
      enabled: true,
      description: 'Triggers official performance review warning when driver rating dips.'
    },
    {
      id: 'rule_sos',
      name: 'Safety Emergency SOS Lock',
      threshold: '1 verified passenger SOS trigger',
      duration: 'Immediate Lockout / 24h Review',
      enabled: true,
      description: 'Locks dispatch instantly during active passenger route safety investigations.'
    },
    {
      id: 'rule_docs',
      name: 'Document Expiry Dispatch Pause',
      threshold: 'License or Fitness expired',
      duration: 'Until Re-verified',
      enabled: true,
      description: 'Prevents matching when driving license or CNIC passes expiry date.'
    },
    {
      id: 'rule_cancel',
      name: 'Excessive Cancellations Warning',
      threshold: 'Cancellation rate > 20%',
      duration: 'Warning + Review',
      enabled: true,
      description: 'Flags driver when repeated driver-initiated post-acceptance cancellations occur.'
    }
  ]);

  const handleToggleRule = (id: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.enabled;
          showToast(`Rule "${r.name}" ${nextState ? 'enabled' : 'disabled'}.`, 'info');
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  // -------------------------------------------------------------
  // HISTORY ITEMS (COMBINES WARNINGS, SUSPENSIONS, AUDITS)
  // -------------------------------------------------------------
  const relevantSuspensions = driverSuspensions.filter((s) => s.driverId === driver.id);
  const relevantWarnings = driverWarnings.filter((w) => w.driverId === driver.id);
  const relevantAudits = auditLogs.filter(
    (a) => a.targetId === driver.id || a.details.toLowerCase().includes(driver.name.toLowerCase())
  );

  const historyList = [
    ...relevantSuspensions.map((s) => ({
      id: `s_${s.id}`,
      type: 'Suspension',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      title: `${s.type === 'automatic' ? 'Automatic' : 'Manual'} Suspension (${s.durationHours}h)`,
      reason: s.reason,
      notes: s.notes,
      actor: s.type === 'automatic' ? 'Automation Engine' : 'Admin Compliance',
      date: s.startTime || '14 Sep 2026'
    })),
    ...relevantWarnings.map((w) => ({
      id: `w_${w.id}`,
      type: 'Warning',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      title: 'Official Compliance Warning',
      reason: w.reason,
      notes: w.notes,
      actor: w.issuedBy || 'Admin Desk',
      date: w.date || '13 Sep 2026'
    })),
    ...relevantAudits.map((a) => ({
      id: `a_${a.id}`,
      type: 'Audit',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      title: a.action,
      reason: a.details,
      notes: undefined,
      actor: a.adminName || 'Admin',
      date: a.timestamp?.split('T')[0] || '12 Sep 2026'
    }))
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        
        {/* ============================================================
            MODAL TOP HEADER (GOLIFE YELLOW / GOLD BRAND)
           ============================================================ */}
        <div className="p-4 sm:p-5 border-b border-amber-200/80 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-slate-950">
                  Driver Control
                </h2>
                <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded-md bg-slate-950/15 text-slate-950 border border-slate-950/20">
                  {driver.id}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900/90 mt-0.5">
                {driver.name} • <span className="font-mono">{driver.vehicle.plate}</span> • {driver.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-900 hover:bg-slate-950/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================
            SECTION 7: STATUS BAR (5 DRIVER STATUS PILLS)
           ============================================================ */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-1">
            Status:
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* 1. Active */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                !isCurrentlySuspended && driver.accountStatus !== 'blocked'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${!isCurrentlySuspended ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>Active</span>
            </span>

            {/* 2. Online */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                driver.status === 'online'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${driver.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>Online</span>
            </span>

            {/* 3. On Ride */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                driver.status === 'on_trip'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300 font-black'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${driver.status === 'on_trip' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>On Ride</span>
            </span>

            {/* 4. Warning */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                relevantWarnings.length > 0 || driver.accountStatus === 'warning'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${relevantWarnings.length > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
              <span>Warning ({relevantWarnings.length})</span>
            </span>

            {/* 5. Suspended */}
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isCurrentlySuspended
                  ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black animate-pulse'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCurrentlySuspended ? 'bg-rose-600' : 'bg-slate-300'}`} />
              <span>Suspended</span>
            </span>
          </div>
        </div>

        {/* ============================================================
            MAIN MODAL NAVIGATION TABS: ACTIONS | AUTOMATION | HISTORY
           ============================================================ */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs">
          <button
            onClick={() => setMainMode('actions')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mainMode === 'actions'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Actions</span>
          </button>

          <button
            onClick={() => setMainMode('automation')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mainMode === 'automation'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Automation ({automationRules.filter((r) => r.enabled).length})</span>
          </button>

          <button
            onClick={() => setMainMode('history')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mainMode === 'history'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({historyList.length})</span>
          </button>
        </div>

        {/* ============================================================
            TAB CONTENT 1: ACTIONS (SUSPEND, WARNING, REINSTATE, ETC.)
           ============================================================ */}
        {mainMode === 'actions' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Sub-action pills */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs shrink-0">
              {[
                { id: 'suspend', label: 'Suspend', icon: ShieldAlert },
                { id: 'warning', label: 'Warning', icon: AlertTriangle },
                { id: 'fines', label: 'Fines & Penalties', icon: AlertOctagon, count: (driverFines || []).filter((f) => f.driverId === driver.id && f.status === 'Applied').length || undefined },
                { id: 'reinstate', label: 'Reinstate', icon: RotateCcw, count: isCurrentlySuspended ? 'Active' : undefined },
                { id: 'eligibility', label: 'Ride Eligibility', icon: Radio },
                { id: 'verification', label: 'Verification', icon: UserCheck }
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => setSelectedAction(act.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      selectedAction === act.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{act.label}</span>
                    {act.count && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* ============================================================
                  SECTION 8: SUSPENSION (SMART & SIMPLE)
                 ============================================================ */}
              {selectedAction === 'suspend' && (
                <form onSubmit={handleConfirmSuspension} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Automated Dispatch Lockout:</strong> Suspended drivers are instantly blocked from receiving ride dispatches and cannot accept passenger bookings.
                    </div>
                  </div>

                  {/* 1. Reason from dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Suspension Reason
                      </label>
                      <span className="text-[10px] text-amber-700 font-semibold">18 Predefined Reasons</span>
                    </div>
                    <select
                      value={selectedReason}
                      onChange={(e) => handleReasonChange(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {PREDEFINED_SUSPENSION_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. System automatically generates note + Admin can edit */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <span>Official Suspension Note</span>
                        <span className="text-[10px] font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Auto-Generated
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoNote = PREDEFINED_SUSPENSION_REASONS_MAP[selectedReason];
                          setSuspensionNotes(autoNote);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                      >
                        Reset to Default Note
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={suspensionNotes}
                      onChange={(e) => setSuspensionNotes(e.target.value)}
                      placeholder="Administrative reason visible to driver and recorded in compliance audit..."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  {/* 3. Duration Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                      Lockout Duration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SUSPENSION_DURATIONS.map((dur) => (
                        <button
                          key={dur.hours}
                          type="button"
                          onClick={() => setSelectedDurationHours(dur.hours)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            selectedDurationHours === dur.hours
                              ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-2xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs font-bold">{dur.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Confirm Suspension</span>
                    </button>
                  </div>
                </form>
              )}

              {/* WARNING SUB-ACTION */}
              {selectedAction === 'warning' && (
                <form onSubmit={handleConfirmWarning} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Formal Notice:</strong> Issues a formal caution notice to the driver's profile without immediate dispatch suspension.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                      Warning Reason
                    </label>
                    <input
                      type="text"
                      value={warningReason}
                      onChange={(e) => setWarningReason(e.target.value)}
                      placeholder="e.g. Late pickup delay, low rating caution, minor vehicle cleanliness complaint"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                      Administrative Note & Guidance
                    </label>
                    <textarea
                      rows={3}
                      value={warningNotes}
                      onChange={(e) => setWarningNotes(e.target.value)}
                      placeholder="Provide actionable guidance for the driver..."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-500/40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Issue Warning</span>
                    </button>
                  </div>
                </form>
              )}

              {/* REINSTATEMENT SUB-ACTION */}
              {selectedAction === 'reinstate' && (
                <div className="space-y-4">
                  {isCurrentlySuspended ? (
                    <>
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-rose-900 uppercase tracking-wide">
                            Active Suspension Record
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold">
                            LOCKED
                          </span>
                        </div>
                        <div className="text-xs text-rose-950 space-y-1">
                          <div>
                            <strong>Reason:</strong> {driver.activeSuspension?.reason || 'Policy compliance suspension'}
                          </div>
                          <div>
                            <strong>Duration:</strong> {driver.activeSuspension?.durationHours || 12} Hours
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                          Reinstatement Reason / Justification
                        </label>
                        <input
                          type="text"
                          value={reinstateReason}
                          onChange={(e) => setReinstateReason(e.target.value)}
                          placeholder="e.g. Explanation accepted, suspension duration elapsed, warning acknowledged"
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmReinstatement}
                          className="px-5 py-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Confirm Reinstatement</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Driver is in Good Standing</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {driver.name} is not currently suspended. No active lockout requires lifting.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RIDE ELIGIBILITY SUB-ACTION */}
              {selectedAction === 'eligibility' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Dispatch Matching State
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isEligible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isEligible ? 'ELIGIBLE' : 'DISPATCH PAUSED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Temporarily toggle ride dispatch eligibility for vehicle maintenance, inspection, or administrative review without issuing a negative mark on compliance records.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleEligibility}
                      className={`px-5 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        isEligible
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>{isEligible ? 'Pause Ride Dispatch' : 'Restore Ride Dispatch'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VERIFICATION SUB-ACTION */}
              {selectedAction === 'verification' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        KYC Document Verification
                      </h4>
                      <p className="text-xs text-slate-500">CNIC, Driving License, and Vehicle registration audit</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        driver.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : driver.verificationStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {driver.verificationStatus}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {driver.documents && driver.documents.length > 0 ? (
                      driver.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate">{doc.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Uploaded: {doc.uploadedAt} • Status: {doc.status || (doc.verified ? 'verified' : 'pending')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateDriverDocumentStatus(driver.id, idx, 'verified', 'Approved via Driver Control')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateDriverDocumentStatus(driver.id, idx, 'rejected', 'Document blurred')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                        No pending documents for this driver.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FINES & PENALTIES SUB-ACTION */}
              {selectedAction === 'fines' && (() => {
                const driverFinesList = (driverFines || []).filter((f) => f.driverId === driver.id);
                const totalFinesCount = driverFinesList.length;
                const outstandingFines = driverFinesList.filter((f) => f.status === 'Applied' && f.deductionStatus !== 'Settled');
                const totalOutstandingAmount = outstandingFines.reduce((sum, f) => sum + (f.fineAmount - f.amountDeducted), 0);
                const disputedFines = driverFinesList.filter((f) => f.status === 'Disputed');
                const recentFines = driverFinesList.slice(0, 5);

                const handleAddFineSubmit = (e: React.FormEvent) => {
                  e.preventDefault();
                  addDriverFine({
                    driverId: driver.id,
                    driverName: driver.name,
                    driverPhone: driver.phone,
                    fineReason: fineReason,
                    fineAmount: Number(fineAmount),
                    deductionMethod: fineDeductionMethod,
                    notes: fineNotes,
                    relatedRideCode: fineRelatedRide || undefined,
                    ruleType: 'Manual Admin'
                  });
                  showToast(`Fine of ${formatPKR(Number(fineAmount))} issued to ${driver.name}.`, 'warning');
                  setShowAddFineInline(false);
                  setFineNotes('Manual penalty issued via Driver Control.');
                  setFineRelatedRide('');
                };

                return (
                  <div className="space-y-4">
                    {/* Header & Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Total Fines</div>
                        <div className="text-base font-extrabold text-slate-900 mt-0.5">{totalFinesCount}</div>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold text-rose-700">Outstanding</div>
                        <div className="text-base font-extrabold text-rose-800 mt-0.5">{formatPKR(totalOutstandingAmount)}</div>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold text-amber-700">Recent Fines</div>
                        <div className="text-base font-extrabold text-amber-900 mt-0.5">{recentFines.length}</div>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold text-purple-700">Disputed</div>
                        <div className="text-base font-extrabold text-purple-900 mt-0.5">{disputedFines.length}</div>
                      </div>
                    </div>

                    {/* Action buttons: ADD FINE, REVIEW FINE */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddFineInline(!showAddFineInline);
                          setSelectedFineForReview(null);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                          showAddFineInline
                            ? 'bg-slate-900 text-white'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-500/40'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddFineInline ? 'Close Form' : 'ADD FINE'}</span>
                      </button>

                      {driverFinesList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFineForReview(selectedFineForReview ? null : driverFinesList[0]);
                            setShowAddFineInline(false);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                            selectedFineForReview
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{selectedFineForReview ? 'Close Review' : 'REVIEW FINE'}</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Add Fine Form */}
                    {showAddFineInline && (
                      <form onSubmit={handleAddFineSubmit} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
                            Issue Administrative Penalty
                          </span>
                          <span className="text-[10px] text-amber-800 font-semibold">Wallet: {formatPKR(driver.walletBalance)}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Fine Reason</label>
                            <select
                              value={fineReason}
                              onChange={(e) => setFineReason(e.target.value)}
                              className="w-full p-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold"
                            >
                              <option value="Excessive Unjustified Cancellation">Excessive Unjustified Cancellation</option>
                              <option value="Late Passenger Pickup (>10 mins)">Late Passenger Pickup (&gt;10 mins)</option>
                              <option value="Route Deviation / Unauthorized Stop">Route Deviation / Unauthorized Stop</option>
                              <option value="Cash Overcharge Complaint">Cash Overcharge Complaint</option>
                              <option value="Rude Behavior / Code of Conduct">Rude Behavior / Code of Conduct</option>
                              <option value="Vehicle Condition / AC Non-compliance">Vehicle Condition / AC Non-compliance</option>
                              <option value="Safety Protocol Violation">Safety Protocol Violation</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Fine Amount (PKR)</label>
                            <input
                              type="number"
                              min="50"
                              step="50"
                              value={fineAmount}
                              onChange={(e) => setFineAmount(Number(e.target.value))}
                              className="w-full p-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Deduction Method</label>
                            <select
                              value={fineDeductionMethod}
                              onChange={(e) => setFineDeductionMethod(e.target.value as DeductionMethod)}
                              className="w-full p-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold"
                            >
                              <option value="Immediate Wallet">Immediate Wallet (Automatic Balance Debit)</option>
                              <option value="Next Trip Earning">Next Trip Earning (Deduct from next ride)</option>
                              <option value="Split Deduction">Split Deduction (50% now, 50% next trip)</option>
                              <option value="Cash Settlement">Cash Settlement (Counter/Franchise)</option>
                              <option value="Disputed Hold">Disputed Hold (Pending Investigation)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Related Ride (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. GL-7841"
                              value={fineRelatedRide}
                              onChange={(e) => setFineRelatedRide(e.target.value)}
                              className="w-full p-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Audit Reason Note</label>
                          <input
                            type="text"
                            value={fineNotes}
                            onChange={(e) => setFineNotes(e.target.value)}
                            className="w-full p-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddFineInline(false)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs cursor-pointer border border-amber-500/40"
                          >
                            Confirm Fine Issuance
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Review Fine View (When a fine is selected for review) */}
                    {selectedFineForReview && (
                      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div>
                            <span className="text-[10px] text-amber-400 font-mono font-bold block">{selectedFineForReview.id}</span>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <Receipt className="w-4 h-4 text-amber-400" />
                              Fine Review &amp; Transaction Details
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFineForReview(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="p-2.5 bg-slate-800/80 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Fine Reason</span>
                            <span className="font-bold text-white mt-0.5 block">{selectedFineForReview.fineReason}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Amount</span>
                            <span className="font-mono font-extrabold text-amber-400 mt-0.5 block">{formatPKR(selectedFineForReview.fineAmount)}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Status</span>
                            <span className="font-bold text-emerald-400 mt-0.5 block">{selectedFineForReview.status}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Related Ride</span>
                            <span className="font-mono font-bold text-slate-200 mt-0.5 block">{selectedFineForReview.relatedRideCode || 'N/A (Direct)'}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Deduction Method</span>
                            <span className="font-semibold text-slate-200 mt-0.5 block">{selectedFineForReview.deductionMethod}</span>
                          </div>
                          <div className="p-2.5 bg-slate-800/80 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Transaction Reference</span>
                            <span className="font-mono text-[11px] text-slate-300 mt-0.5 block truncate">{selectedFineForReview.transactionId || 'PENDING-RECON'}</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-800/80 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] text-slate-400 block">Admin / Auditor Note</span>
                          <p className="text-slate-200 font-medium">{selectedFineForReview.notes || 'No custom notes provided.'}</p>
                        </div>

                        {selectedFineForReview.history && selectedFineForReview.history.length > 0 && (
                          <div className="p-2.5 bg-slate-800/80 rounded-xl text-xs space-y-1">
                            <span className="text-[10px] text-slate-400 block">History &amp; Audit Trail</span>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {selectedFineForReview.history.map((h, hIdx) => (
                                <div key={hIdx} className="text-[11px] text-slate-300 flex items-center justify-between">
                                  <span>{h.action} - {h.note}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{(h.timestamp || '').split('T')[0] || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          {selectedFineForReview.status !== 'Waived' && (
                            <button
                              type="button"
                              onClick={() => {
                                waiveDriverFine(selectedFineForReview.id, 'Administrative waiver via Driver Control');
                                setSelectedFineForReview(null);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                            >
                              Waive Fine
                            </button>
                          )}
                          {selectedFineForReview.status === 'Applied' && (
                            <button
                              type="button"
                              onClick={() => {
                                disputeDriverFine(selectedFineForReview.id, 'Driver filed dispute via Driver Control Desk');
                                setSelectedFineForReview(null);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition cursor-pointer"
                            >
                              File Dispute
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Fines Table / List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-900">Fine History Records</span>
                        <span className="text-[11px] text-slate-500 font-mono">{driverFinesList.length} total entries</span>
                      </div>

                      {driverFinesList.length > 0 ? (
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                          {driverFinesList.map((f) => (
                            <div key={f.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-500 font-bold">{f.id}</span>
                                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                    f.status === 'Applied'
                                      ? 'bg-rose-100 text-rose-800'
                                      : f.status === 'Waived'
                                      ? 'bg-slate-100 text-slate-600 line-through'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {f.status}
                                  </span>
                                  {f.relatedRideCode && (
                                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                                      Ride: {f.relatedRideCode}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-slate-900 mt-1 truncate">{f.fineReason}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Deduction: {f.deductionMethod} • {(f.createdAt || '').split('T')[0] || 'N/A'}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono font-extrabold text-slate-900 text-sm">
                                  {formatPKR(f.fineAmount)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFineForReview(f);
                                    setShowAddFineInline(false);
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Review</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                          <div className="text-xs font-bold text-slate-800">Clean Penalty Record</div>
                          <p className="text-[11px] text-slate-500">
                            {driver.name} has no recorded fines or automatic deductions.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB CONTENT 2: AUTOMATION (ACTIVE RULES, THRESHOLDS, TOGGLE)
           ============================================================ */}
        {mainMode === 'automation' && (
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Active Fleet Rules:</strong> Automatic compliance triggers monitor live trips. Both manual and automatic actions use the same suspension record and reasons.
              </div>
            </div>

            <div className="space-y-3">
              {automationRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rule.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rule.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{rule.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-700 font-mono pt-1">
                      <span>Threshold: <strong>{rule.threshold}</strong></span>
                      <span>•</span>
                      <span>Penalty: <strong>{rule.duration}</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition text-xs shrink-0 cursor-pointer ${
                      rule.enabled
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB CONTENT 3: HISTORY (WARNINGS, SUSPENSIONS, AUDITS)
           ============================================================ */}
        {mainMode === 'history' && (
          <div className="p-5 overflow-y-auto flex-1 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Compliance & Audit History
              </h4>
              <span className="text-[11px] text-slate-500">
                {historyList.length} Total Records
              </span>
            </div>

            {historyList.length > 0 ? (
              <div className="space-y-2.5">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${item.badgeColor}`}>
                          {item.type.toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-900">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>

                    <p className="text-slate-700 font-medium">
                      <strong>Reason:</strong> {item.reason}
                    </p>

                    {item.notes && (
                      <p className="text-slate-500 text-[11px] italic bg-white p-2 rounded-lg border border-slate-200">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>Logged by: <strong>{item.actor}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Clean Record</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No previous suspensions or warnings recorded.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
