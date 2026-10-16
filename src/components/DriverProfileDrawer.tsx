import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Driver, Ride, Complaint, DriverDailySummary, DriverDocument } from '../types';
import { formatPKR } from '../utils/i18n';
import { DriverControlModal } from './DriverControlModal';
import { PerformanceScoreBreakdownModal } from './performance/PerformanceScoreBreakdownModal';
import { DriverPerformanceTimelineModal } from './performance/DriverPerformanceTimelineModal';
import { calculateDriverEligibility } from '../services/driverVerificationService';
import {
  calculateDriverPerformanceScore,
  evaluateDriverRisk
} from '../services/aiIntelligenceService';
import {
  X,
  User,
  Banknote,
  Car,
  FileText,
  CheckCircle2,
  Radio,
  AlertTriangle,
  TrendingUp,
  AlertOctagon,
  ShieldAlert,
  Wallet,
  CreditCard,
  History,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  RotateCcw,
  Check,
  ExternalLink,
  PlusCircle,
  Eye,
  Sparkles,
  TrendingDown,
  Navigation,
  Compass,
  Battery,
  Sliders,
  Save,
  Filter,
  ArrowRight
} from 'lucide-react';

interface DriverProfileDrawerProps {
  driver: Driver;
  onClose: () => void;
}

export type ProfileTab =
  | 'overview'
  | 'performance'
  | 'earnings'
  | 'rides'
  | 'documents'
  | 'complaints'
  | 'warnings'
  | 'control_history'
  | 'automatic_rules'
  | 'live_location';

interface EssentialRule {
  id: string;
  name: string;
  category: 'Operational' | 'Safety' | 'Reliability' | 'Compliance';
  description: string;
  enabled: boolean;
  threshold: string;
  duration: string;
  status: string;
}

export const DriverProfileDrawer: React.FC<DriverProfileDrawerProps> = ({
  driver,
  onClose
}) => {
  const {
    rides,
    complaints,
    driverDailySummaries,
    driverSuspensions,
    driverWarnings,
    latePickupIncidents,
    auditLogs,
    reinstateDriver,
    adjustDriverWallet,
    updateDriverDocumentStatus,
    showToast,
    automationSettings,
    executeAiRecommendation,
    safetyIncidents
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Unified Driver Control Modal
  const [showControlModal, setShowControlModal] = useState(false);
  const [controlModalTab, setControlModalTab] = useState<
    'suspension' | 'warning' | 'reinstatement' | 'verification' | 'eligibility' | 'status'
  >('suspension');

  // Phase 45 modals
  const [showDetailedScoreModal, setShowDetailedScoreModal] = useState(false);
  const [showPerformanceTimelineModal, setShowPerformanceTimelineModal] = useState(false);

  // Wallet adjustment modal
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('500');
  const [walletType, setWalletType] = useState<'credit' | 'debit'>('credit');
  const [walletReason, setWalletReason] = useState('Operational incentive adjustment');

  // Live Location Simulation State
  const [liveSimHeading, setLiveSimHeading] = useState(42);
  const [liveSimSpeed, setLiveSimSpeed] = useState(38);
  const [liveLastPing, setLiveLastPing] = useState('Just now (4s ago)');

  // Section 9: 5 Essential Automatic Rules
  const [autoRules, setAutoRules] = useState<EssentialRule[]>([
    {
      id: 'late_pickup',
      name: 'Late Pickup Auto-Suspension',
      category: 'Operational',
      description: 'Automatically pauses driver matching if driver exceeds late pickup tolerance within a 24h window.',
      enabled: true,
      threshold: '5 incidents in 24 hours',
      duration: '12 Hours',
      status: 'Active (Standard)'
    },
    {
      id: 'complaint_escalation',
      name: 'Complaint Escalation Lock',
      category: 'Safety',
      description: 'Locks driver dispatch immediately when multiple serious complaints are submitted by passengers.',
      enabled: true,
      threshold: '2 critical complaints',
      duration: '24 Hours / Review',
      status: 'Active (Strict)'
    },
    {
      id: 'cancellation_pattern',
      name: 'Cancellation Pattern Penalty',
      category: 'Reliability',
      description: 'Temporary cooldown when driver repeatedly cancels assigned passenger rides after acceptance.',
      enabled: true,
      threshold: '3 post-acceptance cancels',
      duration: '6 Hours',
      status: 'Active'
    },
    {
      id: 'safety_risk',
      name: 'Safety & Harassment Lockout',
      category: 'Safety',
      description: 'Immediate indefinite lockout pending human compliance review if any safety SOS incident is flagged.',
      enabled: true,
      threshold: '1 severe safety incident',
      duration: 'Indefinite (Review)',
      status: 'Active (Mandatory)'
    },
    {
      id: 'verification_issue',
      name: 'Expired Document Auto-Pause',
      category: 'Compliance',
      description: 'Disables ride eligibility automatically when CNIC, Driving License, or Route Permit expires.',
      enabled: true,
      threshold: 'Expired or rejected document',
      duration: 'Until Re-verified',
      status: 'Active'
    }
  ]);

  // Editing state for automatic rules
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleThresholdDraft, setRuleThresholdDraft] = useState('');
  const [ruleDurationDraft, setRuleDurationDraft] = useState('');

  // Filtered driver records
  const driverRides = useMemo(() => (rides || []).filter((r) => r.driverId === driver.id), [rides, driver.id]);
  const driverComplaints = useMemo(() => (complaints || []).filter((c) => c.driverId === driver.id), [complaints, driver.id]);
  const driverSummaries = useMemo(() => (driverDailySummaries || []).filter((s) => s.driverId === driver.id), [driverDailySummaries, driver.id]);
  const driverSuspensionRecords = useMemo(() => (driverSuspensions || []).filter((s) => s.driverId === driver.id), [driverSuspensions, driver.id]);
  const driverWarningRecords = useMemo(() => (driverWarnings || []).filter((w) => w.driverId === driver.id), [driverWarnings, driver.id]);
  const driverLateIncidents = useMemo(() => (latePickupIncidents || []).filter((i) => i.driverId === driver.id), [latePickupIncidents, driver.id]);
  const driverAudits = useMemo(() => (auditLogs || []).filter(
    (a) =>
      a.targetId === driver.id ||
      a.action.includes(driver.id) ||
      a.details.includes(driver.name) ||
      a.details.includes(driver.id)
  ), [auditLogs, driver.id, driver.name]);

  // Compute AI Performance Score & Risk Evaluation
  const scoreResult = useMemo(() => calculateDriverPerformanceScore(
    driver,
    rides,
    complaints,
    safetyIncidents,
    latePickupIncidents,
    automationSettings.scoreWeights
  ), [driver, rides, complaints, safetyIncidents, latePickupIncidents, automationSettings.scoreWeights]);

  const riskProfile = useMemo(() => evaluateDriverRisk(
    driver,
    scoreResult,
    complaints,
    safetyIncidents,
    latePickupIncidents,
    automationSettings
  ), [driver, scoreResult, complaints, safetyIncidents, latePickupIncidents, automationSettings]);

  const eligibility = useMemo(() => calculateDriverEligibility(driver), [driver]);

  const isSuspended = driver.accountStatus === 'suspended' || driver.status === 'suspended';

  // Section 10: Unified Control History Timeline
  const [historyFilter, setHistoryFilter] = useState<'all' | 'suspension' | 'warning' | 'status' | 'audit'>('all');

  const controlHistoryList = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      title: string;
      reason: string;
      duration?: string;
      notes?: string;
      type: 'suspension' | 'warning' | 'status' | 'audit';
      badgeColor: string;
      timestamp: string;
      actor: string;
    }> = [];

    // Suspensions
    driverSuspensionRecords.forEach((s) => {
      list.push({
        id: s.id,
        date: s.startTime?.split(' ')[0] || '14 Sep 2026',
        title: `${s.type === 'automatic' ? 'Automatic' : 'Manual'} Suspension`,
        reason: s.reason,
        duration: `${s.durationHours} Hours`,
        notes: s.notes,
        type: 'suspension',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        timestamp: s.startTime || '',
        actor: s.type === 'automatic' ? 'System Engine' : 'Admin Compliance'
      });
    });

    // Warnings
    driverWarningRecords.forEach((w) => {
      list.push({
        id: w.id,
        date: w.date?.split(' ')[0] || '13 Sep 2026',
        title: 'Official Compliance Warning',
        reason: w.reason,
        duration: 'On Permanent Record',
        notes: w.notes,
        type: 'warning',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
        timestamp: w.date || '',
        actor: w.issuedBy || 'Admin'
      });
    });

    // Status History
    (driver.statusHistory || []).forEach((sh, idx) => {
      list.push({
        id: `sh_${idx}`,
        date: sh.timestamp?.split(' ')[0] || '12 Sep 2026',
        title: `Driver Operational Status: ${sh.status.toUpperCase()}`,
        reason: sh.reason || 'Operational update',
        duration: 'State Transition',
        notes: `Operational state changed to ${sh.status}.`,
        type: 'status',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        timestamp: sh.timestamp || '',
        actor: sh.changedBy || 'Admin'
      });
    });

    // Audits
    driverAudits.forEach((a) => {
      list.push({
        id: a.id,
        date: a.timestamp?.split(' ')[0] || 'Recently',
        title: a.action.replace(/_/g, ' '),
        reason: a.details,
        duration: 'Audit Logged',
        notes: a.details,
        type: 'audit',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        timestamp: a.timestamp || '',
        actor: `${a.adminName} (${a.adminRole})`
      });
    });

    return list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }, [driverSuspensionRecords, driverWarningRecords, driver.statusHistory, driverAudits]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return controlHistoryList;
    return controlHistoryList.filter((item) => item.type === historyFilter);
  }, [controlHistoryList, historyFilter]);

  // Handle Automatic Rule Toggle
  const handleToggleRule = (ruleId: string) => {
    setAutoRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        const newEnabled = !r.enabled;
        showToast(
          `Rule "${r.name}" ${newEnabled ? 'Enabled' : 'Disabled'} for this driver fleet.`,
          newEnabled ? 'success' : 'info'
        );
        return {
          ...r,
          enabled: newEnabled,
          status: newEnabled ? 'Active (Standard)' : 'Inactive / Paused'
        };
      })
    );
  };

  // Handle Save Edited Rule
  const handleSaveRule = (ruleId: string) => {
    setAutoRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          threshold: ruleThresholdDraft.trim() || r.threshold,
          duration: ruleDurationDraft.trim() || r.duration
        };
      })
    );
    setEditingRuleId(null);
    showToast('Automatic compliance rule updated successfully', 'success');
  };

  // Handle Adjust Wallet Submit
  const handleWalletAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(walletAmount);
    if (!amountNum || amountNum <= 0) return;
    const finalAmount = walletType === 'credit' ? amountNum : -amountNum;
    adjustDriverWallet(driver.id, finalAmount, walletReason);
    setShowWalletModal(false);
  };

  // 10 Tabs Navigation List
  const tabs: { id: ProfileTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'earnings', label: 'Earnings', icon: Banknote, count: driverSummaries.length },
    { id: 'rides', label: 'Rides', icon: Car, count: driverRides.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: Object.keys(driver.documents || {}).length },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle, count: driverComplaints.length },
    { id: 'warnings', label: 'Warnings', icon: AlertOctagon, count: driverWarningRecords.length },
    { id: 'control_history', label: 'Control History', icon: History, count: controlHistoryList.length },
    { id: 'automatic_rules', label: 'Automatic Rules', icon: ShieldCheck, count: autoRules.length },
    { id: 'live_location', label: 'Live Location', icon: Radio }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-end">
      <div className="w-full max-w-5xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-900">
        
        {/* ===================================================
            TOP BAR WITH 6 KEY STATUS METRICS & PRIMARY CONTROL BUTTON
           =================================================== */}
        <div className="p-4 sm:p-5 border-b border-amber-200/70 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-xs shrink-0 border border-amber-500/30">
              {driver.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-950 tracking-tight">{driver.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 font-extrabold text-slate-900 shadow-2xs">
                  {driver.vehicle.plate}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isSuspended
                      ? 'bg-rose-600 text-white animate-pulse'
                      : driver.status === 'online'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : driver.status === 'on_trip'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isSuspended ? 'SUSPENDED' : driver.status}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {driver.vehicle.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>ID: <strong className="font-mono text-slate-700">{driver.id}</strong></span>
                <span>•</span>
                <span>Phone: {driver.phone}</span>
                <span>•</span>
                <span>City: <strong className="text-slate-800">{driver.city}</strong></span>
              </p>
            </div>
          </div>

          {/* Top Actions: ONE PRIMARY "CONTROL DRIVER" + Live Location */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={() => {
                setControlModalTab(isSuspended ? 'reinstatement' : 'suspension');
                setShowControlModal(true);
              }}
              className="px-4 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition shadow-xs flex items-center gap-1.5 cursor-pointer border border-amber-500/40"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>Driver Control</span>
            </button>

            <button
              onClick={() => setActiveTab('live_location')}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">View</span> Live Location
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section 5: Top 6 Status Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Driver Status</span>
            <span className="font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isSuspended ? 'bg-rose-500' : driver.status === 'online' ? 'bg-emerald-500 animate-pulse' : driver.status === 'on_trip' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
              {isSuspended ? 'SUSPENDED' : driver.status.toUpperCase()}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Current Ride</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5 font-mono text-[11px]">
              {driver.activeRideCode || (driver.status === 'on_trip' ? 'TRIP-IN-PROGRESS' : 'None (Idle)')}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rating</span>
            <span className="font-bold text-amber-600 flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {driver.rating > 0 ? driver.rating.toFixed(2) : 'New'}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Performance</span>
            <span className="font-black text-slate-950 mt-0.5 block font-mono">
              {scoreResult.overallScore}/100
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Risk Level</span>
            <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${
              riskProfile.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800' :
              riskProfile.riskLevel === 'High' ? 'bg-amber-100 text-amber-900' :
              riskProfile.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-900' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {riskProfile.riskLevel} Risk
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Verification</span>
            <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${
              driver.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
              driver.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
              'bg-amber-100 text-amber-900'
            }`}>
              {driver.verificationStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ===================================================
            TABS NAVIGATION (Section 5: 9 Sections + Live Location)
           =================================================== */}
        <div className="border-b border-slate-200 bg-white px-4 overflow-x-auto flex items-center gap-1 shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'border-amber-500 text-slate-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===================================================
            TAB CONTENT BODY
           =================================================== */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/60 space-y-5">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Wallet Balance</div>
                  <div className="text-xl font-extrabold text-amber-600 font-mono mt-0.5">
                    {formatPKR(driver.walletBalance || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Total Rides Completed</div>
                  <div className="text-xl font-extrabold text-slate-950 mt-0.5">
                    {driver.totalRides}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Lifetime Gross Earnings</div>
                  <div className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">
                    {formatPKR(driver.earnings || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Compliance Standing</div>
                  <div
                    className={`text-xs font-black mt-1.5 uppercase ${
                      isSuspended ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isSuspended ? 'TEMPORARILY SUSPENDED' : 'GOOD STANDING (Active)'}
                  </div>
                </div>
              </div>

              {/* Personal & Vehicle Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Personal Profile & Registration
                  </h3>
                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Full Name:</span>
                      <span className="font-semibold text-slate-900">{driver.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">CNIC:</span>
                      <span className="font-mono font-semibold text-slate-900">{driver.cnic || '35201-8891023-1'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <span className="font-mono text-slate-900">{driver.phone}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Operational City:</span>
                      <span className="font-semibold text-slate-900">{driver.city}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Service Category:</span>
                      <span className="font-bold text-amber-600">{driver.category}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Registration Date:</span>
                      <span className="text-slate-900">{driver.joinedDate || '2024-03-10'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-500" />
                    Registered Vehicle Details
                  </h3>
                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Vehicle Model:</span>
                      <span className="font-semibold text-slate-900">
                        {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.year})
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Excise Number Plate:</span>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900">
                        {driver.vehicle.plate}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Exterior Color:</span>
                      <span className="font-semibold text-slate-900">{driver.vehicle.color}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Roadworthiness & A/C:</span>
                      <span className="font-semibold text-emerald-600">Fully Operational (A/C Active)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Driving License Number:</span>
                      <span className="font-mono text-slate-900">{driver.licenseNumber || 'DL-PK-77189'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Launch Control Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-950">Administrative Driver Control Panel</div>
                    <div className="text-[11px] text-slate-600">
                      Manage suspension, warning notices, KYC document approvals, and ride dispatch eligibility.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setControlModalTab(isSuspended ? 'reinstatement' : 'suspension');
                    setShowControlModal(true);
                  }}
                  className="px-4 py-2 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer shrink-0 border border-amber-500/40"
                >
                  OPEN CONTROL PANEL
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              {/* Score & Risk Hero Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 flex flex-col items-center justify-center shrink-0 shadow-md">
                      <span className="text-3xl font-black font-mono tracking-tight">
                        {scoreResult.overallScore}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-900">/ 100</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Driver Performance Score
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-bold">
                          {scoreResult.performanceLevel}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mt-1 text-white">{driver.name}</h3>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                        <span>Trend: </span>
                        {scoreResult.trend === 'improving' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Improving
                          </span>
                        ) : scoreResult.trend === 'declining' ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> Declining
                          </span>
                        ) : (
                          <span className="text-slate-300 font-medium">Stable</span>
                        )}
                        <span>•</span>
                        <span>City: {driver.city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Risk Badge & Recommended Action */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-4 md:w-80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Risk Profile:</span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          riskProfile.riskLevel === 'Critical'
                            ? 'bg-rose-500 text-white'
                            : riskProfile.riskLevel === 'High'
                            ? 'bg-orange-500 text-white'
                            : riskProfile.riskLevel === 'Medium'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {riskProfile.riskLevel} Risk
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] text-amber-300 uppercase tracking-wider font-bold block">
                        Recommended Action:
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-xs font-bold text-white">
                          {riskProfile.recommendedAction}
                        </span>
                        <button
                          onClick={() => {
                            if (riskProfile.recommendedAction === 'Suspend Driver') {
                              setControlModalTab('suspension');
                              setShowControlModal(true);
                            } else if (riskProfile.recommendedAction === 'Issue Warning') {
                              setControlModalTab('warning');
                              setShowControlModal(true);
                            } else {
                              showToast('Driver is in good standing. No remedial action needed.', 'info');
                            }
                          }}
                          className="px-2 py-1 text-[10px] font-black rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8-Factor Breakdown & Phase 45 Deep Inspection */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Driver Score Breakdown &amp; Performance Audit</span>
                    </h4>
                    <span className="text-xs text-slate-400">Target Benchmark: 85+ • Weighted Multi-Factor Algorithm</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetailedScoreModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>10-Factor Deep Breakdown</span>
                    </button>

                    <button
                      onClick={() => setShowPerformanceTimelineModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Performance Timeline</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {Object.entries((scoreResult?.factors || (scoreResult as any)?.factorScores) || {}).map(([key, score]) => {
                    const numScore = Number(score) || 0;
                    return (
                      <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <span className="font-mono font-bold text-slate-900">{numScore}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              numScore >= 85
                                ? 'bg-emerald-500'
                                : numScore >= 65
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${numScore}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      GoLife Driver Wallet Balance
                    </h3>
                    <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                      {formatPKR(driver.walletBalance || 0)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Credit / Debit Adjustment</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-bold text-xs text-slate-900 mb-2">Daily Settlement Summaries</h4>
                  {driverSummaries.length > 0 ? (
                    <div className="space-y-2">
                      {driverSummaries.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{s.date} • {s.completedRides} Rides Completed</div>
                            <div className="text-[10px] text-slate-500">
                              Gross: {formatPKR(s.grossFares)} • Commission ({s.commissionRate}%): -{formatPKR(s.platformCommission)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-600 block">
                              Net: {formatPKR(s.netDriverEarnings)}
                            </span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {s.settlementStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      No batch settlement logs generated for this driver.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RIDES */}
          {activeTab === 'rides' && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Driver Ride History ({driverRides.length} Recorded Rides)
              </h3>
              {driverRides.length > 0 ? (
                <div className="space-y-2">
                  {driverRides.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{r.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">{formatPKR(r.fare)}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-2 text-[11px]">
                        <span>From: <strong>{r.pickupAddress}</strong></span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>To: <strong>{r.dropoffAddress}</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Passenger: {r.passengerName}</span>
                        <span>{r.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No rides recorded yet for this driver.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Dispatch Eligibility Status Card */}
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-2xs ${
                  eligibility.isEligible
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      eligibility.isEligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {eligibility.isEligible ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          eligibility.isEligible ? 'text-emerald-950' : 'text-rose-950'
                        }`}
                      >
                        {eligibility.isEligible
                          ? 'GoLife Dispatch Eligible'
                          : 'Ineligible for Dispatches (Missing/Expired KYC)'}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                          eligibility.isEligible
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {eligibility.isEligible ? 'Qualified' : 'Action Required'}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        eligibility.isEligible ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {eligibility.reasons.join(' • ')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setControlModalTab('verification');
                    setShowControlModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer shrink-0 shadow-2xs"
                >
                  Manage KYC
                </button>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Driver KYC & Identity Documents
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'National ID Card (CNIC Front & Back)', docType: 'cnic', status: driver.documents?.cnic ? 'verified' : 'pending' },
                  { name: 'Provincial Driving License', docType: 'driving_license', status: driver.documents?.license ? 'verified' : 'pending' },
                  { name: 'Vehicle Registration Book', docType: 'vehicle_registration', status: driver.documents?.vehicleRegistration ? 'verified' : 'pending' },
                  { name: 'Police Character Clearance', docType: 'police_clearance', status: 'verified' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{doc.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {doc.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="h-28 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      [Document Preview Image]
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          updateDriverDocumentStatus(driver.id, doc.docType, 'verified', 'Approved from Driver Control Profile');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                      >
                        Quick Approve
                      </button>
                      <button
                        onClick={() => {
                          updateDriverDocumentStatus(driver.id, doc.docType, 'rejected', 'Document quality insufficient or blurry');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Passenger Complaints Filed Against Driver ({driverComplaints.length})
                </h3>
                {driverComplaints.length > 0 && (
                  <button
                    onClick={() => {
                      setControlModalTab('warning');
                      setShowControlModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                  >
                    Issue Warning for Complaint
                  </button>
                )}
              </div>

              {driverComplaints.length > 0 ? (
                <div className="space-y-2">
                  {driverComplaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{c.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {c.category}
                          </span>
                        </div>
                        <span className="font-bold uppercase text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">{c.description}</div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Passenger: {c.passengerName} • Ride: {c.rideId || 'N/A'}</span>
                        <span>{c.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  Clean service record. No passenger complaints filed.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: WARNINGS */}
          {activeTab === 'warnings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Official Warning Notices ({driverWarningRecords.length})
                </h3>
                <button
                  onClick={() => {
                    setControlModalTab('warning');
                    setShowControlModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Issue Official Warning</span>
                </button>
              </div>

              {driverWarningRecords.length > 0 ? (
                <div className="space-y-2">
                  {driverWarningRecords.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <AlertOctagon className="w-4 h-4 text-amber-500" />
                          {w.reason}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{w.date}</span>
                      </div>
                      <p className="text-slate-600">{w.notes}</p>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>Issued by: {w.issuedBy}</span>
                        <span className="font-semibold text-emerald-600">Dispatched to Driver Phone</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No official warnings on record for this driver.
                </div>
              )}
            </div>
          )}

          {/* TAB 8: CONTROL HISTORY (Section 10 Requirement) */}
          {activeTab === 'control_history' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Unified Control History & Audit Trail ({filteredHistory.length} Events)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chronological actions: automatic suspensions, warnings, document approvals, and state changes.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  {(['all', 'suspension', 'warning', 'status'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setHistoryFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                        historyFilter === filter
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-2">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                            {item.title}
                          </span>
                          <span className="font-bold text-slate-900">{item.reason}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {item.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <span>{item.notes}</span>
                        <span className="font-medium text-slate-500">Actor: <strong>{item.actor}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No control events logged for this filter.
                </div>
              )}
            </div>
          )}

          {/* TAB 9: AUTOMATIC RULES (Section 9 Requirement) */}
          {activeTab === 'automatic_rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Compact Automatic Compliance Rules
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage real-time triggers for auto-suspensions, penalties, and verification locks.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {autoRules.map((rule) => {
                  const isEditing = editingRuleId === rule.id;

                  return (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-2xl bg-white border shadow-2xs transition ${
                        rule.enabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-950">{rule.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {rule.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                rule.enabled
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {rule.enabled ? 'ON' : 'OFF'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 max-w-xl">{rule.description}</p>
                        </div>

                        {/* Toggle ON/OFF Switch */}
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className={`w-12 h-6 rounded-full transition p-0.5 flex items-center cursor-pointer ${
                              rule.enabled ? 'bg-amber-400 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Rule Parameters: Threshold, Duration, Status */}
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Threshold Trigger</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={ruleThresholdDraft}
                              onChange={(e) => setRuleThresholdDraft(e.target.value)}
                              className="mt-1 w-full p-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                            />
                          ) : (
                            <span className="font-extrabold text-slate-900 mt-0.5 block">{rule.threshold}</span>
                          )}
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Penalty Duration</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={ruleDurationDraft}
                              onChange={(e) => setRuleDurationDraft(e.target.value)}
                              className="mt-1 w-full p-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                            />
                          ) : (
                            <span className="font-extrabold text-slate-900 mt-0.5 block">{rule.duration}</span>
                          )}
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Status</span>
                            <span className="font-bold text-emerald-700 mt-0.5 block">{rule.status}</span>
                          </div>

                          {isEditing ? (
                            <button
                              onClick={() => handleSaveRule(rule.id)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                setRuleThresholdDraft(rule.threshold);
                                setRuleDurationDraft(rule.duration);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 10: LIVE LOCATION (Section 11 Requirement) */}
          {activeTab === 'live_location' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-500" />
                    Live Driver Radar & Location Telemetry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time GPS coordinates, motion telemetry, heading, and live dispatch state.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLiveSimHeading((prev) => (prev + 30) % 360);
                    setLiveSimSpeed((prev) => (prev === 0 ? 42 : Math.min(prev + 5, 65)));
                    setLiveLastPing('Just now (1s ago)');
                    showToast('Pinged latest driver location beacon successfully', 'info');
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 transition cursor-pointer"
                >
                  Simulate GPS Ping
                </button>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Current City</span>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {driver.city}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Telemetry Speed</span>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1 font-mono">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                    {liveSimSpeed} km/h
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Compass Heading</span>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    {liveSimHeading}° NE
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Last GPS Beacon</span>
                  <div className="text-xs font-extrabold text-emerald-600 mt-0.5">
                    {liveLastPing}
                  </div>
                </div>
              </div>

              {/* Realistic Map Radar Canvas Mockup */}
              <div className="h-72 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between p-4 text-white">
                {/* Simulated Map Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

                {/* Radar sweep effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-amber-500/20 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-amber-500/30 pointer-events-none" />

                {/* Driver Vehicle Location Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 animate-ping absolute" />
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-lg border-2 border-slate-950 relative z-10">
                      <Car className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/80 border border-white/20 text-[10px] font-bold text-white shadow">
                    {driver.name} ({driver.vehicle.plate})
                  </div>
                </div>

                {/* Top overlay controls */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/10 backdrop-blur-xs flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    GPS Live Tracking Active
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-1 rounded-lg border border-white/10">
                    Lat: {driver.currentLocation?.lat?.toFixed(4) || '31.5204'} • Lng: {driver.currentLocation?.lng?.toFixed(4) || '74.3587'}
                  </span>
                </div>

                {/* Bottom overlay info */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 bg-slate-950/70 p-2 rounded-xl border border-white/10 backdrop-blur-xs">
                  <span>Current Street: <strong>Main Boulevard, Gulberg III, {driver.city}</strong></span>
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <Battery className="w-3.5 h-3.5" /> 88% Battery
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ===================================================
          MODALS: UNIFIED DRIVER CONTROL MODAL + WALLET MODAL
         =================================================== */}

      {/* Phase 35 Unified Driver Control Modal */}
      {showControlModal && (
        <DriverControlModal
          driver={driver}
          initialTab={controlModalTab}
          onClose={() => setShowControlModal(false)}
        />
      )}

      {/* Wallet Adjustment Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleWalletAdjustSubmit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-900"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-900">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Adjust Driver Wallet Balance (PKR)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Current Balance: <strong className="font-mono text-amber-600">{formatPKR(driver.walletBalance || 0)}</strong>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWalletType('credit')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  walletType === 'credit'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                + Credit (Bonus/Deposit)
              </button>
              <button
                type="button"
                onClick={() => setWalletType('debit')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  walletType === 'debit'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                - Debit (Deduction/Fine)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Amount (PKR)
              </label>
              <input
                type="number"
                min="1"
                required
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                className="w-full p-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Adjustment Reason (Audit trail)
              </label>
              <input
                type="text"
                required
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                placeholder="e.g. Good performance bonus or toll compensation"
                className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950"
              >
                Confirm Ledger Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PHASE 45: 10-FACTOR DETAILED SCORE BREAKDOWN MODAL */}
      {showDetailedScoreModal && (
        <PerformanceScoreBreakdownModal
          driver={driver}
          onClose={() => setShowDetailedScoreModal(false)}
        />
      )}

      {/* PHASE 45: CHRONOLOGICAL PERFORMANCE TIMELINE MODAL */}
      {showPerformanceTimelineModal && (
        <DriverPerformanceTimelineModal
          driver={driver}
          onClose={() => setShowPerformanceTimelineModal(false)}
        />
      )}
    </div>
  );
};
